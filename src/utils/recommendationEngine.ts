/**
 * TurmeriCare AI - State-Based Agronomic Recommendation Engine
 * ============================================================
 * Provides deterministic, explainable, and context-dependent recommendation
 * profiles derived from the Cartesian combination of:
 * 1. Diagnostic State (Healthy, Leaf Spot, Blotch, Aphids, OOD/Rejected, No Scan)
 * 2. Model Confidence
 * 3. Environmental Risk Tier (Low, Moderate, High)
 * 4. Microclimate Evidence (Temperature, Humidity, Rainfall, 14-day Exposure)
 * 5. Field Conditions (Soil Moisture, Drainage, Canopy Density, Irrigation, DAP)
 * 6. Planting & Seasonal Context
 *
 * Conforms strictly to cautious scientific language without causal fabrication
 * or unauthorized chemical dosage prescriptions.
 */

import { Language } from './translations';
import { ExposureFeatures } from './researchRiskEngine';

export type DiagnosisState =
  | 'NO_SCAN'
  | 'OOD'
  | 'HEALTHY'
  | 'LEAF_SPOT'
  | 'BLOTCH'
  | 'APHIDS';

export type EnvironmentalRiskTier = 'Low' | 'Moderate' | 'High';

export type PriorityLevel = 'high' | 'medium' | 'low' | 'routine' | 'urgent';

export interface LocalizedText {
  en: string;
  ta: string;
}

export interface RecommendationAction {
  id: string;
  title: LocalizedText;
  what: LocalizedText;
  why: LocalizedText;
  priority: LocalizedText;
  priorityLevel: PriorityLevel;
  monitor: LocalizedText;
  nextCheck: LocalizedText;
  icon: string;
  cardBg: string;
}

export interface RecommendationProfile {
  profileKey: string;
  diagnosisState: DiagnosisState;
  envRiskTier: EnvironmentalRiskTier;
  situationLevel: 'High' | 'Moderate' | 'Low';
  displayTitle: LocalizedText;
  diagnosisExplanation: LocalizedText;
  whyPoints: Array<{
    icon: string;
    title: LocalizedText;
    text: LocalizedText;
  }>;
  primaryAction: RecommendationAction;
  secondaryActions: RecommendationAction[];
  managementGuidance: {
    title: LocalizedText;
    cultural: LocalizedText;
    extension: LocalizedText;
  };
  fieldConditionNotes: LocalizedText[];
}

export interface RecommendationEngineInput {
  hasAnalyzedImage: boolean;
  disease: string;
  confidence: number;
  oodStatus?: string;
  verificationStatus?: string;
  verifierScore?: number;
  envRiskTier: EnvironmentalRiskTier;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  leafWetnessHours?: number;
  exposureFeatures?: ExposureFeatures;
  soilMoisture?: number;
  drainageCondition?: string;
  canopyDensity?: string;
  recentIrrigation?: string;
  cropDap?: number;
  plantingDate?: string | null;
  contributingFactors?: string[];
}

/**
 * Determine the canonical diagnosis state from analysis results.
 */
export function resolveDiagnosisState(
  hasAnalyzedImage: boolean,
  disease: string,
  oodStatus?: string,
  verificationStatus?: string
): DiagnosisState {
  if (!hasAnalyzedImage) {
    return 'NO_SCAN';
  }

  const isOod =
    oodStatus === 'OOD_REJECTED' ||
    oodStatus === 'VERIFIER_REJECTED' ||
    verificationStatus === 'REJECTED_NON_TURMERIC' ||
    disease === 'Non-Turmeric / Out-of-Domain' ||
    disease === 'Clear Turmeric Leaf Required' ||
    disease === 'Unverified / Low Foliar Confidence';

  if (isOod) {
    return 'OOD';
  }

  if (disease === 'Leaf Spot') return 'LEAF_SPOT';
  if (disease === 'Blotch') return 'BLOTCH';
  if (disease === 'Aphids') return 'APHIDS';
  return 'HEALTHY';
}

/**
 * State-Based Recommendation Engine Core Dispatcher
 */
export function generateRecommendationProfile(
  input: RecommendationEngineInput
): RecommendationProfile {
  const state = resolveDiagnosisState(
    input.hasAnalyzedImage,
    input.disease,
    input.oodStatus,
    input.verificationStatus
  );

  const envTier = input.envRiskTier || 'Low';
  const conf = input.confidence || 0;
  const exp = input.exposureFeatures;
  const dap = input.cropDap ?? 120;

  // Derive Field Condition Specific Insights
  const fieldNotes: LocalizedText[] = [];
  if (input.soilMoisture !== undefined && input.soilMoisture > 75) {
    fieldNotes.push({
      en: `Elevated soil moisture observed (${input.soilMoisture}%). Ensure furrow drainage channels are free of standing water.`,
      ta: `அதிக மண் ஈரப்பதம் (${input.soilMoisture}%) கண்டறியப்பட்டுள்ளது. பாத்திகளில் தண்ணீர் தேங்காமல் வடிகால் வழிகளை பராமரிக்கவும்.`,
    });
  }
  if (input.canopyDensity === 'dense') {
    fieldNotes.push({
      en: 'Dense crop canopy recorded. Maintain inter-row weed clearance to facilitate microclimate airflow.',
      ta: 'அடர்த்தியான பயிர்க்கூட்டம் பதிவாகியுள்ளது. காற்று தடையின்றி செல்ல பாத்திகளில் உள்ள களைகளை அகற்றவும்.',
    });
  }
  if (dap >= 150) {
    fieldNotes.push({
      en: `Crop is at ~${dap} DAP (Rhizome Development stage). Protecting upper canopy foliage is critical for optimal yield accumulation.`,
      ta: `பயிர் ~${dap} DAP (கிழங்கு வளர்ச்சிப் பருவம்) நிலையில் உள்ளது. அதிக மகசூலுக்கு மேல் இலைகளை பாதுகாப்பது அவசியம்.`,
    });
  }

  // -------------------------------------------------------------------------
  // 1. STATE: OOD / REJECTED SPECIMEN
  // -------------------------------------------------------------------------
  if (state === 'OOD') {
    return {
      profileKey: 'OOD_SPECIMEN',
      diagnosisState: 'OOD',
      envRiskTier: envTier,
      situationLevel: 'Low',
      displayTitle: {
        en: 'Unsupported Specimen',
        ta: 'வரம்பிற்கு அப்பாற்பட்ட படம்',
      },
      diagnosisExplanation: {
        en: 'The uploaded specimen could not be verified as a suitable turmeric leaf. Please capture a clear, single turmeric leaf photo to receive diagnostic recommendations.',
        ta: 'பதிவேற்றப்பட்ட படம் மஞ்சள் இலை என சரிபார்க்கப்படவில்லை. துல்லியமான நோய் மேலாண்மை வழிகாட்டலுக்கு தெளிவான ஒற்றை மஞ்சள் இலையைப் படம் எடுக்கவும்.',
      },
      whyPoints: [
        {
          icon: '⚠️',
          title: { en: 'Specimen Verification', ta: 'இலை சரிபார்ப்பு' },
          text: {
            en: 'Visual foliar features do not match expected turmeric botanical leaf characteristics.',
            ta: 'படத்தின் காட்சி அம்சங்கள் மஞ்சள் இலை தாவரவியல் வடிவமைப்புடன் பொருந்தவில்லை.',
          },
        },
        {
          icon: '🛡️',
          title: { en: 'Safety Safeguard Protocol', ta: 'பாதுகாப்பு நெறிமுறை' },
          text: {
            en: 'Disease-specific recommendations are withheld for unverified images to prevent false agronomic advice.',
            ta: 'தவறான பரிந்துரைகளைத் தவிர்க்க, உறுதிப்படுத்தப்படாத படங்களுக்கு நோய் மேலாண்மை வழிகாட்டல் வழங்கப்படாது.',
          },
        },
        {
          icon: '📸',
          title: { en: 'Capture Guidelines', ta: 'புகைப்பட வழிகாட்டல்' },
          text: {
            en: 'Capture a well-lit, in-focus photograph centered cleanly on the turmeric leaf lamina.',
            ta: 'மஞ்சள் இலையின் மேற்பரப்பு தெளிவாகத் தெரியும் வகையில் நல்ல பகல் வெளிச்சத்தில் படம் எடுக்கவும்.',
          },
        },
      ],
      primaryAction: {
        id: 'ood-capture-leaf',
        title: { en: 'Capture Clear Turmeric Leaf', ta: 'சரியான இலைப்படம் எடுக்கவும்' },
        what: {
          en: 'Position a single, clear turmeric leaf in the center of the camera frame.',
          ta: 'மஞ்சள் பயிரின் ஒற்றை இலையை கேமராவின் மையத்தில் வைத்து படம் எடுக்கவும்.',
        },
        why: {
          en: 'The previous upload did not pass the foliar verification stage.',
          ta: 'முந்தைய படம் இலை சரிபார்ப்பு நிலையில் ஏற்றுக்கொள்ளப்படவில்லை.',
        },
        priority: {
          en: 'Required Action — Necessary before any disease diagnosis can be generated.',
          ta: 'தேவையான பணி — நோய் பகுப்பாய்வு செய்ய இலைப்படம் அவசியம்.',
        },
        priorityLevel: 'urgent',
        monitor: {
          en: 'Ensure natural diffused daylight and avoid shadows or camera blur.',
          ta: 'நிழல் மற்றும் தெளிவற்ற தன்மை இல்லாமல் இயற்கை வெளிச்சத்தில் படம் எடுக்கவும்.',
        },
        nextCheck: {
          en: 'Upload a new, valid turmeric leaf image on Check Leaf.',
          ta: 'Check Leaf பக்கத்தில் புதிய மஞ்சள் இலைப்படத்தை பதிவேற்றவும்.',
        },
        icon: 'Camera',
        cardBg: 'bg-slate-50 border border-slate-200',
      },
      secondaryActions: [
        {
          id: 'ood-lighting',
          title: { en: 'Ensure Good Lighting', ta: 'நல்ல வெளிச்சம்' },
          what: {
            en: 'Avoid dark shade, direct glare, or flash reflections.',
            ta: 'அதிக நிழல் அல்லது ஒளிச்சிதறல் இல்லாமல் இயற்கை வெளிச்சத்தைப் பயன்படுத்தவும்.',
          },
          why: {
            en: 'High contrast shadows obscure leaf vein and symptom patterns.',
            ta: 'அடர்ந்த நிழல் இலை நரம்புகள் மற்றும் நோய் அறிகுறிகளை மறைத்துவிடும்.',
          },
          priority: { en: 'Quality Check', ta: 'தர சோதனை' },
          priorityLevel: 'routine',
          monitor: { en: 'Uniform leaf surface illumination.', ta: 'சீரான இலை மேற்பரப்பு வெளிச்சம்.' },
          nextCheck: { en: 'Before taking the photo.', ta: 'படம் எடுக்கும் முன்.' },
          icon: 'Eye',
          cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
        },
        {
          id: 'ood-distance',
          title: { en: '15–20 cm Distance', ta: '15–20 செ.மீ இடைவெளி' },
          what: {
            en: 'Hold the camera 15 to 20 cm away from the leaf lamina.',
            ta: 'கேமராவை இலையிலிருந்து 15–20 செ.மீ தொலைவில் வைக்கவும்.',
          },
          why: {
            en: 'Ensures optimal resolution of foliar textures.',
            ta: 'இலை அமைப்பை துல்லியமாகப் படம்பிடிக்க உதவுகிறது.',
          },
          priority: { en: 'Best Practice', ta: 'சிறந்த முறை' },
          priorityLevel: 'routine',
          monitor: { en: 'Crisp focus across the leaf blade.', ta: 'இலை முழுவதும் தெளிவான ஃபோகஸ்.' },
          nextCheck: { en: 'Adjust camera before capture.', ta: 'படம் எடுக்கும் முன் சரிசெய்யவும்.' },
          icon: 'Sparkles',
          cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
        },
        {
          id: 'ood-background',
          title: { en: 'Clean Foliar Background', ta: 'பின்னணியை தவிர்க்கவும்' },
          what: {
            en: 'Minimize soil, hands, sky, or background clutter.',
            ta: 'மண், கை அல்லது பிற பொருட்கள் இல்லாமல் இலையை மட்டும் எடுக்கவும்.',
          },
          why: {
            en: 'Prevents non-crop visual noise from interfering with classification.',
            ta: 'பின்னணி இரைச்சல் மாதிரி கணிப்பை பாதிக்காமல் தடுக்கிறது.',
          },
          priority: { en: 'Clean Composition', ta: 'தெளிவான பின்னணி' },
          priorityLevel: 'routine',
          monitor: { en: 'Leaf fills at least 60% of the frame.', ta: 'இலை படத்தின் 60% பகுதியை நிரப்ப வேண்டும்.' },
          nextCheck: { en: 'Before uploading image.', ta: 'படத்தை பதிவேற்றும் முன்.' },
          icon: 'Info',
          cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
        },
      ],
      managementGuidance: {
        title: {
          en: 'Specimen Verification Required',
          ta: 'இலை சரிபார்ப்பு தேவை',
        },
        cultural: {
          en: 'The uploaded image could not be confirmed as a turmeric foliar specimen. No disease-specific treatment or chemical recommendations are provided for unverified photographs.',
          ta: 'பதிவேற்றப்பட்ட படம் மஞ்சள் இலை என உறுதிப்படுத்தப்படவில்லை. உறுதிப்படுத்தப்படாத படங்களுக்கு நோய் மேலாண்மை வழிகாட்டுதல் வழங்கப்படாது.',
        },
        extension: {
          en: 'For identification assistance, consult your local block agricultural extension officer or the TNAU advisory center.',
          ta: 'சந்தேகங்களுக்கு உள்ளூர் வட்டார வேளாண்மை அலுவலர் அல்லது TNAU ஆலோசனை மையத்தை அணுகவும்.',
        },
      },
      fieldConditionNotes: fieldNotes,
    };
  }

  // -------------------------------------------------------------------------
  // 2. STATE: NO LEAF SCAN ANALYZED
  // -------------------------------------------------------------------------
  if (state === 'NO_SCAN') {
    if (envTier === 'High') {
      return {
        profileKey: 'NO_SCAN_HIGH_RISK',
        diagnosisState: 'NO_SCAN',
        envRiskTier: 'High',
        situationLevel: 'Moderate',
        displayTitle: {
          en: 'No Leaf Scan Analyzed — Elevated Weather Risk',
          ta: 'இலை ஆய்வு செய்யப்படவில்லை — அதிக வானிலை அபாயம்',
        },
        diagnosisExplanation: {
          en: `No leaf scan analyzed yet. Recent meteorological records indicate elevated moisture (${exp?.hours_rh_ge_80pct ?? 'elevated'}h RH ≥80%, ${exp?.cumulative_rainfall_14d_mm ?? 'active'} mm rain). Active foliar surveillance and a leaf scan are strongly recommended.`,
          ta: `இலை ஆய்வு இன்னும் செய்யப்படவில்லை. சமீபத்திய வானிலை அளவீடுகள் அதிக ஈரப்பதத்தைக் காட்டுகின்றன (${exp?.hours_rh_ge_80pct ?? 'அதிக'} மணி நேரம் RH ≥80%). வயல் ஆய்வு செய்து இலைப்படத்தை ஸ்கேன் செய்ய பரிந்துரைக்கப்படுகிறது.`,
        },
        whyPoints: [
          {
            icon: '🌧️',
            title: { en: 'High Environmental Moisture', ta: 'அதிக சுற்றுச்சூழல் ஈரப்பதம்' },
            text: {
              en: `Microclimate analysis recorded ${exp?.hours_rh_ge_80pct ?? 'prolonged'} hours of RH ≥80%, creating favorable conditions for foliar pathogens.`,
              ta: `நுண் வானிலை பகுப்பாய்வில் ${exp?.hours_rh_ge_80pct ?? 'அதிக'} மணி நேரம் அதிக ஈரப்பதம் பதிவாகியுள்ளது, இது பூஞ்சை பரவலுக்கு சாதகமானது.`,
            },
          },
          {
            icon: '📷',
            title: { en: 'Diagnosis Pending Leaf Scan', ta: 'இலை ஸ்கேன் தேவை' },
            text: {
              en: 'No leaf image has been evaluated; foliar health status cannot be determined without a direct leaf scan.',
              ta: 'இலை ஆய்வு செய்யப்படாததால், நேரடி இலை ஸ்கேன் இல்லாமல் நோய் நிலையை உறுதிப்படுத்த இயலாது.',
            },
          },
          {
            icon: '🔍',
            title: { en: 'Preventive Action Scope', ta: 'தடுப்பு கண்காணிப்பு' },
            text: {
              en: 'Focus on field drainage inspection and leaf scouting to catch potential symptom onset early.',
              ta: 'வடிகால் வசதியை சோதித்து இலைகளை உற்று நோக்கி ஆரம்ப அறிகுறிகளை கண்டறியவும்.',
            },
          },
        ],
        primaryAction: {
          id: 'noscan-high-scout',
          title: { en: 'Field Walk & Scan Turmeric Leaves', ta: 'வயல் ஆய்வு & இலை ஸ்கேன்' },
          what: {
            en: 'Inspect lower canopy leaves for early spots or water-soaked lesions, then capture photos on "Check Leaf".',
            ta: 'கீழ் இலைகளில் புள்ளிகள் அல்லது கருகல் உள்ளதா என பார்த்து, "Check Leaf" பக்கத்தில் ஸ்கேன் செய்யவும்.',
          },
          why: {
            en: 'High atmospheric moisture creates conditions conducive to leaf spot and blotch development.',
            ta: 'அதிக ஈரப்பதம் இலைப்புள்ளி மற்றும் கருகல் நோய் உருவாக சாதகமான சூழலை உருவாக்குகிறது.',
          },
          priority: {
            en: 'Elevated Surveillance — Proactive inspection prevents undetected disease spread.',
            ta: 'முக்கிய கண்காணிப்பு — நோய் பரவலை ஆரம்பத்திலேயே கண்டறிய உதவுகிறது.',
          },
          priorityLevel: 'high',
          monitor: {
            en: 'Look for tiny yellowish flecks, necrotic margins, or aphid clusters on leaf undersides.',
            ta: 'இலையின் கீழ் மஞ்சள் புள்ளிகள், கருகல் ஓரங்கள் அல்லது அசுவினி பூச்சிகளை கவனிக்கவும்.',
          },
          nextCheck: {
            en: 'Capture and upload a leaf image on Check Leaf immediately.',
            ta: 'உடனடியாக Check Leaf பக்கத்தில் இலைப்படத்தை பதிவேற்றவும்.',
          },
          icon: 'Camera',
          cardBg: 'bg-[#fff5f5] border border-[#fddede]',
        },
        secondaryActions: [
          {
            id: 'noscan-high-drainage',
            title: { en: 'Clear Furrow Drainage', ta: 'வடிகால் வாய்க்கால்களை சுத்தம் செய்' },
            what: {
              en: 'Ensure all ridge and furrow channels allow free drainage without water stagnation.',
              ta: 'பாத்திகளில் தண்ணீர் தேங்காமல் வடிந்து செல்ல வடிகால் வழிகளை சீரமைக்கவும்.',
            },
            why: {
              en: 'Standing water elevates canopy humidity and increases rhizome disease vulnerability.',
              ta: 'நீர் தேங்குவது பயிர்க்கூட்ட ஈரப்பதத்தை அதிகரித்து நோய் அபாயத்தை உயர்த்துகிறது.',
            },
            priority: { en: 'High', ta: 'முக்கியம்' },
            priorityLevel: 'high',
            monitor: { en: 'Check furrow low spots after rain.', ta: 'மழைக்குப் பின் பள்ளங்களில் நீர் தேங்குவதை பார்க்கவும்.' },
            nextCheck: { en: 'Within 24 hours.', ta: '24 மணி நேரத்திற்குள்.' },
            icon: 'Droplets',
            cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
          },
          {
            id: 'noscan-high-airflow',
            title: { en: 'Check Canopy Airflow', ta: 'காற்றோட்டத்தை சரிபார்' },
            what: {
              en: 'Remove dense weed growth between mounds to lower microclimate humidity pockets.',
              ta: 'பாத்திகளுக்கு இடையே உள்ள களைகளை அகற்றி காற்று தடையின்றி செல்ல வழிவகுக்கவும்.',
            },
            why: {
              en: 'Stagnant damp air trapped in dense foliage promotes spore germination.',
              ta: 'அடர்ந்த இலைகளில் தேங்கும் ஈரமான காற்று பூஞ்சை வித்துக்கள் வளர காரணமாகிறது.',
            },
            priority: { en: 'Moderate', ta: 'மிதமானது' },
            priorityLevel: 'medium',
            monitor: { en: 'Air circulation at 30 cm above mound level.', ta: 'பாத்தி மட்டத்தில் காற்று சுழற்சியை கவனிக்கவும்.' },
            nextCheck: { en: 'During weekly field rounds.', ta: 'வாராந்திர கள ஆய்வின் போது.' },
            icon: 'Wind',
            cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
          },
          {
            id: 'noscan-high-timing',
            title: { en: 'Morning Irrigation Only', ta: 'காலை நேர பாசனம்' },
            what: {
              en: 'Avoid evening watering; irrigate in early morning to allow leaves to dry rapidly in daylight.',
              ta: 'மாலை பாசனத்தை தவிர்த்து, இலைகள் பகலில் உலர அதிகாலையில் பாசனம் செய்யவும்.',
            },
            why: {
              en: 'Reduces continuous hours of leaf surface wetness.',
              ta: 'இலை மேற்பரப்பு ஈரப்பத நேரத்தைக் குறைக்கிறது.',
            },
            priority: { en: 'Preventative', ta: 'தடுப்பு முறை' },
            priorityLevel: 'medium',
            monitor: { en: 'Foliage dryness before sunset.', ta: 'சூரிய அஸ்தமனத்திற்கு முன் இலைகள் உலர்ந்துள்ளதை உறுதி செய்யவும்.' },
            nextCheck: { en: 'Daily irrigation schedule.', ta: 'தினசரி பாசன அட்டவணை.' },
            icon: 'Droplets',
            cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
          },
        ],
        managementGuidance: {
          title: {
            en: 'Environmental Guidance Only — Scan Required for Diagnosis',
            ta: 'சுற்றுச்சூழல் வழிகாட்டல் — நோய் கண்டறிய இலை ஸ்கேன் தேவை',
          },
          cultural: {
            en: 'No leaf scan has been analyzed. Environmental humidity is elevated; maintain furrow drainage and conduct proactive field scouting. No specific chemical treatment is indicated without confirmed foliar symptoms.',
            ta: 'இலை ஆய்வு செய்யப்படவில்லை. சுற்றுச்சூழல் ஈரப்பதம் அதிகமாக உள்ளதால் வடிகால் பராமரிப்பு மற்றும் வயல் ஆய்வு அவசியம். இலை அறிகுறிகள் உறுதியாகும் வரை இரசாயன சிகிச்சைகள் தேவையில்லை.',
          },
          extension: {
            en: 'For regional weather advisories and pest surveillance forecasts, consult the TNAU Agricultural Advisory Center.',
            ta: 'மண்டல வானிலை ஆலோசனைகள் மற்றும் பூச்சி கண்காணிப்புக்கு TNAU வேளாண் ஆலோசனை மையத்தை அணுகவும்.',
          },
        },
        fieldConditionNotes: fieldNotes,
      };
    }

    // No Scan + Low / Moderate Environmental Risk
    return {
      profileKey: 'NO_SCAN_LOW_RISK',
      diagnosisState: 'NO_SCAN',
      envRiskTier: envTier,
      situationLevel: 'Low',
      displayTitle: {
        en: 'No Leaf Scan Analyzed — Baseline Conditions',
        ta: 'இலை ஆய்வு செய்யப்படவில்லை — இயல்பான நிலை',
      },
      diagnosisExplanation: {
        en: 'No leaf scan analyzed yet. Current microclimate parameters remain within baseline thresholds. Upload a turmeric leaf photo on "Check Leaf" to establish a crop health baseline.',
        ta: 'இலை ஆய்வு இன்னும் செய்யப்படவில்லை. தற்போதைய வானிலை பாதுகாப்பான வரம்பில் உள்ளது. பயிர் நிலையை உறுதிப்படுத்த "Check Leaf" பக்கத்தில் இலைப்படத்தை பதிவேற்றவும்.',
      },
      whyPoints: [
        {
          icon: '☀️',
          title: { en: 'Baseline Microclimate', ta: 'இயல்பான வானிலை' },
          text: {
            en: 'Current temperature and humidity parameters are within typical non-conducive ranges.',
            ta: 'தற்போதைய வெப்பநிலை மற்றும் ஈரப்பதம் இயல்பான வரம்பில் உள்ளன.',
          },
        },
        {
          icon: '📷',
          title: { en: 'Diagnostic Baseline Needed', ta: 'நோய் ஆய்வு தேவை' },
          text: {
            en: 'Scanning a leaf enables early detection before visible symptoms multiply across the field.',
            ta: 'இலை ஸ்கேன் செய்வது நோய் அறிகுறிகள் பரவும் முன் ஆரம்பத்திலேயே கண்டறிய உதவும்.',
          },
        },
        {
          icon: '🌱',
          title: { en: 'Routine Management', ta: 'வழக்கமான பராமரிப்பு' },
          text: {
            en: 'Continue standard agronomic practices, balanced nutrient application, and weekly scouting.',
            ta: 'வழக்கமான பயிர் பராமரிப்பு, சீரான உர நிர்வாகம் மற்றும் கள ஆய்வைத் தொடரவும்.',
          },
        },
      ],
      primaryAction: {
        id: 'noscan-low-upload',
        title: { en: 'Upload Leaf Image for Baseline', ta: 'இலைப்படத்தை பதிவேற்றவும்' },
        what: {
          en: 'Take a clear photograph of a representative turmeric leaf on "Check Leaf".',
          ta: '"Check Leaf" பக்கத்தில் ஒரு தெளிவான மஞ்சள் இலைப்படத்தை எடுக்கவும்.',
        },
        why: {
          en: 'Establishes a digital diagnostic baseline for tracking crop health over time.',
          ta: 'பயிர் ஆரோக்கியத்தை தொடர்ந்து கண்காணிக்க ஆரம்ப ஆவணமாக அமையும்.',
        },
        priority: {
          en: 'Routine — Recommended to confirm absence of early asymptomatic infections.',
          ta: 'வழக்கமானது — ஆரம்ப நோய் தொற்றுகள் இல்லை என்பதை உறுதிப்படுத்த பரிந்துரைக்கப்படுகிறது.',
        },
        priorityLevel: 'routine',
        monitor: {
          en: 'General crop vigor, leaf greenness, and uniform mound moisture.',
          ta: 'பயிரின் பொதுவான வளர்ச்சி, பசுமை மற்றும் பாத்தி ஈரப்பதத்தை கவனிக்கவும்.',
        },
        nextCheck: {
          en: 'During your next routine field walk.',
          ta: 'உங்கள் அடுத்த வயல் ஆய்வின் போது.',
        },
        icon: 'Camera',
        cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
      },
      secondaryActions: [
        {
          id: 'noscan-low-scout',
          title: { en: 'Weekly Field Scouting', ta: 'வாராந்திர கள ஆய்வு' },
          what: {
            en: 'Walk diagonal transects across the field to inspect 10–15 random plants.',
            ta: 'வயலில் குறுக்காக நடந்து 10–15 செடிகளை மாதிரி எடுத்து ஆய்வு செய்யவும்.',
          },
          why: {
            en: 'Early pest or pathogen patches are often localized in field corners.',
            ta: 'பூச்சி அல்லது நோய் தாக்குதல்கள் பெரும்பாலும் வயலின் மூலைகளில் ஆரம்பமாகும்.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Check both upper and lower leaf surfaces.', ta: 'இலையின் மேல் மற்றும் கீழ் பகுதிகளை பார்க்கவும்.' },
          nextCheck: { en: 'Every 7 days.', ta: '7 நாட்களுக்கு ஒருமுறை.' },
          icon: 'Eye',
          cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
        },
        {
          id: 'noscan-low-nutrition',
          title: { en: 'Balanced Nutrient Support', ta: 'சமச்சீர் ஊட்டச்சத்து' },
          what: {
            en: `Apply recommended organic manure and stage-appropriate NPK fertilizers (~${dap} DAP).`,
            ta: `பயிரின் வளர்ச்சி பருவத்திற்கு ஏற்ப (~${dap} DAP) பரிந்துரைக்கப்பட்ட உரங்களை இடவும்.`,
          },
          why: {
            en: 'Adequate potassium and micronutrients strengthen foliar cell walls against pathogen entry.',
            ta: 'சரியான சாம்பல் சத்து இலை செல்களை வலுப்படுத்தி நோய் எதிர்ப்பாற்றலை அதிகரிக்கும்.',
          },
          priority: { en: 'Agronomic', ta: 'வேளாண் பணி' },
          priorityLevel: 'routine',
          monitor: { en: 'Uniform dark green leaf color and stem thickness.', ta: 'சீரான அடர் பச்சை நிறம் மற்றும் தண்டு தடிமனை கவனிக்கவும்.' },
          nextCheck: { en: 'According to fertilization schedule.', ta: 'உர அட்டவணைப்படி.' },
          icon: 'Sprout',
          cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
        },
        {
          id: 'noscan-low-weeding',
          title: { en: 'Maintain Clean Mounds', ta: 'பாத்திகளை சுத்தமாக வைத்திருங்கள்' },
          what: {
            en: 'Keep ridge tops free from broadleaf weeds and grass competition.',
            ta: 'பாத்திகளில் களைகள் இல்லாமல் சுத்தமாக பராமரிக்கவும்.',
          },
          why: {
            en: 'Weeds harbor alternate insect vectors and impede inter-plant air movement.',
            ta: 'களைகள் பூச்சிகளுக்கு புகலிடமாக அமைந்து காற்றோட்டத்தை தடுக்கின்றன.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Weed density in furrows.', ta: 'பாத்திகளில் களைகளின் அடர்த்தியை கவனிக்கவும்.' },
          nextCheck: { en: 'During weeding rounds.', ta: 'களை எடுக்கும் போது.' },
          icon: 'Scissors',
          cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
        },
      ],
      managementGuidance: {
        title: {
          en: 'Standard Agronomic Care — No Disease Diagnosed',
          ta: 'வழக்கமான வேளாண் பராமரிப்பு — நோய் எதுவும் கண்டறியப்படவில்லை',
        },
        cultural: {
          en: 'No leaf scan analyzed. Microclimate conditions remain within standard thresholds. Continue routine agronomic maintenance and monitor leaves weekly.',
          ta: 'இலை ஆய்வு செய்யப்படவில்லை. வானிலை சீராக உள்ளது. வழக்கமான நன்செய் மேலாண்மையையும் வாராந்திர கண்காணிப்பையும் தொடரவும்.',
        },
        extension: {
          en: 'Follow TNAU crop production recommendations for optimal spacing, nutrient splits, and irrigation scheduling.',
          ta: 'முறையான பயிர் இடைவெளி மற்றும் உர நிர்வாகத்திற்கு TNAU பயிர் கையேட்டைப் பார்க்கவும்.',
        },
      },
      fieldConditionNotes: fieldNotes,
    };
  }

  // -------------------------------------------------------------------------
  // 3. STATE: HEALTHY FOLIAGE
  // -------------------------------------------------------------------------
  if (state === 'HEALTHY') {
    if (envTier === 'High') {
      return {
        profileKey: 'HEALTHY_HIGH_RISK',
        diagnosisState: 'HEALTHY',
        envRiskTier: 'High',
        situationLevel: 'Moderate',
        displayTitle: {
          en: 'Healthy Foliage — Elevated Environmental Moisture',
          ta: 'ஆரோக்கியமான இலை — அதிக சுற்றுச்சூழல் ஈரப்பதம்',
        },
        diagnosisExplanation: {
          en: `No foliar disease lesions were detected on the analyzed leaf (${conf}% confidence). However, elevated atmospheric moisture (${exp?.hours_rh_ge_80pct ?? 'prolonged'}h RH ≥80%) creates favourable microclimate conditions for potential pathogen development; preventive monitoring and furrow drainage maintenance are advised.`,
          ta: `ஆய்வு செய்யப்பட்ட இலையில் நோய் அறிகுறிகள் எதுவும் இல்லை (${conf}% நம்பிக்கை). ஆனால் சமீபத்திய வானிலை அதிக ஈரப்பதத்தைக் காட்டுவதால் (${exp?.hours_rh_ge_80pct ?? 'அதிக'} மணி நேரம் RH ≥80%) நோய் தோன்றுவதற்கு சாதகமான சூழல் உள்ளது; தடுப்பு கண்காணிப்பும் வடிகால் பராமரிப்பும் பரிந்துரைக்கப்படுகிறது.`,
        },
        whyPoints: [
          {
            icon: '🍃',
            title: { en: 'Clean Foliar Surface', ta: 'ஆரோக்கியமான இலை' },
            text: {
              en: `Deep learning analysis verified healthy tissue with ${conf}% confidence; no necrotic lesions or aphid colonies detected.`,
              ta: `நரம்பியல் மாதிரி ${conf}% நம்பிக்கையுடன் இலையில் நோய் அல்லது பூச்சி தாக்குதல் இல்லை என உறுதிப்படுத்தியுள்ளது.`,
            },
          },
          {
            icon: '🌧️',
            title: { en: 'Elevated Weather Exposure', ta: 'அதிக வானிலை ஈரப்பதம்' },
            text: {
              en: `14-day weather records show ${exp?.hours_rh_ge_80pct ?? 'extended'} hours of RH ≥80% and ${exp?.cumulative_rainfall_14d_mm ?? 'accumulated'} mm rain.`,
              ta: `14-நாள் வானிலை பதிவில் ${exp?.hours_rh_ge_80pct ?? 'அதிக'} மணி நேரம் RH ≥80% மற்றும் ${exp?.cumulative_rainfall_14d_mm ?? ''} மி.மீ மழை பதிவாகியுள்ளது.`,
            },
          },
          {
            icon: '🛡️',
            title: { en: 'Preventive Rationale', ta: 'தடுப்பு நடவடிக்கை' },
            text: {
              en: 'Although the crop is currently healthy, high humidity can trigger fungal spore germination on wet leaves.',
              ta: 'பயிர் ஆரோக்கியமாக இருந்தாலும், அதிக ஈரப்பதம் இலைகளில் பூஞ்சை வித்துக்கள் முளைக்க சாதகமாக அமையும்.',
            },
          },
        ],
        primaryAction: {
          id: 'healthy-high-preventive',
          title: { en: 'Preventive Scouting & Furrow Drainage', ta: 'தடுப்பு கண்காணிப்பு & வடிகால் பராமரிப்பு' },
          what: {
            en: 'Inspect middle and lower canopy leaves every 3–4 days and keep furrow outlets clear of standing water.',
            ta: '3–4 நாட்களுக்கு ஒருமுறை கீழ் இலைகளை சோதித்து, பாத்திகளில் தண்ணீர் தேங்காமல் பார்த்துக் கொள்ளவும்.',
          },
          why: {
            en: 'High microclimate humidity increases disease susceptibility even on currently healthy plants.',
            ta: 'அதிக ஈரப்பதம் ஆரோக்கியமான பயிர்களிலும் நோய் உருவாகும் வாய்ப்பை அதிகரிக்கிறது.',
          },
          priority: {
            en: 'Preventative — Early detection prevents sudden foliar outbreak during humid periods.',
            ta: 'தடுப்பு முறை — ஈரப்பத காலங்களில் திடீர் நோய் பரவலைத் தடுக்க உதவுகிறது.',
          },
          priorityLevel: 'medium',
          monitor: {
            en: 'Watch for small chlorotic flecks or water-soaked pinpoints on lower leaves.',
            ta: 'கீழ் இலைகளில் சிறிய மஞ்சள் புள்ளிகள் அல்லது நீர் ஊறிய புள்ளிகள் தோன்றுகிறதா என கவனிக்கவும்.',
          },
          nextCheck: {
            en: 'Re-scan in 3–5 days or immediately after continuous rain spells.',
            ta: '3–5 நாட்களில் அல்லது தொடர் மழையைத் தொடர்ந்து மீண்டும் ஸ்கேன் செய்யவும்.',
          },
          icon: 'ShieldCheck',
          cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
        },
        secondaryActions: [
          {
            id: 'healthy-high-drainage',
            title: { en: 'Drainage Channel Clearance', ta: 'வடிகால் வழிகளை சீரமை' },
            what: {
              en: 'Clear furrow drainage paths to avoid prolonged root zone saturation.',
              ta: 'வேர்ப்பகுதியில் நீர் தேங்காமல் இருக்க வடிகால் வாய்க்கால்களை சுத்தப்படுத்தவும்.',
            },
            why: {
              en: 'Waterlogged soil stresses turmeric root systems and elevates under-canopy humidity.',
              ta: 'மண் நீர் தேக்கம் வேர்களை பலவீனப்படுத்தி பயிர்க்கூட்ட ஈரப்பதத்தை உயர்த்தும்.',
            },
            priority: { en: 'High', ta: 'முக்கியம்' },
            priorityLevel: 'high',
            monitor: { en: 'Furrow water level after morning showers.', ta: 'மழைக்குப் பின் பாத்திகளில் உள்ள நீர் மட்டம்.' },
            nextCheck: { en: 'Within 24 hours.', ta: '24 மணி நேரத்திற்குள்.' },
            icon: 'Droplets',
            cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
          },
          {
            id: 'healthy-high-airflow',
            title: { en: 'Canopy Airflow Enhancement', ta: 'காற்றோட்டத்தை மேம்படுத்து' },
            what: {
              en: 'Maintain 30–45 cm inter-plant spacing and remove baseline weeds.',
              ta: 'செடிகளுக்கு இடையே 30–45 செ.மீ இடைவெளி மற்றும் களைகளை நீக்கி காற்றோட்டத்தை பராமரிக்கவும்.',
            },
            why: {
              en: 'Unobstructed breeze dries foliar surfaces rapidly after morning dew.',
              ta: 'நல்ல காற்றோட்டம் காலை பனி ஈரத்தை விரைவில் உலர வைக்கிறது.',
            },
            priority: { en: 'Moderate', ta: 'மிதமானது' },
            priorityLevel: 'medium',
            monitor: { en: 'Canopy density and foliage drying speed.', ta: 'இலைகள் உலரும் வேகத்தை கவனிக்கவும்.' },
            nextCheck: { en: 'During weekly weeding.', ta: 'வாராந்திர களை எடுப்பின் போது.' },
            icon: 'Wind',
            cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
          },
          {
            id: 'healthy-high-nutrition',
            title: { en: 'Balanced Potash Application', ta: 'சாம்பல் சத்து பராமரிப்பு' },
            what: {
              en: 'Ensure adequate potassium nutrition according to growth stage recommendations.',
              ta: 'பயிர் வளர்ச்சி நிலைக்கு ஏற்ப பரிந்துரைக்கப்பட்ட சாம்பல் சத்தை இடவும்.',
            },
            why: {
              en: 'Potassium strengthens epidermal cell thickness, improving natural resistance.',
              ta: 'சாம்பல் சத்து இலைத்தோலை தடிமனாக்கி இயற்கை எதிர்ப்புத்திறனை கூட்டுகிறது.',
            },
            priority: { en: 'Agronomic Support', ta: 'வேளாண் ஆதரவு' },
            priorityLevel: 'routine',
            monitor: { en: 'Sturdy upright leaf posture.', ta: 'நிமிர்ந்த திடமான இலை அமைப்பை கவனிக்கவும்.' },
            nextCheck: { en: 'At scheduled fertilizer split.', ta: 'அடுத்த உரமிடும் கட்டத்தில்.' },
            icon: 'Sprout',
            cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
          },
        ],
        managementGuidance: {
          title: {
            en: 'No Disease Treatment Indicated — Maintain Preventive Vigilance',
            ta: 'நோய் மேலாண்மை தேவையில்லை — தடுப்பு கண்காணிப்பைத் தொடரவும்',
          },
          cultural: {
            en: 'No foliar disease lesions detected on the analyzed leaf. Because atmospheric moisture is elevated, maintain good furrow drainage, avoid evening overhead irrigation, and monitor leaves weekly.',
            ta: 'ஆய்வு செய்யப்பட்ட இலையில் நோய் அறிகுறிகள் எதுவும் இல்லை. சுற்றுச்சூழல் ஈரப்பதம் அதிகமாக உள்ளதால், நீர் தேங்காமல் பார்த்துக் கொள்ளவும், மாலை நேர பாசனத்தைத் தவிர்க்கவும்.',
          },
          extension: {
            en: 'No chemical intervention is indicated from this scan. Refer to standard TNAU crop production guides for preventive agronomic measures.',
            ta: 'இந்த ஸ்கேனில் நோய் மருந்துகள் எதுவும் தேவைப்படவில்லை. வழிகாட்டுதல்களுக்கு TNAU பயிர் கையேட்டைப் பார்க்கவும்.',
          },
        },
        fieldConditionNotes: fieldNotes,
      };
    }

    // Healthy + Low / Moderate Risk
    return {
      profileKey: 'HEALTHY_LOW_RISK',
      diagnosisState: 'HEALTHY',
      envRiskTier: envTier,
      situationLevel: 'Low',
      displayTitle: {
        en: 'Healthy Foliage — Standard Management',
        ta: 'ஆரோக்கியமான இலை — இயல்பான பராமரிப்பு',
      },
      diagnosisExplanation: {
        en: `No clear disease symptoms were detected on the analyzed leaf (${conf}% confidence). Current environmental parameters support normal healthy crop growth. Continue standard agronomic practices and regular weekly monitoring.`,
        ta: `ஆய்வு செய்யப்பட்ட இலையில் நோய் அறிகுறிகள் எதுவும் இல்லை (${conf}% நம்பிக்கை). தற்போதைய வானிலை சீராகவும் பயிர் வளர்ச்சிக்கு உகந்ததாகவும் உள்ளது. வழக்கமான பயிர் பராமரிப்பை தொடரவும்.`,
      },
      whyPoints: [
        {
          icon: '🍃',
          title: { en: 'Healthy Leaf Lamina', ta: 'ஆரோக்கியமான இலை' },
          text: {
            en: `Visual inspection verified healthy tissue (${conf}% confidence) with zero disease lesions or pest infestations.`,
            ta: `காட்சி ஆய்வில் ${conf}% நம்பிக்கையுடன் இலையில் எந்த நோய் புள்ளிகளும் அல்லது பூச்சிகளும் இல்லை என்பது உறுதி செய்யப்பட்டது.`,
          },
        },
        {
          icon: '☀️',
          title: { en: 'Favourable Weather', ta: 'சீரான வானிலை' },
          text: {
            en: 'Microclimate parameters remain within standard non-conducive ranges, supporting balanced vegetative development.',
            ta: 'வானிலை அளவீடுகள் இயல்பான பாதுகாப்பு வரம்பில் இருந்து பயிர் வளர்ச்சிக்கு உதவுகின்றன.',
          },
        },
        {
          icon: '✅',
          title: { en: 'Routine Protocol', ta: 'வழக்கமான நெறிமுறை' },
          text: {
            en: 'Maintain regular agronomic schedule and perform routine weekly foliar inspections.',
            ta: 'வழக்கமான பயிர் பராமரிப்பு பணிகளைத் தொடர்ந்து வாராந்திர கள ஆய்வை மேற்கொள்ளவும்.',
          },
        },
      ],
      primaryAction: {
        id: 'healthy-low-routine',
        title: { en: 'Routine Foliar Scouting', ta: 'வழக்கமான கள ஆய்வு' },
        what: {
          en: 'Walk the field weekly, inspecting leaf undersides and new flushes for any early discoloration.',
          ta: 'வாரத்திற்கு ஒருமுறை வயலில் நடந்து இலைகளின் அடிப்பகுதி மற்றும் புதிய தளிர்களை ஆய்வு செய்யவும்.',
        },
        why: {
          en: 'Foliar tissue is currently healthy and environmental risk is low.',
          ta: 'இலை ஆரோக்கியமாகவும் சுற்றுச்சூழல் அபாயம் குறைவாகவும் உள்ளது.',
        },
        priority: {
          en: 'Routine — Standard agronomic monitoring maintains crop health.',
          ta: 'வழக்கமானது — பயிர் ஆரோக்கியத்தை பராமரிக்க போதுமானது.',
        },
        priorityLevel: 'routine',
        monitor: {
          en: 'Uniform green canopy color and vigorous shoot growth.',
          ta: 'சீரான பச்சை நிறம் மற்றும் செழிப்பான தளிர் வளர்ச்சியை கவனிக்கவும்.',
        },
        nextCheck: {
          en: 'Re-scan in 7–10 days or if any unusual foliar spots emerge.',
          ta: '7–10 நாட்களில் அல்லது ஏதேனும் புள்ளிகள் தோன்றினால் மீண்டும் ஸ்கேன் செய்யவும்.',
        },
        icon: 'Eye',
        cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
      },
      secondaryActions: [
        {
          id: 'healthy-low-drainage',
          title: { en: 'Maintain Field Drainage', ta: 'வடிகால் பராமரிப்பு' },
          what: {
            en: 'Keep furrow drainage channels clear to prevent water stagnation around developing rhizomes.',
            ta: 'மஞ்சள் கிழங்குகளில் நீர் தேங்கி அழுகல் ஏற்படாமல் இருக்க வடிகால் வாய்க்கால்களை சுத்தமாக வைக்கவும்.',
          },
          why: {
            en: 'Ensures optimal root aeration and rhizome development.',
            ta: 'வேர்களுக்கு நல்ல காற்றோட்டம் கிடைத்து கிழங்கு வளர்ச்சிக்கு உதவுகிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Free soil drainage along furrow beds.', ta: 'பாத்திகளில் சீரான நீர் வடிதலை கவனிக்கவும்.' },
          nextCheck: { en: 'During weekly field rounds.', ta: 'வாராந்திர ஆய்வின் போது.' },
          icon: 'Droplets',
          cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
        },
        {
          id: 'healthy-low-airflow',
          title: { en: 'Canopy Airflow Maintenance', ta: 'காற்றோட்டம் பராமரிப்பு' },
          what: {
            en: 'Maintain 30–45 cm plant spacing and manage weeds to ensure unobstructed canopy airflow.',
            ta: '30–45 செ.மீ பயிர் இடைவெளியை பராமரித்து களைகளை நீக்கி காற்றோட்டம் கிடைக்கச் செய்யவும்.',
          },
          why: {
            en: 'Good ventilation minimizes morning humidity build-up.',
            ta: 'நல்ல காற்றோட்டம் காலை நேர ஈரப்பதம் தேங்குவதைக் குறைக்கிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Air circulation between ridges.', ta: 'பாத்திகளுக்கு இடையே காற்று சுழற்சியை கவனிக்கவும்.' },
          nextCheck: { en: 'During weeding operations.', ta: 'களை எடுக்கும் போது.' },
          icon: 'Wind',
          cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
        },
        {
          id: 'healthy-low-nutrition',
          title: { en: 'Balanced Crop Nutrition', ta: 'சமச்சீர் ஊட்டச்சத்து' },
          what: {
            en: `Apply balanced organic compost and NPK nutrients suited to ~${dap} DAP growth stage.`,
            ta: `~${dap} DAP வளர்ச்சிப் பருவத்திற்கு ஏற்ப பரிந்துரைக்கப்பட்ட தழை, சாம்பல் சத்துக்களை இடவும்.`,
          },
          why: {
            en: 'Supports vigorous rhizome development and strengthens natural disease resistance.',
            ta: 'கிழங்கு வளர்ச்சியை தூண்டி இயற்கை நோய் எதிர்ப்பாற்றலை பலப்படுத்துகிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Vigorous leaf size and healthy petiole structure.', ta: 'இலை அளவு மற்றும் தண்டு அமைப்பை கவனிக்கவும்.' },
          nextCheck: { en: 'At next fertilizer schedule.', ta: 'அடுத்த உரமிடும் தேதியில்.' },
          icon: 'Sprout',
          cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
        },
      ],
      managementGuidance: {
        title: {
          en: 'No Disease Treatment Indicated',
          ta: 'நோய் மேலாண்மை தேவையில்லை',
        },
        cultural: {
          en: 'No foliar disease symptoms detected. Continue standard agronomic practices, balanced nutrition, and regular weekly monitoring.',
          ta: 'ஆய்வு செய்யப்பட்ட இலையில் நோய் அறிகுறிகள் எதுவும் இல்லை. வழக்கமான நன்செய் மேலாண்மையையும் உரப் பராமரிப்பையும் தொடரவும்.',
        },
        extension: {
          en: 'No chemical intervention is indicated from this scan. Follow standard TNAU crop production guides.',
          ta: 'இந்த ஸ்கேனில் நோய் மருந்துகள் எதுவும் தேவைப்படவில்லை. வழிகாட்டுதல்களுக்கு TNAU பயிர் கையேட்டைப் பார்க்கவும்.',
        },
      },
      fieldConditionNotes: fieldNotes,
    };
  }

  // -------------------------------------------------------------------------
  // 4. STATE: LEAF SPOT (Colletotrichum / Phyllosticta)
  // -------------------------------------------------------------------------
  if (state === 'LEAF_SPOT') {
    if (envTier === 'High' || envTier === 'Moderate') {
      return {
        profileKey: 'LEAF_SPOT_HIGH_RISK',
        diagnosisState: 'LEAF_SPOT',
        envRiskTier: envTier,
        situationLevel: 'High',
        displayTitle: {
          en: 'Leaf Spot Disease — Elevated Humidity Exposure',
          ta: 'இலைப்புள்ளி நோய் — அதிக ஈரப்பத சூழல்',
        },
        diagnosisExplanation: {
          en: `The uploaded leaf was classified as Leaf Spot with ${conf}% confidence. Recent environmental conditions (${exp?.hours_rh_ge_80pct ?? 'elevated'}h RH ≥80%, ${exp?.cumulative_rainfall_14d_mm ?? ''} mm rain) strongly favour pathogen sporulation and splash dispersal; prioritized field inspection, leaf wetness reduction, and sanitation are urgently recommended.`,
          ta: `ஆய்வு செய்யப்பட்ட இலையில் இலைப்புள்ளி அறிகுறிகள் (${conf}% நம்பிக்கை) கண்டறியப்பட்டுள்ளன. சமீபத்திய வானிலை சூழல் (${exp?.hours_rh_ge_80pct ?? 'அதிக'} மணி நேரம் RH ≥80%) இந்நோய் மேலும் பரவ சாதகமாக உள்ளதால், தீவிர வயல் ஆய்வு மற்றும் பாதிக்கப்பட்ட இலைகளை அகற்றுவது அவசியமாகும்.`,
        },
        whyPoints: [
          {
            icon: '🔍',
            title: { en: 'Foliar Leaf Spot Detection', ta: 'இலைப்புள்ளி கண்டறிதல்' },
            text: {
              en: `Ensemble models classified characteristic circular/elliptical lesions with ${conf}% confidence.`,
              ta: `நரம்பியல் மாதிரி ${conf}% நம்பிக்கையுடன் வட்ட வடிவ இலைப்புள்ளி அறிகுறிகளை கண்டறிந்துள்ளது.`,
            },
          },
          {
            icon: '🌧️',
            title: { en: 'High Atmospheric Moisture', ta: 'அதிக ஈரப்பத சூழல்' },
            text: {
              en: `Recent 14-day records show ${exp?.hours_rh_ge_80pct ?? 'prolonged'} hours of RH ≥80%, which accelerates fungal conidial germination and rain-splash spread.`,
              ta: `14-நாள் பதிவில் ${exp?.hours_rh_ge_80pct ?? 'அதிக'} மணி நேரம் RH ≥80% பதிவாகியுள்ளது, இது பூஞ்சை வித்துக்கள் பரவ சாதகமானது.`,
            },
          },
          {
            icon: '⚠️',
            title: { en: 'Urgent Management Need', ta: 'அவசர மேலாண்மை தேவை' },
            text: {
              en: 'Humid conditions can cause individual spots to coalesce rapidly into extensive leaf blights.',
              ta: 'ஈரப்பதமான சூழலில் தனித்தனி புள்ளிகள் வேகமாக ஒன்றிணைந்து பெரிய கருகல் திட்டுகளாக மாறக்கூடும்.',
            },
          },
        ],
        primaryAction: {
          id: 'leafspot-high-sanitation',
          title: { en: 'Sanitize Infected Leaves & Clear Drainage', ta: 'பாதிக்கப்பட்ட இலைகளை அகற்று & வடிகால் சீரமை' },
          what: {
            en: 'Carefully prune and remove severely spotted lower leaves; dispose of debris away from the field and clear all drainage channels.',
            ta: 'அதிகமாக பாதிக்கப்பட்ட கீழ் இலைகளை வெட்டி வயலுக்கு வெளியே அழித்து, வடிகால் வாய்க்கால்களை சுத்தம் செய்யவும்.',
          },
          why: {
            en: 'Infected lower leaves act as primary inoculum reservoirs for rain-splash dissemination under high humidity.',
            ta: 'பாதிக்கப்பட்ட இலைகள் மழைத்துளி மூலம் அருகில் உள்ள ஆரோக்கியமான இலைகளுக்கு நோயைப் பரப்புகின்றன.',
          },
          priority: {
            en: 'High / Immediate — Reduces fungal spore load before spots expand across the canopy.',
            ta: 'அவசரம் / மிக முக்கியம் — பூஞ்சை வித்துக்களின் அளவைக் குறைத்து பரவலைத் தடுக்கிறது.',
          },
          priorityLevel: 'urgent',
          monitor: {
            en: 'Check if circular spots on adjacent plants show active yellow halos or necrotic centers.',
            ta: 'அருகிலுள்ள செடிகளில் வட்ட வடிவ புள்ளிகளைச் சுற்றி மஞ்சள் வளையம் தோன்றுகிறதா என பார்க்கவும்.',
          },
          nextCheck: {
            en: 'Re-scan within 48–72 hours after sanitation to check containment.',
            ta: 'இலைகளை அகற்றிய 48–72 மணி நேரத்திற்குள் மீண்டும் ஸ்கேன் செய்து கண்காணிக்கவும்.',
          },
          icon: 'Scissors',
          cardBg: 'bg-[#fff5f5] border border-[#fddede]',
        },
        secondaryActions: [
          {
            id: 'leafspot-high-adjacent',
            title: { en: 'Inspect Adjacent Rows', ta: 'அருகிலுள்ள பாத்திகளை ஆய்வு செய்' },
            what: {
              en: 'Survey 20 plants in surrounding rows to map localized disease boundaries.',
              ta: 'அருகிலுள்ள பாத்திகளில் 20 செடிகளை ஆய்வு செய்து நோய் பரவல் எல்லையைக் கண்டறியவும்.',
            },
            why: {
              en: 'Leaf spot often spreads along downwind and lower-elevation rows.',
              ta: 'இலைப்புள்ளி பெரும்பாலும் காற்று வீசும் திசையிலும் தாழ்வான பாத்திகளிலும் அதிகம் பரவும்.',
            },
            priority: { en: 'High', ta: 'முக்கியம்' },
            priorityLevel: 'high',
            monitor: { en: 'Early pinpoint spots on middle canopy leaves.', ta: 'நடு இலைகளில் தோன்றும் ஆரம்ப சிறு புள்ளிகள்.' },
            nextCheck: { en: 'Within 2 days.', ta: '2 நாட்களுக்குள்.' },
            icon: 'Eye',
            cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
          },
          {
            id: 'leafspot-high-wetness',
            title: { en: 'Reduce Leaf Wetness Duration', ta: 'இலை ஈரப்பத நேரத்தைக் குறை' },
            what: {
              en: 'Strictly avoid evening irrigation; ensure furrows drain rapidly after rain.',
              ta: 'மாலை நேர பாசனத்தை தவிர்த்து, மழைநீரை உடனே வடித்துவிடவும்.',
            },
            why: {
              en: 'Spores require >6 continuous hours of leaf surface water to penetrate stomata.',
              ta: 'பூஞ்சை வித்துக்கள் இலைக்குள் ஊடுருவ 6 மணி நேரத்திற்கு மேல் ஈரப்பதம் தேவைப்படுகிறது.',
            },
            priority: { en: 'High', ta: 'முக்கியம்' },
            priorityLevel: 'high',
            monitor: { en: 'Canopy dryness by mid-morning.', ta: 'காலை 10 மணிக்குள் இலைகள் காய்ந்துவிடுவதை உறுதி செய்யவும்.' },
            nextCheck: { en: 'Daily inspection.', ta: 'தினசரி ஆய்வு.' },
            icon: 'Droplets',
            cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
          },
          {
            id: 'leafspot-high-ventilation',
            title: { en: 'Enhance Canopy Ventilation', ta: 'காற்றோட்டத்தை அதிகப்படுத்து' },
            what: {
              en: 'Clear inter-row weeds and thin overlapping lower foliage to promote rapid air circulation.',
              ta: 'பாத்திகளுக்கு இடையே உள்ள களைகளை அகற்றி தடையற்ற காற்றோட்டத்தை ஏற்படுத்தவும்.',
            },
            why: {
              en: 'Lowers relative humidity within the microclimate canopy zone.',
              ta: 'பயிர்க்கூட்டத்திற்குள் நிலவும் அதிக ஈரப்பதத்தை குறைக்கிறது.',
            },
            priority: { en: 'Moderate', ta: 'மிதமானது' },
            priorityLevel: 'medium',
            monitor: { en: 'Air movement at 20–40 cm height.', ta: 'பாத்தி மட்டத்தில் காற்று சுழற்சியை கவனிக்கவும்.' },
            nextCheck: { en: 'Within 3 days.', ta: '3 நாட்களுக்குள்.' },
            icon: 'Wind',
            cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
          },
        ],
        managementGuidance: {
          title: {
            en: 'Leaf Spot Disease Management Guidance',
            ta: 'இலைப்புள்ளி நோய் மேலாண்மை வழிகாட்டல்',
          },
          cultural: {
            en: 'Remove and safely dispose of severely spotted leaves away from the field. Maintain free furrow drainage, avoid overhead watering during humid periods, and clear row weeds to maximize canopy aeration.',
            ta: 'பாதிக்கப்பட்ட இலைகளைப் பாதுகாப்பாக அகற்றி அழிக்கவும். பாத்திகளில் தண்ணீர் தேங்காமல் வடித்துவிடவும். மாலை நேர தெளிப்புப் பாசனத்தைத் தவிர்க்கவும்.',
          },
          extension: {
            en: 'For approved fungicidal protection schedules in case of widespread lesion progression, consult your local agricultural extension officer and follow current TNAU/ICAR-IISR product label directions.',
            ta: 'நோய் தீவிரமாக பரவினால் இரசாயன பூஞ்சாண மேலாண்மைக்கு, தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) / ICAR-IISR / உள்ளூர் வேளாண்மை அலுவலர் வழிகாட்டுதல்களைப் பின்பற்றவும்.',
          },
        },
        fieldConditionNotes: fieldNotes,
      };
    }

    // Leaf Spot + Low Environmental Risk
    return {
      profileKey: 'LEAF_SPOT_LOW_RISK',
      diagnosisState: 'LEAF_SPOT',
      envRiskTier: 'Low',
      situationLevel: 'Moderate',
      displayTitle: {
        en: 'Leaf Spot Disease — Low Environmental Pressure',
        ta: 'இலைப்புள்ளி நோய் — குறைவான வானிலை அபாயம்',
      },
      diagnosisExplanation: {
        en: `The uploaded leaf was classified as Leaf Spot with ${conf}% confidence. While current weather conditions are less favourable for rapid fungal spread, monitoring affected plants and inspecting adjacent rows is advised to prevent localized progression.`,
        ta: `ஆய்வு செய்யப்பட்ட இலையில் இலைப்புள்ளி அறிகுறிகள் (${conf}% நம்பிக்கை) கண்டறியப்பட்டுள்ளன. தற்போதைய வானிலை சாதகமற்று இருந்தாலும், பாதிக்கப்பட்ட பயிர் பகுதிகளை கண்காணித்து பரவாமல் தடுப்பது அவசியம்.`,
      },
      whyPoints: [
        {
          icon: '🔍',
          title: { en: 'Localized Lesion Detection', ta: 'இலைப்புள்ளி அடையாளம்' },
          text: {
            en: `Visual foliar analysis detected leaf spot symptoms with ${conf}% confidence.`,
            ta: `காட்சி பகுப்பாய்வில் ${conf}% நம்பிக்கையுடன் இலைப்புள்ளி அறிகுறிகள் கண்டறியப்பட்டன.`,
          },
        },
        {
          icon: '☀️',
          title: { en: 'Low Microclimate Risk', ta: 'குறைந்த வானிலை அபாயம்' },
          text: {
            en: 'Current dry/moderate weather slows pathogen sporulation, providing an opportunity for cultural control.',
            ta: 'தற்போதைய மிதமான வானிலை பூஞ்சை பெருக்கத்தை கட்டுப்படுத்துகிறது.',
          },
        },
        {
          icon: '🛡️',
          title: { en: 'Containment Goal', ta: 'கட்டுப்படுத்தும் நோக்கம்' },
          text: {
            en: 'Prune affected leaves early before future rainfall triggers spore dissemination.',
            ta: 'அடுத்த மழைக்கு முன் பாதிக்கப்பட்ட இலைகளை அகற்றி பரவலை முன்கூட்டியே தடுக்கவும்.',
          },
        },
      ],
      primaryAction: {
        id: 'leafspot-low-inspect',
        title: { en: 'Inspect Nearby Plants & Prune Spotted Leaves', ta: 'அருகிலுள்ள செடிகளை ஆய்வு செய்து இலைகளை அகற்று' },
        what: {
          en: 'Check neighboring rows to confirm if leaf spot is isolated, and prune heavily spotted leaves.',
          ta: 'அருகிலுள்ள பாத்திகளை ஆய்வு செய்து இலைப்புள்ளி தனித்து உள்ளதா என சோதித்து, காய்ந்த இலைகளை அகற்றவும்.',
        },
        why: {
          en: 'Low ambient humidity prevents rapid spread, making manual sanitation highly effective.',
          ta: 'குறைந்த ஈரப்பதம் உள்ள சூழலில் பாதிக்கப்பட்ட இலைகளை அகற்றுவது மிகச் சிறந்த பலன் தரும்.',
        },
        priority: {
          en: 'Moderate — Isolate affected plants before weather shifts to humid conditions.',
          ta: 'மிதமானது — வானிலை மாறுவதற்குள் நோயை கட்டுப்படுத்த உதவுகிறது.',
        },
        priorityLevel: 'medium',
        monitor: {
          en: 'Watch for lesion enlargement or spread to adjacent rows.',
          ta: 'புள்ளிகள் பெரிதாகிறதா அல்லது அருகில் பரவுகிறதா என பார்க்கவும்.',
        },
        nextCheck: {
          en: 'Re-scan affected plants in 5–7 days to track stability.',
          ta: '5–7 நாட்களில் மீண்டும் ஸ்கேன் செய்து கண்காணிக்கவும்.',
        },
        icon: 'Eye',
        cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
      },
      secondaryActions: [
        {
          id: 'leafspot-low-sanitation',
          title: { en: 'Sanitize Tools & Debris', ta: 'கருவிகளை சுத்தம் செய்' },
          what: {
            en: 'Burn or compost removed spotted leaves away from turmeric plots; clean pruning tools.',
            ta: 'அகற்றிய இலைகளை வயலுக்கு வெளியே அப்புறப்படுத்தி, வெட்டும் கருவிகளை சுத்தம் செய்யவும்.',
          },
          why: {
            en: 'Eliminates dry fungal spores that can persist on dead tissue.',
            ta: 'காய்ந்த இலைகளில் தங்கும் பூஞ்சை வித்துக்களை அழிக்கிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Clean furrow base.', ta: 'பாத்திகளில் இலைக்கழிவுகள் இல்லாததை உறுதி செய்யவும்.' },
          nextCheck: { en: 'After each pruning pass.', ta: 'இலைகளை வெட்டிய பின்.' },
          icon: 'Scissors',
          cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
        },
        {
          id: 'leafspot-low-irrigation',
          title: { en: 'Morning Furrow Irrigation', ta: 'காலை பாசனம்' },
          what: {
            en: 'Apply irrigation water directly into furrows during early morning hours.',
            ta: 'அதிகாலையில் பாத்திகளில் நேரடியாக நீர் பாய்ச்சவும்.',
          },
          why: {
            en: 'Prevents wetting upper leaf foliage.',
            ta: 'மேல் இலைகள் நனையாமல் பாதுகாக்கிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Even furrow water absorption.', ta: 'சீரான நீர் உறிஞ்சுதலை கவனிக்கவும்.' },
          nextCheck: { en: 'At every irrigation cycle.', ta: 'ஒவ்வொரு பாசனத்தின் போதும்.' },
          icon: 'Droplets',
          cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
        },
        {
          id: 'leafspot-low-spacing',
          title: { en: 'Maintain Row Spacing', ta: 'பயிர் இடைவெளி' },
          what: {
            en: 'Keep 30–45 cm spacing unobstructed to facilitate air circulation.',
            ta: '30–45 செ.மீ இடைவெளியில் காற்று தடையின்றி செல்ல வழிவகுக்கவும்.',
          },
          why: {
            en: 'Low humidity canopy prevents microclimate fungal pockets.',
            ta: 'குறைந்த ஈரப்பதம் பூஞ்சை பெருக்கத்தை தடுக்கிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Free airflow between mounds.', ta: 'பாத்திகளுக்கு இடையே காற்றோட்டத்தை கவனிக்கவும்.' },
          nextCheck: { en: 'During weeding.', ta: 'களை எடுக்கும் போது.' },
          icon: 'Wind',
          cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
        },
      ],
      managementGuidance: {
        title: {
          en: 'Leaf Spot Disease Management Guidance',
          ta: 'இலைப்புள்ளி நோய் மேலாண்மை வழிகாட்டல்',
        },
        cultural: {
          en: 'Remove severely spotted leaves, maintain proper furrow drainage, avoid overhead irrigation, and monitor affected plants weekly.',
          ta: 'பாதிக்கப்பட்ட இலைகளைப் பாதுகாப்பாக அகற்றி அழிக்கவும். பாத்திகளில் தண்ணீர் தேங்காமல் வடித்துவிடவும். மாலை நேர பாசனத்தைத் தவிர்க்கவும்.',
        },
        extension: {
          en: 'Follow TNAU/ICAR-IISR recommendations; chemical fungicides are typically reserved for widespread progressive infestations.',
          ta: 'TNAU/ICAR-IISR வழிகாட்டுதல்களைப் பின்பற்றவும்; தீவிர பரவலுக்கு மட்டுமே இரசாயன மருந்துகள் பரிந்துரைக்கப்படும்.',
        },
      },
      fieldConditionNotes: fieldNotes,
    };
  }

  // -------------------------------------------------------------------------
  // 5. STATE: LEAF BLOTCH (Taphrina maculans)
  // -------------------------------------------------------------------------
  if (state === 'BLOTCH') {
    if (envTier === 'High' || envTier === 'Moderate') {
      return {
        profileKey: 'BLOTCH_HIGH_RISK',
        diagnosisState: 'BLOTCH',
        envRiskTier: envTier,
        situationLevel: 'High',
        displayTitle: {
          en: 'Leaf Blotch Disease — Elevated Humidity Exposure',
          ta: 'இலைக்கருகல் நோய் — அதிக ஈரப்பத சூழல்',
        },
        diagnosisExplanation: {
          en: `The uploaded leaf was classified as Leaf Blotch with ${conf}% confidence. Recent atmospheric moisture (${exp?.hours_rh_ge_80pct ?? 'elevated'}h RH ≥80%, ${exp?.cumulative_rainfall_14d_mm ?? ''} mm rain) is highly favourable for Taphrina maculans sporulation; prioritized scouting, sanitation of infected leaves, and drainage maintenance are urgently recommended.`,
          ta: `ஆய்வு செய்யப்பட்ட இலையில் இலைக்கருகல் அறிகுறிகள் (${conf}% நம்பிக்கை) கண்டறியப்பட்டுள்ளன. சமீபத்திய மழை மற்றும் காற்றில் உள்ள அதிக ஈரப்பதம் இந்நோய் பரவுவதற்கு மிகவும் சாதகமாக உள்ளதால், பாதிக்கப்பட்ட இலைகளை அகற்றி வடிகால் வழிகளை சீரமைப்பது மிக அவசியமாகும்.`,
        },
        whyPoints: [
          {
            icon: '🔍',
            title: { en: 'Leaf Blotch Foliar Identification', ta: 'இலைக்கருகல் கண்டறிதல்' },
            text: {
              en: `Ensemble models confirmed reddish-brown/yellow margin blotches with ${conf}% confidence.`,
              ta: `நரம்பியல் மாதிரி ${conf}% நம்பிக்கையுடன் மஞ்சள்-பழுப்பு இலைக்கருகல் அறிகுறிகளை உறுதிப்படுத்தியுள்ளது.`,
            },
          },
          {
            icon: '🌧️',
            title: { en: 'Atmospheric Moisture Conduciveness', ta: 'ஈரப்பதமான சூழல்' },
            text: {
              en: `Recorded ${exp?.hours_rh_ge_80pct ?? 'prolonged'} hours of RH ≥80%, facilitating Taphrina ascospore discharge and canopy spread.`,
              ta: `${exp?.hours_rh_ge_80pct ?? 'அதிக'} மணி நேரம் RH ≥80% பதிவாகியுள்ளது, இது பூஞ்சை வித்துக்கள் காற்றில் பரவ உதவுகிறது.`,
            },
          },
          {
            icon: '⚠️',
            title: { en: 'Canopy Blight Risk', ta: 'இலைக்கருகல் தீவிர அபாயம்' },
            text: {
              en: 'Unchecked blotch under high moisture causes premature foliar drying and reduced rhizome bulking.',
              ta: 'ஈரப்பதத்தில் கருகல் நோய் தீவிரமடைந்து இலைகளை முன்கூட்டியே உலர்த்தி கிழங்கு எடையை குறைக்கும்.',
            },
          },
        ],
        primaryAction: {
          id: 'blotch-high-sanitation',
          title: { en: 'Excise Heavily Blotched Leaves & Clear Channels', ta: 'கருகிய இலைகளை அகற்று & வாய்க்கால்களை சுத்தம் செய்' },
          what: {
            en: 'Carefully remove leaves showing coalesced necrotic blotches and burn/dispose of them outside the field.',
            ta: 'அதிக கருகல் கண்ட இலைகளை வெட்டி அகற்றி வயலுக்கு வெளியே அழித்து, வடிகால் வாய்க்கால்களை சீரமைக்கவும்.',
          },
          why: {
            en: 'Excising blotched leaves removes active spore colonies before wind and rain spread them to upper leaves.',
            ta: 'கருகிய இலைகளை அகற்றுவது மேல் இலைகளுக்கு வித்துக்கள் பரவுவதை உடனடியாகத் தடுக்கிறது.',
          },
          priority: {
            en: 'High / Immediate — Halts Taphrina disease cycle under humid conditions.',
            ta: 'அவசரம் / மிக முக்கியம் — ஈரப்பத காலங்களில் நோய் சுழற்சியை உடைக்கிறது.',
          },
          priorityLevel: 'urgent',
          monitor: {
            en: 'Check if margin blotches spread upward to the 3rd and 4th upper leaves.',
            ta: 'இலை ஓரங்களில் உள்ள கருகல் மேல் இலைகளுக்கு பரவுகிறதா என பார்க்கவும்.',
          },
          nextCheck: {
            en: 'Re-scan within 48–72 hours after leaf removal.',
            ta: 'இலைகளை அகற்றிய 48–72 மணி நேரத்திற்குள் மீண்டும் ஸ்கேன் செய்யவும்.',
          },
          icon: 'Scissors',
          cardBg: 'bg-[#fff5f5] border border-[#fddede]',
        },
        secondaryActions: [
          {
            id: 'blotch-high-scout',
            title: { en: 'Prioritized Lower Canopy Scouting', ta: 'கீழ் இலை தீவிர ஆய்வு' },
            what: {
              en: 'Check 15–20 plants across the most shaded, humid sections of the field.',
              ta: 'வயலின் அதிக நிழலான மற்றும் ஈரப்பதம் மிகுந்த பகுதிகளில் 15–20 செடிகளை ஆய்வு செய்யவும்.',
            },
            why: {
              en: 'Taphrina infections initiate on lower leaves where microclimate humidity persists.',
              ta: 'இலைக்கருகல் பூஞ்சை எப்போதும் ஈரப்பதம் நீடிக்கும் கீழ் இலைகளில் இருந்தே துவங்குகிறது.',
            },
            priority: { en: 'High', ta: 'முக்கியம்' },
            priorityLevel: 'high',
            monitor: { en: 'Yellow halo margins surrounding brown blotches.', ta: 'பழுப்பு கருகலை சுற்றியுள்ள மஞ்சள் வளையங்கள்.' },
            nextCheck: { en: 'Within 2 days.', ta: '2 நாட்களுக்குள்.' },
            icon: 'Eye',
            cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
          },
          {
            id: 'blotch-high-spacing',
            title: { en: 'Improve Inter-Plant Spacing', ta: 'பயிர் இடைவெளியை பராமரி' },
            what: {
              en: 'Clear weeds between mounds and trim dense overlapping foliage to boost air velocity.',
              ta: 'பாத்திகளுக்கு இடையே உள்ள களைகளை நீக்கி காற்றோட்டத்தை அதிகரிக்கவும்.',
            },
            why: {
              en: 'Rapid airflow reduces the duration of relative humidity >80% inside the canopy.',
              ta: 'விரைவான காற்றோட்டம் பயிர்க்கூட்டத்திற்குள் நிலவும் ஈரப்பதத்தை குறைக்கிறது.',
            },
            priority: { en: 'High', ta: 'முக்கியம்' },
            priorityLevel: 'high',
            monitor: { en: 'Canopy dryness after early morning fog.', ta: 'காலை பனிக்குப் பின் இலைகள் உலரும் வேகம்.' },
            nextCheck: { en: 'During weekly operations.', ta: 'வாராந்திர பணியின் போது.' },
            icon: 'Wind',
            cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
          },
          {
            id: 'blotch-high-drainage',
            title: { en: 'Ensure Rapid Furrow Drainage', ta: 'விரைவான வடிகால் வசதி' },
            what: {
              en: 'Ensure furrows have continuous slope to drain standing water within 2 hours of rainfall.',
              ta: 'மழை பெய்த 2 மணி நேரத்திற்குள் நீர் வடிந்து செல்ல வடிகால் வழிகளை சரிசெய்யவும்.',
            },
            why: {
              en: 'Standing water raises vapor pressure and leaf surface condensation.',
              ta: 'தேங்கி நிற்கும் நீர் காற்றில் ஈரப்பதத்தை அதிகரித்து இலைகளில் நீர் படிய வைக்கிறது.',
            },
            priority: { en: 'High', ta: 'முக்கியம்' },
            priorityLevel: 'high',
            monitor: { en: 'Furrow pooling after rainfall.', ta: 'மழைக்கு பின் பாத்திகளில் நீர் தேங்குவதை பார்க்கவும்.' },
            nextCheck: { en: 'After each heavy rain.', ta: 'ஒவ்வொரு கனமழைக்கு பின்பும்.' },
            icon: 'Droplets',
            cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
          },
        ],
        managementGuidance: {
          title: {
            en: 'Leaf Blotch Disease Management Guidance',
            ta: 'இலைக்கருகல் நோய் மேலாண்மை வழிகாட்டல்',
          },
          cultural: {
            en: 'Improve canopy spacing to reduce microclimate humidity. Remove infected crop residues, excise heavily blotched lower leaves, and irrigate in early mornings to minimize leaf wetness duration.',
            ta: 'செடிகளுக்கு இடையே காற்றோட்டத்தை அதிகரிக்கவும். அறுவடைக்குப் பின் பயிர்க் கழிவுகளை அகற்றவும். அதிகாலை பாசனம் செய்து இலை ஈரப்பத நேரத்தைக் குறைக்கவும்.',
          },
          extension: {
            en: 'For chemical fungicide recommendations against severe Taphrina outbreaks, consult your local agricultural extension officer and follow current TNAU/ICAR-IISR label instructions.',
            ta: 'இரசாயன பூஞ்சாண மேலாண்மைக்கு, தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) / ICAR-IISR / உள்ளூர் வேளாண்மை அலுவலர் வழிகாட்டுதல்கள் மற்றும் தயாரிப்பு லேபிள் வழிமுறைகளைப் பின்பற்றவும்.',
          },
        },
        fieldConditionNotes: fieldNotes,
      };
    }

    // Blotch + Low Environmental Risk
    return {
      profileKey: 'BLOTCH_LOW_RISK',
      diagnosisState: 'BLOTCH',
      envRiskTier: 'Low',
      situationLevel: 'Moderate',
      displayTitle: {
        en: 'Leaf Blotch Disease — Low Environmental Pressure',
        ta: 'இலைக்கருகல் நோய் — குறைவான வானிலை அபாயம்',
      },
      diagnosisExplanation: {
        en: `The uploaded leaf was classified as Leaf Blotch with ${conf}% confidence. Microclimate risk is currently low; routine field inspection, canopy ventilation maintenance, and surrounding plant scouting are recommended to prevent disease build-up.`,
        ta: `ஆய்வு செய்யப்பட்ட இலையில் இலைக்கருகல் அறிகுறிகள் (${conf}% நம்பிக்கை) கண்டறியப்பட்டுள்ளன. சமீபத்திய வானிலை மிதமாக உள்ளதால், வழக்கமான கள ஆய்வு மற்றும் காற்றோட்ட பராமரிப்பு மூலம் இந்நோயை கட்டுப்படுத்தலாம்.`,
      },
      whyPoints: [
        {
          icon: '🔍',
          title: { en: 'Foliar Blotch Identified', ta: 'இலைக்கருகல் அடையாளம்' },
          text: {
            en: `Visual symptoms matched Leaf Blotch characteristics with ${conf}% confidence.`,
            ta: `காட்சி அறிகுறிகள் ${conf}% நம்பிக்கையுடன் இலைக்கருகல் என வகைப்படுத்தப்பட்டன.`,
          },
        },
        {
          icon: '☀️',
          title: { en: 'Favourable Dry Weather', ta: 'வறண்ட வானிலை சாதகம்' },
          text: {
            en: 'Low atmospheric moisture limits rapid fungal spore dissemination across rows.',
            ta: 'குறைந்த ஈரப்பதம் காற்றில் பூஞ்சை வித்துக்கள் பரவுவதை தடுக்கிறது.',
          },
        },
        {
          icon: '🌿',
          title: { en: 'Surveillance Focus', ta: 'கண்காணிப்பு நோக்கம்' },
          text: {
            en: 'Track blotch progression to ensure lesions remain localized.',
            ta: 'கருகல் அறிகுறிகள் பரவாமல் ஒரே இடத்தில் உள்ளதா என கண்காணிக்கவும்.',
          },
        },
      ],
      primaryAction: {
        id: 'blotch-low-monitor',
        title: { en: 'Inspect Surrounding Plants & Track Margin Blotches', ta: 'அருகிலுள்ள செடிகளை ஆய்வு செய்து கருகலை கவனி' },
        what: {
          en: 'Monitor yellow-brown margin blotches on middle and lower canopy leaves across adjacent plants.',
          ta: 'அருகிலுள்ள செடிகளில் மஞ்சள்-பழுப்பு கருகல் திட்டுகள் பரவுகிறதா என கீழ் இலைகளில் கண்காணிக்கவும்.',
        },
        why: {
          en: 'Low weather risk slows spore release, making localized monitoring effective.',
          ta: 'வானிலை அபாயம் குறைவாக இருப்பதால் கள ஆய்வு மூலம் பரவலை எளிதில் கண்காணிக்கலாம்.',
        },
        priority: {
          en: 'Moderate — Ensure localized blotch does not multiply before next weather shift.',
          ta: 'மிதமானது — அடுத்த வானிலை மாறுதலுக்கு முன் நோய் பரவாமல் இருப்பதை உறுதி செய்யவும்.',
        },
        priorityLevel: 'medium',
        monitor: {
          en: 'Track progression of yellow-brown margin blotches across middle canopy leaves.',
          ta: 'நடு இலைகளில் மஞ்சள்-பழுப்பு கருகல் ஓரங்கள் விரிவடைகிறதா என கவனிக்கவும்.',
        },
        nextCheck: {
          en: 'Re-scan in 5–7 days.',
          ta: '5–7 நாட்களில் மீண்டும் ஸ்கேன் செய்யவும்.',
        },
        icon: 'Eye',
        cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
      },
      secondaryActions: [
        {
          id: 'blotch-low-debris',
          title: { en: 'Remove Old Dried Residues', ta: 'காய்ந்த பயிர்க் கழிவுகளை அகற்று' },
          what: {
            en: 'Clear dead or severely infected fallen leaves from furrow channels.',
            ta: 'பாத்திகளில் உதிர்ந்து கிடக்கும் காய்ந்த நோயுற்ற இலைகளை அகற்றவும்.',
          },
          why: {
            en: 'Prevents Taphrina fungal spores from overwintering in crop debris.',
            ta: 'பூஞ்சை வித்துக்கள் காய்ந்த இலைகளில் தங்கி வாழ்வதை தடுக்கிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Clean soil surface around mounds.', ta: 'பாத்திகளை சுற்றியுள்ள மண் பரப்பை சுத்தமாக வைக்கவும்.' },
          nextCheck: { en: 'During weekly maintenance.', ta: 'வாராந்திர பராமரிப்பின் போது.' },
          icon: 'Scissors',
          cardBg: 'bg-[#fff5f5] border border-[#fddede]',
        },
        {
          id: 'blotch-low-airflow',
          title: { en: 'Canopy Airflow Maintenance', ta: 'காற்றோட்டம் பராமரிப்பு' },
          what: {
            en: 'Keep inter-plant spacing clean of weed clusters.',
            ta: 'செடிகளுக்கு இடையே உள்ள களைகளை நீக்கி காற்றோட்டத்தை பராமரிக்கவும்.',
          },
          why: {
            en: 'Reduces early morning leaf dampness.',
            ta: 'காலை நேர இலை ஈரப்பதத்தைக் குறைக்கிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Air circulation across plant rows.', ta: 'பயிர் வரிசைகளுக்கு இடையே காற்று சுழற்சியை கவனிக்கவும்.' },
          nextCheck: { en: 'During weeding.', ta: 'களை எடுக்கும் போது.' },
          icon: 'Wind',
          cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
        },
        {
          id: 'blotch-low-drainage',
          title: { en: 'Maintain Furrow Drainage', ta: 'வடிகால் வசதி' },
          what: {
            en: 'Keep furrow channels clear to prevent water stagnation during unexpected rains.',
            ta: 'எதிர்பாராத மழையின் போது நீர் தேங்காமல் இருக்க வடிகால் வழிகளை சுத்தமாக வைக்கவும்.',
          },
          why: {
            en: 'Prevents localized moisture spikes around rhizome mounds.',
            ta: 'கிழங்கு பாத்திகளில் திடீர் ஈரப்பத உயர்வை தடுக்கிறது.',
          },
          priority: { en: 'Routine', ta: 'வழக்கமானது' },
          priorityLevel: 'routine',
          monitor: { en: 'Clean furrow beds.', ta: 'பாத்திகள் சுத்தமாக இருப்பதை பார்க்கவும்.' },
          nextCheck: { en: 'Weekly inspection.', ta: 'வாராந்திர ஆய்வு.' },
          icon: 'Droplets',
          cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
        },
      ],
      managementGuidance: {
        title: {
          en: 'Leaf Blotch Disease Management Guidance',
          ta: 'இலைக்கருகல் நோய் மேலாண்மை வழிகாட்டல்',
        },
        cultural: {
          en: 'Improve canopy airflow, clear crop debris, avoid evening overhead irrigation, and monitor affected plants weekly.',
          ta: 'செடிகளுக்கு இடையே காற்றோட்டத்தை அதிகரிக்கவும். அறுவடைக்குப் பின் பயிர்க் கழிவுகளை அகற்றவும். அதிகாலை பாசனம் செய்து இலை ஈரப்பத நேரத்தைக் குறைக்கவும்.',
        },
        extension: {
          en: 'Follow TNAU/ICAR-IISR recommendations; severe chemical interventions are usually reserved for high-humidity outbreaks.',
          ta: 'TNAU/ICAR-IISR வழிகாட்டுதல்களைப் பின்பற்றவும்; தீவிர பரவலுக்கு மட்டுமே இரசாயன மருந்துகள் பரிந்துரைக்கப்படும்.',
        },
      },
      fieldConditionNotes: fieldNotes,
    };
  }

  // -------------------------------------------------------------------------
  // 6. STATE: APHIDS INFESTATION
  // -------------------------------------------------------------------------
  // Aphids + High Risk
  if (envTier === 'High' || envTier === 'Moderate') {
    return {
      profileKey: 'APHIDS_HIGH_RISK',
      diagnosisState: 'APHIDS',
      envRiskTier: envTier,
      situationLevel: 'High',
      displayTitle: {
        en: 'Aphid Infestation — Elevated Environmental Moisture',
        ta: 'அசுவினி பூச்சி தாக்குதல் — அதிக ஈரப்பத சூழல்',
      },
      diagnosisExplanation: {
        en: `The uploaded leaf was classified as Aphid infestation with ${conf}% confidence. Current humid microclimate conditions support pest multiplication and secondary sooty mould development on aphid honeydew; intensified pest scouting, forceful water jet wash, and botanical neem deterrence are recommended.`,
        ta: `ஆய்வு செய்யப்பட்ட இலையில் அசுவினி பூச்சி தாக்குதல் (${conf}% நம்பிக்கை) கண்டறியப்பட்டுள்ளது. தற்போதைய ஈரப்பதமான வானிலை பூச்சிப் பெருக்கத்திற்கும் தேன் போன்ற திரவத்தில் கரும்பூஞ்சை தோன்றுவதற்கும் சாதகமாக உள்ளதால், தீவிர பூச்சி கண்காணிப்பு மற்றும் வேப்ப எண்ணெய் கரைசல் தெளிப்பு பரிந்துரைக்கப்படுகிறது.`,
      },
      whyPoints: [
        {
          icon: '🔍',
          title: { en: 'Aphid Colony Detected', ta: 'அசுவினி பூச்சி கண்டறிதல்' },
          text: {
            en: `Visual features classified aphid colony presence and foliar distortion with ${conf}% confidence.`,
            ta: `நரம்பியல் மாதிரி ${conf}% நம்பிக்கையுடன் அசுவினி பூச்சிகள் மற்றும் இலை சுருங்குதல் அறிகுறிகளை கண்டறிந்துள்ளது.`,
          },
        },
        {
          icon: '🌧️',
          title: { en: 'Humid Microclimate Pressure', ta: 'ஈரப்பதமான வானிலை அழுத்தம்' },
          text: {
            en: 'High atmospheric humidity promotes tender vegetative flushes and secondary sooty mould development on sticky honeydew secretions.',
            ta: 'அதிக ஈரப்பதம் இளம் தளிர்களை ஊக்குவித்து, அசுவினி திரவத்தில் கரும்பூஞ்சை படர காரணமாகிறது.',
          },
        },
        {
          icon: '⚠️',
          title: { en: 'Colony Spread Prevention', ta: 'பூச்சி பரவலைத் தடுத்தல்' },
          text: {
            en: 'Winged aphid generations can quickly disperse to adjacent rows if dense colonies are not suppressed promptly.',
            ta: 'அசுவினி கூட்டங்களை கட்டுப்படுத்தாவிட்டால் சிறகுள்ள பூச்சிகள் அடுத்த பாத்திகளுக்கு வேகமாக பரவும்.',
          },
        },
      ],
      primaryAction: {
        id: 'aphids-high-waterjet',
        title: { en: 'Intensive Underside Scouting & Forceful Water Jet Wash', ta: 'இலை அடியில் தீவிர ஆய்வு & விசை நீர்த் தெளிப்பு' },
        what: {
          en: 'Inspect leaf undersides and tender shoots thoroughly, and apply a forceful water spray to physically dislodge aphid clusters.',
          ta: 'இலைகளின் அடியிலும் தளிர்களிலும் பூச்சிகளை சோதித்து, விசைக்குழாய் மூலம் நீர் பீய்ச்சி அடித்து பூச்சிகளை அப்புறப்படுத்தவும்.',
        },
        why: {
          en: 'Physical dislodgement removes active aphid colonies before they produce winged morphs under humid conditions.',
          ta: 'நீர் பீய்ச்சி அடிப்பது பூச்சிகள் சிறகு பெற்று பரவுவதை உடனே தடுக்கிறது.',
        },
        priority: {
          en: 'High — Immediate non-chemical suppression reduces reproductive rate.',
          ta: 'மிக முக்கியம் — உடனடி இயற்கை முறை மூலம் பூச்சிப் பெருக்கத்தை கட்டுப்படுத்துகிறது.',
        },
        priorityLevel: 'high',
        monitor: {
          en: 'Watch for colony re-aggregation on tender shoots and black sooty mould.',
          ta: 'தளிர்களில் பூச்சிகள் மீண்டும் கூடுகிறதா அல்லது கரும்பூஞ்சை படருகிறதா என பார்க்கவும்.',
        },
        nextCheck: {
          en: 'Re-scan within 3–4 days to verify colony suppression.',
          ta: '3–4 நாட்களில் மீண்டும் ஸ்கேன் செய்து கண்காணிக்கவும்.',
        },
        icon: 'Droplets',
        cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
      },
      secondaryActions: [
        {
          id: 'aphids-high-neem',
          title: { en: 'Botanical Neem Deterrent (NSKE 5%)', ta: 'வேப்ப எண்ணெய் கரைசல் (NSKE 5%)' },
          what: {
            en: 'Apply approved botanical neem oil formulation or neem seed kernel extract (NSKE 5%) spray.',
            ta: 'பரிந்துரைக்கப்பட்ட வேப்ப எண்ணெய் கரைசல் அல்லது வேப்பங்கொட்டை சாறு (NSKE 5%) தெளிக்கவும்.',
          },
          why: {
            en: 'Acts as an anti-feedant, oviposition deterrent, and growth disruptor for aphids.',
            ta: 'பூச்சிகளின் உணவு உட்கொள்ளும் திறனை தடுத்து பெருக்கத்தை கட்டுப்படுத்துகிறது.',
          },
          priority: { en: 'High', ta: 'முக்கியம்' },
          priorityLevel: 'high',
          monitor: { en: 'Coverage on foliar undersides.', ta: 'இலைகளின் அடியில் மருந்து படிவதை கவனிக்கவும்.' },
          nextCheck: { en: 'After 3–5 days.', ta: '3–5 நாட்களுக்குப் பின்.' },
          icon: 'Sprout',
          cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
        },
        {
          id: 'aphids-high-traps',
          title: { en: 'Yellow Sticky Traps (4–5 traps/acre)', ta: 'மஞ்சள் வண்ண ஒட்டும் பொறிகள்' },
          what: {
            en: 'Install yellow sticky traps across the canopy at 30 cm above crop height.',
            ta: 'பயிர் உயரத்திற்கு மேல் 30 செ.மீ உயரத்தில் ஏக்கருக்கு 4–5 மஞ்சள் ஒட்டும் பொறிகளை வைக்கவும்.',
          },
          why: {
            en: 'Attracts and captures alate (winged) aphids dispersing between rows.',
            ta: 'பறக்கும் சிறகுள்ள அசுவினிகளைக் கவர்ந்து அழித்து பரவலைத் தடுக்கிறது.',
          },
          priority: { en: 'Moderate', ta: 'மிதமானது' },
          priorityLevel: 'medium',
          monitor: { en: 'Trap catch count twice weekly.', ta: 'வாரத்தில் இருமுறை பொறியில் விழுந்த பூச்சிகளின் எண்ணிக்கையை பார்க்கவும்.' },
          nextCheck: { en: 'Weekly trap clean/replace.', ta: 'வாராந்திர பொறி பராமரிப்பு.' },
          icon: 'Bug',
          cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
        },
        {
          id: 'aphids-high-predators',
          title: { en: 'Conserve Natural Predators', ta: 'இயற்கை எதிரிகளைப் பாதுகாக்கவும்' },
          what: {
            en: 'Protect ladybird beetles (Coccinellids), hoverfly larvae, and lacewings present on foliage.',
            ta: 'இலைகளில் உள்ள பொறிவண்டுகள் (Ladybird beetles) மற்றும் சிறகு ஈக்களைப் பாதுகாக்கவும்.',
          },
          why: {
            en: 'A single ladybird adult can consume 40–50 aphids daily, providing natural biological control.',
            ta: 'ஒரு பொறிவண்டு நாளொன்றுக்கு 40–50 அசுவினிகளை உண்டு இயற்கை சமநிலையை காக்கிறது.',
          },
          priority: { en: 'Biological Conservation', ta: 'இயற்கை பாதுகாப்பு' },
          priorityLevel: 'routine',
          monitor: { en: 'Ladybird beetle populations on infested stems.', ta: 'தாக்கப்பட்ட தண்டுகளில் பொறிவண்டுகளின் எண்ணிக்கையை கவனிக்கவும்.' },
          nextCheck: { en: 'During scouting passes.', ta: 'கள ஆய்வின் போது.' },
          icon: 'ShieldCheck',
          cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
        },
      ],
      managementGuidance: {
        title: {
          en: 'Aphid Pest Management Guidance',
          ta: 'அசுவினி பூச்சி மேலாண்மை வழிகாட்டல்',
        },
        cultural: {
          en: 'Conserve natural predators such as ladybird beetles and hoverfly larvae. Utilize botanical neem formulation sprays and yellow sticky traps as primary non-chemical measures. Wash undersides with water jets to dislodge colonies.',
          ta: 'இயற்கை எதிரிகளான பொறிவண்டுகள் மற்றும் சிறகு ஈக்களைப் பாதுகாக்கவும். வேப்ப எண்ணெய் கரைசல் மற்றும் மஞ்சள் ஒட்டும் பொறிகளைப் பயன்படுத்தவும். விசை நீர்த் தெளிப்பு மூலம் பூச்சிகளை அப்புறப்படுத்தவும்.',
        },
        extension: {
          en: 'For chemical management of severe aphid infestations, consult your local agricultural extension officer and follow current TNAU/ICAR-IISR product label directions.',
          ta: 'தீவிர பூச்சித் தாக்குதலுக்கு, தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) / ICAR-IISR / உள்ளூர் வேளாண்மை அலுவலர் வழிகாட்டுதல்கள் மற்றும் தயாரிப்பு லேபிள் வழிமுறைகளைப் பின்பற்றவும்.',
        },
      },
      fieldConditionNotes: fieldNotes,
    };
  }

  // Aphids + Low Risk
  return {
    profileKey: 'APHIDS_LOW_RISK',
    diagnosisState: 'APHIDS',
    envRiskTier: 'Low',
    situationLevel: 'Moderate',
    displayTitle: {
      en: 'Aphid Infestation — Low Environmental Pressure',
      ta: 'அசுவினி பூச்சி தாக்குதல் — குறைவான வானிலை அழுத்தம்',
    },
    diagnosisExplanation: {
      en: `The uploaded leaf was classified as Aphid infestation with ${conf}% confidence. Current microclimate conditions support non-chemical biological and mechanical management; inspect foliar undersides, conserve predatory insects, and deploy yellow sticky traps.`,
      ta: `ஆய்வு செய்யப்பட்ட இலையில் அசுவினி பூச்சி தாக்குதல் (${conf}% நம்பிக்கை) கண்டறியப்பட்டுள்ளது. தற்போதைய வானிலையில் இயற்கை எதிரிகளைப் பாதுகாத்தல் மற்றும் மஞ்சள் ஒட்டும் பொறிகள் மூலம் பூச்சிகளை எளிதில் கட்டுப்படுத்தலாம்.`,
    },
    whyPoints: [
      {
        icon: '🔍',
        title: { en: 'Aphid Detection', ta: 'அசுவினி அடையாளம்' },
        text: {
          en: `Visual foliar analysis classified aphid activity with ${conf}% confidence.`,
          ta: `காட்சி ஆய்வில் ${conf}% நம்பிக்கையுடன் அசுவினி பூச்சி அறிகுறிகள் உறுதி செய்யப்பட்டன.`,
        },
      },
      {
        icon: '☀️',
        title: { en: 'Moderate Microclimate', ta: 'மிதமான வானிலை' },
        text: {
          en: 'Baseline weather conditions limit explosive aphid reproduction, enabling effective biological management.',
          ta: 'இயல்பான வானிலை பூச்சிப் பெருக்கத்தை மிதப்படுத்தி இயற்கை முறைக்கு சாதகமாக உள்ளது.',
        },
      },
      {
        icon: '🐞',
        title: { en: 'Biological Control Focus', ta: 'இயற்கை எதிரி ஆதரவு' },
        text: {
          en: 'Conserve beneficial insects and deploy sticky traps to suppress local aphid clusters.',
          ta: 'பொறிவண்டுகள் மற்றும் ஒட்டும் பொறிகள் மூலம் ஆரம்ப நிலையிலேயே கட்டுப்படுத்தலாம்.',
        },
      },
    ],
    primaryAction: {
      id: 'aphids-low-scout',
      title: { en: 'Inspect Leaf Undersides & Deploy Yellow Sticky Traps', ta: 'இலை அடியில் ஆய்வு & மஞ்சள் ஒட்டும் பொறிகள்' },
      what: {
        en: 'Inspect leaf undersides on 10–15 plants and install 4–5 yellow sticky traps per acre at canopy level.',
        ta: '10–15 செடிகளில் இலைகளின் அடியில் ஆய்வு செய்து, ஏக்கருக்கு 4–5 மஞ்சள் ஒட்டும் பொறிகளை வைக்கவும்.',
      },
      why: {
        en: 'Low weather risk allows traps and beneficial insects to clear small aphid populations without chemical sprays.',
        ta: 'குறைந்த வானிலை அழுத்தத்தில் பொறிகளும் இயற்கை எதிரிகளும் பூச்சிகளை எளிதில் கட்டுப்படுத்தும்.',
      },
      priority: {
        en: 'Moderate — Control localized aphids before colonies spread.',
        ta: 'மிதமானது — பூச்சிகள் பரவும் முன் ஆரம்ப நிலையிலேயே கட்டுப்படுத்துகிறது.',
      },
      priorityLevel: 'medium',
      monitor: {
        en: 'Count aphids on tender shoots and check ladybird beetle presence.',
        ta: 'தளிர்களில் உள்ள அசுவினிகள் மற்றும் பொறிவண்டுகளின் எண்ணிக்கையை கவனிக்கவும்.',
      },
      nextCheck: {
        en: 'Re-scan / inspect in 5–7 days.',
        ta: '5–7 நாட்களில் மீண்டும் ஆய்வு செய்யவும்.',
      },
      icon: 'Eye',
      cardBg: 'bg-[#fbf4fd] border border-[#f1d7fa]',
    },
    secondaryActions: [
      {
        id: 'aphids-low-neem',
        title: { en: 'Botanical Neem Spray (NSKE 5%)', ta: 'வேப்ப எண்ணெய் கரைசல்' },
        what: {
          en: 'Spray approved botanical neem formulation or neem seed extract on infested patches.',
          ta: 'தாக்கப்பட்ட இடங்களில் வேப்ப எண்ணெய் கரைசல் அல்லது வேப்பங்கொட்டை சாறு தெளிக்கவும்.',
        },
        why: {
          en: 'Safe for natural predators while deterring aphid feeding and egg laying.',
          ta: 'இயற்கை எதிரிகளை பாதிக்காமல் அசுவினிகளை விரட்டுகிறது.',
        },
        priority: { en: 'Routine', ta: 'வழக்கமானது' },
        priorityLevel: 'routine',
        monitor: { en: 'Aphid activity 48 hours post-spray.', ta: 'தெளித்த 48 மணி நேரத்திற்குப் பின் பூச்சிகளின் நிலை.' },
        nextCheck: { en: 'After 5 days.', ta: '5 நாட்களுக்குப் பின்.' },
        icon: 'Sprout',
        cardBg: 'bg-[#fdf9ee] border border-[#f8ecbb]',
      },
      {
        id: 'aphids-low-predators',
        title: { en: 'Conserve Coccinellid Predators', ta: 'பொறிவண்டுகளை பாதுகாக்கவும்' },
        what: {
          en: 'Avoid broad-spectrum chemical sprays to protect ladybird beetles and hoverfly larvae.',
          ta: 'பொறிவண்டுகள் மற்றும் நன்மை செய்யும் பூச்சிகளை அழிக்காமல் பாதுகாக்க கடுமையான பூச்சிக்கொல்லிகளை தவிர்க்கவும்.',
        },
        why: {
          en: 'Natural predators keep aphid numbers below economic threshold levels.',
          ta: 'இயற்கை எதிரிகள் பூச்சிகளை பொருளாதார சேத வரம்பிற்குள் வைக்கின்றன.',
        },
        priority: { en: 'Biological Conservation', ta: 'இயற்கை பாதுகாப்பு' },
        priorityLevel: 'routine',
        monitor: { en: 'Predator-to-pest ratio on new flushes.', ta: 'தளிர்களில் நன்மை செய்யும் பூச்சிகளின் விகிதம்.' },
        nextCheck: { en: 'During routine scouting.', ta: 'வழக்கமான கள ஆய்வின் போது.' },
        icon: 'Bug',
        cardBg: 'bg-[#f0fbf4] border border-[#d2f3dc]',
      },
      {
        id: 'aphids-low-irrigation',
        title: { en: 'Maintain Balanced Irrigation', ta: 'சீரான பாசனம்' },
        what: {
          en: 'Ensure crop does not suffer water stress while avoiding over-watering.',
          ta: 'பயிருக்கு வறட்சி ஏற்படாமல் அதே சமயம் அதிக நீர் பாய்ச்சாமல் சீராக பராமரிக்கவும்.',
        },
        why: {
          en: 'Water-stressed turmeric plants produce concentrated sap that attracts sucking pests.',
          ta: 'வறட்சியான பயிர்களில் சாறு அடர்த்தியாகி உறிஞ்சும் பூச்சிகளை எளிதில் ஈர்க்கும்.',
        },
        priority: { en: 'Agronomic', ta: 'வேளாண் பணி' },
        priorityLevel: 'routine',
        monitor: { en: 'Leaf turgor and soil moisture.', ta: 'இலைகளின் விரைப்புத்தன்மை மற்றும் மண் ஈரப்பதத்தை கவனிக்கவும்.' },
        nextCheck: { en: 'At scheduled irrigation.', ta: 'அடுத்த பாசனத்தின் போது.' },
        icon: 'Droplets',
        cardBg: 'bg-[#f0f7fe] border border-[#d2e6fc]',
      },
    ],
    managementGuidance: {
      title: {
        en: 'Aphid Pest Management Guidance',
        ta: 'அசுவினி பூச்சி மேலாண்மை வழிகாட்டல்',
      },
      cultural: {
        en: 'Conserve natural predators such as ladybird beetles and hoverfly larvae. Deploy botanical neem sprays and yellow sticky traps as primary non-chemical measures.',
        ta: 'இயற்கை எதிரிகளான பொறிவண்டுகள் மற்றும் சிறகு ஈக்களைப் பாதுகாக்கவும். வேப்ப எண்ணெய் கரைசல் மற்றும் மஞ்சள் ஒட்டும் பொறிகளைப் பயன்படுத்தவும்.',
      },
      extension: {
        en: 'For severe pest resurgence, consult your local agricultural extension officer and follow current TNAU/ICAR-IISR recommendations.',
        ta: 'பூச்சித் தாக்குதல் அதிகரித்தால் உள்ளூர் வேளாண்மை அலுவலரை அணுகி TNAU வழிகாட்டுதல்களைப் பின்பற்றவும்.',
      },
    },
    fieldConditionNotes: fieldNotes,
  };
}
