# TurmeriCare AI — Multimodal Crop Pathology & Risk Intelligence System

**TurmeriCare AI (Curuma)** is an intelligent precision agriculture system designed for real-time foliar disease classification, feature-space Out-of-Distribution (OOD) domain safeguarding, and environmental risk assessment in turmeric (*Curcuma longa*) cultivation.

---

## Key System Architecture

```
                                  [ User Foliar Image ]
                                            │
                                            ▼
                           ┌──────────────────────────────────┐
                           │  Mahalanobis OOD Safeguard Gate  │
                           │     (D_M > 63.10 Threshold)      │
                           └──────────────────────────────────┘
                                     │              │
                   [ D_M <= 63.10: IN_DOMAIN ]   [ D_M > 63.10: OOD_REJECTED ]
                                     │              │
                                     ▼              ▼
                      ┌─────────────────────────┐  ┌─────────────────────────┐
                      │     Hybrid Ensemble     │  │ Suppress Classification │
                      │  (Soft-Voting α = 0.50) │  │  Prompt for valid leaf   │
                      └─────────────────────────┘  └─────────────────────────┘
                            │              │
                            ▼              ▼
                 [ EfficientNet-B0 ]  [ MobileNetV2 ]
                 (Clean Backbone)     (Edge-Optimized)
                            │              │
                            └───────┬──────┘
                                    ▼
                      [ Final 4-Class Prediction ]
                   (Aphids, Blotch, Healthy, Leaf Spot)
                                    │
                                    ▼
                      ┌─────────────────────────┐
                      │ Environmental Risk Engine│
                      │  (Multimodal Fusion)    │
                      └─────────────────────────┘
                                    │
                                    ▼
                      [ Bilingual Guidance UI ]
                         (English & தமிழ்)
```

### 1. Dual-Backbone Hybrid Ensemble
* **Clean EfficientNet-B0**: Primary feature-rich pathology classifier retrained on verified noise-free dataset partitions.
* **MobileNetV2**: Edge-optimized secondary classifier providing soft-voting variance reduction.
* **Late Fusion Soft-Voting ($\alpha = 0.50$)**:
  $$\hat{P}_{\text{hybrid}} = 0.50 \cdot P_{\text{EfficientNet}} + 0.50 \cdot P_{\text{MobileNetV2}}$$
* **Target Pathology Classes**: `Aphids`, `Blotch`, `Healthy`, `Leaf Spot`.

### 2. Mahalanobis Feature-Space OOD Safeguard
* Protects against closed-world Softmax vulnerability when non-turmeric images (anime, faces, UI screens, metallic objects) are submitted.
* Extracts $1280$-dimensional penultimate embeddings $\mathbf{z}(\mathbf{x})$ from frozen EfficientNet-B0.
* Centroids $\boldsymbol{\mu}_c$ and Ledoit-Wolf regularized covariance $\boldsymbol{\Sigma}_{\text{LW}}^{-1}$ fitted strictly on training data.
* **Calibrated Decision Boundary**: $\tau_{98} = 63.10$. Far-OOD non-botanical rejection rate: $100\%$.

### 3. Multimodal Environmental Risk Engine
* Integrates atmospheric temperature, relative humidity, rainfall, and leaf wetness duration.
* Fuses foliar vision detections with microclimatic risk indices to provide actionable bilingual agronomic treatment recommendations.

### 4. Bilingual Farmer-Facing Interface
* Native bilingual support (**English** & **தமிழ் / Tamil**) designed for ease of comprehension in rural and field operations.

---

## Project Directory Structure

```
curuma/
├── backend/
│   ├── checkpoints/          # Model checkpoint directory (weights excluded from Git)
│   │   └── README.md         # Checkpoint placement instructions
│   ├── main.py               # FastAPI production inference server
│   ├── model.py              # Neural network models, transforms, & OOD engine
│   ├── train.py              # Baseline model training script
│   ├── train_backup.py       # Safe backup of training configurations
│   ├── train_efficientnet_clean.py # Noise-free EfficientNet-B0 retraining script
│   ├── test_api.py           # Backend unit test suite
│   ├── test_ood_production.py # Automated OOD production verification
│   └── requirements.txt      # Python dependencies
├── src/                      # Frontend source code (React + TypeScript + Vite)
│   ├── components/           # Reusable UI components
│   ├── context/              # Application state and context providers
│   ├── pages/                # Disease detection, environmental risk, analytics views
│   ├── types.ts              # TypeScript interfaces & API schemas
│   └── index.css             # Vanilla / Tailwind design system tokens
├── research_results/         # Research audit reports, benchmark datasets, evaluation tables
│   ├── CLEAN_MODEL_PRODUCTION_DEPLOYMENT.md
│   ├── clean_hybrid_evaluation.md
│   ├── ood_recalibration_clean.md
│   ├── FINAL_RESEARCH_VALIDATION_AUDIT.md
│   └── ood_benchmark/        # Standardized 50-image OOD evaluation dataset
├── environmental_data/       # Curated agroclimatic indices and risk matrices
├── turmeric_datasets/
│   ├── metadata/             # Clean dataset manifests and partition CSVs
│   └── annotations/          # Ground truth audit records
├── package.json              # Frontend dependencies
├── vite.config.ts            # Vite build configuration
├── .gitignore                # Exclusion rules for checkpoints, datasets, caches
└── README.md
```

---

## Setup & Execution Guide

### Prerequisites
* **Node.js**: v18+ and npm
* **Python**: 3.10+
* **PyTorch**: 2.2+ (CPU or CUDA-enabled GPU)

---

### 1. Model Weights Setup
Download or train the model checkpoints and place them in `backend/checkpoints/`:
* `backend/checkpoints/efficientnet_b0_best.pth`
* `backend/checkpoints/best_model.pth`
* `backend/checkpoints/ood_stats.pt`

*(See [`backend/checkpoints/README.md`](backend/checkpoints/README.md) for full architecture specifications).*

---

### 2. Backend Service (FastAPI)
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run backend inference server (from repository root)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend API will be accessible at `http://127.0.0.1:8000`.

---

### 3. Frontend Application (Vite + React)
```bash
# Install Node dependencies
npm install

# Run Vite development server
npm run dev

# Build for production
npm run build
```
Frontend interface will be accessible at `http://localhost:3000`.

---

### 4. Running Automated Tests
```bash
# Run backend API unit tests
python backend/test_api.py

# Run live OOD safeguard verification
python backend/test_ood_production.py
```

---

## Citation & Research Manifests
All training partitions, validation splits, and audit manifests are documented in [`research_results/`](research_results/) and [`turmeric_datasets/metadata/`](turmeric_datasets/metadata/).
