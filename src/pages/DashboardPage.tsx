import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RiskGauge } from '../components/common/RiskGauge';
import { TRANSLATIONS } from '../utils/translations';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Thermometer,
  Droplets,
  Sprout,
  Compass,
  Layers,
  ChevronRight,
  Eye,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  CloudRain,
  Calendar,
} from 'lucide-react';
import { ANALYTICS_DATA } from '../data/mockData';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#10b981'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    predictionHistory,
    multimodalResult,
    imageResult,
    envRiskResult,
    envParameters,
    openDetailedReport,
    hasAnalyzedImage,
  } = useApp();

  const recentPredictions = predictionHistory.slice(0, 4);
  const diseaseKey = multimodalResult.disease as keyof typeof TRANSLATIONS.diseases;
  const diseaseInfo = TRANSLATIONS.diseases[diseaseKey] || {
    en: multimodalResult.disease,
    ta: multimodalResult.disease,
    desc: { en: '', ta: '' },
  };

  // Immediate practical actions based on disease and overall risk
  const getImmediateActions = () => {
    if (!hasAnalyzedImage) {
      return language === 'ta'
        ? [
            'மஞ்சள் இலையின் தெளிவான புகைப்படத்தைப் பதிவேற்றவும் அல்லது படம் எடுக்கவும்.',
            '"படத்தை ஆய்வு செய்" பொத்தானை அழுத்தி AI நோய் கண்டறிதலைத் தொடங்கவும்.',
            'கள வானிலை மற்றும் பயிர் பருவ நிலைக் காரணிகளை மதிப்பாய்வு செய்யவும்.',
          ]
        : [
            'Upload or capture a clear turmeric leaf photo.',
            'Click "Analyze Crop Image" on Disease Detection page to run AI inference.',
            'Review field microclimate conditions and crop stage risk factors.',
          ];
    }

    if (multimodalResult.disease === 'Blotch') {
      return language === 'ta'
        ? [
            'பாதிக்கப்பட்ட இலைகளை உடனடியாக அகற்றி அழித்துவிடவும்.',
            'காற்றோட்டம் கிடைக்க பாத்திகளைச் சுற்றிலும் உள்ள களைகளை நீக்கவும்.',
            'மாலையில் தெளிப்பு நீர்ப்பாசனம் செய்வதைத் தவிர்க்கவும்.',
          ]
        : [
            'Remove and safely dispose of severely infected leaves.',
            'Clear perimeter weeds to improve field airflow.',
            'Avoid evening overhead sprinkler irrigation.',
          ];
    } else if (multimodalResult.disease === 'Leaf Spot') {
      return language === 'ta'
        ? [
            'இலைகளில் தண்ணீர் தேங்காமல் வடித்துவிடவும்.',
            'வேப்பங்கொட்டை கரைசல் அல்லது பரிந்துரைக்கப்பட்ட அங்கக தெளிப்பு மேற்கொள்ளவும்.',
            'அடுத்த 3 நாட்களுக்கு பயிரின் புதிய தளிர்களை கண்காணிக்கவும்.',
          ]
        : [
            'Ensure proper field drainage to reduce foliar moisture.',
            'Consider organic neem-based spray or recommended bio-control.',
            'Inspect emerging shoots closely over the next 3 days.',
          ];
    } else if (multimodalResult.disease === 'Aphids') {
      return language === 'ta'
        ? [
            'இலைகளின் அடியில் 5% வேப்பெண்ணெய் கரைசல் தெளிக்கவும்.',
            'மஞ்சள் வண்ண ஒட்டும் பொறிகளை (Yellow Sticky Traps) ஏக்கருக்கு 6-8 வைக்கவும்.',
            'அசுவினி அதிகம் உள்ள பயிர்களை தனிமைப்படுத்தி கவனிக்கவும்.',
          ]
        : [
            'Spray 5% neem seed kernel extract under the leaf surface.',
            'Install yellow sticky traps (6–8 traps per acre) in the field.',
            'Isolate and monitor high-density aphid patches.',
          ];
    } else {
      return language === 'ta'
        ? [
            'பயிர் ஆரோக்கியமாக உள்ளது; வழக்கமான பாசன முறையைத் தொடரவும்.',
            'மண் ஈரப்பதத்தை சீராகப் பராமரிக்கவும்.',
            'வாரமொருமுறை கள ஆய்வு மேற்கொள்ளவும்.',
          ]
        : [
            'Crop foliage is healthy; maintain standard soil moisture routine.',
            'Ensure steady trench drainage during heavy rains.',
            'Conduct weekly visual foliage scouting.',
          ];
    }
  };

  const immediateActions = getImmediateActions();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {language === 'ta' ? 'தமிழ்நாடு மஞ்சள் பயிர் நலம்' : 'Tamil Nadu Turmeric Health System'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5">
            {language === 'ta' ? 'பயிர் நல முகப்பு' : 'Crop Health Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'ta'
              ? 'மஞ்சள் பயிரின் இலை நலம், சுற்றுச்சூழல் ஆபத்து மற்றும் பரிந்துரைக்கப்படும் நடவடிக்கைகளின் களச் சுருக்கம்.'
              : 'Field overview of turmeric leaf health, environmental risk, and recommended actions.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/disease-detection')}
            className="px-4 py-2.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>{language === 'ta' ? 'புதிய படம் ஆய்வு செய்' : 'Scan New Leaf'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* PRIMARY SECTION: CROP HEALTH STATUS & WHAT SHOULD I DO NOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Crop Health Status Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-white to-agri-50/60 rounded-3xl p-6 border-2 border-agri-300 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-agri-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <h2 className="text-base md:text-lg font-extrabold text-slate-900 font-display">
                  {language === 'ta' ? 'பயிர் நலம் மற்றும் நிலை' : 'Current Crop Health Status'}
                </h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                  !hasAnalyzedImage
                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                    : multimodalResult.disease === 'Healthy'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {!hasAnalyzedImage
                  ? language === 'ta'
                    ? 'ஆய்வுக்குத் தயார்'
                    : 'Ready to Scan'
                  : multimodalResult.disease === 'Healthy'
                  ? language === 'ta'
                    ? 'ஆரோக்கியமான பயிர்'
                    : 'Healthy Foliage'
                  : language === 'ta'
                  ? 'நோய் கண்டறியப்பட்டது'
                  : 'Disease Detected'}
              </span>
            </div>

            {/* Disease & Confidence Grid */}
            <div className="grid grid-cols-2 gap-3.5 my-4">
              <div className="p-3.5 bg-white rounded-2xl border border-agri-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'ta' ? 'கண்டறியப்பட்ட நோய்' : 'Identified Disease'}
                </span>
                <div className="text-lg md:text-xl font-black text-slate-900 font-display mt-0.5">
                  {hasAnalyzedImage
                    ? (diseaseInfo[language] || multimodalResult.disease)
                    : (language === 'ta' ? 'இலைப்படம் ஆய்வு தேவை' : 'Awaiting Leaf Scan')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {hasAnalyzedImage
                    ? diseaseInfo.desc[language]
                    : (language === 'ta'
                        ? 'நோய் அறிகுறிகளை ஆய்வு செய்ய புகைப்படத்தைப் பதிவேற்றவும்.'
                        : 'Upload or capture a leaf photo to trigger AI pathology analysis.')}
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-agri-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ta' ? 'மாடல் நம்பிக்கை மதிப்பு' : 'Model Confidence'}
                  </span>
                  <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                    {hasAnalyzedImage ? `${multimodalResult.imageConfidence}%` : '—'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  {hasAnalyzedImage
                    ? (language === 'ta' ? 'இலைப்பட பரிசோதனை' : 'Visual leaf analysis')
                    : (language === 'ta' ? 'பரிசோதனைக்கு காத்திருக்கிறது' : 'Awaiting inference')}
                </div>
              </div>
            </div>

            {/* Environmental & Overall Risk Breakdown */}
            <div className="grid grid-cols-2 gap-3 bg-white/90 p-3.5 rounded-2xl border border-agri-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {language === 'ta' ? 'சுற்றுச்சூழல் அபாயம்' : 'Field Weather Risk'}
                </span>
                <div className="text-base font-extrabold text-amber-700 font-mono mt-0.5">
                  {multimodalResult.environmentalRisk}% ({envRiskResult.level})
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {language === 'ta' ? 'மொத்த பயிர் அபாயம்' : 'Overall Crop Risk'}
                </span>
                <div className="text-base font-extrabold text-rose-700 font-mono mt-0.5">
                  {multimodalResult.overallRisk}% ({multimodalResult.riskLevel})
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate('/disease-detection')}
              className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{language === 'ta' ? 'இலைப்பகுதி பார்க்க' : 'View Leaf Scan'}</span>
            </button>
            <button
              onClick={() => navigate('/multimodal-analysis')}
              className="py-2.5 px-4 bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{language === 'ta' ? 'முழு அபாய விபரம்' : 'Detailed Risk Flow'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Immediate Practical Actions: WHAT SHOULD I DO NOW */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h2 className="text-base md:text-lg font-extrabold text-slate-900 font-display">
                  {TRANSLATIONS.status.whatToDoNow[language]}
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {language === 'ta' ? 'உடனடி பணிகள்' : 'Immediate Actions'}
              </span>
            </div>

            <div className="my-4 space-y-2.5">
              {immediateActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 hover:bg-agri-50/60 rounded-2xl border border-slate-200/80 transition-colors flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-slate-800 leading-snug">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {language === 'ta' ? 'TNAU வழிகாட்டுதல்படி' : 'Agronomic decision-support'}
            </span>
            <button
              onClick={() => navigate('/recommendations')}
              className="py-2.5 px-4 bg-agri-50 hover:bg-agri-100 text-agri-950 font-bold text-xs rounded-xl border border-agri-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{language === 'ta' ? 'அனைத்துப் பரிந்துரைகளும்' : 'All Recommendations'}</span>
              <ArrowRight className="w-4 h-4 text-agri-700" />
            </button>
          </div>
        </div>
      </div>

      {/* SEASONAL INTELLIGENCE CONTEXT BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-agri-900 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-xl">
              🌦️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {TRANSLATIONS.season.title[language]}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {TRANSLATIONS.season.currentSeason[language]}
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-white mt-1">
                {TRANSLATIONS.season.cropPhase[language]}
              </h3>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-3xl leading-relaxed">
                {TRANSLATIONS.season.riskNote[language]} {TRANSLATIONS.season.advisory[language]}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/environmental-risk')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 self-start md:self-auto shrink-0 cursor-pointer"
          >
            <span>{language === 'ta' ? 'சுற்றுச்சூழல் நிலை' : 'View Field Conditions'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECONDARY SECTION: FARM STATISTICS & ANALYTICS */}
      <div>
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? 'களப் புள்ளிவிவரங்கள்' : 'Farm Statistics & Analytics'}
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
            {language === 'ta' ? 'மதிப்பீட்டு மாதிரி தரவுத்தொகுப்பு (128 மாதிரிகள்)' : 'Reference Evaluation Cohort (128 Samples)'}
          </span>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4.5 rounded-2xl border border-[#e2ece6] shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'ta' ? 'மொத்த சோதனைகள்' : 'Total Field Scans'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">128</div>
            <div className="text-[10px] text-slate-500 mt-1">
              {language === 'ta' ? 'மாதிரித் தொகுப்பில் உள்ள சோதனைகள்' : 'Reference cohort evaluation scans'}
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-[#e2ece6] shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'ta' ? 'ஆரோக்கியமான இலைகள்' : 'Healthy Crops'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 font-display mt-2">54</div>
            <div className="text-[10px] text-slate-500 mt-1">42.2% {language === 'ta' ? 'ஆரோக்கியமானது' : 'healthy foliage'}</div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-[#e2ece6] shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'ta' ? 'நோய் அறிகுறிகள்' : 'Disease Symptoms'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 font-display mt-2">74</div>
            <div className="text-[10px] text-slate-500 mt-1">57.8% {language === 'ta' ? 'கண்காணிப்பில்' : 'positive symptoms'}</div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-[#e2ece6] shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'ta' ? 'அதிக அபாய நிலை' : 'Action Required'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-rose-600 font-display mt-2">21</div>
            <div className="text-[10px] text-slate-500 mt-1">{language === 'ta' ? 'உடனடி பணி தேவை' : 'High priority plots'}</div>
          </div>
        </div>

        {/* Charts & History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gauge */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#e2ece6] shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  {language === 'ta' ? 'பயிர் அபாய அளவீடு' : 'Current Crop Risk Index'}
                </h3>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {multimodalResult.riskLevel}
                </span>
              </div>
              <div className="py-4 flex justify-center">
                <RiskGauge
                  score={multimodalResult.overallRisk}
                  size={170}
                  strokeWidth={14}
                  showLabel={true}
                  subtitle={language === 'ta' ? 'மொத்த அபாயம்' : 'OVERALL RISK'}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              {language === 'ta'
                ? 'இலை அறிகுறி மற்றும் தற்போதைய கள சூழல் அளவீடுகள் அடிப்படையில் கணக்கிடப்பட்டது.'
                : 'Decision-support index based on visual leaf symptoms and environmental parameters.'}
            </p>
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#e2ece6] shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  {language === 'ta' ? 'நோய்களின் விகிதம்' : 'Pathology Composition'}
                </h3>
                <span className="text-xs text-slate-400">128 {language === 'ta' ? 'மாதிரிகள்' : 'Samples'}</span>
              </div>
              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ANALYTICS_DATA.diseaseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="name"
                    >
                      {ANALYTICS_DATA.diseaseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} samples`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2ece6',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-xs font-semibold text-slate-700 mr-2">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
