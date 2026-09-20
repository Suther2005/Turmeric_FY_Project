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
} from 'lucide-react';

export const ModelComparisonPage: React.FC = () => {
  const { language } = useApp();
  const t = TRANSLATIONS.modelComparison;

  const comparisonChartData = [
    {
      metric: language === 'ta' ? 'ஒப்பீட்டு துல்லியம் (Benchmark Accuracy)' : 'Benchmark Accuracy',
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
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5 text-amber-700" />
            {t.badge[language]}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display">
            {TRANSLATIONS.nav.modelPerformance[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t.subtitle[language]}
          </p>
        </div>
      </div>

      {/* Prominent Research Integrity / Not Validated Notice */}
      <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <span className="font-extrabold text-amber-900 block mb-0.5 text-sm">
            {t.baselineNoteTitle[language]}
          </span>
          {t.baselineNoteText[language]}
        </div>
      </div>

      {/* 3 Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODEL_METRICS.map((model) => {
          const isHybrid = model.name === 'Hybrid Ensemble';
          const modelTrans = (t.models as any)[model.name];
          const typeText = modelTrans?.type?.[language] || model.type;
          const descText = modelTrans?.description?.[language] || model.description;
          const strengthsList = modelTrans?.strengths
            ? modelTrans.strengths.map((s: any) => (typeof s === 'string' ? s : s[language] || s.en))
            : model.strengths;

          return (
            <div
              key={model.name}
              className={`rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-card ${
                isHybrid
                  ? 'bg-gradient-to-b from-white to-agri-50/60 border-2 border-agri-600 ring-2 ring-agri-500/20'
                  : 'bg-white border-[#e2ece6]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-agri-100 text-agri-800 flex items-center justify-center font-bold">
                    {isHybrid ? <Layers className="w-5 h-5 text-agri-800" /> : <Cpu className="w-5 h-5" />}
                  </div>
                  {isHybrid ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-agri-800 text-white uppercase tracking-wider">
                      {t.proposedMethod[language]}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {t.baselineBackbone[language]}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {model.name}
                </h3>
                <div className="text-xs text-agri-700 font-semibold mb-2">{typeText}</div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {descText}
                </p>

                {/* Score Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t.accuracy[language]}</span>
                    <div className="text-base font-extrabold text-slate-900 font-mono">
                      {model.accuracy}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t.f1Score[language]}</span>
                    <div className="text-base font-extrabold text-emerald-700 font-mono">
                      {model.f1Score}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t.precision[language]}</span>
                    <div className="text-sm font-bold text-slate-700 font-mono">
                      {model.precision}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t.recall[language]}</span>
                    <div className="text-sm font-bold text-slate-700 font-mono">
                      {model.recall}%
                    </div>
                  </div>
                </div>

                {/* Characteristics List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t.keyStrengths[language]}
                  </span>
                  {strengthsList.map((st: string, sIdx: number) => (
                    <div key={sIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edge Footnote */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{t.inferenceLatency[language]} <strong>{model.latencyMs}ms</strong></span>
                <span>{t.params[language]} <strong>{model.parametersM}M</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Grouped Bar Chart */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e2ece6] shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
              {t.chartCategory[language]}
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {t.chartTitle[language]}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{t.cohort[language]}</span>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonChartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
              <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
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
              <Legend verticalAlign="top" align="right" />
              <Bar dataKey="EfficientNet-B0" fill="#64748b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="MobileNetV2" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Hybrid Ensemble" fill="#15803d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ModelComparisonPage;
