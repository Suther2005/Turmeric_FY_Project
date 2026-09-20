# Dataset Preparation & Split Summary

**Generated via:** Deterministic Stratified Splitter (`seed=42`)
**Project:** Turmeric Plant Leaf Disease Detection

---

## 1. Dataset 01 Stratified Partitioning

| Partition | Role | Images | Percentage |
| :--- | :--- | :---: | :---: |
| **`train`** | Core training set | **606** | 69.94% |
| **`val`** | Hyperparameter tuning & model checkpointing | **130** | 15.03% |
| **`internal_test`** | In-distribution evaluation benchmark | **129** | 15.03% |
| **Total** | Full Dataset 01 Original Cohort | **865** | **100.0%** |

### Per-Class Stratified Split (Dataset 01)

| Class Name | Train (70%) | Val (15%) | Internal Test (15%) | Total Class Images |
| :--- | :---: | :---: | :---: | :---: |
| `Aphids_Disease` | 155 | 33 | 33 | **221** |
| `Blotch` | 167 | 36 | 35 | **238** |
| `Healthy_Leaf` | 149 | 32 | 32 | **213** |
| `Leaf_Spot` | 135 | 29 | 29 | **193** |
| **Total** | **606** | **130** | **129** | **865** |

---

## 2. Dataset 02 External Validation & OOD Categorization

| Partition Category | Scope / Pathology | Images | Mapping Status |
| :--- | :--- | :---: | :--- |
| **`external_test`** | Compatible Leaf Classes (`Healthy Leaf` + `Leaf Blotch`) | **396** | **Direct Benchmark (396 images)** ✅ |
| **`external_ood`** | Desiccated Non-specific Foliage (`Dry Leaf`) | **203** | **Out-of-Distribution Test (203 images)** ⚠️ |
| **`external_excluded`** | Underground Root/Rhizome Anatomy (`Rhizome Disease/Healthy`) | **464** | **Excluded from Leaf Model (464 images)** ❌ |
| **Total** | Complete Dataset 02 Cohort | **1063** | **1,063 images** |

### External Validation Matched Breakdown

| Dataset 02 Source Class | Mapped Dataset 01 Target Class | External Evaluation Count |
| :--- | :--- | :---: |
| `Healthy Leaf` | `Healthy_Leaf` | **197 images** |
| `Leaf Blotch` | `Blotch` | **199 images** |
| **Total Usable External Benchmark** | **Shared Leaf Benchmark** | **396 images** |

---

## 3. Preservation of Data Integrity

- **Zero Raw File Modifications**: No images were moved, renamed, resized, or preprocessed.
- **Full Reproducibility**: Seed fixed to `42`. File mappings are transparently recorded in `dataset_splits.csv` and `external_validation_mapping.csv`.
