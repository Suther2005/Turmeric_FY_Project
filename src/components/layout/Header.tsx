import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LocationSelectorModal } from '../common/LocationSelectorModal';
import { formatLocationDisplay } from '../../services/weatherService';
import {
  MapPin,
  RefreshCw,
  AlertCircle,
  Navigation,
  Menu,
  Sprout,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    language,
    setLanguage,
    selectedLocation,
    isLocating,
    locationStatus,
  } = useApp();

  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <header className="h-16 bg-white/95 border-b border-[#eef2ef] px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs backdrop-blur-md w-full">
      {/* Left: Mobile Menu Trigger + Brand (visible on mobile/tablet < lg) */}
      <div className="flex items-center gap-2 lg:hidden">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open Navigation Menu"
            className="p-2 -ml-1 text-slate-700 hover:text-[#14532d] hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-base font-display">
          <div className="w-7 h-7 rounded-xl bg-[#1b4332] text-amber-300 flex items-center justify-center shadow-2xs">
            <Sprout className="w-4 h-4 text-emerald-300 fill-emerald-300" />
          </div>
          <span>Curcuma</span>
        </div>
      </div>

      {/* Desktop spacer if left is hidden */}
      <div className="hidden lg:block"></div>

      {/* Right Action Area */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Farm Location Pill */}
        <button
          onClick={() => setShowLocationModal(true)}
          className={`flex items-center gap-1.5 sm:gap-2 text-xs font-medium px-2.5 sm:px-4 py-2 rounded-2xl shadow-2xs transition-all cursor-pointer border max-w-[170px] sm:max-w-none min-h-[40px] ${
            isLocating
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 animate-pulse'
              : locationStatus === 'unavailable'
              ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {isLocating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-emerald-600 shrink-0" />
              <span className="font-bold text-emerald-900 truncate">
                {language === 'ta' ? 'அமைவிடம்...' : 'Locating...'}
              </span>
            </>
          ) : locationStatus === 'unavailable' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span className="font-bold text-amber-900 truncate text-[11px] sm:text-xs">
                {language === 'ta' ? 'அமைவிடம் தேர்வு' : 'Set Location'}
              </span>
            </>
          ) : (
            <>
              {selectedLocation.isCurrentLocation ? (
                <Navigation className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
              )}
              <div className="text-left flex items-center gap-1 min-w-0">
                <span className="font-semibold text-slate-800 truncate text-[11px] sm:text-xs">
                  {formatLocationDisplay(selectedLocation, language)}
                </span>
                {selectedLocation.isCurrentLocation && (
                  <span className="hidden md:inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md shrink-0">
                    {language === 'ta' ? 'தற்போதைய இடம்' : 'Current'}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block text-slate-500 hover:text-emerald-800 font-medium ml-1 text-xs shrink-0">
                {language === 'ta' ? 'மாற்று' : 'Change'}
              </span>
            </>
          )}
        </button>

        {/* Language Selector: தமிழ் | English */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLanguage('ta')}
            className={`px-2.5 sm:px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
              language === 'ta'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 sm:px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
              language === 'en'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </header>
  );
};

export default Header;

