# DATASET COLLECTION REPORT
## Turmeric Leaf Disease Detection — Final Year CSE Deep Learning Research
**Report Generated:** 2026-09-06  
**Prepared by:** Automated Data Collection Agent  
**Status:** Evidence-based documentation only. NO model training. NO data modification. NO fabrication.

> **CRITICAL DISCLAIMER:** This report is for data collection and evidence gathering only.
> Final dataset selection, research methodology, architecture decisions, and experimental design
> must be made by the human researcher after independent verification of all claims below.

---

## 1. Dataset Summary

| # | Dataset Name | Repository | DOI | Original Images | Augmented Images | Classes | Status |
|---|---|---|---|---|---|---|---|
| 01 | Image Dataset for Turmeric Plant Leaf Disease Detection | Mendeley Data | 10.17632/jtttfbx342.2 | 865 | 3,496 | 4 | **ACCEPTED** |
| 02 | Turmeric Plant Disease Dataset: Advancing AI for Agricultural Sustainability | Mendeley Data | 10.17632/g46dvrcvwn.2 | 1,063 | 4,548 | 5 | **ACCEPTED** |
| 03 | dis_tur (Kaggle) | Kaggle | None | Not reported | Not reported | 4 | **REJECTED** |
| 04 | Turmeric_disease Object Detection Dataset | Roboflow Universe | None | ~25 (unverified) | Unknown | 2 | **REJECTED** |

**Total candidate datasets found:** 4  
**Accepted for consideration:** 2  
**Rejected:** 2  

---

## 2. Best Candidate for Training

### Recommendation: Dataset 01 — Mendeley jtttfbx342

**Evidence supporting this recommendation:**
- **Provenance: HIGH.** DOI confirmed (10.17632/jtttfbx342.2). Linked to a peer-reviewed Data in Brief paper (2025). Multiple named authors from an academic institution.
- **Field collection confirmed.** The associated paper explicitly states images were collected from turmeric spice fields in the Pabna district, Bangladesh, using smartphones.
- **Appropriate size.** 865 original images is the largest confirmed original image count among verified datasets.
- **Realistic class distribution.** Four disease/condition classes with 193–238 images each in the original set — sufficient for classification experiments.
- **Augmentation clearly separated.** The dataset clearly separates 865 original images from 3,496 augmented images.
- **CC BY 4.0 license.** No usage restrictions for academic research.

**Classes available:**
1. Aphids Disease (221 original images)
2. Blotch (238 original images)
3. Leaf Spot (193 original images)
4. Healthy Leaf (213 original images)

**Caution:**
- Per-class images are relatively small (193–238 each). Augmentation will likely be necessary for training, but augmented images should NOT be counted as independently collected samples.
- Severity labels are absent. Early-stage disease detection will be difficult without additional labeling.
- Human researcher must verify the dataset contents after download.

---

## 3. Best Candidate for External Validation

### Recommendation: Dataset 02 — Mendeley g46dvrcvwn

**Evidence supporting this recommendation:**
- **Different DOI** from Dataset 01 (10.17632/g46dvrcvwn.2).
- **Different class structure.** Dataset 02 includes Dry Leaf, Leaf Blotch, Healthy Leaf, Rhizome Disease Roots, and Rhizome Healthy Roots — versus Aphids Disease, Blotch, Leaf Spot, Healthy Leaf in Dataset 01. This structural difference provides strong evidence that these are distinct datasets.
- **Different reported collection location.** Charpolisha/Jamalpur area vs. Pabna district in Dataset 01.
- **Larger original count.** 1,063 original images.
- **Publication date separation.** Different Mendeley upload dates and version histories.

**IMPORTANT CAVEATS FOR EXTERNAL VALIDATION USE:**
1. Class labels are NOT directly compatible between Dataset 01 and Dataset 02. The researcher must decide if 'Leaf Blotch' (Dataset 02) and 'Blotch' (Dataset 01) refer to the same disease before cross-dataset evaluation.
2. Both datasets are from Bangladesh, and visual overlap cannot be ruled out without image-level hash comparison after download.
3. The independence assessment for this pair is rated **PROBABLE** but not **STRONG** — researcher verification is essential.
4. Per-class original image counts for Dataset 02 are NOT reported in any accessible public metadata. This must be measured after download.

**This is a recommendation only. The researcher must verify independence before use.**

---

## 4. Best Field Dataset

### Finding: Dataset 01 has the strongest field collection evidence.

**Evidence:**
- The associated Data in Brief paper (2025) explicitly states images were collected from "Bangladesh spice fields" in the Pabna district.
- The use of smartphones is stated in the paper context.
- Field conditions (natural lighting, outdoor backgrounds) are implied by spice field collection.

**Dataset 02 field evidence:**
- Less clearly documented in publicly accessible metadata.
- ResearchGate references mention plantation collection (Charpolisha/Jamalpur), suggesting field collection, but this is not as explicitly documented as Dataset 01.
- Camera/device type is not reported for Dataset 02.

**Conclusion:** Dataset 01 can be classified as **field data** with MODERATE-HIGH confidence based on the associated paper. Dataset 02 is **probably field data** but this requires researcher verification.

**What was NOT found:**
- No dataset with explicit multi-farm, multi-location, multi-country collection was identified.
- No dataset with multiple viewing angles, distances, and background diversity explicitly documented was found.
- No dataset with documented different lighting condition sampling (morning, afternoon, rainy, backlit) was found for Dataset 01 or 02. One search result mentioned a YOLOv3-based paper that discusses such variability in its collection methodology — but that paper's dataset was NOT found as a publicly downloadable standalone dataset.

---

## 5. Dataset Independence

### Assessment Summary

| Pair | Status | Confidence |
|---|---|---|
| Dataset 01 (jtttfbx342) vs Dataset 02 (g46dvrcvwn) | **PROBABLE** independent | MODERATE |
| Dataset 01 (jtttfbx342) vs Kaggle dis_tur | **NOT INDEPENDENT** | HIGH |
| Dataset 01 (jtttfbx342) vs Roboflow Turmeric_disease | **UNCERTAIN** | LOW |
| Dataset 02 (g46dvrcvwn) vs Kaggle dis_tur | NOT APPLICABLE | HIGH |
| Dataset 02 (g46dvrcvwn) vs Roboflow Turmeric_disease | **UNCERTAIN** | LOW |

### Evidence for Dataset 01 vs Dataset 02 Probable Independence

1. **Different DOIs** — Two separate dataset records on Mendeley.
2. **Different class structures** — Dataset 02 includes rhizome classes entirely absent from Dataset 01.
3. **Different image counts** — 865 vs 1,063 originals.
4. **Different stated collection locations** — Pabna vs Jamalpur/Charpolisha (both Bangladesh, different regions).
5. **Different publication context** — Dataset 01 linked to a specific Data in Brief paper; Dataset 02 cited in a separate PMC study.

### What Cannot Be Confirmed Without Download
- Exact image-level hash comparison to rule out partial overlap.
- Whether any images appear in both datasets.
- Exact per-class counts for Dataset 02.

**Researcher action required:** After downloading both datasets, run a perceptual hash comparison between all images from Dataset 01 and Dataset 02. The `duplicate_report.csv` in the metadata folder documents this as pending.

---

## 6. Class Compatibility

### Class Matrix

| Class Label | Dataset 01 (Mendeley jtttfbx342) | Dataset 02 (Mendeley g46dvrcvwn) |
|---|---|---|
| Healthy Leaf | ✅ Yes (213 original images) | ✅ Yes (count unknown) |
| Aphids Disease | ✅ Yes (221 original images) | ❌ Not present |
| Blotch | ✅ Yes (238 original images) | ❌ Not present (see Leaf Blotch) |
| Leaf Spot | ✅ Yes (193 original images) | ❌ Not present |
| Dry Leaf | ❌ Not present | ✅ Yes (count unknown) |
| Leaf Blotch | ❌ Not present (see Blotch) | ✅ Yes (count unknown) |
| Rhizome Disease Roots | ❌ Not present | ✅ Yes (count unknown) |
| Rhizome Healthy Roots | ❌ Not present | ✅ Yes (count unknown) |

### Cross-Comparable Classes

| Label in Dataset 01 | Label in Dataset 02 | Can Be Compared? | Evidence |
|---|---|---|---|
| Healthy Leaf | Healthy Leaf | Possibly — with caution | Same label name, but visual appearance may vary; botanical definition should be verified |
| Blotch | Leaf Blotch | DO NOT ASSUME COMPATIBLE | 'Blotch' and 'Leaf Blotch' may refer to the same or different fungal conditions. Verification from original papers required before treating as same class. |
| Aphids Disease | (No equivalent) | Not applicable | — |
| Leaf Spot | (No equivalent) | Not applicable | — |
| (No equivalent) | Dry Leaf | Not applicable | — |
| (No equivalent) | Rhizome Disease Roots | Not applicable | — |
| (No equivalent) | Rhizome Healthy Roots | Not applicable | — |

**Only 'Healthy Leaf' has a potentially comparable class across both datasets.**  
**DO NOT merge 'Blotch' and 'Leaf Blotch' without botanical/pathological confirmation.**

---

## 7. Duplicate Risks

### Confirmed Risk: Dataset 01 ↔ Kaggle dis_tur

**Risk Level: HIGH**  
The Kaggle dataset 'dis_tur' almost certainly contains the same images as Mendeley Dataset 01. Using both as separate sources would constitute research fraud through data leakage.

**Action: Use Mendeley original only. Do not download or use Kaggle dis_tur.**

### Unconfirmed Risk: Dataset 01 ↔ Dataset 02

**Risk Level: MODERATE**  
Both datasets are from Bangladesh turmeric farming regions. Some images could potentially overlap. This cannot be confirmed without image-level hash comparison after download.

**Action: After downloading both datasets, run an automated perceptual hash comparison. The `duplicate_report.csv` file is pre-populated with the pending comparisons.**

### Unconfirmed Risk: Dataset 01/02 ↔ Roboflow

**Risk Level: LOW**  
The Roboflow dataset is tiny (~25 images), and its provenance is unknown. Some overlap is possible but statistically unlikely given the size difference.

**Action: If Roboflow dataset is downloaded, include it in the hash comparison sweep.**

---

## 8. Licensing

| Dataset | License | Verified? | Restrictions |
|---|---|---|---|
| Dataset 01 — Mendeley jtttfbx342 | CC BY 4.0 | YES — confirmed from Mendeley page HTML metadata | Attribution required. Free for academic research. |
| Dataset 02 — Mendeley g46dvrcvwn | CC BY 4.0 | PROBABLE — standard Mendeley license; researcher should verify on dataset page | Attribution required. Free for academic research. |
| Kaggle dis_tur (REJECTED) | Not specified by uploader | NO | Unknown — do not use |
| Roboflow Turmeric_disease (REJECTED) | CC BY 4.0 (stated) | NOT INDEPENDENTLY VERIFIED | Requires Roboflow account for download |

**Attribution requirement for Dataset 01:**  
Hossain, Md Riyad; Rashid, Mohammad Rifat Ahmmad; Jahangir, Tasfia binte; Hossain, Md. Samir; Rahman, Md. Mahamudur; Gani, Raiyan; Ahmed, Jubaer; Islam, Raihan Ul; Khan, M. Saddam Hossain (2025), "Image Dataset for Turmeric Plant Leaf Disease Detection", Mendeley Data, V2, doi: 10.17632/jtttfbx342.2

**Attribution requirement for Dataset 02:**  
Check the Mendeley dataset page at https://data.mendeley.com/datasets/g46dvrcvwn for the full author list and citation format.

---

## 9. Rejected Datasets

### Rejected Dataset 03: Kaggle dis_tur
**Rejection reason:** Almost certainly a repackaged mirror of Mendeley Dataset 01. No original DOI, no paper, no independent provenance. Class names and structure identical to Dataset 01. Using this alongside Dataset 01 would be double-counting.

### Rejected Dataset 04: Roboflow Turmeric_disease
**Rejection reason:**
- Very small image count (~25 images — verified count unavailable; estimated from search results)
- No associated paper
- No DOI  
- No documented collection provenance
- Class labels ('leaf', 'dry_leaf') do not correspond to disease-specific categories
- Cannot verify independent collection

**Partial note on Roboflow dataset:** It does have bounding box annotations, which neither Mendeley dataset has. If the research task requires object detection rather than classification, this could serve as an annotation format reference, but NOT as an independent image source for training or evaluation.

---

## 10. Recommended Collection Strategy

> **This is a recommendation only. The researcher must make all final decisions after inspecting the actual downloaded datasets.**

### Proposed Strategy

| Dataset | Role | Condition |
|---|---|---|
| Dataset 01 (Mendeley jtttfbx342) — 865 original images | **Primary training data** | Download and use original images only (865). Augmentation decision to be made by researcher after inspection. |
| Dataset 02 (Mendeley g46dvrcvwn) — 1,063 original images | **Candidate for external validation** | Download, run hash comparison against Dataset 01, verify class label definitions, then use as external validation only if independence is confirmed. |
| Kaggle dis_tur | **REJECTED** | Do not download or use. |
| Roboflow Turmeric_disease | **REJECTED for training/validation** | Do not use as image source. |

### Researcher Decision Points Before Proceeding
1. **Download Dataset 01 and Dataset 02 independently** and store in separate folders (already created).
2. **Run hash-level duplicate check** between Dataset 01 and Dataset 02 before designing any experiment.
3. **Botanically verify** whether 'Blotch' (Dataset 01) and 'Leaf Blotch' (Dataset 02) represent the same disease before any class harmonization.
4. **Count per-class images in Dataset 02** (not reported in metadata) after download.
5. **Decide whether rhizome classes** from Dataset 02 are within scope of your research.
6. **Review dataset licenses** on the Mendeley pages before publication.

### On Early-Stage Disease / Severity Labels
- Neither Dataset 01 nor Dataset 02 provides explicit severity labels.
- No dataset with confirmed early-stage turmeric disease images was found.
- If early-stage detection is a research requirement, additional data collection or manual severity labeling of existing images will be necessary.

### On Field Data Availability
- Dataset 01 is confirmed field data (Pabna spice fields, Bangladesh).
- Dataset 02 is probably field data (Jamalpur/Charpolisha plantations, Bangladesh).
- No international, multi-country, or multi-farm field dataset was found for turmeric diseases.

---

## ADDITIONAL SEARCH NOTES

### Platforms with No Confirmed Turmeric Disease Datasets
- **Zenodo:** No dedicated turmeric leaf disease dataset found. General plant disease datasets exist but no specific turmeric-only collection was identified.
- **Figshare:** No confirmed dedicated turmeric leaf disease dataset found in search results.
- **IEEE DataPort:** No confirmed dedicated turmeric leaf disease dataset found.
- **ScienceDirect supplementary materials:** Multiple papers use the Mendeley datasets above; no additional unique datasets found in supplementary data sections from web searches.

### Recommended Additional Manual Searches
The researcher should manually check the following for any new datasets since this report was generated:
- https://zenodo.org (search: "turmeric disease" OR "Curcuma longa disease")
- https://figshare.com (search: "turmeric leaf disease" OR "turmeric plant disease")
- https://ieee-dataport.org (search: "turmeric")
- https://data.mendeley.com (search: "turmeric") — to catch newer datasets
- Google Scholar for papers published after September 2026 that may have introduced new datasets

---

*Report generated on 2026-09-06 by an automated data collection agent.*  
*This report contains evidence-based findings only. No information has been fabricated.*  
*Where data was not available, "Not reported" is explicitly stated.*  
*All final research decisions must be made by the human researcher.*
