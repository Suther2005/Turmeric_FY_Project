import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LocationSelectorModal } from '../components/common/LocationSelectorModal';
import { formatLocationDisplay } from '../services/weatherService';
import {
  Lightbulb,
  Sprout,
  Droplets,
  Wind,
  Phone,
  BookOpen,
  Info,
  Eye,
  Camera,
  MapPin,
  Navigation,
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    selectedLocation,
    imageResult,
    hasAnalyzedImage,
    customImagePreview,
    selectedSample,
    researchRiskResult,
    envRiskResult,
    multimodalResult,
  } = useApp();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Environmental Risk Level (Low / Moderate / High)
  const envLevel = researchRiskResult
    ? researchRiskResult.riskLevel === 'HIGH'
      ? 'High'
      : researchRiskResult.riskLevel === 'MODERATE'
      ? 'Moderate'
      : 'Low'
    : envRiskResult.level;

  // Normalized Disease Context
  const isOod = hasAnalyzedImage && imageResult.oodStatus === 'OOD_REJECTED';
  const disease = hasAnalyzedImage ? imageResult.disease : 'Healthy';
  const isHealthy = hasAnalyzedImage ? disease === 'Healthy' : true;
  const isAphids = hasAnalyzedImage && disease === 'Aphids';
  const isBlotch = hasAnalyzedImage && disease === 'Blotch';
  const isLeafSpot = hasAnalyzedImage && disease === 'Leaf Spot';

  // Overall Combined Situation Risk Level
  let situationLevel: 'High' | 'Moderate' | 'Low' = 'Low';
  if (isOod) {
    situationLevel = 'Low';
  } else if (hasAnalyzedImage && !isHealthy) {
    if (envLevel === 'High') situationLevel = 'High';
    else if (envLevel === 'Moderate') situationLevel = 'Moderate';
    else situationLevel = 'Moderate';
  } else {
    // Healthy or unanalyzed baseline
    if (envLevel === 'High') situationLevel = 'Moderate';
    else situationLevel = 'Low';
  }

  // Active Image Source
  const leafImageSrc = customImagePreview || (hasAnalyzedImage ? '' : '');

  // Dynamic Situation Text
  const getSituationSummary = () => {
    if (isOod) {
      return language === 'ta'
        ? 'பதிவேற்றப்பட்ட படம் மஞ்சள் இலை அல்ல. சரியான இலைப்படத்தை பதிவேற்றவும்.'
        : 'The uploaded image is outside the turmeric leaf domain. Please upload a clear photo of a turmeric leaf.';
    }

    if (!hasAnalyzedImage) {
      if (envLevel === 'High') {
        return language === 'ta'
          ? 'இலை ஆய்வு இன்னும் செய்யப்படவில்லை. தற்போதைய சுற்றுச்சூழல் அபாயம் அதிகமாக உள்ளதால் வயலை தொடர்ந்து கண்காணிக்கவும்.'
          : 'No leaf scan analyzed yet. Current environmental conditions indicate elevated risk; regular crop scouting is advised.';
      }
      if (envLevel === 'Moderate') {
        return language === 'ta'
          ? 'இலை ஆய்வு இன்னும் செய்யப்படவில்லை. மிதமான சுற்றுச்சூழல் சூழலில் வழக்கமான பயிர் பராமரிப்பு போதுமானது.'
          : 'No leaf scan analyzed yet. Moderate environmental conditions warrant routine foliar inspection.';
      }
      return language === 'ta'
        ? 'இலை ஆய்வு இன்னும் செய்யப்படவில்லை. நோய் அறிகுறிகளை ஆய்வு செய்ய "Check Leaf" பக்கத்தைப் பயன்படுத்தவும்.'
        : 'No leaf scan analyzed yet. Standard baseline conditions observed; scan a turmeric leaf for disease-specific advice.';
    }

    if (isLeafSpot) {
      if (envLevel === 'High' || envLevel === 'Moderate') {
        return language === 'ta'
          ? 'இலைப்புள்ளி நோய் கண்டறியப்பட்டுள்ளது. சமீபத்திய வானிலை மற்றும் ஈரப்பதம் நோய் பரவ சாதகமாக உள்ளது.'
          : 'Leaf Spot has been detected and recent weather conditions are favourable for disease development.';
      }
      return language === 'ta'
        ? 'இலைப்புள்ளி நோய் கண்டறியப்பட்டுள்ளது. தற்போதைய வானிலை குறைவான சாதகமாக இருந்தாலும், பாதிக்கப்பட்ட பகுதியை கண்காணிக்கவும்.'
        : 'Leaf Spot has been detected. Current weather conditions are less favourable, but continue monitoring the affected area.';
    }

    if (isBlotch) {
      if (envLevel === 'High' || envLevel === 'Moderate') {
        return language === 'ta'
          ? 'இலைக்கருகல் நோய் கண்டறியப்பட்டுள்ளது. சமீபத்திய ஈரப்பதம் மற்றும் மழை நோய் பரவ சாதகமாக உள்ளது.'
          : 'Leaf Blotch has been detected and recent weather conditions are favourable for disease development.';
      }
      return language === 'ta'
        ? 'இலைக்கருகல் நோய் கண்டறியப்பட்டுள்ளது. தற்போதைய வானிலை குறைவான சாதகமாக உள்ளது, ஆயினும் வழக்கமான கள ஆய்வு தேவை.'
        : 'Leaf Blotch has been detected. Recent weather conditions are moderate, continue regular crop scouting.';
    }

    if (isAphids) {
      return language === 'ta'
        ? 'அசுவினி பூச்சி தாக்குதல் கண்டறியப்பட்டுள்ளது. தற்போதைய களச்சூழல் பூச்சிப் பெருக்கத்திற்கு சாதகமாக அமையலாம்.'
        : 'Aphids have been detected and environmental conditions may support pest multiplication.';
    }

    // Healthy
    if (envLevel === 'High') {
      return language === 'ta'
        ? 'ஆரோக்கியமான இலை கண்டறியப்பட்டது. ஆனால் சமீபத்திய வானிலை நோய் பரவ சாதகமாக உள்ளதால் வயலை தொடர்ந்து கண்காணிக்கவும்.'
        : 'Healthy leaf detected, but recent environmental conditions may favour disease development. Continue regular monitoring.';
    }
    return language === 'ta'
      ? 'ஆரோக்கியமான இலை கண்டறியப்பட்டது. பயிரில் நோய் அறிகுறிகள் இல்லை மற்றும் தற்போதைய வானிலை சீராக உள்ளது.'
      : 'Healthy leaf detected. No clear disease symptoms were found in the analyzed leaf and weather conditions are stable.';
  };

  // Dynamic "Why this risk is high / moderate / low?" Points
  const getWhyPoints = () => {
    if (isOod) {
      return [
        {
          iconBg: 'bg-slate-100 text-slate-700',
          icon: '⚠️',
          text: language === 'ta' ? 'பதிவேற்றப்பட்ட படம் மஞ்சள் இலை வரம்பிற்கு அப்பாற்பட்டது' : 'Image features do not match turmeric foliar pathology domain',
        },
        {
          iconBg: 'bg-blue-100 text-blue-700',
          icon: '🌧️',
          text: language === 'ta' ? 'சமீபத்திய வானிலை மதிப்பீடு வயல் அமைவிடத்தின் அடிப்படையில் கணக்கிடப்பட்டுள்ளது' : 'Weather conditions are calculated based on your field location',
        },
        {
          iconBg: 'bg-emerald-100 text-emerald-700',
          icon: '🔍',
          text: language === 'ta' ? 'துல்லியமான வழிகாட்டுதலுக்கு சரியான மஞ்சள் இலையை படம் எடுக்கவும்' : 'Upload a clear in-focus turmeric leaf photo for accurate diagnosis',
        },
      ];
    }

    const point1 = isHealthy
      ? {
          iconBg: 'bg-emerald-100 text-emerald-700',
          icon: '🍃',
          text: language === 'ta' ? 'ஆய்வு செய்யப்பட்ட இலையில் நோய் அறிகுறிகள் எதுவும் இல்லை' : 'No clear disease symptoms detected in the analyzed leaf',
        }
      : {
          iconBg: 'bg-emerald-100 text-emerald-700',
          icon: '🍃',
          text: language === 'ta'
            ? `இலையில் ${disease === 'Leaf Spot' ? 'இலைப்புள்ளி' : disease === 'Blotch' ? 'இலைக்கருகல்' : 'அசுவினி'} நோய் அறிகுறிகள் கண்டறியப்பட்டது`
            : 'Disease symptoms detected on the leaf',
        };

    const point2 = envLevel === 'High' || envLevel === 'Moderate'
      ? {
          iconBg: 'bg-blue-100 text-blue-700',
          icon: '🌧️',
          text: language === 'ta' ? 'சமீபத்திய வானிலை (ஈரப்பதம்/மழை) நோய் பரவ சாதகமாக உள்ளது' : 'Recent weather conditions (humidity/rain) are favourable',
        }
      : {
          iconBg: 'bg-blue-100 text-blue-700',
          icon: '🌧️',
          text: language === 'ta' ? 'சமீபத்திய வானிலை நோய் பரவ குறைந்த சாதகமாகவே உள்ளது' : 'Recent weather conditions are less favourable for disease development',
        };

    const point3 = !isHealthy && (envLevel === 'High' || envLevel === 'Moderate')
      ? {
          iconBg: 'bg-red-100 text-red-600',
          icon: '🌡️',
          text: language === 'ta' ? 'தற்போதைய களச்சூழல் நோய் மேலும் பரவுவதை ஊக்குவிக்கலாம்' : 'Current conditions may support further spread',
        }
      : !isHealthy
      ? {
          iconBg: 'bg-red-100 text-red-600',
          icon: '🌡️',
          text: language === 'ta' ? 'வானிலை சாதகமற்று இருந்தாலும் பாதிக்கப்பட்ட இலைகளை கவனிக்கவும்' : 'Environmental risk is low; monitor affected crop patches',
        }
      : envLevel === 'High'
      ? {
          iconBg: 'bg-red-100 text-red-600',
          icon: '🌡️',
          text: language === 'ta' ? 'சுற்றுச்சூழல் ஈரப்பதம் உள்ளதால் முன்னெச்சரிக்கையாக கண்காணிக்கவும்' : 'High environmental moisture warrants preventive crop scouting',
        }
      : {
          iconBg: 'bg-emerald-100 text-emerald-700',
          icon: '🌡️',
          text: language === 'ta' ? 'பயிர்கள் இயல்பான வளர்ச்சிக்கு உகந்த நிலையில் உள்ளன' : 'Current conditions support normal healthy crop growth',
        };

    return [point1, point2, point3];
  };

  // Dynamic 4 Action Cards for "What should I do now?"
  const getActionCards = () => {
    if (isAphids) {
      return [
        {
          icon: <Eye className="w-5 h-5 text-emerald-700" />,
          cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
          title: language === 'ta' ? 'தொடர் கண்காணிப்பு' : 'Monitor regularly',
          desc: language === 'ta' ? 'இலைகளின் அடியில் அசுவினி பூச்சிக் கூட்டங்கள் உள்ளதா என சோதிக்கவும்.' : 'Check undersides of leaves frequently for pest clusters.',
        },
        {
          icon: <Droplets className="w-5 h-5 text-blue-600" />,
          cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
          title: language === 'ta' ? 'நீர்த் தெளிப்பு' : 'Water jet wash',
          desc: language === 'ta' ? 'ஆரம்ப நிலையில் இலைகளின் அடியில் நீர் பீய்ச்சி அடித்து பூச்சிகளை அப்புறப்படுத்தவும்.' : 'Use a forceful water spray on leaf undersides to dislodge aphids.',
        },
        {
          icon: <Sprout className="w-5 h-5 text-amber-700" />,
          cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
          title: language === 'ta' ? 'வேப்ப எண்ணெய் கரைசல்' : 'Neem oil spray',
          desc: language === 'ta' ? 'வேப்ப எண்ணெய் (3%) அல்லது பூச்சி விரட்டிகளை பரிந்துரைப்படி தெளிக்கவும்.' : 'Apply 3% neem oil spray as a natural botanical deterrent.',
        },
        {
          icon: <Eye className="w-5 h-5 text-purple-700" />,
          cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
          title: language === 'ta' ? 'மஞ்சள் வண்ண ஒட்டும் பொறி' : 'Yellow sticky traps',
          desc: language === 'ta' ? 'வயலில் மஞ்சள் நிற ஒட்டும் பொறிகளை வைத்து பூச்சிகளைக் கட்டுப்படுத்தவும்.' : 'Install yellow sticky traps across the field to trap flying aphids.',
        },
      ];
    }

    if (isHealthy) {
      return [
        {
          icon: <Eye className="w-5 h-5 text-emerald-700" />,
          cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
          title: language === 'ta' ? 'வழக்கமான கண்காணிப்பு' : 'Routine scouting',
          desc: language === 'ta' ? 'வாரம் ஒருமுறை இலைகளின் ஆரோக்கியத்தை களத்தில் ஆய்வு செய்யவும்.' : 'Inspect foliage weekly for any emerging foliar symptoms.',
        },
        {
          icon: <Droplets className="w-5 h-5 text-blue-600" />,
          cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
          title: language === 'ta' ? 'வடிகால் பராமரிப்பு' : 'Maintain drainage',
          desc: language === 'ta' ? 'மழைநீர்த் தேக்கம் ஏற்படாமல் பாத்திகளில் வடிகால் வசதியை உறுதிசெய்யவும்.' : 'Ensure good field drainage to avoid water stagnation.',
        },
        {
          icon: <Wind className="w-5 h-5 text-amber-700" />,
          cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
          title: language === 'ta' ? 'காற்றோட்டம்' : 'Improve field aeration',
          desc: language === 'ta' ? 'செடிகளுக்கு இடையே தகுந்த இடைவெளியும் காற்றோட்டமும் பராமரிக்கவும்.' : 'Maintain proper spacing between plants for canopy ventilation.',
        },
        {
          icon: <Sprout className="w-5 h-5 text-purple-700" />,
          cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
          title: language === 'ta' ? 'சமச்சீர் உரம்' : 'Balanced nutrition',
          desc: language === 'ta' ? 'பரிந்துரைக்கப்பட்ட தழை, சாம்பல் சத்துக்களை சரியான அளவில் இடவும்.' : 'Apply balanced NPK and organic compost as per crop stage.',
        },
      ];
    }

    // Default for Leaf Spot / Leaf Blotch
    return [
      {
        icon: <Eye className="w-5 h-5 text-emerald-700" />,
        cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
        title: language === 'ta' ? 'தொடர் கண்காணிப்பு' : 'Monitor regularly',
        desc: language === 'ta' ? 'புதிய நோய் அறிகுறிகள் தோன்றுவதைத் தடுக்க இலைகளை அடிக்கடி சோதிக்கவும்.' : 'Check your leaves frequently for new symptoms.',
      },
      {
        icon: <Droplets className="w-5 h-5 text-blue-600" />,
        cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
        title: language === 'ta' ? 'வடிகால் பராமரிப்பு' : 'Maintain drainage',
        desc: language === 'ta' ? 'வயலில் தண்ணீர் தேங்காமல் வடித்துவிட வடிகால் வசதியை சரிசெய்யவும்.' : 'Ensure good field drainage to avoid water stagnation.',
      },
      {
        icon: <Sprout className="w-5 h-5 text-amber-700" />,
        cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
        title: language === 'ta' ? 'காற்றோட்டத்தை மேம்படுத்துக' : 'Improve field aeration',
        desc: language === 'ta' ? 'செடிகளுக்கு இடையே போதுமான இடைவெளி மற்றும் காற்றோட்டத்தை பராமரிக்கவும்.' : 'Maintain proper spacing between plants.',
      },
      {
        icon: <Eye className="w-5 h-5 text-purple-700" />,
        cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
        title: language === 'ta' ? 'பாதிக்கப்பட்ட இலைகளை அகற்று' : 'Remove severely affected leaves',
        desc: language === 'ta' ? 'அதிகமாக பாதிக்கப்பட்ட காய்ந்த இலைகளைப் பாதுகாப்பாக அகற்றி அழிக்கவும்.' : 'Safely remove and dispose of badly infected leaves.',
      },
    ];
  };

  const actionCards = getActionCards();
  const whyPoints = getWhyPoints();

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center text-xs font-medium text-slate-400 gap-1.5 pt-1">
        <Link to="/dashboard" className="hover:text-emerald-700 transition-colors">
          Curuma
        </Link>
        <span>›</span>
        <span>{language === 'ta' ? 'விவசாய சேவைகள்' : 'Farmer Services'}</span>
        <span>›</span>
        <span className="text-slate-700 font-semibold">
          {language === 'ta' ? 'பரிந்துரைகள்' : 'Recommendations'}
        </span>
      </div>

      {/* 2. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-7 h-7 text-amber-500" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {language === 'ta' ? 'பரிந்துரைகள்' : 'Recommendations'}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-0.5">
            {language === 'ta'
              ? 'உங்கள் மஞ்சள் பயிருக்கான எளிய மற்றும் நடைமுறை ஆலோசனைகள்.'
              : 'Simple and practical advice for your turmeric crop.'}
          </p>
        </div>

        {/* Right Badge */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
          <Sprout className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-left">
            <span className="text-[11px] font-bold text-slate-800 block leading-tight">
              {language === 'ta' ? 'ஆரோக்கியமான மஞ்சள்' : 'Healthy Turmeric'}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 block leading-tight">
              {language === 'ta' ? 'பலமான விவசாயிகள்' : 'Stronger Farmers'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Row 1: Current Situation Card (7 cols) + Why this risk is high? Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Current Situation (7 cols) */}
        <div className={`lg:col-span-7 rounded-3xl p-6 border shadow-card flex flex-col justify-between space-y-4 ${
          situationLevel === 'High'
            ? 'bg-[#fff5f5] border-[#fddede]'
            : situationLevel === 'Moderate'
            ? 'bg-[#fdf9ee] border-[#f8ecbb]'
            : 'bg-[#f0fbf4] border-[#d2f3dc]'
        }`}>
          <div>
            <div className="flex items-center gap-2 border-b border-black/5 pb-3">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                situationLevel === 'High' ? 'bg-[#e53935]' : situationLevel === 'Moderate' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
              }`}>
                !
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 font-display">
                {language === 'ta' ? 'தற்போதைய நிலை' : 'Current Situation'}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-4">
              {/* Situation Left Text */}
              <div className="space-y-2 flex-1">
                <div className={`text-2xl md:text-3xl font-black font-display tracking-tight flex items-center gap-2 ${
                  situationLevel === 'High'
                    ? 'text-[#e53935]'
                    : situationLevel === 'Moderate'
                    ? 'text-[#d97706]'
                    : 'text-[#15803d]'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                    situationLevel === 'High' ? 'bg-[#e53935]' : situationLevel === 'Moderate' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                  }`}>
                    !
                  </span>
                  <span>
                    {isOod
                      ? (language === 'ta' ? 'ஆதரிக்கப்படாத படம்' : 'Unsupported Specimen')
                      : isHealthy
                      ? (language === 'ta' ? 'ஆரோக்கியமான பயிர்' : 'Healthy Crop')
                      : situationLevel === 'High'
                      ? (language === 'ta' ? 'அதிக அபாயம்' : 'High Risk')
                      : situationLevel === 'Moderate'
                      ? (language === 'ta' ? 'மிதமான அபாயம்' : 'Moderate Risk')
                      : (language === 'ta' ? 'குறைந்த அபாயம்' : 'Low Risk')}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                  {getSituationSummary()}
                </p>
              </div>

              {/* Leaf Thumbnail Right */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-xs bg-slate-100 flex items-center justify-center">
                  {leafImageSrc ? (
                    <img
                      src={leafImageSrc}
                      alt="Diagnosed turmeric leaf"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-slate-400 text-center">
                      <Sprout className="w-7 h-7 text-emerald-600 mb-1 opacity-70" />
                      <span className="text-[10px] font-semibold text-slate-500">
                        {language === 'ta' ? 'இலை படம் இல்லை' : 'No leaf scan'}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`mt-2 px-3 py-1 rounded-xl text-[10px] font-extrabold tracking-wide uppercase ${
                  isHealthy
                    ? 'bg-[#e6f7ec] text-[#1b8a43]'
                    : isOod
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-[#fde8e8] text-[#d32f2f]'
                }`}>
                  {language === 'ta'
                    ? `கண்டறியப்பட்டது: ${disease === 'Leaf Spot' ? 'இலைப்புள்ளி' : disease === 'Blotch' ? 'இலைக்கருகல்' : disease === 'Aphids' ? 'அசுவினி' : isHealthy ? 'ஆரோக்கியமானது' : 'வரம்பிற்கு அப்பாற்பட்டது'}`
                    : `Detected: ${disease === 'Blotch' ? 'Leaf Blotch' : disease}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Why this risk is high? (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-base">🌿</span>
              <h2 className="text-sm md:text-base font-extrabold text-slate-900 font-display">
                {situationLevel === 'High'
                  ? (language === 'ta' ? 'இந்த அபாயம் ஏன் அதிகம்?' : 'Why this risk is high?')
                  : situationLevel === 'Moderate'
                  ? (language === 'ta' ? 'இந்த அபாயம் ஏன் மிதமானது?' : 'Why this risk is moderate?')
                  : (language === 'ta' ? 'இந்த நிலைக்கான காரணங்கள்' : 'Why this situation?')}
              </h2>
            </div>

            {/* 3 Dynamic Bullet Points */}
            <div className="space-y-4 mt-4">
              {whyPoints.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{pt.icon}</span>
                  <span className="text-xs md:text-sm text-slate-700 font-medium leading-snug">
                    {pt.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Row 2: What should I do now? (Priority Actions - Full Width) */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🌱</span>
            <h2 className="text-base font-extrabold text-slate-900 font-display">
              {language === 'ta' ? 'இப்போது நான் என்ன செய்ய வேண்டும்?' : 'What should I do now?'}
            </h2>
          </div>
          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#e6f7ec] text-[#1b8a43]">
            {language === 'ta' ? 'முக்கிய பணிகள்' : 'Priority Actions'}
          </span>
        </div>

        {/* 4 Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionCards.map((card, idx) => (
            <div
              key={idx}
              className={`p-4.5 rounded-2xl ${card.cardBg} transition-all flex flex-col justify-between space-y-3`}
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 font-display">
                  {card.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Row 3: Important Note & Need more information? (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 4: Important Note (7 cols) */}
        <div className="md:col-span-7 bg-[#f0f7fe] rounded-3xl p-6 border border-[#d2e6fc] shadow-card space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#1e88e5] text-white flex items-center justify-center text-xs font-bold shrink-0">
              i
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 font-display">
              {language === 'ta' ? 'முக்கிய குறிப்பு' : 'Important Note'}
            </h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed pl-7">
            {language === 'ta'
              ? 'இந்த பரிந்துரைகள் வழிகாட்டுதலுக்காக மட்டுமே. இரசாயன மேலாண்மைக்கு, தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) / ICAR-IISR / உள்ளூர் வேளாண்மை அலுவலர் வழிகாட்டுதல்கள் மற்றும் தயாரிப்பு லேபிள் வழிமுறைகளைப் பின்பற்றவும்.'
              : 'These recommendations are for guidance only. For chemical management, follow TNAU / ICAR-IISR / local agricultural extension guidance and product-label instructions.'}
          </p>
        </div>

        {/* Card 5: Need more information? (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-card flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900 font-display">
                {language === 'ta' ? 'கூடுதல் தகவல் தேவையா?' : 'Need more information?'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              {language === 'ta'
                ? 'பயிர் மேலாண்மை குறித்த நேரடி ஆலோசனைக்கு உங்கள் பகுதி வேளாண்மை அலுவலரைத் தொடர்பு கொள்ளவும்.'
                : 'Talk to your local agricultural extension officer for crop-specific management advice.'}
            </p>
          </div>

          <button
            onClick={() => setShowSupportModal(true)}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#0d4a2d] hover:bg-[#093520] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'உதவிக்கு தொடர்பு கொள்க' : 'Contact Support'}</span>
          </button>
        </div>
      </div>

      {/* 6. Bottom Ribbon */}
      <div className="p-3.5 rounded-2xl bg-[#e6f7ec] border border-[#c4ebd1] text-center">
        <span className="text-xs font-bold text-[#1b8a43] flex items-center justify-center gap-2">
          <Sprout className="w-4 h-4 text-[#1b8a43]" />
          <span>
            {language === 'ta'
              ? 'ஆரோக்கியமான பயிர்கள் • சிறந்த மகசூல் • வளமான எதிர்காலம்'
              : 'Healthy Plants • Better Yields • A Prosperous Tomorrow'}
          </span>
        </span>
      </div>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />

      {/* Support Contact Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📞</span>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  {language === 'ta' ? 'தமிழ்நாடு வேளாண் உதவி எண்கள்' : 'TN Agricultural Extension Support'}
                </h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="font-extrabold text-emerald-900 block">
                  {language === 'ta' ? 'உழவன் செயலி / கிசான் உதவி எண் (Kisan Call Center):' : 'Kisan Call Center (Toll Free):'}
                </span>
                <span className="font-mono text-sm font-black text-emerald-700">1800-180-1551</span>
                <span className="text-[10px] text-emerald-800 block">
                  {language === 'ta' ? 'காலை 6:00 மணி முதல் இரவு 10:00 மணி வரை (அனைத்து நாட்களும்)' : '6:00 AM to 10:00 PM (All days)'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">
                  {language === 'ta' ? 'தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU):' : 'TNAU Agricultural Advisory Center:'}
                </span>
                <span className="text-slate-600 block">
                  {language === 'ta' ? 'கோயம்புத்தூர் & மண்டல ஆராய்ச்சி நிலையங்கள்' : 'Coimbatore & Regional Agricultural Research Stations'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">0422-6611200</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">
                  {language === 'ta' ? 'உள்ளூர் வேளாண் உதவி:' : 'Local Agronomist / Block Office:'}
                </span>
                <span className="text-slate-600 block">
                  {selectedLocation.name} ({selectedLocation.district})
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              {language === 'ta' ? 'சரி, மூடுக' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
