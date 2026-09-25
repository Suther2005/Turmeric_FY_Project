# Removal & Consolidation Audit
**Project:** TurmeriCare AI / Curcuma AI  
**Audit Date:** September 24, 2026  

---

## 1. Deprecated / Superseded Components Audited

| Component / File | Previous Role | Current Status / Action Taken | Rationale |
|---|---|---|---|
| `src/pages/MyFieldPage.tsx` | Legacy field information page | **Superseded by `SeasonalAdvisoryPage.tsx`** | Consolidates monthly agroclimatic context, crop stage, and field scouting into a single farmer-first page. Route `/my-field` is mapped to `SeasonalAdvisoryPage`. |
| `src/pages/MultimodalAnalysisPage.tsx` | Research-oriented intermediate fusion dashboard | **Relegated from Farmer Navigation** | Farmer flow goes directly from `Check Leaf` $\to$ `Recommendations`. Multimodal fusion terminology removed from farmer-facing surface. |
| Hardcoded Chemical Prescriptions | Unsupported pesticide dosage grams in seasonal cards | **Removed from Seasonal Advisory** | Chemical management is strictly disease-specific on `RecommendationsPage` and defers to TNAU/ICAR-IISR and product labels. |
| Duplicate Live Weather Cards | Repeated raw temperature/RH cards in Seasonal Advisory | **Removed from Seasonal Advisory** | Canonical home for meteorological metrics is `Weather & Risk` (`/environmental-risk`). Seasonal advisory displays a concise summary and navigation link. |
| Fake Initial Prediction History | Static 128 mock scan counts | **Verified Removed (`[]`)** | History initializes empty and populates strictly with authentic user-initiated scans. |

---

## 2. Information Ownership Partitioning

To eliminate duplicate content across pages, every piece of information is assigned a single primary home:

- **Live Meteorological Measurements $\to$ `Weather & Risk` (`/environmental-risk`)**
- **Manual In-Field Parameter Input $\to$ `Field Conditions` (`/field-conditions`)**
- **Monthly Agroclimate & Crop Stage $\to$ `Seasonal Advisory` (`/seasonal-advisory`)**
- **Pathology Diagnosis & Gating $\to$ `Check Leaf` (`/disease-detection`)**
- **Disease-Specific Action Protocols $\to$ `Recommendations` (`/recommendations`)**
- **Prior Diagnostic Records $\to$ `History` (`/history`)**
- **Architecture & Metrics Comparison $\to$ `Model Comparison` (`/model-comparison`)**
