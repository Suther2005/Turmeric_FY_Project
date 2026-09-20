"""
Comprehensive diagnosis of Mendeley API and webpage structure for jtttfbx342.
"""
import urllib.request
import urllib.parse
import json
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json'}

def test_url(url, extra_headers=None):
    h = dict(HEADERS)
    if extra_headers:
        h.update(extra_headers)
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            headers_dict = dict(resp.headers)
            body = resp.read()
            return resp.status, headers_dict, body
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()
    except Exception as e:
        return None, {}, str(e).encode()

# 1. Look at dataset HTML
print("=== 1. Inspecting Dataset Webpage ===")
html_url = "https://data.mendeley.com/datasets/jtttfbx342/2"
req = urllib.request.Request(html_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"HTML retrieved: {len(html)} bytes")
        
        # Look for script tags
        script_contents = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
        print(f"Found {len(script_contents)} script tags")
        for i, sc in enumerate(script_contents):
            if "__INITIAL_STATE__" in sc or "__NEXT_DATA__" in sc or "window." in sc:
                print(f"Script {i} contains window/state! Length: {len(sc)}")
                # save snippet
                print(sc[:500])
                print("...\n" + sc[-300:])
            # Check if any JSON is inside
            if "ccc522cc-7cfa-4650-aef7-3bc36c66f6cb" in sc:
                print(f"Script {i} contains folder_id! Length: {len(sc)}")
            if "Original" in sc or "original" in sc:
                print(f"Script {i} contains 'original'! Length: {len(sc)}")
except Exception as e:
    print("HTML error:", e)

# 2. Check folders in Mendeley
print("\n=== 2. Testing Mendeley Dataset Details Endpoint ===")
# What is the actual dataset endpoint on data.mendeley.com?
for ep in [
    "https://data.mendeley.com/public-files/datasets/jtttfbx342",
    "https://data.mendeley.com/api/datasets/jtttfbx342",
    "https://data.mendeley.com/public-api/datasets/jtttfbx342",
    "https://api.mendeley.com/datasets/jtttfbx342",
    "https://data.mendeley.com/datasets/jtttfbx342/2/root",
]:
    s, h, b = test_url(ep)
    print(f"{ep} -> status: {s}, len: {len(b)}")

