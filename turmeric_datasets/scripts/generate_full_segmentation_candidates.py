"""
Full Dataset 01 Segmentation-Assisted Candidate Annotation Pipeline
===================================================================
Processes all 865 original images in Dataset 01 (train: 606, val: 130, test: 129)
strictly in isolation under D:\\curuma\\turmeric_datasets\\auto_annotations.

Rules:
- Raw images in dataset_01\\original and annotations\\ are NOT modified.
- Dataset 02 is NOT touched.
- All candidate boxes are marked AUTO_GENERATED (never VERIFIED).
- No automated severity is assigned (severity = UNASSIGNED).
- Healthy_Leaf images are recorded as negative background controls (0 boxes).
- An audit record is maintained for every single image in dataset_01_candidate_audit.csv.
"""

import os
import sys
import csv
import time
from pathlib import Path
import shutil
from PIL import Image, ImageOps
import cv2
import numpy as np
from concurrent.futures import ProcessPoolExecutor, as_completed

BASE_DIR = Path(r"D:\curuma\turmeric_datasets")
SRC_IMG_BASE = BASE_DIR / "annotations" / "images"
OUT_BASE = BASE_DIR / "auto_annotations"
OUT_IMG_BASE = OUT_BASE / "images"
OUT_LBL_BASE = OUT_BASE / "labels"
OUT_AUDIT_DIR = OUT_BASE / "audit"

SPLITS = ["train", "val", "test"]

CLASS_MAP = {
    "aphids_disease": {"id": 0, "name": "Aphids_Disease"},
    "blotch": {"id": 1, "name": "Blotch"},
    "leaf_spot": {"id": 2, "name": "Leaf_Spot"},
    "healthy": {"id": -1, "name": "Healthy_Leaf"},
}

def get_class_info(filename):
    lower = filename.lower()
    for prefix, info in CLASS_MAP.items():
        if lower.startswith(prefix):
            return info
    return {"id": -1, "name": "Unknown"}

def segment_leaf(img):
    """
    Segment host leaf lamina using HSV color chromaticity.
    Excludes white sheet and neutral gray shadows.
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    H, S, V = cv2.split(hsv)

    foliar_mask = ((H >= 10) & (H <= 98) & (S >= 28) & (V >= 35)).astype(np.uint8) * 255

    close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    foliar_mask = cv2.morphologyEx(foliar_mask, cv2.MORPH_CLOSE, close_kernel)
    foliar_mask = cv2.morphologyEx(foliar_mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))

    contours, _ = cv2.findContours(foliar_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        main_c = max(contours, key=cv2.contourArea)
        mask = np.zeros_like(foliar_mask)
        cv2.drawContours(mask, [main_c], -1, 255, -1)
        cv2.drawContours(mask, contours, -1, 255, -1)
        inner = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
        return mask, inner

    return foliar_mask, foliar_mask

def detect_aphid_clusters(img, leaf_mask, inner_leaf):
    """
    Isolate localized aphid colonies and chlorotic puncture damage clusters.
    """
    h, w = img.shape[:2]
    img_area = w * h
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    L, a, b = cv2.split(lab)

    leaf_pixels_a = a[inner_leaf > 0]
    leaf_pixels_L = L[inner_leaf > 0]
    if len(leaf_pixels_a) == 0:
        return []

    med_a = np.median(leaf_pixels_a)
    med_L = np.median(leaf_pixels_L)

    chlorosis_saliency = np.maximum(0, (a.astype(float) - med_a) * 1.2 + (L.astype(float) - med_L) * 0.8)
    chlorosis_saliency = (chlorosis_saliency * (inner_leaf > 0) / 255.0).astype(np.float32)

    valid_vals = chlorosis_saliency[inner_leaf > 0]
    if len(valid_vals) == 0:
        return []

    p_thresh = np.percentile(valid_vals, 85)
    bin_damage = ((chlorosis_saliency >= p_thresh) & (inner_leaf > 0)).astype(np.uint8) * 255

    cluster_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    clustered = cv2.morphologyEx(bin_damage, cv2.MORPH_CLOSE, cluster_kernel)
    clustered = cv2.morphologyEx(clustered, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))

    cnts, _ = cv2.findContours(clustered, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for c in cnts:
        area = cv2.contourArea(c)
        if (img_area * 0.0005) < area < (img_area * 0.15):
            x, y, bw, bh = cv2.boundingRect(c)
            pad = 10
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(w, x + bw + pad)
            y2 = min(h, y + bh + pad)

            roi_leaf = inner_leaf[y1:y2, x1:x2]
            if np.mean(roi_leaf > 0) > 0.40:
                boxes.append((x1, y1, x2 - x1, y2 - y1, area))

    boxes = sorted(boxes, key=lambda b: b[4], reverse=True)[:6]
    return [(b[0], b[1], b[2], b[3]) for b in boxes]

def detect_blotch_patches(img, leaf_mask, inner_leaf):
    """
    Isolate contiguous yellow-brown to dark necrotic blotches (Taphrina maculans).
    """
    h, w = img.shape[:2]
    img_area = w * h
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    H, S, V = cv2.split(hsv)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    L, a, b = cv2.split(lab)

    leaf_a = a[leaf_mask > 0]
    med_a = np.median(leaf_a) if len(leaf_a) > 0 else 128

    is_necrotic = (((H < 32) & (S > 50) & (V < 220)) | ((a.astype(int) - med_a > 8) & (V < 190))) & (leaf_mask > 0)
    blotch_bin = is_necrotic.astype(np.uint8) * 255

    c_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35))
    blotch_bin = cv2.morphologyEx(blotch_bin, cv2.MORPH_CLOSE, c_kernel)
    blotch_bin = cv2.morphologyEx(blotch_bin, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))

    cnts, _ = cv2.findContours(blotch_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for c in cnts:
        area = cv2.contourArea(c)
        if (img_area * 0.002) < area < (img_area * 0.45):
            x, y, bw, bh = cv2.boundingRect(c)
            pad = 12
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(w, x + bw + pad)
            y2 = min(h, y + bh + pad)

            roi_leaf = leaf_mask[y1:y2, x1:x2]
            if np.mean(roi_leaf > 0) > 0.45:
                boxes.append((x1, y1, x2 - x1, y2 - y1, area))

    boxes = sorted(boxes, key=lambda b: b[4], reverse=True)[:5]
    return [(b[0], b[1], b[2], b[3]) for b in boxes]

def detect_circular_spots(img, leaf_mask, inner_leaf):
    """
    Isolate discrete circular necrotic leaf spots (Colletotrichum capsici).
    """
    h, w = img.shape[:2]
    img_area = w * h
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    bh_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35))
    blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, bh_kernel)
    blackhat_leaf = cv2.bitwise_and(blackhat, blackhat, mask=inner_leaf)

    valid_vals = blackhat_leaf[inner_leaf > 0]
    if len(valid_vals) == 0:
        return []

    thresh = np.percentile(valid_vals, 97.5)
    _, bin_spots = cv2.threshold(blackhat_leaf, thresh, 255, cv2.THRESH_BINARY)

    c_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    bin_spots = cv2.morphologyEx(bin_spots, cv2.MORPH_CLOSE, c_kernel)
    bin_spots = cv2.morphologyEx(bin_spots, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))

    cnts, _ = cv2.findContours(bin_spots, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for c in cnts:
        area = cv2.contourArea(c)
        if 200 < area < (img_area * 0.02):
            x, y, bw, bh = cv2.boundingRect(c)
            ar = bw / max(1, bh)
            if 0.35 <= ar <= 2.8:
                pad = 6
                x1 = max(0, x - pad)
                y1 = max(0, y - pad)
                x2 = min(w, x + bw + pad)
                y2 = min(h, y + bh + pad)

                roi_leaf = inner_leaf[y1:y2, x1:x2]
                if np.mean(roi_leaf > 0) > 0.60:
                    boxes.append((x1, y1, x2 - x1, y2 - y1, area))

    boxes = sorted(boxes, key=lambda b: b[4], reverse=True)[:10]
    return [(b[0], b[1], b[2], b[3]) for b in boxes]

def process_single_image(args):
    src_path, split, dst_img_path, dst_lbl_path = args
    filename = src_path.name
    class_info = get_class_info(filename)
    cid = class_info["id"]
    cname = class_info["name"]

    # Safe orientation-normalization for working copy inside auto_annotations only
    # Preserves the original image file unchanged.
    need_normalize = False
    with Image.open(src_path) as im_check:
        exif = im_check.getexif()
        orient = exif.get(0x0112, 1)
        if orient in [2, 3, 4, 5, 6, 7, 8]:
            need_normalize = True

    if need_normalize:
        if dst_img_path.exists():
            dst_img_path.unlink()  # Ensure hardlink is broken before writing!
        with Image.open(src_path) as im_raw:
            transposed = ImageOps.exif_transpose(im_raw)
            transposed.save(dst_img_path, quality=95, exif=b"")
    elif not dst_img_path.exists():
        try:
            os.link(src_path, dst_img_path)
        except Exception:
            shutil.copy2(src_path, dst_img_path)

    # If Healthy_Leaf -> 0 boxes
    if cid == -1:
        with open(dst_lbl_path, "w", encoding="utf-8") as f:
            pass  # Empty file for YOLO negative sample
        return {
            "image_name": filename,
            "split": split,
            "original_class": cname,
            "number_of_boxes": 0,
            "mean_area_ratio": 0.0,
            "annotation_status": "AUTO_GENERATED",
            "severity": "UNASSIGNED",
            "reviewer_notes": "Negative background sample (Healthy Leaf)."
        }

    img_cv = cv2.imread(str(dst_img_path))
    if img_cv is None:
        with open(dst_lbl_path, "w", encoding="utf-8") as f:
            pass
        return {
            "image_name": filename,
            "split": split,
            "original_class": cname,
            "number_of_boxes": 0,
            "mean_area_ratio": 0.0,
            "annotation_status": "AUTO_GENERATED",
            "severity": "UNASSIGNED",
            "reviewer_notes": "FAILED_READ: Image could not be decoded."
        }

    h, w = img_cv.shape[:2]
    img_area = w * h
    leaf_mask, inner_leaf = segment_leaf(img_cv)

    if cid == 0:
        pixel_boxes = detect_aphid_clusters(img_cv, leaf_mask, inner_leaf)
    elif cid == 1:
        pixel_boxes = detect_blotch_patches(img_cv, leaf_mask, inner_leaf)
    elif cid == 2:
        pixel_boxes = detect_circular_spots(img_cv, leaf_mask, inner_leaf)
    else:
        pixel_boxes = []

    yolo_lines = []
    area_ratios = []
    for (bx, by, bw, bh) in pixel_boxes:
        xc = (bx + bw / 2.0) / w
        yc = (by + bh / 2.0) / h
        nw = bw / float(w)
        nh = bh / float(h)
        yolo_lines.append(f"{cid} {xc:.6f} {yc:.6f} {nw:.6f} {nh:.6f}")
        area_ratios.append((bw * bh) / img_area)

    with open(dst_lbl_path, "w", encoding="utf-8") as f:
        for l in yolo_lines:
            f.write(l + "\n")

    n_boxes = len(pixel_boxes)
    mean_area = float(np.mean(area_ratios)) if area_ratios else 0.0

    notes = f"Generated {n_boxes} candidate proposals."
    if n_boxes == 0:
        notes = "SUSPICIOUS: 0 candidate boxes detected on disease image."

    return {
        "image_name": filename,
        "split": split,
        "original_class": cname,
        "number_of_boxes": n_boxes,
        "mean_area_ratio": round(mean_area, 4),
        "annotation_status": "AUTO_GENERATED",
        "severity": "UNASSIGNED",
        "reviewer_notes": notes
    }

def main():
    start_time = time.time()
    print("=" * 80)
    print("EXECUTING DATASET 01 FULL CANDIDATE ANNOTATION PIPELINE")
    print("Method: Segmentation-Assisted Pathology Detection (Foliar Lamina Saliency)")
    print("=" * 80)

    for split in SPLITS:
        (OUT_IMG_BASE / split).mkdir(parents=True, exist_ok=True)
        (OUT_LBL_BASE / split).mkdir(parents=True, exist_ok=True)
    OUT_AUDIT_DIR.mkdir(parents=True, exist_ok=True)

    # Gather tasks
    tasks = []
    for split in SPLITS:
        s_dir = SRC_IMG_BASE / split
        img_files = sorted([f for f in s_dir.iterdir() if f.suffix.lower() in [".jpg", ".jpeg", ".png"]])
        for img_path in img_files:
            dst_img = OUT_IMG_BASE / split / img_path.name
            dst_lbl = OUT_LBL_BASE / split / (img_path.stem + ".txt")
            tasks.append((img_path, split, dst_img, dst_lbl))

    total_tasks = len(tasks)
    print(f"Discovered {total_tasks} total images across train, val, test splits.")

    results = []
    print("Processing images in parallel across CPU workers...")

    # Use 4 workers to balance memory bandwidth on 12-megapixel images
    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(process_single_image, t) for t in tasks]
        for i, future in enumerate(as_completed(futures), 1):
            res = future.result()
            results.append(res)
            if i % 100 == 0 or i == total_tasks:
                print(f"Progress: [{i}/{total_tasks}] images processed ({i/total_tasks*100:.1f}%)")

    # Sort results deterministically by split and filename
    results = sorted(results, key=lambda r: (r["split"], r["image_name"]))

    # Save master audit CSV
    audit_csv = OUT_AUDIT_DIR / "dataset_01_candidate_audit.csv"
    with open(audit_csv, "w", newline="", encoding="utf-8") as f:
        fields = ["image_name", "split", "original_class", "number_of_boxes", "mean_area_ratio", "annotation_status", "severity", "reviewer_notes"]
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(results)

    elapsed = time.time() - start_time

    # Compute detailed statistics
    total_images = len(results)
    total_boxes = sum(r["number_of_boxes"] for r in results)

    class_stats = {}
    for r in results:
        c = r["original_class"]
        if c not in class_stats:
            class_stats[c] = {"images": 0, "boxes": 0, "zero_boxes": 0}
        class_stats[c]["images"] += 1
        class_stats[c]["boxes"] += r["number_of_boxes"]
        if r["number_of_boxes"] == 0:
            class_stats[c]["zero_boxes"] += 1

    suspicious = [r for r in results if "SUSPICIOUS" in r["reviewer_notes"]]
    failed = [r for r in results if "FAILED" in r["reviewer_notes"]]

    print("\n" + "=" * 80)
    print("FULL CANDIDATE ANNOTATION GENERATION COMPLETE")
    print("=" * 80)
    print(f"Total Images Processed: {total_images}")
    print(f"Total Candidate Boxes:  {total_boxes}")
    print(f"Processing Elapsed Time:{elapsed:.1f} seconds")
    print(f"Audit Manifest Saved:   {audit_csv}")
    print("-" * 80)
    print("BREAKDOWN BY CLASS:")
    for c, s in sorted(class_stats.items()):
        print(f"  - {c:<16}: {s['images']:>4} images | {s['boxes']:>5} boxes | {s['zero_boxes']:>3} with 0 boxes")
    print("-" * 80)
    print(f"Total Images with 0 boxes: {sum(s['zero_boxes'] for s in class_stats.values())}")
    print(f"  - Healthy_Leaf (expected negatives): {class_stats.get('Healthy_Leaf', {}).get('zero_boxes', 0)}")
    print(f"  - Diseased Images with 0 boxes:     {len(suspicious)}")
    print(f"Failed / Unreadable Images:            {len(failed)}")
    print("=" * 80)

if __name__ == "__main__":
    main()
