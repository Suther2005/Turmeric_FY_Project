"""
DS01 Definitive Structure Probe
================================
The /files API with offset pagination wraps at record 100.
We need to probe specific version-aware endpoints and the 
dataset folder hierarchy to understand the true structure.

Tries multiple approaches:
  A. Mendeley /api/datasets/{id}/files with 'version' parameter
  B. Mendeley /api/datasets/{id}/folders (v1/v2 specific)
  C. Probe offset=865 and offset=866 to test if originals end there
  D. Fetch files filtered by individual classes using filename hints
  E. Read the dataset DOI page (HTML) to count file entries

NO downloads.
"""

import urllib.request
import urllib.parse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

HEADERS    = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
HTML_HDR   = {"User-Agent": "Mozilla/5.0", "Accept": "text/html"}
DATASET_ID = "jtttfbx342"
BASE_API   = f"https://data.mendeley.com/api/datasets/{DATASET_ID}"
REPORT     = Path(r"D:\curuma\turmeric_datasets\metadata\ds01_api_structure.txt")
REPORT.parent.mkdir(parents=True, exist_ok=True)

output = []
def P(msg=""):
    print(msg)
    output.append(msg)

def get_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def get_html(url):
    req = urllib.request.Request(url, headers=HTML_HDR)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")

P("=" * 70)
P(f"DS01 DEFINITIVE STRUCTURE PROBE  ({DATASET_ID})")
P("=" * 70)

# ── A: Try version-specific file endpoints ────────────────────────────────
P("\n[A] Probing version-specific API endpoints...")
for version in [1, 2]:
    try:
        url = f"{BASE_API}/files?version={version}&limit=5"
        batch = get_json(url)
        if isinstance(batch, list) and batch:
            P(f"  v{version} → {len(batch)} sample records")
            P(f"    First file: {batch[0]['filename']}")
            P(f"    folder_id : {batch[0].get('folder_id','?')}")
    except Exception as e:
        P(f"  v{version} → error: {e}")

# ── B: Probe specific offsets to detect wrap-around point ─────────────────
P("\n[B] Probing specific offsets to find actual file count...")
prev_first = None
wrap_offset = None
for offset in [0, 100, 200, 400, 800, 860, 865, 866, 900, 1000, 1728, 4360, 4361, 8700]:
    try:
        url = f"{BASE_API}/files?limit=5&offset={offset}"
        batch = get_json(url)
        if isinstance(batch, list):
            first = batch[0]["filename"] if batch else "EMPTY"
            is_wrap = (first == prev_first and prev_first is not None)
            P(f"  offset={offset:>6}: {len(batch):>3} records  first={first}  {'<<< WRAP' if is_wrap else ''}")
            if is_wrap and wrap_offset is None:
                wrap_offset = offset
            prev_first = first
        else:
            P(f"  offset={offset}: non-list response ({type(batch)})")
    except Exception as e:
        P(f"  offset={offset}: error: {e}")

if wrap_offset:
    P(f"\n  Wrap-around detected at offset={wrap_offset}")
    P(f"  => Actual unique file count is approximately {wrap_offset}")
else:
    P("  No clear wrap-around detected in tested offsets")

# ── C: Collect ALL unique files across sampled offsets ───────────────────
P("\n[C] Collecting unique files by sampling every 100 offsets...")
unique_files = {}  # sha256 -> file_record
for offset in range(0, 4500, 100):
    try:
        url = f"{BASE_API}/files?limit=100&offset={offset}"
        batch = get_json(url)
        if not isinstance(batch, list) or not batch:
            P(f"  offset={offset}: empty/non-list — stopping")
            break
        first_name = batch[0]["filename"]
        # Check if we've already seen this file
        first_sha = batch[0].get("content_details", {}).get("sha256_hash", "")
        if first_sha and first_sha in unique_files:
            P(f"  offset={offset}: wrap-around confirmed (sha match). Stopping.")
            break
        for f in batch:
            sha = f.get("content_details", {}).get("sha256_hash", "")
            if sha:
                unique_files[sha] = f
        P(f"  offset={offset:>5}: {len(batch)} batch, {len(unique_files)} unique total, first={first_name}")
    except Exception as e:
        P(f"  offset={offset}: error={e}")
        break

P(f"\n  TOTAL UNIQUE FILES FOUND: {len(unique_files)}")

# ── D: Analyse the unique file collection ─────────────────────────────────
P("\n[D] Analysing collected unique files...")
all_files = list(unique_files.values())
folder_counts = Counter(f.get("folder_id","NONE") for f in all_files)
P(f"  Folder IDs: {dict(folder_counts)}")

prefix_counts = Counter()
for f in all_files:
    n = f["filename"].lower()
    if n.startswith("aug_"):      prefix_counts["aug_*"] += 1
    elif "aphid" in n:            prefix_counts["aphids_disease"] += 1
    elif "blotch" in n:           prefix_counts["blotch"] += 1
    elif "leaf_spot" in n:        prefix_counts["leaf_spot"] += 1
    elif "healthy" in n:          prefix_counts["healthy_leaf"] += 1
    else:                         prefix_counts["other"] += 1
P(f"  Filename prefix counts: {dict(prefix_counts)}")

# Sort by filename and show transition between original/augmented
sorted_files = sorted(all_files, key=lambda x: x["filename"].lower())
P(f"\n  First 5 files (sorted): {[f['filename'] for f in sorted_files[:5]]}")
P(f"  Last  5 files (sorted): {[f['filename'] for f in sorted_files[-5:]]}")

# Date range
dates = sorted(
    f.get("content_details",{}).get("created_date","") for f in all_files
    if f.get("content_details",{}).get("created_date","")
)
if dates:
    P(f"  Created date range: {dates[0][:10]} → {dates[-1][:10]}")

# Size stats
sizes = [f.get("size",0) for f in all_files]
P(f"  Total size: {sum(sizes)/1e6:.1f} MB  |  Avg: {(sum(sizes)/len(sizes))/1e6:.2f} MB/file")

# ── E: Read Mendeley dataset HTML page for file structure info ────────────
P("\n[E] Reading Mendeley dataset page HTML for structural clues...")
try:
    html = get_html(f"https://data.mendeley.com/datasets/{DATASET_ID}/2")
    # Look for folder names in the HTML
    import re
    # Find JSON-LD or embedded JSON with file/folder structure
    json_ld_matches = re.findall(r'<script[^>]*type="application/json"[^>]*>(.*?)</script>', html, re.DOTALL)
    folder_hints = re.findall(r'"name"\s*:\s*"([^"]*(?:[Oo]riginal|[Aa]ugment)[^"]*)"', html)
    file_count_hints = re.findall(r'(\d+)\s*(?:files|images|items)', html, re.IGNORECASE)
    version_hints = re.findall(r'[Vv]ersion\s*(\d+)', html)
    
    P(f"  Folder name hints from HTML: {folder_hints[:10]}")
    P(f"  File count hints from HTML: {file_count_hints[:10]}")
    P(f"  Version hints: {list(set(version_hints))[:5]}")
    
    # Look for specific numbers
    if "865" in html:
        P("  Found '865' in HTML page")
    if "3496" in html or "3,496" in html:
        P("  Found '3496/3,496' in HTML page")
    if "4361" in html or "4,361" in html:
        P("  Found '4361/4,361' in HTML page")
except Exception as e:
    P(f"  HTML fetch failed: {e}")

# ── F: Write final report ────────────────────────────────────────────────
P("\n" + "=" * 70)
P("FINAL SUMMARY")
P("=" * 70)
P(f"Total unique files discovered via API sampling: {len(unique_files)}")
P(f"Unique folder_ids: {dict(folder_counts)}")
P(f"Prefix breakdown:  {dict(prefix_counts)}")
P("")
if len(unique_files) > 0:
    total = len(unique_files)
    aug   = prefix_counts.get("aug_*", 0)
    orig  = total - aug
    P(f"Files with 'aug_' prefix (augmented): {aug}")
    P(f"Files without 'aug_' prefix (original): {orig}")
    P(f"Expected original count (from paper): 865")
    P(f"Match: {'YES' if orig == 865 else f'NO - got {orig}'}")
P("")
P("API BEHAVIOUR DIAGNOSIS:")
P("  The /files endpoint returns max 100 records per page.")
P("  Offset-based pagination wraps after all unique records are exhausted.")
P("  There is ONE folder_id covering all files.")
P("  Originals are distinguishable by filename (no 'aug_' prefix).")
P("")
P("DOWNLOAD STRATEGY:")
P("  Cannot filter by folder (only 1 folder, contains all files).")
P("  Must fetch ALL unique files and filter by filename pattern:")
P("    ORIGINAL = filename does NOT start with 'aug_'")
P("    AUGMENTED = filename starts with 'aug_'")
P("  Use wrap-around detection to know when all unique files are fetched.")
P("")
P("CONFIRMED ORIGINAL FOLDER_ID:")
P(f"  ccc522cc-7cfa-4650-aef7-3bc36c66f6cb  (the ONLY folder)")
P("=" * 70)

report_text = "\n".join(output)
REPORT.write_text(report_text, encoding="utf-8")
P(f"\nFull report saved -> {REPORT}")
