import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/translations';
import {
  LayoutDashboard,
  ScanEye,
  CloudSun,
  Layers,
  History,
  GitCompare,
  BarChart3,
  Lightbulb,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { language } = useApp();

  const FARMER_NAV_ITEMS = [
    {
      path: '/dashboard',
      label: TRANSLATIONS.nav.dashboard[language],
      icon: LayoutDashboard,
    },
    {
      path: '/disease-detection',
      label: TRANSLATIONS.nav.diseaseDetection[language],
      icon: ScanEye,
    },
    {
      path: '/environmental-risk',
      label: TRANSLATIONS.nav.fieldConditions[language],
      icon: CloudSun,
    },
    {
      path: '/multimodal-analysis',
      label: TRANSLATIONS.nav.cropRisk[language],
      icon: Layers,
      isPrimary: true,
    },
    {
      path: '/recommendations',
      label: TRANSLATIONS.nav.recommendations[language],
      icon: Lightbulb,
    },
    {
      path: '/history',
      label: TRANSLATIONS.nav.history[language],
      icon: History,
    },
  ];

  const ADVANCED_NAV_ITEMS = [
    {
      path: '/analytics',
      label: TRANSLATIONS.nav.analytics[language],
      icon: BarChart3,
    },
    {
      path: '/model-comparison',
      label: TRANSLATIONS.nav.modelPerformance[language],
      icon: GitCompare,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e2ece6] flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 shadow-xs">
      {/* Brand Header */}
      <div className="p-4 md:p-5 border-b border-[#e2ece6] bg-agri-50/50">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-agri-800 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
            🌿
          </div>
          <div>
            <div className="font-extrabold text-agri-950 text-base md:text-lg tracking-tight font-display flex items-center gap-1.5">
              TurmeriCare <span className="text-agri-600">AI</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 tracking-wide">
              {language === 'ta' ? 'மஞ்சள் பயிர் பாதுகாப்பு' : 'Turmeric Crop Health System'}
            </div>
          </div>
        </NavLink>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Section 1: Farmer Services */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {TRANSLATIONS.nav.farmerServices[language]}
          </div>

          <div className="space-y-1">
            {FARMER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: active }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 group ${
                      active
                        ? item.isPrimary
                          ? 'bg-agri-800 text-white shadow-md shadow-agri-900/20 font-bold'
                          : 'bg-agri-100 text-agri-900 font-bold'
                        : 'text-slate-600 hover:bg-agri-50 hover:text-agri-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? item.isPrimary
                            ? 'text-agri-200'
                            : 'text-agri-700'
                          : 'text-slate-400 group-hover:text-agri-700'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Section 2: Advanced & Research */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {TRANSLATIONS.nav.advancedResearch[language]}
          </div>

          <div className="space-y-1">
            {ADVANCED_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: active }) =>
                    `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      active
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive ? 'text-agri-700' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Quick Landing Overview */}
        <div className="pt-2 border-t border-slate-100">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-agri-50 hover:text-agri-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'ta' ? 'திட்ட கண்ணோட்டம்' : 'Project Overview'}</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer Info Box */}
      <div className="p-3.5 border-t border-[#e2ece6] bg-slate-50/70">
        <div className="p-3 rounded-2xl bg-white border border-[#e2ece6] shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ta' ? 'தமிழ்நாடு வேளாண்மை' : 'TN Agri Support'}</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            {language === 'ta'
              ? 'மஞ்சள் பயிர் பாதுகாப்பு & முன்னெச்சரிக்கை வழிகாட்டி.'
              : 'Foliar pathology & microclimate crop advisory.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
