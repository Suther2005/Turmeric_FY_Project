"""
Turmeric Leaf Detection — Candidate Annotation Refinement Pipeline
===================================================================
Automatically refines candidate leaf bounding boxes for Dataset 01:
  1. Detects actual green & diseased foliar lamina inside candidate boxes.
  2. Tightens bounding boxes to the visible leaf boundary.
  3. Removes background paper and shadow-only candidate boxes.
  4. Prunes false positives (edge noise, tiny dust slivers < 1.5% frame).
  5. Decouples and splits multi-leaf clusters into one box per leaf.
  6. Preserves single class: class_id = 0 ('leaf').
  7. Outputs standardized YOLO format (<0> <xc> <yc> <w> <h>).

Outputs:
  - Refined label files (.txt): turmeric_datasets/auto_annotations/leaf_refined/
  - Detailed Report:            turmeric_datasets/auto_annotations/leaf_refinement_report.md
  - Audit CSV:                  turmeric_datasets/auto_annotations/leaf_refinement_audit.csv

NOTE: Refined boxes are high-precision automated candidate proposals.
They are NOT ground truth until explicitly ACCEPTED or REJECTED by human review.
"""

import os
import sys
import csv
import json
import time
from pathlib import Path
import cv2
import numpy as np

BASE_DIR = Path(r"d:\curuma\turmeric_datasets")
DATASET_DIR = BASE_DIR / "dataset_01" / "original"
CANDIDATE_DIR = BASE_DIR / "auto_annotations" / "leaf_candidates"
REFINED_DIR = BASE_DIR / "auto_annotations" / "leaf_refined"
REFINED_DIR.mkdir(parents=True, exist_ok=True)

REPORT_MD = BASE_DIR / "auto_annotations" / "leaf_refinement_report.md"
AUDIT_CSV = BASE_DIR / "auto_annotations" / "leaf_refinement_audit.csv"

CATEGORIES = ["Aphids_Disease", "Blotch", "Healthy_Leaf", "Leaf_Spot"]

def refine_image_candidates(img_path, cand_path):
    """
    Refines candidate bounding boxes for an individual image.
    Returns:
      refined_boxes: list of tuples (0, xc, yc, w, h)
      stats: dict tracking before, after, removed, split_added, uncertain, reasons
    """
    img = cv2.imread(str(img_path))
    if img is None:
        return [], {"error": "Image read failure", "before": 0, "after": 0, "removed": 0, "split_added": 0, "uncertain": True, "reasons": ["OpenCV read error"]}

    h_orig, w_orig = img.shape[:2]
    
    # Scale to standard working resolution (1000px max dimension)
    scale = 1000.0 / max(h_orig, w_orig)
    w_work = int(round(w_orig * scale))
    h_work = int(round(h_orig * scale))
    small = cv2.resize(img, (w_work, h_work), interpolation=cv2.INTER_AREA)
    
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    total_area = float(w_work * h_work)
    
    # 1. Background luma estimation from image corners
    corners = np.concatenate([
        small[:30, :30].reshape(-1, 3),
        small[:30, -30:].reshape(-1, 3),
        small[-30:, :30].reshape(-1, 3),
        small[-30:, -30:].reshape(-1, 3)
    ])
    bg_luma = float(np.median(np.mean(corners, axis=1)))
    
    # 2. Turmeric foliar segmentation
    # Green and yellow-green foliar blade
    leaf_green = (hsv[:, :, 0] >= 14) & (hsv[:, :, 0] <= 95) & (hsv[:, :, 1] >= 24)
    # Chlorotic yellow / orange-yellow halo
    leaf_yellow = (hsv[:, :, 0] >= 10) & (hsv[:, :, 0] <= 35) & (hsv[:, :, 1] >= 35)
    # Dark brown necrotic spots (blotch, leaf spot): low value, residual chroma
    leaf_necrotic = (hsv[:, :, 2] < min(130, bg_luma - 35)) & (hsv[:, :, 1] >= 14)
    
    # Otsu on inverted grayscale to bridge veins and pale petioles, masked to eliminate achromatic paper shadows
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)
    _, otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    otsu_foliar = (otsu > 0) & ((hsv[:, :, 1] >= 20) | (gray < bg_luma - 45))
    
    raw_foliar = (leaf_green | leaf_yellow | leaf_necrotic | otsu_foliar).astype(np.uint8) * 255
    # Zero 2-pixel margin around image perimeter
    raw_foliar[0:2, :] = 0
    raw_foliar[-2:, :] = 0
    raw_foliar[:, 0:2] = 0
    raw_foliar[:, -2:] = 0
    
    clean_foliar = cv2.morphologyEx(raw_foliar, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    clean_foliar = cv2.morphologyEx(clean_foliar, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    
    # Load candidate boxes
    cand_boxes = []
    if cand_path.exists():
        with open(cand_path, "r", encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 5:
                    cand_boxes.append((int(parts[0]), float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])))
                    
    refined_boxes = []
    removed_count = 0
    split_added_count = 0
    reasons = []
    uncertain = False
    
    min_leaf_area = 0.015 * total_area  # Exclude tiny slivers < 1.5% frame
    
    # If no candidate boxes existed, attempt direct global contour recovery
    if len(cand_boxes) == 0:
        cnts, _ = cv2.findContours(clean_foliar, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in cnts:
            if cv2.contourArea(c) >= min_leaf_area:
                x, y, w, h = cv2.boundingRect(c)
                xc = max(0.0, min(1.0, (x + w/2.0) / w_work))
                yc = max(0.0, min(1.0, (y + h/2.0) / h_work))
                wn = max(0.0, min(1.0, w / float(w_work)))
                hn = max(0.0, min(1.0, h / float(h_work)))
                refined_boxes.append((0, xc, yc, wn, hn))
                split_added_count += 1
                reasons.append("Recovered leaf box from unannotated candidate")
                
    for b in cand_boxes:
        cls_id, xc, yc, bw, bh = b
        x1 = max(0, int((xc - bw/2.0) * w_work))
        y1 = max(0, int((yc - bh/2.0) * h_work))
        x2 = min(w_work, int((xc + bw/2.0) * w_work))
        y2 = min(h_work, int((yc + bh/2.0) * h_work))
        
        box_area = (x2 - x1) * (y2 - y1)
        if box_area <= 0:
            removed_count += 1
            reasons.append("Degenerate 0-area candidate removed")
            continue
            
        crop_mask = clean_foliar[y1:y2, x1:x2]
        foliar_pixels = int(np.sum(crop_mask > 0))
        foliar_ratio = foliar_pixels / float(box_area)
        frame_ratio = foliar_pixels / total_area
        
        # False positive & shadow check:
        # If true foliar pixels are under 6% of candidate area and under 1% of total frame,
        # or foliar area is under 0.6% of frame area, it is background shadow/paper.
        if (foliar_ratio < 0.06 and frame_ratio < 0.010) or frame_ratio < 0.006:
            removed_count += 1
            reasons.append(f"Removed shadow/background false positive (foliar fill: {foliar_ratio*100:.1f}%)")
            continue
            
        # Check for multiple separate leaf components inside candidate box
        cnts, _ = cv2.findContours(crop_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_sub_cnts = [c for c in cnts if cv2.contourArea(c) >= min_leaf_area]
        
        if len(valid_sub_cnts) > 1:
            # Decouple multi-leaf cluster into separate boxes
            split_added_count += (len(valid_sub_cnts) - 1)
            reasons.append(f"Split multi-leaf cluster into {len(valid_sub_cnts)} distinct leaves")
            for sc in valid_sub_cnts:
                sx, sy, sbw, sbh = cv2.boundingRect(sc)
                # Tighten with 1px padding
                rx1 = max(0, x1 + sx - 1)
                ry1 = max(0, y1 + sy - 1)
                rx2 = min(w_work, x1 + sx + sbw + 1)
                ry2 = min(h_work, y1 + sy + sbh + 1)
                
                r_xc = max(0.0, min(1.0, (rx1 + rx2) / 2.0 / w_work))
                r_yc = max(0.0, min(1.0, (ry1 + ry2) / 2.0 / h_work))
                r_w = max(0.0, min(1.0, (rx2 - rx1) / float(w_work)))
                r_h = max(0.0, min(1.0, (ry2 - ry1) / float(h_work)))
                refined_boxes.append((0, r_xc, r_yc, r_w, r_h))
        else:
            # Single leaf inside box: tighten to visible leaf boundary
            if len(valid_sub_cnts) == 1:
                sx, sy, sbw, sbh = cv2.boundingRect(valid_sub_cnts[0])
                rx1 = max(0, x1 + sx - 1)
                ry1 = max(0, y1 + sy - 1)
                rx2 = min(w_work, x1 + sx + sbw + 1)
                ry2 = min(h_work, y1 + sy + sbh + 1)
            else:
                # Connected component below min_leaf_area individually, find overall non-zero bounds
                nz_y, nz_x = np.where(crop_mask > 0)
                if len(nz_y) == 0:
                    removed_count += 1
                    reasons.append("Zero foliar pixels inside box; removed")
                    continue
                rx1 = max(0, x1 + int(np.min(nz_x)) - 1)
                ry1 = max(0, y1 + int(np.min(nz_y)) - 1)
                rx2 = min(w_work, x1 + int(np.max(nz_x)) + 1)
                ry2 = min(h_work, y1 + int(np.max(nz_y)) + 1)
                
            r_xc = max(0.0, min(1.0, (rx1 + rx2) / 2.0 / w_work))
            r_yc = max(0.0, min(1.0, (ry1 + ry2) / 2.0 / h_work))
            r_w = max(0.0, min(1.0, (rx2 - rx1) / float(w_work)))
            r_h = max(0.0, min(1.0, (ry2 - ry1) / float(h_work)))
            refined_boxes.append((0, r_xc, r_yc, r_w, r_h))
            
    # Deduplicate heavily overlapping boxes (IoU > 0.85)
    final_boxes = []
    for b in refined_boxes:
        _, xc, yc, w, h = b
        x1 = xc - w/2.0
        y1 = yc - h/2.0
        x2 = xc + w/2.0
        y2 = yc + h/2.0
        duplicate = False
        for fb in final_boxes:
            _, f_xc, f_yc, f_w, f_h = fb
            fx1 = f_xc - f_w/2.0
            fy1 = f_yc - f_h/2.0
            fx2 = f_xc + f_w/2.0
            fy2 = f_yc + f_h/2.0
            
            inter_w = max(0.0, min(x2, fx2) - max(x1, fx1))
            inter_h = max(0.0, min(y2, fy2) - max(y1, fy1))
            inter_area = inter_w * inter_h
            union_area = (w * h) + (f_w * f_h) - inter_area
            iou = inter_area / union_area if union_area > 0 else 0
            if iou > 0.85:
                duplicate = True
                break
        if not duplicate:
            final_boxes.append(b)
            
    # Check uncertainty conditions
    if len(final_boxes) == 0:
        uncertain = True
        reasons.append("0 refined boxes remaining; reviewer inspection recommended")
    else:
        for b in final_boxes:
            _, xc, yc, w, h = b
            # If box covers almost the entire image (>85%)
            if (w * h) > 0.85:
                uncertain = True
                reasons.append("Refined box spans >85% of frame")
            # Border touching on multiple sides
            borders_touched = sum([
                (xc - w/2.0 <= 0.005),
                (xc + w/2.0 >= 0.995),
                (yc - h/2.0 <= 0.005),
                (yc + h/2.0 >= 0.995)
            ])
            if borders_touched >= 3:
                uncertain = True
                reasons.append("Refined box contacts >=3 image borders")

    stats = {
        "before": len(cand_boxes),
        "after": len(final_boxes),
        "removed": removed_count,
        "split_added": split_added_count,
        "uncertain": uncertain,
        "reasons": reasons
    }
    return final_boxes, stats

def main():
    print("=" * 70)
    print("TURMERIC LEAF DETECTION — CANDIDATE ANNOTATION REFINEMENT")
    print("=" * 70)
    start_time = time.time()
    
    all_images = []
    for cat in CATEGORIES:
        cat_dir = DATASET_DIR / cat
        if not cat_dir.exists():
            continue
        imgs = sorted(list(cat_dir.glob("*.jpg")) + list(cat_dir.glob("*.jpeg")) + list(cat_dir.glob("*.png")))
        for img in imgs:
            all_images.append((cat, img))
            
    total_imgs = len(all_images)
    print(f"Loaded {total_imgs} images for refinement.")
    
    audit_rows = []
    total_before = 0
    total_after = 0
    total_removed = 0
    total_split_added = 0
    uncertain_images = []
    
    cat_summary = {c: {"imgs": 0, "before": 0, "after": 0, "removed": 0, "split_added": 0, "uncertain": 0} for c in CATEGORIES}
    
    for idx, (cat, img_path) in enumerate(all_images, 1):
        stem = img_path.stem
        cand_path = CANDIDATE_DIR / f"{stem}.txt"
        
        refined_boxes, stats = refine_image_candidates(img_path, cand_path)
        
        # Save refined YOLO label file
        refined_file = REFINED_DIR / f"{stem}.txt"
        with open(refined_file, "w", encoding="utf-8") as rf:
            for b in refined_boxes:
                cls_id, xc, yc, w, h = b
                rf.write(f"{cls_id} {xc:.6f} {yc:.6f} {w:.6f} {h:.6f}\n")
                
        b_cnt = stats["before"]
        a_cnt = stats["after"]
        r_cnt = stats["removed"]
        s_cnt = stats["split_added"]
        is_unc = stats["uncertain"]
        
        total_before += b_cnt
        total_after += a_cnt
        total_removed += r_cnt
        total_split_added += s_cnt
        
        cat_summary[cat]["imgs"] += 1
        cat_summary[cat]["before"] += b_cnt
        cat_summary[cat]["after"] += a_cnt
        cat_summary[cat]["removed"] += r_cnt
        cat_summary[cat]["split_added"] += s_cnt
        if is_unc:
            cat_summary[cat]["uncertain"] += 1
            uncertain_images.append({
                "image": f"{cat}/{img_path.name}",
                "stem": stem,
                "category": cat,
                "before": b_cnt,
                "after": a_cnt,
                "reasons": "; ".join(stats["reasons"])
            })
            
        audit_rows.append({
            "category": cat,
            "filename": img_path.name,
            "stem": stem,
            "boxes_before": b_cnt,
            "boxes_after": a_cnt,
            "boxes_removed": r_cnt,
            "boxes_split_added": s_cnt,
            "is_uncertain": "YES" if is_unc else "NO",
            "reasons": "; ".join(stats["reasons"])
        })
        
        if idx % 100 == 0 or idx == total_imgs:
            print(f"Processed {idx}/{total_imgs} ({idx/total_imgs*100:.1f}%) | "
                  f"Refined boxes: {total_after} | Removed: {total_removed} | Split/Added: {total_split_added}")
            
    elapsed = time.time() - start_time
    print(f"\nRefinement completed in {elapsed:.2f}s ({elapsed/total_imgs*1000:.1f} ms/image).")
    
    # Write Audit CSV
    with open(AUDIT_CSV, "w", newline="", encoding="utf-8") as cf:
        fieldnames = ["category", "filename", "stem", "boxes_before", "boxes_after", "boxes_removed", "boxes_split_added", "is_uncertain", "reasons"]
        writer = csv.DictWriter(cf, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(audit_rows)
    print(f"Saved audit CSV: {AUDIT_CSV}")
    
    # Write Markdown Report
    generate_markdown_report(total_imgs, total_before, total_after, total_removed, total_split_added, uncertain_images, cat_summary, elapsed)
    print(f"Saved refinement report: {REPORT_MD}")

def generate_markdown_report(total_imgs, total_before, total_after, total_removed, total_split_added, uncertain_images, cat_summary, elapsed):
    lines = [
        "# Turmeric Leaf Detection — Candidate Annotation Refinement Report",
        "",
        "> [!IMPORTANT]",
        "> **AUTOMATED REFINEMENT DECLARATION**  ",
        "> These bounding boxes represent **refined automated candidate proposals** that have undergone foliar chroma isolation, background shadow removal, boundary tightening, and cluster decoupling.  ",
        "> They are **NOT** yet certified ground truth. Human review via the visual review tool is strictly required to explicitly **ACCEPT** or **REJECT** each image.",
        "",
        "## 1. Executive Summary",
        "",
        "| Metric | Value | Impact / Interpretation |",
        "| :--- | :---: | :--- |",
        f"| **Total Images Processed** | **{total_imgs}** | 100% of Dataset 01 cohort |",
        f"| **Candidate Boxes Before Refinement** | **{total_before}** | Initial heuristic proposals |",
        f"| **Refined Candidate Boxes After** | **{total_after}** | Cleaned, tightened leaf proposals |",
        f"| **Boxes Removed (False Positives/Shadows)** | **{total_removed}** | Pruned corner shadows and achromatic paper artifacts |",
        f"| **Boxes Split / Added** | **{total_split_added}** | Decoupled multi-leaf clusters into independent boxes |",
        f"| **Images with Uncertain Refinement** | **{len(uncertain_images)}** ({len(uncertain_images)/total_imgs*100:.1f}%) | Flagged for priority reviewer attention |",
        f"| **Total Processing Time** | **{elapsed:.2f}s** | {elapsed/total_imgs*1000:.1f} ms/image |",
        "",
        "---",
        "",
        "## 2. Refinement Actions by Pathology Cohort",
        "",
        "| Pathology Class | Images | Boxes Before | Boxes After | Removed (Shadows) | Split / Added | Uncertain Images |",
        "| :--- | :---: | :---: | :---: | :---: | :---: | :---: |"
    ]
    
    for cat, s in cat_summary.items():
        lines.append(f"| **`{cat}`** | {s['imgs']} | {s['before']} | {s['after']} | {s['removed']} | {s['split_added']} | {s['uncertain']} |")
        
    lines.extend([
        f"| **TOTAL** | **{total_imgs}** | **{total_before}** | **{total_after}** | **{total_removed}** | **{total_split_added}** | **{len(uncertain_images)}** |",
        "",
        "---",
        "",
        "## 3. Detailed Refinement Rules Applied",
        "",
        "1. **Foliar Chroma Detection**: Filtered for turmeric leaf pigments ($H \\in [14, 95], S \\ge 24$ for green lamina; $H \\in [10, 35], S \\ge 35$ for chlorotic halos; $V < 130, S \\ge 14$ for necrotic blotch/spot lesions).",
        "2. **Boundary Tightening**: Projected foliar mask to outermost lamina edges, eliminating generous padding while preserving tips and petiole bases.",
        "3. **Shadow & False-Positive Pruning**: Removed candidate boxes where true foliar coverage was $< 6\\%$ or total area $< 0.6\\%$ of frame (e.g. corner vignetting, paper table edges).",
        "4. **Multi-Leaf Decoupling**: Detected multi-blade components inside single candidate boxes and split them into distinct, tight boxes (`class_id = 0`).",
        "5. **Format Preservation**: All boxes output in standard YOLO normalized format (`0 <xc> <yc> <w> <h>`) clamped to $[0.0, 1.0]$.",
        "",
        "---",
        "",
        "## 4. Images with Uncertain Refinement (Human Review Priority)",
        "",
        f"A total of **{len(uncertain_images)}** images have been flagged where automated heuristics detected potential edge truncation, extreme frame span (>85%), or borderline foliar fill:",
        "",
        "| Image Name | Pathology | Before | After | Refinement Notes / Reasons |",
        "| :--- | :--- | :---: | :---: | :--- |"
    ])
    
    for u in uncertain_images[:25]:
        lines.append(f"| `{u['image']}` | {u['category']} | {u['before']} | {u['after']} | {u['reasons']} |")
    if len(uncertain_images) > 25:
        lines.append(f"| *(...and {len(uncertain_images) - 25} more)* | — | — | — | Full details in `leaf_refinement_audit.csv` |")
        
    lines.extend([
        "",
        "---",
        "",
        "## 5. Next Steps for Reviewer",
        "",
        "The review tool has been updated to load the **Refined Candidates** (`turmeric_datasets/auto_annotations/leaf_refined/`) by default.",
        "Launch the tool to review:",
        "```bash",
        "python turmeric_datasets/scripts/leaf_review_tool.py --port 5050",
        "```",
        "Human reviewers primarily need to press **`A`** (Accept) for well-tightened boxes, or **`R`** (Reject) for invalid specimens.",
        ""
    ])
    
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

if __name__ == "__main__":
    main()
