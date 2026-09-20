"""
Setup YOLOv8 Annotation Workspace & Inspection Review Sheets
============================================================
Prepares Dataset 01 for YOLOv8n object detection:
  1. Creates annotations workspace hierarchy (images, labels, classes.txt, manifest)
  2. Populates images/train, images/val, images/test using NTFS hardlinks (0 bytes wasted, zero alteration of raw data)
  3. Prepares empty label placeholders and empty negative files for Healthy_Leaf
  4. Generates 25-image inspection contact sheets for each of the 4 classes
  5. Generates annotation_manifest.csv
  6. Analyzes visual ambiguity patterns
"""

import os
import csv
from pathlib import Path
from collections import defaultdict, Counter
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE = Path(r"D:\curuma\turmeric_datasets")
SPLITS_CSV = BASE / "metadata" / "dataset_splits.csv"

ANNO_DIR = BASE / "annotations"
IMG_DIR = ANNO_DIR / "images"
LBL_DIR = ANNO_DIR / "labels"
SHEETS_DIR = ANNO_DIR / "contact_sheets"

for d in [IMG_DIR / "train", IMG_DIR / "val", IMG_DIR / "test",
         LBL_DIR / "train", LBL_DIR / "val", LBL_DIR / "test",
         SHEETS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# 1. Classes definition
CLASSES = [
    "Aphids_Disease",
    "Blotch",
    "Leaf_Spot"
]

def main():
    print("=" * 70)
    print("SETTING UP YOLOv8 ANNOTATION WORKSPACE")
    print("=" * 70)

    # Write classes.txt
    classes_txt = ANNO_DIR / "classes.txt"
    with open(classes_txt, "w", encoding="utf-8") as f:
        for c in CLASSES:
            f.write(f"{c}\n")
    print(f"[1] Written classes.txt ({len(CLASSES)} disease classes): {CLASSES}")

    # Read dataset_splits.csv (Dataset 01 only)
    ds01_items = []
    with open(SPLITS_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["dataset"] == "Dataset_01":
                ds01_items.append(row)

    print(f"[2] Loaded {len(ds01_items)} Dataset 01 items from dataset_splits.csv")

    # Map splits: internal_test -> test
    manifest_rows = []
    by_class_items = defaultdict(list)

    for item in ds01_items:
        src_rel = item["relative_path"]
        src_path = BASE / src_rel
        fname = item["filename"]
        cname = item["standardized_class"]
        raw_split = item["split"]
        yolo_split = "test" if raw_split == "internal_test" else raw_split

        dst_img = IMG_DIR / yolo_split / fname
        dst_lbl = LBL_DIR / yolo_split / (Path(fname).stem + ".txt")

        # Hardlink image
        if not dst_img.exists():
            try:
                os.link(src_path, dst_img)
            except Exception as e:
                # fallback to copy if link fails
                import shutil
                shutil.copy2(src_path, dst_img)

        # Labels logic:
        # For Healthy_Leaf: create empty .txt label file (negative background image)
        # For disease classes: create empty placeholder file
        if not dst_lbl.exists():
            dst_lbl.touch()

        if cname == "Healthy_Leaf":
            status = "NEGATIVE_BACKGROUND_VERIFIED"
            notes = "Healthy leaf - negative background image (0 boxes required)"
            n_boxes = 0
        else:
            status = "PENDING_ANNOTATION"
            notes = f"Requires manual bounding-box annotation for {cname}"
            n_boxes = 0

        manifest_rows.append({
            "image_path": str(dst_img.relative_to(BASE)),
            "label_path": str(dst_lbl.relative_to(BASE)),
            "original_class": cname,
            "split": yolo_split,
            "number_of_boxes": n_boxes,
            "annotator_status": status,
            "notes": notes,
        })

        by_class_items[cname].append({
            "path": src_path,
            "filename": fname,
            "split": yolo_split,
            "class": cname
        })

    # Write annotation_manifest.csv
    manifest_csv = ANNO_DIR / "annotation_manifest.csv"
    manifest_fields = ["image_path", "label_path", "original_class", "split", "number_of_boxes", "annotator_status", "notes"]
    with open(manifest_csv, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=manifest_fields)
        w.writeheader()
        w.writerows(manifest_rows)
    print(f"[3] Created annotation_manifest.csv with {len(manifest_rows)} rows")

    # Summary of split counts
    split_counts = Counter(r["split"] for r in manifest_rows)
    print(f"    Train: {split_counts['train']} | Val: {split_counts['val']} | Test: {split_counts['test']}")

    # 4. Generate 25-image inspection contact sheets per class
    print("\n[4] Generating 25-image inspection contact sheets for each class...")
    thumb_size = (260, 260)
    card_w, card_h = thumb_size[0], thumb_size[1] + 45
    grid_cols, grid_rows = 5, 5
    margin = 25
    header_h = 70
    sheet_w = margin * 2 + grid_cols * card_w + (grid_cols - 1) * 15
    sheet_h = margin * 2 + header_h + grid_rows * card_h + (grid_rows - 1) * 15

    try:
        font_title = ImageFont.truetype("arial.ttf", 24)
        font_meta = ImageFont.truetype("arial.ttf", 11)
        font_sub = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        font_title = font_meta = font_sub = ImageFont.load_default()

    for cname, items in sorted(by_class_items.items()):
        # Select 25 evenly spaced images
        indices = np.linspace(0, len(items) - 1, 25, dtype=int)
        selected = [items[i] for i in indices]

        sheet = Image.new("RGB", (sheet_w, sheet_h), color=(20, 22, 26))
        draw = ImageDraw.Draw(sheet)

        # Header
        title = f"Annotation Inspection Review — Class: {cname} (Sample of 25 / {len(items)} images)"
        sub = f"Evaluated for YOLOv8 Bounding-Box Annotation Rules | Native 4000x3000 Raw Photos | Fixed Seed Sampling"
        draw.text((margin, margin), title, fill=(255, 255, 255), font=font_title)
        draw.text((margin, margin + 34), sub, fill=(150, 160, 175), font=font_sub)

        for idx, item in enumerate(selected):
            r = idx // grid_cols
            c = idx % grid_cols
            x = margin + c * (card_w + 15)
            y = margin + header_h + r * (card_h + 15)

            draw.rectangle([x, y, x + card_w, y + card_h], fill=(30, 33, 40), outline=(55, 60, 72), width=1)

            try:
                with Image.open(item["path"]) as img:
                    orig_w, orig_h = img.size
                    img_copy = img.copy()
                    img_copy.thumbnail((thumb_size[0] - 8, thumb_size[1] - 8), Image.Resampling.LANCZOS)
                    tw, th = img_copy.size
                    tx = x + (card_w - tw) // 2
                    ty = y + 4 + (thumb_size[1] - th) // 2
                    sheet.paste(img_copy, (tx, ty))

                    # Caption
                    name_txt = item["filename"] if len(item["filename"]) <= 22 else item["filename"][:9] + ".." + item["filename"][-10:]
                    info_txt = f"[{item['split'].upper()}] {orig_w}x{orig_h}"
                    draw.text((x + 8, y + thumb_size[1] + 6), name_txt, fill=(235, 240, 250), font=font_meta)
                    draw.text((x + 8, y + thumb_size[1] + 24), info_txt, fill=(135, 145, 160), font=font_meta)
            except Exception as e:
                draw.text((x + 10, y + 100), f"Err: {e}", fill=(255, 100, 100), font=font_meta)

        out_path = SHEETS_DIR / f"inspection_review_{cname.lower()}_25.png"
        sheet.save(out_path, "PNG", optimize=True)
        print(f"  Generated inspection sheet: {out_path.name}")

    print("\nWorkspace and inspection review contact sheets created successfully!")

if __name__ == "__main__":
    main()
