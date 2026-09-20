# Clean EfficientNet-B0 + MobileNetV2 Hybrid Ensemble Evaluation

## 1. Experimental Setup & Model Configurations

* **Clean EfficientNet-B0 Checkpoint**: [`backend/checkpoints/efficientnet_b0_clean_best.pth`](file:///d:/curuma/backend/checkpoints/efficientnet_b0_clean_best.pth)
  * Pretrained backbone retrained on $603$ clean images (excluding $3$ mislabeled training samples).
* **MobileNetV2 Checkpoint**: [`backend/checkpoints/best_model.pth`](file:///d:/curuma/backend/checkpoints/best_model.pth)
  * Edge-optimized baseline model preserved in original state.
* **Hybrid Ensemble Formulation**:
  * Late fusion / Soft-voting: $\hat{P}_{\text{hybrid}} = 0.50 \cdot P_{\text{Clean\_EffNet}} + 0.50 \cdot P_{\text{MobileNetV2}}$
  * Weighting: $\alpha = 0.50$.
* **Datasets Evaluated**:
  * **Validation Set**: $130$ images (`split == 'val'`)
  * **Internal Test Set**: $129$ images (`split == 'internal_test'`, held-out)
* **Standard Class Taxonomy**: `[0: Aphids, 1: Blotch, 2: Healthy, 3: Leaf Spot]`

---

## 2. Validation Set Performance ($N = 130$)

| Model Architecture | Validation Accuracy (%) | Correct / Total |
| :--- | :---: | :---: |
| **Clean EfficientNet-B0** | **100.00%** | 130 / 130 |
| **MobileNetV2** | **90.77%** | 118 / 130 |
| **Clean Hybrid Ensemble ($\alpha=0.50$)** | **100.00%** | 130 / 130 |

---

## 3. Internal Test Set Performance ($N = 129$)

| Architecture | Accuracy (%) | Weighted Precision (%) | Weighted Recall (%) | Weighted F1-Score (%) |
| :--- | :---: | :---: | :---: | :---: |
| **Clean EfficientNet-B0** | **99.22%** | **99.25%** | **99.22%** | **99.23%** |
| **MobileNetV2** | **86.82%** | **88.66%** | **86.82%** | **86.91%** |
| **Clean Hybrid Ensemble ($\alpha=0.50$)** | **99.22%** | **99.25%** | **99.22%** | **99.23%** |

---

## 4. Per-Class Test Performance (Clean Hybrid Ensemble)

| Class Index | Class Name | Test Support ($N_c$) | Precision (%) | Recall (%) | F1-Score (%) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| `0` | **Aphids** | 33 | 100.00% | 100.00% | 100.00% |
| `1` | **Blotch** | 35 | 100.00% | 97.14% | 98.55% |
| `2` | **Healthy** | 32 | 96.97% | 100.00% | 98.46% |
| `3` | **Leaf Spot** | 29 | 100.00% | 100.00% | 100.00% |
| **Total / Avg** | **All Classes** | **129** | **99.25%** | **99.22%** | **99.23%** |

---

## 5. Confusion Matrix (Clean Hybrid Ensemble on Internal Test Set)

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

### Raw Array Representation:
```python
[[33,  0,  0,  0],
 [ 0, 34,  1,  0],
 [ 0,  0, 32,  0],
 [ 0,  0,  0, 29]]
```

---

## 6. Error Analysis & Misclassified Samples

* **Total Misclassified Samples in Clean Hybrid**: **1 / 129** ($0.78\%$)

### Misclassified Sample Breakdown:
* **Filename**: `blotch_(3).jpg`
  * **True Label**: `Blotch`
  * **Predicted Label**: `Healthy`
  * **Clean Hybrid Ensemble Confidence**: `92.45%`
  * **Model Specific Probabilities**:
    * **Clean EfficientNet-B0**: `Healthy` ($99.92\%$), `Blotch` ($0.06\%$), `Aphids` ($0.01\%$), `Leaf Spot` ($0.01\%$)
    * **MobileNetV2**: `Healthy` ($84.99\%$), `Aphids` ($5.92\%$), `Leaf Spot` ($4.63\%$), `Blotch` ($4.46\%$)
    * **Combined Hybrid ($\alpha=0.50$)**: `Healthy` ($92.45\%$), `Aphids` ($2.97\%$), `Leaf Spot` ($2.32\%$), `Blotch` ($2.26\%$)

---

## 7. Comparison Against Original Hybrid Baseline

| Metric | Original Hybrid Baseline | Clean Hybrid Ensemble | Delta ($\Delta$) |
| :--- | :---: | :---: | :---: |
| **Training Set Quality** | 606 images (with 3 noisy labels) | 603 clean images (noise removed) | Cleaned manifest |
| **Validation Accuracy** | 100.00% | **100.00%** | $+0.00\%$ |
| **Test Accuracy** | **99.22%** (128 / 129) | **99.22%** (128 / 129) | $+0.00\%$ |
| **Test Weighted Precision** | **99.25%** | **99.25%** | $+0.00\%$ |
| **Test Weighted Recall** | **99.22%** | **99.22%** | $+0.00\%$ |
| **Test Weighted F1** | **99.23%** | **99.23%** | $+0.00\%$ |
| **Test Errors** | 1 (`blotch_(3).jpg` $\rightarrow$ Healthy) | 1 (`blotch_(3).jpg` $\rightarrow$ Healthy) | Identical |

### Findings & Conclusion:
1. The **Clean Hybrid Ensemble** maintains **identical high test performance ($99.22\%$ accuracy, $99.23\%$ F1)** to the original baseline.
2. Training EfficientNet-B0 on the clean dataset without label noise eliminated ground-truth contradictions while preserving exact test generalization.
3. MobileNetV2 continues to provide secondary soft-voting support, while EfficientNet-B0 drives high discriminatory accuracy across all classes.
