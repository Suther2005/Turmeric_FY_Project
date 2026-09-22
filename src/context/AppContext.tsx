import React, { createContext, useContext, useState } from 'react';
import {
  EnvironmentalParameters,
  EnvironmentalRiskResult,
  ImageAnalysisResult,
  LocationOption,
  MultimodalFusionResult,
  PageId,
  PredictionHistoryRecord,
  SensorStatus,
  SeasonalContext,
} from '../types';
import {
  DEMO_SAMPLES,
  DemoSampleItem,
  INITIAL_PREDICTION_HISTORY,
} from '../data/mockData';
import {
  calculateEnvironmentalRisk,
  calculateImagePrediction,
  calculateMultimodalFusion,
} from '../utils/riskCalculator';
import {
  evaluateResearchEnvironmentalRisk,
  HISTORICAL_REANALYSIS_PRESETS,
  HourlyEnvironmentalRecord,
  ResearchDiseaseType,
  ResearchRiskOutput,
} from '../utils/researchRiskEngine';
import {
  fetchLiveWeather14Day,
  formatLocationDisplay,
  reverseGeocodeCoordinates,
  TAMIL_NADU_LOCATIONS,
} from '../services/weatherService';
import { Language } from '../utils/translations';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  selectedSample: DemoSampleItem;
  setSelectedSample: (sample: DemoSampleItem) => void;
  customImagePreview: string | null;
  setCustomImagePreview: (url: string | null) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  analysisError: string | null;
  setAnalysisError: (err: string | null) => void;
  imageResult: ImageAnalysisResult;
  isImageAnalyzing: boolean;
  hasAnalyzedImage: boolean;
  setHasAnalyzedImage: (analyzed: boolean) => void;
  isResearchSample: boolean;
  setIsResearchSample: (sample: boolean) => void;
  clearSelectedImage: () => void;
  runImageAnalysis: () => Promise<void>;
  envParameters: EnvironmentalParameters;
  updateEnvParameter: (key: keyof EnvironmentalParameters, value: number) => void;
  resetEnvParameters: () => void;
  analyzeManualFieldConditions: (params: EnvironmentalParameters) => EnvironmentalRiskResult;
  envDataSource: 'manual' | 'sensor' | 'reanalysis' | 'live_weather';
  setEnvDataSource: (source: 'manual' | 'sensor' | 'reanalysis' | 'live_weather') => void;
  sensorStatus: SensorStatus;
  currentSeason: SeasonalContext;
  envRiskResult: EnvironmentalRiskResult;
  isEnvAnalyzing: boolean;
  runEnvAnalysis: () => void;
  multimodalResult: MultimodalFusionResult;
  isFusionAnalyzing: boolean;
  runMultimodalFusion: () => void;
  predictionHistory: PredictionHistoryRecord[];
  saveCurrentAnalysisToHistory: () => void;
  deletePredictionRecord: (id: string) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  activeReportRecord: PredictionHistoryRecord | null;
  openDetailedReport: (record?: PredictionHistoryRecord) => void;
  // Stage 5D Research Risk Engine Accessors
  selectedResearchDisease: ResearchDiseaseType;
  setSelectedResearchDisease: (disease: ResearchDiseaseType) => void;
  cropDap: number;
  setCropDap: (dap: number) => void;
  activePresetMode: string;
  setActivePresetMode: (mode: string) => void;
  applyHistoricalPreset: (presetKey: string) => void;
  researchRiskResult: ResearchRiskOutput | null;
  // Step 2 Live Weather API Accessors
  selectedLocation: LocationOption;
  setSelectedLocation: (location: LocationOption) => void;
  plantingDate: string | null;
  setPlantingDate: (date: string | null) => void;
  isWeatherLoading: boolean;
  weatherError: string | null;
  liveHourlyRecords: HourlyEnvironmentalRecord[] | null;
  fetchLiveWeatherData: (targetLoc?: LocationOption) => Promise<void>;
  // Geolocation Accessors
  isLocating: boolean;
  locationStatus: 'idle' | 'detecting' | 'success' | 'unavailable' | 'error';
  locationErrorMessage: string | null;
  detectCurrentLocation: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [selectedSample, setSelectedSampleState] = useState<DemoSampleItem>(DEMO_SAMPLES[0]);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [hasAnalyzedImage, setHasAnalyzedImage] = useState<boolean>(false);
  const [isResearchSample, setIsResearchSample] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Environmental Source & Hardware Readiness (No fake live simulation)
  const [envDataSource, setEnvDataSource] = useState<'manual' | 'sensor' | 'reanalysis' | 'live_weather'>('manual');
  const [sensorStatus] = useState<SensorStatus>({
    isConnected: false, // Default false until real hardware sends data
  });

  // Step 2 Live Weather API State
  const [selectedLocation, setSelectedLocationState] = useState<LocationOption>(() => {
    try {
      const saved = localStorage.getItem('curuma_selected_location');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved location', e);
    }
    return TAMIL_NADU_LOCATIONS[0];
  });
  const [plantingDate, setPlantingDateState] = useState<string | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [liveHourlyRecords, setLiveHourlyRecords] = useState<HourlyEnvironmentalRecord[] | null>(null);

  // Geolocation State
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'unavailable' | 'error'>('idle');
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  const setSelectedLocation = (location: LocationOption) => {
    setSelectedLocationState(location);
    try {
      localStorage.setItem('curuma_selected_location', JSON.stringify(location));
    } catch (e) {
      console.warn('Failed to persist location', e);
    }
  };

  const handleSetPlantingDate = (date: string | null) => {
    setPlantingDateState(date);
    if (date) {
      const pTime = new Date(date).getTime();
      const nTime = new Date().getTime();
      if (!isNaN(pTime)) {
        const diffDays = Math.max(1, Math.floor((nTime - pTime) / (1000 * 60 * 60 * 24)));
        setCropDap(diffDays);
      }
    }
  };

  // Seasonal Intelligence Context (Contextual advisory layer for Tamil Nadu)
  const [currentSeason] = useState<SeasonalContext>({
    name: 'Northeast Monsoon (Oct – Dec)',
    tamilName: 'வடகிழக்கு பருவமழைக்காலம் (ஐப்பசி – மார்கழி)',
    phase: 'Rhizome Development & Vegetative Phase',
    note: 'Elevated canopy moisture and morning dew create favorable conditions for foliar fungal pathogens. Regularly inspect leaf undersides and ensure ridge drainage.',
  });

  // Research Risk Engine State (Stage 5D)
  const [selectedResearchDisease, setSelectedResearchDisease] = useState<ResearchDiseaseType>('Leaf Spot');
  const [cropDap, setCropDap] = useState<number>(135); // Default: Mid-season vegetative/rhizome transition
  const [activePresetMode, setActivePresetMode] = useState<string>('MANUAL_SLIDERS');

  // Environmental Parameters (Manual Sliders)
  const [envParameters, setEnvParameters] = useState<EnvironmentalParameters>(
    DEMO_SAMPLES[0].defaultParams
  );

  // Research Risk Result (Only populated when actual historical time series or live weather is loaded)
  const [researchRiskResult, setResearchRiskResult] = useState<ResearchRiskOutput | null>(null);

  // Legacy fallback / instantaneous current condition heuristic
  const [envRiskResult, setEnvRiskResult] = useState<EnvironmentalRiskResult>(() =>
    calculateEnvironmentalRisk(DEMO_SAMPLES[0].defaultParams)
  );
  const [isEnvAnalyzing, setIsEnvAnalyzing] = useState<boolean>(false);

  // Image Analysis - Initial state
  const [imageResult, setImageResult] = useState<ImageAnalysisResult>(() => ({
    ...calculateImagePrediction(DEMO_SAMPLES[0].disease),
    modelMode: 'REAL_MODEL',
    modelArchitecture: 'MobileNetV2 (Baseline Convolutional Engine)',
  }));
  const [isImageAnalyzing, setIsImageAnalyzing] = useState<boolean>(false);

  // Multimodal Fusion
  const [multimodalResult, setMultimodalResult] = useState<MultimodalFusionResult>(() =>
    calculateMultimodalFusion(
      calculateImagePrediction(DEMO_SAMPLES[0].disease),
      calculateEnvironmentalRisk(DEMO_SAMPLES[0].defaultParams)
    )
  );
  const [isFusionAnalyzing, setIsFusionAnalyzing] = useState<boolean>(false);

  // Helper to create an optimized persistent base64 data URL for offline/refresh persistence
  const createPersistentDataUrl = async (file: File | Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 400;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_DIM) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              resolve(result);
            }
          } catch {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // History & Toasts & Modals (Persisted in localStorage: curuma_history)
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('curuma_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved history from localStorage', e);
    }
    return [];
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [activeReportRecord, setActiveReportRecord] = useState<PredictionHistoryRecord | null>(null);

  // Toast Helpers
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Live Weather from Open-Meteo for selected location
  const fetchLiveWeatherData = async (targetLoc?: LocationOption) => {
    const loc = targetLoc || selectedLocation;
    setIsWeatherLoading(true);
    setWeatherError(null);
    setSelectedLocation(loc);

    try {
      const res = await fetchLiveWeather14Day(loc);
      setLiveHourlyRecords(res.records);
      setEnvDataSource('live_weather');
      setActivePresetMode('LIVE_WEATHER');

      // 1. Evaluate 14-day research risk pipeline with live data
      const result = evaluateResearchEnvironmentalRisk(
        selectedResearchDisease,
        res.records,
        { dap: cropDap },
        'LIVE_WEATHER_OPEN_METEO'
      );
      setResearchRiskResult(result);

      // 2. Update instantaneous parameters with latest reading (preserve manual-only leafWetness & soilPh)
      const cur = res.currentHourRecord;
      setEnvParameters((prev) => {
        const updated: EnvironmentalParameters = {
          ...prev,
          temperature: cur.temperature_2m,
          humidity: cur.relative_humidity_2m,
          rainfall: cur.precipitation,
          windSpeed: cur.wind_speed_10m !== undefined ? Math.round(cur.wind_speed_10m) : prev.windSpeed,
          sunlightHours:
            cur.shortwave_radiation !== undefined
              ? Math.min(14, Math.max(0, parseFloat(((cur.shortwave_radiation / 350) * 12).toFixed(1))))
              : prev.sunlightHours,
          soilMoisture:
            cur.soil_moisture_0_to_7cm !== undefined
              ? Math.round(cur.soil_moisture_0_to_7cm * 100)
              : prev.soilMoisture,
        };
        const newEnvResult = calculateEnvironmentalRisk(updated);
        setEnvRiskResult(newEnvResult);
        setMultimodalResult(calculateMultimodalFusion(imageResult, newEnvResult));
        return updated;
      });

      addToast({
        type: 'success',
        title: language === 'ta' ? 'நேரலை வானிலை பெறப்பட்டது' : 'Live Weather Loaded',
        message: `${loc.name} (${loc.district}) • 14-day Open-Meteo series`,
      });
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      const errorMsg = err.message || 'Failed to fetch live weather data.';
      setWeatherError(errorMsg);
      setResearchRiskResult(null);
      setLiveHourlyRecords(null);
      addToast({
        type: 'error',
        title: language === 'ta' ? 'வானிலை தரவு பிழை' : 'Weather Fetch Error',
        message: errorMsg,
      });
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Automatic Current Location Detection via Browser Geolocation API
  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      const msg =
        language === 'ta'
          ? 'உங்கள் சாதனத்தில் அமைவிட சேவை கிடைக்கவில்லை'
          : 'Geolocation is not supported by your device or browser.';
      setLocationStatus('unavailable');
      setLocationErrorMessage(msg);
      addToast({
        type: 'warning',
        title: language === 'ta' ? 'அமைவிடம் கிடைக்கவில்லை' : 'Location Unavailable',
        message: msg,
      });
      return;
    }

    setIsLocating(true);
    setLocationStatus('detecting');
    setLocationErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const resolvedLocation = await reverseGeocodeCoordinates(latitude, longitude, accuracy);

          setSelectedLocation(resolvedLocation);
          setLocationStatus('success');
          setIsLocating(false);

          await fetchLiveWeatherData(resolvedLocation);

          addToast({
            type: 'success',
            title: language === 'ta' ? 'தற்போதைய அமைவிடம் கண்டறியப்பட்டது' : 'Current Location Detected',
            message: `${resolvedLocation.name}, ${resolvedLocation.district}`,
          });
        } catch (err: any) {
          setIsLocating(false);
          setLocationStatus('error');
          const msg =
            language === 'ta'
              ? 'அமைவிட முகவரியை பெற முடியவில்லை. கைமுறையாக தேர்வு செய்யவும்.'
              : 'Could not resolve location address. Please select manually.';
          setLocationErrorMessage(msg);
          addToast({
            type: 'error',
            title: language === 'ta' ? 'அமைவிடப் பிழை' : 'Location Error',
            message: msg,
          });
        }
      },
      (error) => {
        setIsLocating(false);
        let userMsg = '';
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('unavailable');
          userMsg =
            language === 'ta'
              ? 'அமைவிட அனுமதி மறுக்கப்பட்டது. மாவட்டத்தை கைமுறையாக தேர்ந்தெடுக்கவும்.'
              : 'Location permission was denied. Please select your district manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationStatus('unavailable');
          userMsg =
            language === 'ta'
              ? 'சாதன அமைவிடம் கிடைக்கவில்லை. கைமுறையாக தேர்ந்தெடுக்கவும்.'
              : 'Location position is unavailable on your device.';
        } else if (error.code === error.TIMEOUT) {
          setLocationStatus('unavailable');
          userMsg =
            language === 'ta'
              ? 'அமைவிட கோரிக்கை நேரம் முடிந்தது. மீண்டும் முயற்சிக்கவும்.'
              : 'Location request timed out. Please try again or select manually.';
        } else {
          setLocationStatus('unavailable');
          userMsg =
            language === 'ta'
              ? 'அமைவிடத்தை கண்டறிய முடியவில்லை. கைமுறையாக தேர்ந்தெடுக்கவும்.'
              : 'Failed to detect current location. Please select manually.';
        }

        setLocationErrorMessage(userMsg);
        addToast({
          type: 'warning',
          title: language === 'ta' ? 'அமைவிடம் கிடைக்கவில்லை' : 'Location Unavailable',
          message: userMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Switch demo/reference sample (Research mode)
  const setSelectedSample = (sample: DemoSampleItem) => {
    setSelectedSampleState(sample);
    setCustomImagePreview(sample.imageUrl);
    setUploadedFile(null);
    setIsResearchSample(true);
    setHasAnalyzedImage(false);
    setAnalysisError(null);
    setEnvParameters(sample.defaultParams);

    // Update research engine context
    const mappedDisease: ResearchDiseaseType =
      sample.disease === 'Aphids' ? 'Aphids' : sample.disease === 'Blotch' ? 'Leaf Blotch' : 'Leaf Spot';
    setSelectedResearchDisease(mappedDisease);

    addToast({
      type: 'info',
      title: language === 'ta' ? 'ஆராய்ச்சி குறிப்பு மாதிரி ஏற்றப்பட்டது' : 'Research Reference Specimen Loaded',
      message: `${sample.disease} (${sample.sampleType})`,
    });
  };

  const clearSelectedImage = () => {
    setCustomImagePreview(null);
    setUploadedFile(null);
    setIsResearchSample(false);
    setHasAnalyzedImage(false);
    setAnalysisError(null);
  };

  // Set disease for research risk engine
  const handleSetSelectedResearchDisease = (disease: ResearchDiseaseType) => {
    setSelectedResearchDisease(disease);
    if (activePresetMode === 'LIVE_WEATHER' && liveHourlyRecords) {
      const result = evaluateResearchEnvironmentalRisk(
        disease,
        liveHourlyRecords,
        { dap: cropDap },
        'LIVE_WEATHER_OPEN_METEO'
      );
      setResearchRiskResult(result);
    } else if (activePresetMode !== 'MANUAL_SLIDERS') {
      const preset = HISTORICAL_REANALYSIS_PRESETS[activePresetMode];
      if (preset) {
        const result = evaluateResearchEnvironmentalRisk(
          disease,
          preset.records,
          { dap: cropDap },
          'HISTORICAL_REANALYSIS_ERA5'
        );
        setResearchRiskResult(result);
      }
    }
  };

  // Set crop DAP for research risk engine
  const handleSetCropDap = (dap: number) => {
    setCropDap(dap);
    if (activePresetMode === 'LIVE_WEATHER' && liveHourlyRecords) {
      const result = evaluateResearchEnvironmentalRisk(
        selectedResearchDisease,
        liveHourlyRecords,
        { dap },
        'LIVE_WEATHER_OPEN_METEO'
      );
      setResearchRiskResult(result);
    } else if (activePresetMode !== 'MANUAL_SLIDERS') {
      const preset = HISTORICAL_REANALYSIS_PRESETS[activePresetMode];
      if (preset) {
        const result = evaluateResearchEnvironmentalRisk(
          selectedResearchDisease,
          preset.records,
          { dap },
          'HISTORICAL_REANALYSIS_ERA5'
        );
        setResearchRiskResult(result);
      }
    }
  };

  // Apply historical verified preset (Real ERA5-Land contiguous 336-hour data)
  const applyHistoricalPreset = (presetKey: string) => {
    if (presetKey === 'LIVE_WEATHER') {
      fetchLiveWeatherData(selectedLocation);
      return;
    }

    setActivePresetMode(presetKey);
    if (presetKey === 'MANUAL_SLIDERS') {
      setEnvDataSource('manual');
      setResearchRiskResult(null);
      return;
    }

    const preset = HISTORICAL_REANALYSIS_PRESETS[presetKey];
    if (preset) {
      setEnvDataSource('reanalysis');
      setSelectedResearchDisease(preset.diseaseContext);
      setCropDap(preset.dap);
      const result = evaluateResearchEnvironmentalRisk(
        preset.diseaseContext,
        preset.records,
        { dap: preset.dap },
        'HISTORICAL_REANALYSIS_ERA5'
      );
      setResearchRiskResult(result);
      addToast({
        type: 'info',
        title: language === 'ta' ? 'வரலாற்றுத் தரவு ஏற்றப்பட்டது' : 'Historical Reanalysis Loaded',
        message: `${preset.label}`,
      });
    }
  };

  // Parameter updates (Current Field Observations only — do NOT fabricate 336h data)
  const updateEnvParameter = (key: keyof EnvironmentalParameters, value: number) => {
    setActivePresetMode('MANUAL_SLIDERS');
    setEnvDataSource('manual');
    setResearchRiskResult(null);
    setEnvParameters((prev) => {
      const updated = { ...prev, [key]: value };
      const newEnvResult = calculateEnvironmentalRisk(updated);
      setEnvRiskResult(newEnvResult);
      setMultimodalResult(calculateMultimodalFusion(imageResult, newEnvResult));
      return updated;
    });
  };

  const resetEnvParameters = () => {
    setActivePresetMode('MANUAL_SLIDERS');
    setEnvDataSource('manual');
    setResearchRiskResult(null);
    setEnvParameters(selectedSample.defaultParams);
    const newEnvResult = calculateEnvironmentalRisk(selectedSample.defaultParams);
    setEnvRiskResult(newEnvResult);
    setMultimodalResult(calculateMultimodalFusion(imageResult, newEnvResult));
    addToast({
      type: 'info',
      title: language === 'ta' ? 'அளவீடுகள் மீட்டமைக்கப்பட்டது' : 'Parameters Reset',
      message: language === 'ta' ? 'நிலையான கள அளவீடுகள் மீட்டமைக்கப்பட்டது.' : 'Restored standard baseline field parameters.',
    });
  };

  // Analyze manual field conditions
  const analyzeManualFieldConditions = (params: EnvironmentalParameters): EnvironmentalRiskResult => {
    setActivePresetMode('MANUAL_SLIDERS');
    setEnvDataSource('manual');
    setResearchRiskResult(null);
    setEnvParameters(params);
    const newEnvResult = calculateEnvironmentalRisk(params);
    setEnvRiskResult(newEnvResult);
    setMultimodalResult(calculateMultimodalFusion(imageResult, newEnvResult));
    return newEnvResult;
  };

  // Run Image Analysis (Live API with graceful fallback)
  const runImageAnalysis = async () => {
    if (!uploadedFile && !customImagePreview && !isResearchSample) {
      const errMsg =
        language === 'ta'
          ? 'ஆய்வைத் தொடங்க மஞ்சள் இலைப் புகைப்படத்தைப் பதிவேற்றவும் அல்லது படம் எடுக்கவும்.'
          : 'Upload or capture a turmeric leaf photo to begin analysis.';
      setAnalysisError(errMsg);
      addToast({
        type: 'warning',
        title: language === 'ta' ? 'இலைப்படம் தேவை' : 'Specimen Required',
        message: errMsg,
      });
      return;
    }

    setIsImageAnalyzing(true);
    setAnalysisError(null);

    if (uploadedFile) {
      // Live server-side prediction on uploaded custom image
      const formData = new FormData();
      formData.append('file', uploadedFile);

      try {
        let response: Response;
        try {
          response = await fetch('/api/predict', {
            method: 'POST',
            body: formData,
          });
        } catch {
          response = await fetch('http://127.0.0.1:8000/api/predict', {
            method: 'POST',
            body: formData,
          });
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const message = errData.detail || `Server error (${response.status})`;
          throw new Error(message);
        }

        const data = await response.json();

        const isOod = data.ood_status === 'OOD_REJECTED';
        const newResult: ImageAnalysisResult = {
          disease: isOod ? 'Non-Turmeric / Out-of-Domain' : data.disease,
          confidence: data.confidence,
          status: isOod ? 'Unsupported Specimen' : (data.disease === 'Healthy' ? 'Healthy Crop' : 'Disease Detected'),
          probabilities: {
            Blotch: data.probabilities?.Blotch ?? 0,
            LeafSpot: data.probabilities?.['Leaf Spot'] ?? data.probabilities?.LeafSpot ?? 0,
            Aphids: data.probabilities?.Aphids ?? 0,
            Healthy: data.probabilities?.Healthy ?? 0,
            'Leaf Spot': data.probabilities?.['Leaf Spot'] ?? data.probabilities?.LeafSpot ?? 0,
          },
          extractedFeatures: data.extracted_features || {
            lesionDensity: isOod ? 'N/A (Specimen rejected)' : 'Analyzing foliar patterns...',
            chlorosisSeverity: isOod ? 'N/A (Specimen rejected)' : 'Assessing chlorophyll variance...',
            colorVariance: isOod ? 'N/A (Specimen rejected)' : 'Evaluating spectrum channels...',
            textureDistortion: isOod ? 'N/A (Specimen rejected)' : 'Mapping surface irregularities...',
          },
          modelMode: 'REAL_MODEL',
          modelArchitecture: data.model_architecture || 'Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, alpha=0.50)',
          oodStatus: data.ood_status,
          oodMessage: data.ood_message,
          mahalanobisDistance: data.mahalanobis_distance,
          oodThreshold: data.ood_threshold,
          oodMethod: data.ood_method,
          individualPredictions: data.individual_predictions,
        };

        setImageResult(newResult);
        setHasAnalyzedImage(true);
        setIsResearchSample(false);
        let newFusion = multimodalResult;
        if (!isOod) {
          newFusion = calculateMultimodalFusion(newResult, envRiskResult);
          setMultimodalResult(newFusion);

          // AUTO-PERSIST TO HISTORY (localStorage key: curuma_history)
          const persistentDataUrl = await createPersistentDataUrl(uploadedFile);
          const now = new Date();
          const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

          const newHistoryRecord: PredictionHistoryRecord = {
            id: `pred-${Date.now()}`,
            date: formattedDate,
            time: formattedTime,
            timestamp: now.toISOString(),
            imageName: uploadedFile.name,
            imageUrl: persistentDataUrl || customImagePreview || '',
            disease: newResult.disease,
            confidence: newResult.confidence,
            probabilities: {
              Blotch: data.probabilities?.Blotch ?? 0,
              LeafSpot: data.probabilities?.['Leaf Spot'] ?? data.probabilities?.LeafSpot ?? 0,
              'Leaf Spot': data.probabilities?.['Leaf Spot'] ?? data.probabilities?.LeafSpot ?? 0,
              leafSpot: data.probabilities?.['Leaf Spot'] ?? data.probabilities?.LeafSpot ?? 0,
              leafBlotch: data.probabilities?.Blotch ?? 0,
              Aphids: data.probabilities?.Aphids ?? 0,
              aphids: data.probabilities?.Aphids ?? 0,
              Healthy: data.probabilities?.Healthy ?? 0,
              healthy: data.probabilities?.Healthy ?? 0,
            },
            environmentalRisk: envRiskResult.score,
            overallRisk: newFusion.overallRisk,
            status: newFusion.riskLevel === 'High' ? 'High' : newFusion.riskLevel === 'Moderate' ? 'Moderate' : 'Low',
            notes: newFusion.whyThisRisk[0] || `${newResult.disease} diagnosed with ${newResult.confidence}% confidence.`,
            recommendation: newFusion.recommendation,
            parameters: { ...envParameters },
            dataSource: envDataSource,
            location: formatLocationDisplay(selectedLocation, 'en'),
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          };

          setPredictionHistory((prev) => {
            const updated = [newHistoryRecord, ...prev];
            try {
              localStorage.setItem('curuma_history', JSON.stringify(updated));
            } catch (e) {
              console.warn('Failed to persist history to localStorage', e);
            }
            return updated;
          });
        }

        if (isOod) {
          addToast({
            type: 'warning',
            title: language === 'ta' ? 'ஆதரிக்கப்படாத படம்' : 'Unsupported Image',
            message: data.ood_message || (language === 'ta' ? 'மஞ்சள் இலைப்படம் அல்ல. சரியான மஞ்சள் இலைப்படத்தைப் பதிவேற்றவும்.' : 'Image is outside the supported turmeric leaf domain.'),
          });
        } else {
          addToast({
            type: 'success',
            title: language === 'ta' ? 'நோய் கண்டறிதல் முடிந்தது' : 'Crop Analysis Complete',
            message: `${newResult.disease} (${newResult.confidence}%).`,
          });
        }
      } catch (err: any) {
        console.error('Inference API error:', err);
        const userFriendlyMessage = err.message || 'Could not connect to inference backend.';
        setAnalysisError(userFriendlyMessage);

        addToast({
          type: 'error',
          title: language === 'ta' ? 'ஆய்வு தோல்வி' : 'Inference Notice',
          message: `${userFriendlyMessage}`,
        });
      } finally {
        setIsImageAnalyzing(false);
      }
    } else {
      // Research reference sample analysis (does NOT create farm scan history records)
      setTimeout(() => {
        const result = calculateImagePrediction(selectedSample.disease);
        const demoResult: ImageAnalysisResult = {
          ...result,
          modelMode: 'REAL_MODEL',
          modelArchitecture: 'MobileNetV2 (Baseline Crop Classifier)',
        };
        setImageResult(demoResult);
        setHasAnalyzedImage(true);
        setIsImageAnalyzing(false);
        const newFusion = calculateMultimodalFusion(demoResult, envRiskResult);
        setMultimodalResult(newFusion);

        addToast({
          type: 'success',
          title: language === 'ta' ? 'நோய் கண்டறிதல் முடிந்தது' : 'Crop Analysis Complete',
          message: `${result.disease} (${result.confidence}%).`,
        });
      }, 1000);
    }
  };

  // Run Environmental Analysis
  const runEnvAnalysis = () => {
    setIsEnvAnalyzing(true);
    setTimeout(() => {
      const result = calculateEnvironmentalRisk(envParameters);
      setEnvRiskResult(result);
      setIsEnvAnalyzing(false);
      const newFusion = calculateMultimodalFusion(imageResult, result);
      setMultimodalResult(newFusion);
      addToast({
        type: 'success',
        title: language === 'ta' ? 'சுற்றுச்சூழல் அபாயம் கணக்கிடப்பட்டது' : 'Environmental Risk Calculated',
        message: `${result.score}% (${result.level} Risk).`,
      });
    }, 1000);
  };

  // Run Multimodal Fusion
  const runMultimodalFusion = () => {
    setIsFusionAnalyzing(true);
    setTimeout(() => {
      const result = calculateMultimodalFusion(imageResult, envRiskResult);
      setMultimodalResult(result);
      setIsFusionAnalyzing(false);
      addToast({
        type: 'success',
        title: language === 'ta' ? 'மொத்த பயிர் நலம் மதிப்பீடு முடிந்தது' : 'Overall Crop Risk Assessed',
        message: `${result.overallRisk}% (${result.riskLevel} Level).`,
      });
    }, 1200);
  };

  // Save analysis (manual trigger fallback if needed)
  const saveCurrentAnalysisToHistory = () => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')} Sep 2026`;
    const formattedTime = today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const imageName = uploadedFile
      ? uploadedFile.name
      : `${selectedSample.disease.toLowerCase().replace(/\s+/g, '_')}_field_scan.jpg`;

    const newRecord: PredictionHistoryRecord = {
      id: `pred-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      timestamp: today.toISOString(),
      imageName: imageName,
      imageUrl: customImagePreview || selectedSample.imageUrl,
      disease: multimodalResult.disease,
      confidence: multimodalResult.imageConfidence,
      probabilities: imageResult.probabilities,
      environmentalRisk: multimodalResult.environmentalRisk,
      overallRisk: multimodalResult.overallRisk,
      status: multimodalResult.riskLevel === 'High' ? 'High' : multimodalResult.riskLevel === 'Moderate' ? 'Moderate' : 'Low',
      notes: `Field diagnosis recorded on ${formattedDate}. ${multimodalResult.whyThisRisk[0] || ''}`,
      recommendation: multimodalResult.recommendation,
      parameters: { ...envParameters },
      dataSource: envDataSource,
      location: formatLocationDisplay(selectedLocation, 'en'),
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    };

    setPredictionHistory((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('curuma_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist history to localStorage', e);
      }
      return updated;
    });

    addToast({
      type: 'success',
      title: language === 'ta' ? 'பதிவேட்டில் சேர்க்கப்பட்டது' : 'Farm Record Saved',
      message: `${newRecord.disease} (${newRecord.confidence}%).`,
    });
  };

  const deletePredictionRecord = (id: string) => {
    setPredictionHistory((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('curuma_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist history deletion', e);
      }
      return updated;
    });
    addToast({
      type: 'info',
      title: language === 'ta' ? 'பதிவு நீக்கப்பட்டது' : 'Record Deleted',
      message: language === 'ta' ? 'பரிசோதனை பதிவு நீக்கப்பட்டது.' : 'History record removed.',
    });
  };

  // Open detailed report
  const openDetailedReport = (record?: PredictionHistoryRecord) => {
    if (record) {
      setActiveReportRecord(record);
    } else {
      const today = new Date();
      const formattedTime = today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const imageName = uploadedFile
        ? uploadedFile.name
        : `${selectedSample.disease.toLowerCase()}_field.jpg`;

      setActiveReportRecord({
        id: 'current-active-report',
        date: `${today.getDate().toString().padStart(2, '0')} Sep 2026`,
        time: formattedTime,
        timestamp: today.toISOString(),
        imageName: imageName,
        imageUrl: customImagePreview || selectedSample.imageUrl,
        disease: multimodalResult.disease,
        confidence: multimodalResult.imageConfidence,
        probabilities: imageResult.probabilities,
        environmentalRisk: multimodalResult.environmentalRisk,
        overallRisk: multimodalResult.overallRisk,
        status: multimodalResult.riskLevel === 'High' ? 'High' : multimodalResult.riskLevel === 'Moderate' ? 'Moderate' : 'Low',
        notes: multimodalResult.recommendation,
        recommendation: multimodalResult.recommendation,
        parameters: { ...envParameters },
        dataSource: envDataSource,
        location: formatLocationDisplay(selectedLocation, 'en'),
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
    }
    setIsReportModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentPage,
        setCurrentPage,
        selectedSample,
        setSelectedSample,
        customImagePreview,
        setCustomImagePreview,
        uploadedFile,
        setUploadedFile,
        analysisError,
        setAnalysisError,
        imageResult,
        isImageAnalyzing,
        hasAnalyzedImage,
        setHasAnalyzedImage,
        isResearchSample,
        setIsResearchSample,
        clearSelectedImage,
        runImageAnalysis,
        envParameters,
        updateEnvParameter,
        resetEnvParameters,
        analyzeManualFieldConditions,
        envDataSource,
        setEnvDataSource,
        sensorStatus,
        currentSeason,
        envRiskResult,
        isEnvAnalyzing,
        runEnvAnalysis,
        multimodalResult,
        isFusionAnalyzing,
        runMultimodalFusion,
        predictionHistory,
        saveCurrentAnalysisToHistory,
        deletePredictionRecord,
        toasts,
        addToast,
        removeToast,
        isReportModalOpen,
        setIsReportModalOpen,
        activeReportRecord,
        openDetailedReport,
        selectedResearchDisease,
        setSelectedResearchDisease: handleSetSelectedResearchDisease,
        cropDap,
        setCropDap: handleSetCropDap,
        activePresetMode,
        setActivePresetMode,
        applyHistoricalPreset,
        researchRiskResult,
        selectedLocation,
        setSelectedLocation,
        plantingDate,
        setPlantingDate: handleSetPlantingDate,
        isWeatherLoading,
        weatherError,
        liveHourlyRecords,
        fetchLiveWeatherData,
        isLocating,
        locationStatus,
        locationErrorMessage,
        detectCurrentLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
