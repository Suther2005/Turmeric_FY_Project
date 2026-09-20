"""
Generate Detailed Visual Inspection Cards for Images 4 to 10
============================================================
Creates high-resolution visual breakdowns for:
- Image 4: aphids_disease_(119).jpg
- Image 5: aphids_disease_(12).jpg
- Image 6: aphids_disease_(122).jpg
- Image 7: aphids_disease_(124).jpg
- Image 8: aphids_disease_(130).jpg
- Image 9: aphids_disease_(144).jpg
- Image 10: aphids_disease_(149).jpg

Each card includes:
- Full leaf with large numbered box outlines (B1..B6) and proposed ADD regions (ADD1..)
- Zoomed-in crops of each box so a beginner can see the exact leaf surface
"""

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(r"D:\curuma\turmeric_datasets\auto_annotations")
ART_DIR = Path(r"C:\Users\SUTHERSON R\.gemini\antigravity-ide\brain\56a05c34-b065-4592-8389-64df0be1c620")

IMAGES = [
    {"num": 4, "name": "aphids_disease_(119).jpg", "split": "test"},
    {"num": 5, "name": "aphids_disease_(12).jpg", "split": "test"},
    {"num": 6, "name": "aphids_disease_(122).jpg", "split": "test"},
    {"num": 7, "name": "aphids_disease_(124).jpg", "split": "test"},
    {"num": 8, "name": "aphids_disease_(130).jpg", "split": "test"},
    {"num": 9, "name": "aphids_disease_(144).jpg", "split": "test"},
    {"num": 10, "name": "aphids_disease_(149).jpg", "split": "test"},
]

# Distinct colors for B1..B6
BOX_COLORS = [
    (255, 60, 60),    # B1: Red
    (255, 160, 20),   # B2: Orange
    (0, 210, 255),    # B3: Cyan
    (180, 90, 255),   # B4: Purple
    (255, 90, 180),   # B5: Magenta
    (255, 220, 0),    # B6: Yellow
]
ADD_COLOR = (0, 255, 120) # Bright Emerald Green for ADD

try:
    font_large = ImageFont.truetype("arial.ttf", 36)
    font_mid = ImageFont.truetype("arial.ttf", 22)
    font_small = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font_large = font_mid = font_small = ImageFont.load_default()

for item in IMAGES:
    idx = item["num"]
    fname = item["name"]
    split = item["split"]

    img_path = BASE_DIR / "images" / split / fname
    lbl_path = BASE_DIR / "labels" / split / (Path(fname).stem + ".txt")

    img = Image.open(img_path).convert("RGB")
    w, h = img.size

    boxes = []
    if lbl_path.exists():
        with open(lbl_path) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 5:
                    boxes.append([int(parts[0])] + [float(v) for v in parts[1:]])

    # 1. Render annotated full image
    annotated = img.copy()
    draw = ImageDraw.Draw(annotated)

    pixel_boxes = []
    for b_idx, b in enumerate(boxes, 1):
        xc, yc, bw, bh = b[1:]
        x1 = max(0, int((xc - bw/2) * w))
        y1 = max(0, int((yc - bh/2) * h))
        x2 = min(w, int((xc + bw/2) * w))
        y2 = min(h, int((yc + bh/2) * h))
        col = BOX_COLORS[(b_idx - 1) % len(BOX_COLORS)]

        pixel_boxes.append((b_idx, x1, y1, x2, y2, col))

        # Thick rectangle
        draw.rectangle([x1, y1, x2, y2], outline=col, width=16)

        # Label pill
        label = f"B{b_idx}"
        pill_w = 120
        pill_h = 55
        pill_y1 = max(0, y1 - pill_h)
        draw.rectangle([x1, pill_y1, x1 + pill_w, pill_y1 + pill_h], fill=col)
        draw.text((x1 + 18, pill_y1 + 8), label, fill=(0, 0, 0), font=font_large)

    # 2. Build multi-panel tutorial breakdown card
    # Top: Full image annotated (1800 x 600)
    # Bottom: 6 cropped boxes in a grid
    panel_w = 1920
    panel_h = 1350
    card = Image.new("RGB", (panel_w, panel_h), color=(15, 18, 24))
    c_draw = ImageDraw.Draw(card)

    # Header
    c_draw.text((40, 25), f"Image #{idx}: {fname} — Bounding Box Pathology Inspection", fill=(255, 255, 255), font=font_large)
    c_draw.text((40, 75), "Inspect each box below to see the visible leaf surface and understand the decision rule.", fill=(160, 175, 195), font=font_mid)

    # Paste full annotated leaf scaled
    main_preview = annotated.copy()
    main_preview.thumbnail((1840, 620), Image.Resampling.LANCZOS)
    mw, mh = main_preview.size
    card.paste(main_preview, (40 + (1840 - mw)//2, 120 + (620 - mh)//2))

    # Divider
    c_draw.rectangle([40, 760, 1880, 762], fill=(45, 52, 68))
    c_draw.text((40, 775), "HIGH-RESOLUTION CROPS OF VISIBLE LEAF SURFACE INSIDE EACH BOX:", fill=(220, 230, 245), font=font_mid)

    # 6 crops: 2 rows of 3 columns
    crop_w = 580
    crop_h = 220
    for b_idx, x1, y1, x2, y2, col in pixel_boxes:
        r = (b_idx - 1) // 3
        c = (b_idx - 1) % 3
        cx = 40 + c * (crop_w + 50)
        cy = 820 + r * (crop_h + 35)

        # Crop from raw image
        bx_w = max(10, x2 - x1)
        bx_h = max(10, y2 - y1)
        # Pad crop slightly for context
        pad_x = int(bx_w * 0.15)
        pad_y = int(bx_h * 0.15)
        crop_rect = (max(0, x1 - pad_x), max(0, y1 - pad_y), min(w, x2 + pad_x), min(h, y2 + pad_y))
        cropped = img.crop(crop_rect)

        # Draw box outline on crop to show exact boundary
        cr_draw = ImageDraw.Draw(cropped)
        inner_x1 = x1 - crop_rect[0]
        inner_y1 = y1 - crop_rect[1]
        inner_x2 = x2 - crop_rect[0]
        inner_y2 = y2 - crop_rect[1]
        cr_draw.rectangle([inner_x1, inner_y1, inner_x2, inner_y2], outline=col, width=8)

        cropped.thumbnail((crop_w, crop_h - 40), Image.Resampling.LANCZOS)
        cw, ch = cropped.size

        # Card container
        c_draw.rectangle([cx, cy, cx + crop_w, cy + crop_h], fill=(24, 28, 38), outline=(50, 58, 76), width=1)
        # Tag header
        c_draw.rectangle([cx, cy, cx + crop_w, cy + 32], fill=(32, 38, 52))
        c_draw.text((cx + 10, cy + 6), f"Box B{b_idx} Crop (Size: {x2-x1}x{y2-y1} px)", fill=col, font=font_small)

        # Paste crop
        card.paste(cropped, (cx + (crop_w - cw)//2, cy + 34 + ((crop_h - 40) - ch)//2))

    out_file = ART_DIR / f"tutorial_image_{idx}_{Path(fname).stem}.png"
    card.save(out_file, "PNG", optimize=True)
    print(f"Generated tutorial card: {out_file.name}")
