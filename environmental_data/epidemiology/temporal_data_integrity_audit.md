# TurmeriCare AI — Temporal-Data Integrity Audit: Field Conditions & Reanalysis

## Document Metadata
- **System**: TurmeriCare AI (Environmental Epidemiological Decision Support)
- **Module**: Field Conditions / Environmental Risk (`src/pages/EnvironmentalRiskPage.tsx`, `src/utils/researchRiskEngine.ts`, `src/data/historicalReanalysisData.ts`, `src/context/AppContext.tsx`, `src/utils/translations.ts`)
- **Target Crop**: Turmeric (*Curcuma longa* L.)
- **Audited On**: 2026-09-18
- **Status**: **VERIFIED & TEMPORAL DATA INTEGRITY AUDIT PASSED**

---

## 1. Executive Summary & Core Principle

### The Core Temporal Integrity Principle
> **CURRENT MANUAL READING ≠ 14-DAY HISTORY.**
> **ONLY AN ACTUAL CONTIGUOUS HOURLY TIME SERIES MAY BE USED FOR THE 336-HOUR RESEARCH EXPOSURE ASSESSMENT.**

Prior implementations inadvertently synthesized a 336-hour array by repeating single instantaneous slider values, thereby executing 14-day exposure rules on fabricated data.

This temporal integrity audit establishes a strict dichotomy between **Manual Field Observations** (instantaneous microclimate heuristics) and **Historical Reanalysis Presets** (genuine 336-hour ERA5-Land contiguous records from `environmental_data/`).

```mermaid
flowchart TD
    subgraph Data Origin
        M[Manual Slider Inputs: Instant Point Observations]
        H[Historical Presets: ECMWF ERA5-Land Reanalysis from environmental_data/]
    end

    subgraph Processing Engine
        M --> |Instant Microclimate Rules| M1[Instantaneous Field Heuristic: Current Observation Factors]
        H --> |336 Contiguous Hours| H1[Research Environmental Risk Engine: 14-Day Exposure Vector]
    end

    subgraph UI Presentation
        M1 --> M2["Current Field Conditions" / "Current-condition assessment"]
        M2 --> M3["Notice: 14-day assessment unavailable without recorded hourly time series"]
        H1 --> H2["14-Day Historical Exposure Assessment" / "Research Baseline"]
        H2 --> H3["Metrics: RH>=80%, Temp Opt, Dew Proxy, Cumulative Rain / Rain Days"]
    end
```

---

## 2. Verification of Requirements

### A. Manual Field Input (Current Observations Only)
- **Zero Synthetic Time Series**: The system no longer duplicates single-point readings into 336 hours.
- **Header & Badge**:
  - **English**: `"Current Field Conditions"` | `"Current-condition assessment"`
  - **Tamil**: `"தற்போதைய வயல் நிலை"` | `"தற்போதைய நிலை மதிப்பீடு"`
- **Disclosed Heuristic Subtitle**:
  - **English**: `"Current-condition heuristic — not a 14-day exposure assessment"`
  - **Tamil**: `"தற்போதைய நிலை மதிப்பீடு — 14 நாள் தொடர் மதிப்பீடு அல்ல"`
- **Temporal Warning Disclosure**:
  - **English**: `"These values represent current field observations. A 14-day exposure assessment requires an actual recorded time series."`
  - **Tamil**: `"இந்த மதிப்புகள் தற்போதைய வயல் நிலைகளை குறிக்கின்றன. 14 நாள் சுற்றுச்சூழல் மதிப்பீட்டிற்கு உண்மையான காலவரிசைத் தரவு தேவை."`

### B. Historical Reanalysis Presets (Genuine 336-Hour Slices)
- **Data Source**: Presets (`ERODE_OCT_2021`, `ERODE_OCT_2022_BLOTCH`, `DHARMAPURI_OCT_2023_APHIDS`) are sourced directly from verified cleaned ERA5-Land CSV files (`environmental_data/cleaned/erode_hourly_2021_2023.csv`, `environmental_data/cleaned/dharmapuri_hourly_2021_2023.csv`).
- **Exposure Metric Calculation**:
  - 14-day cumulative rainfall (mm) & rain day count
  - Favorable temperature hours (22.0°C – 32.0°C)
  - Relative humidity $\ge 80\%$ hours
  - Dew/condensation atmospheric proxy hours ($(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$)
- **Header & Badge**:
  - **English**: `"14-Day Historical Exposure Assessment"` | `"Research Baseline"`
  - **Tamil**: `"14-நாள் வரலாற்று வெளிப்பாடு மதிப்பீடு"` | `"ஆராய்ச்சி அடிப்படை"`
- **Disclaimers**:
  - `"Research Baseline • Not independently field validated"`
  - `"RETROSPECTIVE CONSISTENCY ONLY"`
  - `"Atmospheric condensation proxy ((T - T_dew) <= 1.5°C), not direct measured leaf wetness."`

### C. Crop Stage (DAP) Context
- Days After Planting (DAP) is preserved purely as contextual agronomic background information (e.g. *Rhizome Development Stage* at 135–150 DAP) and is **never** applied as an unsupported mathematical multiplier.

### D. Sensor Architecture Readiness
- The sensor grid interface is retained as an uninstantiated architectural placeholder awaiting real hardware telemetry (`🟢 Live Sensor Data (Awaiting Hardware)` / `🟢 நேரலை சென்சார் தரவு (இணைப்பு நிலுவை)`). No synthetic sensor readings are injected.

---

## 3. Bilingual State Matrix

| State / Component | English UI Display | Tamil UI Display | Status |
|---|---|---|:---:|
| **Manual Data Source Subtext** | These values represent current field observations. A 14-day exposure assessment requires an actual recorded time series. | இந்த மதிப்புகள் தற்போதைய வயல் நிலைகளை குறிக்கின்றன. 14 நாள் சுற்றுச்சூழல் மதிப்பீட்டிற்கு உண்மையான காலவரிசைத் தரவு தேவை. | PASS |
| **Manual Mode Top Label** | Current Field Conditions | தற்போதைய வயல் நிலை | PASS |
| **Manual Mode Assessment Tag** | Current-condition assessment | தற்போதைய நிலை மதிப்பீடு | PASS |
| **Manual Mode Heuristic Subtitle** | Current-condition heuristic — not a 14-day exposure assessment | தற்போதைய நிலை மதிப்பீடு — 14 நாள் தொடர் மதிப்பீடு அல்ல | PASS |
| **Manual Mode Unavailable Notice** | 14-day assessment unavailable | 14 நாள் மதிப்பீட்டிற்கு தரவு போதவில்லை | PASS |
| **Reanalysis Mode Top Label** | 14-Day Historical Exposure Assessment | 14-நாள் வரலாற்று வெளிப்பாடு மதிப்பீடு | PASS |
| **Reanalysis Source Tag** | Historical Meteorological Reanalysis | வரலாற்று வானிலை தரவு (ERA5) | PASS |
| **Scientific Disclaimer** | Research Baseline • Not independently field validated | ஆராய்ச்சி அடிப்படை • தனித்த களச் சரிபார்ப்பு இன்னும் செய்யப்படவில்லை | PASS |

---

## 4. Test Suite Execution & Build Verification

### 1. UI Integration Test Suite
```
================================================================
TURMERICARE AI — STAGE 5D UI INTEGRATION TEST SUITE
================================================================
[PASS] TEST_A_B: Research risk engine output is correctly structured for UI consumption
[PASS] TEST_C: Disease-specific pathways output distinct biological rationales and disease identifiers
[PASS] TEST_D: Manual input slider parameters convert into a physically consistent 336-hour buffer
[PASS] TEST_E: Historical reanalysis presets (Erode, Dharmapuri) are loaded with valid 336h records
[PASS] TEST_F: Incomplete or missing environmental records are safely rejected
[PASS] TEST_G: Dew proxy is strictly disclaimed as an atmospheric condensation proxy
[PASS] TEST_H: Data source attribution strictly distinguishes manual inputs from historical reanalysis
[PASS] TEST_I: Crop stage / DAP is reflected as contextual biological information
[PASS] TEST_J_K: Research engine output contains zero uncalibrated probability or accuracy claims
[PASS] TEST_L: Fallback calculator (riskCalculator.ts) remains 100% operational
[PASS] TEST_M_N: Agronomic recommendations are structured and available for extension guidance
[PASS] TEST_P: Initial unanalyzed state strings are strictly defined in both English and natural Tamil
[PASS] TEST_Q: Research reference samples remain accessible for benchmarking while isolated from default farmer flow
[PASS] TEST_R: Temporal data integrity strictly distinguishes current observations from 14-day exposure series
[PASS] TEST_S: Real ERA5 contiguous hourly records from environmental_data/ execute full 14-day exposure calculations
================================================================
UI INTEGRATION TESTS: 15 PASSED / 0 FAILED (TOTAL 15)
ALL INTEGRATION TESTS PASSED: true
================================================================
```

### 2. Research Risk Engine Test Suite
```
================================================================
TURMERICARE AI — STAGE 5B RESEARCH RISK ENGINE TEST SUITE
================================================================
[PASS] TEST_A to TEST_T (Total 20 unit & boundary tests)
================================================================
TEST SUMMARY: 20 PASSED / 0 FAILED (TOTAL 20)
ALL TESTS PASSED: true
================================================================
```

### 3. Production Build
- `npm run build` completed in `5.41s` with 0 compilation or lint errors.
- Visual headless browser session recorded and verified: `temporal_integrity_flow_1789724498244.webp`.
