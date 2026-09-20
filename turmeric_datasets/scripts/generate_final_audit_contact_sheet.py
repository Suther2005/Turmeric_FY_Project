"""
Generate Final Quality Audit Contact Sheet for Images 119, 122, 124, 130, 144, 149
===================================================================================
Produces a dedicated high-resolution visual contact sheet showing each of the 6
REVIEWED images with distinct, high-contrast, numbered bounding boxes (B1..Bn).
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(r"D:\curuma\turmeric_datasets\auto_annotations")
ART_DIR = Path(r"C:\Users\SUTHERSON R\.gemini\antigravity-ide\brain\56a05c34-b065-4592-8389-64df0be1c620")

IMAGES = [
    "aphids_disease_(119).jpg",
    "aphids_disease_(122).jpg",
    "aphids_disease_(124).jpg",
    "aphids_disease_(130).jpg",
    "aphids_disease_(144).jpg",
    "aphids_disease_(149).jpg",
]

cols = 2
rows = 3
card_w = 950
card_h = 440
margin = 30
header_h = 90

total_w = margin * 2 + cols * card_w + (cols - 1) * 24
total_h = margin * 2 + header_h + rows * card_h + (rows - 1) * 24

sheet = Image.new("RGB", (total_w, total_h), color=(14, 16, 22))
draw = ImageDraw.Draw(sheet)

try:
    font_title = ImageFont.truetype("arial.ttf", 26)
    font_sub = ImageFont.truetype("arial.ttf", 14)
    font_card = ImageFont.truetype("arial.ttf", 13)
    font_box = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font_title = font_sub = font_card = font_box = ImageFont.load_default()

draw.text((margin, margin), "Final Quality Audit: 6 Reviewed Aphids Images", fill=(255, 255, 255), font=font_title)
draw.text((margin, margin + 34), "Verification of 31 corrected bounding boxes across 119, 122, 124, 130, 144, 149 | Box-by-box tightness & symptom audit", fill=(160, 175, 195), font=font_sub)

BOX_COLORS = [
    (0, 230, 115),   # B1: Emerald Green
    (0, 210, 255),   # B2: Cyan
    (255, 190, 40),  # B3: Amber
    (255, 105, 180), # B4: Hot Pink
    (180, 110, 255), # B5: Purple
    (255, 130, 60),  # B6: Coral
]

for idx, fname in enumerate(IMAGES):
    r = idx // cols
    c = idx % cols
    x = margin + c * (card_w + 24)
    y = margin + header_h + r * (card_h + 24)

    lbl_path = BASE_DIR / "labels" / "test" / (Path(fname).stem + ".txt")
    img_path = BASE_DIR / "images" / "test" / fname

    img = Image.open(img_path).convert("RGB")
    iw, ih = img.size

    boxes = []
    if lbl_path.exists():
        with open(lbl_path) as f:
            for l in f:
                parts = l.strip().split()
                if len(parts) == 5:
                    boxes.append([int(parts[0])] + [float(v) for v in parts[1:]])

    annotated = img.copy()
    thumb_w, thumb_h = card_w - 20, card_h - 48
    annotated.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
    tw, th = annotated.size

    a_draw = ImageDraw.Draw(annotated)
    try:
        font_box_scaled = ImageFont.truetype("arialbd.ttf", 20)
    except Exception:
        font_box_scaled = font_box

    for b_idx, b in enumerate(boxes, 1):
        xc, yc, bw, bh = b[1:]
        bx1 = int((xc - bw/2) * tw)
        by1 = int((yc - bh/2) * th)
        bx2 = int((xc + bw/2) * tw)
        by2 = int((yc + bh/2) * th)
        col = BOX_COLORS[(b_idx - 1) % len(BOX_COLORS)]

        a_draw.rectangle([bx1, by1, bx2, by2], outline=col, width=3)

        # Draw clear badge
        badge_text = f"B{b_idx}"
        bbox = a_draw.textbbox((0, 0), badge_text, font=font_box_scaled)
        bw_txt = bbox[2] - bbox[0] + 12
        bh_txt = bbox[3] - bbox[1] + 8
        badge_y1 = max(0, by1 - bh_txt)
        a_draw.rectangle([bx1, badge_y1, bx1 + bw_txt, badge_y1 + bh_txt], fill=col)
        a_draw.text((bx1 + 6, badge_y1 + 4), badge_text, fill=(0, 0, 0), font=font_box_scaled)

    # Card container
    draw.rectangle([x, y, x + card_w, y + card_h], fill=(22, 25, 33), outline=(42, 48, 62), width=1)
    sheet.paste(annotated, (x + (card_w - tw)//2, y + 36 + (thumb_h - th)//2))

    card_header = f"#{idx+1}: {fname} ({len(boxes)} boxes | Status: REVIEWED)"
    draw.text((x + 12, y + 10), card_header, fill=(240, 245, 255), font=font_card)

out_file = ART_DIR / "final_quality_audit_6_reviewed.png"
sheet.save(out_file, "PNG", optimize=True)
print(f"Generated final audit sheet: {out_file.name}")
