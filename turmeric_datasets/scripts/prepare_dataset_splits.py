"""
Dataset Splits & External Validation Mapping Generator
======================================================
Generates deterministic split manifests without modifying, moving,
or copying any raw image files.

Partitions:
  - Dataset 01: Stratified 70% Train, 15% Validation, 15% Internal Test (seed=42)
  - Dataset 02: External Validation Mapping (396 compatible images), OOD (203 Dry Leaf), Excluded (464 Rhizome)

Outputs:
  - metadata/dataset_splits.csv
  - metadata/external_validation_mapping.csv
  - metadata/dataset_preparation_summary.md
"""

import csv
import random
from pathlib import Path
from collections import defaultdict, Counter

BASE = Path(r"D:\curuma\turmeric_datasets")
DS01_DIR = BASE / "dataset_01" / "original"
DS02_DIR = BASE / "dataset_02" / "original"
META_DIR = BASE / "metadata"

RANDOM_SEED = 42
TRAIN_RATIO = 0.70
VAL_RATIO   = 0.15
TEST_RATIO  = 0.15

def main():
    print("=" * 70)
    print("DATASET PREPARATION: GENERATING DETERMINISTIC SPLIT MANIFESTS")
    print("=" * 70)

    # 1. Collect Dataset 01 Images by Class
    ds01_by_class = defaultdict(list)
    for cdir in sorted(DS01_DIR.iterdir()):
        if cdir.is_dir():
            for img_p in sorted(cdir.glob("*.jpg")):
                ds01_by_class[cdir.name].append(img_p)

    total_ds01 = sum(len(v) for v in ds01_by_class.values())
    print(f"\n[1] Dataset 01: Collected {total_ds01} images across {len(ds01_by_class)} classes.")

    # 2. Perform Stratified Deterministic Split
    random.seed(RANDOM_SEED)
    ds01_splits = []

    for cname, img_paths in sorted(ds01_by_class.items()):
        shuffled = list(img_paths)
        random.shuffle(shuffled)
        n = len(shuffled)
        n_train = round(n * TRAIN_RATIO)
        n_val = round(n * VAL_RATIO)
        n_test = n - n_train - n_val

        train_imgs = shuffled[:n_train]
        val_imgs = shuffled[n_train:n_train + n_val]
        test_imgs = shuffled[n_train + n_val:]

        print(f"  Class: {cname:<15} | Total: {n:3} | Train: {len(train_imgs):3} | Val: {len(val_imgs):2} | Test: {len(test_imgs):2}")

        for p in train_imgs:
            ds01_splits.append({
                "dataset": "Dataset_01",
                "relative_path": str(p.relative_to(BASE)),
                "filename": p.name,
                "original_class": cname,
                "standardized_class": cname,
                "split": "train",
                "role": "model_training",
            })
        for p in val_imgs:
            ds01_splits.append({
                "dataset": "Dataset_01",
                "relative_path": str(p.relative_to(BASE)),
                "filename": p.name,
                "original_class": cname,
                "standardized_class": cname,
                "split": "val",
                "role": "hyperparameter_tuning_checkpointing",
            })
        for p in test_imgs:
            ds01_splits.append({
                "dataset": "Dataset_01",
                "relative_path": str(p.relative_to(BASE)),
                "filename": p.name,
                "original_class": cname,
                "standardized_class": cname,
                "split": "internal_test",
                "role": "in_distribution_evaluation",
            })

    # 3. Collect Dataset 02 Images and Categorize
    print("\n[2] Dataset 02: Categorizing images for external validation & OOD evaluation...")
    ds02_splits = []
    ext_mapping = []

    img_exts = {".jpg", ".jpeg", ".png", ".bmp"}
    all_ds02 = sorted([p for p in DS02_DIR.rglob("*") if p.is_file() and p.suffix.lower() in img_exts])
    print(f"  Dataset 02: Collected {len(all_ds02)} total images.")

    for p in all_ds02:
        cname = p.parent.name
        rel = str(p.relative_to(BASE))
        
        # Mapping logic
        if cname == "Healthy Leaf":
            std_class = "Healthy_Leaf"
            split_label = "external_test"
            role = "external_validation_matched"
            compatibility = "DIRECT_MATCH"
        elif cname == "Leaf Blotch":
            std_class = "Blotch"
            split_label = "external_test"
            role = "external_validation_matched"
            compatibility = "DIRECT_MATCH"
        elif cname == "Dry Leaf":
            std_class = "Dry_Leaf"
            split_label = "external_ood"
            role = "out_of_distribution_robustness"
            compatibility = "INCOMPATIBLE_OOD"
        elif "Rhizome" in cname:
            std_class = cname.replace(" ", "_")
            split_label = "external_excluded"
            role = "excluded_non_leaf_domain"
            compatibility = "EXCLUDED_RHIZOME"
        else:
            std_class = "Unknown"
            split_label = "external_excluded"
            role = "unknown"
            compatibility = "EXCLUDED_UNKNOWN"

        rec = {
            "dataset": "Dataset_02",
            "relative_path": rel,
            "filename": p.name,
            "original_class": cname,
            "standardized_class": std_class,
            "split": split_label,
            "role": role,
        }
        ds02_splits.append(rec)

        if compatibility in ("DIRECT_MATCH", "INCOMPATIBLE_OOD"):
            ext_mapping.append({
                "dataset": "Dataset_02",
                "filename": p.name,
                "relative_path": rel,
                "ds02_class": cname,
                "mapped_ds01_class": std_class if compatibility == "DIRECT_MATCH" else "NONE (OOD)",
                "compatibility_status": compatibility,
                "usable_for_external_benchmark": "YES" if compatibility == "DIRECT_MATCH" else "NO_OOD_ONLY",
            })

    # Summary of counts
    ds02_split_counts = Counter(r["split"] for r in ds02_splits)
    print(f"  Dataset 02 Partition Breakdown: {dict(ds02_split_counts)}")

    # 4. Write dataset_splits.csv (All Images)
    splits_csv = META_DIR / "dataset_splits.csv"
    all_manifest = ds01_splits + ds02_splits
    fields = ["dataset", "relative_path", "filename", "original_class", "standardized_class", "split", "role"]
    with open(splits_csv, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(all_manifest)
    print(f"\n[3] Saved complete splits manifest: {splits_csv} ({len(all_manifest)} rows)")

    # 5. Write external_validation_mapping.csv
    mapping_csv = META_DIR / "external_validation_mapping.csv"
    map_fields = ["dataset", "filename", "relative_path", "ds02_class", "mapped_ds01_class", "compatibility_status", "usable_for_external_benchmark"]
    with open(mapping_csv, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=map_fields)
        w.writeheader()
        w.writerows(ext_mapping)
    print(f"[4] Saved external validation mapping: {mapping_csv} ({len(ext_mapping)} rows)")

    # 6. Write dataset_preparation_summary.md
    summary_md = META_DIR / "dataset_preparation_summary.md"
    ds01_split_counts = Counter(r["split"] for r in ds01_splits)
    with open(summary_md, "w", encoding="utf-8") as f:
        f.write("# Dataset Preparation & Split Summary\n\n")
        f.write("**Generated via:** Deterministic Stratified Splitter (`seed=42`)\n")
        f.write("**Project:** Turmeric Plant Leaf Disease Detection\n\n")
        f.write("---\n\n")

        f.write("## 1. Dataset 01 Stratified Partitioning\n\n")
        f.write("| Partition | Role | Images | Percentage |\n")
        f.write("| :--- | :--- | :---: | :---: |\n")
        f.write(f"| **`train`** | Core training set | **{ds01_split_counts['train']}** | 69.94% |\n")
        f.write(f"| **`val`** | Hyperparameter tuning & model checkpointing | **{ds01_split_counts['val']}** | 15.03% |\n")
        f.write(f"| **`internal_test`** | In-distribution evaluation benchmark | **{ds01_split_counts['internal_test']}** | 15.03% |\n")
        f.write(f"| **Total** | Full Dataset 01 Original Cohort | **{len(ds01_splits)}** | **100.0%** |\n\n")

        f.write("### Per-Class Stratified Split (Dataset 01)\n\n")
        f.write("| Class Name | Train (70%) | Val (15%) | Internal Test (15%) | Total Class Images |\n")
        f.write("| :--- | :---: | :---: | :---: | :---: |\n")
        for cname in sorted(ds01_by_class.keys()):
            tr_n = sum(1 for r in ds01_splits if r["original_class"] == cname and r["split"] == "train")
            va_n = sum(1 for r in ds01_splits if r["original_class"] == cname and r["split"] == "val")
            te_n = sum(1 for r in ds01_splits if r["original_class"] == cname and r["split"] == "internal_test")
            tot_n = tr_n + va_n + te_n
            f.write(f"| `{cname}` | {tr_n} | {va_n} | {te_n} | **{tot_n}** |\n")
        f.write(f"| **Total** | **{ds01_split_counts['train']}** | **{ds01_split_counts['val']}** | **{ds01_split_counts['internal_test']}** | **{len(ds01_splits)}** |\n\n")

        f.write("---\n\n")
        f.write("## 2. Dataset 02 External Validation & OOD Categorization\n\n")
        f.write("| Partition Category | Scope / Pathology | Images | Mapping Status |\n")
        f.write("| :--- | :--- | :---: | :--- |\n")
        matched_cnt = sum(1 for r in ds02_splits if r["split"] == "external_test")
        ood_cnt = sum(1 for r in ds02_splits if r["split"] == "external_ood")
        excl_cnt = sum(1 for r in ds02_splits if r["split"] == "external_excluded")
        f.write(f"| **`external_test`** | Compatible Leaf Classes (`Healthy Leaf` + `Leaf Blotch`) | **{matched_cnt}** | **Direct Benchmark (396 images)** ✅ |\n")
        f.write(f"| **`external_ood`** | Desiccated Non-specific Foliage (`Dry Leaf`) | **{ood_cnt}** | **Out-of-Distribution Test (203 images)** ⚠️ |\n")
        f.write(f"| **`external_excluded`** | Underground Root/Rhizome Anatomy (`Rhizome Disease/Healthy`) | **{excl_cnt}** | **Excluded from Leaf Model (464 images)** ❌ |\n")
        f.write(f"| **Total** | Complete Dataset 02 Cohort | **{len(ds02_splits)}** | **1,063 images** |\n\n")

        f.write("### External Validation Matched Breakdown\n\n")
        f.write("| Dataset 02 Source Class | Mapped Dataset 01 Target Class | External Evaluation Count |\n")
        f.write("| :--- | :--- | :---: |\n")
        f.write("| `Healthy Leaf` | `Healthy_Leaf` | **197 images** |\n")
        f.write("| `Leaf Blotch` | `Blotch` | **199 images** |\n")
        f.write("| **Total Usable External Benchmark** | **Shared Leaf Benchmark** | **396 images** |\n\n")

        f.write("---\n\n")
        f.write("## 3. Preservation of Data Integrity\n\n")
        f.write("- **Zero Raw File Modifications**: No images were moved, renamed, resized, or preprocessed.\n")
        f.write("- **Full Reproducibility**: Seed fixed to `42`. File mappings are transparently recorded in `dataset_splits.csv` and `external_validation_mapping.csv`.\n")

    print(f"[5] Saved preparation summary: {summary_md}")
    print("\nDataset preparation manifest generation complete!")

if __name__ == "__main__":
    main()
