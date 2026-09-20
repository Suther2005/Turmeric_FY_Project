# TurmeriCare AI — Environmental Risk Engine Research Status

**Project:** TurmeriCare AI  
**Document Type:** Scientific Status Declaration (Stage 5A)  
**Date:** September 2026  
**Auditor:** Scientific Integrity & Methodology Review Engine  
**Status:** **Methodology Specification Complete (Zero code modifications, zero risk formulas implemented)**

---

## 1. Structured Scientific Status Census

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FIVE-TIER RESEARCH STATUS DECLARATION                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. WHAT IS VALIDATED (Firmly Grounded in Authoritative Evidence)
1. **Multi-Year Meteorological Reanalysis Dataset:**
   * 105,120 contiguous, quality-controlled hourly records (2021–2023) across 4 major Tamil Nadu turmeric districts (Erode, Coimbatore, Salem, Dharmapuri) retrieved from ECMWF Copernicus ERA5-Land reanalysis via Open-Meteo with 0 missing timestamps, 0 duplicates, and 100% valid physical bounds.
2. **Pathogen-Specific Biological Permissiveness Rules:**
   * Literature-established moisture and thermal thresholds published by TNAU and ICAR-IISR:
     * *Colletotrichum capsici* (Leaf Spot): Requires $\text{RH} \ge 80\%$, temperature $21\text{–}32^\circ\text{C}$, and rainfall splash for conidial dissemination.
     * *Taphrina maculans* (Leaf Blotch): High humidity ($\text{RH} \ge 80\%$) and narrow thermal optimum ($25\text{–}30^\circ\text{C}$) during post-monsoon rhizome development.
     * *Aphis gossypii* / Thrips: Proliferate during warm ($> 28^\circ\text{C}$), dry ($\text{RH} < 65\%$) spells; washed off by heavy rain.
3. **14-Day Antecedent Biophysical Transformation Pipeline:**
   * Formulated mathematical accumulators (`hours_rh_ge_80pct`, `hours_temp_favorable_22_32C`, `hours_dew_condensation_proxy`, `cumulative_rainfall_14d_mm`, `rainfall_days_14d_count`).
4. **Source Verification of Historical Observations:**
   * Strict verification of 12 candidate records from TNAU, ICAR-AICRPS Bhavanisagar, and peer-reviewed surveys (*Indian Phytopathology*, *Madras Agricultural Journal*), cleanly classifying 8 as quantitative PDI, 3 as qualitative alerts, and 1 as image corpus.

---

### 2. WHAT IS EXPLORATORY (Observed in Small-Sample Analysis, Non-Conclusive)
1. **Directional Microclimate-Severity Trends:**
   * Observed positive directional correlation between 14-day rainfall volume and Leaf Spot PDI ($r = +0.909, \rho = +0.800$ on $n = 4$ subset).
   * Observed positive association between dew condensation proxy hours and foliar fungal severity ($r = +0.631$).
2. **Stratified Multi-Variable Patterns:**
   * High foliar blotch outbreaks ($> 40\%\text{ PDI}$) consistently aligned with $> 160\text{ hours}$ of $\text{RH} \ge 80\%$ ($> 48\%$ of exposure window) and $> 90\text{ hours}$ of dew proxy conditions.

---

### 3. WHAT IS HYPOTHESIS (Agronomically Grounded, Requiring Multi-Stage Testing)
1. **Phenological Susceptibility Attenuation Hypothesis:**
   * *Hypothesis:* In late crop maturity ($> 180\text{ DAP}$, e.g. record `V-DIS-09`), natural foliar senescence and pre-harvest irrigation withdrawal limit active pathogen expansion despite high atmospheric humidity.
2. **Dew Condensation Proxy Fidelity:**
   * *Hypothesis:* A dew point depression threshold of $(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$ reliably predicts the onset of continuous foliar free-water films under Tamil Nadu turmeric canopy structures.

---

### 4. WHAT REQUIRES MORE DATA (Future Field Acquisition Mandate)
1. **Longitudinal Quantitative Disease Observations:**
   * Expansion from $n = 8$ to $n \ge 50\text{ to }100$ independent field scouting records across multiple crop seasons and varieties (BSR 1, BSR 2, Erode Local, Alleppey Supreme).
2. **Documented Healthy Negative Controls:**
   * Documenting asymptomatic fields ($0\%\text{ PDI}$) under known microclimate conditions to calibrate false-alarm specificity.
3. **In-Situ Canopy Sensor Measurements:**
   * Physical leaf wetness resistance grid sensors and sub-canopy temperature/humidity loggers to establish the exact offset between open-air 2m reanalysis and the crop understory boundary layer.

---

### 5. WHAT MUST NOT YET BE CLAIMED (Strict Boundaries)
* **DO NOT CLAIM** that weather caused the disease (non-causal association).
* **DO NOT CLAIM** achieved predictive accuracy, sensitivity, specificity, or F1 scores.
* **DO NOT CLAIM** a validated predictive machine learning risk engine.
* **DO NOT CLAIM** that $n = 4$ directional correlations represent validated epidemiological laws.
* **DO NOT CLAIM** real-time IoT hardware telemetry when using historical reanalysis data.

---

## 2. Summary of Candidate Feature Lists

### List 1: SAFE CANDIDATE FEATURES (Approved for Future Biophysical Modeling)
1. **`hours_rh_ge_80pct`** — Permissive moisture threshold duration (14-day cumulative hours with $\text{RH} \ge 80\%$).
2. **`hours_temp_favorable_22_32C`** — Thermal incubation duration (14-day cumulative hours within $22^\circ\text{C}\text{–}32^\circ\text{C}$).
3. **`hours_dew_condensation_proxy`** — Surface condensation duration proxy (14-day cumulative hours where $T - T_{\text{dew}} \le 1.5^\circ\text{C}$).
4. **`cumulative_rainfall_14d_mm`** — Total antecedent rainfall volume associated with splash dispersal ($14\text{-day sum in mm}$).
5. **`rainfall_days_14d_count`** — Precipitation persistence frequency ($14\text{-day count of rain days}$).
6. **`crop_growth_stage / DAP`** — Phenological susceptibility context (Farmer-supplied crop stage context).

---

### List 2: CONTEXT-ONLY FEATURES (Background Advisory Layer)
1. **`mean_temperature`** — Best captured through non-linear favorable hours rather than a simple arithmetic average.
2. **`mean_soil_moisture`** — Dependent on land-surface model assumptions; uncalibrated for specific field soil orders and ridge mounding.
3. **`solar_rad_mean_Wm2`** — Better utilized as an overcast daylight hours indicator rather than a raw linear flux metric.

---

### List 3: FEATURES REQUIRING ADDITIONAL FIELD VALIDATION (Excluded from Current Modeling)
1. **`wind_speed_mean_kmh`** — 10m open-air reanalysis wind lacks empirical discriminative variance and within-canopy aerodynamic calibration.
2. **`soil_ph`** — Point-specific soil chemistry cannot be modeled from meteorological data; requires physical soil lab test reports.
3. **`direct_leaf_wetness_duration`** — Requires dedicated hardware resistive leaf grid sensors placed directly in the canopy boundary layer.

---

STAGE 5A DESIGN COMPLETE — NO APPLICATION CODE MODIFIED
