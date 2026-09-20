# Validation Protocol & Data Leakage Prevention Framework

**Project:** TurmeriCare AI  
**Document Type:** Validation Strategy Specification (Stage 5A)  
**Target Application:** Environmental Disease-Risk Engine & Multimodal Intelligence  
**Status:** **Strict Validation Design (No performance metrics claimed as achieved)**

---

## 1. Multi-Dimensional Validation Modalities

When sufficient longitudinal disease observation records are acquired in future research phases, the risk engine must be evaluated across five distinct validation modalities to prevent overly optimistic performance estimates.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5-TIER VALIDATION STRATEGY                            │
└─────────────────────────────────────────────────────────────────────────────┘
  [Tier A: Retrospective] ──> Calibrate baseline rules on historical survey records
  [Tier B: Temporal]      ──> Train/calibrate on 2021-2022; Test on unseen 2023 season
  [Tier C: Spatial]       ──> Leave-One-District-Out (Train: 3 Districts; Test: 1 District)
  [Tier D: In-Situ Field] ──> Real-time prospective validation across active farm plots
  [Tier E: External]      ──> Test across adjacent agroclimatic zones (Andhra Pradesh / Kerala)
```

### A. Retrospective Historical Validation
* **Objective:** Benchmark rule-based gating against documented historical disease surveys and research trial logs.
* **Data Requirements:** Historical trial records (e.g. AICRPS Bhavanisagar 2021–2023).
* **Role:** Sanity checking biophysical threshold alignment.

### B. Temporal Validation (Split-by-Crop-Season)
* **Objective:** Test model robustness against seasonal climatic variability (e.g. wet monsoon year vs. drought year).
* **Protocol:** Fit/calibrate parameters exclusively on seasons $Y_1, Y_2$ (e.g. 2021–2022); test out-of-sample on season $Y_3$ (2023).
* **Strict Rule:** Random shuffle cross-validation is **prohibited** for time-series data due to temporal autocorrelation.

### C. Spatial Validation (Leave-One-District-Out Cross-Validation)
* **Objective:** Assess geographic generalization across distinct microclimates and soil orders.
* **Protocol:** Train/calibrate on 3 districts (e.g. Erode, Salem, Dharmapuri); test entirely out-of-region on Coimbatore.
* **Evaluation:** Verifies that model does not memorize localized elevation or rainfall patterns.

### D. Prospective In-Situ Field Validation
* **Objective:** Evaluate real-time operational disease forewarning capability on commercial turmeric farms.
* **Protocol:** Weekly field scouting across $\ge 20$ designated farmer plots in Erode and Coimbatore over an active crop cycle (June to February).
* **Metrics:** Early-warning lead time (number of days warning precedes visible symptom emergence).

### E. External Agroclimatic Validation
* **Objective:** Test transportability to external turmeric cultivation zones outside Western Tamil Nadu (e.g., Duggirala, Andhra Pradesh; Kozhikode, Kerala).

---

## 2. Data Leakage Prevention Framework

Data leakage is a primary source of inflated accuracy in agricultural AI. The following six anti-leakage constraints are strictly mandated:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA LEAKAGE PREVENTION SAFEGUARDS                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Leakage Risk Mechanism | Description of Potential Flaw | Mandatory Prevention Protocol |
| :--- | :--- | :--- |
| **1. Overlapping Antecedent Windows** | Two disease observations recorded 3 days apart share 11 days of identical antecedent weather. | Enforce a minimum **$\ge 14\text{-day}$ temporal buffer** between observations from the same field site, or group temporally clustered records into single survey events. |
| **2. Clustered Research Station Dependency** | Multiple trial entries from the same research farm share identical soil, management, and microclimate. | Use **Grouped Cross-Validation (`GroupKFold` grouped by Station ID)** so that all records from a given station are exclusively in train OR test. |
| **3. Post-Disease Weather Contamination** | Using weather data from *after* symptoms have already developed to predict risk. | Weather aggregation must terminate strictly on **Observation Date minus 1 day ($T-1$)** or trial scoring onset ($T_{\text{start}}$). |
| **4. Chemical Intervention Masking** | Favorable weather occurs, but farmer sprays systemic fungicide (Mancozeb/Propiconazole), preventing disease emergence. | Include a **Fungicide Spray History Flag**; exclude chemically treated plots from pure biophysical risk validation to avoid false-negative penalties. |
| **5. Image Label Contamination** | Using CNN image detection probabilities to predict environmental risk directly. | Decouple the environmental risk engine from image classifier weights; environmental risk must be evaluated independently before multimodal fusion. |
| **6. Synthetic Calibration Artifacts** | Fitting threshold boundaries to artificially generated weather numbers. | Calibrate exclusively on source-verified observational and reanalysis datasets. |

---

## 3. Evaluation Metrics Strategy

When future empirical validation is executed, performance must be assessed using standard epidemiological and classification metrics:

### For Categorical Risk (`LOW`, `MODERATE`, `HIGH`):
1. **Balanced Accuracy:**
   $$\text{Balanced Accuracy} = \frac{1}{K} \sum_{k=1}^K \frac{\text{True Positive}_k}{\text{Total Actual}_k} \quad [\text{Accounts for class imbalance}]$$
2. **Macro-Averaged F1-Score:**
   $$\text{Macro F1} = \frac{1}{K} \sum_{k=1}^K \frac{2 \times \text{Precision}_k \times \text{Recall}_k}{\text{Precision}_k + \text{Recall}_k}$$
3. **Sensitivity / True Positive Rate (High-Risk Recall):**
   * Critical agricultural safety metric: Measures the proportion of actual disease outbreaks that received a `HIGH` risk warning. False negatives (missed outbreaks) carry higher economic cost than false alarms.
4. **Specificity (Low-Risk Specificity):**
   * Measures the ability to correctly identify safe conditions without generating excessive false alarms that cause unnecessary chemical spraying.
5. **Confusion Matrix & Reliability Diagrams (Brier Score):**
   * For evaluating probabilistic calibration if probabilities are eventually produced.

### For Continuous Percent Disease Index (PDI), if eventually modeled:
* **Mean Absolute Error (MAE):** $\text{MAE} = \frac{1}{n} \sum | \text{PDI}_{\text{pred}} - \text{PDI}_{\text{obs}} |$
* **Root Mean Squared Error (RMSE):** $\text{RMSE} = \sqrt{\frac{1}{n} \sum (\text{PDI}_{\text{pred}} - \text{PDI}_{\text{obs}})^2}$
* **Spearman Rank Correlation ($\rho$):** For evaluating monotonic ranking of disease severity across fields.

---

## 4. Minimum Evidence Thresholds Before Claiming Performance

To uphold academic integrity and prevent premature performance claims, the following **Stopping & Publication Criteria** are established:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MINIMUM EVIDENCE PUBLICATION THRESHOLDS                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

* **Sample Size Requirement:** Minimum of **$n \ge 50\text{ to }100$ independent field observations** across at least **$\ge 2$ distinct calendar years** and **$\ge 3$ agricultural districts**.
* **Negative Control Requirement:** Minimum of **$\ge 20$ documented healthy/zero-disease control plots** evaluated under identical weather tracking.
* **Prohibited Claims at Current Phase ($n = 8$):**
  * Do NOT claim achieved classification accuracy, precision, or F1 scores.
  * Do NOT claim a "validated predictive disease model".
  * Do NOT claim "proven real-time early warning".

---

## 5. Future Data Collection Protocol & Standardized Logging Schema

To transition from the current development phase to a fully calibrated empirical engine, future field studies must capture the following standardized 20-field tabular record:

### Standardized Field Scouting & Telemetry Record Schema

```csv
record_timestamp_ist,district,taluk_village,gps_latitude,gps_longitude,farm_id,turmeric_variety,planting_date,scouting_date,days_after_planting_dap,crop_growth_stage,target_disease,visual_severity_pdi,visual_photo_filename,fungicide_applied_last_14d,fungicide_name_and_dose,canopy_leaf_wetness_sensor_mv,canopy_rh_sensor_pct,rhizome_depth_soil_moisture_pct,field_soil_ph
```

### Logging Protocol:
1. **Scouting Frequency:** Bi-weekly visual scoring using standard 0–9 TNAU foliar disease rating scales across 20 representative plants per acre.
2. **Antecedent Synchronisation:** Automated extraction of 14-day antecedent hourly weather stream terminating on the midnight preceding the scouting date.
3. **Intervention Logging:** Full recording of irrigation schedules and chemical/bio-control applications to isolate pure biophysical effects from farmer management.
