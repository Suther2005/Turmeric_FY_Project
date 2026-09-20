# Model Checkpoints Directory

This directory stores trained deep learning model weights and Out-of-Distribution (OOD) safeguard parameters for the **TurmeriCare AI** backend service.

## Checkpoint Architecture & Naming Conventions

Due to GitHub repository size constraints and binary versioning best practices, `.pth` and `.pt` model checkpoint files are excluded from Git version control.

The inference service expects the following files located in `backend/checkpoints/`:

| Filename | Architecture / Role | Input Spec | Source Dataset / Manifest |
|---|---|:---:|---|
| **`efficientnet_b0_best.pth`** | Primary Classification Backbone (Clean EfficientNet-B0) | $224 \times 224 \times 3$ | Dataset 01 (603 clean images, noise-free) |
| **`best_model.pth`** | Edge-Optimized Backbone (MobileNetV2) | $224 \times 224 \times 3$ | Dataset 01 (4 classes) |
| **`ood_stats.pt`** | Mahalanobis Safeguard Parameters ($\boldsymbol{\mu}_c, \boldsymbol{\Sigma}_{\text{LW}}^{-1}, \tau_{98}=63.10$) | 1280-dim Penultimate Embeddings | Dataset 01 Clean Training Split ($N=603$) |

## Soft-Voting Hybrid Ensemble Formulation

The backend combines predictions via soft-voting late fusion ($\alpha = 0.50$):
$$\hat{P}_{\text{hybrid}} = 0.50 \cdot P_{\text{EfficientNet}} + 0.50 \cdot P_{\text{MobileNetV2}}$$

## Out-of-Distribution (OOD) Domain Safeguard

Prior to computing disease classification, the inference engine computes the minimum Mahalanobis distance to class centroids:
$$D_M(\mathbf{x}) = \min_{c \in \{0,1,2,3\}} \sqrt{(\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)^T \boldsymbol{\Sigma}_{\text{LW}}^{-1} (\mathbf{z}(\mathbf{x}) - \boldsymbol{\mu}_c)}$$
If $D_M(\mathbf{x}) > 63.10$, the engine returns `OOD_REJECTED` and suppresses disease diagnosis.
