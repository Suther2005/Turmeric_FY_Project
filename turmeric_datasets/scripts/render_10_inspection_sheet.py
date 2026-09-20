import urllib.request
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

base = Path(r"D:\curuma\turmeric_datasets\auto_annotations")
art_dir = Path(r"C:\Users\SUTHERSON R\.gemini\antigravity-ide\brain\56a05c34-b065-4592-8389-64df0be1c620")

res = urllib.request.urlopen("http://127.0.0.1:5000/api/images")
all_imgs = json.loads(res.read().decode())[:10]

cols = 2
rows = 5
card_w = 920
card_h = 420
margin = 30
header_h = 90

total_w = margin * 2 + cols * card_w + (cols - 1) * 20
total_h = margin * 2 + header_h + rows * card_h + (rows - 1) * 20

sheet = Image.new("RGB", (total_w, total_h), color=(14, 16, 22))
draw = ImageDraw.Draw(sheet)

try:
    font_title = ImageFont.truetype("arial.ttf", 24)
    font_sub = ImageFont.truetype("arial.ttf", 13)
    font_card = ImageFont.truetype("arial.ttf", 13)
    font_box = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font_title = font_sub = font_card = font_box = ImageFont.load_default()

draw.text((margin, margin), "Annotation Tutorial: Visual Box Inspection (First 10 Images)", fill=(255, 255, 255), font=font_title)
draw.text((margin, margin + 34), "Inspection of every candidate bounding box to teach KEEP, RESIZE, DELETE, and ADD rules", fill=(160, 175, 195), font=font_sub)

colors = [
    (255, 75, 75),   # B1: Red
    (255, 180, 30),  # B2: Amber
    (0, 210, 255),   # B3: Cyan
    (180, 100, 255), # B4: Purple
    (255, 105, 180), # B5: Pink
    (100, 255, 150)  # B6: Light Green
]

for idx, item in enumerate(all_imgs):
    r = idx // cols
    c = idx % cols
    x = margin + c * (card_w + 20)
    y = margin + header_h + r * (card_h + 20)

    fname = item["image_name"]
    split = item["split"]
    status = item.get("annotation_status", "AUTO_GENERATED")

    lbl_path = base / "labels" / split / (Path(fname).stem + ".txt")
    boxes = []
    if lbl_path.exists():
        with open(lbl_path) as f:
            for l in f:
                parts = l.strip().split()
                if len(parts) == 5:
                    boxes.append([int(parts[0])] + [float(v) for v in parts[1:]])

    img_path = base / "images" / split / fname
    img = Image.open(img_path).convert("RGB")
    iw, ih = img.size

    annotated = img.copy()
    a_draw = ImageDraw.Draw(annotated)

    for b_idx, b in enumerate(boxes, 1):
        xc, yc, bw, bh = b[1:]
        bx1 = int((xc - bw/2) * iw)
        by1 = int((yc - bh/2) * ih)
        bx2 = int((xc + bw/2) * iw)
        by2 = int((yc + bh/2) * ih)
        box_col = colors[(b_idx - 1) % len(colors)]
        a_draw.rectangle([bx1, by1, bx2, by2], outline=box_col, width=14)
        
        # Tag pill
        tag_w = 70
        tag_h = 36
        tag_y1 = max(0, by1 - tag_h)
        a_draw.rectangle([bx1, tag_y1, bx1 + tag_w, tag_y1 + tag_h], fill=box_col)
        a_draw.text((bx1 + 10, tag_y1 + 6), f"B{b_idx}", fill=(0, 0, 0), font=font_box)

    thumb_w, thumb_h = card_w - 20, card_h - 50
    annotated.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
    tw, th = annotated.size

    draw.rectangle([x, y, x + card_w, y + card_h], fill=(22, 25, 33), outline=(42, 48, 62), width=1)
    sheet.paste(annotated, (x + (card_w - tw)//2, y + 38 + (thumb_h - th)//2))

    header_text = f"#{idx+1}: {fname} ({len(boxes)} boxes | Status: {status})"
    draw.text((x + 12, y + 10), header_text, fill=(240, 245, 255), font=font_card)

out_path = art_dir / "first_10_images_inspection_sheet.png"
sheet.save(out_path, "PNG", optimize=True)
print(f"Saved 10-image inspection sheet: {out_path}")
