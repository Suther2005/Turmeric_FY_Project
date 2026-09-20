# Turmeric Leaf Pathology — Annotation Protocol & Specification

## 1. Overview & Objective
This protocol establishes the standardized, reproducible annotation guidelines for the research project:
**“A Multimodal Deep Learning Approach for Turmeric Leaf Disease Detection and Environmental Risk Assessment”**.

The primary computer vision objective is the **four-class foliar disease classification** and object detection/localization of turmeric (*Curcuma longa*) leaf symptoms.

---

## 2. Target Classes & Formal Diagnostic Definitions

| Class ID | Target Class | Pathogen / Vector | Visual Diagnostic Morphology |
| :---: | :--- | :--- | :--- |
| **0** | **Aphids** | *Pentalonia nigronervosa* / Aphididae | Clustered small soft-bodied insects along the central midrib and lateral veins on the abaxial/adaxial leaf surface; accompanied by foliar curling, honeydew sheen, or early sooty mold deposits. |
| **1** | **Blotch** | *Taphrina maculans* | Irregular, necrotic, brownish-yellow to dark brown spots coalescing into large blotches; diffuse chlorotic (yellowish) borders with extensive leaf blade drying and foliar blight. |
| **2** | **Leaf Spot** | *Colletotrichum capsici* / *Phaeodactylium* | Distinct circular to oblong or elliptical lesions with characteristic concentric rings (target-like pattern), grayish-brown centers, and well-defined dark brown margins with chlorotic halos. |
| **3** | **Healthy** | N/A (Asymptomatic) | Intact leaf lamina, uniform green pigmentation, standard vegetative vein structure, zero pathogen lesions, zero chlorotic discoloration, and no active pest colonies. |

---

## 3. Inclusion Criteria (Valid Turmeric Leaf Specimen)
An image is accepted into the core curation pipeline **only** if all the following conditions are met:
1. **Botanical Identity:** The photographed subject is demonstrably a turmeric (*Curcuma longa*) leaf blade.
2. **Foliar Visibility:** At least 60% of the leaf lamina or the primary lesion area is in clear optical focus.
3. **Resolution & Clarity:** Minimum effective resolution of $224 \times 224$ pixels without severe motion blur or compression artifacts.
4. **Diagnostic Integrity:** Visual disease symptoms correspond unambiguously to one of the four defined classes.

---

## 4. Exclusion & Rejection Criteria
Images matching any of the following criteria must be **flagged as REJECTED** and excluded from the four-class foliar training set:
- **Non-Foliar Plant Organs:** Rhizomes, roots, rhizome rot, tubers, flowers, pseudostems only, or post-harvest turmeric powder.
- **Physiological Senescence (Dry Leaf):** General yellowing/browning resulting purely from natural aging or dehydration without pathogen-specific lesions.
- **Out-of-Scope Diseases:** Soft rot (*Pythium aphanidermatum*) of rhizomes or viral mosaics not part of the 4 target classes.
- **Unrelated Crops & Weeds:** Non-turmeric vegetation, background grass, or soil-only photographs.
- **Technical Failures:** Extreme out-of-focus blur, severe overexposure/underexposure, corrupted files, or empty backgrounds.

---

## 5. Ambiguous & Borderline Cases Protocol
For specimens exhibiting overlapping or ambiguous features:
1. **Co-occurring Lesions (Multi-pathogen):**
   - If both Blotch and Leaf Spot appear on the same leaf, tag the image with secondary attribute `multi_infection: true` and assign primary class based on the dominant necrotic surface area (>70%).
   - If dominance cannot be established with >90% expert confidence, assign label: **`REVIEW_AMBIGUOUS`** and quarantine from the benchmark test split.
2. **Early-Stage vs Senescence:**
   - Isolated tiny chlorotic dots without defined borders must be marked for secondary review rather than defaulted to `Leaf Spot`.
3. **Pest Exudates vs Mechanical Damage:**
   - Surface tears or hail holes without aphid insects or honeydew must not be labeled `Aphids`.

---

## 6. Annotation Naming Conventions & Formats

### File Naming Convention
Curated images must adhere to standard immutable naming:
```
curuma_<class_code>_<source_id>_<index:04d>.<ext>
```
Examples:
- `curuma_aphids_ds01_0042.jpg`
- `curuma_blotch_ds01_0118.jpg`
- `curuma_leafspot_ds01_0089.jpg`
- `curuma_healthy_ds01_0201.jpg`

### Annotation Label Formats
1. **Image-Level Classification:** Standard CSV / JSON manifest:
   ```json
   {
     "image_id": "curuma_blotch_ds01_0118.jpg",
     "class_id": 1,
     "class_name": "Blotch",
     "source_dataset": "dataset_01",
     "split": "train",
     "qc_verified": true
   }
   ```
2. **Object Detection / Bounding Box (YOLO Format):**
   ```
   <class_id> <x_center> <y_center> <width> <height>
   ```
   Coordinates normalized to $[0.0, 1.0]$.

---

## 7. Quality Control & Review Procedure
1. **Two-Pass Human Verification:** Every annotated image must be reviewed by at least two independent annotators.
2. **Inter-Annotator Agreement (Cohen's Kappa):** Target $\kappa \ge 0.90$ across all 4 target classes.
3. **Discrepancy Resolution:** Any discrepancy is escalated to the lead domain supervisor before final label commitment.

---

## 8. Train / Validation / Test Data Leakage Prevention

> [!IMPORTANT]
> **Zero Leakage Rule:** No image or transformed/augmented variant of an image in the Training split may ever appear in the Validation or Test splits.

### Protocol Rules:
1. **Source-Level Partitioning:** Split assignments ($70\%$ Train, $15\%$ Validation, $15\%$ Test) must occur on original raw images **prior** to any data augmentation.
2. **Cryptographic Deduplication:** All candidate images must pass SHA-256 / MD5 hash checks to guarantee zero cross-split duplication.
3. **Temporal / Field Plot Grouping:** If field collection metadata is available, split by distinct plant cluster or geographic plot rather than random sampling to evaluate true cross-field generalization.
4. **Frozen Benchmark Test Set:** The test partition ($15\% \approx 130$ images from Dataset 01) must remain untouched, non-augmented, and evaluated only once for final model reporting.
