import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Camera,
  CloudSun,
  TestTubes,
  Lightbulb,
  History,
  Sprout,
  GitCompare,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  ExternalLink,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onClose,
}) => {
  const location = useLocation();
  const { language } = useApp();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    ['/model-comparison', '/analytics', '/multimodal-analysis'].includes(location.pathname)
  );

  const FARMER_NAV_ITEMS = [
    {
      path: '/dashboard',
      label: language === 'ta' ? 'முகப்பு' : 'Home',
      icon: Home,
    },
    {
      path: '/disease-detection',
      label: language === 'ta' ? 'இலையை சரிபார்' : 'Check Leaf',
      icon: Camera,
    },
    {
      path: '/environmental-risk',
      label: language === 'ta' ? 'வானிலை & அபாயம்' : 'Weather & Risk',
      icon: CloudSun,
    },
    {
      path: '/field-conditions',
      label: language === 'ta' ? 'கள நிலைமைகள்' : 'Field Conditions',
      icon: TestTubes,
    },
    {
      path: '/recommendations',
      label: language === 'ta' ? 'பரிந்துரைகள்' : 'Recommendations',
      icon: Lightbulb,
    },
    {
      path: '/history',
      label: language === 'ta' ? 'முந்தைய பதிவுகள்' : 'History',
      icon: History,
    },
  ];

  const ADVANCED_NAV_ITEMS = [
    {
      path: '/model-comparison',
      label: language === 'ta' ? 'மாதிரி ஒப்பீடு' : 'Model Comparison',
      icon: GitCompare,
    },
    {
      path: '/analytics',
      label: language === 'ta' ? 'தரவுத்தொகுப்பு பகுப்பாய்வு' : 'Dataset Analysis',
      icon: BarChart3,
    },
    {
      path: '/multimodal-analysis',
      label: language === 'ta' ? 'வரலாற்று சரிபார்ப்பு' : 'Historical Validation',
      icon: Layers,
    },
  ];

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white select-none font-sans">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#eef2ef] flex items-center justify-between">
        <NavLink
          to="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#1b4332] text-amber-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sprout className="w-5 h-5 text-emerald-300 fill-emerald-300" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-lg tracking-tight font-display flex items-center gap-1">
              Curuma
            </div>
            <div className="text-[11px] font-medium text-slate-500 tracking-wide">
              {language === 'ta' ? 'மஞ்சள் பயிர் நலம்' : 'Turmeric Crop Health'}
            </div>
          </div>
        </NavLink>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Navigation Menu"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
        {/* Section 1: Farmer Services */}
        <div className="space-y-1">
          <div className="px-3.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {language === 'ta' ? 'விவசாய சேவைகள்' : 'Farmer Services'}
          </div>

          {FARMER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive: active }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] transition-all duration-200 min-h-[44px] group ${
                    active
                      ? 'bg-[#eafaf1] text-[#14532d] font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors shrink-0 ${
                      isActive ? 'text-[#14532d]' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Section 2: Research & Analytics */}
        <div className="pt-2 border-t border-slate-100/80 space-y-1">
          <div className="px-3.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {language === 'ta' ? 'ஆராய்ச்சி & பகுப்பாய்வு' : 'Research & Analytics'}
          </div>

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-all min-h-[44px] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FlaskConical className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{language === 'ta' ? 'ஆராய்ச்சி & விவரங்கள்' : 'Advanced / Research'}</span>
            </div>
            {isAdvancedOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>

          {isAdvancedOpen && (
            <div className="pl-4 pr-1 pt-0.5 space-y-1">
              {ADVANCED_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive: active }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 min-h-[40px] group ${
                        active
                          ? 'bg-[#eafaf1] text-[#14532d] font-bold'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                          isActive ? 'text-[#14532d]' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer Support Card */}
      <div className="p-4 border-t border-[#eef2ef] space-y-1.5 mt-auto">
        <div className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          {language === 'ta' ? 'உதவி' : 'Support'}
        </div>
        <a
          href="https://agritech.tnau.ac.in"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleNavClick}
          className="p-3 rounded-2xl bg-white border border-[#e2ece6] shadow-xs flex items-center gap-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group block min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                {language === 'ta' ? 'தமிழ்நாடு வேளாண்மை' : 'TN Agri Support'}
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 shrink-0" />
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
              {language === 'ta'
                ? 'வழிகாட்டுதல்கள் மற்றும் ஆலோசனைகள்.'
                : 'Agricultural guidance & advisories.'}
            </p>
          </div>
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-[#eef2ef] flex-col h-screen sticky top-0 shrink-0 select-none z-30 shadow-xs">
        {navContent}
      </aside>

      {/* 2. Mobile Responsive Slide-Out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col transition-transform duration-300 animate-slideInLeft">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
