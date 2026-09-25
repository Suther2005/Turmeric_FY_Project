"""
Ask Curcuma - 10 Test Questions Evaluation against Local Ollama Pipeline
========================================================================
Executes the 10 required queries through POST http://127.0.0.1:8000/api/chat
Records: query, language, generation engine, Ollama model name, RAG context used,
live session context used, response latency (ms), and fallback status.
"""

import urllib.request
import json
import time

API_URL = "http://127.0.0.1:8000/api/chat"

TEST_QUERIES = [
    {
        "id": 1,
        "query": "What is turmeric?",
        "language": "en",
        "history": [],
        "app_context": None
    },
    {
        "id": 2,
        "query": "What is Curcuma longa?",
        "language": "en",
        "history": [],
        "app_context": None
    },
    {
        "id": 3,
        "query": "What is Leaf Spot?",
        "language": "en",
        "history": [],
        "app_context": None
    },
    {
        "id": 4,
        "query": "How is Leaf Blotch different from Leaf Spot?",
        "language": "en",
        "history": [],
        "app_context": None
    },
    {
        "id": 5,
        "query": "What are Aphids?",
        "language": "en",
        "history": [],
        "app_context": None
    },
    {
        "id": 6,
        "query": "Why does humidity matter in turmeric farming?",
        "language": "en",
        "history": [],
        "app_context": None
    },
    {
        "id": 7,
        "query": "Why did my scan show this?",
        "language": "en",
        "history": [],
        "app_context": {
            "has_analyzed_image": True,
            "image_result": {
                "disease": "Leaf Spot",
                "confidence": 0.962,
                "ood_status": "IN_DOMAIN",
                "mahalanobis_distance": 24.8
            },
            "selected_location": {"name": "Erode, Tamil Nadu"},
            "env_parameters": {"temperature": 29.5, "humidity": 82.0}
        }
    },
    {
        "id": 8,
        "query": "What does Mahalanobis distance mean in Curcuma?",
        "language": "en",
        "history": [],
        "app_context": None
    },
    {
        "id": 9,
        "query": "மஞ்சள் பயிரில் இலைக்கருகல் நோயை எவ்வாறு கண்டறிவது?",
        "language": "ta",
        "history": [],
        "app_context": None
    },
    {
        "id": 10,
        "query": "How do I identify it on my leaf?",
        "language": "en",
        "history": [
            {"sender": "user", "text": "What is Leaf Spot?"},
            {"sender": "bot", "text": "Leaf spot on turmeric causes small circular to irregular brown spots with greyish centers."}
        ],
        "app_context": None
    }
]

def run_tests():
    print(f"Connecting to {API_URL}...", flush=True)
    results = []

    for item in TEST_QUERIES:
        print(f"\n[{item['id']}/10] Testing: '{item['query']}' ({item['language']})", flush=True)
        payload = {
            "message": item["query"],
            "conversation_history": item["history"],
            "language": item["language"],
            "app_context": item["app_context"]
        }

        start_t = time.perf_counter()
        req = urllib.request.Request(
            API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=120.0) as resp:
                elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
                data = json.loads(resp.read().decode("utf-8"))
                
                res_record = {
                    "id": item["id"],
                    "query": item["query"],
                    "language": item["language"],
                    "engine": data.get("generation_engine"),
                    "ollama_model": data.get("ollama_model"),
                    "rag_context_used": data.get("rag_context_used"),
                    "live_session_context_used": data.get("live_session_context_used"),
                    "client_latency_ms": elapsed_ms,
                    "server_latency_ms": data.get("response_latency_ms"),
                    "fallback_occurred": data.get("fallback_occurred"),
                    "reply": data.get("reply"),
                    "category": data.get("category"),
                    "suggested_follow_ups": data.get("suggested_follow_ups")
                }
                results.append(res_record)

                print(f"  -> Engine: {res_record['engine']} | Model: {res_record['ollama_model']} | Latency: {elapsed_ms}ms | Fallback: {res_record['fallback_occurred']}", flush=True)
                print(f"  -> Reply snippet: {res_record['reply'][:120]}...", flush=True)
        except Exception as e:
            print(f"  -> ERROR: {e}", flush=True)
            results.append({
                "id": item["id"],
                "query": item["query"],
                "error": str(e)
            })

    # Save results to json
    with open("chat_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("\nResults successfully saved to chat_test_results.json", flush=True)

if __name__ == "__main__":
    run_tests()
