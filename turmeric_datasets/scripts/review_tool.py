"""
Turmeric Leaf Disease Annotation Review & Correction Tool
=========================================================
Local Flask-based interactive web GUI to inspect, correct, resize,
delete, add bounding boxes, assign severity attributes, and mark
verification statuses for Dataset 01 YOLO annotations.

Run:
  python scripts/review_tool.py
Open:
  http://127.0.0.1:5000
"""

import os
import csv
import json
from pathlib import Path
from flask import Flask, jsonify, request, send_file, render_template_string

BASE_DIR = Path(r"D:\curuma\turmeric_datasets")
AUTO_DIR = BASE_DIR / "auto_annotations"
IMG_DIR = AUTO_DIR / "images"
LBL_DIR = AUTO_DIR / "labels"
AUDIT_CSV = AUTO_DIR / "audit" / "dataset_01_candidate_audit.csv"
FALLBACK_AUDIT = AUTO_DIR / "audit" / "pilot_02_audit.csv"

CLASS_NAMES = ["Aphids_Disease", "Blotch", "Leaf_Spot"]
CLASS_COLORS = {
    0: "#ff4757",  # Aphids: Red
    1: "#ffa502",  # Blotch: Amber
    2: "#00d2d3",  # Leaf Spot: Cyan
}

app = Flask(__name__)

def load_audit():
    audit_path = AUDIT_CSV if AUDIT_CSV.exists() else FALLBACK_AUDIT
    items = []
    if audit_path.exists():
        with open(audit_path, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                items.append(r)
    return items

def save_audit_record(fname, status, severity, notes, n_boxes):
    audit_path = AUDIT_CSV if AUDIT_CSV.exists() else FALLBACK_AUDIT
    if not audit_path.exists():
        return

    rows = []
    fields = []
    with open(audit_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames
        if "severity" not in fields:
            fields = list(fields) + ["severity"]
        for r in reader:
            if r["image_name"] == fname:
                r["annotation_status"] = status
                r["reviewer_notes"] = notes
                r["number_of_boxes"] = str(n_boxes)
                r["severity"] = severity
            rows.append(r)

    with open(audit_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Turmeric Leaf Annotation Reviewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f1117; color: #e1e7f0; display: flex; height: 100vh; overflow: hidden; }
    
    /* Sidebar */
    #sidebar { width: 320px; background: #181b24; border-right: 1px solid #282d3c; display: flex; flex-direction: column; }
    .side-header { padding: 16px; border-bottom: 1px solid #282d3c; }
    .side-header h2 { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 8px; }
    .filter-group { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
    select, input[type="text"] { background: #232733; color: #e1e7f0; border: 1px solid #363d50; padding: 6px 10px; border-radius: 6px; font-size: 13px; width: 100%; outline: none; }
    .img-list { flex: 1; overflow-y: auto; list-style: none; padding: 8px; }
    .img-item { padding: 10px; border-radius: 6px; margin-bottom: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 13px; background: #1e222e; border: 1px solid transparent; }
    .img-item:hover { background: #282d3d; }
    .img-item.active { background: #2b354d; border-color: #3b82f6; }
    .badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 500; }
    .badge-auto { background: #374151; color: #9ca3af; }
    .badge-reviewed { background: #1e3a8a; color: #93c5fd; }
    .badge-verified { background: #065f46; color: #a7f3d0; }
    .badge-suspicious { background: #991b1b; color: #fecaca; }

    /* Main workspace */
    #workspace { flex: 1; display: flex; flex-direction: column; background: #0b0c10; position: relative; }
    #toolbar { height: 50px; background: #161821; border-bottom: 1px solid #282d3c; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
    .tool-btns { display: flex; gap: 8px; align-items: center; }
    button { background: #2a3040; color: #fff; border: 1px solid #3d455c; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
    button:hover { background: #373f54; }
    button.primary { background: #2563eb; border-color: #3b82f6; font-weight: 500; }
    button.primary:hover { background: #1d4ed8; }
    button.danger { background: #dc2626; border-color: #ef4444; }
    button.danger:hover { background: #b91c1c; }

    #canvas-container { flex: 1; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: crosshair; }
    canvas { display: block; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }

    /* Right Panel */
    #inspector { width: 300px; background: #181b24; border-left: 1px solid #282d3c; padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
    .panel-title { font-size: 14px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-box { background: #202430; padding: 12px; border-radius: 8px; border: 1px solid #2e3446; font-size: 13px; line-height: 1.6; }
    .meta-label { color: #8892b0; font-size: 12px; }
    .meta-val { color: #f1f5f9; font-weight: 500; }
    .box-item { display: flex; align-items: center; justify-content: space-between; background: #242938; padding: 8px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; border: 1px solid #32394e; }
    .box-item.selected { border-color: #3b82f6; background: #2b3347; }
    .color-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; }
    textarea { background: #232733; color: #e1e7f0; border: 1px solid #363d50; padding: 8px; border-radius: 6px; font-size: 13px; width: 100%; height: 70px; resize: none; outline: none; }
  </style>
</head>
<body>

  <!-- Left Sidebar -->
  <div id="sidebar">
    <div class="side-header">
      <h2>Dataset 01 Reviewer</h2>
      <div class="filter-group">
        <select id="class-filter" onchange="applyFilters()">
          <option value="ALL">All Classes</option>
          <option value="Aphids_Disease">Aphids_Disease</option>
          <option value="Blotch">Blotch</option>
          <option value="Leaf_Spot">Leaf_Spot</option>
          <option value="Healthy_Leaf">Healthy_Leaf</option>
        </select>
      </div>
      <input type="text" id="search-input" placeholder="Search filename..." oninput="applyFilters()">
    </div>
    <ul class="img-list" id="image-list"></ul>
  </div>

  <!-- Center Canvas Workspace -->
  <div id="workspace">
    <div id="toolbar">
      <div class="tool-btns">
        <button onclick="prevImage()">◀ Prev (A)</button>
        <button onclick="nextImage()">Next (D) ▶</button>
        <span style="color:#64748b; margin: 0 8px;">|</span>
        <select id="draw-class" style="width: auto;">
          <option value="0">Class 0: Aphids_Disease</option>
          <option value="1">Class 1: Blotch</option>
          <option value="2">Class 2: Leaf_Spot</option>
        </select>
        <button onclick="deleteSelectedBox()" class="danger" id="del-btn">Delete Box (Del)</button>
      </div>
      <div class="tool-btns">
        <button onclick="resetZoom()">Fit</button>
        <button class="primary" onclick="saveAnnotations()">💾 Save & Next (Ctrl+S)</button>
      </div>
    </div>
    <div id="canvas-container">
      <canvas id="canvas"></canvas>
    </div>
  </div>

  <!-- Right Inspector Panel -->
  <div id="inspector">
    <div>
      <div class="panel-title">Image Metadata</div>
      <div class="meta-box" style="margin-top: 8px;">
        <div><span class="meta-label">File:</span> <span class="meta-val" id="meta-file">-</span></div>
        <div><span class="meta-label">Split:</span> <span class="meta-val" id="meta-split">-</span></div>
        <div><span class="meta-label">Class:</span> <span class="meta-val" id="meta-class">-</span></div>
        <div><span class="meta-label">Dimensions:</span> <span class="meta-val" id="meta-dim">-</span></div>
      </div>
    </div>

    <div>
      <div class="panel-title">Annotation Status</div>
      <select id="status-select" style="margin-top: 8px;">
        <option value="AUTO_GENERATED">AUTO_GENERATED</option>
        <option value="REVIEWED">REVIEWED</option>
        <option value="VERIFIED">VERIFIED</option>
      </select>
    </div>

    <div>
      <div class="panel-title">Severity Research Attribute</div>
      <select id="severity-select" style="margin-top: 8px;">
        <option value="none">None (Healthy / Unassigned)</option>
        <option value="mild">Mild</option>
        <option value="moderate">Moderate</option>
        <option value="severe">Severe</option>
      </select>
    </div>

    <div>
      <div class="panel-title">Bounding Boxes (<span id="box-count">0</span>)</div>
      <div id="box-list" style="margin-top: 8px; max-height: 180px; overflow-y: auto;"></div>
    </div>

    <div>
      <div class="panel-title">Reviewer Notes</div>
      <textarea id="notes-input" placeholder="Notes on pathology, ambiguities..."></textarea>
    </div>
  </div>

  <script>
    let allImages = [];
    let filteredImages = [];
    let currentIndex = 0;
    let currentImage = null;
    let currentBoxes = [];
    let selectedBoxIndex = -1;

    let imgElement = new Image();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const CLASS_NAMES = ["Aphids_Disease", "Blotch", "Leaf_Spot"];
    const CLASS_COLORS = ["#ff4757", "#ffa502", "#00d2d3"];

    let isDrawing = false;
    let isDragging = false;
    let isResizing = false;
    let resizeHandle = -1;
    let startX = 0, startY = 0;

    let scale = 1.0;
    let offsetX = 0, offsetY = 0;

    window.onload = async () => {
      await fetchImages();
      setupCanvasEvents();
      setupKeyboardEvents();
    };

    async function fetchImages() {
      const resp = await fetch('/api/images');
      allImages = await resp.json();
      applyFilters();
    }

    function applyFilters() {
      const cls = document.getElementById('class-filter').value;
      const search = document.getElementById('search-input').value.toLowerCase();

      filteredImages = allImages.filter(item => {
        const matchCls = cls === 'ALL' || item.original_class === cls;
        const matchSearch = item.image_name.toLowerCase().includes(search);
        return matchCls && matchSearch;
      });

      renderList();
      if (filteredImages.length > 0) {
        loadImage(0);
      }
    }

    function renderList() {
      const list = document.getElementById('image-list');
      list.innerHTML = '';
      filteredImages.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'img-item' + (idx === currentIndex ? ' active' : '');
        li.onclick = () => loadImage(idx);

        let badgeClass = 'badge-auto';
        if (item.annotation_status === 'VERIFIED') badgeClass = 'badge-verified';
        else if (item.annotation_status === 'REVIEWED') badgeClass = 'badge-reviewed';
        else if (item.flagged_suspicious === 'True' || item.flagged_suspicious === true) badgeClass = 'badge-suspicious';

        li.innerHTML = `
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${item.image_name}</span>
          <span class="badge ${badgeClass}">${item.number_of_boxes}b</span>
        `;
        list.appendChild(li);
      });
    }

    async function loadImage(idx) {
      if (idx < 0 || idx >= filteredImages.length) return;
      currentIndex = idx;
      currentImage = filteredImages[idx];
      selectedBoxIndex = -1;

      // Update sidebar active
      document.querySelectorAll('.img-item').forEach((el, i) => {
        el.className = 'img-item' + (i === idx ? ' active' : '');
      });

      // Update meta
      document.getElementById('meta-file').textContent = currentImage.image_name;
      document.getElementById('meta-split').textContent = currentImage.split;
      document.getElementById('meta-class').textContent = currentImage.original_class;
      document.getElementById('status-select').value = currentImage.annotation_status || 'AUTO_GENERATED';
      document.getElementById('severity-select').value = currentImage.severity || 'none';
      document.getElementById('notes-input').value = currentImage.reviewer_notes || '';

      // Fetch annotation
      const resp = await fetch(`/api/annotation/${currentImage.split}/${currentImage.image_name}`);
      const data = await resp.json();
      currentBoxes = data.boxes || [];

      // Load image on canvas
      imgElement.onload = () => {
        document.getElementById('meta-dim').textContent = `${imgElement.naturalWidth} x ${imgElement.naturalHeight}`;
        fitCanvas();
        render();
        renderBoxList();
      };
      imgElement.src = `/api/image/${currentImage.split}/${currentImage.image_name}`;
    }

    function fitCanvas() {
      const container = document.getElementById('canvas-container');
      const maxW = container.clientWidth - 40;
      const maxH = container.clientHeight - 40;

      const aspect = imgElement.naturalWidth / imgElement.naturalHeight;
      let w = maxW;
      let h = w / aspect;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }

      canvas.width = w;
      canvas.height = h;
      scale = w / imgElement.naturalWidth;
    }

    function resetZoom() {
      fitCanvas();
      render();
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

      currentBoxes.forEach((b, i) => {
        const isSel = (i === selectedBoxIndex);
        const color = CLASS_COLORS[b.class_id] || '#ffffff';

        const bx = (b.x_center - b.width / 2) * canvas.width;
        const by = (b.y_center - b.height / 2) * canvas.height;
        const bw = b.width * canvas.width;
        const bh = b.height * canvas.height;

        ctx.strokeStyle = color;
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Label tag
        ctx.fillStyle = color;
        const label = `${CLASS_NAMES[b.class_id] || b.class_id}`;
        ctx.font = '11px sans-serif';
        const tw = ctx.measureText(label).width;
        ctx.fillRect(bx, Math.max(0, by - 18), tw + 8, 18);
        ctx.fillStyle = '#000000';
        ctx.fillText(label, bx + 4, Math.max(12, by - 5));

        // Handles if selected
        if (isSel) {
          ctx.fillStyle = '#ffffff';
          drawHandle(bx, by);
          drawHandle(bx + bw, by);
          drawHandle(bx, by + bh);
          drawHandle(bx + bw, by + bh);
        }
      });

      document.getElementById('box-count').textContent = currentBoxes.length;
    }

    function drawHandle(x, y) {
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.strokeRect(x - 4, y - 4, 8, 8);
    }

    function renderBoxList() {
      const list = document.getElementById('box-list');
      list.innerHTML = '';
      currentBoxes.forEach((b, i) => {
        const item = document.createElement('div');
        item.className = 'box-item' + (i === selectedBoxIndex ? ' selected' : '');
        item.onclick = () => { selectedBoxIndex = i; render(); renderBoxList(); };
        const color = CLASS_COLORS[b.class_id] || '#ffffff';
        item.innerHTML = `
          <div><span class="color-dot" style="background:${color}"></span> ${CLASS_NAMES[b.class_id]}</div>
          <button onclick="deleteBox(${i}); event.stopPropagation();" style="padding:2px 6px; font-size:11px;">✕</button>
        `;
        list.appendChild(item);
      });
    }

    function deleteBox(idx) {
      currentBoxes.splice(idx, 1);
      selectedBoxIndex = -1;
      render();
      renderBoxList();
    }

    function deleteSelectedBox() {
      if (selectedBoxIndex >= 0) deleteBox(selectedBoxIndex);
    }

    function setupCanvasEvents() {
      canvas.onmousedown = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Check if clicking existing box
        selectedBoxIndex = -1;
        for (let i = currentBoxes.length - 1; i >= 0; i--) {
          const b = currentBoxes[i];
          const bx = (b.x_center - b.width / 2) * canvas.width;
          const by = (b.y_center - b.height / 2) * canvas.height;
          const bw = b.width * canvas.width;
          const bh = b.height * canvas.height;

          if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
            selectedBoxIndex = i;
            break;
          }
        }

        if (selectedBoxIndex === -1) {
          isDrawing = true;
          startX = mx;
          startY = my;
        }

        render();
        renderBoxList();
      };

      canvas.onmousemove = (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        render();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(startX, startY, mx - startX, my - startY);
        ctx.setLineDash([]);
      };

      canvas.onmouseup = (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const x1 = Math.min(startX, mx);
        const y1 = Math.min(startY, my);
        const bw = Math.abs(mx - startX);
        const bh = Math.abs(my - startY);

        if (bw > 10 && bh > 10) {
          const cid = parseInt(document.getElementById('draw-class').value);
          const xc = (x1 + bw / 2) / canvas.width;
          const yc = (y1 + bh / 2) / canvas.height;
          const nw = bw / canvas.width;
          const nh = bh / canvas.height;

          currentBoxes.push({
            class_id: cid,
            x_center: xc,
            y_center: yc,
            width: nw,
            height: nh
          });
          selectedBoxIndex = currentBoxes.length - 1;
        }

        render();
        renderBoxList();
      };
    }

    function setupKeyboardEvents() {
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nextImage();
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') prevImage();
        if (e.key === 'Delete' || e.key === 'Backspace') deleteSelectedBox();
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveAnnotations(); }
      });
    }

    async function saveAnnotations() {
      if (!currentImage) return;
      const status = document.getElementById('status-select').value;
      const severity = document.getElementById('severity-select').value;
      const notes = document.getElementById('notes-input').value;

      const payload = {
        image_name: currentImage.image_name,
        split: currentImage.split,
        status: status,
        severity: severity,
        notes: notes,
        boxes: currentBoxes
      };

      const resp = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        currentImage.annotation_status = status;
        currentImage.number_of_boxes = currentBoxes.length;
        currentImage.severity = severity;
        currentImage.reviewer_notes = notes;
        renderList();
        nextImage();
      }
    }

    function nextImage() {
      if (currentIndex < filteredImages.length - 1) loadImage(currentIndex + 1);
    }

    function prevImage() {
      if (currentIndex > 0) loadImage(currentIndex - 1);
    }
  </script>
</body>
</html>
"""

@app.route("/")
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route("/api/images")
def get_images():
    return jsonify(load_audit())

@app.route("/api/image/<split>/<filename>")
def serve_image(split, filename):
    img_path = IMG_DIR / split / filename
    if not img_path.exists():
        img_path = BASE_DIR / "annotations" / "images" / split / filename
    return send_file(img_path, mimetype="image/jpeg")

@app.route("/api/annotation/<split>/<filename>")
def get_annotation(split, filename):
    lbl_file = LBL_DIR / split / (Path(filename).stem + ".txt")
    boxes = []
    if lbl_file.exists():
        with open(lbl_file, "r", encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 5:
                    boxes.append({
                        "class_id": int(parts[0]),
                        "x_center": float(parts[1]),
                        "y_center": float(parts[2]),
                        "width": float(parts[3]),
                        "height": float(parts[4])
                    })
    return jsonify({"boxes": boxes})

@app.route("/api/save", methods=["POST"])
def save_annotation():
    data = request.json
    fname = data["image_name"]
    split = data["split"]
    status = data["status"]
    severity = data.get("severity", "none")
    notes = data.get("notes", "")
    boxes = data.get("boxes", [])

    lbl_file = LBL_DIR / split / (Path(fname).stem + ".txt")
    lbl_file.parent.mkdir(parents=True, exist_ok=True)

    with open(lbl_file, "w", encoding="utf-8") as f:
        for b in boxes:
            cid = b["class_id"]
            xc = float(b["x_center"])
            yc = float(b["y_center"])
            w = float(b["width"])
            h = float(b["height"])
            f.write(f"{cid} {xc:.6f} {yc:.6f} {w:.6f} {h:.6f}\n")

    save_audit_record(fname, status, severity, notes, len(boxes))
    return jsonify({"success": True})

if __name__ == "__main__":
    print("=" * 60)
    print("STARTING TURMERIC LEAF ANNOTATION REVIEW INTERFACE")
    print("URL: http://127.0.0.1:5000")
    print("=" * 60)
    app.run(host="127.0.0.1", port=5000, debug=False)
