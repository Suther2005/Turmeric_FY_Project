# Turmeric Leaf Pathology — Leaf Detection Dataset Audit

**Audit Focus:** Image suitability and annotation readiness specifically for **LEAF DETECTION** (object localization of the turmeric leaf lamina vs background).  
**Audited On:** September 18, 2026  
**Scope:** `turmeric_datasets/dataset_01/original/` (Primary 4-class dataset) & `turmeric_datasets/dataset_02/original/` (Auxiliary field dataset).  
**Mode:** Strict Read-Only Audit (Zero code modified, zero models trained, zero annotations created, UI untouched).

---

## 1. Do Bounding-Box or Segmentation Annotations Already Exist for Leaves?

### Finding: **NO.**

* **No leaf-level bounding boxes or segmentation masks exist anywhere in the repository.**
* What exists in the repository:
  1. **Image-Level Classification Labels:** 865 images mapped to 4 pathology classes (`Aphids`, `Blotch`, `Healthy`, `Leaf Spot`) in `turmeric_datasets/metadata/dataset_splits.csv`.
  2. **Disease Lesion Proposals (YOLO format):** Located in `turmeric_datasets/auto_annotations/labels/` (610 files with boxes). These delimit *disease lesions and aphid colonies* (Class 0: Aphids, Class 1: Blotch, Class 2: Leaf Spot; Healthy = 0 boxes). They **do not** delimit the leaf itself.
  3. **Empty YOLO Placeholder Files:** All 865 `.txt` files in `turmeric_datasets/annotations/labels/` are currently **0 bytes** (unannotated).

---

## 2. Number of Images Containing Single Leaves vs. Multiple Leaves

A computer vision contour analysis across all 865 high-resolution images in Dataset 01 (`4000 x 3000` px) reveals:

| Class | Total Images | Single Leaf Images | Multiple Leaf Images | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **`Aphids_Disease`** | 221 | **215** (97.3%) | **6** (2.7%) | Dominantly single excised leaf blade centered in frame. |
| **`Blotch`** | 238 | **225** (94.5%) | **13** (5.5%) | Single leaf with visible laminar necrosis. |
| **`Healthy_Leaf`** | 213 | **123** (57.7%) | **90** (42.3%) | Significant subset photographed as small bundles/clusters of 2–3 overlapping healthy leaves. |
| **`Leaf_Spot`** | 193 | **188** (97.4%) | **5** (2.6%) | Isolated single leaves laid flat for lesion scoring. |
| **TOTAL (Dataset 01)** | **865** | **751 (86.8%)** | **114 (13.2%)** | **High single-leaf concentration overall.** |

*(In Dataset 02 foliar cohort of 599 images, images were captured on living field plants where multiple overlapping leaves and canopy foliage appear in >85% of frames).*

---

## 3. Background Presence & Environmental Conditions

| Dataset Cohort | Images | Background Characteristics | Studio / Lab Backdrop | Natural Field Backdrop |
| :--- | :---: | :--- | :---: | :---: |
| **Dataset 01 (Core)** | **865** | Flat, light-neutral paper / cardboard / table backdrops with ambient indoor/shaded illumination. | **865 (100.0%)** | **0 (0.0%)** |
| **Dataset 02 (Auxiliary)** | **599** | In-situ living turmeric plants outdoors against soil, weeds, background stalks, and sunlight shadows. | **0 (0.0%)** | **599 (100.0%)** |

### Environmental Impact on Leaf Detection:
* In **Dataset 01**, foreground-to-background contrast is high because dark green/yellow leaves sit on light neutral surfaces. Bounding-box detection on this cohort is visually straightforward.
* However, a detector trained **solely on Dataset 01** will overfit to plain white/gray paper backdrops and will fail when presented with real-world farmer smartphone captures taken in outdoor field conditions.

---

## 4. Is the Current Dataset Suitable for Training a Leaf Detection Model?

### Finding: **NOT YET SUITABLE IN ITS CURRENT UNANNOTATED STATE.**

1. **Absence of Ground Truth:** Supervised object detection algorithms (e.g., YOLOv8, Faster R-CNN) or instance segmentation networks (e.g., Mask R-CNN, YOLOv8-seg) strictly require bounding boxes `[class, x_center, y_center, width, height]` or polygon coordinates for the `leaf` class. Currently, zero leaf boxes exist.
2. **Domain Bias of Dataset 01:** While Dataset 01 has excellent resolution (`4000 x 3000`), its 100% white/neutral paper background does not represent in-situ field conditions.
3. **Potential After Annotation:**
   - **For a Studio / Benchmarking Leaf Detector:** Yes, once bounding boxes are annotated, Dataset 01 will support high-precision detection of cut leaves on neutral surfaces.
   - **For a Real-World Farmer In-Field Leaf Detector:** A multi-domain dataset combining annotated Dataset 01 leaves with in-situ field leaves (Dataset 02) is required to prevent backdrop bias.

---

## 5. What Annotation Format is Currently Available, if Any?

| Format Type | Availability | Current Location / Details |
| :--- | :---: | :--- |
| **Leaf Bounding Box (`leaf`)** | **NONE** | Zero leaf localization annotations exist. |
| **Leaf Polygon / Segmentation Mask** | **NONE** | Zero segmentation masks exist. |
| **Disease Lesion YOLO Bounding Boxes** | **Available (Proposals Only)** | `turmeric_datasets/auto_annotations/labels/` (Classes: 0=`Aphids`, 1=`Blotch`, 2=`Leaf_Spot`). |
| **Image-Level Classification Manifest** | **Available** | `turmeric_datasets/metadata/dataset_splits.csv` (Class IDs 0–3, 70/15/15 train/val/test splits). |

---

## 6. Exactly How Many Images Need New Leaf Annotations?

* **Primary Core Cohort (Dataset 01):** **865 images**
  - Train: **606 images**
  - Validation: **130 images**
  - Test: **129 images**
* *(Optional Field Extension — Dataset 02 foliar cohort: 599 images: 197 Healthy + 199 Blotch + 203 Dry Leaf).*

---

## Summary & Required Endpoints

- **Annotation available:** **NO**
- **Images requiring annotation:** **865** *(for core Dataset 01; 1,464 if including Dataset 02 field cohort)*
- **Recommended next step:** Formally define the `leaf` class annotation schema (YOLO format `<class_id=0> <x> <y> <w> <h>`) and annotate the 865 images in Dataset 01 (utilizing semi-automated Otsu/HSV chromaticity thresholding to bootstrap the initial tight bounding boxes around the high-contrast paper-backed leaves, followed by manual quality review).
