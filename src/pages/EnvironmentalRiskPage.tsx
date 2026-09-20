import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';
import { HISTORICAL_REANALYSIS_PRESETS, ResearchDiseaseType } from '../utils/researchRiskEngine';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Sprout,
  Compass,
  Sun,
  Wind,
  ArrowRight,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Database,
  Calendar,
  Layers,
  FlaskConical,
  Eye,
  Activity,
  FileCheck,
} from 'lucide-react';

export const EnvironmentalRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    envParameters,
    updateEnvParameter,
    resetEnvParameters,
    envDataSource,
    envRiskResult,
    selectedResearchDisease,
    setSelectedResearchDisease,
    cropDap,
    setCropDap,
    activePresetMode,
    applyHistoricalPreset,
    researchRiskResult,
  } = useApp();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const t = TRANSLATIONS;

  // Disease Descriptions for Farmer Guidance
  const diseaseGuidance = {
    'Leaf Spot': {
      ta: {
        name: 'மஞ்சள் இலைப்புள்ளி நோய்',
        pathogen: 'Colletotrichum capsici',
        watchFor: 'இலையின் நடுப்பகுதியில் தோன்றும் வட்டவடிவ கரும்பழுப்பு நிற புள்ளிகள் மற்றும் மஞ்சள் வளையங்கள்.',
        action: 'மழைநீர் தேங்காமல் பாத்தி வடிகால் அமைக்கவும். அறிகுறிகள் தென்பட்டால் உள்ளூர் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழக (TNAU) அல்லது ICAR-KVK வழிகாட்டுதலின்படி மேலாண்மை செய்யவும்.',
      },
      en: {
        name: 'Turmeric Leaf Spot',
        pathogen: 'Colletotrichum capsici',
        watchFor: 'Circular necrotic brown spots with distinct concentric rings and yellow chlorotic halos on upper leaf surfaces.',
        action: 'Ensure field drainage to prevent waterlogging and splash dispersal. If symptoms appear, follow TNAU / ICAR-KVK / local agricultural extension and product-label guidance.',
      },
    },
    'Leaf Blotch': {
      ta: {
        name: 'மஞ்சள் இலைக்கருகல் நோய்',
        pathogen: 'Taphrina maculans',
        watchFor: 'இலைகளின் இருபுறமும் தோன்றும் சிறிய, செவ்வக வடிவ பழுப்பு மற்றும் கரும் புள்ளிகள்.',
        action: 'காற்றோட்டத்தை மேம்படுத்தவும். அடர்ந்த இலைகளின் அடிப்பகுதியில் காலை பனிநீர் நீண்ட நேரம் தங்குவதைத் தவிர்க்கவும். தமிழ்நாடு வேளாண் வழிகாட்டுதலைப் பின்பற்றவும்.',
      },
      en: {
        name: 'Turmeric Leaf Blotch',
        pathogen: 'Taphrina maculans',
        watchFor: 'Numerous small, rectangular, reddish-brown to dark spots appearing simultaneously on both leaf surfaces.',
        action: 'Improve canopy aeration. Minimize prolonged evening moisture and morning condensation. Follow TNAU / ICAR-KVK and product-label disease management guidance.',
      },
    },
    'Aphids': {
      ta: {
        name: 'அசுவினி & இலைப்பேன் தாக்குதல்',
        pathogen: 'Aphis gossypii / Thrips',
        watchFor: 'இலைகளின் அடிப்பகுதியில் பூச்சிகள் கூட்டமாக இருத்தல், இலைகள் சுருங்குதல் மற்றும் தேன்பனி படிவுகள்.',
        action: 'வறண்ட வெயில் காலத்தில் செடிகளை அடிக்கடி கண்காணிக்கவும். வேப்ப எண்ணெய் கரைசல் அல்லது பரிந்துரைக்கப்பட்ட பூச்சிக்கட்டுப்பாட்டு வழிகாட்டுதல்களைப் பின்பற்றவும்.',
      },
      en: {
        name: 'Aphids & Thrips Infestation',
        pathogen: 'Aphis gossypii / Thrips',
        watchFor: 'Insect colonies clustering under leaf veins, inward foliar curling, and sticky honeydew secretions.',
        action: 'Scout regularly during warm, dry spells. Apply organic neem formulations or follow ICAR-IISR / TNAU extension guidelines.',
      },
    },
  };

  const currentGuidance = diseaseGuidance[selectedResearchDisease][language === 'ta' ? 'ta' : 'en'];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {language === 'ta' ? 'சூழலியல் அபாய மதிப்பீடு' : 'Environmental Risk Assessment'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {t.status.scientificNotice[language]}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5">
            {t.nav.fieldConditions[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'ta'
              ? 'வரலாற்று வானிலை மற்றும் கள அளவீடுகள் மூலம் பயிர் நோய்களுக்கான சூழல் சாதக நிலையை மதிப்பிடுதல் (ஆராய்ச்சி அடிப்படை).'
              : 'Evaluate microclimate favorability for specific turmeric foliar pathologies using environmental features.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetEnvParameters}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'மீட்டமை' : 'Reset Defaults'}</span>
          </button>

          <button
            onClick={() => navigate('/multimodal-analysis')}
            className="px-4 py-2.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>{t.actions.proceedToCombined[language]}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* 1. DISEASE SELECTOR TABS (Disease-Specific Risk Evaluation) */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#e2ece6] shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-agri-700" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              {language === 'ta' ? 'இலக்கு நோய் / பூச்சி தேர்வு:' : 'Target Crop Pathology Selection:'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {language === 'ta' ? 'ஒவ்வொரு நோய்க்கும் தனித்தனி உயிரியல் விதிகள் உள்ளன' : 'Separate biological risk pathways per disease'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Leaf Spot', 'Leaf Blotch', 'Aphids'] as ResearchDiseaseType[]).map((disease) => {
            const isSelected = selectedResearchDisease === disease;
            return (
              <button
                key={disease}
                onClick={() => setSelectedResearchDisease(disease)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-agri-50/80 border-agri-600 ring-2 ring-agri-600/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-agri-900' : 'text-slate-800'}`}>
                    {disease === 'Leaf Spot' ? 'Leaf Spot' : disease === 'Leaf Blotch' ? 'Leaf Blotch' : 'Aphids / Thrips'}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-agri-700" />}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {disease === 'Leaf Spot'
                    ? 'Colletotrichum capsici'
                    : disease === 'Leaf Blotch'
                    ? 'Taphrina maculans'
                    : 'Aphis gossypii'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DATA SOURCE & PRESET SELECTOR BANNER */}
      <div className="bg-white rounded-3xl p-5 border border-[#e2ece6] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg">
              <Database className="w-5 h-5 text-agri-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  {language === 'ta' ? 'சுற்றுச்சூழல் தரவு ஆதாரம்' : 'Environmental Data Source'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-300">
                  {envDataSource === 'reanalysis'
                    ? t.status.historicalReanalysisSource[language]
                    : envDataSource === 'sensor'
                    ? (language === 'ta' ? 'நேரலை சென்சார் கட்டமைப்பு (இணைப்பு நிலுவை)' : 'Sensor Grid Interface (Awaiting Hardware)')
                    : (language === 'ta' ? 'கையேடு கள உள்ளீடு' : 'Manual Field Input')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {envDataSource === 'reanalysis'
                  ? (language === 'ta'
                      ? 'தமிழ்நாட்டின் வரலாற்று ECMWF ERA5-Land மணிநேர வானிலை தரவுத்தொகுப்பு (14-நாள்/336 மணிநேர தொடர்).'
                      : 'ECMWF ERA5-Land historical hourly meteorological reanalysis dataset (Tamil Nadu, 14-day / 336-hour series).')
                  : t.status.manualTemporalWarning[language]}
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyHistoricalPreset('MANUAL_SLIDERS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePresetMode === 'MANUAL_SLIDERS'
                  ? 'bg-agri-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'ta' ? 'கையேடு உள்ளீடு' : 'Manual Sliders'}
            </button>
            <button
              onClick={() => applyHistoricalPreset('ERODE_OCT_2021')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePresetMode === 'ERODE_OCT_2021'
                  ? 'bg-agri-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Erode 2021 Reanalysis
            </button>
            <button
              onClick={() => applyHistoricalPreset('DHARMAPURI_OCT_2023_APHIDS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePresetMode === 'DHARMAPURI_OCT_2023_APHIDS'
                  ? 'bg-agri-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Dharmapuri 2023 Dry Spell
            </button>
          </div>
        </div>

        {/* Crop Stage / DAP Context Banner */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">
                {language === 'ta' ? 'பயிர் வளர்ச்சி நிலை (DAP):' : 'Crop Growth Stage Context (DAP):'}
              </span>{' '}
              <span className="text-slate-600 font-medium">
                {cropDap} {language === 'ta' ? 'நாட்கள்' : 'Days After Planting'} (
                {cropDap < 100
                  ? 'Vegetative Stage'
                  : cropDap <= 170
                  ? 'Rhizome Development Stage'
                  : 'Late Maturity / Senescence'}
                )
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">{language === 'ta' ? 'மாற்றுக:' : 'Adjust DAP:'}</span>
            <input
              type="range"
              min="30"
              max="240"
              step="5"
              value={cropDap}
              onChange={(e) => setCropDap(parseInt(e.target.value))}
              className="w-28 accent-emerald-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-800 w-10 text-right">{cropDap}d</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column: Interactive Microclimate Controls */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-agri-700" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  {language === 'ta' ? 'கள வானிலை அளவீடுகள்' : 'Field Microclimate Parameters'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {language === 'ta' ? 'தேவைக்கேற்ப அளவுகளை மாற்றலாம்' : 'Adjust sliders to test candidate microclimates'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Temperature */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <span>{t.env.temperature[language]}</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-slate-900">
                    {envParameters.temperature} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="0.5"
                  value={envParameters.temperature}
                  onChange={(e) => updateEnvParameter('temperature', parseFloat(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>15°C</span>
                  <span className="text-emerald-700 font-semibold">{language === 'ta' ? 'பூஞ்சை உகந்தது: 22-32°C' : 'Fungal Optimum: 22-32°C'}</span>
                  <span>45°C</span>
                </div>
              </div>

              {/* 2. Relative Humidity */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <span>{t.env.humidity[language]}</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-cyan-700">
                    {envParameters.humidity} %
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={envParameters.humidity}
                  onChange={(e) => updateEnvParameter('humidity', parseInt(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>20%</span>
                  <span className="text-amber-600 font-semibold">{language === 'ta' ? 'உயர் ஈரப்பதம் ≥80%' : 'High moisture ≥80%'}</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 3. Rainfall */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CloudRain className="w-4 h-4" />
                    </div>
                    <span>{t.env.rainfall[language]}</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-blue-700">
                    {envParameters.rainfall} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="1"
                  value={envParameters.rainfall}
                  onChange={(e) => updateEnvParameter('rainfall', parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 mm</span>
                  <span className="text-blue-700 font-semibold">{language === 'ta' ? 'தெறிப்பு பரவல் ≥40mm' : 'Splash Dispersal ≥40mm'}</span>
                  <span>200 mm</span>
                </div>
              </div>

              {/* 4. Soil Moisture (Root Zone) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span>{t.env.soilMoisture[language]}</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-emerald-700">
                    {envParameters.soilMoisture} %
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={envParameters.soilMoisture}
                  onChange={(e) => updateEnvParameter('soilMoisture', parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10%</span>
                  <span className="text-emerald-700 font-semibold">{language === 'ta' ? 'பரிந்துரை: 35-65%' : 'Optimal: 35-65%'}</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 5. Sunlight Duration */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <span>{t.env.sunlightHours[language]}</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-yellow-700">
                    {envParameters.sunlightHours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="0.5"
                  value={envParameters.sunlightHours}
                  onChange={(e) => updateEnvParameter('sunlightHours', parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 hrs</span>
                  <span>14 hrs</span>
                </div>
              </div>

              {/* 6. Wind Speed */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Wind className="w-4 h-4" />
                    </div>
                    <span>{t.env.windSpeed[language]}</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-indigo-700">
                    {envParameters.windSpeed} km/h
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={envParameters.windSpeed}
                  onChange={(e) => updateEnvParameter('windSpeed', parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 km/h</span>
                  <span>40 km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* FARMER DECISION SUPPORT GUIDANCE CARDS */}
          <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold text-agri-700 uppercase tracking-wider block">
                {language === 'ta' ? 'விவசாய வழிகாட்டுதல்' : 'Farmer Decision Support'}
              </span>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {currentGuidance.name} ({currentGuidance.pathogen})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* What should I watch for? */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Eye className="w-4 h-4 text-amber-700" />
                  <span>{language === 'ta' ? 'கண்காணிக்க வேண்டிய அறிகுறிகள்:' : 'What should I watch for?'}</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-medium">
                  {currentGuidance.watchFor}
                </p>
              </div>

              {/* What should I do? */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'ta' ? 'பரிந்துரைக்கப்படும் களப்பணி:' : 'What should I do?'}</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  {currentGuidance.action}
                </p>
              </div>
            </div>

            {/* Official Guidance Note */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'பயிர் பாதுகாப்பு மருந்துகளைப் பயன்படுத்தும்போது, தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) / ICAR-IISR, உள்ளூர் வேளாண் விரிவாக்க அலுவலர்கள் மற்றும் தயாரிப்பு லேபிள் வழிகாட்டுதல்களை கண்டிப்பாகப் பின்பற்றவும்.'
                  : 'When applying crop protection inputs, follow TNAU / ICAR-IISR / local agricultural extension and product-label guidance.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Environmental Risk Output Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-agri-200 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-agri-700 uppercase tracking-wider block">
                  {researchRiskResult
                    ? t.status.fourteenDayHistoricalAssessment[language]
                    : t.status.currentFieldConditions[language]}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {selectedResearchDisease} Risk
                </h3>
              </div>
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  researchRiskResult
                    ? researchRiskResult.riskLevel === 'HIGH'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : researchRiskResult.riskLevel === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : envRiskResult.level === 'High'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : envRiskResult.level === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {researchRiskResult
                  ? `${researchRiskResult.riskLevel} Risk`
                  : t.status.currentConditionAssessment[language]}
              </span>
            </div>

            {/* Assessment State Display */}
            {researchRiskResult ? (
              /* 14-Day Historical Exposure Baseline (ERA5 Reanalysis Records) */
              <div className="space-y-4">
                <div className="py-3 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    {t.status.fourteenDayHistoricalAssessment[language]}
                  </span>
                  <div
                    className={`text-2xl font-black font-display ${
                      researchRiskResult.riskLevel === 'HIGH'
                        ? 'text-rose-700'
                        : researchRiskResult.riskLevel === 'MODERATE'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {researchRiskResult.riskLevel === 'HIGH'
                      ? (language === 'ta' ? 'அதிக அபாய சாதக நிலை' : 'HIGH RISK CONDITIONS')
                      : researchRiskResult.riskLevel === 'MODERATE'
                      ? (language === 'ta' ? 'மிதமான அபாய சாதக நிலை' : 'MODERATE RISK CONDITIONS')
                      : (language === 'ta' ? 'குறைந்த அபாய நிலை' : 'LOW RISK CONDITIONS')}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {t.status.scientificNotice[language]}
                  </p>
                </div>

                {/* Why this risk? Section */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    {language === 'ta' ? 'இந்த அபாயத்திற்கான காரணங்கள்:' : 'Why this risk?'}
                  </span>
                  <div className="space-y-1.5">
                    {researchRiskResult.explanation.contributingFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/80 flex items-start gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phenology Context Note */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs text-emerald-900">
                  <span className="font-bold block mb-0.5">
                    {language === 'ta' ? 'பயிர் பருவ நிலை குறிப்பு:' : 'Crop Stage Context:'}
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    {researchRiskResult.phenologyContext.susceptibilityNote}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-1 italic">
                    * {language === 'ta' ? 'பயிர் வளர்ச்சி நிலை தற்போதைய ஆராய்ச்சி அடிப்படையிலான சூழல் தகவலாக மட்டுமே பயன்படுத்தப்படுகிறது.' : 'Crop stage is used as contextual information in the current research baseline.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Current Field Condition Heuristic (Manual Sliders) */
              <div className="space-y-4">
                <div className="py-3 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    {t.status.currentFieldConditions[language]}
                  </span>
                  <div
                    className={`text-xl md:text-2xl font-black font-display ${
                      envRiskResult.level === 'High'
                        ? 'text-rose-700'
                        : envRiskResult.level === 'Moderate'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {envRiskResult.level === 'High'
                      ? (language === 'ta' ? 'அதிக தற்போதைய சாதக நிலை' : 'HIGH CURRENT FAVORABILITY')
                      : envRiskResult.level === 'Moderate'
                      ? (language === 'ta' ? 'மிதமான தற்போதைய சாதக நிலை' : 'MODERATE CURRENT FAVORABILITY')
                      : (language === 'ta' ? 'குறைந்த தற்போதைய சாதக நிலை' : 'LOW CURRENT FAVORABILITY')}
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {t.status.currentConditionHeuristic[language]}
                  </p>
                </div>

                {/* Instant Contributing Factors */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    {language === 'ta' ? 'தற்போதைய கள நிலை காரணிகள்:' : 'Current Observation Factors:'}
                  </span>
                  <div className="space-y-1.5">
                    {envRiskResult.contributingFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/80 flex items-start gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 14-day unavailable disclosure */}
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{t.status.temporalAssessmentUnavailable[language]}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-950/90">
                    {t.status.manualTemporalWarning[language]}
                  </p>
                </div>
              </div>
            )}

            {/* Collapsible Advanced Technical Details */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-agri-700" />
                  <span>{showAdvanced ? (language === 'ta' ? 'விவரங்களை மறை' : 'Hide Advanced Details') : (language === 'ta' ? 'மேலும் தொழில்நுட்ப விவரங்கள்' : 'View Advanced Details')}</span>
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="p-4 bg-white space-y-3.5 border-t border-slate-200 text-xs">
                  {envDataSource === 'manual' || !researchRiskResult ? (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-950 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{t.status.insufficientTemporal[language]}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900/90">
                        {t.status.manualTemporalNote[language]}
                      </p>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        {language === 'ta' ? '14-நாள் வரலாற்று வெளிப்பாடு அளவீடுகள்:' : '14-Day Antecedent Exposure Metrics:'}
                      </span>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block">RH ≥ 80% Hours:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {researchRiskResult.exposureFeatures.hours_rh_ge_80pct} hrs / 336h
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block">Temp Opt (22-32°C):</span>
                          <span className="font-mono font-bold text-slate-800">
                            {researchRiskResult.exposureFeatures.hours_temp_favorable_22_32C} hrs / 336h
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block">Dew Proxy Hours:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {researchRiskResult.exposureFeatures.hours_dew_condensation_proxy} hrs
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block">14d Cumulative Rain:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {researchRiskResult.exposureFeatures.cumulative_rainfall_14d_mm} mm ({researchRiskResult.exposureFeatures.rainfall_days_14d_count} rain days)
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Dew Proxy Technical Note */}
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-[10px] text-blue-900 leading-snug">
                    <span className="font-bold block">
                      {language === 'ta' ? 'பனிப்பொழிவு / ஒடுக்க மதிப்பீடு விளக்கம்:' : 'Atmospheric Dew Proxy Definition:'}
                    </span>
                    {language === 'ta'
                      ? 'பனிப்புள்ளி மற்றும் காற்று வெப்பநிலை இடைவெளி (T - T_dew) ≤ 1.5°C உள்ள மணிநேரங்கள் வளிமண்டல நீராவி ஒடுக்க அளவீடாக கணக்கிடப்படுகிறது; இது நேரடி இலை நனைவு சென்சார் அளவீடு அல்ல.'
                      : 'Hours where dew point depression (T - T_dew) ≤ 1.5°C represent an atmospheric condensation proxy, not direct measured leaf wetness.'}
                  </div>

                  {/* Scientific Status & Limitations */}
                  <div className="space-y-1 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-700 block">
                      {language === 'ta' ? 'ஆராய்ச்சி நிலை & வரம்புகள் (RETROSPECTIVE CONSISTENCY ONLY):' : 'Methodological Status & Limitations (RETROSPECTIVE CONSISTENCY ONLY):'}
                    </span>
                    <p>• {t.status.scientificNotice[language]}</p>
                    <p>• Meteorological associations reflect candidate biophysical permissiveness, not causal disease generation.</p>
                    <p>• Reanalysis (ERA5-Land) data represent regional atmospheric estimates (~9km grid) and are not direct in-situ field sensor measurements.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Button */}
            <button
              onClick={() => navigate('/multimodal-analysis')}
              className="w-full py-3 bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.actions.proceedToCombined[language]}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalRiskPage;
