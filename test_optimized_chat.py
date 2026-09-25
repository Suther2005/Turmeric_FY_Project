"""
Comprehensive Latency & Telemetry Evaluation Script for Ask Curcuma
Measures:
- /api/chat total response time
- RAG retrieval time
- Prompt/Context construction time
- Ollama execution time
- Prompt tokens
- Output completion tokens
- Caching status
- Fallback status
"""

import urllib.request
import json
import time
import statistics

API_URL = "http://127.0.0.1:8000/api/chat"

TEST_QUERIES = [
    {
        "id": 1,
        "query": "What is turmeric?",
        "language": "en",
        "history": [],
        "app_context": None,
        "type": "general"
    },
    {
        "id": 2,
        "query": "What is Leaf Spot?",
        "language": "en",
        "history": [],
        "app_context": None,
        "type": "disease"
    },
    {
        "id": 3,
        "query": "What are Aphids?",
        "language": "en",
        "history": [],
        "app_context": None,
        "type": "pest"
    },
    {
        "id": 4,
        "query": "Why does humidity matter?",
        "language": "en",
        "history": [],
        "app_context": None,
        "type": "environment"
    },
    {
        "id": 5,
        "query": "Why did my scan show this?",
        "language": "en",
        "history": [],
        "app_context": {
            "has_analyzed_image": True,
            "image_result": {
                "disease": "Leaf Spot",
                "confidence": 0.962,
                "ood_status": "IN_DOMAIN"
            },
            "selected_location": {"name": "Erode, Tamil Nadu"},
            "env_parameters": {"temperature": 29.5, "humidity": 82.0}
        },
        "type": "scan_context"
    },
    {
        "id": 6,
        "query": "What does Mahalanobis distance mean?",
        "language": "en",
        "history": [],
        "app_context": None,
        "type": "project_technical"
    },
    {
        "id": 7,
        "query": "How do I identify it on my leaf?",
        "language": "en",
        "history": [
            {"sender": "user", "text": "What is Leaf Spot?"},
            {"sender": "bot", "text": "Leaf spot causes brown spots with yellow halos on turmeric leaves."}
        ],
        "app_context": None,
        "type": "multi_turn_followup"
    },
    {
        "id": 8,
        "query": "மஞ்சள் பயிரில் இலைக்கருகல் நோயை எவ்வாறு கண்டறிவது?",
        "language": "ta",
        "history": [],
        "app_context": None,
        "type": "tamil_disease"
    },
    {
        "id": 9,
        "query": "What is Curcuma longa?",
        "language": "en",
        "history": [],
        "app_context": None,
        "type": "general_botanical"
    },
    {
        "id": 10,
        "query": "How is Leaf Blotch different from Leaf Spot?",
        "language": "en",
        "history": [],
        "app_context": None,
        "type": "disease_comparison"
    }
]

def run_benchmarks():
    print("=" * 80)
    print("STARTING ASK CURCUMA OPTIMIZED LATENCY EVALUATION")
    print("=" * 80, flush=True)

    results = []

    for item in TEST_QUERIES:
        payload = {
            "message": item["query"],
            "conversation_history": item["history"],
            "language": item["language"],
            "app_context": item["app_context"]
        }

        print(f"\n[{item['id']}/10] Query: '{item['query']}' ({item['language']}) [{item['type']}]", flush=True)
        t0 = time.perf_counter()
        req = urllib.request.Request(
            API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=60.0) as resp:
                elapsed_total = round((time.perf_counter() - t0) * 1000, 2)
                data = json.loads(resp.read().decode("utf-8"))

                rec = {
                    "id": item["id"],
                    "query": item["query"],
                    "language": item["language"],
                    "type": item["type"],
                    "total_client_ms": elapsed_total,
                    "server_latency_ms": data.get("response_latency_ms", 0.0),
                    "rag_time_ms": data.get("rag_time_ms", 0.0),
                    "prompt_build_ms": data.get("prompt_build_ms", 0.0),
                    "ollama_time_ms": data.get("ollama_time_ms", 0.0),
                    "prompt_tokens": data.get("prompt_tokens", 0),
                    "eval_tokens": data.get("eval_tokens", 0),
                    "cached": data.get("cached", False),
                    "engine": data.get("generation_engine"),
                    "model": data.get("ollama_model"),
                    "fallback_occurred": data.get("fallback_occurred", False),
                    "reply": data.get("reply", "")
                }
                results.append(rec)

                print(f"  -> Total: {rec['total_client_ms']:.0f}ms | Ollama: {rec['ollama_time_ms']:.0f}ms | RAG: {rec['rag_time_ms']:.1f}ms | Tokens (In/Out): {rec['prompt_tokens']}/{rec['eval_tokens']}", flush=True)
                print(f"  -> Reply snippet: {rec['reply'][:130]}...", flush=True)

        except Exception as e:
            print(f"  -> ERROR: {e}", flush=True)

    # Save to json
    with open("optimized_benchmark_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    latencies = [r["total_client_ms"] for r in results]
    if latencies:
        median_lat = statistics.median(latencies)
        latencies_sorted = sorted(latencies)
        p90_idx = int(len(latencies_sorted) * 0.9)
        p90_lat = latencies_sorted[min(p90_idx, len(latencies_sorted) - 1)]
        mean_lat = statistics.mean(latencies)

        print("\n" + "=" * 80)
        print("BENCHMARK SUMMARY STATISTICS")
        print("=" * 80)
        print(f"Total Queries Evaluated: {len(latencies)}")
        print(f"Mean Latency:   {mean_lat:.2f} ms ({mean_lat/1000:.2f}s)")
        print(f"Median Latency: {median_lat:.2f} ms ({median_lat/1000:.2f}s)")
        print(f"P90 Latency:    {p90_lat:.2f} ms ({p90_lat/1000:.2f}s)")
        print(f"Min Latency:    {min(latencies):.2f} ms")
        print(f"Max Latency:    {max(latencies):.2f} ms")
        print("=" * 80, flush=True)

if __name__ == "__main__":
    run_benchmarks()
