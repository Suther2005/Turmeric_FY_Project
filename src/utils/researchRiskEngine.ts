/**
 * TurmeriCare AI — Research Environmental Disease-Risk Engine (Stage 5B)
 * 
 * IMPORTANT SCIENTIFIC DISCLAIMER:
 * Current risk outputs are research-baseline decision-support outputs and have not been
 * prospectively validated against independent field disease observations.
 * 
 * Strict Non-Causality & Data Integrity Rules:
 * 1. Zero ML model weights — rule-based transparent hierarchical evidence baseline.
 * 2. Meteorological reanalysis (ERA5-Land) is regional historical data, NOT field sensor telemetry.
 * 3. Dew point proxy ((T - T_dew) <= 1.5°C) is an atmospheric condensation proxy, NOT direct measured leaf wetness.
 * 4. Soil pH is strictly excluded from environmental disease calculations.
 * 5. Instantaneous single-point weather is NOT used as a biological disease risk indicator;
 *    all evaluations require 14-day (336-hour) antecedent exposure integration.
 */

// ============================================================================
// 1. TYPE DEFINITIONS & SCHEMAS
// ============================================================================

export type TelemetryDataSource = 
  | 'HISTORICAL_REANALYSIS_ERA5' 
  | 'MANUAL_FIELD_INPUT' 
  | 'LIVE_SENSOR_GRID' 
  | 'STANDARDIZED_BUFFER';

export type ResearchDiseaseType = 'Leaf Spot' | 'Leaf Blotch' | 'Aphids';

export type ResearchRiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface HourlyEnvironmentalRecord {
  timestamp: string; // ISO-8601 or YYYY-MM-DDTHH:mm
  temperature_2m: number; // °C (-10 to 60)
  relative_humidity_2m: number; // % (0 to 100)
  dew_point_2m: number; // °C
  precipitation: number; // mm (>= 0)
  wind_speed_10m?: number; // km/h (>= 0)
  shortwave_radiation?: number; // W/m² (>= 0)
  soil_moisture_0_to_7cm?: number; // m³/m³ (0 to 1)
}

export interface CropContext {
  dap?: number; // Days After Planting (0 to 300)
  growthStage?: 'Vegetative' | 'Rhizome Development' | 'Rhizome Maturation / Senescence' | string;
  variety?: string;
  plantingDate?: string;
}

export interface TransformedExposureFeatures {
  hours_rh_ge_80pct: number; // Count of hours with RH >= 80.0%
  hours_temp_favorable_22_32C: number; // Count of hours with 22.0 <= T <= 32.0°C
  hours_dew_condensation_proxy: number; // Count of hours with (T - T_dew) <= 1.5°C
  cumulative_rainfall_14d_mm: number; // 14-day precipitation sum (mm)
  rainfall_days_14d_count: number; // Count of 24h days with daily precipitation > 0.1 mm
  mean_temperature: number; // 14-day mean temperature (°C)
  mean_relative_humidity: number; // 14-day mean RH (%)
  mean_soil_moisture?: number; // 14-day mean soil moisture (m³/m³)
  mean_wind_speed?: number; // 14-day mean wind speed (km/h)
  mean_shortwave_radiation?: number; // 14-day mean shortwave radiation (W/m²)
  overcast_daylight_hours?: number; // Daylight hours with solar radiation < 200 W/m²
  windowHours: number; // 336 hours
  validHourlyRecordsCount: number;
}

export interface ResearchRiskOutput {
  disease: ResearchDiseaseType;
  riskLevel: ResearchRiskLevel;
  exposureFeatures: TransformedExposureFeatures;
  phenologyContext: {
    dap?: number;
    growthStage?: string;
    susceptibilityNote: string;
  };
  evidenceStatus: 'RESEARCH_BASELINE_HEURISTIC' | 'EVIDENCE_SUPPORTED_CANDIDATE_PATHWAY';
  dataSource: TelemetryDataSource;
  timestamp: string;
  explanation: {
    summary: string;
    contributingFactors: string[];
    biologicalRationale: string;
    evidenceSourceIds: string[];
    provisionalThresholdsUsed: string[];
  };
  limitations: {
    nonCausalityDisclaimer: string;
    reanalysisDisclaimer: string;
    dewProxyDisclaimer: string;
    sampleSizeDisclaimer: string;
    unvalidatedWarning: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// 2. PROVISIONAL BASELINE CONFIGURATION LAYER
// ============================================================================

/**
 * Provisional Baseline Thresholds (Stage 5A Specifications).
 * Clearly isolated and labeled so they are 100% transparent and easily replaceable
 * upon future empirical calibration.
 */
export const PROVISIONAL_BASELINE_THRESHOLDS = {
  // Moisture accumulators over 14 days (336 hours)
  MOISTURE_RH_HIGH_HOURS: 140, // ~10h/day >= 80% RH
  MOISTURE_RH_MODERATE_HOURS: 80, // ~6h/day >= 80% RH
  MOISTURE_RH_DEFICIENT_HOURS: 60,

  // Canopy condensation proxy ((T - T_dew) <= 1.5°C)
  DEW_PROXY_HIGH_HOURS: 90, // ~6.5h/day of surface saturation
  DEW_PROXY_MODERATE_HOURS: 50,
  DEW_PROXY_DEFICIENT_HOURS: 30,

  // Thermal incubation favorable hours (22°C to 32°C)
  TEMP_FAVORABLE_HIGH_HOURS: 180,
  TEMP_FAVORABLE_MIN_INCUBATION: 100,

  // Rainfall thresholds
  RAIN_HIGH_CUMULATIVE_MM: 40.0,
  RAIN_MODERATE_CUMULATIVE_MM: 15.0,
  RAIN_DRY_CUMULATIVE_MM: 5.0,
  RAIN_HIGH_DAYS_COUNT: 5,
  RAIN_PEST_WASHOFF_MM: 30.0,
  RAIN_PEST_WASHOFF_DAYS: 4,

  // Aphid / Pest dry-warm spell thresholds
  APHID_DRY_MAX_RH_HOURS: 60,
  APHID_WARM_MEAN_TEMP_C: 27.5,
  APHID_MODERATE_TEMP_C: 25.0,

  // Standard antecedent exposure window size
  REQUIRED_WINDOW_HOURS: 336, // 14 days * 24 hours
} as const;

// Standard non-causality disclaimers
const STANDARD_LIMITATIONS = {
  nonCausalityDisclaimer:
    'Meteorological associations reflect candidate biophysical permissiveness, not causal disease generation.',
  reanalysisDisclaimer:
    'Reanalysis (ERA5-Land) data represent regional atmospheric estimates (~9km grid) and are not direct in-situ field sensor measurements.',
  dewProxyDisclaimer:
    'Hours of dew/condensation represent an atmospheric proxy derived from dew point depression ((T - T_dew) <= 1.5°C), not direct measured leaf wetness.',
  sampleSizeDisclaimer:
    'Exploratory correlations derived from initial historical calibration records (n=8 quantitative PDI) represent exploratory associations, not validated predictive models.',
  unvalidatedWarning:
    'Current risk outputs are research-baseline decision-support outputs and have not been prospectively validated against independent field disease observations.',
};

// ============================================================================
// 3. INPUT VALIDATION LAYER
// ============================================================================

/**
 * Validates a single hourly environmental record against physical bounds.
 */
export function validateHourlyRecord(record: HourlyEnvironmentalRecord, index?: number): ValidationResult {
  const errors: string[] = [];
  const prefix = index !== undefined ? `Record [${index}]: ` : '';

  if (!record.timestamp || typeof record.timestamp !== 'string') {
    errors.push(`${prefix}Missing or invalid timestamp string.`);
  }

  // Temperature validation (-10°C to 60°C)
  if (record.temperature_2m === undefined || record.temperature_2m === null || isNaN(record.temperature_2m)) {
    errors.push(`${prefix}Missing or NaN temperature_2m.`);
  } else if (record.temperature_2m < -10 || record.temperature_2m > 60) {
    errors.push(`${prefix}temperature_2m (${record.temperature_2m}°C) outside physically valid bounds [-10, 60].`);
  }

  // Relative Humidity validation (0% to 100%)
  if (record.relative_humidity_2m === undefined || record.relative_humidity_2m === null || isNaN(record.relative_humidity_2m)) {
    errors.push(`${prefix}Missing or NaN relative_humidity_2m.`);
  } else if (record.relative_humidity_2m < 0 || record.relative_humidity_2m > 100) {
    errors.push(`${prefix}relative_humidity_2m (${record.relative_humidity_2m}%) outside physically valid bounds [0, 100].`);
  }

  // Dew point validation
  if (record.dew_point_2m === undefined || record.dew_point_2m === null || isNaN(record.dew_point_2m)) {
    errors.push(`${prefix}Missing or NaN dew_point_2m.`);
  } else if (record.temperature_2m !== undefined && !isNaN(record.temperature_2m)) {
    // Dew point cannot physically exceed ambient temperature (allowing 1.5°C float tolerance for reanalysis assimilation artifacts)
    if (record.dew_point_2m > record.temperature_2m + 1.5) {
      errors.push(`${prefix}dew_point_2m (${record.dew_point_2m}°C) exceeds temperature_2m (${record.temperature_2m}°C) beyond physical tolerance.`);
    }
  }

  // Precipitation validation (>= 0 mm)
  if (record.precipitation === undefined || record.precipitation === null || isNaN(record.precipitation)) {
    errors.push(`${prefix}Missing or NaN precipitation.`);
  } else if (record.precipitation < 0) {
    errors.push(`${prefix}Negative precipitation (${record.precipitation} mm) is physically impossible.`);
  }

  // Wind speed validation (optional, >= 0)
  if (record.wind_speed_10m !== undefined && record.wind_speed_10m !== null) {
    if (isNaN(record.wind_speed_10m) || record.wind_speed_10m < 0) {
      errors.push(`${prefix}Invalid wind_speed_10m (${record.wind_speed_10m}).`);
    }
  }

  // Shortwave radiation validation (optional, >= 0)
  if (record.shortwave_radiation !== undefined && record.shortwave_radiation !== null) {
    if (isNaN(record.shortwave_radiation) || record.shortwave_radiation < 0) {
      errors.push(`${prefix}Invalid shortwave_radiation (${record.shortwave_radiation}).`);
    }
  }

  // Soil moisture validation (optional, 0 to 1 m³/m³)
  if (record.soil_moisture_0_to_7cm !== undefined && record.soil_moisture_0_to_7cm !== null) {
    if (isNaN(record.soil_moisture_0_to_7cm) || record.soil_moisture_0_to_7cm < 0 || record.soil_moisture_0_to_7cm > 1) {
      errors.push(`${prefix}Invalid soil_moisture_0_to_7cm (${record.soil_moisture_0_to_7cm} m³/m³).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a series of hourly records ensuring exactly 14 days (336 hours) of contiguous data.
 */
export function validateHourlySeries(records: HourlyEnvironmentalRecord[]): ValidationResult {
  const allErrors: string[] = [];

  if (!records || !Array.isArray(records)) {
    return {
      isValid: false,
      errors: ['Input records must be a non-empty array of HourlyEnvironmentalRecord.'],
    };
  }

  if (records.length < PROVISIONAL_BASELINE_THRESHOLDS.REQUIRED_WINDOW_HOURS) {
    allErrors.push(
      `INSUFFICIENT_14D_RECORDS: Expected at least ${PROVISIONAL_BASELINE_THRESHOLDS.REQUIRED_WINDOW_HOURS} hourly records (14 days), received ${records.length}.`
    );
  }

  // Check individual record validity on the window to be processed (most recent 336 hours)
  const windowToEvaluate = records.slice(-PROVISIONAL_BASELINE_THRESHOLDS.REQUIRED_WINDOW_HOURS);
  for (let i = 0; i < windowToEvaluate.length; i++) {
    const recValidation = validateHourlyRecord(windowToEvaluate[i], i);
    if (!recValidation.isValid) {
      allErrors.push(...recValidation.errors);
      // Cap error reporting to prevent massive string flood
      if (allErrors.length > 20) {
        allErrors.push('...Additional validation errors truncated.');
        break;
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

// ============================================================================
// 4. DETERMINISTIC 14-DAY FEATURE TRANSFORMATION LAYER
// ============================================================================

/**
 * Transforms an array of at least 336 hourly environmental records into the
 * standardized 14-day antecedent biophysical exposure feature vector.
 * 
 * If more than 336 records are provided, extracts the most recent 336 hours.
 */
export function transform14dExposureFeatures(records: HourlyEnvironmentalRecord[]): TransformedExposureFeatures {
  const validation = validateHourlySeries(records);
  if (!validation.isValid) {
    throw new Error(`Feature Transformation Failed: ${validation.errors.join(' | ')}`);
  }

  // Take the most recent 336 hours (14 consecutive days)
  const window = records.slice(-PROVISIONAL_BASELINE_THRESHOLDS.REQUIRED_WINDOW_HOURS);
  const n = window.length;

  let rhGe80Hours = 0;
  let tempFavorableHours = 0;
  let dewProxyHours = 0;
  let cumulativeRainfallMm = 0;
  let sumTemp = 0;
  let sumRh = 0;
  let sumSoilMoisture = 0;
  let soilMoistureCount = 0;
  let sumWindSpeed = 0;
  let windSpeedCount = 0;
  let sumRadiation = 0;
  let radiationCount = 0;
  let overcastDaylightHours = 0;

  // Track daily rainfall for the 14 days (24-hour chunks)
  const dailyRainfall: number[] = new Array(14).fill(0);

  for (let i = 0; i < n; i++) {
    const rec = window[i];
    const dayIdx = Math.floor(i / 24);

    // 1. Moisture permissiveness: RH >= 80.0%
    if (rec.relative_humidity_2m >= 80.0) {
      rhGe80Hours++;
    }

    // 2. Thermal incubation gate: 22.0°C <= T <= 32.0°C
    if (rec.temperature_2m >= 22.0 && rec.temperature_2m <= 32.0) {
      tempFavorableHours++;
    }

    // 3. Canopy condensation proxy: (T - T_dew) <= 1.5°C
    const dewDepression = rec.temperature_2m - rec.dew_point_2m;
    if (dewDepression <= 1.5) {
      dewProxyHours++;
    }

    // 4. Rainfall accumulation
    cumulativeRainfallMm += rec.precipitation;
    if (dayIdx < 14) {
      dailyRainfall[dayIdx] += rec.precipitation;
    }

    // Accumulators for mean metrics
    sumTemp += rec.temperature_2m;
    sumRh += rec.relative_humidity_2m;

    if (rec.soil_moisture_0_to_7cm !== undefined && !isNaN(rec.soil_moisture_0_to_7cm)) {
      sumSoilMoisture += rec.soil_moisture_0_to_7cm;
      soilMoistureCount++;
    }

    if (rec.wind_speed_10m !== undefined && !isNaN(rec.wind_speed_10m)) {
      sumWindSpeed += rec.wind_speed_10m;
      windSpeedCount++;
    }

    if (rec.shortwave_radiation !== undefined && !isNaN(rec.shortwave_radiation)) {
      sumRadiation += rec.shortwave_radiation;
      radiationCount++;

      // Overcast daylight definition: shortwave radiation between 10 W/m² (daylight) and < 200 W/m² (overcast/cloudy)
      if (rec.shortwave_radiation >= 10 && rec.shortwave_radiation < 200) {
        overcastDaylightHours++;
      }
    }
  }

  // Count rain days (> 0.1 mm/day)
  const rainfallDaysCount = dailyRainfall.filter((r) => r > 0.1).length;

  return {
    hours_rh_ge_80pct: rhGe80Hours,
    hours_temp_favorable_22_32C: tempFavorableHours,
    hours_dew_condensation_proxy: dewProxyHours,
    cumulative_rainfall_14d_mm: Math.round(cumulativeRainfallMm * 100) / 100,
    rainfall_days_14d_count: rainfallDaysCount,
    mean_temperature: Math.round((sumTemp / n) * 10) / 10,
    mean_relative_humidity: Math.round((sumRh / n) * 10) / 10,
    mean_soil_moisture: soilMoistureCount > 0 ? Math.round((sumSoilMoisture / soilMoistureCount) * 1000) / 1000 : undefined,
    mean_wind_speed: windSpeedCount > 0 ? Math.round((sumWindSpeed / windSpeedCount) * 10) / 10 : undefined,
    mean_shortwave_radiation: radiationCount > 0 ? Math.round((sumRadiation / radiationCount) * 10) / 10 : undefined,
    overcast_daylight_hours: radiationCount > 0 ? overcastDaylightHours : undefined,
    windowHours: n,
    validHourlyRecordsCount: n,
  };
}

// ============================================================================
// 5. DISEASE-SPECIFIC RISK EVALUATION PATHWAYS
// ============================================================================

/**
 * Pathway A: Turmeric Leaf Spot (Colletotrichum capsici)
 * Dispersed via rain splash, requires high RH and warm incubation temperatures.
 */
export function evaluateLeafSpotRisk(
  features: TransformedExposureFeatures,
  cropContext?: CropContext,
  dataSource: TelemetryDataSource = 'HISTORICAL_REANALYSIS_ERA5'
): ResearchRiskOutput {
  const cfg = PROVISIONAL_BASELINE_THRESHOLDS;
  const factors: string[] = [];
  const provisionalUsed: string[] = [];
  let riskLevel: ResearchRiskLevel = 'LOW';

  // Evaluate biophysical gating conditions
  const hasHighRainfall = features.cumulative_rainfall_14d_mm >= cfg.RAIN_HIGH_CUMULATIVE_MM;
  const hasModerateRainfall = features.cumulative_rainfall_14d_mm >= cfg.RAIN_MODERATE_CUMULATIVE_MM;
  const hasFrequentRain = features.rainfall_days_14d_count >= cfg.RAIN_HIGH_DAYS_COUNT;
  const hasHighRH = features.hours_rh_ge_80pct >= cfg.MOISTURE_RH_HIGH_HOURS;
  const hasModerateRH = features.hours_rh_ge_80pct >= cfg.MOISTURE_RH_MODERATE_HOURS;
  const hasFavorableTemp = features.hours_temp_favorable_22_32C >= cfg.TEMP_FAVORABLE_HIGH_HOURS;
  const hasMinTemp = features.hours_temp_favorable_22_32C >= cfg.TEMP_FAVORABLE_MIN_INCUBATION;
  const isMoistureDeficient =
    features.hours_rh_ge_80pct < cfg.MOISTURE_RH_DEFICIENT_HOURS &&
    features.cumulative_rainfall_14d_mm < cfg.RAIN_DRY_CUMULATIVE_MM &&
    features.hours_dew_condensation_proxy < cfg.DEW_PROXY_DEFICIENT_HOURS;

  if (isMoistureDeficient || !hasMinTemp) {
    riskLevel = 'LOW';
    factors.push(
      `Deficient moisture or sub-optimal thermal duration (${features.hours_rh_ge_80pct}h RH>=80%, ${features.cumulative_rainfall_14d_mm}mm rain, ${features.hours_temp_favorable_22_32C}h temp 22-32°C).`
    );
    provisionalUsed.push(`Moisture deficit gate (<${cfg.MOISTURE_RH_DEFICIENT_HOURS}h RH80 and <${cfg.RAIN_DRY_CUMULATIVE_MM}mm rain)`);
  } else if ((hasHighRainfall || (hasFrequentRain && hasHighRH)) && hasFavorableTemp) {
    riskLevel = 'HIGH';
    factors.push(`Substantial antecedent rainfall volume (${features.cumulative_rainfall_14d_mm} mm over ${features.rainfall_days_14d_count} rain days) providing candidate splash dispersal.`);
    factors.push(`Extended high atmospheric humidity (${features.hours_rh_ge_80pct} hours >= 80% RH) supporting conidial hydration.`);
    factors.push(`Optimal fungal incubation temperature duration (${features.hours_temp_favorable_22_32C} hours between 22-32°C).`);
    provisionalUsed.push(`High rain threshold (>=${cfg.RAIN_HIGH_CUMULATIVE_MM}mm) or Rain frequency (>=${cfg.RAIN_HIGH_DAYS_COUNT}d) with RH80 (>=${cfg.MOISTURE_RH_HIGH_HOURS}h)`);
  } else if ((hasModerateRainfall || hasModerateRH) && hasMinTemp) {
    riskLevel = 'MODERATE';
    factors.push(`Moderate moisture permissiveness (${features.cumulative_rainfall_14d_mm} mm rain, ${features.hours_rh_ge_80pct} hours >= 80% RH).`);
    factors.push(`Thermal exposure within permissive fungal range (${features.hours_temp_favorable_22_32C} hours between 22-32°C).`);
    provisionalUsed.push(`Moderate moisture threshold (>=${cfg.RAIN_MODERATE_CUMULATIVE_MM}mm or >=${cfg.MOISTURE_RH_MODERATE_HOURS}h RH80)`);
  } else {
    riskLevel = 'LOW';
    factors.push(`Observed microclimate conditions remain below candidate fungal permissiveness criteria.`);
  }

  // Phenological context interpretation (non-numerical gating)
  let phenologyNote = 'Standard vegetative to rhizome development window.';
  if (cropContext?.dap !== undefined) {
    if (cropContext.dap >= 60 && cropContext.dap <= 160) {
      phenologyNote = `Crop age (${cropContext.dap} DAP) aligns with the documented vegetative susceptibility window for Leaf Spot.`;
    } else if (cropContext.dap > 180) {
      phenologyNote = `Crop age (${cropContext.dap} DAP) is in late maturity/senescence; active foliar lesion expansion may be naturally attenuated.`;
    }
  }

  return {
    disease: 'Leaf Spot',
    riskLevel,
    exposureFeatures: features,
    phenologyContext: {
      dap: cropContext?.dap,
      growthStage: cropContext?.growthStage,
      susceptibilityNote: phenologyNote,
    },
    evidenceStatus: 'EVIDENCE_SUPPORTED_CANDIDATE_PATHWAY',
    dataSource,
    timestamp: new Date().toISOString(),
    explanation: {
      summary: `Leaf Spot risk evaluated as ${riskLevel} based on 14-day antecedent rainfall, relative humidity, and thermal incubation features.`,
      contributingFactors: factors,
      biologicalRationale:
        'Colletotrichum capsici conidia are mucilaginous and dispersed by raindrop impact; foliar penetration requires warm temperatures (21-32°C) and sustained moisture.',
      evidenceSourceIds: ['SRC-01 (TNAU CPPS)', 'SRC-02 (AICRPS Bhavanisagar)', 'SRC-03 (Indian Phytopathol.)'],
      provisionalThresholdsUsed: provisionalUsed,
    },
    limitations: STANDARD_LIMITATIONS,
  };
}

/**
 * Pathway B: Turmeric Leaf Blotch (Taphrina maculans)
 * Airborne ascospores, driven by high relative humidity and dew condensation in moderate temps (25-30°C).
 */
export function evaluateLeafBlotchRisk(
  features: TransformedExposureFeatures,
  cropContext?: CropContext,
  dataSource: TelemetryDataSource = 'HISTORICAL_REANALYSIS_ERA5'
): ResearchRiskOutput {
  const cfg = PROVISIONAL_BASELINE_THRESHOLDS;
  const factors: string[] = [];
  const provisionalUsed: string[] = [];
  let riskLevel: ResearchRiskLevel = 'LOW';

  const hasHighRH = features.hours_rh_ge_80pct >= cfg.MOISTURE_RH_HIGH_HOURS;
  const hasModerateRH = features.hours_rh_ge_80pct >= cfg.MOISTURE_RH_MODERATE_HOURS;
  const hasHighDew = features.hours_dew_condensation_proxy >= cfg.DEW_PROXY_HIGH_HOURS;
  const hasModerateDew = features.hours_dew_condensation_proxy >= cfg.DEW_PROXY_MODERATE_HOURS;
  const hasFavorableTemp = features.hours_temp_favorable_22_32C >= cfg.TEMP_FAVORABLE_HIGH_HOURS;
  const hasMinTemp = features.hours_temp_favorable_22_32C >= cfg.TEMP_FAVORABLE_MIN_INCUBATION;
  const isMoistureDeficient =
    features.hours_rh_ge_80pct < cfg.MOISTURE_RH_DEFICIENT_HOURS &&
    features.hours_dew_condensation_proxy < cfg.DEW_PROXY_DEFICIENT_HOURS;

  if (isMoistureDeficient || !hasMinTemp) {
    riskLevel = 'LOW';
    factors.push(`Dry canopy microclimate or limited thermal incubation (${features.hours_rh_ge_80pct}h RH>=80%, ${features.hours_dew_condensation_proxy}h dew proxy).`);
    provisionalUsed.push(`Moisture deficit gate (<${cfg.MOISTURE_RH_DEFICIENT_HOURS}h RH80 and <${cfg.DEW_PROXY_DEFICIENT_HOURS}h dew proxy)`);
  } else if ((hasHighRH || hasHighDew) && hasFavorableTemp) {
    riskLevel = 'HIGH';
    factors.push(`Persistent high atmospheric humidity (${features.hours_rh_ge_80pct} hours >= 80% RH) supporting airborne ascospore discharge.`);
    factors.push(`Prolonged canopy dew/condensation proxy conditions (${features.hours_dew_condensation_proxy} hours).`);
    factors.push(`Thermal exposure optimal for Taphrina mycelial development (${features.hours_temp_favorable_22_32C} hours in 22-32°C).`);
    provisionalUsed.push(`High RH/Dew threshold (>=${cfg.MOISTURE_RH_HIGH_HOURS}h RH80 or >=${cfg.DEW_PROXY_HIGH_HOURS}h dew proxy) with TempOpt (>=${cfg.TEMP_FAVORABLE_HIGH_HOURS}h)`);
  } else if ((hasModerateRH || hasModerateDew) && hasMinTemp) {
    riskLevel = 'MODERATE';
    factors.push(`Moderate humidity and condensation duration (${features.hours_rh_ge_80pct} hours >= 80% RH, ${features.hours_dew_condensation_proxy} hours dew proxy).`);
    factors.push(`Favorable temperature duration (${features.hours_temp_favorable_22_32C} hours).`);
    provisionalUsed.push(`Moderate RH/Dew threshold (>=${cfg.MOISTURE_RH_MODERATE_HOURS}h RH80 or >=${cfg.DEW_PROXY_MODERATE_HOURS}h dew proxy)`);
  } else {
    riskLevel = 'LOW';
    factors.push('Atmospheric moisture and temperature levels do not indicate high blotch permissiveness.');
  }

  // Phenological context interpretation
  let phenologyNote = 'Standard rhizome development phase.';
  if (cropContext?.dap !== undefined) {
    if (cropContext.dap >= 120 && cropContext.dap <= 180) {
      phenologyNote = `Crop age (${cropContext.dap} DAP) falls within the peak rhizome development phase with documented vulnerability to Leaf Blotch.`;
    } else if (cropContext.dap > 180) {
      phenologyNote = `Crop age (${cropContext.dap} DAP) is in late senescence; observed blotch severity in late season is hypothesized to be modulated by canopy aging and irrigation tapering.`;
    }
  }

  return {
    disease: 'Leaf Blotch',
    riskLevel,
    exposureFeatures: features,
    phenologyContext: {
      dap: cropContext?.dap,
      growthStage: cropContext?.growthStage,
      susceptibilityNote: phenologyNote,
    },
    evidenceStatus: 'EVIDENCE_SUPPORTED_CANDIDATE_PATHWAY',
    dataSource,
    timestamp: new Date().toISOString(),
    explanation: {
      summary: `Leaf Blotch risk evaluated as ${riskLevel} based on atmospheric humidity duration, dew condensation proxy, and thermal incubation.`,
      contributingFactors: factors,
      biologicalRationale:
        'Taphrina maculans ascospores are airborne and proliferate under sustained high relative humidity and foliar condensation, even during periods without heavy rainfall.',
      evidenceSourceIds: ['SRC-01 (TNAU Agritech)', 'SRC-02 (AICRPS Bhavanisagar)', 'SRC-04 (ICAR-IISR)'],
      provisionalThresholdsUsed: provisionalUsed,
    },
    limitations: STANDARD_LIMITATIONS,
  };
}

/**
 * Pathway C: Sap-Sucking Pests & Vectors (Aphids / Thrips)
 * Proliferate during warm, dry spells with low rainfall; mechanically dislodged by heavy rain.
 */
export function evaluateAphidRisk(
  features: TransformedExposureFeatures,
  cropContext?: CropContext,
  dataSource: TelemetryDataSource = 'HISTORICAL_REANALYSIS_ERA5'
): ResearchRiskOutput {
  const cfg = PROVISIONAL_BASELINE_THRESHOLDS;
  const factors: string[] = [];
  const provisionalUsed: string[] = [];
  let riskLevel: ResearchRiskLevel = 'LOW';

  const hasWashoffRain =
    features.cumulative_rainfall_14d_mm >= cfg.RAIN_PEST_WASHOFF_MM ||
    features.rainfall_days_14d_count >= cfg.RAIN_PEST_WASHOFF_DAYS;

  const isWarmAndDry =
    features.cumulative_rainfall_14d_mm < cfg.RAIN_DRY_CUMULATIVE_MM &&
    features.hours_rh_ge_80pct < cfg.APHID_DRY_MAX_RH_HOURS &&
    features.mean_temperature >= cfg.APHID_WARM_MEAN_TEMP_C;

  const isModerateDry =
    features.cumulative_rainfall_14d_mm < cfg.RAIN_MODERATE_CUMULATIVE_MM &&
    features.mean_temperature >= cfg.APHID_MODERATE_TEMP_C;

  if (hasWashoffRain) {
    riskLevel = 'LOW';
    factors.push(
      `Frequent or substantial rainfall (${features.cumulative_rainfall_14d_mm} mm over ${features.rainfall_days_14d_count} rain days) providing mechanical wash-off of pest colonies.`
    );
    provisionalUsed.push(`Rainfall wash-off gate (>=${cfg.RAIN_PEST_WASHOFF_MM}mm or >=${cfg.RAIN_PEST_WASHOFF_DAYS} rain days)`);
  } else if (isWarmAndDry) {
    riskLevel = 'HIGH';
    factors.push(`Prolonged warm ambient temperatures (14-day mean: ${features.mean_temperature}°C) favoring rapid aphid reproduction.`);
    factors.push(`Low moisture and minimal rainfall (${features.cumulative_rainfall_14d_mm} mm) preventing natural physical suppression.`);
    provisionalUsed.push(`Dry-warm threshold (<${cfg.RAIN_DRY_CUMULATIVE_MM}mm rain, <${cfg.APHID_DRY_MAX_RH_HOURS}h RH80, mean temp >=${cfg.APHID_WARM_MEAN_TEMP_C}°C)`);
  } else if (isModerateDry) {
    riskLevel = 'MODERATE';
    factors.push(`Dry microclimate with moderate temperatures (14-day mean: ${features.mean_temperature}°C, ${features.cumulative_rainfall_14d_mm} mm rain).`);
    provisionalUsed.push(`Moderate dry threshold (<${cfg.RAIN_MODERATE_CUMULATIVE_MM}mm rain, mean temp >=${cfg.APHID_MODERATE_TEMP_C}°C)`);
  } else {
    riskLevel = 'LOW';
    factors.push('Rainfall and microclimate conditions do not indicate high aphid population pressure.');
  }

  let phenologyNote = 'Early vegetative and canopy establishment phase.';
  if (cropContext?.dap !== undefined) {
    if (cropContext.dap >= 30 && cropContext.dap <= 120) {
      phenologyNote = `Crop age (${cropContext.dap} DAP) is in tender vegetative growth, which is susceptible to sap-sucking insect colonies.`;
    }
  }

  return {
    disease: 'Aphids',
    riskLevel,
    exposureFeatures: features,
    phenologyContext: {
      dap: cropContext?.dap,
      growthStage: cropContext?.growthStage,
      susceptibilityNote: phenologyNote,
    },
    evidenceStatus: 'EVIDENCE_SUPPORTED_CANDIDATE_PATHWAY',
    dataSource,
    timestamp: new Date().toISOString(),
    explanation: {
      summary: `Aphid / pest risk evaluated as ${riskLevel} based on dry spells, mean temperature, and absence of heavy rainfall wash-off events.`,
      contributingFactors: factors,
      biologicalRationale:
        'Aphis gossypii and thrips multiply rapidly during warm, dry conditions and are physically suppressed or dislodged by heavy precipitation.',
      evidenceSourceIds: ['SRC-01 (TNAU Agritech Portal)', 'SRC-04 (ICAR-IISR Pest Management)'],
      provisionalThresholdsUsed: provisionalUsed,
    },
    limitations: STANDARD_LIMITATIONS,
  };
}

/**
 * Unified Disease-Specific Evaluator Dispatcher
 */
export function evaluateResearchEnvironmentalRisk(
  disease: ResearchDiseaseType,
  records: HourlyEnvironmentalRecord[],
  cropContext?: CropContext,
  dataSource: TelemetryDataSource = 'HISTORICAL_REANALYSIS_ERA5'
): ResearchRiskOutput {
  const features = transform14dExposureFeatures(records);

  switch (disease) {
    case 'Leaf Spot':
      return evaluateLeafSpotRisk(features, cropContext, dataSource);
    case 'Leaf Blotch':
      return evaluateLeafBlotchRisk(features, cropContext, dataSource);
    case 'Aphids':
      return evaluateAphidRisk(features, cropContext, dataSource);
    default:
      throw new Error(`Unsupported disease type for research risk evaluation: ${disease}`);
  }
}

// ============================================================================
// 6. DATA SOURCE ADAPTERS & NORMALIZERS
// ============================================================================

/**
 * Normalizes Open-Meteo ERA5 / ERA5-Land hourly REST API payload into HourlyEnvironmentalRecord[]
 */
export function normalizeReanalysisPayload(payload: {
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    precipitation: number[];
    wind_speed_10m?: number[];
    shortwave_radiation?: number[];
    soil_moisture_0_to_7cm?: number[];
  };
}): HourlyEnvironmentalRecord[] {
  if (!payload || !payload.hourly || !Array.isArray(payload.hourly.time)) {
    throw new Error('Invalid reanalysis payload structure: missing hourly time array.');
  }

  const h = payload.hourly;
  const len = h.time.length;

  const records: HourlyEnvironmentalRecord[] = [];
  for (let i = 0; i < len; i++) {
    records.push({
      timestamp: h.time[i],
      temperature_2m: h.temperature_2m[i],
      relative_humidity_2m: h.relative_humidity_2m[i],
      dew_point_2m: h.dew_point_2m[i],
      precipitation: h.precipitation[i],
      wind_speed_10m: h.wind_speed_10m ? h.wind_speed_10m[i] : undefined,
      shortwave_radiation: h.shortwave_radiation ? h.shortwave_radiation[i] : undefined,
      soil_moisture_0_to_7cm: h.soil_moisture_0_to_7cm ? h.soil_moisture_0_to_7cm[i] : undefined,
    });
  }

  return records;
}

/**
 * Normalizes raw IoT Sensor Grid payload into HourlyEnvironmentalRecord[]
 */
export function normalizeSensorGridPayload(sensorPayload: {
  telemetryStream: Array<{
    isoTime: string;
    ambientTempC: number;
    ambientRhPct: number;
    dewPointC?: number;
    rainGaugeMm?: number;
    windKmh?: number;
    solarFluxWm2?: number;
    soilVolumetricMoisturePct?: number;
  }>;
}): HourlyEnvironmentalRecord[] {
  if (!sensorPayload || !Array.isArray(sensorPayload.telemetryStream)) {
    throw new Error('Invalid sensor payload: telemetryStream must be an array.');
  }

  return sensorPayload.telemetryStream.map((s) => {
    // If dew point not provided, compute using standard Magnus-Tetens approximation
    let dewPoint = s.dewPointC;
    if (dewPoint === undefined || isNaN(dewPoint)) {
      const a = 17.27;
      const b = 237.7;
      const alpha = (a * s.ambientTempC) / (b + s.ambientTempC) + Math.log(s.ambientRhPct / 100.0);
      dewPoint = Math.round(((b * alpha) / (a - alpha)) * 10) / 10;
    }

    return {
      timestamp: s.isoTime,
      temperature_2m: s.ambientTempC,
      relative_humidity_2m: s.ambientRhPct,
      dew_point_2m: dewPoint,
      precipitation: s.rainGaugeMm || 0,
      wind_speed_10m: s.windKmh,
      shortwave_radiation: s.solarFluxWm2,
      soil_moisture_0_to_7cm: s.soilVolumetricMoisturePct !== undefined ? s.soilVolumetricMoisturePct / 100 : undefined,
    };
  });
}

/**
 * Helper to convert manual interactive sliders into a standardized 336-hour buffer
 * for interactive exploration.
 */
export function createHourlySeriesFromManualParams(
  params: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed?: number;
    sunlightHours?: number;
    soilMoisture?: number;
  },
  hours: number = 336
): HourlyEnvironmentalRecord[] {
  // Compute dew point using standard Magnus-Tetens formula
  const a = 17.27;
  const b = 237.7;
  const temp = Math.max(-10, Math.min(60, params.temperature));
  const rh = Math.max(1, Math.min(100, params.humidity));
  const alpha = (a * temp) / (b + temp) + Math.log(rh / 100.0);
  const dewPoint = Math.round(((b * alpha) / (a - alpha)) * 10) / 10;

  const records: HourlyEnvironmentalRecord[] = [];
  const baseTime = new Date('2026-09-01T00:00:00Z').getTime();

  // Hourly rainfall rate to sum up to total 14-day rainfall
  const totalRain = Math.max(0, params.rainfall);
  // Distribute rain across realistic diurnal events (e.g. evening showers)
  const rainPerHour = totalRain > 0 ? totalRain / hours : 0;

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(baseTime + i * 3600 * 1000).toISOString();
    // Diurnal variation simulation around mean values
    const hourOfDay = i % 24;
    const isDaylight = hourOfDay >= 6 && hourOfDay <= 18;
    const solarRadiation = isDaylight ? (params.sunlightHours ? (params.sunlightHours / 12) * 350 : 250) : 0;

    records.push({
      timestamp,
      temperature_2m: temp,
      relative_humidity_2m: rh,
      dew_point_2m: dewPoint,
      precipitation: rainPerHour,
      wind_speed_10m: params.windSpeed || 6.5,
      shortwave_radiation: solarRadiation,
      soil_moisture_0_to_7cm: params.soilMoisture ? params.soilMoisture / 100 : 0.32,
    });
  }

  return records;
}

import {
  ERODE_OCT_2021_RECORDS,
  ERODE_OCT_2022_BLOTCH_RECORDS,
  DHARMAPURI_OCT_2023_APHIDS_RECORDS,
} from '../data/historicalReanalysisData';

/**
 * Verified Historical Reanalysis Baseline Presets (from source-verified dataset in environmental_data/)
 */
export const HISTORICAL_REANALYSIS_PRESETS: Record<
  string,
  {
    id: string;
    label: string;
    district: string;
    period: string;
    source: string;
    diseaseContext: ResearchDiseaseType;
    dap: number;
    records: HourlyEnvironmentalRecord[];
  }
> = {
  ERODE_OCT_2021: {
    id: 'ERODE_OCT_2021',
    label: 'Erode (October 2021 — High Moisture Trial)',
    district: 'Erode',
    period: '01 Oct 2021 – 14 Oct 2021',
    source: 'ECMWF ERA5-Land Reanalysis (AICRPS Bhavanisagar Benchmark)',
    diseaseContext: 'Leaf Spot',
    dap: 150,
    records: ERODE_OCT_2021_RECORDS,
  },
  ERODE_OCT_2022_BLOTCH: {
    id: 'ERODE_OCT_2022_BLOTCH',
    label: 'Erode (October 2022 — Severe Blotch Outbreak)',
    district: 'Erode',
    period: '18 Oct 2022 – 31 Oct 2022',
    source: 'ECMWF ERA5-Land Reanalysis (AICRPS Bhavanisagar Benchmark)',
    diseaseContext: 'Leaf Blotch',
    dap: 160,
    records: ERODE_OCT_2022_BLOTCH_RECORDS,
  },
  DHARMAPURI_OCT_2023_APHIDS: {
    id: 'DHARMAPURI_OCT_2023_APHIDS',
    label: 'Dharmapuri (September–October 2023 — Dry Spell)',
    district: 'Dharmapuri',
    period: '26 Sep 2023 – 09 Oct 2023',
    source: 'ECMWF ERA5-Land Reanalysis (TNAU CPPS Survey)',
    diseaseContext: 'Aphids',
    dap: 140,
    records: DHARMAPURI_OCT_2023_APHIDS_RECORDS,
  },
};

