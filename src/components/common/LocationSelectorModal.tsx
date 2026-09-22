import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { ALL_TAMIL_NADU_LOCATIONS, LocationOption } from '../../services/weatherService';
import {
  MapPin,
  Search,
  CheckCircle2,
  Navigation,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    language,
    selectedLocation,
    setSelectedLocation,
    fetchLiveWeatherData,
    isLocating,
    locationStatus,
    locationErrorMessage,
    detectCurrentLocation,
  } = useApp();

  const [locationSearch, setLocationSearch] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLocations = ALL_TAMIL_NADU_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      loc.tamilName.toLowerCase().includes(locationSearch.toLowerCase()) ||
      loc.district.toLowerCase().includes(locationSearch.toLowerCase()) ||
      loc.description.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleSelectLocation = (loc: LocationOption) => {
    setSelectedLocation(loc);
    onClose();
    fetchLiveWeatherData(loc);
  };

  const handleUseCurrentLocation = async () => {
    await detectCurrentLocation();
    if (locationStatus !== 'unavailable' && locationStatus !== 'error') {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col font-sans relative my-auto max-h-[85vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-150 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {language === 'ta' ? 'வயல் அமைவிடத்தை தேர்வு செய்க' : 'Select Farm Location'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === 'ta' ? '38 மாவட்டங்கள் & முக்கிய வேளாண் பகுதிகள்' : '38 Districts & Agricultural Hubs of Tamil Nadu'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer font-bold transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action 1: "Use My Current Location" Button */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className={`w-full p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer shadow-xs shrink-0 ${
            isLocating
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 cursor-wait'
              : 'bg-[#f0fdf4] hover:bg-[#dcfce7] border-emerald-500 text-emerald-900 hover:border-emerald-600'
          }`}
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              {isLocating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Navigation className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>
                  {isLocating
                    ? language === 'ta'
                      ? 'அமைவிடம் கண்டறியப்படுகிறது...'
                      : 'Detecting your location...'
                    : language === 'ta'
                    ? 'எனது தற்போதைய அமைவிடத்தைப் பயன்படுத்து'
                    : 'Use My Current Location'}
                </span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                {isLocating
                  ? language === 'ta'
                    ? 'GPS மூலம் அருகிலுள்ள மாவட்டத்தை கண்டறிகிறது'
                    : 'Locating nearest Tamil Nadu district'
                  : language === 'ta'
                  ? 'சாதனத்தின் இருப்பிடத்தை தானாக அமைக்கும்'
                  : 'Auto-detect via device GPS'}
              </div>
            </div>
          </div>

          {selectedLocation.isCurrentLocation && !isLocating && (
            <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
              {language === 'ta' ? 'செயலில்' : 'Active'}
            </span>
          )}
        </button>

        {/* Location Unavailable / Error Notification Banner */}
        {locationErrorMessage && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{language === 'ta' ? 'அமைவிடம் கிடைக்கவில்லை' : 'Location Unavailable'}</div>
              <p className="text-[11px] text-amber-800 mt-0.5">{locationErrorMessage}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'ta' ? 'மாவட்டம் அல்லது ஊர் பெயர்...' : 'Search 38 districts or towns...'
            }
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
          />
          {locationSearch && (
            <button
              onClick={() => setLocationSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* District & Taluk List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0 max-h-[300px] scrollbar-thin">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-medium">
              {language === 'ta' ? 'பொருத்தமான அமைவிடம் இல்லை' : 'No matching Tamil Nadu location found'}
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected =
                !selectedLocation.isCurrentLocation &&
                selectedLocation.name === loc.name &&
                selectedLocation.district === loc.district;

              return (
                <button
                  key={`${loc.id || loc.name}-${loc.district}`}
                  onClick={() => handleSelectLocation(loc)}
                  className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{loc.name}</span>
                      {loc.tamilName && loc.tamilName !== loc.name && (
                        <span className="text-[11px] font-normal text-slate-500">
                          ({loc.tamilName})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {loc.name.toLowerCase() === loc.district.toLowerCase()
                        ? `${loc.district} District • ${loc.state}`
                        : `${loc.district} District • ${loc.description}`}
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LocationSelectorModal;
