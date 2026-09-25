"""
Curcuma RAG (Retrieval-Augmented Generation) & Context Builder
=============================================================
TurmeriCare-Specific Domain RAG and Context Construction Engine.
Strictly grounds responses in verified Curcuma project facts,
authoritative turmeric (Curcuma longa) agronomic knowledge, and live application telemetry.
"""

import re
from typing import List, Dict, Any, Optional
from .knowledge_base import KNOWLEDGE_CHUNKS



CANONICAL_DISEASES = ["Aphids", "Blotch", "Healthy", "Leaf Spot", "Non-Turmeric / Out-of-Domain"]


def normalize_disease_name(text: Optional[str]) -> Optional[str]:
    """
    Canonical disease normalizer:
    Maps variations to one of the 4 canonical classes or Non-Turmeric:
    - 'Aphids'
    - 'Blotch'
    - 'Healthy'
    - 'Leaf Spot'
    - 'Non-Turmeric / Out-of-Domain'
    """
    if not text:
        return None
    t = text.lower().strip()
    # Check Blotch variations first ("leaf blotch", "blotch", "taphrina", "இலைக்கருகல்", "கருகல்")
    if any(k in t for k in ["blotch", "taphrina", "இலைக்கருகல்", "கருகல்"]):
        return "Blotch"
    if any(k in t for k in ["aphid", "aphids", "aphis", "அசுவினி"]):
        return "Aphids"
    if any(k in t for k in ["leaf spot", "spot", "colletotrichum", "இலைப்புள்ளி", "புள்ளி"]):
        return "Leaf Spot"
    if any(k in t for k in ["healthy", "ஆரோக்கிய"]):
        return "Healthy"
    if any(k in t for k in ["non-turmeric", "out_of_domain", "ood", "out-of-domain"]):
        return "Non-Turmeric / Out-of-Domain"
    return None


def classify_query_intent(query: str, has_scan_context: bool = False) -> str:
    """
    TurmeriCare-specific intent classifier with strict 4-class disease query priority:
    1. GREETING (hi, hello, hey, vanakkam, வணக்கம், etc.)
    2. CASUAL (thanks, okay, cool, bye, etc.)
    3. OUT_OF_DOMAIN (non-turmeric crops like tomato, apple, cotton, or unrelated non-agri topics)
    4. FIELD_CONDITIONS (check field conditions, field check page, soil moisture, etc.)
    5. EXPLICIT DISEASE DETECTION & ROUTING (Blotch, Aphids, Leaf Spot, Healthy)
    6. SCAN_RESULT (why did my scan show this, scan result, confidence, ood, verifier, etc.)
    7. TREATMENT_MANAGEMENT (pesticide, control, treat, spray, dosage, manage for turmeric diseases)
    8. ENVIRONMENT (humidity, rain, weather, temperature, wetness, risk for turmeric)
    9. RECOMMENDATION (what should i do, what to monitor, maintain crop health)
    10. PROJECT_TECHNICAL (accuracy, efficientnet, mobilenet, mahalanobis, verifier)
    11. HARDWARE_APP_HELP (esp32, dht22, sensors, how to use app, navigation)
    12. GENERAL_TURMERIC (strictly for what is turmeric, curcuma longa, rhizome, growth stages, harvest)
    13. CLARIFICATION (unclear input with no agricultural domain context)
    """
    q = query.lower().strip()

    # 1. GREETING
    greeting_patterns = [
        "hi", "hello", "hey", "vanakkam", "வணக்கம்", "namaste", "good morning",
        "good afternoon", "good evening", "hi bro", "hello bot", "hey curcuma", "hola"
    ]
    if q in greeting_patterns or any(q.startswith(g + " ") for g in ["hi", "hello", "hey", "vanakkam", "வணக்கம்"]):
        if not any(k in q for k in ["spot", "blotch", "aphid", "pesticide", "weather", "humidity", "scan", "turmeric", "manjal"]):
            return "GREETING"

    # 2. CASUAL / COURTESY
    casual_patterns = [
        "thanks", "thank you", "thank you so much", "thx", "okay", "ok", "k", "great",
        "awesome", "cool", "good", "fine", "bye", "goodbye", "see you", "நன்றி", "சரி", "மிக்க நன்றி"
    ]
    if q in casual_patterns or q.rstrip("!.?") in casual_patterns:
        return "CASUAL"

    # 3. OUT_OF_DOMAIN / NON-TURMERIC CROPS
    non_turmeric_crops = [
        "tomato", "potato", "apple", "cotton", "rice", "wheat", "banana", "sugarcane",
        "corn", "maize", "onion", "chilli", "chili", "brinjal", "eggplant", "grape", "mango",
        "தக்காளி", "நெல்", "கரும்பு", "பருத்தி", "வாழை", "வெங்காயம்", "மிளகாய்", "கத்தரி", "மாங்காய்"
    ]
    if any(c in q for c in non_turmeric_crops) and not any(t in q for t in ["turmeric", "curcuma", "manjal", "மஞ்சள்"]):
        return "OUT_OF_DOMAIN"

    unrelated_queries = [
        "who are you", "who made you", "write python", "write code", "bitcoin", "crypto",
        "stock price", "sing a song", "tell me a joke", "president of", "capital of"
    ]
    if any(u in q for u in unrelated_queries):
        return "OUT_OF_DOMAIN"

    # 4. FIELD CONDITIONS & FIELD CHECK
    field_cond_signals = [
        "field condition", "field conditions", "field check", "check my field conditions",
        "check field conditions", "enter field conditions", "record field conditions",
        "where can i check field conditions", "what are field conditions",
        "how do i check my field", "how can i check my field", "how to check my field",
        "check temperature and humidity in my field", "enter field temperature",
        "enter soil moisture", "what can i check in field check", "what should i check in the field",
        "check in the field", "soil moisture", "soil ph", "leaf wetness",
        "field check page", "field conditions page", "enter environmental",
        "வயல் நிலைமை", "வயல் நிலைமைகளை", "கள ஆய்வு", "கள நிலை", "மண் ஈரப்பதம்",
        "வயல் நிலைமைகளை எவ்வாறு சோதிப்பது", "வயலில் எவற்றை ஆய்வு செய்ய வேண்டும்",
        "வெப்பநிலை மற்றும் ஈரப்பதம்"
    ]
    if any(k in q for k in field_cond_signals):
        return "FIELD_CONDITIONS"

    # 5. EXPLICIT DISEASE / 4-CLASS DETECTION (PRIORITY OVER GENERAL TURMERIC)
    detected_disease = normalize_disease_name(q)
    has_disease_token = (
        detected_disease is not None or
        any(k in q for k in [
            "leaf spot", "leaf blotch", "blotch", "aphid", "aphids", "healthy", "healthy leaf",
            "colletotrichum", "taphrina", "aphis", "diseases affect", "disease affect", "diseases of turmeric",
            "what diseases", "turmeric diseases", "இலைப்புள்ளி", "இலைக்கருகல்", "அசுவினி", "ஆரோக்கிய", "தாக்கும் நோய்கள்"
        ])
    )

    if has_disease_token:
        # Check treatment/pesticide sub-intent
        treatment_signals = [
            "pesticide", "fungicide", "insecticide", "chemical", "spray", "dosage", "dose",
            "medicine", "cure", "treat", "treatment", "manage", "management", "control",
            "prevent", "prevention", "prevent from spreading", "how to stop", "how do i control",
            "how can i control", "how to treat", "how do i treat", "how to manage", "how do i manage",
            "how can i manage", "eradicate", "sticky trap", "sticky traps", "yellow trap", "yellow sticky traps",
            "what can i use", "can i use", "what to use", "use for", "apply for",
            "மருந்து", "பூச்சிக்கொல்லி", "பூஞ்சைக்கொல்லி", "கட்டுப்பாடு", "கட்டுப்படுத்த",
            "மேலாண்மை", "சிகிச்சை", "தெளிக்க", "தடுக்க", "தீர்வு", "தடுப்பு", "ஒட்டும் பொறி"
        ]
        if any(k in q for k in treatment_signals):
            if has_scan_context and any(k in q for k in ["scan", "detected", "after", "now", "what should i do", "what to do"]):
                return "SCAN_RESULT + TREATMENT_MANAGEMENT"
            return "TREATMENT_MANAGEMENT"

        # Check symptom/visual sub-intent
        symptom_signals = [
            "look like", "looks like", "appearance", "visual", "how to recognize", "identify",
            "how can i identify", "how to identify", "healthy leaf look", "symptom", "symptoms",
            "yellow halo", "halo", "lesion", "circular spot", "spots look", "spots appear",
            "color of spot", "recognize aphids", "recognize blotch", "recognize leaf spot",
            "identify aphids", "identify blotch", "identify leaf spot",
            "எப்படி இருக்கும்", "தோற்றம்", "அறிகுறிகள்", "அடையாளம்", "அடையாளம் காண்பது எப்படி"
        ]
        if any(k in q for k in symptom_signals):
            return "DISEASE_SYMPTOMS"

        # Check formation/biology sub-intent
        formation_signals = [
            "form", "formation", "develop", "develops", "caused by", "causes",
            "pathogen", "biology", "spore", "happen", "happens", "originate", "how does leaf spot form",
            "how does leaf blotch form", "how does blotch form", "how does blotch develop",
            "எப்படி உருவாகிறது", "காரணம்", "ஏன் ஏற்படுகிறது", "உருவாக்கம்", "உருவாகிறது"
        ]
        if any(k in q for k in formation_signals):
            return "DISEASE_FORMATION"

        # Short disease queries (e.g. "leaf blotch", "blotch", "aphids", "leaf spot", "healthy", "healthy leaf")
        # or explicit definition questions -> DISEASE_DEFINITION
        return "DISEASE_DEFINITION"

    # 6. SCAN RESULT & CONFIDENCE (with pronoun resolution if active scan exists)
    scan_signals = [
        "why did my scan", "show this", "my scan", "scan result", "last scan", "this leaf image",
        "confidence score", "why rejected", "why was my image rejected", "image rejected",
        "ood rejected", "verifier rejected", "what does this scan mean", "what does the scan mean",
        "scan mean", "scan show", "why was image rejected", "why was my scan", "why might this disease be present",
        "how should i capture the leaf", "what makes a good turmeric leaf scan", "capture the leaf",
        "எனது ஸ்கேன்", "ஸ்கேன் முடிவு", "ஏன் இந்த முடிவு", "நிராகரிப்பு", "படம் நிராகரிக்கப்பட்டது",
        "படமெடுப்பது எப்படி", "நல்ல ஸ்கேன்"
    ]
    if any(k in q for k in scan_signals):
        return "SCAN_RESULT"

    if has_scan_context:
        if any(k in q for k in ["what should i do", "what do i do", "what to do now", "what should i do now", "what now", "how can i manage it", "how to manage it", "என்ன செய்ய வேண்டும்"]):
            return "SCAN_RESULT + TREATMENT_MANAGEMENT"
        if any(k in q for k in ["why", "why this", "why did you say this", "why did you say", "what does this mean", "what does it mean", "what is this", "explain this", "ஏன்"]):
            return "SCAN_RESULT"

    # 7. GENERAL TREATMENT / MANAGEMENT (If no disease token was explicitly in query)
    gen_treatment_signals = [
        "pesticide", "fungicide", "insecticide", "chemical", "spray", "dosage", "dose",
        "medicine", "cure", "treat", "treatment", "how to treat", "how to control", "prevent disease",
        "மருந்து", "பூச்சிக்கொல்லி", "பூஞ்சைக்கொல்லி", "சிகிச்சை", "தெளிப்பு"
    ]
    if any(k in q for k in gen_treatment_signals):
        return "TREATMENT_MANAGEMENT"

    # 8. ENVIRONMENT & WEATHER
    env_signals = [
        "humidity", "rain", "rainfall", "weather", "temperature", "leaf wetness", "wetness",
        "monsoon", "climate", "wind", "environmental risk", "environmental risk index", "risk index",
        "field risk", "weather matter", "weather affect", "weather condition", "weather conditions",
        "வானிலை", "ஈரப்பதம்", "மழை", "அபாயம்", "சுற்றுச்சூழல் அபாயம்", "அபாயக் குறியீடு", "வானிலை ஏன் முக்கியம்"
    ]
    if any(k in q for k in env_signals):
        return "ENVIRONMENT"

    # 9. RECOMMENDATION & FIELD ADVICE
    rec_signals = [
        "what should i do", "advice", "recommendation", "recommendations", "field advice",
        "care tips", "how to care", "maintain crop health", "maintain health", "what should i monitor",
        "monitor in field", "what to monitor", "what should i monitor next", "what should i monitor now",
        "பரிந்துரை", "ஆலோசனை", "என்ன செய்ய வேண்டும்", "பராமரிப்பது எப்படி", "கண்காணிக்க வேண்டும்"
    ]
    if any(k in q for k in rec_signals):
        return "RECOMMENDATION"

    # 10. PROJECT TECHNICAL / AI
    project_signals = [
        "efficientnet", "mobilenet", "mobilenetv2", "mobilenetv3", "mahalanobis", "ood",
        "verifier", "accuracy", "precision", "recall", "f1", "architecture", "dataset",
        "dual-model", "soft-voting", "stage-1", "stage 1",
        "துல்லியம்", "மாடல்", "தொழில்நுட்பம்", "மாதிரி"
    ]
    if any(k in q for k in project_signals):
        return "PROJECT_TECHNICAL"

    # 11. HARDWARE & APP HELP
    hw_app_signals = [
        "esp32", "dht22", "sensor", "sensors", "capacitive", "telemetry",
        "how to use", "navigation", "scan leaf page", "history page", "field check",
        "export report", "help", "how do i scan", "how to scan a leaf", "where can i view",
        "view previous", "previous scan", "previous records",
        "சென்சார்", "பயன்படுத்துவது எப்படி", "ஸ்கேன் செய்வது எப்படி", "முந்தைய பதிவுகள்"
    ]
    if any(k in q for k in hw_app_signals):
        return "HARDWARE_APP_HELP"

    # 12. GENERAL TURMERIC (Strictly for turmeric plant / cultivation / rhizome queries)
    turmeric_signals = [
        "what is turmeric", "what is curcuma", "what is curcuma longa", "tell me about turmeric",
        "what is turmeric used for", "how is turmeric cultivated", "curcuma longa", "curcumin",
        "rhizome", "harvest", "when should i harvest", "how do i maintain", "maintain field ridges", "ridges",
        "planting", "growth stage", "growth stages", "stages of turmeric", "stages", "dap",
        "farming", "cultivation", "மஞ்சள் என்றால் என்ன", "கிழங்கு", "சாகுபடி", "பயிர்", "வளர்ச்சி நிலைகள்",
        "அறுவடை"
    ]
    if any(k in q for k in turmeric_signals) or q in ["turmeric", "curcuma", "manjal", "மஞ்சள்"]:
        return "GENERAL_TURMERIC"

    return "CLARIFICATION"


def retrieve_relevant_knowledge(
    query: str,
    language: str = "en",
    top_k: int = 2,
    intent: Optional[str] = None,
    app_context: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Retrieves the most relevant knowledge base chunks strictly aligned with classified intent
    and active leaf scan context (Aphids, Blotch, Healthy, Leaf Spot).
    Returns an EMPTY list for non-retrieval intents (GREETING, CASUAL, OUT_OF_DOMAIN, CLARIFICATION)
    or when no chunk has a positive semantic match.
    """
    if not intent:
        intent = classify_query_intent(query, has_scan_context=bool(app_context and app_context.get("has_analyzed_image")))

    # Zero RAG retrieval for Conversational / Greeting / Casual / Out-of-domain / Clarification
    if intent in ["GREETING", "CASUAL", "OUT_OF_DOMAIN", "CLARIFICATION"]:
        return []

    normalized = query.lower()
    cleaned_tokens = set(re.findall(r"\w+", normalized))

    # Determine active scan class if available
    active_scan_class = None
    if app_context and isinstance(app_context, dict):
        img = app_context.get("image_result") or app_context.get("imageResult") or app_context
        if isinstance(img, dict):
            d = img.get("disease") or img.get("prediction")
            if d:
                d_str = str(d).lower().strip()
                if "blotch" in d_str:
                    active_scan_class = "blotch"
                elif "aphid" in d_str:
                    active_scan_class = "aphid"
                elif "healthy" in d_str:
                    active_scan_class = "healthy"
                elif "spot" in d_str:
                    active_scan_class = "spot"

    scored_chunks = []
    for chunk in KNOWLEDGE_CHUNKS:
        score = 0
        chunk_cat = chunk["category"]
        chunk_id = chunk["id"]
        keywords = [k.lower() for k in chunk["keywords"]]

        # ---------------------------------------------------------
        # Intent-Driven Category Boosting & Filtering (4-Class Aware)
        # ---------------------------------------------------------
        if intent in ["TREATMENT_MANAGEMENT", "SCAN_RESULT + TREATMENT_MANAGEMENT"]:
            if chunk_cat == "treatment_management":
                score += 25
                if any(k in normalized for k in ["spot", "இலைப்புள்ளி"]) or (active_scan_class == "spot" and not any(k in normalized for k in ["blotch", "aphid", "healthy"])):
                    if "spot" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["blotch", "இலைக்கருகல்"]) or (active_scan_class == "blotch" and not any(k in normalized for k in ["spot", "aphid", "healthy"])):
                    if "blotch" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["aphid", "அசுவினி"]) or (active_scan_class == "aphid" and not any(k in normalized for k in ["spot", "blotch", "healthy"])):
                    if "aphid" in chunk_id:
                        score += 30
                elif "general" in chunk_id:
                    score += 10
            elif (active_scan_class == "healthy" or any(k in normalized for k in ["healthy", "ஆரோக்கிய"])) and chunk_id in ["disease_healthy_monitoring", "disease_healthy_definition"]:
                score += 40
            else:
                score -= 15

        elif intent == "DISEASE_SYMPTOMS":
            if chunk_cat == "disease_symptoms":
                score += 25
                if any(k in normalized for k in ["spot", "இலைப்புள்ளி"]) or (active_scan_class == "spot" and not any(k in normalized for k in ["blotch", "aphid", "healthy"])):
                    if "spot" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["blotch", "இலைக்கருகல்"]) or (active_scan_class == "blotch" and not any(k in normalized for k in ["spot", "aphid", "healthy"])):
                    if "blotch" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["aphid", "அசுவினி"]) or (active_scan_class == "aphid" and not any(k in normalized for k in ["spot", "blotch", "healthy"])):
                    if "aphid" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["healthy", "ஆரோக்கிய"]) or (active_scan_class == "healthy" and not any(k in normalized for k in ["spot", "blotch", "aphid"])):
                    if "healthy" in chunk_id:
                        score += 30
            elif chunk_cat == "disease_definition":
                score += 5
                if (active_scan_class == "healthy" or "healthy" in normalized) and "healthy" in chunk_id:
                    score += 25
            else:
                score -= 10

        elif intent == "DISEASE_FORMATION":
            if chunk_cat == "disease_formation":
                score += 25
                if any(k in normalized for k in ["spot", "இலைப்புள்ளி"]) or (active_scan_class == "spot" and not any(k in normalized for k in ["blotch", "aphid"])):
                    if "spot" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["blotch", "இலைக்கருகல்"]) or (active_scan_class == "blotch" and not any(k in normalized for k in ["spot", "aphid"])):
                    if "blotch" in chunk_id:
                        score += 30
            elif chunk_cat == "disease_definition":
                if any(k in normalized for k in ["aphid", "அசுவினி"]) and "aphid" in chunk_id:
                    score += 25
                else:
                    score += 5
            elif chunk_cat == "environment":
                score += 8
            else:
                score -= 10

        elif intent == "DISEASE_DEFINITION":
            if chunk_cat == "disease_definition":
                score += 25
                if any(k in normalized for k in ["spot", "இலைப்புள்ளி"]) or (active_scan_class == "spot" and not any(k in normalized for k in ["blotch", "aphid", "healthy"])):
                    if "spot" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["blotch", "இலைக்கருகல்"]) or (active_scan_class == "blotch" and not any(k in normalized for k in ["spot", "aphid", "healthy"])):
                    if "blotch" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["aphid", "அசுவினி"]) or (active_scan_class == "aphid" and not any(k in normalized for k in ["spot", "blotch", "healthy"])):
                    if "aphid" in chunk_id:
                        score += 30
                elif any(k in normalized for k in ["healthy", "ஆரோக்கிய"]) or (active_scan_class == "healthy" and not any(k in normalized for k in ["spot", "blotch", "aphid"])):
                    if "healthy" in chunk_id:
                        score += 35
            elif chunk_cat == "disease_symptoms":
                score += 5
            else:
                score -= 10

        elif intent == "ENVIRONMENT":
            if chunk_cat == "environment":
                score += 30
            else:
                score -= 5

        elif intent == "FIELD_CONDITIONS":
            if chunk_cat == "field_conditions":
                score += 35
            elif chunk_cat in ["environment", "app_help"]:
                score += 15
            else:
                score -= 10

        elif intent == "RECOMMENDATION":
            if active_scan_class == "healthy" or any(k in normalized for k in ["healthy", "maintain", "பராமரி"]):
                if chunk_id in ["disease_healthy_monitoring", "disease_healthy_definition"]:
                    score += 35
            elif active_scan_class == "aphid" or any(k in normalized for k in ["aphid", "அசுவினி"]):
                if "aphid" in chunk_id:
                    score += 35
            elif active_scan_class == "blotch" or any(k in normalized for k in ["blotch", "இலைக்கருகல்"]):
                if "blotch" in chunk_id:
                    score += 35
            elif active_scan_class == "spot" or any(k in normalized for k in ["spot", "இலைப்புள்ளி"]):
                if "spot" in chunk_id:
                    score += 35
            elif chunk_cat in ["treatment_management", "general_turmeric", "field_conditions"]:
                score += 20
            else:
                score -= 5

        elif intent == "PROJECT_TECHNICAL":
            if chunk_cat == "project":
                score += 30
            else:
                score -= 10

        elif intent == "HARDWARE_APP_HELP":
            if chunk_cat in ["hardware", "app_help"]:
                score += 30
            else:
                score -= 10

        elif intent == "GENERAL_TURMERIC":
            if chunk_cat == "general_turmeric":
                score += 20
                if any(k in normalized for k in ["rhizome", "stage", "dap", "வளர்ச்சி", "கிழங்கு"]) and "rhizome" in chunk_id:
                    score += 15
                elif any(k in normalized for k in ["care", "farming", "maintain", "soil", "bed", "பராமரிப்பு", "சாகுபடி"]) and "care" in chunk_id:
                    score += 15
                elif "basics" in chunk_id:
                    score += 10
            else:
                score -= 5

        # ---------------------------------------------------------
        # Keyword & Token Matching
        # ---------------------------------------------------------
        for kw in keywords:
            if kw in normalized:
                score += 8 if len(kw.split()) > 1 else 4

        for token in cleaned_tokens:
            if len(token) > 2 and token in keywords:
                score += 2

        if chunk["topic"].lower() in normalized:
            score += 6

        if score > 0:
            scored_chunks.append((score, chunk))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    if not scored_chunks:
        return []

    return [chunk for _, chunk in scored_chunks[:top_k]]


def format_live_app_context(
    app_context: Optional[Dict[str, Any]],
    user_query: str = "",
    language: str = "en"
) -> str:
    """
    Builds a targeted factual summary of active user session data only when relevant to the query.
    Omits irrelevant telemetry to minimize prompt evaluation latency.
    """
    if not app_context:
        return ""

    query_lower = user_query.lower()
    is_scan_query = any(k in query_lower for k in [
        "scan", "leaf", "result", "why did", "show this", "confidence",
        "spot", "blotch", "aphid", "ood", "reject", "predict", "detected", "what should i do",
        "நோய்", "ஸ்கேன்", "இலை", "முடிவு"
    ])
    is_env_query = any(k in query_lower for k in [
        "weather", "humidity", "risk", "temperature", "rain", "field",
        "soil", "wetness", "climate", "வானிலை", "ஈரப்பதம்", "அபாயம்", "மழை"
    ])

    sections = []

    # 1. Image Scan / Prediction Context
    if is_scan_query or not query_lower:
        has_analyzed = app_context.get("has_analyzed_image", False)
        img_result = app_context.get("image_result")
        if has_analyzed and img_result:
            disease = img_result.get("disease", "Unknown")
            conf = img_result.get("confidence")
            conf_str = f"{conf * 100:.1f}%" if isinstance(conf, (int, float)) and conf <= 1.0 else (f"{conf:.1f}%" if isinstance(conf, (int, float)) else "N/A")
            ood_status = img_result.get("ood_status", "IN_DOMAIN")
            sections.append(
                f"• USER ACTIVE SCAN: Disease='{disease}', Confidence={conf_str}, OOD_Status='{ood_status}'."
            )
            if ood_status in ["OOD_REJECTED", "VERIFIER_REJECTED"]:
                sections.append(
                    "  [OOD Safeguard rejected image as non-turmeric or out-of-distribution]."
                )

    # 2. Environmental & Weather Context
    if is_env_query:
        env_params = app_context.get("env_parameters")
        if env_params:
            temp = env_params.get("temperature", "N/A")
            hum = env_params.get("humidity", "N/A")
            rain = env_params.get("rainfall", "N/A")
            sections.append(f"• FIELD WEATHER: Temp={temp}°C, Humidity={hum}%, Rain={rain}mm.")

        env_risk = app_context.get("env_risk_result")
        if env_risk:
            risk_level = env_risk.get("risk_level") or env_risk.get("riskLevel", "Moderate")
            sections.append(f"• ENV RISK LEVEL: '{risk_level}'.")

        loc = app_context.get("selected_location") or app_context.get("selectedLocation")
        if loc:
            name = loc.get("name", "Tamil Nadu")
            sections.append(f"• LOCATION: {name}, Tamil Nadu.")

    return "\n".join(sections)


def build_system_instruction(
    retrieved_chunks: List[Dict[str, Any]],
    app_context_str: str = "",
    language: str = "en",
    intent: Optional[str] = None
) -> str:
    """
    Constructs an ultra-compact, high-precision system prompt for low-latency CPU generation.
    Strictly enforces the TurmeriCare identity, domain boundaries, and verified project grounding.
    """
    if intent == "GREETING":
        return (
            f"You are Ask Curcuma, the specialized AI assistant for TurmeriCare (Turmeric crop care). "
            f"Reply with a warm, short 1-2 sentence greeting in {'Tamil' if language == 'ta' else 'English'} "
            f"mentioning you help with turmeric cultivation, leaf diseases (Leaf Spot, Blotch, Aphids), leaf scans, weather risk, and field care."
        )

    if intent == "CASUAL":
        return (
            f"You are Ask Curcuma, a polite AI assistant for TurmeriCare. "
            f"Reply with a short polite 1 sentence acknowledgment in {'Tamil' if language == 'ta' else 'English'} "
            f"and offer assistance with turmeric crop care."
        )

    if intent == "OUT_OF_DOMAIN":
        return (
            f"You are Ask Curcuma. The user asked about a non-turmeric crop or an unrelated topic. "
            f"Politely state in {'Tamil' if language == 'ta' else 'English'} that you are specialized exclusively for "
            f"TurmeriCare — Turmeric (Curcuma longa, மஞ்சள்) crop health, disease diagnostics, leaf scans, and weather risk. "
            f"Invite them to ask about turmeric."
        )

    if intent == "CLARIFICATION":
        return (
            f"You are Ask Curcuma. The user message was unclear. "
            f"Politely ask a short 1-2 sentence clarification in {'Tamil' if language == 'ta' else 'English'}, "
            f"reminding them you specialize in Turmeric (Curcuma longa) crop care, leaf diseases, scans, weather, and field management."
        )

    knowledge_texts = []
    for chunk in retrieved_chunks[:2]:
        content = chunk.get(f"content_{language}", chunk["content_en"])
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        trimmed_content = "\n".join(lines[:5])
        knowledge_texts.append(f"[{chunk['topic']}]:\n{trimmed_content}")

    knowledge_block = "\n\n".join(knowledge_texts) if knowledge_texts else "No specific knowledge chunk retrieved."
    context_section = f"\nLIVE SESSION DATA:\n{app_context_str}\n" if app_context_str.strip() else ""

    treatment_rules = ""
    if intent in ["TREATMENT_MANAGEMENT", "SCAN_RESULT + TREATMENT_MANAGEMENT"]:
        treatment_rules = """
TREATMENT & PESTICIDE RULES:
- ANSWER THE USER'S ACTUAL QUESTION FIRST: Start directly with the management/treatment response. DO NOT start with disease symptoms or definitions.
- SAFETY RULE: NEVER invent, hallucinate, or guess pesticide brand names, chemical cocktails, dosages, spray frequencies, or application rates.
- State clearly: "Chemical treatment should be based on the currently approved label and local agricultural-extension (TNAU/ICAR/KVK) recommendations. I won't guess an unverified pesticide or dosage."
- Provide immediate non-chemical field management: regular scouting, leaf sanitation (removing severely affected foliage), reducing prolonged leaf wetness, improving ridge drainage, avoiding overhead wetting, and maintaining canopy airflow.
- Invite the user to share their location/district for local official extension guidance."""

    prompt = f"""You are Ask Curcuma, the specialized AI decision support assistant for TurmeriCare — dedicated exclusively to Turmeric (Curcuma longa) crop care, foliar diseases, and the Curcuma vision pipeline.

RULES:
1. SCOPE: Focus exclusively on Turmeric crop care, foliar diseases (Leaf Spot, Leaf Blotch, Aphids, Healthy), Curcuma ML vision pipeline, and environmental weather risk.
2. ANSWER LENGTH: 2 to 4 clear, short sentences (or bullet points). Be directly helpful and concise.
3. LANGUAGE: Reply in {'Tamil' if language == 'ta' else 'English'} naturally.
4. GROUNDING: Use the verified knowledge below. Project facts: Clean EfficientNet-B0 (99.22% accuracy, 99.25% precision, 99.22% recall, 99.23% F1), MobileNetV2, MobileNetV3 verifier (tau=0.50), Mahalanobis OOD (tau=63.10).{treatment_rules}

KNOWLEDGE BASE:
{knowledge_block}
{context_section}
Respond directly to the user message:"""
    return prompt
