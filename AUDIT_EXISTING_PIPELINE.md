# Audit of Existing Pipeline & Architectural Verification Layer
**Project:** TurmeriCare AI / Curcuma AI  
**System Type:** 3-Stage Hierarchical Botanical Pathology & Decision-Support System  
**Audit Date:** September 23, 2026  

---

## Executive Summary

A comprehensive code-level and artifact-level audit was conducted across the entire Curcuma AI codebase to analyze the end-to-end inference flow, foliar verification gating, out-of-distribution (OOD) safeguards, and downstream disease classification ensemble.

### Key Audit Findings
1. **Stage-1 Verifier Status:** **ALREADY IMPLEMENTED & ACTIVE**. A dedicated MobileNetV3-Small binary botanical classifier (`turmeric_leaf_verifier_mobilenetv3.pth`) is integrated at the very first step of server-side inference (`backend/model.py`).
2. **Short-Circuit Enforcement:** **VERIFIED**. When Stage 1 rejects an image ($\text{score} < \tau_{\text{verifier}} = 0.50$), inference terminates immediately (~17.5 ms). The downstream disease classifiers (EfficientNet-B0 and MobileNetV2) are **NEVER** invoked (0 invocations).
3. **Stage-2 OOD Safeguard Status:** **ALREADY IMPLEMENTED & ACTIVE**. Mahalanobis distance calculated on 1,280-dimensional penultimate embeddings extracted from frozen EfficientNet-B0 with Ledoit-Wolf shrinkage covariance ($\tau_{\text{OOD}} = 63.10$, 98th percentile of in-domain train embeddings).
4. **Stage-3 Disease Classifier Status:** **ALREADY IMPLEMENTED & ACTIVE**. Equal-weighted late-fusion soft voting ($\alpha = 0.50$) combining EfficientNet-B0 and MobileNetV2 across 4 classes (*Aphids*, *Blotch*, *Healthy*, *Leaf Spot*).
5. **Architectural Integrity:** No architectural replacement or new deep learning model is required. The system cleanly distinguishes Stage 1 (Botanical Foliar Presence), Stage 2 (Feature Space Proximity / OOD), and Stage 3 (Pathology Diagnosis).

---

## 1. 25-Point Architectural Audit

| # | System Component | Implementation Details | File Location |
|---|---|---|---|
| **1** | **Frontend Framework** | React 18.3.1 with Vite, TypeScript, Tailwind CSS, Lucide Icons | `package.json`, `src/App.tsx` |
| **2** | **Camera Implementation** | Direct WebRTC `navigator.mediaDevices.getUserMedia` with environment/user lens switching and canvas capture | `src/pages/DiseaseDetectionPage.tsx` |
| **3** | **Image-Upload Implementation** | Drag-and-drop & native file picker supporting JPG, JPEG, PNG, WEBP (up to 20 MB) | `src/pages/DiseaseDetectionPage.tsx` |
| **4** | **Image Preprocessing (Frontend)** | Canvas pixel extraction and in-memory Blob conversion with instant preview | `src/pages/DiseaseDetectionPage.tsx` |
| **5** | **Backend Framework** | FastAPI 0.115.0 + Starlette running on Uvicorn with threadpool worker offloading | `backend/main.py` |
| **6** | **Prediction API Endpoint** | `POST /api/predict` (multipart file upload with strict MIME & size validation) | `backend/main.py` |
| **7** | **Disease Classification Model** | Hybrid late-fusion soft-voting ensemble: $P_{\text{hybrid}} = 0.50 \cdot P_{\text{EffB0}} + 0.50 \cdot P_{\text{MobV2}}$ | `backend/model.py` |
| **8** | **Model Checkpoints** | `best_model.pth` (MobileNetV2, 9.15 MB), `efficientnet_b0_best.pth` (16.35 MB) | `backend/checkpoints/` |
| **9** | **Stage-1 Verification Model** | MobileNetV3-Small binary foliar classifier (`turmeric_leaf_verifier_mobilenetv3.pth`, 4.43 MB) | `backend/checkpoints/` |
| **10** | **Stage-2 OOD Detection** | Mahalanobis distance on EfficientNet-B0 penultimate features (`ood_stats.pt`, 20.29 MB) | `backend/checkpoints/` |
| **11** | **Preprocessing Pipeline** | Resize(256, 256) $\to$ CenterCrop(224, 224) $\to$ ToTensor() $\to$ ImageNet Normalization | `backend/model.py` |
| **12** | **Class Labels** | 4 Target Classes: `[Aphids, Blotch, Healthy, Leaf Spot]` | `backend/model.py` |
| **13** | **Dataset Structure** | 1,488 Total curated images (DS01: 865 + DS02: 623); Clean splits: Train 603, Val 130, Test 129 | `turmeric_datasets/` |
| **14** | **Training Scripts** | `train_efficientnet_clean.py`, `train.py`, `turmeric_datasets/scripts/train_verifier.py` | `backend/`, `turmeric_datasets/scripts/` |
| **15** | **Inference Scripts** | `DiseaseInferenceEngine.predict_image_bytes()` in `backend/model.py` | `backend/model.py` |
| **16** | **Confidence Handling** | Softmax class probabilities multiplied by 100.0, rounded to 1 decimal place | `backend/model.py` |
| **17** | **Threshold Handling** | Verifier: $\tau_{\text{verifier}} = 0.50$; OOD Safeguard: $\tau_{\text{OOD}} = 63.10$; Ensemble weight: $\alpha = 0.50$ | `backend/model.py` |
| **18** | **API Response Schema** | Structured JSON exposing `disease`, `confidence`, `probabilities`, `verification_status`, `verifier_score`, `ood_status`, `mahalanobis_distance`, `individual_predictions` | `backend/main.py`, `backend/model.py` |
| **19** | **Frontend Result Handling** | Intercepts `VERIFIER_REJECTED` and `OOD_REJECTED` to suppress disease outputs and show foliar guidance | `src/pages/DiseaseDetectionPage.tsx` |
| **20** | **Severity Modules** | Deterministic symptom severity derived from confidence, class lesion morphology, and weather exposure | `src/utils/riskCalculator.ts` |
| **21** | **Explainability Modules** | Dual-tier explainability: Class-specific visual symptom traits + 336-hour meteorological feature breakdown | `src/pages/RecommendationsPage.tsx` |
| **22** | **Environmental Risk Engine** | Deterministic 14-day cumulative exposure engine (hours RH > 85%, temp 22-32°C, rainfall accumulation) | `src/utils/researchRiskEngine.ts` |
| **23** | **Recommendation System** | TNAU CPPS & ICAR-IISR aligned disease-specific cultural, biological, and extension advisory | `src/pages/RecommendationsPage.tsx` |
| **24** | **History System** | Client-persisted immutable diagnostic snapshots with complete prediction-time context | `src/pages/PredictionHistoryPage.tsx` |
| **25** | **Deployment Architecture** | FastAPI ASGI server (port 8000) + Vite React SPA (port 3000) with full CORS integration | `backend/main.py`, `vite.config.ts` |

---

## 2. Specific Audit Questions Answered

### Q1: Is a turmeric-vs-non-turmeric verifier already implemented?
**Yes.** A dedicated `TurmericLeafVerifier` architecture based on `mobilenet_v3_small` with custom projection head (`Linear(576, 256) -> Hardswish -> Dropout(0.2) -> Linear(256, 1)`) is implemented in `backend/model.py`.

### Q2: Which model is used and where is its checkpoint?
**Model:** MobileNetV3-Small (Binary Logistic Foliar Classifier).  
**Checkpoint:** `backend/checkpoints/turmeric_leaf_verifier_mobilenetv3.pth` (4.43 MB).

### Q3: How is its threshold determined?
The threshold was calibrated using validation sweep across $\tau \in [0.05, 0.95]$ on isolated validation set ($N = 233$, 130 positive, 103 negative). It achieves symmetric optimum at $\tau = 0.50$ (100% accuracy, 100% precision, 100% recall on validation split).

### Q4: Is it called before disease classification?
**Yes.** In `DiseaseInferenceEngine.predict_image_bytes()`, the image tensor is passed to `self.verifier_model` first. If `verifier_prob < self.verifier_threshold (0.50)`, the function returns `VERIFIER_REJECTED` and halts execution immediately.

### Q5: Is Mahalanobis OOD already implemented?
**Yes.** Stage 2 evaluates minimum Mahalanobis distance across the 4 class centroids computed from 1,280-dimensional penultimate embeddings of EfficientNet-B0 using the Ledoit-Wolf precision matrix stored in `backend/checkpoints/ood_stats.pt`.

### Q6: What exactly does the current OOD gate do?
If Stage 1 accepts the image as botanical foliar imagery, Stage 2 checks whether the image's feature representation lies within the in-domain training distribution ($\text{Distance} \le 63.10$). If distance $> 63.10$, it rejects with `OOD_REJECTED`.

### Q7: Which part should be reused?
The entire 3-stage inference pipeline (`MobileNetV3-Small` verifier $\to$ `Mahalanobis OOD` $\to$ `EfficientNet-B0 + MobileNetV2` hybrid ensemble) is validated and fully functional. It is completely preserved and reused.

### Q8: What functionality was actually missing?
No backend ML components were missing. The only required enhancement was clarifying the frontend UI states and ensuring documentation accurately captures the distinction between Stage 1 (Foliar Verification) and Stage 2 (Distributional OOD Gating).

---

## 3. Structural Decision Flowchart

```
Uploaded / Captured Leaf Specimen
                │
                ▼
   Preprocessing (256x256 -> 224x224)
                │
                ▼
  [STAGE 1: BOTANICAL FOLIAR VERIFIER]
      MobileNetV3-Small (tau = 0.50)
                │
        ┌───────┴───────┐
        │               │
  Score < 0.50    Score >= 0.50
        │               │
        ▼               ▼
  REJECT & STOP   [STAGE 2: MAHALANOBIS OOD SAFEGUARD]
 (0 Downstream     EfficientNet-B0 Penultimate Features
  Invocations)          (tau_98 = 63.10)
                        │
                ┌───────┴───────┐
                │               │
          Dist > 63.10    Dist <= 63.10
                │               │
                ▼               ▼
          REJECT & STOP   [STAGE 3: HYBRID ENSEMBLE]
         (Non-Turmeric)    0.50 * EffB0 + 0.50 * MobV2
                                │
                                ▼
                       Disease Classification
                  (Aphids, Blotch, Healthy, Leaf Spot)
```
