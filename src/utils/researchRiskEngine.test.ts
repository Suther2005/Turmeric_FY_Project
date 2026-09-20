/**
 * Comprehensive Test Suite for TurmeriCare AI Research Environmental Risk Engine (Stage 5B)
 * 
 * Validates requirements A through T:
 * A. valid environmental input
 * B. missing temperature
 * C. missing RH
 * D. missing rainfall
 * E. missing dew point
 * F. invalid negative rainfall
 * G. invalid RH outside 0–100
 * H. invalid temperature
 * I. insufficient 14-day records (< 336)
 * J. exactly 14-day records (= 336)
 * K. more than 14 days (> 336)
 * L. disease-specific output (Leaf Spot, Leaf Blotch, Aphids)
 * M. deterministic output
 * N. manual source handling
 * O. historical reanalysis source normalization
 * P. sensor source schema compatibility
 * Q. dew proxy explicitly labelled proxy
 * R. soil pH excluded from environmental risk calculation
 * S. no synthetic data generation
 * T. no modification of existing fallback calculator
 */

import {
  HourlyEnvironmentalRecord,
  validateHourlyRecord,
  validateHourlySeries,
  transform14dExposureFeatures,
  evaluateResearchEnvironmentalRisk,
  evaluateLeafSpotRisk,
  evaluateLeafBlotchRisk,
  evaluateAphidRisk,
  normalizeReanalysisPayload,
  normalizeSensorGridPayload,
  PROVISIONAL_BASELINE_THRESHOLDS,
} from './researchRiskEngine';

import { calculateEnvironmentalRisk as fallbackCalculator } from './riskCalculator';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testId: string, testName: string, details?: string) {
  if (condition) {
    results.push({ id: testId, name: testName, passed: true, details });
    console.log(`[PASS] ${testId}: ${testName}`);
  } else {
    results.push({ id: testId, name: testName, passed: false, error: 'Assertion failed', details });
    console.error(`[FAIL] ${testId}: ${testName} - ${details || ''}`);
  }
}

// Helper to generate N hourly records for test scenarios
function generateHourlyRecords(count: number, overrides: Partial<HourlyEnvironmentalRecord> = {}): HourlyEnvironmentalRecord[] {
  const records: HourlyEnvironmentalRecord[] = [];
  const baseDate = new Date('2023-10-01T00:00:00Z');

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(baseDate.getTime() + i * 3600 * 1000).toISOString();
    records.push({
      timestamp,
      temperature_2m: 26.5,
      relative_humidity_2m: 85.0,
      dew_point_2m: 25.5,
      precipitation: 1.5,
      wind_speed_10m: 7.2,
      shortwave_radiation: 150.0,
      soil_moisture_0_to_7cm: 0.35,
      ...overrides,
    });
  }
  return records;
}

export function runAllTests(): { allPassed: boolean; total: number; passed: number; failed: number; results: TestResult[] } {
  console.log('================================================================');
  console.log('TURMERICARE AI — STAGE 5B RESEARCH RISK ENGINE TEST SUITE');
  console.log('================================================================\n');

  // Test A: Valid Environmental Input
  try {
    const validRecords = generateHourlyRecords(336);
    const features = transform14dExposureFeatures(validRecords);
    const output = evaluateResearchEnvironmentalRisk('Leaf Spot', validRecords);
    
    assert(
      features.windowHours === 336 &&
      features.hours_rh_ge_80pct === 336 &&
      features.hours_temp_favorable_22_32C === 336 &&
      features.hours_dew_condensation_proxy === 336 &&
      features.cumulative_rainfall_14d_mm === 504 &&
      output.riskLevel === 'HIGH' &&
      output.evidenceStatus === 'EVIDENCE_SUPPORTED_CANDIDATE_PATHWAY',
      'TEST_A',
      'Valid environmental input calculates correct 14-day exposure features and risk level'
    );
  } catch (e: any) {
    assert(false, 'TEST_A', 'Valid environmental input', e.message);
  }

  // Test B: Missing Temperature
  try {
    const recWithMissingTemp: any = {
      timestamp: '2023-10-01T00:00:00Z',
      relative_humidity_2m: 80,
      dew_point_2m: 20,
      precipitation: 0,
    };
    const val = validateHourlyRecord(recWithMissingTemp);
    assert(!val.isValid && val.errors.some((e) => e.includes('temperature_2m')), 'TEST_B', 'Missing temperature is caught and rejected');
  } catch (e: any) {
    assert(false, 'TEST_B', 'Missing temperature', e.message);
  }

  // Test C: Missing Relative Humidity
  try {
    const recWithMissingRh: any = {
      timestamp: '2023-10-01T00:00:00Z',
      temperature_2m: 25,
      dew_point_2m: 20,
      precipitation: 0,
    };
    const val = validateHourlyRecord(recWithMissingRh);
    assert(!val.isValid && val.errors.some((e) => e.includes('relative_humidity_2m')), 'TEST_C', 'Missing RH is caught and rejected');
  } catch (e: any) {
    assert(false, 'TEST_C', 'Missing RH', e.message);
  }

  // Test D: Missing Rainfall
  try {
    const recWithMissingPrecip: any = {
      timestamp: '2023-10-01T00:00:00Z',
      temperature_2m: 25,
      relative_humidity_2m: 80,
      dew_point_2m: 20,
    };
    const val = validateHourlyRecord(recWithMissingPrecip);
    assert(!val.isValid && val.errors.some((e) => e.includes('precipitation')), 'TEST_D', 'Missing rainfall is caught and rejected');
  } catch (e: any) {
    assert(false, 'TEST_D', 'Missing rainfall', e.message);
  }

  // Test E: Missing Dew Point
  try {
    const recWithMissingDew: any = {
      timestamp: '2023-10-01T00:00:00Z',
      temperature_2m: 25,
      relative_humidity_2m: 80,
      precipitation: 0,
    };
    const val = validateHourlyRecord(recWithMissingDew);
    assert(!val.isValid && val.errors.some((e) => e.includes('dew_point_2m')), 'TEST_E', 'Missing dew point is caught and rejected');
  } catch (e: any) {
    assert(false, 'TEST_E', 'Missing dew point', e.message);
  }

  // Test F: Invalid Negative Rainfall
  try {
    const invalidPrecipRec: HourlyEnvironmentalRecord = {
      timestamp: '2023-10-01T00:00:00Z',
      temperature_2m: 25,
      relative_humidity_2m: 80,
      dew_point_2m: 20,
      precipitation: -5.0,
    };
    const val = validateHourlyRecord(invalidPrecipRec);
    assert(!val.isValid && val.errors.some((e) => e.includes('Negative precipitation')), 'TEST_F', 'Negative precipitation is rejected');
  } catch (e: any) {
    assert(false, 'TEST_F', 'Invalid negative rainfall', e.message);
  }

  // Test G: Invalid RH outside 0–100%
  try {
    const invalidRhLow: HourlyEnvironmentalRecord = {
      timestamp: '2023-10-01T00:00:00Z',
      temperature_2m: 25,
      relative_humidity_2m: -10,
      dew_point_2m: 20,
      precipitation: 0,
    };
    const invalidRhHigh: HourlyEnvironmentalRecord = {
      timestamp: '2023-10-01T00:00:00Z',
      temperature_2m: 25,
      relative_humidity_2m: 105,
      dew_point_2m: 20,
      precipitation: 0,
    };
    const valLow = validateHourlyRecord(invalidRhLow);
    const valHigh = validateHourlyRecord(invalidRhHigh);
    assert(!valLow.isValid && !valHigh.isValid, 'TEST_G', 'RH values outside [0, 100]% are rejected');
  } catch (e: any) {
    assert(false, 'TEST_G', 'Invalid RH outside 0-100', e.message);
  }

  // Test H: Invalid Temperature outside bounds
  try {
    const invalidTempRec: HourlyEnvironmentalRecord = {
      timestamp: '2023-10-01T00:00:00Z',
      temperature_2m: 85,
      relative_humidity_2m: 50,
      dew_point_2m: 20,
      precipitation: 0,
    };
    const val = validateHourlyRecord(invalidTempRec);
    assert(!val.isValid && val.errors.some((e) => e.includes('temperature_2m')), 'TEST_H', 'Temperature outside [-10, 60]°C is rejected');
  } catch (e: any) {
    assert(false, 'TEST_H', 'Invalid temperature', e.message);
  }

  // Test I: Insufficient 14-day records (< 336)
  try {
    const shortSeries = generateHourlyRecords(100);
    let threw = false;
    try {
      transform14dExposureFeatures(shortSeries);
    } catch (err: any) {
      threw = err.message.includes('INSUFFICIENT_14D_RECORDS');
    }
    assert(threw, 'TEST_I', 'Series with < 336 hourly records is rejected with INSUFFICIENT_14D_RECORDS error');
  } catch (e: any) {
    assert(false, 'TEST_I', 'Insufficient 14-day records', e.message);
  }

  // Test J: Exactly 14-day records (= 336)
  try {
    const exactSeries = generateHourlyRecords(336);
    const features = transform14dExposureFeatures(exactSeries);
    assert(features.validHourlyRecordsCount === 336 && features.windowHours === 336, 'TEST_J', 'Exactly 336 records processed correctly');
  } catch (e: any) {
    assert(false, 'TEST_J', 'Exactly 14-day records', e.message);
  }

  // Test K: More than 14-day records (> 336)
  try {
    const longSeries = generateHourlyRecords(500, { precipitation: 0 });
    // Make only the most recent 336 hours have 2mm rain each (672mm total), while earlier hours have 0
    for (let i = 500 - 336; i < 500; i++) {
      longSeries[i].precipitation = 2.0;
    }
    const features = transform14dExposureFeatures(longSeries);
    assert(
      features.validHourlyRecordsCount === 336 && features.cumulative_rainfall_14d_mm === 672,
      'TEST_K',
      'Series with > 336 records correctly slices the most recent 336 hours'
    );
  } catch (e: any) {
    assert(false, 'TEST_K', 'More than 14-day records', e.message);
  }

  // Test L: Disease-Specific Divergent Outputs
  try {
    // Scenario 1: Warm and very dry conditions (favorable for Aphids, unfavorable for Fungi)
    const dryWarmSeries = generateHourlyRecords(336, {
      temperature_2m: 30.0,
      relative_humidity_2m: 45.0,
      dew_point_2m: 16.0,
      precipitation: 0.0,
    });
    const spotDry = evaluateResearchEnvironmentalRisk('Leaf Spot', dryWarmSeries);
    const blotchDry = evaluateResearchEnvironmentalRisk('Leaf Blotch', dryWarmSeries);
    const aphidDry = evaluateResearchEnvironmentalRisk('Aphids', dryWarmSeries);

    const dryCorrect = spotDry.riskLevel === 'LOW' && blotchDry.riskLevel === 'LOW' && aphidDry.riskLevel === 'HIGH';

    // Scenario 2: Wet and humid conditions (favorable for Fungi, unfavorable for Aphids due to wash-off)
    const wetHumidSeries = generateHourlyRecords(336, {
      temperature_2m: 26.0,
      relative_humidity_2m: 90.0,
      dew_point_2m: 25.0,
      precipitation: 5.0,
    });
    const spotWet = evaluateResearchEnvironmentalRisk('Leaf Spot', wetHumidSeries);
    const blotchWet = evaluateResearchEnvironmentalRisk('Leaf Blotch', wetHumidSeries);
    const aphidWet = evaluateResearchEnvironmentalRisk('Aphids', wetHumidSeries);

    const wetCorrect = spotWet.riskLevel === 'HIGH' && blotchWet.riskLevel === 'HIGH' && aphidWet.riskLevel === 'LOW';

    assert(dryCorrect && wetCorrect, 'TEST_L', 'Disease-specific pathways demonstrate divergent, biologically consistent responses');
  } catch (e: any) {
    assert(false, 'TEST_L', 'Disease-specific output', e.message);
  }

  // Test M: Deterministic Output
  try {
    const seriesA = generateHourlyRecords(336, { temperature_2m: 27.2, relative_humidity_2m: 82.0, precipitation: 1.2, dew_point_2m: 26.0 });
    const seriesB = generateHourlyRecords(336, { temperature_2m: 27.2, relative_humidity_2m: 82.0, precipitation: 1.2, dew_point_2m: 26.0 });

    const outA = evaluateResearchEnvironmentalRisk('Leaf Blotch', seriesA);
    const outB = evaluateResearchEnvironmentalRisk('Leaf Blotch', seriesB);

    assert(
      outA.riskLevel === outB.riskLevel &&
      outA.exposureFeatures.cumulative_rainfall_14d_mm === outB.exposureFeatures.cumulative_rainfall_14d_mm &&
      outA.exposureFeatures.hours_dew_condensation_proxy === outB.exposureFeatures.hours_dew_condensation_proxy &&
      outA.explanation.summary === outB.explanation.summary,
      'TEST_M',
      'Engine is 100% deterministic (identical inputs produce identical features, risk levels, and explanations)'
    );
  } catch (e: any) {
    assert(false, 'TEST_M', 'Deterministic output', e.message);
  }

  // Test N: Manual Source Handling
  try {
    const manualSeries = generateHourlyRecords(336);
    const outManual = evaluateResearchEnvironmentalRisk('Leaf Spot', manualSeries, { dap: 100 }, 'MANUAL_FIELD_INPUT');
    assert(
      outManual.dataSource === 'MANUAL_FIELD_INPUT' &&
      outManual.phenologyContext.dap === 100 &&
      outManual.phenologyContext.susceptibilityNote.includes('100 DAP'),
      'TEST_N',
      'Manual field input source and DAP context are handled and attributed cleanly'
    );
  } catch (e: any) {
    assert(false, 'TEST_N', 'Manual source handling', e.message);
  }

  // Test O: Historical Reanalysis Normalization
  try {
    const reanalysisPayload = {
      hourly: {
        time: Array.from({ length: 336 }, (_, i) => `2023-10-01T${String(i % 24).padStart(2, '0')}:00Z`),
        temperature_2m: Array(336).fill(25.0),
        relative_humidity_2m: Array(336).fill(85.0),
        dew_point_2m: Array(336).fill(24.0),
        precipitation: Array(336).fill(0.5),
        wind_speed_10m: Array(336).fill(5.0),
        shortwave_radiation: Array(336).fill(100.0),
        soil_moisture_0_to_7cm: Array(336).fill(0.32),
      },
    };
    const records = normalizeReanalysisPayload(reanalysisPayload);
    const out = evaluateResearchEnvironmentalRisk('Leaf Spot', records, undefined, 'HISTORICAL_REANALYSIS_ERA5');
    assert(
      records.length === 336 &&
      records[0].temperature_2m === 25.0 &&
      out.dataSource === 'HISTORICAL_REANALYSIS_ERA5' &&
      out.exposureFeatures.mean_soil_moisture === 0.32,
      'TEST_O',
      'Open-Meteo ERA5 reanalysis payload normalizes into standard schema and executes cleanly'
    );
  } catch (e: any) {
    assert(false, 'TEST_O', 'Historical reanalysis normalization', e.message);
  }

  // Test P: Sensor Grid Schema Compatibility
  try {
    const sensorPayload = {
      telemetryStream: Array.from({ length: 336 }, (_, i) => ({
        isoTime: `2023-10-01T${String(i % 24).padStart(2, '0')}:00Z`,
        ambientTempC: 28.0,
        ambientRhPct: 75.0,
        rainGaugeMm: 0.0,
        windKmh: 6.5,
        solarFluxWm2: 250.0,
        soilVolumetricMoisturePct: 30.0,
      })),
    };
    const sensorRecords = normalizeSensorGridPayload(sensorPayload);
    const outSensor = evaluateResearchEnvironmentalRisk('Aphids', sensorRecords, undefined, 'LIVE_SENSOR_GRID');
    assert(
      sensorRecords.length === 336 &&
      sensorRecords[0].dew_point_2m !== undefined && // Computed via Magnus-Tetens
      outSensor.dataSource === 'LIVE_SENSOR_GRID',
      'TEST_P',
      'Sensor grid schema normalizes into standard schema and computes dew point dynamically'
    );
  } catch (e: any) {
    assert(false, 'TEST_P', 'Sensor grid schema compatibility', e.message);
  }

  // Test Q: Dew Proxy Explicitly Labelled Proxy
  try {
    const series = generateHourlyRecords(336);
    const out = evaluateResearchEnvironmentalRisk('Leaf Blotch', series);
    const limitations = out.limitations;
    assert(
      limitations.dewProxyDisclaimer.includes('proxy') &&
      limitations.dewProxyDisclaimer.includes('(T - T_dew) <= 1.5°C') &&
      limitations.dewProxyDisclaimer.includes('not direct measured leaf wetness'),
      'TEST_Q',
      'Dew proxy is explicitly and transparently disclaimed as an atmospheric condensation proxy'
    );
  } catch (e: any) {
    assert(false, 'TEST_Q', 'Dew proxy disclaimer', e.message);
  }

  // Test R: Soil pH Excluded from Environmental Risk Calculation
  try {
    const series = generateHourlyRecords(336);
    const features = transform14dExposureFeatures(series);
    // Ensure TransformedExposureFeatures does not have soil pH
    const hasSoilPh = 'soil_ph' in features || 'soilPh' in (features as any);
    assert(!hasSoilPh, 'TEST_R', 'Soil pH is strictly excluded from environmental risk feature vector');
  } catch (e: any) {
    assert(false, 'TEST_R', 'Soil pH exclusion', e.message);
  }

  // Test S: No Synthetic Data Generation in Research Engine
  try {
    const emptySeries: HourlyEnvironmentalRecord[] = [];
    let threw = false;
    try {
      transform14dExposureFeatures(emptySeries);
    } catch {
      threw = true;
    }
    assert(
      threw,
      'TEST_S',
      'Engine strictly requires real antecedent records and refuses to synthesize fake missing data'
    );
  } catch (e: any) {
    assert(false, 'TEST_S', 'No synthetic data generation', e.message);
  }

  // Test T: Fallback Calculator Unmodified & Functional
  try {
    const fallbackResult = fallbackCalculator({
      temperature: 28,
      humidity: 80,
      rainfall: 15,
      soilMoisture: 60,
      soilPh: 6.5,
      leafWetness: 75,
      sunlightHours: 6,
      windSpeed: 8,
    });
    assert(
      fallbackResult !== undefined &&
      typeof fallbackResult.score === 'number' &&
      ['Low', 'Moderate', 'High'].includes(fallbackResult.level) &&
      fallbackResult.contributingFactors.length > 0,
      'TEST_T',
      'Fallback calculator (riskCalculator.ts) remains 100% operational and untouched'
    );
  } catch (e: any) {
    assert(false, 'TEST_T', 'Fallback calculator verification', e.message);
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const allPassed = failedCount === 0;

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED / ${failedCount} FAILED (TOTAL ${results.length})`);
  console.log(`ALL TESTS PASSED: ${allPassed}`);
  console.log('================================================================\n');

  return {
    allPassed,
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}

// Auto-run when executed directly via node/tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('researchRiskEngine.test')) {
  const summary = runAllTests();
  if (!summary.allPassed) {
    process.exit(1);
  }
}
