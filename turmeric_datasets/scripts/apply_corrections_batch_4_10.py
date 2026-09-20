"""
Apply Approved Annotation Corrections for Images 4, 6, 7, 8, 9, 10
==================================================================
Performs verified ground truth corrections:
- Images 4, 6, 7, 8, 9, 10: Apply KEEP / RESIZE / DELETE / ADD decisions. Mark REVIEWED.
- Image 5: Flagged as MANUAL_EXPERT_REVIEW (EXIF orientation mismatch). NOT marked reviewed.
- Severity: Kept UNASSIGNED.
- Original dataset: Untouched.
"""

import os
import csv
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(r"D:\curuma\turmeric_datasets\auto_annotations")
ART_DIR = Path(r"C:\Users\SUTHERSON R\.gemini\antigravity-ide\brain\56a05c34-b065-4592-8389-64df0be1c620")

# Approved corrected boxes in YOLO format: (class_id, xc, yc, w, h)
CORRECTED_LABELS = {
    # Image 4: aphids_disease_(119).jpg (3 kept, 3 resized, 1 deleted, 1 added = 6 boxes)
    "aphids_disease_(119).jpg": [
        (0, 0.423750, 0.688833, 0.125000, 0.129000),  # Resized B1
        (0, 0.629375, 0.603000, 0.092750, 0.167333),  # Resized B2
        (0, 0.341125, 0.611500, 0.082750, 0.097000),  # Resized B4
        (0, 0.342700, 0.411000, 0.082700, 0.137000),  # Kept B5
        (0, 0.584300, 0.427800, 0.069300, 0.070500),  # Kept B6
        (0, 0.787500, 0.483333, 0.125000, 0.100000),  # Added right blade cluster
    ],

    # Image 6: aphids_disease_(122).jpg (3 kept, 2 resized, 1 deleted, 0 added = 5 boxes)
    "aphids_disease_(122).jpg": [
        (0, 0.400500, 0.313167, 0.230000, 0.106333),  # Resized B1
        (0, 0.839500, 0.361300, 0.134500, 0.074000),  # Kept B2
        (0, 0.622500, 0.277500, 0.113500, 0.035000),  # Resized B3
        (0, 0.544000, 0.491500, 0.087500, 0.059000),  # Kept B5
        (0, 0.442400, 0.412500, 0.092700, 0.031000),  # Kept B6
    ],

    # Image 7: aphids_disease_(124).jpg (3 kept, 2 resized, 1 deleted, 0 added = 5 boxes)
    "aphids_disease_(124).jpg": [
        (0, 0.743800, 0.414500, 0.172000, 0.169000),  # Kept B1
        (0, 0.354250, 0.362167, 0.218500, 0.133000),  # Resized B2
        (0, 0.269600, 0.491300, 0.169800, 0.096000),  # Kept B3
        (0, 0.690625, 0.580000, 0.232250, 0.086667),  # Resized B4
        (0, 0.366100, 0.564800, 0.129800, 0.085700),  # Kept B5
    ],

    # Image 8: aphids_disease_(130).jpg (2 kept, 1 resized, 3 deleted, 1 added = 4 boxes)
    "aphids_disease_(130).jpg": [
        (0, 0.420500, 0.318800, 0.228500, 0.095700),  # Kept B3
        (0, 0.328125, 0.563000, 0.131250, 0.065333),  # Resized B4
        (0, 0.477100, 0.448000, 0.068300, 0.039300),  # Kept B6
        (0, 0.725000, 0.425000, 0.150000, 0.083333),  # Added right blade cluster
    ],

    # Image 9: aphids_disease_(144).jpg (4 kept, 1 resized, 1 deleted, 1 added = 6 boxes)
    "aphids_disease_(144).jpg": [
        (0, 0.771625, 0.516000, 0.156750, 0.058667),  # Resized B2
        (0, 0.527400, 0.567500, 0.091700, 0.069700),  # Kept B3
        (0, 0.626900, 0.568500, 0.073200, 0.056300),  # Kept B4
        (0, 0.708900, 0.551700, 0.075700, 0.038700),  # Kept B5
        (0, 0.435800, 0.549300, 0.081000, 0.058000),  # Kept B6
        (0, 0.375000, 0.376667, 0.175000, 0.100000),  # Added upper blade cluster
    ],

    # Image 10: aphids_disease_(149).jpg (3 kept, 2 resized, 1 deleted, 0 added = 5 boxes)
    "aphids_disease_(149).jpg": [
        (0, 0.377400, 0.384700, 0.294300, 0.156700),  # Kept B1
        (0, 0.228125, 0.433500, 0.116250, 0.146333),  # Resized B2
        (0, 0.382000, 0.523700, 0.180000, 0.107300),  # Kept B3
        (0, 0.700000, 0.420000, 0.125000, 0.093333),  # Resized B4
        (0, 0.600500, 0.553200, 0.074500, 0.079700),  # Kept B6
    ],
}

CHANGE_DETAILS = {
    "aphids_disease_(119).jpg": {
        "before": 6, "after": 6,
        "deleted": ["B3 (100% white table cloth shadow)"],
        "resized": ["B1 (cropped bottom at leaf edge)", "B2 (cropped bottom at leaf edge)", "B4 (cropped bottom at leaf edge)"],
        "added": ["Right blade feeding cluster [0.7875, 0.4833, 0.1250, 0.1000]"]
    },
    "aphids_disease_(122).jpg": {
        "before": 6, "after": 5,
        "deleted": ["B4 (duplicate nested inside B1)"],
        "resized": ["B1 (cropped top edge to leaf margin)", "B3 (shifted inside leaf margin)"],
        "added": []
    },
    "aphids_disease_(124).jpg": {
        "before": 6, "after": 5,
        "deleted": ["B6 (unaffected green leaf margin & background spill)"],
        "resized": ["B2 (tightened left boundary to lesions)", "B4 (pulled bottom boundary up to leaf edge)"],
        "added": []
    },
    "aphids_disease_(130).jpg": {
        "before": 6, "after": 4,
        "deleted": ["B1 (massive 1876x856 px macro-box)", "B2 (huge 2693x513 px leaf-spanning strip)", "B5 (healthy green leaf edge)"],
        "resized": ["B4 (tightened left edge to leaf margin)"],
        "added": ["Right blade feeding cluster [0.7250, 0.4250, 0.1500, 0.0833]"]
    },
    "aphids_disease_(144).jpg": {
        "before": 6, "after": 6,
        "deleted": ["B1 (1699x741 px macro-box duplicating smaller boxes)"],
        "resized": ["B2 (tightened right boundary to leaf edge)"],
        "added": ["Upper blade chlorotic cluster [0.3750, 0.3767, 0.1750, 0.1000]"]
    },
    "aphids_disease_(149).jpg": {
        "before": 6, "after": 5,
        "deleted": ["B5 (100% healthy green leaf margin)"],
        "resized": ["B2 (cropped left & bottom at leaf margin)", "B4 (shrunk to genuine feeding stipples)"],
        "added": []
    },
}

def main():
    print("=" * 80)
    print("APPLYING APPROVED CORRECTIONS FOR IMAGES 4, 6, 7, 8, 9, 10")
    print("=" * 80)

    lbl_dir = BASE_DIR / "labels" / "test"
    img_dir = BASE_DIR / "images" / "test"

    # 1. Update YOLO label files for Images 4, 6, 7, 8, 9, 10
    for fname, boxes in CORRECTED_LABELS.items():
        lbl_file = lbl_dir / (Path(fname).stem + ".txt")
        with open(lbl_file, "w", encoding="utf-8") as f:
            for b in boxes:
                f.write(f"{b[0]} {b[1]:.6f} {b[2]:.6f} {b[3]:.6f} {b[4]:.6f}\n")
        print(f"Updated YOLO label: {lbl_file.name} -> {len(boxes)} boxes")

    # 2. Update master audit CSV
    audit_path = BASE_DIR / "audit" / "dataset_01_candidate_audit.csv"
    rows = []
    fields = []
    with open(audit_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames
        for r in reader:
            fname = r["image_name"]
            if fname in CORRECTED_LABELS:
                r["annotation_status"] = "REVIEWED"
                r["severity"] = "UNASSIGNED"
                r["number_of_boxes"] = str(len(CORRECTED_LABELS[fname]))
                d = CHANGE_DETAILS[fname]
                r["reviewer_notes"] = f"Corrected to {len(CORRECTED_LABELS[fname])} verified targets. Deleted: {len(d['deleted'])}; Resized: {len(d['resized'])}; Added: {len(d['added'])}."
            elif fname == "aphids_disease_(12).jpg":
                r["annotation_status"] = "MANUAL_EXPERT_REVIEW"
                r["severity"] = "UNASSIGNED"
                r["reviewer_notes"] = "EXIF 90-degree orientation mismatch: all AI boxes located in white background. Retained as MANUAL_EXPERT_REVIEW."
            rows.append(r)

    with open(audit_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"Updated master audit CSV: {audit_path}")

    # 3. Render verification contact sheet of the corrected 6 images
    sheet_w = 2000
    card_h = 360
    header_h = 90
    total_h = header_h + card_h * 6 + 30

    sheet = Image.new("RGB", (sheet_w, total_h), color=(14, 16, 22))
    draw = ImageDraw.Draw(sheet)

    try:
        font_title = ImageFont.truetype("arial.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 14)
        font_card = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        font_title = font_sub = font_card = ImageFont.load_default()

    draw.text((30, 20), "Verified Ground Truth Annotations: Images 4, 6, 7, 8, 9, 10", fill=(255, 255, 255), font=font_title)
    draw.text((30, 56), "All false positives deleted, loose boxes resized to leaf margins, missing targets added | Status: REVIEWED", fill=(160, 175, 195), font=font_sub)

    for idx, (fname, boxes) in enumerate(CORRECTED_LABELS.items()):
        y_pos = header_h + idx * card_h
        raw_img = Image.open(img_dir / fname).convert("RGB")
        w, h = raw_img.size

        annotated = raw_img.copy()
        a_draw = ImageDraw.Draw(annotated)

        for b in boxes:
            x1 = int((b[1] - b[3]/2) * w)
            y1 = int((b[2] - b[4]/2) * h)
            x2 = int((b[1] + b[3]/2) * w)
            y2 = int((b[2] + b[4]/2) * h)
            a_draw.rectangle([x1, y1, x2, y2], outline=(0, 230, 115), width=12)

        thumb_w, thumb_h = 1300, card_h - 40
        annotated.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        tw, th = annotated.size

        # Paste preview on left
        sheet.paste(annotated, (30, y_pos + (card_h - th)//2))

        # Text panel on right
        d = CHANGE_DETAILS[fname]
        tx = 1360
        ty = y_pos + 30
        draw.text((tx, ty), f"{fname}", fill=(255, 255, 255), font=font_title)
        draw.text((tx, ty + 36), f"Boxes: {d['before']} -> {d['after']} | Status: REVIEWED | Severity: UNASSIGNED", fill=(100, 255, 150), font=font_card)
        draw.text((tx, ty + 66), f"Deleted: {', '.join(d['deleted']) if d['deleted'] else 'None'}", fill=(255, 120, 120), font=font_card)
        draw.text((tx, ty + 96), f"Resized: {', '.join(d['resized']) if d['resized'] else 'None'}", fill=(255, 200, 80), font=font_card)
        draw.text((tx, ty + 126), f"Added:   {', '.join(d['added']) if d['added'] else 'None'}", fill=(100, 200, 255), font=font_card)

        # Line separator
        draw.line([(30, y_pos + card_h - 2), (sheet_w - 30, y_pos + card_h - 2)], fill=(35, 40, 55), width=1)

    out_sheet = ART_DIR / "corrected_images_4_to_10_verification.png"
    sheet.save(out_sheet, "PNG", optimize=True)
    print(f"Generated verification sheet: {out_sheet.name}")

if __name__ == "__main__":
    main()
