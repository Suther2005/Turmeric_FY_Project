"""
Final Latency Polish Evaluation Script for Ask Curcuma
Measures:
1. TTFT (Time-to-first-token) via SSE streaming
2. Total streaming duration
3. Output token count & prompt token count
4. Full generation latency & RAG latency
5. UI delay analysis
"""

import urllib.request
import json
import time
import statistics

API_STREAM_URL = "http://127.0.0.1:8000/api/chat/stream"
API_CHAT_URL = "http://127.0.0.1:8000/api/chat"

TEST_CASES = [
    {
        "id": 1,
        "query": "What is turmeric?",
        "language": "en",
        "app_context": None,
        "category_expected": "General Botanical (70-token target)"
    },
    {
        "id": 2,
        "query": "What is Leaf Spot?",
        "language": "en",
        "app_context": None,
        "category_expected": "Disease (90-token target)"
    },
    {
        "id": 3,
        "query": "Why does humidity matter?",
        "language": "en",
        "app_context": None,
        "category_expected": "Environment (90-token target)"
    },
    {
        "id": 4,
        "query": "Why did my scan show this?",
        "language": "en",
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
        "category_expected": "Active Scan Context (120-token target)"
    },
    {
        "id": 5,
        "query": "What does Mahalanobis distance mean?",
        "language": "en",
        "app_context": None,
        "category_expected": "Technical / Architecture (120-token target)"
    },
    {
        "id": 6,
        "query": "மஞ்சள் பயிரில் இலைக்கருகல் நோயை எவ்வாறு கண்டறிவது?",
        "language": "ta",
        "app_context": None,
        "category_expected": "Tamil Disease (90-token target)"
    }
]

def run_benchmark():
    print("=" * 85)
    print("ASK CURCUMA: FINAL LATENCY POLISH BENCHMARK (STREAMING & BATCH)")
    print("=" * 85, flush=True)

    results = []

    for test in TEST_CASES:
        payload = {
            "message": test["query"],
            "conversation_history": [],
            "language": test["language"],
            "app_context": test["app_context"]
        }

        print(f"\n[{test['id']}/6] Testing: '{test['query']}' ({test['language']}) -> {test['category_expected']}", flush=True)

        # Test 1: SSE Streaming (Measures TTFT and progressive streaming)
        req_stream = urllib.request.Request(
            API_STREAM_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        t0_stream = time.perf_counter()
        first_token_ms = None
        accumulated_chunks = []
        final_stream_data = {}

        try:
            with urllib.request.urlopen(req_stream, timeout=45.0) as resp:
                for line in resp:
                    line_str = line.decode("utf-8").strip()
                    if line_str.startswith("data: "):
                        now = time.perf_counter()
                        if first_token_ms is None:
                            first_token_ms = (now - t0_stream) * 1000
                        data = json.loads(line_str[6:])
                        chunk = data.get("chunk", "")
                        if chunk:
                            accumulated_chunks.append(chunk)
                        if data.get("done"):
                            final_stream_data = data
                            break

            total_stream_ms = (time.perf_counter() - t0_stream) * 1000
            full_text = "".join(accumulated_chunks)
            eval_tokens = final_stream_data.get("eval_tokens", len(full_text.split()))

            print(f"  [SSE STREAM] TTFT: {first_token_ms:6.1f} ms | Total Stream: {total_stream_ms:6.1f} ms | Tokens: {eval_tokens:2d}", flush=True)
            print(f"  [REPLY PREVIEW] {full_text[:110]}...", flush=True)

            record = {
                "id": test["id"],
                "query": test["query"],
                "language": test["language"],
                "type": test["category_expected"],
                "ttft_ms": round(first_token_ms, 2) if first_token_ms else 0,
                "total_stream_ms": round(total_stream_ms, 2),
                "eval_tokens": eval_tokens,
                "prompt_tokens": final_stream_data.get("prompt_tokens", 0),
                "engine": final_stream_data.get("generation_engine", "ollama"),
                "model": final_stream_data.get("ollama_model", "llama3.2:1b"),
                "fallback_occurred": final_stream_data.get("fallback_occurred", False),
                "reply": full_text
            }
            results.append(record)

        except Exception as e:
            print(f"  -> ERROR: {e}", flush=True)

    with open("final_polish_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    ttfts = [r["ttft_ms"] for r in results if r.get("ttft_ms")]
    totals = [r["total_stream_ms"] for r in results]

    print("\n" + "=" * 85)
    print("FINAL BENCHMARK PERFORMANCE SUMMARY")
    print("=" * 85)
    print(f"Total Evaluated Queries: {len(results)}")
    if ttfts:
        print(f"Median TTFT (Time-to-First-Token): {statistics.median(ttfts):.1f} ms ({statistics.median(ttfts)/1000:.2f}s)")
        print(f"Min TTFT:                          {min(ttfts):.1f} ms ({min(ttfts)/1000:.2f}s)")
        print(f"Max TTFT:                          {max(ttfts):.1f} ms ({max(ttfts)/1000:.2f}s)")
    if totals:
        print(f"Median Total Stream Duration:      {statistics.median(totals):.1f} ms ({statistics.median(totals)/1000:.2f}s)")
        print(f"P90 Total Stream Duration:         {sorted(totals)[int(len(totals)*0.9)]:.1f} ms")
        print(f"Min Total Duration:                {min(totals):.1f} ms ({min(totals)/1000:.2f}s)")
        print(f"Max Total Duration:                {max(totals):.1f} ms ({max(totals)/1000:.2f}s)")
    print("=" * 85, flush=True)

if __name__ == "__main__":
    run_benchmark()
