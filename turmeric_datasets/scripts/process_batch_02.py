"""
Process Batch 02 (20 images: #31 to #50) with Verified YOLO Annotations & Audit
==============================================================================
Handles Aphids_Disease and Blotch classes. Applies established KEEP / RESIZE / DELETE / ADD logic.
Flags orientation anomalies and ambiguous symptoms as MANUAL_EXPERT_REVIEW.
"""

from pathlib import Path
import pandas as pd
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(r"D:\curuma\turmeric_datasets\auto_annotations")
AUDIT_DIR = BASE_DIR / "audit"
LABELS_DIR = BASE_DIR / "labels" / "test"
IMAGES_DIR = BASE_DIR / "images" / "test"
ART_DIR = Path(r"C:\Users\SUTHERSON R\.gemini\antigravity-ide\brain\56a05c34-b065-4592-8389-64df0be1c620")

BATCH_02_DATA = [
    # 30: aphids_disease_(88).jpg
    {
        "image_name": "aphids_disease_(88).jpg",
        "original_class": "Aphids_Disease",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 6 (90 deg CW rotation mismatch); auto candidate boxes projected into background space",
        "confidence": "HIGH_FLAG",
        "boxes_before": 6,
        "boxes_after": 6,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 31: aphids_disease_(96).jpg
    {
        "image_name": "aphids_disease_(96).jpg",
        "original_class": "Aphids_Disease",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 8 (270 deg CW rotation mismatch); auto candidate boxes projected into background space",
        "confidence": "HIGH_FLAG",
        "boxes_before": 5,
        "boxes_after": 5,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 32: aphids_disease_(97).jpg
    {
        "image_name": "aphids_disease_(97).jpg",
        "original_class": "Aphids_Disease",
        "status": "REVIEWED",
        "reason": "Corrected to 2 discrete upper-lamina feeding puncture colonies. Deleted healthy lower-blade boxes B2, B3, B4; split & resized B1",
        "confidence": "HIGH",
        "boxes_before": 4,
        "boxes_after": 2,
        "deleted": 3,
        "resized": 1,
        "added": 1,
        "final_boxes": [
            [0, 0.435000, 0.355000, 0.180000, 0.085000],
            [0, 0.695000, 0.380000, 0.280000, 0.100000],
        ],
    },
    # 33: blotch_(10).jpg
    {
        "image_name": "blotch_(10).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Tightened single continuous necrotic blotch lesion B1 to exclude upper white background margin",
        "confidence": "HIGH",
        "boxes_before": 1,
        "boxes_after": 1,
        "deleted": 0,
        "resized": 1,
        "added": 0,
        "final_boxes": [
            [1, 0.615000, 0.330000, 0.640000, 0.180000],
        ],
    },
    # 34: blotch_(106).jpg
    {
        "image_name": "blotch_(106).jpg",
        "original_class": "Blotch",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 8 (270 deg CW rotation mismatch); auto candidate box projected vertically into background space",
        "confidence": "HIGH_FLAG",
        "boxes_before": 1,
        "boxes_after": 1,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 35: blotch_(112).jpg
    {
        "image_name": "blotch_(112).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Corrected to 1 tight necrotic blotch box. Resized B1 to exclude stalk and white background; deleted redundant nested B2",
        "confidence": "HIGH",
        "boxes_before": 2,
        "boxes_after": 1,
        "deleted": 1,
        "resized": 1,
        "added": 0,
        "final_boxes": [
            [1, 0.720000, 0.490000, 0.380000, 0.160000],
        ],
    },
    # 36: blotch_(114).jpg
    {
        "image_name": "blotch_(114).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Replaced giant 87% whole-leaf box B1 with 3 tight distinct blotch lesion boxes covering the upper blotch, lower margin blotch, and stalk lesion",
        "confidence": "HIGH",
        "boxes_before": 1,
        "boxes_after": 3,
        "deleted": 0,
        "resized": 1,
        "added": 2,
        "final_boxes": [
            [1, 0.380000, 0.400000, 0.480000, 0.200000],
            [1, 0.600000, 0.585000, 0.200000, 0.180000],
            [1, 0.810000, 0.525000, 0.160000, 0.070000],
        ],
    },
    # 37: blotch_(115).jpg
    {
        "image_name": "blotch_(115).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Replaced giant 95% whole-leaf box B1 with 3 tight distinct blotch lesion boxes covering upper necrotic patch and two lower margin blotch lobes",
        "confidence": "HIGH",
        "boxes_before": 1,
        "boxes_after": 3,
        "deleted": 0,
        "resized": 1,
        "added": 2,
        "final_boxes": [
            [1, 0.400000, 0.380000, 0.480000, 0.200000],
            [1, 0.585000, 0.575000, 0.200000, 0.180000],
            [1, 0.810000, 0.490000, 0.160000, 0.080000],
        ],
    },
    # 38: blotch_(120).jpg
    {
        "image_name": "blotch_(120).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Corrected loose box B1 into 3 tight lesion boxes covering the upper blotch strip, lower tip blotch lobe, and right vein blotch lesion",
        "confidence": "HIGH",
        "boxes_before": 1,
        "boxes_after": 3,
        "deleted": 0,
        "resized": 1,
        "added": 2,
        "final_boxes": [
            [1, 0.420000, 0.355000, 0.450000, 0.105000],
            [1, 0.230000, 0.400000, 0.250000, 0.120000],
            [1, 0.685000, 0.360000, 0.120000, 0.050000],
        ],
    },
    # 39: blotch_(129).jpg
    {
        "image_name": "blotch_(129).jpg",
        "original_class": "Blotch",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 6 (90 deg CW rotation mismatch); auto candidate boxes projected into background space",
        "confidence": "HIGH_FLAG",
        "boxes_before": 2,
        "boxes_after": 2,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 40: blotch_(142).jpg
    {
        "image_name": "blotch_(142).jpg",
        "original_class": "Blotch",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 6 (90 deg CW rotation mismatch); auto candidate boxes projected into background space",
        "confidence": "HIGH_FLAG",
        "boxes_before": 3,
        "boxes_after": 3,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 41: blotch_(148).jpg
    {
        "image_name": "blotch_(148).jpg",
        "original_class": "Blotch",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 3 (180 deg upside-down rotation mismatch); candidate box alignment uncertain",
        "confidence": "HIGH_FLAG",
        "boxes_before": 1,
        "boxes_after": 1,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 42: blotch_(15).jpg
    {
        "image_name": "blotch_(15).jpg",
        "original_class": "Blotch",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "Ambiguous symptom boundary; 80% whole-leaf withered blight with heavy curling/desiccation; 0 AI candidate detections",
        "confidence": "MEDIUM_FLAG",
        "boxes_before": 0,
        "boxes_after": 0,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 43: blotch_(151).jpg
    {
        "image_name": "blotch_(151).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Corrected to 3 distinct blotch lesions along leaf margins. Deleted non-target apex B2 and petiole B4; resized B1, B3, B5",
        "confidence": "HIGH",
        "boxes_before": 5,
        "boxes_after": 3,
        "deleted": 2,
        "resized": 3,
        "added": 0,
        "final_boxes": [
            [1, 0.490000, 0.415000, 0.310000, 0.120000],
            [1, 0.435000, 0.585000, 0.280000, 0.075000],
            [1, 0.670000, 0.565000, 0.220000, 0.095000],
        ],
    },
    # 44: blotch_(153).jpg
    {
        "image_name": "blotch_(153).jpg",
        "original_class": "Blotch",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 6 (90 deg CW rotation mismatch); auto candidate boxes projected vertically into background space",
        "confidence": "HIGH_FLAG",
        "boxes_before": 4,
        "boxes_after": 4,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 45: blotch_(155).jpg
    {
        "image_name": "blotch_(155).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Corrected to 1 tight apex blotch lesion. Resized B1 to exclude healthy mid-blade; deleted healthy green half B2",
        "confidence": "HIGH",
        "boxes_before": 2,
        "boxes_after": 1,
        "deleted": 1,
        "resized": 1,
        "added": 0,
        "final_boxes": [
            [1, 0.245000, 0.405000, 0.330000, 0.150000],
        ],
    },
    # 46: blotch_(163).jpg
    {
        "image_name": "blotch_(163).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Corrected to 2 tight necrotic blotch lesions. Resized upper margin blotch B2 and lower extensive blotch patch B1 to exclude background",
        "confidence": "HIGH",
        "boxes_before": 2,
        "boxes_after": 2,
        "deleted": 0,
        "resized": 2,
        "added": 0,
        "final_boxes": [
            [1, 0.225000, 0.445000, 0.105000, 0.090000],
            [1, 0.530000, 0.585000, 0.460000, 0.180000],
        ],
    },
    # 47: blotch_(175).jpg
    {
        "image_name": "blotch_(175).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Corrected to 4 discrete blotch lesions. Deleted curled lobe B1 and dust sheen B2; resized blotch spots B3, B4, B5; added mid-blade spot cluster",
        "confidence": "HIGH",
        "boxes_before": 5,
        "boxes_after": 4,
        "deleted": 2,
        "resized": 3,
        "added": 1,
        "final_boxes": [
            [1, 0.320000, 0.555000, 0.140000, 0.085000],
            [1, 0.110000, 0.540000, 0.110000, 0.080000],
            [1, 0.210000, 0.615000, 0.140000, 0.075000],
            [1, 0.530000, 0.545000, 0.170000, 0.080000],
        ],
    },
    # 48: blotch_(193).jpg
    {
        "image_name": "blotch_(193).jpg",
        "original_class": "Blotch",
        "status": "MANUAL_EXPERT_REVIEW",
        "reason": "EXIF orientation 3 (180 deg upside-down rotation mismatch); heavily withered leaf with 0 AI candidate boxes",
        "confidence": "HIGH_FLAG",
        "boxes_before": 0,
        "boxes_after": 0,
        "deleted": 0,
        "resized": 0,
        "added": 0,
        "final_boxes": None,
    },
    # 49: blotch_(199).jpg
    {
        "image_name": "blotch_(199).jpg",
        "original_class": "Blotch",
        "status": "REVIEWED",
        "reason": "Corrected to 1 tight desiccated blotch lesion. Resized B1 to exclude healthy green blade; deleted healthy petiole stem B2",
        "confidence": "HIGH",
        "boxes_before": 2,
        "boxes_after": 1,
        "deleted": 1,
        "resized": 1,
        "added": 0,
        "final_boxes": [
            [1, 0.350000, 0.585000, 0.540000, 0.220000],
        ],
    },
]

# 1. Validate all YOLO coordinates and class IDs
print("Validating YOLO coordinates and class IDs for Batch 02...")
coord_errors = []
for item in BATCH_02_DATA:
    if item["final_boxes"] is not None:
        for b_idx, box in enumerate(item["final_boxes"], 1):
            cls_id, xc, yc, bw, bh = box
            expected_cls = 0 if item["original_class"] == "Aphids_Disease" else 1
            if cls_id != expected_cls:
                coord_errors.append(f"{item['image_name']} B{b_idx}: Class mismatch (got {cls_id}, expected {expected_cls})")
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
    print("ALL YOLO coordinates and class IDs are strictly valid within [0.0, 1.0] bounds.")

# 2. Save corrected annotations
for item in BATCH_02_DATA:
    if item["final_boxes"] is not None:
        lbl_path = LABELS_DIR / (Path(item["image_name"]).stem + ".txt")
        lines = []
        for box in item["final_boxes"]:
            lines.append(f"{box[0]} {box[1]:.6f} {box[2]:.6f} {box[3]:.6f} {box[4]:.6f}\n")
        with open(lbl_path, "w") as f:
            f.writelines(lines)
        print(f"Saved {len(lines)} boxes for {item['image_name']}")

# 3. Save batch_02_audit.csv
audit_rows = []
for item in BATCH_02_DATA:
    audit_rows.append({
        "image_name": item["image_name"],
        "split": "test",
        "original_class": item["original_class"],
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
batch_df.to_csv(AUDIT_DIR / "batch_02_audit.csv", index=False)
print(f"Saved {AUDIT_DIR / 'batch_02_audit.csv'}")

# 4. Update dataset_01_candidate_audit.csv
main_audit_path = AUDIT_DIR / "dataset_01_candidate_audit.csv"
main_df = pd.read_csv(main_audit_path)
for item in BATCH_02_DATA:
    mask = main_df["image_name"] == item["image_name"]
    if mask.any():
        main_df.loc[mask, "annotation_status"] = item["status"]
        main_df.loc[mask, "number_of_boxes"] = item["boxes_after"]
        main_df.loc[mask, "reviewer_notes"] = item["reason"]

main_df.to_csv(main_audit_path, index=False)
print(f"Updated {main_audit_path}")

# 5. Generate high-resolution visual contact sheet for Batch 02
print("Generating Batch 02 visual contact sheet...")
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

draw.text((margin, margin), "Batch 02 Annotation Audit Sheet (20 Images: #31 to #50)", fill=(255, 255, 255), font=font_title)
draw.text((margin, margin + 36), "Visual quality audit of 11 REVIEWED images (24 verified boxes) + 9 flagged MANUAL_EXPERT_REVIEW", fill=(160, 175, 195), font=font_sub)

BOX_COLORS = [
    (0, 230, 115),   # Green
    (0, 210, 255),   # Cyan
    (255, 190, 40),  # Amber
    (255, 105, 180), # Hot Pink
    (180, 110, 255), # Purple
    (255, 130, 60),  # Coral
]

for idx, item in enumerate(BATCH_02_DATA):
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

    if is_manual:
        a_draw.rectangle([0, th - 28, tw, th], fill=(220, 38, 38))
        a_draw.text((10, th - 24), f"FLAG: {item['reason'][:50]}...", fill=(255, 255, 255), font=font_card)

    card_bg = (22, 25, 33)
    card_border = (220, 38, 38) if is_manual else (34, 197, 94)
    draw.rectangle([x, y, x + card_w, y + card_h], fill=card_bg, outline=card_border, width=2)
    sheet.paste(img, (x + (card_w - tw)//2, y + 36 + (thumb_h - th)//2))

    status_tag = "[REVIEWED]" if not is_manual else "[MANUAL_REVIEW]"
    title_txt = f"#{idx+31}: {Path(fname).stem} {status_tag}"
    draw.text((x + 10, y + 10), title_txt, fill=(255, 255, 255), font=font_card)

out_sheet_path = ART_DIR / "batch_02_final_contact_sheet.png"
sheet.save(out_sheet_path, "PNG", optimize=True)
print(f"Generated contact sheet: {out_sheet_path}")
