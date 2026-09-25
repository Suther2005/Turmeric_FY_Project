/**
 * TurmeriCare / Curcuma AI - Seasonal Crop Knowledge & Stage Dynamics
 * ===================================================================
 * Source-attributed seasonal guidance for Tamil Nadu turmeric tracts based on
 * verified agronomic bulletins (TNAU CPPS) and institutional trial records (ICAR-AICRPS).
 *
 * References:
 * - SRC-01: TNAU Centre for Plant Protection Studies (CPPS) Monthly Agromet Advisories
 * - SRC-02: ICAR-AICRPS Annual Spices Research Trial Reports (HRS Bhavanisagar Centre)
 * - SRC-03: TNAU Crop Production Guide (Spices & Plantation Crops)
 */

export interface MonthlySeasonalPattern {
  monthIndex: number; // 0 = Jan, 11 = Dec
  monthNameEn: string;
  monthNameTa: string;
  seasonNameEn: string;
  seasonNameTa: string;
  typicalWeatherSummaryEn: string;
  typicalWeatherSummaryTa: string;
  favourabilityLevel: 'Low' | 'Moderate' | 'High';
  favourabilitySummaryEn: string;
  favourabilitySummaryTa: string;
  keyObservationsEn: string[];
  keyObservationsTa: string[];
  actionStepsEn: string[];
  actionStepsTa: string[];
  sourceAttribution: string;
}

export interface StageDevelopmentGuide {
  stagePhase: 'Sprouting' | 'Vegetative' | 'Rhizome Development' | 'Maturity' | 'Unavailable';
  simpleStageNameEn: string;
  simpleStageNameTa: string;
  dapRange: string;
  whatNormallyHappensEn: string;
  whatNormallyHappensTa: string;
  normalItemsEn: string[];
  normalItemsTa: string[];
  needsAttentionItemsEn: string[];
  needsAttentionItemsTa: string[];
  scoutingChecklistEn: string[];
  scoutingChecklistTa: string[];
  whatToDoNowEn: string[];
  whatToDoNowTa: string[];
}

export const CROP_STAGE_DEVELOPMENT_GUIDE: Record<string, StageDevelopmentGuide> = {
  Sprouting: {
    stagePhase: 'Sprouting',
    simpleStageNameEn: '🌱 Early Growth & Emergence',
    simpleStageNameTa: '🌱 ஆரம்ப முளைப்புப் பருவம்',
    dapRange: '0–45 DAP',
    whatNormallyHappensEn:
      'New shoots and tender leaves continue to emerge from mother seed rhizomes. The plant focuses energy on establishing healthy initial roots and first leaf blades.',
    whatNormallyHappensTa:
      'விதை மஞ்சளிலிருந்து இளங்குருத்துகளும் புதிய இலைகளும் தரைக்கு மேல் வெளிவருகின்றன. செடி தனது ஆரம்ப வேர் அமைப்பையும் முதல் இலைகளையும் உருவாக்குகிறது.',
    normalItemsEn: [
      'Tender upright light-green shoots pushing through the soil/mulch',
      'Gradual expansion of first 2–4 true leaves per shoot',
      'Normal slight variations in emergence time across the field'
    ],
    normalItemsTa: [
      'மண்ணிலிருந்து சீராக வெளிவரும் இளம்பச்சை நிற குருத்துகள்',
      'முதல் 2-4 இலைகள் மெதுவாக விரிவடைந்து வளர்தல்',
      'வயல் முழுவதும் முளைப்பு நேரத்தில் ஏற்படும் இயல்பான சிறு வேறுபாடுகள்'
    ],
    needsAttentionItemsEn: [
      'Shoots turning black, soft, or rotting at soil level (seed/rhizome decay)',
      'Sudden yellowing or withering of emerging tender leaf tips',
      'Water stagnating in furrows or beds after heavy irrigation or showers'
    ],
    needsAttentionItemsTa: [
      'குருத்துகள் தரைமட்டத்தில் கறுத்து அல்லது அழுகி விழுதல்',
      'இளங்குருத்துகளின் நுனிப்பகுதி திடீரென மஞ்சள் நிறமாகி வாடுதல்',
      'பாத்திகளில் அல்லது வாய்க்கால்களில் அதிக நேரம் தண்ணீர் தேங்கி நிற்றல்'
    ],
    scoutingChecklistEn: [
      'Inspect shoot emergence uniformity across field beds',
      'Check soil surface for waterlogging after rain',
      'Examine underside of tender leaves for early sucking insects'
    ],
    scoutingChecklistTa: [
      'வயல் முழுவதும் குருத்துகள் சீராக முளைத்துள்ளதா எனப் பார்த்தல்',
      'மழைக்குப் பின் பாத்திகளில் நீர் தேங்காமல் வடிகிறதா என கவனித்தல்',
      'இளங்குருத்துகளின் அடியில் சாறு உறிஞ்சும் பூச்சிகள் உள்ளதா எனப் பார்த்தல்'
    ],
    whatToDoNowEn: [
      'Ensure field drainage channels are clear so excess water drains freely.',
      'Maintain mulch layer to conserve soil moisture and prevent soil crusting.',
      'Avoid walking on wet beds to prevent soil compaction around emerging roots.',
      'If you notice suspicious leaf spots or rotting, capture a clear photo using Check Leaf.'
    ],
    whatToDoNowTa: [
      'மழைநீர் தேங்காமல் வடிந்து செல்ல வடிகால் வாய்க்கால்களை சுத்தமாக வைக்கவும்.',
      'மண் ஈரப்பதத்தைக் காக்கவும் களைகளைத் தடுக்கவும் மூடாக்கு முறையைப் பராமரிக்கவும்.',
      'ஈரமான பாத்திகளில் நடப்பதைத் தவிர்த்து இளம் வேர்களைப் பாதுகாக்கவும்.',
      'இலைகளில் அசாதாரண புள்ளிகள் அல்லது கருகல் தென்பட்டால் "இலையை சரிபார்" மூலம் புகைப்படம் எடுக்கவும்.'
    ]
  },

  Vegetative: {
    stagePhase: 'Vegetative',
    simpleStageNameEn: '🌿 Active Vegetative Growth',
    simpleStageNameTa: '🌿 தீவிர இலை வளர்ச்சிப் பருவம்',
    dapRange: '46–105 DAP',
    whatNormallyHappensEn:
      'Canopy expands rapidly with multiple tillers and fresh broad green leaves. Healthy photosynthetic leaf area develops to power upcoming rhizome formation.',
    whatNormallyHappensTa:
      'பயிர் வேகமாக வளர்ந்து புதிய தூர்களையும் அடர்ந்த பச்சை இலைகளையும் உருவாக்குகிறது. இலைப்பரப்பு விரிவடைந்து செடி செழிப்பாக வளர்கிறது.',
    normalItemsEn: [
      'Vigorous emergence of multiple tillers and broad dark-green leaves',
      'Smooth, healthy leaf blades without spots or marginal yellowing',
      'Erect pseudostems supporting strong canopy expansion'
    ],
    normalItemsTa: [
      'செடியிலிருந்து புதிய தூர்கள் பெருகி அடர்ந்த பச்சை இலைகள் தோன்றுதல்',
      'புள்ளிகள் இல்லாத தெளிவான, பளபளப்பான இலைப்பரப்பு',
      'வலுவான தண்டுகளுடன் நிமிர்ந்து நிற்கும் ஆரோக்கியமான பயிர்'
    ],
    needsAttentionItemsEn: [
      'Small brown or yellow-halo spots appearing on middle or lower leaves',
      'Yellow or brown discoloration spreading along leaf margins',
      'Aphid clusters (tiny dark insects) or sticky honeydew under curled leaves',
      'Wilting of central shoots during warm hours'
    ],
    needsAttentionItemsTa: [
      'நடு அல்லது கீழ் இலைகளில் சிறிய பழுப்பு அல்லது மஞ்சள் நிற வளையப் புள்ளிகள் தோன்றுதல்',
      'இலைகளின் ஓரங்களில் கருகல் அல்லது மஞ்சள் கோடுகள் பரவுதல்',
      'இலையின் அடியில் அசுவினி பூச்சிக் கூட்டங்கள் அல்லது பிசுபிசுப்புத் தன்மை காணப்படுதல்',
      'நடுக்குருத்து திடீரென வாடி காய்ந்து போதல்'
    ],
    scoutingChecklistEn: [
      'Check lower and middle leaf blades for new spots or yellow halos',
      'Look underneath curled or distorted leaves for aphid colonies',
      'Observe whether spots are spreading to adjacent plants in the row',
      'Check furrow drainage and canopy airflow after showers'
    ],
    scoutingChecklistTa: [
      'கீழ் மற்றும் நடு இலைகளில் புதிய புள்ளிகள் அல்லது மஞ்சள் வளையங்கள் உள்ளதா எனப் பார்த்தல்',
      'சுருங்கிய இலைகளின் அடிப்பகுதியில் அசுவினி பூச்சிகள் உள்ளதா என கவனித்தல்',
      'புள்ளிகள் அடுத்தடுத்த செடிகளுக்குப் பரவுகிறதா என கண்காணித்தல்',
      'மழைக்குப் பின் செடிகளுக்கு இடையே நல்ல காற்றோட்டமும் வடிகாலும் உள்ளதா எனப் பார்த்தல்'
    ],
    whatToDoNowEn: [
      'Inspect your crop during morning hours when leaf symptoms are most visible.',
      'Keep furrows weed-free to maintain good air circulation in the dense canopy.',
      'Avoid excess nitrogen application during prolonged wet periods.',
      'If you see suspicious spots or leaf curling, capture a clear photo using Check Leaf.'
    ],
    whatToDoNowTa: [
      'காலை வேளையில் பயிரை உற்று நோக்கி இலை அறிகுறிகளைக் கண்காணிக்கவும்.',
      'செடிகளுக்கு இடையே நல்ல காற்றோட்டம் கிடைக்க பாத்திகளில் உள்ள களைகளை அகற்றவும்.',
      'அதிக மழை அல்லது ஈரப்பதம் உள்ள காலத்தில் அதிகப்படியான தழைச்சத்தை தவிர்க்கவும்.',
      'இலைகளில் சந்தேகத்திற்குரிய புள்ளிகள் தென்பட்டால் "இலையை சரிபார்" மூலம் படம் எடுத்து ஆய்வு செய்யவும்.'
    ]
  },

  'Rhizome Development': {
    stagePhase: 'Rhizome Development',
    simpleStageNameEn: '🍠 Rhizome Development & Bulking',
    simpleStageNameTa: '🍠 கிழங்கு பெருக்கும் பருவம்',
    dapRange: '106–180 DAP',
    whatNormallyHappensEn:
      'Plant growth shifts heavily toward expanding underground mother and finger rhizomes. Canopy remains broad and fully active, photosynthesizing nutrients down into the root zone.',
    whatNormallyHappensTa:
      'செடியின் வளர்ச்சி மண்ணுக்குள் உள்ள தாய் மற்றும் விரலி மஞ்சள் கிழங்குகளைப் பெருக்குவதில் கவனம் செலுத்துகிறது. இலைப்பரப்பு முழுமையாக இயங்கி ஊட்டச்சத்துக்களை கிழங்கிற்கு அனுப்புகிறது.',
    normalItemsEn: [
      'Dense, full canopy with broad dark-green mature leaves',
      'Active underground rhizome development (rhizomes firm and expanding)',
      'Occasional natural drying of the very oldest bottom-most 1–2 baseline leaves'
    ],
    normalItemsTa: [
      'அடர்ந்த, முழுமையாக விரிந்த அடர்பச்சை நிற முதிர்ந்த இலைகள்',
      'மண்ணுக்குள் கிழங்குகள் உறுதியாகப் பெருத்து வளரும் நிலை',
      'செடியின் அடிமட்டத்தில் உள்ள மிக பழைய 1-2 இலைகள் மட்டும் இயல்பாக காய்ந்து விழுதல்'
    ],
    needsAttentionItemsEn: [
      'Numerous dark brown oval spots with concentric rings (Leaf Spot pattern)',
      'Extensive yellow-brown or reddish blotches on upper leaf surfaces (Leaf Blotch pattern)',
      'Rapid spread of leaf spots to upper canopy following rainfall or high humidity',
      'Severe yellowing and premature drying of active middle leaves'
    ],
    needsAttentionItemsTa: [
      'இலைகளில் அடர் பழுப்பு நிறத்தில் வளையங்கள் கொண்ட இலைப்புள்ளி நோய் அறிகுறிகள்',
      'இலையின் மேல் பரப்பில் மஞ்சள்-பழுப்பு அல்லது சிவப்பு நிற இலைக்கருகல் புள்ளிகள்',
      'மழை அல்லது பனிக்குப் பின் புள்ளிகள் வேகமாக மேல் இலைகளுக்குப் பரவுதல்',
      'நடுப்பகுதி இலைகள் திடீரென மஞ்சள் நிறமாகி காய்ந்து போதல்'
    ],
    scoutingChecklistEn: [
      'Inspect upper and middle canopy leaves for expanding spots or lesions',
      'Check if spots have yellow halos or dark concentric rings',
      'Check whether symptoms are localized to a few leaves or widespread',
      'Ensure soil remains aerated and is not waterlogged'
    ],
    scoutingChecklistTa: [
      'நடு மற்றும் மேல் இலைகளில் புள்ளிகள் பெரிதாகிறதா என உற்று நோக்குதல்',
      'புள்ளிகளைச் சுற்றி மஞ்சள் நிற வளையம் அல்லது உள்கோடுகள் உள்ளதா எனப் பார்த்தல்',
      'நோய் அறிகுறிகள் ஒரு சில இலைகளில் மட்டும் உள்ளதா அல்லது பரவலாக உள்ளதா என அறிதல்',
      'மண்ணில் தண்ணீர் தேங்காமல் நல்ல காற்றோட்டம் இருப்பதை உறுதி செய்தல்'
    ],
    whatToDoNowEn: [
      'Walk field rows regularly to detect early foliar disease patches before they spread.',
      'Ensure drainage furrows are clear; standing water increases humidity and disease pressure.',
      'Avoid sprinkler or overhead irrigation during late afternoons or evenings.',
      'If you spot suspicious lesions or blotches, use Check Leaf immediately for analysis.'
    ],
    whatToDoNowTa: [
      'நோய் பரவுவதற்கு முன் ஆரம்ப நிலையிலேயே கண்டறிய வயலைத் தவறாமல் பார்வையிடவும்.',
      'வாய்க்கால்களை சீரமைத்து நீர் தேங்காமல் வடித்துவிடவும்; அதிக ஈரம் நோயைப் பெருக்கும்.',
      'மாலை நேரங்களில் இலைகளில் அதிக நேரம் ஈரம் தங்கும் தெளிப்பு பாசனத்தைத் தவிர்க்கவும்.',
      'புள்ளிகள் அல்லது கருகல் அறிகுறிகள் தெரிந்தால் உடனே "இலையை சரிபார்" மூலம் ஆய்வு செய்யவும்.'
    ]
  },

  Maturity: {
    stagePhase: 'Maturity',
    simpleStageNameEn: '🌾 Crop Maturity & Natural Maturation',
    simpleStageNameTa: '🌾 முதிர்ச்சி & இயற்கை காய்வுப் பருவம்',
    dapRange: '>180 DAP',
    whatNormallyHappensEn:
      'Crop enters natural maturation. Lower and outer leaves naturally begin gradual yellowing and drying down as nutrients migrate fully into the developed rhizomes.',
    whatNormallyHappensTa:
      'பயிர் இயற்கை முதிர்ச்சிப் பருவத்தை அடைகிறது. கிழங்கு முழுமையாக முதிர்வடைவதால், கீழ் மற்றும் வெளி இலைகள் இயற்கையாக மஞ்சள் நிறமாகி காயத் தொடங்கும்.',
    normalItemsEn: [
      'Gradual, uniform natural yellowing starting from lower/outer leaves toward harvest',
      'Leaves gently drying down to golden-brown without black necrotic rings',
      'Rhizomes becoming firm with characteristic bright yellow/orange core'
    ],
    normalItemsTa: [
      'கீழ் இலைகளிலிருந்து மேல்நோக்கி சீராக மஞ்சள் நிறமாகி காய்ந்து வருதல் (இயற்கை முதிர்ச்சி)',
      'கறுப்பு வளையப் புள்ளிகள் இன்றி இலைகள் பொன்னிறமாக காய்ந்து தண்டு சாய்வது',
      'மஞ்சள் கிழங்குகள் நல்ல உறுதித்தன்மையுடனும் அடர் நிறத்துடனும் இருத்தல்'
    ],
    needsAttentionItemsEn: [
      'Acute black, sunken, or spreading fungal lesions on remaining green leaves',
      'Premature rotting or soft foul-smelling rhizomes in the soil',
      'Severe insect boring into mature pseudostems'
    ],
    needsAttentionItemsTa: [
      'பச்சை இலைகளில் திடீரென தோன்றும் கறுப்பு நிற அழுகல் அல்லது புள்ளித் தாக்குதல்கள்',
      'மண்ணில் உள்ள மஞ்சள் கிழங்குகள் மென்மையாகி அழுகுதல் அல்லது துர்நாற்றம் வீசுதல்',
      'முதிர்ந்த தண்டுப்பகுதியில் வண்டு அல்லது புழுக்கள் துளைத்திருத்தல்'
    ],
    scoutingChecklistEn: [
      'Distinguish natural maturity yellowing from acute fungal leaf spot lesions',
      'Check sample rhizomes underground for firmness and skin maturity',
      'Monitor soil dry-down progression 10–15 days before harvest'
    ],
    scoutingChecklistTa: [
      'இயற்கையான இலை முதிர்ச்சிக்கும் பூஞ்சாண இலைப்புள்ளி நோய்க்கும் உள்ள வேறுபாட்டை கவனித்தல்',
      'மண்ணில் உள்ள கிழங்குகளை மாதிரி எடுத்து அதன் முதிர்ச்சியை சரிபார்த்தல்',
      'அறுவடைக்கு 10-15 நாட்களுக்கு முன் மண் உலரும் நிலையை கண்காணித்தல்'
    ],
    whatToDoNowEn: [
      'Do not mistake natural maturity yellowing for acute disease attack; avoid unnecessary sprays.',
      'Gradually reduce irrigation frequency as harvest approaches.',
      'Stop irrigation 10–15 days before harvest to facilitate rhizome lifting and curing.',
      'If remaining green foliage shows unusual black rotting, capture a photo using Check Leaf.'
    ],
    whatToDoNowTa: [
      'இயற்கை இலை முதிர்ச்சியை புதிய நோய் தாக்குதலாக கருதி தேவையற்ற மருந்துகளைத் தெளிக்க வேண்டாம்.',
      'அறுவடை நெருங்குவதால் பாசன அளவை படிப்படியாகக் குறைக்கவும்.',
      'அறுவடைக்கு 10-15 நாட்களுக்கு முன் பாசனத்தை நிறுத்தி நிலத்தை பக்குவப்படுத்தவும்.',
      'பச்சை இலைகளில் அசாதாரண கறுப்பு அழுகல் தெரிந்தால் "இலையை சரிபார்" மூலம் ஆய்வு செய்யவும்.'
    ]
  },

  Unavailable: {
    stagePhase: 'Unavailable',
    simpleStageNameEn: '🌱 General Seasonal Guidance',
    simpleStageNameTa: '🌱 பொதுவான பருவக்கால வழிகாட்டல்',
    dapRange: 'Planting date unset',
    whatNormallyHappensEn:
      'General seasonal crop guidance based on the current calendar month and regional weather patterns. Set your planting date above to view stage-specific crop development.',
    whatNormallyHappensTa:
      'தற்போதைய மாதத்திற்கான பொதுவான பருவக்கால வழிகாட்டல். உங்கள் நடவு தேதியை உள்ளிட்டால் துல்லியமான பயிர் வளர்ச்சி மற்றும் கவனிப்பு விவரங்களைப் பெறலாம்.',
    normalItemsEn: [
      'Healthy green canopy growth suited to the ongoing calendar season',
      'Steady emergence of new leaves and tillers during the growth window',
      'Normal field progression under regular irrigation and drainage care'
    ],
    normalItemsTa: [
      'பருவத்திற்கு ஏற்ற ஆரோக்கியமான அடர்பச்சை இலை வளர்ச்சி',
      'வளர்ச்சி காலத்தில் புதிய இலைகளும் தூர்களும் சீராகத் தோன்றுதல்',
      'சீரான பாசனம் மற்றும் வடிகால் பராமரிப்பில் பயிர் செழிப்பாக இருத்தல்'
    ],
    needsAttentionItemsEn: [
      'Unusual spots, yellow halos, or brown borders on leaves',
      'Rapid spread of symptoms across adjacent plants in the field',
      'Water standing in beds for long periods after rainfall'
    ],
    needsAttentionItemsTa: [
      'இலைகளில் தோன்றும் அசாதாரண புள்ளிகள், மஞ்சள் வளையங்கள் அல்லது கருகல்',
      'நோய் அறிகுறிகள் வயலில் அடுத்தடுத்த செடிகளுக்கு வேகமாகப் பரவுதல்',
      'மழைக்குப் பின் பாத்திகளில் அதிக நேரம் தண்ணீர் தேங்கி நிற்றல்'
    ],
    scoutingChecklistEn: [
      'Inspect leaves regularly for new spots or discoloration',
      'Check whether spots are expanding or spreading',
      'Ensure furrow drainage channels are clear and functional'
    ],
    scoutingChecklistTa: [
      'இலைகளில் புதிய புள்ளிகள் தோன்றுகிறதா எனத் தவறாமல் கண்காணித்தல்',
      'புள்ளிகள் பெரிதாகிறதா அல்லது மற்ற இலைகளுக்குப் பரவுகிறதா எனப் பார்த்தல்',
      'வடிகால் வாய்க்கால்கள் அடைப்பின்றி சுத்தமாக உள்ளதா என உறுதி செய்தல்'
    ],
    whatToDoNowEn: [
      'Configure your planting date above to unlock customized crop-stage advice.',
      'Walk your field regularly to spot foliar symptoms early.',
      'Maintain clean furrows and good drainage after rain.',
      'If you see suspicious symptoms on leaves, capture a clear photo using Check Leaf.'
    ],
    whatToDoNowTa: [
      'உங்கள் பயிருக்கான துல்லியமான வழிகாட்டலைப் பெற மேலே நடவு தேதியை உள்ளிடவும்.',
      'அறிகுறிகளை ஆரம்பத்திலேயே கண்டறிய பயிரைத் தவறாமல் பார்வையிடவும்.',
      'மழைக்குப் பின் நல்ல வடிகால் வசதியை உறுதி செய்யவும்.',
      'இலைகளில் அசாதாரண புள்ளிகள் தெரிந்தால் "இலையை சரிபார்" மூலம் புகைப்படம் எடுத்து ஆய்வு செய்யவும்.'
    ]
  }
};

export const TAMIL_NADU_SEASONAL_PATTERNS: MonthlySeasonalPattern[] = [
  {
    monthIndex: 0, // January
    monthNameEn: 'January',
    monthNameTa: 'தை (ஜனவரி)',
    seasonNameEn: 'Post-Monsoon Winter / Maturation',
    seasonNameTa: 'பயிர்க்காலம் / முதிர்ச்சிப் பருவம்',
    typicalWeatherSummaryEn: 'Cool dry nights with morning dew and moderate daytime warmth.',
    typicalWeatherSummaryTa: 'பனிப்பொழிவு உள்ள காலை வேளை, மிதமான பகல் வெப்பம் மற்றும் வறண்ட இரவுகள்.',
    favourabilityLevel: 'Moderate',
    favourabilitySummaryEn: 'Morning dew may sustain lingering spots on older lower leaves. Overall new foliar infection rate slows down.',
    favourabilitySummaryTa: 'காலை நேர பனிப்பொழிவு முதிர்ந்த கீழ் இலைகளில் பழைய புள்ளிகளைத் தக்கவைக்கலாம். புதிய பாதிப்புகள் ஏற்படுவது குறையும்.',
    keyObservationsEn: [
      'Natural leaf yellowing versus active disease spots on lower canopy',
      'Morning dew accumulation on mature foliage',
      'Soil moisture dry-down progression prior to harvest'
    ],
    keyObservationsTa: [
      'கீழ் இலைகளில் இயற்கையான மஞ்சள் நிற மாற்றத்திற்கும் நோய் புள்ளிகளுக்கும் உள்ள வேறுபாடு',
      'முதிர்ந்த இலைகளில் காலை நேர பனிநீர் தேங்குதல்',
      'அறுவடைக்கு முந்தைய மண் உலர்வு நிலை'
    ],
    actionStepsEn: [
      'Gradually taper irrigation as crop approaches maturity.',
      'Distinguish natural leaf drying from disease attack; avoid unnecessary chemical sprays.',
      'Keep furrows clean and dry in preparation for harvest.'
    ],
    actionStepsTa: [
      'பயிர் முதிர்ச்சியை நோக்கி செல்வதால் பாசன அளவை படிப்படியாகக் குறைக்கவும்.',
      'இயற்கை இலை காய்வை நோய் தாக்குதலாக கருத வேண்டாம்; தேவையற்ற மருந்துகளைத் தவிர்க்கவும்.',
      'அறுவடைக்கு ஏதுவாக வாய்க்கால்களை சுத்தமாக பராமரிக்கவும்.'
    ],
    sourceAttribution: 'TNAU CPPS Agromet Advisory & AICRPS Reports (SRC-01, SRC-02)'
  },
  {
    monthIndex: 1, // February
    monthNameEn: 'February',
    monthNameTa: 'மாசி (பிப்ரவரி)',
    seasonNameEn: 'Late Winter / Pre-Harvest',
    seasonNameTa: 'அறுவடைக்கு முந்தைய பருவம்',
    typicalWeatherSummaryEn: 'Dry, warming daytime temperatures with clear skies and low relative humidity.',
    typicalWeatherSummaryTa: 'வறண்ட வானிலை, அதிகரிக்கும் பகல் வெப்பம் மற்றும் குறைந்த ஈரப்பதம்.',
    favourabilityLevel: 'Low',
    favourabilitySummaryEn: 'Dry conditions and rising temperatures are not favourable for new foliar fungal diseases.',
    favourabilitySummaryTa: 'வறண்ட காற்று மற்றும் வெப்ப உயர்வு காரணமாக புதிய இலை பூஞ்சாண பாதிப்புகள் ஏற்படுவது குறைவு.',
    keyObservationsEn: [
      'Canopy senescence and drying of pseudostems (natural maturity)',
      'Rhizome firmness and skin maturity in soil',
      'Absence of active new fungal spore dissemination'
    ],
    keyObservationsTa: [
      'இலைகள் காய்ந்து தண்டுப்பகுதி மடிதல் (இயற்கை முதிர்ச்சி)',
      'மண்ணில் உள்ள மஞ்சள் கிழங்கின் முதிர்ச்சி மற்றும் உறுதித்தன்மை',
      'புதிய பூஞ்சாண பரவல் இல்லாத நிலை'
    ],
    actionStepsEn: [
      'Stop irrigation 10–15 days before harvest to facilitate lifting.',
      'Prepare harvest tools and rhizome curing yards.',
      'No foliar chemical spray is indicated during natural senescence.'
    ],
    actionStepsTa: [
      'அறுவடைக்கு 10-15 நாட்களுக்கு முன் பாசனத்தை முழுமையாக நிறுத்தவும்.',
      'மஞ்சள் அறுவடை மற்றும் பதப்படுத்தும் களங்களைத் தயார் செய்யவும்.',
      'இயற்கை இலை முதிர்ச்சியின் போது எந்தவித பூஞ்சாண தெளிப்பும் தேவையில்லை.'
    ],
    sourceAttribution: 'TNAU Crop Production Guide (Spices) & CPPS Bulletins'
  },
  {
    monthIndex: 2, // March
    monthNameEn: 'March',
    monthNameTa: 'பங்குனி (மார்ச்)',
    seasonNameEn: 'Harvest & Post-Harvest Window',
    seasonNameTa: 'அறுவடை மற்றும் பதப்படுத்தும் பருவம்',
    typicalWeatherSummaryEn: 'Warm, dry summer conditions with intense sunshine.',
    typicalWeatherSummaryTa: 'வெப்பமான, வறண்ட கோடை வானிலை மற்றும் அதிக சூரிய ஒளி.',
    favourabilityLevel: 'Low',
    favourabilitySummaryEn: 'Main turmeric harvest and rhizome curing season. Field foliar disease activity is dormant.',
    favourabilitySummaryTa: 'மஞ்சள் அறுவடை மற்றும் அவித்து உலர்த்தும் காலம். வயலில் இலை நோய் செயல்பாடு இல்லை.',
    keyObservationsEn: [
      'Rhizome curing and sun drying progress',
      'Selection and storage of healthy seed rhizomes for next season'
    ],
    keyObservationsTa: [
      'மஞ்சள் அவித்து காயவைக்கும் தரம்',
      'அடுத்த பருவத்திற்கான நலம் கொண்ட விதை மஞ்சள் தேர்வு மற்றும் சேமிப்பு'
    ],
    actionStepsEn: [
      'Store seed rhizomes in well-ventilated, shaded pits.',
      'Clean field debris and expose soil to summer solarization.'
    ],
    actionStepsTa: [
      'விதை மஞ்சளை நிழலான, நல்ல காற்றோட்டமுள்ள குழிகளில் சேமிக்கவும்.',
      'வயல் கழிவுகளை அகற்றி கோடை உழவு செய்து மண்ணை சூரிய ஒளியில் காயவிடவும்.'
    ],
    sourceAttribution: 'TNAU Post-Harvest Technology Guide (SRC-03)'
  },
  {
    monthIndex: 3, // April
    monthNameEn: 'April',
    monthNameTa: 'சித்திரை (ஏப்ரல்)',
    seasonNameEn: 'Summer Fallow & Land Preparation',
    seasonNameTa: 'கோடை உழவு மற்றும் நில தயாரிப்பு',
    typicalWeatherSummaryEn: 'High temperatures with dry winds and occasional localized summer showers.',
    typicalWeatherSummaryTa: 'அதிக வெப்பம், வறண்ட காற்று மற்றும் அவ்வப்போது பெய்யும் கோடை மழை.',
    favourabilityLevel: 'Low',
    favourabilitySummaryEn: 'Pre-sowing land preparation. Deep ploughing helps eliminate soil-borne resting spores.',
    favourabilitySummaryTa: 'விதைப்புக்கு முந்தைய நில தயாரிப்பு. ஆழ உழவு மண்ணில் உள்ள பூஞ்சாண வித்துக்களை அழிக்க உதவுகிறது.',
    keyObservationsEn: [
      'Soil texture, tilth, and organic matter content',
      'Proper bed preparation for upcoming sowing'
    ],
    keyObservationsTa: [
      'மண்ணின் பதம் மற்றும் இயற்கை உர நிலை',
      'வரவிருக்கும் விதைப்புக்கான பாத்தி அமைப்பு தயாரிப்பு'
    ],
    actionStepsEn: [
      'Perform deep summer ploughing to eradicate soil-borne pests and resting spores.',
      'Incorporate well-rotted farmyard manure during final preparation.'
    ],
    actionStepsTa: [
      'மண்ணில் உள்ள பூச்சிகள் மற்றும் பூஞ்சாணங்களை அழிக்க ஆழமான கோடை உழவு செய்யவும்.',
      'கடைசி உழவின் போது நன்கு மக்கிய தொழு உரம் இடவும்.'
    ],
    sourceAttribution: 'TNAU Agronomy & Soil Science Advisory'
  },
  {
    monthIndex: 4, // May
    monthNameEn: 'May',
    monthNameTa: 'வைகாசி (மே)',
    seasonNameEn: 'Pre-Sowing & Sowing Window',
    seasonNameTa: 'விதைப்புக்கு முந்தைய தயாரிப்பு',
    typicalWeatherSummaryEn: 'Pre-monsoon summer showers with increasing relative humidity.',
    typicalWeatherSummaryTa: 'கோடை மழை மற்றும் மெதுவாக அதிகரிக்கும் ஈரப்பதம்.',
    favourabilityLevel: 'Low',
    favourabilitySummaryEn: 'Early planting phase. Main focus is selecting healthy seed rhizomes to prevent seed-borne disease.',
    favourabilitySummaryTa: 'விதைப்பு தொடக்க காலம். விதை மூலம் பரவும் நோய்களைத் தடுக்க நலம் கொண்ட விதை தேர்வு முக்கியம்.',
    keyObservationsEn: [
      'Sprouting viability of seed rhizomes',
      'Uniform seed weight (25–35g sound pieces)'
    ],
    keyObservationsTa: [
      'விதை மஞ்சளின் முளைப்புத் திறன்',
      'சீரான விதை கிழங்கு எடை (25-35 கிராம் நலம் கொண்ட முளைகள்)'
    ],
    actionStepsEn: [
      'Treat seed rhizomes before planting to protect against early fungal rot.',
      'Ensure raised beds or ridge-and-furrow system are properly formed for good drainage.'
    ],
    actionStepsTa: [
      'விதை அழுகலைத் தடுக்க விதைப்பதற்கு முன் பரிந்துரைக்கப்பட்ட விதை நேர்த்தி செய்யவும்.',
      'பாத்திகளை தரைமட்டத்திலிருந்து உயர்த்தி அமைத்து நீர் வடிய வழியமைக்கவும்.'
    ],
    sourceAttribution: 'TNAU CPPS Seed Pathology Guidelines'
  },
  {
    monthIndex: 5, // June
    monthNameEn: 'June',
    monthNameTa: 'ஆனி (ஜூன்)',
    seasonNameEn: 'Main Planting & Early Emergence',
    seasonNameTa: 'முதன்மை விதைப்பு மற்றும் முளைப்புப் பருவம்',
    typicalWeatherSummaryEn: 'Southwest monsoon onset across western and central Tamil Nadu.',
    typicalWeatherSummaryTa: 'தென்மேற்கு பருவமழை தொடக்கம் மற்றும் சீரான காற்று.',
    favourabilityLevel: 'Low',
    favourabilitySummaryEn: 'Foliar disease risk remains low during sprouting. Watch for soil waterlogging in heavy soils.',
    favourabilitySummaryTa: 'முளைப்புப் பருவத்தில் இலை நோய் ஆபத்து குறைவு. களிமண் நிலங்களில் நீர் தேங்காமல் பார்த்துக் கொள்ளவும்.',
    keyObservationsEn: [
      'Uniform emergence of shoots above mulch layer',
      'Soil drainage after initial monsoon showers',
      'Absence of shoot rotting in heavy saturated patches'
    ],
    keyObservationsTa: [
      'மண்ணிலிருந்து சீராக குருத்துகள் முளைத்து வருதல்',
      'மழைக்குப் பின் பாத்திகளில் நீர் வடியும் தன்மை',
      'நீர் தேங்கும் இடங்களில் குருத்து அழுகல் அறிகுறி இல்லாத நிலை'
    ],
    actionStepsEn: [
      'Apply green leaf mulching to conserve moisture and suppress early weeds.',
      'Ensure clear furrow outlets to prevent water stagnation around young sprouts.'
    ],
    actionStepsTa: [
      'மண் ஈரப்பதத்தைக் காக்கவும் களைகளைக் கட்டுப்படுத்தவும் பசுந்தழை மூடாக்கு இடவும்.',
      'பாத்திகளில் தண்ணீர் தேங்காமல் வடிந்து செல்ல வாய்க்கால்களை சீரமைக்கவும்.'
    ],
    sourceAttribution: 'TNAU Agronomy & AICRPS Germination Trials (SRC-02)'
  },
  {
    monthIndex: 6, // July
    monthNameEn: 'July',
    monthNameTa: 'ஆடி (ஜூலை)',
    seasonNameEn: 'Early Vegetative Phase',
    seasonNameTa: 'ஆரம்ப வளர்ச்சிப் பருவம்',
    typicalWeatherSummaryEn: 'Breezy conditions with intermittent light showers and moderate temperatures (26–32°C).',
    typicalWeatherSummaryTa: 'மிதமான காற்று, விட்டு விட்டு பெய்யும் தூறல் மற்றும் மிதமான வெப்பம் (26-32°C).',
    favourabilityLevel: 'Low',
    favourabilitySummaryEn: 'Canopy is expanding. Moderate humidity supports healthy leaf growth with low disease pressure.',
    favourabilitySummaryTa: 'இலைகள் விரிவடையும் பருவம். மிதமான ஈரப்பதம் ஆரோக்கியமான இலை வளர்ச்சிக்கு சாதகமானது.',
    keyObservationsEn: [
      'Emergence of 4–6 healthy true leaves per shoot',
      'Vigorous green leaf blades without yellowing or spots',
      'Early presence of sucking pests (aphids) on young shoots'
    ],
    keyObservationsTa: [
      'செடிக்கு 4-6 ஆரோக்கியமான புதிய இலைகள் தோன்றுதல்',
      'மஞ்சள் நிற மாற்றமில்லாத அடர்பச்சை இலைகள்',
      'இளங்குருத்துகளில் ஆரம்ப அசுவினி பூச்சிகள் தென்படுகிறதா என கவனித்தல்'
    ],
    actionStepsEn: [
      'Perform light weeding and earthing up around expanding roots.',
      'Install yellow sticky traps for monitoring sucking pests.',
      'Ensure good airflow between plant rows.'
    ],
    actionStepsTa: [
      'முதல் களை எடுத்து லேசாக மண் அணைக்கவும்.',
      'சாறு உறிஞ்சும் பூச்சிகளைக் கண்காணிக்க மஞ்சள் ஒட்டும் பொறிகளை வைக்கவும்.',
      'செடிகளுக்கு இடையே நல்ல காற்றோட்டம் இருப்பதை உறுதி செய்யவும்.'
    ],
    sourceAttribution: 'TNAU CPPS Pest Surveillance Bulletins (SRC-01)'
  },
  {
    monthIndex: 7, // August
    monthNameEn: 'August',
    monthNameTa: 'ஆவணி (ஆகஸ்ட்)',
    seasonNameEn: 'Peak Vegetative & Early Tillering',
    seasonNameTa: 'தீவிர இலை மற்றும் தூர் வளர்ச்சிப் பருவம்',
    typicalWeatherSummaryEn: 'Intermittent southwest monsoon showers with high daytime humidity (70–80%).',
    typicalWeatherSummaryTa: 'விட்டு விட்டு பெய்யும் தென்மேற்கு பருவமழை மற்றும் அதிக ஈரப்பதம் (70-80%).',
    favourabilityLevel: 'Moderate',
    favourabilitySummaryEn: 'Canopy closes rapidly. Warm humid microclimates inside dense foliage may favour early leaf spot or blotch development.',
    favourabilitySummaryTa: 'இலைப்பரப்பு அடர்த்தியாகும் பருவம். அதிக ஈரப்பதம் இலைப்புள்ளி அல்லது இலைக்கருகல் நோய் உருவாக சாதகமாக அமையலாம்.',
    keyObservationsEn: [
      'Small scattered brown spots on lower canopy leaves',
      'Leaf moisture duration in early mornings',
      'Aphid colonies on tender leaf sheaths'
    ],
    keyObservationsTa: [
      'கீழ் இலைகளில் தோன்றும் சிறிய பழுப்பு நிற புள்ளிகள்',
      'காலை வேளையில் இலைகளில் பனிநீர் தங்கும் நேரம்',
      'இலை உறைகளில் அசுவினி பூச்சிகளின் நடமாட்டம்'
    ],
    actionStepsEn: [
      'Inspect lower canopy leaves regularly for new spots.',
      'Ensure furrows are free of standing water after heavy showers.',
      'If spots appear and enlarge, take a photo using Check Leaf for diagnosis.'
    ],
    actionStepsTa: [
      'கீழ் இலைகளில் புதிய புள்ளிகள் தோன்றுகிறதா எனத் தவறாமல் கவனிக்கவும்.',
      'மழைக்குப் பின் பாத்திகளில் தண்ணீர் தேங்காமல் வடித்துவிடவும்.',
      'புள்ளிகள் தென்பட்டால் "இலையை சரிபார்" மூலம் புகைப்படம் எடுத்து ஆய்வு செய்யவும்.'
    ],
    sourceAttribution: 'TNAU CPPS Monthly Agromet Advisory (SRC-01)'
  },
  {
    monthIndex: 8, // September
    monthNameEn: 'September',
    monthNameTa: 'புரட்டாசி (செப்டம்பர்)',
    seasonNameEn: 'Early Rhizome Bulking Window',
    seasonNameTa: 'கிழங்கு பெருக்கும் ஆரம்ப பருவம்',
    typicalWeatherSummaryEn: 'Transition period with rising humidity, overcast skies, and thunderstorm showers.',
    typicalWeatherSummaryTa: 'மேகமூட்டம், அதிகரிக்கும் ஈரப்பதம் மற்றும் இடிமின்னலுடன் கூடிய மழை.',
    favourabilityLevel: 'Moderate',
    favourabilitySummaryEn: 'Thunderstorm showers and overcast days create humid leaf conditions. Regular crop scouting is recommended.',
    favourabilitySummaryTa: 'இடிமழை மற்றும் மேகமூட்டம் இலை ஈரப்பதத்தை அதிகரிக்கும். பயிரைத் தொடர்ந்து கண்காணிப்பது நல்லது.',
    keyObservationsEn: [
      'New small brown spots with yellow halos on middle foliage (Leaf Spot pattern)',
      'Yellow-brown spots coalescing into patches (Leaf Blotch pattern)',
      'Aphid activity underneath younger expanding leaves'
    ],
    keyObservationsTa: [
      'நடு இலைகளில் மஞ்சள் வளையத்துடன் கூடிய பழுப்பு நிற இலைப்புள்ளி அறிகுறிகள்',
      'இலையின் மேற்பரப்பில் தோன்றும் இலைக்கருகல் புள்ளிகள்',
      'இளங்குருத்துகளின் அடியில் அசுவினி பூச்சிகள்'
    ],
    actionStepsEn: [
      'Scout the field weekly for early leaf spot lesions.',
      'Maintain clear drainage channels after thunderstorm showers.',
      'Check suspicious leaves immediately using Check Leaf.'
    ],
    actionStepsTa: [
      'வாரந்தோறும் வயலை உற்று நோக்கி இலைப்புள்ளி அறிகுறிகளைக் கண்காணிக்கவும்.',
      'இடிமழைக்குப் பின் வாய்க்கால்களில் நீர் தேங்காமல் உடனடியாக வடிக்கவும்.',
      'அசாதாரண இலைகளை "இலையை சரிபார்" மூலம் உடனடியாக சரிபார்க்கவும்.'
    ],
    sourceAttribution: 'TNAU CPPS Agromet Advisory & ICAR-AICRPS Reports (SRC-01, SRC-02)'
  },
  {
    monthIndex: 9, // October
    monthNameEn: 'October',
    monthNameTa: 'ஐப்பசி (அக்டோபர்)',
    seasonNameEn: 'Northeast Monsoon Onset',
    seasonNameTa: 'வடகிழக்கு பருவமழை தொடக்கம்',
    typicalWeatherSummaryEn: 'Frequent heavy rainfall, overcast skies, and high relative humidity (>85%).',
    typicalWeatherSummaryTa: 'தொடர் கனமழை, மேகமூட்டமான வானம் மற்றும் மிக அதிக ஈரப்பதம் (>85%).',
    favourabilityLevel: 'High',
    favourabilitySummaryEn: 'Prolonged leaf wetness and high moisture create conditions that may favour foliar fungal diseases like Leaf Spot and Blotch.',
    favourabilitySummaryTa: 'தொடர் இலை ஈரப்பதம் மற்றும் அதிக மழை இலைப்புள்ளி மற்றும் இலைக்கருகல் போன்ற பூஞ்சாண நோய்கள் பரவ சாதகமாக அமையலாம்.',
    keyObservationsEn: [
      'Rapid enlargement of brown spots with concentric rings on foliage',
      'Water stagnation in field furrows or depressions',
      'Clustered yellowing spreading across neighboring plants'
    ],
    keyObservationsTa: [
      'இலைகளில் புள்ளிகள் வேகமாகப் பெரிதாகி வளையங்களாக மாறுதல்',
      'பாத்திகளில் அல்லது பள்ளங்களில் தண்ணீர் தேங்கி நிற்றல்',
      'அருகருகே உள்ள செடிகளுக்கு நோய் அறிகுறிகள் பரவுதல்'
    ],
    actionStepsEn: [
      'Check and clear furrow drainage immediately after every rainfall.',
      'Avoid walking heavily through wet crop canopies to prevent spreading fungal spores.',
      'If spots spread or enlarge, capture a clear photo using Check Leaf and review Recommendations.'
    ],
    actionStepsTa: [
      'ஒவ்வொரு மழைக்குப் பிறகும் வாய்க்கால்களைச் சரிபார்த்து தண்ணீரை உடனடியாக வடிக்கவும்.',
      'ஈரமான பயிர்களுக்குள் நடப்பதைத் தவிர்த்து பூஞ்சாண வித்துக்கள் பரவுவதைத் தடுக்கவும்.',
      'புள்ளிகள் பரவினால் "இலையை சரிபார்" மூலம் படம் எடுத்து "பரிந்துரைகள்" பக்கத்தில் ஆலோசனையைப் பெறவும்.'
    ],
    sourceAttribution: 'TNAU CPPS Disease Forecast Bulletin & IISR Epidemiology (SRC-01, SRC-04)'
  },
  {
    monthIndex: 10, // November
    monthNameEn: 'November',
    monthNameTa: 'கார்த்திகை (நவம்பர்)',
    seasonNameEn: 'Peak Northeast Monsoon',
    seasonNameTa: 'தீவிர வடகிழக்கு பருவமழை பருவம்',
    typicalWeatherSummaryEn: 'Continuous monsoon showers, overcast conditions, cool nights, and dense morning fog/dew.',
    typicalWeatherSummaryTa: 'தொடர் பருவமழை, மேகமூட்டம், குளிர்ந்த இரவுகள் மற்றும் காலை நேர பனிப்பொழிவு.',
    favourabilityLevel: 'High',
    favourabilitySummaryEn: 'High humidity and long leaf wetness duration maintain elevated favourability for foliar diseases.',
    favourabilitySummaryTa: 'அதிக ஈரப்பதம் மற்றும் நீண்ட நேர இலை ஈரப்பதம் காரணமாக இலை நோய்கள் பரவும் வாய்ப்பு அதிகம் உள்ளது.',
    keyObservationsEn: [
      'Leaf spot lesions merging and causing partial leaf drying',
      'Upper canopy leaves showing new lesions',
      'Furrow waterlogging after cyclone/monsoon depressions'
    ],
    keyObservationsTa: [
      'இலைப்புள்ளிகள் ஒன்றுசேர்ந்து இலைகள் காய்ந்து போகுதல்',
      'மேல் இலைகளிலும் புதிய புள்ளிகள் தோன்றுதல்',
      'புயல் அல்லது கனமழைக்குப் பின் பாத்திகளில் நீர் தேங்குதல்'
    ],
    actionStepsEn: [
      'Ensure uninterrupted drainage to prevent rhizome saturation and root suffocation.',
      'Inspect upper leaves weekly for new infections.',
      'Capture suspicious leaf specimens using Check Leaf for diagnostic verification.'
    ],
    actionStepsTa: [
      'வேர் அழுகலைத் தடுக்க பாத்திகளில் நீர் தேங்காமல் முழுமையாக வடியச் செய்யவும்.',
      'வாரந்தோறும் மேல் இலைகளை ஆய்வு செய்து புதிய பாதிப்புகளைக் கண்காணிக்கவும்.',
      'சந்தேகமான இலைகளை "இலையை சரிபார்" மூலம் படம் எடுத்து சரிபார்க்கவும்.'
    ],
    sourceAttribution: 'TNAU CPPS Agromet Surveillance (SRC-01)'
  },
  {
    monthIndex: 11, // December
    monthNameEn: 'December',
    monthNameTa: 'மார்கழி (டிசம்பர்)',
    seasonNameEn: 'Late Monsoon / Winter Transition',
    seasonNameTa: 'குளிர்கால தொடக்கம் & முதிர்ச்சிப் பருவம்',
    typicalWeatherSummaryEn: 'Decreasing rainfall, cool nights with heavy morning dew, and sunny afternoons.',
    typicalWeatherSummaryTa: 'மழை குறைதல், குளிர்ந்த இரவுகள், அதிக காலைப் பனி மற்றும் மிதமான பகல் வெப்பம்.',
    favourabilityLevel: 'Moderate',
    favourabilitySummaryEn: 'Cool morning dew may keep existing spots active, but new infection spread slows down as dry weather sets in.',
    favourabilitySummaryTa: 'காலைப் பனி பழைய புள்ளிகளைத் தக்கவைக்கலாம்; மழை குறைவதால் புதிய பாதிப்புகள் பரவுவது குறையும்.',
    keyObservationsEn: [
      'Heavy morning dew on leaf surfaces lasting until mid-morning',
      'Natural beginning of lower leaf drying as crop approaches maturity',
      'Rhizome size and firmness underground'
    ],
    keyObservationsTa: [
      'காலை வேளையில் இலைகளில் நீண்ட நேரம் பனிநீர் தங்குதல்',
      'பயிர் முதிர்ச்சியை நோக்கி செல்வதால் கீழ் இலைகள் இயற்கையாக காயத் தொடங்குதல்',
      'மண்ணுக்குள் மஞ்சள் கிழங்கின் அளவு மற்றும் உறுதித்தன்மை'
    ],
    actionStepsEn: [
      'Adjust irrigation according to soil moisture levels.',
      'Do not mistake natural lower-leaf drying for acute disease attack.',
      'Maintain field cleanliness and check drainage outlets.'
    ],
    actionStepsTa: [
      'மண் ஈரப்பதத்திற்கு ஏற்ப பாசன இடைவெளியை அதிகரிக்கவும்.',
      'பயிரின் இயற்கை இலை முதிர்ச்சியை புதிய நோய் தாக்குதலாக தவறாக கருத வேண்டாம்.',
      'வயலை சுத்தமாக பராமரிக்கவும்.'
    ],
    sourceAttribution: 'TNAU CPPS Advisories & MAJ Surveys (SRC-01, SRC-04)'
  }
];

/**
 * Calculates current dynamic crop stage based on planting date and current timestamp.
 */
export function calculateDynamicCropStage(plantingDateStr: string | null, language: 'en' | 'ta' = 'en'): {
  dap: number | null;
  dapFormatted: string;
  stageName: string;
  simpleStageName: string;
  stagePhase: 'Sprouting' | 'Vegetative' | 'Rhizome Development' | 'Maturity' | 'Unavailable';
  stageDescription: string;
  developmentGuide: StageDevelopmentGuide;
} {
  if (!plantingDateStr) {
    const guide = CROP_STAGE_DEVELOPMENT_GUIDE['Unavailable'];
    return {
      dap: null,
      dapFormatted: language === 'ta' ? 'பயிர் வயது தெரியவில்லை' : 'Crop age unavailable',
      stageName: language === 'ta' ? 'நடவு தேதி பதிவு செய்யப்படவில்லை' : 'Planting date not configured',
      simpleStageName: language === 'ta' ? guide.simpleStageNameTa : guide.simpleStageNameEn,
      stagePhase: 'Unavailable',
      stageDescription: language === 'ta'
        ? 'துல்லியமான பயிர் வளர்ச்சிப் பருவத்தை அறிய உங்கள் நடவு தேதியை உள்ளிடவும்.'
        : 'Configure planting date to view dynamic Days After Planting (DAP) and stage-specific crop development.',
      developmentGuide: guide
    };
  }

  const pDate = new Date(plantingDateStr);
  if (isNaN(pDate.getTime())) {
    const guide = CROP_STAGE_DEVELOPMENT_GUIDE['Unavailable'];
    return {
      dap: null,
      dapFormatted: language === 'ta' ? 'பயிர் வயது தெரியவில்லை' : 'Crop age unavailable',
      stageName: language === 'ta' ? 'தவறான தேதி' : 'Invalid Date',
      simpleStageName: language === 'ta' ? guide.simpleStageNameTa : guide.simpleStageNameEn,
      stagePhase: 'Unavailable',
      stageDescription: '',
      developmentGuide: guide
    };
  }

  const now = new Date();
  const diffTime = now.getTime() - pDate.getTime();
  const dap = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  if (dap < 45) {
    const guide = CROP_STAGE_DEVELOPMENT_GUIDE['Sprouting'];
    return {
      dap,
      dapFormatted: `${dap} DAP (${language === 'ta' ? 'நாட்கள்' : 'days'})`,
      stageName: language === 'ta' ? 'ஆரம்ப முளைப்புப் பருவம் (0–45 DAP)' : 'Early Growth & Emergence (0–45 DAP)',
      simpleStageName: language === 'ta' ? guide.simpleStageNameTa : guide.simpleStageNameEn,
      stagePhase: 'Sprouting',
      stageDescription: language === 'ta' ? guide.whatNormallyHappensTa : guide.whatNormallyHappensEn,
      developmentGuide: guide
    };
  } else if (dap <= 105) {
    const guide = CROP_STAGE_DEVELOPMENT_GUIDE['Vegetative'];
    return {
      dap,
      dapFormatted: `${dap} DAP (${language === 'ta' ? 'நாட்கள்' : 'days'})`,
      stageName: language === 'ta' ? 'தீவிர இலை வளர்ச்சிப் பருவம் (46–105 DAP)' : 'Active Vegetative Growth (46–105 DAP)',
      simpleStageName: language === 'ta' ? guide.simpleStageNameTa : guide.simpleStageNameEn,
      stagePhase: 'Vegetative',
      stageDescription: language === 'ta' ? guide.whatNormallyHappensTa : guide.whatNormallyHappensEn,
      developmentGuide: guide
    };
  } else if (dap <= 180) {
    const guide = CROP_STAGE_DEVELOPMENT_GUIDE['Rhizome Development'];
    return {
      dap,
      dapFormatted: `${dap} DAP (${language === 'ta' ? 'நாட்கள்' : 'days'})`,
      stageName: language === 'ta' ? 'கிழங்கு பெருக்கும் பருவம் (106–180 DAP)' : 'Rhizome Development & Bulking (106–180 DAP)',
      simpleStageName: language === 'ta' ? guide.simpleStageNameTa : guide.simpleStageNameEn,
      stagePhase: 'Rhizome Development',
      stageDescription: language === 'ta' ? guide.whatNormallyHappensTa : guide.whatNormallyHappensEn,
      developmentGuide: guide
    };
  } else {
    const guide = CROP_STAGE_DEVELOPMENT_GUIDE['Maturity'];
    return {
      dap,
      dapFormatted: `${dap} DAP (${language === 'ta' ? 'நாட்கள்' : 'days'})`,
      stageName: language === 'ta' ? 'முதிர்ச்சி & இயற்கை காய்வுப் பருவம் (>180 DAP)' : 'Crop Maturity & Pre-Harvest (>180 DAP)',
      simpleStageName: language === 'ta' ? guide.simpleStageNameTa : guide.simpleStageNameEn,
      stagePhase: 'Maturity',
      stageDescription: language === 'ta' ? guide.whatNormallyHappensTa : guide.whatNormallyHappensEn,
      developmentGuide: guide
    };
  }
}
