import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MODEL_METRICS } from '../data/mockData';
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';

export const ModelComparisonPage: React.FC = () => {
  const { language } = useApp();
  const t = TRANSLATIONS.modelComparison;

  // Actual verified internal test metrics (Held-Out Internal Test Set, N=129)
  const internalTestResults = [
    {
      name: 'EfficientNet-B0',
      architecture: 'Convolutional Feature Extractor (Compound Scaling)',
      accuracy: 99.22,
      correctCount: '128 / 129',
      precision: 99.25,
      recall: 99.22,
      f1Score: 99.23,
      latencyMs: 38,
      parametersM: 5.3,
      highlights: [
        'Single-leaf classification accuracy: 99.22%',
        'Penultimate embedding source for Mahalanobis OOD safeguard',
        'Strong spatial feature representation for foliar lesions',
      ],
    },
    {
      name: 'MobileNetV2',
      architecture: 'Inverted Residual Architecture (Depthwise Separable)',
      accuracy: 93.02,
      correctCount: '120 / 129',
      precision: 93.89,
      recall: 93.02,
      f1Score: 93.09,
      latencyMs: 16,
      parametersM: 3.4,
      highlights: [
        'Fastest inference latency: 16ms (optimized for edge mobile devices)',
        'Compact memory footprint (~14 MB quantized)',
        'Lightweight secondary backbone in soft-voting ensemble',
      ],
    },
    {
      name: 'Hybrid Ensemble',
      architecture: 'Soft-Voting Late Fusion Ensemble (alpha = 0.50)',
      accuracy: 99.22,
      correctCount: '128 / 129',
      precision: 99.25,
      recall: 99.22,
      f1Score: 99.23,
      latencyMs: 44,
      parametersM: 8.7,
      highlights: [
        'Matches EfficientNet-B0 test accuracy (99.22%, 128/129 correct)',
        'Soft-voting probability vector: 0.50 * P(EffNet) + 0.50 * P(MobileNet)',
        'Mitigates single-backbone variance across ambiguous lesion boundaries',
      ],
    },
  ];

  // Developmental cohort benchmark chart data (n=200 reference cohort)
  const developmentalChartData = [
    {
      metric: language === 'ta' ? 'ஒப்பீட்டு துல்லியம் (Accuracy)' : 'Benchmark Accuracy',
      'EfficientNet-B0': 94.2,
      MobileNetV2: 91.7,
      'Hybrid Ensemble': 95.1,
    },
    {
      metric: language === 'ta' ? 'துல்லியம் (Precision)' : 'Precision',
      'EfficientNet-B0': 93.9,
      MobileNetV2: 91.4,
      'Hybrid Ensemble': 94.8,
    },
    {
      metric: language === 'ta' ? 'மீட்புத்திறன் (Recall)' : 'Recall',
      'EfficientNet-B0': 93.5,
      MobileNetV2: 91.0,
      'Hybrid Ensemble': 94.5,
    },
    {
      metric: language === 'ta' ? 'எஃப்1 (F1-Score)' : 'F1-Score',
      'EfficientNet-B0': 93.7,
      MobileNetV2: 91.2,
      'Hybrid Ensemble': 94.7,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.badge[language]}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display">
            {TRANSLATIONS.nav.modelPerformance[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t.subtitle[language]}
          </p>
        </div>
      </div>

      {/* 2. SECTION A: ACTUAL PROJECT INTERNAL TEST RESULTS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {language === 'ta' ? 'சரிபார்க்கப்பட்ட முடிவுகள்' : 'Verified Evaluation'}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 font-display">
              {language === 'ta' ? 'உண்மையான திட்ட உள்நிலை சோதனை முடிவுகள்' : 'Actual Project Internal Test Results'}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {language === 'ta' ? 'உள்நிலை சோதனைத் தொகுதி (N=129 படங்கள்)' : 'Held-Out Internal Test Set (N=129)'}
          </span>
        </div>

        {/* Neutral Scientific Summary Note */}
        <div className="p-4 bg-[#f0f9f4] border border-[#d2ecdc] rounded-2xl flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed font-medium">
            <span className="font-bold text-slate-900 block mb-0.5">
              {language === 'ta' ? 'உள்நிலை சோதனை ஒப்பீடு (Internal Test Comparison):' : 'Internal Test Comparison:'}
            </span>
            {language === 'ta'
              ? 'உள்நிலை சோதனைத் தொகுதியில் (N=129), EfficientNet-B0 மற்றும் Hybrid Ensemble (alpha=0.50) இரண்டும் 99.22% துல்லியத்தை (128/129 சரியான கணிப்புகள்) சமமாக பெற்றுள்ளன. MobileNetV2 மாதிரி 16ms வேகத்தில் எட்ஜ் சாதனங்களுக்கு ஏற்ற குறைந்த கணிப்பு நேரத்தை வழங்குகிறது.'
              : 'On the held-out internal test set (N=129, Dataset 01), both EfficientNet-B0 and the Hybrid Ensemble (alpha=0.50) achieved identical high accuracy of 99.22% (128 / 129 correct classifications). MobileNetV2 provides low-latency edge performance (16ms).'}
          </div>
        </div>

        {/* 3 Verified Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {internalTestResults.map((model) => (
            <div
              key={model.name}
              className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    {model.name === 'Hybrid Ensemble' ? (
                      <Layers className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <Cpu className="w-5 h-5 text-slate-700" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {model.correctCount} Correct
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 font-display">
                    {model.name}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {model.architecture}
                  </p>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-2 gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {model.accuracy}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Weighted F1</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {model.f1Score}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Precision</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {model.precision}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recall</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {model.recall}%
                    </span>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-1.5 pt-1">
                  {model.highlights.map((hl, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-start gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edge Footnote */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Latency: <strong className="text-slate-800 font-mono">{model.latencyMs} ms</strong></span>
                <span>Params: <strong className="text-slate-800 font-mono">{model.parametersM} M</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SECTION B: DEVELOPMENTAL / REFERENCE BENCHMARKS */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {language === 'ta' ? 'குறிப்பு மாதிரி ஒப்பீடு' : 'Reference Benchmarking'}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 font-display">
              {language === 'ta' ? 'உருவாக்க நிலை / மாதிரி ஒப்பீடு' : 'Developmental / Reference Benchmark'}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto">
            {language === 'ta' ? 'ஆய்வுத் தொகுதி (n=200)' : 'Developmental Cohort (n=200)'}
          </span>
        </div>

        {/* Clear Mandatory Note */}
        <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed">
            <span className="font-extrabold text-amber-900 block mb-0.5 text-sm">
              {language === 'ta' ? 'உருவாக்க நிலை ஒப்பீட்டு அளவீடுகள் — இறுதி முடிவு அல்ல' : 'Developmental / Reference Benchmark Notice'}
            </span>
            {language === 'ta'
              ? 'கீழே உள்ள அளவீடுகள் மாதிரி உருவாக்க நிலை ஒப்பீட்டுக்காக மட்டுமே ஆவணப்படுத்தப்பட்டுள்ளன; இவை திட்டத்தின் இறுதி உள்நிலை சோதனை முடிவுகள் அல்ல.'
              : 'These are developmental/reference benchmarks and are not the project\'s final internal test results. They represent comparative architecture references across development iterations.'}
          </div>
        </div>

        {/* Comparison Grouped Bar Chart */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e2ece6] shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {t.chartCategory[language]}
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {t.chartTitle[language]}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{t.cohort[language]}</span>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={developmentalChartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2ece6',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                <Bar dataKey="EfficientNet-B0" fill="#64748b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="MobileNetV2" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Hybrid Ensemble" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelComparisonPage;

