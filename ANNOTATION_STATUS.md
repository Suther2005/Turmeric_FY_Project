# Turmeric Leaf Pathology — Annotation Status

## Current Dataset & Annotation State

| Metric | Status / Value |
| :--- | :--- |
| **Annotation Stage** | **PENDING** |
| **Target Taxonomy** | 4 Classes (`Aphids`, `Blotch`, `Leaf Spot`, `Healthy`) |
| **Immutable Source** | `turmeric_datasets/dataset_01/original/` |
| **Total Core Images** | **865** |

---

## Core Dataset Class Breakdown (Dataset 01 Original)

| Class | Folder | Verified Images | Proportion | Verification Status |
| :--- | :--- | :---: | :---: | :--- |
| **Aphids** | `Aphids_Disease` | **221** | 25.5% | Source verified (4000x3000 JPEG) |
| **Blotch** | `Blotch` | **238** | 27.5% | Source verified (4000x3000 JPEG) |
| **Leaf Spot** | `Leaf_Spot` | **193** | 22.3% | Source verified (4000x3000 JPEG) |
| **Healthy** | `Healthy_Leaf` | **213** | 24.6% | Source verified (4000x3000 JPEG) |
| **TOTAL** | `dataset_01/original/` | **865** | **100.0%** | **Balanced 4-Class Baseline** |

---

## Candidate & Auxiliary Status

- **Dataset 02 Candidate Foliar Pool (`Leaf Blotch`: 199, `Healthy Leaf`: 197):**
  - Status: **REVIEW ONLY** (Quarantined pending resolution alignment & quality screening).
- **Rhizome & Root Images (464 images):**
  - Status: **EXCLUDED** (Non-foliar underground tissue).
- **Dry Leaf Images (203 images):**
  - Status: **EXCLUDED** (Physiological senescence outside 4-class disease scope).
- **Duplicate Cross-Split Images (`annotations/images/`, `auto_annotations/images/`):**
  - Status: **DISCARDED FROM TRAINING POOL** (Identified as duplicate mirrors of Dataset 01).

---

## Next Steps Before Annotation
1. Formally approve exclusion and review lists.
2. Initialize curated image manifest according to `ANNOTATION_PROTOCOL.md`.
3. Perform stratified $70/15/15$ train/val/test source partitioning.
