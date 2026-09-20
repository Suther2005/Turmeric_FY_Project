"""
Annotation Correction Script: 3 Sample Aphids Images
=====================================================
Applies research ground truth correction to the 3 Aphids images shown in the review UI:
- aphids_disease_(104).jpg
- aphids_disease_(105).jpg
- aphids_disease_(106).jpg

Tasks:
1. Review every generated bounding box against the actual visible feeding damage.
2. Delete boxes that are wrong, background-only, or redundant/loose.
3. Tighten / reposition boxes to tightly enclose visible feeding punctate clusters.
4. Update YOLO .txt label files in auto_annotations/labels/test/.
5. Mark annotation_status as REVIEWED in dataset_01_candidate_audit.csv.
6. Leave severity as UNASSIGNED.
7. Render side-by-side Before/After comparison contact sheet in artifacts.
"""

import os
import csv
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(r"D:\curuma\turmeric_datasets\auto_annotations")
ART_DIR = Path(r"C:\Users\SUTHERSON R\.gemini\antigravity-ide\brain\56a05c34-b065-4592-8389-64df0be1c620")

# High-precision corrected ground-truth boxes in YOLO format: (class_id, xc, yc, w, h)
CORRECTED_LABELS = {
    "aphids_disease_(104).jpg": [
        (0, 0.340000, 0.370000, 0.300000, 0.126667),  # Target 1: Upper-blade chlorotic feeding cluster
        (0, 0.457500, 0.493333, 0.205000, 0.113333),  # Target 2: Lower-blade dense feeding punctures
        (0, 0.731250, 0.513333, 0.072500, 0.053333),  # Target 3: Right midrib feeding streak
    ],
    "aphids_disease_(105).jpg": [
        (0, 0.310000, 0.350000, 0.190000, 0.086667),  # Target 1: Upper-blade chlorotic feeding cluster
        (0, 0.362500, 0.445000, 0.245000, 0.083333),  # Target 2: Lower-blade dense feeding punctures
        (0, 0.658750, 0.425000, 0.142500, 0.063333),  # Target 3: Right parallel feeding streaks
    ],
    "aphids_disease_(106).jpg": [
        (0, 0.330000, 0.426667, 0.220000, 0.093333),  # Target 1: Upper-blade chlorotic feeding cluster
        (0, 0.447500, 0.513333, 0.255000, 0.120000),  # Target 2: Lower-blade dense feeding punctures
        (0, 0.657500, 0.518333, 0.115000, 0.063333),  # Target 3: Right parallel feeding streaks
    ],
}

CHANGE_RECORDS = {
    "aphids_disease_(104).jpg": {
        "before": 6,
        "after": 3,
        "deleted": [
            "Box 3 [0.775, 0.547] (redundant strip on green leaf margin)",
            "Box 5 [0.964, 0.016] (background corner smudge)",
            "Box 6 [0.564, 0.505] (subsumed duplicate into Target 2)"
        ],
        "modified": [
            "Box 1 tightened from whole-upper-leaf (0.558x0.244) down to upper feeding cluster (0.300x0.127)",
            "Box 2 refined to (0.205x0.113) tightly covering lower cluster",
            "Box 4 refined to (0.073x0.053) framing right streak"
        ],
        "added": []
    },
    "aphids_disease_(105).jpg": {
        "before": 6,
        "after": 3,
        "deleted": [
            "Box 1 [0.607, 0.455] (over-expansive 78%-width leaf strip extending into background)",
            "Box 2 [0.136, 0.421] (unaffected green leaf apex tip)",
            "Box 6 [0.468, 0.339] (healthy leaf lamina)"
        ],
        "modified": [
            "Box 4 refined to (0.190x0.087) tightly covering upper feeding cluster",
            "Box 3 refined to (0.245x0.083) tightly covering lower feeding cluster",
            "Box 5 refined to (0.143x0.063) framing right streaks"
        ],
        "added": []
    },
    "aphids_disease_(106).jpg": {
        "before": 4,
        "after": 3,
        "deleted": [
            "Box 1 [0.451, 0.684] (huge vertical box extending into bottom white sheet)",
            "Box 2 [0.555, 0.415] (distorted vertical strip across midrib)",
            "Box 3 [0.456, 0.097] (floating in empty upper white background)",
            "Box 4 [0.512, 0.362] (distorted vertical box on green leaf)"
        ],
        "modified": [],
        "added": [
            "Target 1 [0.330, 0.427, 0.220, 0.093] (upper feeding cluster)",
            "Target 2 [0.448, 0.513, 0.255, 0.120] (lower feeding cluster)",
            "Target 3 [0.658, 0.518, 0.115, 0.063] (right feeding streaks)"
        ]
    }
}

def main():
    print("=" * 75)
    print("CORRECTING ANNOTATIONS FOR 3 SAMPLE APHIDS IMAGES")
    print("=" * 75)

    lbl_dir = BASE_DIR / "labels" / "test"
    img_dir = BASE_DIR / "images" / "test"

    # 1. Update YOLO label files
    for fname, boxes in CORRECTED_LABELS.items():
        lbl_file = lbl_dir / (Path(fname).stem + ".txt")
        with open(lbl_file, "w", encoding="utf-8") as f:
            for b in boxes:
                f.write(f"{b[0]} {b[1]:.6f} {b[2]:.6f} {b[3]:.6f} {b[4]:.6f}\n")
        print(f"Updated YOLO label file: {lbl_file} ({len(boxes)} boxes)")

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
                chg = CHANGE_RECORDS[fname]
                r["reviewer_notes"] = f"Corrected to {len(CORRECTED_LABELS[fname])} tight lesion targets. Deleted: {len(chg['deleted'])}; Modified: {len(chg['modified'])}; Added: {len(chg['added'])}."
            rows.append(r)

    with open(audit_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"Updated master audit manifest: {audit_path}")

    # 3. Render side-by-side Before/After comparison contact sheet
    sheet_w = 2000
    card_h = 430
    header_h = 100
    total_h = header_h + card_h * 3 + 40

    sheet = Image.new("RGB", (sheet_w, total_h), color=(14, 16, 22))
    draw = ImageDraw.Draw(sheet)

    try:
        font_title = ImageFont.truetype("arial.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 14)
        font_tag = ImageFont.truetype("arial.ttf", 13)
    except Exception:
        font_title = font_sub = font_tag = ImageFont.load_default()

    draw.text((30, 20), "Aphids Disease: Annotation Correction Verification (3 Sample Images)", fill=(255, 255, 255), font=font_title)
    draw.text((30, 58), "Left: AUTO_GENERATED (Initial Proposals) | Right: REVIEWED (Human-Corrected Ground Truth Targets)", fill=(160, 175, 195), font=font_sub)

    OLD_PROPOSALS = {
        "aphids_disease_(104).jpg": [
            (0, 0.339750, 0.387833, 0.557500, 0.243667),
            (0, 0.456375, 0.493667, 0.196750, 0.110000),
            (0, 0.774625, 0.547333, 0.291750, 0.060000),
            (0, 0.731250, 0.514000, 0.065500, 0.045333),
            (0, 0.964000, 0.016333, 0.072000, 0.032667),
            (0, 0.563625, 0.504500, 0.043750, 0.051667)
        ],
        "aphids_disease_(105).jpg": [
            (0, 0.606750, 0.455333, 0.786500, 0.120000),
            (0, 0.136375, 0.420667, 0.223750, 0.114667),
            (0, 0.363375, 0.448167, 0.238250, 0.076333),
            (0, 0.309125, 0.351333, 0.184250, 0.078667),
            (0, 0.658250, 0.424833, 0.137000, 0.057667),
            (0, 0.468375, 0.339333, 0.126250, 0.061333)
        ],
        "aphids_disease_(106).jpg": [
            (0, 0.450500, 0.684000, 0.244333, 0.460000),
            (0, 0.554667, 0.414625, 0.053333, 0.334750),
            (0, 0.455500, 0.097125, 0.071667, 0.194250),
            (0, 0.512167, 0.361500, 0.044333, 0.070000)
        ]
    }

    for idx, (fname, new_boxes) in enumerate(CORRECTED_LABELS.items()):
        y_pos = header_h + idx * card_h
        raw_img = Image.open(img_dir / fname).convert("RGB")
        w, h = raw_img.size

        # Before image (Red boxes)
        before_img = raw_img.copy()
        b_draw = ImageDraw.Draw(before_img)
        for b in OLD_PROPOSALS[fname]:
            x1 = int((b[1] - b[3]/2) * w)
            y1 = int((b[2] - b[4]/2) * h)
            x2 = int((b[1] + b[3]/2) * w)
            y2 = int((b[2] + b[4]/2) * h)
            b_draw.rectangle([x1, y1, x2, y2], outline=(255, 60, 60), width=10)

        # After image (Green boxes)
        after_img = raw_img.copy()
        a_draw = ImageDraw.Draw(after_img)
        for b in new_boxes:
            x1 = int((b[1] - b[3]/2) * w)
            y1 = int((b[2] - b[4]/2) * h)
            x2 = int((b[1] + b[3]/2) * w)
            y2 = int((b[2] + b[4]/2) * h)
            a_draw.rectangle([x1, y1, x2, y2], outline=(0, 230, 115), width=12)

        thumb_w, thumb_h = 930, 360
        before_img.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        after_img.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)

        sheet.paste(before_img, (30, y_pos + 32))
        sheet.paste(after_img, (1020, y_pos + 32))

        chg = CHANGE_RECORDS[fname]
        before_tag = f"{fname} | BEFORE: {chg['before']} boxes (AUTO_GENERATED)"
        after_tag = f"{fname} | AFTER: {chg['after']} boxes (REVIEWED - 3 Ground Truth Targets)"

        draw.text((30, y_pos + 8), before_tag, fill=(255, 120, 120), font=font_tag)
        draw.text((1020, y_pos + 8), after_tag, fill=(100, 255, 160), font=font_tag)

    out_sheet = ART_DIR / "aphids_3_correction_comparison.png"
    sheet.save(out_sheet, "PNG", optimize=True)
    print(f"Generated comparison contact sheet: {out_sheet}")

if __name__ == "__main__":
    main()
