# Turmeric Leaf Disease Dataset Audit Report

**Audit Execution Timestamp:** 2026-09-06T13:27:23Z  
**Audit Constraints Strictly Enforced:**
- ONLY original images downloaded (Augmented data completely excluded)
- No image modifications, renaming, resizing, or preprocessing applied
- Datasets kept strictly isolated in separate folder hierarchies
- 100% SHA-256 integrity verification against official Mendeley metadata

---

## 1. Summary of Download & Integrity

### Dataset 01 (`jtttfbx342` - Mendeley Data V2)
- Target original images: **865**
- Successfully downloaded: **865**
- Failed downloads: **0**
- SHA-256 exact match against Mendeley API: **865 / 865** (100% PASS ✅)

### Dataset 02 (`g46dvrcvwn` - Mendeley Data V2)
- Archive: `Turmeric Plant Disease.zip` (Original split only)
- Expected SHA-256: `2c58ac33c2e4989ba71ca781d4961236fbb26804d56f8fff1d2ab0ac95f43a2f`
- Archive integrity: **100% VERIFIED ✅**
- Original images extracted: **1063**

---

## 2. Dataset 01: Class Counts vs Published Paper

| Class Name | Actual Downloaded Count | Published Paper / Metadata Count | Verification Status |
| :--- | :---: | :---: | :---: |
| `Aphids_Disease` | **221** | 221 | ✅ MATCH |
| `Blotch` | **238** | 238 | ✅ MATCH |
| `Healthy_Leaf` | **213** | 213 | ✅ MATCH |
| `Leaf_Spot` | **193** | 193 | ✅ MATCH |
| **Total Original Images** | **865** | **865** | ✅ 100% MATCH |

---

## 3. Dataset 02: Measured Class Counts (Original Images)

| Class Name | Actual Measured Count |
| :--- | :---: |
| `Dry_Leaf` | **203** |
| `Healthy_Leaf` | **197** |
| `Leaf_Blotch` | **199** |
| `Rhizome_Disease_Roots` | **182** |
| `Rhizome_Healthy_Roots` | **282** |
| **Total Original Images** | **1063** |

---

## 4. Cross-Dataset Duplicate Analysis

| Comparison Metric | Result | Interpretation |
| :--- | :---: | :--- |
| Exact SHA-256 Duplicate Pairs | **0** | No shared image files across datasets ✅ |
| Perceptual Hash Near-Duplicates (Hamming ≤ 10) | **2953** | Visually similar images flagged for review ⚠️ |

### Sample Near-Duplicate Pairs (First 20)
| Image (DS01) | Image (DS02) | Hamming Distance | Class (DS01) | Class (DS02) |
| :--- | :--- | :---: | :--- | :--- |
| `aphids_disease_(1).jpg` | `Dry Leaf00082.JPG` | 10 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(10).jpg` | `Dry Leaf00049.JPG` | 7 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(101).jpg` | `Dry Leaf00049.JPG` | 8 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(104).jpg` | `Dry Leaf00106.JPG` | 10 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(105).jpg` | `Dry Leaf00106.JPG` | 10 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(106).jpg` | `Dry Leaf00049.JPG` | 8 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(108).jpg` | `Dry Leaf00146.JPG` | 10 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(108).jpg` | `Healthy Leaf00158.JPG` | 10 | `Aphids_Disease` | `Healthy_Leaf` |
| `aphids_disease_(108).jpg` | `Healthy Leaf00175.JPG` | 9 | `Aphids_Disease` | `Healthy_Leaf` |
| `aphids_disease_(108).jpg` | `Leaf Blotch00073.JPG` | 9 | `Aphids_Disease` | `Leaf_Blotch` |
| `aphids_disease_(108).jpg` | `Leaf Blotch00080.JPG` | 10 | `Aphids_Disease` | `Leaf_Blotch` |
| `aphids_disease_(11).jpg` | `Dry Leaf00138.JPG` | 8 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(11).jpg` | `Dry Leaf00177.JPG` | 9 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(109).jpg` | `Dry Leaf00082.JPG` | 9 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(109).jpg` | `Dry Leaf00140.JPG` | 10 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(109).jpg` | `Dry Leaf00143.JPG` | 7 | `Aphids_Disease` | `Dry_Leaf` |
| `aphids_disease_(109).jpg` | `Leaf Blotch00004.JPG` | 7 | `Aphids_Disease` | `Leaf_Blotch` |
| `aphids_disease_(109).jpg` | `Leaf Blotch00005.JPG` | 8 | `Aphids_Disease` | `Leaf_Blotch` |
| `aphids_disease_(109).jpg` | `Leaf Blotch00010.JPG` | 9 | `Aphids_Disease` | `Leaf_Blotch` |
| `aphids_disease_(109).jpg` | `Rhizome Disease Root00004.JPG` | 8 | `Aphids_Disease` | `Rhizome_Disease_Roots` |

---

## 5. Dataset Independence Verdict

### Status: ⚠️ PROBABLY INDEPENDENT

Zero exact byte duplicates found. 2953 perceptual hash near-duplicate pairs (Hamming distance ≤ 10) detected; visual review recommended.

| Evaluation Factor | Dataset 01 (`jtttfbx342`) | Dataset 02 (`g46dvrcvwn`) | Independence Assessment |
| :--- | :--- | :--- | :--- |
| **DOI** | `10.17632/jtttfbx342.2` | `10.17632/g46dvrcvwn.2` | Distinct DOIs ✅ |
| **Collection Region** | Pabna District, Bangladesh | Charpolisha / Jamalpur, Bangladesh | Separate geographic locations ✅ |
| **Original Images** | 865 images | 1063 images | Non-matching total counts ✅ |
| **Disease Classes** | 4 classes (Leaf-only) | 5 classes (Leaf + Rhizome) | Distinct class taxonomies ✅ |
| **Exact Byte Duplication** | 0 shared files | 0 shared files | Zero data leakage ✅ |

---

## 6. Generated Metadata Artifacts

- `metadata/image_metadata.csv`: Full audit table of all images with SHA-256, pHash, dimensions, and URLs
- `metadata/class_counts.csv`: Summary table of image counts per class
- `metadata/duplicate_report.csv`: Complete pair-by-pair duplicate check report
- `metadata/dataset_audit.md`: This comprehensive audit document
- `logs/download_audit.log`: Detailed execution and download logs
