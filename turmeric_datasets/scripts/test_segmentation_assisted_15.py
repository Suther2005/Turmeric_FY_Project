"""
Segmentation-Assisted Pathology Candidate Detection (15-Image Test) - Refined
=============================================================================
High-precision, local, segmentation-assisted lesion extraction for
turmeric leaf disease detection with strict vegetation lamina isolation:
  - Aphids_Disease: Localized feeding chlorosis & puncture damage clusters (strictly on leaf lamina)
  - Blotch: Contiguous necrotic patches (Taphrina maculans)
  - Leaf_Spot: Discrete circular lesions (Colletotrichum capsici)

Outputs:
  - D:\\curuma\\turmeric_datasets\\auto_annotations\\labels\\train\\
  - D:\\curuma\\turmeric_datasets\\auto_annotations\\audit\\segmentation_assisted_15_audit.csv
  - D:\\curuma\\turmeric_datasets\\auto_annotations\\audit\\segmentation_assisted_15_contact_sheet.png
"""

import os
import csv
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(r"D:\curuma\turmeric_datasets")
SRC_DIR = BASE_DIR / "annotations" / "images" / "train"
OUT_BASE = BASE_DIR / "auto_annotations"
OUT_IMG = OUT_BASE / "images" / "train"
OUT_LBL = OUT_BASE / "labels" / "train"
OUT_AUDIT = OUT_BASE / "audit"

for d in [OUT_IMG, OUT_LBL, OUT_AUDIT]:
    d.mkdir(parents=True, exist_ok=True)

TEST_15_IMAGES = [
    # 5 Aphids_Disease (Class ID 0)
    {"file": "aphids_disease_(50).jpg", "class_name": "Aphids_Disease", "class_id": 0},
    {"file": "aphids_disease_(59).jpg", "class_name": "Aphids_Disease", "class_id": 0},
    {"file": "aphids_disease_(100).jpg", "class_name": "Aphids_Disease", "class_id": 0},
    {"file": "aphids_disease_(131).jpg", "class_name": "Aphids_Disease", "class_id": 0},
    {"file": "aphids_disease_(14).jpg", "class_name": "Aphids_Disease", "class_id": 0},

    # 5 Blotch (Class ID 1)
    {"file": "blotch_(72).jpg", "class_name": "Blotch", "class_id": 1},
    {"file": "blotch_(7).jpg", "class_name": "Blotch", "class_id": 1},
    {"file": "blotch_(119).jpg", "class_name": "Blotch", "class_id": 1},
    {"file": "blotch_(228).jpg", "class_name": "Blotch", "class_id": 1},
    {"file": "blotch_(211).jpg", "class_name": "Blotch", "class_id": 1},

    # 5 Leaf_Spot (Class ID 2)
    {"file": "leaf_spot_(182).jpg", "class_name": "Leaf_Spot", "class_id": 2},
    {"file": "leaf_spot_(79).jpg", "class_name": "Leaf_Spot", "class_id": 2},
    {"file": "leaf_spot_(63).jpg", "class_name": "Leaf_Spot", "class_id": 2},
    {"file": "leaf_spot_(185).jpg", "class_name": "Leaf_Spot", "class_id": 2},
    {"file": "leaf_spot_(81).jpg", "class_name": "Leaf_Spot", "class_id": 2},
]

def segment_leaf(img):
    """
    Segment host leaf lamina using HSV color chromaticity.
    Excludes white paper sheet AND gray shadows completely.
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    H, S, V = cv2.split(hsv)

    # Turmeric foliage (green, yellow chlorotic, brown necrotic):
    # Hue: 10 to 98 (covers brown, yellow, green)
    # Saturation: >= 28 (eliminates white sheet and neutral gray shadows)
    # Value: >= 35 (eliminates extreme dark vignetting)
    foliar_mask = ((H >= 10) & (H <= 98) & (S >= 28) & (V >= 35)).astype(np.uint8) * 255

    # Morphology to fill leaf veins and small internal holes
    close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    foliar_mask = cv2.morphologyEx(foliar_mask, cv2.MORPH_CLOSE, close_kernel)
    foliar_mask = cv2.morphologyEx(foliar_mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))

    contours, _ = cv2.findContours(foliar_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        main_c = max(contours, key=cv2.contourArea)
        mask = np.zeros_like(foliar_mask)
        cv2.drawContours(mask, [main_c], -1, 255, -1)

        # Fill internal holes (e.g. necrotic center or severe damage)
        cv2.drawContours(mask, contours, -1, 255, -1)

        # Create slightly eroded inner leaf (margin buffer to avoid leaf border false alarms)
        inner = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
        return mask, inner

    return foliar_mask, foliar_mask

def detect_aphid_clusters(img, leaf_mask, inner_leaf):
    """
    Isolate localized aphid colonies, feeding punctures, and chlorotic feeding tracks.
    Strictly constrained within inner leaf lamina.
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

    # Chlorotic feeding punctures exhibit elevated L and shifted a (loss of healthy chlorophyll)
    chlorosis_saliency = np.maximum(0, (a.astype(float) - med_a) * 1.2 + (L.astype(float) - med_L) * 0.8)
    chlorosis_saliency = (chlorosis_saliency * (inner_leaf > 0) / 255.0).astype(np.float32)

    valid_vals = chlorosis_saliency[inner_leaf > 0]
    if len(valid_vals) == 0:
        return []

    p_thresh = np.percentile(valid_vals, 85)
    bin_damage = ((chlorosis_saliency >= p_thresh) & (inner_leaf > 0)).astype(np.uint8) * 255

    # Connect nearby punctate lesions into localized cluster proposals (not whole leaf)
    cluster_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    clustered = cv2.morphologyEx(bin_damage, cv2.MORPH_CLOSE, cluster_kernel)
    clustered = cv2.morphologyEx(clustered, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))

    cnts, _ = cv2.findContours(clustered, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for c in cnts:
        area = cv2.contourArea(c)
        # Bounding box constraints: must be localized (0.05% to 15% of image area)
        if (img_area * 0.0005) < area < (img_area * 0.15):
            x, y, bw, bh = cv2.boundingRect(c)
            # Add subtle padding
            pad = 10
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(w, x + bw + pad)
            y2 = min(h, y + bh + pad)

            # Ensure candidate is substantially inside the leaf lamina
            roi_leaf = inner_leaf[y1:y2, x1:x2]
            if np.mean(roi_leaf > 0) > 0.40:
                boxes.append((x1, y1, x2 - x1, y2 - y1, area))

    # Keep top 6 most distinct clusters
    boxes = sorted(boxes, key=lambda b: b[4], reverse=True)[:6]
    return [(b[0], b[1], b[2], b[3]) for b in boxes]

def detect_blotch_patches(img, leaf_mask, inner_leaf):
    """
    Isolate contiguous yellow-brown to dark necrotic blotches (Taphrina maculans).
    Strictly inside leaf lamina.
    """
    h, w = img.shape[:2]
    img_area = w * h
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    H, S, V = cv2.split(hsv)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    L, a, b = cv2.split(lab)

    leaf_a = a[leaf_mask > 0]
    med_a = np.median(leaf_a) if len(leaf_a) > 0 else 128

    # Blotch necrosis: golden brown to dark brown patches
    is_necrotic = (((H < 32) & (S > 50) & (V < 220)) | ((a.astype(int) - med_a > 8) & (V < 190))) & (leaf_mask > 0)
    blotch_bin = is_necrotic.astype(np.uint8) * 255

    # Group coalescing necrotic areas
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
    Strictly inside inner leaf lamina.
    """
    h, w = img.shape[:2]
    img_area = w * h
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Black-Hat morphology isolates dark spots smaller than the structuring element
    bh_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35))
    blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, bh_kernel)

    # Mask strictly by inner leaf lamina
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
            if 0.35 <= ar <= 2.8:  # Circular to oval lesion shape
                pad = 6
                x1 = max(0, x - pad)
                y1 = max(0, y - pad)
                x2 = min(w, x + bw + pad)
                y2 = min(h, y + bh + pad)

                # Must be thoroughly on the leaf
                roi_leaf = inner_leaf[y1:y2, x1:x2]
                if np.mean(roi_leaf > 0) > 0.60:
                    boxes.append((x1, y1, x2 - x1, y2 - y1, area))

    boxes = sorted(boxes, key=lambda b: b[4], reverse=True)[:10]
    return [(b[0], b[1], b[2], b[3]) for b in boxes]

def main():
    print("=" * 75)
    print("RUNNING REFINED SEGMENTATION-ASSISTED PATHOLOGY DETECTION (15-IMAGE TEST)")
    print("=" * 75)

    audit_records = []
    processed_for_sheet = []

    for item in TEST_15_IMAGES:
        fname = item["file"]
        cname = item["class_name"]
        cid = item["class_id"]

        src_path = SRC_DIR / fname
        dst_lbl = OUT_LBL / (Path(fname).stem + ".txt")

        img_cv = cv2.imread(str(src_path))
        h, w = img_cv.shape[:2]
        img_area = w * h

        leaf_mask, inner_leaf = segment_leaf(img_cv)

        if cname == "Aphids_Disease":
            pixel_boxes = detect_aphid_clusters(img_cv, leaf_mask, inner_leaf)
        elif cname == "Blotch":
            pixel_boxes = detect_blotch_patches(img_cv, leaf_mask, inner_leaf)
        elif cname == "Leaf_Spot":
            pixel_boxes = detect_circular_spots(img_cv, leaf_mask, inner_leaf)
        else:
            pixel_boxes = []

        # Convert to YOLO format
        yolo_boxes = []
        yolo_lines = []
        for (bx, by, bw, bh) in pixel_boxes:
            xc = (bx + bw / 2.0) / w
            yc = (by + bh / 2.0) / h
            nw = bw / float(w)
            nh = bh / float(h)
            yolo_lines.append(f"{cid} {xc:.6f} {yc:.6f} {nw:.6f} {nh:.6f}")
            yolo_boxes.append({
                "xyxy": [bx, by, bx + bw, by + bh],
                "area_ratio": (bw * bh) / img_area
            })

        # Save YOLO .txt
        with open(dst_lbl, "w", encoding="utf-8") as f:
            for l in yolo_lines:
                f.write(l + "\n")

        n_boxes = len(yolo_boxes)
        mean_area = np.mean([b["area_ratio"] for b in yolo_boxes]) if yolo_boxes else 0.0

        print(f"[{cname}] {fname} -> {n_boxes} boxes (mean area ratio: {mean_area:.4f})")

        audit_records.append({
            "image_name": fname,
            "split": "train",
            "original_class": cname,
            "number_of_boxes": n_boxes,
            "mean_area_ratio": round(mean_area, 4),
            "annotation_status": "AUTO_GENERATED",
            "method": "Segmentation-Assisted Chromaticity Saliency",
            "reviewer_notes": f"Generated {n_boxes} localized candidate proposals."
        })

        processed_for_sheet.append({
            "image_path": src_path,
            "filename": fname,
            "class_name": cname,
            "boxes": yolo_boxes
        })

    # Save audit CSV
    audit_csv = OUT_AUDIT / "segmentation_assisted_15_audit.csv"
    with open(audit_csv, "w", newline="", encoding="utf-8") as f:
        fields = ["image_name", "split", "original_class", "number_of_boxes", "mean_area_ratio", "annotation_status", "method", "reviewer_notes"]
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(audit_records)
    print(f"\nSaved audit CSV: {audit_csv}")

    # Render 15-image contact sheet
    print("Rendering 15-image contact sheet...")
    render_contact_sheet(processed_for_sheet, OUT_AUDIT / "segmentation_assisted_15_contact_sheet.png")

def render_contact_sheet(items, out_path):
    cols = 5
    rows = 3
    thumb_w, thumb_h = 360, 360
    card_w = thumb_w
    card_h = thumb_h + 50
    margin = 30
    header_h = 80

    total_w = margin * 2 + cols * card_w + (cols - 1) * 16
    total_h = margin * 2 + header_h + rows * card_h + (rows - 1) * 16

    sheet = Image.new("RGB", (total_w, total_h), color=(18, 20, 24))
    draw = ImageDraw.Draw(sheet)

    try:
        font_title = ImageFont.truetype("arial.ttf", 24)
        font_sub = ImageFont.truetype("arial.ttf", 13)
        font_meta = ImageFont.truetype("arial.ttf", 11)
    except Exception:
        font_title = font_sub = font_meta = ImageFont.load_default()

    draw.text((margin, margin), "Segmentation-Assisted Pathology Candidate Detection (15 Test Images)", fill=(255, 255, 255), font=font_title)
    draw.text((margin, margin + 34), "Approach: Foliar Lamina Saliency Segmentation | Status: AUTO_GENERATED (Proposals Only)", fill=(160, 175, 195), font=font_sub)

    colors = {
        "Aphids_Disease": (255, 75, 75),  # Red
        "Blotch": (255, 180, 30),         # Amber
        "Leaf_Spot": (0, 210, 255),       # Cyan
    }

    for idx, item in enumerate(items):
        r = idx // cols
        c = idx % cols
        x = margin + c * (card_w + 16)
        y = margin + header_h + r * (card_h + 16)

        cname = item["class_name"]
        box_color = colors.get(cname, (255, 255, 255))

        draw.rectangle([x, y, x + card_w, y + card_h], fill=(26, 29, 36), outline=(48, 54, 68), width=1)

        with Image.open(item["image_path"]) as img:
            img = img.convert("RGB")
            img_w, img_h = img.size
            annotated = img.copy()
            b_draw = ImageDraw.Draw(annotated)

            for b in item["boxes"]:
                x1, y1, x2, y2 = b["xyxy"]
                line_w = max(4, int(img_w / 550))
                b_draw.rectangle([x1, y1, x2, y2], outline=box_color, width=line_w)

            annotated.thumbnail((thumb_w - 8, thumb_h - 8), Image.Resampling.LANCZOS)
            tw, th = annotated.size
            tx = x + (card_w - tw) // 2
            ty = y + 4 + (thumb_h - th) // 2
            sheet.paste(annotated, (tx, ty))

        caption = f"[{cname}] {item['filename']}"
        meta = f"Boxes: {len(item['boxes'])} | Status: AUTO_GENERATED"

        draw.text((x + 8, y + thumb_h + 6), caption, fill=(240, 245, 255), font=font_meta)
        draw.text((x + 8, y + thumb_h + 24), meta, fill=(140, 160, 185), font=font_meta)

    sheet.save(out_path, "PNG", optimize=True)
    print(f"Saved contact sheet to: {out_path}")

if __name__ == "__main__":
    main()
