# Methodology Specification: Turmeric Disease Environmental Risk Engine

**Project:** TurmeriCare AI  
**Document Type:** Research Methodology Design (Stage 5A)  
**Target Publication Scope:** IEEE Conference / Academic Journal in Agricultural AI & Precision Pathology  
**Status:** **Strict Research Design Only (Zero ML training, zero risk score formulas, zero application code modified)**

---

## 1. Modeling Objective & Problem Formulation

### 1.1 Mathematical Objective
The objective of the future TurmeriCare Environmental Risk Engine is to evaluate the **candidate biophysical permissiveness of the microclimate** for specific turmeric foliar pathologies over an antecedent exposure window.

$$\mathcal{M}_{\text{risk}}: \left( \mathbf{X}_{\text{env}}^{(14\text{d})},\ \text{DAP},\ \mathcal{D}_{\text{target}} \right) \longrightarrow \mathcal{R}_{\text{category}} \in \{\text{LOW},\ \text{MODERATE},\ \text{HIGH}\}$$

* **Input Vector ($\mathbf{X}_{\text{env}}^{(14\text{d})}$):** Vector of 14-day antecedent biophysical exposure features derived from hourly meteorological time series (e.g. cumulative rainfall, rain days frequency, hours with $\text{RH} \ge 80\%$, hours in favorable temperature range $22\text{–}32^\circ\text{C}$, dew/condensation proxy hours).
* **Crop Phenological Context ($\text{DAP}$):** Days After Planting or discrete growth stage (Vegetative: 60–120 DAP, Rhizome Development: 120–180 DAP, Rhizome Maturation/Senescence: $> 180\text{ DAP}$).
* **Target Pathology ($\mathcal{D}_{\text{target}}$):** Disease context (e.g., Leaf Spot, Leaf Blotch, Aphids).
* **Output ($\mathcal{R}_{\text{category}}$):** Conceptual tripartite categorical risk classification (`LOW`, `MODERATE`, `HIGH`).

> [!IMPORTANT]
> **No Numerical Probability or Weight Claims:**  
> The model output represents a **conceptual environmental risk category**, NOT an uncalibrated Bayesian posterior probability. No arbitrary numerical cutoffs or learned feature weights are established in this design, as the current empirical dataset ($n = 8$ quantitative PDI observations) is strictly insufficient for numerical optimization.

### 1.2 Justification for Disease-Specific Risk Logic vs. Generic Environmental Score
A generic, single environmental score (e.g., scoring general "weather stress" as in early heuristics) is scientifically inadequate for turmeric cultivation because distinct pathogens exhibit divergent biophysical associations:
1. **Divergent Pathogen Moisture Associations:**
   * *Colletotrichum capsici* (Leaf Spot) exhibits a **strong exploratory correlation in a very small sample ($r = +0.909, \rho = +0.800, n = 4$)** with liquid precipitation and splash dispersal, rather than being a validated causal law.
   * *Taphrina maculans* (Leaf Blotch) is primarily **air-borne** and associated in literature with **sustained high atmospheric humidity ($\text{RH} \ge 80\%$) and prolonged dew condensation**, occurring even during dry spells if nighttime dew persists.
2. **Opposite Directionality for Insect Pests vs. Foliar Fungi:**
   * Sap-sucking pests (*Aphis gossypii*, thrips) are documented to proliferate during **warm, dry, low-humidity periods ($\text{RH} < 65\%$, Temp $> 28^\circ\text{C}$)** and are mechanically washed off by heavy rainfall. A generic "high moisture = high risk" engine would produce inverted, erroneous recommendations for pest pressure.
3. **Phenological Susceptibility Windows:**
   * Leaf Spot onset is documented earlier in the vegetative phase (August–September), whereas Leaf Blotch is reported with higher incidence during the post-monsoon rhizome development phase (October–December).

---

## 2. Disease-Specific Risk Logic Pathways

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DISEASE-SPECIFIC BIOPHYSICAL PATHWAYS                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Pathway A: Leaf Spot]       [Pathway B: Leaf Blotch]   [Pathway C: Aphids]│
│  • Rain Volume (Splash)       • High RH Duration (≥80%)  • Warm Temp (>28°C)│
│  • Rain Days Frequency        • Dew Condensation Proxy   • Low RH (<65%)    │
│  • Favorable Temp (21-32°C)   • Favorable Temp (25-30°C) • Rain Absence     │
│  • DAP (60-160 DAP)           • DAP (120-180 DAP)        • Vegetative Phase │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pathway A: Turmeric Leaf Spot (*Colletotrichum capsici*)
* **Relevant Candidate Features:** `cumulative_rainfall_14d_mm`, `rainfall_days_14d_count`, `hours_rh_ge_80pct`, `hours_temp_favorable_22_32C`, `hours_dew_condensation_proxy`.
* **Biological Rationale:** Ascomycete fungus forming acervuli. Conidia are encased in hydrophilic mucilage requiring water droplets/splash for dispersal, followed by reported $\ge 6\text{–}12\text{ hours}$ of foliar wetness at $21\text{–}32^\circ\text{C}$ for appressorial penetration.
* **Contextual Variable:** Active canopy development (90–160 DAP).
* **Expected Direction:** Positive observed association with rainfall volume, rainfall frequency, high-RH duration, and dew-condensation proxy hours; negative association with direct solar radiation.
* **Excluded Variables:** Static soil pH (uncalibrated in meteorological models), 10m wind speed (lacks sub-canopy hydrodynamic correlation).

### Pathway B: Turmeric Leaf Blotch (*Taphrina maculans*)
* **Relevant Candidate Features:** `hours_rh_ge_80pct`, `hours_dew_condensation_proxy`, `hours_temp_favorable_22_32C`, `overcast_daylight_hours`.
* **Biological Rationale:** Biotrophic ascomycete producing exposed asci on lower leaf surfaces. Ascospores are discharged under conditions of high humidity ($\text{RH} \ge 80\%$) and moderate temperatures ($25\text{–}30^\circ\text{C}$).
* **Contextual Variable:** Rhizome development stage (120–180 DAP). Senescing crops ($> 180\text{ DAP}$) are hypothesized to exhibit reduced active lesion expansion.
* **Expected Direction:** Positive association with sustained high-RH hours, dew-condensation proxy duration, and persistent overcast cloudiness; narrow thermal optimum ($25\text{–}30^\circ\text{C}$).
* **Excluded Variables:** Raw rainfall volume alone (blotch is reported to proliferate via dew and high humidity even in the absence of heavy downpours).

### Pathway C: Sap-Sucking Pests & Vectors (*Aphis gossypii*, Thrips)
* **Relevant Candidate Features:** `mean_temperature` ($> 28^\circ\text{C}$), `solar_rad_mean_Wm2` (high daytime flux), `rainfall_days_14d_count` (absence of rain).
* **Biological Rationale:** Sucking insects multiply during warm, dry periods. Heavy rain events are documented to mechanically dislodge colonies from leaf undersides.
* **Contextual Variable:** Early vegetative growth to rhizome initiation (60–140 DAP).
* **Expected Direction:** Positive association with dry spells, higher temperatures, and high solar radiation; negative association with rainfall events ($> 10\text{ mm/day}$).
* **Excluded Variables:** Fungal spore germination thresholds ($\text{RH} \ge 80\%$, dew-point proxies).

---

## 3. Feature Transformation Layer

The transformation layer converts raw, multi-source hourly weather data into biologically meaningful antecedent microclimate exposure features over a standardized **14-day antecedent window ($\mathbf{W}_{\text{14d}} = 336\text{ consecutive hours}$)**.

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│ Raw Hourly Stream (t-336) │ ───> │ Biophysical Accumulators  │ ───> │ 14-Day Exposure Vector    │
│ • Temp, RH, DewPt, Precip │      │ • Integral Thresholds     │      │ • X_env (10 Parameters)   │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

### Transformation Specifications

1. **Moisture Permissiveness Accumulator (`hours_rh_ge_80pct`):**
   $$\text{Hours}_{\text{RH}\ge 80} = \sum_{t=1}^{336} \mathbb{I}\left(\text{RH}_t \ge 80.0\%\right) \quad [\text{hours, range } 0\text{--}336]$$
   *Biological Meaning:* Measures the cumulative duration of atmosphere potentially favorable for fungal spore hydration and conidial germination (TNAU / Reddy et al.).

2. **Thermal Incubation Gate (`hours_temp_favorable_22_32C`):**
   $$\text{Hours}_{\text{TempOpt}} = \sum_{t=1}^{336} \mathbb{I}\left(22.0^\circ\text{C} \le T_t \le 32.0^\circ\text{C}\right) \quad [\text{hours, range } 0\text{--}336]$$
   *Biological Meaning:* Measures the total hours where temperature remained within the literature-supported favorable range for *Colletotrichum* and *Taphrina* mycelial metabolism.

3. **Canopy Condensation Proxy Accumulator (`hours_dew_condensation_proxy`):**
   $$\text{Hours}_{\text{DewProxy}} = \sum_{t=1}^{336} \mathbb{I}\left((T_t - T_{\text{dew}, t}) \le 1.5^\circ\text{C}\right) \quad [\text{hours, range } 0\text{--}336]$$
   *Biological Meaning:* Measures the duration of atmospheric near-saturation serving as a proxy for potential dew condensation and free water film presence (Monteith & Unsworth).

4. **Rainfall Volume & Persistence Integrals (`cumulative_rainfall_14d_mm`, `rainfall_days_14d_count`):**
   $$\text{Rain}_{\text{cum}} = \sum_{t=1}^{336} \text{Precip}_t \quad [\text{mm}], \qquad \text{Rain}_{\text{days}} = \sum_{d=1}^{14} \mathbb{I}\left(\text{Precip}_{\text{daily}, d} > 0.1\text{ mm}\right) \quad [\text{days, range } 0\text{--}14]$$
   *Biological Meaning:* Captures total antecedent precipitation volume and frequency of rain days.

5. **Phenological Context Function ($\Gamma_{\text{pheno}}(\text{DAP})$):**
   $$\Gamma_{\text{pheno}}(\text{DAP}) = \begin{cases} 
   \text{Vegetative Context}, & 60 \le \text{DAP} < 100 \\
   \text{Rhizome Development Context}, & 100 \le \text{DAP} \le 170 \\
   \text{Late Maturity / Senescence Context}, & \text{DAP} > 170
   \end{cases}$$
   *Biological Meaning:* Provides phenological context to account for natural changes in crop susceptibility across growth stages.

---

## 4. Transparent Baseline Model Architecture

Before considering complex machine learning models, a defensible research framework requires an interpretable baseline architecture.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 COMPARISON OF BASELINE MODELING APPROACHES                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Approach | Mathematical Structure | Advantages | Scientific Risks / Limitations | Suitability for Current Phase |
| :--- | :--- | :--- | :--- | :---: |
| **1. Rule-Based Evidence Aggregation (Hierarchical Gating)** | Multi-condition logical decision tree grounded in literature threshold bounds. | 100% transparent, zero overfitting risk on small $n$, directly reflects TNAU agronomic rules. | Rigid boundary step-functions; does not model smooth biophysical trade-offs. | **RECOMMENDED BASELINE** |
| **2. Normalized Biophysical Exposure Indices** | Non-linear fuzzy sigmoidal membership functions $\mu(x) \in [0, 1]$ combined via geometric mean. | Continuous risk gradient; handles multi-variable synergy without arbitrary linear additivity. | Requires careful calibration of transition inflection points ($\beta_0, \beta_1$). | **STRONG CANDIDATE FOR FUTURE PHASES** |
| **3. Expert-Informed Additive Scoring** | Linear additive score $\sum w_i x_i$ with weights assigned by agricultural expert consensus. | Simple to compute and understand. | Prone to arbitrary weight assignment; assumes linear independence between temperature and moisture. | **NOT RECOMMENDED** (Heuristic artifact) |
| **4. Data-Calibrated Parametric Regressors / ML** | Logistic Regression, Random Forest, or XGBoost trained on empirical disease logs. | Learns complex multi-parameter interactions automatically. | **Severe failure risk with $n = 8$**: extreme overfitting, feature multicollinearity, ungeneralizable weights. | **STRICTLY PROHIBITED AT CURRENT SAMPLE SIZE** |

### Selected Design Philosophy: Hierarchical Gating Baseline
For the future baseline engine, we specify a **Hierarchical Gating Architecture**:
1. **Gate 1 (Phenological Context):** Is the crop within a documented susceptible window ($\text{DAP} \in [60, 170]$)?
2. **Gate 2 (Moisture Permissiveness):** Did sustained moisture meet literature-supported thresholds ($\text{Hours}_{\text{RH}\ge 80} \ge 120\text{ h}$ OR $\text{Hours}_{\text{DewProxy}} \ge 60\text{ h}$)? If false, output `LOW`.
3. **Gate 3 (Thermal Incubation):** Was temperature within favorable limits ($\text{Hours}_{\text{TempOpt}} \ge 200\text{ h}$)? If true, evaluate `MODERATE` or `HIGH` based on rainfall persistence.

---

## 5. Small Sample Size & Non-Independence Management

### 5.1 The $n = 8$ Quantitative Sample Size Constraint
The empirical disease dataset contains **$n = 8$ quantitative PDI observations** ($n = 4$ for Leaf Spot, $n = 4$ for Leaf Blotch). 

**What $n = 8$ CANNOT Support:**
* Machine learning model training (Neural networks, Random Forests, SVMs).
* Regression-based feature weight optimization (OLS, Ridge, Lasso).
* Multi-variable interaction modeling.
* Formal inferential claims of population statistical significance ($p < 0.05$).

**What CAN Defensibly Be Done:**
* Verification that candidate features align with established botanical literature.
* Biophysical feature engineering (transforming raw hourly weather into cumulative exposure integrals).
* Transparent, literature-grounded rule-based baseline design.
* Formulation of rigorous data collection protocols for future multi-field expansion.

### 5.2 Controlling for Clustered Non-Independence
* **Station Clustering:** 4 of the 8 quantitative records originate from the same research station (AICRPS Bhavanisagar) in 2021 and 2022.
* **Temporal Overlap:** Antecedent 14-day exposure windows for October and November within the same district share background synoptic circulation patterns.
* **Mitigation Strategy:** Any future quantitative validation must employ **Grouped Leave-One-District-Out** and **Leave-One-Season-Out** cross-validation to prevent cluster-correlated performance overestimation.

---

## 6. Proposed IEEE Conference Paper Methodology Structure

A structured 10-section methodology tailored for peer-reviewed publication:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 IEEE CONFERENCE PAPER METHODOLOGY OUTLINE                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Section | Title & Focus | Currently Available Evidence | Missing Evidence to Acquire |
| :---: | :--- | :--- | :--- |
| **1** | **Data Sources & Provenance** | ECMWF ERA5-Land historical reanalysis ($105,120\text{ hrs}$); TNAU & AICRPS survey archives. | In-situ physical IoT sensor logs; local automatic weather station (AWS) feeds. |
| **2** | **Disease Observation Verification** | 12 source-verified records with explicit PDI metrics and qualitative alert classifications. | Multi-season longitudinal field trial dataset ($n \ge 50\text{–}100$ quantitative observations). |
| **3** | **Environmental Data Acquisition** | Programmatic REST pipeline accessing continuous, quality-controlled hourly reanalysis grids. | Multi-depth capacitive soil moisture and physical leaf wetness resistance grid logs. |
| **4** | **Temporal Alignment & Lag Windows** | Established 14-day antecedent exposure framework ($\mathbf{W}_{\text{14d}}$) based on incubation biology. | Empirical validation of variable lag windows ($7\text{d}, 10\text{d}, 14\text{d}, 21\text{d}$). |
| **5** | **Epidemiological Feature Engineering** | 10 biophysical exposure features with documented mathematical formulas and units. | Canopy microclimate boundary layer aerodynamic transfer coefficients. |
| **6** | **Exploratory Association Analysis** | Directional Spearman rank correlations and multi-variable diagnostic scatter panels. | Large-sample multivariate regression and generalized additive modeling (GAM). |
| **7** | **Disease-Specific Risk Engine Design** | Divergent biophysical logic pathways for Leaf Spot, Leaf Blotch, and Aphids. | Quantitative threshold optimization on independent test cohorts. |
| **8** | **Multimodal Decision Integration** | Conceptual integration pipeline fusing MobileNetV2 leaf diagnostics with environmental risk. | End-to-end multimodal fusion calibration on paired image-weather datasets. |
| **9** | **Validation Protocol & Leakage Controls** | 5-modality validation design (temporal, spatial, field) with grouped cross-validation. | Multi-district prospective field trial validation results. |
| **10** | **Farmer-First Explainable Output** | Bilingual decision-support framework linking risk levels to TNAU extension actions. | Farmer usability studies and field agronomic adoption metrics. |

---

## 7. Novelty Check & Research Contribution Analysis

To ensure scientific honesty, we distinguish between current deliverables and prospective contributions:

### What is NOT Claimed as Novel:
* Atmospheric reanalysis data extraction (standard meteorological practice).
* General plant pathology rules (established by TNAU and ICAR-IISR).
* Standard deep learning image classification (established baseline).

### True Potential Research Contributions (For Future Paper):
1. **Turmeric-Specific Biophysical Exposure Representation:** Formulating tailored antecedent microclimate integrals (hours $\text{RH} \ge 80\%$, dew condensation proxy, thermal incubation gates) specifically adapted to the *Curcuma longa* foliar canopy.
2. **Disease-Specific Multi-Pathway Architecture:** Replacing uncalibrated generic weather scores with distinct epidemiological pathways that differentiate fungal spore splash from aphid dry-spell dynamics.
3. **Phenologically Gated Risk Modulation:** Integrating Days After Planting (DAP) as a contextual gate to account for natural foliar changes during late senescence.
4. **Hardware-Agnostic Multimodal Decision Support:** A unified architecture capable of consuming manual farmer inputs, meteorological reanalysis, or physical ESP32 telemetry to produce explainable agronomic advisories.

---

### Strict Compliance
- **No machine learning models were trained.**
- **No final risk formulas or numerical weights were implemented.**
- **Application source code, backend APIs, and `riskCalculator.ts` remain completely untouched.**
