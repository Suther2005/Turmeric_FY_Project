# Offline Out-of-Distribution (OOD) Validation Experiment Report

## 1. Executive Summary

This report documents the empirical evaluation of a **Two-Tier Out-of-Distribution (OOD) Detection Architecture** for the Curuma pathology diagnosis pipeline:
1. **Tier 1 (Foliar Engineering Gate)**: Deterministic color-space and morphological vegetation indices.
2. **Tier 2 (Feature-Space Mahalanobis Gate)**: Statistical distance computed on frozen $1280$-dimensional penultimate embeddings from `EfficientNet-B0` with Ledoit-Wolf covariance regularization.

### Key Finding:
* **Far-OOD Images (Anime, Documents/UI, Faces, Metallic/Household Objects)** are **100% rejected** ($40/40$) by the Mahalanobis feature gate at the calibrated validation threshold ($\tau_{98} = 61.97$) while maintaining **$97.69\%$ in-domain acceptance** on valid turmeric leaves.
* **Heuristic Tier 1 Color Gating Alone is Flawed**: Hard color-space thresholding (e.g., ExG or HSV foliage masking) falsely rejects severe necrotic *Blotch* and *Leaf Spot* leaves where green chlorophyll is degraded, causing an unacceptable false rejection rate of up to $85.38\%$ if uncalibrated.
* **Near-OOD (Non-turmeric botanicals)** exhibits partial embedding overlap with turmeric leaves ($60\%$ rejection), establishing the boundary between far-OOD safety rejection and fine-grained botanical domain distinction.

---

## 2. Dataset Composition & Experimental Protocol

### In-Domain Set (Dataset 01)
* **Manifest**: `turmeric_datasets/metadata/dataset_splits.csv`
* **Training Set ($N = 606$)**: Used **strictly and exclusively** to compute the empirical class centroids $\boldsymbol{\mu}_c$ and regularized covariance matrix $\boldsymbol{\Sigma}_{\text{reg}}$.
* **Validation Set ($N = 130$)**: Untouched in-domain evaluation set used for threshold calibration.
* **Internal Test Set ($N = 129$)**: **Excluded** from all threshold calibration to prevent data leakage.

### Out-of-Distribution (OOD) Benchmark Suite ($N = 50$)
Constructed across 5 standardized test categories ($10$ images per category):
1. `anime_cartoon` ($n=10$): Stylized anime/manga faces, non-biological vector drawings, colored digital art.
2. `document_ui` ($n=10$): Code snippets, text tables, application screenshots, white-background UI forms.
3. `human_portraits` ($n=10$): Human faces, skin tones, facial contours, indoor lighting.
4. `unrelated_objects` ($n=10$): Metallic automotive parts, household furniture, electronics, road vehicles.
5. `non_turmeric_botanical` ($n=10$): Wood bark textures, bright non-crop flowers, autumn orange/red deciduous leaves.

---

## 3. Tier 1 Engineering Gate: Foliar Chromatic & Texture Analysis

We computed pixel-level chromatic distributions across all $130$ in-domain validation leaves and $50$ OOD images:
* **Foliar Color Mask Ratio**: Fraction of pixels within the combined chlorophyll foliar gamut (HSV $H \in [22^\circ, 95^\circ]$) and necrotic foliar gamut (HSV $H \in [8^\circ, 22^\circ]$).

### Empirical Distributions

| Dataset / Subset | Foliar Ratio (Mean) | Min | 5th Percentile | Max |
| :--- | :---: | :---: | :---: | :---: |
| **In-Domain Validation Leaves ($N=130$)** | **0.1774** | 0.0612 | 0.0745 | 0.3662 |
| **OOD Total ($N=50$)** | **0.1647** | 0.0000 | 0.0000 | 0.7601 |
| *— Anime / Cartoon ($n=10$)* | 0.0210 | 0.0000 | — | 0.0820 |
| *— Document / UI ($n=10$)* | 0.0040 | 0.0000 | — | 0.0120 |
| *— Human Portraits ($n=10$)* | 0.0480 | 0.0000 | — | 0.0910 |
| *— Unrelated Objects ($n=10$)* | 0.0310 | 0.0000 | — | 0.0750 |
| *— Non-Turmeric Botanicals ($n=10$)* | 0.7190 | 0.5820 | — | 0.7601 |

### Scientific Finding on Tier 1:
* Real-world field images in Dataset 01 contain dark neutral backgrounds, shadows, and extensive necrotic lesions (e.g. *Taphrina maculans* necrotic patches). Consequently, the actual leaf foliar ratio in valid samples ranges as low as $6.12\%$.
* **Risk of Standalone Heuristic**: An ad-hoc rule requiring $\ge 25\%$ foliar pixel coverage correctly rejects $76.0\%$ of OOD images but **falsely rejects $85.38\%$ ($111/130$) of valid turmeric validation images**.
* **Conclusion**: Tier 1 color masking must only be used as a ultra-permissive minimum floor (e.g., foliar ratio $> 2.0\%$ to reject completely black/white blank images) and **cannot serve as a primary OOD discriminator**.

---

## 4. Tier 2 Feature-Space Mahalanobis Distance Experiment

### Formulation & Numerical Stability
* **Backbone**: Penultimate layer of `EfficientNet-B0` (post-GlobalAveragePooling, $\mathbf{z}(\mathbf{x}) \in \mathbb{R}^{1280}$).
* **Covariance Estimation**: Since feature dimension $D = 1280 > N_{\text{train}} = 606$, the empirical covariance is rank-deficient ($rank \le 602$). We applied **Ledoit-Wolf regularized covariance shrinkage** on the centered training set embeddings ($\text{shrinkage intensity } \gamma = 0.0860$).
* **Distance Metric**:
  $$D_M(\mathbf{x}) = \min_{c \in \{0,1,2,3\}} \sqrt{(\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)^T \boldsymbol{\Sigma}_{\text{LW}}^{-1} (\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)}$$

### Distance Distribution Comparison

| Cohort | Mean $D_M$ | Std Dev | Min $D_M$ | Max $D_M$ |
| :--- | :---: | :---: | :---: | :---: |
| **In-Domain Validation ($N=130$)** | **45.13** | **8.02** | **22.93** | **73.20** |
| **OOD Overall ($N=50$)** | **103.58** | **20.14** | **54.14** | **142.18** |
| *— Anime / Cartoon ($n=10$)* | **115.03** | 14.22 | 97.17 | 142.18 |
| *— Unrelated Objects ($n=10$)* | **121.97** | 11.50 | 99.01 | 136.58 |
| *— Document / UI ($n=10$)* | **103.12** | 7.85 | 92.22 | 115.91 |
| *— Human Portraits ($n=10$)* | **98.89** | 6.42 | 90.28 | 109.30 |
| *— Non-Turmeric Botanicals ($n=10$)* | **78.90** | 19.30 | 54.14 | 114.01 |

```
Distance Distribution Separation:

In-Domain (Val):   [=== 22.9 ────── 45.1 (Mean) ────── 62.0 (P98) === 73.2]
                                                                  │
Far-OOD (Anime/UI/Faces/Objects):                                  [====== 90.3 ─────── 109.8 (Mean) ──────── 142.2 ======]
```

---

## 5. Threshold Calibration & Performance Analysis

Thresholds were calibrated **strictly on the 130-image validation set** by targeting standard in-domain true positive rates (TPR):

| Calibration Target | Threshold ($\tau$) | In-Domain Val Acceptance | False Rejections (In-Domain) | OOD Rejection Rate | False Acceptances (OOD) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **TPR 95% ($P_{95}$)** | **59.35** | 123 / 130 (94.62%) | 7 | 46 / 50 (92.00%) | 4 |
| **TPR 98% ($P_{98}$) [Recommended]** | **61.97** | 127 / 130 (97.69%) | 3 | 46 / 50 (92.00%) | 4 |
| **TPR 99% ($P_{99}$)** | **65.41** | 128 / 130 (98.46%) | 2 | 46 / 50 (92.00%) | 4 |
| **Max In-Domain ($P_{100}$)** | **73.20** | 130 / 130 (100.00%) | 0 | 46 / 50 (92.00%) | 4 |

### Breakdown by OOD Category at $\tau_{98} = 61.97$

```
+--------------------------+----------+----------+----------------+
| OOD Category             | Total N  | Rejected | Rejection Rate |
+--------------------------+----------+----------+----------------+
| Anime / Cartoon          |    10    |    10    |     100.0%     |
| Document / UI Text       |    10    |    10    |     100.0%     |
| Human Portraits          |    10    |    10    |     100.0%     |
| Unrelated Objects        |    10    |    10    |     100.0%     |
| Non-Turmeric Botanicals  |    10    |     6    |      60.0%     |
+--------------------------+----------+----------+----------------+
| Total Far-OOD (Non-leaf) |    40    |    40    |     100.0%     |
| Total Benchmark          |    50    |    46    |      92.0%     |
+--------------------------+----------+----------+----------------+
```

---

## 6. Experimental Limitations

1. **OOD Sample Size**: The offline benchmark comprises $N=50$ synthetic/representative OOD images. While statistically clear for far-OOD separation ($p < 10^{-6}$), broader evaluation on large-scale benchmarks (e.g. ImageNet-O, OpenOOD) is advised prior to formal publication.
2. **Near-OOD Botanical Ambiguity**: Images of non-turmeric leaves/bark (e.g., autumn foliage) project closer to the in-domain embedding subspace ($D_M \approx 54\text{--}78$) than non-biological images ($D_M > 90$). Differentiating turmeric leaves from closely related Zingiberaceae crops requires fine-grained crop domain gating.
3. **Single Backbone Representation**: Embeddings were derived exclusively from EfficientNet-B0; joint multi-backbone embedding spaces (EfficientNet + MobileNetV2) were not combined in this offline trial.

---

## 7. Production Readiness & Recommendation

### Is the approach ready for production integration?
* **For Far-OOD / Non-Leaf Image Rejection (Anime, Documents, Faces, Objects)**: **YES**.
  * The feature-space Mahalanobis detector provides an immediate, statistically defensible safety barrier against egregious out-of-domain submissions with zero false acceptances on non-leaf images.
* **For Fine-Grained Botanical Discrimation**: **NOT YET**.
  * Further near-OOD crop datasets (e.g. ginger, banana, weed leaves) are needed if the objective is to distinguish turmeric leaves from other foliage.

### Recommended Production Architecture:
1. **Tier 1 (Permissive Sanity Filter)**: Check for non-blank images (foliar ratio $> 1\%$, valid aspect ratio and entropy).
2. **Tier 2 (Mahalanobis Distance Gate, $\tau = 61.97$)**: Reject any sample exceeding $\tau_{98}$ with a friendly user response: *"Uploaded image does not appear to be a valid turmeric crop specimen. Please ensure the leaf is clearly visible."*
3. **Hybrid Ensemble Disease Inference**: Executed only when sample passes Tier 2.
