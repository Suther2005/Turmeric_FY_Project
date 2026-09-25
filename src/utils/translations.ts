/**
 * TurmeriCare AI - Comprehensive Tamil & English Agricultural Translation Dictionary
 * Specifically tailored for Tamil Nadu Turmeric (Curcuma longa) Farmers & Agronomists.
 */

export type Language = 'ta' | 'en';

export const TRANSLATIONS = {
  // Navigation
  nav: {
    home: { en: 'Home', ta: 'முகப்பு' },
    checkLeaf: { en: 'Scan Leaf', ta: 'இலையை ஸ்கேன் செய்' },
    weatherAndRisk: { en: 'Weather & Risk', ta: 'வானிலை & அபாயம்' },
    fieldConditions: { en: 'Field Check', ta: 'கள ஆய்வு' },
    myField: { en: 'My Field', ta: 'என் வயல்' },
    dashboard: { en: 'Dashboard', ta: 'முகப்பு' },
    diseaseDetection: { en: 'Scan Leaf', ta: 'இலையை ஸ்கேன் செய்' },
    cropRisk: { en: 'Combined Crop Risk', ta: 'பயிர் அபாய நிலை' },
    recommendations: { en: 'Advice', ta: 'ஆலோசனை' },
    history: { en: 'History', ta: 'முந்தைய பதிவுகள்' },
    analytics: { en: 'Dataset Analysis', ta: 'தரவுத்தொகுப்பு பகுப்பாய்வு' },
    modelPerformance: { en: 'Model Comparison', ta: 'மாதிரி ஒப்பீடு' },
    historicalValidation: { en: 'Historical Validation', ta: 'வரலாற்று சரிபார்ப்பு' },
    farmerServices: { en: 'Farmer Services', ta: 'விவசாய சேவைகள்' },
    researchAndAnalytics: { en: 'Research & Analytics', ta: 'ஆராய்ச்சி & பகுப்பாய்வு' },
    advancedResearch: { en: 'Advanced / Research', ta: 'ஆராய்ச்சி & விவரங்கள்' },
    support: { en: 'Support', ta: 'உதவி' },
    overview: { en: 'Project Overview', ta: 'திட்டக் கண்ணோட்டம்' },
    tamilNaduAgri: { en: 'TN Agri Support', ta: 'தமிழ்நாடு வேளாண்மை' },
    active: { en: 'Active', ta: 'செயலில் உள்ளது' },
    tagline: {
      en: 'Turmeric foliar pathology & environmental advisory decision support.',
      ta: 'மஞ்சள் பயிர் பாதுகாப்பு & சுற்றுச்சூழல் வழிகாட்டுதல் முடிவு ஆதரவு.',
    },
  },

  // Disease Names (Bilingual with Tamil natural terms)
  diseases: {
    Blotch: {
      en: 'Leaf Blotch',
      ta: 'இலைக்கருகல் நோய் (Blotch)',
      short: { en: 'Blotch', ta: 'இலைக்கருகல்' },
      desc: {
        en: 'Leaf Blotch is associated with Taphrina maculans and can cause brown necrotic patches.',
        ta: 'இலைக்கருகல் நோய் Taphrina maculans உடன் தொடர்புடையது; இலைகளில் பழுப்பு நிற பாதிக்கப்பட்ட பகுதிகள் தோன்றலாம்.',
      },
    },
    'Leaf Spot': {
      en: 'Leaf Spot',
      ta: 'இலைப்புள்ளி நோய் (Leaf Spot)',
      short: { en: 'Leaf Spot', ta: 'இலைப்புள்ளி' },
      desc: {
        en: 'Leaf Spot is associated with Colletotrichum capsici and can cause circular spots with yellow halo rings.',
        ta: 'இலைப்புள்ளி நோய் Colletotrichum capsici உடன் தொடர்புடையது; இலைகளில் வட்ட வடிவ புள்ளிகள் மற்றும் மஞ்சள் வளையங்கள் தோன்றலாம்.',
      },
    },
    Aphids: {
      en: 'Aphids Infestation',
      ta: 'அசுவினி பூச்சி தாக்குதல் (Aphids)',
      short: { en: 'Aphids', ta: 'அசுவினி' },
      desc: {
        en: 'Aphids infestation is associated with Aphis gossypii; sap-sucking pests may cluster under leaves and cause curling.',
        ta: 'அசுவினி பூச்சி தாக்குதல் Aphis gossypii உடன் தொடர்புடையது; இலைகளின் அடியில் சாறு உறிஞ்சும் பூச்சிகள் கூடி இலையை சுருங்கச் செய்யலாம்.',
      },
    },
    Healthy: {
      en: 'Healthy Foliage',
      ta: 'ஆரோக்கியமான பயிர் (Healthy)',
      short: { en: 'Healthy', ta: 'ஆரோக்கியமானது' },
      desc: {
        en: 'Vibrant green foliage with no visible pathogen symptoms observed by the visual model.',
        ta: 'எந்தவித நோய் தாக்கமும் இன்றி செழிப்பாக வளரும் ஆரோக்கியமான இலைகள் (மாடல் கணிப்பு).',
      },
    },
  },

  // Status & Risk Levels
  status: {
    modelOutput: { en: 'MODEL OUTPUT', ta: 'மாடல் வெளியீடு' },
    modelPrediction: { en: 'Model Prediction', ta: 'மாடல் கணிப்பு' },
    modelPredictionAvailable: { en: 'Model Prediction Available', ta: 'மாடல் கணிப்பு கிடைக்கிறது' },
    confidenceDisclaimer: {
      en: "Confidence shown here is the model's prediction score, not real-world diagnostic accuracy.",
      ta: 'இது மாடலின் கணிப்பு நம்பிக்கை மதிப்பு; உண்மையான களத் துல்லியத்தை குறிக்காது.',
    },
    technicalDetails: { en: 'Technical Details', ta: 'தொழில்நுட்ப விவரங்கள்' },
    researchTools: { en: 'Advanced / Research Reference Samples', ta: 'ஆராய்ச்சி & மாதிரி தேர்வுக் கருவிகள்' },
    diseaseDetected: { en: 'Disease Symptoms Detected (Model Prediction)', ta: 'நோய் அறிகுறிகள் கண்டறியப்பட்டது (மாடல் கணிப்பு)' },
    healthyCrop: { en: 'Healthy Foliage (Model Prediction)', ta: 'ஆரோக்கியமான இலைகள் (மாடல் கணிப்பு)' },
    highRisk: { en: 'High Risk', ta: 'அதிக அபாயம்' },
    moderateRisk: { en: 'Moderate Risk', ta: 'மிதமான அபாயம்' },
    lowRisk: { en: 'Low Risk', ta: 'குறைந்த அபாயம்' },
    high: { en: 'High', ta: 'அதிகம்' },
    moderate: { en: 'Moderate', ta: 'மிதமானது' },
    low: { en: 'Low', ta: 'குறைவானது' },
    confidence: { en: 'Model Confidence', ta: 'மாடல் நம்பிக்கை மதிப்பு' },
    diagnosticConfidence: { en: 'Model Confidence', ta: 'மாடல் நம்பிக்கை மதிப்பு' },
    cropHealth: { en: 'Crop Health Status', ta: 'பயிர் நலம் மற்றும் நிலை' },
    overallRisk: { en: 'Overall Crop Risk', ta: 'மொத்த பயிர் அபாய நிலை' },
    environmentalRisk: { en: 'Environmental Risk', ta: 'சுற்றுச்சூழல் அபாயம்' },
    whatToDoNow: { en: 'What should I do now?', ta: 'இப்போது என்ன செய்ய வேண்டும்?' },
    actionSteps: { en: 'Action Steps', ta: 'செய்ய வேண்டிய பணிகள்' },
    moreDetails: { en: 'Technical Details', ta: 'தொழில்நுட்ப விவரங்கள்' },
    hideDetails: { en: 'Hide Technical Details', ta: 'விவரங்களை மறை' },
    sensorConnected: { en: 'IoT Sensor Interface', ta: 'சென்சார் கட்டமைப்பு' },
    manualMode: { en: 'Manual Entry Mode', ta: 'கையேடு உள்ளீட்டு முறை' },
    liveWeatherSource: { en: '🌦️ Live Weather (Open-Meteo)', ta: '🌦️ நேரலை வானிலை (Open-Meteo)' },
    liveWeather: { en: 'Live Weather', ta: 'நேரலை வானிலை' },
    locationSelector: { en: 'Field Location / District', ta: 'கள அமைவிடம் / மாவட்டம்' },
    fetchingWeather: { en: 'Fetching 14-day live weather data...', ta: '14 நாள் நேரலை வானிலை தரவு பெறப்படுகிறது...' },
    weatherFetchError: { en: 'Weather data unavailable from Open-Meteo API', ta: 'Open-Meteo API-யிலிருந்து வானிலை தரவு கிடைக்கவில்லை' },
    manualFieldObservations: { en: 'Manual-Only Field Observations', ta: 'கையேடு கள அளவீடுகள் (நேரடி ஆய்வு)' },
    manualObservationsDesc: {
      en: 'In-field measurements requiring direct scouting or soil probes (not supplied by atmospheric weather API).',
      ta: 'நேரடி கள ஆய்வு அல்லது மண் கருவிகள் மூலம் அளவிடப்படும் அளவீடுகள் (வளிமண்டல வானிலை மாதிரியில் கிடைக்காது).',
    },
    liveSensor: { en: '🟢 Live Sensor Data (Awaiting Hardware)', ta: '🟢 நேரலை சென்சார் தரவு (இணைப்பு நிலுவை)' },
    manualField: { en: '⚡ Manual Field Input', ta: '⚡ கையேடு கள உள்ளீடு' },
    reanalysisSource: { en: '🌐 Historical Reanalysis (ERA5)', ta: '🌐 வரலாற்று வானிலை தரவு (ERA5)' },
    fieldSample: { en: 'Field Sample:', ta: 'கள மாதிரி:' },
    lastUpdated: { en: 'Last Updated', ta: 'கடைசியாக புதுப்பிக்கப்பட்டது' },
    recalculate: { en: 'Recalculate', ta: 'மீண்டும் கணக்கிடு' },
    processing: { en: 'Analyzing...', ta: 'ஆய்வு நடைபெறுகிறது...' },
    scientificNotice: { en: 'Research Baseline • Not independently field validated', ta: 'ஆராய்ச்சி அடிப்படை • தனித்த களச் சரிபார்ப்பு இன்னும் செய்யப்படவில்லை' },
    retrospectiveNotice: { en: 'RETROSPECTIVE CONSISTENCY ONLY', ta: 'கடந்த கால வரலாற்று சரிபார்ப்பு மட்டுமே' },
    insufficientTemporal: { en: 'Insufficient temporal data for 14-day exposure assessment.', ta: '14 நாள் சுற்றுச்சூழல் மதிப்பீட்டிற்கு போதுமான காலவரிசை தரவு இல்லை.' },
    manualTemporalNote: {
      en: 'Manual sliders evaluate instant candidate microclimates. True 14-day cumulative exposure calculations require 336 consecutive hourly records (available via Historical Reanalysis presets).',
      ta: 'கையேடு அளவீடுகள் உடனடி கள சூழலை மட்டுமே மதிப்பிடுகின்றன. உண்மையான 14 நாள் தொடர் வெளிப்பாடு கணக்கீட்டிற்கு 336 மணி நேர தொடர் தரவு அவசியம் (வரலாற்று தரவு முறையில் கிடைக்கிறது).',
    },
    dewProxy: { en: 'Dew / Condensation Proxy', ta: 'பனிப்பொழிவு / ஒடுக்க மதிப்பீடு (Dew Proxy)' },
    uploadPrompt: {
      en: 'Upload or capture a turmeric leaf photo to begin analysis.',
      ta: 'ஆய்வைத் தொடங்க மஞ்சள் இலைப் புகைப்படத்தைப் பதிவேற்றவும் அல்லது படம் எடுக்கவும்.',
    },
    noAnalysisYet: {
      en: 'No analysis yet',
      ta: 'இன்னும் ஆய்வு செய்யப்படவில்லை',
    },
    awaitingAnalysis: {
      en: 'Awaiting Leaf Photo Analysis',
      ta: 'இலைப்பட ஆய்வுக்காக காத்திருக்கிறது',
    },
    awaitingUpload: {
      en: 'Awaiting Leaf Photo Upload',
      ta: 'இலைப்படம் பதிவேற்றத்திற்காக காத்திருக்கிறது',
    },
    fieldNotSelected: {
      en: 'FIELD: Not selected',
      ta: 'வயல்: தேர்வு செய்யப்படவில்லை',
    },
    researchReferenceSample: {
      en: 'Research Reference Sample',
      ta: 'ஆராய்ச்சி குறிப்பு மாதிரி',
    },
    farmerFieldSpecimen: {
      en: 'Farmer Field Specimen',
      ta: 'விவசாயி கள இலைப்படம்',
    },
    selectLeafFirst: {
      en: 'Please choose or capture a leaf photo first.',
      ta: 'முதலில் ஒரு இலைப்படத்தைத் தேர்ந்தெடுக்கவும் அல்லது படம் எடுக்கவும்.',
    },
    currentFieldConditions: {
      en: 'Current Field Conditions',
      ta: 'தற்போதைய வயல் நிலை',
    },
    currentConditionAssessment: {
      en: 'Current-condition assessment',
      ta: 'தற்போதைய நிலை மதிப்பீடு',
    },
    currentConditionHeuristic: {
      en: 'Current-condition heuristic — not a 14-day exposure assessment',
      ta: 'தற்போதைய நிலை மதிப்பீடு — 14 நாள் தொடர் மதிப்பீடு அல்ல',
    },
    temporalAssessmentUnavailable: {
      en: '14-day assessment unavailable',
      ta: '14 நாள் மதிப்பீட்டிற்கு தரவு போதவில்லை',
    },
    manualTemporalWarning: {
      en: 'These values represent current field observations. A 14-day exposure assessment requires an actual recorded time series.',
      ta: 'இந்த மதிப்புகள் தற்போதைய வயல் நிலைகளை குறிக்கின்றன. 14 நாள் சுற்றுச்சூழல் மதிப்பீட்டிற்கு உண்மையான காலவரிசைத் தரவு தேவை.',
    },
    fourteenDayHistoricalAssessment: {
      en: '14-Day Historical Exposure Assessment',
      ta: '14-நாள் வரலாற்று வெளிப்பாடு மதிப்பீடு',
    },
    historicalReanalysisSource: {
      en: 'Historical Meteorological Reanalysis',
      ta: 'வரலாற்று வானிலை தரவு (ERA5)',
    },
  },

  // Environmental Parameters
  env: {
    temperature: { en: 'Temperature', ta: 'வெப்பநிலை', unit: '°C' },
    humidity: { en: 'Relative Humidity', ta: 'காற்றின் ஈரப்பதம்', unit: '%' },
    rainfall: { en: 'Rainfall', ta: 'மழைப்பொழிவு', unit: 'mm' },
    soilMoisture: { en: 'Soil Moisture', ta: 'மண் ஈரப்பதம்', unit: '%' },
    soilPh: { en: 'Soil pH', ta: 'மண் கார-அமிலத்தன்மை', unit: 'pH' },
    leafWetness: { en: 'Dew / Condensation Proxy', ta: 'பனிப்பொழிவு / ஒடுக்க மதிப்பீடு (Dew Proxy)', unit: '%' },
    sunlightHours: { en: 'Sunlight Duration', ta: 'சூரிய ஒளி நேரம்', unit: 'hrs' },
    windSpeed: { en: 'Wind Speed', ta: 'காற்றின் வேகம்', unit: 'km/h' },
  },

  // Seasonal Intelligence (Tamil Nadu Turmeric Cycle)
  season: {
    title: { en: 'Seasonal Crop Intelligence', ta: 'பருவக்கால பயிர் விழிப்புணர்வு' },
    currentSeason: { en: 'Northeast Monsoon (Oct – Dec)', ta: 'வடகிழக்கு பருவமழைக்காலம் (ஐப்பசி – மார்கழி)' },
    cropPhase: { en: 'Rhizome Development & Vegetative Phase', ta: 'மஞ்சள் கிழங்கு பெருக்கும் மற்றும் வளர்ச்சிப் பருவம்' },
    riskNote: {
      en: 'Conditions during this period may be favorable for disease development; monitor the crop and environmental conditions.',
      ta: 'இக்காலத்தில் நிலவும் சூழல் நோய் பரவலுக்கு சாதகமாக அமையலாம்; பயிர் மற்றும் வானிலை மாற்றங்களை தொடர்ந்து கண்காணிக்கவும்.',
    },
    advisory: {
      en: 'Ensure proper trench drainage to prevent root waterlogging. Scout foliage weekly.',
      ta: 'பாத்திகளில் தண்ணீர் தேங்காமல் வடித்துவிட வடிகால் அமைக்கவும். வாரந்தோறும் இலைகளை கண்காணிக்கவும்.',
    },
  },

  // Farmer Actions & Recommendations
  recommendations: {
    title: { en: 'Recommended Field Actions', ta: 'விவசாயிகளுக்கான களப் பரிந்துரைகள்' },
    subtitle: {
      en: 'Actionable guidance tailored to your visual disease diagnosis and microclimate conditions.',
      ta: 'உங்கள் பயிர் நோய் மற்றும் தற்போதைய வானிலை சூழலுக்கேற்ற எளிய வழிகாட்டுதல்கள்.',
    },
    safetyDisclaimer: {
      en: 'Advisory Notice: These recommendations are decision-support guidelines. For chemical management, follow TNAU / ICAR-IISR / local agricultural extension and product-label guidance.',
      ta: 'அறிவுறுத்தல்: இந்த பரிந்துரைகள் விவசாய முடிவெடுக்கும் வழிகாட்டுதலுக்காக மட்டுமே. பயிர் பாதுகாப்பு மேலாண்மைக்கு தஞ்சை/தமிழ்நாடு வேளாண்மை பல்கலைக்கழகம் (TNAU), ICAR-IISR, உள்ளூர் வேளாண் விரிவாக்க அலுவலர்கள் மற்றும் தயாரிப்பு லேபிள் வழிகாட்டுதலைப் பின்பற்றவும்.',
    },
    items: [
      {
        id: 'rec-1',
        category: { en: 'HIGH HUMIDITY', ta: 'அதிக ஈரப்பதம்' },
        riskLevel: { en: 'High', ta: 'அதிகம்' },
        priority: { en: 'High', ta: 'முதன்மை' },
        title: {
          en: 'Relative Humidity Exceeds 75%',
          ta: 'காற்றின் ஈரப்பதம் 75% மேல் உள்ளது',
        },
        description: {
          en: 'Monitor crop conditions closely and improve airflow around plants where appropriate.',
          ta: 'அதிக ஈரப்பதம் பூஞ்சை காளான் பரவ சாதகமானது. பயிர்களை கூர்ந்து கவனித்து காற்றோட்டத்தை அதிகரிக்கவும்.',
        },
        actionSteps: [
          {
            en: 'Increase row aeration by trimming dead lower canopy foliage',
            ta: 'கீழ்மட்ட காய்ந்த இலைகளை அகற்றி பாத்திகளுக்கு இடையே காற்றோட்டம் ஏற்படுத்தவும்',
          },
          {
            en: 'Avoid flood irrigation during late afternoons or overcast days',
            ta: 'மாலை நேரங்களிலும் மேகமூட்டமான நாட்களிலும் அளவுக்கு அதிகமான பாசனத்தைத் தவிர்க்கவும்',
          },
          {
            en: 'Schedule preventive bio-control spray if relative humidity remains elevated for >48 hours',
            ta: 'ஈரப்பதம் 48 மணி நேரத்திற்கு மேல் நீடித்தால் உயிரியல் பூஞ்சாண தடுப்பு தெளிப்பு மேற்கொள்ளவும்',
          },
        ],
        timing: {
          en: 'Immediate (Within 24 hours)',
          ta: 'உடனடியாக (24 மணி நேரத்திற்குள்)',
        },
      },
      {
        id: 'rec-2',
        category: { en: 'HIGH DEW / CONDENSATION PROXY', ta: 'அதிக பனிப்பொழிவு / ஒடுக்க சூழல்' },
        riskLevel: { en: 'High', ta: 'அதிகம்' },
        priority: { en: 'High', ta: 'முதன்மை' },
        title: {
          en: 'Persistent Dew Proxy Elevation > 70%',
          ta: 'நீடித்த பனிப்பொழிவு / ஒடுக்க சூழல் > 70%',
        },
        description: {
          en: 'Persistent atmospheric dew proxy conditions may increase fungal incubation risk. Inspect leaves regularly.',
          ta: 'இலைகளில் பனிநீர் மற்றும் ஈரப்பதம் தொடர்ந்து தங்குவது பூஞ்சை நோய்கள் வளர சாதகமான சூழலை உருவாக்கலாம்.',
        },
        actionSteps: [
          {
            en: 'Switch strictly to morning drip or furrow irrigation so sun dries canopy by midday',
            ta: 'காலை நேரங்களில் மட்டும் சொட்டுநீர் பாசனம் செய்து, மதியத்திற்குள் இலைகள் காய்ந்துவிட வகை செய்யவும்',
          },
          {
            en: 'Inspect undersides of central leaves for early fungal mycelium',
            ta: 'நடு இலைகளின் அடிப்பகுதியில் ஆரம்பக்கட்ட பூஞ்சை படலங்கள் உள்ளதா என சோதிக்கவும்',
          },
          {
            en: 'Maintain adequate spacing between turmeric mounds (minimum 30–45 cm)',
            ta: 'மஞ்சள் பாத்திகளுக்கு இடையே போதுமான இடைவெளியை (30–45 செ.மீ) பராமரிக்கவும்',
          },
        ],
        timing: {
          en: 'Immediate',
          ta: 'உடனடியாக',
        },
      },
      {
        id: 'rec-3',
        category: { en: 'RECENT RAINFALL', ta: 'மழைப்பொழிவு சூழல்' },
        riskLevel: { en: 'Moderate', ta: 'மிதமானது' },
        priority: { en: 'Medium', ta: 'நடுத்தரம்' },
        title: {
          en: 'Post-Rainfall Disease Scouting',
          ta: 'மழைக்குப் பிந்தைய பயிர் கள ஆய்வு',
        },
        description: {
          en: 'Monitor plants after rainfall for emerging symptoms.',
          ta: 'மழைக்குப் பிறகு மண்ணில் தண்ணீர் தேங்காமல் வடித்துவிட்டு, புதிய இலைப்புள்ளிகளை கண்காணிக்கவும்.',
        },
        actionSteps: [
          {
            en: 'Check field drainage channels to prevent waterlogging around turmeric rhizomes',
            ta: 'மஞ்சள் கிழங்கு அழுகலைத் தடுக்க வயல் வடிகால் வாய்க்கால்களை உடனே சீரமைக்கவும்',
          },
          {
            en: 'Survey 20 representative plants across edge and center plots for leaf spot halos',
            ta: 'வரப்பு மற்றும் உள்பாத்திகளில் உள்ள 20 செடிகளில் இலைப்புள்ளி வளையங்கள் உள்ளதா என ஆய்வு செய்யவும்',
          },
          {
            en: 'Apply potassium silicate or organic compost tea to fortify leaf epidermis',
            ta: 'இலைகளின் நோய் எதிர்ப்புத் திறனை அதிகரிக்க பொட்டாசியம் சிலிகேட் அல்லது பஞ்சகவ்யா தெளிக்கவும்',
          },
        ],
        timing: {
          en: 'Within 48 hours post-rain',
          ta: 'மழை நின்ற 48 மணி நேரத்திற்குள்',
        },
      },
      {
        id: 'rec-4',
        category: { en: 'DISEASE DETECTED', ta: 'நோய் அறிகுறி கண்டறிதல்' },
        riskLevel: { en: 'High', ta: 'அதிகம்' },
        priority: { en: 'High', ta: 'முதன்மை' },
        title: {
          en: 'Visual Disease Symptoms Detected',
          ta: 'இலைகளில் நோய் அறிகுறிகள் கண்டறியப்பட்டது',
        },
        description: {
          en: 'Inspect nearby plants and follow local agricultural extension disease-management practices.',
          ta: 'அறிகுறிகள் தென்பட்ட செடிகளை கவனித்து, உள்ளூர் வேளாண் விரிவாக்க பாதுகாப்பு நடவடிக்கைகளை மேற்கொள்ளவும்.',
        },
        actionSteps: [
          {
            en: 'Quarantine or cleanly excise severely infected leaves and dispose off-site',
            ta: 'அதிகம் பாதிக்கப்பட்ட இலைகளை வெட்டி எடுத்து பாத்திக்கு வெளியில் போட்டு அழிக்கவும்',
          },
          {
            en: 'Follow TNAU / ICAR-IISR and product-label guidelines for copper oxychloride or approved foliar sprays',
            ta: 'தமிழ்நாடு வேளாண் பல்கலைக்கழகம் (TNAU) மற்றும் தயாரிப்பு லேபிள் வழிகாட்டுதலின்படி காப்பர் ஆக்ஸிகுளோரைடு அல்லது பரிந்துரைக்கப்பட்ட தெளிப்புகளைப் பயன்படுத்தவும்',
          },
          {
            en: 'Record GPS coordinates of hotspot for targeted follow-up analysis in 5 days',
            ta: 'நோய் தாக்கிய பகுதியை குறித்து வைத்து 5 நாட்களுக்குப் பின் மீண்டும் மறு ஆய்வு செய்யவும்',
          },
        ],
        timing: {
          en: 'Urgent (Same day)',
          ta: 'மிக அவசரம் (அன்றே செயல்படுத்துக)',
        },
      },
      {
        id: 'rec-5',
        category: { en: 'PREVENTATIVE CARE', ta: 'முன்னெச்சரிக்கை பாதுகாப்பு' },
        riskLevel: { en: 'Low', ta: 'குறைவானது' },
        priority: { en: 'Low', ta: 'வழக்கமானது' },
        title: {
          en: 'Nutrient & Soil Maintenance',
          ta: 'ஊட்டச்சத்து மற்றும் மண் மேலாண்மை',
        },
        description: {
          en: 'Maintain healthy rhizome soil biology and balanced nitrogen-potassium ratios.',
          ta: 'மஞ்சள் கிழங்கு திடமாக வளரவும் பூச்சி நோய்களைத் தாங்கவும் மண்ணின் நலத்தை பாதுகாக்கவும்.',
        },
        actionSteps: [
          {
            en: 'Apply neem cake at 250 kg/ha to deter soil-borne nematodes and pathogens',
            ta: 'நூற்புழுக்கள் மற்றும் மண் பூஞ்சைகளைத் தடுக்க ஹெக்டேருக்கு 250 கிலோ வேப்பம்பிண்ணாக்கு இடவும்',
          },
          {
            en: 'Maintain soil pH between 6.0 and 6.8 for optimal micronutrient uptake',
            ta: 'நுண்ணூட்டச்சத்துக்கள் எளிதில் கிடைக்க மண் pH அளவை 6.0 - 6.8 வரை பராமரிக்கவும்',
          },
          {
            en: 'Keep companion plantings of marigold to suppress insect vector reservoirs',
            ta: 'பூச்சிப் பெருக்கத்தைக் குறைக்க வயல் வரப்புகளில் சாமந்திச் செடிகளை ஊடுபயிராக நடவும்',
          },
        ],
        timing: {
          en: 'Routine Bi-weekly',
          ta: 'இரு வாரத்திற்கு ஒருமுறை',
        },
      },
    ],
  },

  // Common Actions & Buttons
  actions: {
    analyzeImage: { en: 'Analyze Crop Image', ta: 'படத்தை ஆய்வு செய்' },
    chooseImage: { en: 'Choose Photo / Capture', ta: 'புகைப்படம் தேர்வு செய்' },
    uploadImage: { en: 'Upload Photo', ta: 'படத்தைப் பதிவேற்று' },
    useCamera: { en: 'Use Camera', ta: 'கேமராவைப் பயன்படுத்து' },
    capturePhoto: { en: 'Capture Photo', ta: 'படம் எடு' },
    retakePhoto: { en: 'Retake Photo', ta: 'மீண்டும் படம் எடு' },
    closeCamera: { en: 'Close Camera', ta: 'கேமராவை மூடு' },
    switchCamera: { en: 'Switch Camera', ta: 'கேமராவை மாற்று' },
    cycleSample: { en: 'Test Sample Photo', ta: 'மாதிரி படம் பார்க்க' },
    saveToHistory: { en: 'Save to Farm Records', ta: 'பதிவேட்டில் சேமி' },
    proceedToRisk: { en: 'Check Field Weather Risk', ta: 'சுற்றுச்சூழல் அபாயம் பார்க்க' },
    proceedToCombined: { en: 'View Overall Crop Risk', ta: 'மொத்த அபாயம் பார்க்க' },
    viewDetails: { en: 'View Report', ta: 'முழு விவரம்' },
    exportCsv: { en: 'Export Records (CSV)', ta: 'பதிவிறக்கம் (CSV)' },
    startAnalysis: { en: 'START ANALYSIS', ta: 'ஆய்வைத் தொடங்குக' },
    exploreDashboard: { en: 'EXPLORE DASHBOARD', ta: 'முகப்பைப் பார்க்க' },
    resetDefaults: { en: 'Reset Defaults', ta: 'மீட்டமை' },
    viewFullPlan: { en: 'View Full Farm Action Plan', ta: 'அனைத்துப் பரிந்துரைகளையும் பார்க்க' },
    closeReport: { en: 'Close Report', ta: 'மூடுக' },
    printPdf: { en: 'Print / Save PDF', ta: 'அச்சிடு / PDF சேமி' },
    copySummary: { en: 'Copy Summary', ta: 'நகலெடு' },
    scanNewLeaf: { en: 'Scan New Leaf', ta: 'புதிய படம் ஆய்வு செய்' },
  },

  // Camera Capture Section
  camera: {
    title: { en: 'Live Camera Capture', ta: 'நேரலை கேமரா படம் எடுத்தல்' },
    instruction: {
      en: 'Align a single turmeric leaf in the frame with clear focus and good natural lighting.',
      ta: 'ஒரு மஞ்சள் இலையை நல்ல இயற்கை வெளிச்சத்தில் கேமரா சட்டகத்தின் நடுவில் வைத்து படம் எடுக்கவும்.',
    },
    permissionDenied: {
      en: 'Camera permission was denied. Please enable camera access in your browser settings or choose a photo to upload.',
      ta: 'கேமரா அனுமதி மறுக்கப்பட்டது. பிரவுசர் அமைப்புகளில் கேமரா அனுமதியை இயக்கவும் அல்லது இலைப்படத்தை பதிவேற்றவும்.',
    },
    notFound: {
      en: 'No camera device was detected on your device. Please use the photo upload option instead.',
      ta: 'உங்கள் சாதனத்தில் கேமரா எதுவும் கண்டறியப்படவில்லை. தயவுசெய்து பட பதிவேற்ற முறையைப் பயன்படுத்தவும்.',
    },
    notSupported: {
      en: 'Camera access is not supported by your browser. Please upload a leaf photo.',
      ta: 'உங்கள் பிரவுசரில் கேமரா வசதி ஆதரிக்கப்படவில்லை. தயவுசெய்து இலைப்படத்தை பதிவேற்றவும்.',
    },
    initError: {
      en: 'Could not access the camera. Please check camera permissions and try again.',
      ta: 'கேமராவை இயக்க முடியவில்லை. கேமரா அனுமதியை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    },
    starting: {
      en: 'Initializing camera stream...',
      ta: 'கேமரா தயாராகிறது...',
    },
    facingEnvironment: {
      en: 'Rear Camera',
      ta: 'பின் கேமரா',
    },
    facingUser: {
      en: 'Front Camera',
      ta: 'முன் கேமரா',
    },
    alignLeafTip: {
      en: 'Place one turmeric leaf inside the frame',
      ta: 'ஒரு மஞ்சள் இலையை சட்டகத்திற்குள் வைக்கவும்',
    },
    captureGuidanceTitle: {
      en: 'Capture one turmeric leaf',
      ta: 'ஒரு மஞ்சள் இலை மட்டும் தெளிவாகப் படம் எடுக்கவும்',
    },
    captureGuidanceTip1: {
      en: 'Move closer so one leaf is clearly visible.',
      ta: 'ஒரு இலையை கேமராவிற்கு அருகில் கொண்டு வாருங்கள்.',
    },
    captureGuidanceTip2: {
      en: 'Use good natural light.',
      ta: 'நல்ல இயற்கை வெளிச்சத்தைப் பயன்படுத்தவும்.',
    },
    captureGuidanceTip3: {
      en: 'Avoid whole-bush photos.',
      ta: 'முழு செடியையும் படம் எடுப்பதைத் தவிர்க்கவும்.',
    },
    oodRejectionTitle: {
      en: 'Image not suitable for diagnosis',
      ta: 'இந்தப் படம் நோய் கண்டறிதலுக்கு ஏற்றதாக இல்லை',
    },
    oodRejectionPrompt: {
      en: 'Please capture a clear, close-up photo of one turmeric leaf.',
      ta: 'ஒரு மஞ்சள் இலையின் தெளிவான அருகிலுள்ள படத்தை எடுக்கவும்.',
    },
    oodGuidanceBullet1: {
      en: 'Keep one leaf clearly inside the frame',
      ta: 'ஒரு இலையை சட்டகத்திற்குள் தெளிவாக வைக்கவும்',
    },
    oodGuidanceBullet2: {
      en: 'Move closer',
      ta: 'கேமராவை அருகில் கொண்டு செல்லவும்',
    },
    oodGuidanceBullet3: {
      en: 'Use natural light',
      ta: 'நல்ல இயற்கை வெளிச்சத்தைப் பயன்படுத்தவும்',
    },
    oodGuidanceBullet4: {
      en: 'Avoid whole-bush images',
      ta: 'முழு செடியையும் படம் எடுப்பதைத் தவிர்க்கவும்',
    },
  },

  // Model Comparison Page
  modelComparison: {
    title: { en: 'Model Architecture Benchmarking', ta: 'மாதிரி கட்டமைப்பு ஒப்பீடு' },
    subtitle: {
      en: 'Comparative architecture metrics and latency profiling for turmeric leaf pathology backbones (Developmental Benchmarks).',
      ta: 'மஞ்சள் இலை நோயியல் மாதிரிகளுக்கான கட்டமைப்பு அளவீடுகள் மற்றும் கணக்கீட்டு வேகம் (உருவாக்க நிலை ஒப்பீடு).',
    },
    badge: { en: 'Architectural Benchmarking', ta: 'கட்டமைப்பு மாதிரி ஒப்பீடு' },
    baselineNoteTitle: { en: 'Development / Placeholder Metrics — Not Validated', ta: 'உருவாக்க நிலை / மாதிரி அளவீடுகள் — இன்னும் சரிபார்க்கப்படவில்லை' },
    baselineNoteText: {
      en: 'The architecture metrics presented below represent development candidate benchmarks and reference backbones. They have not been independently validated on an external multi-season test set and should be used strictly for research documentation.',
      ta: 'கீழே கொடுக்கப்பட்டுள்ள மாதிரி அளவீடுகள் உருவாக்க நிலை ஒப்பீட்டுக்காக மட்டுமே வழங்கப்பட்டுள்ளன; இவை வெளிப்புற பல பருவ சோதனைகளில் தனித்து சரிபார்க்கப்படவில்லை மற்றும் ஆராய்ச்சி ஆவணப்படுத்துதலுக்காக மட்டுமே பயன்படுத்தப்பட வேண்டும்.',
    },
    proposedMethod: { en: 'CANDIDATE ENSEMBLE', ta: 'மாதிரி கட்டமைப்பு' },
    baselineBackbone: { en: 'Reference Backbone', ta: 'அடிப்படை மாதிரி' },
    accuracy: { en: 'BENCHMARK ACCURACY', ta: 'ஒப்பீட்டு துல்லியம்' },
    precision: { en: 'PRECISION', ta: 'துல்லியம் (Precision)' },
    recall: { en: 'RECALL', ta: 'மீட்புத்திறன் (Recall)' },
    f1Score: { en: 'F1-SCORE', ta: 'எஃப்1-மதிப்பீடு (F1)' },
    keyStrengths: { en: 'KEY CHARACTERISTICS:', ta: 'முக்கிய சிறப்புகள்:' },
    inferenceLatency: { en: 'Inference Latency:', ta: 'கணிப்பு வேகம்:' },
    params: { en: 'Params:', ta: 'அளவீடுகள்:' },
    chartTitle: { en: 'Developmental Benchmark Comparison Chart', ta: 'மாதிரி ஒப்பீட்டு வரைபடம்' },
    chartCategory: { en: 'Backbone Benchmark Metrics', ta: 'மாதிரி ஒப்பீட்டு அளவீடுகள்' },
    cohort: { en: 'Developmental Benchmark Cohort (n=200)', ta: 'ஆய்வுத் தொகுதி (n=200)' },
    models: {
      'EfficientNet-B0': {
        type: { en: 'Convolutional Feature Extractor', ta: 'கன்வல்யூஷனல் அம்சப் பிரித்தெடுப்பாளர்' },
        description: {
          en: 'Strong feature extraction & high representational capability using compound coefficient scaling.',
          ta: 'கூட்டு குணக அளவீட்டு முறையில் நுட்பமான இலை மாற்றங்களை பிரித்தெடுக்கும் திறன் கொண்டது.',
        },
        strengths: [
          { en: 'High gradient resolution for subtle necrotic lesion edges', ta: 'இலையின் நுட்பமான கருகல் ஓரங்களை அடையாளம் காணும் திறன்' },
          { en: 'Strong spatial context across varying leaf angles', ta: 'பல்வேறு கோணங்களில் எடுக்கப்படும் இலைப்படங்களை அடையாளம் காணும் திறன்' },
          { en: 'Standard backbone for plant pathology classification research', ta: 'தாவர நோயியல் ஆராய்ச்சி வகைப்பாட்டில் பயன்படுத்தப்படும் கட்டமைப்பு' },
        ],
      },
      'MobileNetV2': {
        type: { en: 'Inverted Residual Architecture', ta: 'குறைந்த நினைவக மொபைல் கட்டமைப்பு' },
        description: {
          en: 'Lightweight architecture optimized for low-latency edge deployment and rapid field inference.',
          ta: 'விவசாயிகளின் ஸ்மார்ட்போன்களில் விரைவாகவும் குறைந்த நினைவகத்திலும் செயல்படக்கூடிய இலகுரக மாதிரி.',
        },
        strengths: [
          { en: 'Low inference latency for field mobile devices', ta: 'களத்தில் உள்ள மொபைல் சாதனங்களில் விரைவான கணிப்பு வேகம்' },
          { en: 'Minimal memory footprint (14MB quantized)', ta: 'குறைந்த நினைவக பயன்பாடு (14MB quantized)' },
          { en: 'Depthwise separable convolutions for efficient edge computation', ta: 'திறமையான எட்ஜ் கணக்கீட்டு முறை' },
        ],
      },
      'Hybrid Ensemble': {
        type: { en: 'Multimodal Ensemble Candidate', ta: 'ஒருங்கிணைந்த மாதிரி கட்டமைப்பு' },
        description: {
          en: 'Experimental candidate combining convolutional predictions with contextual microclimate weights.',
          ta: 'இலைப்பட கணிப்பு மற்றும் வானிலை சூழலை இணைக்கும் பரிசோதனை மாதிரி கட்டமைப்பு.',
        },
        strengths: [
          { en: 'Equal-weighted late-fusion soft-voting ensemble combining EfficientNet-B0 and MobileNetV2 output probabilities', ta: 'EfficientNet-B0 மற்றும் MobileNetV2 மாதிரி நிகழ்தகவுகளை சம எடையில் இணைக்கும் மாதிரி தொகுப்பு' },
          { en: 'Probability-level late fusion with alpha = 0.50', ta: 'ஆல்பா = 0.50 கொண்ட நிகழ்தகவு நிலை ஒருங்கிணைப்பு' },
          { en: 'Provides calibrated probability vector to multimodal decision-support layer', ta: 'பன்முக முடிவு ஆதரவு அடுக்குக்கு நிகழ்தகவுகளை வழங்குகிறது' },
        ],
      },
    },
  },

  // Analytics Page
  analytics: {
    badge: { en: 'Telemetry & Field Aggregation', ta: 'களத் தரவு மற்றும் புள்ளிவிவரங்கள்' },
    title: { en: 'Crop Health Analytics', ta: 'பயிர் நலப் புள்ளிவிவரங்கள்' },
    subtitle: {
      en: 'Statistical distributions, multi-temporal climate correlations, and model confidence metrics.',
      ta: 'நோய் பரவல் புள்ளிவிவரங்கள், தட்பவெப்பநிலை மாற்றங்களின் தாக்கம் மற்றும் மாடல் நம்பிக்கை அளவீடுகள்.',
    },
    sevenDays: { en: '7 Days', ta: '7 நாட்கள்' },
    thirtyDays: { en: '30 Days', ta: '30 நாட்கள்' },
    allTime: { en: 'All Time', ta: 'முழுவதும்' },
    diseaseDistTitle: { en: 'Disease Class Distribution', ta: 'நோய் பரவல் விகிதம்' },
    riskDistTitle: { en: 'Risk Severity Distribution', ta: 'அபாய தீவிரத்தின் பரவல்' },
    envTrendsTitle: { en: '7-Day Microclimate Trend (Temperature vs. Relative Humidity)', ta: '7-நாள் நுண் வானிலை போக்கு (வெப்பநிலை & ஈரப்பதம்)' },
    envTrendsSub: { en: '7-Day Microclimate Trend', ta: '7-நாள் நுண் வானிலை போக்கு' },
    riskTimelineTitle: { en: '7-Day Environmental Risk Trend', ta: '7-நாள் சுற்றுச்சூழல் அபாய வரைபடம்' },
    confidenceTitle: { en: 'Mean Confidence by Disease Class', ta: 'நோய்களின் சராசரி மாடல் நம்பிக்கை மதிப்பு' },
    scansCount: { en: '128 Scans', ta: '128 சோதனைகள்' },
    riskTiers: { en: 'Multimodal Risk Tiers', ta: 'ஒருங்கிணைந்த அபாய அடுக்குகள்' },
    temp: { en: 'Temp (°C)', ta: 'வெப்பநிலை (°C)' },
    humidity: { en: 'Humidity (%)', ta: 'ஈரப்பதம் (%)' },
    peak: { en: 'Peak: 79%', ta: 'உச்சநிலை: 79%' },
    topConfidence: { en: 'Top: Healthy 97.2%', ta: 'அதிகபட்சம்: Healthy 97.2%' },
    days: {
      Mon: { en: 'Mon', ta: 'திங்கள்' },
      Tue: { en: 'Tue', ta: 'செவ்வாய்' },
      Wed: { en: 'Wed', ta: 'புதன்' },
      Thu: { en: 'Thu', ta: 'வியாழன்' },
      Fri: { en: 'Fri', ta: 'வெள்ளி' },
      Sat: { en: 'Sat', ta: 'சனி' },
      Sun: { en: 'Sun', ta: 'ஞாயிறு' },
    },
    riskLevels: {
      low: { en: 'Low Risk (<35%)', ta: 'குறைந்த அபாயம் (<35%)' },
      moderate: { en: 'Moderate Risk (35-67%)', ta: 'மிதமான அபாயம் (35-67%)' },
      high: { en: 'High Risk (≥68%)', ta: 'அதிக அபாயம் (≥68%)' },
    },
  },

  // Detailed Report Modal
  reportModal: {
    title: { en: 'Multimodal Crop Diagnostic Report', ta: 'பன்முக பயிர் பரிசோதனை அறிக்கை' },
    recordId: { en: 'Record ID:', ta: 'பதிவு எண்:' },
    primaryClass: { en: 'Primary Classification', ta: 'கண்டறியப்பட்ட முதன்மை நோய்' },
    imageConfidence: { en: 'Model Confidence:', ta: 'மாடல் நம்பிக்கை மதிப்பு:' },
    envRiskLabel: { en: 'Environmental Risk:', ta: 'சுற்றுச்சூழல் அபாயம்:' },
    specimen: { en: 'Analyzed Leaf Specimen', ta: 'ஆய்வு செய்யப்பட்ட இலை' },
    microclimateTitle: { en: 'Microclimate Parameters at Time of Analysis', ta: 'ஆய்வின் போதிருந்த வானிலை அளவீடுகள்' },
    actionPlanTitle: { en: 'Prescribed Agronomic Decision Support', ta: 'பரிந்துரைக்கப்பட்ட விவசாய களப்பணிகள்' },
    inspectionFreq: { en: 'Inspection Frequency:', ta: 'கண்காணிப்பு இடைவெளி:' },
    every48h: { en: 'Every 48 Hours', ta: '48 மணி நேரத்திற்கு ஒருமுறை' },
    targetedTreatment: { en: 'Targeted Advisory:', ta: 'பரிந்துரைக்கப்படும் தெளிப்பு:' },
    treatmentVal: { en: 'Follow TNAU / ICAR-IISR extension advice', ta: 'TNAU / ICAR-IISR வழிகாட்டுதலைப் பின்பற்றவும்' },
    footerDemo: { en: 'TurmeriCare AI • Research Prototype • Multimodal Crop Risk Decision Support', ta: 'TurmeriCare AI • ஆராய்ச்சி முன்மாதிரி • பல்தரவு பயிர் ஆபத்து முடிவு ஆதரவு' },
    multimodalRisk: { en: 'MULTIMODAL RISK', ta: 'மொத்த அபாயம்' },
  },

  // Landing Page
  landing: {
    badge: { en: 'Multimodal Crop Intelligence Prototype', ta: 'பன்முக பயிர் நுண்ணறிவு மாதிரி' },
    heroTitle1: { en: 'Intelligent Turmeric Disease', ta: 'மஞ்சள் பயிர் நோய் கண்டறிதல் &' },
    heroTitle2: { en: 'Risk Assessment', ta: 'முன்னெச்சரிக்கை அபாய மதிப்பீடு' },
    heroDesc: {
      en: 'Combining deep learning-based visual analysis with environmental intelligence for smarter crop health monitoring in Tamil Nadu.',
      ta: 'தமிழ்நாடு விவசாயிகளுக்காக ஆழ் கற்றல் இலைப்பட ஆய்வு மற்றும் வானிலை நுண்ணறிவை இணைத்து உருவாக்கப்பட்ட நவீன பயிர் பாதுகாப்பு தளம்.',
    },
    pillar1Title: { en: 'IMAGE AI (Visual Diagnosis)', ta: 'இலைப்பட ஆய்வு (Visual AI)' },
    pillar2Title: { en: 'Environmental AI (Microclimate Risk)', ta: 'சுற்றுச்சூழல் நுண்ணறிவு (Weather AI)' },
    pillar3Title: { en: 'Multimodal Fusion (Decision Support)', ta: 'பன்முக ஒருங்கிணைப்பு (Decision Support)' },
    card1Title: { en: 'Visual Disease Detection', ta: 'இலைப்பட நோய் கண்டறிதல்' },
    card1Desc: {
      en: 'Identify turmeric leaf diseases from visual symptoms using deep learning feature extraction.',
      ta: 'இலைப்படங்களில் தோன்றும் பூஞ்சை மற்றும் பூச்சி அறிகுறிகளை ஆழ் கற்றல் மூலம் உடனடியாக அடையாளம் காணுதல்.',
    },
    card1Btn: { en: 'Explore Visual Pipeline', ta: 'இலைப்பட ஆய்வுக்குச் செல்க' },
    card2Title: { en: 'Environmental Risk Assessment', ta: 'சுற்றுச்சூழல் அபாய மதிப்பீடு' },
    card2Desc: {
      en: 'Evaluate environmental conditions associated with disease development and pathogen incubation.',
      ta: 'வெப்பநிலை, காற்றின் ஈரப்பதம், மழைப்பொழிவு போன்ற காரணிகளால் நோய் பரவும் சாதக நிலையை மதிப்பிடுதல்.',
    },
    card2Btn: { en: 'Evaluate Weather Stress', ta: 'வானிலை சூழலை மதிப்பிடுக' },
    card3Title: { en: 'Multimodal Decision Support', ta: 'ஒருங்கிணைந்த முடிவு வழிகாட்டுதல்' },
    card3Desc: {
      en: 'Combine both information sources to estimate overall disease risk and actionable recommendations.',
      ta: 'இலை அறிகுறி மற்றும் கள வானிலை இரண்டையும் இணைத்து ஒட்டுமொத்த பயிர் அபாயத்தையும் தீர்வுகளையும் பெறுதல்.',
    },
    card3Btn: { en: 'View Multimodal Engine', ta: 'ஒருங்கிணைந்த முடிவைப் பார்க்க' },
  },

  // Weather & Risk Farmer-First UI
  weatherRisk: {
    pageTitle: { en: 'Weather & Field Risk', ta: 'வானிலை & வயல் அபாயம்' },
    pageSubtitle: {
      en: 'Current weather and recent conditions for your field.',
      ta: 'உங்கள் வயலுக்கான தற்போதைய வானிலை மற்றும் சமீபத்திய களச்சூழல்.',
    },
    currentWeather: { en: 'Current Weather', ta: 'தற்போதைய வானிலை' },
    updatedJustNow: { en: 'Updated just now', ta: 'இப்போது புதுப்பிக்கப்பட்டது' },
    updatedMinutesAgo: { en: 'Updated {min}m ago', ta: '{min} நிமிடம் முன் புதுப்பிக்கப்பட்டது' },
    recentConditionsTitle: { en: 'Recent Conditions (Last 14 days)', ta: 'சமீபத்திய சூழல் (கடந்த 14 நாட்கள்)' },
    recentConditionsSub: {
      en: 'Based on recent weather patterns in your area.',
      ta: 'உங்கள் பகுதியில் நிலவிய சமீபத்திய வானிலை முறைகளின் அடிப்படையில்.',
    },
    fieldRisk: { en: 'Field Risk', ta: 'வயல் அபாயம்' },
    cropWatch: { en: 'Crop Watch', ta: 'பயிர் கண்காணிப்பு' },
    generalAdvice: { en: 'General Advice', ta: 'பொதுவான விவசாய ஆலோசனைகள்' },
    healthyPlantsBetterYields: { en: 'Healthy Plants Better Yields', ta: 'ஆரோக்கியமான பயிர்கள் • சிறந்த மகசூல்' },
    healthyTurmericFarmers: { en: 'Healthy Turmeric Stronger Farmers', ta: 'ஆரோக்கியமான மஞ்சள் • பலமான விவசாயிகள்' },
    changeLocation: { en: 'Change Location', ta: 'அமைவிடம் மாற்று' },
    favourable: { en: 'Favourable', ta: 'சாதகமானது' },
    moderate: { en: 'Moderate', ta: 'மிதமானது' },
    normal: { en: 'Normal', ta: 'இயல்பானது' },
    frequent: { en: 'Frequent', ta: 'அடிக்கடி' },
    low: { en: 'Low', ta: 'குறைவானது' },
    suitable: { en: 'Suitable', ta: 'உகந்தது' },
    lessSuitable: { en: 'Less Suitable', ta: 'குறைந்த சாதகம்' },
    advancedDetails: { en: 'Advanced / Research Details', ta: 'மேம்பட்ட / ஆராய்ச்சி விவரங்கள்' },
    validationScopeNote: {
      en: 'Historical validation currently covers selected Tamil Nadu locations where verified disease/environment observations were available. Live weather assessment is available for other supported locations.',
      ta: 'வரலாற்று சரிபார்ப்பு தற்போது சரிபார்க்கப்பட்ட நோய்/சுற்றுச்சூழல் பதிவுகள் உள்ள தேர்ந்தெடுக்கப்பட்ட தமிழ்நாடு இடங்களுக்கு மட்டுமே பொருந்தும். மற்ற ஆதரிக்கப்படும் இடங்களுக்கு நேரலை வானிலை மதிப்பீடு செயல்படுகிறது.',
    },
  },

  // Recommendations Farmer-First UI
  farmerRecs: {
    pageTitle: { en: 'Recommendations', ta: 'பரிந்துரைகள்' },
    pageSubtitle: {
      en: 'Simple and practical advice for your turmeric crop.',
      ta: 'உங்கள் மஞ்சள் பயிருக்கான எளிய மற்றும் நடைமுறை ஆலோசனைகள்.',
    },
    currentSituation: { en: 'Current Situation', ta: 'தற்போதைய நிலை' },
    whyThisRiskHigh: { en: 'Why this risk is high?', ta: 'இந்த அபாயம் ஏன் அதிகமாக உள்ளது?' },
    whyThisRiskModerate: { en: 'Why this risk is moderate?', ta: 'இந்த அபாயம் ஏன் மிதமாக உள்ளது?' },
    whyThisRiskLow: { en: 'Why this risk is low?', ta: 'இந்த அபாயம் ஏன் குறைவாக உள்ளது?' },
    whyThisSituation: { en: 'Why this situation?', ta: 'இந்த நிலைக்கான காரணங்கள்' },
    whatShouldIDoNow: { en: 'What should I do now?', ta: 'இப்போது நான் என்ன செய்ய வேண்டும்?' },
    priorityActions: { en: 'Priority Actions', ta: 'முக்கிய பணிகள்' },
    importantNote: { en: 'Important Note', ta: 'முக்கிய குறிப்பு' },
    importantNoteText: {
      en: 'These recommendations are for guidance only. For chemical management, follow TNAU / ICAR-IISR / local agricultural extension guidance and product-label instructions.',
      ta: 'இந்த பரிந்துரைகள் வழிகாட்டுதலுக்காக மட்டுமே. இரசாயன மேலாண்மைக்கு, தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) / ICAR-IISR / உள்ளூர் வேளாண்மை அலுவலர் வழிகாட்டுதல்கள் மற்றும் தயாரிப்பு லேபிள் வழிமுறைகளைப் பின்பற்றவும்.',
    },
    needMoreInfo: { en: 'Need more information?', ta: 'கூடுதல் தகவல் தேவையா?' },
    talkToOfficer: {
      en: 'Talk to your local agricultural extension officer for crop-specific management advice.',
      ta: 'பயிர் மேலாண்மை குறித்த நேரடி ஆலோசனைக்கு உங்கள் பகுதி வேளாண்மை அலுவலரைத் தொடர்பு கொள்ளவும்.',
    },
    contactSupport: { en: 'Contact Support', ta: 'உதவிக்கு தொடர்பு கொள்க' },
    footerRibbon: {
      en: 'Healthy Plants • Better Yields • A Prosperous Tomorrow',
      ta: 'ஆரோக்கியமான பயிர்கள் • சிறந்த மகசூல் • வளமான எதிர்காலம்',
    },
  },

  // Footer
  footer: {
    text: {
      en: 'TurmeriCare AI • Research Prototype • Multimodal Crop Risk Decision Support',
      ta: 'TurmeriCare AI • ஆராய்ச்சி முன்மாதிரி • பல்தரவு பயிர் ஆபத்து முடிவு ஆதரவு',
    },
  },

  // Why this result explanations
  whyResult: {
    title: { en: 'Why this result?', ta: 'இந்த முடிவுக்கான காரணம் என்ன?' },
    healthy: (conf: number | string) => ({
      en: `The model classified this leaf as Healthy with ${conf}% confidence. No disease pattern was identified strongly enough to classify it as Aphids, Blotch, or Leaf Spot.`,
      ta: `இந்த இலை ${conf}% நம்பிக்கையுடன் ஆரோக்கியமானது (Healthy) என வகைப்படுத்தப்பட்டுள்ளது. அசுவினி (Aphids), இலைக்கருகல் (Blotch) அல்லது இலைப்புள்ளி (Leaf Spot) என வகைப்படுத்தும் அளவிற்கு எந்த நோய் வடிவமும் வலுவாகக் கண்டறியப்படவில்லை.`,
    }),
    aphids: (conf: number | string) => ({
      en: `The model identified Aphids with ${conf}% confidence based on the visual pattern detected in the uploaded leaf.`,
      ta: `பதிவேற்றப்பட்ட இலையில் கண்டறியப்பட்ட காட்சி வடிவத்தின் அடிப்படையில் ${conf}% நம்பிக்கையுடன் அசுவினி பூச்சி தாக்குதல் (Aphids) அடையாளம் காணப்பட்டுள்ளது.`,
    }),
    blotch: (conf: number | string) => ({
      en: `The model identified Blotch with ${conf}% confidence based on the visual pattern detected in the uploaded leaf.`,
      ta: `பதிவேற்றப்பட்ட இலையில் கண்டறியப்பட்ட காட்சி வடிவத்தின் அடிப்படையில் ${conf}% நம்பிக்கையுடன் இலைக்கருகல் நோய் (Blotch) அடையாளம் காணப்பட்டுள்ளது.`,
    }),
    leafSpot: (conf: number | string) => ({
      en: `The model identified Leaf Spot with ${conf}% confidence based on the visual pattern detected in the uploaded leaf.`,
      ta: `பதிவேற்றப்பட்ட இலையில் கண்டறியப்பட்ட காட்சி வடிவத்தின் அடிப்படையில் ${conf}% நம்பிக்கையுடன் இலைப்புள்ளி நோய் (Leaf Spot) அடையாளம் காணப்பட்டுள்ளது.`,
    }),
    ood: {
      en: "This image did not meet the system's turmeric-leaf validation criteria. Please capture a clear, single turmeric leaf in good lighting.",
      ta: 'இந்தப் படம் அமைப்பின் மஞ்சள் இலை சரிபார்ப்பு நிபந்தனைகளை பூர்த்தி செய்யவில்லை. தயவுசெய்து நல்ல வெளிச்சத்தில் ஒரு மஞ்சள் இலையை மட்டும் தெளிவாகப் படம் எடுக்கவும்.',
    },
  },
};

export const getTranslation = (lang: Language, section: keyof typeof TRANSLATIONS, key: string): string => {
  const sec = TRANSLATIONS[section] as any;
  if (sec && sec[key]) {
    return sec[key][lang] || sec[key]['en'] || key;
  }
  return key;
};
