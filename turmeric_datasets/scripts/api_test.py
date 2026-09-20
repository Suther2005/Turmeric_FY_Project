"""
Inspect the Mendeley API to understand the full file structure of DS01.
Fetches ALL pages and summarises folder_id counts, filenames, and total.
Does NOT download anything.
"""
import urllib.request, urllib.parse, json
from collections import Counter

HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}

def fetch_all(dataset_id):
    all_files = []
    url = f"https://data.mendeley.com/api/datasets/{dataset_id}/files"
    page = 0
    while url:
        page += 1
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())
        if isinstance(data, list):
            all_files.extend(data)
            if len(data) == 100:
                parsed = urllib.parse.urlparse(url)
                params = urllib.parse.parse_qs(parsed.query)
                offset = int(params.get("offset", ["0"])[0]) + 100
                new_qs = urllib.parse.urlencode({"offset": offset, "limit": 100})
                url = urllib.parse.urlunparse(parsed._replace(query=new_qs))
            else:
                print(f"  Page {page}: got {len(data)} (last page)")
                url = None
        else:
            print(f"  Unexpected type: {type(data)}")
            break
    return all_files

print("Fetching ALL DS01 file records...")
files = fetch_all("jtttfbx342")
print(f"\nTotal files in API: {len(files)}")

# Analyse folder IDs
folder_counts = Counter(f.get("folder_id", "root") for f in files)
print(f"\nFolder ID breakdown:")
for fid, cnt in sorted(folder_counts.items(), key=lambda x: -x[1]):
    print(f"  {fid}: {cnt} files")

# Analyse filename patterns
names = [f["filename"] for f in files]
aug_count = sum(1 for n in names if n.lower().startswith("aug_"))
orig_count = len(names) - aug_count
print(f"\nFilename analysis:")
print(f"  Starting with 'aug_': {aug_count}")
print(f"  NOT starting with 'aug_': {orig_count}")

# Sample first 5 filenames per folder
from collections import defaultdict
by_folder = defaultdict(list)
for f in files:
    by_folder[f.get("folder_id","root")].append(f["filename"])

for fid, fnames in sorted(by_folder.items()):
    print(f"\nFolder {fid[:20]}... ({len(fnames)} files), sample names:")
    for n in fnames[:5]:
        print(f"  {n}")
