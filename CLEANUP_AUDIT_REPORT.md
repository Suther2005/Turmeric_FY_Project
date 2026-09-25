# CURUMA / TURMERICCARE — COMPLETE CLEANUP AUDIT REPORT

**Date:** 2026-09-24  
**Scope:** Entire repository audit prior to final project freeze.

---

## 1. Inventory Summary

| Category | Description | Count / Status |
|---|---|---|
| **Total Directories Inspected** | All top-level and recursive subdirectories | 105 directories |
| **Total Files Inspected** | All source, research, dataset, model, and config files | 10,169 files |
| **Production Files (A)** | Core frontend & backend code running the live app | 52 files |
| **ML / Model Files (B)** | Checkpoints, inference engine, training scripts, OOD assets | 12 files |
| **Research Evidence Files (C)** | Meteorological datasets, annotations, benchmark datasets, research reports | ~9,950 files |
| **Test & Validation Files (D)** | Regression test suites, verification pipelines, decision matrices | 32 files |
| **Documentation Files (E)** | Architecture audits, API guides, dataset protocols | 25 files |
| **Generated & Cache Files (F)** | Python bytecode caches (`__pycache__`), Vite production build (`dist/`) | 12 files |
| **Obsolete Files (G)** | Replaced prototypes, temporary backup code | 4 files |
| **Duplicate Files (H)** | Byte-for-byte identical root duplicate copies of canonical subfolder files | 9 files |
| **Unused Files (I)** | Unreferenced legacy page prototype (`MyFieldPage.tsx`) | 1 file |
| **Uncertain Files (J)** | Files retained under the zero-deletion safety policy | 0 deleted |

---

## 2. Itemized Candidate Deletion Audit

| # | Path | Category | Classification Rationale | Reference Search Result | Safe to Delete? |
|---|---|:---:|---|---|:---:|
| 1 | `backend/main_before_render_memory_fix.py` | **G (Obsolete)** | Temporary backup created prior to memory-efficient inference optimization. | 0 references in active code | **YES** |
| 2 | `backend/model_before_render_memory_fix.py` | **G (Obsolete)** | Temporary backup created prior to Stage-1 and OOD memory optimization. | 0 references in active code | **YES** |
| 3 | `backend/requirements_before_render_memory_fix.txt` | **G (Obsolete)** | Duplicate backup of `backend/requirements.txt`. | 0 references in active code | **YES** |
| 4 | `backend/train_backup.py` | **H (Duplicate)** | Byte-for-byte identical copy of `backend/train.py` (8,631 bytes). | 0 references in runtime | **YES** |
| 5 | `ANNOTATION_PROTOCOL.md` | **H (Duplicate)** | Exact root duplicate of canonical `turmeric_datasets/ANNOTATION_PROTOCOL.md`. | Canonical file in `turmeric_datasets/` | **YES** |
| 6 | `ANNOTATION_STATUS.md` | **H (Duplicate)** | Exact root duplicate of canonical `turmeric_datasets/ANNOTATION_STATUS.md`. | Canonical file in `turmeric_datasets/` | **YES** |
| 7 | `DATASET_AUDIT_REPORT.md` | **H (Duplicate)** | Exact root duplicate of canonical `turmeric_datasets/DATASET_AUDIT_REPORT.md`. | Canonical file in `turmeric_datasets/` | **YES** |
| 8 | `EXTERNAL_VALIDATION_PILOT_REPORT.md` | **H (Duplicate)** | Exact root duplicate of canonical `research_results/EXTERNAL_VALIDATION_PILOT_REPORT.md`. | Canonical file in `research_results/` | **YES** |
| 9 | `FINAL_EXTERNAL_VALIDATION_AUDIT.md` | **H (Duplicate)** | Exact root duplicate of canonical `research_results/FINAL_EXTERNAL_VALIDATION_AUDIT.md`. | Canonical file in `research_results/` | **YES** |
| 10 | `external_validation_cohort.csv` | **H (Duplicate)** | Exact root duplicate of canonical `research_results/external_validation_cohort.csv`. | Canonical file in `research_results/` | **YES** |
| 11 | `external_validation_results.csv` | **H (Duplicate)** | Exact root duplicate of canonical `research_results/external_validation_results.csv`. | Canonical file in `research_results/` | **YES** |
| 12 | `external_validation_source_registry.csv` | **H (Duplicate)** | Exact root duplicate of canonical `research_results/external_validation_source_registry.csv`. | Canonical file in `research_results/` | **YES** |
| 13 | `src/pages/MyFieldPage.tsx` | **I (Unused)** | Prototype page completely replaced by `SeasonalAdvisoryPage.tsx`; unreferenced in router. | 0 references in routing / components | **YES** |
| 14 | `backend/__pycache__/` | **F (Generated)** | Python bytecode compilation cache. | Automatically regenerated | **YES** |
| 15 | `scratch/__pycache__/` | **F (Generated)** | Python bytecode compilation cache. | Automatically regenerated | **YES** |
| 16 | `research_results/__pycache__/` | **F (Generated)** | Python bytecode compilation cache. | Automatically regenerated | **YES** |

---

## 3. Retained Core Assets & Architecture

- **Active Checkpoints Preserved**:
  - `backend/checkpoints/best_model.pth` (MobileNetV2 classifier)
  - `backend/checkpoints/efficientnet_b0_best.pth` (EfficientNet-B0 classifier)
  - `backend/checkpoints/efficientnet_b0_clean_best.pth` (Retrained clean benchmark checkpoint)
  - `backend/checkpoints/ood_stats.pt` (Mahalanobis safeguard parameters)
  - `backend/checkpoints/ood_stats_clean.pt` (Clean OOD reference parameters)
  - `backend/checkpoints/turmeric_leaf_verifier_mobilenetv3.pth` (Stage-1 MobileNetV3-Small verifier)
  - `turmeric_models/checkpoints/turmeric_leaf_verifier_mobilenetv3.pth` (Referenced by `evaluate_verifier_frozen.py`)
- **Research Evidence Preserved**:
  - All 14-day cleaned hourly meteorological records (2021–2023) in `environmental_data/cleaned/`.
  - All epidemiological association analyses, feature schemas, and validation reports in `environmental_data/epidemiology/`.
  - All datasets (Dataset 01, Dataset 02, Mendeley single-leaf benchmark, annotations) in `turmeric_datasets/`.
  - All 50-image negative OOD benchmark sets in `research_results/ood_benchmark/`.
- **Validation Test Suite Preserved**:
  - `scratch/final_regression_test.py`
  - `scratch/test_stage1_verification_pipeline.py`
  - `scratch/test_recommendations_matrix.py`
  - `scratch/test_live_end_to_end_flow.py`
  - `scratch/complete_interaction_dataflow_audit.py`
