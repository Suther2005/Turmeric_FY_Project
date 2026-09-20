# Evidence-to-Feature Specification Report for TurmeriCare AI Risk Engine

**Project:** TurmeriCare AI  
**Scope:** Scientific Evidence-to-Feature Audit for Prospective Environmental Disease-Risk Modeling  
**Input Data Sources:**
- `TURMERIC-ENV-TN-ERA5-2021-2023` (105,120 hourly historical meteorological reanalysis records)
- `verified_disease_observations.csv` ($n = 12$ source-verified observations: $n = 8$ quantitative PDI, $n = 3$ qualitative alerts, $n = 1$ image corpus)
- `disease_exposure_features.csv` (14-day antecedent biophysical exposure features)  
**Deliverable Matrix:** [`risk_feature_evidence_matrix.csv`](file:///d:/curuma/environmental_data/epidemiology/risk_feature_evidence_matrix.csv)  
**Status:** **Pre-Modeling Specification & Evidence Evaluation Only (Zero ML training, zero risk score formulas, zero application modifications)**

---

## 1. Strict Scientific & Methodological Framework

### 1.1 Small Sample Size Census & Independence Limitations
* **Overall Quantitative Cohort ($n = 8$):**
  * Leaf Spot (*Colletotrichum capsici*): $n = 4$ observations (`V-DIS-01`, `V-DIS-03`, `V-DIS-06`, `V-DIS-08`).
  * Leaf Blotch (*Taphrina maculans*): $n = 4$ observations (`V-DIS-02`, `V-DIS-04`, `V-DIS-07`, `V-DIS-09`).
* **Non-Independence & Cluster Dependencies:**
  * Multiple observations originate from the same research station (AICRPS Bhavanisagar, Erode: `V-DIS-01`, `V-DIS-02`, `V-DIS-06`, `V-DIS-07`) in consecutive seasons (2021 and 2022).
  * Several 14-day antecedent exposure windows partially overlap in the late-monsoon window (October–November).
  * **Methodological Consequence:** Exploratory correlations derived from $n = 4$ or $n = 8$ **cannot be treated as generalized or statistically validated population relationships**. They serve strictly as directional exploratory indicators to check alignment with established botanical literature.

### 1.2 Non-Causality & Data Nature Declarations
* **Non-Causality:** Statistical association between microclimate exposure and disease severity is **non-causal**. Favorable weather creates biological permissiveness, but actual disease expression requires host susceptibility, pathogen presence, and conducive agronomic management.
* **Data Classification:** All environmental values are derived from **ECMWF Copernicus ERA5-Land historical meteorological reanalysis grids ($0.1^\circ \approx 9\text{ km}$)** and must **not** be described as live or in-situ field sensor data.
* **Biophysical Dew Terminology:** The dew metric is strictly designated as a **"dew/condensation proxy"** computed from dew-point depression ($(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$), and is **not** direct physical leaf wetness measurement.
* **Separation of Evidence Layers:** Qualitative extension advisories are analyzed as categorical signals and are never treated as continuous numerical PDI. The Mendeley 865-photo corpus provides visual diagnostic labels, not continuous environmental ground truth.

---

## 2. Four-Tier Scientific Evidence Classification

To ensure research transparency, every feature evaluated is classified across four distinct evidence layers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SCIENTIFIC EVIDENCE CLASSIFICATION                       │
└─────────────────────────────────────────────────────────────────────────────┘
  Layer 1: Literature-Supported Knowledge
  • Established agronomic and epidemiological findings published by TNAU, ICAR-IISR,
    and peer-reviewed plant pathology journals.
    
  Layer 2: Empirical Observations in this Dataset
  • Concrete values extracted from the 105,120 reanalysis records and 12 verified surveys.
  
  Layer 3: Exploratory Statistical Associations
  • Directional rank correlations (Spearman ρ) computed on the small sample (n=8).
  
  Layer 4: Hypotheses Requiring Field Validation
  • Mechanistic explanations (e.g. crop-stage resistance, late-season senescence)
    that align with agronomic theory but require multi-season field trial validation.
```

---

## 3. Comprehensive Evaluation of Candidate Features

### 1. `cumulative_rainfall_14d_mm` (14-Day Cumulative Rainfall)
* **Disease Applicability:** Leaf Spot (High); Leaf Blotch (Moderate); Aphids (Negative / Mechanical Washoff).
* **Biological Rationale:** Rain splash is the primary physical dispersal vector for *Colletotrichum capsici* conidia. High cumulative rainfall creates saturated canopy microclimates and root-zone waterlogging.
* **Evidence Source IDs:** `SRC-01`, `SRC-02`, `SRC-03`, `SRC-04` (TNAU Agritech Portal; ICAR-IISR; AICRPS Bhavanisagar).
* **Evidence Classification:** Literature-Supported & Source-Observed.
* **Supporting Observations:** $n = 8$ quantitative PDI records ($12.2\text{ to }163.6\text{ mm}$) + $3$ qualitative alerts.
* **Data Availability (ERA5 / Open-Meteo):** Fully available (Hourly accumulated precipitation).
* **Temporal Aggregation:** 14-day cumulative sum ($336\text{ hours}$).
* **Spatial Limitations:** Reanalysis smooths out localized convective thunderstorms.
* **Verdict:** **SAFE CANDIDATE FEATURE** (Core precipitation exposure metric).
* **Validation Requirement:** Field calibration of rainfall intensity thresholds against varying turmeric canopy densities.

---

### 2. `rainfall_days_14d_count` (14-Day Rain Days Frequency)
* **Disease Applicability:** Leaf Spot (High); Leaf Blotch (High); Aphids (Negative).
* **Biological Rationale:** Rain frequency (number of discrete days with $> 0.1\text{ mm}$ rain) prevents foliar desiccation and maintains continuous boundary layer moisture.
* **Evidence Source IDs:** `SRC-01`, `SRC-02`, `SRC-03`, `SRC-04` (Palakshappa et al., 2013).
* **Evidence Classification:** Literature-Supported & Source-Observed.
* **Supporting Observations:** $n = 8$ quantitative PDI ($7\text{ to }14\text{ rain days}$) + $3$ qualitative alerts.
* **Data Availability (ERA5 / Open-Meteo):** Fully available (Daily resampled sum $> 0.1\text{ mm}$).
* **Temporal Aggregation:** 14-day discrete day count ($0\text{ to }14\text{ days}$).
* **Spatial Limitations:** Mesoscale grid representation.
* **Verdict:** **SAFE CANDIDATE FEATURE** (Direct biophysical persistence indicator).
* **Validation Requirement:** Verification against local automatic rain gauge (ARG) stations.

---

### 3. `hours_rh_ge_80pct` (Hours with Relative Humidity $\ge 80\%$)
* **Disease Applicability:** Leaf Spot (Critical); Leaf Blotch (Critical).
* **Biological Rationale:** $\text{RH} \ge 80\%$ is the universally established biological permissive gate for foliar fungal pathogens on turmeric, governing conidial germination, acervuli development, and ascus dehiscence.
* **Evidence Source IDs:** `SRC-01`, `SRC-02`, `SRC-03`, `SRC-04` (TNAU Crop Protection Compendium; Indian Phytopathology).
* **Evidence Classification:** Literature-Supported & Source-Observed.
* **Supporting Observations:** $n = 8$ quantitative PDI ($91\text{ to }256\text{ hours}$) + $3$ qualitative alerts.
* **Data Availability (ERA5 / Open-Meteo):** Fully available (Hourly 2m relative humidity).
* **Temporal Aggregation:** 14-day cumulative hours ($0\text{ to }336\text{ hours}$).
* **Spatial Limitations:** 2m open-air humidity; sub-canopy relative humidity in dense turmeric foliage is typically 5–10% higher.
* **Verdict:** **SAFE CANDIDATE FEATURE** (Fundamental moisture threshold for fungal risk).
* **Validation Requirement:** Direct in-situ sensor placement within the crop canopy to determine canopy-to-ambient offset.

---

### 4. `hours_temp_favorable_22_32C` (Favorable Thermal Incubation Hours)
* **Disease Applicability:** Leaf Spot (High); Leaf Blotch (High).
* **Biological Rationale:** Mycelial growth for *Colletotrichum capsici* is optimal at $21\text{–}32^\circ\text{C}$ (peak at $28^\circ\text{C}$); *Taphrina maculans* thrives at $25\text{–}30^\circ\text{C}$. Temperatures below $18^\circ\text{C}$ or above $36^\circ\text{C}$ severely retard fungal expansion.
* **Evidence Source IDs:** `SRC-01`, `SRC-02`, `SRC-03`, `SRC-04` (TNAU; Reddy et al.; Palakshappa et al.).
* **Evidence Classification:** Literature-Supported & Source-Observed.
* **Supporting Observations:** $n = 8$ quantitative PDI ($240\text{ to }333\text{ hours}$) + $3$ qualitative alerts.
* **Data Availability (ERA5 / Open-Meteo):** Fully available (Hourly 2m air temperature).
* **Temporal Aggregation:** 14-day cumulative hours ($0\text{ to }336\text{ hours}$).
* **Spatial Limitations:** Open-air 2m temperature; shaded crop understory experiences narrower diurnal temperature swings.
* **Verdict:** **SAFE CANDIDATE FEATURE** (Core thermal incubation gate).
* **Validation Requirement:** Microclimate thermocouple profiling across different turmeric varieties and canopy heights.

---

### 5. `mean_temperature` (14-Day Mean Air Temperature)
* **Disease Applicability:** Leaf Spot (Moderate); Leaf Blotch (Moderate); Aphids (High).
* **Biological Rationale:** Controls overall biochemical reaction kinetics; sap-sucking aphids proliferate during warmer regimes ($> 28^\circ\text{C}$), whereas foliar fungi peak during cooler monsoonal regimes ($24\text{–}28^\circ\text{C}$).
* **Evidence Source IDs:** `SRC-01`, `SRC-02` (TNAU Entomology & Pathology Guides).
* **Evidence Classification:** Literature-Supported & Statistically Exploratory.
* **Supporting Observations:** $n = 8$ quantitative PDI ($24.4^\circ\text{C}\text{ to }28.8^\circ\text{C}$) + $3$ qualitative alerts.
* **Data Availability (ERA5 / Open-Meteo):** Fully available (Hourly 2m temperature).
* **Temporal Aggregation:** 14-day arithmetic mean.
* **Spatial Limitations:** Regional grid average.
* **Verdict:** **CONTEXT-ONLY FEATURE** (Linear mean temperature is less informative than non-linear threshold hours `hours_temp_favorable_22_32C`; suitable as background context).
* **Validation Requirement:** In-field seasonal temperature correlation with aphid trap counts.

---

### 6. `hours_dew_condensation_proxy` (Dew Condensation Proxy Hours)
* **Disease Applicability:** Leaf Spot (High); Leaf Blotch (High); Aphids (Negative).
* **Biological Rationale:** When dew point depression $(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$, atmospheric water vapor condenses onto leaf surfaces. Free foliar water is biophysically required for *Colletotrichum* appressorial penetration.
* **Evidence Source IDs:** `SRC-01`, `SRC-02`, `SRC-03` (Monteith & Unsworth; Sentelhas et al.).
* **Evidence Classification:** Literature-Supported & Derived Biophysical Proxy.
* **Supporting Observations:** $n = 8$ quantitative PDI ($3\text{ to }164\text{ hours}$) + $3$ qualitative alerts.
* **Data Availability (ERA5 / Open-Meteo):** Fully available (Derived from hourly $T$ and $T_{\text{dew}}$).
* **Temporal Aggregation:** 14-day cumulative hours ($0\text{ to }336\text{ hours}$).
* **Spatial Limitations:** Derived from atmospheric reanalysis; does not directly measure canopy surface wetness duration.
* **Verdict:** **SAFE CANDIDATE FEATURE** (Must always be explicitly labeled as *dew/condensation proxy*).
* **Validation Requirement:** Direct empirical calibration against physical resistive/capacitive leaf wetness sensors deployed in turmeric mounds.

---

### 7. `mean_soil_moisture` (Mean Topsoil Volumetric Moisture $0\text{–}7\text{cm}$)
* **Disease Applicability:** Leaf Spot (Moderate); Rhizome Health (High).
* **Biological Rationale:** Prolonged topsoil saturation ($> 0.35\text{ m}^3/\text{m}^3$) elevates sub-canopy boundary layer humidity and causes rhizosphere hypoxia, predisposing plants to secondary foliar stress and rhizome rot (*Pythium*).
* **Evidence Source IDs:** `SRC-02`, `SRC-03` (ICAR-IISR Turmeric Manual).
* **Evidence Classification:** Literature-Supported & Source-Observed.
* **Supporting Observations:** $n = 8$ quantitative PDI ($0.169\text{ to }0.383\text{ m}^3/\text{m}^3$) + $2$ qualitative alerts.
* **Data Availability (ERA5 / Open-Meteo):** Fully available (ERA5-Land Layer 1: $0\text{–}7\text{cm}$).
* **Temporal Aggregation:** 14-day volumetric arithmetic mean.
* **Spatial Limitations:** Model-derived land surface hydrology; does not reflect local soil texture differences (red loam vs. clayey alluvium) or raised-bed ridge drainage.
* **Verdict:** **CONTEXT-ONLY FEATURE** (Subject to land-surface model assumptions; should not be given direct mathematical risk weighting without soil-type normalization).
* **Validation Requirement:** In-situ capacitive soil moisture probes installed at rhizome depth ($15\text{ cm}$).

---

### 8. `wind_speed_mean_kmh` (14-Day Mean Wind Speed)
* **Disease Applicability:** Leaf Blotch (Moderate for ascospore transport); General (Weak).
* **Biological Rationale:** Moderate breezes ($8\text{–}18\text{ km/h}$) assist airborne ascospore dissemination of *Taphrina maculans*, whereas stagnant air ($< 5\text{ km/h}$) prevents canopy drying.
* **Evidence Source IDs:** `SRC-02`, `SRC-03` (Plant Pathology literature).
* **Evidence Classification:** Literature-Supported & Statistically Exploratory.
* **Supporting Observations:** $n = 8$ quantitative PDI ($5.0\text{ to }9.0\text{ km/h}$).
* **Data Availability (ERA5 / Open-Meteo):** Fully available (Hourly 10m surface wind).
* **Temporal Aggregation:** 14-day arithmetic mean.
* **Spatial Limitations:** Standard 10m open-air wind speed does not represent within-canopy boundary layer aerodynamics.
* **Verdict:** **REQUIRES ADDITIONAL FIELD VALIDATION** (Low variance in regional reanalysis; uncalibrated for canopy penetration).
* **Validation Requirement:** Within-canopy hot-wire or sonic anemometer measurements in turmeric fields.

---

### 9. `solar_rad_mean_Wm2` (Mean Downward Shortwave Solar Radiation)
* **Disease Applicability:** Foliar Fungi (Negative / UV mortality); Aphids (Positive).
* **Biological Rationale:** Direct sunlight accelerates leaf drying and exerts germicidal UV effects on exposed conidia; persistent overcast skies preserve leaf wetness.
* **Evidence Source IDs:** `SRC-01`, `SRC-03` (TNAU Agrometeorology Manual).
* **Evidence Classification:** Literature-Supported & Statistically Exploratory.
* **Supporting Observations:** $n = 8$ quantitative PDI ($144.7\text{ to }253.1\text{ W/m}^2$) + $1$ qualitative alert.
* **Data Availability (ERA5 / Open-Meteo):** Fully available (Hourly global horizontal irradiance).
* **Temporal Aggregation:** 14-day arithmetic mean & overcast daylight hours ($< 150\text{ W/m}^2$).
* **Spatial Limitations:** Grid-level radiation does not account for self-shading or intercropping (e.g. turmeric under coconut or marigold borders).
* **Verdict:** **CONTEXT-ONLY FEATURE** (More effectively captured via overcast daylight hours than raw mean radiation).
* **Validation Requirement:** Sub-canopy photosynthetically active radiation (PAR) sensor logging.

---

### 10. `crop_growth_stage / DAP` (Days After Planting / Growth Phase)
* **Disease Applicability:** All Diseases (Critical Phenological Gate).
* **Biological Rationale:** Turmeric susceptibility changes dramatically across growth stages. Vegetative (60–120 DAP) and Rhizome Development (120–180 DAP) have high physiological vulnerability to foliar pathogens. In late-season senescing canopies ($> 180\text{ DAP}$), active lesion expansion naturally declines even under high humidity.
* **Evidence Source IDs:** `SRC-01`, `SRC-02`, `SRC-03`, `SRC-04` (TNAU Crop Production Guide; AICRPS Bhavanisagar Reports).
* **Evidence Classification:** Literature-Supported; **Hypothesis for Late-Season Divergence (`V-DIS-09`) requiring dedicated multi-stage validation**.
* **Supporting Observations:** $n = 8$ quantitative PDI + $3$ qualitative alerts.
* **Data Availability (ERA5 / Open-Meteo):** UNAVAILABLE in weather data (Must be provided via farmer sowing calendar input).
* **Temporal Aggregation:** Discrete agronomic growth phase / DAP.
* **Spatial Limitations:** Field-specific planting date variation.
* **Verdict:** **SAFE CANDIDATE FEATURE** (Essential biological gate preventing false positive disease risk alerts during late senescence).
* **Validation Requirement:** Multi-season field screening recording PDI on the same cultivar across 60, 90, 120, 150, 180, and 210 DAP.

---

## 4. Final Feature Classification Lists

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FINAL FEATURE SPECIFICATION LISTS                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. SAFE CANDIDATE FEATURES (Approved for Prospective Biophysical Modeling)
These features possess strong literature backing, clear biological mechanisms, full availability in meteorological reanalysis, and consistent directional alignment in observations:
1. **`hours_rh_ge_80pct`** — Permissive moisture threshold duration (14-day cumulative hours with $\text{RH} \ge 80\%$).
2. **`hours_temp_favorable_22_32C`** — Thermal incubation duration (14-day cumulative hours within $22^\circ\text{C}\text{–}32^\circ\text{C}$).
3. **`hours_dew_condensation_proxy`** — Surface condensation duration proxy (14-day cumulative hours where $T - T_{\text{dew}} \le 1.5^\circ\text{C}$).
4. **`cumulative_rainfall_14d_mm`** — Total antecedent rainfall volume governing splash dispersal ($14\text{-day sum in mm}$).
5. **`rainfall_days_14d_count`** — Precipitation persistence frequency ($14\text{-day count of rain days}$).
6. **`crop_growth_stage / DAP`** — Phenological susceptibility gate (Farmer-supplied crop stage context).

---

### 2. CONTEXT-ONLY FEATURES (Informational / Background Advisory Layer)
These features provide useful macroclimatic background, but should **not** enter a mathematical risk equation directly due to non-linearity, proxy dependencies, or pedological variability:
1. **`mean_temperature`** — Best captured through non-linear favorable hours rather than a simple arithmetic average.
2. **`mean_soil_moisture`** — Dependent on land-surface model assumptions; uncalibrated for specific field soil orders and ridge mounding.
3. **`solar_rad_mean_Wm2`** — Better utilized as an overcast daylight hours indicator rather than a raw linear flux metric.

---

### 3. FEATURES REQUIRING ADDITIONAL FIELD VALIDATION (Excluded from Current Modeling)
These features require direct in-situ sensor instrumentation or lab testing before they can be considered for empirical risk engines:
1. **`wind_speed_mean_kmh`** — 10m open-air reanalysis wind lacks empirical discriminative variance and within-canopy aerodynamic calibration.
2. **`soil_ph`** — Point-specific soil chemistry cannot be modeled from meteorological data; requires physical soil lab test reports.
3. **`direct_leaf_wetness_duration`** — Requires dedicated hardware resistive leaf grid sensors placed directly in the canopy boundary layer.

---

### Strict Compliance Summary
- **No machine learning models were trained.**
- **No final risk formulas or weights were constructed.**
- **No arbitrary risk thresholds were defined.**
- **Application source code, backend APIs, and `riskCalculator.ts` remain completely untouched.**
