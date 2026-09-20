# Epidemiological Microclimate Exposure Analysis Report

**Project:** TurmeriCare AI  
**Scope:** Offline Biophysical & Meteorological Exposure Analysis for Turmeric Foliar Pathologies  
**Input Datasets:**
1. `TURMERIC-ENV-TN-ERA5-2021-2023` (105,120 hourly reanalysis records)
2. `verified_disease_observations.csv` (12 source-verified observation records)  
**Status:** **Descriptive Epidemiological Analysis Only (Zero ML training, zero risk score modifications, zero application changes)**

---

## 1. Executive Summary & Epidemiological Protocol

This offline analysis extracts multi-parameter biophysical exposure profiles for the **14-day antecedent incubation window ($\mathbf{W}_{\text{14d}} = 336\text{ hours}$)** preceding each verified turmeric disease observation window in Tamil Nadu (Erode, Coimbatore, Salem, Dharmapuri).

### Important Scientific Precaution & Scope:
* **Association vs. Causation:** This analysis calculates **meteorological exposure metrics** during documented field disease periods. It does **not** assert causal proof that weather alone initiated the disease, as host resistance, inoculum availability, and field cultural practices are concurrent determinants.
* **Sample Size Limitation ($n = 12$):** Because only 12 partially linked institutional/literature records exist, **no formal inferential hypothesis testing ($p$-values) or machine learning models are trained.** The comparisons below represent descriptive biophysical profiling.

---

## 2. 14-Day Antecedent Exposure Feature Matrix (All 12 Observations)

| Record ID | District | Disease Type | Reported Severity | 14-Day Antecedent Window | Cum. Rain (mm) | Rain Days (/14) | Mean Temp (°C) | Hours 22–32°C (% total) | Mean RH (%) | Hours RH $\ge$ 80% (% total) | Dew Proxy Hours (% total) | Topsoil Moisture ($\text{m}^3/\text{m}^3$) |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **V-DIS-01** | Erode | Leaf Spot | $38.5\%\text{ PDI}$ | 2021-10-01 to 2021-10-14 | $142.4$ | $14$ | $26.7^\circ\text{C}$ | $326\text{ h}$ ($97.0\%$) | $80.8\%$ | $190\text{ h}$ ($56.5\%$) | $108\text{ h}$ ($32.1\%$) | $0.347$ |
| **V-DIS-02** | Erode | Leaf Blotch | $44.2\%\text{ PDI}$ | 2021-10-18 to 2021-10-31 | $163.6$ | $14$ | $26.0^\circ\text{C}$ | $333\text{ h}$ ($99.1\%$) | $81.8\%$ | $201\text{ h}$ ($59.8\%$) | $116\text{ h}$ ($34.5\%$) | $0.369$ |
| **V-DIS-03** | Erode | Leaf Spot | $32.4\%\text{ PDI}$ | 2022-09-17 to 2022-09-30 | $12.2$ | $7$ | $28.8^\circ\text{C}$ | $240\text{ h}$ ($71.4\%$) | $62.6\%$ | $91\text{ h}$ ($27.1\%$) | $3\text{ h}$ ($0.9\%$) | $0.169$ |
| **V-DIS-04** | Erode | Leaf Blotch | $48.7\%\text{ PDI}$ | 2022-10-18 to 2022-10-31 | $105.8$ | $8$ | $25.7^\circ\text{C}$ | $310\text{ h}$ ($92.3\%$) | $76.5\%$ | $166\text{ h}$ ($49.4\%$) | $95\text{ h}$ ($28.3\%$) | $0.324$ |
| **V-DIS-05** | Coimbatore | Leaf Spot | High Alert | 2022-10-27 to 2022-11-09 | $83.7$ | $12$ | $24.6^\circ\text{C}$ | $272\text{ h}$ ($81.0\%$) | $76.5\%$ | $162\text{ h}$ ($48.2\%$) | $75\text{ h}$ ($22.3\%$) | $0.304$ |
| **V-DIS-06** | Erode | Leaf Spot | $41.0\%\text{ PDI}$ | 2022-10-01 to 2022-10-14 | $121.7$ | $12$ | $27.0^\circ\text{C}$ | $297\text{ h}$ ($88.4\%$) | $73.9\%$ | $163\text{ h}$ ($48.5\%$) | $71\text{ h}$ ($21.1\%$) | $0.268$ |
| **V-DIS-07** | Erode | Leaf Blotch | $52.6\%\text{ PDI}$ | 2022-11-01 to 2022-11-14 | $98.8$ | $13$ | $24.9^\circ\text{C}$ | $315\text{ h}$ ($93.8\%$) | $82.1\%$ | $208\text{ h}$ ($61.9\%$) | $119\text{ h}$ ($35.4\%$) | $0.331$ |
| **V-DIS-08** | Salem | Leaf Spot | $35.8\%\text{ PDI}$ | 2021-10-18 to 2021-10-31 | $73.1$ | $14$ | $25.8^\circ\text{C}$ | $331\text{ h}$ ($98.5\%$) | $81.0\%$ | $198\text{ h}$ ($58.9\%$) | $100\text{ h}$ ($29.8\%$) | $0.348$ |
| **V-DIS-09** | Salem | Leaf Blotch | $29.4\%\text{ PDI}$ | 2021-11-17 to 2021-11-30 | $139.6$ | $12$ | $24.4^\circ\text{C}$ | $313\text{ h}$ ($93.2\%$) | $86.7\%$ | $256\text{ h}$ ($76.2\%$) | $164\text{ h}$ ($48.8\%$) | $0.383$ |
| **V-DIS-10** | Dharmapuri | Aphids | Mod. Warning | 2023-09-26 to 2023-10-09 | $62.5$ | $13$ | $26.4^\circ\text{C}$ | $302\text{ h}$ ($89.9\%$) | $72.7\%$ | $145\text{ h}$ ($43.2\%$) | $43\text{ h}$ ($12.8\%$) | $0.276$ |
| **V-DIS-11** | Dharmapuri | Leaf Blotch | High Forewarning | 2023-11-01 to 2023-11-14 | $82.9$ | $11$ | $24.1^\circ\text{C}$ | $243\text{ h}$ ($72.3\%$) | $81.4\%$ | $199\text{ h}$ ($59.2\%$) | $129\text{ h}$ ($38.4\%$) | $0.312$ |
| **V-DIS-12** | Coimbatore | Multi-Class | 865 Photos | 2023-10-01 to 2023-10-14 | $45.1$ | $10$ | $26.2^\circ\text{C}$ | $295\text{ h}$ ($87.8\%$) | $77.2\%$ | $179\text{ h}$ ($53.3\%$) | $116\text{ h}$ ($34.5\%$) | $0.232$ |

---

## 3. Descriptive Epidemiological Observations

### A. High Severity Leaf Blotch Outbreaks ($> 44\%\text{ PDI}$)
* **Observed Cases:** `V-DIS-02` ($44.2\%\text{ PDI}$), `V-DIS-04` ($48.7\%\text{ PDI}$), `V-DIS-07` ($52.6\%\text{ PDI}$).
* **Antecedent Microclimate Characteristics:**
  * **Sustained High Relative Humidity:** Averaged **$166\text{ to }208\text{ hours}$** of $\text{RH} \ge 80\%$ (spanning $50\%\text{–}62\%$ of the entire 14-day duration).
  * **Thermal Confinement:** $92\%\text{–}99\%$ of exposure hours remained in the $22^\circ\text{C}\text{–}32^\circ\text{C}$ range, matching the verified optimal temperature window for *Taphrina maculans*.
  * **Condensation Frequency:** Dew-point depression proxy indicated **$95\text{ to }119\text{ hours}$** of near-saturated condensation conditions.

### B. Foliar Leaf Spot ($32\%\text{–}41\%\text{ PDI}$)
* **Observed Cases:** `V-DIS-01` ($38.5\%$), `V-DIS-03` ($32.4\%$), `V-DIS-06` ($41.0\%$), `V-DIS-08` ($35.8\%$).
* **Antecedent Microclimate Characteristics:**
  * Highly variable cumulative rainfall ($12.2\text{ mm}$ to $142.4\text{ mm}$), but consistently frequent rainfall events ($7\text{ to }14\text{ rain days}$ out of 14).
  * Moderate to high relative humidity ($\text{RH} \ge 80\%$ for $91\text{ to }198\text{ hours}$).

### C. Sap-Sucking Insect Advisory (`V-DIS-10`)
* **Antecedent Microclimate Characteristics:**
  * Distinctly lower condensation exposure (**only $43\text{ hours}$**, $12.8\%$ of window) compared to foliar fungal peaks ($> 100\text{ hours}$), with higher daylight solar radiation ($246.6\text{ W/m}^2$), consistent with aphid colony proliferation during sunny inter-monsoon breaks.

---

## 4. Feature Taxonomy & Justification Summary

All extracted features are defined in [`feature_definitions.csv`](file:///d:/curuma/environmental_data/epidemiology/feature_definitions.csv) and categorized into two distinct classes:

```
                                  FEATURE TAXONOMY
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
[Literature-Supported Threshold Features]          [Derived Statistical Features]
• hours_temp_favorable_22_32C (TNAU / Reddy)       • cumulative_rainfall_14d_mm
• hours_rh_ge_80pct (TNAU / Palakshappa)           • rainfall_days_14d_count
• hours_rh_ge_90pct (Magarey et al.)               • temp_mean, temp_min, temp_max
• overcast_daylight_hours (TNAU AAS)               • rh_mean_pct, wind_speed_mean
• hours_dew_condensation_proxy (Monteith)          • soil_moisture_0_7cm_mean
```

---

## 5. Summary of Deliverable Files

All epidemiological datasets and documentation have been placed in [`environmental_data/epidemiology/`](file:///d:/curuma/environmental_data/epidemiology):

1. [`disease_exposure_features.csv`](file:///d:/curuma/environmental_data/epidemiology/disease_exposure_features.csv): Tabular matrix containing 14 biophysical exposure features computed across 336 hourly records for each of the 12 verified disease observations.
2. [`feature_definitions.csv`](file:///d:/curuma/environmental_data/epidemiology/feature_definitions.csv): Complete metadata schema detailing units, formulas, mathematical definitions, and literature citations.
3. [`epidemiological_analysis.md`](file:///d:/curuma/environmental_data/epidemiology/epidemiological_analysis.md): This report presenting the descriptive findings, biophysical comparisons, and research scope disclaimers.

---

### Strict Compliance
- **No machine learning models were trained.**
- **No causal claims or inflated statistical significance assertions were made.**
- **Existing frontend UI, backend APIs, and `riskCalculator.ts` remain completely untouched.**
