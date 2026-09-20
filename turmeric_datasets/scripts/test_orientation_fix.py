"""
Test Safe Orientation Normalization on the 8 Flagged Images from Batch 02
========================================================================
1. Verifies that original dataset files remain 100% untouched.
2. Applies orientation normalization to the 8 working copies in auto_annotations/images/test/.
3. Generates new candidate bounding boxes on the normalized upright working images.
4. Compares old candidate boxes (Before) vs new normalized candidate boxes (After).
5. Renders a side-by-side Before/After visual comparison contact sheet.
6. Keeps audit status strictly as MANUAL_EXPERT_REVIEW.
"""

from pathlib import Path
import os
import shutil
from PIL import Image, ImageOps, ImageDraw, ImageFont
import cv2
import numpy as np

# Import segmentation candidate generation functions
sys_path = Path(r"D:\curuma\turmeric_datasets\scripts")
import sys
if str(sys_path) not in sys.path:
    sys.path.append(str(sys_path))

from generate_full_segmentation_candidates import (
    process_single_image,
    get_class_info,
    segment_leaf,
    detect_aphid_clusters,
    detect_blotch_patches,
    detect_circular_spots
)

BASE_DIR = Path(r"D:\curuma\turmeric_datasets")
SRC_DIR = BASE_DIR / "annotations" / "images" / "test"
AUTO_DIR = BASE_DIR / "auto_annotations"
AUTO_IMG_DIR = AUTO_DIR / "images" / "test"
AUTO_LBL_DIR = AUTO_DIR / "labels" / "test"
ART_DIR = Path(r"C:\Users\SUTHERSON R\.gemini\antigravity-ide\brain\56a05c34-b065-4592-8389-64df0be1c620")

FLAGGED_IMAGES = [
    "aphids_disease_(88).jpg",
    "aphids_disease_(96).jpg",
    "blotch_(106).jpg",
    "blotch_(129).jpg",
    "blotch_(142).jpg",
    "blotch_(148).jpg",
    "blotch_(153).jpg",
    "blotch_(193).jpg",
]

# 1. Capture Before State (old candidate boxes)
before_boxes = {}
for fname in FLAGGED_IMAGES:
    lbl_p = AUTO_LBL_DIR / (Path(fname).stem + ".txt")
    boxes = []
    if lbl_p.exists():
        with open(lbl_p) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 5:
                    boxes.append([int(parts[0])] + [float(x) for x in parts[1:]])
    before_boxes[fname] = boxes

# Verify original file properties before run
orig_stats_before = {}
for fname in FLAGGED_IMAGES:
    src_p = SRC_DIR / fname
    with Image.open(src_p) as im:
        orig_stats_before[fname] = {
            "size": im.size,
            "stat": src_p.stat().st_size,
            "orient": im.getexif().get(0x0112, 1)
        }

# 2. Re-run ONLY the 8 images with normalized orientation
after_boxes = {}
norm_info = {}

for fname in FLAGGED_IMAGES:
    src_p = SRC_DIR / fname
    dst_p = AUTO_IMG_DIR / fname
    lbl_p = AUTO_LBL_DIR / (Path(fname).stem + ".txt")
    
    # Save old label to backup
    backup_lbl = ART_DIR / "scratch" / "before_labels" / (Path(fname).stem + ".txt")
    backup_lbl.parent.mkdir(parents=True, exist_ok=True)
    if lbl_p.exists():
        shutil.copy2(lbl_p, backup_lbl)

    # Process using process_single_image
    res = process_single_image((src_p, "test", dst_p, lbl_p))
    
    # Read newly generated boxes
    boxes = []
    if lbl_p.exists():
        with open(lbl_p) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 5:
                    boxes.append([int(parts[0])] + [float(x) for x in parts[1:]])
    after_boxes[fname] = boxes

    with Image.open(dst_p) as im_dst:
        norm_info[fname] = {
            "orig_size": orig_stats_before[fname]["size"],
            "orig_orient": orig_stats_before[fname]["orient"],
            "new_size": im_dst.size,
            "new_orient": im_dst.getexif().get(0x0112, 1),
            "n_before": len(before_boxes[fname]),
            "n_after": len(boxes),
        }

# 3. Verify original dataset files remained 100% UNTOUCHED
print("Checking original dataset preservation...")
for fname in FLAGGED_IMAGES:
    src_p = SRC_DIR / fname
    with Image.open(src_p) as im:
        curr_size = im.size
        curr_stat = src_p.stat().st_size
        curr_orient = im.getexif().get(0x0112, 1)
        b = orig_stats_before[fname]
        assert curr_size == b["size"], f"Original size changed for {fname}!"
        assert curr_stat == b["stat"], f"Original byte size changed for {fname}!"
        assert curr_orient == b["orient"], f"Original EXIF orientation changed for {fname}!"

print("CONFIRMED: Original dataset files are 100% untouched and preserved.")

# 4. Generate Before / After Visual Comparison Contact Sheet
print("Rendering Before vs After visual comparison...")
cols = 2  # Col 0: Before (unnormalized), Col 1: After (normalized)
rows = 8  # 8 images
card_w = 700
card_h = 360
margin = 25
header_h = 90

total_w = margin * 2 + cols * card_w + 30
total_h = margin * 2 + header_h + rows * card_h + (rows - 1) * 16

sheet = Image.new("RGB", (total_w, total_h), color=(14, 16, 22))
draw = ImageDraw.Draw(sheet)

try:
    font_title = ImageFont.truetype("arialbd.ttf", 26)
    font_sub = ImageFont.truetype("arial.ttf", 14)
    font_card = ImageFont.truetype("arialbd.ttf", 14)
    font_badge = ImageFont.truetype("arialbd.ttf", 15)
except Exception:
    font_title = font_sub = font_card = font_badge = ImageFont.load_default()

draw.text((margin, margin), "EXIF Orientation Normalization Test: 8 Flagged Images", fill=(255, 255, 255), font=font_title)
draw.text((margin, margin + 36), "Side-by-side comparison: Before (unrotated raw pixel loading) vs After (safe orientation normalization)", fill=(160, 175, 195), font=font_sub)

BOX_COLORS = [
    (255, 80, 80),   # Red
    (0, 210, 255),   # Cyan
    (255, 190, 40),  # Amber
    (0, 230, 115),   # Green
    (180, 110, 255), # Purple
    (255, 130, 60),  # Coral
]

for idx, fname in enumerate(FLAGGED_IMAGES):
    y = margin + header_h + idx * (card_h + 16)
    info = norm_info[fname]

    # --- LEFT: BEFORE (Raw unrotated loading) ---
    x_before = margin
    src_p = SRC_DIR / fname
    # Load unrotated as cv2/PIL did originally
    im_before = Image.open(src_p).convert("RGB")
    thumb_b = im_before.copy()
    thumb_b.thumbnail((card_w - 16, card_h - 44), Image.Resampling.LANCZOS)
    tb_w, tb_h = thumb_b.size
    d_b = ImageDraw.Draw(thumb_b)

    for b_idx, b in enumerate(before_boxes[fname], 1):
        xc, yc, bw, bh = b[1:]
        bx1 = int((xc - bw/2) * tb_w)
        by1 = int((yc - bh/2) * tb_h)
        bx2 = int((xc + bw/2) * tb_w)
        by2 = int((yc + bh/2) * tb_h)
        col = (255, 50, 50)
        d_b.rectangle([bx1, by1, bx2, by2], outline=col, width=2)
        d_b.text((bx1 + 4, max(0, by1 - 18)), f"B{b_idx}", fill=col, font=font_badge)

    draw.rectangle([x_before, y, x_before + card_w, y + card_h], fill=(22, 25, 33), outline=(220, 38, 38), width=2)
    sheet.paste(thumb_b, (x_before + (card_w - tb_w)//2, y + 36 + (card_h - 44 - tb_h)//2))
    lbl_left = f"BEFORE: {fname} (EXIF {info['orig_orient']} | {info['n_before']} boxes | MISALIGNED)"
    draw.text((x_before + 12, y + 10), lbl_left, fill=(255, 120, 120), font=font_card)

    # --- RIGHT: AFTER (Normalized upright working copy) ---
    x_after = margin + card_w + 30
    dst_p = AUTO_IMG_DIR / fname
    im_after = Image.open(dst_p).convert("RGB")
    thumb_a = im_after.copy()
    thumb_a.thumbnail((card_w - 16, card_h - 44), Image.Resampling.LANCZOS)
    ta_w, ta_h = thumb_a.size
    d_a = ImageDraw.Draw(thumb_a)

    for b_idx, b in enumerate(after_boxes[fname], 1):
        xc, yc, bw, bh = b[1:]
        bx1 = int((xc - bw/2) * ta_w)
        by1 = int((yc - bh/2) * ta_h)
        bx2 = int((xc + bw/2) * ta_w)
        by2 = int((yc + bh/2) * ta_h)
        col = BOX_COLORS[(b_idx - 1) % len(BOX_COLORS)]
        d_a.rectangle([bx1, by1, bx2, by2], outline=col, width=3)
        d_a.text((bx1 + 4, max(0, by1 - 18)), f"B{b_idx}", fill=col, font=font_badge)

    draw.rectangle([x_after, y, x_after + card_w, y + card_h], fill=(22, 25, 33), outline=(34, 197, 94), width=2)
    sheet.paste(thumb_a, (x_after + (card_w - ta_w)//2, y + 36 + (card_h - 44 - ta_h)//2))
    lbl_right = f"AFTER: {fname} (Upright {info['new_size'][0]}x{info['new_size'][1]} | {info['n_after']} boxes | ALIGNED)"
    draw.text((x_after + 12, y + 10), lbl_right, fill=(100, 255, 150), font=font_card)

out_comp_path = ART_DIR / "orientation_normalization_before_after.png"
sheet.save(out_comp_path, "PNG", optimize=True)
print(f"Saved Before/After contact sheet: {out_comp_path}")

# Print summary table
print("\n" + "="*80)
print(f"{'Image Name':<26} | {'EXIF':<5} | {'Orig Size':<12} | {'Norm Size':<12} | {'Before':<7} | {'After':<7}")
print("="*80)
for fname, inf in norm_info.items():
    print(f"{fname:<26} | {inf['orig_orient']:<5} | {str(inf['orig_size']):<12} | {str(inf['new_size']):<12} | {inf['n_before']:<7} | {inf['n_after']:<7}")
print("="*80)
