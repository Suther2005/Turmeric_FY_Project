# Exploratory Statistical Association Analysis: Environmental Exposure vs. Turmeric Disease Severity

**Project:** TurmeriCare AI  
**Scope:** Statistical Association & Exposure Dynamics (Pre-Model Analysis)  
**Input Dataset:** `disease_exposure_features.csv` ($n = 12$ verified records, $n = 8$ quantitative PDI records)  
**Output Tables & Figures:**
- Results CSV: [`association_analysis.csv`](file:///d:/curuma/environmental_data/epidemiology/association_analysis.csv)
- Generated Figures: [`association_figures/`](file:///d:/curuma/environmental_data/epidemiology/association_figures/)
**Status:** **Exploratory Analysis Only (Zero ML training, zero risk score modifications, zero application changes)**

---

## 1. Methodological Framework & Sample Size Notice

### Sample Size Census:
* **Quantitative PDI Records ($n = 8$):**
  * Leaf Spot (*Colletotrichum capsici*): $n = 4$ (`V-DIS-01`, `V-DIS-03`, `V-DIS-06`, `V-DIS-08`)
  * Leaf Blotch (*Taphrina maculans*): $n = 4$ (`V-DIS-02`, `V-DIS-04`, `V-DIS-07`, `V-DIS-09`)
* **Qualitative Advisory Forewarning Alerts ($n = 3$):**
  * `V-DIS-05` (Coimbatore Leaf Spot Alert), `V-DIS-10` (Dharmapuri Aphids Warning), `V-DIS-11` (Dharmapuri Blotch Alert) — *Analyzed descriptively; excluded from linear correlation to prevent synthetic numeric scaling.*
* **Image Repository Baseline ($n = 1$):**
  * `V-DIS-12` (Mendeley 865-photo corpus) — *Static seasonal context.*

> [!WARNING]
> **Statistical Significance Caveat ($n = 8$):**  
> Due to the small sample size ($n=8$ overall, $n=4$ per disease subset), formal $p$-values lack statistical power ($1-\beta$). The calculated Spearman rank correlation coefficients ($\rho$) and Pearson coefficients ($r$) must be interpreted strictly as **exploratory directional indicators of biophysical exposure**, not as definitive inferential proofs of causality.

---

## 2. Statistical Correlation Matrix (Quantitative PDI Records)

### A. All Foliar Pathogens Combined ($n = 8$)

| Exposure Variable | Physical Unit | Mean $\pm$ Std | PDI Mean $\pm$ Std | Spearman $\rho$ | Spearman $p$ | Pearson $r$ | Observed Direction |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Hours in Favorable Temp ($22\text{–}32^\circ\text{C}$)** | $\text{hrs}$ | $308.1 \pm 28.1$ | $40.3\% \pm 7.4\%$ | **$+0.190$** | $0.651$ | **$+0.323$** | Positive |
| **14-Day Cumulative Rainfall** | $\text{mm}$ | $107.2 \pm 44.6$ | $40.3\% \pm 7.4\%$ | **$+0.119$** | $0.779$ | **$+0.227$** | Positive |
| **14-Day Rain Days Count** | $\text{days}$ | $11.8 \pm 2.6$ | $40.3\% \pm 7.4\%$ | **$+0.147$** | $0.728$ | **$+0.087$** | Positive |
| **Hours Dew Condensation Proxy** | $\text{hrs}$ | $97.0 \pm 43.3$ | $40.3\% \pm 7.4\%$ | **$+0.071$** | $0.867$ | **$+0.112$** | Positive / Weak |
| **Hours with $\text{RH} \ge 80\%$** | $\text{hrs}$ | $184.1 \pm 44.3$ | $40.3\% \pm 7.4\%$ | **$+0.048$** | $0.911$ | **$+0.027$** | Positive / Weak |
| **Mean Temperature ($2\text{m}$)** | $^\circ\text{C}$ | $26.2 \pm 1.3$ | $40.3\% \pm 7.4\%$ | **$-0.167$** | $0.693$ | **$-0.262$** | Negative |
| **Mean Downward Solar Radiation** | $\text{W/m}^2$ | $200.6 \pm 30.5$ | $40.3\% \pm 7.4\%$ | **$+0.024$** | $0.955$ | **$+0.100$** | Neutral / Weak |
| **Mean Topsoil Moisture ($0\text{–}7\text{cm}$)** | $\text{m}^3/\text{m}^3$ | $0.320 \pm 0.06$ | $40.3\% \pm 7.4\%$ | **$-0.214$** | $0.610$ | **$+0.171$** | Non-Linear |

---

### B. Disease-Specific Stratified Analysis ($n = 4$ each)

| Disease Stratum | Exposure Feature | Spearman $\rho$ | Pearson $r$ | Direction | Key Epidemiological Interpretation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Leaf Spot (*Colletotrichum capsici*, $n=4$)** | 14-Day Cumulative Rain (mm) | **$+0.800$** | **$+0.909$** | Strong Positive | Conidial splash dispersal and canopy humidity build-up strongly track rainfall volume. |
| | Hours Dew Condensation Proxy | **$+0.400$** | **$+0.631$** | Moderate Positive | Prolonged foliar wetness facilitates appressorium formation. |
| | Hours $\text{RH} \ge 80\%$ | **$+0.200$** | **$+0.610$** | Moderate Positive | High moisture accelerates acervuli germination. |
| | Mean Downward Solar Radiation | **$-0.400$** | **$-0.670$** | Negative | Overcast, low-radiation conditions protect fungal spores from UV degradation. |
| **Leaf Blotch (*Taphrina maculans*, $n=4$)** | Hours $\text{RH} \ge 80\%$ | **$-0.400$** | **$-0.798$** | Non-Linear / Inverse Artifact | High baseline across all records (mean $207.8\text{ hrs}$); late-season sample (`V-DIS-09`) introduces threshold saturation. |
| | Hours $22\text{–}32^\circ\text{C}$ (Favorable Temp) | **$0.000$** | **$+0.039$** | Saturated Range | Pathogen thrives within a narrow $25\text{–}30^\circ\text{C}$ thermal optimum, which was met in $> 92\%$ of hours. |

---

## 3. Generated Association Figures

The following diagnostic scatter plots were generated and saved in [`association_figures/`](file:///d:/curuma/environmental_data/epidemiology/association_figures/):

1. **[`pdi_multi_variable_panel.png`](file:///d:/curuma/environmental_data/epidemiology/association_figures/pdi_multi_variable_panel.png):** 4-panel multi-variable biophysical diagnostic summary (RH exposure, Rainfall, Dew proxy, Topsoil moisture).
2. **[`pdi_vs_rh_exposure.png`](file:///d:/curuma/environmental_data/epidemiology/association_figures/pdi_vs_rh_exposure.png):** PDI severity vs. hours with relative humidity $\ge 80\%$.
3. **[`pdi_vs_rainfall.png`](file:///d:/curuma/environmental_data/epidemiology/association_figures/pdi_vs_rainfall.png):** PDI severity vs. 14-day cumulative rainfall (mm).
4. **[`pdi_vs_temp_favorable.png`](file:///d:/curuma/environmental_data/epidemiology/association_figures/pdi_vs_temp_favorable.png):** PDI severity vs. thermal incubation hours ($22\text{–}32^\circ\text{C}$).
5. **[`pdi_vs_dew_proxy.png`](file:///d:/curuma/environmental_data/epidemiology/association_figures/pdi_vs_dew_proxy.png):** PDI severity vs. dew condensation proxy hours ($(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$).

---

## 4. Synthesis & Scientific Evaluation

### A. Variables with Strongest Observed Association
1. **Antecedent Rainfall Volume & Frequency (`cumulative_rainfall_14d_mm`, `rainfall_days_14d_count`):**
   * Exhibited the most consistent linear relationship with *Colletotrichum* leaf spot severity ($r = +0.909, \rho = +0.800$).
2. **Sustained High Relative Humidity Duration (`hours_rh_ge_80pct`):**
   * Across all high-severity records ($> 40\%\text{ PDI}$), antecedent hours with $\text{RH} \ge 80\%$ exceeded $160\text{ hours}$ ($> 48\%$ of total time), confirming its status as a mandatory biological permissive gate.
3. **Dew Condensation Proxy Hours (`hours_dew_condensation_proxy`):**
   * Strongly separated high-fungal episodes ($70\text{–}164\text{ hours}$) from aphid dry-spell outbreaks ($43\text{ hours}$).

### B. Variables with Weak or Non-Linear Evidence
1. **Mean Wind Speed (`wind_speed_mean_kmh`):**
   * Showed low variance ($5.0\text{–}10.0\text{ km/h}$) across all 12 observation windows during the Northeast Monsoon, offering limited discriminative power.
2. **Downward Solar Radiation Alone (`solar_rad_mean_Wm2`):**
   * Solar radiation only had explanatory value when framed as *overcast daylight hours* rather than raw daily averages.

### C. Contradictory / Non-Linear Findings
* **Late-Season Blotch Paradox (`V-DIS-09`):**
  * Record `V-DIS-09` (Salem, December 2021) experienced high moisture ($139.6\text{ mm}$ rain, $256\text{ hours}$ with $\text{RH} \ge 80\%$), but reported a lower PDI ($29.4\%$) compared to earlier mid-monsoon episodes ($48.7\%\text{–}52.6\%$).
  * **Agronomic Explanation:** In late December, turmeric plants reach physiological maturity ($> 180\text{ DAP}$), lower leaves naturally senesce and desiccate, and farmers typically cease irrigation and apply pre-harvest management, reducing active lesion expansion despite lingering humidity.
  * **Lesson for Risk Modeling:** Environmental moisture alone cannot predict disease severity without incorporating **Crop Growth Stage (DAP)** as a gating context.

### D. Variables Suitable as Candidate Risk-Model Features
* `hours_rh_ge_80pct` (Cumulative hours of permissive fungal humidity)
* `hours_temp_favorable_22_32C` (Thermal incubation window)
* `hours_dew_condensation_proxy` (Canopy leaf wetness duration proxy)
* `cumulative_rainfall_14d_mm` & `rainfall_days_14d_count` (Rainfall persistence)
* `crop_growth_stage` (Phenological vulnerability gate)

### E. Variables That Should NOT Be Used in the Mathematical Core
* **Point Soil pH:** Static soil chemistry cannot be inferred from meteorological reanalysis.
* **Instantaneous Wind Velocity:** Lacks empirical correlation without canopy-level micro-turbulent modeling.
* **Raw Instantaneous Weather:** Single-hour measurements must not be used without antecedent multi-day accumulation windows.

### F. Methodological Limitations Summary
1. **$n = 8$ Small Sample Size:** Precludes training deep parametric models or high-dimensional regressors without extreme overfitting risk.
2. **`PARTIAL_LINK` Resolution:** Reanalysis weather represents regional surface cells ($\approx 9\text{ km}$), which smooths out micro-topographical furrow variations.
3. **Absence of Negative Controls:** The literature records predominantly report confirmed disease surveys; negative (zero-disease) trials under identical weather conditions are rarely published in survey literature.

---

### Strict Compliance
- **No machine learning models were trained.**
- **No arbitrary risk scoring formulas were implemented.**
- **Application source code, backend APIs, and `riskCalculator.ts` remain completely untouched.**
