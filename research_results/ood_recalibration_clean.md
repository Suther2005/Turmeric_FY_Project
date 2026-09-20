# Mahalanobis Out-of-Distribution (OOD) Detector Recalibration

## 1. Recalibration Protocol & Feature-Space Setup

* **Model Checkpoint**: [`backend/checkpoints/efficientnet_b0_clean_best.pth`](file:///d:/curuma/backend/checkpoints/efficientnet_b0_clean_best.pth)
  * Pretrained EfficientNet-B0 retrained on the $603$-image clean manifest.
* **Feature Extraction**: $1280$-dimensional penultimate embeddings extracted before the classification head:
  $$\mathbf{z}(\mathbf{x}) = \text{Flatten}(\text{AvgPool}(\text{Features}(\mathbf{x}))) \in \mathbb{R}^{1280}$$
* **Class Centroid Estimation**:
  * Centroids $\boldsymbol{\mu}_c$ computed strictly on the $603$ clean Training images ($c \in \{0, 1, 2, 3\}$).
* **Covariance Estimation & Regularization**:
  * Ledoit-Wolf shrinkage fitted on centered clean training embeddings ($\mathbf{z} - \boldsymbol{\mu}_c$).
  * **Optimal Shrinkage Intensity**: $\gamma = 0.0952$
  * Inverted precision matrix: $\boldsymbol{\Sigma}_{\text{LW}}^{-1} \in \mathbb{R}^{1280 \times 1280}$
* **Distance Formulation**:
  $$D_M(\mathbf{x}) = \min_{c \in \{0,1,2,3\}} \sqrt{(\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)^T \boldsymbol{\Sigma}_{\text{LW}}^{-1} (\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)}$$
* **Calibration Protocol**:
  * Threshold $\tau_{98}$ calibrated exclusively on the $130$-image validation set ($P_{98}$ percentile).
  * The $129$-image internal test set remained **strictly excluded and untouched**.

---

## 2. In-Domain Validation Distance Distribution ($N = 130$)

| Statistic | Measured Value | Description |
| :--- | :---: | :--- |
| **Minimum ($D_{\min}$)** | **23.71** | Tightest in-domain cluster sample |
| **Maximum ($D_{\max}$)** | **69.78** | Widest in-domain foliar outlier |
| **Mean ($\mu$)** | **43.05** | Mean in-domain feature distance |
| **Standard Deviation ($\sigma$)** | **8.64** | Dispersion across validation images |
| **Median ($P_{50}$)** | **41.19** | Central tendency of valid leaves |
| **90th Percentile ($P_{90}$)** | **53.68** | 90% in-domain coverage |
| **95th Percentile ($P_{95}$)** | **57.16** | 95% in-domain coverage |
| **98th Percentile ($P_{98}$)** | **63.10** | **Calibrated In-Domain Threshold ($\tau_{98}$)** |
| **99th Percentile ($P_{99}$)** | **65.62** | 99% in-domain coverage |

---

## 3. Threshold Calibration & In-Domain Validation Results

* **Calibrated Decision Threshold ($\tau_{98}$)**: **`63.10`**
* **In-Domain Validation Acceptance**: **$127 / 130$ ($97.69\%$)**
* **False Rejection Count**: **$3 / 130$ ($2.31\%$)**

---

## 4. OOD Benchmark Evaluation Results ($N = 50$)

Evaluated against the standardized 50-image OOD benchmark across 5 cohorts:

| Cohort Name | Category Type | Sample Count ($N$) | Mean Distance ($\mu_{D_M}$) | Min Distance | Rejection Rate (%) | Classification Outcome |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`anime_cartoon`** | Far-OOD | 10 | 104.35 | 92.61 | **100.00% (10/10)** | **OOD_REJECTED** (Disease suppressed) |
| **`document_ui`** | Far-OOD | 10 | 86.45 | 75.18 | **100.00% (10/10)** | **OOD_REJECTED** (Disease suppressed) |
| **`human_portraits`** | Far-OOD | 10 | 98.44 | 90.87 | **100.00% (10/10)** | **OOD_REJECTED** (Disease suppressed) |
| **`unrelated_objects`** | Far-OOD | 10 | 103.02 | 92.23 | **100.00% (10/10)** | **OOD_REJECTED** (Disease suppressed) |
| **Total Far-OOD** | **Non-Botanical** | **40** | **98.07** | **75.18** | **100.00% (40/40)** | **100% Far-OOD Safety Rejection** |
| **`non_turmeric_botanical`** | Near-OOD | 10 | 82.71 | 60.30 | **70.00% (7/10)** | *3 False Acceptances (Botanical overlap)* |
| **Overall OOD Benchmark** | **All Categories** | **50** | **95.00** | **60.30** | **94.00% (47/50)** | **High Domain Selectivity** |

---

## 5. Comparison: Clean vs. Original OOD Detector Baseline

| Parameter / Metric | Original Baseline (`ood_stats.pt`) | Clean Detector (`ood_stats_clean.pt`) | Comparison / Impact |
| :--- | :---: | :---: | :--- |
| **Training Basis** | 606 images (3 noisy labels) | **603 clean images** (noise-free) | Cleaned feature space |
| **Ledoit-Wolf Shrinkage ($\gamma$)** | 0.0860 | **0.0952** | Well-conditioned covariance |
| **Validation Mean Distance** | 45.13 | **43.05** | Tighter in-domain cluster |
| **Calibrated Threshold ($\tau_{98}$)** | **61.97** | **63.10** | $+1.13$ calibration adjustment |
| **In-Domain Acceptance** | **97.69%** (127 / 130) | **97.69%** (127 / 130) | **Identical ($97.69\%$)** |
| **False Rejection Count** | 3 images (2.31%) | 3 images (2.31%) | **Identical ($3$ images)** |
| **Far-OOD Rejection (40 images)** | **100.00%** (40 / 40) | **100.00%** (40 / 40) | **Identical (100% safety)** |
| **Near-OOD Botanical Rejection** | 60.00% (6 / 10) | **70.00%** (7 / 10) | $+10.00\%$ ($+1$ botanical rejection) |
| **Overall Benchmark Rejection** | **92.00%** (46 / 50) | **94.00%** (47 / 50) | **$+2.00\%$ overall improvement** |

---

## 6. Checkpoint & File Storage Summary

* **New Clean OOD Statistics File**: [`backend/checkpoints/ood_stats_clean.pt`](file:///d:/curuma/backend/checkpoints/ood_stats_clean.pt)
* **Production OOD Statistics File**: [`backend/checkpoints/ood_stats.pt`](file:///d:/curuma/backend/checkpoints/ood_stats.pt) (Untouched)
* **Backend Source Code**: [`backend/model.py`](file:///d:/curuma/backend/model.py), [`backend/main.py`](file:///d:/curuma/backend/main.py) (Untouched)
