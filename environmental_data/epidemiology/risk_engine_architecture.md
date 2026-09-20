# Architectural Specification: Multimodal Integration & Hardware Abstraction

**Project:** TurmeriCare AI  
**Document Type:** System Architecture Design (Stage 5A)  
**Target Subsystems:** Environmental Risk Engine, Multimodal Fusion Layer, Telemetry Ingestion  
**Status:** **Architectural Design Only (Zero code modifications to application, frontend, or backend)**

---

## 1. End-to-End Multimodal Crop Intelligence Flow

The future TurmeriCare AI system operates on a **Three-Pillar Synergy Architecture**, fusing computer vision diagnostics with biophysical microclimate exposure and seasonal phenology to drive timely agronomic decision support.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 TURMERICARE MULTIMODAL INTELLIGENCE FLOW                    │
└─────────────────────────────────────────────────────────────────────────────┘

    [Pillar 1: Leaf Health]        [Pillar 2: Field Microclimate]      [Pillar 3: Phenology & Season]
    MobileNetV2 CNN Image          14-Day Antecedent Biophysical       Sowing Date / DAP /
    Inference (224x224x3)          Exposure Vector (X_env)             Tamil Nadu Seasonal Phase
             │                                   │                                 │
             ▼                                   ▼                                 ▼
   { Disease Class,                   { Disease-Specific Permissiveness, { Phenological Gating,
     Softmax Probabilities }            Fungal Incubation Exposure }       Management Context }
             │                                   │                                 │
             └───────────────────────────────────┼─────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │     Multimodal Fusion & Decision    │
                              │          Integration Layer          │
                              └─────────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │     Holistic Crop Risk Synthesis    │
                              │      (Overall Risk Level & Why)     │
                              └─────────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │    Agronomic Early Warning Engine   │
                              │    (Prophylactic / Curative Alert)  │
                              └─────────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │   Actionable Farmer Guidance        │
                              │   (TNAU / ICAR Extension Recs)      │
                              └─────────────────────────────────────┘
```

---

## 2. Standardized Environmental Risk Conceptual Interface

The environmental risk engine must expose its output to the multimodal fusion layer and UI via a **standardized, source-agnostic data object**.

### Conceptual TypeScript / JSON Schema: `environmentalRisk`

```typescript
interface EnvironmentalRiskOutput {
  // 1. Target Disease & Risk Categorization
  targetDisease: 'Leaf Spot' | 'Leaf Blotch' | 'Aphids' | 'General Foliar';
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  confidenceStatus: 'CALIBRATED_RESEARCH_BASELINE' | 'DEVELOPMENT_HEURISTIC';

  // 2. Extracted Biophysical Exposure Vector (14-Day Antecedent)
  exposureFeatures: {
    cumulativeRainfall14dMm: number;
    rainfallDaysCount: number;
    hoursRhGe80pct: number;
    hoursTempFavorable: number;
    hoursDewCondensationProxy: number;
    overcastDaylightHours: number;
    meanSoilMoistureM3m3: number;
  };

  // 3. Phenological Gating Status
  phenologyContext: {
    daysAfterPlantingDap: number;
    growthStage: 'Vegetative' | 'Rhizome Development' | 'Rhizome Maturation / Senescence';
    susceptibilityGated: boolean;
  };

  // 4. Traceable Evidence & Explanatory Reasoning
  evidenceTrail: {
    candidateEnvironmentalFactors: string[];
    literatureCitations: string[];
    biologicalRationale: string;
  };

  // 5. Telemetry Provenance & Hardware Agnosticism
  provenance: {
    dataSource: 'MANUAL_FIELD_INPUT' | 'HISTORICAL_REANALYSIS_ERA5' | 'LIVE_ESP32_SENSOR_GRID';
    stationOrDistrict: string;
    timestampIst: string;
    isRealTimeHardware: boolean;
  };
}
```

---

## 3. Universal Hardware Abstraction & Telemetry Ingestion

The environmental risk engine must remain **strictly decoupled from specific hardware devices or telemetry protocols**. It consumes a standardized biophysical input stream regardless of whether the source is manual user entry, weather APIs, or IoT hardware.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  UNIVERSAL HARDWARE ABSTRACTION PIPELINE                    │
└─────────────────────────────────────────────────────────────────────────────┘

   [Source 1: Manual Input]    [Source 2: ERA5 Reanalysis]    [Source 3: Future ESP32]
   Farmer UI Sliders           Open-Meteo REST API            In-Situ Field Sensor Grid
   (Web / Mobile Client)       (Historical / Forecast)        (MQTT / LoRaWAN Node)
             │                             │                              │
             └─────────────────────────────┼──────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │     Hardware Ingestion Normalizer     │
                       │   (Converts inputs into standard      │
                       │    hourly time-series schema)         │
                       └───────────────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │   Biophysical Feature Transformer     │
                       │   (Computes 14-day antecedent         │
                       │    integrals: RH80, TempOpt, Dew)     │
                       └───────────────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │    Disease-Specific Risk Engine       │
                       │   (Evaluates pathogen-specific        │
                       │    biological permissiveness)         │
                       └───────────────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │       Multimodal Fusion Layer         │
                       └───────────────────────────────────────┘
```

### Architectural Guarantees:
1. **Zero Hardware Coupling:** The risk logic contains no hard-coded references to ESP32 registers, pinouts, or communication baud rates.
2. **Standardized Parameter Schema:** All sources map into standard SI physical units ($^\circ\text{C}$, $\%$, $\text{mm}$, $\text{km/h}$, $\text{W/m}^2$, $\text{m}^3/\text{m}^3$).
3. **Graceful Degradation:** When optional channels (e.g. physical leaf wetness) are absent, the engine falls back to validated biophysical proxies (`hours_dew_condensation_proxy`) while flagging the provenance transparently.
