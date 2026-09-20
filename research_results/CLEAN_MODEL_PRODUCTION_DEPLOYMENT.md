# Production Deployment Report: Clean Pathology Model & OOD Safeguard

## 1. Deployment Executive Summary

* **Deployment Date & Time**: 2026-09-20T18:09:00+05:30
* **Deployment Scope**: Production replacement of `EfficientNet-B0` and `Mahalanobis OOD Statistics` with versions trained exclusively on the verified **603-image clean dataset manifest** (excluding $3$ confirmed mislabeled images: `leaf_spot_(141).jpg`, `leaf_spot_(142).jpg`, `leaf_spot_(144).jpg`).
* **Active Ensemble Architecture**: `Hybrid Ensemble (Clean EfficientNet-B0 + MobileNetV2, alpha=0.50)`
* **Active OOD Gate**: Mahalanobis Distance on frozen Clean EfficientNet-B0 Penultimate Embeddings with Ledoit-Wolf Covariance Regularization ($\tau_{98} = 63.10$).
* **Deployment Status**: **SUCCESSFUL & FULLY VERIFIED** (Zero regressions).

---

## 2. Pre-Deployment Backup Verification

Before applying any modifications, full binary copies of the original production assets were archived:

| Original Production File | Backup Destination | Size (Bytes) | SHA-Verified Status |
|---|---|:---:|:---:|
| `backend/checkpoints/efficientnet_b0_best.pth` | [`backend/checkpoints/efficientnet_b0_best_backup_original.pth`](file:///d:/curuma/backend/checkpoints/efficientnet_b0_best_backup_original.pth) | $16,354,053$ | **Archived** |
| `backend/checkpoints/ood_stats.pt` | [`backend/checkpoints/ood_stats_backup_original.pt`](file:///d:/curuma/backend/checkpoints/ood_stats_backup_original.pt) | $20,153,785$ | **Archived** |

---

## 3. Production Checkpoint Replacement Matrix

| File Target | Source Artifact | File Size | Description |
|---|---|:---:|---|
| [`backend/checkpoints/efficientnet_b0_best.pth`](file:///d:/curuma/backend/checkpoints/efficientnet_b0_best.pth) | `efficientnet_b0_clean_best.pth` | $16,351,577$ | Retrained EfficientNet-B0 on 603 clean images (Val Loss: $0.0087$, Val Acc: $100.00\%$) |
| [`backend/checkpoints/ood_stats.pt`](file:///d:/curuma/backend/checkpoints/ood_stats.pt) | `ood_stats_clean.pt` | $20,295,325$ | Recalibrated class centroids ($\mu_c$) & Ledoit-Wolf precision matrix ($\tau_{98} = 63.10$) |
| [`backend/checkpoints/best_model.pth`](file:///d:/curuma/backend/checkpoints/best_model.pth) | *(Original preserved)* | $9,157,451$ | **MobileNetV2 remained 100% untouched** |

---

## 4. Key Configurations & Preserved Components

1. **MobileNetV2**: Untouched and operating as secondary soft-voting voter.
2. **Hybrid Ensemble Weight ($\alpha$)**: Preserved at $\alpha = 0.50$ ($50\%$ Clean EfficientNet-B0 $+ 50\%$ MobileNetV2).
3. **Calibrated OOD Threshold**: Set to $\tau_{98} = 63.10$ ($P_{98}$ on the 130-image validation partition).
4. **Internal Test Set ($N = 129$)**: Remained completely untouched and unexposed during retraining and calibration.
5. **Architectural Purity**: No YOLO, no segmentation, no heuristic foliar gating as primary rejection.

---

## 5. Regression & Integration Test Verification

The live production deployment underwent comprehensive automated regression testing:

### A. Backend API Unit Tests (`backend/test_api.py`)
* `test_health`: **PASSED** (`online`, 4 target classes)
* `test_model_info`: **PASSED** (reports `Hybrid Ensemble`, `alpha=0.50`, `ood_threshold=63.10`)
* `test_predict_valid_image`: **PASSED** (`IN_DOMAIN`, `Leaf Spot`, confidence $> 0.0$, 4 probabilities)
* `test_predict_ood_rejection`: **PASSED** (`OOD_REJECTED`, confidence $0.0\%$, standard user message)
* `test_predict_invalid_extension`: **PASSED** (HTTP 400 Bad Request)
* `test_predict_corrupt_image`: **PASSED** (HTTP 400 Bad Request)
* `test_predict_empty_file`: **PASSED** (HTTP 400 Bad Request)

### B. Production OOD Verification Suite (`backend/test_ood_production.py`)
* **Valid Turmeric Leaf** (`leaf_spot_(1).jpg`): $D_M = 23.77 \le 63.10 \rightarrow \mathbf{IN\_DOMAIN}$ (`200 OK`, `Leaf Spot` $76.2\%$)
* **Anime / Cartoon** (`anime_01.png`): $D_M = 116.41 > 63.10 \rightarrow \mathbf{OOD\_REJECTED}$ (`200 OK`, `0.0%` conf, disease suppressed)
* **Unrelated Object** (`object_01.png`): $D_M = 113.01 > 63.10 \rightarrow \mathbf{OOD\_REJECTED}$ (`200 OK`, `0.0%` conf, disease suppressed)

### C. 4-Class Pathological Disease Verification (Live API)
* `Aphids`: Predicted **`Aphids`** (Confidence: $76.6\%$, $D_M = 42.43 \le 63.10$, `IN_DOMAIN`)
* `Blotch`: Predicted **`Blotch`** (Confidence: $84.8\%$, $D_M = 22.17 \le 63.10$, `IN_DOMAIN`)
* `Healthy`: Predicted **`Healthy`** (Confidence: $91.7\%$, $D_M = 20.95 \le 63.10$, `IN_DOMAIN`)
* `Leaf Spot`: Predicted **`Leaf Spot`** (Confidence: $76.2\%$, $D_M = 23.77 \le 63.10$, `IN_DOMAIN`)

### D. Frontend Build Verification (`npm run build`)
* **Vite Build**: Transformed 2231 modules and built production bundle in $5.79\text{s}$ with **zero errors**.

---

## 6. Live API Verification Metadata

```json
{
  "status": "online",
  "model_architecture": "Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, alpha=0.50)",
  "ood_safeguard_enabled": true,
  "ood_threshold": 63.1,
  "device": "cpu",
  "target_classes": ["Aphids", "Blotch", "Healthy", "Leaf Spot"]
}
```

---

## 7. Rollback Protocol (Emergency Procedure)

If any production anomaly is detected:
```powershell
Copy-Item 'backend/checkpoints/efficientnet_b0_best_backup_original.pth' 'backend/checkpoints/efficientnet_b0_best.pth' -Force
Copy-Item 'backend/checkpoints/ood_stats_backup_original.pt' 'backend/checkpoints/ood_stats.pt' -Force
```
Restart backend service. Rollback can be executed in $< 5\text{ seconds}$.
