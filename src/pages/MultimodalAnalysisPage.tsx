import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RiskGauge } from '../components/common/RiskGauge';
import { TRANSLATIONS } from '../utils/translations';
import {
  Layers,
  ScanEye,
  CloudSun,
  GitMerge,
  Sparkles,
  ArrowRight,
  RefreshCw,
  BookmarkPlus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Thermometer,
  Droplets,
  Sprout,
  Compass,
  Lightbulb,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  Calendar,
} from 'lucide-react';

export const MultimodalAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    selectedSample,
    customImagePreview,
    imageResult,
    envParameters,
    envRiskResult,
    multimodalResult,
    isFusionAnalyzing,
    runMultimodalFusion,
    saveCurrentAnalysisToHistory,
    openDetailedReport,
    researchRiskResult,
    selectedResearchDisease,
    cropDap,
    hasAnalyzedImage,
  } = useApp();

  const [activeFusionStep, setActiveFusionStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fusionSteps = [
    language === 'ta' ? 'இலைப்பட நோய் அறிகுறிகளை பகுப்பாய்வு செய்கிறது...' : 'Extracting visual disease feature embeddings...',
    language === 'ta' ? 'கள வானிலை அளவீடுகளை சரிபார்க்கிறது...' : 'Normalizing microclimate environmental parameters...',
    language === 'ta' ? 'பருவக்கால மழை மற்றும் ஈரப்பதத்துடன் ஒப்பிடுகிறது...' : 'Evaluating seasonal epidemiological vulnerability rules...',
    language === 'ta' ? 'இருவகை காரணிகளையும் ஒருங்கிணைக்கிறது...' : 'Executing multimodal cross-attention fusion tensor...',
    language === 'ta' ? 'இறுதி பயிர் அபாய நிலை & பரிந்துரைகளை உருவாக்குகிறது...' : 'Synthesizing final risk score & decision recommendations...',
  ];

  const diseaseKey = multimodalResult.disease as keyof typeof TRANSLATIONS.diseases;
  const diseaseInfo = TRANSLATIONS.diseases[diseaseKey] || {
    en: multimodalResult.disease,
    ta: multimodalResult.disease,
    desc: { en: '', ta: '' },
  };

  const handleStartFusion = () => {
    setActiveFusionStep(0);
    const interval = setInterval(() => {
      setActiveFusionStep((prev) => {
        if (prev < fusionSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 350);

    runMultimodalFusion();
    setTimeout(() => clearInterval(interval), 2000);
  };

  const currentPreview = customImagePreview || selectedSample.imageUrl;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {language === 'ta' ? 'முழுமையான பயிர் நலம்' : 'Holistic Crop Health'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5">
            {TRANSLATIONS.nav.cropRisk[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'ta'
              ? 'இலை அறிகுறி, கள வானிலை மற்றும் பருவக்கால சூழலை இணைத்து கணக்கிடப்படும் ஒட்டுமொத்த பயிர் அபாய நிலை.'
              : 'Holistic crop health combining visual foliar pathology, field microclimate, and seasonal intelligence.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openDetailedReport()}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-agri-700" />
            <span>{TRANSLATIONS.actions.viewDetails[language]}</span>
          </button>
        </div>
      </div>

      {/* 3-PILLAR FARMER FLOW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Leaf Health */}
        <div className="bg-white p-5 rounded-3xl border border-[#e2ece6] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-agri-800">
              <span className="text-base">🌿</span>
              <span>{language === 'ta' ? 'இலை நலம் (Leaf Health)' : 'Leaf Health'}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              hasAnalyzedImage
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}>
              {hasAnalyzedImage
                ? `${imageResult.confidence}% ${TRANSLATIONS.status.confidence[language]}`
                : (language === 'ta' ? 'ஆய்வு தேவை' : 'Scan Pending')}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 font-display">
            {hasAnalyzedImage
              ? (diseaseInfo[language] || multimodalResult.disease)
              : (language === 'ta' ? 'இலைப்படம் ஆய்வு செய்யப்படவில்லை' : 'Awaiting Foliar Scan')}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            {hasAnalyzedImage
              ? diseaseInfo.desc[language]
              : (language === 'ta'
                  ? 'இலைப்பட பரிசோதனைப் பக்கத்தில் புகைப்படத்தை ஆய்வு செய்யவும்.'
                  : 'Upload a turmeric leaf photo on Disease Detection page to analyze visual symptoms.')}
          </p>
        </div>

        {/* Pillar 2: Environmental Microclimate */}
        <div className="bg-white p-5 rounded-3xl border border-[#e2ece6] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <span className="text-base">🌦️</span>
              <span>{language === 'ta' ? 'சூழல் அபாயம் (Environmental Risk)' : 'Environmental Risk'}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                (researchRiskResult?.riskLevel === 'HIGH' || envRiskResult.level === 'High')
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : (researchRiskResult?.riskLevel === 'MODERATE' || envRiskResult.level === 'Moderate')
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {researchRiskResult
                ? `${researchRiskResult.riskLevel} ${language === 'ta' ? 'அபாயம்' : 'Risk'} (${TRANSLATIONS.status.scientificNotice[language]})`
                : `${envRiskResult.level} ${language === 'ta' ? 'அபாயம்' : 'Risk'}`}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 font-display">
            {selectedResearchDisease}: {researchRiskResult ? researchRiskResult.riskLevel : envRiskResult.level}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            {researchRiskResult?.explanation.contributingFactors[0] || envRiskResult.contributingFactors[0] || 'Standard protective thresholds'}
          </p>
        </div>

        {/* Pillar 3: Seasonal & Crop Stage Context */}
        <div className="bg-white p-5 rounded-3xl border border-[#e2ece6] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="text-base">📅</span>
              <span>{language === 'ta' ? 'பருவக்காலம் (Season & DAP)' : 'Season & Phenology'}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              {cropDap} DAP Context
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 font-display">
            {TRANSLATIONS.season.currentSeason[language]}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            {researchRiskResult?.phenologyContext.susceptibilityNote ||
              (language === 'ta'
                ? 'வளர்ச்சிப் பருவத்தில் உள்ள பயிர்களை வாரந்தோறும் கண்காணிக்கவும்.'
                : 'Scout emerging foliar canopy regularly during vegetative and rhizome development.')}
          </p>
        </div>
      </div>

      {/* COMBINED OVERALL CROP RISK CARD (DEVELOPMENT PROTOTYPE PREVIEW) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-agri-300 shadow-card space-y-6">
        <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              {language === 'ta' ? 'உருவாக்க நிலை முன்மாதிரி அறிவிப்பு:' : 'Development Prototype / Decision Support Notice:'}
            </span>
            {language === 'ta'
              ? 'பல்தரவு ஒருங்கிணைப்பு என்பது முடிவெடுக்கும் ஆதரவு அமைப்பாகும்; இது இன்னும் தனித்த களத் தரவுகளுடன் முழுமையாக சரிபார்க்கப்படவில்லை.'
              : 'Multimodal fusion is a developmental decision-support heuristic and has not been prospectively validated against paired field datasets.'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-agri-800 text-white flex items-center justify-center text-2xl shadow-sm">
              🧠
            </div>
            <div>
              <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
                {language === 'ta' ? 'ஒருங்கிணைந்த மதிப்பீடு' : 'Multimodal Assessment'}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 font-display">
                {TRANSLATIONS.status.overallRisk[language]}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider ${
                multimodalResult.riskLevel === 'High'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : multimodalResult.riskLevel === 'Moderate'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {multimodalResult.riskLevel} {language === 'ta' ? 'அபாயம்' : 'Risk'} ({multimodalResult.overallRisk}%)
            </span>

            <button
              onClick={handleStartFusion}
              disabled={isFusionAnalyzing}
              className="px-4 py-2 bg-agri-800 hover:bg-agri-900 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFusionAnalyzing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{language === 'ta' ? 'மீண்டும் கணக்கிடு' : 'Recalculate'}</span>
            </button>
          </div>
        </div>

        {/* Gauge & Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 flex justify-center">
            <RiskGauge
              score={multimodalResult.overallRisk}
              size={200}
              strokeWidth={16}
              showLabel={true}
              subtitle={language === 'ta' ? 'மொத்த அபாயம்' : 'COMBINED RISK'}
            />
          </div>

          <div className="md:col-span-7 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ta' ? 'இந்த அபாய நிலைக்கான காரணங்கள்:' : 'Why this risk level was evaluated:'}
            </span>
            <div className="space-y-2">
              {multimodalResult.whyThisRisk.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 border border-slate-200/80 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className="p-5 bg-gradient-to-r from-agri-900 to-slate-900 text-white rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{language === 'ta' ? 'முதன்மைப் பரிந்துரை' : 'Primary Recommended Field Action'}</span>
          </div>
          <p className="text-xs md:text-sm text-emerald-50 leading-relaxed">
            {multimodalResult.recommendation}
          </p>
        </div>

        {/* Advisory safety notice */}
        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-snug">
            {TRANSLATIONS.recommendations.safetyDisclaimer[language]}
          </p>
        </div>

        {/* Collapsible Advanced Technical Layer */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-agri-700" />
              <span>{showAdvanced ? TRANSLATIONS.status.hideDetails[language] : TRANSLATIONS.status.moreDetails[language]}</span>
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="p-4 bg-white space-y-3 border-t border-slate-200 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 font-bold block">Visual Modality Weight:</span>
                  <span className="text-slate-800 font-mono font-bold">58% ({multimodalResult.modalityWeights.visualWeight})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Environmental Modality Weight:</span>
                  <span className="text-slate-800 font-mono font-bold">42% ({multimodalResult.modalityWeights.environmentalWeight})</span>
                </div>
              </div>
              <p className="text-slate-500 font-mono text-[11px]">
                Fusion Synergy: {multimodalResult.fusionSynergyNote}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={saveCurrentAnalysisToHistory}
            className="w-full sm:w-auto py-2.5 px-5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <BookmarkPlus className="w-4 h-4 text-emerald-600" />
            <span>{TRANSLATIONS.actions.saveToHistory[language]}</span>
          </button>

          <button
            onClick={() => navigate('/recommendations')}
            className="w-full sm:w-auto py-2.5 px-5 bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>{language === 'ta' ? 'அனைத்துப் பரிந்துரைகளையும் பார்க்க' : 'View Full Farm Action Plan'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
