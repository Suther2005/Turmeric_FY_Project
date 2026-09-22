# Field Validation Protocol & Evaluation Standard
**Curuma / TurmeriCare AI Decision Support System**  
*Turmeric (*Curcuma longa*) Foliar Pathology Field Assessment Standard*

---

## 1. Purpose & Scope

This document establishes the scientific protocol for collecting, cataloging, verifying, and evaluating genuine real-world field images of turmeric crops (*Curcuma longa*) against the **Curuma / TurmeriCare AI** multimodal crop intelligence system.

The primary objective of field validation is to provide an unbiased, prospective benchmark of:
1. **Domain Safeguard Reliability**: Out-of-Domain (OOD) acceptance of real turmeric field captures without excessive false rejections.
2. **Diagnostic Generalization**: Pathological classification accuracy, precision, recall, and F1-scores of the Clean Hybrid Ensemble (`EfficientNet-B0` + `MobileNetV2`, $\alpha = 0.50$) across real-world agricultural environments.

---

## 2. Core Protocol Principles

### Rule 1: Strict Dataset Isolation & Independence
- All field-validation specimens must be **newly collected prospectively** and completely independent of the internal training (603 images), validation (130 images), and benchmark test (129 images) sets.
- **Zero Data Leakage**: Under no circumstances should field-validation images be used for model training, transfer learning fine-tuning, or Mahalanobis OOD threshold recalibration before the primary prospective evaluation is concluded.

### Rule 2: Natural Agro-Ecological Field Variation
Field images must capture the natural diversity of turmeric farms across Tamil Nadu (e.g., Erode, Salem, Coimbatore, Namakkal, Dharmapuri) and must intentionally reflect:
- **Lighting Conditions**: Bright direct midday sunlight, diffuse cloud cover / overcast, early morning golden light, dappled canopy shade, and late afternoon conditions.
- **Background Complexity**: Exposed farm soil, drip irrigation tubing, mulching straw, companion weeds, overlapping foliage, and farmer hands holding the leaf petiole.
- **Camera Distances & Angles**: Macro close-ups of lesions (10–15 cm), full lamina framing (25–40 cm), oblique angles, and varying focal depths.
- **Leaf Maturity & Canopy Position**: Young tender upper leaves, fully expanded middle canopy leaves, and mature/senescing lower basal leaves.
- **Pathological Variations**: Early subtle chlorotic halos, punctate lesions, advanced necrotic blotches, aphid honeydew/sooty mold, and co-occurring abiotic stress (e.g., tip burn, iron chlorosis).

### Rule 3: Balanced Health & Disease Representation
Specimen collection must span all four validated diagnostic categories:
1. `Aphids` (*Aphis gossypii* foliar infestation & nymph clustering)
2. `Blotch` (*Taphrina maculans* necrotic foliar lesions)
3. `Healthy` (Vibrant green foliage free of visible pathogen symptoms)
4. `Leaf Spot` (*Colletotrichum capsici* circular lesions with chlorotic halos)

---

## 3. Metadata & Manifest Specification

All field specimens must be cataloged in [`metadata/field_validation_manifest.csv`](./metadata/field_validation_manifest.csv) adhering strictly to the schema below:

| Column Header | Type / Allowed Values | Description |
| :--- | :--- | :--- |
| `image_id` | String (`FV_001`, `FV_002`, ...) | Unique identifier for each field validation specimen. |
| `filename` | String (`FV_<LOC>_<YYYYMMDD>_<SEQ>.jpg`) | Exact filename located in `images/`. |
| `source` | String | Data source (e.g., `Farmer_Field_Visit`, `TNAU_Extension_Center`, `Agritech_Survey`). |
| `capture_date` | ISO Date (`YYYY-MM-DD`) | Date the photograph was acquired. |
| `location` | String | District / Taluk / Village (e.g., `Erode_Kodumudi`, `Salem_Attur`). |
| `capture_device` | String | Smartphone model or camera (e.g., `Redmi_Note_12`, `Samsung_Galaxy_M34`, `iPhone_13`). |
| `lighting_condition` | Enum (`direct_sun`, `overcast`, `shaded`, `morning_light`, `evening_light`) | Natural lighting condition at time of capture. |
| `background_condition` | Enum (`soil_background`, `canopy_foliage`, `hand_held`, `mulch`, `mixed`) | Background elements surrounding the target leaf. |
| `leaf_condition` | Enum (`young_leaf`, `mature_leaf`, `senescing_leaf`, `wet_leaf`, `dusty_leaf`) | Physical state of the photographed leaf. |
| `ground_truth_class` | Enum (`Aphids`, `Blotch`, `Healthy`, `Leaf Spot`, `Unknown`) | Verified pathological diagnosis. |
| `ground_truth_source` | Enum (`expert`, `agronomist`, `reference_label`, `pending`) | Authority or methodology providing the diagnosis. |
| `ground_truth_confidence` | Enum (`high`, `medium`, `low`, `pending`) | Confidence level of the ground-truth assignment. |
| `notes` | String | Field observations, co-infections, or environmental microclimate notes. |

### Ground-Truth Labeling Standards
- **No Guessing**: If a lesion is ambiguous or confounded by nutrient deficiency/physical tears, mark `ground_truth_class` as `Unknown` and `ground_truth_confidence` as `pending` until verified by an agronomist or plant pathologist.
- **Independence from Model Output**: Never use the AI model's prediction or confidence score to determine or bias ground-truth labels.

---

## 4. Two-Stage Evaluation Methodology

The field validation benchmark must evaluate two decoupled stages:

```
Field Image
     │
     ▼
[ Stage 1: OOD Domain Safeguard Gate ]
  Mahalanobis Distance (DM) vs Fixed Production Threshold (tau = 63.10)
     │
     ├─────────────────────────────────┐
     ▼                                 ▼
[ In-Domain: DM <= 63.10 ]       [ OOD Rejected: DM > 63.10 ]
     │                                 │
     ▼                                 ▼
[ Stage 2: Disease Classifier ]   False Rejection Audit (Genuine leaf flagged as OOD)
  Hybrid Ensemble (alpha = 0.50)
     │
     ▼
Predicted Class & Softmax Probs
     │
     ▼
Ground-Truth Comparison & Confusion Matrix
```

### Stage 1: Domain Safeguard Assessment (OOD Gate)
- **Production Threshold**: Must remain fixed at $\tau_{98} = 63.10$ (calibrated from 1280-D penultimate embeddings of clean training centroids).
- **False Rejection Rate (FRR)**: Percentage of genuine turmeric field leaves incorrectly flagged as `OOD_REJECTED`.
- **Target Metric**: $\text{FRR} \le 5.0\%$ under standard field photography conditions.

### Stage 2: Foliar Pathology Classification Assessment
- Evaluated exclusively on in-domain accepted specimens ($D_M \le 63.10$) with verified ground-truth labels (`ground_truth_confidence` $\in \{\text{high}, \text{medium}\}$).
- Multi-class diagnostic performance evaluated across `Aphids`, `Blotch`, `Healthy`, and `Leaf Spot`.

---

## 5. Standard Field Validation Report Template

When a field evaluation cohort is executed, report results strictly according to this template:

### 1. Cohort Overview
- **Total Field Images Collected**: $N_{\text{total}}$
- **Collection Locations**: District distribution (e.g., Erode: $n_1$, Salem: $n_2$)
- **Capture Devices**: Smartphone models & sensor variations
- **Ground-Truth Breakdown**:
  - `Aphids`: $n_A$
  - `Blotch`: $n_B$
  - `Healthy`: $n_H$
  - `Leaf Spot`: $n_{LS}$
  - `Unknown / Excluded`: $n_U$

### 2. Stage 1: Domain Safeguard (OOD) Results
| Metric | Value | Target Benchmark |
| :--- | :---: | :---: |
| Total Evaluated | $N$ | — |
| OOD Accepted ($D_M \le 63.10$) | $N_{\text{acc}}$ ($X\%$) | $\ge 95.0\%$ |
| OOD Rejected ($D_M > 63.10$) | $N_{\text{rej}}$ ($Y\%$) | $\le 5.0\%$ |
| False Rejections (Genuine leaves rejected) | $N_{\text{FR}}$ ($Z\%$) | $\le 5.0\%$ |
| Mean Mahalanobis Distance ($\mu_{D_M}$) | — | Expected range: 25.0 – 45.0 |
| Min / Max Mahalanobis Distance | — | — |

### 3. Stage 2: Classification Performance (Accepted Images)
| Metric | Macro Average | Weighted Average | Healthy | Aphids | Blotch | Leaf Spot |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Precision** | — | — | — | — | — | — |
| **Recall** | — | — | — | — | — | — |
| **F1-Score** | — | — | — | — | — | — |
| **Accuracy** | \multicolumn{6}{c|}{$X.XX\% \quad (N_{\text{correct}} / N_{\text{accepted}})$} |

### 4. Confusion Matrix
```
                    Predicted
             Aphids  Blotch  Healthy  Leaf Spot
True Aphids   [ --     --      --        --   ]
     Blotch   [ --     --      --        --   ]
     Healthy  [ --     --      --        --   ]
     Leaf Spot[ --     --      --        --   ]
```

### 5. Failure Mode & Field Anomaly Analysis
Document all misclassifications with specific field attributes:
- Lighting extremes (harsh specular reflections, underexposure)
- Distance/resolution anomalies (distant canopy foliage vs macro single leaf)
- Co-occurring pathology or physiological chlorosis
- Physical leaf damage or dirt/fungicide residue on the lamina

---

## 6. Directory Structure Reference

```
turmeric_datasets/
└── field_validation/
    ├── images/
    │   └── .gitkeep                               # Raw prospective field captures
    ├── metadata/
    │   └── field_validation_manifest.csv          # Catalog of specimen metadata & labels
    └── FIELD_VALIDATION_PROTOCOL.md               # This protocol & reporting standard
```
