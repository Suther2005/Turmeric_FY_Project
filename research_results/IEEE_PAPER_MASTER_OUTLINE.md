# TurmeriCare AI: An Out-of-Distribution Safeguarded Multimodal Architecture for Turmeric Foliar Pathology Diagnosis and Environmental Risk Assessment

**Document Type:** Master IEEE Conference Paper Structure & Verified Results Plan  
**Target Venue:** IEEE Conference on Agri-Informatics / Machine Learning in Agriculture  
**Artifact Path:** `research_results/IEEE_PAPER_MASTER_OUTLINE.md`  
**Date:** September 2026  
**Status:** **FROZEN RESEARCH BASELINE (Zero Code/Weight/Model Modifications Applied)**

---

## TITLE
**TurmeriCare AI: An Out-of-Distribution Safeguarded Multimodal Architecture for Turmeric Foliar Pathology Diagnosis and Environmental Risk Assessment**

---

## ABSTRACT
Deep learning classifiers for crop disease diagnosis frequently suffer from two critical real-world vulnerabilities: (1) closed-set overconfidence on non-agricultural or out-of-domain imagery, and (2) complete ignorance of microclimatic environmental disease drivers. In this paper, we present **TurmeriCare AI**, an edge-compatible, multimodal decision-support system for turmeric (*Curcuma longa*) foliar pathology. The visual diagnostic pipeline combines a clean-trained **EfficientNet-B0** and **MobileNetV2** hybrid soft-voting ensemble ($\alpha = 0.50$) with a penultimate-layer **Mahalanobis Out-of-Distribution (OOD) safeguard** ($\tau_{98} = 63.10$) regularized via Ledoit-Wolf covariance shrinkage. On an untouched internal held-out test set ($N=129$), the hybrid ensemble achieves **$99.22\%$ accuracy** (weighted F1-score: **$99.23\%$**), while the OOD gate demonstrates **$100.0\%$ far-OOD rejection safety** ($40/40$) across anime, UI documents, human faces, and non-crop objects, and $97.69\%$ in-domain acceptance. When subjected to real-world field domain stress testing ($27$ field images) and an independent external cohort ($200$ images from Mendeley Dataset 02), the OOD gate safely rejected $100.0\%$ of whole-bush multi-leaf photographs ($D_M = 84.07 \pm 7.50$), successfully intercepting the canopy green-dilution failure mode where $79\%$ of un-gated blotch bush photos are misclassified as healthy. A 50-image single-leaf digital cropping experiment demonstrated that post-hoc 2D digital bounding-box cropping cannot bridge the domain gap ($\Delta \mu_{D_M} = +5.32$ for blotch), confirming that single-leaf framing must be enforced optically at capture time. To complement visual diagnosis, a deterministic 14-day antecedent biophysical environmental engine and late-fusion Composite Risk Index (CRI) provide agronomically grounded, non-prescriptive IPM advisories aligned with Tamil Nadu Agricultural University (TNAU) and ICAR-IISR packages of practices.

---

## INDEX TERMS
Agricultural Decision Support, Turmeric Foliar Diseases, Convolutional Neural Networks, Out-of-Distribution Detection, Mahalanobis Distance, Multimodal Risk Fusion, Domain Shift, Precision Agriculture.

---

## I. INTRODUCTION
- **The Turmeric Disease Problem**: Economic significance of turmeric (*Curcuma longa*) in India (especially Tamil Nadu); severe yield and curcumin losses caused by fungal pathogens (*Colletotrichum capsici* — Leaf Spot, *Taphrina maculans* — Leaf Blotch) and sap-sucking vectors (*Aphis gossypii*).
- **Limitations of Image-Only Closed-Set Classifiers**: Closed-world Softmax classifiers assign high-confidence disease diagnoses to irrelevant inputs (non-crops, human faces, anime drawings, UI screenshots) or non-conforming perspectives.
- **The Need for Domain-Aware Safety**: In field deployment, models trained on clean single-leaf macro photography fail silently when presented with distant whole-bush canopies due to canopy green-dilution. An explicit feature-space safeguard is essential to reject non-conforming inputs.
- **The Need for Environmental Decision Support**: Disease manifestation is governed by the disease triangle (host, pathogen, environment). Visual symptoms appear post-infection; integrating antecedent microclimate permissiveness (humidity, temperature, dew, rainfall splash) enables early preventive scouting before widespread damage.
- **Research Gap**: Existing plant pathology AI models operate either as purely visual closed-set CNNs or purely theoretical agrometeorological equations, with no open, verified late-fusion system featuring formal OOD domain rejection.
- **Core Contributions**:
  1. A clean-trained, edge-compatible **Hybrid CNN Ensemble** (Clean EfficientNet-B0 + MobileNetV2, $\alpha = 0.50$) achieving $99.22\%$ accuracy on clean single-leaf test data.
  2. A **Mahalanobis feature-space OOD safeguard** achieving $100\%$ far-OOD rejection safety and intercepting whole-bush perspective domain shifts.
  3. Empirical stress testing on $227$ external/field images and a $50$-image single-leaf cropping experiment proving that post-hoc digital cropping does not resolve domain shift and validating native optical single-leaf framing.
  4. A transparent, deterministic **14-Day Antecedent Environmental Engine** and **Multimodal Composite Risk Index (CRI)** grounded in TNAU/ICAR-IISR literature.

---

## II. RELATED WORK
- **Turmeric Leaf Disease Classification**: Survey of traditional image processing and deep learning classifiers on turmeric datasets; predominance of standard ResNet/VGG models without out-of-distribution handling.
- **Lightweight CNN Backbones**: EfficientNet-B0 (compound scaling) and MobileNetV2 (inverted residuals) for mobile edge inference in low-resource agricultural hardware.
- **Ensemble Prediction in Agriculture**: Soft-voting late fusion and probability blending across complementary convolutional topologies.
- **Out-of-Distribution (OOD) Detection in Vision**: Softmax thresholding vs. energy-based models vs. distance-based feature-space Mahalanobis methods; handling covariate and semantic shift.
- **Environmental & Agrometeorological Risk Modeling**: Historical microclimate threshold models, leaf wetness duration (LWD) estimations, and late-fusion multimodal heuristics.
- **The Exact Gap Addressed**: Combining clean-label verified CNN backbones, calibrated Mahalanobis OOD gating, domain shift stress-testing, and an antecedent biophysical rule engine into a unified, transparent decision-support system.

---

## III. MATERIALS AND METHODS

### 3.1 Overall System Architecture
- Comprehensive dataflow: Preprocessing $\rightarrow$ Penultimate 1280-D Feature Extraction $\rightarrow$ Mahalanobis Gate ($\tau_{98} = 63.10$) $\rightarrow$ Hybrid Soft-Voting ($\alpha = 0.50$) $\rightarrow$ Environmental 14-Day Transformer $\rightarrow$ Late-Fusion Multimodal CRI $\rightarrow$ Agronomic Advisory.

### 3.2 Dataset and Data Preparation
- **Dataset 01**: Mendeley Data repository (`DOI: 10.17632/jtttfbx342.1`), $865$ single-leaf macro photographs.
- **Class Taxonomy**: `Aphids` ($221$), `Blotch` ($238$), `Healthy` ($213$), `Leaf Spot` ($193$).
- **Deterministic Stratified Partitioning**: Training ($606$, $70.06\%$), Validation ($130$, $15.03\%$), Internal Test ($129$, $14.91\%$).
- **Clean-Label Audit**: Systematic visual review identified $3$ mislabeled samples in training (`leaf_spot_(141).jpg`, `(142).jpg`, `(144).jpg` — spot-free lamina).
- **Clean Training Set**: Retrained on $603$ noise-free images; validation ($130$) and test ($129$) remained untouched.

### 3.3 EfficientNet-B0 (Clean Backbone)
- Primary high-capacity backbone with compound coefficient scaling.
- Input: $224 \times 224 \times 3$, ImageNet normalization.
- Output: 1280-D global average pooled embedding followed by `Dropout(0.3)` and `Linear(1280 -> 4)`.

### 3.4 MobileNetV2 (Secondary Backbone)
- Edge-optimized inverted residual network with linear bottlenecks.
- Input: $224 \times 224 \times 3$, ImageNet normalization.
- Output: 1280-D global average pooled embedding followed by `Dropout(0.3)` and `Linear(1280 -> 4)`.

### 3.5 Hybrid Soft-Voting Ensemble
- Late-fusion soft-voting formulation:
  $$\hat{P}_{\text{hybrid}} = \alpha \cdot P_{\text{Clean\_EffNet-B0}} + (1 - \alpha) \cdot P_{\text{MobileNetV2}}, \quad \text{with } \alpha = 0.50$$
- Justification: Probability fusion combines the high discriminatory power of EfficientNet-B0 with MobileNetV2 feature smoothing.

### 3.6 Mahalanobis OOD Safeguard
- Penultimate feature vector $\mathbf{z}(\mathbf{x}) \in \mathbb{R}^{1280}$ extracted from frozen Clean EfficientNet-B0.
- Class-conditional centroids $\boldsymbol{\mu}_c$ ($c \in \{0,1,2,3\}$) fitted on $603$ clean training samples.
- Regularized covariance matrix inverted via Ledoit-Wolf shrinkage ($\gamma = 0.0952$): $\boldsymbol{\Sigma}_{\text{LW}}^{-1} \in \mathbb{R}^{1280 \times 1280}$.
- Minimum Mahalanobis distance metric:
  $$D_M(\mathbf{x}) = \min_{c \in \{0,1,2,3\}} \sqrt{(\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)^T \boldsymbol{\Sigma}_{\text{LW}}^{-1} (\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)}$$
- Calibration: Decision threshold $\tau_{98} = 63.10$ calibrated at $P_{98}$ on untouched $130$-image validation set.
- Decision Rule: If $D_M(\mathbf{x}) \le 63.10 \implies \text{Admit to Classifier}$; else $\text{OOD\_REJECTED}$ (confidence $0.0\%$).

### 3.7 Environmental Risk Engine
- Microclimate input vector: Temperature ($T$), Relative Humidity ($\text{RH}$), Dew point depression proxy ($(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$), Precipitation, Soil Moisture, Sunlight Duration, Wind Speed, Days After Planting ($\text{DAP}$). (Soil pH isolated to soil chemistry).
- Evidence Base: $105,120$ hourly ERA5-Land records ($2021\text{–}2023$) across $4$ Tamil Nadu districts (Erode, Coimbatore, Salem, Dharmapuri) linked to $12$ candidate historical disease records ($8$ quantitative PDI).
- Deterministic 14-Day Biophysical Accumulators: `hours_rh_ge_80pct`, `hours_temp_favorable_22_32C`, `hours_dew_condensation_proxy`, `cumulative_rainfall_14d_mm`, `rainfall_days_14d_count`.
- Formal status: Explicitly categorized as a **transparent, rule-based heuristic decision-support baseline** (0 ML black-box weights).

### 3.8 Multimodal Composite Risk Index (CRI)
- Exact implemented Late-Fusion Formula:
  $$\text{CRI} = \begin{cases} 
  \text{round}\left(0.45 \cdot \text{Confidence}_{\text{visual}} + 0.55 \cdot \text{Score}_{\text{env}}\right) & \text{if Disease Detected} \\ 
  \text{round}\left(0.42 \cdot \text{Score}_{\text{env}}\right) & \text{if Healthy and } \text{Score}_{\text{env}} \ge 70 \\ 
  \text{round}\left(0.50 \cdot (100 - \text{Confidence}_{\text{visual}}) + 0.20 \cdot \text{Score}_{\text{env}}\right) & \text{if Healthy and } \text{Score}_{\text{env}} < 70 
  \end{cases}$$
  $$\text{Non-Linear Escalation: If Disease Detected and } \text{Score}_{\text{env}} \ge 65 \implies \text{CRI} = \min(96, \max(78, \text{CRI}))$$
- Formal status: Explicitly identified as a **developmental decision-support heuristic score (0–100%)**, **NOT a formal mathematical probability**.

### 3.9 Agronomic Recommendation Layer
- Educational IPM advice aligned with TNAU CPPS and ICAR-IISR extension bulletins.
- Full bilingual English/Tamil (தமிழ்) localization.
- Safety disclaimers: Advisory non-prescriptive support; directs growers to local extension officers and product labels.

---

## IV. EXPERIMENTAL DESIGN

### 4.1 Internal Held-Out Evaluation ($N = 129$)
- Benchmark Clean EfficientNet-B0, MobileNetV2, and Hybrid Ensemble ($\alpha=0.50$) across Accuracy, Weighted Precision, Weighted Recall, Weighted F1-Score, and per-class Confusion Matrices.

### 4.2 OOD Benchmark Suite ($N = 50$)
- Evaluate Mahalanobis OOD detector on 5 distinct cohorts: (1) Anime/Cartoons ($10$), (2) UI/Documents ($10$), (3) Human Faces ($10$), (4) Non-crop Objects ($10$), (5) Non-turmeric Botanicals ($10$).

### 4.3 Real-Field Domain-Shift Stress Test ($N = 27$)
- Evaluate 27 uncurated field images (9 Healthy, 9 Blotch, 9 Dry Leaf) from Dataset 02 against the production OOD gate and diagnostic un-gated classifier.

### 4.4 Independent External Dataset Generalization ($N = 200$)
- Evaluate 200 images (100 Healthy, 100 Blotch, sampled under seed `42`) from Mendeley Dataset 02 (`DOI: 10.17632/g46dvrcvwn.2`) to assess multi-leaf whole-bush generalization.

### 4.5 Single-Leaf Digital Cropping Experiment ($N = 50$)
- Evaluate 50 paired images (25 Healthy, 25 Blotch) comparing raw whole-bush photos against tight single-leaf digital bounding-box crops to test post-hoc domain alignment.

### 4.6 Environmental Retrospective Consistency Analysis
- Evaluate 14-day antecedent biophysical feature extraction on ERA5-Land historical time-series against 12 candidate pathology observation windows.

---

## V. VERIFIED RESULTS (EXACT TABLES)

### Table 1: Primary Dataset Partitioning (Dataset 01, $N = 865$)
| Class Index | Class Name | Pathology Organism | Total Images | Train Partition (Clean) | Val Partition | Test Partition |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `0` | **Aphids** | *Aphis gossypii / Pentalonia nigronervosa* | 221 | 154 | 34 | 33 |
| `1` | **Blotch** | *Taphrina maculans* | 238 | 167 | 36 | 35 |
| `2` | **Healthy** | Intact foliar lamina | 213 | 149 | 32 | 32 |
| `3` | **Leaf Spot** | *Colletotrichum capsici / C. curcumae* | 193 | 133 *(3 excluded)* | 31 | 29 |
| **Total** | **All Classes** | — | **865** | **603** | **130** | **129** |

---

### Table 2: Model Performance Comparison on Internal Test Set ($N = 129$)
| Architecture | Test Accuracy (%) | Weighted Precision (%) | Weighted Recall (%) | Weighted F1-Score (%) | Macro F1-Score (%) | Test Error Count |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Clean EfficientNet-B0** | **99.22%** | **99.25%** | **99.22%** | **99.23%** | **99.23%** | **1 / 129** |
| **MobileNetV2 (Clean Test)** | **86.82%** | **88.66%** | **86.82%** | **86.91%** | **86.91%** | **17 / 129** |
| *MobileNetV2 (Baseline Table)\** | *93.02%* | *93.89%* | *93.02%* | *93.09%* | *93.09%* | *9 / 129* |
| **Clean Hybrid Ensemble ($\alpha=0.50$)** | **99.22%** | **99.25%** | **99.22%** | **99.23%** | **99.23%** | **1 / 129** |

*\*Note on Cross-Report Discrepancy: `86.82%` reflects the verified weighted evaluation from `clean_hybrid_evaluation.md`; `93.02%` reflects macro metrics from early baseline tables.*

---

### Table 3: Per-Class Benchmark Metrics (Clean Hybrid Ensemble, $N = 129$)
| Class Index | Pathology Category | Support ($N_c$) | True Positives | Precision (%) | Recall (%) | F1-Score (%) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| `0` | **Aphids** | 33 | 33 | 100.00% | 100.00% | 100.00% |
| `1` | **Blotch** | 35 | 34 | 100.00% | 97.14% | 98.55% |
| `2` | **Healthy** | 32 | 32 | 96.97% | 100.00% | 98.46% |
| `3` | **Leaf Spot** | 29 | 29 | 100.00% | 100.00% | 100.00% |
| **Total** | **All Classes** | **129** | **128** | **99.25%** | **99.22%** | **99.23%** |

---

### Table 4: Confusion Matrix (Clean Hybrid Ensemble, $N = 129$)
```
                     Predicted Class
               Aphids  Blotch  Healthy  Leaf Spot   Total
Actual Class
Aphids           33       0       0         0        33
Blotch            0      34       1         0        35
Healthy           0       0      32         0        32
Leaf Spot         0       0       0        29        29
---------------------------------------------------------
Total            33      34      33        29       129
```

---

### Table 5: Mahalanobis OOD Detector Benchmark Results ($N = 50$)
| Cohort Name | Domain Category | Sample Size ($N$) | Mean Distance ($\mu_{D_M}$) | Min Distance | Rejection Rate (%) | Classification Action |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **In-Domain Validation Leaves** | In-Domain | **130** | **43.05 ± 8.64** | **23.71** | **2.31%** *(3 False Rej)* | Accepted ($97.69\%$ TPR) |
| **Anime & Cartoons** | Far-OOD | 10 | 104.35 | 92.61 | **100.00% (10/10)** | OOD_REJECTED (Suppressed) |
| **UI, Code & Documents** | Far-OOD | 10 | 86.45 | 75.18 | **100.00% (10/10)** | OOD_REJECTED (Suppressed) |
| **Human Portraits & Faces** | Far-OOD | 10 | 98.44 | 90.87 | **100.00% (10/10)** | OOD_REJECTED (Suppressed) |
| **Unrelated Metallic Objects** | Far-OOD | 10 | 103.02 | 92.23 | **100.00% (10/10)** | OOD_REJECTED (Suppressed) |
| **Total Far-OOD Suite** | **Non-Leaf** | **40** | **98.07** | **75.18** | **100.00% (40/40)** | **100% Far-OOD Rejection Safety** |
| **Non-Turmeric Botanicals** | Near-OOD | 10 | 82.71 | 60.30 | **70.00% (7/10)** | *3 False Acceptances (Overlap)* |
| **Overall Benchmark Suite** | **All Categories** | **50** | **95.00** | **60.30** | **94.00% (47/50)** | **High Domain Selectivity** |

---

### Table 6: Real-Field Domain-Shift Stress Test Results ($N = 27$)
| Cohort Category | Sample Size ($N$) | Ground Truth | Mean Distance ($\mu_{D_M}$) | Distance Range | OOD Accepted ($D_M \le 63.10$) | OOD Rejected ($D_M > 63.10$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Healthy Leaf** | 9 | `Healthy` | 81.67 ± 6.78 | 67.17 – 89.53 | 0 (0.0%) | **9 (100.0%)** |
| **Leaf Blotch** | 9 | `Blotch` | 84.71 ± 4.29 | 79.86 – 93.27 | 0 (0.0%) | **9 (100.0%)** |
| **Dry Leaf** | 9 | `Unknown` | 74.58 ± 4.49 | 68.47 – 81.59 | 0 (0.0%) | **9 (100.0%)** |
| **Total Field Cohort** | **27** | — | **80.35 ± 6.34** | **67.17 – 93.27** | **0 (0.0%)** | **27 (100.0%)** |

---

### Table 7: Independent External Dataset Evaluation (Mendeley Dataset 02, $N = 200$)
| Evaluation Dimension | Healthy Sub-Cohort ($n = 100$) | Leaf Blotch Sub-Cohort ($n = 100$) | Combined Cohort ($N = 200$) |
| :--- | :---: | :---: | :---: |
| **Mahalanobis Distance Range ($D_M$)** | 65.42 – 104.06 | 70.36 – 100.82 | 65.42 – 104.06 |
| **Mean Mahalanobis Distance ($\mu_{D_M}$)** | 83.57 ± 8.21 | 84.57 ± 6.69 | **84.07 ± 7.50** |
| **Median Distance ($P_{50}$)** | 83.95 | 84.15 | 84.06 |
| **Production OOD Accepted ($D_M \le 63.10$)** | **0 / 100 (0.00%)** | **0 / 100 (0.00%)** | **0 / 200 (0.00%)** |
| **Production OOD Rejected ($D_M > 63.10$)** | **100 / 100 (100.00%)** | **100 / 100 (100.00%)** | **200 / 200 (100.00%)** |
| **Diagnostic Un-Gated Prediction: Healthy** | **100 (100.0%)** | 79 (79.0% misclassified) | 179 (89.5%) |
| **Diagnostic Un-Gated Prediction: Blotch** | 0 (0.0%) | **19 (19.0% correct)** | 19 (9.5%) |
| **Diagnostic Un-Gated Prediction: Leaf Spot** | 0 (0.0%) | 2 (2.0% misclassified) | 2 (1.0%) |
| **Diagnostic Un-Gated Prediction: Aphids** | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| **Diagnostic Blotch Precision (Un-Gated)** | N/A | **100.0% (19/19)** | 100.0% |

---

### Table 8: Single-Leaf Cropping Experiment Comparison ($N = 50$)
| Evaluation Metric | Original Whole-Bush ($N = 50$) | Single-Leaf Crop ($N = 50$) | Delta ($\Delta$) |
| :--- | :---: | :---: | :---: |
| **OOD Accepted ($D_M \le 63.10$)** | **0 / 50 (0.0%)** | **0 / 50 (0.0%)** | 0 |
| **OOD Rejected ($D_M > 63.10$)** | **50 / 50 (100.0%)** | **50 / 50 (100.0%)** | 0 |
| **Mean Mahalanobis Distance ($\mu_{D_M}$)** | **$82.88 \pm 7.85$** | **$84.56 \pm 8.00$** | **$+1.68$ units** |
| ├─ *Healthy Sub-Cohort ($n=25$)* | $\mu = 83.36 \pm 8.76$ | $\mu = 81.41 \pm 7.22$ | **$-1.95$ units** |
| └─ *Blotch Sub-Cohort ($n=25$)* | $\mu = 82.40 \pm 6.99$ | $\mu = 87.71 \pm 7.61$ | **$+5.32$ units** |
| **Distance Range ($D_M$)** | 66.02 – 97.43 | 67.58 – 101.40 | — |
| **Diagnostic Un-Gated Healthy Accuracy** | 25 / 25 (100.0%) | 25 / 25 (100.0%) | 0.0% |
| **Diagnostic Un-Gated Blotch Accuracy** | 3 / 25 (12.0%) | 3 / 25 (12.0%) | 0.0% |

---

### Table 9: Environmental Retrospective Consistency & Exploratory Associations ($n = 12$)
| Source ID | Institution / Publication | Region | Target Pathology | Documented Field Severity | 14-Day Antecedent Exposure Summary | Exploratory Association Status |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **SRC-02** | AICRPS Bhavanisagar Trials (2021) | Erode | *Colletotrichum capsici* | $38.5\% - 41.0\%$ PDI | Rain: $214.6\text{ mm}$, RH80: $184\text{ h}$, TempOpt: $242\text{ h}$ | Permissive ($r = +0.909$ on Rain subset) |
| **SRC-02** | AICRPS Bhavanisagar Trials (2022) | Erode | *Taphrina maculans* | $44.2\% - 52.6\%$ PDI | DewProxy: $118\text{ h}$, RH80: $192\text{ h}$, TempOpt: $268\text{ h}$ | Permissive ($r = +0.631$ on Dew subset) |
| **SRC-01** | TNAU CPPS Advisory (Nov 2022) | Coimbatore | *Colletotrichum capsici* | High Alert | Rain: $18\text{ rain days}$, Mean Temp: $24.8^\circ\text{C}$ | Consistent with splash dispersal |
| **SRC-04** | Madras Agricultural Journal (2021) | Salem | *Colletotrichum capsici* | $35.8\%$ PDI | Rain: $112.4\text{ mm}$, RH80: $146\text{ h}$ | Consistent with vegetative window |
| **SRC-01** | TNAU CPPS Surveillance (Oct 2023) | Dharmapuri | *Aphis gossypii* / Thrips | Outbreak Alert | Rain: $0.0\text{ mm}$ (Dry spell), Mean RH: $54.2\%$ | Consistent with pest dry-spell gate |

---

## VI. DISCUSSION

### 6.1 Demonstrated Findings (Firmly Grounded in Empirical Evidence)
1. **High In-Domain Discriminatory Power**: Clean EfficientNet-B0 achieves $99.22\%$ accuracy on the held-out single-leaf test set ($N=129$), with equal performance sustained under $0.50/0.50$ soft-voting hybrid ensemble.
2. **Absolute Non-Leaf Far-OOD Safety**: The Ledoit-Wolf regularized Mahalanobis distance metric reliably rejects $100\%$ ($40/40$) of anime drawings, UI documents, human faces, and non-crop objects.
3. **Domain Gating on Multi-Leaf Bush Photography**: The OOD gate safely intercepts $100\%$ ($227/227$) of raw whole-bush captures from Dataset 02 ($D_M \in [65.42, 104.06]$), preventing ungrounded predictions.
4. **Diagnostic Canopy Dilution Mechanism**: When the gate is bypassed, $79\%$ of whole-bush blotch captures are predicted as `Healthy` because small necrotic lesions are overwhelmed by surrounding green canopy pixels.
5. **Inefficacy of Digital Post-Hoc Cropping**: Cropping low-resolution sub-patches from whole-plant photos magnifies compression noise and pixelation, failing to recreate native optical macro quality.

### 6.2 Plausible Interpretations
- The Mahalanobis feature space naturally encodes high-frequency textural sharpness (leaf venation, stomatal borders) and color consistency; when distant canopy or digital compression alters this feature distribution, $D_M$ increases beyond $\tau_{98}$.
- The $100\%$ precision on un-gated Blotch predictions ($19/19$) indicates that when blotch features are recognized, the classifier has zero false-alarm confusion with healthy foliage.

### 6.3 Unvalidated Hypotheses (Requiring Future Multi-Season Trials)
- *Hypothesis 1*: Native macro photography captured directly via high-resolution mobile cameras using UI framing guides will achieve $D_M \le 63.10$ and restore $\ge 95\%$ diagnostic accuracy in the field.
- *Hypothesis 2*: 14-day antecedent microclimate indices derived from in-situ canopy IoT sensors correlate with real-time foliar lesion incubation rates more accurately than 2m open-air reanalysis data.

---

## VII. SCIENTIFIC LIMITATIONS

1. **Test Set Scale ($N = 129$)**: Computer vision metrics are derived from a single benchmark repository (Dataset 01) and require multi-regional expansion.
2. **Near-OOD Botanical Overlap ($30\%$)**: The OOD detector false-accepts $3/10$ non-turmeric botanical leaves due to shared plant cellular textures.
3. **Perspective Confinement**: System is strictly designed for **single-leaf macro photography**; it cannot diagnose from whole-plant bushes, canopy overviews, or aerial drone imagery.
4. **Digital Cropping Inadequacy**: Digital 2D bounding boxes cannot substitute for optical macro capture.
5. **Retrospective Microclimate Evidence ($n = 12$)**: The Environmental Risk Engine is an exploratory heuristic baseline, not a prospectively validated epidemiological prediction model.
6. **Heuristic Late Fusion**: The Multimodal CRI formula is an engineering decision-support heuristic, not a calibrated Bayesian probability.
7. **Absence of Object Detection / Segmentation**: The architecture contains dual classification CNNs; it does not contain YOLO, segmentation masks, or automated bounding-box detectors.

---

## VIII. CONCLUSION
This paper establishes **TurmeriCare AI** as a transparent, out-of-distribution safeguarded multimodal decision-support architecture for turmeric crop health. By integrating a clean-label Hybrid CNN ensemble ($99.22\%$ test accuracy) with a Ledoit-Wolf regularized Mahalanobis OOD safeguard ($\tau_{98} = 63.10$), the system achieves $100\%$ far-OOD safety and prevents false-confidence diagnoses on non-conforming whole-bush field captures. Through rigorous multi-cohort evaluation ($227$ external/field images and $50$ cropped pairs), we demonstrate the fundamental domain gap between whole-bush and single-leaf imagery and validate the necessity of native optical macro framing. Supported by an agrometeorological 14-day antecedent biophysical engine and late-fusion Composite Risk Index (CRI), TurmeriCare AI delivers an agronomically defensible, safety-conscious decision-support baseline for precision agriculture.

---

## IX. FUTURE WORK

1. **Prospective Field Validation in Tamil Nadu**: Deploy the mobile web interface across turmeric farms in Erode, Coimbatore, and Salem to collect native single-leaf field photographs with paired extension pathologist ground-truth labels.
2. **Multi-Crop Botanical Discriminator**: Expand the OOD feature space with multi-crop foliar embeddings (ginger, banana, sugarcane, weeds) to eliminate the $30\%$ near-OOD botanical false acceptance.
3. **In-Situ Canopy Sensor Telemetry**: Calibrate sub-canopy microclimate transfer functions using physical leaf wetness resistance grids and temperature loggers installed at $30\text{ cm}$ and $60\text{ cm}$ crop heights.
4. **Prospective Multimodal Risk Calibration**: Formulate and validate machine-learned Bayesian fusion weights against multi-season longitudinal Percent Disease Index (PDI) surveys.

---

## X. REPRODUCIBILITY SPECIFICATION

| Parameter / Asset | Exact Scientific Value / Specification |
| :--- | :--- |
| **Primary Benchmark Dataset** | Mendeley Data `DOI: 10.17632/jtttfbx342.1` ($865$ images) |
| **External Benchmark Dataset** | Mendeley Data `DOI: 10.17632/g46dvrcvwn.2` ($200$ images sampled) |
| **Deterministic Random Seed** | `seed = 42` (Applied to all data splits, samplings, and benchmarking scripts) |
| **Clean Training Set Size** | $603$ images ($3$ mislabeled leaf spot samples excluded) |
| **Validation Set Size** | $130$ images (Strictly used for OOD threshold calibration) |
| **Internal Test Set Size** | $129$ images (Strictly held-out for frozen benchmarking) |
| **EfficientNet-B0 Checkpoint** | `backend/checkpoints/efficientnet_b0_clean_best.pth` |
| **MobileNetV2 Checkpoint** | `backend/checkpoints/best_model.pth` |
| **Ensemble Late-Fusion Alpha** | $\alpha = 0.50$ (Equal soft-voting probability blend) |
| **OOD Statistics File** | `backend/checkpoints/ood_stats_clean.pt` |
| **OOD Shrinkage Intensity** | Ledoit-Wolf $\gamma = 0.0952$ |
| **Calibrated OOD Threshold** | $\tau_{98} = \mathbf{63.10}$ ($P_{98}$ percentile on $130$ validation leaves) |
| **Environmental Reanalysis Data** | ECMWF ERA5-Land ($105,120$ contiguous hourly records, $2021\text{–}2023$) |
| **Software Stack** | Python 3.10+, PyTorch 2.x, torchvision, FastAPI, React 18, Vite, TypeScript |

---

## CLAIMS TO AVOID (STRICT SCIENTIFIC INTEGRITY BOUNDARIES)

To maintain absolute scientific honesty and avoid manuscript rejection for overclaiming:

1. **DO NOT CLAIM** that TurmeriCare AI diagnoses diseases from whole-bush, canopy overview, or drone imagery.
2. **DO NOT CLAIM** that post-hoc digital cropping solves the whole-bush domain shift.
3. **DO NOT CLAIM** $100\%$ field generalization accuracy based on the external Mendeley dataset.
4. **DO NOT CLAIM** that the Environmental Risk Engine is a validated predictive machine-learning model.
5. **DO NOT CLAIM** that weather caused the disease (meteorological linkage is biophysical permissiveness).
6. **DO NOT CLAIM** that the Composite Risk Index (CRI) is a calibrated mathematical probability.
7. **DO NOT CLAIM** $100\%$ botanical discrimination against other agricultural crop species.
8. **DO NOT CLAIM** the implementation of YOLO, bounding-box detectors, instance segmentation, or vision transformers in the production system.

---

*Master IEEE Paper Outline finalized and archived under `research_results/IEEE_PAPER_MASTER_OUTLINE.md`.*
