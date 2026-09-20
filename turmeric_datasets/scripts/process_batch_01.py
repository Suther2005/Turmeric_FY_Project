"""
Process Batch 01 (20 images: #11 to #30) with Verified YOLO Annotations & Audit
==============================================================================
Applies established KEEP / RESIZE / DELETE / ADD logic to normal images and
marks EXIF-mismatched or ambiguous images as MANUAL_EXPERT_REVIEW.
"""

from pathlib import Path
import pandas as pd
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(r"D:\curuma\turmeric_datasets\auto_annotations")
AUDIT_DIR = BASE_DIR / "audit"
LABELS_DIR = BASE_DIR / "labels" / "test"
IMAGES_DIR = BASE_DIR / "images" / "test"
ART_DIR = Path(r"C:\Users\SUTHERSON R\.gemini\antigravity-ide\brain\56a05c34-b065-4592-8389-64df0be1c620")

# Definitive corrections for Batch 01
BATCH_DATA = [
    # 10: aphids_disease_(15).jpg
    {
        "image_name": "aphids_disease_(15).jpg",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 6 (90 deg CW rotation mismatch); auto boxes projected onto background space",
        "confidence": "HIGH_FLAG",
        "boxes_before": 6,
        "boxes_after": 6,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None, # Keep candidate unchanged
    },
    # 11: aphids_disease_(150).jpg
    {
        "image_name": "aphids_disease_(150).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 5 tight feeding puncture clusters. Deleted duplicate B6; resized B1, B2, B3, B4, B5 to exclude background/margins",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 5,
        "deleted": 1,
        "resized": 5,
        "added": 0,
        "final_boxes": [
            [0, 0.360000, 0.395000, 0.280000, 0.125000],
            [0, 0.465000, 0.550000, 0.285000, 0.180000],
            [0, 0.730000, 0.400000, 0.160000, 0.080000],
            [0, 0.758000, 0.534000, 0.076000, 0.095000],
            [0, 0.185000, 0.485000, 0.095000, 0.065000],
        ],
    },
    # 12: aphids_disease_(152).jpg
    {
        "image_name": "aphids_disease_(152).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 4 discrete feeding puncture zones. Deleted false positives B4, B5, B6; resized loose B1, B2; added lower-mid feeding cluster",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 4,
        "deleted": 3,
        "resized": 2,
        "added": 1,
        "final_boxes": [
            [0, 0.550000, 0.400000, 0.230000, 0.080000],
            [0, 0.270000, 0.410000, 0.280000, 0.100000],
            [0, 0.735000, 0.395000, 0.090000, 0.070000],
            [0, 0.460000, 0.475000, 0.190000, 0.075000],
        ],
    },
    # 13: aphids_disease_(155).jpg
    {
        "image_name": "aphids_disease_(155).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 4 tight puncture clusters. Deleted oversized B1, B2 and healthy lobe B4; resized B3, B5, B6; added lower-blade cluster",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 4,
        "deleted": 3,
        "resized": 3,
        "added": 1,
        "final_boxes": [
            [0, 0.490000, 0.385000, 0.170000, 0.080000],
            [0, 0.335000, 0.455000, 0.110000, 0.050000],
            [0, 0.815000, 0.455000, 0.080000, 0.065000],
            [0, 0.370000, 0.525000, 0.180000, 0.090000],
        ],
    },
    # 14: aphids_disease_(162).jpg
    {
        "image_name": "aphids_disease_(162).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 3 verified feeding lesion clusters. Deleted non-target boxes B1, B2, B4, B5; resized B3, B6; added lower-mid stipple cluster",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 3,
        "deleted": 4,
        "resized": 2,
        "added": 1,
        "final_boxes": [
            [0, 0.710000, 0.420000, 0.110000, 0.070000],
            [0, 0.510000, 0.320000, 0.100000, 0.055000],
            [0, 0.410000, 0.470000, 0.080000, 0.045000],
        ],
    },
    # 15: aphids_disease_(196).jpg
    {
        "image_name": "aphids_disease_(196).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 5 tight feeding clusters. Deleted healthy blade B3 & duplicate B6; resized B1, B2, B4, B5; added right-lower feeding streak",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 5,
        "deleted": 2,
        "resized": 3,
        "added": 1,
        "final_boxes": [
            [0, 0.220000, 0.440000, 0.180000, 0.080000],
            [0, 0.395000, 0.540000, 0.240000, 0.100000],
            [0, 0.470000, 0.355000, 0.160000, 0.075000],
            [0, 0.185000, 0.510000, 0.065000, 0.055000],
            [0, 0.590000, 0.490000, 0.090000, 0.045000],
        ],
    },
    # 16: aphids_disease_(197).jpg
    {
        "image_name": "aphids_disease_(197).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 3 tight feeding puncture zones. Deleted giant petiole box B1 and small redundant edge boxes B5, B6; resized B2, B3, B4",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 3,
        "deleted": 3,
        "resized": 3,
        "added": 0,
        "final_boxes": [
            [0, 0.475000, 0.315000, 0.190000, 0.070000],
            [0, 0.650000, 0.420000, 0.075000, 0.055000],
            [0, 0.755000, 0.390000, 0.100000, 0.070000],
        ],
    },
    # 17: aphids_disease_(201).jpg
    {
        "image_name": "aphids_disease_(201).jpg",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 6 (90 deg CW rotation mismatch); auto boxes displaced into tablecloth background",
        "confidence": "HIGH_FLAG",
        "boxes_before": 5,
        "boxes_after": 5,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 18: aphids_disease_(215).jpg
    {
        "image_name": "aphids_disease_(215).jpg",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "Ambiguous foliar symptom; faint diffuse chlorosis and water drop reflections, lacking distinct aphid puncture colonies",
        "confidence": "MEDIUM_FLAG",
        "boxes_before": 5,
        "boxes_after": 5,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 19: aphids_disease_(25).jpg
    {
        "image_name": "aphids_disease_(25).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 3 discrete feeding puncture holes. Deleted healthy green apex B3, petiole B4, and edge B6; resized B1, B2, B5",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 3,
        "deleted": 3,
        "resized": 3,
        "added": 0,
        "final_boxes": [
            [0, 0.370000, 0.585000, 0.110000, 0.060000],
            [0, 0.495000, 0.490000, 0.125000, 0.070000],
            [0, 0.505000, 0.595000, 0.065000, 0.045000],
        ],
    },
    # 20: aphids_disease_(29).jpg
    {
        "image_name": "aphids_disease_(29).jpg",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "Ambiguous symptom; large green leaf with only 1-2 faint superficial scratch marks, potential healthy leaf misclassification",
        "confidence": "MEDIUM_FLAG",
        "boxes_before": 6,
        "boxes_after": 6,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 21: aphids_disease_(36).jpg
    {
        "image_name": "aphids_disease_(36).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 5 tight punctate feeding clusters. Deleted margin duplicate B6; resized loose B1, B2, B3, B4, B5 to exclude background",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 5,
        "deleted": 1,
        "resized": 5,
        "added": 0,
        "final_boxes": [
            [0, 0.240000, 0.480000, 0.250000, 0.115000],
            [0, 0.730000, 0.615000, 0.225000, 0.090000],
            [0, 0.780000, 0.495000, 0.290000, 0.110000],
            [0, 0.510000, 0.435000, 0.240000, 0.075000],
            [0, 0.190000, 0.615000, 0.180000, 0.060000],
        ],
    },
    # 22: aphids_disease_(39).jpg
    {
        "image_name": "aphids_disease_(39).jpg",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 6 (90 deg CW rotation mismatch); auto boxes projected onto empty white background",
        "confidence": "HIGH_FLAG",
        "boxes_before": 6,
        "boxes_after": 6,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 23: aphids_disease_(47).jpg
    {
        "image_name": "aphids_disease_(47).jpg",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 8 (270 deg CW rotation mismatch); auto boxes projected vertically across background",
        "confidence": "HIGH_FLAG",
        "boxes_before": 6,
        "boxes_after": 6,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 24: aphids_disease_(5).jpg
    {
        "image_name": "aphids_disease_(5).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 3 tight feeding clusters. Deleted petiole background box B3; resized loose B1, B2; added upper-left puncture cluster",
        "confidence": "HIGH",
        "boxes_before": 3,
        "boxes_after": 3,
        "deleted": 1,
        "resized": 2,
        "added": 1,
        "final_boxes": [
            [0, 0.220000, 0.540000, 0.240000, 0.150000],
            [0, 0.420000, 0.635000, 0.070000, 0.040000],
            [0, 0.320000, 0.470000, 0.120000, 0.080000],
        ],
    },
    # 25: aphids_disease_(56).jpg
    {
        "image_name": "aphids_disease_(56).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 3 discrete feeding puncture clusters. Resized oversized B1, B2 to exclude background and tightened midrib box B3",
        "confidence": "HIGH",
        "boxes_before": 3,
        "boxes_after": 3,
        "deleted": 0,
        "resized": 3,
        "added": 0,
        "final_boxes": [
            [0, 0.730000, 0.425000, 0.300000, 0.180000],
            [0, 0.260000, 0.440000, 0.180000, 0.110000],
            [0, 0.503000, 0.459000, 0.075000, 0.055000],
        ],
    },
    # 26: aphids_disease_(61).jpg
    {
        "image_name": "aphids_disease_(61).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 4 verified feeding puncture zones. Deleted table edge artifact B5; resized loose B1, B2, B3; kept tight apex hole B4",
        "confidence": "HIGH",
        "boxes_before": 5,
        "boxes_after": 4,
        "deleted": 1,
        "resized": 3,
        "added": 0,
        "final_boxes": [
            [0, 0.580000, 0.355000, 0.260000, 0.090000],
            [0, 0.280000, 0.415000, 0.220000, 0.100000],
            [0, 0.770000, 0.395000, 0.095000, 0.070000],
            [0, 0.815000, 0.370000, 0.055000, 0.025000],
        ],
    },
    # 27: aphids_disease_(65).jpg
    {
        "image_name": "aphids_disease_(65).jpg",
        "status": "REVIEWED",
        "reason": "Corrected to 3 discrete feeding clusters. Deleted oversized B1, B3 and edge non-targets B5, B6; resized B2, B4; added right feeding cluster",
        "confidence": "HIGH",
        "boxes_before": 6,
        "boxes_after": 3,
        "deleted": 4,
        "resized": 2,
        "added": 1,
        "final_boxes": [
            [0, 0.420000, 0.550000, 0.220000, 0.095000],
            [0, 0.270000, 0.525000, 0.075000, 0.065000],
            [0, 0.650000, 0.540000, 0.140000, 0.070000],
        ],
    },
    # 28: aphids_disease_(7).jpg
    {
        "image_name": "aphids_disease_(7).jpg",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 8 (270 deg CW rotation mismatch); auto boxes projected vertically into white space",
        "confidence": "HIGH_FLAG",
        "boxes_before": 5,
        "boxes_after": 5,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 29: aphids_disease_(70).jpg
    {
        "image_name": "aphids_disease_(70).jpg",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 8 (270 deg CW rotation mismatch); auto boxes projected vertically into background",
        "confidence": "HIGH_FLAG",
        "boxes_before": 4,
        "boxes_after": 4,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
]

# 1. Validate all YOLO coordinates
print("Validating YOLO coordinates...")
coord_errors = []
for item in BATCH_DATA:
    if item["final_boxes"] is not None:
        for b_idx, box in enumerate(item["final_boxes"], 1):
            cls_id, xc, yc, bw, bh = box
            if not (0 <= cls_id <= 2):
                coord_errors.append(f"{item['image_name']} B{b_idx}: Invalid class {cls_id}")
            if not (0.0 < bw <= 1.0) or not (0.0 < bh <= 1.0):
                coord_errors.append(f"{item['image_name']} B{b_idx}: Invalid dimensions {bw}x{bh}")
            x1 = xc - bw/2
            x2 = xc + bw/2
            y1 = yc - bh/2
            y2 = yc + bh/2
            if x1 < 0.0 or x2 > 1.0 or y1 < 0.0 or y2 > 1.0:
                coord_errors.append(f"{item['image_name']} B{b_idx}: Box out of bounds [{x1:.3f}, {y1:.3f}, {x2:.3f}, {y2:.3f}]")

if coord_errors:
    print("ERRORS FOUND in YOLO coordinates:")
    for e in coord_errors:
        print(" ", e)
    raise ValueError("Coordinate validation failed!")
else:
    print("ALL YOLO coordinates are strictly valid within [0.0, 1.0] bounds.")

# 2. Save corrected annotations to auto_annotations/labels/test/
for item in BATCH_DATA:
    if item["final_boxes"] is not None:
        lbl_path = LABELS_DIR / (Path(item["image_name"]).stem + ".txt")
        lines = []
        for box in item["final_boxes"]:
            lines.append(f"{box[0]} {box[1]:.6f} {box[2]:.6f} {box[3]:.6f} {box[4]:.6f}\n")
        with open(lbl_path, "w") as f:
            f.writelines(lines)
        print(f"Saved {len(lines)} boxes for {item['image_name']}")

# 3. Create batch_01_audit.csv
audit_rows = []
for item in BATCH_DATA:
    audit_rows.append({
        "image_name": item["image_name"],
        "split": "test",
        "original_class": "Aphids_Disease",
        "boxes_before": item["boxes_before"],
        "boxes_after": item["boxes_after"],
        "deleted": item["deleted"],
        "resized": item["resized"],
        "added": item["added"],
        "status": item["status"],
        "reason": item["reason"],
        "confidence": item["confidence"],
    })

batch_df = pd.DataFrame(audit_rows)
batch_df.to_csv(AUDIT_DIR / "batch_01_audit.csv", index=False)
print(f"Saved {AUDIT_DIR / 'batch_01_audit.csv'}")

# 4. Synchronize dataset_01_candidate_audit.csv
main_audit_path = AUDIT_DIR / "dataset_01_candidate_audit.csv"
main_df = pd.read_csv(main_audit_path)
for item in BATCH_DATA:
    mask = main_df["image_name"] == item["image_name"]
    if mask.any():
        main_df.loc[mask, "annotation_status"] = item["status"]
        main_df.loc[mask, "number_of_boxes"] = item["boxes_after"]
        main_df.loc[mask, "reviewer_notes"] = item["reason"]

main_df.to_csv(main_audit_path, index=False)
print(f"Updated {main_audit_path}")

# 5. Generate high-resolution visual contact sheet for Batch 01
print("Generating Batch 01 visual contact sheet...")
cols = 4
rows = 5
card_w = 480
card_h = 360
margin = 25
header_h = 90

total_w = margin * 2 + cols * card_w + (cols - 1) * 16
total_h = margin * 2 + header_h + rows * card_h + (rows - 1) * 16

sheet = Image.new("RGB", (total_w, total_h), color=(14, 16, 22))
draw = ImageDraw.Draw(sheet)

try:
    font_title = ImageFont.truetype("arialbd.ttf", 26)
    font_sub = ImageFont.truetype("arial.ttf", 14)
    font_card = ImageFont.truetype("arialbd.ttf", 13)
    font_badge = ImageFont.truetype("arialbd.ttf", 15)
except Exception:
    font_title = font_sub = font_card = font_badge = ImageFont.load_default()

draw.text((margin, margin), "Batch 01 Annotation Audit Sheet (20 Images: #11 to #30)", fill=(255, 255, 255), font=font_title)
draw.text((margin, margin + 36), "Visual quality audit of 12 REVIEWED images (45 verified boxes) + 8 flagged MANUAL_EXPERT_REVIEW", fill=(160, 175, 195), font=font_sub)

BOX_COLORS = [
    (0, 230, 115),   # Green
    (0, 210, 255),   # Cyan
    (255, 190, 40),  # Amber
    (255, 105, 180), # Hot Pink
    (180, 110, 255), # Purple
    (255, 130, 60),  # Coral
]

for idx, item in enumerate(BATCH_DATA):
    r = idx // cols
    c = idx % cols
    x = margin + c * (card_w + 16)
    y = margin + header_h + r * (card_h + 16)

    fname = item["image_name"]
    img_path = IMAGES_DIR / fname
    img = Image.open(img_path).convert("RGB")

    thumb_w, thumb_h = card_w - 16, card_h - 44
    img.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
    tw, th = img.size

    a_draw = ImageDraw.Draw(img)

    # Read current labels (whether final or candidate)
    lbl_path = LABELS_DIR / (Path(fname).stem + ".txt")
    boxes = []
    if lbl_path.exists():
        with open(lbl_path) as f:
            for l in f:
                parts = l.strip().split()
                if len(parts) == 5:
                    boxes.append([int(parts[0])] + [float(v) for v in parts[1:]])

    is_manual = (item["status"] == "MANUAL_EXPERT_REVIEW")

    for b_idx, b in enumerate(boxes, 1):
        xc, yc, bw, bh = b[1:]
        bx1 = int((xc - bw/2) * tw)
        by1 = int((yc - bh/2) * th)
        bx2 = int((xc + bw/2) * tw)
        by2 = int((yc + bh/2) * th)

        col = (255, 70, 70) if is_manual else BOX_COLORS[(b_idx - 1) % len(BOX_COLORS)]
        width = 2 if is_manual else 3
        a_draw.rectangle([bx1, by1, bx2, by2], outline=col, width=width)

        badge_txt = f"B{b_idx}"
        bbox = a_draw.textbbox((0, 0), badge_txt, font=font_badge)
        bw_txt = bbox[2] - bbox[0] + 10
        bh_txt = bbox[3] - bbox[1] + 6
        badge_y1 = max(0, by1 - bh_txt)
        a_draw.rectangle([bx1, badge_y1, bx1 + bw_txt, badge_y1 + bh_txt], fill=col)
        a_draw.text((bx1 + 5, badge_y1 + 3), badge_txt, fill=(0, 0, 0), font=font_badge)

    # Status banner for manual review
    if is_manual:
        a_draw.rectangle([0, th - 28, tw, th], fill=(220, 38, 38))
        a_draw.text((10, th - 24), f"FLAG: {item['reason'][:50]}...", fill=(255, 255, 255), font=font_card)

    card_bg = (22, 25, 33)
    card_border = (220, 38, 38) if is_manual else (34, 197, 94)
    draw.rectangle([x, y, x + card_w, y + card_h], fill=card_bg, outline=card_border, width=2)
    sheet.paste(img, (x + (card_w - tw)//2, y + 36 + (thumb_h - th)//2))

    status_tag = "[REVIEWED]" if not is_manual else "[MANUAL_REVIEW]"
    title_txt = f"#{idx+11}: {Path(fname).stem} {status_tag}"
    draw.text((x + 10, y + 10), title_txt, fill=(255, 255, 255), font=font_card)

out_sheet_path = ART_DIR / "batch_01_final_contact_sheet.png"
sheet.save(out_sheet_path, "PNG", optimize=True)
print(f"Generated contact sheet: {out_sheet_path}")
