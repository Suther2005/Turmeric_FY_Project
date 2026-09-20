# Implementation Report: TurmeriCare AI Research Environmental Risk Engine

**Project:** TurmeriCare AI  
**Stage:** Stage 5B Implementation (Software Engine & Test Verification)  
**Date:** September 2026  
**Status:** **Implemented & Fully Tested (UI Integration Not Yet Performed)**  

---

> [!IMPORTANT]
> **Mandatory Scientific Declaration:**  
> "Current risk outputs are research-baseline decision-support outputs and have not been prospectively validated against independent field disease observations."

---

## 1. Summary of Changes & File Inventory

### Files Created:
1. **[`src/utils/researchRiskEngine.ts`](file:///d:/curuma/src/utils/researchRiskEngine.ts):**
   * Standalone research environmental disease-risk engine implementing the Stage 5A architecture.
   * Modular input validation, 14-day antecedent feature transformation layer, disease-specific gating pathways, telemetry normalizers, transparent explanatory reporting, and standardized disclaimers.
2. **[`src/utils/researchRiskEngine.test.ts`](file:///d:/curuma/src/utils/researchRiskEngine.test.ts):**
   * Comprehensive 20-point automated test suite covering requirements A through T.
3. **[`environmental_data/epidemiology/risk_engine_implementation_report.md`](file:///d:/curuma/environmental_data/epidemiology/risk_engine_implementation_report.md):**
   * This implementation report and audit record.

### Files Modified:
* **Zero application source files modified:** The existing fallback calculator ([`src/utils/riskCalculator.ts`](file:///d:/curuma/src/utils/riskCalculator.ts)), UI pages ([`src/pages/EnvironmentalRiskPage.tsx`](file:///d:/curuma/src/pages/EnvironmentalRiskPage.tsx), [`src/pages/DashboardPage.tsx`](file:///d:/curuma/src/pages/DashboardPage.tsx)), and application context remain completely untouched and 100% operational.

---

## 2. Engine Architecture & Decoupled Data Flow

The engine implements a decoupled multi-layer pipeline that isolates physical telemetry ingestion from biological feature engineering and transparent gating rules:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 STAGE 5B RESEARCH RISK ENGINE ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [Source 1: Reanalysis]        [Source 2: Manual Input]     [Source 3: Sensor Grid]
  Open-Meteo ERA5 / ERA5-Land   Standardized Time-Series     In-Situ Farm Node
  REST Payload Array            Input Buffer                 (MQTT/JSON Telemetry)
             │                             │                           │
             └─────────────────────────────┼───────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │      Telemetry Normalizer Layer       │
                       │ (normalizeReanalysis, normalizeSensor)│
                       └───────────────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │     Strict Physical Bounds Check      │
                       │    (validateHourlyRecord / Series)    │
                       └───────────────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │  14-Day Antecedent Feature Transform  │
                       │    (336-Hour Window Integration)      │
                       └───────────────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │   Disease-Specific Gating Pathways    │
                       │   • Leaf Spot (Splash & High RH)      │
                       │   • Leaf Blotch (Airborne & Dew)      │
                       │   • Aphids (Warm/Dry, Rain Wash-off)  │
                       └───────────────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │  Transparent Research Risk Output     │
                       │  (RiskLevel, Traceable Evidence,      │
                       │   DAP Context, Standard Limitations)  │
                       └───────────────────────────────────────┘
```

---

## 3. Feature Transformation Layer

The transformer processes an array of at least 336 hourly environmental records (taking the most recent 336 hours if $> 336$ are provided) into the documented 14-day exposure vector:

| Transformed Feature Name | Physical Unit | Mathematical Definition / Extraction Logic | Biological Role in Pathology |
| :--- | :--- | :--- | :--- |
| **`hours_rh_ge_80pct`** | hours ($0\text{--}336$) | $\sum_{t=1}^{336} \mathbb{I}(\text{RH}_t \ge 80.0\%)$ | Atmospheric moisture permissiveness for spore hydration |
| **`hours_temp_favorable_22_32C`** | hours ($0\text{--}336$) | $\sum_{t=1}^{336} \mathbb{I}(22.0^\circ\text{C} \le T_t \le 32.0^\circ\text{C})$ | Thermal incubation window for *Colletotrichum* & *Taphrina* |
| **`hours_dew_condensation_proxy`** | hours ($0\text{--}336$) | $\sum_{t=1}^{336} \mathbb{I}((T_t - T_{\text{dew}, t}) \le 1.5^\circ\text{C})$ | Free water condensation duration proxy on leaf surfaces |
| **`cumulative_rainfall_14d_mm`** | $\text{mm}$ | $\sum_{t=1}^{336} \text{Precip}_t$ | Total antecedent rainfall volume (splash dispersal / wash-off) |
| **`rainfall_days_14d_count`** | days ($0\text{--}14$) | $\sum_{d=1}^{14} \mathbb{I}(\text{Precip}_{\text{daily}, d} > 0.1\text{ mm})$ | Precipitation persistence frequency across the 14 days |
| **`mean_temperature`** | $^\circ\text{C}$ | $\frac{1}{336} \sum T_t$ | Background ambient thermal level |
| **`mean_relative_humidity`** | $\%$ | $\frac{1}{336} \sum \text{RH}_t$ | Background macroclimatic humidity |
| **`mean_soil_moisture`** | $\text{m}^3/\text{m}^3$ | $\frac{1}{k} \sum \text{SM}_t$ (if available) | Root-zone edaphic water content (context only) |
| **`mean_wind_speed`** | $\text{km/h}$ | $\frac{1}{k} \sum \text{Wind}_t$ (if available) | 10m macroclimatic wind speed (context only) |
| **`overcast_daylight_hours`** | hours | $\sum \mathbb{I}(10 \le \text{Rad}_t < 200\text{ W/m}^2)$ | Overcast daylight conditions (reduced foliar drying) |

---

## 4. Exact Disease-Specific Logic Implemented

### Pathway A: Leaf Spot (*Colletotrichum capsici*)
* **Biological Mechanism:** Dispersed via rain splash; requires sustained foliar moisture and warm temperatures ($21\text{–}32^\circ\text{C}$).
* **Gating Rules:**
  * **`LOW`:** If moisture is deficient ($\text{Hours}_{\text{RH}\ge 80} < 60\text{ h}$ AND $\text{Rain}_{\text{cum}} < 5\text{ mm}$ AND $\text{Hours}_{\text{Dew}} < 30\text{ h}$) OR thermal incubation is insufficient ($\text{Hours}_{\text{TempOpt}} < 100\text{ h}$).
  * **`HIGH`:** If $\text{Rain}_{\text{cum}} \ge 40\text{ mm}$ OR ($\text{Rain}_{\text{days}} \ge 5\text{ days}$ AND $\text{Hours}_{\text{RH}\ge 80} \ge 140\text{ h}$), AND $\text{Hours}_{\text{TempOpt}} \ge 180\text{ h}$.
  * **`MODERATE`:** If $\text{Rain}_{\text{cum}} \ge 15\text{ mm}$ OR $\text{Hours}_{\text{RH}\ge 80} \ge 80\text{ h}$, AND $\text{Hours}_{\text{TempOpt}} \ge 100\text{ h}$.

### Pathway B: Leaf Blotch (*Taphrina maculans*)
* **Biological Mechanism:** Airborne ascospores; proliferates under high atmospheric humidity ($\text{RH} \ge 80\%$) and prolonged canopy dew condensation in moderate temps ($22\text{–}32^\circ\text{C}$). Can occur during dry spells if nighttime dew persists.
* **Gating Rules:**
  * **`LOW`:** If moisture is deficient ($\text{Hours}_{\text{RH}\ge 80} < 70\text{ h}$ AND $\text{Hours}_{\text{Dew}} < 40\text{ h}$) OR $\text{Hours}_{\text{TempOpt}} < 100\text{ h}$.
  * **`HIGH`:** If sustained humidity ($\text{Hours}_{\text{RH}\ge 80} \ge 140\text{ h}$) OR prolonged dew proxy ($\text{Hours}_{\text{Dew}} \ge 90\text{ h}$), AND $\text{Hours}_{\text{TempOpt}} \ge 180\text{ h}$.
  * **`MODERATE`:** If moderate humidity ($\text{Hours}_{\text{RH}\ge 80} \ge 80\text{ h}$) OR moderate dew ($\text{Hours}_{\text{Dew}} \ge 50\text{ h}$), AND $\text{Hours}_{\text{TempOpt}} \ge 100\text{ h}$.
  * **Phenological Note:** Senescing crops ($> 180\text{ DAP}$) are flagged with an advisory note explaining that natural canopy aging and pre-harvest dry-down attenuate active lesion expansion.

### Pathway C: Sap-Sucking Pests (*Aphis gossypii*, Thrips)
* **Biological Mechanism:** Proliferate during warm, dry spells; mechanically washed off and suppressed by heavy rain.
* **Gating Rules:**
  * **`LOW`:** If wash-off rain occurs ($\text{Rain}_{\text{cum}} \ge 30\text{ mm}$ OR $\text{Rain}_{\text{days}} \ge 4\text{ days}$).
  * **`HIGH`:** If persistent warm-dry spell occurs ($\text{Rain}_{\text{cum}} < 5\text{ mm}$ AND $\text{Hours}_{\text{RH}\ge 80} < 60\text{ h}$ AND $\text{Mean Temp} \ge 27.5^\circ\text{C}$).
  * **`MODERATE`:** If dry with moderate temperature ($\text{Rain}_{\text{cum}} < 15\text{ mm}$ AND $\text{Mean Temp} \ge 25.0^\circ\text{C}$).

---

## 5. Provisional Assumptions & Configuration Layer

All numerical gating boundaries are encapsulated in `PROVISIONAL_BASELINE_THRESHOLDS`:
```typescript
export const PROVISIONAL_BASELINE_THRESHOLDS = {
  MOISTURE_RH_HIGH_HOURS: 140,
  MOISTURE_RH_MODERATE_HOURS: 80,
  MOISTURE_RH_DEFICIENT_HOURS: 60,
  DEW_PROXY_HIGH_HOURS: 90,
  DEW_PROXY_MODERATE_HOURS: 50,
  DEW_PROXY_DEFICIENT_HOURS: 30,
  TEMP_FAVORABLE_HIGH_HOURS: 180,
  TEMP_FAVORABLE_MIN_INCUBATION: 100,
  RAIN_HIGH_CUMULATIVE_MM: 40.0,
  RAIN_MODERATE_CUMULATIVE_MM: 15.0,
  RAIN_DRY_CUMULATIVE_MM: 5.0,
  RAIN_HIGH_DAYS_COUNT: 5,
  RAIN_PEST_WASHOFF_MM: 30.0,
  RAIN_PEST_WASHOFF_DAYS: 4,
  APHID_DRY_MAX_RH_HOURS: 60,
  APHID_WARM_MEAN_TEMP_C: 27.5,
  APHID_MODERATE_TEMP_C: 25.0,
  REQUIRED_WINDOW_HOURS: 336,
};
```
* **Provisional Nature:** These thresholds are transparent baseline heuristic boundaries grounded in TNAU/ICAR literature and exploratory calibration on $n=8$ historical records. They are **not presented as validated mathematical constants**.

---

## 6. Automated Test Results (Requirements A through T)

Execution of [`src/utils/researchRiskEngine.test.ts`](file:///d:/curuma/src/utils/researchRiskEngine.test.ts) verified all 20 requirements:

| Test ID | Requirement Description | Test Scenario & Condition | Result |
| :---: | :--- | :--- | :---: |
| **TEST_A** | Valid Environmental Input | 336-hour series correctly accumulates exposure features and outputs HIGH fungal risk | **PASSED** |
| **TEST_B** | Missing Temperature | Record with missing/NaN `temperature_2m` is caught and rejected | **PASSED** |
| **TEST_C** | Missing Relative Humidity | Record with missing/NaN `relative_humidity_2m` is caught and rejected | **PASSED** |
| **TEST_D** | Missing Rainfall | Record with missing/NaN `precipitation` is caught and rejected | **PASSED** |
| **TEST_E** | Missing Dew Point | Record with missing/NaN `dew_point_2m` is caught and rejected | **PASSED** |
| **TEST_F** | Invalid Negative Rainfall | Record with negative precipitation ($-5.0\text{ mm}$) is caught and rejected | **PASSED** |
| **TEST_G** | Invalid RH Outside 0–100% | Records with $\text{RH} = -10\%$ and $\text{RH} = 105\%$ are caught and rejected | **PASSED** |
| **TEST_H** | Invalid Temperature Bounds | Record with $T = 85^\circ\text{C}$ outside $[-10, 60]^\circ\text{C}$ is caught and rejected | **PASSED** |
| **TEST_I** | Insufficient 14-Day Records | Series with $< 336$ records throws `INSUFFICIENT_14D_RECORDS` error | **PASSED** |
| **TEST_J** | Exactly 14-Day Records | Exactly 336 hourly records processed accurately | **PASSED** |
| **TEST_K** | More than 14-Day Records | Series with 500 records correctly slices the most recent 336 hours | **PASSED** |
| **TEST_L** | Disease-Specific Divergent Outputs | Warm/dry conditions produce Aphid HIGH / Fungal LOW; wet conditions produce Fungal HIGH / Aphid LOW | **PASSED** |
| **TEST_M** | Deterministic Output | Identical input series produce identical features, risk levels, and explanations | **PASSED** |
| **TEST_N** | Manual Source Handling | `MANUAL_FIELD_INPUT` source and DAP context are handled and attributed cleanly | **PASSED** |
| **TEST_O** | Historical Reanalysis Normalization | Open-Meteo ERA5 payload transforms into standard schema and executes cleanly | **PASSED** |
| **TEST_P** | Sensor Grid Compatibility | IoT schema normalizes into standard schema and calculates dew point dynamically | **PASSED** |
| **TEST_Q** | Dew Proxy Disclaimed as Proxy | Explicit disclaimer that $(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$ is a condensation proxy, not leaf wetness | **PASSED** |
| **TEST_R** | Soil pH Excluded from Risk Calculation | Verified that soil pH is absent from the environmental exposure feature vector | **PASSED** |
| **TEST_S** | No Synthetic Data Generation | Engine strictly requires real antecedent records and refuses to synthesize missing data | **PASSED** |
| **TEST_T** | Fallback Calculator Unmodified | `riskCalculator.ts` remains 100% operational and untouched | **PASSED** |

**Summary: 20 / 20 Tests Passed (100% Pass Rate).**

---

## 7. Limitations & What Remains Unvalidated

1. **Unvalidated Predictive Performance:** The engine has not been prospectively evaluated against independent commercial turmeric farm outbreaks.
2. **Reanalysis Microclimate Offset:** ERA5-Land 2m atmospheric reanalysis (~9km grid) does not capture localized canopy boundary layer microclimates.
3. **Absence of In-Situ Leaf Wetness Sensors:** The condensation proxy is an atmospheric approximation and has not been calibrated against physical leaf grid resistance sensors.
4. **Varietal Susceptibility Differences:** Differential susceptibility across turmeric cultivars (BSR 1, BSR 2, Alleppey Supreme) is not yet parameterized.
5. **Farmer Management Interventions:** Irrigation schedules and fungicide sprays are unmodeled in pure biophysical risk calculations.

---

STAGE 5B ENGINE IMPLEMENTATION COMPLETE
