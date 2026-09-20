# Turmeric Pathology Model Evaluation & Benchmark Report

## 1. Dataset Overview

* **Dataset Source**: Dataset 01 (Original Curuma Pathology Dataset)
* **Total Images**: 865
* **Target Classes (4)**: `Aphids`, `Blotch`, `Healthy`, `Leaf Spot`
* **Data Splits**:
  * **Train Set**: 606 images (70.06%)
  * **Validation Set**: 130 images (15.03%)
  * **Internal Test Set**: 129 images (14.91%)

---

## 2. Experimental Setup & Model Configurations

1. **MobileNetV2**:
   * Pretrained backbone with custom linear classification head (Dropout $p=0.3$, Linear $1280 \rightarrow 4$).
   * Input Resolution: $224 \times 224 \times 3$.
   * ImageNet normalization: $\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$.

2. **EfficientNet-B0**:
   * Pretrained backbone with custom linear classification head (Dropout $p=0.3$, Linear $1280 \rightarrow 4$).
   * Input Resolution: $224 \times 224 \times 3$.
   * Compound scaling configuration optimized for feature richness and fine textural lesion patterns.

3. **Hybrid Ensemble**:
   * Late fusion / soft-voting ensemble combining predicted softmax probabilities.
   * Parameter: $\alpha = 0.50$.
   * Ensemble Formula:
     $$P_{\text{hybrid}} = 0.50 \cdot P_{\text{EfficientNet}} + 0.50 \cdot P_{\text{MobileNetV2}}$$

---

## 3. Quantitative Evaluation Results (Internal Test Set, $N = 129$)

| Architecture | Accuracy (%) | Macro Precision (%) | Macro Recall (%) | Macro F1-Score (%) |
| :--- | :---: | :---: | :---: | :---: |
| **MobileNetV2** | 93.02% | 93.89% | 93.02% | 93.09% |
| **EfficientNet-B0** | 99.22% | 99.25% | 99.22% | 99.23% |
| **Hybrid Ensemble ($\alpha=0.50$)** | 99.22% | 99.25% | 99.22% | 99.23% |

---

## 4. Hybrid Ensemble Confusion Matrix

Evaluated on the held-out internal test set ($N = 129$):

```
                     Predicted
               Aphids  Blotch  Healthy  Leaf Spot   Total
Actual
Aphids           33       0       0         0        33
Blotch            0      34       1         0        35
Healthy           0       0      32         0        32
Leaf Spot         0       0       0        29        29
---------------------------------------------------------
Total            33      34      33        29       129
```

Matrix representation:
```python
[[33,  0,  0,  0],
 [ 0, 34,  1,  0],
 [ 0,  0, 32,  0],
 [ 0,  0,  0, 29]]
```

* **Per-Class Correct Predictions**:
  * `Aphids`: 33 / 33 (100.0%)
  * `Blotch`: 34 / 35 (97.14%) — *1 sample misclassified as Healthy*
  * `Healthy`: 32 / 32 (100.0%)
  * `Leaf Spot`: 29 / 29 (100.0%)
* **Total Correct**: 128 / 129 (99.22%)

---

## 5. Key Empirical Observations & Findings

1. **Single Model vs. Ensemble Comparison**:
   * **EfficientNet-B0** achieved $99.22\%$ accuracy ($99.23\%$ F1-score) independently.
   * **Hybrid Ensemble ($\alpha = 0.50$)** yielded identical performance metrics ($99.22\%$ accuracy, $99.23\%$ F1-score, identical confusion matrix).
   * **Finding**: The Hybrid Ensemble did **NOT** improve over standalone EfficientNet-B0 on the internal test set. No ensemble superiority was observed in this benchmark.

2. **MobileNetV2 Performance**:
   * MobileNetV2 achieved solid baseline performance at $93.02\%$ accuracy and $93.09\%$ F1-score while maintaining lower computational footprint.

3. **Classification Error Analysis**:
   * Across the 129 test images, exactly 1 misclassification occurred: a single `Blotch` sample was predicted as `Healthy`, while all `Aphids` ($n=33$) and `Leaf Spot` ($n=29$) samples were classified with 100% precision and recall.
