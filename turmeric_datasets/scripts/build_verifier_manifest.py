import csv
import hashlib
import random
from pathlib import Path
from collections import Counter, defaultdict

random.seed(42)
root = Path("d:/curuma")

def get_md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def get_unique_images_by_hash(folder):
    """Returns unique Path objects by MD5 hash to prevent identical file duplication across splits."""
    seen_hashes = {}
    for p in folder.iterdir():
        if p.is_file() and p.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
            file_hash = get_md5(p)
            if file_hash not in seen_hashes:
                seen_hashes[file_hash] = p
    return sorted(list(seen_hashes.values()), key=lambda x: x.name)

manifest_rows = []
used_hashes = set()

# 1. Dataset 01 Positives (from clean splits)
d1_splits_file = root / "turmeric_datasets/metadata/dataset_splits_clean.csv"
with open(d1_splits_file, "r", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        if row["dataset"] == "Dataset_01":
            rel = row["relative_path"]
            abs_p = root / "turmeric_datasets" / rel
            if abs_p.exists():
                file_hash = get_md5(abs_p)
                split_val = row["split"]
                rel_path = str(abs_p.relative_to(root)).replace("\\", "/")
                if not rel_path.startswith("turmeric_datasets/"):
                    rel_path = f"turmeric_datasets/{rel_path}"
                manifest_rows.append({
                    "sample_id": f"DS01_{split_val[:2].upper()}_{row['filename']}",
                    "dataset_source": "Dataset_01_Clean",
                    "filename": row["filename"],
                    "relative_path": rel_path,
                    "label": "turmeric_leaf",
                    "binary_target": 1,
                    "subcategory": row["standardized_class"],
                    "split": split_val,
                    "role": f"positive_{split_val}_turmeric_leaf",
                    "md5_hash": file_hash,
                    "file_size_bytes": abs_p.stat().st_size
                })
                used_hashes.add(file_hash)

# 2. Load the EXACT 200 Frozen External Mendeley Benchmark Images
ext_200_file = root / "research_results/external_mendeley_200/external_manifest.csv"
d2_base = root / "turmeric_datasets/dataset_02/original/Turmeric Plant Disease"

ext_200_items = []
ext_200_unique_paths = set()

with open(ext_200_file, "r", encoding="utf-8") as f:
    for idx, row in enumerate(csv.DictReader(f), 1):
        sub_folder = row["source_class"] # 'Healthy Leaf' or 'Leaf Blotch'
        fname = row["filename"]
        abs_p = d2_base / sub_folder / fname
        assert abs_p.exists(), f"Missing file in Dataset_02: {abs_p}"
        file_hash = get_md5(abs_p)
        
        item = {
            "sample_id": f"DS02_EXT_FROZEN_{idx:03d}_{fname}",
            "dataset_source": "Dataset_02_Mendeley",
            "filename": fname,
            "relative_path": f"dataset_02/original/Turmeric Plant Disease/{sub_folder}/{fname}",
            "label": "turmeric_leaf",
            "binary_target": 1,
            "subcategory": f"{row['mapped_class']}_Field",
            "split": "external_test",
            "role": "held_out_external_generalization_test",
            "md5_hash": file_hash,
            "file_size_bytes": abs_p.stat().st_size
        }
        manifest_rows.append(item)
        ext_200_items.append(item)
        ext_200_unique_paths.add(str(abs_p.resolve()))
        used_hashes.add(file_hash)

print(f"Loaded exact frozen external test set: {len(ext_200_items)} rows (100 Healthy, 100 Blotch)")

# 3. Remaining Dataset 02 Foliar Images -> Excluded External Reserve (Zero Contamination)
all_d2_healthy = get_unique_images_by_hash(d2_base / "Healthy Leaf")
all_d2_blotch = get_unique_images_by_hash(d2_base / "Leaf Blotch")

reserve_count = 0
for p in all_d2_healthy + all_d2_blotch:
    if str(p.resolve()) not in ext_200_unique_paths:
        file_hash = get_md5(p)
        subcat = "Healthy_Field_Reserve" if "Healthy" in str(p) else "Blotch_Field_Reserve"
        manifest_rows.append({
            "sample_id": f"DS02_RESERVE_{p.name}",
            "dataset_source": "Dataset_02_Mendeley",
            "filename": p.name,
            "relative_path": f"dataset_02/original/Turmeric Plant Disease/{p.parent.name}/{p.name}",
            "label": "turmeric_leaf",
            "binary_target": 1,
            "subcategory": subcat,
            "split": "external_reserve",
            "role": "excluded_external_reserve",
            "md5_hash": file_hash,
            "file_size_bytes": p.stat().st_size
        })
        reserve_count += 1

print(f"Placed remaining unselected Dataset_02 foliar images into external_reserve: {reserve_count} images")

# 4. Dataset 02 Dry Leaf -> Separate Field Edge-Case Evaluation Set
d2_dry = get_unique_images_by_hash(d2_base / "Dry Leaf")
for p in d2_dry:
    file_hash = get_md5(p)
    manifest_rows.append({
        "sample_id": f"DS02_EDGE_DRY_{p.name}",
        "dataset_source": "Dataset_02_Mendeley",
        "filename": p.name,
        "relative_path": f"dataset_02/original/Turmeric Plant Disease/Dry Leaf/{p.name}",
        "label": "turmeric_senescent_edge_case",
        "binary_target": -1, # Edge case evaluation tag
        "subcategory": "Dry_Senescent_Foliage",
        "split": "external_edge_case",
        "role": "turmeric_senescent_field_edge_case",
        "md5_hash": file_hash,
        "file_size_bytes": p.stat().st_size
    })

print(f"Placed Dataset_02 Dry Leaf images into external_edge_case: {len(d2_dry)} images")

# 5. Dataset 02 Rhizomes -> Deduplicated & Split into Train (80%) and Val (20%) Negatives
rhizome_h = get_unique_images_by_hash(d2_base / "Rhizome Healthy Root")
rhizome_d = get_unique_images_by_hash(d2_base / "Rhizome Disease Root")

rhizomes = rhizome_h + rhizome_d
random.shuffle(rhizomes)
n_train_rhizome = int(len(rhizomes) * 0.8)

for p in rhizomes[:n_train_rhizome]:
    file_hash = get_md5(p)
    subcat = "Rhizome_Healthy_Root" if "Healthy" in str(p) else "Rhizome_Disease_Root"
    manifest_rows.append({
        "sample_id": f"DS02_TR_RHIZOME_{p.name}",
        "dataset_source": "Dataset_02_Mendeley",
        "filename": p.name,
        "relative_path": f"dataset_02/original/Turmeric Plant Disease/{p.parent.name}/{p.name}",
        "label": "non_turmeric",
        "binary_target": 0,
        "subcategory": subcat,
        "split": "train",
        "role": "negative_train_rhizome_specimen",
        "md5_hash": file_hash,
        "file_size_bytes": p.stat().st_size
    })

for p in rhizomes[n_train_rhizome:]:
    file_hash = get_md5(p)
    subcat = "Rhizome_Healthy_Root" if "Healthy" in str(p) else "Rhizome_Disease_Root"
    manifest_rows.append({
        "sample_id": f"DS02_VAL_RHIZOME_{p.name}",
        "dataset_source": "Dataset_02_Mendeley",
        "filename": p.name,
        "relative_path": f"dataset_02/original/Turmeric Plant Disease/{p.parent.name}/{p.name}",
        "label": "non_turmeric",
        "binary_target": 0,
        "subcategory": subcat,
        "split": "val",
        "role": "negative_val_rhizome_specimen",
        "md5_hash": file_hash,
        "file_size_bytes": p.stat().st_size
    })

# 6. OOD Benchmark Images (Deduplicated unique images: 28 train, 10 val, 10 test)
ood_dir = root / "research_results/ood_benchmark"
ood_categories = ["anime_cartoon", "document_ui", "human_portraits", "non_turmeric_botanical", "unrelated_objects"]

for cat in ood_categories:
    cat_dir = ood_dir / cat
    cat_imgs = get_unique_images_by_hash(cat_dir)
    random.shuffle(cat_imgs)
    
    n_total = len(cat_imgs)
    n_test = min(2, n_total)
    n_val = min(2, n_total - n_test)
    n_train = n_total - n_val - n_test

    for p in cat_imgs[:n_train]:
        file_hash = get_md5(p)
        manifest_rows.append({
            "sample_id": f"OOD_TR_{cat.upper()}_{p.name}",
            "dataset_source": "OOD_Benchmark",
            "filename": p.name,
            "relative_path": f"research_results/ood_benchmark/{cat}/{p.name}",
            "label": "non_turmeric",
            "binary_target": 0,
            "subcategory": cat,
            "split": "train",
            "role": "negative_train_far_ood_control",
            "md5_hash": file_hash,
            "file_size_bytes": p.stat().st_size
        })

    for p in cat_imgs[n_train:n_train+n_val]:
        file_hash = get_md5(p)
        manifest_rows.append({
            "sample_id": f"OOD_VAL_{cat.upper()}_{p.name}",
            "dataset_source": "OOD_Benchmark",
            "filename": p.name,
            "relative_path": f"research_results/ood_benchmark/{cat}/{p.name}",
            "label": "non_turmeric",
            "binary_target": 0,
            "subcategory": cat,
            "split": "val",
            "role": "negative_val_far_ood_control",
            "md5_hash": file_hash,
            "file_size_bytes": p.stat().st_size
        })

    for p in cat_imgs[n_train+n_val:]:
        file_hash = get_md5(p)
        manifest_rows.append({
            "sample_id": f"OOD_TST_{cat.upper()}_{p.name}",
            "dataset_source": "OOD_Benchmark",
            "filename": p.name,
            "relative_path": f"research_results/ood_benchmark/{cat}/{p.name}",
            "label": "non_turmeric",
            "binary_target": 0,
            "subcategory": cat,
            "split": "internal_test",
            "role": "negative_internal_test_control",
            "md5_hash": file_hash,
            "file_size_bytes": p.stat().st_size
        })

# Write Master Manifest CSV
out_csv = root / "turmeric_datasets/metadata/verifier_dataset_manifest.csv"
fields = [
    "sample_id", "dataset_source", "filename", "relative_path", "label",
    "binary_target", "subcategory", "split", "role", "md5_hash", "file_size_bytes"
]

with open(out_csv, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    for row in manifest_rows:
        writer.writerow(row)

print(f"\n[OK] Successfully wrote master verifier manifest with {len(manifest_rows)} total rows to: {out_csv}")
