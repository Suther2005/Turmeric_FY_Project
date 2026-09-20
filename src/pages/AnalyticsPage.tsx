import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ANALYTICS_DATA } from '../data/mockData';
import {
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Layers,
} from 'lucide-react';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#10b981'];

export const AnalyticsPage: React.FC = () => {
  const { language } = useApp();
  const t = TRANSLATIONS.analytics;
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('7');

  const diseaseDistributionData = ANALYTICS_DATA.diseaseDistribution.map((item) => {
    const diseaseObj = TRANSLATIONS.diseases[item.name as keyof typeof TRANSLATIONS.diseases];
    return {
      ...item,
      displayName: diseaseObj?.short?.[language] || item.name,
    };
  });

  const riskDistributionData = ANALYTICS_DATA.riskDistribution.map((item, idx) => {
    let key: 'low' | 'moderate' | 'high' = 'low';
    if (idx === 1) key = 'moderate';
    if (idx === 2) key = 'high';
    return {
      ...item,
      displayLevel: t.riskLevels[key][language],
    };
  });

  const envTrendsData = ANALYTICS_DATA.environmentalTrends.map((item) => {
    const dayKey = item.day as keyof typeof t.days;
    return {
      ...item,
      displayDay: t.days[dayKey]?.[language] || item.day,
    };
  });

  const confidenceByClassData = ANALYTICS_DATA.confidenceByClass.map((item) => {
    const diseaseObj = TRANSLATIONS.diseases[item.disease as keyof typeof TRANSLATIONS.diseases];
    return {
      ...item,
      displayDisease: diseaseObj?.short?.[language] || item.disease,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
            {t.badge[language]}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5">
            {t.title[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t.subtitle[language]}
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
          {(['7', '30', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                timeRange === range
                  ? 'bg-agri-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '7' ? t.sevenDays[language] : range === '30' ? t.thirtyDays[language] : t.allTime[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Disease Distribution & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" /> {t.diseaseDistTitle[language]}
            </h3>
            <span className="text-xs text-slate-400 font-medium">{t.scansCount[language]}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diseaseDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="displayName"
                >
                  {diseaseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} samples`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2ece6',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" /> {t.riskDistTitle[language]}
            </h3>
            <span className="text-xs text-slate-400 font-medium">{t.riskTiers[language]}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                <XAxis dataKey="displayLevel" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} analyses`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2ece6',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#15803d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Environmental Trends (Temperature vs Humidity Timeline) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e2ece6] shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {t.envTrendsSub[language]}
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {t.envTrendsTitle[language]}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> {t.temp[language]}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> {t.humidity[language]}
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={envTrendsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
              <XAxis dataKey="displayDay" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} unit="°C" domain={[20, 38]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} unit="%" domain={[40, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2ece6',
                  fontSize: '12px',
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name={t.temp[language]} />
              <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name={t.humidity[language]} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Environmental Risk Trend & Confidence by Class */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Risk Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-agri-700" /> {t.riskTimelineTitle[language]}
            </h3>
            <span className="text-xs font-bold text-rose-700 font-mono">{t.peak[language]}</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={envTrendsData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                <XAxis dataKey="displayDay" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" domain={[0, 100]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Risk Score']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2ece6',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="risk" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Confidence by Disease Class */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-agri-700" /> {t.confidenceTitle[language]}
            </h3>
            <span className="text-xs text-slate-400 font-mono">{t.topConfidence[language]}</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceByClassData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                <XAxis dataKey="displayDisease" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, language === 'ta' ? 'சராசரி மாடல் நம்பிக்கை' : 'Average Model Confidence']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2ece6',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="avgConfidence" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
