# Curuma (TurmeriCare AI) — Final Research Validation Audit

**Document Status**: Final Research Audit & Technical Baseline  
**Target System**: Curuma Multimodal Turmeric Crop Intelligence & Risk Assessment  
**Audit Scope**: Dataset integrity, classification metrics, OOD domain safeguarding, environmental modeling, multimodal fusion, agronomic recommendations, and scientific limitations.

---

## 1. Dataset Audit & Data Partitioning

The confirmed computer vision pipeline operates strictly on **Dataset 01 (Original Turmeric Pathology Dataset)**:

* **Total Specimen Count**: 865 foliar images.
* **Target Classes (4 Pathology Categories)**:
  1. `Aphids` (*Pentalonia nigronervosa / Aphis gossypii*)
  2. `Blotch` (*Taphrina maculans*)
  3. `Healthy` (Clear foliar lamina)
  4. `Leaf Spot` (*Colletotrichum curcumae / Colletotrichum capsici*)
* **Fixed Data Split Protocol**:
  * **Training Set**: 606 images (70.06%) — used exclusively for backbone feature training and fitting OOD class centroids/covariance.
  * **Validation Set**: 130 images (15.03%) — used exclusively for hyperparameter tuning and OOD distance threshold calibration.
  * **Internal Held-Out Test Set**: 129 images (14.91%) — used strictly for final quantitative benchmarking.

---

## 2. Disease Classification Model Performance

Quantitative evaluation evaluated on the untouched **Internal Test Set ($N = 129$)**:

### Summary Metrics Table

| Model Architecture | Accuracy (%) | Macro Precision (%) | Macro Recall (%) | Macro F1-Score (%) |
| :--- | :---: | :---: | :---: | :---: |
| **MobileNetV2** | 93.02% | 93.89% | 93.02% | 93.09% |
| **EfficientNet-B0** | **99.22%** | **99.25%** | **99.22%** | **99.23%** |
| **Hybrid Ensemble ($\alpha = 0.50$)** | **99.22%** | **99.25%** | **99.22%** | **99.23%** |

### Confusion Matrices ($N = 129$)

#### Hybrid Ensemble ($\alpha = 0.50$):
$$\hat{P}_{\text{hybrid}} = 0.50 \cdot P_{\text{EfficientNet}} + 0.50 \cdot P_{\text{MobileNetV2}}$$

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

Matrix array:
```python
[[33,  0,  0,  0],
 [ 0, 34,  1,  0],
 [ 0,  0, 32,  0],
 [ 0,  0,  0, 29]]
```

### Per-Class Performance Breakdown (Hybrid Ensemble)

| Class | True Positives | Total Actual | Precision (%) | Recall (%) | F1-Score (%) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Aphids** | 33 | 33 | 100.00% | 100.00% | 100.00% |
| **Blotch** | 34 | 35 | 100.00% | 97.14% | 98.55% |
| **Healthy** | 32 | 32 | 96.97% | 100.00% | 98.46% |
| **Leaf Spot** | 29 | 29 | 100.00% | 100.00% | 100.00% |

### Key Classification Finding:
* **No Ensemble Superiority**: The Hybrid Ensemble ($\alpha=0.50$) achieved performance identical to standalone EfficientNet-B0 ($99.22\%$ accuracy, $128/129$ correct). Soft-voting late fusion provided feature smoothing but did not increase test set accuracy beyond EfficientNet-B0.

---

## 3. Out-of-Distribution (OOD) Domain Safeguard

To resolve closed-world Softmax vulnerability where non-crop images (anime, UI screens, faces) were assigned arbitrary disease labels, a **Mahalanobis Feature-Space Safeguard** was implemented.

### Mathematical Formulation
* **Embeddings**: Extracted from frozen `EfficientNet-B0` penultimate layer ($\mathbf{z}(\mathbf{x}) \in \mathbb{R}^{1280}$).
* **Centroids & Regularization**:
  * Centroids $\boldsymbol{\mu}_c$ computed strictly on the $606$ Training images.
  * Covariance regularized via Ledoit-Wolf shrinkage ($\gamma = 0.0860$) to ensure well-conditioned inversion of the $1280 \times 1280$ matrix.
* **Minimum Distance**:
  $$D_M(\mathbf{x}) = \min_{c \in \{0,1,2,3\}} \sqrt{(\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)^T \boldsymbol{\Sigma}_{\text{LW}}^{-1} (\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)}$$
* **Calibrated Threshold**: $\tau_{98} = 61.97$ ($P_{98}$ on the untouched $130$-image validation set).

### OOD Benchmark Empirical Results ($N = 50$)

| Benchmark Cohort | Sample Count ($N$) | Mean Distance ($D_M$) | Distance Range | Rejection Rate (%) | Classification Action |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **In-Domain Validation Leaves** | **130** | **45.13** | **22.93 – 73.20** | **2.31%** *(3 False Rejections)* | Accepted ($97.69\%$ In-Domain TPR) |
| **Anime / Cartoon Drawings** | 10 | 115.03 | 97.17 – 142.18 | **100.00% (10/10)** | **OOD_REJECTED** (Disease suppressed) |
| **Document / Code / UI** | 10 | 103.12 | 92.22 – 115.91 | **100.00% (10/10)** | **OOD_REJECTED** (Disease suppressed) |
| **Human Portraits / Faces** | 10 | 98.89 | 90.28 – 109.30 | **100.00% (10/10)** | **OOD_REJECTED** (Disease suppressed) |
| **Unrelated Metallic Objects** | 10 | 121.97 | 99.01 – 136.58 | **100.00% (10/10)** | **OOD_REJECTED** (Disease suppressed) |
| **Non-Turmeric Botanicals** | 10 | 78.90 | 54.14 – 114.01 | **60.00% (6/10)** | *4 False Acceptances (Botanical overlap)* |
| **Total Far-OOD (Non-leaf)** | **40** | **109.75** | **90.28 – 142.18** | **100.00% (40/40)** | **100% Far-OOD Safety Rejection** |
| **Total Benchmark Suite** | **50** | **103.58** | **54.14 – 142.18** | **92.00% (46/50)** | Offline Benchmark Rejection Rate |

*Note: The $92.00\%$ figure is an offline benchmark sample metric, not a certified production accuracy claim.*

---

## 4. Production System Verification

| Subsystem / Endpoint | Verification Scope | Status | Verified Behavior |
| :--- | :--- | :---: | :--- |
| **FastAPI Backend (`/api/health`)** | Engine status & OOD safeguard initialization | **PASS** | `status: "online"`, `ood_safeguard_enabled: true`, `ood_threshold: 61.97`. |
| **FastAPI Backend (`/api/model-info`)** | Architecture & normalization metadata | **PASS** | Exposes `Hybrid Ensemble`, `ensemble_alpha: 0.5`, `ImageNet Normalize`. |
| **FastAPI Backend (`/api/predict`)** | Live tensor inference with in-domain leaf | **PASS** | Returned `Leaf Spot` ($76.3\%$), $D_M = 23.56 \le 61.97$ (`IN_DOMAIN`). |
| **FastAPI Backend (`/api/predict`)** | OOD input gating (Anime / Object) | **PASS** | Returned `Non-Turmeric / Out-of-Domain` ($D_M > 99.0$), `confidence: 0.0%`, classification bypassed. |
| **API Unit Test Suite (`test_api.py`)** | Automated regression & boundary tests | **PASS** | 7/7 test assertions passed (Health, Info, Valid leaf, OOD box, Corrupt, Empty, Bad ext). |
| **Real Image Test Suite (`test_real_images.py`)** | Dataset 01 classes against live server | **PASS** | 4/4 pathology classes validated with $100\%$ schema and distribution compliance. |
| **Frontend Production Build (`npm run build`)** | TypeScript & Vite bundling | **PASS** | Bundled in $5.68\text{s}$ with zero errors. |
| **Browser UI End-to-End Flow** | Live client validation across full pipeline | **PASS** | Valid leaves render predictions; OOD images render clear `Unsupported Image` alert state without fake disease names. |

---

## 5. Environmental Risk Engine Audit

### Implemented Logic
Implemented in [`src/utils/researchRiskEngine.ts`](file:///d:/curuma/src/utils/researchRiskEngine.ts) and [`src/utils/riskCalculator.ts`](file:///d:/curuma/src/utils/riskCalculator.ts):
* Ingests: Temperature ($^\circ\text{C}$), Relative Humidity ($\%RH$), Rainfall ($\text{mm}$), Leaf Wetness ($\%$), Soil Moisture ($\%$), Soil pH, and Days After Planting ($\text{DAP}$).
* Evaluates piecewise susceptibility functions targeting fungal spore germination and pest aggregation.

### Scientific Characterization of Components:
1. **Literature-Supported Epidemiological Ranges**:
   * *Colletotrichum capsici* (Leaf Spot): High humidity ($>75\% RH$) and warm temperatures ($25\text{--}30^\circ\text{C}$) as primary drivers for conidial germination (aligned with published ICAR-IISR and TNAU agronomic bulletins).
   * *Taphrina maculans* (Leaf Blotch): Prolonged morning leaf wetness and warm-humid cycles as primary incubation factors.
2. **Heuristic / Prototype Elements**:
   * Linear summation weights (e.g., $+28 \cdot \frac{RH - 70}{30}$, $+25 \cdot \text{wetness factor}$) represent **heuristic engineering approximations**, not field-calibrated dynamical differential equation models (e.g. non-mechanistic SIR models).
   * Environmental risk scores evaluate **microclimate suitability / disease favorability**, not confirmed active field outbreaks.

---

## 6. Multimodal Fusion Engine Audit

### Implemented Formula
Implemented in [`src/utils/riskCalculator.ts`](file:///d:/curuma/src/utils/riskCalculator.ts#L219-L293):

$$\text{Composite Risk Index (CRI)} = \begin{cases} 
\text{round}\left(0.45 \cdot \text{Confidence}_{\text{visual}} + 0.55 \cdot \text{Risk}_{\text{env}}\right) & \text{if Disease Detected} \\ 
\text{round}\left(0.42 \cdot \text{Risk}_{\text{env}}\right) & \text{if Healthy and } \text{Risk}_{\text{env}} \ge 70 \\ 
\text{round}\left(0.50 \cdot (100 - \text{Confidence}_{\text{visual}}) + 0.20 \cdot \text{Risk}_{\text{env}}\right) & \text{if Healthy and } \text{Risk}_{\text{env}} < 70 
\end{cases}$$

### Risk Tiers:
* **Low Risk**: $\text{CRI} \le 35$
* **Moderate Risk**: $35 < \text{CRI} < 68$
* **High / Severe Risk**: $\text{CRI} \ge 68$

### Scientific Characterization:
* **Prototype Heuristic Fusion**: The weights ($0.45 / 0.55$) and clamping conditions are **heuristic engineering decision rules** designed to demonstrate multimodal synergy in software. They must **not** be cited as statistically optimized Bayes-optimal fusion weights.

---

## 7. Agronomic Recommendations Audit

* **Nature of Guidance**: Derived from standard Indian Council of Agricultural Research (ICAR-IISR) and Tamil Nadu Agricultural University (TNAU) extension package of practices.
* **Integrated Pest Management (IPM)**: Biological biocontrols (e.g. *Trichoderma viride* @ 4g/kg seed or 2.5 kg/ha in soil, *Pseudomonas fluorescens* foliar spray 0.2%, Neem oil 3%) vs. chemical intervention (Mancozeb 0.25%, Carbendazim 0.1%).
* **Scope Constraint**: Recommendations provide standard educational agricultural extension guidance and do not constitute certified prescriptive chemical efficacy trials.

---

## 8. Explicit Scientific Limitations & Boundaries

To preserve strict research honesty, the following constraints are formally acknowledged:

1. **Test Set Scale**: The computer vision benchmark was evaluated on an internal held-out test set of $N = 129$ images. While statistically sound for Dataset 01, it is not an exhaustive multi-regional field benchmark.
2. **OOD Benchmark Scope**: The OOD evaluation suite consists of $N = 50$ benchmark images. While it demonstrates $100\%$ far-OOD separation on non-leaf images, broader large-scale evaluations on public benchmarks (e.g. ImageNet-O, OpenOOD) are required before formal academic publication.
3. **Near-OOD Botanical Overlap**: Non-turmeric botanical foliage (autumn leaves, bark, non-crop flowers) exhibited $40\%$ false acceptance ($4/10$) due to shared plant cellular textures. Distinguishing turmeric leaves from ginger, banana, or weed leaves requires dedicated multi-crop botanical training.
4. **No Prospective Clinical Field Trials**: The multimodal risk engine has not undergone multi-season prospective clinical field validation with in-situ automated IoT weather stations.
5. **No Segmentation / Object Detection**: The confirmed methodology utilizes dual convolutional classification backbones (EfficientNet-B0 + MobileNetV2) and **does not include YOLO, instance segmentation, or bounding-box lesion localization models**.
