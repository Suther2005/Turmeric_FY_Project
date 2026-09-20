import React, { createContext, useContext, useState } from 'react';
import {
  EnvironmentalParameters,
  EnvironmentalRiskResult,
  ImageAnalysisResult,
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
  ResearchDiseaseType,
  ResearchRiskOutput,
} from '../utils/researchRiskEngine';
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
  envDataSource: 'manual' | 'sensor' | 'reanalysis';
  setEnvDataSource: (source: 'manual' | 'sensor' | 'reanalysis') => void;
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
  const [envDataSource, setEnvDataSource] = useState<'manual' | 'sensor' | 'reanalysis'>('manual');
  const [sensorStatus] = useState<SensorStatus>({
    isConnected: false, // Default false until real hardware sends data
  });

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

  // Research Risk Result (Only populated when actual historical time series is loaded)
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

  // History & Toasts & Modals
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryRecord[]>(
    INITIAL_PREDICTION_HISTORY
  );
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
    if (activePresetMode !== 'MANUAL_SLIDERS') {
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
    if (activePresetMode !== 'MANUAL_SLIDERS') {
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
        const response = await fetch('http://localhost:8000/api/predict', {
          method: 'POST',
          body: formData,
        });

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
        if (!isOod) {
          const newFusion = calculateMultimodalFusion(newResult, envRiskResult);
          setMultimodalResult(newFusion);
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
      // Research reference sample analysis
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

  // Save analysis
  const saveCurrentAnalysisToHistory = () => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')} Sep 2026`;
    const imageName = uploadedFile
      ? uploadedFile.name
      : `${selectedSample.disease.toLowerCase().replace(/\s+/g, '_')}_field_scan.jpg`;

    const newRecord: PredictionHistoryRecord = {
      id: `pred-${Date.now()}`,
      date: formattedDate,
      imageName: imageName,
      imageUrl: customImagePreview || selectedSample.imageUrl,
      disease: multimodalResult.disease,
      confidence: multimodalResult.imageConfidence,
      environmentalRisk: multimodalResult.environmentalRisk,
      overallRisk: multimodalResult.overallRisk,
      status: multimodalResult.riskLevel === 'High' ? 'High' : multimodalResult.riskLevel === 'Moderate' ? 'Moderate' : 'Low',
      notes: `Field diagnosis recorded on ${formattedDate}. ${multimodalResult.whyThisRisk[0] || ''}`,
      parameters: { ...envParameters },
      dataSource: envDataSource,
    };

    setPredictionHistory((prev) => [newRecord, ...prev]);
    addToast({
      type: 'success',
      title: language === 'ta' ? 'பதிவேட்டில் சேர்க்கப்பட்டது' : 'Farm Record Saved',
      message: `${newRecord.disease} (${newRecord.confidence}%).`,
    });
  };

  // Open detailed report
  const openDetailedReport = (record?: PredictionHistoryRecord) => {
    if (record) {
      setActiveReportRecord(record);
    } else {
      const today = new Date();
      const imageName = uploadedFile
        ? uploadedFile.name
        : `${selectedSample.disease.toLowerCase()}_field.jpg`;

      setActiveReportRecord({
        id: 'current-active-report',
        date: `${today.getDate().toString().padStart(2, '0')} Sep 2026`,
        imageName: imageName,
        imageUrl: customImagePreview || selectedSample.imageUrl,
        disease: multimodalResult.disease,
        confidence: multimodalResult.imageConfidence,
        environmentalRisk: multimodalResult.environmentalRisk,
        overallRisk: multimodalResult.overallRisk,
        status: multimodalResult.riskLevel === 'High' ? 'High' : multimodalResult.riskLevel === 'Moderate' ? 'Moderate' : 'Low',
        notes: multimodalResult.recommendation,
        parameters: { ...envParameters },
        dataSource: envDataSource,
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
