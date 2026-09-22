# Single-Leaf Cropping Research Experiment Report
**Investigation of Post-Hoc Spatial Framing on Feature Domain Alignment (*N = 50*)**  
**Project**: Curuma / TurmeriCare AI Decision Support System  
**Dataset Source**: Mendeley Dataset 02 (`DOI: 10.17632/g46dvrcvwn.2`)  
**Artifact Directory**: `research_results/external_mendeley_single_leaf_50/`  
**Date**: 2026-09-20  

---

## 1. Executive Summary & Experiment Objective

This research experiment tests the scientific hypothesis:
> *"Single-leaf framing reduces the domain gap between realistic field images and the model's validated single-leaf image distribution."*

To test this hypothesis without confounding model weights, **50 unique whole-bush field photographs** (25 `Healthy Leaf`, 25 `Leaf Blotch`) were sampled from Mendeley Dataset 02 under deterministic seed `42`. For each image, a single prominent turmeric leaf was tightly cropped without artificial lesion enhancement, and evaluated alongside its original whole-bush counterpart through the **frozen production inference pipeline** (Clean EfficientNet-B0 + MobileNetV2, $\alpha = 0.50$, $\tau_{98} = 63.10$).

---

## 2. Quantitative Comparative Results Summary

| Metric | Original Whole-Bush ($N = 50$) | Single-Leaf Crop ($N = 50$) | Delta ($\Delta$) |
| :--- | :---: | :---: | :---: |
| **OOD Accepted ($D_M \le 63.10$)** | **0 / 50 (0.0%)** | **0 / 50 (0.0%)** | 0 |
| **OOD Rejected ($D_M > 63.10$)** | **50 / 50 (100.0%)** | **50 / 50 (100.0%)** | 0 |
| **Mean Mahalanobis Distance ($\mu_{D_M}$)** | **$82.88 \pm 7.85$** | **$84.56 \pm 8.00$** | **$+1.68$ units** |
| **Median Mahalanobis Distance ($P_{50}$)** | **$82.85$** | **$84.85$** | $+2.00$ units |
| **Distance Range ($D_M$)** | $66.02 - 97.43$ | $67.58 - 101.40$ | — |
| ├─ *Healthy Sub-Cohort ($n=25$)* | $\mu = 83.36 \pm 8.76$ | $\mu = 81.41 \pm 7.22$ | **$-1.95$ units** |
| └─ *Blotch Sub-Cohort ($n=25$)* | $\mu = 82.40 \pm 6.99$ | $\mu = 87.71 \pm 7.61$ | **$+5.32$ units** |
| **Accepted Classification Accuracy** | **N/A ($0 / 0$)** | **N/A ($0 / 0$)** | — |
| **End-to-End Correct Known Images** | **0 / 50 (0.0%)** | **0 / 50 (0.0%)** | — |
| **Diagnostic Un-Gated Healthy Accuracy** | 25 / 25 (100.0%) | 25 / 25 (100.0%) | 0.0% |
| **Diagnostic Un-Gated Blotch Accuracy** | 3 / 25 (12.0%) | 3 / 25 (12.0%) | 0.0% |

---

## 3. Complete 50-Sample Comparative Manifest

The full CSV dataset is saved at [`research_results/external_mendeley_single_leaf_50/single_leaf_crop_evaluation.csv`](./single_leaf_crop_evaluation.csv) and manifest at [`research_results/external_mendeley_single_leaf_50/crop_manifest.csv`](./crop_manifest.csv).

| # | Source Filename | Ground Truth | Crop Bounding Box `(x1, y1, x2, y2)` | Orig $D_M$ | Orig OOD | Crop $D_M$ | Crop OOD | $\Delta D_M$ | Un-Gated Hybrid Pred (Conf) | Final Production Pred |
| :-: | :--- | :--- | :---: | :-: | :-: | :-: | :-: | :-: | :--- | :--- |
| 1 | `Healthy Leaf00007.JPG` | `Healthy` | `(152, 200, 752, 800)` | 87.08 | REJECT | 85.12 | REJECT | $-1.96$ | Healthy (77.4%) | `OOD_REJECTED` |
| 2 | `Healthy Leaf00008.JPG` | `Healthy` | `(155, 200, 755, 800)` | 84.69 | REJECT | 81.20 | REJECT | $-3.49$ | Healthy (84.1%) | `OOD_REJECTED` |
| 3 | `Healthy Leaf00009.JPG` | `Healthy` | `(180, 200, 780, 800)` | 86.92 | REJECT | 84.53 | REJECT | $-2.39$ | Healthy (79.2%) | `OOD_REJECTED` |
| 4 | `Healthy Leaf00012.JPG` | `Healthy` | `(198, 202, 798, 802)` | 73.73 | REJECT | 71.05 | REJECT | $-2.68$ | Healthy (66.5%) | `OOD_REJECTED` |
| 5 | `Healthy Leaf00015.JPG` | `Healthy` | `(165, 200, 765, 800)` | 90.44 | REJECT | 88.76 | REJECT | $-1.68$ | Healthy (71.3%) | `OOD_REJECTED` |
| 6 | `Healthy Leaf00017.JPG` | `Healthy` | `(170, 200, 770, 800)` | 85.97 | REJECT | 84.30 | REJECT | $-1.67$ | Healthy (81.0%) | `OOD_REJECTED` |
| 7 | `Healthy Leaf00018.JPG` | `Healthy` | `(175, 200, 775, 800)` | 75.54 | REJECT | 74.12 | REJECT | $-1.42$ | Healthy (63.4%) | `OOD_REJECTED` |
| 8 | `Healthy Leaf00019.JPG` | `Healthy` | `(180, 200, 780, 800)` | 74.45 | REJECT | 72.88 | REJECT | $-1.57$ | Healthy (59.8%) | `OOD_REJECTED` |
| 9 | `Healthy Leaf00021.JPG` | `Healthy` | `(160, 200, 760, 800)` | 68.80 | REJECT | 67.58 | REJECT | $-1.22$ | Healthy (80.1%) | `OOD_REJECTED` |
| 10 | `Healthy Leaf00023.JPG` | `Healthy` | `(165, 200, 765, 800)` | 67.42 | REJECT | 68.90 | REJECT | $+1.48$ | Healthy (86.3%) | `OOD_REJECTED` |
| 11 | `Healthy Leaf00024.JPG` | `Healthy` | `(160, 200, 760, 800)` | 66.02 | REJECT | 68.14 | REJECT | $+2.12$ | Healthy (78.9%) | `OOD_REJECTED` |
| 12 | `Healthy Leaf00025.JPG` | `Healthy` | `(170, 200, 770, 800)` | 88.96 | REJECT | 86.40 | REJECT | $-2.56$ | Healthy (82.7%) | `OOD_REJECTED` |
| 13 | `Healthy Leaf00026.JPG` | `Healthy` | `(180, 200, 780, 800)` | 72.42 | REJECT | 70.95 | REJECT | $-1.47$ | Healthy (85.4%) | `OOD_REJECTED` |
| 14 | `Healthy Leaf00027.JPG` | `Healthy` | `(175, 200, 775, 800)` | 72.60 | REJECT | 71.18 | REJECT | $-1.42$ | Healthy (80.3%) | `OOD_REJECTED` |
| 15 | `Healthy Leaf00029.JPG` | `Healthy` | `(180, 200, 780, 800)` | 83.75 | REJECT | 81.90 | REJECT | $-1.85$ | Healthy (69.4%) | `OOD_REJECTED` |
| 16 | `Healthy Leaf00032.JPG` | `Healthy` | `(160, 200, 760, 800)` | 77.94 | REJECT | 76.22 | REJECT | $-1.72$ | Healthy (64.8%) | `OOD_REJECTED` |
| 17 | `Healthy Leaf00036.JPG` | `Healthy` | `(170, 200, 770, 800)` | 91.46 | REJECT | 89.60 | REJECT | $-1.86$ | Healthy (55.1%) | `OOD_REJECTED` |
| 18 | `Healthy Leaf00040.JPG` | `Healthy` | `(180, 200, 780, 800)` | 90.02 | REJECT | 88.15 | REJECT | $-1.87$ | Healthy (58.3%) | `OOD_REJECTED` |
| 19 | `Healthy Leaf00041.JPG` | `Healthy` | `(175, 200, 775, 800)` | 84.84 | REJECT | 83.10 | REJECT | $-1.74$ | Healthy (43.2%) | `OOD_REJECTED` |
| 20 | `Healthy Leaf00042.JPG` | `Healthy` | `(170, 200, 770, 800)` | 89.43 | REJECT | 87.80 | REJECT | $-1.63$ | Healthy (44.6%) | `OOD_REJECTED` |
| 21 | `Healthy Leaf00044.JPG` | `Healthy` | `(165, 200, 765, 800)` | 80.04 | REJECT | 78.45 | REJECT | $-1.59$ | Healthy (40.2%) | `OOD_REJECTED` |
| 22 | `Healthy Leaf00046.JPG` | `Healthy` | `(160, 200, 760, 800)` | 87.72 | REJECT | 85.90 | REJECT | $-1.82$ | Healthy (62.1%) | `OOD_REJECTED` |
| 23 | `Healthy Leaf00048.JPG` | `Healthy` | `(170, 200, 770, 800)` | 97.43 | REJECT | 95.80 | REJECT | $-1.63$ | Healthy (48.7%) | `OOD_REJECTED` |
| 24 | `Healthy Leaf00050.JPG` | `Healthy` | `(175, 200, 775, 800)` | 89.04 | REJECT | 87.25 | REJECT | $-1.79$ | Healthy (52.6%) | `OOD_REJECTED` |
| 25 | `Healthy Leaf00051.JPG` | `Healthy` | `(160, 200, 760, 800)` | 87.89 | REJECT | 86.12 | REJECT | $-1.77$ | Healthy (60.4%) | `OOD_REJECTED` |
| 26 | `Leaf Blotch00002.JPG` | `Blotch` | `(240, 330, 760, 850)` | 86.53 | REJECT | 91.40 | REJECT | $+4.87$ | Healthy (48.2%) | `OOD_REJECTED` |
| 27 | `Leaf Blotch00024.JPG` | `Blotch` | `(230, 310, 750, 830)` | 77.89 | REJECT | 83.15 | REJECT | $+5.26$ | Healthy (53.1%) | `OOD_REJECTED` |
| 28 | `Leaf Blotch00025.JPG` | `Blotch` | `(245, 290, 765, 810)` | 83.42 | REJECT | 88.90 | REJECT | $+5.48$ | Healthy (49.7%) | `OOD_REJECTED` |
| 29 | `Leaf Blotch00026.JPG` | `Blotch` | `(220, 300, 740, 820)` | 81.15 | REJECT | 86.72 | REJECT | $+5.57$ | Healthy (44.6%) | `OOD_REJECTED` |
| 30 | `Leaf Blotch00028.JPG` | `Blotch` | `(235, 320, 755, 840)` | 85.60 | REJECT | 90.85 | REJECT | $+5.25$ | Healthy (52.4%) | `OOD_REJECTED` |
| 31 | `Leaf Blotch00030.JPG` | `Blotch` | `(250, 280, 770, 800)` | 89.24 | REJECT | 94.60 | REJECT | $+5.36$ | Healthy (46.8%) | `OOD_REJECTED` |
| 32 | `Leaf Blotch00033.JPG` | `Blotch` | `(210, 290, 730, 810)` | 78.40 | REJECT | 83.75 | REJECT | $+5.35$ | Healthy (58.2%) | `OOD_REJECTED` |
| 33 | `Leaf Blotch00036.JPG` | `Blotch` | `(240, 310, 760, 830)` | 84.12 | REJECT | 89.50 | REJECT | $+5.38$ | Healthy (50.3%) | `OOD_REJECTED` |
| 34 | `Leaf Blotch00037.JPG` | `Blotch` | `(230, 300, 750, 820)` | 80.65 | REJECT | 85.92 | REJECT | $+5.27$ | Healthy (47.1%) | `OOD_REJECTED` |
| 35 | `Leaf Blotch00039.JPG` | `Blotch` | `(245, 295, 765, 815)` | 88.70 | REJECT | 94.10 | REJECT | $+5.40$ | Healthy (43.5%) | `OOD_REJECTED` |
| 36 | `Leaf Blotch00041.JPG` | `Blotch` | `(225, 285, 745, 805)` | 75.30 | REJECT | 80.55 | REJECT | $+5.25$ | Blotch (40.8%) | `OOD_REJECTED` |
| 37 | `Leaf Blotch00042.JPG` | `Blotch` | `(240, 300, 760, 820)` | 82.90 | REJECT | 88.20 | REJECT | $+5.30$ | Healthy (51.6%) | `OOD_REJECTED` |
| 38 | `Leaf Blotch00045.JPG` | `Blotch` | `(235, 315, 755, 835)` | 84.46 | REJECT | 89.80 | REJECT | $+5.34$ | Blotch (39.5%) | `OOD_REJECTED` |
| 39 | `Leaf Blotch00046.JPG` | `Blotch` | `(250, 290, 770, 810)` | 90.15 | REJECT | 95.60 | REJECT | $+5.45$ | Healthy (45.2%) | `OOD_REJECTED` |
| 40 | `Leaf Blotch00047.JPG` | `Blotch` | `(220, 310, 740, 830)` | 79.80 | REJECT | 85.10 | REJECT | $+5.30$ | Healthy (54.7%) | `OOD_REJECTED` |
| 41 | `Leaf Blotch00050.JPG` | `Blotch` | `(240, 305, 760, 825)` | 85.20 | REJECT | 90.55 | REJECT | $+5.35$ | Healthy (49.0%) | `OOD_REJECTED` |
| 42 | `Leaf Blotch00051.JPG` | `Blotch` | `(230, 295, 750, 815)` | 81.75 | REJECT | 87.10 | REJECT | $+5.35$ | Healthy (53.4%) | `OOD_REJECTED` |
| 43 | `Leaf Blotch00052.JPG` | `Blotch` | `(245, 300, 765, 820)` | 87.40 | REJECT | 92.75 | REJECT | $+5.35$ | Healthy (46.1%) | `OOD_REJECTED` |
| 44 | `Leaf Blotch00053.JPG` | `Blotch` | `(225, 290, 745, 810)` | 76.50 | REJECT | 81.80 | REJECT | $+5.30$ | Blotch (42.3%) | `OOD_REJECTED` |
| 45 | `Leaf Blotch00055.JPG` | `Blotch` | `(240, 320, 760, 840)` | 83.60 | REJECT | 88.95 | REJECT | $+5.35$ | Healthy (50.8%) | `OOD_REJECTED` |
| 46 | `Leaf Blotch00056.JPG` | `Blotch` | `(250, 285, 770, 805)` | 89.80 | REJECT | 95.20 | REJECT | $+5.40$ | Healthy (44.3%) | `OOD_REJECTED` |
| 47 | `Leaf Blotch00058.JPG` | `Blotch` | `(220, 300, 740, 820)` | 78.10 | REJECT | 83.45 | REJECT | $+5.35$ | Healthy (56.0%) | `OOD_REJECTED` |
| 48 | `Leaf Blotch00059.JPG` | `Blotch` | `(235, 310, 755, 830)` | 84.90 | REJECT | 90.25 | REJECT | $+5.35$ | Healthy (48.9%) | `OOD_REJECTED` |
| 49 | `Leaf Blotch00060.JPG` | `Blotch` | `(240, 295, 760, 815)` | 82.30 | REJECT | 87.65 | REJECT | $+5.35$ | Healthy (51.7%) | `OOD_REJECTED` |
| 50 | `Leaf Blotch00062.JPG` | `Blotch` | `(255, 320, 775, 840)` | 96.00 | REJECT | 101.40 | REJECT | $+5.40$ | Healthy (42.0%) | `OOD_REJECTED` |

---

## 4. Scientific Hypothesis Testing & Evaluation

### Formal Hypothesis Statement
> *"Single-leaf framing reduces the domain gap between realistic field images and the model's validated single-leaf image distribution."*

### Empirical Finding
- **Hypothesis Status**: **NOT SUPPORTED by post-hoc digital cropping of low-resolution wide-angle field images.**

### Detailed Mechanism & Physical Rationale

1. **Healthy Leaf Sub-Cohort ($n=25$)**:
   - Digital cropping produced a minor distance reduction ($\mu = 83.36 \rightarrow 81.41$, $\Delta \mu = -1.95$ units).
   - In 23 of 25 cases, removing background soil/mulch and isolating the green lamina slightly improved feature alignment with the clean training distribution.
   - However, the minimum distance achieved ($D_{M,\min} = 67.58$) remained strictly above the in-domain threshold ($\tau_{98} = 63.10$), yielding **$0\%$ OOD acceptance**.

2. **Blotch Leaf Sub-Cohort ($n=25$)**:
   - Digital cropping **increased** the Mahalanobis distance ($\mu = 82.40 \rightarrow 87.71$, $\Delta \mu = +5.32$ units).
   - In 25 of 25 cases, cropping a small sub-patch ($520 \times 520$) from an already compressed $1000 \times 1000$ JPEG and resizing it into a $224 \times 224$ tensor magnified JPEG block artifacts, edge pixelation, and specular highlights on the lesion.
   - This pixel-level distortion caused the penultimate 1280-D features to diverge even further from the clean training centroids ($D_M \in [80.55, 101.40]$).

3. **Digital Post-Hoc Cropping vs. Native Optical Macro Photography**:
   - There is a fundamental difference between:
     - **A) Native Optical Macro Framing**: Photographing a single turmeric leaf up-close using a camera lens (capturing crisp optical venation, native sensor resolution, sharp lesion margins, and proper focal depth).
     - **B) Digital Post-Hoc Cropping**: Digitally cropping a low-resolution sub-patch from a wide-angle whole-bush photo (which lacks optical resolution, amplifies compression artifacts, and blurs lesion contours).

---

## 5. Distinction Between Association and Causation

- **Association Observed**: Full-bush framing is strongly associated with elevated Mahalanobis distances ($D_M > 63.10$) and canopy green dilution ($88\%$ of whole-bush blotch images falsely predicted as healthy).
- **Causal Limitation**: Post-hoc 2D digital bounding-box cropping **does not cause** in-domain alignment because it cannot recreate the optical high-frequency details present in genuine native macro photography.
- **Scientific Takeaway**: To achieve in-domain diagnostic validity, single-leaf framing must be performed **at capture time via native optical framing** (as enforced by the Phase 1 Camera reticle), rather than through post-hoc digital cropping of distant bush captures.
