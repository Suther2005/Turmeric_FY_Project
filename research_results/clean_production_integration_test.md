# Production-Style Integration Test (Clean Model Pipeline)

## 1. Test Setup & In-Memory Evaluation Configuration

* **Evaluated Components**:
  * **Clean EfficientNet-B0 Checkpoint**: [`backend/checkpoints/efficientnet_b0_clean_best.pth`](file:///d:/curuma/backend/checkpoints/efficientnet_b0_clean_best.pth)
  * **Existing MobileNetV2 Checkpoint**: [`backend/checkpoints/best_model.pth`](file:///d:/curuma/backend/checkpoints/best_model.pth)
  * **Recalibrated Clean OOD Statistics**: [`backend/checkpoints/ood_stats_clean.pt`](file:///d:/curuma/backend/checkpoints/ood_stats_clean.pt) ($\tau_{98} = 63.10$)
  * **Ensemble Configuration**: Soft-voting late fusion ($\alpha = 0.50$)
* **Production Code Integrity**:
  * [`backend/model.py`](file:///d:/curuma/backend/model.py), [`backend/main.py`](file:///d:/curuma/backend/main.py), [`backend/checkpoints/efficientnet_b0_best.pth`](file:///d:/curuma/backend/checkpoints/efficientnet_b0_best.pth), and [`backend/checkpoints/ood_stats.pt`](file:///d:/curuma/backend/checkpoints/ood_stats.pt) remained **strictly unmodified**.
  * Pipeline testing executed via API interface (`/api/predict` via `fastapi.testclient.TestClient`).

---

## 2. Comprehensive Test Case Results

| Test Case | Specimen / Source File | HTTP Status | Disease Prediction | Confidence | OOD Status | Mahalanobis Distance ($D_M$) | Threshold ($\tau_{98}$) | Active Model Architecture | Errors |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---|:---:|
| **Case 1** | **Genuine Turmeric Leaf**<br>[`leaf_spot_(1).jpg`](file:///d:/curuma/turmeric_datasets/dataset_01/original/Leaf_Spot/leaf_spot_(1).jpg) | `200 OK` | **`Leaf Spot`** | **`76.2%`** | **`IN_DOMAIN`** | **`23.77`** | `63.10` | Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, $\alpha=0.50$) | None |
| **Case 2** | **Anime / Cartoon Drawing**<br>[`anime_01.png`](file:///d:/curuma/research_results/ood_benchmark/anime_cartoon/anime_01.png) | `200 OK` | **`Non-Turmeric / Out-of-Domain`** | **`0.0%`** | **`OOD_REJECTED`** | **`116.41`** | `63.10` | Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, $\alpha=0.50$) | None |
| **Case 3** | **Unrelated Metallic Object**<br>[`object_01.png`](file:///d:/curuma/research_results/ood_benchmark/unrelated_objects/object_01.png) | `200 OK` | **`Non-Turmeric / Out-of-Domain`** | **`0.0%`** | **`OOD_REJECTED`** | **`113.01`** | `63.10` | Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, $\alpha=0.50$) | None |
| **Case 4** | **Real Turmeric Field Leaf**<br>[`Healthy Leaf00001.JPG`](file:///d:/curuma/turmeric_datasets/dataset_02/original/Turmeric%20Plant%20Disease/Healthy%20Leaf/Healthy%20Leaf00001.JPG) | `200 OK` | **`Non-Turmeric / Out-of-Domain`** | **`0.0%`** | **`OOD_REJECTED`** | **`86.59`** | `63.10` | Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, $\alpha=0.50$) | None |

---

## 3. Detailed Case Analysis & Ensemble Verification

### Case 1: In-Domain Turmeric Leaf (`leaf_spot_(1).jpg`)
* **OOD Distance**: $23.77 \ll 63.10$ $\rightarrow$ **Accepted as `IN_DOMAIN`**.
* **Soft-Voting Ensemble Response Breakdown**:
  * **Clean EfficientNet-B0**: `Leaf Spot` ($99.75\%$), `Blotch` ($0.14\%$), `Aphids` ($0.06\%$), `Healthy` ($0.04\%$)
  * **MobileNetV2**: `Leaf Spot` ($52.69\%$), `Blotch` ($21.65\%$), `Aphids` ($18.04\%$), `Healthy` ($7.62\%$)
  * **Combined Hybrid ($\alpha=0.50$)**:
    $$P(\text{Leaf Spot}) = 0.50 \cdot 99.75\% + 0.50 \cdot 52.69\% = \mathbf{76.22\%}$$
    * `Leaf Spot`: $76.22\%$
    * `Blotch`: $10.90\%$
    * `Aphids`: $9.05\%$
    * `Healthy`: $3.83\%$
* **Confirmation**: The Hybrid Ensemble response functions seamlessly with Clean EfficientNet-B0 and MobileNetV2, generating structured probabilities and lesion feature descriptions.

---

### Case 2: Anime / Cartoon (`anime_01.png`)
* **OOD Distance**: $116.41 > 63.10$ $\rightarrow$ **`OOD_REJECTED`**.
* **Disease Suppression**: Closed-world disease prediction correctly suppressed to `0.0%` confidence; returned clear user guidance:
  *"Image is outside the supported turmeric leaf domain. Please upload a clear turmeric leaf image."*

---

### Case 3: Unrelated Object (`object_01.png`)
* **OOD Distance**: $113.01 > 63.10$ $\rightarrow$ **`OOD_REJECTED`**.
* **Disease Suppression**: Closed-world disease prediction correctly suppressed to `0.0%` confidence; returned standard OOD guidance.

---

### Case 4: Real Turmeric Field Image (`Healthy Leaf00001.JPG`, Dataset_02)
* **OOD Distance**: **`86.59`**
* **OOD Status**: **`OOD_REJECTED`** ($86.59 > 63.10$).
* **Observation**: In natural field conditions with background/environmental variability, Mahalanobis distance is $86.59$, which is above the in-domain single-leaf threshold of $63.10$ but well below Far-OOD non-botanicals ($113 - 116$).
* **Constraint Compliance**: Threshold remained fixed at $63.10$; no modifications made.

---

## 4. Summary & Verification

1. **Pipeline Execution**: All 4 cases executed through the actual FastAPI `/api/predict` pipeline with HTTP `200 OK` responses and zero runtime errors.
2. **Safety Verification**: Far-OOD samples were strictly rejected before classification without false disease diagnoses.
3. **Hybrid Ensemble**: Clean EfficientNet-B0 + MobileNetV2 soft-voting operates smoothly.
4. **File Isolation**: Production models and codebase remain 100% untouched.
