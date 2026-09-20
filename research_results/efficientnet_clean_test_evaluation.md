# Clean EfficientNet-B0 Model Evaluation (Internal Test Set)

## 1. Evaluation Overview & Experimental Setup

* **Evaluated Model Checkpoint**: [`backend/checkpoints/efficientnet_b0_clean_best.pth`](file:///d:/curuma/backend/checkpoints/efficientnet_b0_clean_best.pth)
* **Dataset Manifest**: [`turmeric_datasets/metadata/dataset_splits_clean.csv`](file:///d:/curuma/turmeric_datasets/metadata/dataset_splits_clean.csv)
* **Training Partition**: $603$ images ($3$ mislabeled training samples excluded: `leaf_spot_(141).jpg`, `leaf_spot_(142).jpg`, `leaf_spot_(144).jpg`)
* **Validation Partition**: $130$ images (untouched, best validation loss: $0.0087$, best validation accuracy: $100.00\%$)
* **Internal Test Partition**: $129$ images (untouched, held-out)
* **Preprocessing Pipeline**:
  * Resize to $256 \times 256$ (Bilinear interpolation)
  * CenterCrop to $224 \times 224$
  * ImageNet Normalization ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$)
* **Class Index Order**: `[0: Aphids, 1: Blotch, 2: Healthy, 3: Leaf Spot]`

---

## 2. Quantitative Evaluation Results ($N = 129$)

| Metric | Measured Value | Baseline (Original EfficientNet-B0) | Delta ($\Delta$) |
| :--- | :---: | :---: | :---: |
| **Test Sample Count** | **129** | 129 | 0 |
| **Accuracy** | **99.22%** (128 / 129) | 99.22% (128 / 129) | $+0.00\%$ |
| **Weighted Precision** | **99.25%** | 99.25% | $+0.00\%$ |
| **Weighted Recall** | **99.22%** | 99.22% | $+0.00\%$ |
| **Weighted F1-Score** | **99.23%** | 99.23% | $+0.00\%$ |

---

## 3. Per-Class Performance Breakdown

| Class Index | Class Name | Support ($N_c$) | Precision (%) | Recall (%) | F1-Score (%) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| `0` | **Aphids** | 33 | 100.00% | 100.00% | 100.00% |
| `1` | **Blotch** | 35 | 100.00% | 97.14% | 98.55% |
| `2` | **Healthy** | 32 | 96.97% | 100.00% | 98.46% |
| `3` | **Leaf Spot** | 29 | 100.00% | 100.00% | 100.00% |
| **Total / Avg** | **All Classes** | **129** | **99.25%** | **99.22%** | **99.23%** |

---

## 4. Confusion Matrix

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

### Raw Array:
```python
[[33,  0,  0,  0],
 [ 0, 34,  1,  0],
 [ 0,  0, 32,  0],
 [ 0,  0,  0, 29]]
```

---

## 5. Error Analysis & Misclassified Samples

* **Total Incorrect Predictions**: **1 / 129** ($0.78\%$)

### Misclassified Sample Details:
1. **Filename**: `blotch_(3).jpg`
   * **True Class**: `Blotch`
   * **Predicted Class**: `Healthy`
   * **Prediction Confidence**: `99.92%`
   * **Class Probabilities**:
     * `Aphids`: $0.01\%$ ($0.000111$)
     * `Blotch`: $0.06\%$ ($0.000581$)
     * `Healthy`: $99.92\%$ ($0.999183$)
     * `Leaf Spot`: $0.01\%$ ($0.000125$)

---

## 6. Comparison Against Original EfficientNet-B0 Baseline

| Metric | Original Baseline (`efficientnet_b0_best.pth`) | Clean Model (`efficientnet_b0_clean_best.pth`) | Comparison |
| :--- | :---: | :---: | :---: |
| **Training Set Size** | 606 images (includes 3 noisy samples) | 603 images (3 mislabeled samples excluded) | Noise-free training |
| **Best Validation Loss** | ~0.03 | **0.0087** | Improved validation convergence |
| **Best Validation Accuracy** | 99.23% – 100.00% | **100.00%** | Robust validation performance |
| **Internal Test Accuracy** | **99.22%** (128 / 129) | **99.22%** (128 / 129) | **Identical** |
| **Internal Test Weighted F1** | **99.23%** | **99.23%** | **Identical** |
| **Test Error Distribution** | 1 Blotch misclassified as Healthy | 1 Blotch misclassified as Healthy (`blotch_(3).jpg`) | **Identical error profile** |

### Empirical Conclusion:
* Removing the 3 mislabeled training images (`leaf_spot_(141).jpg`, `leaf_spot_(142).jpg`, `leaf_spot_(144).jpg`) eliminated label noise during training, resulting in lower validation loss ($0.0087$).
* On the held-out 129-image internal test set, the clean model achieves **identical macro/weighted performance ($99.22\%$ accuracy, $99.23\%$ F1)** to the original baseline.
* The clean model does not overfit and generalizes with 100.00% precision and recall on `Aphids` ($33/33$) and `Leaf Spot` ($29/29$).
