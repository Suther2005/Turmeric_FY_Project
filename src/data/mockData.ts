import {
  AgronomicRecommendation,
  DiseaseType,
  EnvironmentalParameters,
  ModelMetric,
  PredictionHistoryRecord,
} from '../types';

export interface DemoSampleItem {
  id: string;
  name: string;
  disease: DiseaseType;
  imageUrl: string;
  description: string;
  sampleType: 'Blotch Leaf' | 'Leaf Spot' | 'Aphid Infestation' | 'Healthy Leaf';
  defaultParams: EnvironmentalParameters;
}

export const DEMO_SAMPLES: DemoSampleItem[] = [
  {
    id: 'demo-blotch-01',
    name: 'Blotch Disease (Taphrina maculans)',
    disease: 'Blotch',
    imageUrl: '/samples/blotch_sample.jpg',
    description: 'Characteristic brown-yellow necrotic patches with diffuse chlorotic margins along leaf veins.',
    sampleType: 'Blotch Leaf',
    defaultParams: {
      temperature: 29.4,
      humidity: 78,
      rainfall: 12.5,
      soilMoisture: 64,
      soilPh: 6.3,
      leafWetness: 72,
      sunlightHours: 5.8,
      windSpeed: 8.2,
    },
  },
  {
    id: 'demo-leafspot-02',
    name: 'Leaf Spot (Colletotrichum capsici)',
    disease: 'Leaf Spot',
    imageUrl: '/samples/leaf_spot_sample.jpg',
    description: 'Circular to oblong dark brown lesions with defined concentric rings and yellow halos.',
    sampleType: 'Leaf Spot',
    defaultParams: {
      temperature: 28.2,
      humidity: 74,
      rainfall: 8.0,
      soilMoisture: 60,
      soilPh: 6.5,
      leafWetness: 65,
      sunlightHours: 6.2,
      windSpeed: 10.5,
    },
  },
  {
    id: 'demo-aphids-03',
    name: 'Aphid Colony Damage',
    disease: 'Aphids',
    imageUrl: '/samples/aphids_sample.jpg',
    description: 'Pest clusters causing leaf curling, sap depletion, and early sooty mold secretion.',
    sampleType: 'Aphid Infestation',
    defaultParams: {
      temperature: 31.0,
      humidity: 58,
      rainfall: 1.2,
      soilMoisture: 48,
      soilPh: 6.4,
      leafWetness: 42,
      sunlightHours: 8.5,
      windSpeed: 14.0,
    },
  },
  {
    id: 'demo-healthy-04',
    name: 'Healthy Turmeric Foliage',
    disease: 'Healthy',
    imageUrl: '/samples/healthy_sample.jpg',
    description: 'Vibrant green, structurally intact leaf blade with uniform chlorophyll and zero lesioning.',
    sampleType: 'Healthy Leaf',
    defaultParams: {
      temperature: 26.5,
      humidity: 52,
      rainfall: 0.0,
      soilMoisture: 52,
      soilPh: 6.6,
      leafWetness: 28,
      sunlightHours: 7.8,
      windSpeed: 11.2,
    },
  },
];

export const INITIAL_PREDICTION_HISTORY: PredictionHistoryRecord[] = [];


export const MODEL_METRICS: ModelMetric[] = [
  {
    name: 'EfficientNet-B0',
    type: 'Convolutional Feature Extractor',
    accuracy: 94.2,
    precision: 93.9,
    recall: 93.5,
    f1Score: 93.7,
    latencyMs: 38,
    parametersM: 5.3,
    description: 'Strong feature extraction & high representational capability using compound coefficient scaling.',
    strengths: [
      'High gradient resolution for subtle necrotic lesion edges',
      'Strong spatial context across varying leaf angles',
      'Proven backbone for plant pathology classification',
    ],
  },
  {
    name: 'MobileNetV2',
    type: 'Inverted Residual Architecture',
    accuracy: 91.7,
    precision: 91.4,
    recall: 91.0,
    f1Score: 91.2,
    latencyMs: 16,
    parametersM: 3.4,
    description: 'Lightweight architecture optimized for low-latency edge deployment and rapid field inference.',
    strengths: [
      'Extremely low inference latency for field mobile devices',
      'Minimal memory footprint (14MB quantized)',
      'Depthwise separable convolutions for efficient edge computation',
    ],
  },
  {
    name: 'Hybrid Ensemble',
    type: 'Proposed Multimodal Decision Network',
    accuracy: 95.1,
    precision: 94.8,
    recall: 94.5,
    f1Score: 94.7,
    latencyMs: 44,
    parametersM: 8.7,
    description: 'Combined prediction probabilities & multimodal contextual weighting for enhanced field robustness.',
    strengths: [
      'Mitigates single-model bias on overlapping lesion symptoms',
      'Highest overall F1-score across all 4 turmeric disease classes',
      'Directly feeds calibrated probability vector to multimodal fusion layer',
    ],
  },
];

export const AGRONOMIC_RECOMMENDATIONS: AgronomicRecommendation[] = [
  {
    id: 'rec-1',
    category: 'HIGH HUMIDITY',
    riskLevel: 'High',
    priority: 'High',
    title: 'Relative Humidity Exceeds 75%',
    description: 'Monitor crop conditions closely and improve airflow around plants where appropriate.',
    actionSteps: [
      'Increase row aeration by trimming dead lower canopy foliage',
      'Avoid flood irrigation during late afternoons or overcast days',
      'Schedule preventive bio-control spray if relative humidity remains elevated for >48 hours',
    ],
    timing: 'Immediate (Within 24 hours)',
    icon: 'Droplets',
  },
  {
    id: 'rec-2',
    category: 'HIGH LEAF WETNESS',
    riskLevel: 'High',
    priority: 'High',
    title: 'Persistent Leaf Wetness > 70%',
    description: 'Persistent leaf wetness may increase disease risk. Inspect affected leaves regularly.',
    actionSteps: [
      'Switch strictly to morning drip or furrow irrigation so sun dries canopy by midday',
      'Inspect undersides of central leaves for early fungal mycelium',
      'Maintain adequate spacing between turmeric mounds (minimum 30–45 cm)',
    ],
    timing: 'Immediate',
    icon: 'CloudRain',
  },
  {
    id: 'rec-3',
    category: 'RECENT RAINFALL',
    riskLevel: 'Moderate',
    priority: 'Medium',
    title: 'Post-Rainfall Disease Scouting',
    description: 'Monitor plants after rainfall for emerging symptoms.',
    actionSteps: [
      'Check field drainage channels to prevent waterlogging around turmeric rhizomes',
      'Survey 20 representative plants across edge and center plots for leaf spot halos',
      'Apply potassium silicate or organic compost tea to fortify leaf epidermis',
    ],
    timing: 'Within 48 hours post-rain',
    icon: 'CloudLightning',
  },
  {
    id: 'rec-4',
    category: 'DISEASE DETECTED',
    riskLevel: 'High',
    priority: 'High',
    title: 'Visual Disease Symptoms Confirmed',
    description: 'Inspect nearby plants and follow appropriate disease-management practices.',
    actionSteps: [
      'Quarantine or cleanly excise severely infected leaves and dispose off-site',
      'Apply copper oxychloride (0.25%) or Mancozeb formulation according to agricultural extension guidelines',
      'Record GPS coordinates of hotspot for targeted follow-up analysis in 5 days',
    ],
    timing: 'Urgent (Same day)',
    icon: 'ShieldAlert',
  },
  {
    id: 'rec-5',
    category: 'PREVENTATIVE CARE',
    riskLevel: 'Low',
    priority: 'Low',
    title: 'Nutrient & Soil Maintenance',
    description: 'Maintain healthy rhizome soil biology and balanced nitrogen-potassium ratios.',
    actionSteps: [
      'Apply neem cake at 250 kg/ha to deter soil-borne nematodes and pathogens',
      'Maintain soil pH between 6.0 and 6.8 for optimal micronutrient uptake',
      'Keep companion plantings of marigold to suppress insect vector reservoirs',
    ],
    timing: 'Routine Bi-weekly',
    icon: 'Sprout',
  },
];

export const ANALYTICS_DATA = {
  diseaseDistribution: [
    { name: 'Blotch', count: 42, percentage: 32.8, color: '#ef4444' },
    { name: 'Leaf Spot', count: 24, percentage: 18.8, color: '#f59e0b' },
    { name: 'Aphids', count: 8, percentage: 6.2, color: '#8b5cf6' },
    { name: 'Healthy', count: 54, percentage: 42.2, color: '#10b981' },
  ],
  riskDistribution: [
    { level: 'Low Risk (<35%)', count: 58, percentage: 45.3, color: '#10b981' },
    { level: 'Moderate Risk (35-67%)', count: 49, percentage: 38.3, color: '#f59e0b' },
    { level: 'High Risk (≥68%)', count: 21, percentage: 16.4, color: '#ef4444' },
  ],
  environmentalTrends: [
    { day: 'Mon', temp: 28.2, humidity: 62, risk: 44 },
    { day: 'Tue', temp: 29.0, humidity: 68, risk: 52 },
    { day: 'Wed', temp: 31.4, humidity: 74, risk: 65 },
    { day: 'Thu', temp: 27.8, humidity: 84, risk: 79 },
    { day: 'Fri', temp: 28.9, humidity: 80, risk: 75 },
    { day: 'Sat', temp: 29.4, humidity: 78, risk: 71 },
    { day: 'Sun', temp: 26.5, humidity: 58, risk: 38 },
  ],
  confidenceByClass: [
    { disease: 'Blotch', avgConfidence: 94.6, samples: 42 },
    { disease: 'Leaf Spot', avgConfidence: 91.4, samples: 24 },
    { disease: 'Aphids', avgConfidence: 93.8, samples: 8 },
    { disease: 'Healthy', avgConfidence: 97.2, samples: 54 },
  ],
};
