import urllib.request
import json
import time

for th in [4, 6, 8, 10, 12]:
    p = {
        'model': 'llama3.2:1b',
        'messages': [
            {'role': 'system', 'content': 'You are Ask Curcuma, a concise assistant. Reply in 2 short sentences.'},
            {'role': 'user', 'content': 'What is turmeric?'}
        ],
        'stream': False,
        'keep_alive': '30m',
        'options': {
            'temperature': 0.3,
            'num_predict': 60,
            'num_ctx': 1024,
            'num_thread': th
        }
    }
    t0 = time.perf_counter()
    req = urllib.request.Request(
        'http://127.0.0.1:11434/api/chat',
        data=json.dumps(p).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read())
    t1 = time.perf_counter()
    eval_count = data.get('eval_count', 0)
    eval_duration = data.get('eval_duration', 1) / 1e9
    eval_rate = eval_count / eval_duration if eval_duration > 0 else 0
    prompt_duration = data.get('prompt_eval_duration', 1) / 1e9
    print(f"Threads: {th:2d} -> Total: {round(t1-t0, 2):.2f}s | Tokens: {eval_count:2d} | Eval Rate: {eval_rate:4.1f} t/s | Prompt eval: {prompt_duration*1000:4.0f}ms")
