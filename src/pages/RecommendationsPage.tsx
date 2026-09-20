import React from 'react';
import { useApp } from '../context/AppContext';
import { AGRONOMIC_RECOMMENDATIONS } from '../data/mockData';
import { TRANSLATIONS } from '../utils/translations';
import {
  Lightbulb,
  Droplets,
  CloudRain,
  CloudLightning,
  ShieldAlert,
  Sprout,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { language } = useApp();

  const getIcon = (category: string) => {
    switch (category) {
      case 'HIGH HUMIDITY':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'HIGH LEAF WETNESS':
        return <CloudRain className="w-5 h-5 text-cyan-600" />;
      case 'RECENT RAINFALL':
        return <CloudLightning className="w-5 h-5 text-purple-600" />;
      case 'DISEASE DETECTED':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'PREVENTATIVE CARE':
      default:
        return <Sprout className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    if (language === 'ta') {
      switch (category) {
        case 'HIGH HUMIDITY':
          return 'அதிக ஈரப்பதம்';
        case 'HIGH LEAF WETNESS':
          return 'அதிக பனிப்பொழிவு / ஒடுக்க சூழல் (Dew Proxy)';
        case 'RECENT RAINFALL':
          return 'மழைப்பொழிவு சூழல்';
        case 'DISEASE DETECTED':
          return 'நோய் அறிகுறி கண்டறிதல்';
        case 'PREVENTATIVE CARE':
        default:
          return 'முன்னெச்சரிக்கை பாதுகாப்பு';
      }
    }
    if (category === 'HIGH LEAF WETNESS') {
      return 'High Dew / Condensation Proxy';
    }
    return category;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
              {language === 'ta' ? 'கள வழிகாட்டி' : 'Field Advisory & Decision Support'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5">
            {TRANSLATIONS.recommendations.title[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {TRANSLATIONS.recommendations.subtitle[language]}
          </p>
        </div>
      </div>

      {/* Advisory Safety Notice Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <span className="font-bold block mb-0.5">
            {language === 'ta' ? 'தமிழ்நாடு வேளாண்மை வழிகாட்டுதல்:' : 'Advisory & Safety Notice:'}
          </span>
          {TRANSLATIONS.recommendations.safetyDisclaimer[language]}
        </div>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AGRONOMIC_RECOMMENDATIONS.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card hover:shadow-elevated transition-all space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Category & Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {getIcon(rec.category)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === 'ta' ? 'காரணம்' : 'Trigger Condition'}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 font-display">
                      {getCategoryLabel(rec.category)}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                      rec.riskLevel === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : rec.riskLevel === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {rec.riskLevel} {language === 'ta' ? 'அபாயம்' : 'Risk'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {rec.priority}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 font-display">
                  {rec.title}
                </h4>
                <div className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-700 block mb-0.5">
                    {language === 'ta' ? 'இதன் முக்கியத்துவம்:' : 'Why this matters:'}
                  </span>
                  {rec.description}
                </div>
              </div>

              {/* Action Steps */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  {language === 'ta' ? 'செய்ய வேண்டிய களப்பணிகள்:' : 'What you can do:'}
                </span>
                <div className="space-y-2">
                  {rec.actionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timing Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'ta' ? 'செயல்படுத்தும் நேரம்:' : 'Response Window:'} <strong>{rec.timing}</strong></span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
