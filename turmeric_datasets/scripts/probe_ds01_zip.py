"""
Probe DS01 for bulk ZIP download capability.
Checks multiple known Mendeley ZIP download URL patterns.
NO downloads — HEAD requests only (checks availability, not content).
"""
import urllib.request
import sys
sys.stdout.reconfigure(encoding="utf-8")

DATASET_ID = "jtttfbx342"

urls_to_probe = [
    # Standard Mendeley ZIP download patterns
    f"https://data.mendeley.com/datasets/{DATASET_ID}/2/download/zip",
    f"https://data.mendeley.com/datasets/{DATASET_ID}/download/zip",
    f"https://data.mendeley.com/public-files/datasets/{DATASET_ID}/zip_downloaded",
    # API-based dataset export
    f"https://data.mendeley.com/api/datasets/{DATASET_ID}/download",
    f"https://data.mendeley.com/api/datasets/{DATASET_ID}/zip",
    # DOI-based redirect
    "https://doi.org/10.17632/jtttfbx342.2",
    # Mendeley file download direct (version 2)
    f"https://data.mendeley.com/api/datasets/{DATASET_ID}/files?limit=1000",
]

for url in urls_to_probe:
    try:
        req = urllib.request.Request(url, method="HEAD",
              headers={"User-Agent":"Mozilla/5.0","Accept":"*/*"})
        with urllib.request.urlopen(req, timeout=15) as r:
            ct   = r.headers.get("Content-Type","?")
            cl   = r.headers.get("Content-Length","?")
            cd   = r.headers.get("Content-Disposition","?")
            loc  = r.headers.get("Location","")
            code = r.status
            print(f"  {code} OK  | {cl:>12} bytes | {ct[:30]:30} | {url}")
            if loc:
                print(f"    Redirects to: {loc[:80]}")
    except urllib.error.HTTPError as e:
        print(f"  {e.code} ERR | {'':>12}       | {'':30} | {url}")
        if e.code in (301, 302, 303, 307, 308):
            print(f"    Redirect: {e.headers.get('Location','?')[:80]}")
    except Exception as e:
        print(f"  ERR     | {'':>12}       | {str(e)[:40]:40} | {url}")
