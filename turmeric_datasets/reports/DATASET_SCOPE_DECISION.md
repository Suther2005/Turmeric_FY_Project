# Formal Dataset Scope & Cohort Partition Decision

## Research Scope & Ground-Truth Hierarchy

**Project Title:** *A Multimodal Deep Learning Approach for Turmeric Leaf Disease Detection and Environmental Risk Assessment*  
**Scope Definition:** Four-Class Foliar Disease Classification (`Aphids`, `Blotch`, `Leaf Spot`, `Healthy`).

---

## 1. Primary Core Ground-Truth Dataset

The following **865 high-resolution foliar images** constitute the immutable core dataset:

| Target Class | Source Folder | Image Count | Resolution | Ground-Truth Role |
| :--- | :--- | :---: | :--- | :--- |
| **Aphids** | `dataset_01/original/Aphids_Disease` | **221** | $4000 \times 3000$ JPEG | Primary Core Training / Evaluation |
| **Blotch** | `dataset_01/original/Blotch` | **238** | $4000 \times 3000$ JPEG | Primary Core Training / Evaluation |
| **Leaf Spot** | `dataset_01/original/Leaf_Spot` | **193** | $4000 \times 3000$ JPEG | Primary Core Training / Evaluation |
| **Healthy** | `dataset_01/original/Healthy_Leaf` | **213** | $4000 \times 3000$ JPEG | Primary Core Training / Evaluation |
| **TOTAL CORE** | `dataset_01/original/` | **865** | **$4000 \times 3000$ JPEG** | **Definitive Baseline Benchmark** |

---

## 2. Review Cohort (Quarantined Candidate Pool)

The following **396 images** from Dataset 02 are retained as separate candidate data:

| Category | Source Folder | Image Count | Resolution | Research Role |
| :--- | :--- | :---: | :--- | :--- |
| **Leaf Blotch** | `dataset_02/.../Leaf Blotch` | **199** | $1000 \times 1000$ JPEG | Candidate for inclusion — requires annotation/QC |
| **Healthy Leaf** | `dataset_02/.../Healthy Leaf` | **197** | $1000 \times 1000$ JPEG | Candidate for inclusion — requires annotation/QC |
| **TOTAL REVIEW** | `dataset_02/original/` | **396** | **$1000 \times 1000$ JPEG** | **Separate Review Cohort** |

---

## 3. Excluded Cohorts (Out-of-Scope Data)

The following **667 images** are strictly excluded from the four-class foliar disease classification pipeline:

| Category | Source Folder | Image Count | Reason for Exclusion |
| :--- | :--- | :---: | :--- |
| **Rhizome Healthy Root** | `dataset_02/.../Rhizome Healthy Root` | **282** | Non-foliar underground root tissue; outside leaf pathology scope. |
| **Rhizome Disease Root** | `dataset_02/.../Rhizome Disease Root` | **182** | Non-foliar underground rhizome rot; outside foliar computer vision scope. |
| **Dry Leaf** | `dataset_02/.../Dry Leaf` | **203** | Physiological drying / senescence; outside four-class disease taxonomy. |
| **TOTAL EXCLUDED** | `dataset_02/original/` | **667** | **Non-foliar tissue or outside four-class disease taxonomy** |

---

## 4. Formal Research Policy Statement

> [!IMPORTANT]
> **The 865-image core dataset remains the primary ground-truth dataset. Dataset 02 candidates will only be incorporated after visual review and annotation QC.**

- No images have been deleted, moved, or overwritten.
- No model training has been initiated.
- All original directories and image assets remain fully preserved in their respective raw locations.
