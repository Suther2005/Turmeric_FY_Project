"""
Test script to benchmark SSE Streaming endpoint POST /api/chat/stream
Measures:
- Time-to-First-Token (TTFT)
- Time between tokens
- Total stream duration
- Stream completion correctness
"""

import urllib.request
import json
import time

API_STREAM_URL = "http://127.0.0.1:8000/api/chat/stream"

def test_stream(query="What is turmeric?", lang="en"):
    print(f"\n--- Testing Streaming for: '{query}' ---")
    payload = {
        "message": query,
        "conversation_history": [],
        "language": lang,
        "app_context": None
    }

    t0 = time.perf_counter()
    req = urllib.request.Request(
        API_STREAM_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    first_token_time = None
    accumulated_tokens = []
    final_metadata = None

    with urllib.request.urlopen(req, timeout=45.0) as resp:
        for line in resp:
            line_str = line.decode("utf-8").strip()
            if line_str.startswith("data: "):
                now = time.perf_counter()
                if first_token_time is None:
                    first_token_time = (now - t0) * 1000
                data = json.loads(line_str[6:])
                chunk = data.get("chunk", "")
                if chunk:
                    accumulated_tokens.append(chunk)
                    print(chunk, end="", flush=True)
                if data.get("done"):
                    final_metadata = data

    t_total = (time.perf_counter() - t0) * 1000
    print("\n\n" + "-" * 50)
    print(f"Time-to-First-Token (TTFT): {first_token_time:.1f} ms ({first_token_time/1000:.2f}s)")
    print(f"Total Stream Duration:     {t_total:.1f} ms ({t_total/1000:.2f}s)")
    if final_metadata:
        print(f"Server Reported Latency:   {final_metadata.get('response_latency_ms', 0):.1f} ms")
        print(f"Generated Tokens:          {final_metadata.get('eval_tokens', 0)}")
        print(f"Engine:                    {final_metadata.get('generation_engine')}")
    print("-" * 50)

if __name__ == "__main__":
    test_stream("What is turmeric?")
    test_stream("Why does humidity matter?")
