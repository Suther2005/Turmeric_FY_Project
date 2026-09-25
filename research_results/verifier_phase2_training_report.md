# Turmeric Leaf Verification Model (Stage-1 Verifier) — Phase 2 Training Report

**Date:** September 23, 2026 12:14:28  
**Architecture:** MobileNetV3-Small Binary Classifier  
**Training Status:** COMPLETE (Evaluated on local validation split; zero production integration)  

---

## 1. Training Configuration & Split Isolation

- **Backbone:** Pretrained `mobilenet_v3_small` with custom projection head (`Linear(576, 256) -> Hardswish -> Dropout(0.2) -> Linear(256, 1)`)
- **Input Shape:** $224 \times 224 \times 3$ (from $256 \times 256$ in-memory cached base)
- **Loss Function:** `BCEWithLogitsLoss` with class weight `pos_weight = 0.6600` ($398/603$)
- **Optimizer:** AdamW ($lr=3\times 10^{-4}$, weight decay = $1\times 10^{-4}$)
- **LR Scheduler:** CosineAnnealingLR ($T_{\max}=15, \eta_{\min}=1\times 10^{-6}$)
- **Batch Size:** 32 | **Epochs:** 15
- **Total Training Loop Runtime:** 835.04s (55.67s/epoch)
- **Train Set:** 1001 samples (603 positive turmeric leaves, 398 negative controls)
- **Val Set:** 233 samples (130 positive turmeric leaves, 103 negative controls)
- **Strict Split Isolation:**
  - `external_test` (200 frozen benchmark images): **UNTOUCHED / ISOLATED**
  - `external_reserve` (219 images): **UNTOUCHED / ISOLATED**
  - `external_edge_case` (203 dry leaf images): **UNTOUCHED / ISOLATED**

---

## 2. Validation Performance Metrics (Best Epoch: 3)

| Metric | Value |
| :--- | :---: |
| **Validation Accuracy** | **100.00%** |
| **Balanced Accuracy** | **100.00%** |
| **Precision (Turmeric Leaf)** | **100.00%** |
| **Recall / Sensitivity (Turmeric Leaf)** | **100.00%** |
| **Specificity (Non-Turmeric Reject)** | **100.00%** |
| **F1-Score** | **100.00%** |
| **ROC-AUC** | **1.0000** |
| **PR-AUC (Average Precision)** | **1.0000** |
| **Brier Score Loss** | **0.00000** |

### Confusion Matrix (Default $\tau = 0.50$, $N = 233$)

```
                       Predicted
                 Non-Turmeric (0)   Turmeric Leaf (1)    Total
Actual
Non-Turmeric (0)       103                0                    103
Turmeric Leaf (1)      0                  130                  130
---------------------------------------------------------------
Total                  103                130                  233
```

---

## 3. Threshold Sensitivity Analysis

