export type ChatSender = 'user' | 'bot';

export interface ChatStarter {
  id: string;
  label: string;
  query: string;
  icon?: string;
}

export interface ChatAppContext {
  hasAnalyzedImage: boolean;
  imageResult?: {
    disease: string;
    confidence: number;
    oodStatus?: string;
    status?: string;
    modelMode?: string;
    verifierStatus?: string;
  };
  envParameters?: {
    temperature: number;
    humidity: number;
    rainfall: number;
    soilMoisture: number;
    soilPh: number;
    leafWetness: number;
    windSpeed: number;
    sunlightHours: number;
  };
  envRiskResult?: {
    overallRiskScore: number;
    riskLevel: string;
    dominantRiskFactor?: string;
  };
  selectedLocation?: {
    name: string;
    district: string;
  };
  historyCount: number;
  sensorConnected?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  timestamp: string;
  language: 'en' | 'ta';
  category?: 'basic' | 'crop' | 'disease' | 'environment' | 'context' | 'app' | 'research' | 'hardware' | 'general';
  suggestedFollowUps?: string[];
}

export interface ChatHistoryPayloadItem {
  sender: 'user' | 'bot';
  text: string;
}

export interface ChatRequestPayload {
  message: string;
  conversation_history: ChatHistoryPayloadItem[];
  language: 'en' | 'ta';
  app_context?: {
    has_analyzed_image: boolean;
    image_result?: {
      disease: string;
      confidence: number;
      ood_status?: string;
      status?: string;
      model_mode?: string;
      verifier_status?: string;
    };
    env_parameters?: {
      temperature: number;
      humidity: number;
      rainfall: number;
      soilMoisture: number;
      soilPh: number;
      leafWetness: number;
      windSpeed: number;
      sunlightHours: number;
    };
    env_risk_result?: {
      overall_risk_score: number;
      risk_level: string;
      dominant_risk_factor?: string;
    };
    selected_location?: {
      name: string;
      district: string;
    };
    history_count: number;
    sensor_connected?: boolean;
  };
}

export interface ChatApiResponse {
  reply: string;
  category: string;
  suggested_follow_ups: string[];
}
