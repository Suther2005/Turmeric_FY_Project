"""
Local GenAI Service for Ask Curcuma (100% Self-Hosted / Local LLM)
==================================================================
TurmeriCare-Specific Generative AI Engine.
Strictly connects to LOCAL LLM runtimes (Ollama at http://127.0.0.1:11434).
ZERO external / cloud LLM APIs. ZERO API keys. ZERO external data transmission.
"""

import os
import json
import time
import urllib.request
import urllib.error
from typing import List, Dict, Any, Tuple, Optional, Generator
from .rag_engine import (
    classify_query_intent,
    retrieve_relevant_knowledge,
    format_live_app_context,
    build_system_instruction,
    normalize_disease_name
)

OLLAMA_DEFAULT_HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434")
OLLAMA_DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

# Optimal settings for 12-core CPU host machine (6 physical cores)
OLLAMA_NUM_THREADS = int(os.environ.get("OLLAMA_NUM_THREADS", "6"))
OLLAMA_NUM_CTX = int(os.environ.get("OLLAMA_NUM_CTX", "1024"))
OLLAMA_NUM_PREDICT = int(os.environ.get("OLLAMA_NUM_PREDICT", "120"))
OLLAMA_KEEP_ALIVE = os.environ.get("OLLAMA_KEEP_ALIVE", "30m")

# Safe in-memory LRU cache for static general questions (TTL: 3600 seconds)
_STATIC_QUERY_CACHE: Dict[str, Dict[str, Any]] = {}
_CACHE_TTL_SECONDS = 3600
_MAX_CACHE_ENTRIES = 256


def _get_cache_key(query: str, language: str) -> str:
    cleaned = "".join(c.lower() for c in query if c.isalnum() or c.isspace()).strip()
    return f"{language}:{cleaned}"


def _is_cacheable(query: str, conversation_history: List[Dict[str, str]], app_context: Optional[Dict[str, Any]]) -> bool:
    """
    Ensures caching ONLY occurs for standalone, static, general agronomic/botanical queries.
    NEVER caches dynamic user session queries (active scan, current weather, risk, follow-up history).
    """
    if conversation_history and len(conversation_history) > 0:
        return False

    if app_context and app_context.get("has_analyzed_image"):
        return False

    query_lower = query.lower()
    dynamic_keywords = [
        "scan", "leaf", "result", "why did", "show this", "confidence",
        "my field", "current risk", "weather today", "today", "yesterday",
        "observe", "என் வயல்", "எனது ஸ்கேன்", "தற்போதைய"
    ]
    if any(k in query_lower for k in dynamic_keywords):
        return False

    return True


def check_local_ollama() -> Dict[str, Any]:
    """
    Inspects whether the local Ollama daemon is running and lists installed local models.
    Connects strictly to localhost (127.0.0.1).
    """
    host = OLLAMA_DEFAULT_HOST.rstrip("/")
    try:
        req = urllib.request.Request(f"{host}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                models = [m.get("name") for m in data.get("models", []) if m.get("name")]
                return {
                    "is_available": True,
                    "host": host,
                    "models": models,
                    "active_model": models[0] if models else OLLAMA_DEFAULT_MODEL,
                }
    except Exception:
        pass

    return {
        "is_available": False,
        "host": host,
        "models": [],
        "active_model": None,
    }


def determine_token_budget(query: str, has_live_context: bool = False, intent: Optional[str] = None) -> int:
    """
    Dynamically adjusts num_predict for optimal latency and complete sentences.
    - Greeting / Casual / Out of domain: 50 tokens (~1.0-1.5s)
    - Treatment / Management / Scan: 120 tokens (~3.0-4.2s)
    - Disease / Symptoms / Differences / Pest / Weather: 90 tokens (~2.5-3.2s)
    - Simple General / Botanical Overview: 70 tokens (~1.8-2.5s)
    """
    if intent in ["GREETING", "CASUAL", "OUT_OF_DOMAIN", "CLARIFICATION"]:
        return 50

    if intent in ["TREATMENT_MANAGEMENT", "SCAN_RESULT + TREATMENT_MANAGEMENT", "PROJECT_TECHNICAL", "SCAN_RESULT"]:
        return 120

    q_lower = query.lower()
    if has_live_context or any(k in q_lower for k in [
        "mahalanobis", "ood", "accuracy", "verifier", "architecture", "efficientnet", "mobilenet",
        "why did my scan", "show this", "confidence", "pesticide", "control", "treatment"
    ]):
        return 120

    if any(k in q_lower for k in [
        "leaf spot", "leaf blotch", "blotch", "aphid", "humidity", "weather", "difference",
        "identify", "symptom", "prevent", "how do i", "நோய்", "புள்ளி", "கருகல்", "ஈரப்பதம்"
    ]):
        return 90

    return 70


def clean_completion_text(text: str) -> str:
    """
    Ensures answers do not end mid-sentence if generation hit the token ceiling.
    """
    cleaned = text.strip()
    if not cleaned:
        return cleaned

    if cleaned[-1] in [".", "!", "?", "।", "”", '"', "🌱", "🍃", "🌿", "🌾", "🌟", "✨", "😊", "👍"]:
        return cleaned

    last_punct_idx = max(
        cleaned.rfind("."),
        cleaned.rfind("!"),
        cleaned.rfind("?"),
        cleaned.rfind("\n")
    )

    if last_punct_idx > len(cleaned) * 0.5:
        return cleaned[: last_punct_idx + 1].strip()

    return cleaned


def generate_dynamic_follow_ups(
    user_query: str,
    assistant_reply: str,
    intent: str,
    app_context: Optional[Dict[str, Any]],
    conversation_history: List[Dict[str, str]],
    language: str = "en"
) -> List[str]:
    """
    Generates dynamic, highly relevant 3-4 follow-up suggestion questions based on:
    1. Current user question & intent
    2. Active leaf scan result & OOD status (if available)
    3. Active field weather/risk telemetry (if available)
    4. Deduplication against conversation history
    5. English vs. Tamil language parity
    """
    q_lower = user_query.lower().strip()
    is_tamil = language == "ta"

    # Collect past questions for deduplication
    past_queries = set()
    for item in conversation_history or []:
        if item.get("sender") == "user":
            past_queries.add(item.get("text", "").lower().strip())
    past_queries.add(q_lower)

    candidates: List[str] = []

    # -------------------------------------------------------------
    # 1. ACTIVE SCAN RESULT CONTEXT (Top priority if user scanned a leaf)
    # -------------------------------------------------------------
    has_analyzed = bool(app_context and (app_context.get("has_analyzed_image") or app_context.get("hasAnalyzedImage") or app_context.get("prediction") or app_context.get("disease")))
    img_result = (app_context.get("image_result") or app_context.get("imageResult") or app_context) if (has_analyzed and isinstance(app_context, dict)) else {}

    if has_analyzed and img_result:
        raw_disease = img_result.get("disease") or img_result.get("prediction") or "Unknown"
        norm_disease = normalize_disease_name(str(raw_disease))
        is_ood = bool(img_result.get("is_ood") or img_result.get("isOod") or False)
        ood_status = img_result.get("ood_status") or img_result.get("oodStatus") or ("OOD_REJECTED" if is_ood else "IN_DOMAIN")

        if is_ood or ood_status in ["OOD_REJECTED", "VERIFIER_REJECTED"] or "reject" in q_lower or norm_disease == "Non-Turmeric / Out-of-Domain":
            if is_tamil:
                candidates = [
                    "எனது படம் ஏன் நிராகரிக்கப்பட்டது?",
                    "இலையை எவ்வாறு சரியாக படம் எடுப்பது?",
                    "சரியான மஞ்சள் இலை ஸ்கேன் செய்வது எப்படி?"
                ]
            else:
                candidates = [
                    "Why was my image rejected?",
                    "How should I capture the leaf?",
                    "What makes a good turmeric leaf scan?"
                ]
        elif norm_disease == "Aphids":
            if is_tamil:
                candidates = [
                    "அசுவினி பூச்சிகளை எவ்வாறு அடையாளம் காண்பது?",
                    "எவற்றை கண்காணிக்க வேண்டும்?",
                    "அசுவினி பூச்சிகளை எவ்வாறு கட்டுப்படுத்துவது?"
                ]
            else:
                candidates = [
                    "How can I identify Aphids?",
                    "What should I monitor?",
                    "How can I manage Aphids?"
                ]
        elif norm_disease == "Blotch":
            if is_tamil:
                candidates = [
                    "இலைக்கருகல் அறிகுறிகள் என்ன?",
                    "இலைக்கருகல் நோய் எவ்வாறு உருவாகிறது?",
                    "இலைக்கருகல் நோயை எவ்வாறு மேலாண்மை செய்வது?"
                ]
            else:
                candidates = [
                    "What does Blotch look like?",
                    "How does Blotch develop?",
                    "How can I manage Blotch?"
                ]
        elif norm_disease == "Healthy":
            if is_tamil:
                candidates = [
                    "ஆரோக்கியமான முடிவு என்றால் என்ன?",
                    "எவற்றை கண்காணிக்க வேண்டும்?",
                    "பயிரின் ஆரோக்கியத்தை எவ்வாறு பராமரிப்பது?"
                ]
            else:
                candidates = [
                    "What does a Healthy result mean?",
                    "What should I monitor?",
                    "How can I maintain crop health?"
                ]
        elif norm_disease == "Leaf Spot":
            if is_tamil:
                candidates = [
                    "இலைப்புள்ளி அறிகுறிகள் என்ன?",
                    "இலைப்புள்ளி நோய் எவ்வாறு உருவாகிறது?",
                    "இலைப்புள்ளி நோயை எவ்வாறு மேலாண்மை செய்வது?"
                ]
            else:
                candidates = [
                    "What does Leaf Spot look like?",
                    "How does Leaf Spot develop?",
                    "How can I manage Leaf Spot?"
                ]

    # -------------------------------------------------------------
    # 2. QUERY / INTENT PROGRESSION (When no scan result or conversational flow)
    # -------------------------------------------------------------
    if not candidates:
        norm_q_disease = normalize_disease_name(q_lower)

        # A. Explicit Disease (Blotch, Aphids, Leaf Spot, Healthy)
        if norm_q_disease == "Blotch" or "blotch" in q_lower or "கருகல்" in q_lower:
            if is_tamil:
                candidates = [
                    "இலைக்கருகல் அறிகுறிகள் என்ன?",
                    "இலைக்கருகல் நோய் எவ்வாறு உருவாகிறது?",
                    "இலைக்கருகல் நோயை எவ்வாறு மேலாண்மை செய்வது?"
                ]
            else:
                candidates = [
                    "What does Blotch look like?",
                    "How does Blotch develop?",
                    "How can I manage Blotch?"
                ]
        elif norm_q_disease == "Aphids" or "aphid" in q_lower or "அசுவினி" in q_lower:
            if is_tamil:
                candidates = [
                    "அசுவினி பூச்சிகளை எவ்வாறு அடையாளம் காண்பது?",
                    "எவற்றை கண்காணிக்க வேண்டும்?",
                    "அசுவினி பூச்சிகளை எவ்வாறு கட்டுப்படுத்துவது?"
                ]
            else:
                candidates = [
                    "How can I identify Aphids?",
                    "What should I monitor?",
                    "How can I manage Aphids?"
                ]
        elif norm_q_disease == "Healthy" or "healthy" in q_lower or "ஆரோக்கிய" in q_lower:
            if is_tamil:
                candidates = [
                    "ஆரோக்கியமான முடிவு என்றால் என்ன?",
                    "எவற்றை கண்காணிக்க வேண்டும்?",
                    "பயிரின் ஆரோக்கியத்தை எவ்வாறு பராமரிப்பது?"
                ]
            else:
                candidates = [
                    "What does a Healthy result mean?",
                    "What should I monitor?",
                    "How can I maintain crop health?"
                ]
        elif norm_q_disease == "Leaf Spot" or "spot" in q_lower or "புள்ளி" in q_lower:
            if is_tamil:
                candidates = [
                    "இலைப்புள்ளி அறிகுறிகள் என்ன?",
                    "இலைப்புள்ளி நோய் எவ்வாறு உருவாகிறது?",
                    "இலைப்புள்ளி நோயை எவ்வாறு மேலாண்மை செய்வது?"
                ]
            else:
                candidates = [
                    "What does Leaf Spot look like?",
                    "How does Leaf Spot develop?",
                    "How can I manage Leaf Spot?"
                ]

        # B. General Turmeric / Farming
        elif intent == "GENERAL_TURMERIC" or "what is turmeric" in q_lower or "curcuma longa" in q_lower:
            if "stage" in q_lower or "growth" in q_lower or "rhizome" in q_lower:
                if is_tamil:
                    candidates = [
                        "மஞ்சள் அறுவடை எப்போது செய்ய வேண்டும்?",
                        "பாத்திகளை எவ்வாறு பராமரிப்பது?",
                        "மஞ்சள் பயிரைத் தாக்கும் நோய்கள் என்ன?"
                    ]
                else:
                    candidates = [
                        "When should I harvest turmeric?",
                        "How do I maintain field ridges?",
                        "What diseases affect turmeric?"
                    ]
            else:
                if is_tamil:
                    candidates = [
                        "மஞ்சள் பயிரின் வளர்ச்சி நிலைகள் என்ன?",
                        "மஞ்சள் பயிரைத் தாக்கும் நோய்கள் என்ன?",
                        "மஞ்சள் பயிருக்கு வானிலை ஏன் முக்கியம்?"
                    ]
                else:
                    candidates = [
                        "What are the growth stages of turmeric?",
                        "What diseases affect turmeric?",
                        "Why does weather matter?"
                    ]

        # C. Treatment & Management
        elif intent in ["TREATMENT_MANAGEMENT", "SCAN_RESULT + TREATMENT_MANAGEMENT"]:
            if is_tamil:
                candidates = [
                    "ஈரப்பதம் ஏன் இலைப்புள்ளி ஆபத்தை அதிகரிக்கிறது?",
                    "வயலில் எவற்றை ஆய்வு செய்ய வேண்டும்?",
                    "இலையை எவ்வாறு ஸ்கேன் செய்வது?"
                ]
            else:
                candidates = [
                    "Why does humidity increase Leaf Spot risk?",
                    "What should I check in the field?",
                    "How do I scan a leaf?"
                ]

        # D. Environment & Weather
        elif intent == "ENVIRONMENT":
            if is_tamil:
                candidates = [
                    "அதிக ஈரப்பதம் எவ்வாறு இலைப்புள்ளி நோயைத் தூண்டுகிறது?",
                    "சுற்றுச்சூழல் அபாயக் குறியீடு என்றால் என்ன?",
                    "வயல் நிலைமைகளை எவ்வாறு சோதிப்பது?"
                ]
            else:
                candidates = [
                    "How does high humidity trigger Leaf Spot?",
                    "What is the Environmental Risk Index?",
                    "How do I check my field conditions?"
                ]

        # E. Field Conditions & Field Check
        elif intent == "FIELD_CONDITIONS":
            if is_tamil:
                candidates = [
                    "சுற்றுச்சூழல் அபாயக் குறியீடு என்றால் என்ன?",
                    "அதிக ஈரப்பதம் எவ்வாறு இலைப்புள்ளி நோயைத் தூண்டுகிறது?",
                    "இலையை எவ்வாறு ஸ்கேன் செய்வது?"
                ]
            else:
                candidates = [
                    "What is the Environmental Risk Index?",
                    "How does high humidity trigger Leaf Spot?",
                    "How do I scan a leaf?"
                ]

        # F. Technical / ML Research
        elif intent == "PROJECT_TECHNICAL":
            if is_tamil:
                candidates = [
                    "MobileNetV2 மாதிரி எவ்வாறு இயங்குகிறது?",
                    "மகலனோபிஸ் OOD பாதுகாப்பு என்றால் என்ன?",
                    "Stage-1 Verifier என்றால் என்ன?"
                ]
            else:
                candidates = [
                    "How does MobileNetV2 work?",
                    "What is Mahalanobis OOD?",
                    "What is the Stage-1 verifier?"
                ]

        # G. Hardware & App Help
        elif intent == "HARDWARE_APP_HELP":
            if is_tamil:
                candidates = [
                    "DHT22 சென்சார் என்ன அளவிடுகிறது?",
                    "இலையை எவ்வாறு ஸ்கேன் செய்வது?",
                    "முந்தைய பதிவுகளை எங்கு பார்க்கலாம்?"
                ]
            else:
                candidates = [
                    "What does DHT22 measure?",
                    "How do I scan a leaf?",
                    "Where can I view history?"
                ]

        # H. Greeting
        elif intent == "GREETING":
            if is_tamil:
                candidates = [
                    "மஞ்சள் பயிர் பற்றி சொல்லுங்கள்",
                    "இலைப்புள்ளி நோய் என்றால் என்ன?",
                    "இலையை ஸ்கேன் செய்வது எப்படி?"
                ]
            else:
                candidates = [
                    "What is turmeric?",
                    "What is Leaf Spot?",
                    "How do I scan a leaf?"
                ]

        # I. Casual / Out of Domain / Clarification
        else:
            if is_tamil:
                candidates = [
                    "மஞ்சள் பயிரின் வளர்ச்சி நிலைகள் என்ன?",
                    "மஞ்சள் பயிரைத் தாக்கும் நோய்கள் என்ன?",
                    "இலையை ஸ்கேன் செய்வது எப்படி?"
                ]
            else:
                candidates = [
                    "What are the growth stages of turmeric?",
                    "What diseases affect turmeric?",
                    "How do I scan a leaf?"
                ]

    # -------------------------------------------------------------
    # 3. DEDUPLICATION & INTENT-COMPATIBILITY VALIDATION
    # -------------------------------------------------------------
    filtered: List[str] = []
    for cand in candidates:
        cand_clean = cand.lower().strip().rstrip("?.!")
        # Check deduplication against recent user history
        if cand_clean in past_queries or any(cand_clean == pq.rstrip("?.!") for pq in past_queries):
            continue

        # CRITICAL ARCHITECTURAL RULE: Validate intent classification
        cand_intent = classify_query_intent(cand, has_scan_context=has_analyzed)
        if cand_intent in ["CLARIFICATION", "OUT_OF_DOMAIN"]:
            continue

        filtered.append(cand)

    # Safe validated fallback pool if filtering left too few options
    fallback_pool = (
        [
            "மஞ்சள் பயிரின் வளர்ச்சி நிலைகள் என்ன?",
            "இலைப்புள்ளி நோயை எவ்வாறு மேலாண்மை செய்வது?",
            "வானிலை ஏன் முக்கியம்?",
            "வயல் நிலைமைகளை எவ்வாறு சோதிப்பது?"
        ]
        if is_tamil
        else [
            "What are the growth stages of turmeric?",
            "How can I manage Leaf Spot?",
            "Why does weather matter?",
            "How do I check my field conditions?"
        ]
    )

    for fb in fallback_pool:
        if len(filtered) >= 3:
            break
        fb_clean = fb.lower().strip().rstrip("?.!")
        if fb_clean not in past_queries and fb not in filtered:
            fb_intent = classify_query_intent(fb, has_scan_context=has_analyzed)
            if fb_intent not in ["CLARIFICATION", "OUT_OF_DOMAIN"]:
                filtered.append(fb)

    return filtered[:3]


def _call_local_ollama(
    system_instruction: str,
    conversation_history: List[Dict[str, str]],
    user_message: str,
    host: str,
    model: str,
    num_predict: int = OLLAMA_NUM_PREDICT
) -> Tuple[str, int, int, float]:
    """
    Invokes the local Ollama server at http://127.0.0.1:11434 via optimized local HTTP request.
    Returns (content, eval_count, prompt_eval_count, duration_ms).
    """
    messages = [{"role": "system", "content": system_instruction}]

    for msg in (conversation_history or [])[-2:]:
        role = "user" if msg.get("sender") == "user" else "assistant"
        text = msg.get("text", "").strip()
        if text:
            messages.append({"role": role, "content": text})

    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "keep_alive": OLLAMA_KEEP_ALIVE,
        "options": {
            "temperature": 0.2,
            "top_p": 0.9,
            "num_predict": num_predict,
            "num_ctx": OLLAMA_NUM_CTX,
            "num_thread": OLLAMA_NUM_THREADS,
        }
    }

    url = f"{host.rstrip('/')}/api/chat"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=45.0) as resp:
        if resp.status == 200:
            result = json.loads(resp.read().decode("utf-8"))
            duration_ms = (time.perf_counter() - t0) * 1000
            msg = result.get("message", {})
            content = msg.get("content", "").strip()
            eval_count = result.get("eval_count", 0)
            prompt_eval_count = result.get("prompt_eval_count", 0)
            if content:
                cleaned_content = clean_completion_text(content)
                return cleaned_content, eval_count, prompt_eval_count, duration_ms

    raise RuntimeError("Empty response from local Ollama service")


def stream_local_ollama(
    system_instruction: str,
    conversation_history: List[Dict[str, str]],
    user_message: str,
    host: str,
    model: str,
    num_predict: int = OLLAMA_NUM_PREDICT
) -> Generator[Dict[str, Any], None, None]:
    """
    Generator yielding token chunks via SSE streaming from local Ollama.
    """
    messages = [{"role": "system", "content": system_instruction}]
    for msg in (conversation_history or [])[-2:]:
        role = "user" if msg.get("sender") == "user" else "assistant"
        text = msg.get("text", "").strip()
        if text:
            messages.append({"role": role, "content": text})
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "keep_alive": OLLAMA_KEEP_ALIVE,
        "options": {
            "temperature": 0.2,
            "top_p": 0.9,
            "num_predict": num_predict,
            "num_ctx": OLLAMA_NUM_CTX,
            "num_thread": OLLAMA_NUM_THREADS,
        }
    }

    url = f"{host.rstrip('/')}/api/chat"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=45.0) as resp:
        for line in resp:
            line_str = line.decode("utf-8").strip()
            if line_str:
                chunk_data = json.loads(line_str)
                yield chunk_data


def _synthesize_local_rag_response(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    app_context: Optional[Dict[str, Any]],
    language: str,
    intent: Optional[str] = None
) -> str:
    """
    Deterministic local synthesis engine.
    Executes 100% on the local CPU without external network dependencies.
    Strictly addresses TurmeriCare-specific queries.
    """
    normalized = query.lower()
    is_tamil = language == "ta" or any("\u0b80" <= char <= "\u0bff" for char in query)

    if not intent:
        intent = classify_query_intent(query, has_scan_context=bool(app_context and app_context.get("has_analyzed_image")))

    # -------------------------------------------------------------
    # 1. GREETING
    # -------------------------------------------------------------
    if intent == "GREETING":
        if is_tamil:
            return "வணக்கம்! 👋 நான் Ask Curcuma. மஞ்சள் (Turmeric) பயிர் நலம், இலை நோய்கள், ஸ்கேன் முடிவுகள், வானிலை அபாயம் அல்லது பயிர் மேலாண்மை குறித்து என்னிடம் கேட்கலாம்."
        return "Hi! 👋 I'm Ask Curcuma. You can ask me about turmeric, diseases, leaf scans, weather, risk, or crop management."

    # -------------------------------------------------------------
    # 2. CASUAL / COURTESY
    # -------------------------------------------------------------
    if intent == "CASUAL":
        if is_tamil:
            return "மகிழ்ச்சி! மஞ்சள் பயிர் பராமரிப்பு குறித்து ஏதேனும் உதவி தேவைப்பட்டால் தாராளமாகக் கேளுங்கள். 🌱"
        return "You're welcome! Let me know if you need any other help with your turmeric crop. 🌱"

    # -------------------------------------------------------------
    # 3. OUT_OF_DOMAIN (Non-turmeric crops or unrelated questions)
    # -------------------------------------------------------------
    if intent == "OUT_OF_DOMAIN":
        if is_tamil:
            return (
                "🌱 நான் **Ask Curcuma**, பிரத்யேகமாக **TurmeriCare** — மஞ்சள் (*Curcuma longa*, மஞ்சள்) பயிர் நலம், இலை நோய்கள் (இலைப்புள்ளி, இலைக்கருகல், அசுவினி), ஸ்கேன் கணிப்புகள் மற்றும் வானிலை அபாயத்திற்காக வடிவமைக்கப்பட்டுள்ளேன்.\n\n"
                "பிற பயிர்கள் அல்லது தொடர்பற்ற கேள்விகளுக்கு என்னால் பதிலளிக்க முடியாது. மஞ்சள் பயிர் சாகுபடி, நோய்கள் அல்லது உங்கள் ஸ்கேன் முடிவுகள் குறித்து என்னிடம் கேட்கலாம்!"
            )
        return (
            "🌱 I am **Ask Curcuma**, specialized exclusively for the **TurmeriCare** system — dedicated to Turmeric (*Curcuma longa*) crop care, foliar disease diagnostics (Leaf Spot, Leaf Blotch, Aphids), leaf vision scans, and field weather risk.\n\n"
            "I cannot advise on other crops or unrelated non-turmeric topics. Please feel free to ask anything about turmeric cultivation, foliar diseases, or your scan results!"
        )

    # -------------------------------------------------------------
    # 4. CLARIFICATION
    # -------------------------------------------------------------
    if intent == "CLARIFICATION":
        if is_tamil:
            return "நீங்கள் கேட்டது தெளிவாகப் புரியவில்லை. மஞ்சள் பயிர் வளர்ப்பு, இலை நோய்கள் (இலைப்புள்ளி, இலைக்கருகல், அசுவினி), ஸ்கேன் முடிவுகள் அல்லது வானிலை அபாயம் குறித்து நான் உதவ முடியும். உங்களுக்கு என்ன தகவல் வேண்டும்?"
        return "I'm not quite sure I understood. I specialize in Turmeric (*Curcuma longa*) crop care, foliar diseases (Leaf Spot, Blotch, Aphids), leaf scans, and weather risk. What would you like to know?"

    # -------------------------------------------------------------
    # 4.5. DISEASE_DEFINITION (Dedicated 4-Class Natural & Concise Responses)
    # -------------------------------------------------------------
    if intent == "DISEASE_DEFINITION":
        norm_disease = normalize_disease_name(query)
        if not norm_disease and app_context and isinstance(app_context, dict):
            img = app_context.get("image_result") or app_context.get("imageResult") or app_context
            if isinstance(img, dict):
                norm_disease = normalize_disease_name(str(img.get("disease") or img.get("prediction") or ""))

        if norm_disease == "Blotch":
            if is_tamil:
                return "🍂 **இலைக்கருகல் (Leaf Blotch)** என்பது *Taphrina maculans* பூஞ்சையால் மஞ்சள் பயிரில் ஏற்படும் இலை நோயாகும். இது இலைகளில் பழுப்பு முதல் அடர் கருகிய திட்டுகளை உண்டாக்கும். இதன் அறிகுறிகள், பரவும் விதம் அல்லது மேலாண்மை முறைகள் பற்றி நான் விளக்க வேண்டுமா?"
            return "🍂 **Leaf Blotch** is a foliar disease of turmeric caused by the fungus *Taphrina maculans*. It produces brown to dark scorched patches on the leaves. If you want, I can explain its symptoms, how it develops, or how to manage it."

        elif norm_disease == "Aphids":
            if is_tamil:
                return "🐛 **அசுவினி (Aphids)** (*Aphis gossypii*) என்பது மஞ்சள் பயிரில் இலைகளின் அடிப்பகுதியில் சாற்றை உறிஞ்சும் சிறிய பூச்சியாகும். இது இலைச் சுருக்கம் மற்றும் கரும்பூஞ்சை படர காரணமாகிறது. இதை அடையாளம் காண்பது அல்லது மேலாண்மை செய்வது பற்றி நான் விளக்க வேண்டுமா?"
            return "🐛 **Aphids** (*Aphis gossypii*) are small sap-sucking insect pests that colonize turmeric foliage and tender shoots. They drain plant sap, cause leaf crinkling, and secrete honeydew that leads to black sooty mold. If you want, I can explain how to identify, monitor, or manage them."

        elif norm_disease == "Leaf Spot":
            if is_tamil:
                return "🍃 **இலைப்புள்ளி (Leaf Spot)** (*Colletotrichum capsici*) என்பது மஞ்சள் பயிரில் தோன்றும் பொதுவான பூஞ்சை இலை நோயாகும். இது இலைகளில் தெளிவான மஞ்சள் வளையத்துடன் கூடிய பழுப்பு நிற வட்டப் புள்ளிகளை உண்டாக்கும். இதன் அறிகுறிகள், பரவும் விதம் அல்லது மேலாண்மை பற்றி நான் விளக்க வேண்டுமா?"
            return "🍃 **Leaf Spot** is a common foliar fungal disease of turmeric caused by *Colletotrichum capsici*. It produces circular to oval brown spots with distinct bright yellow halos on the leaves. If you want, I can explain its symptoms, how it develops, or how to manage it."

        elif norm_disease == "Healthy":
            if is_tamil:
                return "🌱 **ஆரோக்கியமான (Healthy)** முடிவு என்பது மஞ்சள் இலையில் இலைப்புள்ளி, இலைக்கருகல் அல்லது அசுவினி தாக்குதலின் அறிகுறிகள் எதுவுமின்றி, சீரான பச்சை நிறத்துடன் கூடிய இயல்பான இலையைக் குறிக்கிறது. தொடர் வாராந்திர கள ஆய்வு பயிரின் நலம் காக்க உதவும்."
            return "🌱 A **Healthy** result means the turmeric foliage exhibits normal, vibrant green color with no detectable signs of Leaf Spot, Leaf Blotch, or Aphids. Regular weekly field scouting helps maintain crop health."

    # -------------------------------------------------------------
    # 4.6. DISEASE_SYMPTOMS (Visual Identification & Symptoms)
    # -------------------------------------------------------------
    if intent == "DISEASE_SYMPTOMS":
        norm_disease = normalize_disease_name(query)
        if not norm_disease and app_context and isinstance(app_context, dict):
            img = app_context.get("image_result") or app_context.get("imageResult") or app_context
            if isinstance(img, dict):
                norm_disease = normalize_disease_name(str(img.get("disease") or img.get("prediction") or ""))

        if norm_disease == "Blotch":
            if is_tamil:
                return (
                    "🍂 **இலைக்கருகல் நோய் அறிகுறிகள்:**\n\n"
                    "• இலைகளின் இருபுறங்களிலும் சிறிய மஞ்சள்-பழுப்பு நிற புள்ளிகளாகத் தொடங்கும்.\n"
                    "• புள்ளிகள் மிக வேகமாக ஒன்றிணைந்து பெரிய கருகிய தகடுகள் போன்ற திட்டுகளாக (Scorched patches) மாறும்.\n"
                    "• இலைப்புள்ளி போல தனித்தனி மஞ்சள் வளையங்கள் இதில் இருக்காது."
                )
            return (
                "🍂 **Leaf Blotch Visual Symptoms:**\n\n"
                "• Starts as numerous small, irregular yellowish-brown to reddish-brown spots on both leaf surfaces.\n"
                "• Spots rapidly coalesce into large, dark brown scorched patches across the lamina.\n"
                "• Unlike Leaf Spot, Blotch forms continuous scorched sheets without distinct yellow halo rings."
            )

        elif norm_disease == "Aphids":
            if is_tamil:
                return (
                    "🐛 **அசுவினி பூச்சி அறிகுறிகள்:**\n\n"
                    "• இளம் இலைகளின் அடிப்பகுதியில் பச்சை, மஞ்சள் அல்லது கருப்பு நிற சிறிய பூச்சிகள் கூட்டமாக இருக்கும்.\n"
                    "• பாதிக்கப்பட்ட இலைகள் கீழ்நோக்கி சுருண்டு, நெளிந்து ஒழுங்கற்ற வடிவத்தைப் பெறும்.\n"
                    "• இலைகளின் மேல் பிசுபிசுப்பான தேன் திரவம் மற்றும் கறுப்பு நிற கரும்பூஞ்சை (Sooty mold) படரும்."
                )
            return (
                "🐛 **Aphids Visual Symptoms:**\n\n"
                "• Dense colonies of tiny green, yellowish, or black soft-bodied insects clustered under leaves and tender shoots.\n"
                "• Downward leaf crinkling, cupping, and foliar distortion.\n"
                "• Shiny sticky honeydew residue and dark velvety black sooty mold coatings on the upper lamina."
            )

        elif norm_disease == "Leaf Spot":
            if is_tamil:
                return (
                    "🍃 **இலைப்புள்ளி நோய் அறிகுறிகள்:**\n\n"
                    "• இலைகளில் வட்டமான அல்லது நீள்வட்ட பழுப்பு நிற புள்ளிகள் தோன்றும்.\n"
                    "• பழுப்பு நிற புள்ளியைச் சுற்றி தெளிவான பிரகாசமான மஞ்சள் நிற வளையம் (Yellow Halo) காணப்படும்.\n"
                    "• நோய் முதிரும்போது புள்ளியின் நடுப்பகுதி காய்ந்து மெல்லிய காகிதம் போலாகி ஓட்டைகள் விழலாம்."
                )
            return (
                "🍃 **Leaf Spot Visual Symptoms:**\n\n"
                "• Circular to elliptical necrotic brown spots appearing predominantly on leaf blades.\n"
                "• Distinctive diagnostic feature: Prominent, bright yellow halo borders clearly surrounding each dark brown lesion.\n"
                "• Lesion centers become thin and papery (shot-hole appearance) as spots enlarge."
            )

        elif norm_disease == "Healthy":
            if is_tamil:
                return (
                    "🌱 **ஆரோக்கியமான மஞ்சள் இலை தோற்றம்:**\n\n"
                    "• சீரான அடர் பச்சை நிறம், தெளிவான நரம்பமைப்பு மற்றும் கறைகள் அற்ற மென்மையான இலைப்பரப்பு.\n"
                    "• எந்தவித கருகல் புள்ளிகள், மஞ்சள் வளையங்கள் அல்லது பூச்சி சுருட்டைகள் இன்றி ஆரோக்கியமாக இருக்கும்."
                )
            return (
                "🌱 **Healthy Turmeric Foliage Characteristics:**\n\n"
                "• Intact, smooth, vibrant green lamina with uniform parallel venation.\n"
                "• Clean foliage with no necrotic lesions, yellow halos, scorched patches, or pest colonies."
            )

    # -------------------------------------------------------------
    # 4.7. DISEASE_FORMATION (Biology & Pathogen Development)
    # -------------------------------------------------------------
    if intent == "DISEASE_FORMATION":
        norm_disease = normalize_disease_name(query)
        if not norm_disease and app_context and isinstance(app_context, dict):
            img = app_context.get("image_result") or app_context.get("imageResult") or app_context
            if isinstance(img, dict):
                norm_disease = normalize_disease_name(str(img.get("disease") or img.get("prediction") or ""))

        if norm_disease == "Blotch":
            if is_tamil:
                return (
                    "🍂 **இலைக்கருகல் நோய் எவ்வாறு உருவாகிறது:**\n\n"
                    "• முதன்மைக் காரணம்: பயிர் கழிவுகளில் தங்கியிருக்கும் *Taphrina maculans* பூஞ்சை வித்துக்கள்.\n"
                    "• சாதகமான சூழல்: தொடர்ந்து நிலவும் மேகமூட்டம், 22-28°C வெப்பநிலை மற்றும் 85%-க்கு அதிகமான காற்றின் ஈரப்பதம்.\n"
                    "• பரவல்: காற்றில் பரவும் வித்துக்கள் மற்றும் மழைத் தூறல் மூலம் புதிய இலைகளுக்கு மிக வேகமாகப் பரவுகிறது."
                )
            return (
                "🍂 **How Leaf Blotch Develops:**\n\n"
                "• Primary Pathogen: Fungal spores (*Taphrina maculans*) resting on infected crop residue in the field.\n"
                "• Favorable Environment: Extended overcast skies, moderate temperatures (22–28°C), and relative humidity above 85%.\n"
                "• Spore Transmission: Ascospores are forcibly discharged and carried by gentle wind drafts and rain splashes to new foliage."
            )

        elif norm_disease == "Leaf Spot":
            if is_tamil:
                return (
                    "🍃 **இலைப்புள்ளி நோய் எவ்வாறு உருவாகிறது:**\n\n"
                    "• முதன்மைக் காரணம்: மண்ணிலோ அல்லது முந்தைய பயிர் கழிவுகளிலோ இருக்கும் *Colletotrichum capsici* பூஞ்சை வித்துக்கள்.\n"
                    "• தொற்று முறை: இலைகளில் தொடர்ந்து நீர் துளிகள் அல்லது பனி இருக்கும்போது வித்துக்கள் முளைத்து இலைக்குள் நுழைகின்றன.\n"
                    "• சாதகமான சூழல்: 25–30°C வெப்பநிலையும் 80%-க்கு மேற்பட்ட காற்றில் ஈரப்பதமும் பூஞ்சை வளர்ச்சியை துரிதப்படுத்துகின்றன."
                )
            return (
                "🍃 **How Leaf Spot Forms:**\n\n"
                "• Primary Pathogen: Fungal spores (*Colletotrichum capsici*) harbored in soil or on crop debris.\n"
                "• Infection Pathway: Spores germinate in the presence of continuous free moisture or water films on leaf surfaces.\n"
                "• Environmental Drivers: Warm temperatures (25–30°C) and prolonged relative humidity (>80%) accelerate hyphal penetration."
            )

    # -------------------------------------------------------------
    # 4.8. GENERAL_TURMERIC (Strictly for Turmeric Plant & Cultivation Queries)
    # -------------------------------------------------------------
    if intent == "GENERAL_TURMERIC":
        if any(k in normalized for k in ["rhizome", "stage", "harvest", "dap", "வளர்ச்சி", "கிழங்கு", "அறுவடை"]):
            if is_tamil:
                return (
                    "🌱 **மஞ்சள் பயிர் வளர்ச்சி நிலைகள் (210–270 நாட்கள்):**\n\n"
                    "• **முளைப்பு பருவம் (0–30 நாள்):** விதைக்கிழங்கில் இருந்து தளிர்கள் தோன்றுதல்.\n"
                    "• **தழை வளர்ச்சி (30–90 நாள்):** இலைகள் விரிவடைந்து தூர்கள் உருவாகுதல்.\n"
                    "• **கிழங்கு பருவம் (90–180 நாள்):** பக்கவாட்டு விரல் கிழங்குகள் பெருகுதல்.\n"
                    "• **முதிர்ச்சி (180–240+ நாள்):** இலைகள் மஞ்சள் நிறமாகி காய்ந்து அறுவடைக்கு தயாராதல்."
                )
            return (
                "🌱 **Turmeric Growth Cycle (210–270 Days After Planting):**\n\n"
                "• **Sprouting (0–30 DAP):** Mother rhizome buds emerge from moist soil.\n"
                "• **Vegetative Phase (30–90 DAP):** Canopy leaf expansion and tillering.\n"
                "• **Rhizome Bulking (90–180 DAP):** Active finger rhizome development underground.\n"
                "• **Maturity & Senescence (180–240+ DAP):** Foliage yellows and naturally dries down before harvest."
            )
        else:
            if is_tamil:
                return (
                    "🌱 **மஞ்சள் (*Curcuma longa*)** என்பது இஞ்சி குடும்பத்தைச் (Zingiberaceae) சேர்ந்த ஒரு வெப்பமண்டல கிழங்குப் பயிராகும். "
                    "தமிழ்நாடு மற்றும் ஆந்திராவில் பரவலாக சாகுபடி செய்யப்படுகிறது. "
                    "இதன் முக்கிய செயல்திறன் கொண்ட வேதிப்பொருள் குர்குமின் (Curcumin) ஆகும், இது சிறந்த மருத்துவ குணங்களையும் மஞ்சள் நிறத்தையும் தருகிறது."
                )
            return (
                "🌱 **Turmeric (*Curcuma longa*)** is a tropical perennial herbaceous crop belonging to the ginger family (Zingiberaceae). "
                "It is cultivated primarily for its underground rhizomes, which contain the active bioactive constituent curcumin."
            )

    # -------------------------------------------------------------
    # 5. SCAN_RESULT + TREATMENT_MANAGEMENT
    # -------------------------------------------------------------
    if intent == "SCAN_RESULT + TREATMENT_MANAGEMENT":
        disease_name = "Leaf Spot"
        if app_context and isinstance(app_context, dict):
            img = app_context.get("image_result") or app_context.get("imageResult") or app_context
            if isinstance(img, dict):
                d = img.get("disease") or img.get("prediction")
                if d:
                    disease_name = str(d).strip()

        if disease_name in ["Healthy", "healthy"]:
            if is_tamil:
                return (
                    "🌱 உங்கள் ஸ்கேன் முடிவு **Healthy (ஆரோக்கியமானது)** எனக் கணிக்கப்பட்டுள்ளது (எந்தவொரு இலை நோயும் கண்டறியப்படவில்லை). எனவே வேதியியல் பூச்சிக்கொல்லிகளோ மருந்துகளோ தேவையில்லை.\n\n"
                    "பரிந்துரைக்கப்படும் தொடர் பராமரிப்பு மற்றும் கண்காணிப்பு வழிகாட்டல்:\n"
                    "• **வாராந்திர கள ஆய்வு**: இலைகளின் அடிப்பகுதியை வாரம் ஒருமுறை ஆய்வு செய்து புதிய புள்ளிகள் உள்ளதா எனப் பார்க்கவும்.\n"
                    "• **பாசனம் மற்றும் வடிகால்**: பாத்திகளில் நீர் தேங்காமல் சீரான வடிகால் வசதியைப் பேணவும்.\n"
                    "• **சீரான உர மேலாண்மை**: அளவுக்கு அதிகமான தழைச்சத்தைத் தவிர்த்து சமச்சீரான ஊட்டச்சத்துக்களை வழங்கவும்.\n"
                    "• **வானிலை கண்காணிப்பு**: Weather & Risk பக்கத்தில் சுற்றுச்சூழல் அபாயத்தை அவ்வப்போது சரிபார்க்கவும்."
                )
            return (
                "🌱 Your active scan result is **Healthy** (no active foliar disease detected). No chemical fungicides, pesticides, or curative sprays are needed.\n\n"
                "Recommended routine crop maintenance and preventive scouting:\n"
                "• Regular scouting: Inspect lower leaf undersides and new shoots weekly for early signs.\n"
                "• Raised bed drainage: Maintain proper furrow drainage to prevent water stagnation around rhizomes.\n"
                "• Balanced nutrition: Follow recommended agronomic fertilizer applications; avoid excess nitrogen that softens foliage.\n"
                "• Microclimate monitoring: Track humidity and leaf wetness in Weather & Risk to anticipate seasonal disease pressure."
            )

        elif disease_name in ["Aphids", "aphids", "Aphid", "aphid"]:
            if is_tamil:
                return (
                    "🍃 உங்கள் ஸ்கேன் முடிவில் **Aphids (அசுவினி)** கண்டறியப்பட்டால், உடனடியாக மேற்கொள்ள வேண்டிய மேலாண்மை நடவடிக்கைகள்:\n\n"
                    "• **வேதியியல் வழிகாட்டல்**: பூச்சிக்கொல்லி மருந்துகளைப் பயன்படுத்தும்போது தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU/KVK) அங்கீகரித்த தயாரிப்புகள் மற்றும் வழிகாட்டலை மட்டுமே பின்பற்றவும். தவறான பூச்சிக்கொல்லிப் பெயர்களையோ அளவுகளையோ நான் பரிந்துரைக்க மாட்டேன்.\n"
                    "• **மஞ்சள் நிற ஒட்டும் பொறிகள்**: ஹெக்டேருக்கு 15–20 மஞ்சள் நிற ஒட்டும் பொறிகளை வைத்து அசுவினிகளைக் கவரவும்.\n"
                    "• **இயற்கை எதிரிகள்**: பொறிவண்டுகள் (Ladybird beetles) போன்ற நன்மை செய்யும் பூச்சிகளைப் பாதுகாக்கவும்.\n"
                    "• **தொடக்கநிலை கட்டுப்பாடு**: ஆரம்பநிலை கொத்துக்களுக்கு தூய நீர் பீய்ச்சி அடித்தல் அல்லது வேப்ப எண்ணெய் போன்ற தாவர பூச்சிவிரட்டிகளைப் பயன்படுத்தலாம்.\n"
                    "• **கள ஆய்வு**: இலைகளின் அடிப்பகுதியையும் இளம் தளிர்களையும் தொடர்ந்து கண்காணிக்கவும்."
                )
            return (
                f"Chemical treatment should be based on current approved product labels and local agricultural-extension (TNAU/ICAR/KVK) recommendations for turmeric {disease_name}. I won't guess an unverified pesticide or dosage.\n\n"
                f"For immediate non-chemical and IPM management after your Aphids scan:\n"
                f"• Yellow sticky traps: Install yellow sticky traps (15–20 traps/ha) across the field to monitor and catch winged aphids.\n"
                f"• Natural biological predators: Conserve beneficial natural enemies like ladybird beetles and lacewings.\n"
                f"• Water jet wash: In early mild clusters, a targeted clean water spray dislodges colonies from tender shoots.\n"
                f"• Extension guidance: For severe infestations, consult your local KVK/TNAU extension officer for approved botanical or registered formulations."
            )

        elif disease_name in ["Blotch", "Leaf Blotch", "blotch", "leaf blotch"]:
            if is_tamil:
                return (
                    "🍃 உங்கள் ஸ்கேன் முடிவில் **Leaf Blotch (இலைக்கருகல்)** கண்டறியப்பட்டால், உடனடியாக மேற்கொள்ள வேண்டிய மேலாண்மை நடவடிக்கைகள்:\n\n"
                    "• **வேதியியல் வழிகாட்டல்**: Taphrina இலைக்கருகல் நோய்க்கு அரசு மற்றும் TNAU/KVK பரிந்துரைத்த பூஞ்சைக்கொல்லி மருந்துகளை மட்டுமே லேபிள் விதிகளின்படி பயன்படுத்த வேண்டும். அங்கீகரிக்கப்படாத அளவுகளைப் பயன்படுத்தக் கூடாது.\n"
                    "• **வயல் தூய்மை**: தீவிரமாக கருகிய மற்றும் உதிர்ந்த இலைகளைச் சேகரித்து பாதுகாப்பாக அழிக்கவும்.\n"
                    "• **வடிகால் மேலாண்மை**: மழைக்காலங்களில் பாத்திகளில் நீர் தேங்காமல் வடிகால் வசதியை உறுதி செய்யவும்.\n"
                    "• **காற்றோட்டம்**: செடிகளுக்கிடையே சூரிய ஒளியும் காற்றோட்டமும் சீராகக் கிடைக்க போதிய இடைவெளி விடவும்.\n"
                    "• **சீரான உரமிடுதல்**: அளவுக்கு அதிகமான தழைச்சத்து (Nitrogen) உரங்களைத் தவிர்க்கவும்."
                )
            return (
                f"Chemical treatment should be based on current approved product labels and local agricultural-extension (TNAU/ICAR/KVK) recommendations for turmeric {disease_name} (Taphrina maculans). I won't guess an unverified pesticide or dosage.\n\n"
                f"For immediate non-chemical and cultural management after your Blotch scan:\n"
                f"• Field sanitation: Collect and safely destroy heavily scorched, blighted leaf debris to reduce inoculum.\n"
                f"• Moisture control: Ensure proper ridge drainage and eliminate standing furrow water during rainy periods.\n"
                f"• Canopy aeration: Maintain adequate row spacing to improve sunlight penetration and air circulation.\n"
                f"• Balanced nutrition: Avoid excessive nitrogenous fertilizers that encourage soft, disease-susceptible foliage.\n\n"
                f"Consult local TNAU / KVK agricultural extension specialists for registered fungicides."
            )

        else:
            # Leaf Spot default
            if is_tamil:
                return (
                    f"🍃 உங்கள் ஸ்கேன் முடிவில் **{disease_name}** கண்டறியப்பட்டால், உடனடியாக மேற்கொள்ள வேண்டிய மேலாண்மை நடவடிக்கைகள்:\n\n"
                    f"• **வேதியியல் வழிகாட்டல்**: பூஞ்சைக்கொல்லி மருந்துகளைப் பயன்படுத்தும்போது தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU/KVK) அங்கீகரித்த தயாரிப்புகள் மற்றும் வழிகாட்டலை மட்டுமே பின்பற்றவும். தவறான பூச்சிக்கொல்லிப் பெயர்களையோ அளவுகளையோ நான் பரிந்துரைக்க மாட்டேன்.\n"
                    f"• **பாதிக்கப்பட்ட இலைகளை அகற்றுதல்**: தீவிரமாக பாதிக்கப்பட்ட இலைகளை பறித்து வயலை விட்டு அப்புறப்படுத்தி அழிக்கவும் (Field Sanitation).\n"
                    f"• **ஈரப்பத மேலாண்மை**: இலைகளில் அதிக நேரம் நீர் தேங்குவதைத் தடுத்து, பாத்திகளில் நல்ல வடிகால் வசதி அமைக்கவும்.\n"
                    f"• **காற்றோட்டம்**: செடிகளுக்கிடையே நல்ல காற்றோட்டம் இருப்பதை உறுதி செய்யவும்.\n"
                    f"• **கள ஆய்வு**: மற்ற இலைகளில் நோய் பரவுகிறதா என்பதை தொடர்ந்து கண்காணிக்கவும்."
                )
            return (
                f"Chemical treatment should be based on the current approved label and local agricultural-extension (TNAU/ICAR/KVK) recommendation for turmeric {disease_name}. I won't guess a pesticide or dosage.\n\n"
                f"For immediate management after your scan detection:\n"
                f"• Field sanitation: Carefully remove and safely destroy severely affected leaves where appropriate to prevent spore spread.\n"
                f"• Moisture control: Reduce prolonged leaf wetness, maintain ridge drainage, and avoid unnecessary overhead wetness.\n"
                f"• Canopy airflow: Ensure adequate spacing for good aeration through the crop canopy.\n"
                f"• Regular scouting: Monitor adjacent foliage frequently for early lesion development.\n\n"
                f"If you tell me your location/district, I can point you toward the relevant official agricultural guidance."
            )

    # -------------------------------------------------------------
    # 6. TREATMENT_MANAGEMENT (Pesticides, Chemicals, Control, Care)
    # -------------------------------------------------------------
    if intent == "TREATMENT_MANAGEMENT":
        disease_target = "Leaf Spot"
        # Check explicit query tokens first
        if "aphid" in normalized or "அசுவினி" in normalized:
            disease_target = "Aphids"
        elif "blotch" in normalized or "கருகல்" in normalized:
            disease_target = "Leaf Blotch"
        elif "healthy" in normalized or "ஆரோக்கிய" in normalized:
            disease_target = "Healthy"
        elif app_context and isinstance(app_context, dict):
            # Check active scan context if query was generic ("what pesticide can i use", "how to treat")
            img = app_context.get("image_result") or app_context.get("imageResult") or app_context
            if isinstance(img, dict):
                d = img.get("disease") or img.get("prediction")
                if d:
                    d_str = str(d).strip()
                    if "aphid" in d_str.lower():
                        disease_target = "Aphids"
                    elif "blotch" in d_str.lower():
                        disease_target = "Leaf Blotch"
                    elif "healthy" in d_str.lower():
                        disease_target = "Healthy"
                    elif "spot" in d_str.lower():
                        disease_target = "Leaf Spot"

        if disease_target == "Healthy":
            if is_tamil:
                return (
                    "🌱 மஞ்சள் பயிர் **ஆரோக்கியமாக (Healthy)** இருக்கும்போது வேதியியல் பூச்சிக்கொல்லிகளோ மருந்துகளோ தேவையில்லை.\n\n"
                    "பரிந்துரைக்கப்படும் தொடர் பராமரிப்பு:\n"
                    "• **வாராந்திர ஆய்வு**: இலைகளின் அடிப்பகுதியை வாரம் ஒருமுறை ஆய்வு செய்யவும்.\n"
                    "• **வடிகால் வசதி**: பாத்திகளில் நீர் தேங்காமல் பார்த்துக் கொள்ளவும்.\n"
                    "• **சீரான உரமிடுதல்**: அளவுக்கு அதிகமான தழைச்சத்தைத் தவிர்த்து சமச்சீரான ஊட்டச்சத்துக்களை வழங்கவும்."
                )
            return (
                "🌱 Your turmeric crop / scan is **Healthy**. No chemical pesticides or curative treatments are needed.\n\n"
                "Recommended preventive care & maintenance:\n"
                "• Regular scouting: Check the underside of lower canopy leaves weekly for early signs.\n"
                "• Good drainage: Ensure raised beds have proper furrow drainage to prevent root waterlogging.\n"
                "• Balanced nutrition: Avoid excessive nitrogen fertilizer to maintain strong natural foliar defenses.\n"
                "• Monitor weather: Watch humidity and leaf wetness in Weather & Risk to anticipate potential disease risks."
            )

        elif disease_target == "Aphids":
            if is_tamil:
                return (
                    "மஞ்சள் அசுவினி பூச்சிக்கான வேதியியல் பூச்சிக்கொல்லி சிகிச்சை முறைகள் மத்திய/மாநில அரசு அங்கீகரித்த லேபிள் மற்றும் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU/KVK) பரிந்துரைகளின் அடிப்படையில் மட்டுமே அமைய வேண்டும். தவறான பூச்சிக்கொல்லி அல்லது மருந்தளவை நான் யூகிக்க மாட்டேன்.\n\n"
                    "உடனடி ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM) முறைகள்:\n"
                    "• **மஞ்சள் நிற ஒட்டும் பொறிகள்**: ஹெக்டேருக்கு 15–20 மஞ்சள் நிற ஒட்டும் பொறிகளை வைத்து அசுவினிகளைக் கவரவும்.\n"
                    "• **இயற்கை எதிரிகள்**: பொறிவண்டுகள் (Ladybird beetles) போன்ற நன்மை செய்யும் பூச்சிகளைப் பாதுகாக்கவும்.\n"
                    "• **தொடக்கநிலை கட்டுப்பாடு**: ஆரம்பநிலை கொத்துக்களுக்கு தூய நீர் பீய்ச்சி அடித்தல் அல்லது வேப்ப எண்ணெய் போன்ற தாவர பூச்சிவிரட்டிகளைப் பயன்படுத்தலாம்.\n"
                    "• **கள ஆய்வு**: இலைகளின் அடிப்பகுதியையும் இளம் தளிர்களையும் தொடர்ந்து கண்காணிக்கவும்."
                )
            return (
                "Chemical treatment should be based on current approved product labels and local agricultural-extension (TNAU/ICAR/KVK) recommendations for turmeric Aphids. I won't guess an unverified pesticide or dosage.\n\n"
                "For immediate non-chemical and IPM management:\n"
                "• Yellow sticky traps: Install yellow sticky traps (15–20 traps/ha) across the field to monitor and catch winged aphids.\n"
                "• Natural biological predators: Conserve beneficial natural enemies like ladybird beetles and lacewings.\n"
                "• Water jet wash: In early mild clusters, a targeted clean water spray dislodges colonies from tender shoots.\n"
                "• Extension guidance: For severe infestations, consult your local KVK/TNAU extension officer for approved botanical or registered formulations."
            )

        elif disease_target == "Leaf Blotch":
            if is_tamil:
                return (
                    "மஞ்சள் இலைக்கருகல் (Leaf Blotch) நோய்க்கான வேதியியல் பூஞ்சைக்கொல்லி சிகிச்சை முறைகள் அரசு அங்கீகரித்த லேபிள் மற்றும் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU/KVK) பரிந்துரைகளின் அடிப்படையில் மட்டுமே அமைய வேண்டும். தவறான பூஞ்சைக்கொல்லி அல்லது மருந்தளவை நான் யூகிக்க மாட்டேன்.\n\n"
                    "உடனடி உழவியல் மேலாண்மை முறைகள்:\n"
                    "• **வயல் தூய்மை**: தீவிரமாக கருகிய மற்றும் உதிர்ந்த இலைகளைச் சேகரித்து பாதுகாப்பாக அழிக்கவும்.\n"
                    "• **வடிகால் மேலாண்மை**: மழைக்காலங்களில் பாத்திகளில் நீர் தேங்காமல் வடிகால் வசதியை உறுதி செய்யவும்.\n"
                    "• **காற்றோட்டம்**: செடிகளுக்கிடையே சூரிய ஒளியும் காற்றோட்டமும் சீராகக் கிடைக்க போதிய இடைவெளி விடவும்.\n"
                    "• **சீரான உரமிடுதல்**: அளவுக்கு அதிகமான தழைச்சத்து (Nitrogen) உரங்களைத் தவிர்க்கவும்."
                )
            return (
                "Chemical treatment should be based on current approved product labels and local agricultural-extension (TNAU/ICAR/KVK) recommendations for turmeric Leaf Blotch (Taphrina maculans). I won't guess an unverified pesticide or dosage.\n\n"
                "For immediate non-chemical and cultural management:\n"
                "• Field sanitation: Collect and safely destroy heavily scorched, blighted leaf debris to reduce inoculum.\n"
                "• Moisture control: Ensure proper ridge drainage and eliminate standing furrow water during rainy periods.\n"
                "• Canopy aeration: Maintain adequate row spacing to improve sunlight penetration and air circulation.\n"
                "• Balanced nutrition: Avoid excessive nitrogenous fertilizers that encourage soft, disease-susceptible foliage.\n\n"
                "Consult local TNAU / KVK agricultural extension specialists for registered fungicides."
            )

        else:
            if is_tamil:
                return (
                    f"மஞ்சள் {disease_target} நோய்க்கான வேதியியல் பூஞ்சைக்கொல்லி/பூச்சிக்கொல்லி சிகிச்சை முறைகள் மத்திய/மாநில அரசு அங்கீகரித்த லேபிள் மற்றும் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU/KVK) பரிந்துரைகளின் அடிப்படையில் மட்டுமே அமைய வேண்டும். தவறான பூச்சிக்கொல்லி அல்லது மருந்தளவை நான் யூகிக்க மாட்டேன்.\n\n"
                    f"உடனடி வயல்வெளி மேலாண்மை முறைகள்:\n"
                    f"• தொடர் கள ஆய்வு: இலைகளின் அடிப்பகுதியை அடிக்கடி ஆய்வு செய்து நோய் பரவலைக் கண்காணிக்கவும்.\n"
                    f"• பாதிக்கப்பட்ட இலைகளை அகற்றுதல்: தீவிரமாக பாதிக்கப்பட்ட இலைகளை அகற்றி வயல் தூய்மையைப் பேணவும்.\n"
                    f"• ஈரப்பதக் கட்டுப்பாடு: இலைகளில் நீர் தேங்குவதைத் தவிர்த்து, பாத்திகளில் நல்ல வடிகால் வசதி ஏற்படுத்தவும்.\n"
                    f"• காற்றோட்டம்: செடிகளுக்கு இடையே போதிய இடைவெளி விட்டு காற்றோட்டத்தை அதிகரிக்கவும்.\n\n"
                    f"உங்கள் மாவட்டம் அல்லது பகுதியைக் கூறினால், அருகிலுள்ள அரசு வேளாண் விரிவாக்க வழிகாட்டலைத் தொடர்பு கொள்ள உதவ முடியும்."
                )
            return (
                f"Chemical treatment should be based on the current approved label and local agricultural-extension recommendation for turmeric {disease_target}. I won't guess a pesticide or dosage.\n\n"
                f"For immediate management, focus on:\n"
                f"• Regular scouting: Inspect lower canopy leaf surfaces frequently for early disease signs.\n"
                f"• Field sanitation: Carefully remove and safely destroy severely affected diseased material where appropriate.\n"
                f"• Reducing leaf wetness: Avoid unnecessary overhead wetness and maintain good ridge drainage.\n"
                f"• Improving canopy airflow: Ensure adequate plant spacing to allow ventilation through foliage.\n\n"
                f"If you tell me your location/district, I can point you toward the relevant official agricultural guidance."
            )

    # -------------------------------------------------------------
    # 7. SCAN_RESULT (Why did my scan / Confidence / OOD)
    # -------------------------------------------------------------
    if intent == "SCAN_RESULT":
        has_analyzed = bool(app_context and (app_context.get("has_analyzed_image") or app_context.get("hasAnalyzedImage") or app_context.get("prediction") or app_context.get("disease")))
        img = (app_context.get("image_result") or app_context.get("imageResult") or app_context) if (has_analyzed and isinstance(app_context, dict)) else None
        if img and (img.get("disease") or img.get("prediction") or img.get("is_ood") or img.get("ood_status")):
            disease = img.get("disease") or img.get("prediction") or "Unknown"
            conf_val = img.get("confidence", 95.0)
            conf_str = f"{conf_val * 100:.1f}%" if isinstance(conf_val, (int, float)) and conf_val <= 1.0 else f"{conf_val}%"
            is_ood = bool(img.get("is_ood") or img.get("isOod") or False)
            ood = img.get("ood_status") or img.get("oodStatus") or ("OOD_REJECTED" if is_ood else "IN_DOMAIN")

            if is_ood or ood in ["OOD_REJECTED", "VERIFIER_REJECTED"] or "reject" in normalized:
                if is_tamil:
                    return (
                        "⚠️ உங்கள் புகைப்படம் **Out-of-Domain (OOD)** பாதுகாப்பு அமைப்பால் நிராகரிக்கப்பட்டது.\n\n"
                        "இது மஞ்சள் இலைக்கான தெளிவான காட்சி அமைப்பைக் கொண்டிருக்கவில்லை. தயவுசெய்து நல்ல வெளிச்சத்தில் ஒரு மஞ்சள் இலையை மட்டும் தெளிவாக படம் எடுத்து மீண்டும் ஸ்கேன் செய்யவும்."
                    )
                return (
                    "⚠️ Your image was flagged by the **Out-of-Domain (OOD) safeguard** as non-turmeric or unclear.\n\n"
                    "Curcuma's Stage-1 MobileNetV3 verifier and Stage-2 Mahalanobis gate (threshold tau = 63.10) reject non-turmeric objects to prevent false disease predictions."
                )

            if disease in ["Healthy", "healthy"]:
                if is_tamil:
                    return (
                        f"🍃 உங்கள் இலை ஸ்கேன் முடிவு **Healthy (ஆரோக்கியமானது)** என **{conf_str}** நம்பிக்கை மதிப்புடன் கணிக்கப்பட்டுள்ளது.\n\n"
                        f"Curcuma AI மாடல்கள் (EfficientNet-B0 + MobileNetV2) இலையில் நோய் அல்லது பூச்சித் தாக்குதலின் அறிகுறிகள் எதுவுமின்றி இலைப்பரப்பு சீரான பச்சை நிறத்துடன் ஆரோக்கியமாக இருப்பதை உறுதி செய்துள்ளன.\n\n"
                        f"பயிரின் நலம் தொடர வாராந்திர கள ஆய்வைத் தொடரவும்."
                    )
                return (
                    f"🍃 Your scan was classified as **Healthy** with **{conf_str}** confidence.\n\n"
                    f"The AI dual-model ensemble (EfficientNet-B0 + MobileNetV2) identified normal, vibrant green foliage with uniform leaf surface and no detectable disease lesions or pest damage.\n\n"
                    f"Healthy scans indicate strong crop vigor at the moment of capture. Continue routine weekly monitoring to maintain crop health."
                )

            elif disease in ["Aphids", "aphids", "Aphid", "aphid"]:
                if is_tamil:
                    return (
                        f"🍃 உங்கள் இலை ஸ்கேன் முடிவு **Aphids (அசுவினி)** என **{conf_str}** நம்பிக்கை மதிப்புடன் கணிக்கப்பட்டுள்ளது.\n\n"
                        f"Curcuma AI மாடல்கள் (EfficientNet-B0 + MobileNetV2) இலையில் உள்ள அசுவினி பூச்சிக் கூட்டங்கள் அல்லது இலைச் சுருக்கம் போன்ற அறிகுறிகளின் அடிப்படையில் இந்த கணிப்பை வழங்கியுள்ளன.\n\n"
                        f"கூடுதல் விவரங்களுக்கு Scan Leaf பக்கத்தில் உள்ள 'Why this result?' பகுதியை பார்க்கவும்."
                    )
                return (
                    f"🍃 Your scan was classified as **Aphids** with **{conf_str}** confidence.\n\n"
                    f"The classification is based on visual patterns detected by Curcuma's dual-model ensemble (EfficientNet-B0 + MobileNetV2), identifying characteristic aphid clusters, foliar distortion, or honeydew residue.\n\n"
                    f"Open 'Why this result?' on your result page for the full probability distribution and feature breakdown."
                )

            elif disease in ["Blotch", "Leaf Blotch", "blotch", "leaf blotch"]:
                if is_tamil:
                    return (
                        f"🍃 உங்கள் இலை ஸ்கேன் முடிவு **Leaf Blotch (இலைக்கருகல்)** என **{conf_str}** நம்பிக்கை மதிப்புடன் கணிக்கப்பட்டுள்ளது.\n\n"
                        f"Curcuma AI மாடல்கள் (EfficientNet-B0 + MobileNetV2) இலையில் உள்ள அடர் பழுப்பு நிற கருகிய திட்டுகளின் அடிப்படையில் இந்த கணிப்பை வழங்கியுள்ளன.\n\n"
                        f"கூடுதல் விவரங்களுக்கு Scan Leaf பக்கத்தில் உள்ள 'Why this result?' பகுதியை பார்க்கவும்."
                    )
                return (
                    f"🍃 Your scan was classified as **Leaf Blotch** with **{conf_str}** confidence.\n\n"
                    f"The classification is based on visual patterns detected by Curcuma's dual-model ensemble (EfficientNet-B0 + MobileNetV2), identifying characteristic reddish-brown coalescing scorched patches on the leaf lamina.\n\n"
                    f"Open 'Why this result?' on your result page for the full probability distribution and feature breakdown."
                )

            else:
                if is_tamil:
                    return (
                        f"🍃 உங்கள் இலை ஸ்கேன் முடிவு **{disease}** என **{conf_str}** நம்பிக்கை மதிப்புடன் கணிக்கப்பட்டுள்ளது.\n\n"
                        f"இந்த கணிப்பு EfficientNet-B0 மற்றும் MobileNetV2 மாடல்களின் கூட்டமைப்பு மூலம் கண்டறியப்பட்ட இலை அறிகுறிகளின் அடிப்படையில் அமைந்தது.\n\n"
                        f"கூடுதல் விவரங்களுக்கு Scan Leaf பக்கத்தில் உள்ள 'Why this result?' பகுதியை பார்க்கவும்."
                    )
                return (
                    f"🍃 Your scan was classified as **{disease}** with **{conf_str}** confidence.\n\n"
                    f"The classification is based on visual patterns detected by Curcuma's dual-model ensemble (EfficientNet-B0 + MobileNetV2).\n\n"
                    f"Open 'Why this result?' on your result page for the full probability distribution and feature breakdown."
                )
        else:
            if is_tamil:
                return (
                    "📷 இந்த அமர்வில் இதுவரை இலை ஸ்கேன் செய்யப்படவில்லை.\n\n"
                    "**Scan Leaf** பகுதிக்குச் சென்று மஞ்சள் இலைப் புகைப்படத்தைப் பதிவேற்றி நேரலை கணிப்பைப் பெறவும்."
                )
            return (
                "📷 No leaf scan has been run in your active session yet.\n\n"
                "You can use **Scan Leaf** to upload or photograph a turmeric leaf for real-time AI classification."
            )

    # -------------------------------------------------------------
    # 8. FIELD_CONDITIONS (Field Check Page & Environmental Inputs)
    # -------------------------------------------------------------
    if intent == "FIELD_CONDITIONS":
        if is_tamil:
            return (
                "🌱 **TurmeriCare கள ஆய்வு (Field Check) வழிகாட்டி:**\n\n"
                "• மேல் மெனுவில் உள்ள **Field Check** பக்கத்தைத் திறக்கவும்.\n"
                "• உங்கள் வயலின் உண்மையான அளவீடுகளை உள்ளிடலாம்:\n"
                "  - வெப்பநிலை (°C) மற்றும் காற்றின் ஈரப்பதம் (%)\n"
                "  - மண் ஈரப்பதம் (%) மற்றும் மண்ணின் pH அளவு\n"
                "  - இலை ஈரப்பதம் (Leaf Wetness hours) மற்றும் மழைப்பொழிவு (mm)\n"
                "  - காற்றின் வேகம் (km/h) மற்றும் சூரிய ஒளி நேரம்\n\n"
                "• இந்த அளவீடுகளின் அடிப்படையில் கணினி சுற்றுச்சூழல் நோய் அபாயக் குறியீட்டை (Low, Moderate, High, Severe) உடனுக்குடன் கணக்கிட்டு, இலைப்புள்ளி அல்லது இலைக்கருகல் நோய் உருவாகும் சாத்தியக்கூறுகளை எச்சரிக்கும்."
            )
        return (
            "🌱 **TurmeriCare Field Check Guide:**\n\n"
            "• Open the **Field Check** page (/field-conditions) from the top navigation bar.\n"
            "• You can enter or adjust your field's current environmental parameters:\n"
            "  - Ambient Temperature (°C) and Relative Humidity (%)\n"
            "  - Soil Moisture (%) and Soil pH\n"
            "  - Leaf Wetness duration (hours) and Rainfall (mm)\n"
            "  - Wind Speed (km/h) and Sunlight Hours\n\n"
            "• The system immediately computes the Environmental Disease Risk Index (Low, Moderate, High, Severe) to alert you if microclimate conditions favor Leaf Spot or Blotch formation."
        )

    # -------------------------------------------------------------
    # 9. ENVIRONMENT / WEATHER (Field Risk & Weather)
    # -------------------------------------------------------------
    if intent == "ENVIRONMENT" and any(k in normalized for k in ["my field", "current risk", "weather today", "field risk", "observe", "என் வயல்", "தற்போதைய அபாயம்"]):
        if app_context and (app_context.get("env_parameters") or app_context.get("env_risk_result")):
            loc = app_context.get("selected_location", {})
            loc_name = loc.get("name", "Tamil Nadu")
            risk = (app_context.get("env_risk_result") or {}).get("risk_level") or (app_context.get("env_risk_result") or {}).get("riskLevel", "Moderate")
            temp = (app_context.get("env_parameters") or {}).get("temperature", 28)
            hum = (app_context.get("env_parameters") or {}).get("humidity", 78)

            if is_tamil:
                return (
                    f"📍 **தற்போதைய கள நிலை ({loc_name}):**\n\n"
                    f"• வெப்பநிலை: {temp}°C | காற்றின் ஈரப்பதம்: {hum}%\n"
                    f"• கணக்கிடப்பட்ட சுற்றுச்சூழல் அபாயம்: **{risk}**\n\n"
                    f"14 நாள் வானிலை முன்னறிவிப்பை **Weather & Risk** பக்கத்தில் பார்க்கலாம்."
                )
            return (
                f"📍 **Current Field Status ({loc_name}):**\n\n"
                f"• Temperature: {temp}°C | Relative Humidity: {hum}%\n"
                f"• Computed Environmental Risk: **{risk}**\n\n"
                f"Explore hourly trends and 14-day forecasts in **Weather & Risk**."
            )

    # -------------------------------------------------------------
    # 10. Use retrieved RAG chunks for symptoms, formation, definitions, AI, IoT, General
    # -------------------------------------------------------------
    if retrieved_chunks:
        primary_chunk = retrieved_chunks[0]
        content = primary_chunk.get(f"content_{'ta' if is_tamil else 'en'}", primary_chunk["content_en"])

        lines = [line.strip() for line in content.split("\n") if line.strip()]
        selected_lines = lines[:5]
        summary = "\n\n".join(selected_lines)

        emoji = "🌱"
        if primary_chunk["category"] == "treatment_management":
            emoji = "🛡️"
        elif primary_chunk["category"] in ["disease_definition", "disease_symptoms", "disease_formation", "diseases"]:
            emoji = "🍃"
        elif primary_chunk["category"] == "environment":
            emoji = "🌦️"
        elif primary_chunk["category"] == "project":
            emoji = "🧠"
        elif primary_chunk["category"] == "hardware":
            emoji = "📡"

        return f"{emoji} {summary}"

    if is_tamil:
        return (
            "🌱 நான் மஞ்சள் (*Curcuma longa*) பயிர் நலம், இலை நோய்கள், கள வானிலை மற்றும் Curcuma செயலி வழிகாட்டலில் உதவ முடியும்.\n\n"
            "மஞ்சள் இலை நோய்கள், வளர்ச்சி நிலைகள் அல்லது ஸ்கேன் முடிவுகள் குறித்து கேளுங்கள்!"
        )
    return (
        "🌱 I specialize in Turmeric (*Curcuma longa*) crop health, disease diagnostics, weather risks, and Curcuma app guidance.\n\n"
        "Ask me anything about turmeric leaves, diseases (Leaf Spot, Blotch, Aphids), or your scan results!"
    )


def generate_chat_response(
    user_message: str,
    conversation_history: List[Dict[str, str]],
    language: str = "en",
    app_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Optimized 100% Local Generative Response Pipeline:
    1. Multi-signal Intent Classification
    2. Check static LRU cache for immediate response on frequent general queries
    3. Fast targeted RAG Retrieval aligned with intent (zero RAG for greetings/casual/out-of-domain)
    4. Targeted context building (omits irrelevant telemetry)
    5. Ollama invocation with dynamic token budget (or fast direct handler)
    6. Deterministic RAG fallback if Ollama unreachable
    7. Dynamic context-aware follow-up suggestion generation
    8. Returns granular latency profiling telemetry
    """
    start_time = time.perf_counter()

    # Step 1: Intent classification
    intent = classify_query_intent(
        user_message,
        has_scan_context=bool(app_context and app_context.get("has_analyzed_image"))
    )

    # Step 2: Check in-memory static cache
    cache_key = _get_cache_key(user_message, language)
    if _is_cacheable(user_message, conversation_history, app_context):
        cached_item = _STATIC_QUERY_CACHE.get(cache_key)
        if cached_item and (time.time() - cached_item["timestamp"]) < _CACHE_TTL_SECONDS:
            res = dict(cached_item["data"])
            res["response_latency_ms"] = round((time.perf_counter() - start_time) * 1000, 2)
            res["cached"] = True
            res["intent"] = intent
            # Re-compute dynamic follow-ups based on history length
            res["suggested_follow_ups"] = generate_dynamic_follow_ups(
                user_message, res.get("reply", ""), intent, app_context, conversation_history, language
            )
            return res

    # Step 3: Intent-Aligned RAG Retrieval (Zero RAG for greeting/casual/out-of-domain/clarification)
    rag_t0 = time.perf_counter()
    recent_context_text = " ".join([m.get("text", "") for m in (conversation_history or [])[-2:]])
    combined_query = f"{recent_context_text} {user_message}".strip() if recent_context_text else user_message
    retrieved_chunks = retrieve_relevant_knowledge(combined_query, language=language, top_k=2, intent=intent, app_context=app_context)
    rag_used = len(retrieved_chunks) > 0
    rag_time_ms = round((time.perf_counter() - rag_t0) * 1000, 2)

    # Step 4: Targeted Live Context & Prompt Construction
    prompt_t0 = time.perf_counter()
    app_context_str = format_live_app_context(app_context, user_query=user_message, language=language)
    live_context_used = bool(app_context_str.strip())
    system_instruction = build_system_instruction(retrieved_chunks, app_context_str, language=language, intent=intent)
    prompt_build_ms = round((time.perf_counter() - prompt_t0) * 1000, 2)

    # Step 5: Fast direct response for greetings/casual/out-of-domain to eliminate latency
    if intent in ["GREETING", "CASUAL", "OUT_OF_DOMAIN"]:
        reply_text = _synthesize_local_rag_response(user_message, retrieved_chunks, app_context, language, intent=intent)
        total_latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        follow_ups = generate_dynamic_follow_ups(
            user_message, reply_text, intent, app_context, conversation_history, language
        )
        return {
            "reply": reply_text,
            "category": "greeting" if intent == "GREETING" else ("casual" if intent == "CASUAL" else "out_of_domain"),
            "intent": intent,
            "suggested_follow_ups": follow_ups,
            "generation_engine": "fast_intent_handler",
            "ollama_model": None,
            "rag_context_used": False,
            "live_session_context_used": False,
            "response_latency_ms": total_latency_ms,
            "rag_time_ms": rag_time_ms,
            "prompt_build_ms": prompt_build_ms,
            "ollama_time_ms": 0.0,
            "prompt_tokens": 0,
            "eval_tokens": 0,
            "fallback_occurred": False,
            "cached": False
        }

    # Step 6: Query Local Ollama
    ollama_info = check_local_ollama()
    reply_text = None
    generation_engine = "local_rag_fallback"
    active_model = None
    fallback_occurred = False
    eval_tokens = 0
    prompt_tokens = 0
    ollama_time_ms = 0.0

    token_budget = determine_token_budget(user_message, has_live_context=live_context_used, intent=intent)

    if ollama_info["is_available"] and ollama_info["active_model"]:
        active_model = ollama_info["active_model"]
        try:
            reply_text, eval_tokens, prompt_tokens, ollama_time_ms = _call_local_ollama(
                system_instruction=system_instruction,
                conversation_history=conversation_history,
                user_message=user_message,
                host=ollama_info["host"],
                model=active_model,
                num_predict=token_budget
            )
            if reply_text:
                generation_engine = "ollama"
        except Exception as e:
            print(f"[AskCurcuma Local LLM] Ollama call error: {e}")
            reply_text = None
            fallback_occurred = True

    if not reply_text:
        # Local RAG Synthesis
        reply_text = _synthesize_local_rag_response(user_message, retrieved_chunks, app_context, language, intent=intent)
        generation_engine = "local_rag_fallback"
        active_model = None
        if ollama_info["is_available"]:
            fallback_occurred = True

    total_latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    # Step 7: Dynamic context-aware follow-up suggestions
    primary_category = retrieved_chunks[0]["category"] if retrieved_chunks else ("general" if not intent.startswith("GREET") else "greeting")
    follow_ups = generate_dynamic_follow_ups(
        user_message, reply_text, intent, app_context, conversation_history, language
    )

    result = {
        "reply": reply_text,
        "category": primary_category,
        "intent": intent,
        "suggested_follow_ups": follow_ups,
        "generation_engine": generation_engine,
        "ollama_model": active_model,
        "rag_context_used": rag_used,
        "live_session_context_used": live_context_used,
        "response_latency_ms": total_latency_ms,
        "rag_time_ms": rag_time_ms,
        "prompt_build_ms": prompt_build_ms,
        "ollama_time_ms": round(ollama_time_ms, 2),
        "prompt_tokens": prompt_tokens,
        "eval_tokens": eval_tokens,
        "fallback_occurred": fallback_occurred,
        "cached": False
    }

    # Cache if valid static query
    if generation_engine == "ollama" and _is_cacheable(user_message, conversation_history, app_context):
        if len(_STATIC_QUERY_CACHE) >= _MAX_CACHE_ENTRIES:
            _STATIC_QUERY_CACHE.pop(next(iter(_STATIC_QUERY_CACHE)))
        _STATIC_QUERY_CACHE[cache_key] = {
            "timestamp": time.time(),
            "data": dict(result)
        }

    return result
