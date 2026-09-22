import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LocationSelectorModal } from '../components/common/LocationSelectorModal';
import { formatLocationDisplay } from '../services/weatherService';
import {
  Sprout,
  MapPin,
  Calendar,
  CheckCircle2,
  Info,
  ShieldCheck,
  Eye,
  Sparkles,
  RotateCcw,
  Navigation,
} from 'lucide-react';

export const MyFieldPage: React.FC = () => {
  const {
    language,
    selectedLocation,
    fetchLiveWeatherData,
    plantingDate,
    setPlantingDate,
    cropDap,
  } = useApp();

  const [showLocationModal, setShowLocationModal] = useState(false);

  const getCropStageLabel = (dap: number) => {
    if (dap < 60) {
      return language === 'ta' ? 'முளைப்பு & ஆரம்ப வளர்ச்சிப் பருவம்' : 'Sprouting & Early Vegetative Phase';
    } else if (dap <= 180) {
      return language === 'ta' ? 'கிழங்கு பெருக்கும் & தீவிர வளர்ச்சிப் பருவம்' : 'Rhizome Development & Vegetative Phase';
    } else {
      return language === 'ta' ? 'கிழங்கு முதிர்ச்சிப் பருவம்' : 'Rhizome Maturation / Harvest Phase';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {language === 'ta' ? 'வயல் மேலாண்மை' : 'Farm Profile'}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5 flex items-center gap-2.5">
          <Sprout className="w-7 h-7 text-emerald-600" />
          <span>{language === 'ta' ? 'என் வயல்' : 'My Field'}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {language === 'ta'
            ? 'உங்கள் அமைவிடம் மற்றும் பயிர் விபரங்கள் மூலம் துல்லியமான வானிலை மற்றும் பயிர் பாதுகாப்பு வழிகாட்டல் வழங்கப்படுகிறது.'
            : 'Configure your farm location and planting timeline for automated weather and crop intelligence.'}
        </p>
      </div>

      {/* 1. Farm Location Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>{language === 'ta' ? '1. வயல் அமைவிடம்' : '1. Farm Location'}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {language === 'ta' ? 'தானியங்கி வானிலை இயங்குகிறது' : 'Auto-Weather Active'}
          </span>
        </div>

        <div className="p-4 bg-[#f9fdfa] rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'ta' ? 'தேர்வு செய்யப்பட்ட இடம்' : 'Selected Farm Location'}
              </span>
              {selectedLocation.isCurrentLocation && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {language === 'ta' ? 'தற்போதைய அமைவிடம்' : 'Current Location'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {selectedLocation.isCurrentLocation ? (
                <Navigation className="w-5 h-5 text-emerald-600 fill-emerald-600 shrink-0" />
              ) : (
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <span className="text-lg font-black text-slate-900">
                {formatLocationDisplay(selectedLocation, language)}
              </span>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              {selectedLocation.district} District • {selectedLocation.state}
            </span>
          </div>

          <button
            onClick={() => setShowLocationModal(true)}
            className="py-2.5 px-5 bg-white hover:bg-slate-50 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            {language === 'ta' ? 'இடத்தை மாற்று' : 'Change Location'}
          </button>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {language === 'ta'
              ? 'உங்கள் இருப்பிடத்தைப் பயன்படுத்தி உள்ளூர் வானிலை தகவல் மற்றும் பயிர் அபாய மதிப்பீட்டை வழங்குகிறோம்.'
              : 'We use your location to provide local weather information and crop risk assessment.'}
          </p>
        </div>
      </div>

      {/* 2. Crop Planting Date Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>{language === 'ta' ? '2. பயிர் நடவு செய்த நாள்' : '2. Crop Planting Date'}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {language === 'ta' ? 'விருப்பத்திற்குரியது' : 'Optional'}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            {language === 'ta' ? 'நடவு தேதி' : 'Planting Date'}
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="date"
              value={plantingDate || ''}
              onChange={(e) => setPlantingDate(e.target.value || null)}
              className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 max-w-xs cursor-pointer"
            />
            {plantingDate && (
              <button
                onClick={() => setPlantingDate(null)}
                className="py-2 px-3 text-slate-500 hover:text-slate-700 text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'தேதியை நீக்கு' : 'Clear Date'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Calculated Stage Pill if set */}
        {plantingDate ? (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-emerald-950 block">
                  {language === 'ta' ? `பயிர் வயது: ~${cropDap} நாட்கள்` : `Crop Age: ~${cropDap} Days After Planting (DAP)`}
                </span>
                <span className="text-emerald-800 text-[11px]">
                  {getCropStageLabel(cropDap)}
                </span>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
        ) : (
          <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {language === 'ta'
                ? 'பயிரின் வயது மற்றும் பருவக்கால நிலைகளைப் புரிந்து கொள்ளப் பயன்படுகிறது.'
                : 'Used to understand crop age and seasonal conditions.'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Separate Seasonal Crop Guide */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>{language === 'ta' ? '📅 பருவக்கால பயிர் வழிகாட்டி' : '📅 Seasonal Crop Guide'}</span>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {language === 'ta' ? 'வடகிழக்கு பருவமழை (அக் – டிச)' : 'Northeast Monsoon (Oct – Dec)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box 1: Current Crop Stage */}
          <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ta' ? 'தற்போதைய பயிர் வளர்ச்சிப் பருவம்' : 'Current Crop Stage'}</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900">
              {getCropStageLabel(cropDap)}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {language === 'ta'
                ? 'இப்பருவத்தில் மஞ்சள் கிழங்கு வளர்ச்சி அடைகிறது; அதிக ஈரப்பதம் மற்றும் காலைப் பனி இலைகளில் படியக்கூடும்.'
                : 'Rhizome expansion active. Canopy foliage is dense and sensitive to microclimate humidity.'}
            </p>
          </div>

          {/* Box 2: Disease Monitoring Context */}
          <div className="p-4 bg-[#fffbf0] rounded-2xl border border-amber-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>{language === 'ta' ? 'பயிர் கண்காணிப்புக் காலம்' : 'Disease Monitoring Period'}</span>
            </div>
            <p className="text-sm font-extrabold text-amber-950">
              {language === 'ta' ? 'கண்காணிப்பு பரிந்துரைக்கப்படுகிறது' : 'Closer Monitoring Advised'}
            </p>
            <p className="text-xs text-amber-900/80 leading-relaxed font-medium">
              {language === 'ta'
                ? 'தற்போதைய வானிலை சூழல்கள் நோய் பரவலுக்கு சாதகமாக அமையலாம்; இலைகளை தொடர்ந்து கண்காணிக்கவும்.'
                : 'Recent weather conditions suggest closer monitoring for early symptom detection.'}
            </p>
          </div>
        </div>

        {/* What to watch for & Simple Preventive Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              {language === 'ta' ? 'கவனிக்க வேண்டியவை' : 'What the farmer should watch for'}
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{language === 'ta' ? 'இலைகளில் தோன்றும் மஞ்சள் அல்லது பழுப்பு நிற புள்ளிகள்' : 'Early circular spots or brown patches on leaves'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{language === 'ta' ? 'இலைகளின் அடியில் சாறு உறிஞ்சும் பூச்சிகள் / சுருக்கம்' : 'Leaf underside curling or sap-sucking pest clusters'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{language === 'ta' ? 'காலை வேளையில் நீடிக்கும் இலை பனி ஈரப்பதம்' : 'Persistent morning dew film on upper canopy foliage'}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              {language === 'ta' ? 'எளிய தடுப்பு நடவடிக்கைகள்' : 'Simple Preventive Actions'}
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ta' ? 'பாத்திகளில் தண்ணீர் தேங்காமல் நல்ல வடிகால் பராமரிக்கவும்' : 'Maintain ridge and furrow drainage to prevent waterlogging'}</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ta' ? 'காய்ந்த கீழ்மட்ட இலைகளை அகற்றி காற்றோட்டத்தை அதிகரிக்கவும்' : 'Prune dead lower leaves to improve inter-row air circulation'}</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ta' ? 'வாரந்தோறும் இலைகளை சரிபார்த்து புகைப்பட ஆய்வு செய்யவும்' : 'Scout weekly and check leaves with Curuma photo diagnosis'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Biological Context Disclaimer */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-500 leading-relaxed font-medium">
          {language === 'ta'
            ? 'குறிப்பு: பருவக்கால வழிகாட்டல் உயிரியல் பின்னணி தகவலாக மட்டுமே செயல்படுகிறது. உண்மையான வானிலை மற்றும் இலை புகைப்பட பரிசோதனையே நோய் கண்டறிதலைத் தீர்மானிக்கிறது.'
            : 'Note: Seasonal context serves as biological background guidance alongside live weather and leaf photos. Season alone does not independently determine disease risk.'}
        </div>
      </div>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

export default MyFieldPage;
