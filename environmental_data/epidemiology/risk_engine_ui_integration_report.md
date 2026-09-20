# Stage 5D UI Integration Report: Research Risk Engine

**Project:** TurmeriCare AI  
**Document Type:** UI Integration Architecture & Verification Report (Stage 5D)  
**Target Subsystems:** Environmental Risk Page, App Context, Multimodal Analysis Page, Decision Support  
**Integration Date:** September 2026  
**Scientific Status:** **RETROSPECTIVE CONSISTENCY ONLY (Not Independently Field Validated)**  

---

> [!IMPORTANT]
> **MANDATORY SCIENTIFIC DISCLOSURE:**  
> "The integrated research environmental risk engine operates as a transparent research-baseline decision-support tool. It has been evaluated for retrospective consistency against historical trial records, but has not been prospectively validated against independent commercial farm outbreaks."

---

## 1. Integration Architecture & Decoupled Data Flow

The Stage 5D integration establishes a primary pathway connecting the research environmental engine ([`researchRiskEngine.ts`](file:///d:/curuma/src/utils/researchRiskEngine.ts)) to the farmer-facing UI ([`EnvironmentalRiskPage.tsx`](file:///d:/curuma/src/pages/EnvironmentalRiskPage.tsx)), while maintaining the legacy heuristic calculator ([`riskCalculator.ts`](file:///d:/curuma/src/utils/riskCalculator.ts)) as a fallback:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 STAGE 5D USER INTERFACE INTEGRATION FLOW                    │
└─────────────────────────────────────────────────────────────────────────────┘

    [User Action: Disease Selection]      [User Action: Parameter / Preset]
    • Leaf Spot (Colletotrichum)          • Manual Sliders (336h Buffer)
    • Leaf Blotch (Taphrina)              • Historical Reanalysis Presets (ERA5)
    • Aphids / Thrips (Aphis gossypii)    • Crop Stage (DAP Context)
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      │
                                      ▼
                  ┌───────────────────────────────────────┐
                  │          AppContext State Hook        │
                  │ (selectedResearchDisease, cropDap,    │
                  │  envParameters, activePresetMode)     │
                  └───────────────────────────────────────┘
                                      │
                                      ▼
                  ┌───────────────────────────────────────┐
                  │    researchRiskEngine Dispatcher      │
                  │   (evaluateResearchEnvironmentalRisk) │
                  └───────────────────────────────────────┘
                                      │
                                      ▼
                  ┌───────────────────────────────────────┐
                  │       ResearchRiskOutput Schema       │
                  │   { disease, riskLevel, features,     │
                  │     explanation, phenology, limits }  │
                  └───────────────────────────────────────┘
                                      │
                                      ▼
       ┌──────────────────────────────┴──────────────────────────────┐
       │                                                             │
       ▼                                                             ▼
 ┌───────────────────────────┐                         ┌───────────────────────────┐
 │   Farmer-Facing View      │                         │  Advanced Technical View  │
 │ • Current Crop Risk Badge │                         │ • 14d Exposure Integrals  │
 │ • Why this risk? Reasons  │                         │ • Atmospheric Dew Proxy   │
 │ • What should I watch for?│                         │ • Provisional Thresholds  │
 │ • What should I do? (TNAU)│                         │ • Non-Causality Limits    │
 └───────────────────────────┘                         └───────────────────────────┘
```

---

## 2. Files Modified & Inventory

| File Path | Modification Summary | Safety & Fallback Role |
| :--- | :--- | :--- |
| [`src/utils/researchRiskEngine.ts`](file:///d:/curuma/src/utils/researchRiskEngine.ts) | Added helper utilities `createHourlySeriesFromManualParams` and `HISTORICAL_REANALYSIS_PRESETS` for UI interactive state management. | **Primary Engine:** Preserves all core logic, non-causal constraints, and provisional thresholds untouched. |
| [`src/context/AppContext.tsx`](file:///d:/curuma/src/context/AppContext.tsx) | Added reactive state hooks for `selectedResearchDisease`, `cropDap`, `researchRiskResult`, and `applyHistoricalPreset`. | **Seamless Decoupling:** Fallback `envRiskResult` remains available for legacy consumers. |
| [`src/pages/EnvironmentalRiskPage.tsx`](file:///d:/curuma/src/pages/EnvironmentalRiskPage.tsx) | Redesigned with disease selector tabs (Spot, Blotch, Aphids), large risk badge, "Why this risk?", "What to watch for?", "What to do?", and collapsible advanced telemetry. | **Farmer-First Presentation:** Removes dense technical formulas from primary view. |
| [`src/pages/MultimodalAnalysisPage.tsx`](file:///d:/curuma/src/pages/MultimodalAnalysisPage.tsx) | Updated to display `researchRiskResult` in Pillar 2 and added an explicit "Development Prototype Preview" banner. | **Safety Disclosure:** Prevents presenting combined scores as validated predictions. |
| [`src/utils/uiIntegration.test.ts`](file:///d:/curuma/src/utils/uiIntegration.test.ts) | Created comprehensive 11-scenario integration test suite verifying requirements A through O. | **Continuous Validation:** Automated test suite. |

---

## 3. Fallback Behavior & Legacy Calculator Preservation

* **Fallback Retention:** [`src/utils/riskCalculator.ts`](file:///d:/curuma/src/utils/riskCalculator.ts) is **100% preserved** in the codebase.
* **Non-Interference:** The legacy calculator operates in parallel for components requiring standard 0–100 integer scores, while the research risk engine outputs clean categorical evaluations (`LOW`, `MODERATE`, `HIGH`) with structured evidence trails.

---

## 4. Farmer-Facing Presentation vs. Advanced Technical Details

The user interface strictly implements a **two-tier information hierarchy**:

### Tier 1: Farmer-First View (Default)
* **Current Crop Risk:** Large, intuitive risk level indicator (`LOW`, `MODERATE`, `HIGH`) styled with clear color coding (Emerald, Amber, Rose).
* **Why this risk?:** Clear, non-technical explanations (e.g. *"Substantial rainfall over 12 days providing splash dispersal"*).
* **What should I watch for?:** Specific visual symptoms for the selected disease (e.g. *"Circular brown spots with yellow halos"*).
* **What should I do?:** Actionable, non-prescriptive extension advice (e.g. *"Ensure field drainage. Follow TNAU / ICAR-KVK guidance"*).

### Tier 2: Advanced Details (Collapsible Drawer)
* **14-Day Cumulative Hours:** Exact hours with $\text{RH} \ge 80\%$, temperature within $22\text{–}32^\circ\text{C}$, and dew proxy hours.
* **Precipitation Metrics:** 14-day cumulative rainfall in $\text{mm}$ and count of rain days.
* **Atmospheric Proxy Explanation:** Clear notice that condensation hours represent an atmospheric proxy derived from $(T - T_{\text{dew}}) \le 1.5^\circ\text{C}$, not direct leaf wetness.
* **Full Scientific Limitations:** Explicit statements regarding non-causality, 9km reanalysis grid resolution, and provisional baseline status.

---

## 5. Strict Scientific Language Compliance

All UI text strictly adheres to the approved Stage 5 terminology standards:
* **Approved Terms Used:** *"Environmental Risk Assessment"*, *"Research Baseline"*, *"Historical Weather-Based Assessment"*, *"Evidence-Supported Candidate Features"*, *"Provisional Baseline"*, *"Not independently field validated"*.
* **Prohibited Terms Excluded:** Zero occurrences of *"accuracy"*, *"validated prediction"*, *"confirmed disease"*, *"guaranteed"*, or *"posterior probability"*.
* **Dew Proxy:** Exclusively labeled as *"dew/condensation proxy"*, never *"leaf wetness"*.
* **Crop Stage Context:** Displays DAP with explicit label: *"Crop stage is used as contextual information in the current research baseline."*

---

## 6. Automated Integration Test Results

Execution of [`src/utils/uiIntegration.test.ts`](file:///d:/curuma/src/utils/uiIntegration.test.ts) and [`src/utils/researchRiskEngine.test.ts`](file:///d:/curuma/src/utils/researchRiskEngine.test.ts) verified 100% compliance:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AUTOMATED TEST SUITE SUMMARY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. UI Integration Tests (uiIntegration.test.ts):         11 / 11 PASSED     │
│ 2. Research Engine Core Tests (researchRiskEngine.test): 20 / 20 PASSED     │
│ 3. Production Build Compilation (npm run build):         PASSED (11.68s)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Known Limitations & Research Boundaries

1. **Retrospective Consistency Only:** The engine output reflects consistency with historical trial records, not prospective field accuracy.
2. **Simulation Buffer for Sliders:** Interactive slider adjustments represent a steady-state 336-hour simulation buffer for farmer exploration.
3. **No Hardware Claimed:** Sensor grid interface is structurally scaffolded for future IoT node integration without any simulated live telemetry.

---

STAGE 5D UI INTEGRATION COMPLETE — APPLICATION FULLY FUNCTIONAL
