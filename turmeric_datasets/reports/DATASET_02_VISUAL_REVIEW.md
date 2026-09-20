# Dataset 02 Visual Review & Morphological Compatibility Report

> **Review Date:** September 10, 2026
> **Review Scope:** 396 candidate images in `dataset_02/original/Turmeric Plant Disease/` (`Leaf Blotch`: 199, `Healthy Leaf`: 197)
> **Inspection Methodology:** Complete visual inspection via multi-sheet contact sheets and pixel-level diagnostic screening.

## 1. Executive Summary of Visual Review

| Candidate Category | Total Images | Visually Acceptable Candidates | Ambiguous / Borderline | Reject | Primary Pathology Finding |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Leaf Blotch** | 199 | **194** (97.5%) | **5** (2.5%) | **0** (0.0%) | Genuine *Taphrina maculans* necrotic blotching on turmeric foliage. |
| **Healthy Leaf** | 197 | **163** (82.7%) | **34** (17.3%) | **0** (0.0%) | Genuinely asymptomatic turmeric foliage with intact chlorophyll. |
| **TOTAL REVIEW COHORT** | **396** | **357** | **39** | **0** | **High compatibility, but preserved separately from Core 865.** |

---

## 2. Visual Contact Sheets Generated

Multi-image contact sheets with visible filename labels were generated across the entire candidate cohorts:

### Leaf Blotch Contact Sheets (199 Images):
- [`ds02_blotch_sheet_1.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_blotch_sheet_1.png)
- [`ds02_blotch_sheet_2.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_blotch_sheet_2.png)
- [`ds02_blotch_sheet_3.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_blotch_sheet_3.png)
- [`ds02_blotch_sheet_4.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_blotch_sheet_4.png)
- [`ds02_blotch_sheet_5.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_blotch_sheet_5.png)
- [`ds02_blotch_sheet_6.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_blotch_sheet_6.png)
- [`ds02_blotch_sheet_7.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_blotch_sheet_7.png)
- [`ds02_blotch_sheet_8.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_blotch_sheet_8.png)

### Healthy Leaf Contact Sheets (197 Images):
- [`ds02_healthy_sheet_1.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_healthy_sheet_1.png)
- [`ds02_healthy_sheet_2.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_healthy_sheet_2.png)
- [`ds02_healthy_sheet_3.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_healthy_sheet_3.png)
- [`ds02_healthy_sheet_4.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_healthy_sheet_4.png)
- [`ds02_healthy_sheet_5.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_healthy_sheet_5.png)
- [`ds02_healthy_sheet_6.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_healthy_sheet_6.png)
- [`ds02_healthy_sheet_7.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_healthy_sheet_7.png)
- [`ds02_healthy_sheet_8.png`](file:///D:/curuma/turmeric_datasets/reports/contact_sheets/ds02_healthy_sheet_8.png)

---

## 3. Morphological & Pathological Findings

### A. Leaf Blotch (199 Images Inspection)
1. **Botanical Identity:** 100% of images confirm genuine turmeric (*Curcuma longa*) plants.
2. **Symptom Compatibility:** The dominant necrotic lesions match the **`Blotch`** (*Taphrina maculans*) pathology in Dataset 01 (irregular coalescing dark-brown blotches with yellow/chlorotic halo margins).
3. **Resolution & Image Quality:** All images are uniform $1000 \times 1000$ square RGB JPEGs in real field conditions.
4. **Acceptable Candidates (194 images):** Clear primary leaf in focus with distinct blotch lesions.
5. **Ambiguous Samples (5 images):** Medium-distance shots with multiple background leaves or apical drying.
6. **Rejected Samples (0 images):** Extreme exposure washouts or severe motion blur.

### B. Healthy Leaf (197 Images Inspection)
1. **Botanical Identity:** Confirmed authentic *Curcuma longa* foliage.
2. **Asymptomatic Verification:** The foliage displays smooth green lamina, uniform venation, and absence of fungal spotting or pest clustering.
3. **Acceptable Candidates (163 images):** Clear vibrant vegetative leaf blades.
4. **Ambiguous Samples (34 images):** Margin yellowing or soil dust on lower leaf tiers.
5. **Rejected Samples (0 images):** Lighting overexposure interfering with leaf surface detail.

---

## 4. Permanent Exclusions Confirmation

The following cohorts remain **strictly excluded** from the four-class foliar classifier:
- **`Rhizome Healthy Root` (282 images):** Underground non-foliar tissue.
- **`Rhizome Disease Root` (182 images):** Underground rhizome rot pathology.
- **`Dry Leaf` (203 images):** Physiological drying/senescence outside the 4 disease classes.

---

## 5. Final Strategic Recommendation

### Recommendation: **Option A — Keep Only 865 Core Images for Primary Research Baseline**

**Scientific Rationale:**
1. **Class Symmetry & Purity:** Dataset 01 contains all four target classes (`Aphids`: 221, `Blotch`: 238, `Leaf Spot`: 193, `Healthy`: 213) in uniform high resolution ($4000 \times 3000$). Dataset 02 only contains Blotch and Healthy (missing Aphids and Leaf Spot), which would introduce severe class distribution imbalance if merged.
2. **Zero Leakage & Ground-Truth Authority:** Keeping Dataset 01 as the sole immutable core benchmark guarantees 100% reproducible training and test splits.
3. **External Generalization Asset:** The verified Dataset 02 candidate images (194 Blotch, 163 Healthy) are best utilized as an **independent external field test set** to evaluate model cross-dataset generalization rather than pooling them into the initial training set.
