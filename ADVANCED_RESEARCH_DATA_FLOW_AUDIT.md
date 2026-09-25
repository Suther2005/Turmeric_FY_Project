# Advanced & Research Section: Strict Data-Flow Audit

**Project:** Curcuma AI  
**Audit Date:** September 24, 2026  
**Scope:** Complete inspection of all routes, pages, components, data streams, and displayed values in the Advanced / Research section.

---

## 1. Inventory of Advanced & Research Routes & Components

| Route | Page Component | Sidebar Title | Purpose / Scope | Primary Data Flow |
| :--- | :--- | :--- | :--- | :--- |
| `/model-comparison` | [`ModelComparisonPage.tsx`](file:///d:/curuma/src/pages/ModelComparisonPage.tsx) | Model Comparison (`மாதிரி ஒப்பீடு`) | Benchmarking neural backbones against frozen test set and developmental baselines. | Static scientific evaluation constants & developmental benchmark arrays. |
| `/analytics` | [`AnalyticsPage.tsx`](file:///d:/curuma/src/pages/AnalyticsPage.tsx) | Dataset Analysis (`தரவுத்தொகுப்பு பகுப்பாய்வு`) | Session telemetry, dynamic scan distributions, mean confidence by class, and live weather trends. | Dynamic calculation from `predictionHistory` and `liveHourlyRecords` (Open-Meteo). |
| `/multimodal-analysis` | [`MultimodalAnalysisPage.tsx`](file:///d:/curuma/src/pages/MultimodalAnalysisPage.tsx) | Historical Validation (`வரலாற்று சரிபார்ப்பு`) | Holistic crop risk evaluation integrating visual diagnosis, environmental risk, and seasonal context. | Dynamic calculation via heuristic late-fusion engine (`riskCalculator.ts`). |
| `/environmental-risk` *(Collapsible Research Drawer)* | [`EnvironmentalRiskPage.tsx`](file:///d:/curuma/src/pages/EnvironmentalRiskPage.tsx#L544-L720) | Weather & Risk *(Advanced Details)* | Historical ERA5-Land reanalysis presets, 336-hour exposure vector, and research debug telemetry trace. | Dynamic calculation from 336-hour hourly time series (`live_weather` or `historical_reanalysis`). |
| Modal (Global) | [`DetailedReportModal.tsx`](file:///d:/curuma/src/components/common/DetailedReportModal.tsx) | Diagnostics Report | Printable modal view of diagnostic records from scan history. | Dynamic consumption of active `PredictionHistoryRecord`. |

---

## 2. Comprehensive Data-Flow Audit Table

| Page | Component / Section | Displayed Value | Source File / Identifier | Live/Dynamic | Historical | Static Scientific | Hardcoded/Demo | Verification Status | Notes |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Model Comparison** | Verified Evaluation (Section A) | EfficientNet-B0: Acc 99.22%, F1 99.23%, 128/129 | [`ModelComparisonPage.tsx:30-46`](file:///d:/curuma/src/pages/ModelComparisonPage.tsx#L30-L46) | No | No | **YES** | No | <span style="color:green">VERIFIED</span> | Matches `FINAL_METRICS_TABLE.csv` on held-out internal test set ($N=129$). |
| **Model Comparison** | Verified Evaluation (Section A) | MobileNetV2: Acc 93.02%, F1 93.09%, 120/129 | [`ModelComparisonPage.tsx:47-62`](file:///d:/curuma/src/pages/ModelComparisonPage.tsx#L47-L62) | No | No | **YES** | No | <span style="color:green">VERIFIED</span> | Matches `FINAL_METRICS_TABLE.csv` on held-out internal test set ($N=129$). |
| **Model Comparison** | Verified Evaluation (Section A) | Hybrid Ensemble ($\alpha=0.50$): Acc 99.22%, F1 99.23% | [`ModelComparisonPage.tsx:63-78`](file:///d:/curuma/src/pages/ModelComparisonPage.tsx#L63-L78) | No | No | **YES** | No | <span style="color:green">VERIFIED</span> | Matches `FINAL_METRICS_TABLE.csv` on held-out internal test set ($N=129$). |
| **Model Comparison** | Reference Benchmark Chart (Section B) | 94.2%, 91.7%, 95.1% (Acc/Prec/Rec/F1) | [`ModelComparisonPage.tsx:82-107`](file:///d:/curuma/src/pages/ModelComparisonPage.tsx#L82-L107), [`mockData.ts:97-146`](file:///d:/curuma/src/data/mockData.ts#L97-L146) | No | No | No | **YES** | <span style="color:green">VERIFIED</span> | Developmental reference benchmark labeled with explicit disclaimer alert. |
| **Dataset Analysis** | Time Range Filter | 7 Days / 30 Days / All Time | [`AnalyticsPage.tsx:37-49`](file:///d:/curuma/src/pages/AnalyticsPage.tsx#L37-L49) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Filters active session history array in memory. |
| **Dataset Analysis** | Disease Class Distribution | Total scans, class slice counts & % | [`AnalyticsPage.tsx:54-86`](file:///d:/curuma/src/pages/AnalyticsPage.tsx#L54-L86) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Calculated dynamically from `predictionHistory`. Renders empty state if $N=0$. |
| **Dataset Analysis** | Risk Severity Distribution | High / Moderate / Low counts & % | [`AnalyticsPage.tsx:89-122`](file:///d:/curuma/src/pages/AnalyticsPage.tsx#L89-L122) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Calculated dynamically from `predictionHistory.overallRisk`. |
| **Dataset Analysis** | Mean Confidence by Disease | Per-class average confidence % | [`AnalyticsPage.tsx:125-157`](file:///d:/curuma/src/pages/AnalyticsPage.tsx#L125-L157) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Calculated dynamically from `predictionHistory.confidence`. |
| **Dataset Analysis** | Environmental Trends Chart | 7-day daily mean Temp, RH, Risk | [`AnalyticsPage.tsx:160-209`](file:///d:/curuma/src/pages/AnalyticsPage.tsx#L160-L209) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Aggregated dynamically from Open-Meteo `liveHourlyRecords`. |
| **Historical Validation** | Leaf Health Pillar | Disease name & Confidence % | [`MultimodalAnalysisPage.tsx:122-150`](file:///d:/curuma/src/pages/MultimodalAnalysisPage.tsx#L122-L150) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Bound to live `imageResult`. Shows "Awaiting Foliar Scan" if unanalyzed. |
| **Historical Validation** | Environmental Risk Pillar | Risk level & contributing factor | [`MultimodalAnalysisPage.tsx:152-180`](file:///d:/curuma/src/pages/MultimodalAnalysisPage.tsx#L152-L180) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Bound to live `researchRiskResult` or `envRiskResult`. |
| **Historical Validation** | Season & Crop Stage Pillar | Season name & Crop DAP | [`MultimodalAnalysisPage.tsx:182-210`](file:///d:/curuma/src/pages/MultimodalAnalysisPage.tsx#L182-L210) | **YES** | No | **YES** | No | <span style="color:green">VERIFIED</span> | DAP calculated from `plantingDate`; season metadata is static biological context. |
| **Historical Validation** | Overall Crop Risk Gauge | Score (0-100) & Risk Category | [`MultimodalAnalysisPage.tsx:213-294`](file:///d:/curuma/src/pages/MultimodalAnalysisPage.tsx#L213-L294) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Calculated dynamically by `calculateMultimodalFusion()` in `riskCalculator.ts`. |
| **Historical Validation** | Modality Weights | Visual: 58%, Environmental: 42% | [`MultimodalAnalysisPage.tsx:346-356`](file:///d:/curuma/src/pages/MultimodalAnalysisPage.tsx#L346-L356), [`riskCalculator.ts:224-225`](file:///d:/curuma/src/utils/riskCalculator.ts#L224-L225) | No | No | **YES** | No | <span style="color:green">VERIFIED</span> | Transparent heuristic late-fusion weights. |
| **Weather & Risk** | Historical Presets | Erode 2021, Erode 2022, Dharmapuri 2023 | [`EnvironmentalRiskPage.tsx:582-600`](file:///d:/curuma/src/pages/EnvironmentalRiskPage.tsx#L582-L600), [`researchRiskEngine.ts:806-849`](file:///d:/curuma/src/utils/researchRiskEngine.ts#L806-L849) | No | **YES** | No | No | <span style="color:green">VERIFIED</span> | Genuine 336-hour ERA5-Land time series loaded from `historicalReanalysisData.ts`. |
| **Weather & Risk** | 336-Hour Exposure Vector | RH $\ge 80\%$, Rain mm, Temp hours | [`EnvironmentalRiskPage.tsx:639-663`](file:///d:/curuma/src/pages/EnvironmentalRiskPage.tsx#L639-L663) | **YES** | **YES** | No | No | <span style="color:green">VERIFIED</span> | Dynamically computed by `extractExposureFeatures()` over the active 336h stream. |
| **Weather & Risk** | Research Debug Trace Panel | Telemetry counts, window, risk status | [`EnvironmentalRiskPage.tsx:666-718`](file:///d:/curuma/src/pages/EnvironmentalRiskPage.tsx#L666-L718) | **YES** | **YES** | No | No | <span style="color:green">VERIFIED</span> | Real-time dump of `researchRiskResult` execution state. |
| **Detailed Report Modal** | Saved Analysis Inspection | Disease, confidence, risk %, timestamp | [`DetailedReportModal.tsx:40-250`](file:///d:/curuma/src/components/common/DetailedReportModal.tsx#L40-L250) | **YES** | No | No | No | <span style="color:green">VERIFIED</span> | Dynamically bound to the selected record from `predictionHistory`. |

---

## 3. Detailed Component Breakdown

### A. Model Comparison (`ModelComparisonPage.tsx`)
- **Status:** 🟡 **STATIC BUT LEGITIMATE RESEARCH DATA**
- **Data Flow:**
  - Section A metrics (99.22%, 93.02%, 99.22%) are frozen project benchmark metrics from `FINAL_METRICS_TABLE.csv` on the internal test split ($N=129$). They are hardcoded into TypeScript constants because frozen model benchmarks do not change per user session.
  - Section B chart data (94.2%, 91.7%, 95.1%) are developmental reference benchmarks from early training iterations. They are properly labeled with a prominent notice.

### B. Dataset Analysis (`AnalyticsPage.tsx`)
- **Status:** 🟢 **LIVE / VERIFIED TELEMETRY DASHBOARD**
- **Data Flow:**
  - Does NOT display static dataset repository counts (e.g. 865, 606, 130, 129).
  - Genuinely binds to runtime user scan sessions (`predictionHistory`) and live weather streams (`liveHourlyRecords`).
  - Correctly renders empty state placeholders when no scans have been performed.

### C. Historical Validation (`MultimodalAnalysisPage.tsx`)
- **Status:** 🟢 **LIVE / VERIFIED DYNAMIC DECISION SUPPORT**
- **Data Flow:**
  - Evaluates live visual diagnosis and microclimate exposure using the heuristic late-fusion formula in `riskCalculator.ts`.
  - Recalculates dynamically when new images are scanned or environmental conditions change.

### D. Historical Presets & Research Trace (`EnvironmentalRiskPage.tsx`)
- **Status:** 🟡 **HISTORICAL REANALYSIS WITH DYNAMIC EXPOSURE EXTRACTION**
- **Data Flow:**
  - Presets in `historicalReanalysisData.ts` contain exact 336-hour ERA5-Land reanalysis observations from Tamil Nadu research trials.
  - Applying a preset feeds all 336 hourly rows through `calculateResearchEnvironmentalRisk()`, which dynamically computes the exposure vector and biological risk rating.
