import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DEMO_SAMPLES } from '../../data/mockData';
import { TRANSLATIONS } from '../../utils/translations';
import {
  ChevronRight,
  Radio,
  Sliders,
  Sprout,
} from 'lucide-react';

const ROUTE_KEYS: Record<string, { titleKey: keyof typeof TRANSLATIONS.nav; categoryKey: string }> = {
  '/': { titleKey: 'dashboard', categoryKey: 'TurmeriCare AI' },
  '/dashboard': { titleKey: 'dashboard', categoryKey: 'farmerServices' },
  '/disease-detection': { titleKey: 'diseaseDetection', categoryKey: 'farmerServices' },
  '/environmental-risk': { titleKey: 'fieldConditions', categoryKey: 'farmerServices' },
  '/multimodal-analysis': { titleKey: 'cropRisk', categoryKey: 'farmerServices' },
  '/history': { titleKey: 'history', categoryKey: 'farmerServices' },
  '/recommendations': { titleKey: 'recommendations', categoryKey: 'farmerServices' },
  '/analytics': { titleKey: 'analytics', categoryKey: 'advancedResearch' },
  '/model-comparison': { titleKey: 'modelPerformance', categoryKey: 'advancedResearch' },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const {
    language,
    setLanguage,
    selectedSample,
    setSelectedSample,
    envDataSource,
    sensorStatus,
  } = useApp();

  const routeInfo = ROUTE_KEYS[location.pathname] || {
    titleKey: 'dashboard',
    categoryKey: 'farmerServices',
  };

  const titleText = TRANSLATIONS.nav[routeInfo.titleKey]?.[language] || 'TurmeriCare AI';
  const categoryText = (TRANSLATIONS.nav as any)[routeInfo.categoryKey]?.[language] || routeInfo.categoryKey;

  return (
    <header className="h-16 bg-white border-b border-[#e2ece6] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs backdrop-blur-md bg-white/95">
      {/* Left Title & Breadcrumbs */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span className="text-agri-800 font-bold font-display">
            {language === 'ta' ? 'மஞ்சள் பயிர் நலம்' : 'TurmeriCare AI'}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 hidden sm:inline">{categoryText}</span>
        </div>
        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
        <h1 className="text-sm font-bold text-slate-800 hidden md:block">
          {titleText}
        </h1>
      </div>

      {/* Right Action Area */}
      <div className="flex items-center gap-2.5">
        {/* Field Status Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 bg-agri-50/60 border border-agri-200/80 rounded-xl px-2.5 py-1 text-xs font-semibold text-agri-900">
          <Sprout className="w-3.5 h-3.5 text-agri-700" />
          <span>{TRANSLATIONS.status.fieldNotSelected[language]}</span>
        </div>

        {/* Environmental Telemetry Source Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
          {envDataSource === 'reanalysis' ? (
            <>
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-blue-800 hidden sm:inline">
                {TRANSLATIONS.status.reanalysisSource[language]}
              </span>
            </>
          ) : envDataSource === 'sensor' && sensorStatus.isConnected ? (
            <>
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-800 hidden sm:inline">
                {TRANSLATIONS.status.liveSensor[language]}
              </span>
            </>
          ) : (
            <>
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-bold text-slate-700 hidden sm:inline">
                {TRANSLATIONS.status.manualField[language]}
              </span>
            </>
          )}
        </div>

        {/* Language Selector: தமிழ் | English */}
        <div className="flex items-center bg-agri-50 border border-agri-200 rounded-xl p-0.5 shadow-xs">
          <button
            onClick={() => setLanguage('ta')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === 'ta'
                ? 'bg-agri-800 text-white shadow-xs'
                : 'text-agri-900 hover:bg-agri-100/70'
            }`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-agri-800 text-white shadow-xs'
                : 'text-agri-900 hover:bg-agri-100/70'
            }`}
          >
            English
          </button>
        </div>
      </div>
    </header>
  );
};
