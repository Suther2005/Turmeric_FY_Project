"""
Full Dataset 01 Candidate Annotation Generator (Grounding DINO Local)
====================================================================
Generates candidate bounding boxes for all 865 images of Dataset 01
using the refined Pilot 02 prompts on local CPU:
  - Aphids_Disease: "visible aphid colony . cluster of aphids . infested foliar patch ."
  - Blotch: "leaf blotch . blotch disease ."
  - Leaf_Spot: "small circular spot . necrotic lesion . fungal spot ."
  - Healthy_Leaf: 0 boxes (negative background calibration)

Features:
  - Preserves existing train/val/test splits
  - Checks if label already exists to support resume
  - Incremental CSV audit writing (real-time progress saving)
  - Strict bounding box normalization to [0.0, 1.0]
  - Discards whole-leaf false positives (area > 0.75) and micro-noise (< 12px)
  - Non-destructive: writes only to auto_annotations/
"""

import os
import csv
import json
import time
import shutil
from pathlib import Path
import numpy as np
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection

BASE_DIR = Path(r"D:\curuma\turmeric_datasets")
MANIFEST_CSV = BASE_DIR / "annotations" / "annotation_manifest.csv"
OUT_BASE = BASE_DIR / "auto_annotations"
OUT_IMG = OUT_BASE / "images"
OUT_LBL = OUT_BASE / "labels"
OUT_AUDIT = OUT_BASE / "audit"

for split in ["train", "val", "test"]:
    (OUT_IMG / split).mkdir(parents=True, exist_ok=True)
    (OUT_LBL / split).mkdir(parents=True, exist_ok=True)
OUT_AUDIT.mkdir(parents=True, exist_ok=True)

AUDIT_CSV = OUT_AUDIT / "dataset_01_candidate_audit.csv"

PROMPTS = {
    "Aphids_Disease": "visible aphid colony . cluster of aphids . infested foliar patch .",
    "Blotch": "leaf blotch . blotch disease .",
    "Leaf_Spot": "small circular spot . necrotic lesion . fungal spot ."
}

CLASS_IDS = {
    "Aphids_Disease": 0,
    "Blotch": 1,
    "Leaf_Spot": 2
}

def apply_nms(boxes, scores, iou_thresh=0.35):
    if len(boxes) == 0:
        return []
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort()[::-1]

    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)
        if order.size == 1:
            break
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])

        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        inter = w * h
        ovr = inter / (areas[i] + areas[order[1:]] - inter)

        inds = np.where(ovr <= iou_thresh)[0]
        order = order[inds + 1]

    return keep

def main():
    print("=" * 75)
    print("FULL DATASET 01 CANDIDATE ANNOTATION PIPELINE (LOCAL GROUNDING DINO)")
    print("=" * 75)

    # 1. Read manifest
    rows = []
    with open(MANIFEST_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)

    total_images = len(rows)
    print(f"Loaded {total_images} Dataset 01 items from manifest.")

    # 2. Check existing audit to resume
    existing_audit = {}
    if AUDIT_CSV.exists():
        with open(AUDIT_CSV, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                existing_audit[r["image_name"]] = r

    print(f"Found {len(existing_audit)} previously processed records in audit CSV.")

    # 3. Load model
    model_id = "IDEA-Research/grounding-dino-tiny"
    print(f"\nLoading local model: {model_id} ...")
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id)
    model.eval()
    print("Model initialized on CPU.\n")

    # Open audit CSV in append/write mode
    audit_fields = [
        "image_name", "split", "original_class", "number_of_boxes",
        "confidence_scores", "mean_confidence", "annotation_status",
        "flagged_suspicious", "reviewer_notes"
    ]

    if not AUDIT_CSV.exists():
        with open(AUDIT_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=audit_fields)
            writer.writeheader()

    start_time = time.time()
    processed_count = 0
    total_boxes_all = 0

    for idx, item in enumerate(rows):
        img_rel = item["image_path"]
        src_path = BASE_DIR / img_rel
        fname = Path(img_rel).name
        split = item["split"]
        cname = item["original_class"]

        dst_img = OUT_IMG / split / fname
        dst_lbl = OUT_LBL / split / (Path(fname).stem + ".txt")

        # Hardlink / copy image
        if not dst_img.exists():
            try:
                os.link(src_path, dst_img)
            except Exception:
                shutil.copy2(src_path, dst_img)

        # Check if already processed
        if fname in existing_audit and dst_lbl.exists():
            continue

        # Open image
        orig_img = Image.open(src_path).convert("RGB")
        img_w, img_h = orig_img.size
        img_area = img_w * img_h

        detected_boxes = []
        confidences = []

        if cname == "Healthy_Leaf":
            # Strict negative background: 0 bytes empty file
            with open(dst_lbl, "w", encoding="utf-8") as f:
                pass
            n_boxes = 0
            mean_conf = 0.0
            status = "AUTO_GENERATED"
            notes = "Healthy leaf: negative background sample (0 boxes)"
            suspicious = False
        else:
            prompt = PROMPTS[cname]
            cid = CLASS_IDS[cname]

            inputs = processor(images=orig_img, text=prompt, return_tensors="pt")
            with torch.inference_mode():
                outputs = model(**inputs)

            results = processor.post_process_grounded_object_detection(
                outputs,
                inputs.input_ids,
                threshold=0.22,
                text_threshold=0.22,
                target_sizes=[(img_h, img_w)]
            )[0]

            raw_boxes = results["boxes"].cpu().numpy()
            raw_scores = results["scores"].cpu().numpy()

            if len(raw_boxes) > 0:
                valid_idx = []
                for b_i, box in enumerate(raw_boxes):
                    bw = box[2] - box[0]
                    bh = box[3] - box[1]
                    area_ratio = (bw * bh) / img_area

                    # Discard boxes < 12px or boxes covering > 75% of image
                    if bw < 12 or bh < 12:
                        continue
                    if area_ratio > 0.75:
                        continue
                    valid_idx.append(b_i)

                if len(valid_idx) > 0:
                    filtered_boxes = raw_boxes[valid_idx]
                    filtered_scores = raw_scores[valid_idx]
                    keep_idx = apply_nms(filtered_boxes, filtered_scores, iou_thresh=0.35)

                    for ki in keep_idx:
                        b = filtered_boxes[ki]
                        s = float(filtered_scores[ki])
                        x1 = max(0.0, float(b[0]))
                        y1 = max(0.0, float(b[1]))
                        x2 = min(float(img_w), float(b[2]))
                        y2 = min(float(img_h), float(b[3]))

                        bw = x2 - x1
                        bh = y2 - y1
                        xc = x1 + bw / 2.0
                        yc = y1 + bh / 2.0

                        norm_xc = xc / img_w
                        norm_yc = yc / img_h
                        norm_bw = bw / img_w
                        norm_bh = bh / img_h

                        detected_boxes.append({
                            "class_id": cid,
                            "yolo": f"{cid} {norm_xc:.6f} {norm_yc:.6f} {norm_bw:.6f} {norm_bh:.6f}",
                            "score": s
                        })
                        confidences.append(s)

            # Write label file
            with open(dst_lbl, "w", encoding="utf-8") as f:
                for b in detected_boxes:
                    f.write(b["yolo"] + "\n")

            n_boxes = len(detected_boxes)
            mean_conf = float(np.mean(confidences)) if confidences else 0.0
            status = "AUTO_GENERATED"

            if n_boxes == 0:
                notes = "WARNING: 0 candidate boxes detected on disease image. Requires manual drawing."
                suspicious = True
            elif n_boxes > 6:
                notes = f"Notice: {n_boxes} boxes detected. Inspect for overlapping spot proposals."
                suspicious = True
            else:
                notes = f"Candidate proposals generated ({n_boxes} boxes, mean conf: {mean_conf:.3f})"
                suspicious = False

        record = {
            "image_name": fname,
            "split": split,
            "original_class": cname,
            "number_of_boxes": n_boxes,
            "confidence_scores": json.dumps([round(c, 3) for c in confidences]),
            "mean_confidence": round(mean_conf, 3),
            "annotation_status": status,
            "flagged_suspicious": suspicious,
            "reviewer_notes": notes
        }

        # Append to audit CSV immediately
        with open(AUDIT_CSV, "a", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=audit_fields)
            w.writerow(record)

        existing_audit[fname] = record
        processed_count += 1
        total_boxes_all += n_boxes

        if processed_count % 10 == 0 or idx == total_images - 1:
            elapsed = time.time() - start_time
            rate = processed_count / max(1.0, elapsed)
            remaining = (total_images - len(existing_audit)) / max(0.01, rate)
            print(f"[{idx+1}/{total_images}] Progress: {len(existing_audit)} done | Last: {fname} ({cname}) -> {n_boxes} boxes | Rate: {rate*60:.1f} img/min | Est remaining: {remaining/60:.1f} min")

    print("\n" + "=" * 75)
    print("CANDIDATE GENERATION FINISHED!")
    print(f"Total images in audit: {len(existing_audit)}")
    print(f"Output audit file: {AUDIT_CSV}")
    print("=" * 75)

if __name__ == "__main__":
    main()
