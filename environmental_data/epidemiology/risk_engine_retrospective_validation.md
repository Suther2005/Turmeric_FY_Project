# Retrospective Risk-Engine Consistency Analysis Report

**Project:** TurmeriCare AI  
**Document Type:** Retrospective Consistency Analysis (Stage 5C)  
**Target Module:** [`src/utils/researchRiskEngine.ts`](file:///d:/curuma/src/utils/researchRiskEngine.ts)  
**Deliverable Matrix:** [`risk_engine_retrospective_results.csv`](file:///d:/curuma/environmental_data/epidemiology/risk_engine_retrospective_results.csv)  
**Evaluation Date:** September 2026  
**Auditor:** Scientific Integrity & Agrometeorology Review Engine  

---

> [!IMPORTANT]
> **MANDATORY SCIENTIFIC DECLARATION:**  
> **"The present evaluation is not an independent prospective field validation of the risk engine."**  
> **Scientific Status:** **RETROSPECTIVE CONSISTENCY ONLY**

---

## 1. Objective

The objective of Stage 5C is to conduct an offline, non-optimizing **retrospective consistency check** of the newly implemented [`researchRiskEngine.ts`](file:///d:/curuma/src/utils/researchRiskEngine.ts) against the 12 source-verified historical disease observation records in Tamil Nadu (2021–2023).

* **Strict Constraints Maintained:**
  * No model parameters or thresholds were modified, fitted, or tuned to maximize retrospective match.
  * No ML algorithms were trained.
  * No standard predictive performance metrics (Accuracy, Precision, Recall, F1, AUC, Sensitivity, Specificity) are calculated, as the dataset does not constitute an independent prospective test cohort.

---

## 2. Dataset & Stratification

The historical evaluation cohort consists of 12 source-verified records stratified into three distinct observational modalities:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       OBSERVATION COHORT STRATIFICATION                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Quantitative Percent Disease Index (PDI) Trials:       8 Records (66.7%) │
│    • Leaf Spot (Colletotrichum capsici):                  4 Records         │
│    • Leaf Blotch (Taphrina maculans):                     4 Records         │
│                                                                             │
│ 2. Qualitative Agricultural Advisory Alerts:              3 Records (25.0%) │
│    • Leaf Spot (High Incidence Alert):                    1 Record          │
│    • Leaf Blotch (Forewarning Alert):                     1 Record          │
│    • Sucking Pests / Aphids (Pest Warning):               1 Record          │
│                                                                             │
│ 3. Image-Ground-Truth Label Dataset:                      1 Record (8.3%)   │
│    • 865 Categorized Field Photos (CV ground truth only): 1 Record          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Evaluation Protocol & Consistency Criteria

Before executing the evaluation, four objective consistency labels were formally established:

* **`CONSISTENT`:** The engine's categorical risk output (`LOW`, `MODERATE`, `HIGH`) matches the documented biological severity tier:
  * High PDI ($>38\%$) or High Advisory Alert $\longrightarrow$ `HIGH` Risk.
  * Moderate PDI ($25\text{–}38\%$) or Moderate Advisory Alert $\longrightarrow$ `MODERATE` Risk.
  * Zero / Negligible Symptoms $\longrightarrow$ `LOW` Risk.
* **`PARTIALLY_CONSISTENT`:** The engine's risk output is directionally aligned but differs by one boundary tier (e.g. outputting `HIGH` for a borderline moderate $35.8\%$ PDI).
* **`INCONSISTENT`:** The engine's output inverts the observed biological status (e.g. outputting `LOW` when a pest alert was active, or `HIGH` when disease remained suppressed).
* **`NOT_EVALUABLE`:** The observation type does not represent a single-date synchronized epidemiological field plot (e.g. multi-field image corpus).

---

## 4. Retrospective Consistency Results

Detailed observation-by-observation results are cataloged in [`risk_engine_retrospective_results.csv`](file:///d:/curuma/environmental_data/epidemiology/risk_engine_retrospective_results.csv):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RETROSPECTIVE CONSISTENCY SUMMARY                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Total Records Evaluated: 12                                                 │
│ • CONSISTENT:                                                      8 (66.7%)│
│ • PARTIALLY_CONSISTENT:                                            1 (8.3%) │
│ • INCONSISTENT:                                                    2 (16.7%)│
│ • NOT_EVALUABLE:                                                   1 (8.3%) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Quantitative PDI Analysis (8 Foliar Fungal Observations)

For the 8 source-verified field trial records with numerical Percent Disease Index (PDI) measurements:

| Record ID | District | Target Disease | Observed Severity | 14-Day Antecedent Exposure Summary | Engine Output | Consistency Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **`V-DIS-01`** | Erode | Leaf Spot | **38.5% PDI** (Moderate-High) | Rain: 142.4mm (14d), RH80: 190h, Dew: 108h, TempOpt: 326h | `HIGH` | **CONSISTENT** |
| **`V-DIS-02`** | Erode | Leaf Blotch | **44.2% PDI** (High) | Rain: 163.6mm (14d), RH80: 201h, Dew: 116h, TempOpt: 333h | `HIGH` | **CONSISTENT** |
| **`V-DIS-03`** | Erode | Leaf Spot | **32.4% PDI** (Moderate) | Rain: 12.2mm (7d), RH80: 91h, Dew: 3h, TempOpt: 240h | `MODERATE`| **CONSISTENT** |
| **`V-DIS-04`** | Erode | Leaf Blotch | **48.7% PDI** (High) | Rain: 105.8mm (8d), RH80: 166h, Dew: 95h, TempOpt: 310h | `HIGH` | **CONSISTENT** |
| **`V-DIS-06`** | Erode | Leaf Spot | **41.0% PDI** (High) | Rain: 121.7mm (12d), RH80: 163h, Dew: 71h, TempOpt: 297h | `HIGH` | **CONSISTENT** |
| **`V-DIS-07`** | Erode | Leaf Blotch | **52.6% PDI** (Severe) | Rain: 98.8mm (13d), RH80: 208h, Dew: 119h, TempOpt: 315h | `HIGH` | **CONSISTENT** |
| **`V-DIS-08`** | Salem | Leaf Spot | **35.8% PDI** (Moderate) | Rain: 73.1mm (14d), RH80: 198h, Dew: 100h, TempOpt: 331h | `HIGH` | **PARTIALLY_CONSISTENT** |
| **`V-DIS-09`** | Salem | Leaf Blotch | **29.4% PDI** (Moderate) | Rain: 139.6mm (12d), RH80: 256h, Dew: 164h, DAP: 180 | `HIGH`* | **INCONSISTENT** |

*\*`V-DIS-09` triggered the phenological contextual advisory note for late crop maturity ($>180\text{ DAP}$).*

### Key Findings from Quantitative Analysis:
1. **Divergent Exposure Alignment:**
   * High Leaf Spot PDI cases ($>38\%$) were accompanied by high antecedent rainfall ($>120\text{ mm}$) and rain frequency ($>12\text{ rain days}$), whereas moderate Leaf Spot ($32.4\%$) occurred under low rainfall ($12.2\text{ mm}$).
   * High Leaf Blotch PDI cases ($>44\%$) aligned consistently with extended atmospheric humidity ($\text{RH}_{80} > 166\text{h}$) and prolonged canopy dew condensation proxy ($\text{Dew} > 95\text{h}$).

---

## 6. Qualitative Alert Analysis (3 Advisory Records)

For qualitative district agricultural extension advisories issued by TNAU CPPS:

| Record ID | District | Target Pathology | Documented Alert Level | Key Antecedent Features | Engine Output | Compatibility Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`V-DIS-05`** | Coimbatore | Leaf Spot | High Incidence Alert | Rain: 83.7mm, RH80: 162h, TempOpt: 272h | `HIGH` | **Compatible** (High rainfall and humidity align with district forewarning). |
| **`V-DIS-11`** | Dharmapuri | Leaf Blotch | Moderate-High Forewarning | Rain: 82.9mm, RH80: 199h, Dew: 129h | `HIGH` | **Compatible** (High condensation proxy and humidity align with forewarning). |
| **`V-DIS-10`** | Dharmapuri | Aphids & Thrips | Moderate Pest Warning | Rain: 62.5mm (13d rain), RH80: 145h, MeanTemp: 26.4°C | `LOW` | **Not Clearly Compatible** (Engine suppressed risk due to frequent rainfall wash-off). |

---

## 7. Detailed Failure Analysis (Inconsistent Cases)

Two specific cases exhibited inconsistent behavior. To maintain scientific integrity, potential causes are analyzed without asserting unverified facts:

### Case 1: `V-DIS-09` — Late-Season Leaf Blotch in Salem (November 2021)
* **Observed Data:** PDI was $29.4\%$ (Moderate severity).
* **Antecedent Weather:** Extreme biophysical permissiveness ($\text{RH}_{80} = 256\text{ h}$ out of $336\text{ h}$, Dew Proxy $= 164\text{ h}$, Rain $= 139.6\text{ mm}$).
* **Engine Behavior:** Output `HIGH` biophysical risk, but attached a phenological advisory note regarding $\text{DAP} = 180$.
* **Evidence-Based Explanations:**
  1. *Agronomic Phenology Hypothesis:* At $180\text{ DAP}$, the turmeric canopy undergoes natural senescence and leaf drying; farmers withdraw furrow irrigation prior to harvest, physiologically limiting active foliar lesion expansion despite high atmospheric humidity.
  2. *Unmodeled Chemical Interventions:* Trial records do not specify whether protective copper/triazole sprays were applied during late maturity.

### Case 2: `V-DIS-10` — Aphid & Thrips Advisory in Dharmapuri (October 2023)
* **Observed Data:** Extension alert issued a Moderate Pest Warning.
* **Antecedent Weather:** Reanalysis recorded $62.5\text{ mm}$ of rain distributed across $13\text{ rain days}$.
* **Engine Behavior:** Output `LOW` pest risk via the rain wash-off rule ($\text{Rain} \ge 30\text{ mm}$ or $\text{RainDays} \ge 4$).
* **Evidence-Based Explanations:**
  1. *Spatial Inaccuracy of Reanalysis:* The 9km ERA5-Land grid aggregated regional monsoon showers, while the surveyed farm plots may have experienced localized dry rain-shadow pockets.
  2. *Canopy Underside Micro-Shelter:* Heavy rainfall may not dislodge colonies sheltered beneath dense broadleaf lower canopies.
  3. *Prophylactic Advisory Issuance:* Agricultural advisories are frequently issued on a calendar/seasonal basis rather than in response to verified real-time field trapping.

---

## 8. Independence Limitations & Circularity Assessment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CIRCULARITY ASSESSMENT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Status: NON-INDEPENDENT RETROSPECTIVE CONSISTENCY CHECK                   │
│ • Rationale: The exploratory baseline thresholds (e.g. 140h RH, 90h Dew)   │
│   in researchRiskEngine.ts were partially informed by observing these same   │
│   historical trial records during Stage 5A/5B research.                     │
│ • Scientific Constraint: Achieving high consistency on this dataset is      │
│   EXPECTED and CANNOT be cited as proof of general predictive accuracy.     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. What This Evaluation DOES and DOES NOT Establish

### What This DOES Establish:
1. **Algorithmic Determinism:** The engine executes stably without runtime errors across all historical meteorological streams.
2. **Biophysical Sanity:** The engine correctly differentiates wet/splash fungal conditions from dry-spell pest dynamics.
3. **Exploratory Coherence:** The rules produce risk levels that are broadly compatible with documented historical trial extremes.

### What This DOES NOT Establish:
1. **Does NOT Establish Predictive Accuracy:** Cannot forecast future outbreaks on commercial farm plots.
2. **Does NOT Establish Validated Thresholds:** Cumulative cutoffs remain provisional.
3. **Does NOT Establish Causality:** Environmental permissiveness does not prove infection in the absence of viable fungal inoculum.

---

## 10. Verification of Code Integrity

Following this retrospective analysis, the system test suite and production build were re-verified:
* `src/utils/researchRiskEngine.test.ts`: **20 / 20 Tests Passed (100%)**
* Production Build (`npm run build`): **Compiled successfully with zero errors**
* Fallback calculator (`riskCalculator.ts`) and all UI components: **100% untouched and functional**

---

STAGE 5C RETROSPECTIVE CONSISTENCY ANALYSIS COMPLETE — ENGINE UNMODIFIED
