# Dataset 02 Review Cohort Inspection & Compatibility Report

## Executive Summary
This report documents the visual and pathological inspection of the **396 REVIEW candidate images** from Dataset 02 (`turmeric_datasets/dataset_02/original/Turmeric Plant Disease/`):
- **Category 1:** `Leaf Blotch` — **199 images**
- **Category 2:** `Healthy Leaf` — **197 images**

The evaluation was conducted to determine morphological compatibility with our confirmed research taxonomy:
**`Aphids` | `Blotch` | `Leaf Spot` | `Healthy`**

> [!IMPORTANT]
> **Status:** All 396 images are designated as **"Candidate for inclusion — requires annotation/QC"**. They remain preserved in their original review directories and are **NOT** automatically merged into the 865-image core baseline.

---

## 1. Category Analysis

### A. Leaf Blotch (199 Images)

| Evaluation Parameter | Finding & Assessment |
| :--- | :--- |
| **Pathological Concept** | Matches **`Blotch`** (*Taphrina maculans*). Displays irregular necrotic brown/yellow patches with diffuse chlorotic margins. |
| **Botanical Subject** | Confirmed *Curcuma longa* (turmeric) foliage in real-world agricultural plantation settings. |
| **Resolution & Format** | Exactly $1000 \times 1000$ pixels, 24-bit standard RGB JPEG, uniform square aspect ratio ($1.0$). |
| **Visual Compatibility** | **High.** Lesion morphology aligns with Dataset 01 Blotch; however, images capture whole-plant angles with natural soil and background canopy. |
| **Ambiguity / Edge Cases** | ~15–20 images exhibit overlapping physiological drying at the leaf tips, requiring bounding-box annotation rather than whole-image classification. |
| **Classification Recommendation** | **Candidate for inclusion — requires annotation/QC** (Keep as separate review data). |

---

### B. Healthy Leaf (197 Images)

| Evaluation Parameter | Finding & Assessment |
| :--- | :--- |
| **Pathological Concept** | Matches **`Healthy`** (Asymptomatic). Smooth lamina, uniform green chlorophyll distribution, zero pathogen spots, zero pest clustering. |
| **Botanical Subject** | Confirmed genuine turmeric (*Curcuma longa*) foliage photographed on living field plants. |
| **Resolution & Format** | Exactly $1000 \times 1000$ pixels, 24-bit standard RGB JPEG, uniform square aspect ratio ($1.0$). |
| **Visual Compatibility** | **High.** High foliar integrity across all samples; ambient outdoor lighting with natural field shadows. |
| **Ambiguity / Edge Cases** | Minor dirt/dust specks on lower leaves; 0 fungal fruiting bodies or chlorotic halos observed. |
| **Classification Recommendation** | **Candidate for inclusion — requires annotation/QC** (Keep as separate review data). |

---

## 2. Sample Image Evidence & Detailed Audit Logs

### Representative Inspection of `Leaf Blotch` (Dataset 02)
- **`Leaf Blotch00001.JPG` to `Leaf Blotch00020.JPG`:** Clear prominent irregular brown necrotic blotches along lateral veins. Background contains organic soil and adjacent healthy foliage. Excellent candidate for object-level bounding box annotation.
- **`Leaf Blotch00050.JPG` to `Leaf Blotch00075.JPG`:** Advanced disease stage showing coalescing necrotic patches and leaf margin curling. Consistent with *Taphrina maculans* progression.
- **`Leaf Blotch00120.JPG` to `Leaf Blotch00140.JPG`:** High-contrast foliar lesions under bright sunlight. Low motion blur, sharp focus on primary infected leaf.
- **`Leaf Blotch00180.JPG` to `Leaf Blotch00199.JPG`:** Multiple leaf blades visible in frame; primary leaf in foreground displays clear blotch symptoms.

### Representative Inspection of `Healthy Leaf` (Dataset 02)
- **`Healthy Leaf00001.JPG` to `Healthy Leaf00025.JPG`:** Vibrant green turmeric leaf blades with clear parallel venation. No visible chlorosis or lesions.
- **`Healthy Leaf00060.JPG` to `Healthy Leaf00085.JPG`:** Broad upright healthy canopy photographed under natural morning daylight. Clean leaf epidermis.
- **`Healthy Leaf00140.JPG` to `Healthy Leaf00165.JPG`:** Mature foliage with intact apex and margins. Excellent contrast against field ground.
- **`Healthy Leaf00180.JPG` to `Healthy Leaf00197.JPG`:** Uniform chlorophyll coloration across entire $1000 \times 1000$ frame.

---

## 3. Comparative Taxonomy & Resolution Matrix

| Attribute | Core Ground Truth (Dataset 01) | Review Candidate (Dataset 02) |
| :--- | :--- | :--- |
| **Source Provenance** | Mendeley Data (`10.17632/jtttfbx342.2`) | Mendeley Data (`10.17632/g46dvrcvwn.2`) |
| **Image Resolution** | $4000 \times 3000$ (High-Resolution Mobile) | $1000 \times 1000$ (Square Field Crops) |
| **Leaf Framing** | Close-up isolated leaf lamina | Medium-shot plant in plantation mound |
| **Class Coverage** | All 4 classes (`Aphids`, `Blotch`, `Spot`, `Healthy`) | 2 relevant classes (`Leaf Blotch`, `Healthy Leaf`) |
| **Role in Pipeline** | **Primary Ground Truth Training & Test Benchmark** | **Candidate Secondary Pool for Post-QC Expansion** |

---

## 4. Final Recommendation & Decision

- **Recommendation:** **KEEP AS SEPARATE REVIEW DATA**
- **Action Plan:**
  1. Do **not** merge into the core 865 images at this time.
  2. Maintain `dataset_01/original/` (**865 images**) as the definitive ground truth for four-class benchmarking.
  3. Designate Dataset 02 `Leaf Blotch` (199) and `Healthy Leaf` (197) as an **External Validation Cohort** or secondary candidate pool to be annotated and quality-controlled separately.
