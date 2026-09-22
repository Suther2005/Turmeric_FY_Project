import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';
import { formatLocationDisplay } from '../services/weatherService';
import {
  UploadCloud,
  CheckCircle2,
  ScanEye,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Sprout,
  X,
  Camera,
  SwitchCamera,
  VideoOff,
  Calendar,
  MapPin,
  RotateCcw,
  Maximize2,
  Info,
  Bug,
  ShieldCheck,
} from 'lucide-react';

const ALLOWED_EXTS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

interface DiseaseContentItem {
  whyPresent: (envRiskLevel: string) => { en: string; ta: string }[];
  recommendations: (envRiskLevel: string) => { en: string; ta: string }[];
  symptomSummary: (envRiskLevel: string) => { en: string; ta: string };
  defaultRiskLevel: 'Low' | 'Moderate' | 'High';
}

const DISEASE_DYNAMIC_CONTENT: Record<string, DiseaseContentItem> = {
  Healthy: {
    defaultRiskLevel: 'Low',
    symptomSummary: (envRiskLevel) => ({
      en:
        envRiskLevel === 'High'
          ? 'No visual disease symptoms detected on the leaf. However, current local weather indicates elevated environmental risk for fungal development. Regular field scouting is advised.'
          : envRiskLevel === 'Moderate'
          ? 'No visual disease symptoms detected on the leaf. Moderate environmental conditions warrant routine monitoring.'
          : 'No disease symptoms were detected on the leaf. Foliar health appears sound under current field conditions.',
      ta:
        envRiskLevel === 'High'
          ? 'இலையில் நோய் அறிகுறிகள் இல்லை. எனினும், தற்போதைய வானிலை நோய் பரவலுக்கு சாதகமான அதிக அபாயத்தைக் காட்டுகிறது. தொடர்ந்து கண்காணிக்கவும்.'
          : envRiskLevel === 'Moderate'
          ? 'இலையில் நோய் அறிகுறிகள் எதுவும் இல்லை. மிதமான வானிலை சூழலில் வழக்கமான கண்காணிப்பு போதுமானது.'
          : 'இலையில் நோய் அறிகுறிகள் எதுவும் கண்டறியப்படவில்லை. தற்போதைய வயல் சூழலில் பயிர் ஆரோக்கியமாக உள்ளது.',
    }),
    whyPresent: (envRiskLevel) => [
      {
        en: 'No disease symptoms were detected in the uploaded leaf based on the current analysis.',
        ta: 'தற்போதைய ஆய்வின்படி பதிவேற்றப்பட்ட இலையில் எந்த நோய் அறிகுறிகளும் கண்டறியப்படவில்லை.',
      },
      {
        en: 'Leaf surface displays uniform green pigmentation without necrotic lesions or pest clustering.',
        ta: 'இலைப்பரப்பு பழுப்பு புள்ளிகள் அல்லது பூச்சி தாக்குதல் இன்றி சீரான பசுமையுடன் உள்ளது.',
      },
      {
        en:
          envRiskLevel === 'High'
            ? `Current environmental risk is High. Humid weather is favorable for spore germination, so keep a close watch on foliar health.`
            : envRiskLevel === 'Moderate'
            ? `Current environmental risk is Moderate. Normal foliar maintenance is sufficient under current microclimate.`
            : `Current environmental risk is Low. Weather conditions are stable and not conducive to fungal proliferation.`,
        ta:
          envRiskLevel === 'High'
            ? 'தற்போதைய சுற்றுச்சூழல் அபாயம் அதிகமாக உள்ளது. ஈரப்பதமான வானிலை பூஞ்சை வித்துக்கள் வளர சாதகமாக உள்ளதால் இலையை கூர்ந்து கவனிக்கவும்.'
            : envRiskLevel === 'Moderate'
            ? 'தற்போதைய சுற்றுச்சூழல் அபாயம் மிதமாக உள்ளது. வழக்கமான பயிர் பராமரிப்பு போதுமானது.'
            : 'தற்போதைய சுற்றுச்சூழல் அபாயம் குறைவாக உள்ளது. நோய் பரவலுக்கு ஏதுவான வானிலை சூழல் இல்லை.',
      },
    ],
    recommendations: (envRiskLevel) => [
      {
        en: 'Continue regular crop monitoring.',
        ta: 'உங்கள் பயிரைத் தொடர்ந்து வழக்கமாக கண்காணிக்கவும்.',
      },
      {
        en: 'Check new leaves periodically for early signs of disease.',
        ta: 'புதிய மற்றும் பழைய இலைகளை குறிப்பிட்ட இடைவெளியில் ஆய்வு செய்யவும்.',
      },
      {
        en: 'Maintain good field conditions and furrow drainage.',
        ta: 'வயலில் நல்ல வடிகால் மற்றும் சிறந்த களச்சூழலைப் பராமரிக்கவும்.',
      },
      {
        en:
          envRiskLevel === 'High' || envRiskLevel === 'Moderate'
            ? 'Environmental conditions are favorable for disease development; inspect leaves more frequently rather than applying unneeded chemicals.'
            : 'Maintain standard balanced fertilization and irrigation schedule.',
        ta:
          envRiskLevel === 'High' || envRiskLevel === 'Moderate'
            ? 'சுற்றுச்சூழல் நிலைமைகள் நோய் வளர்ச்சிக்கு சாதகமாக உள்ளதால், தேவையற்ற மருந்து தெளிப்பிற்கு பதிலாக அடிக்கடி வயலை ஆய்வு செய்யவும்.'
            : 'சரியான பாசனம் மற்றும் சமச்சீர் உரமிடும் அட்டவணையைத் தொடரவும்.',
      },
      {
        en: 'Follow standard TNAU / ICAR-IISR good agricultural practices.',
        ta: 'தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழக (TNAU) நல்விவசாய நடைமுறைகளைப் பின்பற்றவும்.',
      },
    ],
  },
  'Leaf Spot': {
    defaultRiskLevel: 'High',
    symptomSummary: (envRiskLevel) => ({
      en: `Symptoms on the leaf are consistent with Leaf Spot (Colletotrichum capsici). Current environmental risk is ${envRiskLevel}, which may support disease development.`,
      ta: `இலையின் அறிகுறிகள் இலைப்புள்ளி நோய் (Colletotrichum capsici) உடன் ஒத்துப்போகின்றன. தற்போதைய சுற்றுச்சூழல் அபாயம் ${envRiskLevel === 'High' ? 'அதிகமாக' : envRiskLevel === 'Moderate' ? 'மிதமாக' : 'குறைவாக'} உள்ளது.`,
    }),
    whyPresent: (envRiskLevel) => [
      {
        en: 'Brown to dark necrotic spots on leaves, often surrounded by yellow chlorotic halos.',
        ta: 'இலைகளில் பழுப்பு அல்லது அடர் நிற புள்ளிகள், பெரும்பாலும் மஞ்சள் வளையங்களுடன் காணப்படும்.',
      },
      {
        en: `Current environmental risk is ${envRiskLevel}. Fungal pathogen development is favored by high relative humidity and warm temperatures.`,
        ta: `தற்போதைய சுற்றுச்சூழல் அபாயம் ${envRiskLevel === 'High' ? 'அதிகமாக' : envRiskLevel === 'Moderate' ? 'மிதமாக' : 'குறைவாக'} உள்ளது. அதிக ஈரப்பதம் மற்றும் வெப்பமான சூழல் இலைப்புள்ளி பூஞ்சை வளர்ச்சிக்கு சாதகமானது.`,
      },
      {
        en: 'Fungal spores spread through splashing rain droplets, overhead watering, and persistent canopy moisture.',
        ta: 'மழைத்துளிகள் மற்றும் இலைகளில் தங்கும் ஈரப்பதம் மூலம் பூஞ்சை வித்துக்கள் எளிதில் பரவக்கூடும்.',
      },
    ],
    recommendations: (envRiskLevel) => [
      {
        en: 'Monitor nearby leaves for similar circular leaf spot symptoms.',
        ta: 'அருகிலுள்ள இலைகளிலும் வட்ட வடிவ இலைப்புள்ளி அறிகுறிகள் உள்ளதா என கண்காணிக்கவும்.',
      },
      {
        en: 'Remove and destroy severely affected leaves where appropriate to reduce spore inoculum.',
        ta: 'கடுமையாக பாதிக்கப்பட்ட இலைகளை அகற்றி வயலுக்கு வெளியே அழித்துவிடவும்.',
      },
      {
        en: 'Maintain good field drainage in furrows to prevent water stagnation.',
        ta: 'பாத்திகளில் தண்ணீர் தேங்காமல் நல்ல வடிகால் வசதி அமைக்கவும்.',
      },
      {
        en: 'Maintain good air movement by ensuring proper row spacing and weed control.',
        ta: 'பாத்திகளுக்கு இடையே நல்ல காற்றோட்டம் இருக்குமாறு களையெடுத்து பராமரிக்கவும்.',
      },
      {
        en:
          envRiskLevel === 'High'
            ? 'Due to high environmental risk, prioritize foliar spray advisory from TNAU / local agricultural extension officer.'
            : 'Follow local agricultural extension / TNAU advice for suitable management practices.',
        ta:
          envRiskLevel === 'High'
            ? 'சுற்றுச்சூழல் அபாயம் அதிகமாக உள்ளதால், TNAU / உள்ளூர் வேளாண் அலுவலரின் தெளிப்பு பரிந்துரைக்கு முன்னுரிமை அளிக்கவும்.'
            : 'பொருத்தமான மேலாண்மைக்கு உள்ளூர் வேளாண் விரிவாக்க ஆலோசனையைப் பின்பற்றவும்.',
      },
    ],
  },
  Blotch: {
    defaultRiskLevel: 'High',
    symptomSummary: (envRiskLevel) => ({
      en: `Symptoms on the leaf are consistent with Leaf Blotch (Taphrina maculans). Current environmental risk is ${envRiskLevel}, which may support disease development.`,
      ta: `இலையின் அறிகுறிகள் இலைக்கருகல் நோய் (Taphrina maculans) உடன் ஒத்துப்போகின்றன. தற்போதைய சுற்றுச்சூழல் அபாயம் ${envRiskLevel === 'High' ? 'அதிகமாக' : envRiskLevel === 'Moderate' ? 'மிதமாக' : 'குறைவாக'} உள்ளது.`,
    }),
    whyPresent: (envRiskLevel) => [
      {
        en: 'Small, oval to rectangular brownish-yellow spots coalescing into large irregular blotches.',
        ta: 'இலைகளில் சிறிய மஞ்சள்-பழுப்பு புள்ளிகள் இணைந்து பெரிய ஒழுங்கற்ற கருகல் திட்டுகளாக மாறும்.',
      },
      {
        en: `Current environmental risk is ${envRiskLevel}. Taphrina maculans thrives in prolonged canopy wetness and high atmospheric humidity.`,
        ta: `தற்போதைய சுற்றுச்சூழல் அபாயம் ${envRiskLevel === 'High' ? 'அதிகமாக' : envRiskLevel === 'Moderate' ? 'மிதமாக' : 'குறைவாக'} உள்ளது. நீண்ட நேரம் இலைகளில் ஈரப்பதம் தங்குவது இந்நோய்க்கு சாதகமானது.`,
      },
      {
        en: 'Attacks lower and middle leaves during humid periods, causing early leaf drying and photosynthetic decline.',
        ta: 'ஈரப்பதமான காலங்களில் கீழ் மற்றும் நடுத்தர இலைகளைத் தாக்கி, முன்கூட்டியே காயவைத்து ஒளிச்சேர்க்கையை பாதிக்கிறது.',
      },
    ],
    recommendations: (envRiskLevel) => [
      {
        en: 'Inspect foliage across the field for yellow-brown rectangular blotch patches.',
        ta: 'வயல் முழுவதும் மஞ்சள்-பழுப்பு செவ்வக கருகல் புள்ளிகள் உள்ளதா என இலைகளை ஆய்வு செய்யவும்.',
      },
      {
        en: 'Improve inter-row air circulation by pruning dried lower canopy leaves.',
        ta: 'காய்ந்த கீழ்மட்ட இலைகளை அகற்றி பாத்திகளுக்கு இடையே காற்றோட்டத்தை அதிகரிக்கவும்.',
      },
      {
        en: 'Ensure clear furrow drainage to prevent root-zone water stagnation.',
        ta: 'வேர்ப்பகுதியில் தண்ணீர் தேங்காமல் வடித்துவிட வடிகால் வாய்க்கால்களைப் பராமரிக்கவும்.',
      },
      {
        en: 'Limit late-afternoon watering to minimize overnight foliar moisture and dew retention.',
        ta: 'இரவு நேரத்தில் இலைகளில் பனி/ஈரப்பதம் தங்குவதைக் குறைக்க மாலை நேர பாசனத்தைக் குறைக்கவும்.',
      },
      {
        en:
          envRiskLevel === 'High'
            ? 'High environmental risk detected; consult TNAU / ICAR-IISR advisory promptly for approved protective measures.'
            : 'Consult TNAU / ICAR-IISR advisory for approved foliar management.',
        ta:
          envRiskLevel === 'High'
            ? 'அதிக சுற்றுச்சூழல் அபாயம் உள்ளதால், பரிந்துரைக்கப்பட்ட இலைவழி பாதுகாப்பு நடவடிக்கைகளுக்கு TNAU வழிகாட்டலை உடனடியாக அணுகவும்.'
            : 'பரிந்துரைக்கப்பட்ட இலைவழி பாதுகாப்பு முறைகளுக்கு TNAU வழிகாட்டலைப் பின்பற்றவும்.',
      },
    ],
  },
  'Leaf Blotch': {
    defaultRiskLevel: 'High',
    symptomSummary: (envRiskLevel) => ({
      en: `Symptoms on the leaf are consistent with Leaf Blotch (Taphrina maculans). Current environmental risk is ${envRiskLevel}, which may support disease development.`,
      ta: `இலையின் அறிகுறிகள் இலைக்கருகல் நோய் (Taphrina maculans) உடன் ஒத்துப்போகின்றன. தற்போதைய சுற்றுச்சூழல் அபாயம் ${envRiskLevel === 'High' ? 'அதிகமாக' : envRiskLevel === 'Moderate' ? 'மிதமாக' : 'குறைவாக'} உள்ளது.`,
    }),
    whyPresent: (envRiskLevel) => [
      {
        en: 'Small, oval to rectangular brownish-yellow spots coalescing into large irregular blotches.',
        ta: 'இலைகளில் சிறிய மஞ்சள்-பழுப்பு புள்ளிகள் இணைந்து பெரிய ஒழுங்கற்ற கருகல் திட்டுகளாக மாறும்.',
      },
      {
        en: `Current environmental risk is ${envRiskLevel}. Taphrina maculans thrives in prolonged canopy wetness and high atmospheric humidity.`,
        ta: `தற்போதைய சுற்றுச்சூழல் அபாயம் ${envRiskLevel === 'High' ? 'அதிகமாக' : envRiskLevel === 'Moderate' ? 'மிதமாக' : 'குறைவாக'} உள்ளது. நீண்ட நேரம் இலைகளில் ஈரப்பதம் தங்குவது இந்நோய்க்கு சாதகமானது.`,
      },
      {
        en: 'Attacks lower and middle leaves during humid periods, causing early leaf drying and photosynthetic decline.',
        ta: 'ஈரப்பதமான காலங்களில் கீழ் மற்றும் நடுத்தர இலைகளைத் தாக்கி, முன்கூட்டியே காயவைத்து ஒளிச்சேர்க்கையை பாதிக்கிறது.',
      },
    ],
    recommendations: (envRiskLevel) => [
      {
        en: 'Inspect foliage across the field for yellow-brown rectangular blotch patches.',
        ta: 'வயல் முழுவதும் மஞ்சள்-பழுப்பு செவ்வக கருகல் புள்ளிகள் உள்ளதா என இலைகளை ஆய்வு செய்யவும்.',
      },
      {
        en: 'Improve inter-row air circulation by pruning dried lower canopy leaves.',
        ta: 'காய்ந்த கீழ்மட்ட இலைகளை அகற்றி பாத்திகளுக்கு இடையே காற்றோட்டத்தை அதிகரிக்கவும்.',
      },
      {
        en: 'Ensure clear furrow drainage to prevent root-zone water stagnation.',
        ta: 'வேர்ப்பகுதியில் தண்ணீர் தேங்காமல் வடித்துவிட வடிகால் வாய்க்கால்களைப் பராமரிக்கவும்.',
      },
      {
        en: 'Limit late-afternoon watering to minimize overnight foliar moisture and dew retention.',
        ta: 'இரவு நேரத்தில் இலைகளில் பனி/ஈரப்பதம் தங்குவதைக் குறைக்க மாலை நேர பாசனத்தைக் குறைக்கவும்.',
      },
      {
        en:
          envRiskLevel === 'High'
            ? 'High environmental risk detected; consult TNAU / ICAR-IISR advisory promptly for approved protective measures.'
            : 'Consult TNAU / ICAR-IISR advisory for approved foliar management.',
        ta:
          envRiskLevel === 'High'
            ? 'அதிக சுற்றுச்சூழல் அபாயம் உள்ளதால், பரிந்துரைக்கப்பட்ட இலைவழி பாதுகாப்பு நடவடிக்கைகளுக்கு TNAU வழிகாட்டலை உடனடியாக அணுகவும்.'
            : 'பரிந்துரைக்கப்பட்ட இலைவழி பாதுகாப்பு முறைகளுக்கு TNAU வழிகாட்டலைப் பின்பற்றவும்.',
      },
    ],
  },
  Aphids: {
    defaultRiskLevel: 'Moderate',
    symptomSummary: (envRiskLevel) => ({
      en: `Symptoms indicate sap-sucking Aphids (Aphis gossypii) infestation. Current microclimate conditions reflect ${envRiskLevel} risk.`,
      ta: `அறிகுறிகள் சாறு உறிஞ்சும் அசுவினி பூச்சி (Aphis gossypii) தாக்குதலைக் காட்டுகின்றன. தற்போதைய கள நிலைமைகள் ${envRiskLevel === 'High' ? 'அதிக' : envRiskLevel === 'Moderate' ? 'மிதமான' : 'குறைந்த'} அபாயத்தைக் கொண்டுள்ளன.`,
    }),
    whyPresent: (envRiskLevel) => [
      {
        en: 'Clusters of small sap-sucking insects typically found colonizing leaf undersides and tender shoots.',
        ta: 'இலைகளின் அடிப்பகுதியிலும் இளம் குருத்துகளிலும் சாறு உறிஞ்சும் அசுவினி பூச்சிகள் கூட்டமாக காணப்படும்.',
      },
      {
        en: 'Feeding causes leaf curling, crinkling, stunting, and sticky honeydew secretion.',
        ta: 'சாறு உறிஞ்சப்படுவதால் இலைகள் சுருங்கி, வளர்ச்சி குன்றி, பிசுபிசுப்பான தேன் போன்ற திரவம் படியக்கூடும்.',
      },
      {
        en: `Current environmental risk is ${envRiskLevel}. Warm and moderate humidity can favor rapid pest reproduction.`,
        ta: `தற்போதைய சுற்றுச்சூழல் அபாயம் ${envRiskLevel === 'High' ? 'அதிகமாக' : envRiskLevel === 'Moderate' ? 'மிதமாக' : 'குறைவாக'} உள்ளது. வெதுவெதுப்பான மித-ஈரப்பத சூழல் அசுவினி பூச்சிகள் விரைவாக இனப்பெருக்கம் செய்ய சாதகமானது.`,
      },
    ],
    recommendations: (envRiskLevel) => [
      {
        en: 'Regularly inspect the undersides of leaves and young shoots for aphid clusters.',
        ta: 'இலைகளின் அடியிலும் இளம் குருத்துகளிலும் அசுவினி பூச்சிகள் உள்ளதா என அடிக்கடி பார்க்கவும்.',
      },
      {
        en: 'Wash off early localized colonies with a jet water spray or 3% neem oil formulation.',
        ta: 'ஆரம்ப நிலை பூச்சிகளை அழுத்தமான நீர் தெளிப்பு அல்லது 3% வேப்பெண்ணெய் கரைசல் மூலம் கட்டுப்படுத்தவும்.',
      },
      {
        en: 'Encourage and protect natural predators like ladybird beetles and hoverflies in the field.',
        ta: 'வயலில் பொறிவண்டு, சிர்பிட் ஈ போன்ற நன்மை செய்யும் இயற்கை பூச்சிகளைப் பாதுகாக்கவும்.',
      },
      {
        en: 'Avoid excessive nitrogen (urea) application which promotes soft, pest-attractive foliage.',
        ta: 'அதிக தழைச்சத்து (யூரியா) இடுவதைத் தவிர்க்கவும்; இது மென்மையான தழைகளை உருவாக்கி பூச்சிகளை ஈர்க்கும்.',
      },
      {
        en:
          envRiskLevel === 'High'
            ? 'Elevated pest risk detected; consult local agricultural officer for recommended biological or botanical foliar sprays.'
            : 'Consult local extension officer for recommended botanical or biological sprays.',
        ta:
          envRiskLevel === 'High'
            ? 'அதிக பூச்சி அபாயம் உள்ளதால், பரிந்துரைக்கப்பட்ட இயற்கை அல்லது உயிரியல் தெளிப்புகளுக்கு வேளாண் அலுவலரை உடனே அணுகவும்.'
            : 'பரிந்துரைக்கப்பட்ட இயற்கை அல்லது உயிரியல் தெளிப்புகளுக்கு வேளாண் அலுவலரை அணுகவும்.',
      },
    ],
  },
};

export const DiseaseDetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const {
    language,
    selectedLocation,
    selectedSample,
    customImagePreview,
    setCustomImagePreview,
    uploadedFile,
    setUploadedFile,
    hasAnalyzedImage,
    setHasAnalyzedImage,
    isResearchSample,
    clearSelectedImage,
    analysisError,
    setAnalysisError,
    imageResult,
    isImageAnalyzing,
    runImageAnalysis,
    envRiskResult,
    researchRiskResult,
    multimodalResult,
    addToast,
  } = useApp();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [analysisTimestamp, setAnalysisTimestamp] = useState<string>('');

  // Camera Integration State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isCapturedFromCamera, setIsCapturedFromCamera] = useState(false);

  const t = TRANSLATIONS;

  const processingSteps = [
    language === 'ta' ? 'இலைப்படத்தின் தரத்தை சரிபார்க்கிறது...' : 'Validating foliar image integrity & format...',
    language === 'ta' ? 'படத்தின் வண்ண நுணுக்கங்களை மாற்றியமைக்கிறது...' : 'Normalizing input image...',
    language === 'ta' ? 'பூஞ்சை மற்றும் பூச்சி அறிகுறிகளை பகுப்பாய்வு செய்கிறது...' : 'Analyzing foliar patterns...',
    language === 'ta' ? 'பயிர் நோய்களுடன் ஒப்பிடுகிறது...' : 'Evaluating disease characteristics...',
    language === 'ta' ? 'இறுதி முடிவுகளை உருவாக்குகிறது...' : 'Generating diagnosis result...',
  ];

  const diseaseKey = imageResult.disease as keyof typeof TRANSLATIONS.diseases;
  const diseaseInfo = TRANSLATIONS.diseases[diseaseKey] || {
    en: imageResult.disease,
    ta: imageResult.disease,
    desc: { en: '', ta: '' },
  };

  const currentEnvRiskLevel = researchRiskResult?.riskLevel || envRiskResult?.level || 'Moderate';
  const currentCombinedRiskLevel = multimodalResult?.riskLevel || currentEnvRiskLevel;

  const diseaseContent =
    DISEASE_DYNAMIC_CONTENT[imageResult.disease] ||
    DISEASE_DYNAMIC_CONTENT['Healthy'];

  // Camera stream cleanup helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
    setCameraError(null);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Update dynamic timestamp upon successful analysis
  useEffect(() => {
    if (hasAnalyzedImage && !analysisTimestamp) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      setAnalysisTimestamp(`${formattedDate}, ${formattedTime}`);
    }
  }, [hasAnalyzedImage]);

  // Request camera access
  const startCameraStream = async (targetFacing: 'environment' | 'user' = facingMode) => {
    setAnalysisError(null);
    setCameraError(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      const msg = t.camera.notSupported[language];
      setCameraError(msg);
      setIsCameraActive(true);
      return;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsCameraLoading(true);
    setIsCameraActive(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play interrupted or autoplay blocked', playErr);
        }
      }

      setIsCameraLoading(false);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      } catch {
        setHasMultipleCameras(false);
      }
    } catch (err: any) {
      setIsCameraLoading(false);
      console.error('Camera stream access failed:', err);
      const errName = err?.name || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraError(t.camera.permissionDenied[language]);
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError(t.camera.notFound[language]);
      } else {
        setCameraError(t.camera.initError[language]);
      }
    }
  };

  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCameraStream(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const videoWidth = video.videoWidth || 1280;
    const videoHeight = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setAnalysisError(language === 'ta' ? 'படத்தைப் பிடிக்க முடியவில்லை' : 'Failed to initialize canvas context.');
      return;
    }

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setAnalysisError(language === 'ta' ? 'படத்தை உருவாக்க முடியவில்லை' : 'Failed to generate image file from camera.');
          return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `turmeric_leaf_camera_${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        stopCameraStream();
        setIsCapturedFromCamera(true);
        processSelectedFile(file);
      },
      'image/jpeg',
      0.95
    );
  };

  const processSelectedFile = (file: File | null) => {
    setAnalysisError(null);
    if (!file) {
      addToast({
        type: 'warning',
        title: language === 'ta' ? 'படம் தேர்ந்தெடுக்கப்படவில்லை' : 'No File Selected',
        message: language === 'ta' ? 'சரியான இலைப்படத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please choose a valid JPG, JPEG, or PNG leaf image.',
      });
      return;
    }

    if (!ALLOWED_EXTS.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      const msg = language === 'ta' ? 'JPG, JPEG, PNG வடிவ படங்கள் மட்டுமே அனுமதிக்கப்படும்.' : 'Only JPG, JPEG, and PNG image files are supported.';
      setAnalysisError(msg);
      addToast({
        type: 'error',
        title: language === 'ta' ? 'தவறான கோப்பு வடிவம்' : 'Invalid File Type',
        message: msg,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const msg = language === 'ta' ? `கோப்பின் அளவு அதிகம் (${sizeMb} MB). 20 MB-க்குள் பதிவேற்றவும்.` : `File size (${sizeMb} MB) exceeds maximum allowed limit of 20 MB.`;
      setAnalysisError(msg);
      addToast({
        type: 'error',
        title: language === 'ta' ? 'கோப்பு அளவு அதிகம்' : 'File Too Large',
        message: msg,
      });
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setCustomImagePreview(url);
      setUploadedFile(file);
      addToast({
        type: 'info',
        title: language === 'ta' ? 'இலைப்படம் தயார்' : 'Leaf Specimen Ready',
        message: `${file.name} (${(file.size / 1024).toFixed(0)} KB).`,
      });
    } catch (e) {
      setAnalysisError(language === 'ta' ? 'படத்தை வாசிக்க முடியவில்லை.' : 'Failed to read image file preview.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIsCapturedFromCamera(false);
    processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    setIsCapturedFromCamera(false);
    processSelectedFile(file);
  };

  const handleClearImage = () => {
    stopCameraStream();
    setIsCapturedFromCamera(false);
    clearSelectedImage();
  };

  const handleStartAnalysis = async () => {
    if (!customImagePreview && !uploadedFile && !isResearchSample) {
      const msg =
        language === 'ta'
          ? 'ஆய்வைத் தொடங்க மஞ்சள் இலைப் புகைப்படத்தைப் பதிவேற்றவும் அல்லது படம் எடுக்கவும்.'
          : 'Upload or capture a turmeric leaf photo to begin analysis.';
      setAnalysisError(msg);
      addToast({
        type: 'warning',
        title: language === 'ta' ? 'இலைப்படம் தேவை' : 'Specimen Required',
        message: msg,
      });
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setAnalysisTimestamp(`${formattedDate}, ${formattedTime}`);

    setActiveStepIndex(0);
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 280);

    await runImageAnalysis();
    clearInterval(interval);
  };

  const handleCheckAnotherLeaf = () => {
    setHasAnalyzedImage(false);
    handleClearImage();
  };

  const hasImage = !!(customImagePreview || uploadedFile);
  const currentImageSrc = customImagePreview || (isResearchSample ? selectedSample.imageUrl : '');

  const leafSpotProb = imageResult.probabilities.LeafSpot ?? imageResult.probabilities['Leaf Spot'] ?? 0;
  const blotchProb = imageResult.probabilities.Blotch ?? 0;
  const aphidsProb = imageResult.probabilities.Aphids ?? 0;
  const healthyProb = imageResult.probabilities.Healthy ?? 0;

  // =========================================================================
  // VIEW 2: ANALYSIS RESULT VIEW (MATCHING THE REFERENCE SCREENSHOT)
  // =========================================================================
  if (hasAnalyzedImage && !isImageAnalyzing) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
        {/* Breadcrumb Navigation */}
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <span>Curuma</span>
          <span>&gt;</span>
          <span>{language === 'ta' ? 'விவசாய சேவைகள்' : 'Farmer Services'}</span>
          <span>&gt;</span>
          <span>{language === 'ta' ? 'இலையை சரிபார்' : 'Check Leaf'}</span>
          <span>&gt;</span>
          <span className="text-emerald-800 font-bold">{language === 'ta' ? 'முடிவு' : 'Result'}</span>
        </div>

        {/* Header with Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display flex items-center gap-2.5">
              <Sprout className="w-7 h-7 text-emerald-600 fill-emerald-600" />
              <span>{language === 'ta' ? 'ஆய்வு முடிவு' : 'Analysis Result'}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {language === 'ta'
                ? 'உங்கள் மஞ்சள் இலைக்கான நோய் கணிப்பு மற்றும் விரிவான ஆய்வு முடிவுகள்.'
                : 'Here is the predicted disease and detailed analysis for your turmeric leaf.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto shadow-2xs">
            <span>🌿</span>
            <span>Early Detection • Healthier Harvests</span>
          </div>
        </div>

        {/* OOD Rejection Notice if rejected */}
        {imageResult.oodStatus === 'OOD_REJECTED' ? (
          <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-300 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'ta' ? 'தெளிவான மஞ்சள் இலை தேவை' : 'Clear Turmeric Leaf Required'}
                </h3>
                <p className="text-xs text-slate-700 font-medium mt-0.5 leading-relaxed">
                  {language === 'ta'
                    ? 'பதிவேற்றிய படம் தெளிவான மஞ்சள் இலையாக அடையாளம் காணப்படவில்லை. சரியான முடிவிற்கு ஒரு தனி மஞ்சள் இலையை அருகில் வைத்து நல்ல வெளிச்சத்தில் படம் எடுக்கவும்.'
                    : 'The uploaded image could not be recognized as a single clear turmeric leaf. For accurate diagnosis, please capture one close-up turmeric leaf under good lighting.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  setHasAnalyzedImage(false);
                  startCameraStream('environment');
                }}
                className="py-3 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4 text-emerald-200" />
                <span>{language === 'ta' ? 'கேமராவில் மீண்டும் எடு' : 'Retake with Camera'}</span>
              </button>

              <button
                onClick={() => {
                  setHasAnalyzedImage(false);
                  fileInputRef.current?.click();
                }}
                className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-slate-600" />
                <span>{language === 'ta' ? 'வேறு படம் பதிவேற்று' : 'Upload Another Photo'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TOP ROW: 3 CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Card 1: Uploaded Leaf Image (5 cols) */}
              <div className="md:col-span-5 bg-white rounded-3xl p-5 border border-[#e2ece6] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ta' ? 'பதிவேற்றிய இலைப்படம்' : 'Uploaded Leaf Image'}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 font-mono">
                    {analysisTimestamp || 'Just now'}
                  </span>
                </div>

                <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group flex items-center justify-center">
                  <img
                    src={currentImageSrc || '/turmeric_leaf_sample.jpg'}
                    alt="Uploaded Turmeric Leaf"
                    className="w-full h-full object-contain bg-slate-50"
                  />
                  <button
                    onClick={() => setShowFullImageModal(true)}
                    className="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>{language === 'ta' ? 'முழு படம் காண்க' : 'View Full Image'}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Detected Disease (4 cols) */}
              <div
                className={`md:col-span-4 rounded-3xl p-5 border shadow-xs space-y-3 flex flex-col justify-between ${
                  imageResult.disease === 'Healthy'
                    ? 'bg-[#f9fdfa] border-emerald-200'
                    : 'bg-[#fff9f9] border-[#fed7d7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    {imageResult.disease === 'Healthy' ? (
                      <Sprout className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Bug className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{language === 'ta' ? 'கண்டறியப்பட்ட நிலை' : 'Detected Disease'}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      imageResult.disease === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : currentCombinedRiskLevel === 'High'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {imageResult.disease === 'Healthy'
                      ? (language === 'ta' ? 'குறைந்த அபாயம்' : 'Low Risk')
                      : currentCombinedRiskLevel === 'High'
                      ? (language === 'ta' ? 'அதிக அபாயம்' : 'High Risk')
                      : (language === 'ta' ? 'மிதமான அபாயம்' : 'Moderate Risk')}
                  </span>
                </div>

                <div>
                  <h2
                    className={`text-2xl font-black font-display ${
                      imageResult.disease === 'Healthy' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {diseaseInfo[language] || imageResult.disease}
                  </h2>
                  <div className="mt-1">
                    <span className="text-xs text-slate-500 font-medium block">Confidence</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">{imageResult.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                    {diseaseContent.symptomSummary(currentEnvRiskLevel)[language]}
                  </p>
                </div>
              </div>

              {/* Card 3: Quick Info (3 cols) */}
              <div className="md:col-span-3 bg-white rounded-3xl p-5 border border-[#e2ece6] shadow-xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>{language === 'ta' ? 'சுருக்க விபரம்' : 'Quick Info'}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Sprout className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'ta' ? 'பயிர்' : 'Crop'}</span>
                      <span className="font-extrabold text-slate-900">{language === 'ta' ? 'மஞ்சள் (Curcuma longa)' : 'Turmeric (Curcuma longa)'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'ta' ? 'தேதி & நேரம்' : 'Date & Time'}</span>
                      <span className="font-extrabold text-slate-900 font-mono">{analysisTimestamp || 'Just now'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'ta' ? 'அமைவிடம்' : 'Location'}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-900">{formatLocationDisplay(selectedLocation, language)}</span>
                        {selectedLocation.isCurrentLocation && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                            {language === 'ta' ? 'தற்போதைய இடம்' : 'Current'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'ta' ? 'சுற்றுச்சூழல் / கூட்டு அபாயம்' : 'Current / Combined Risk'}</span>
                      <span className="font-extrabold text-slate-900">
                        {currentCombinedRiskLevel === 'High'
                          ? (language === 'ta' ? 'அதிக அபாயம் (High)' : 'High Risk')
                          : currentCombinedRiskLevel === 'Moderate'
                          ? (language === 'ta' ? 'மிதமான அபாயம் (Moderate)' : 'Moderate Risk')
                          : (language === 'ta' ? 'குறைந்த அபாயம் (Low)' : 'Low Risk')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECOND ROW: 2 MAIN COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* LEFT COLUMN: Probabilities & Why Present (6 cols) */}
              <div className="md:col-span-6 space-y-5">
                {/* Card 4: Prediction Probabilities */}
                <div className="bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <span className="text-emerald-700">📊</span>
                    <span>{language === 'ta' ? 'கணிப்பு நிகழ்தகவுகள் (அனைத்து வகைகள்)' : 'Prediction Probabilities (All Classes)'}</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Leaf Spot */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>Leaf Spot</span>
                        <span className="font-mono">{leafSpotProb.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, leafSpotProb)}%` }}></div>
                      </div>
                    </div>

                    {/* Leaf Blotch */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>Leaf Blotch</span>
                        <span className="font-mono">{blotchProb.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${Math.min(100, blotchProb)}%` }}></div>
                      </div>
                    </div>

                    {/* Aphids */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>Aphids</span>
                        <span className="font-mono">{aphidsProb.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, aphidsProb)}%` }}></div>
                      </div>
                    </div>

                    {/* Healthy */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>Healthy</span>
                        <span className="font-mono">{healthyProb.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, healthyProb)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 5: Why this diagnosis / disease status? */}
                <div className="bg-[#f0f7ff] rounded-3xl p-6 border border-[#dbeafe] shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span className="text-blue-600">☁️</span>
                    <span>
                      {imageResult.disease === 'Healthy'
                        ? (language === 'ta' ? 'ஆய்வுப் பின்னணி & சூழல்' : 'Analysis Background & Context')
                        : (language === 'ta' ? 'இந்த நோய் ஏன் வரக்கூடும்?' : 'Why this disease might be present?')}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700 font-medium pt-1">
                    {diseaseContent.whyPresent(currentEnvRiskLevel).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{item[language]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* RIGHT COLUMN: What should I do now? & Important Note (6 cols) */}
              <div className="md:col-span-6 space-y-5">
                {/* Card 6: What should I do now? (DYNAMIC PER DISEASE) */}
                <div className="bg-[#f9fdfa] rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span className="text-emerald-700">💡</span>
                    <span>{language === 'ta' ? 'இப்போது என்ன செய்ய வேண்டும்?' : 'What should I do now?'}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 font-semibold pt-1">
                    {diseaseContent.recommendations(currentEnvRiskLevel).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white shrink-0 mt-0.5" />
                        <span>{item[language]}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 7: Important Note */}
                <div className="bg-[#fffdf0] rounded-3xl p-5 border border-[#fef08a] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{language === 'ta' ? 'முக்கிய குறிப்பு' : 'Important Note'}</span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {language === 'ta'
                      ? 'இது வழிகாட்டலுக்கான AI-அடிப்படையிலான கணிப்பு மட்டுமே. இரசாயன மேலாண்மைக்கு, TNAU / ICAR-IISR / உள்ளூர் வேளாண் விரிவாக்க அலுவலர் ஆலோசனை மற்றும் தயாரிப்பு-லேபிள் வழிமுறைகளைப் பின்பற்றவும்.'
                      : 'This is an AI-based prediction for guidance only. For chemical management, follow TNAU / ICAR-IISR / local agricultural extension officer advice and product-label instructions.'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* BOTTOM ACTION ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <button
              onClick={handleCheckAnotherLeaf}
              className="py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-emerald-600 shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-emerald-700" />
              <span>{language === 'ta' ? 'மற்றொரு இலையை சரிபார்' : 'Check Another Leaf'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-right shrink-0">
            <span className="text-2xl">🌱</span>
            <div className="text-left">
              <span className="text-xs font-serif italic text-emerald-950 font-bold block">Healthy Plants</span>
              <span className="text-xs font-serif italic text-emerald-950 font-bold block">Better Yields</span>
            </div>
          </div>
        </div>

        {/* Full Image Modal */}
        {showFullImageModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'ta' ? 'முழு இலைப்படம்' : 'Full Leaf Specimen Image'}
                </h3>
                <button
                  onClick={() => setShowFullImageModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden flex items-center justify-center bg-slate-100 rounded-2xl p-2">
                <img
                  src={currentImageSrc || '/turmeric_leaf_sample.jpg'}
                  alt="Full Leaf View"
                  className="max-h-[60vh] object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: INITIAL LEAF CHECK INPUT VIEW (WITH "BEFORE YOU CHECK" CARD)
  // =========================================================================
  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display flex items-center gap-2.5">
          <Sprout className="w-7 h-7 text-emerald-600 fill-emerald-600" />
          <span>{language === 'ta' ? 'மஞ்சள் இலையை சரிபார்க்கவும்' : 'Check Your Turmeric Leaf'}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {language === 'ta'
            ? 'நோய் பாதிப்பை அறிய ஒரு தெளிவான மஞ்சள் இலையின் புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும்.'
            : 'Take or upload a clear photo of a turmeric leaf to check for diseases.'}
        </p>
      </div>

      {/* Main Grid: Left Leaf Photo Input / Preview & Right 'Before you check' Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column - Main Photo Input & CTA (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-5">
          {/* LIVE CAMERA VIEWFINDER */}
          {isCameraActive ? (
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500 shadow-md">
              <div className="relative w-full aspect-[4/3] sm:aspect-video flex items-center justify-center bg-black overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label={t.camera.title[language]}
                  className={`w-full h-full object-cover transition-transform ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />

                {isCameraLoading && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 z-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                    <p className="text-xs font-semibold text-slate-200">{t.camera.starting[language]}</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4 z-20">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <VideoOff className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-sm font-bold text-rose-300">
                        {language === 'ta' ? 'கேமரா அணுகல் தோல்வி' : 'Camera Unavailable'}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => startCameraStream(facingMode)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{language === 'ta' ? 'மீண்டும் முயற்சி' : 'Retry'}</span>
                      </button>
                      <button
                        onClick={() => {
                          stopCameraStream();
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{t.actions.uploadImage[language]}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewfinder Controls */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={stopCameraStream}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t.actions.closeCamera[language]}
                </button>

                {/* Shutter Button */}
                <button
                  onClick={capturePhoto}
                  disabled={isCameraLoading || !!cameraError}
                  aria-label={t.actions.capturePhoto[language]}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2.5 cursor-pointer transform active:scale-95"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  </div>
                  <span>{t.actions.capturePhoto[language]}</span>
                </button>

                {hasMultipleCameras ? (
                  <button
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    title={t.actions.switchCamera[language]}
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-9"></div>
                )}
              </div>
            </div>
          ) : hasImage ? (
            /* Large Prominent Specimen Preview */
            <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              <img
                src={currentImageSrc}
                alt="Turmeric Leaf Specimen"
                className={`w-full h-full object-contain bg-slate-50 transition-transform duration-300 ${
                  isImageAnalyzing ? 'scale-105 filter blur-[1px]' : ''
                }`}
              />

              {isImageAnalyzing && <div className="scan-line"></div>}

              {/* Close / Remove Image Button */}
              <button
                onClick={handleClearImage}
                className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full text-xs transition-colors cursor-pointer shadow-md"
                title={language === 'ta' ? 'படத்தை நீக்கு' : 'Remove Image'}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            /* Empty Dropzone State */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : 'border-slate-300 bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-400'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 max-w-sm leading-snug">
                {language === 'ta'
                  ? 'மஞ்சள் இலை புகைப்படத்தை பதிவேற்ற இங்கு கிளிக் செய்யவும் அல்லது இழுத்துப் போடவும்'
                  : 'Click or drag a turmeric leaf photo here'}
              </p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                JPG, JPEG, PNG, WEBP
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Action Buttons Row: [ Use Camera ] & [ Upload Photo ] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => startCameraStream('environment')}
              className="py-3.5 px-5 rounded-2xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-200" />
              <span>{language === 'ta' ? 'கேமரா பயன்படுத்து' : 'Use Camera'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-slate-200 hover:border-emerald-300 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-emerald-700" />
              <span>{language === 'ta' ? 'புகைப்படம் பதிவேற்று' : 'Upload Photo'}</span>
            </button>
          </div>

          {/* Error Message */}
          {analysisError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{analysisError}</div>
            </div>
          )}

          {/* Primary Main CTA: [ Analyze Leaf ] */}
          <button
            onClick={handleStartAnalysis}
            disabled={isImageAnalyzing || isCameraActive}
            className="w-full py-4 rounded-2xl bg-[#14532d] hover:bg-[#0f3d21] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-base tracking-wide shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isImageAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-300" />
                <span>{language === 'ta' ? 'ஆய்வு நடைபெறுகிறது...' : 'Analyzing Leaf...'}</span>
              </>
            ) : (
              <>
                <ScanEye className="w-5 h-5 text-emerald-300" />
                <span>{language === 'ta' ? 'இலையை ஆய்வு செய்' : 'Analyze Leaf'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column - Compact 'Before you check' Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#f9fdfa] rounded-3xl p-6 border border-[#e2ece6] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Sprout className="w-5 h-5 text-emerald-600 fill-emerald-600" />
            <span>{language === 'ta' ? 'சரிபார்க்கும் முன்' : 'Before you check'}</span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'ஒரு தெளிவான மஞ்சள் இலையை மட்டும் தேர்வு செய்யவும்'
                  : 'Take one clear turmeric leaf'}
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'அருகில் சென்று நல்ல வெளிச்சத்தில் படம் எடுக்கவும்'
                  : 'Move closer and use good light'}
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'முழு செடியையோ அல்லது தொலைவிலிருந்தோ படம் எடுப்பதைத் தவிர்க்கவும்'
                  : 'Avoid whole-plant or distant photos'}
              </span>
            </div>
          </div>

          {/* Clean Illustration / Note at Bottom of Card */}
          <div className="pt-4 flex flex-col items-center text-center border-t border-emerald-100/80">
            <div className="w-16 h-16 flex items-center justify-center text-4xl my-1">
              🍃
            </div>
            <span className="text-xs font-bold text-emerald-900 font-serif italic">
              {language === 'ta' ? 'தெளிவான இலை நல்ல முடிவைத் தரும்!' : 'A clear leaf gets better results!'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Information Banner */}
      <div className="bg-[#f0f7ff] rounded-3xl p-4 sm:p-5 border border-[#dbeafe] shadow-xs flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
          i
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {language === 'ta'
            ? 'இலை தெளிவாக இருப்பதை உறுதிப்படுத்தவும். பிற தாவரங்களின் படங்கள் துல்லியமான முடிவுகளைத் தராது.'
            : 'Make sure the leaf is clearly visible. Other plant images may not give accurate results.'}
        </p>
      </div>
    </div>
  );
};

export default DiseaseDetectionPage;
