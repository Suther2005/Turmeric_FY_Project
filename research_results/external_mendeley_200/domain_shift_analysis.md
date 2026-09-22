# Scientific Domain Shift & Generalization Analysis
**Comparative Investigation of Feature-Space Distances, Image Framing, and Diagnostic Behavior**  
**Project**: Curuma / TurmeriCare AI Decision Support System  
**Artifact Path**: `research_results/external_mendeley_200/domain_shift_analysis.md`  
**Date**: 2026-09-20  

---

## 1. Executive Summary & Objective

This report provides a formal scientific investigation into the domain shift observed during the evaluation of external turmeric datasets, specifically:
- **Internal Validation Set** ($N = 130$, Clean single-leaf benchmark, Dataset 01)
- **Dataset 02 Field Sample** ($N = 27$, Uncurated field stress test)
- **External Mendeley 200 Cohort** ($N = 200$, 100 Healthy + 100 Leaf Blotch, DOI: `10.17632/g46dvrcvwn.2`)

The goal is to rigorously analyze the mathematical, morphological, and pathological factors governing the Mahalanobis Out-of-Domain (OOD) safeguard and the decoupled behavior of the Clean Hybrid Ensemble (`EfficientNet-B0` + `MobileNetV2`, $\alpha = 0.50$).

---

## 2. Quantitative Comparison of Mahalanobis Distances

The Mahalanobis distance ($D_M$) measures the minimum regularized distance in the 1280-dimensional penultimate embedding space of Clean EfficientNet-B0 from the four training class centroids:

$$D_M(\mathbf{x}) = \min_{c \in \{0,1,2,3\}} \sqrt{(\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)^T \boldsymbol{\Sigma}_{\text{LW}}^{-1} (\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)}$$

### Cross-Cohort Statistical Comparison

| Dataset Cohort | Sample Count ($N$) | Minimum $D_M$ | Maximum $D_M$ | Mean $D_M$ ($\mu$) | Std Dev ($\sigma$) | Median ($P_{50}$) | Threshold ($\tau_{98}$) | Acceptance Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Internal Validation (In-Domain)** | **130** | **23.71** | **69.78** | **43.05** | **8.64** | **41.19** | **63.10** | **97.69% (127/130)** |
| **Dataset 02 Field Sample** | **27** | **67.17** | **93.27** | **80.35** | **6.34** | **80.32** | **63.10** | **0.00% (0/27)** |
| **External Mendeley 200 (Total)** | **200** | **65.42** | **104.06** | **84.07** | **7.50** | **84.06** | **63.10** | **0.00% (0/200)** |
| ├─ *External Healthy Subset* | 100 | 65.42 | 104.06 | 83.57 | 8.21 | 83.95 | 63.10 | 0.00% (0/100) |
| └─ *External Blotch Subset* | 100 | 70.36 | 100.82 | 84.57 | 6.69 | 84.15 | 63.10 | 0.00% (0/100) |
| **Far-OOD Benchmark (Non-Botanical)** | **40** | **75.18** | **118.42** | **98.07** | **10.12** | **98.34** | **63.10** | **0.00% (0/40)** |

```
Mahalanobis Distance Spectrum (DM):
0 ────────── 23.71 ────────────── 43.05 ─────────── 63.10 ──── 65.42 ────────── 84.07 ────────── 98.07 ──── 118.4+
              [ In-Domain Validation Distribution ]   ▲         [ External Field Cohort ]    [ Far-OOD ]
                                                    tau_98 (Threshold)
```

### Key Statistical Observations
1. **Clear Domain Boundary**: The in-domain validation distribution is tightly centered at $\mu = 43.05$, with $97.69\%$ of valid single-leaf samples falling below $\tau_{98} = 63.10$.
2. **Shift Magnitude**: Both external field evaluations (Dataset 02 $N=27$ at $\mu = 80.35$ and Mendeley 200 at $\mu = 84.07$) exhibit a statistically significant positive shift ($\Delta \mu \approx +41.0$ units, $p < 10^{-15}$).
3. **Intermediate Distance Regime**: The external field captures sit in an intermediate distance band ($65.42 \le D_M \le 104.06$), lying strictly above the single-leaf in-domain threshold ($63.10$) but below extreme non-botanical outliers (such as anime/cartoons at $\mu = 104.35$ and abstract objects at $\mu = 103.02$).
4. **Symmetric Shift Across Classes**: The distribution shift affects both Healthy ($\mu = 83.57$) and Blotch ($\mu = 84.57$) almost identically, indicating that the domain divergence is structural rather than class-specific.

---

## 3. Image Characteristics & Morphological Comparison

To understand the physical origin of this feature divergence, we examine the visual and environmental properties across datasets:

| Image Characteristic | Internal Dataset (Dataset 01) | External Mendeley Dataset (Dataset 02) | Impact on Feature Representation |
| :--- | :--- | :--- | :--- |
| **Framing Strategy** | **Single-Leaf Macro Close-up** | **Whole-Plant / Canopy Plantation** | In Dataset 01, a single leaf lamina fills $70–90\%$ of the frame. In Dataset 02, individual leaves occupy only $10–25\%$ of the frame within a multi-leaf bush. |
| **Resolution & Aspect Ratio** | Variable aspect ratios ($1000–4000\text{ px}$ original) | Standardized $1000 \times 1000$ square | Preprocessing crops center $224 \times 224$ from resized images; wide multi-leaf layouts lose peripheral leaves or compress complex canopy structures into coarse receptive fields. |
| **Background Composition** | Plain / Neutral / Clean background | Exposed farm soil, straw mulch, weeds, tubing, sky | Background soil and ground cover contribute non-foliar visual tokens to convolutional filters in early and intermediate layers. |
| **Relative Lesion Scale** | **Macro Lesion Resolution** ($100–500\text{ px}$) | **Micro Lesion Scale** ($15–50\text{ px}$) | Blotch lesions on full-bush shots are small and localized, whereas single-leaf macro shots present detailed lesion margins and halo rings. |
| **Photometric / Lighting** | Diffuse, relatively uniform lighting | Direct outdoor sunlight, harsh shadows, leaf glint | Specular reflections and high-contrast ambient shadows alter gradient orientations in convolutional backbones. |
| **Geographical / Cultivar** | Pabna district spice fields | Jamalpur region plantation | Potential micro-variations in leaf thickness, venation contrast, or cultivar morphology across Bangladeshi agricultural zones. |

---

## 4. Diagnostic Un-Gated Classifier Analysis ($N = 200$)

When the Mahalanobis OOD gate is bypassed to inspect the raw Softmax outputs of the classification head, the behavior reveals critical insights into how the backbones perceive whole-plant imagery.

### Separate Quantification by Ground-Truth Class

```
                            DIAGNOSTIC UN-GATED PREDICTIONS (HYBRID ENSEMBLE)
                                             Predicted Class
                    Healthy              Blotch            Leaf Spot           Aphids           Total
True Healthy         100 (100.0%)           0 (0.0%)           0 (0.0%)          0 (0.0%)         100
True Blotch           79  (79.0%)          19 (19.0%)          2 (2.0%)          0 (0.0%)         100
```

### Model-by-Model Un-Gated Breakdown

| Model Backbone | Ground Truth Class | Predicted `Healthy` | Predicted `Blotch` | Predicted `Leaf Spot` | Predicted `Aphids` | Un-Gated Accuracy |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Hybrid Ensemble ($\alpha = 0.50$)** | `Healthy` ($n=100$) | **100** | 0 | 0 | 0 | **100.0%** |
| | `Blotch` ($n=100$) | 79 | **19** | 2 | 0 | **19.0%** |
| **EfficientNet-B0 (Clean)** | `Healthy` ($n=100$) | **90** | 0 | 1 | 9 | **90.0%** |
| | `Blotch` ($n=100$) | 53 | **41** | 6 | 0 | **41.0%** |
| **MobileNetV2** | `Healthy` ($n=100$) | **100** | 0 | 0 | 0 | **100.0%** |
| | `Blotch` ($n=100$) | 90 | **7** | 3 | 0 | **7.0%** |

### Detailed Findings by Class

#### 1. External Healthy Foliage ($n = 100$)
- **Hybrid Performance**: **$100 / 100$ ($100.0\%$)** classified as `Healthy` with high mean confidence ($67.3\%$).
- **Interpretation**: When presented with whole-plant green foliage, the network's convolutional feature activations strongly align with the `Healthy` class representation. Green canopy texture and chlorosis absence are recognized consistently even in whole-plant perspectives.

#### 2. External Leaf Blotch Foliage ($n = 100$)
- **Hybrid Performance**: **$19 / 100$ ($19.0\%$)** classified as `Blotch`, **$79 / 100$ ($79.0\%$)** classified as `Healthy`, and **$2 / 100$ ($2.0\%$)** as `Leaf Spot`.
- **The "Canopy Green Dilution" Mechanism**: On an uncurated full-bush image, the necrotic blotches occupy only a minor percentage of the image area ($5–15\%$). The remaining $85–95\%$ of the image consists of surrounding healthy green leaves. Because the convolutional receptive field aggregates features across the entire frame, the dominant activation vector corresponds to healthy green tissue, diluting the localized necrotic signal.
- **Blotch Specificity**: Notably, when the un-gated Hybrid Ensemble did fire on `Blotch` ($n = 19$), it achieved **$100\%$ precision** (0 false positive Blotch predictions on the 100 Healthy images).

---

## 5. Decoupling Error Attribution: Safeguard Gate vs. Classification Head

It is essential to maintain strict scientific separation between the two functional layers of the architecture:

```
                  ┌──────────────────────────────────────────────┐
                  │          INPUT IMAGE (Foliar Query)          │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    STAGE 1: MAHALANOBIS DOMAIN SAFEGUARD     │
                  │   Evaluates: Global feature conformity       │
                  │   Threshold: tau_98 = 63.10                  │
                  └──────────────┬───────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
      [ In-Domain (DM <= 63.10) ]     [ Out-of-Domain (DM > 63.10) ]
                 │                               │
                 ▼                               ▼
┌──────────────────────────────────┐ ┌──────────────────────────────────┐
│   STAGE 2: CLASSIFICATION HEAD   │ │        SAFETY INTERCEPTION       │
│ Evaluates: Pathological category │ │ Action: Head bypassed            │
│ Expected input: Single lamina    │ │ Output: OOD_REJECTED (0.0% conf) │
│ Output: Calibrated probabilities │ │ Reason: Non-conforming domain    │
└──────────────────────────────────┘ └──────────────────────────────────┘
```

1. **The OOD Safeguard is Functioning as Intended**:
   - The rejection of external whole-bush images is **not a classifier failure**; it is the safeguard correctly recognizing that the input representation departs from the single-leaf distribution on which diagnostic heads were calibrated.
   - Bypassing the gate would expose farmers to canopy green dilution errors ($79\%$ of whole-bush blotch images falsely called healthy).

2. **The Classifier Head is Conditioned on Single-Leaf Inputs**:
   - The diagnostic accuracy of the Clean Hybrid Ensemble ($94.57\%$ internal test accuracy) depends on localized lesion resolution that is only present when a farmer photographs a single leaf up-close.

---

## 6. Scientific Attribution & Multi-Factor Rationale

While framing differences (whole-plant vs. single-leaf) are the most visible distinction between datasets, scientific rigor requires recognizing that framing is part of a **compound multi-factor domain shift**:

1. **Scale / Resolution**: Small distant lesions vs. macro foliar details.
2. **Background Noise**: Complex soil, straw, and irrigation tubing contributing non-target edge gradients.
3. **Lighting & Sensor Pipeline**: Variations in ambient solar angles, smartphone ISP tone-mapping, and compression artifacts.
4. **Plant Morphology**: Potential variation in turmeric cultivar leaf thickness and venation structure between agricultural regions.

Therefore, we do not claim framing is the sole causal explanation, but rather a primary compounding driver alongside environmental and photometric differences.

---

## 7. Operational Policy: No Premature Threshold Adjustment

> [!IMPORTANT]
> **Production Threshold Policy**:
> We explicitly **do NOT recommend altering the production threshold ($\tau_{98} = 63.10$)** at this time.
> 
> Raising the threshold artificially to admit whole-plant images would compromise domain selectivity, increase the false acceptance of non-turmeric botanical weeds and non-agricultural imagery, and expose users to the canopy dilution failure mode identified above.

---

## 8. Research Conclusions

### What Has Been Demonstrated
1. **Domain Boundary Robustness**: The Mahalanobis OOD detector reliably separates curated single-leaf close-ups ($D_M \le 63.10$) from raw whole-plant plantation images ($D_M \in [65.42, 104.06]$).
2. **Canopy Dilution in Whole-Plant Blotch**: Single-leaf convolutional models applied to wide-angle whole-bush images suffer from severe feature dilution, misdiagnosing $79\%$ of un-gated blotch images as healthy.
3. **Validation of Single-Leaf Requirement**: The single-leaf constraint is a necessary prerequisite for high-precision turmeric disease diagnostics.

### What Has Not Yet Been Demonstrated
1. **Single-Leaf Cropping Transfer**: It has not yet been demonstrated whether extracting tight single-leaf bounding-box crops from Dataset 02 will shift their Mahalanobis distances into the in-domain zone ($D_M \le 63.10$).
2. **Tamil Nadu Field Transfer**: Generalization to genuine single-leaf macro photographs collected from Tamil Nadu farmers across local soil and lighting conditions remains to be prospectively validated.

### Recommended Next Experiments
1. **Experiment A (Single-Leaf Bounding-Box Cropping Benchmark)**:
   - Perform automated or manual single-leaf cropping on a sample of 50 `Healthy Leaf` and 50 `Leaf Blotch` images from Dataset 02.
   - Re-evaluate Mahalanobis distances and un-gated classification accuracy on the isolated leaf crops to test the hypothesis that macro single-leaf framing restores in-domain feature alignment.
2. **Experiment B (Prospective Field Validation Execution)**:
   - Collect prospective single-leaf turmeric captures using the Phase 1 Camera reticle under [`turmeric_datasets/field_validation/FIELD_VALIDATION_PROTOCOL.md`](file:///d:/curuma/turmeric_datasets/field_validation/FIELD_VALIDATION_PROTOCOL.md).
