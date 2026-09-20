"""
Turmeric Leaf Pathology — Leaf Detection Annotation Review & Verification Tool
==============================================================================
Interactive web review interface and API for human verification of automated
leaf candidate bounding boxes for Dataset 01 (865 images).

Follows LEAF_ANNOTATION_GUIDELINES.md:
  - Single class: class_id = 0 ('leaf')
  - YOLO format: <class_id> <x_center> <y_center> <width> <height>
  - Separate verified storage: turmeric_datasets/annotations/leaf_verified/
  - Original images and candidate annotations remain strictly unchanged.

Run:
  python turmeric_datasets/scripts/leaf_review_tool.py [--port 5050]
Then open:
  http://127.0.0.1:5050
"""

import os
import sys
import csv
import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from flask import Flask, jsonify, request, send_file, render_template_string

BASE_DIR = Path(r"d:\curuma\turmeric_datasets")
DATASET_DIR = BASE_DIR / "dataset_01" / "original"
REFINED_DIR = BASE_DIR / "auto_annotations" / "leaf_refined"
CANDIDATE_DIR = BASE_DIR / "auto_annotations" / "leaf_candidates"
ACTIVE_CANDIDATE_DIR = REFINED_DIR if REFINED_DIR.exists() else CANDIDATE_DIR
CANDIDATE_AUDIT_CSV = BASE_DIR / "auto_annotations" / "leaf_candidates_audit.csv"

VERIFIED_DIR = BASE_DIR / "annotations" / "leaf_verified"
VERIFIED_DIR.mkdir(parents=True, exist_ok=True)

VERIFIED_AUDIT_CSV = BASE_DIR / "annotations" / "leaf_verification_audit.csv"
REPORT_MD = BASE_DIR / "annotations" / "leaf_verification_report.md"

CATEGORIES = ["Aphids_Disease", "Blotch", "Healthy_Leaf", "Leaf_Spot"]

app = Flask(__name__)

def get_image_inventory():
    """Retrieve full 865 image inventory from Dataset 01 with category mapping."""
    inventory = []
    for cat in CATEGORIES:
        cat_dir = DATASET_DIR / cat
        if not cat_dir.exists():
            continue
        imgs = sorted(list(cat_dir.glob("*.jpg")) + list(cat_dir.glob("*.jpeg")) + list(cat_dir.glob("*.png")))
        for img in imgs:
            inventory.append({
                "category": cat,
                "filename": img.name,
                "stem": img.stem,
                "path": str(img),
                "rel_path": f"{cat}/{img.name}"
            })
    return inventory

def init_audit_db():
    """Ensure leaf_verification_audit.csv exists with all 865 items initialized."""
    inventory = get_image_inventory()
    existing = {}
    if VERIFIED_AUDIT_CSV.exists():
        with open(VERIFIED_AUDIT_CSV, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                existing[r["stem"]] = r
                
    rows = []
    for item in inventory:
        stem = item["stem"]
        if stem in existing:
            rows.append(existing[stem])
        else:
            # Check candidate box count from active candidate dir (refined by default)
            cand_file = ACTIVE_CANDIDATE_DIR / f"{stem}.txt"
            cand_count = 0
            if cand_file.exists():
                with open(cand_file, "r", encoding="utf-8") as cf:
                    cand_count = len([l for l in cf.readlines() if l.strip()])
                    
            # Check if verified file already exists
            ver_file = VERIFIED_DIR / f"{stem}.txt"
            ver_status = "pending"
            ver_count = 0
            if ver_file.exists():
                with open(ver_file, "r", encoding="utf-8") as vf:
                    ver_count = len([l for l in vf.readlines() if l.strip()])
                ver_status = "accepted" if ver_count == cand_count else "corrected"
                
            rows.append({
                "category": item["category"],
                "filename": item["filename"],
                "stem": stem,
                "status": ver_status,
                "candidate_box_count": cand_count,
                "verified_box_count": ver_count if ver_file.exists() else 0,
                "boxes_accepted": cand_count if ver_status == "accepted" else 0,
                "boxes_corrected": 0,
                "boxes_rejected": 0,
                "boxes_added": 0,
                "reviewer_notes": "",
                "updated_at": ""
            })
            
    with open(VERIFIED_AUDIT_CSV, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "category", "filename", "stem", "status",
            "candidate_box_count", "verified_box_count",
            "boxes_accepted", "boxes_corrected", "boxes_rejected",
            "boxes_added", "reviewer_notes", "updated_at"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

def load_audit():
    init_audit_db()
    items = []
    with open(VERIFIED_AUDIT_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            items.append(r)
    return items

def save_audit_record(record_dict):
    records = load_audit()
    updated = False
    for i, r in enumerate(records):
        if r["stem"] == record_dict["stem"]:
            records[i].update(record_dict)
            updated = True
            break
    if not updated:
        records.append(record_dict)
        
    with open(VERIFIED_AUDIT_CSV, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "category", "filename", "stem", "status",
            "candidate_box_count", "verified_box_count",
            "boxes_accepted", "boxes_corrected", "boxes_rejected",
            "boxes_added", "reviewer_notes", "updated_at"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
        
    update_markdown_report()

def update_markdown_report():
    """Regenerate leaf_verification_report.md based on current audit status."""
    records = load_audit()
    total_imgs = len(records)
    
    reviewed = [r for r in records if r["status"] != "pending"]
    pending = [r for r in records if r["status"] == "pending"]
    accepted = [r for r in records if r["status"] == "accepted"]
    corrected = [r for r in records if r["status"] == "corrected"]
    rejected = [r for r in records if r["status"] == "rejected"]
    
    total_accepted_boxes = sum(int(r.get("boxes_accepted", 0) or 0) for r in reviewed)
    total_corrected_boxes = sum(int(r.get("boxes_corrected", 0) or 0) for r in reviewed)
    total_rejected_boxes = sum(int(r.get("boxes_rejected", 0) or 0) for r in reviewed)
    total_added_boxes = sum(int(r.get("boxes_added", 0) or 0) for r in reviewed)
    total_candidate_boxes = sum(int(r.get("candidate_box_count", 0) or 0) for r in records)
    total_verified_boxes = sum(int(r.get("verified_box_count", 0) or 0) for r in reviewed)
    
    cat_summary = {}
    for cat in CATEGORIES:
        cat_records = [r for r in records if r["category"] == cat]
        cat_reviewed = [r for r in cat_records if r["status"] != "pending"]
        cat_summary[cat] = {
            "total": len(cat_records),
            "reviewed": len(cat_reviewed),
            "pending": len(cat_records) - len(cat_reviewed),
            "cand_boxes": sum(int(r.get("candidate_box_count", 0) or 0) for r in cat_records),
            "ver_boxes": sum(int(r.get("verified_box_count", 0) or 0) for r in cat_reviewed)
        }
        
    lines = [
        "# Turmeric Leaf Detection — Human Verification Progress Report",
        "",
        "> [!IMPORTANT]",
        "> **VERIFICATION STATUS DECLARATION**  ",
        "> Candidate bounding boxes are **strictly candidate proposals** generated through automated computer vision heuristics.  ",
        "> They must **NOT** be treated as ground truth or used for model training until human review is completed and logged in this report.",
        "",
        "## 1. Executive Tracking Summary",
        "",
        "| Metric | Count | Percentage |",
        "| :--- | :---: | :---: |",
        f"| **Total Images in Cohort** | **{total_imgs}** | 100.0% |",
        f"| **Images Reviewed (Completed)** | **{len(reviewed)}** | {len(reviewed)/total_imgs*100:.1f}% |",
        f"| **Images Pending Review** | **{len(pending)}** | {len(pending)/total_imgs*100:.1f}% |",
        f"| — Accepted Without Modification | {len(accepted)} | {len(accepted)/total_imgs*100:.1f}% |",
        f"| — Corrected / Edited Boxes | {len(corrected)} | {len(corrected)/total_imgs*100:.1f}% |",
        f"| — Rejected (0 Leaves / Excluded) | {len(rejected)} | {len(rejected)/total_imgs*100:.1f}% |",
        "",
        "---",
        "",
        "## 2. Bounding Box Action Ledger",
        "",
        "| Action on Boxes | Count | Description |",
        "| :--- | :---: | :--- |",
        f"| **Total Initial Candidate Boxes** | **{total_candidate_boxes}** | Baseline proposals from HSV/Otsu/Watershed |",
        f"| **Boxes Accepted** | **{total_accepted_boxes}** | Candidate boxes approved as accurate foliar boundaries |",
        f"| **Boxes Corrected / Resized** | **{total_corrected_boxes}** | Adjusted coordinates to align with lamina/petiole |",
        f"| **Boxes Rejected / Removed** | **{total_rejected_boxes}** | Background shadow, dust, or artifact boxes pruned |",
        f"| **Boxes Added** | **{total_added_boxes}** | Missing leaf instances annotated from scratch |",
        f"| **Current Verified Leaf Boxes** | **{total_verified_boxes}** | Total certified boxes saved in `annotations/leaf_verified/` |",
        "",
        "---",
        "",
        "## 3. Progress by Pathology Cohort",
        "",
        "| Pathology Class | Total Images | Reviewed | Pending | Initial Candidates | Current Verified Boxes |",
        "| :--- | :---: | :---: | :---: | :---: | :---: |"
    ]
    
    for cat in CATEGORIES:
        s = cat_summary[cat]
        lines.append(f"| **`{cat}`** | {s['total']} | {s['reviewed']} | {s['pending']} | {s['cand_boxes']} | {s['ver_boxes']} |")
        
    lines.extend([
        f"| **TOTAL** | **{total_imgs}** | **{len(reviewed)}** | **{len(pending)}** | **{total_candidate_boxes}** | **{total_verified_boxes}** |",
        "",
        "---",
        "",
        "## 4. Verification Protocol Compliance",
        "",
        "Verification strictly enforces [`LEAF_ANNOTATION_GUIDELINES.md`](file:///d:/curuma/turmeric_datasets/annotations/LEAF_ANNOTATION_GUIDELINES.md):",
        "- **Class Definition:** Single class strictly mapped to `class_id = 0` (`leaf`).",
        "- **Label Format:** Standard YOLO normalized coordinates (`<0> <xc> <yc> <w> <h>`).",
        "- **Multi-Leaf Images:** Every leaf instance receives an independent bounding box; clusters are decoupled.",
        r"- **Partial / Occluded Leaves:** Enclosed if $\ge 20\%$ foliar blade is visible; clamped to frame borders.",
        "- **Non-Destructive Storage:** Candidate proposals remain preserved at `auto_annotations/leaf_candidates/`; certified labels are written to `annotations/leaf_verified/`.",
        "",
        "---",
        "",
        "## 5. Visual Review Tool Access",
        "",
        "To inspect and verify leaf candidates interactively:",
        "```bash",
        "python turmeric_datasets/scripts/leaf_review_tool.py --port 5050",
        "```",
        "Open in browser: `http://127.0.0.1:5050`",
        "",
        "### Reviewer Controls:",
        "- **A / Space**: Accept candidate boxes as verified & advance to next.",
        "- **R**: Reject image (mark 0 leaves) & advance.",
        "- **S**: Save current bounding box edits & advance.",
        "- **Click & Drag**: Move or resize existing bounding boxes.",
        "- **Draw Box Button**: Click and drag on image to create a new missing leaf box.",
        "- **Delete Box Button / Key**: Remove an active false-positive box.",
        "",
        f"*Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*"
    ])
    
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

# Initialize DB and Report on module import
init_audit_db()
update_markdown_report()

# -----------------------------------------------------------------------------
# FLASK ROUTES
# -----------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route("/api/summary")
def api_summary():
    records = load_audit()
    total = len(records)
    reviewed = len([r for r in records if r["status"] != "pending"])
    pending = total - reviewed
    accepted = len([r for r in records if r["status"] == "accepted"])
    corrected = len([r for r in records if r["status"] == "corrected"])
    rejected = len([r for r in records if r["status"] == "rejected"])
    
    return jsonify({
        "total_images": total,
        "reviewed_images": reviewed,
        "pending_images": pending,
        "accepted_images": accepted,
        "corrected_images": corrected,
        "rejected_images": rejected,
        "boxes_accepted": sum(int(r.get("boxes_accepted", 0) or 0) for r in records),
        "boxes_corrected": sum(int(r.get("boxes_corrected", 0) or 0) for r in records),
        "boxes_rejected": sum(int(r.get("boxes_rejected", 0) or 0) for r in records),
        "boxes_added": sum(int(r.get("boxes_added", 0) or 0) for r in records),
    })

@app.route("/api/images")
def api_images():
    records = load_audit()
    category = request.args.get("category", "")
    status = request.args.get("status", "")
    search = request.args.get("search", "").lower()
    
    filtered = []
    for r in records:
        if category and r["category"] != category:
            continue
        if status and r["status"] != status:
            continue
        if search and search not in r["filename"].lower() and search not in r["category"].lower():
            continue
        filtered.append(r)
        
    return jsonify({
        "count": len(filtered),
        "items": filtered
    })

@app.route("/api/image_data/<stem>")
def api_image_data(stem):
    records = load_audit()
    rec = next((r for r in records if r["stem"] == stem), None)
    if not rec:
        return jsonify({"error": "Image not found"}), 404
        
    cat = rec["category"]
    fname = rec["filename"]
    
    # Load candidate boxes (refined by default)
    cand_file = ACTIVE_CANDIDATE_DIR / f"{stem}.txt"
    cand_boxes = []
    if cand_file.exists():
        with open(cand_file, "r", encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 5:
                    cand_boxes.append({
                        "cls": int(parts[0]),
                        "xc": float(parts[1]),
                        "yc": float(parts[2]),
                        "w": float(parts[3]),
                        "h": float(parts[4])
                    })
                    
    # Load verified boxes if existing
    ver_file = VERIFIED_DIR / f"{stem}.txt"
    ver_boxes = []
    has_verified = ver_file.exists()
    if has_verified:
        with open(ver_file, "r", encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 5:
                    ver_boxes.append({
                        "cls": int(parts[0]),
                        "xc": float(parts[1]),
                        "yc": float(parts[2]),
                        "w": float(parts[3]),
                        "h": float(parts[4])
                    })
                    
    return jsonify({
        "record": rec,
        "image_url": f"/image_file/{cat}/{fname}",
        "candidate_boxes": cand_boxes,
        "verified_boxes": ver_boxes,
        "has_verified_file": has_verified
    })

@app.route("/image_file/<cat>/<fname>")
def serve_image(cat, fname):
    img_path = DATASET_DIR / cat / fname
    if not img_path.exists():
        return "Image file not found", 404
    return send_file(str(img_path), mimetype="image/jpeg")

@app.route("/api/save/<stem>", methods=["POST"])
def api_save_verification(stem):
    data = request.json or {}
    status = data.get("status", "accepted") # accepted, corrected, rejected
    boxes = data.get("boxes", [])
    notes = data.get("notes", "")
    
    records = load_audit()
    rec = next((r for r in records if r["stem"] == stem), None)
    if not rec:
        return jsonify({"error": "Image not found"}), 404
        
    cand_count = int(rec.get("candidate_box_count", 0) or 0)
    ver_count = len(boxes)
    
    # Write verified YOLO label
    ver_file = VERIFIED_DIR / f"{stem}.txt"
    with open(ver_file, "w", encoding="utf-8") as f:
        for b in boxes:
            cls_id = int(b.get("cls", 0))
            xc = max(0.0, min(1.0, float(b["xc"])))
            yc = max(0.0, min(1.0, float(b["yc"])))
            w = max(0.0, min(1.0, float(b["w"])))
            h = max(0.0, min(1.0, float(b["h"])))
            f.write(f"{cls_id} {xc:.6f} {yc:.6f} {w:.6f} {h:.6f}\n")
            
    # Calculate box ledger stats
    b_accepted = 0
    b_corrected = 0
    b_rejected = 0
    b_added = 0
    
    if status == "accepted":
        b_accepted = ver_count
    elif status == "rejected":
        b_rejected = cand_count
    elif status == "corrected":
        if ver_count > cand_count:
            b_accepted = cand_count
            b_added = ver_count - cand_count
        elif ver_count < cand_count:
            b_accepted = ver_count
            b_rejected = cand_count - ver_count
        else:
            b_corrected = ver_count
            
    rec["status"] = status
    rec["verified_box_count"] = ver_count
    rec["boxes_accepted"] = b_accepted
    rec["boxes_corrected"] = b_corrected
    rec["boxes_rejected"] = b_rejected
    rec["boxes_added"] = b_added
    rec["reviewer_notes"] = notes
    rec["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    save_audit_record(rec)
    
    return jsonify({
        "success": True,
        "stem": stem,
        "status": status,
        "verified_boxes": ver_count
    })

# -----------------------------------------------------------------------------
# CLIENT-SIDE EMBEDDED SPA (Modern HTML5 / Canvas / SVG)
# -----------------------------------------------------------------------------

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Turmeric Leaf Detection — Visual Verification Tool</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --accent: #10b981;
      --accent-hover: #059669;
      --accent-blue: #3b82f6;
      --accent-amber: #f59e0b;
      --accent-red: #ef4444;
      --text: #f0f6fc;
      --text-muted: #8b949e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      flex-shrink: 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 1.05rem;
    }
    .badge {
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent);
      font-weight: 600;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .stats-bar {
      display: flex;
      gap: 16px;
      font-size: 0.82rem;
    }
    .stat-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
    }
    .stat-val { font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    
    .main-container {
      display: flex;
      flex: 1;
      height: calc(100vh - 60px);
      overflow: hidden;
    }
    
    /* Sidebar */
    .sidebar {
      width: 320px;
      background: var(--card-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar-filters {
      padding: 12px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .filter-row {
      display: flex;
      gap: 8px;
    }
    select, input[type="text"] {
      background: #0d1117;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      outline: none;
      width: 100%;
    }
    select:focus, input[type="text"]:focus {
      border-color: var(--accent);
    }
    .img-list {
      flex: 1;
      overflow-y: auto;
      padding: 6px;
    }
    .img-item {
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid transparent;
      margin-bottom: 4px;
      transition: all 0.15s;
    }
    .img-item:hover { background: rgba(255,255,255,0.04); }
    .img-item.active {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.4);
    }
    .tag {
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .tag-pending { background: #374151; color: #9ca3af; }
    .tag-accepted { background: #064e3b; color: #34d399; }
    .tag-corrected { background: #78350f; color: #fbbf24; }
    .tag-rejected { background: #7f1d1d; color: #f87171; }
    
    /* Workspace Canvas Area */
    .workspace {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #090d13;
      overflow: hidden;
    }
    .toolbar {
      padding: 8px 16px;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .tool-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      background: #21262d;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .btn:hover { background: #30363d; }
    .btn-primary { background: var(--accent); color: #000; font-weight: 600; border-color: var(--accent); }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-amber { background: #d97706; color: #fff; border-color: #d97706; }
    .btn-amber:hover { background: #b45309; }
    .btn-red { background: #dc2626; color: #fff; border-color: #dc2626; }
    .btn-red:hover { background: #b91c1c; }
    .btn-active { border-color: var(--accent); background: rgba(16, 185, 129, 0.15); color: var(--accent); }

    .canvas-viewport {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 15px;
    }
    .canvas-stage {
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      user-select: none;
      max-width: 100%;
      max-height: 100%;
    }
    .canvas-stage img {
      display: block;
      max-width: 100%;
      max-height: calc(100vh - 170px);
      object-fit: contain;
      pointer-events: none;
    }
    .box-layer {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: auto;
    }
    
    /* Bounding box SVG / overlay */
    .bbox {
      position: absolute;
      border: 2px solid #10b981;
      background: rgba(16, 185, 129, 0.12);
      cursor: move;
      box-sizing: border-box;
      pointer-events: auto;
    }
    .bbox.candidate-only {
      border: 2px dashed #3b82f6;
      background: rgba(59, 130, 246, 0.10);
    }
    .bbox.selected {
      border-color: #f59e0b !important;
      background: rgba(245, 158, 11, 0.20) !important;
      box-shadow: 0 0 0 1px #fff;
    }
    .bbox-label {
      position: absolute;
      top: -20px;
      left: -2px;
      background: #10b981;
      color: #000;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 2px 2px 0 0;
      white-space: nowrap;
      pointer-events: none;
    }
    .bbox.candidate-only .bbox-label {
      background: #3b82f6;
      color: #fff;
    }
    .bbox.selected .bbox-label {
      background: #f59e0b;
      color: #000;
    }
    
    /* Handles */
    .handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #fff;
      border: 1px solid #000;
      border-radius: 1px;
    }
    .handle-nw { top: -4px; left: -4px; cursor: nwse-resize; }
    .handle-ne { top: -4px; right: -4px; cursor: nesw-resize; }
    .handle-sw { bottom: -4px; left: -4px; cursor: nesw-resize; }
    .handle-se { bottom: -4px; right: -4px; cursor: nwse-resize; }

    /* Footer Info */
    .footer-bar {
      background: var(--card-bg);
      border-top: 1px solid var(--border);
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .kbd {
      background: #21262d;
      border: 1px solid var(--border);
      padding: 2px 5px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>🌿 Turmeric Leaf Detection</span>
      <span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3);">Dataset 01 (Refined Candidates Loaded)</span>
    </div>
    <div class="stats-bar" id="statsBar">
      <div class="stat-pill">Reviewed: <span class="stat-val" id="statReviewed">0</span> / 865</div>
      <div class="stat-pill">Pending: <span class="stat-val" id="statPending">865</span></div>
      <div class="stat-pill">Accepted Boxes: <span class="stat-val" id="statBoxesAccepted" style="color:var(--accent);">0</span></div>
      <div class="stat-pill">Corrected: <span class="stat-val" id="statBoxesCorrected" style="color:var(--accent-amber);">0</span></div>
      <div class="stat-pill">Rejected: <span class="stat-val" id="statBoxesRejected" style="color:var(--accent-red);">0</span></div>
    </div>
  </header>

  <div class="main-container">
    <!-- Left Navigation -->
    <div class="sidebar">
      <div class="sidebar-filters">
        <div class="filter-row">
          <select id="filterCategory" onchange="applyFilters()">
            <option value="">All Categories (865)</option>
            <option value="Aphids_Disease">Aphids_Disease (221)</option>
            <option value="Blotch">Blotch (238)</option>
            <option value="Healthy_Leaf">Healthy_Leaf (213)</option>
            <option value="Leaf_Spot">Leaf_Spot (193)</option>
          </select>
          <select id="filterStatus" onchange="applyFilters()">
            <option value="">All Statuses</option>
            <option value="pending" selected>Pending</option>
            <option value="accepted">Accepted</option>
            <option value="corrected">Corrected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <input type="text" id="filterSearch" placeholder="Search filename or stem..." oninput="applyFilters()">
      </div>
      <div class="img-list" id="imageList"></div>
    </div>

    <!-- Center Workspace -->
    <div class="workspace">
      <div class="toolbar">
        <div class="tool-group">
          <button class="btn" onclick="prevImage()"><span class="kbd">P</span> ◀ Prev</button>
          <button class="btn" onclick="nextImage()">Next ▶ <span class="kbd">N</span></button>
          <span style="font-size:0.8rem; font-weight:600; margin-left:8px;" id="currentFileName">—</span>
          <span class="tag tag-pending" id="currentFileTag">PENDING</span>
        </div>

        <div class="tool-group">
          <button class="btn" id="btnDraw" onclick="toggleDrawMode()">✏️ Draw Missing Leaf</button>
          <button class="btn btn-red" onclick="deleteActiveBox()">🗑️ Delete Box (<span class="kbd">Del</span>)</button>
          <button class="btn btn-primary" onclick="acceptCurrent()"><span class="kbd">A</span> Accept Candidate</button>
          <button class="btn btn-amber" onclick="saveEdits()"><span class="kbd">S</span> Save Changes</button>
          <button class="btn btn-red" onclick="rejectCurrent()"><span class="kbd">R</span> Reject Image</button>
        </div>
      </div>

      <div class="canvas-viewport" id="viewport">
        <div class="canvas-stage" id="stage">
          <img id="leafImg" src="" alt="Turmeric leaf image" onload="onImageLoaded()">
          <div class="box-layer" id="boxLayer"></div>
        </div>
      </div>

      <div class="footer-bar">
        <div>
          <span>YOLO Class: <b>0 (leaf)</b></span> • 
          <span>Coordinates: <b>Normalized [0, 1]</b></span> • 
          <span id="boxCountDisplay">Boxes: 0</span>
        </div>
        <div>
          Shortcuts: <span class="kbd">A</span> Accept | <span class="kbd">S</span> Save | <span class="kbd">R</span> Reject | <span class="kbd">Del</span> Delete Box | <span class="kbd">P</span>/<span class="kbd">N</span> Prev/Next
        </div>
      </div>
    </div>
  </div>

  <script>
    let images = [];
    let currentIndex = 0;
    let currentStem = "";
    let boxes = []; // active boxes [{cls: 0, xc, yc, w, h}]
    let selectedBoxIdx = null;
    let isDrawing = false;
    let drawStart = null;
    let mode = 'select'; // 'select' | 'draw'

    async function init() {
      await fetchSummary();
      await fetchImages();
      if (images.length > 0) {
        selectImage(0);
      }
      setupKeyboard();
      setupDrawing();
    }

    async function fetchSummary() {
      try {
        const res = await fetch('/api/summary');
        const data = await res.json();
        document.getElementById('statReviewed').textContent = data.reviewed_images;
        document.getElementById('statPending').textContent = data.pending_images;
        document.getElementById('statBoxesAccepted').textContent = data.boxes_accepted;
        document.getElementById('statBoxesCorrected').textContent = data.boxes_corrected;
        document.getElementById('statBoxesRejected').textContent = data.boxes_rejected;
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchImages() {
      const cat = document.getElementById('filterCategory').value;
      const st = document.getElementById('filterStatus').value;
      const sr = document.getElementById('filterSearch').value;
      
      const res = await fetch(`/api/images?category=${cat}&status=${st}&search=${encodeURIComponent(sr)}`);
      const data = await res.json();
      images = data.items;
      renderSidebar();
    }

    function applyFilters() {
      fetchImages();
    }

    function renderSidebar() {
      const list = document.getElementById('imageList');
      list.innerHTML = '';
      images.forEach((item, idx) => {
        const el = document.createElement('div');
        el.className = 'img-item' + (idx === currentIndex ? ' active' : '');
        el.id = `item-${item.stem}`;
        el.onclick = () => selectImage(idx);
        
        const tagClass = 'tag tag-' + item.status;
        el.innerHTML = `
          <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px;">
            <b>${idx + 1}.</b> ${item.filename}
          </div>
          <span class="${tagClass}">${item.status}</span>
        `;
        list.appendChild(el);
      });
    }

    async function selectImage(idx) {
      if (idx < 0 || idx >= images.length) return;
      currentIndex = idx;
      const item = images[idx];
      currentStem = item.stem;

      // Update sidebar active class
      document.querySelectorAll('.img-item').forEach(el => el.classList.remove('active'));
      const activeEl = document.getElementById(`item-${item.stem}`);
      if (activeEl) {
        activeEl.classList.add('active');
        activeEl.scrollIntoView({ block: 'nearest' });
      }

      document.getElementById('currentFileName').textContent = `${item.category} / ${item.filename}`;
      const tag = document.getElementById('currentFileTag');
      tag.className = 'tag tag-' + item.status;
      tag.textContent = item.status.toUpperCase();

      // Fetch annotation data
      const res = await fetch(`/api/image_data/${item.stem}`);
      const data = await res.json();
      
      // If already verified, use verified boxes, otherwise use candidate boxes
      if (data.has_verified_file && data.verified_boxes.length > 0) {
        boxes = JSON.parse(JSON.stringify(data.verified_boxes));
      } else {
        boxes = JSON.parse(JSON.stringify(data.candidate_boxes));
      }
      
      selectedBoxIdx = boxes.length > 0 ? 0 : null;
      document.getElementById('leafImg').src = data.image_url;
    }

    function onImageLoaded() {
      renderBoxes();
    }

    function renderBoxes() {
      const layer = document.getElementById('boxLayer');
      const img = document.getElementById('leafImg');
      layer.innerHTML = '';
      
      const W = img.clientWidth;
      const H = img.clientHeight;
      if (W === 0 || H === 0) return;

      document.getElementById('boxCountDisplay').textContent = `Boxes: ${boxes.length}`;

      boxes.forEach((b, idx) => {
        const boxEl = document.createElement('div');
        boxEl.className = 'bbox' + (idx === selectedBoxIdx ? ' selected' : '');
        
        const x1 = (b.xc - b.w / 2) * W;
        const y1 = (b.yc - b.h / 2) * H;
        const bw = b.w * W;
        const bh = b.h * H;

        boxEl.style.left = `${x1}px`;
        boxEl.style.top = `${y1}px`;
        boxEl.style.width = `${bw}px`;
        boxEl.style.height = `${bh}px`;

        boxEl.innerHTML = `
          <div class="bbox-label">0: leaf (${Math.round(b.w * 100)}%×${Math.round(b.h * 100)}%)</div>
          <div class="handle handle-nw" data-handle="nw"></div>
          <div class="handle handle-ne" data-handle="ne"></div>
          <div class="handle handle-sw" data-handle="sw"></div>
          <div class="handle handle-se" data-handle="se"></div>
        `;

        boxEl.onmousedown = (e) => {
          if (mode === 'draw') return;
          e.stopPropagation();
          selectedBoxIdx = idx;
          renderBoxes();
          startDragOrResize(e, idx, W, H);
        };

        layer.appendChild(boxEl);
      });
    }

    function startDragOrResize(e, idx, W, H) {
      const handle = e.target.dataset.handle;
      const b = boxes[idx];
      const startX = e.clientX;
      const startY = e.clientY;
      const origB = { ...b };

      function onMouseMove(ev) {
        const dx = (ev.clientX - startX) / W;
        const dy = (ev.clientY - startY) / H;

        let x1 = origB.xc - origB.w / 2;
        let y1 = origB.yc - origB.h / 2;
        let x2 = origB.xc + origB.w / 2;
        let y2 = origB.yc + origB.h / 2;

        if (!handle) {
          // Drag move
          x1 = Math.max(0, Math.min(1 - origB.w, x1 + dx));
          y1 = Math.max(0, Math.min(1 - origB.h, y1 + dy));
          b.xc = x1 + origB.w / 2;
          b.yc = y1 + origB.h / 2;
        } else {
          // Resizing with anchors
          if (handle.includes('w')) x1 = Math.max(0, Math.min(x2 - 0.02, x1 + dx));
          if (handle.includes('e')) x2 = Math.min(1, Math.max(x1 + 0.02, x2 + dx));
          if (handle.includes('n')) y1 = Math.max(0, Math.min(y2 - 0.02, y1 + dy));
          if (handle.includes('s')) y2 = Math.min(1, Math.max(y1 + 0.02, y2 + dy));

          b.xc = (x1 + x2) / 2;
          b.yc = (y1 + y2) / 2;
          b.w = x2 - x1;
          b.h = y2 - y1;
        }
        renderBoxes();
      }

      function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    function setupDrawing() {
      const layer = document.getElementById('boxLayer');
      layer.onmousedown = (e) => {
        if (mode !== 'draw') return;
        const rect = layer.getBoundingClientRect();
        const startX = (e.clientX - rect.left) / rect.width;
        const startY = (e.clientY - rect.top) / rect.height;

        const newBox = { cls: 0, xc: startX, yc: startY, w: 0.01, h: 0.01 };
        boxes.push(newBox);
        selectedBoxIdx = boxes.length - 1;

        function onDrawMove(ev) {
          const curX = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
          const curY = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));

          const x1 = Math.min(startX, curX);
          const x2 = Math.max(startX, curX);
          const y1 = Math.min(startY, curY);
          const y2 = Math.max(startY, curY);

          newBox.xc = (x1 + x2) / 2;
          newBox.yc = (y1 + y2) / 2;
          newBox.w = Math.max(0.01, x2 - x1);
          newBox.h = Math.max(0.01, y2 - y1);
          renderBoxes();
        }

        function onDrawEnd() {
          window.removeEventListener('mousemove', onDrawMove);
          window.removeEventListener('mouseup', onDrawEnd);
          toggleDrawMode(false);
        }

        window.addEventListener('mousemove', onDrawMove);
        window.addEventListener('mouseup', onDrawEnd);
      };
    }

    function toggleDrawMode(force) {
      if (force !== undefined) {
        mode = force ? 'draw' : 'select';
      } else {
        mode = mode === 'draw' ? 'select' : 'draw';
      }
      const btn = document.getElementById('btnDraw');
      if (mode === 'draw') {
        btn.classList.add('btn-active');
        btn.textContent = '✏️ Drawing Active (Click & Drag)';
      } else {
        btn.classList.remove('btn-active');
        btn.textContent = '✏️ Draw Missing Leaf';
      }
    }

    function deleteActiveBox() {
      if (selectedBoxIdx !== null && selectedBoxIdx < boxes.length) {
        boxes.splice(selectedBoxIdx, 1);
        selectedBoxIdx = boxes.length > 0 ? 0 : null;
        renderBoxes();
      }
    }

    async function saveCurrent(status = 'accepted', notes = '') {
      if (!currentStem) return;
      
      const payload = {
        status: status,
        boxes: boxes,
        notes: notes
      };

      const res = await fetch(`/api/save/${currentStem}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        // Update local item
        if (images[currentIndex]) {
          images[currentIndex].status = status;
        }
        await fetchSummary();
        renderSidebar();
        nextImage();
      }
    }

    function acceptCurrent() {
      saveCurrent('accepted', 'Accepted candidate boxes');
    }

    function saveEdits() {
      saveCurrent('corrected', 'Manually adjusted/added bounding boxes');
    }

    function rejectCurrent() {
      boxes = [];
      saveCurrent('rejected', 'Zero leaf boxes or invalid specimen');
    }

    function prevImage() {
      if (currentIndex > 0) {
        selectImage(currentIndex - 1);
      }
    }

    function nextImage() {
      if (currentIndex < images.length - 1) {
        selectImage(currentIndex + 1);
      }
    }

    function setupKeyboard() {
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (e.key === 'a' || e.key === 'A') {
          acceptCurrent();
        } else if (e.key === 's' || e.key === 'S') {
          saveEdits();
        } else if (e.key === 'r' || e.key === 'R') {
          rejectCurrent();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteActiveBox();
        } else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
          nextImage();
        } else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowLeft') {
          prevImage();
        }
      });
    }

    window.onload = init;
    window.onresize = () => renderBoxes();
  </script>
</body>
</html>
"""

def parse_args():
    parser = argparse.ArgumentParser(description="Turmeric Leaf Detection Review Tool")
    parser.add_argument("--port", type=int, default=5050, help="Port to run the review web tool on")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host address")
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    print("=" * 70)
    print("TURMERIC LEAF DETECTION — VISUAL REVIEW & VERIFICATION TOOL")
    print("=" * 70)
    print(f"Dataset 01 Images: {len(get_image_inventory())} images")
    print(f"Candidate Bounding Boxes: {CANDIDATE_DIR}")
    print(f"Verified Output Folder:   {VERIFIED_DIR}")
    print(f"Progress Ledger:          {REPORT_MD}")
    print("-" * 70)
    print(f"Review Tool Server started at: http://{args.host}:{args.port}")
    print("Press Ctrl+C to stop.")
    print("=" * 70)
    app.run(host=args.host, port=args.port, debug=False)
