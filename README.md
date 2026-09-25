# TurmeriCare AI — Multimodal Crop Pathology & Risk Intelligence System

**TurmeriCare AI** is a farmer-first precision agriculture and research decision-support system designed for real-time foliar disease classification, binary plant specimen verification, feature-space Out-of-Distribution (OOD) domain safeguarding, microclimatic risk forecasting, and localized agronomic advisory in turmeric (*Curcuma longa*) cultivation.

---

## System Architecture

```
                                [ User Foliar Image ]
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │  Stage 1: MobileNetV3-Small Verifier  │
                      │  (Turmeric Leaf Specimen Gatekeeper)  │
                      └───────────────────────────────────────┘
                                   │              │
                   [ Turmeric Leaf Verified ]     [ Non-Turmeric / Out-of-Domain ]
                                   │              │
                                   ▼              ▼
                      ┌────────────────────────┐ ┌─────────────────────────┐
                      │ Stage 2: Mahalanobis   │ │ Reject: Prompt farmer   │
                      │ Distance Safeguard     │ │ for valid turmeric leaf │
                      │ (D_M <= 63.10)         │ └─────────────────────────┘
                      └────────────────────────┘
                                   │
                                   ▼
                      ┌────────────────────────┐
                      │ Stage 3: Dual Ensemble │
                      │ (Soft-Voting α = 0.50) │
                      └────────────────────────┘
                           │              │
                           ▼              ▼
                 [ EfficientNet-B0 ]  [ MobileNetV2 ]
                 (Compound Scaled)    (Edge Latency: 16ms)
                           │              │
                           └───────┬──────┘
                                   ▼
                      [ Canonical 4-Class Output ]
                  (Aphids, Blotch, Healthy, Leaf Spot)
                                   │
                                   ▼
                      ┌────────────────────────┐
                      │ Environmental Engine   │
                      │ (8 Microclimate Factors)
                      └────────────────────────┘
                                   │
                                   ▼
                      ┌────────────────────────┐
                      │ Actionable Advice &    │
                      │ Ask Curcuma RAG Copilot│
                      │ (English & தமிழ்)      │
                      └────────────────────────┘
```

### 1. Two-Stage Computer Vision & Safeguard Pipeline
* **Stage 1 (Plant Specimen Verifier)**: A lightweight MobileNetV3-Small binary classifier trained specifically to confirm the presence of a genuine turmeric leaf specimen before computing disease logits.
* **Stage 2 (Mahalanobis OOD Safeguard Gate)**: Extracts $1280$-dimensional penultimate embeddings $\mathbf{z}(\mathbf{x})$ from frozen EfficientNet-B0. Mahalanobis distance with Ledoit-Wolf shrinkage regularization ($\tau_{98} = 63.10$) protects against arbitrary non-botanical inputs.
* **Stage 3 (Dual-Backbone Ensemble)**: Equal-weighted soft-voting ($\alpha = 0.50$) combining EfficientNet-B0 and MobileNetV2:
  $$\hat{P}_{\text{hybrid}} = 0.50 \cdot P_{\text{EfficientNet}} + 0.50 \cdot P_{\text{MobileNetV2}}$$
* **Canonical Pathology Classes**:
  1. `Aphids` (*Aphis gossypii*)
  2. `Blotch` (*Taphrina maculans*)
  3. `Healthy`
  4. `Leaf Spot` (*Colletotrichum capsici*)

### 2. Agroclimatic Risk Assessment Engine
* Evaluates 8 distinct field parameters: Atmospheric Temperature, Relative Humidity, Rainfall, Leaf Wetness Duration, Soil Moisture, Wind Speed, Solar Radiation, and Crop Canopy Wetness.
* Computes 14-day cumulative moisture and pathogen-favourable exposure indices (hours with $\text{RH} \ge 80\%$, consecutive wetness hours) to estimate environmental disease pressure before visual symptoms peak.

### 3. Ask Curcuma — Agronomic RAG Copilot
* Local generative agronomy assistant with fast semantic retrieval (RAG) and zero-latency local fallback.
* Context-grounded conversation that adapts suggestions based on the farmer's current leaf scan result, active field conditions, and language preference.
* Extension-aligned cultural guidance (TNAU / ICAR / KVK practices) that eliminates pesticide dosage hallucinations and focuses on preventative field sanitation.

### 4. Bilingual Farmer-First Interface
* Complete native bilingual experience (**English** and **தமிழ் / Tamil**).
* Clean separation between practical, non-technical farmer services and deep diagnostic research telemetry.

---

## Application Structure

### Farmer Services (Primary Operational Suite)
* **Home (`/dashboard`)**: Direct overview with immediate access to Scan Leaf, Weather & Risk, Field Check, and Advice.
* **Scan Leaf (`/disease-detection`)**: Fast camera capture or upload with two-stage verification and transparent diagnostic reasoning.
* **Weather & Risk (`/environmental-risk`)**: Live local microclimate conditions, risk classification, and clear explanations for why risk is elevated.
* **Field Check (`/field-conditions`)**: Interactive 8-parameter microclimatic calculator with physical units.
* **Advice (`/recommendations`)**: State-based agronomic guidance, cultural sanitation steps, and collapsible technical details.
* **History (`/prediction-history`)**: Local persistence of past scans with canonical labels and timestamps.

### Research & Validation (Scientific Suite)
* **Model Comparison (`/model-comparison`)**: Verified held-out test benchmarks ($N=129$, $99.22\%$ accuracy) and edge inference latencies ($16\text{ms}$).
* **Dataset Analysis (`/analytics`)**: Partition splits, class balance, and curation protocols.
* **Historical Validation (`/multimodal-analysis`)**: Multimodal risk pipeline traces and historical reanalysis presets.

---

## Repository Directory Structure

```
curcuma/
├── backend/
│   ├── chatbot/              # Ask Curcuma RAG, intent routing, and prompt templates
│   │   ├── genai_service.py  # Ollama LLM integration & streaming SSE pipeline
│   │   ├── knowledge_base.py # Bilingual agronomic corpus & 4-class disease knowledge
│   │   ├── rag_engine.py     # Intent classification, context routing, & dynamic suggestions
│   │   └── routes.py         # FastAPI chatbot endpoints
│   ├── checkpoints/          # Model weights & OOD centroids (excluded from Git)
│   ├── main.py               # FastAPI production server & API routing
│   ├── model.py              # PyTorch backbones, verifier, & Mahalanobis OOD engine
│   ├── test_api.py           # Backend endpoints integration test
│   ├── test_chatbot_4class.py# Chatbot 4-class knowledge & intent verification suite
│   ├── test_ood_production.py# Automated OOD production validation suite
│   └── requirements.txt      # Python dependencies
├── src/                      # Frontend application (React + TypeScript + Vite)
│   ├── components/
│   │   ├── chatbot/          # Ask Curcuma chat launcher, panel, and suggestion chips
│   │   ├── common/           # Shared modals, cards, badges
│   │   └── layout/           # AppLayout, Sidebar, Header
│   ├── context/              # AppContext global state management
│   ├── data/                 # Agroclimatic baseline presets
│   ├── pages/                # 6 Farmer views + 3 Research views
│   ├── services/             # Live weather & inference client services
│   ├── types.ts              # TypeScript domain types & schemas
│   ├── utils/                # Recommendation engine & translations (EN/TA)
│   └── index.css             # Design system tokens and styling
├── research_results/         # Benchmark logs, audit reports, and validation records
├── turmeric_datasets/        # Dataset split manifests and curation scripts
├── package.json              # Node dependencies & build scripts
├── vite.config.ts            # Vite configuration
└── README.md
```

---

## Setup & Execution Guide

### Prerequisites
* **Node.js**: v18+ and npm
* **Python**: 3.10+
* **PyTorch**: 2.2+ (CPU or CUDA-enabled GPU)
* *(Optional)* **Ollama**: For local LLM responses (`ollama pull qwen2.5:3b` or `ollama pull llama3.2`)

---

### 1. Model Weights Placement
Ensure model checkpoints are placed in `backend/checkpoints/`:
* `backend/checkpoints/turmeric_verifier_mobilenetv3.pth` (Stage 1 Verifier)
* `backend/checkpoints/efficientnet_b0_best.pth` (Stage 2 & 3 Backbone)
* `backend/checkpoints/best_model.pth` (MobileNetV2 Secondary Backbone)
* `backend/checkpoints/ood_stats.pt` (Mahalanobis Centroids & Covariance)

---

### 2. Backend Service (FastAPI)
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Start Uvicorn server (from repository root)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend API docs will be available at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Client (Vite + React)
```bash
# 1. Install Node dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build production bundle
npm run build
```
Frontend interface will be accessible at `http://localhost:3000`.

---

### 4. Running Test Suites
```bash
# Test backend inference API
python backend/test_api.py

# Test Mahalanobis OOD safeguard
python backend/test_ood_production.py

# Test Ask Curcuma 4-class knowledge & dynamic intent engine
python -m backend.test_chatbot_4class
```

---

## Scientific Attribution & Extension Guidelines
Agroclimatic threshold mappings and non-chemical management guidelines are derived from validated agricultural extension protocols:
* **TNAU Agritech Portal**: Turmeric Crop Protection & Disease Management.
* **ICAR-IISR (Indian Institute of Spices Research)**: Good Agricultural Practices (GAP) for Turmeric.
