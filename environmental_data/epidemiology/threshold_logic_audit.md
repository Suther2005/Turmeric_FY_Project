# Scientific Threshold & Logic Audit Report (Stage 5B-2)

**Project:** TurmeriCare AI  
**Document Type:** Scientific Provenance & Threshold Logic Audit (Stage 5B-2)  
**Target Module:** [`src/utils/researchRiskEngine.ts`](file:///d:/curuma/src/utils/researchRiskEngine.ts)  
**Deliverable Matrix:** [`threshold_provenance_corrected.csv`](file:///d:/curuma/environmental_data/epidemiology/threshold_provenance_corrected.csv)  
**Audit Date:** September 2026  
**Auditor:** Scientific Integrity & Agrometeorology Review Engine  

---

> [!IMPORTANT]
> **FINAL AUDIT VERDICT: YELLOW**  
> *The software implementation is technically robust and deterministic, but several operational cumulative boundaries, the 14-day feature-engineering window, the 1.5°C dew proxy, and all multi-condition AND-gates are strictly **engineering assumptions / provisional baselines** rather than empirically validated causal disease laws.*

---

## 1. Structured Scientific Provenance Classification

Every numerical parameter and rule implemented in [`researchRiskEngine.ts`](file:///d:/curuma/src/utils/researchRiskEngine.ts) is classified into four distinct evidentiary tiers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   CORRECTED THRESHOLD PROVENANCE CENSUS                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Total Numerical Thresholds Audited: 32                                      │
│ • Tier 1: SUPPORTED BY SOURCE (Class A):                         12 (37.5%) │
│ • Tier 2: EXPLORATORY (Class B):                                  6 (18.8%) │
│ • Tier 3: PROVISIONAL BASELINES (Class C):                       14 (43.8%) │
│ • Tier 4: ENGINEERING MODEL DESIGN (Multi-Condition Gating):      3 Pathways│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Tier 1: SUPPORTED BY SOURCE (Exact Boundaries Directly from Literature)
*These parameters represent cardinal physiological limits or standard physical definitions directly established in published plant pathology or meteorological standards:*

| Threshold Name | Exact Coded Value | Unit | Authoritative Source Document | Scientific Justification | Paper-Safe Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`INSTANT_RH_PERMISSIVE_THRESHOLD`** | `80.0` | % | TNAU CPPS / ICAR-IISR (`SRC-01`, `SRC-04`) | Established biological requirement for *Colletotrichum* conidial hydration and *Taphrina* ascus dehiscence. | Evidence-supported candidate threshold |
| **`INSTANT_TEMP_MIN_OPTIMUM`** | `22.0` | °C | TNAU CPPS / ICAR-IISR (`SRC-01`, `SRC-04`) | Cardinal thermal lower bound for mycelial growth and appressorial penetration ($21\text{–}32^\circ\text{C}$). | Evidence-supported candidate threshold |
| **`INSTANT_TEMP_MAX_OPTIMUM`** | `32.0` | °C | TNAU CPPS / ICAR-IISR (`SRC-01`, `SRC-04`) | Upper thermal boundary above which foliar fungal lesion expansion is suppressed. | Evidence-supported candidate threshold |
| **`RAIN_DAY_PRECIP_THRESHOLD`** | `0.1` | mm | World Meteorological Organization (WMO) | Standard international definition of a measurable precipitation day. | Standard meteorological criterion |
| **`DAP_LEAF_SPOT_SUSCEPTIBLE_MIN`** | `60` | DAP | TNAU Agritech / ICAR-IISR (`SRC-01`, `SRC-04`) | Documented agronomic onset of active vegetative canopy stage in Tamil Nadu turmeric. | Phenological context window |
| **`DAP_LEAF_SPOT_SUSCEPTIBLE_MAX`** | `160` | DAP | TNAU Agritech / AICRPS (`SRC-01`, `SRC-02`) | Documented active canopy development phase with peak foliar spot susceptibility. | Phenological context window |
| **`DAP_LEAF_BLOTCH_SUSCEPTIBLE_MIN`**| `120` | DAP | TNAU Agritech / ICAR-IISR (`SRC-01`, `SRC-04`) | Documented post-monsoon rhizome development phase when blotch typically emerges. | Phenological context window |
| **`DAP_LEAF_BLOTCH_SUSCEPTIBLE_MAX`**| `180` | DAP | TNAU Agritech / AICRPS (`SRC-01`, `SRC-02`) | Documented late rhizome development phase before pre-harvest canopy dry-down. | Phenological context window |
| **`DAP_SENESCENCE_THRESHOLD`** | `180` | DAP | TNAU Agritech / CPPS (`SRC-01`, `SRC-02`) | Documented crop maturity phase characterized by natural leaf senescence and irrigation cessation. | Phenological senescence context |
| **`DAP_APHID_SUSCEPTIBLE_MIN`** | `30` | DAP | TNAU Agritech / ICAR-IISR (`SRC-01`, `SRC-04`) | Documented early tender shoot emergence phase vulnerable to sap-sucking pests. | Phenological context window |
| **`DAP_APHID_SUSCEPTIBLE_MAX`** | `120` | DAP | TNAU Agritech / ICAR-IISR (`SRC-01`, `SRC-04`) | Documented active vegetative expansion phase before foliar lamina hardening. | Phenological context window |
| **`OVERCAST_SOLAR_RAD_MIN_DAYLIGHT`**| `10.0` | W/m² | Atmospheric Radiation Standards (`SRC-03`) | Standard physical boundary distinguishing night/darkness from daylight illumination. | Physical agrometeorological boundary |

---

### Tier 2: EXPLORATORY (Observed in Small-Sample Historical Records)
*These parameters are calibrated against the $n=8$ historical quantitative disease trial records, representing empirical associations rather than established universal constants:*

| Threshold Name | Exact Coded Value | Unit | Historical Observation Basis | Methodological Limitation | Paper-Safe Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`MOISTURE_RH_HIGH_HOURS`** | `140` | hours / 14d | High blotch trial records ($>40\%\text{ PDI}$) exhibited $>160\text{h}$ with $\text{RH} \ge 80\%$. | Small observational sample ($n=4$ blotch, $n=4$ spot); non-causal. | Exploratory candidate threshold |
| **`DEW_PROXY_HIGH_HOURS`** | `90` | hours / 14d | Historical high-PDI records showed $95\text{–}164\text{h}$ of condensation proxy. | Reanalysis atmospheric proxy, not direct leaf wetness. | Exploratory candidate threshold |
| **`TEMP_FAVORABLE_HIGH_HOURS`** | `180` | hours / 14d | Tropical Tamil Nadu trial periods consistently exhibited $240\text{–}333\text{h}$ in $22\text{–}32^\circ\text{C}$. | Reflects regional synoptic climate, not calibrated thermal kinetics. | Exploratory candidate threshold |
| **`RAIN_HIGH_CUMULATIVE_MM`** | `40.0` | mm / 14d | High Leaf Spot trials had $73\text{–}142\text{ mm}$; lowest had $12.2\text{ mm}$. | Midpoint chosen from $n=4$ records; unvalidated for other soil/crop conditions. | Exploratory candidate threshold |
| **`RAIN_HIGH_DAYS_COUNT`** | `5` | days / 14d | Observed trial records had $7\text{–}14\text{ rain days}$. | $5\text{ days}$ ($\sim 35\%$ of window) selected as exploratory frequency bound. | Exploratory candidate threshold |
| **`APHID_WARM_MEAN_TEMP_C`** | `27.5` | °C | Qualitative advisory records (`V-DIS-10`) aligned with mean temp $26.4\text{–}28.8^\circ\text{C}$. | Qualitative alert correlation; requires field population trapping logs. | Exploratory candidate threshold |

---

### Tier 3: PROVISIONAL BASELINES (Engineering Assumptions)
*These values are operational parameters chosen to allow transparent rule execution, but have **zero direct literature citation establishing their exact numerical cutoff**:*

| Threshold Name | Exact Coded Value | Unit | Engineering Rationale | Scientific Status | Paper-Safe Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`REQUIRED_WINDOW_HOURS`** | `336` | hours (14d) | Standardized 14-day antecedent feature-engineering aggregation window. | **Feature-Engineering Window** (Requires temporal lag validation) | Standardized 14-day feature-engineering window |
| **`DEW_POINT_DEPRESSION_THRESHOLD`**| `1.5` | °C | General agrometeorological boundary for boundary layer saturation. | **Derived Atmospheric Proxy** (Uncalibrated for turmeric canopy) | Derived atmospheric condensation proxy |
| **`MOISTURE_RH_MODERATE_HOURS`** | `80` | hours / 14d | Heuristic intermediate boundary ($\sim 5.7\text{ h/day}$ with $\text{RH} \ge 80\%$). | Provisional baseline | Provisional baseline threshold |
| **`MOISTURE_RH_DEFICIENT_HOURS`** | `60` | hours / 14d | Heuristic deficit cutoff ($<4.3\text{ h/day}$ with $\text{RH} \ge 80\%$). | Provisional baseline | Provisional baseline threshold |
| **`DEW_PROXY_MODERATE_HOURS`** | `50` | hours / 14d | Heuristic intermediate cutoff ($\sim 3.5\text{ h/day}$ condensation proxy). | Provisional baseline | Provisional baseline threshold |
| **`DEW_PROXY_DEFICIENT_HOURS`** | `30` | hours / 14d | Heuristic deficit cutoff ($<2.1\text{ h/day}$ condensation proxy). | Provisional baseline | Provisional baseline threshold |
| **`TEMP_FAVORABLE_MIN_INCUBATION`**| `100` | hours / 14d | Heuristic minimum thermal accumulation gate ($<7.1\text{ h/day}$ in range). | Provisional baseline | Provisional baseline threshold |
| **`RAIN_MODERATE_CUMULATIVE_MM`** | `15.0` | mm / 14d | Heuristic boundary distinguishing light rain from moderate splash. | Provisional baseline | Provisional baseline threshold |
| **`RAIN_DRY_CUMULATIVE_MM`** | `5.0` | mm / 14d | Heuristic boundary for negligible antecedent rainfall. | Provisional baseline | Provisional baseline threshold |
| **`RAIN_PEST_WASHOFF_MM`** | `30.0` | mm / 14d | Engineering assumption for 14-day cumulative mechanical rain wash-off. | Provisional baseline | Provisional baseline threshold |
| **`RAIN_PEST_WASHOFF_DAYS`** | `4` | days / 14d | Engineering assumption for rain frequency suppressing insect colonies. | Provisional baseline | Provisional baseline threshold |
| **`APHID_DRY_MAX_RH_HOURS`** | `60` | hours / 14d | Heuristic boundary representing dry conditions favoring aphid growth. | Provisional baseline | Provisional baseline threshold |
| **`APHID_MODERATE_TEMP_C`** | `25.0` | °C | Heuristic lower thermal limit for moderate aphid population pressure. | Provisional baseline | Provisional baseline threshold |
| **`OVERCAST_SOLAR_RAD_MAX_CLOUD`**| `200.0` | W/m² | Heuristic threshold representing tropical overcast daylight diffuse flux. | Provisional baseline | Provisional baseline threshold |

---

### Tier 4: ENGINEERING LOGIC (Multi-Condition AND-Gating Decisions)
*The biological factors combined in each pathway are evidence-supported, but **their exact Boolean AND-combination and discrete step-functions are an ENGINEERING MODEL DESIGN**:*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 MULTI-CONDITION COMBINATION LOGIC AUDIT                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Leaf Spot Gating:   ENGINEERING MODEL DESIGN (Partially Supported)       │
│    • Logic: (Rain >= 40mm OR (RainDays >= 5 AND RH80 >= 140h)) AND          │
│             (TempOpt >= 180h)                                               │
│    • Assessment: Combines splash and moisture, but the Boolean step-function│
│      is an uncalibrated engineering design choice.                          │
│                                                                             │
│ 2. Leaf Blotch Gating: ENGINEERING MODEL DESIGN (Partially Supported)       │
│    • Logic: (RH80 >= 140h OR DewProxy >= 90h) AND (TempOpt >= 180h)         │
│    • Assessment: Reflects airborne/dew biology, but hard cutoff combinations│
│      are uncalibrated engineering design choices.                           │
│                                                                             │
│ 3. Aphids Gating:      ENGINEERING MODEL DESIGN (Partially Supported)       │
│    • Logic: (Rain < 5mm AND RH80 < 60h AND MeanTemp >= 27.5°C)              │
│    • Assessment: Captures dry-warm preference, but joint conjunction        │
│      thresholds are uncalibrated engineering design choices.                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Critical Clarifications for Academic Papers

### A. 14-Day Feature-Engineering Window vs. Incubation Period
* **Clarification:** The 14-day ($336\text{-hour}$) antecedent window is a **standardized research feature-engineering aggregation window**, NOT a single biologically validated incubation period. While *Colletotrichum* and *Taphrina* foliar lesions typically exhibit 7–14 day incubation latencies, the 14-day window was selected as a fixed computational window and requires empirical lag-window validation ($7\text{d}, 10\text{d}, 14\text{d}, 21\text{d}$).

### B. Dew Point Depression Proxy vs. Measured Leaf Wetness
* **Clarification:** $(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$ is a **derived atmospheric condensation proxy** computed from 2m atmospheric reanalysis, NOT direct measured leaf wetness. It has not been calibrated against physical canopy resistance grid sensors.

### C. Sample-Size Independence
* **Clarification:** The exploratory correlation ($r = +0.909, \rho = +0.800$ on $n = 4$) is **strictly descriptive context** and is not utilized anywhere in software as an empirical weight, score multiplier, or probability estimate.

---

## 3. Paper-Safe Vocabulary Standards

When drafting research papers, documentation, or publications for TurmeriCare AI:

| Prohibited Causal / Overstated Terminology | Mandatory Paper-Safe Replacement |
| :--- | :--- |
| *"Validated disease threshold"* | **"Evidence-supported candidate threshold"** / **"Provisional baseline threshold"** |
| *"Causal disease driver"* | **"Candidate environmental factor"** / **"Observed association"** |
| *"Validated 14-day incubation period"* | **"Standardized 14-day feature-engineering window"** |
| *"Measured leaf wetness"* | **"Derived atmospheric condensation proxy"** |
| *"Confirmed disease predictor"* | **"Exploratory association"** |
| *"Validated predictive model"* | **"Transparent rule-based baseline"** |

---

STAGE 5B-2 THRESHOLD PROVENANCE CORRECTION COMPLETE — DOCUMENTATION ONLY
