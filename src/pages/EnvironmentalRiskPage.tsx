import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LocationSelectorModal } from '../components/common/LocationSelectorModal';
import { HISTORICAL_REANALYSIS_PRESETS, ResearchDiseaseType } from '../utils/researchRiskEngine';
import { TRANSLATIONS } from '../utils/translations';
import { formatLocationDisplay } from '../services/weatherService';
import {
  MapPin,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  BarChart2,
  Lightbulb,
  Sprout,
  Navigation,
} from 'lucide-react';

export const EnvironmentalRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    selectedLocation,
    fetchLiveWeatherData,
    isWeatherLoading,
    weatherError,
    liveHourlyRecords,
    envParameters,
    envDataSource,
    researchRiskResult,
    envRiskResult,
    selectedResearchDisease,
    setSelectedResearchDisease,
    cropDap,
    setCropDap,
    activePresetMode,
    applyHistoricalPreset,
  } = useApp();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeNow, setTimeNow] = useState<number>(Date.now());

  // Auto-fetch current weather on component mount if not already live
  useEffect(() => {
    if (envDataSource !== 'live_weather' && !researchRiskResult && !isWeatherLoading) {
      fetchLiveWeatherData(selectedLocation);
    }
  }, []);

  // Update relative time counter periodically
  useEffect(() => {
    const interval = setInterval(() => setTimeNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic relative update timestamp from actual fetch timestamp
  const relativeUpdateTime = useMemo(() => {
    const fetchIso = researchRiskResult?.timestamp;
    if (!fetchIso) {
      return language === 'ta' ? 'இப்போது புதுப்பிக்கப்பட்டது' : 'Updated just now';
    }
    try {
      const fetchedTime = new Date(fetchIso).getTime();
      const diffMs = Math.max(0, timeNow - fetchedTime);
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
        : `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } catch {
      return language === 'ta' ? 'இப்போது புதுப்பிக்கப்பட்டது' : 'Updated just now';
    }
  }, [researchRiskResult?.timestamp, timeNow, language]);

  // 14-day simple condition ratings for farmer-first UI
  const get14DayRating = (type: 'humidity' | 'rainfall' | 'temperature') => {
    const features = researchRiskResult?.exposureFeatures;
    if (!features) {
      return {
        label: language === 'ta' ? 'சாதகமானது' : 'Favourable',
        badgeClass: 'bg-[#e6f7ec] text-[#1b8a43]',
      };
    }

    if (type === 'humidity') {
      if (features.hours_rh_ge_80pct >= 80) {
        return {
          label: language === 'ta' ? 'சாதகமானது' : 'Favourable',
          badgeClass: 'bg-[#e6f7ec] text-[#1b8a43]',
        };
      }
      if (features.hours_rh_ge_80pct >= 40) {
        return {
          label: language === 'ta' ? 'மிதமானது' : 'Moderate',
          badgeClass: 'bg-[#fef3d6] text-[#b45309]',
        };
      }
      return {
        label: language === 'ta' ? 'இயல்பானது' : 'Normal',
        badgeClass: 'bg-[#e6f7ec] text-[#1b8a43]',
      };
    }

    if (type === 'rainfall') {
      if (features.cumulative_rainfall_14d_mm >= 40) {
        return {
          label: language === 'ta' ? 'அடிக்கடி' : 'Frequent',
          badgeClass: 'bg-[#ebf4fd] text-[#2d6fa8]',
        };
      }
      if (features.cumulative_rainfall_14d_mm >= 10) {
        return {
          label: language === 'ta' ? 'இயல்பானது' : 'Normal',
          badgeClass: 'bg-[#ebf4fd] text-[#2d6fa8]',
        };
      }
      return {
        label: language === 'ta' ? 'குறைவானது' : 'Low',
        badgeClass: 'bg-[#f1f5f9] text-[#475569]',
      };
    }

    // Temperature (22-32°C favorable hours)
    if (features.hours_temp_favorable_22_32C >= 100) {
      return {
        label: language === 'ta' ? 'சாதகமானது' : 'Favourable',
        badgeClass: 'bg-[#e6f7ec] text-[#1b8a43]',
      };
    }
    return {
      label: language === 'ta' ? 'குறைந்த சாதகம்' : 'Less Suitable',
      badgeClass: 'bg-[#f1f5f9] text-[#475569]',
    };
  };

  const humidityRating = get14DayRating('humidity');
  const rainfallRating = get14DayRating('rainfall');
  const tempRating = get14DayRating('temperature');

  // Overall environmental risk level (Pure Categorical: Low / Moderate / High)
  const riskCategory: 'Low' | 'Moderate' | 'High' = researchRiskResult
    ? researchRiskResult.riskLevel === 'HIGH'
      ? 'High'
      : researchRiskResult.riskLevel === 'MODERATE'
      ? 'Moderate'
      : 'Low'
    : envRiskResult.level === 'High'
    ? 'High'
    : envRiskResult.level === 'Moderate'
    ? 'Moderate'
    : 'Low';

  const riskBadgeStyle =
    riskCategory === 'High'
      ? 'bg-[#fde8e8] text-[#d32f2f]'
      : riskCategory === 'Moderate'
      ? 'bg-[#fef3d6] text-[#c97a00]'
      : 'bg-[#e6f7ec] text-[#1b8a43]';

  const riskDescription =
    riskCategory === 'High'
      ? language === 'ta'
        ? 'சமீபத்திய நாட்களில் அதிக அபாயகரமான வானிலை நிலவியுள்ளது. பயிரை தவறாமல் கண்காணிக்கவும்.'
        : 'Higher-risk environmental conditions have been observed recently. Check your crop regularly.'
      : riskCategory === 'Moderate'
      ? language === 'ta'
        ? 'சமீபத்திய வானிலை நோய் வளர்ச்சிக்கு சாதகமாக அமையலாம்.'
        : 'Recent weather conditions may be favourable for disease development.'
      : language === 'ta'
      ? 'சமீபத்திய வானிலை நோய் வளர்ச்சிக்கு குறைவான சாதகமாக உள்ளது.'
      : 'Recent weather conditions are less favourable for disease development.';

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center text-xs font-medium text-slate-400 gap-1.5 pt-1">
        <Link to="/dashboard" className="hover:text-emerald-700 transition-colors">
          Curcuma
        </Link>
        <span>›</span>
        <span>{language === 'ta' ? 'விவசாய சேவைகள்' : 'Farmer Services'}</span>
        <span>›</span>
        <span className="text-slate-700 font-semibold">
          {language === 'ta' ? 'வானிலை & அபாயம்' : 'Weather & Risk'}
        </span>
      </div>

      {/* 2. Header Banner with Landscape Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50/30 p-6 md:p-7 border border-[#e4efe7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subtle Decorative Landscape Backdrop */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <path d="M0 120C100 80 180 110 260 70C340 30 380 90 400 120H0Z" fill="#10b981" />
            <path d="M120 120C200 90 280 115 360 85C400 70 420 100 440 120H120Z" fill="#059669" />
          </svg>
        </div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100/90 text-amber-600 flex items-center justify-center shadow-xs">
              <CloudSun className="w-5 h-5 text-amber-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {language === 'ta' ? 'வானிலை & வயல் அபாயம்' : 'Weather & Field Risk'}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-0.5">
            {language === 'ta'
              ? 'உங்கள் வயலுக்கான தற்போதைய வானிலை மற்றும் சமீபத்திய களச்சூழல்.'
              : 'Current weather and recent conditions for your field.'}
          </p>
        </div>
      </div>

      {weatherError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold block mb-0.5">
              {language === 'ta' ? 'வானிலை தகவல் அறிவிப்பு' : 'Weather Notice'}
            </span>
            <span>{weatherError}</span>
          </div>
        </div>
      )}

      {/* 3. Row 1: Current Weather Card & Recent Conditions Card (2 Equal Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Current Weather */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 font-display">
                {language === 'ta' ? 'தற்போதைய வானிலை' : 'Current Weather'}
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {relativeUpdateTime}
              </span>
            </div>

            {/* 4 Simple Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              {/* Temperature */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-1.5 shadow-2xs">
                  <Thermometer className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-lg md:text-xl font-black text-slate-900 font-mono">
                  {envParameters.temperature}°C
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {language === 'ta' ? 'வெப்பநிலை' : 'Temperature'}
                </span>
              </div>

              {/* Humidity */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-1.5 shadow-2xs">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-lg md:text-xl font-black text-slate-900 font-mono">
                  {envParameters.humidity}%
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {language === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}
                </span>
              </div>

              {/* Rainfall */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-1.5 shadow-2xs">
                  <CloudRain className="w-5 h-5 text-sky-500" />
                </div>
                <span className="text-lg md:text-xl font-black text-slate-900 font-mono">
                  {envParameters.rainfall} mm
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {language === 'ta' ? 'மழை' : 'Rainfall'}
                </span>
              </div>

              {/* Wind */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-500 flex items-center justify-center mb-1.5 shadow-2xs">
                  <Wind className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-lg md:text-xl font-black text-slate-900 font-mono">
                  {envParameters.windSpeed} km/h
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {language === 'ta' ? 'காற்று' : 'Wind'}
                </span>
              </div>
            </div>
          </div>

          {/* Location Box inside Current Weather Card */}
          <div className="p-3 bg-[#f8faf9] rounded-2xl border border-[#e4ece7] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-700 truncate">
              {selectedLocation.isCurrentLocation ? (
                <Navigation className="w-4 h-4 text-emerald-600 fill-emerald-600 shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="truncate">{formatLocationDisplay(selectedLocation, language)}</span>
            </div>

            <button
              onClick={() => setShowLocationModal(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer ml-2 shrink-0 transition-colors"
            >
              {language === 'ta' ? 'அமைவிடம் மாற்று' : 'Change Location'}
            </button>
          </div>
        </div>

        {/* Card 2: Recent Conditions (Last 14 days) */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900 font-display">
                {language === 'ta' ? 'சமீபத்திய சூழல் (கடந்த 14 நாட்கள்)' : 'Recent Conditions (Last 14 days)'}
              </h2>
            </div>

            {/* 3 Metric Rows */}
            <div className="space-y-3 mt-4">
              {/* Humidity Row */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs md:text-sm font-semibold text-slate-700">
                    {language === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}
                  </span>
                </div>
                <span className={`px-4 py-1 rounded-xl text-xs font-bold ${humidityRating.badgeClass}`}>
                  {humidityRating.label}
                </span>
              </div>

              {/* Rainfall Row */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <CloudRain className="w-4 h-4 text-slate-700" />
                  <span className="text-xs md:text-sm font-semibold text-slate-700">
                    {language === 'ta' ? 'மழைப்பொழிவு' : 'Rainfall'}
                  </span>
                </div>
                <span className={`px-4 py-1 rounded-xl text-xs font-bold ${rainfallRating.badgeClass}`}>
                  {rainfallRating.label}
                </span>
              </div>

              {/* Temperature Row */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-xs md:text-sm font-semibold text-slate-700">
                    {language === 'ta' ? 'வெப்பநிலை' : 'Temperature'}
                  </span>
                </div>
                <span className={`px-4 py-1 rounded-xl text-xs font-bold ${tempRating.badgeClass}`}>
                  {tempRating.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              {language === 'ta'
                ? 'உங்கள் பகுதியில் நிலவிய சமீபத்திய வானிலை முறைகளின் அடிப்படையில்.'
                : 'Based on recent weather patterns in your area.'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Row 2: Field Risk Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card flex flex-col justify-between relative overflow-hidden min-h-[160px]">
        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍃</span>
            <h2 className="text-base font-extrabold text-slate-900 font-display">
              {language === 'ta' ? 'வயல் ஆபத்து நிலை' : 'Field Risk'}
            </h2>
          </div>

          {/* Categorical Badge Box */}
          <div className="pt-0.5">
            <div className={`inline-block px-6 py-2 rounded-2xl text-xl font-black tracking-wide ${riskBadgeStyle}`}>
              {riskCategory === 'High'
                ? language === 'ta'
                  ? 'அதிகம்'
                  : 'High'
                : riskCategory === 'Moderate'
                ? language === 'ta'
                  ? 'மிதமானது'
                  : 'Moderate'
                : language === 'ta'
                ? 'குறைவானது'
                : 'Low'}
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-600 max-w-lg leading-relaxed pt-0.5">
            {riskDescription}
          </p>
        </div>

        {/* Decorative Plant Art on background */}
        <div className="absolute right-4 bottom-1 opacity-20 pointer-events-none">
          <svg width="115" height="100" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 75C50 75 52 40 75 30C75 30 65 55 50 75Z" fill="#10b981" />
            <path d="M50 75C50 75 48 40 25 30C25 30 35 55 50 75Z" fill="#34d399" />
            <path d="M50 75V15" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 5. Collapsible Advanced Details Section (COLLAPSED BY DEFAULT) */}
      <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-xs">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">⚙️</span>
            <span>
              {showAdvanced
                ? (language === 'ta' ? '▼ மேம்பட்ட விவரங்கள்' : '▼ Advanced Details')
                : (language === 'ta' ? '▶ மேம்பட்ட விவரங்கள்' : '▶ Advanced Details')}
            </span>
          </div>
          {showAdvanced ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-6 border-t border-slate-200 bg-slate-50/60 space-y-6">
            {/* Research Validation Scope Note */}
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'வரலாற்று சரிபார்ப்பு தற்போது சரிபார்க்கப்பட்ட நோய்/சுற்றுச்சூழல் பதிவுகள் உள்ள தேர்ந்தெடுக்கப்பட்ட தமிழ்நாடு இடங்களுக்கு மட்டுமே பொருந்தும். மற்ற ஆதரிக்கப்படும் இடங்களுக்கு நேரலை வானிலை மதிப்பீடு செயல்படுகிறது.'
                  : 'Historical validation currently covers selected Tamil Nadu locations where verified disease/environment observations were available. Live weather assessment is available for other supported locations.'}
              </span>
            </div>

            {/* Historical Presets */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {language === 'ta' ? 'வரலாற்று மாதிரி தரவுகள் (Historical Reanalysis Presets)' : 'Historical Reanalysis Presets (ERA5-Land)'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(HISTORICAL_REANALYSIS_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyHistoricalPreset(key)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      activePresetMode === key
                        ? 'bg-agri-800 text-white border-agri-900 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">{preset.label}</div>
                    <div className={`text-[10px] mt-1 ${activePresetMode === key ? 'text-agri-200' : 'text-slate-500'}`}>
                      {preset.diseaseContext} • DAP {preset.dap} • 336h
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Disease Selector & DAP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">
                  {language === 'ta' ? 'நோய் வகை (Research Disease Pathway)' : 'Research Disease Pathway'}
                </label>
                <select
                  value={selectedResearchDisease}
                  onChange={(e) => setSelectedResearchDisease(e.target.value as ResearchDiseaseType)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Leaf Spot">Leaf Spot (Colletotrichum capsici)</option>
                  <option value="Leaf Blotch">Blotch (Taphrina maculans)</option>
                  <option value="Aphids">Aphids (Aphis gossypii)</option>
                </select>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block">
                    {language === 'ta' ? 'பயிர் வயது (Days After Planting - DAP)' : 'Crop DAP (Days After Planting)'}
                  </label>
                  <span className="text-xs font-bold text-emerald-700 font-mono">{cropDap} DAP</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={270}
                  step={5}
                  value={cropDap}
                  onChange={(e) => setCropDap(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>

            {/* 336-hour Exposure Metrics Details */}
            {researchRiskResult && researchRiskResult.exposureFeatures && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase">
                  336-Hour Antecedent Exposure Vector
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">RH ≥ 80% Hours</span>
                    <span className="font-bold text-slate-900">{researchRiskResult.exposureFeatures.hours_rh_ge_80pct} / 336 hrs</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Temp Optimal Hours</span>
                    <span className="font-bold text-slate-900">{researchRiskResult.exposureFeatures.hours_temp_favorable_22_32C} / 336 hrs</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Dew Proxy Hours</span>
                    <span className="font-bold text-slate-900">{researchRiskResult.exposureFeatures.hours_dew_condensation_proxy} hrs</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Cumulative Rain</span>
                    <span className="font-bold text-slate-900">{researchRiskResult.exposureFeatures.cumulative_rainfall_14d_mm} mm</span>
                  </div>
                </div>
              </div>
            )}

            {/* Research & Diagnostics Debug Trace (Audit Verification Panel) */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-2.5 font-mono text-[11px] border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400">🔬 ENVIRONMENTAL RISK ENGINE — RESEARCH DEBUG TRACE</span>
                <span className="text-[10px] text-slate-400 font-sans">Research Validation Only</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Location & Telemetry</div>
                  <div>Location: {selectedLocation.name}, {selectedLocation.district}</div>
                  <div>Coordinates: Lat {selectedLocation.latitude}, Lon {selectedLocation.longitude}</div>
                  <div>Source: {researchRiskResult?.dataSource || envDataSource}</div>
                  <div>Fetched At: {researchRiskResult?.timestamp || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Hourly Series Window</div>
                  <div>Record Count: {liveHourlyRecords?.length || 336} hourly readings</div>
                  <div>Oldest: {liveHourlyRecords && liveHourlyRecords.length > 0 ? liveHourlyRecords[0].timestamp : 'N/A'}</div>
                  <div>Newest: {liveHourlyRecords && liveHourlyRecords.length > 0 ? liveHourlyRecords[liveHourlyRecords.length - 1].timestamp : 'N/A'}</div>
                  <div>Target Disease: {selectedResearchDisease}</div>
                </div>
              </div>

              {researchRiskResult?.exposureFeatures && (
                <div className="border-t border-slate-800 pt-2 text-slate-300">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Extracted 14-Day Features</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-1 text-[10px]">
                    <div>Rainfall: {researchRiskResult.exposureFeatures.cumulative_rainfall_14d_mm} mm</div>
                    <div>Rain Days: {researchRiskResult.exposureFeatures.rainfall_days_14d_count} days</div>
                    <div>RH ≥80%: {researchRiskResult.exposureFeatures.hours_rh_ge_80pct} hrs</div>
                    <div>Temp 22-32°C: {researchRiskResult.exposureFeatures.hours_temp_favorable_22_32C} hrs</div>
                    <div>Dew Proxy: {researchRiskResult.exposureFeatures.hours_dew_condensation_proxy} hrs</div>
                    <div>Mean Temp: {researchRiskResult.exposureFeatures.mean_temperature}°C</div>
                    <div>Mean RH: {researchRiskResult.exposureFeatures.mean_relative_humidity}%</div>
                    <div>Window: {researchRiskResult.exposureFeatures.windowHours} hrs</div>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold mr-2">Evaluated Category:</span>
                  <span className={`font-bold ${researchRiskResult?.riskLevel === 'HIGH' ? 'text-rose-400' : researchRiskResult?.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {researchRiskResult?.riskLevel || envRiskResult.level.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Status: {researchRiskResult?.evidenceStatus || 'POINT_IN_TIME_CALCULATION'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

export default EnvironmentalRiskPage;
