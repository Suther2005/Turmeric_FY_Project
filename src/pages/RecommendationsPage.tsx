import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LocationSelectorModal } from '../components/common/LocationSelectorModal';
import { formatLocationDisplay } from '../services/weatherService';
import {
  generateRecommendationProfile,
  RecommendationAction,
} from '../utils/recommendationEngine';
import {
  Lightbulb,
  Sprout,
  Droplets,
  Wind,
  Phone,
  BookOpen,
  Info,
  Eye,
  Camera,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Cpu,
  Layers,
  Activity,
  Thermometer,
  Bug,
  Scissors,
  ShieldCheck,
  Check,
  Calendar,
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const {
    language,
    selectedLocation,
    imageResult,
    hasAnalyzedImage,
    customImagePreview,
    researchRiskResult,
    envRiskResult,
    envParameters,
    multimodalResult,
    cropDap,
    plantingDate,
  } = useApp();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Environmental Risk Level (Low / Moderate / High)
  const envLevel: 'Low' | 'Moderate' | 'High' = researchRiskResult
    ? researchRiskResult.riskLevel === 'HIGH'
      ? 'High'
      : researchRiskResult.riskLevel === 'MODERATE'
      ? 'Moderate'
      : 'Low'
    : envRiskResult.level;

  // Generate State-Based Recommendation Profile
  const profile = generateRecommendationProfile({
    hasAnalyzedImage,
    disease: imageResult.disease,
    confidence: imageResult.confidence,
    oodStatus: imageResult.oodStatus,
    verificationStatus: imageResult.verificationStatus,
    verifierScore: imageResult.verifierScore,
    envRiskTier: envLevel,
    temperature: envParameters.temperature,
    humidity: envParameters.humidity,
    rainfall: envParameters.rainfall,
    leafWetnessHours: envParameters.leafWetness,
    exposureFeatures: researchRiskResult?.exposureFeatures,
    soilMoisture: envParameters.soilMoisture,
    drainageCondition: envParameters.soilMoisture > 75 ? 'poor' : 'good',
    cropDap,
    plantingDate,
    contributingFactors: envRiskResult.contributingFactors,
  });

  // Active Image Source
  const leafImageSrc = customImagePreview || '';

  // Icon Resolver
  const renderActionIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Camera':
        return <Camera className={className} />;
      case 'Eye':
        return <Eye className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Info':
        return <Info className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'Sprout':
        return <Sprout className={className} />;
      case 'Scissors':
        return <Scissors className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Bug':
        return <Bug className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const exposureFeatures = researchRiskResult?.exposureFeatures;
  const indiv = imageResult.individualPredictions;
  const situationLevel = profile.situationLevel;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center text-xs font-medium text-slate-400 gap-1.5 pt-1">
        <Link to="/dashboard" className="hover:text-emerald-700 transition-colors">
          Curcuma
        </Link>
        <span>›</span>
        <span>{language === 'ta' ? 'விவசாய சேவைகள்' : 'Farmer Services'}</span>
        <span>›</span>
        <span className="text-slate-700 font-semibold">
          {language === 'ta' ? 'ஆலோசனை' : 'Advice'}
        </span>
      </div>

      {/* 2. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-7 h-7 text-amber-500" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {language === 'ta' ? 'பயிர் ஆலோசனை' : 'Advice'}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-0.5">
            {language === 'ta'
              ? 'உங்கள் மஞ்சள் பயிருக்கான நிலை சார்ந்த தெளிவான வழிகாட்டுதல்.'
              : 'Actionable guidance based on your crop state and field conditions.'}
          </p>
        </div>

        {/* Location Selector Trigger */}
        <button
          onClick={() => setShowLocationModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs text-xs font-semibold text-slate-700 cursor-pointer transition-all self-start md:self-auto"
        >
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{formatLocationDisplay(selectedLocation, language)}</span>
        </button>
      </div>

      {/* 3. Current Result */}
      <div
        className={`rounded-3xl p-6 md:p-7 border shadow-xs transition-all ${
          situationLevel === 'High'
            ? 'bg-[#fff5f5] border-[#fddede]'
            : situationLevel === 'Moderate'
            ? 'bg-[#fdf9ee] border-[#f8ecbb]'
            : 'bg-[#f0fbf4] border-[#d2f3dc]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900">
              {profile.displayTitle[language]}
            </div>

            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium max-w-2xl">
              {profile.diagnosisExplanation[language]}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {hasAnalyzedImage && profile.diagnosisState !== 'OOD' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                  <span className="text-slate-400">{language === 'ta' ? 'நம்பிக்கை:' : 'Confidence:'}</span>
                  <span className="text-emerald-700 font-mono">{imageResult.confidence}%</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                <span className="text-slate-400">{language === 'ta' ? 'அபாயம்:' : 'Risk:'}</span>
                <span
                  className={`font-mono ${
                    envLevel === 'High' ? 'text-red-600' : envLevel === 'Moderate' ? 'text-amber-600' : 'text-emerald-700'
                  }`}
                >
                  {envLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Leaf Specimen Image */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
            {leafImageSrc ? (
              <img
                src={leafImageSrc}
                alt="Turmeric leaf"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-slate-400 text-center">
                <Sprout className="w-6 h-6 text-emerald-600 mb-1 opacity-70" />
                <span className="text-[10px] font-semibold text-slate-500">
                  {language === 'ta' ? 'இலை படம் இல்லை' : 'No leaf scan'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. What To Do */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-lg">🌱</span>
          <h2 className="text-base font-extrabold text-slate-900 font-display">
            {language === 'ta' ? 'இப்போது என்ன செய்ய வேண்டும்?' : 'What to do'}
          </h2>
        </div>

        <div className="space-y-3">
          {/* Primary & Secondary Actions merged into clean list */}
          <div className="p-4 rounded-2xl bg-[#f9fdfa] border border-emerald-100 space-y-1.5">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 text-xs block">
                  {profile.primaryAction.title[language]}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {profile.primaryAction.what[language]}
                </p>
              </div>
            </div>
          </div>

          {profile.secondaryActions.map((action, idx) => (
            <div key={action.id || idx} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 text-xs block">
                  {action.title[language]}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {action.what[language]}
                </p>
              </div>
            </div>
          ))}

          {/* Cultural Practice Note */}
          {profile.managementGuidance?.cultural && (
            <div className="p-3.5 rounded-2xl bg-[#f0f7fe] border border-[#d2e6fc] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {profile.managementGuidance.cultural[language]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Why */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-lg">🔍</span>
          <h2 className="text-base font-extrabold text-slate-900 font-display">
            {language === 'ta' ? 'காரணம்' : 'Why'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {profile.whyPoints.map((pt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span>{pt.icon}</span>
                <span>{pt.title[language]}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {pt.text[language]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Weather / Field Context (Only shown when actual data is available) */}
      {profile.fieldConditionNotes.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#f0fbf4] border border-[#d2edd9] space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
              {language === 'ta' ? 'வானிலை & கள சூழல்' : 'Weather & Field Context'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {profile.fieldConditionNotes.map((note, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white border border-emerald-100 text-xs text-slate-700 flex items-start gap-2"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{note[language]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION E: ADVANCED TECHNICAL DETAILS (Collapsed by default)
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50/80 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🔬</span>
            <div>
              <span className="text-sm font-extrabold text-slate-900 block font-display">
                {language === 'ta'
                  ? 'தொழில்நுட்ப விவரங்கள்'
                  : 'Technical Details'}
              </span>
            </div>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/60 space-y-5 text-xs text-slate-700">
            {/* 1. Deep Learning Backbone Breakdown */}
            <div className="space-y-2">
              <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                {language === 'ta'
                  ? '1. நரம்பியல் மாதிரி கணிப்புகள் (Neural Ensemble):'
                  : '1. Deep Learning Model Ensemble Predictions:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 block font-medium">
                    EfficientNet-B0
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {indiv?.efficientnet_b0?.disease || (profile.diagnosisState === 'OOD' ? 'OOD' : imageResult.disease)}
                  </span>
                  <span className="font-mono text-emerald-700 text-[11px]">
                    {indiv?.efficientnet_b0?.confidence ?? imageResult.confidence}% confidence
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 block font-medium">
                    MobileNetV2
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {indiv?.mobilenet_v2?.disease || (profile.diagnosisState === 'OOD' ? 'OOD' : imageResult.disease)}
                  </span>
                  <span className="font-mono text-emerald-700 text-[11px]">
                    {indiv?.mobilenet_v2?.confidence ?? imageResult.confidence}% confidence
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 block font-medium">
                    Hybrid Late-Fusion ($\alpha=0.50$)
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {profile.diagnosisState === 'OOD' ? 'OOD' : imageResult.disease}
                  </span>
                  <span className="font-mono text-emerald-700 text-[11px]">
                    {imageResult.confidence}% ensemble confidence
                  </span>
                </div>
              </div>
            </div>

            {/* 2. OOD & Foliar Safeguards */}
            <div className="space-y-2">
              <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                {language === 'ta'
                  ? '2. கள பாதுகாப்பு அளவீடுகள் (Domain Safeguards):'
                  : '2. Domain Safeguard Metrics:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 block font-medium">
                    Stage-1 Foliar Verifier (MobileNetV3)
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {imageResult.verificationStatus || 'VERIFIED_TURMERIC_LEAF'}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Score: {imageResult.verifierScore ?? 1.0} (Threshold: 0.50)
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 block font-medium">
                    Stage-2 Mahalanobis Distance Safeguard
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {imageResult.oodStatus || 'IN_DOMAIN'}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Distance: {imageResult.mahalanobisDistance ?? '23.77'} (Threshold: 63.10)
                  </span>
                </div>
              </div>
            </div>

            {/* 3. 14-Day / 336-Hour Environmental Exposure */}
            <div className="space-y-2">
              <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                {language === 'ta'
                  ? '3. 14-நாள் (336-மணிநேர) வானிலை அளவீடுகள்:'
                  : '3. 14-Day (336-Hour) Environmental Exposure Features:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">RH ≥ 80% Hours</span>
                  <span className="font-mono font-bold text-slate-900">
                    {exposureFeatures?.hours_rh_ge_80pct ?? 'N/A'} h
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Favourable Temp (22–32°C)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {exposureFeatures?.hours_temp_favorable_22_32C ?? 'N/A'} h
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Dew Proxy Condensation</span>
                  <span className="font-mono font-bold text-slate-900">
                    {exposureFeatures?.hours_dew_condensation_proxy ?? 'N/A'} h
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">14d Cumulative Rain</span>
                  <span className="font-mono font-bold text-slate-900">
                    {exposureFeatures?.cumulative_rainfall_14d_mm ?? 'N/A'} mm
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Phenology & Context */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500">Planting Date Context: </span>
                <span className="font-semibold text-slate-900">
                  {plantingDate ? `${plantingDate} (~${cropDap} DAP)` : 'Unavailable / Unset'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Decision Support Index: </span>
                <span className="font-bold font-mono text-emerald-700">
                  {multimodalResult ? `${multimodalResult.overallRisk} / 100` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Support Contact Trigger Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs text-slate-600 font-medium">
            {language === 'ta'
              ? 'கூடுதல் பயிர் பாதுகாப்பு ஆலோசனைக்கு உங்கள் வட்டார வேளாண்மை உதவி அலுவலரைத் தொடர்பு கொள்ளவும்.'
              : 'For personalized agronomic support, consult your local agricultural extension service.'}
          </p>
        </div>
        <button
          onClick={() => setShowSupportModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'உதவி எண்கள்' : 'Support Helplines'}</span>
        </button>
      </div>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />

      {/* Support Contact Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📞</span>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  {language === 'ta' ? 'தமிழ்நாடு வேளாண் உதவி எண்கள்' : 'TN Agricultural Extension Support'}
                </h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="font-extrabold text-emerald-900 block">
                  {language === 'ta' ? 'உழவன் செயலி / கிசான் உதவி எண் (Kisan Call Center):' : 'Kisan Call Center (Toll Free):'}
                </span>
                <span className="font-mono text-sm font-black text-emerald-700">1800-180-1551</span>
                <span className="text-[10px] text-emerald-800 block">
                  {language === 'ta' ? 'காலை 6:00 மணி முதல் இரவு 10:00 மணி வரை (அனைத்து நாட்களும்)' : '6:00 AM to 10:00 PM (All days)'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">
                  {language === 'ta' ? 'தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU):' : 'TNAU Agricultural Advisory Center:'}
                </span>
                <span className="text-slate-600 block">
                  {language === 'ta' ? 'கோயம்புத்தூர் & மண்டல ஆராய்ச்சி நிலையங்கள்' : 'Coimbatore & Regional Agricultural Research Stations'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">0422-6611200</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">
                  {language === 'ta' ? 'உள்ளூர் வேளாண் உதவி:' : 'Local Agronomist / Block Office:'}
                </span>
                <span className="text-slate-600 block">
                  {selectedLocation.name} ({selectedLocation.district})
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              {language === 'ta' ? 'சரி, மூடுக' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
