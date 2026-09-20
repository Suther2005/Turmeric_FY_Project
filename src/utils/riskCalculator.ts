import {
  DiseaseType,
  EnvironmentalParameters,
  EnvironmentalRiskResult,
  ImageAnalysisResult,
  MultimodalFusionResult,
  RiskLevel,
} from '../types';

export const calculateEnvironmentalRisk = (
  params: EnvironmentalParameters
): EnvironmentalRiskResult => {
  let score = 20;
  const factors: string[] = [];

  // Humidity impact
  let humidityStatus: 'Low' | 'Moderate' | 'High' = 'Moderate';
  if (params.humidity >= 75) {
    score += 28 * ((params.humidity - 70) / 30);
    factors.push(`High relative humidity (${params.humidity}%) creating favorable fungal microclimate`);
    humidityStatus = 'High';
  } else if (params.humidity >= 60) {
    score += 10;
    humidityStatus = 'Moderate';
  } else {
    humidityStatus = 'Low';
  }

  // Leaf Wetness impact
  let leafWetnessStatus: 'Low' | 'Moderate' | 'High' = 'Moderate';
  if (params.leafWetness >= 70) {
    score += 25 * ((params.leafWetness - 60) / 40);
    factors.push(`Extended leaf wetness (${params.leafWetness}%) promoting spore germination`);
    leafWetnessStatus = 'High';
  } else if (params.leafWetness >= 50) {
    score += 10;
    leafWetnessStatus = 'Moderate';
  } else {
    leafWetnessStatus = 'Low';
  }

  // Rainfall impact
  let rainfallStatus: 'Low' | 'Moderate' | 'High' = 'Moderate';
  if (params.rainfall >= 10) {
    score += 15 * Math.min(1, params.rainfall / 25);
    factors.push(`Recent precipitation (${params.rainfall} mm) increasing canopy moisture`);
    rainfallStatus = 'High';
  } else if (params.rainfall > 2) {
    score += 6;
    rainfallStatus = 'Moderate';
  } else {
    rainfallStatus = 'Low';
  }

  // Temperature impact
  let tempStatus: 'Low' | 'Optimal' | 'High' = 'Optimal';
  if (params.temperature >= 26 && params.temperature <= 33) {
    score += 12;
    factors.push(`Warm ambient temperature (${params.temperature}°C) in optimal fungal incubation range`);
    tempStatus = 'Optimal';
  } else if (params.temperature < 20) {
    score -= 8;
    tempStatus = 'Low';
  } else {
    score -= 4;
    tempStatus = 'High';
  }

  // Soil Moisture
  let soilMoistureStatus: 'Dry' | 'Adequate' | 'Saturated' = 'Adequate';
  if (params.soilMoisture > 75) {
    score += 8;
    factors.push(`Elevated soil moisture (${params.soilMoisture}%)`);
    soilMoistureStatus = 'Saturated';
  } else if (params.soilMoisture < 35) {
    soilMoistureStatus = 'Dry';
  }

  // Soil pH
  let soilPhStatus: 'Acidic' | 'Optimal' | 'Alkaline' = 'Optimal';
  if (params.soilPh < 5.5) {
    soilPhStatus = 'Acidic';
    score += 4;
  } else if (params.soilPh > 7.5) {
    soilPhStatus = 'Alkaline';
    score += 3;
  }

  // Sunlight and Wind
  let sunlightStatus: 'Deficient' | 'Sufficient' | 'Excessive' = 'Sufficient';
  if (params.sunlightHours < 4.5) {
    score += 6;
    factors.push(`Low sunlight exposure (${params.sunlightHours} hrs) prolonging moisture retention`);
    sunlightStatus = 'Deficient';
  }

  let windStatus: 'Calm' | 'Moderate' | 'High' = 'Moderate';
  if (params.windSpeed < 5) {
    score += 4;
    factors.push(`Stagnant airflow (${params.windSpeed} km/h)`);
    windStatus = 'Calm';
  } else if (params.windSpeed > 20) {
    windStatus = 'High';
  }

  const finalScore = Math.max(8, Math.min(96, Math.round(score)));

  let level: RiskLevel = 'Moderate';
  if (finalScore >= 68) {
    level = 'High';
  } else if (finalScore <= 35) {
    level = 'Low';
  }

  if (factors.length === 0) {
    factors.push('Environmental parameters within standard protective thresholds');
  }

  return {
    score: finalScore,
    level,
    contributingFactors: factors.slice(0, 4),
    favorableForFungal: params.humidity >= 65 && params.leafWetness >= 60,
    favorableForPest: params.temperature >= 28 && params.humidity < 60,
    parameterStatus: {
      temperature: tempStatus,
      humidity: humidityStatus,
      rainfall: rainfallStatus,
      soilMoisture: soilMoistureStatus,
      soilPh: soilPhStatus,
      leafWetness: leafWetnessStatus,
      sunlightHours: sunlightStatus,
      windSpeed: windStatus,
    },
  };
};

export const calculateImagePrediction = (disease: DiseaseType): ImageAnalysisResult => {
  switch (disease) {
    case 'Blotch':
      return {
        disease: 'Blotch',
        confidence: 94.6,
        status: 'Disease Detected',
        probabilities: {
          Blotch: 94.6,
          LeafSpot: 2.7,
          Aphids: 1.8,
          Healthy: 0.9,
        },
        extractedFeatures: {
          lesionDensity: 'High (Necrotic irregular patches)',
          chlorosisSeverity: 'Moderate perimeter yellowing',
          colorVariance: 'High brown-yellow gradient',
          textureDistortion: 'Severe foliar degradation',
        },
      };

    case 'Leaf Spot':
      return {
        disease: 'Leaf Spot',
        confidence: 91.4,
        status: 'Disease Detected',
        probabilities: {
          Blotch: 4.8,
          LeafSpot: 91.4,
          Aphids: 2.3,
          Healthy: 1.5,
        },
        extractedFeatures: {
          lesionDensity: 'Concentric circular spots',
          chlorosisSeverity: 'Isolated halo rings',
          colorVariance: 'Dark center with yellow margin',
          textureDistortion: 'Localized tissue necrosis',
        },
      };

    case 'Aphids':
      return {
        disease: 'Aphids',
        confidence: 93.8,
        status: 'Disease Detected',
        probabilities: {
          Blotch: 2.1,
          LeafSpot: 2.9,
          Aphids: 93.8,
          Healthy: 1.2,
        },
        extractedFeatures: {
          lesionDensity: 'Pest clustering under vein ridges',
          chlorosisSeverity: 'Foliar curling and honeydew spots',
          colorVariance: 'Speckled light-green patches',
          textureDistortion: 'Leaf curl and curling distortion',
        },
      };

    case 'Healthy':
    default:
      return {
        disease: 'Healthy',
        confidence: 97.2,
        status: 'Healthy Crop',
        probabilities: {
          Blotch: 0.8,
          LeafSpot: 1.1,
          Aphids: 0.9,
          Healthy: 97.2,
        },
        extractedFeatures: {
          lesionDensity: 'None detected',
          chlorosisSeverity: 'Uniform rich chlorophyll',
          colorVariance: 'Consistent deep green',
          textureDistortion: 'Smooth intact lamina',
        },
      };
  }
};

export const calculateMultimodalFusion = (
  imageResult: ImageAnalysisResult,
  envResult: EnvironmentalRiskResult
): MultimodalFusionResult => {
  const isDisease = imageResult.disease !== 'Healthy';
  const visualWeight = 0.58;
  const envWeight = 0.42;

  let overallRisk: number;
  const whyReasons: string[] = [];

  if (isDisease) {
    whyReasons.push(`Disease symptoms detected from visual evidence (${imageResult.disease}, ${imageResult.confidence}% confidence)`);

    overallRisk = Math.round(
      imageResult.confidence * 0.45 + envResult.score * 0.55
    );

    if (envResult.score >= 65) {
      overallRisk = Math.min(96, Math.max(78, overallRisk));
    }
  } else {
    whyReasons.push(`No visual pathogen lesions detected (Healthy foliage, ${imageResult.confidence}% confidence)`);

    if (envResult.score >= 70) {
      overallRisk = Math.round(envResult.score * 0.42);
      whyReasons.push(`Elevated environmental vulnerability despite clear foliage`);
    } else {
      overallRisk = Math.round((100 - imageResult.confidence) * 0.5 + envResult.score * 0.2);
    }
  }

  envResult.contributingFactors.forEach((factor) => {
    whyReasons.push(factor);
  });

  let riskLevel: RiskLevel = 'Moderate';
  if (overallRisk >= 68) {
    riskLevel = 'High';
  } else if (overallRisk <= 35) {
    riskLevel = 'Low';
  }

  let recommendation = '';
  if (isDisease && riskLevel === 'High') {
    recommendation =
      'Environmental conditions indicate elevated disease risk. Continue monitoring affected plants and follow appropriate crop disease-management practices.';
  } else if (isDisease) {
    recommendation =
      'Visual disease detected under moderate environmental stress. Apply localized organic bio-fungicide or neem formulations and inspect perimeter rows.';
  } else if (!isDisease && riskLevel === 'High') {
    recommendation =
      'Crop is currently asymptomatic, but microclimate conditions present a high disease incubation threat. Ensure adequate drainage and avoid evening sprinkler irrigation.';
  } else {
    recommendation =
      'Optimal crop health indicators observed. Maintain standard soil moisture routines and periodic weekly visual scouting.';
  }

  return {
    disease: imageResult.disease,
    imageConfidence: imageResult.confidence,
    environmentalRisk: envResult.score,
    overallRisk,
    riskLevel,
    whyThisRisk: whyReasons.slice(0, 4),
    recommendation,
    modalityWeights: {
      visualWeight,
      environmentalWeight: envWeight,
    },
    fusionSynergyNote: isDisease
      ? `Visual pathogen confirmation reinforced by ${envResult.level.toLowerCase()} environmental pressure.`
      : `Healthy visual baseline dampens overall risk despite environmental exposure.`,
  };
};
