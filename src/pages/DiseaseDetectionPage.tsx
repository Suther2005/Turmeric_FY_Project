import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEMO_SAMPLES } from '../data/mockData';
import { TRANSLATIONS } from '../utils/translations';
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  ScanEye,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  FileImage,
  AlertTriangle,
  Info,
  BookmarkPlus,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  X,
} from 'lucide-react';

const ALLOWED_EXTS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const DiseaseDetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    language,
    selectedSample,
    setSelectedSample,
    customImagePreview,
    setCustomImagePreview,
    uploadedFile,
    setUploadedFile,
    hasAnalyzedImage,
    isResearchSample,
    clearSelectedImage,
    analysisError,
    setAnalysisError,
    imageResult,
    isImageAnalyzing,
    runImageAnalysis,
    saveCurrentAnalysisToHistory,
    addToast,
  } = useApp();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showResearchSamples, setShowResearchSamples] = useState(false);

  const t = TRANSLATIONS;

  const processingSteps = [
    language === 'ta' ? 'இலைப்படத்தின் தரத்தை சரிபார்க்கிறது...' : 'Validating foliar image integrity & format...',
    language === 'ta' ? 'படத்தின் வண்ண நுணுக்கங்களை மாற்றியமைக்கிறது...' : 'Normalizing input tensor (224x224x3, ImageNet μ/σ)...',
    language === 'ta' ? 'பூஞ்சை மற்றும் பூச்சி அறிகுறிகளை பகுப்பாய்வு செய்கிறது...' : 'Executing convolutional backbone inference (PyTorch)...',
    language === 'ta' ? '4 வகை பயிர் நோய்களுடன் ஒப்பிடுகிறது...' : 'Calibrating Softmax class distribution across 4 pathology categories...',
    language === 'ta' ? 'இறுதி முடிவுகளை உருவாக்குகிறது...' : 'Extracting visual pathology diagnostics vector...',
  ];

  const diseaseKey = imageResult.disease as keyof typeof TRANSLATIONS.diseases;
  const diseaseInfo = TRANSLATIONS.diseases[diseaseKey] || {
    en: imageResult.disease,
    ta: imageResult.disease,
    desc: { en: '', ta: '' },
  };

  const processSelectedFile = (file: File | null) => {
    setAnalysisError(null);
    if (!file) {
      addToast({
        type: 'warning',
        title: language === 'ta' ? 'படம் தேர்ந்தெடுக்கப்படவில்லை' : 'No File Selected',
        message: language === 'ta' ? 'சரியான இலைப்படத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please choose a valid JPG, JPEG, or PNG leaf image.',
      });
      return;
    }

    if (!ALLOWED_EXTS.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      const msg = language === 'ta' ? 'JPG, JPEG, PNG வடிவ படங்கள் மட்டுமே அனுமதிக்கப்படும்.' : 'Only JPG, JPEG, and PNG image files are supported.';
      setAnalysisError(msg);
      addToast({
        type: 'error',
        title: language === 'ta' ? 'தவறான கோப்பு வடிவம்' : 'Invalid File Type',
        message: msg,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const msg = language === 'ta' ? `கோப்பின் அளவு அதிகம் (${sizeMb} MB). 20 MB-க்குள் பதிவேற்றவும்.` : `File size (${sizeMb} MB) exceeds maximum allowed limit of 20 MB.`;
      setAnalysisError(msg);
      addToast({
        type: 'error',
        title: language === 'ta' ? 'கோப்பு அளவு அதிகம்' : 'File Too Large',
        message: msg,
      });
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setCustomImagePreview(url);
      setUploadedFile(file);
      addToast({
        type: 'info',
        title: language === 'ta' ? 'இலைப்படம் தயார்' : 'Leaf Specimen Ready',
        message: `${file.name} (${(file.size / 1024).toFixed(0)} KB).`,
      });
    } catch (e) {
      setAnalysisError(language === 'ta' ? 'படத்தை வாசிக்க முடியவில்லை.' : 'Failed to read image file preview.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    processSelectedFile(file);
  };

  const handleStartAnalysis = async () => {
    if (!customImagePreview && !uploadedFile && !isResearchSample) {
      const msg =
        language === 'ta'
          ? 'ஆய்வைத் தொடங்க மஞ்சள் இலைப் புகைப்படத்தைப் பதிவேற்றவும் அல்லது படம் எடுக்கவும்.'
          : 'Upload or capture a turmeric leaf photo to begin analysis.';
      setAnalysisError(msg);
      addToast({
        type: 'warning',
        title: language === 'ta' ? 'இலைப்படம் தேவை' : 'Specimen Required',
        message: msg,
      });
      return;
    }

    setActiveStepIndex(0);
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 280);

    await runImageAnalysis();
    clearInterval(interval);
  };

  const hasImage = !!(customImagePreview || uploadedFile);
  const currentImageSrc = customImagePreview || (isResearchSample ? selectedSample.imageUrl : '');
  const leafSpotProb = imageResult.probabilities.LeafSpot ?? imageResult.probabilities['Leaf Spot'] ?? 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {language === 'ta' ? 'இலைப்பட பரிசோதனை' : 'Visual Foliar Stream'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5">
            {TRANSLATIONS.nav.diseaseDetection[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'ta'
              ? 'மஞ்சள் இலை புகைப்படத்தை பதிவேற்றி நோய் தாக்கத்தை துல்லியமாக கண்டறியவும்.'
              : 'Upload or capture a turmeric leaf photo to analyze foliar symptoms and pathogen likelihood.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/environmental-risk')}
          className="px-4 py-2.5 rounded-xl bg-agri-50 hover:bg-agri-100 text-agri-900 font-bold text-xs tracking-wider uppercase transition-all border border-agri-200 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span>{TRANSLATIONS.actions.proceedToRisk[language]}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column - Farmer Image Input */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <FileImage className="w-4 h-4 text-agri-700" />
                {language === 'ta' ? 'இலைப்படம் பதிவேற்றம்' : 'Leaf Photo Input'}
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">JPG, JPEG, PNG, WEBP</span>
            </div>

            {/* Upload & Preview Area */}
            {!hasImage ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-colors flex flex-col items-center justify-center text-center overflow-hidden min-h-[260px] cursor-pointer ${
                  isDragging
                    ? 'border-agri-600 bg-agri-100/50'
                    : 'border-agri-300 hover:border-agri-600 bg-agri-50/40 hover:bg-agri-50/80'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-agri-200 flex items-center justify-center text-agri-700 mb-3">
                  <UploadCloud className="w-8 h-8 text-agri-700" />
                </div>
                <p className="text-sm font-bold text-slate-800 max-w-sm leading-snug font-display">
                  {t.status.uploadPrompt[language]}
                </p>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  {language === 'ta'
                    ? 'JPG, JPEG, PNG, WEBP (அதிகபட்சம் 20 MB)'
                    : 'Supported: JPG, JPEG, PNG, WEBP (Max 20 MB)'}
                </p>
              </div>
            ) : (
              <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-sm bg-slate-900 border border-slate-200">
                <img
                  src={currentImageSrc}
                  alt="Turmeric Leaf Specimen"
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isImageAnalyzing ? 'scale-105 filter blur-[1px]' : ''
                  }`}
                />

                {isImageAnalyzing && <div className="scan-line"></div>}

                {/* Specimen Attribution Badge */}
                <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 border border-white/20">
                  <span className={`w-2 h-2 rounded-full ${isResearchSample ? 'bg-purple-400' : 'bg-emerald-400'}`}></span>
                  <span>
                    {isResearchSample
                      ? `${t.status.researchReferenceSample[language]}: ${selectedSample.disease}`
                      : uploadedFile
                      ? `${uploadedFile.name}`
                      : t.status.farmerFieldSpecimen[language]}
                  </span>
                </div>

                {/* Clear Specimen Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelectedImage();
                  }}
                  className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white/80 hover:text-white p-1.5 rounded-full text-xs transition-colors cursor-pointer border border-white/20"
                  title={language === 'ta' ? 'படத்தை நீக்கு' : 'Remove Image'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Error Message */}
            {analysisError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{analysisError}</div>
              </div>
            )}

            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Primary Farmer Action: Choose Photo / Capture */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm border-2 border-agri-300 shadow-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <UploadCloud className="w-5 h-5 text-agri-700" />
                <span>{language === 'ta' ? 'படத்தைத் தேர்வு செய் / படம் எடு' : 'Choose Photo / Capture'}</span>
              </button>

              {/* Primary Farmer Analysis Button */}
              <button
                onClick={handleStartAnalysis}
                disabled={isImageAnalyzing}
                className="w-full py-3.5 rounded-2xl bg-agri-800 hover:bg-agri-900 disabled:bg-slate-400 text-white font-extrabold text-sm tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isImageAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{language === 'ta' ? 'ஆய்வு நடைபெறுகிறது...' : 'RUNNING CROP ANALYSIS...'}</span>
                  </>
                ) : (
                  <>
                    <ScanEye className="w-5 h-5 text-emerald-400" />
                    <span>{language === 'ta' ? 'படத்தை ஆய்வு செய்' : 'Analyze Crop Image'}</span>
                  </>
                )}
              </button>

              {/* Collapsible Advanced Research / Reference Controls (Hidden from standard farmer view) */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden pt-1">
                <button
                  onClick={() => setShowResearchSamples(!showResearchSamples)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.status.researchTools[language]}</span>
                  </span>
                  {showResearchSamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showResearchSamples && (
                  <div className="p-3.5 bg-white space-y-3 border-t border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ta' ? 'ஆராய்ச்சி குறிப்பு மாதிரிகள் (மதிப்பீட்டிற்கு மட்டும்):' : 'Research Reference Samples (Evaluation):'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DEMO_SAMPLES.map((sample) => {
                        const isSelected = isResearchSample && selectedSample.id === sample.id && !uploadedFile;
                        return (
                          <button
                            key={sample.id}
                            onClick={() => setSelectedSample(sample)}
                            className={`p-2 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                              isSelected
                                ? 'bg-agri-800 text-white border-agri-900 font-bold shadow-xs'
                                : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            <div className="font-bold truncate">{sample.disease}</div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-agri-200' : 'text-slate-400'}`}>
                              {sample.sampleType}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Model Output & Next Action */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-agri-700 uppercase tracking-wider">
                  {t.status.modelOutput[language]}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {t.status.modelPrediction[language]}
                </h3>
              </div>
              {hasAnalyzedImage ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {t.status.modelPredictionAvailable[language]}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {t.status.awaitingAnalysis[language]}
                </span>
              )}
            </div>

            {isImageAnalyzing ? (
              <div className="py-8 px-4 rounded-2xl bg-agri-50/70 border border-agri-200/80 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-agri-950">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-agri-700" />
                    {language === 'ta' ? `படிநிலை ${activeStepIndex + 1}/5` : `Processing Step ${activeStepIndex + 1}/5`}
                  </span>
                  <span className="font-mono text-emerald-700">{((activeStepIndex + 1) * 20)}%</span>
                </div>
                <div className="w-full bg-agri-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-agri-700 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(activeStepIndex + 1) * 20}%` }}
                  ></div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-agri-200 text-xs text-slate-700 shadow-xs">
                  &gt; {processingSteps[activeStepIndex]}
                </div>
              </div>
            ) : !hasAnalyzedImage ? (
              /* Neutral Empty State Before Inference */
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ta' ? 'கண்டறியப்பட்ட மாதிரி கணிப்பு' : 'Identified Class'}
                      </span>
                      <div className="text-lg font-bold text-slate-600 font-display mt-1">
                        {t.status.noAnalysisYet[language]}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.status.confidence[language]}
                      </span>
                      <div className="text-lg font-bold text-slate-600 font-display mt-1">
                        {t.status.noAnalysisYet[language]}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{t.status.uploadPrompt[language]}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-agri-50/50 border border-agri-200/60 text-xs text-agri-950 space-y-1.5">
                  <span className="font-bold block flex items-center gap-1.5">
                    <ScanEye className="w-4 h-4 text-agri-700" />
                    {language === 'ta' ? 'விவசாயிகளுக்கான வழிகாட்டுதல்' : 'Farmer Workflow Guide'}
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] pt-1 leading-relaxed">
                    <li>{language === 'ta' ? 'மஞ்சள் இலை புகைப்படத்தை பதிவேற்றவும் / எடுக்கவும்' : 'Choose or capture a clear turmeric leaf photo'}</li>
                    <li>{language === 'ta' ? '"படத்தை ஆய்வு செய்" பொத்தானை அழுத்தவும்' : 'Click "Analyze Crop Image" to trigger AI model inference'}</li>
                    <li>{language === 'ta' ? 'நோய் வகை மற்றும் மாடல் நம்பிக்கையைக் காணவும்' : 'View predicted disease class and calibrated model confidence'}</li>
                  </ol>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => navigate('/environmental-risk')}
                    className="py-2.5 px-4 bg-agri-50 hover:bg-agri-100 text-agri-950 font-bold text-xs rounded-xl border border-agri-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{TRANSLATIONS.actions.proceedToRisk[language]}</span>
                    <ArrowRight className="w-4 h-4 text-agri-700" />
                  </button>
                </div>
              </div>
            ) : imageResult.oodStatus === 'OOD_REJECTED' ? (
              /* Out-of-Distribution (Unsupported Specimen) State */
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0 shadow-xs">
                      <AlertTriangle className="w-6 h-6 text-amber-700" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wider">
                          {language === 'ta' ? 'ஆதரிக்கப்படாத மாதிரி' : 'Unsupported Image'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 font-display">
                        {language === 'ta' ? 'சரிபார்க்கப்பட்ட களத்திற்கு வெளியே உள்ள படம்' : 'Image Outside Validated Domain'}
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {language === 'ta'
                          ? 'இந்த படம் மாதிரி சரிபார்க்கப்பட்ட நிலைமைகளிலிருந்து வேறுபடுவதால் இதை நம்பத்தகுந்த முறையில் பகுப்பாய்வு செய்ய முடியவில்லை. நல்ல இயற்கை வெளிச்சத்தில் ஒரு மஞ்சள் இலையை மட்டும் நெருக்கமாக புகைப்படம் எடுத்து மீண்டும் பகுப்பாய்வு செய்யவும்.'
                          : 'This image could not be reliably analyzed because its appearance differs from the image conditions validated for this model. Please capture a clear close-up photo of a single turmeric leaf in good natural light and re-analyze.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white/95 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-1.5 shadow-xs">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-600" />
                      {language === 'ta' ? 'வழிகாட்டுதல்:' : 'Next Step Recommendation:'}
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {language === 'ta'
                        ? 'நல்ல இயற்கை வெளிச்சத்தில் ஒரு மஞ்சள் இலையை மட்டும் நெருக்கமாக புகைப்படம் எடுத்து மீண்டும் பகுப்பாய்வு செய்யவும்.'
                        : 'Please capture a clear close-up photo of a single turmeric leaf in good natural light and re-analyze.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{language === 'ta' ? 'வேறு படம் தேர்வு செய்' : 'Choose Another Leaf Photo'}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Technical Details for OOD Diagnostics */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-agri-700" />
                      <span>{showAdvanced ? t.status.hideDetails[language] : t.status.moreDetails[language]}</span>
                    </span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvanced && (
                    <div className="p-4 bg-white space-y-3.5 border-t border-slate-200 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Active Architecture:</span>
                        <span className="text-slate-900 font-mono font-bold text-[11px]">
                          {imageResult.modelArchitecture || 'Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, alpha=0.50)'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2.5">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                          Domain Safeguard Diagnostics
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Mahalanobis Distance:</span>
                            <span className="font-mono font-black text-amber-900 text-sm">{imageResult.mahalanobisDistance ?? '--'}</span>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Rejection Threshold (τ₉₈):</span>
                            <span className="font-mono font-black text-slate-700 text-sm">{imageResult.oodThreshold ?? 61.97}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-amber-100 leading-relaxed">
                          <span className="font-bold text-slate-800">Safeguard Status:</span>{' '}
                          <span className="font-mono font-bold text-amber-800">OOD_REJECTED</span> — Disease classification head was safely bypassed to prevent ungrounded predictions on non-crop images.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Valid In-Domain Analyzed Result Card */
              <>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-agri-50/50 border border-agri-200 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ta' ? 'கண்டறியப்பட்ட மாதிரி கணிப்பு' : 'Identified Class'}
                      </span>
                      <div className="text-xl md:text-2xl font-black text-slate-900 font-display mt-0.5">
                        {diseaseInfo[language] || imageResult.disease}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.status.confidence[language]}
                      </span>
                      <div className="text-2xl md:text-3xl font-black text-emerald-700 font-display mt-0.5 font-mono">
                        {imageResult.confidence}%
                      </div>
                    </div>
                  </div>

                  {/* Concise Farmer-Facing Confidence Note */}
                  <div className="pt-2 border-t border-agri-200/60 text-[11px] text-slate-500 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{t.status.confidenceDisclaimer[language]}</span>
                  </div>

                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                    {diseaseInfo.desc[language]}
                  </p>
                </div>

                {/* Collapsible Technical Details (Collapsed by default) */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-agri-700" />
                      <span>{showAdvanced ? t.status.hideDetails[language] : t.status.moreDetails[language]}</span>
                    </span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvanced && (
                    <div className="p-4 bg-white space-y-4 border-t border-slate-200 text-xs">
                      {/* Active Architecture Badge */}
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Active Architecture:</span>
                        <span className="text-emerald-900 font-mono font-bold text-[11px]">
                          {imageResult.modelArchitecture || 'Hybrid Ensemble (EfficientNet-B0 + MobileNetV2, alpha=0.50)'}
                        </span>
                      </div>

                      {/* Domain Safeguard Verification Tag */}
                      {imageResult.mahalanobisDistance !== undefined && (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-bold">Domain Safeguard:</span>
                          <span className="font-mono text-emerald-800 font-bold">
                            IN_DOMAIN (DM = {imageResult.mahalanobisDistance} ≤ {imageResult.oodThreshold ?? 61.97})
                          </span>
                        </div>
                      )}

                      {/* Individual Backbone Outputs (Research Details) */}
                      {imageResult.individualPredictions && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Individual Backbone Predictions
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {imageResult.individualPredictions.efficientnet_b0 && (
                              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="font-bold text-slate-700 block text-[11px]">EfficientNet-B0:</span>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-semibold text-slate-900">{imageResult.individualPredictions.efficientnet_b0.disease}</span>
                                  <span className="font-mono text-emerald-700 font-bold">{imageResult.individualPredictions.efficientnet_b0.confidence}%</span>
                                </div>
                              </div>
                            )}
                            {imageResult.individualPredictions.mobilenet_v2 && (
                              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="font-bold text-slate-700 block text-[11px]">MobileNetV2:</span>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-semibold text-slate-900">{imageResult.individualPredictions.mobilenet_v2.disease}</span>
                                  <span className="font-mono text-emerald-700 font-bold">{imageResult.individualPredictions.mobilenet_v2.confidence}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 4-Class Probability Distribution */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Class Probability Distribution (Softmax Output)
                        </span>

                        {/* Healthy */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>Healthy (ஆரோக்கியமானது)</span>
                            <span className="font-mono font-bold">{imageResult.probabilities.Healthy}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, imageResult.probabilities.Healthy)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Aphids */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>Aphids (அசுவினி)</span>
                            <span className="font-mono font-bold">{imageResult.probabilities.Aphids}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, imageResult.probabilities.Aphids)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Blotch */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>Blotch (இலைக்கருகல்)</span>
                            <span className="font-mono font-bold">{imageResult.probabilities.Blotch}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-rose-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, imageResult.probabilities.Blotch)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Leaf Spot */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>Leaf Spot (இலைப்புள்ளி)</span>
                            <span className="font-mono font-bold">{leafSpotProb}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, leafSpotProb)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Extracted visual feature indicators */}
                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-[11px]">
                        <div>
                          <span className="text-slate-400 font-bold block">Lesion Density:</span>
                          <span className="text-slate-700 font-medium">{imageResult.extractedFeatures.lesionDensity}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">Chlorosis:</span>
                          <span className="text-slate-700 font-medium">{imageResult.extractedFeatures.chlorosisSeverity}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Farmer Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={saveCurrentAnalysisToHistory}
                    className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <BookmarkPlus className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ta' ? 'பண்ணைப் பதிவுகளில் சேமி' : 'Save to Farm Records'}</span>
                  </button>

                  <button
                    onClick={() => navigate('/environmental-risk')}
                    className="py-2.5 px-4 bg-agri-50 hover:bg-agri-100 text-agri-950 font-bold text-xs rounded-xl border border-agri-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{TRANSLATIONS.actions.proceedToRisk[language]}</span>
                    <ArrowRight className="w-4 h-4 text-agri-700" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionPage;
