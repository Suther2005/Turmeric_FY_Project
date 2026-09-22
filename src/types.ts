export type DiseaseType = 'Blotch' | 'Leaf Spot' | 'Aphids' | 'Healthy' | 'Non-Turmeric / Out-of-Domain';

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface ProbabilityDistribution {
  Blotch: number;
  LeafSpot: number;
  Aphids: number;
  Healthy: number;
  'Leaf Spot'?: number;
}

export interface ImageAnalysisResult {
  disease: DiseaseType;
  confidence: number;
  status: 'Disease Detected' | 'Healthy Crop' | 'Unsupported Specimen';
  probabilities: ProbabilityDistribution;
  extractedFeatures: {
    lesionDensity: string;
    chlorosisSeverity: string;
    colorVariance: string;
    textureDistortion: string;
  };
  modelMode?: 'REAL_MODEL' | 'DEMO_MODE';
  modelArchitecture?: string;
  oodStatus?: 'IN_DOMAIN' | 'OOD_REJECTED';
  oodMessage?: string;
  mahalanobisDistance?: number;
  oodThreshold?: number;
  oodMethod?: string;
  individualPredictions?: {
    efficientnet_b0?: {
      disease: string;
      confidence: number;
      probabilities: Record<string, number>;
    };
    mobilenet_v2?: {
      disease: string;
      confidence: number;
      probabilities: Record<string, number>;
    };
  };
}

export interface EnvironmentalParameters {
  temperature: number; // °C (range 15-45)
  humidity: number; // % (range 20-100)
  rainfall: number; // mm (range 0-50)
  soilMoisture: number; // % (range 10-100)
  soilPh: number; // pH (range 4.5-8.5)
  leafWetness: number; // % (range 0-100)
  sunlightHours: number; // hrs (range 0-14)
  windSpeed: number; // km/h (range 0-40)
}

export interface SensorStatus {
  isConnected: boolean;
  lastUpdated?: string;
  batteryLevel?: number;
}

export interface SeasonalContext {
  name: string;
  tamilName: string;
  phase: string;
  note: string;
}

export interface EnvironmentalRiskResult {
  score: number; // 0-100 %
  level: RiskLevel;
  contributingFactors: string[];
  favorableForFungal: boolean;
  favorableForPest: boolean;
  parameterStatus: {
    temperature: 'Low' | 'Optimal' | 'High';
    humidity: 'Low' | 'Moderate' | 'High';
    rainfall: 'Low' | 'Moderate' | 'High';
    soilMoisture: 'Dry' | 'Adequate' | 'Saturated';
    soilPh: 'Acidic' | 'Optimal' | 'Alkaline';
    leafWetness: 'Low' | 'Moderate' | 'High';
    sunlightHours: 'Deficient' | 'Sufficient' | 'Excessive';
    windSpeed: 'Calm' | 'Moderate' | 'High';
  };
}

export interface MultimodalFusionResult {
  disease: DiseaseType;
  imageConfidence: number;
  environmentalRisk: number;
  overallRisk: number;
  riskLevel: RiskLevel;
  whyThisRisk: string[];
  recommendation: string;
  modalityWeights: {
    visualWeight: number;
    environmentalWeight: number;
  };
  fusionSynergyNote: string;
}

export interface LocationOption {
  id: string;
  name: string;
  tamilName: string;
  district: string;
  latitude: number;
  longitude: number;
  description: string;
  state: string;
  isCurrentLocation?: boolean;
  accuracy?: number;
}

export interface PredictionHistoryRecord {
  id: string;
  date: string;
  time?: string;
  timestamp?: string;
  imageName: string;
  imageUrl: string;
  disease: DiseaseType;
  confidence: number;
  probabilities?: {
    Blotch?: number;
    LeafSpot?: number;
    'Leaf Spot'?: number;
    Aphids?: number;
    Healthy?: number;
    [key: string]: number | undefined;
  };
  environmentalRisk: number;
  overallRisk: number;
  status: 'High' | 'Moderate' | 'Low' | 'Moderate-High';
  notes?: string;
  recommendation?: string;
  parameters: EnvironmentalParameters;
  dataSource?: 'manual' | 'sensor' | 'reanalysis' | 'live_weather';
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface ModelMetric {
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latencyMs: number;
  parametersM: number;
  description: string;
  strengths: string[];
}

export interface AgronomicRecommendation {
  id: string;
  category: 'HIGH HUMIDITY' | 'HIGH LEAF WETNESS' | 'RECENT RAINFALL' | 'DISEASE DETECTED' | 'PREVENTATIVE CARE';
  riskLevel: RiskLevel;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  actionSteps: string[];
  timing: string;
  icon: string;
}

export type PageId =
  | 'landing'
  | 'dashboard'
  | 'disease-detection'
  | 'environmental-risk'
  | 'field-conditions'
  | 'multimodal-analysis'
  | 'history'
  | 'model-comparison'
  | 'analytics'
  | 'recommendations';

