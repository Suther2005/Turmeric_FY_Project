# Real-World Field Domain Stress Test Report
**Curuma / TurmeriCare AI Decision Support System**  
*Evaluation of 27 Real Turmeric Field Images (*Curcuma longa*) against the Production Hybrid Ensemble & Mahalanobis OOD Safeguard*

---

## 1. Executive Summary

This stress test evaluates the behavior of the frozen production **Curuma / TurmeriCare AI** inference pipeline on **27 real-world field photographs** of turmeric plants from Dataset 02.

### Key Findings
1. **Total Field Images Evaluated**: 27
2. **OOD Accepted ($D_M \le 63.10$)**: **$0 / 27$ ($0.0\%$)**
3. **OOD Rejected ($D_M > 63.10$)**: **$27 / 27$ ($100.0\%$)**
4. **Acceptance Rate**: **$0.0\%$**
5. **Mahalanobis Distance Distribution**:
   - Minimum $D_M$: **$67.17$**
   - Maximum $D_M$: **$93.27$**
   - Mean $D_M$: **$80.35 \pm 6.34$**
   - Median (P50) $D_M$: **$80.32$**
6. **Diagnostic Gating Outcome**: All 27 images were safely identified as outside the calibrated single-leaf validation domain, completely bypassing the classification head and preventing uncalibrated predictions on uncurated multi-leaf / full-bush shots.

---

## 2. Production Evaluation Configuration (Strictly Frozen)

| Parameter | Production Value | Source / Methodology |
| :--- | :--- | :--- |
| **EfficientNet-B0 Checkpoint** | `backend/checkpoints/efficientnet_b0_best.pth` | Clean 603-image training set |
| **MobileNetV2 Checkpoint** | `backend/checkpoints/best_model.pth` | Reference edge backbone |
| **Hybrid Ensemble Alpha** | $\alpha = 0.50$ | Soft-voting: $0.50 \cdot P_{\text{eff}} + 0.50 \cdot P_{\text{mob}}$ |
| **OOD Statistics** | `backend/checkpoints/ood_stats.pt` | Clean training centroids + Ledoit-Wolf precision matrix |
| **OOD Threshold ($\tau_{98}$)** | **$63.10$** | Calibrated at $98\%$ TPR on clean 130-image validation set |
| **Device & Preprocessing** | CPU, $224 \times 224$, ImageNet $\mu/\sigma$ | Standard production inference pipeline |

---

## 3. Dataset Cohort Composition

The 27 evaluation images were selected from raw uncurated field photography in `turmeric_datasets/dataset_02/original/Turmeric Plant Disease/`:

- **Healthy Leaf ($n = 9$)**: Full-plant and wide-angle field captures of green turmeric foliage (Ground Truth: `Healthy`).
- **Leaf Blotch ($n = 9$)**: Field captures of turmeric plants with necrotic blotch patches (Ground Truth: `Blotch`).
- **Dry Leaf ($n = 9$)**: Field captures of senescent, drought-stressed, or desiccated turmeric foliage (Ground Truth: `Unknown` / Unverified).

All images are high-resolution ($4000 \times 3000$ or $3000 \times 4000$) captured in open field conditions under ambient sunlight, with soil, mulch, weeds, and multi-leaf canopy foliage.

---

## 4. Complete Per-Image Evaluation Results

The CSV version is available at [`research_results/field_domain_stress_test.csv`](./field_domain_stress_test.csv).

| # | Image Filename | Category / Ground Truth | Mahalanobis Distance ($D_M$) | Threshold ($\tau_{98}$) | OOD Status | Model Prediction | Model Conf (%) | Correctness | Diagnostic Notes |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :-: | :-: | :--- |
| 1 | `Healthy Leaf00001.JPG` | `Healthy` | 86.59 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Full-plant multi-leaf shot; blocked by domain safeguard |
| 2 | `Healthy Leaf00022.JPG` | `Healthy` | 67.17 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Close to threshold; wide angle canopy shot |
| 3 | `Healthy Leaf00044.JPG` | `Healthy` | 80.04 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Multi-leaf bush; blocked by domain safeguard |
| 4 | `Healthy Leaf00065.JPG` | `Healthy` | 79.98 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Outdoor field background; blocked by domain safeguard |
| 5 | `Healthy Leaf00087.JPG` | `Healthy` | 88.62 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Multi-leaf field shot; blocked by domain safeguard |
| 6 | `Healthy Leaf00108.JPG` | `Healthy` | 89.53 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Harsh sunlight reflection; blocked by domain safeguard |
| 7 | `Healthy Leaf00130.JPG` | `Healthy` | 80.32 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Whole canopy foliage; blocked by domain safeguard |
| 8 | `Healthy Leaf00151.JPG` | `Healthy` | 77.78 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Field background with soil; blocked by domain safeguard |
| 9 | `Healthy Leaf00173.JPG` | `Healthy` | 84.31 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | High perspective angle; blocked by domain safeguard |
| 10 | `Leaf Blotch00001.JPG` | `Blotch` | 81.89 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Distant lesions on whole bush; blocked by domain safeguard |
| 11 | `Leaf Blotch00023.JPG` | `Blotch` | 90.33 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | High leaf clutter; blocked by domain safeguard |
| 12 | `Leaf Blotch00045.JPG` | `Blotch` | 84.46 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Multiple lesions across canopy; blocked by domain safeguard |
| 13 | `Leaf Blotch00067.JPG` | `Blotch` | 87.63 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Overcast field shot; blocked by domain safeguard |
| 14 | `Leaf Blotch00089.JPG` | `Blotch` | 85.59 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Field soil background; blocked by domain safeguard |
| 15 | `Leaf Blotch00111.JPG` | `Blotch` | 82.71 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Multi-leaf arrangement; blocked by domain safeguard |
| 16 | `Leaf Blotch00133.JPG` | `Blotch` | 79.86 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Diffuse lesion pattern; blocked by domain safeguard |
| 17 | `Leaf Blotch00155.JPG` | `Blotch` | 81.41 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Bush perspective; blocked by domain safeguard |
| 18 | `Leaf Blotch00177.JPG` | `Blotch` | 93.27 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Complex lighting & leaf angle; blocked by domain safeguard |
| 19 | `Dry Leaf00001.JPG` | `Unknown` | 78.15 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Dry/senescent leaf; blocked by domain safeguard |
| 20 | `Dry Leaf00023.JPG` | `Unknown` | 74.88 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Desiccated foliage; blocked by domain safeguard |
| 21 | `Dry Leaf00046.JPG` | `Unknown` | 75.29 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Chlorotic dry foliage; blocked by domain safeguard |
| 22 | `Dry Leaf00068.JPG` | `Unknown` | 68.47 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Basal dry leaves on plant; blocked by domain safeguard |
| 23 | `Dry Leaf00091.JPG` | `Unknown` | 69.51 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Mixed green/dry foliage; blocked by domain safeguard |
| 24 | `Dry Leaf00113.JPG` | `Unknown` | 79.59 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Curled dry leaf; blocked by domain safeguard |
| 25 | `Dry Leaf00136.JPG` | `Unknown` | 81.59 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Soil background with mulch; blocked by domain safeguard |
| 26 | `Dry Leaf00158.JPG` | `Unknown` | 73.86 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Necrotic tears; blocked by domain safeguard |
| 27 | `Dry Leaf00181.JPG` | `Unknown` | 79.42 | 63.10 | **REJECT** | `OOD_REJECTED` | 0.0% | `REJECTED_BY_OOD` | Shriveled brown foliage; blocked by domain safeguard |

---

## 5. Aggregate Performance Metrics

| Metric | Result |
| :--- | :---: |
| **Total Evaluated Field Images** | **27** |
| **OOD Accepted ($D_M \le 63.10$)** | **0 (0.0%)** |
| **OOD Rejected ($D_M > 63.10$)** | **27 (100.0%)** |
| **Overall Acceptance Rate** | **0.0%** |
| **Predictions Among Accepted Images** | **None (all 27 gated)** |
| **Known-Label Accuracy Among Accepted Images** | **N/A ($0/0$)** |

### List of Accepted Images
*(None)*

### List of Rejected Images (27 Total)
1. `Healthy Leaf00001.JPG` ($D_M = 86.59$)
2. `Healthy Leaf00022.JPG` ($D_M = 67.17$)
3. `Healthy Leaf00044.JPG` ($D_M = 80.04$)
4. `Healthy Leaf00065.JPG` ($D_M = 79.98$)
5. `Healthy Leaf00087.JPG` ($D_M = 88.62$)
6. `Healthy Leaf00108.JPG` ($D_M = 89.53$)
7. `Healthy Leaf00130.JPG` ($D_M = 80.32$)
8. `Healthy Leaf00151.JPG` ($D_M = 77.78$)
9. `Healthy Leaf00173.JPG` ($D_M = 84.31$)
10. `Leaf Blotch00001.JPG` ($D_M = 81.89$)
11. `Leaf Blotch00023.JPG` ($D_M = 90.33$)
12. `Leaf Blotch00045.JPG` ($D_M = 84.46$)
13. `Leaf Blotch00067.JPG` ($D_M = 87.63$)
14. `Leaf Blotch00089.JPG` ($D_M = 85.59$)
15. `Leaf Blotch00111.JPG` ($D_M = 82.71$)
16. `Leaf Blotch00133.JPG` ($D_M = 79.86$)
17. `Leaf Blotch00155.JPG` ($D_M = 81.41$)
18. `Leaf Blotch00177.JPG` ($D_M = 93.27$)
19. `Dry Leaf00001.JPG` ($D_M = 78.15$)
20. `Dry Leaf00023.JPG` ($D_M = 74.88$)
21. `Dry Leaf00046.JPG` ($D_M = 75.29$)
22. `Dry Leaf00068.JPG` ($D_M = 68.47$)
23. `Dry Leaf00091.JPG` ($D_M = 69.51$)
24. `Dry Leaf00113.JPG` ($D_M = 79.59$)
25. `Dry Leaf00136.JPG` ($D_M = 81.59$)
26. `Dry Leaf00158.JPG` ($D_M = 73.86$)
27. `Dry Leaf00181.JPG` ($D_M = 79.42$)

---

## 6. Scientific Analysis & Key Failure Mode Insights

### 1. Domain Shift: Single-Leaf Benchmarks vs. Raw Whole-Plant Photography
- The production Clean EfficientNet-B0 backbone and its Mahalanobis centroid distribution ($\tau_{98} = 63.10$) were fitted on curated **single-leaf close-ups** centered on the foliar lamina.
- In contrast, Dataset 02 consists of uncurated full-bush shots, wide-angle field perspectives, multi-leaf clusters, and visible farm soil/sky.
- As a direct consequence, the 1280-dimensional feature representations of these full-bush captures produce Mahalanobis distances ranging between $67.17$ and $93.27$ (mean $80.35$).

### 2. Validation of Safeguard Functionality
- The Mahalanobis gate **successfully prevented false confidence** on uncurated multi-leaf shots. Rather than returning misleading high-confidence predictions on wide-angle shots where lesions only occupy a few pixels, the system consistently returned `OOD_REJECTED`.
- The domain distance spectrum demonstrates clear hierarchy:
  $$\text{In-Domain Single Leaves } (D_M \le 63.10) < \text{Raw Whole-Plant Field } (67.17 \le D_M \le 93.27) < \text{Obvious Non-Botanical Far-OOD } (D_M > 100.0)$$

### 3. Diagnostic Offline Analysis of Un-gated Predictions
For technical diagnostic documentation, when the classification head was evaluated offline without gating:
- **Healthy Leaf ($9/9$)**: $100\%$ correctly predicted as `Healthy` ($35.3\% - 86.1\%$ confidence).
- **Leaf Blotch ($9/9$)**: $3/9$ predicted as `Blotch`, but $6/9$ misclassified as `Healthy` ($36.6\% - 56.2\%$ confidence) because the small blotch spots on a distant whole plant were overwhelmed by the surrounding green canopy.
- **Dry Leaf ($9/9$)**: $8/9$ predicted as `Blotch` and $1/9$ as `Leaf Spot` due to widespread foliar browning and necrotic tissue.

### 4. Direct Operational Takeaway for Farmers
This stress test confirms the absolute necessity of the **Phase 1 Camera Framing Reticle** integrated in the UI (*"Position a single leaf in center"*), which guides farmers to capture close-up single-leaf images matching the calibrated in-domain distribution.
