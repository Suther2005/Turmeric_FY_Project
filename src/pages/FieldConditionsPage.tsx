import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EnvironmentalParameters, EnvironmentalRiskResult } from '../types';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Sprout,
  TestTubes,
  Sun,
  Wind,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Lightbulb,
  Camera,
} from 'lucide-react';

interface ParameterConfig {
  key: keyof EnvironmentalParameters;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: { en: string; ta: string };
  unit: string;
  min: number;
  max: number;
  step: number;
  hint: { en: string; ta: string };
  exampleVal: number;
}

const PARAMETER_CONFIGS: ParameterConfig[] = [
  {
    key: 'temperature',
    icon: Thermometer,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    label: { en: 'Temperature', ta: 'வெப்பநிலை' },
    unit: '°C',
    min: 10,
    max: 50,
    step: 0.1,
    hint: { en: 'Typical: 24–34 °C', ta: 'வழக்கமான அளவு: 24–34 °C' },
    exampleVal: 28.5,
  },
  {
    key: 'humidity',
    icon: Droplets,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    label: { en: 'Relative Humidity', ta: 'காற்று ஈரப்பதம்' },
    unit: '%',
    min: 10,
    max: 100,
    step: 1,
    hint: { en: 'Typical: 50–90 %', ta: 'வழக்கமான அளவு: 50–90 %' },
    exampleVal: 78,
  },
  {
    key: 'rainfall',
    icon: CloudRain,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    label: { en: 'Recent Rainfall', ta: 'சமீபத்திய மழைப்பொழிவு' },
    unit: 'mm',
    min: 0,
    max: 300,
    step: 0.1,
    hint: { en: 'Typical: 0–50 mm', ta: 'வழக்கமான அளவு: 0–50 மி.மீ' },
    exampleVal: 12.0,
  },
  {
    key: 'soilMoisture',
    icon: Sprout,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    label: { en: 'Soil Moisture', ta: 'மண் ஈரப்பதம்' },
    unit: '%',
    min: 0,
    max: 100,
    step: 1,
    hint: { en: 'Typical: 40–75 %', ta: 'வழக்கமான அளவு: 40–75 %' },
    exampleVal: 62,
  },
  {
    key: 'soilPh',
    icon: TestTubes,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    label: { en: 'Soil pH', ta: 'மண் அமில-கார நிலை (pH)' },
    unit: 'pH',
    min: 3.0,
    max: 10.0,
    step: 0.1,
    hint: { en: 'Optimal: 6.0–7.2', ta: 'உகந்த அளவு: 6.0–7.2' },
    exampleVal: 6.4,
  },
  {
    key: 'leafWetness',
    icon: Droplets,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    label: { en: 'Leaf Wetness', ta: 'இலை ஈரப்பதம்' },
    unit: '%',
    min: 0,
    max: 100,
    step: 1,
    hint: { en: 'Typical: 20–80 %', ta: 'வழக்கமான அளவு: 20–80 %' },
    exampleVal: 68,
  },
  {
    key: 'sunlightHours',
    icon: Sun,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    label: { en: 'Sunlight Duration', ta: 'சூரிய ஒளி நேரம்' },
    unit: 'hours',
    min: 0,
    max: 16,
    step: 0.5,
    hint: { en: 'Typical: 4–10 hours', ta: 'வழக்கமான அளவு: 4–10 மணி நேரம்' },
    exampleVal: 6.5,
  },
  {
    key: 'windSpeed',
    icon: Wind,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    label: { en: 'Wind Speed', ta: 'காற்றின் வேகம்' },
    unit: 'km/h',
    min: 0,
    max: 100,
    step: 0.5,
    hint: { en: 'Typical: 5–25 km/h', ta: 'வழக்கமான அளவு: 5–25 கி.மீ/மணி' },
    exampleVal: 9.5,
  },
];

const EXAMPLE_VALUES: Record<keyof EnvironmentalParameters, string> = {
  temperature: '28.5',
  humidity: '78',
  rainfall: '12.0',
  soilMoisture: '62',
  soilPh: '6.4',
  leafWetness: '68',
  sunlightHours: '6.5',
  windSpeed: '9.5',
};

const EMPTY_VALUES: Record<keyof EnvironmentalParameters, string> = {
  temperature: '',
  humidity: '',
  rainfall: '',
  soilMoisture: '',
  soilPh: '',
  leafWetness: '',
  sunlightHours: '',
  windSpeed: '',
};

export const FieldConditionsPage: React.FC = () => {
  const {
    language,
    analyzeManualFieldConditions,
    addToast,
  } = useApp();

  // Initial state starts blank so it does not look like fake pre-measured field data
  const [formInputs, setFormInputs] = useState<Record<keyof EnvironmentalParameters, string>>(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EnvironmentalParameters, string>>>({});
  const [analyzedResult, setAnalyzedResult] = useState<EnvironmentalRiskResult | null>(null);
  const [lastAnalyzedInputs, setLastAnalyzedInputs] = useState<Record<keyof EnvironmentalParameters, string> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle single input change
  const handleInputChange = (key: keyof EnvironmentalParameters, rawValue: string) => {
    setFormInputs((prev) => ({ ...prev, [key]: rawValue }));

    if (rawValue.trim() === '') {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const numValue = parseFloat(rawValue);
    const config = PARAMETER_CONFIGS.find((c) => c.key === key);
    if (config) {
      if (isNaN(numValue) || numValue < config.min || numValue > config.max) {
        setFieldErrors((prev) => ({
          ...prev,
          [key]:
            language === 'ta'
              ? `${config.min} முதல் ${config.max} ${config.unit} வரை உள்ளிடவும்`
              : `Must be between ${config.min} and ${config.max} ${config.unit}`,
        }));
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    }
  };

  // Populate example demonstration values
  const handleLoadExamples = () => {
    setFormInputs(EXAMPLE_VALUES);
    setFieldErrors({});
    addToast({
      type: 'info',
      title: language === 'ta' ? 'மாதிரி அளவீடுகள் ஏற்றப்பட்டன' : 'Example Values Loaded',
      message:
        language === 'ta'
          ? 'ஆய்விற்கான மாதிரி கள அளவீடுகள் உள்ளிடப்பட்டன.'
          : 'Demonstration field measurements populated. Click "Analyze Field Conditions" to evaluate.',
    });
  };

  // Clear inputs
  const handleClearInputs = () => {
    setFormInputs(EMPTY_VALUES);
    setFieldErrors({});
    setAnalyzedResult(null);
    setLastAnalyzedInputs(null);
    addToast({
      type: 'info',
      title: language === 'ta' ? 'அளவீடுகள் அழிக்கப்பட்டன' : 'Inputs Cleared',
      message:
        language === 'ta'
          ? 'அனைத்து உள்ளீட்டு புலங்களும் அழிக்கப்பட்டன.'
          : 'All field parameter inputs have been reset to blank.',
    });
  };

  // Submit and analyze
  const handleAnalyze = () => {
    const errors: Partial<Record<keyof EnvironmentalParameters, string>> = {};
    const parsedValues: Partial<EnvironmentalParameters> = {};

    PARAMETER_CONFIGS.forEach((config) => {
      const raw = formInputs[config.key];
      if (raw === undefined || raw.trim() === '') {
        errors[config.key] =
          language === 'ta' ? 'அளவீட்டை உள்ளிடவும்' : 'Value required';
        return;
      }

      const num = parseFloat(raw);
      if (isNaN(num) || num < config.min || num > config.max) {
        errors[config.key] =
          language === 'ta'
            ? `${config.min} - ${config.max} ${config.unit} வரம்பிற்குள் இருக்க வேண்டும்`
            : `Must be between ${config.min} and ${config.max} ${config.unit}`;
      } else {
        parsedValues[config.key] = num;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      addToast({
        type: 'warning',
        title: language === 'ta' ? 'அளவீடுகளை சரிபார்க்கவும்' : 'Check Input Values',
        message:
          language === 'ta'
            ? 'அனைத்து 8 அளவீடுகளையும் சரியான வரம்பிற்குள் உள்ளிடவும்.'
            : 'Please provide valid measurements for all 8 field parameters before analysis.',
      });
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeManualFieldConditions(parsedValues as EnvironmentalParameters);
      setAnalyzedResult(result);
      setLastAnalyzedInputs({ ...formInputs });
      setIsAnalyzing(false);

      const levelLabel =
        result.level === 'High'
          ? language === 'ta'
            ? 'அதிக அபாயம்'
            : 'HIGH'
          : result.level === 'Moderate'
          ? language === 'ta'
            ? 'மிதமான அபாயம்'
            : 'MODERATE'
          : language === 'ta'
          ? 'குறைந்த அபாயம்'
          : 'LOW';

      addToast({
        type: 'success',
        title: language === 'ta' ? 'சுற்றுச்சூழல் ஆய்வு முடிந்தது' : 'Field Assessment Complete',
        message:
          language === 'ta'
            ? `சுற்றுச்சூழல் அபாய நிலை: ${levelLabel}.`
            : `Environmental risk assessment completed: ${levelLabel}.`,
      });

      // Smooth scroll to results
      setTimeout(() => {
        const resElement = document.getElementById('assessment-result-card');
        if (resElement) {
          resElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center text-xs font-medium text-slate-400 gap-1.5 pt-1">
        <Link to="/dashboard" className="hover:text-emerald-700 transition-colors">
          Curcuma
        </Link>
        <span>›</span>
        <span>{language === 'ta' ? 'விவசாய சேவைகள்' : 'Farmer Services'}</span>
        <span>›</span>
        <span className="text-slate-700 font-semibold">
          {language === 'ta' ? 'கள ஆய்வு' : 'Field Check'}
        </span>
      </div>

      {/* 2. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <TestTubes className="w-5 h-5 text-emerald-700" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {language === 'ta' ? 'கள ஆய்வு' : 'Field Check'}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-0.5">
            {language === 'ta'
              ? 'சுற்றுச்சூழல் அபாயத்தை மதிப்பிட உங்கள் வயல் அளவீடுகளை உள்ளிடவும்.'
              : 'Enter your field measurements to evaluate environmental risk.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleLoadExamples}
            className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ta' ? 'மாதிரி அளவீடுகள்' : 'Use Example Values'}</span>
          </button>
          <button
            onClick={handleClearInputs}
            className="px-3 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'ta' ? 'அழி' : 'Clear'}</span>
          </button>
        </div>
      </div>

      {/* 4. Eight-Parameter Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PARAMETER_CONFIGS.map((config) => {
          const Icon = config.icon;
          const value = formInputs[config.key];
          const hasError = !!fieldErrors[config.key];

          return (
            <div
              key={config.key}
              className={`bg-white p-5 rounded-3xl border transition-all duration-200 shadow-card flex flex-col justify-between space-y-3 ${
                hasError
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-[#e2ece6] hover:border-emerald-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {config.label[language]}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {config.hint[language]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Input Control */}
              <div className="space-y-1.5">
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={value}
                    placeholder={`e.g. ${config.exampleVal}`}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    onChange={(e) => handleInputChange(config.key, e.target.value)}
                    className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                  />
                  <span className="absolute right-3.5 text-xs font-bold text-slate-400 select-none">
                    {config.unit}
                  </span>
                </div>

                {hasError && (
                  <div className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 pl-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors[config.key]}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Analyze Action Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-8 py-3.5 rounded-2xl bg-[#0d4a2d] hover:bg-[#145a38] text-white font-extrabold text-sm md:text-base shadow-md flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{language === 'ta' ? 'ஆய்வு செய்யப்படுகிறது...' : 'Evaluating Risk...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span>{language === 'ta' ? 'கள நிலைமைகளை ஆய்வு செய்' : 'Analyze Field Conditions'}</span>
            </>
          )}
        </button>
      </div>

      {/* 6. Environmental Assessment Result Card */}
      {analyzedResult && lastAnalyzedInputs && (
        <div
          id="assessment-result-card"
          className="bg-white rounded-3xl border-2 border-[#e2ece6] shadow-card p-6 md:p-8 space-y-6 mt-6 transition-all animate-fadeIn"
        >
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {language === 'ta' ? 'மதிப்பீட்டு அறிக்கை' : 'Assessment Result'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 font-display">
                {language === 'ta' ? 'சுற்றுச்சூழல் மதிப்பீடு' : 'Environmental Assessment'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'ta'
                  ? 'உள்ளீடு செய்யப்பட்ட 8 கள அளவீடுகளின் அடிப்படையில் கணக்கிடப்பட்ட சுற்றுச்சூழல் அபாய நிலை.'
                  : 'Rule-based environmental risk evaluation based on your 8 entered field parameters.'}
              </p>
            </div>

            {/* Risk Level Badge (Categorical only, no fake probability percentage) */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div
                className={`px-5 py-2.5 rounded-2xl border flex items-center gap-3 shadow-2xs ${
                  analyzedResult.level === 'High'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : analyzedResult.level === 'Moderate'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}
              >
                {analyzedResult.level === 'High' ? (
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black">
                    !
                  </span>
                ) : analyzedResult.level === 'Moderate' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80 leading-none">
                    {language === 'ta' ? 'சுற்றுச்சூழல் அபாயம்' : 'Environmental Risk'}
                  </span>
                  <span className="text-base font-black uppercase tracking-tight">
                    {analyzedResult.level === 'High'
                      ? language === 'ta'
                        ? 'அதிக அபாயம்'
                        : 'HIGH'
                      : analyzedResult.level === 'Moderate'
                      ? language === 'ta'
                        ? 'மிதமான அபாயம்'
                        : 'MODERATE'
                      : language === 'ta'
                      ? 'குறைந்த அபாயம்'
                      : 'LOW'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observed Conditions Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {language === 'ta' ? 'பதிவு செய்யப்பட்ட கள அளவீடுகள்' : 'Conditions Observed'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PARAMETER_CONFIGS.map((config) => {
                const val = lastAnalyzedInputs[config.key];
                return (
                  <div
                    key={config.key}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block truncate">
                        {config.label[language]}
                      </span>
                      <span className="text-xs md:text-sm font-bold text-slate-800">
                        {val} {config.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environmental Observations */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {language === 'ta' ? 'முக்கிய தாக்கக் காரணிகள்' : 'Key Environmental Observations'}
            </h3>
            <div className="space-y-2">
              {analyzedResult.contributingFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5 font-medium"
                >
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Microclimate Favorability Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-[#fafdfb] border border-[#dcf2e4] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <span className="text-base">🍄</span>
                <span>{language === 'ta' ? 'பூஞ்சை வித்து சாதக நிலை' : 'Foliar Fungal Incubation Favorability'}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {analyzedResult.favorableForFungal
                  ? language === 'ta'
                    ? 'அதிக ஈரப்பதம் மற்றும் இலை நனைவு பூஞ்சை வித்து வளர்ச்சிக்கு சாதகமாக அமையக்கூடும்.'
                    : 'Observed ambient moisture and leaf wetness indicate conditions may be favourable for fungal spore incubation.'
                  : language === 'ta'
                  ? 'தற்போதைய அளவீடுகள் பூஞ்சை வித்து பெருக்கத்திற்கு சாதகமாக இல்லை.'
                  : 'Current microclimate indicators remain below critical foliar fungal incubation thresholds.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fafdfb] border border-[#dcf2e4] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <span className="text-base">🐛</span>
                <span>{language === 'ta' ? 'பூச்சிப் பெருக்க சாதக நிலை' : 'Pest Multiplication Favorability'}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {analyzedResult.favorableForPest
                  ? language === 'ta'
                    ? 'வெதுவெதுப்பான வெப்பநிலை அசுவினி போன்ற சாறு உறிஞ்சும் பூச்சிகளுக்கு சாதகமாக அமையக்கூடும்.'
                    : 'Warm ambient temperature and moderate humidity indicate conditions may be favourable for sap-sucking pest activity.'
                  : language === 'ta'
                  ? 'தற்போதைய அளவீடுகள் தீவிர பூச்சிப் பெருக்கத்திற்கு சாதகமாக இல்லை.'
                  : 'Current temperature and humidity levels do not indicate accelerated pest multiplication pressure.'}
              </p>
            </div>
          </div>

          {/* Navigation Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/recommendations"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-emerald-700" />
              <span>{language === 'ta' ? 'ஆலோசனை காண்க' : 'View Advice'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </Link>

            <Link
              to="/disease-detection"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4 text-slate-500" />
              <span>{language === 'ta' ? 'இலையை ஸ்கேன் செய்' : 'Scan Leaf'}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldConditionsPage;

