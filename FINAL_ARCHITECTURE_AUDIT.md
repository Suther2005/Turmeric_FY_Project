# Final Architecture Audit & System Specification
**Project:** TurmeriCare AI / Curcuma AI  
**Scope:** Complete End-to-End Multimodal Crop Intelligence & Risk Assessment  
**Audit Date:** September 24, 2026  

---

## 1. System Architecture Blueprint

```
                          FARMER / CLIENT (Web Browser)
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
      [📷 Check Leaf]                                [🌦️ Weather & Risk]
(Foliar Photo Upload / WebRTC)                 (Open-Meteo 14-day Location API)
              │                                               │
              ▼                                               ▼
[STAGE 1: BOTANICAL FOLIAR VERIFIER]           [ENVIRONMENTAL EXPOSURE ENGINE]
 (MobileNetV3-Small, tau = 0.50)                (Deterministic Rule-Based:
              │                                  Hours RH>85%, Temp 22-32°C, Rain)
      ┌───────┴───────┐                                       │
      │               │                                       │
  Rejected         Accepted                                   │
      │               │                                       │
      ▼               ▼                                       │
 REJECT & STOP  [STAGE 2: MAHALANOBIS OOD SAFEGUARD]          │
(0 Downstream)   (EfficientNet-B0 Penultimate Features,        │
                 tau_98 = 63.10)                              │
                      │                                       │
              ┌───────┴───────┐                               │
              │               │                               │
          Rejected         Accepted                           │
              │               │                               │
              ▼               ▼                               │
        REJECT & STOP  [STAGE 3: PATHOLOGY ENSEMBLE]          │
        (Non-Turmeric)  (Soft-Voting Late Fusion:             │
                        0.50 * EffB0 + 0.50 * MobV2)          │
                              │                               │
                              ▼                               │
                     [DISEASE DIAGNOSIS]                      │
                     (Confidence, Class Probs)                │
                              │                               │
                              └───────────────┬───────────────┘
                                              │
                                              ▼
                                 [RECOMMENDATION ENGINE]
                            (Dynamic Disease x Weather Context:
                             Cultural, Biological, Extension)
                                              │
                                              ▼
                                  [FARMER ACTION & CARE]
```

---

## 2. Canonical Information & Module Boundaries

| Module | Route | Primary Responsibility | Data Source |
|---|---|---|---|
| **Home / Dashboard** | `/dashboard` | Executive summary, morning weather card, compact seasonal card, quick-action CTAs | Aggregated from AppContext |
| **Check Leaf** | `/disease-detection` | Foliar specimen upload/camera, Stage-1 verification, Stage-2 OOD check, 4-class disease classification | Live backend inference (`/api/predict`) |
| **Weather & Risk** | `/environmental-risk` | Location selector, live temperature, humidity, rainfall, wind, 14-day hourly charts, environmental risk evaluation | Open-Meteo live API |
| **Seasonal Advisory** | `/seasonal-advisory` | Current month context, dynamic DAP/crop stage, expected stage development, normal vs abnormal comparison, scouting checklist | TNAU CPPS (`SRC-01`), ICAR-AICRPS (`SRC-02`) |
| **Field Conditions** | `/field-conditions` | Manual entry of 8 on-site microclimate parameters with instant recalculated risk | User runtime manual input |
| **Recommendations** | `/recommendations` | Disease-specific IPM protocols, cultural sanitation, biological control, explainability, technical exposure breakdown | Dynamic combination of diagnosis & weather |
| **History** | `/history` | Immutable chronological log of previous foliar diagnoses and prediction-time environmental snapshots | Local storage persistence |
| **Model Comparison** | `/model-comparison` | Benchmark comparison of EfficientNet-B0, MobileNetV2, and Hybrid Ensemble on $N=129$ test split | Validated benchmark data |
| **Dataset Analysis** | `/analytics` | Analysis of user diagnosis distribution and environmental exposure trends | Dynamic user history aggregation |

---

## 3. Data Flow & Integrity Verification

1. **No Fabricated Data:** Planting date is unset by default (`"Crop age unavailable"`). Weather failures display graceful unavailable states.
2. **Deterministic Risk Assessment:** Heuristic Decision Support Index is explicitly presented as a decision aid rather than a calibrated posterior probability.
3. **Immutable History Snapshots:** Prior check records retain their original timestamped context and are not retroactively altered by subsequent weather fetches.
