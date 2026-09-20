"""
Local Grounding DINO Candidate Annotation Generator — Pilot 02 (10 New Images)
=============================================================================
Refined prompt strategy based on Pilot 01 results:
  - Aphids: "visible aphid colony . cluster of aphids . infested foliar patch ."
  - Blotch: "leaf blotch . blotch disease ." (kept from pilot 01)
  - Leaf Spot: "small circular spot . necrotic lesion . fungal spot ." (removed "leaf")
  - Healthy: negative background calibration (0 boxes)
"""

import os
import csv
import json
import shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import torch
from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection

BASE_DIR = Path(r"D:\curuma\turmeric_datasets")
SRC_DIR = BASE_DIR / "annotations" / "images" / "train"
OUT_BASE = BASE_DIR / "auto_annotations"
OUT_IMG = OUT_BASE / "images" / "train"
OUT_LBL = OUT_BASE / "labels" / "train"
OUT_AUDIT = OUT_BASE / "audit"

for d in [OUT_IMG, OUT_LBL, OUT_AUDIT]:
    d.mkdir(parents=True, exist_ok=True)

PILOT_02_IMAGES = [
    # 3 Aphids_Disease (ID: 0)
    {"file": "aphids_disease_(131).jpg", "class_name": "Aphids_Disease", "class_id": 0, "prompt": "visible aphid colony . cluster of aphids . infested foliar patch ."},
    {"file": "aphids_disease_(14).jpg", "class_name": "Aphids_Disease", "class_id": 0, "prompt": "visible aphid colony . cluster of aphids . infested foliar patch ."},
    {"file": "aphids_disease_(63).jpg", "class_name": "Aphids_Disease", "class_id": 0, "prompt": "visible aphid colony . cluster of aphids . infested foliar patch ."},
    # 3 Blotch (ID: 1)
    {"file": "blotch_(228).jpg", "class_name": "Blotch", "class_id": 1, "prompt": "leaf blotch . blotch disease ."},
    {"file": "blotch_(211).jpg", "class_name": "Blotch", "class_id": 1, "prompt": "leaf blotch . blotch disease ."},
    {"file": "blotch_(238).jpg", "class_name": "Blotch", "class_id": 1, "prompt": "leaf blotch . blotch disease ."},
    # 3 Leaf_Spot (ID: 2)
    {"file": "leaf_spot_(185).jpg", "class_name": "Leaf_Spot", "class_id": 2, "prompt": "small circular spot . necrotic lesion . fungal spot ."},
    {"file": "leaf_spot_(143).jpg", "class_name": "Leaf_Spot", "class_id": 2, "prompt": "small circular spot . necrotic lesion . fungal spot ."},
    {"file": "leaf_spot_(81).jpg", "class_name": "Leaf_Spot", "class_id": 2, "prompt": "small circular spot . necrotic lesion . fungal spot ."},
    # 1 Healthy_Leaf
    {"file": "healthy_(12).jpg", "class_name": "Healthy_Leaf", "class_id": None, "prompt": None},
]

def apply_nms(boxes, scores, iou_thresh=0.40):
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
    print("=" * 70)
    print("RUNNING PILOT 02: REFINED PROMPTS ON 10 NEW TEST IMAGES")
    print("=" * 70)

    model_id = "IDEA-Research/grounding-dino-tiny"
    print(f"Loading model: {model_id} ...")
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id)
    model.eval()
    print("Model ready on CPU.\n")

    audit_records = []
    processed_images = []

    for item in PILOT_02_IMAGES:
        fname = item["file"]
        cname = item["class_name"]
        cid = item["class_id"]
        prompt = item["prompt"]

        src_path = SRC_DIR / fname
        dst_img = OUT_IMG / fname
        dst_lbl = OUT_LBL / (Path(fname).stem + ".txt")

        # Hardlink / copy
        if not dst_img.exists():
            try:
                os.link(src_path, dst_img)
            except Exception:
                shutil.copy2(src_path, dst_img)

        orig_img = Image.open(src_path).convert("RGB")
        img_w, img_h = orig_img.size
        img_area = img_w * img_h

        detected_boxes = []
        confidences = []

        if cname == "Healthy_Leaf":
            with open(dst_lbl, "w", encoding="utf-8") as f:
                pass
            n_boxes = 0
            mean_conf = 0.0
            status = "AUTO_GENERATED"
            notes = "Healthy leaf: 0 candidate boxes (negative background calibrated)"
            suspicious = False
        else:
            print(f"Detecting [{cname}] {fname} | prompt: '{prompt}'...")
            inputs = processor(images=orig_img, text=prompt, return_tensors="pt")

            with torch.no_grad():
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
                for idx, box in enumerate(raw_boxes):
                    bw = box[2] - box[0]
                    bh = box[3] - box[1]
                    area_ratio = (bw * bh) / img_area

                    # Discard boxes < 12px or boxes covering > 75% of image (whole-leaf bounds)
                    if bw < 12 or bh < 12:
                        continue
                    if area_ratio > 0.75:
                        continue
                    valid_idx.append(idx)

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
                            "class_name": cname,
                            "yolo": f"{cid} {norm_xc:.6f} {norm_yc:.6f} {norm_bw:.6f} {norm_bh:.6f}",
                            "score": s,
                            "xyxy": [x1, y1, x2, y2],
                            "area_ratio": (bw * bh) / img_area
                        })
                        confidences.append(s)

            with open(dst_lbl, "w", encoding="utf-8") as f:
                for b in detected_boxes:
                    f.write(b["yolo"] + "\n")

            n_boxes = len(detected_boxes)
            mean_conf = float(np.mean(confidences)) if confidences else 0.0
            status = "AUTO_GENERATED"

            if n_boxes == 0:
                notes = "WARNING: 0 boxes detected on disease image. Requires manual drawing."
                suspicious = True
            elif n_boxes > 6:
                notes = f"Notice: {n_boxes} boxes detected. Inspect for crowded spot proposals."
                suspicious = True
            else:
                notes = f"Candidate proposals generated ({n_boxes} boxes, mean conf: {mean_conf:.3f})"
                suspicious = False

        print(f"  -> {fname}: {n_boxes} boxes (mean conf: {mean_conf:.3f}) | Suspicious = {suspicious}")

        audit_records.append({
            "image_name": fname,
            "split": "train",
            "original_class": cname,
            "number_of_boxes": n_boxes,
            "confidence_scores": json.dumps([round(c, 3) for c in confidences]),
            "mean_confidence": round(mean_conf, 3),
            "annotation_status": status,
            "flagged_suspicious": suspicious,
            "reviewer_notes": notes
        })

        processed_images.append({
            "image_path": src_path,
            "filename": fname,
            "class_name": cname,
            "boxes": detected_boxes,
            "suspicious": suspicious
        })

    # Save CSV
    audit_csv = OUT_AUDIT / "pilot_02_audit.csv"
    with open(audit_csv, "w", newline="", encoding="utf-8") as f:
        fields = ["image_name", "split", "original_class", "number_of_boxes", "confidence_scores", "mean_confidence", "annotation_status", "flagged_suspicious", "reviewer_notes"]
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(audit_records)
    print(f"\nSaved audit CSV: {audit_csv}")

    # Generate visual contact sheet
    print("\nRendering Pilot 02 contact sheet...")
    generate_contact_sheet(processed_images, OUT_AUDIT / "pilot_02_contact_sheet.png")

def generate_contact_sheet(items, out_path):
    thumb_w, thumb_h = 380, 380
    card_w = thumb_w
    card_h = thumb_h + 55
    cols = 5
    rows = 2
    margin = 30
    header_h = 80

    total_w = margin * 2 + cols * card_w + (cols - 1) * 20
    total_h = margin * 2 + header_h + rows * card_h + (rows - 1) * 20

    sheet = Image.new("RGB", (total_w, total_h), color=(18, 20, 24))
    draw = ImageDraw.Draw(sheet)

    try:
        font_title = ImageFont.truetype("arial.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 14)
        font_meta = ImageFont.truetype("arial.ttf", 12)
    except Exception:
        font_title = font_sub = font_meta = ImageFont.load_default()

    draw.text((margin, margin), "Grounding DINO Candidate Annotation — Pilot 02 (Refined Prompts)", fill=(255, 255, 255), font=font_title)
    draw.text((margin, margin + 36), "Model: IDEA-Research/grounding-dino-tiny | 10 New Images | Status: AUTO_GENERATED (Proposals Only)", fill=(160, 175, 195), font=font_sub)

    colors = {
        "Aphids_Disease": (255, 75, 75),
        "Blotch": (255, 180, 30),
        "Leaf_Spot": (0, 210, 255),
        "Healthy_Leaf": (50, 220, 100)
    }

    for idx, item in enumerate(items):
        r = idx // cols
        c = idx % cols
        x = margin + c * (card_w + 20)
        y = margin + header_h + r * (card_h + 20)

        border_color = (220, 60, 60) if item["suspicious"] else (50, 55, 65)
        draw.rectangle([x, y, x + card_w, y + card_h], fill=(26, 29, 36), outline=border_color, width=2 if item["suspicious"] else 1)

        with Image.open(item["image_path"]) as img:
            img = img.convert("RGB")
            img_w, img_h = img.size
            annotated_img = img.copy()
            box_draw = ImageDraw.Draw(annotated_img)

            cname = item["class_name"]
            box_color = colors.get(cname, (255, 255, 255))

            for b in item["boxes"]:
                x1, y1, x2, y2 = b["xyxy"]
                score = b["score"]
                line_w = max(4, int(img_w / 600))
                box_draw.rectangle([x1, y1, x2, y2], outline=box_color, width=line_w)

                tag = f"{cname} {score:.2f}"
                try:
                    tag_font = ImageFont.truetype("arial.ttf", max(20, int(img_w / 120)))
                except Exception:
                    tag_font = ImageFont.load_default()
                box_draw.rectangle([x1, max(0, y1 - 36), x1 + len(tag) * 16, y1], fill=box_color)
                box_draw.text((x1 + 4, max(0, y1 - 34)), tag, fill=(0, 0, 0), font=tag_font)

            annotated_img.thumbnail((thumb_w - 10, thumb_h - 10), Image.Resampling.LANCZOS)
            tw, th = annotated_img.size
            tx = x + (card_w - tw) // 2
            ty = y + 5 + (thumb_h - th) // 2
            sheet.paste(annotated_img, (tx, ty))

        caption = f"[{cname}] {item['filename']}"
        meta = f"Boxes: {len(item['boxes'])}"
        if item["suspicious"]:
            meta += " | ⚠️ SUSPICIOUS / MANUAL REVIEW"
        else:
            meta += " | Status: AUTO_GENERATED"

        draw.text((x + 8, y + thumb_h + 8), caption, fill=(240, 245, 255), font=font_meta)
        meta_color = (255, 120, 120) if item["suspicious"] else (140, 160, 180)
        draw.text((x + 8, y + thumb_h + 26), meta, fill=meta_color, font=font_meta)

    sheet.save(out_path, "PNG", optimize=True)
    print(f"Saved contact sheet to: {out_path}")

if __name__ == "__main__":
    main()
