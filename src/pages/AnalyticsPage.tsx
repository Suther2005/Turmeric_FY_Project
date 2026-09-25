import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import {
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Layers,
  Camera,
  ArrowRight,
  Info,
} from 'lucide-react';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#10b981'];

export const AnalyticsPage: React.FC = () => {
  const { language, predictionHistory, liveHourlyRecords, envParameters } = useApp();
  const t = TRANSLATIONS.analytics;
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('7');

  // Filter history records by selected time range
  const filteredRecords = useMemo(() => {
    if (timeRange === 'all') return predictionHistory;
    const now = Date.now();
    const days = timeRange === '7' ? 7 : 30;
    return predictionHistory.filter((r) => {
      const recTime = r.timestamp ? new Date(r.timestamp).getTime() : new Date(r.date).getTime();
      if (isNaN(recTime)) return true;
      return (now - recTime) / (1000 * 60 * 60 * 24) <= days;
    });
  }, [predictionHistory, timeRange]);

  const totalScans = filteredRecords.length;

  // 1. Dynamic Disease Distribution
  const diseaseDistributionData = useMemo(() => {
    if (totalScans === 0) return [];
    const counts: Record<string, number> = {
      Blotch: 0,
      'Leaf Spot': 0,
      Aphids: 0,
      Healthy: 0,
    };

    filteredRecords.forEach((r) => {
      if (r.disease === 'Blotch') {
        counts.Blotch += 1;
      } else if (r.disease === 'Leaf Spot') {
        counts['Leaf Spot'] += 1;
      } else if (r.disease === 'Aphids') {
        counts.Aphids += 1;
      } else if (r.disease === 'Healthy') {
        counts.Healthy += 1;
      }
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => {
        const diseaseObj = TRANSLATIONS.diseases[name as keyof typeof TRANSLATIONS.diseases];
        return {
          name,
          displayName: diseaseObj?.short?.[language] || name,
          count,
          percentage: totalScans > 0 ? Number(((count / totalScans) * 100).toFixed(1)) : 0,
        };
      });
  }, [filteredRecords, totalScans, language]);

  // 2. Dynamic Risk Distribution
  const riskDistributionData = useMemo(() => {
    if (totalScans === 0) return [];
    let low = 0;
    let moderate = 0;
    let high = 0;

    filteredRecords.forEach((r) => {
      if (r.status === 'High' || r.overallRisk >= 68) {
        high += 1;
      } else if (r.status === 'Moderate' || (r.overallRisk >= 35 && r.overallRisk < 68)) {
        moderate += 1;
      } else {
        low += 1;
      }
    });

    return [
      {
        displayLevel: t.riskLevels.low[language],
        count: low,
        percentage: totalScans > 0 ? Number(((low / totalScans) * 100).toFixed(1)) : 0,
      },
      {
        displayLevel: t.riskLevels.moderate[language],
        count: moderate,
        percentage: totalScans > 0 ? Number(((moderate / totalScans) * 100).toFixed(1)) : 0,
      },
      {
        displayLevel: t.riskLevels.high[language],
        count: high,
        percentage: totalScans > 0 ? Number(((high / totalScans) * 100).toFixed(1)) : 0,
      },
    ];
  }, [filteredRecords, totalScans, language, t.riskLevels]);

  // 3. Dynamic Confidence by Class
  const confidenceByClassData = useMemo(() => {
    if (totalScans === 0) return [];
    const totals: Record<string, { sum: number; count: number }> = {
      Blotch: { sum: 0, count: 0 },
      'Leaf Spot': { sum: 0, count: 0 },
      Aphids: { sum: 0, count: 0 },
      Healthy: { sum: 0, count: 0 },
    };

    filteredRecords.forEach((r) => {
      let key = 'Healthy';
      if (r.disease === 'Blotch') key = 'Blotch';
      else if (r.disease === 'Leaf Spot') key = 'Leaf Spot';
      else if (r.disease === 'Aphids') key = 'Aphids';

      if (r.confidence > 0) {
        totals[key].sum += r.confidence;
        totals[key].count += 1;
      }
    });

    return Object.entries(totals)
      .filter(([_, data]) => data.count > 0)
      .map(([disease, data]) => {
        const diseaseObj = TRANSLATIONS.diseases[disease as keyof typeof TRANSLATIONS.diseases];
        return {
          disease,
          displayDisease: diseaseObj?.short?.[language] || disease,
          avgConfidence: Number((data.sum / data.count).toFixed(1)),
          samples: data.count,
        };
      });
  }, [filteredRecords, totalScans, language]);

  // 4. Live Environmental Trends (from Open-Meteo 14-day / 7-day hourly records if available)
  const envTrendsData = useMemo(() => {
    if (!liveHourlyRecords || liveHourlyRecords.length === 0) {
      // Fallback single-day baseline from current env parameters
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dayKey = days[d.getDay()] as keyof typeof t.days;
        return {
          day: days[d.getDay()],
          displayDay: t.days[dayKey]?.[language] || days[d.getDay()],
          temp: Number((envParameters.temperature + (i % 2 === 0 ? 0.5 : -0.5)).toFixed(1)),
          humidity: Math.min(100, Math.max(20, envParameters.humidity + (i % 3 === 0 ? 3 : -2))),
          risk: Math.min(100, Math.max(10, Math.round(envParameters.humidity * 0.6 + envParameters.temperature * 0.8))),
        };
      });
    }

    // Aggregate contiguous 336-hour live weather records into daily 24-hour means
    const dailyMap = new Map<string, { tempSum: number; rhSum: number; count: number }>();
    liveHourlyRecords.forEach((rec) => {
      const dateKey = rec.timestamp.split('T')[0];
      const entry = dailyMap.get(dateKey) || { tempSum: 0, rhSum: 0, count: 0 };
      entry.tempSum += rec.temperature_2m;
      entry.rhSum += rec.relative_humidity_2m;
      entry.count += 1;
      dailyMap.set(dateKey, entry);
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const entries = Array.from(dailyMap.entries()).slice(-7); // Last 7 days

    return entries.map(([dateStr, data]) => {
      const dateObj = new Date(dateStr);
      const dayName = days[dateObj.getDay()] || dateStr;
      const dayKey = dayName as keyof typeof t.days;
      const avgTemp = Number((data.tempSum / data.count).toFixed(1));
      const avgRh = Number((data.rhSum / data.count).toFixed(1));
      const estRisk = Math.min(95, Math.max(12, Math.round(avgRh * 0.65 + avgTemp * 0.6)));

      return {
        day: dayName,
        displayDay: t.days[dayKey]?.[language] || dayName,
        temp: avgTemp,
        humidity: avgRh,
        risk: estRisk,
      };
    });
  }, [liveHourlyRecords, envParameters, language, t.days]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {t.badge[language]}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5">
            {t.title[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t.subtitle[language]}
          </p>
        </div>

        {/* Scan History Time Range Filter */}
        <div className="flex flex-col sm:items-end gap-1 self-start sm:self-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === 'ta' ? 'பரிசோதனை பதிவுகள் காலம்' : 'Scan History Scope'}
          </span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
            {(['7', '30', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  timeRange === range
                    ? 'bg-[#0d4a2d] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '7' ? t.sevenDays[language] : range === '30' ? t.thirtyDays[language] : t.allTime[language]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Disease & Risk Distribution Row */}
      {totalScans === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#e2ece6] shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <PieIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {language === 'ta' ? 'இன்னும் பரிசோதனை பதிவுகள் இல்லை' : 'No Scan Records Yet'}
            </h3>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
              {language === 'ta'
                ? 'உங்கள் மஞ்சள் இலையை ஆய்வு செய்யும்போது, நோய்களின் பரவல் மற்றும் அபாய நிலைகள் இங்கே வரைபடமாக தோன்றும்.'
                : 'When you scan turmeric leaves, disease distributions, risk severities, and confidence analytics will automatically appear here.'}
            </p>
          </div>
          <Link
            to="/disease-detection"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d4a2d] hover:bg-[#145a38] text-white text-xs font-bold rounded-2xl shadow-xs transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-300" />
            <span>{language === 'ta' ? 'முதல் இலையை ஆய்வு செய்' : 'Scan Your First Leaf'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Disease Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" /> {t.diseaseDistTitle[language]}
              </h3>
              <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                {totalScans} {totalScans === 1 ? (language === 'ta' ? 'பதிவு' : 'Scan') : (language === 'ta' ? 'பதிவுகள்' : 'Scans')}
              </span>
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
                    {diseaseDistributionData.map((_, index) => (
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
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
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
      )}

      {/* 3. Live Environmental Trends (Temperature vs Humidity Timeline from Open-Meteo) */}
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
            <LineChart data={envTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
              <XAxis dataKey="displayDay" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} unit="°C" domain={[15, 45]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} unit="%" domain={[20, 100]} />
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

      {/* 4. Environmental Risk Trend & Confidence by Class Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Risk Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" /> {t.riskTimelineTitle[language]}
            </h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {language === 'ta' ? '7-நாள் போக்கு' : '7-Day Trend'}
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={envTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
                  formatter={(val: any) => [`${val}%`, 'Risk Index']}
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
              <Layers className="w-4 h-4 text-emerald-700" /> {t.confidenceTitle[language]}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {confidenceByClassData.length > 0 ? `${confidenceByClassData.length} classes` : 'Awaiting scans'}
            </span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {confidenceByClassData.length === 0 ? (
              <div className="text-center p-4 space-y-1">
                <Info className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="text-xs text-slate-500 font-medium block">
                  {language === 'ta'
                    ? 'இலை பரிசோதனைகளுக்குப் பின் சராசரி மாதிரி நம்பிக்கை இங்கு தோன்றும்.'
                    : 'Class confidence averages will be calculated once leaves are scanned.'}
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceByClassData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                  <XAxis dataKey="displayDisease" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

