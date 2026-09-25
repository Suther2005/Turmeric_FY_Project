import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LocationSelectorModal } from '../components/common/LocationSelectorModal';
import { TRANSLATIONS } from '../utils/translations';
import { formatLocationDisplay } from '../services/weatherService';
import {
  MapPin,
  Sun,
  Camera,
  ArrowRight,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Lightbulb,
  CheckCircle2,
  Sprout,
  Navigation,
  TestTubes,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    selectedLocation,
    fetchLiveWeatherData,
    isWeatherLoading,
    envParameters,
    hasAnalyzedImage,
    multimodalResult,
    envRiskResult,
    researchRiskResult,
    envDataSource,
  } = useApp();

  const [showLocationModal, setShowLocationModal] = useState(false);

  // Auto-fetch weather on mount if not already done
  useEffect(() => {
    if (envDataSource !== 'live_weather' && !researchRiskResult && !isWeatherLoading) {
      fetchLiveWeatherData(selectedLocation);
    }
  }, []);

  const greeting = useMemo(() => {
    if (language === 'ta') return 'வணக்கம்!';
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  }, [language]);

  const relativeUpdateTime = useMemo(() => {
    const fetchIso = researchRiskResult?.timestamp;
    if (!fetchIso) {
      return language === 'ta' ? 'இப்போது புதுப்பிக்கப்பட்டது' : 'Updated just now';
    }
    try {
      const fetchedTime = new Date(fetchIso).getTime();
      const diffMs = Math.max(0, Date.now() - fetchedTime);
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) {
        return language === 'ta' ? 'இப்போது புதுப்பிக்கப்பட்டது' : 'Updated just now';
      }
      if (diffMinutes < 60) {
        return language === 'ta'
          ? `${diffMinutes} நிமிடம் முன்`
          : `Updated ${diffMinutes}m ago`;
      }
      const diffHours = Math.floor(diffMinutes / 60);
      return language === 'ta'
        ? `${diffHours} மணி நேரம் முன்`
        : `Updated ${diffHours}h ago`;
    } catch {
      return language === 'ta' ? 'இப்போது புதுப்பிக்கப்பட்டது' : 'Updated just now';
    }
  }, [researchRiskResult?.timestamp, language]);

  const diseaseKey = multimodalResult.disease as keyof typeof TRANSLATIONS.diseases;
  const diseaseInfo = TRANSLATIONS.diseases[diseaseKey] || {
    en: multimodalResult.disease,
    ta: multimodalResult.disease,
    desc: { en: '', ta: '' },
  };

  const currentRiskLevel = researchRiskResult ? researchRiskResult.riskLevel : envRiskResult.level;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-6">
      {/* 1. Hero Morning Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xs h-44 md:h-52 bg-slate-900 flex items-center">
        <img
          src="/turmeric_field_banner.jpg"
          alt="Turmeric Field Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        <div className="relative z-10 px-8 md:px-10 py-6 text-white">
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white drop-shadow-sm">
            {greeting}
          </h1>
          <p className="text-sm md:text-base font-semibold text-emerald-100 mt-1 drop-shadow-xs tracking-wide">
            {language === 'ta' ? 'ஆரோக்கியமான மஞ்சள் • சிறந்த விளைச்சல்' : 'Healthy Turmeric • Better Harvests'}
          </p>
        </div>
      </div>

      {/* 2. Primary 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: Crop Health */}
        <div className="md:col-span-4 bg-[#f9fdfa] rounded-3xl p-6 border border-[#e2ece6] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Sprout className="w-5 h-5 text-emerald-600 fill-emerald-600" />
              <span>{language === 'ta' ? 'சமீபத்திய இலை ஆய்வு' : 'Latest Leaf Check'}</span>
            </div>

            <div className="my-4 space-y-1.5">
              <h2 className="text-2xl font-black text-slate-900 font-display">
                {hasAnalyzedImage
                  ? (diseaseInfo[language] || multimodalResult.disease)
                  : (language === 'ta' ? 'ஆய்வுக்குத் தயார்' : 'Ready to check')}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {hasAnalyzedImage
                  ? diseaseInfo.desc[language]
                  : (language === 'ta'
                      ? 'உங்கள் மஞ்சள் இலையின் நலம் அறிய ஒரு புகைப்படத்தை எடுக்கவும்.'
                      : 'Take a photo of your turmeric leaf to know its health status.')}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/disease-detection')}
            className="w-full py-3.5 px-5 bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-sm rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span>{language === 'ta' ? 'இலையை ஸ்கேன் செய்' : 'Scan Leaf'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 ml-1" />
          </button>
        </div>

        {/* Card 2: Today's Weather */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Sun className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>{language === 'ta' ? 'இன்றைய வானிலை' : "Today's Weather"}</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {relativeUpdateTime}
              </span>
            </div>

            {/* 4 Metrics Grid */}
            <div className="grid grid-cols-4 gap-1.5 my-4 text-center">
              {/* Temperature */}
              <div className="flex flex-col items-center">
                <Thermometer className="w-5 h-5 text-rose-500 mb-1" />
                <span className="text-base font-black text-slate-900 font-mono">{envParameters.temperature}°C</span>
                <span className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'வெப்பம்' : 'Temperature'}</span>
              </div>

              {/* Humidity */}
              <div className="flex flex-col items-center">
                <Droplets className="w-5 h-5 text-blue-500 fill-blue-500 mb-1" />
                <span className="text-base font-black text-slate-900 font-mono">{envParameters.humidity}%</span>
                <span className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}</span>
              </div>

              {/* Rainfall */}
              <div className="flex flex-col items-center">
                <CloudRain className="w-5 h-5 text-cyan-500 mb-1" />
                <span className="text-base font-black text-slate-900 font-mono">{envParameters.rainfall} mm</span>
                <span className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'மழை' : 'Rainfall'}</span>
              </div>

              {/* Wind */}
              <div className="flex flex-col items-center">
                <Wind className="w-5 h-5 text-sky-500 mb-1" />
                <span className="text-base font-black text-slate-900 font-mono">{envParameters.windSpeed} km/h</span>
                <span className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'காற்று' : 'Wind'}</span>
              </div>
            </div>
          </div>

          {/* Location Footer inside Weather Card */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="w-full py-2.5 px-4 bg-[#f8fafc] hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
              {selectedLocation.isCurrentLocation ? (
                <Navigation className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span className="truncate font-semibold">{formatLocationDisplay(selectedLocation, language)}</span>
              {selectedLocation.isCurrentLocation && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md shrink-0">
                  {language === 'ta' ? 'தற்போதைய இடம்' : 'Current'}
                </span>
              )}
            </div>
            <span className="text-emerald-800 font-semibold shrink-0 text-[11px]">
              {language === 'ta' ? 'இடத்தை மாற்று' : 'Change Location'}
            </span>
          </button>
        </div>

        {/* Card 3: Field Risk */}
        <div className="md:col-span-4 bg-[#fcfdfd] rounded-3xl p-6 border border-[#e2ece6] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Sprout className="w-5 h-5 text-emerald-600 fill-emerald-600" />
              <span>{language === 'ta' ? 'கள அபாயம்' : 'Field Risk'}</span>
            </div>

            <div className="my-3">
              <div
                className={`w-full py-2 px-4 rounded-2xl text-center text-lg font-extrabold ${
                  currentRiskLevel === 'High'
                    ? 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2]'
                    : currentRiskLevel === 'Moderate'
                    ? 'bg-[#fff8e1] text-[#e65100] border border-[#ffe082]'
                    : 'bg-[#e8f5e9] text-[#1b5e20] border border-[#c8e6c9]'
                }`}
              >
                {currentRiskLevel === 'High'
                  ? (language === 'ta' ? 'அதிக அபாயம்' : 'High')
                  : currentRiskLevel === 'Moderate'
                  ? (language === 'ta' ? 'மிதமானது' : 'Moderate')
                  : (language === 'ta' ? 'குறைவானது' : 'Low')}
              </div>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">
                {currentRiskLevel === 'High'
                  ? (language === 'ta'
                      ? 'தற்போதைய வானிலை நிலைமைகள் நோய் பரவலுக்கு சாதகமாக இருக்கலாம். இலைகளை தவறாமல் கண்காணிக்கவும்.'
                      : 'Current weather conditions may be favourable for disease development. Inspect leaves regularly.')
                  : currentRiskLevel === 'Moderate'
                  ? (language === 'ta'
                      ? 'மிதமான வானிலை சூழல். கள கண்காணிப்பைத் தொடரவும்.'
                      : 'Moderate weather conditions. Monitor leaves regularly.')
                  : (language === 'ta'
                      ? 'தற்போதைய வானிலை நிலைமைகள் நோய் பரவலுக்கு குறைந்த அபாயத்தைக் கொண்டுள்ளன.'
                      : 'Current weather conditions are low risk for fungal development.')}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/environmental-risk')}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <span>{language === 'ta' ? 'விவரங்களை பார்க்க' : 'View Details'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 3. Middle 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 4: Field Check */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <TestTubes className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ta' ? 'கள ஆய்வு' : 'Field Check'}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {language === 'ta' ? 'சுற்றுச்சூழல் ஆய்வு' : 'Soil & Climate'}
            </span>
          </div>

          <div className="my-3 space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-900 leading-snug font-display">
              {language === 'ta' ? 'கள நிலைமைகளைச் சரிபார்க்கவும்' : 'Check Field Conditions'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {language === 'ta'
                ? 'உங்கள் வயலின் மண் ஈரப்பதம், வெப்பநிலை, மற்றும் ஈரப்பத அளவீடுகளை உள்ளிட்டு விரிவான அபாய மதிப்பீட்டைப் பெறுங்கள்.'
                : 'Enter your field soil moisture, temperature, and relative humidity to evaluate disease risk.'}
            </p>
          </div>

          <button
            onClick={() => navigate('/field-conditions')}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-emerald-900 font-bold text-xs rounded-xl border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>{language === 'ta' ? 'கள ஆய்வு செய்க' : 'Open Field Check'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>

        {/* Card 5: Advice & Recommendations */}
        <div className="md:col-span-6 bg-[#f9fdfa] rounded-3xl p-6 border border-[#e2ece6] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>{language === 'ta' ? 'பரிந்துரைகள் & ஆலோசனை' : 'Advice & Recommendations'}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {language === 'ta' ? 'பயிர் பாதுகாப்பு' : 'Crop Care'}
              </span>
            </div>

            <div className="space-y-2.5 my-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white shrink-0" />
                <span>{language === 'ta' ? 'உங்கள் பயிரைத் தொடர்ந்து கண்காணிக்கவும்.' : 'Keep monitoring your crop regularly.'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white shrink-0" />
                <span>{language === 'ta' ? 'ஆரம்ப அறிகுறிகளுக்கு இலைகளை தவறாமல் சரிபார்க்கவும்.' : 'Check leaves regularly for early symptoms.'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white shrink-0" />
                <span>{language === 'ta' ? 'நல்ல வடிகால் மற்றும் வயல் காற்றோட்டத்தை பராமரிக்கவும்.' : 'Maintain good drainage and field aeration.'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/recommendations')}
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>{language === 'ta' ? 'ஆலோசனை காண்க' : 'View Advice'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Full Width Banner: Decision-Support Tool Notice */}
      <div className="bg-[#f0f7ff] rounded-3xl p-5 md:p-6 border border-[#dbeafe] shadow-xs flex items-start gap-3.5">
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
          i
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">
            {language === 'ta' ? 'இது ஒரு முடிவு ஆதரவு கருவி' : 'This is a decision-support tool'}
          </h4>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
            {language === 'ta'
              ? 'Curcuma இலைப்படங்கள் மற்றும் வானிலை நிலைமைகளின் அடிப்படையில் தகவல்களை வழங்குகிறது. இரசாயன மேலாண்மைக்கு, TNAU / ICAR-IISR / உள்ளூர் வேளாண் விரிவாக்கம் மற்றும் தயாரிப்பு-லேபிள் வழிகாட்டுதலைப் பின்பற்றவும்.'
              : 'Curcuma provides information based on leaf images and weather conditions. For chemical management, follow TNAU / ICAR-IISR / local agricultural extension and product-label guidance.'}
          </p>
        </div>
      </div>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

export default DashboardPage;
