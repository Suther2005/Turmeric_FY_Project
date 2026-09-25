import { ChatAppContext, ChatMessage, ChatStarter } from './types';

export const STARTER_QUESTIONS: { en: ChatStarter[]; ta: ChatStarter[] } = {
  en: [
    {
      id: 'starter_turmeric',
      label: '🌱 What is turmeric?',
      query: 'What is turmeric?',
    },
    {
      id: 'starter_spot',
      label: '🍃 What is Leaf Spot?',
      query: 'What is Leaf Spot?',
    },
    {
      id: 'starter_scan_result',
      label: '📷 Why did my scan get this result?',
      query: 'Why did my scan get this result?',
    },
    {
      id: 'starter_weather',
      label: '🌦️ Why does weather matter?',
      query: 'Why does weather matter?',
    },
    {
      id: 'starter_sensor',
      label: '📡 What does the sensor measure?',
      query: 'What does the field sensor measure?',
    },
  ],
  ta: [
    {
      id: 'starter_turmeric_ta',
      label: '🌱 மஞ்சள் என்றால் என்ன?',
      query: 'மஞ்சள் என்றால் என்ன?',
    },
    {
      id: 'starter_spot_ta',
      label: '🍃 இலைப்புள்ளி நோய் என்றால் என்ன?',
      query: 'இலைப்புள்ளி நோய் என்றால் என்ன?',
    },
    {
      id: 'starter_scan_result_ta',
      label: '📷 எனது ஸ்கேன் முடிவு என்ன?',
      query: 'எனது ஸ்கேன் முடிவு ஏன் இப்படி வந்தது?',
    },
    {
      id: 'starter_weather_ta',
      label: '🌦️ வானிலை ஏன் முக்கியம்?',
      query: 'வானிலை ஏன் முக்கியம்?',
    },
    {
      id: 'starter_sensor_ta',
      label: '📡 சென்சார்கள் என்ன அளவிடுகின்றன?',
      query: 'சென்சார்கள் என்ன அளவிடுகின்றன?',
    },
  ],
};

interface IntentResponse {
  category: ChatMessage['category'];
  textEn: (ctx: ChatAppContext, q: string) => string;
  textTa: (ctx: ChatAppContext, q: string) => string;
  followUpsEn: string[] | ((ctx: ChatAppContext, q: string) => string[]);
  followUpsTa: string[] | ((ctx: ChatAppContext, q: string) => string[]);
}

interface IntentDefinition {
  id: string;
  match: (normalized: string) => boolean;
  response: IntentResponse;
}

const INTENTS: IntentDefinition[] = [
  // -------------------------------------------------------------
  // A. BASIC KNOWLEDGE
  // -------------------------------------------------------------
  {
    id: 'what_is_turmeric',
    match: (q) =>
      q.includes('what is turmeric') ||
      q.includes('tell me about turmeric') ||
      q.includes('about turmeric') ||
      q.includes('what is manjal') ||
      q.includes('curcuma longa') ||
      q.includes('what is curcuma') ||
      q.includes('why is turmeric grown') ||
      q.includes('why grow turmeric') ||
      q.includes('turmeric plant') ||
      q.includes('uses of turmeric') ||
      q.includes('benefit of turmeric') ||
      q.includes('மஞ்சள் என்றால் என்ன') ||
      q.includes('மஞ்சள் செடி') ||
      q.includes('இது என்ன பயிர்') ||
      q.includes('குர்குமா லோங்கா') ||
      q.includes('மஞ்சள் பயிர் பற்றி') ||
      q.includes('மஞ்சளின் பயன்கள்'),
    response: {
      category: 'basic',
      textEn: () =>
        `🌱 **Turmeric (*Curcuma longa*)** is a rhizome crop mainly grown for its underground rhizomes, culinary spice, and medicinal curcumin.\n\n` +
        `Curcuma focuses on monitoring turmeric crop and leaf health using AI.\n\n` +
        `Want to know about its growth, diseases, or leaf health?`,
      textTa: () =>
        `🌱 **மஞ்சள் (*Curcuma longa*)** என்பது மருத்துவ குணம் கொண்ட குர்குமின் மற்றும் நறுமண மசாலாவுக்காக பயிரிடப்படும் ஒரு முக்கிய கிழங்குப் பயிராகும்.\n\n` +
        `Curcuma செயலி மஞ்சள் இலை நலம், நோய்கள் மற்றும் வயல் அபாயங்களை கண்காணிக்க உதவுகிறது.\n\n` +
        `வளர்ச்சி நிலைகள் அல்லது நோய்கள் குறித்து அறிய விரும்புகிறீர்களா?`,
      followUpsEn: ['What are the growth stages of turmeric?', 'What diseases affect turmeric?', 'Why does weather matter?'],
      followUpsTa: ['மஞ்சள் பயிரின் வளர்ச்சி நிலைகள் என்ன?', 'மஞ்சள் பயிரைத் தாக்கும் நோய்கள் என்ன?', 'மஞ்சள் பயிருக்கு வானிலை ஏன் முக்கியம்?'],
    },
  },

  {
    id: 'what_is_rhizome',
    match: (q) =>
      q.includes('rhizome') ||
      q.includes('what part of turmeric is harvested') ||
      q.includes('what part is harvested') ||
      q.includes('harvested part') ||
      q.includes('underground stem') ||
      q.includes('கிழங்கு என்றால் என்ன') ||
      q.includes('எந்த பாகம் அறுவடை') ||
      q.includes('விதைக்கிழங்கு'),
    response: {
      category: 'basic',
      textEn: () =>
        `🌿 A **rhizome** is a modified underground stem that stores nutrients and curcumin.\n\n` +
        `The mother and finger rhizomes are the main harvested parts of turmeric, used for seed propagation, spice, and processing.`,
      textTa: () =>
        `🌿 **கிழங்கு (Rhizome)** என்பது மண்ணுக்கு அடியில் சத்துக்கள் மற்றும் குர்குமினை சேமித்து வைக்கும் உருமாறிய தண்டுப் பகுதியாகும்.\n\n` +
        `தாய்க் கிழங்கு மற்றும் விரல் மஞ்சள் ஆகியவை மஞ்சள் பயிரில் அறுவடை செய்யப்படும் முக்கிய பாகங்களாகும்.`,
      followUpsEn: ['What are the main growth stages?', 'What is Leaf Spot?'],
      followUpsTa: ['மஞ்சளின் முக்கிய வளர்ச்சி நிலைகள் யாவை?', 'இலைப்புள்ளி நோய் என்றால் என்ன?'],
    },
  },

  // -------------------------------------------------------------
  // B. TURMERIC CROP KNOWLEDGE
  // -------------------------------------------------------------
  {
    id: 'growth_stages',
    match: (q) =>
      q.includes('growth stage') ||
      q.includes('stages of turmeric') ||
      q.includes('crop development') ||
      q.includes('crop cycle') ||
      q.includes('how long to grow') ||
      q.includes('crop maturity') ||
      q.includes('dap') ||
      q.includes('வளர்ச்சி நிலை') ||
      q.includes('பயிர் காலம்') ||
      q.includes('எத்தனை மாத பயிர்') ||
      q.includes('அறுவடை காலம்'),
    response: {
      category: 'crop',
      textEn: () =>
        `📅 Turmeric takes **7 to 9 months (210–270 days)** from planting to harvest:\n\n` +
        `• **Sprouting (0–30 DAP):** Shoot and root emergence.\n` +
        `• **Vegetative (30–90 DAP):** Canopy leaf formation and tillering.\n` +
        `• **Rhizome Bulking (90–180 DAP):** Finger rhizome growth underground.\n` +
        `• **Maturity (180–240+ DAP):** Foliage turns yellow and dries before harvest.`,
      textTa: () =>
        `📅 மஞ்சள் பயிர் நடவு முதல் அறுவடை வரை **7 முதல் 9 மாதங்கள் (210-270 நாட்கள்)** வளரும்:\n\n` +
        `• **முளைப்பு பருவம் (0–30 நாள்):** கிழங்கு முளைத்து தளிர்கள் தோன்றும்.\n` +
        `• **தழை வளர்ச்சி (30–90 நாள்):** இலைகள் விரிவடைந்து தூர்கள் உருவாகும்.\n` +
        `• **கிழங்கு பருவம் (90–180 நாள்):** விரல் கிழங்குகள் பெருகும்.\n` +
        `• **முதிர்ச்சி (180–240+ நாள்):** இலைகள் காய்ந்து அறுவடைக்கு தயாராகும்.`,
      followUpsEn: ['How do I plant turmeric?', 'What is Leaf Blotch?'],
      followUpsTa: ['நடவு முறை என்ன?', 'இலைக்கருகல் நோய் என்றால் என்ன?'],
    },
  },

  {
    id: 'planting_and_monitoring',
    match: (q) =>
      q.includes('how to plant') ||
      q.includes('planting') ||
      q.includes('field monitoring') ||
      q.includes('drainage') ||
      q.includes('irrigation') ||
      q.includes('canopy') ||
      q.includes('நடவு முறை') ||
      q.includes('பாசனம்') ||
      q.includes('வடிகால்') ||
      q.includes('பாத்தி அமைப்பு'),
    response: {
      category: 'crop',
      textEn: () =>
        `🌱 Turmeric grows best on raised ridges or beds with well-drained loamy soil.\n\n` +
        `• Ensure good furrow drainage to prevent water stagnation around rhizomes.\n` +
        `• Inspect leaf undersides weekly for early spots or pest colonies.\n` +
        `• Maintain steady soil moisture without waterlogging.`,
      textTa: () =>
        `🌱 மஞ்சள் பயிர் நல்ல வடிகால் வசதியுள்ள பாத்திகளில் செழித்து வளரும்.\n\n` +
        `• மழைக்காலத்தில் பாத்திகளில் நீர் தேங்காதவாறு வடிகால் வசதி அமைக்கவும்.\n` +
        `• இலைகளின் அடிப்பகுதியை வாரம் ஒருமுறை கவனித்து ஆரம்ப அறிகுறிகளை கண்டறியவும்.\n` +
        `• அதிக நீர் தேக்கமின்றி சீரான ஈரப்பதத்தை பராமரிக்கவும்.`,
      followUpsEn: ['Why does rainfall matter?', 'What is Leaf Spot?'],
      followUpsTa: ['மழை அளவு ஏன் முக்கியம்?', 'இலைப்புள்ளி நோய் என்றால் என்ன?'],
    },
  },

  // -------------------------------------------------------------
  // C. TREATMENT & MANAGEMENT (Highest priority for disease care queries)
  // -------------------------------------------------------------
  {
    id: 'treatment_leaf_spot',
    match: (q) =>
      (q.includes('spot') || q.includes('இலைப்புள்ளி')) &&
      (q.includes('pesticide') ||
        q.includes('fungicide') ||
        q.includes('chemical') ||
        q.includes('spray') ||
        q.includes('control') ||
        q.includes('treat') ||
        q.includes('manage') ||
        q.includes('cure') ||
        q.includes('prevent') ||
        q.includes('medicine') ||
        q.includes('what should i do') ||
        q.includes('what to do') ||
        q.includes('மருந்து') ||
        q.includes('கட்டுப்பாடு') ||
        q.includes('மேலாண்மை') ||
        q.includes('சிகிச்சை') ||
        q.includes('தெளிக்க') ||
        q.includes('தடுக்க') ||
        q.includes('என்ன செய்ய வேண்டும்')),
    response: {
      category: 'disease',
      textEn: () =>
        `Chemical treatment should be based on the current approved label and local agricultural-extension (TNAU/ICAR/KVK) recommendations for turmeric Leaf Spot. I won't guess a pesticide or dosage.\n\n` +
        `For immediate management, focus on:\n` +
        `• **Regular scouting:** Inspect lower canopy leaf surfaces frequently for early disease signs.\n` +
        `• **Field sanitation:** Carefully remove and safely destroy severely affected diseased material where appropriate.\n` +
        `• **Reducing leaf wetness:** Avoid unnecessary overhead wetness and maintain good ridge drainage.\n` +
        `• **Improving canopy airflow:** Ensure adequate plant spacing to allow ventilation through foliage.\n\n` +
        `If you tell me your location/district, I can point you toward the relevant official agricultural guidance.`,
      textTa: () =>
        `மஞ்சள் இலைப்புள்ளி நோய்க்கான வேதியியல் பூஞ்சைக்கொல்லி சிகிச்சை முறைகள் மத்திய/மாநில அரசு அங்கீகரித்த லேபிள் மற்றும் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU/KVK) பரிந்துரைகளின் அடிப்படையில் மட்டுமே அமைய வேண்டும். தவறான பூச்சிக்கொல்லி அல்லது மருந்தளவை நான் யூகிக்க மாட்டேன்.\n\n` +
        `உடனடி வயல்வெளி மேலாண்மை முறைகள்:\n` +
        `• தொடர் கள ஆய்வு: இலைகளின் அடிப்பகுதியை அடிக்கடி ஆய்வு செய்து நோய் பரவலைக் கண்காணிக்கவும்.\n` +
        `• பாதிக்கப்பட்ட இலைகளை அகற்றுதல்: தீவிரமாக பாதிக்கப்பட்ட இலைகளை அகற்றி வயல் தூய்மையைப் பேணவும்.\n` +
        `• ஈரப்பதக் கட்டுப்பாடு: இலைகளில் நீர் தேங்குவதைத் தவிர்த்து, பாத்திகளில் நல்ல வடிகால் வசதி ஏற்படுத்தவும்.\n` +
        `• காற்றோட்டம்: செடிகளுக்கு இடையே போதிய இடைவெளி விட்டு காற்றோட்டத்தை அதிகரிக்கவும்.`,
      followUpsEn: ['Why does humidity increase Leaf Spot risk?', 'What should I check in the field?', 'Why did my scan detect Leaf Spot?'],
      followUpsTa: ['ஈரப்பதம் ஏன் இலைப்புள்ளி ஆபத்தை அதிகரிக்கிறது?', 'வயலில் எவற்றை ஆய்வு செய்ய வேண்டும்?', 'எனது ஸ்கேன் முடிவு ஏன் இலைப்புள்ளி எனக் காட்டியது?'],
    },
  },

  {
    id: 'treatment_leaf_blotch',
    match: (q) =>
      (q.includes('blotch') || q.includes('இலைக்கருகல்')) &&
      (q.includes('pesticide') ||
        q.includes('fungicide') ||
        q.includes('chemical') ||
        q.includes('spray') ||
        q.includes('control') ||
        q.includes('treat') ||
        q.includes('manage') ||
        q.includes('cure') ||
        q.includes('prevent') ||
        q.includes('medicine') ||
        q.includes('what should i do') ||
        q.includes('what to do') ||
        q.includes('மருந்து') ||
        q.includes('கட்டுப்பாடு') ||
        q.includes('மேலாண்மை') ||
        q.includes('சிகிச்சை')),
    response: {
      category: 'disease',
      textEn: () =>
        `Chemical treatment should be based on the current approved label and local agricultural-extension (TNAU/ICAR/KVK) recommendations for turmeric Leaf Blotch. I won't guess a pesticide or dosage.\n\n` +
        `For immediate field management:\n` +
        `• Collect and destroy heavily scorched foliar debris (Field Sanitation).\n` +
        `• Ensure furrow drainage so rain does not stagnate.\n` +
        `• Maintain balanced fertilization and avoid excessive nitrogen.\n` +
        `• Maintain canopy spacing to enhance aeration.`,
      textTa: () =>
        `மஞ்சள் இலைக்கருகல் நோய்க்கு அரசு மற்றும் TNAU/KVK பரிந்துரைத்த பூஞ்சைக்கொல்லி மருந்துகளை மட்டுமே லேபிள் விதிகளின்படி பயன்படுத்த வேண்டும். தவறான மருந்தளவை நான் யூகிக்க மாட்டேன்.\n\n` +
        `உடனடி மேலாண்மை முறைகள்:\n` +
        `• கருகிய இலைகளைச் சேகரித்து அழிக்கவும்.\n` +
        `• வயலில் நீர் தேங்காதவாறு வடிகால் வசதியை உறுதி செய்யவும்.\n` +
        `• அதிக தழைச்சத்து உரங்களைத் தவிர்க்கவும்.\n` +
        `• செடிகளுக்கிடையே காற்றோட்டத்தை பராமரிக்கவும்.`,
      followUpsEn: ['What does Leaf Blotch look like?', 'Why is humidity important?'],
      followUpsTa: ['இலைக்கருகல் அறிகுறிகள் என்ன?', 'ஈரப்பதம் ஏன் முக்கியம்?'],
    },
  },

  {
    id: 'treatment_aphids',
    match: (q) =>
      (q.includes('aphid') || q.includes('அசுவினி')) &&
      (q.includes('pesticide') ||
        q.includes('control') ||
        q.includes('treat') ||
        q.includes('manage') ||
        q.includes('spray') ||
        q.includes('medicine') ||
        q.includes('trap') ||
        q.includes('மருந்து') ||
        q.includes('கட்டுப்பாடு')),
    response: {
      category: 'disease',
      textEn: () =>
        `Aphid management in turmeric combines Integrated Pest Management (IPM) with approved extension practices:\n\n` +
        `• Install yellow sticky traps (15–20 traps/ha) across the field.\n` +
        `• Conserve beneficial natural predators like ladybird beetles.\n` +
        `• For severe infestations, consult TNAU/KVK for approved botanical (neem-based) or registered insecticidal formulations per official product labels.`,
      textTa: () =>
        `அசுவினி பூச்சி மேலாண்மை முறைகள்:\n\n` +
        `• ஹெக்டேருக்கு 15–20 மஞ்சள் நிற ஒட்டும் பொறிகளை வைத்து அசுவினிகளைக் கவரவும்.\n` +
        `• பொறிவண்டுகள் (Ladybird beetles) போன்ற நன்மை செய்யும் பூச்சிகளைப் பாதுகாக்கவும்.\n` +
        `• கடுமையான தாக்குதல் இருந்தால், TNAU/KVK பரிந்துரைத்த பூச்சிக்கொல்லி மருந்துகளை மட்டுமே சரியான அளவில் பயன்படுத்தவும்.`,
      followUpsEn: ['What are Aphids?', 'How do I scan a leaf?'],
      followUpsTa: ['அசுவினி பூச்சி என்றால் என்ன?', 'இலையை ஸ்கேன் செய்வது எப்படி?'],
    },
  },

  // -------------------------------------------------------------
  // D. DISEASE & PEST DEFINITIONS & SYMPTOMS
  // -------------------------------------------------------------
  {
    id: 'what_is_leaf_spot',
    match: (q) =>
      q.includes('leaf spot') ||
      q.includes('colletotrichum') ||
      q.includes('circular spot') ||
      q.includes('yellow halo') ||
      q.includes('இலைப்புள்ளி') ||
      q.includes('இலை புள்ளி') ||
      q.includes('கொலட்டோட்ரைக்கம்'),
    response: {
      category: 'disease',
      textEn: () =>
        `🍃 **Leaf Spot** is a foliar disease condition caused by *Colletotrichum capsici* that appears as brown spots or lesions with yellow halos on leaves.\n\n` +
        `Curcuma can analyze a clear turmeric leaf image for disease classification.\n\n` +
        `You can use **Scan Leaf** to check a leaf.`,
      textTa: () =>
        `🍃 **இலைப்புள்ளி நோய்** (*Colletotrichum capsici*) இலைகளில் வட்டமான பழுப்பு நிற புள்ளிகள் மற்றும் அதைச் சுற்றி மஞ்சள் வளையத்தை (Yellow Halo) உண்டாக்கும்.\n\n` +
        `Curcuma செயலி தெளிவான இலைப்படங்களை பகுப்பாய்வு செய்து நோயை கண்டறியும்.\n\n` +
        `உங்கள் இலையை சரிபார்க்க **Scan Leaf** பக்கத்தைப் பயன்படுத்தவும்.`,
      followUpsEn: ['What does Leaf Spot look like?', 'How does Leaf Spot develop?', 'How can I manage Leaf Spot?'],
      followUpsTa: ['இலைப்புள்ளி அறிகுறிகள் என்ன?', 'இலைப்புள்ளி நோய் எவ்வாறு உருவாகிறது?', 'இலைப்புள்ளி நோயை எவ்வாறு மேலாண்மை செய்வது?'],
    },
  },

  {
    id: 'what_is_leaf_blotch',
    match: (q) =>
      q.includes('leaf blotch') ||
      q.includes('blotch') ||
      q.includes('taphrina') ||
      q.includes('brown patch') ||
      q.includes('இலைக்கருகல்') ||
      q.includes('இலை கருகல்') ||
      q.includes('டாப்ரினா'),
    response: {
      category: 'disease',
      textEn: () =>
        `🍂 **Leaf Blotch** is a foliar fungal disease caused by *Taphrina maculans* that forms numerous small yellowish-brown spots that merge into scorched patches.\n\n` +
        `It spreads rapidly during cool, cloudy, and humid weather.\n\n` +
        `You can use **Scan Leaf** to check a suspected leaf.`,
      textTa: () =>
        `🍂 **இலைக்கருகல் நோய்** (*Taphrina maculans*) இலைகளில் சிறிய மஞ்சள்-பழுப்பு புள்ளிகளாகத் தொடங்கி, பின்னர் கருகிய பெரிய திட்டுகளாக மாறும்.\n\n` +
        `மேகமூட்டம் மற்றும் காற்றில் அதிக ஈரப்பதம் உள்ள சூழலில் இது வேகமாகப் பரவும்.\n\n` +
        `உங்கள் இலையை உறுதிசெய்ய **Scan Leaf** பக்கத்தில் சோதிக்கலாம்.`,
      followUpsEn: ['What does Blotch look like?', 'How does Blotch develop?', 'How can I manage Blotch?'],
      followUpsTa: ['இலைக்கருகல் அறிகுறிகள் என்ன?', 'இலைக்கருகல் நோய் எவ்வாறு உருவாகிறது?', 'இலைக்கருகல் நோயை எவ்வாறு மேலாண்மை செய்வது?'],
    },
  },

  {
    id: 'difference_blotch_spot',
    match: (q) =>
      (q.includes('difference') && (q.includes('blotch') || q.includes('spot'))) ||
      q.includes('blotch vs spot') ||
      q.includes('spot vs blotch') ||
      (q.includes('வித்தியாசம்') && (q.includes('கருகல்') || q.includes('புள்ளி'))),
    response: {
      category: 'disease',
      textEn: () =>
        `🔍 **Blotch vs. Leaf Spot:**\n\n` +
        `• **Leaf Spot (*Colletotrichum*):** Circular to oval brown spots with distinct bright yellow halo rings.\n` +
        `• **Leaf Blotch (*Taphrina*):** Dense, smaller irregular brown flecks that coalesce into scorched patches without distinct halos.\n\n` +
        `Curcuma's AI model is trained to differentiate both visual patterns.`,
      textTa: () =>
        `🔍 **இலைக்கருகல் மற்றும் இலைப்புள்ளி வேறுபாடுகள்:**\n\n` +
        `• **இலைப்புள்ளி:** வட்ட வடிவ புள்ளிகள் மற்றும் அதைச் சுற்றி தெளிவான மஞ்சள் நிற வளையம் இருக்கும்.\n` +
        `• **இலைக்கருகல்:** சிறிய பழுப்பு புள்ளிகள் ஒன்றிணைந்து இலை முழுவதும் கருகிய தோற்றத்தை தரும்.\n\n` +
        `Curcuma AI மாதிரி இவ்விரு அறிகுறிகளையும் துல்லியமாக வேறுபடுத்தி அறியும்.`,
      followUpsEn: ['How do I scan a leaf?', 'Why is humidity important?'],
      followUpsTa: ['இலையை ஸ்கேன் செய்வது எப்படி?', 'ஈரப்பதம் ஏன் முக்கியம்?'],
    },
  },

  {
    id: 'what_are_aphids',
    match: (q) =>
      q.includes('aphid') ||
      q.includes('aphids') ||
      q.includes('pest') ||
      q.includes('sucking insect') ||
      q.includes('curling') ||
      q.includes('sooty mold') ||
      q.includes('அசுவினி') ||
      q.includes('பூச்சி') ||
      q.includes('சாறு உறிஞ்சும்') ||
      q.includes('இலை சுருட்டை'),
    response: {
      category: 'disease',
      textEn: () =>
        `🐛 **Aphids** (*Aphis gossypii*) are small sap-sucking insect pests that cluster under tender turmeric leaves.\n\n` +
        `• They cause leaf crinkling and secrete sticky honeydew that leads to black sooty mold.\n` +
        `• Monitored using yellow sticky traps and official agricultural IPM practices.`,
      textTa: () =>
        `🐛 **அசுவினி பூச்சிகள்** (*Aphis gossypii*) இலைகளின் அடிப்பகுதியில் தங்கி சாற்றை உறிஞ்சும் சிறிய பூச்சிகளாகும்.\n\n` +
        `• இவை இலைகளை சுருங்கச் செய்து, கரும்பூஞ்சை படர காரணமாகின்றன.\n` +
        `• மஞ்சள் நிற ஒட்டும் பொறிகள் மற்றும் பரிந்துரைக்கப்பட்ட ஒருங்கிணைந்த பூச்சி மேலாண்மை மூலம் கட்டுப்படுத்தலாம்.`,
      followUpsEn: ['How can I identify Aphids?', 'What should I monitor?', 'How can I manage Aphids?'],
      followUpsTa: ['அசுவினி பூச்சிகளை எவ்வாறு அடையாளம் காண்பது?', 'எவற்றை கண்காணிக்க வேண்டும்?', 'அசுவினி பூச்சிகளை எவ்வாறு கட்டுப்படுத்துவது?'],
    },
  },

  {
    id: 'healthy_leaf',
    match: (q) =>
      q.includes('healthy turmeric leaf') ||
      q.includes('healthy leaf') ||
      q.includes('healthy') ||
      q.includes('normal leaf') ||
      q.includes('ஆரோக்கியமான இலை') ||
      q.includes('ஆரோக்கியமான') ||
      q.includes('நல்ல இலை'),
    response: {
      category: 'disease',
      textEn: () =>
        `🌿 A **Healthy Turmeric Leaf** has a uniform, vibrant green lamina without necrotic spots, yellow halo rings, or curling.\n\n` +
        `Curcuma's vision model checks for both healthy foliage and foliar pathology symptoms.`,
      textTa: () =>
        `🌿 **ஆரோக்கியமான மஞ்சள் இலை** சீரான பச்சை நிறத்துடனும், எந்தவித கருகல் புள்ளிகள், மஞ்சள் வளையங்கள் அல்லது பூச்சி சுருட்டைகள் இன்றியும் காணப்படும்.\n\n` +
        `Curcuma மாடல் ஆரோக்கியமான இலைகளையும் நோய் பாதிப்புகளையும் துல்லியமாக பகுப்பாய்வு செய்கிறது.`,
      followUpsEn: ['What does a Healthy result mean?', 'What should I monitor?', 'How can I maintain crop health?'],
      followUpsTa: ['ஆரோக்கியமான முடிவு என்றால் என்ன?', 'எவற்றை கண்காணிக்க வேண்டும்?', 'பயிரின் ஆரோக்கியத்தை எவ்வாறு பராமரிப்பது?'],
    },
  },

  {
    id: 'unhealthy_leaf_actions',
    match: (q) =>
      q.includes('unhealthy') ||
      q.includes('leaf looks sick') ||
      q.includes('what should i do') ||
      q.includes('treatment') ||
      q.includes('how to cure') ||
      q.includes('how to treat') ||
      q.includes('medicine') ||
      q.includes('spray') ||
      q.includes('மருந்து') ||
      q.includes('சிகிச்சை') ||
      q.includes('என்ன செய்ய வேண்டும்') ||
      q.includes('கட்டுப்படுத்த என்ன'),
    response: {
      category: 'disease',
      textEn: () =>
        `🔍 **If your turmeric leaf looks unhealthy:**\n\n` +
        `1. Use **Scan Leaf** to check the visual symptoms on a clear leaf photo.\n` +
        `2. Ensure field ridge drainage so excess water does not stagnate.\n` +
        `3. Follow current official agricultural extension guidance (e.g. TNAU/ICAR) and verified product labels for approved management.`,
      textTa: () =>
        `🔍 **உங்கள் மஞ்சள் இலையில் நோய் அறிகுறிகள் தென்பட்டால்:**\n\n` +
        `1. பாதிக்கப்பட்ட இலையை புகைப்படம் எடுத்து **Scan Leaf** பகுதியில் ஆய்வு செய்யவும்.\n` +
        `2. பாத்திகளில் நீர் தேங்காமல் வடிகால் வசதியை சரிபார்க்கவும்.\n` +
        `3. வேளாண் பல்கலைக்கழகம் (TNAU/KVK) பரிந்துரைக்கும் பாதுகாப்பான வழிகாட்டுதல்களைப் பின்பற்றவும்.`,
      followUpsEn: ['How do I scan a leaf?', 'Why is humidity important?'],
      followUpsTa: ['இலையை ஸ்கேன் செய்வது எப்படி?', 'ஈரப்பதம் ஏன் முக்கியம்?'],
    },
  },

  // -------------------------------------------------------------
  // D. ENVIRONMENT & WEATHER
  // -------------------------------------------------------------
  {
    id: 'field_conditions_check',
    match: (q) =>
      q.includes('field condition') ||
      q.includes('field check') ||
      q.includes('check my field') ||
      q.includes('check field') ||
      q.includes('enter field') ||
      q.includes('record field') ||
      q.includes('field temperature') ||
      q.includes('enter soil moisture') ||
      q.includes('soil moisture') ||
      q.includes('what can i check in field check') ||
      q.includes('how do i check my field') ||
      q.includes('how can i check my field') ||
      q.includes('what should i check in the field') ||
      q.includes('field conditions') ||
      q.includes('வயல் நிலைமை') ||
      q.includes('கள ஆய்வு') ||
      q.includes('கள நிலை') ||
      q.includes('வயல் நிலைமைகளை எவ்வாறு சோதிப்பது') ||
      q.includes('மண் ஈரப்பதம்'),
    response: {
      category: 'environment',
      textEn: () =>
        `🌱 **TurmeriCare Field Check Guide (/field-conditions):**\n\n` +
        `• Open the **Field Check** tab in the navigation bar.\n` +
        `• Enter your field's current environmental parameters:\n` +
        `  - Temperature (°C) and Relative Humidity (%)\n` +
        `  - Soil Moisture (%) and Soil pH\n` +
        `  - Leaf Wetness duration (hours) and Rainfall (mm)\n` +
        `  - Wind Speed (km/h) and Sunlight Hours\n\n` +
        `• The system immediately computes your Environmental Disease Risk Index (Low, Moderate, High, Severe) to alert you if microclimate conditions favor Leaf Spot or Blotch formation.`,
      textTa: () =>
        `🌱 **TurmeriCare கள ஆய்வு (Field Check) வழிகாட்டி (/field-conditions):**\n\n` +
        `• மேல் மெனுவில் உள்ள **Field Check** பக்கத்தைத் திறக்கவும்.\n` +
        `• உங்கள் வயலின் கள அளவீடுகளை உள்ளிடலாம்:\n` +
        `  - வெப்பநிலை (°C) மற்றும் காற்றின் ஈரப்பதம் (%)\n` +
        `  - மண் ஈரப்பதம் (%) மற்றும் மண்ணின் pH அளவு\n` +
        `  - இலை ஈரப்பதம் (Leaf Wetness hours) மற்றும் மழைப்பொழிவு (mm)\n` +
        `  - காற்றின் வேகம் (km/h) மற்றும் சூரிய ஒளி நேரம்\n\n` +
        `• இந்த அளவீடுகளின் அடிப்படையில் கணினி சுற்றுச்சூழல் நோய் அபாயக் குறியீட்டை (Low, Moderate, High, Severe) உடனுக்குடன் கணக்கிடும்.`,
      followUpsEn: ['What is the Environmental Risk Index?', 'How does high humidity trigger Leaf Spot?', 'How do I scan a leaf?'],
      followUpsTa: ['சுற்றுச்சூழல் அபாயக் குறியீடு என்றால் என்ன?', 'அதிக ஈரப்பதம் எவ்வாறு இலைப்புள்ளி நோயைத் தூண்டுகிறது?', 'இலையை எவ்வாறு ஸ்கேன் செய்வது?'],
    },
  },

  {
    id: 'humidity_importance',
    match: (q) =>
      q.includes('humidity') ||
      q.includes('why humidity') ||
      q.includes('air moisture') ||
      q.includes('ஈரப்பதம்') ||
      q.includes('காற்றின் ஈரப்பதம்'),
    response: {
      category: 'environment',
      textEn: () =>
        `💧 **High humidity** can keep leaves wet for longer.\n\n` +
        `Together with rainfall, temperature and other conditions, this can support some foliar disease development.\n\n` +
        `Curcuma considers these environmental factors in its risk analysis.`,
      textTa: () =>
        `💧 **அதிக ஈரப்பதம்** இலைகளின் மேற்பரப்பில் நீர்த்துளிகளை நீண்ட நேரம் நிலைநிறுத்துகிறது.\n\n` +
        `மழை மற்றும் வெப்பநிலையுடன் சேர்ந்து, இது இலை நோய்கள் உருவாக சாதகமான சூழலை அமைக்கிறது.\n\n` +
        `Curcuma இதனை கள ஆய்வு மற்றும் வானிலை பகுதியில் கண்காணிக்கிறது.`,
      followUpsEn: ['Why does rainfall matter?', 'What is environmental risk?'],
      followUpsTa: ['மழை அளவு ஏன் முக்கியம்?', 'சுற்றுச்சூழல் அபாயம் என்றால் என்ன?'],
    },
  },

  {
    id: 'rainfall_importance',
    match: (q) =>
      q.includes('rain') ||
      q.includes('rainfall') ||
      q.includes('precipitation') ||
      q.includes('waterlogging') ||
      q.includes('weather matter') ||
      q.includes('why does weather') ||
      q.includes('why weather') ||
      q.includes('மழை') ||
      q.includes('மழை அளவு') ||
      q.includes('நீர் தேங்குதல்') ||
      q.includes('வானிலை ஏன் முக்கியம்'),
    response: {
      category: 'environment',
      textEn: () =>
        `🌧️ **Rainfall and weather conditions matter because:**\n\n` +
        `• Rain splash can spread fungal spores between leaves.\n` +
        `• Stagnant furrow water increases root stress and rhizome rot risk.\n` +
        `Curcuma integrates live weather and field observations into its risk engine.`,
      textTa: () =>
        `🌧️ **மழை மற்றும் வானிலை காரணிகள் ஏன் முக்கியம்:**\n\n` +
        `• மழைத் தூறல் பூஞ்சை வித்துக்களை மற்ற இலைகளுக்கு பரவச் செய்கிறது.\n` +
        `• பாத்திகளில் நீர் தேங்குவது வேர் மற்றும் கிழங்கு அழுகல் அபாயத்தை உயர்த்துகிறது.\n` +
        `Curcuma நேரலை வானிலை மற்றும் கள அளவீடுகளை இணைத்து அபாயத்தை கணக்கிடுகிறது.`,
      followUpsEn: ['Why is leaf wetness important?', 'What is environmental risk?'],
      followUpsTa: ['இலை ஈரப்பதம் ஏன் முக்கியம்?', 'சுற்றுச்சூழல் அபாயம் என்றால் என்ன?'],
    },
  },

  {
    id: 'leaf_wetness_and_temp',
    match: (q) =>
      q.includes('leaf wetness') ||
      q.includes('temperature') ||
      q.includes('soil moisture') ||
      q.includes('dew') ||
      q.includes('வெப்பநிலை') ||
      q.includes('இலை ஈரப்பதம்') ||
      q.includes('மண் ஈரப்பதம்') ||
      q.includes('பனி'),
    response: {
      category: 'environment',
      textEn: () =>
        `🌡️ **Temperature & Moisture Factors:**\n\n` +
        `• **Leaf Wetness:** Fungal spores need a continuous moisture film on the leaf surface to penetrate tissue.\n` +
        `• **Temperature (22–30°C):** Warm tropical temperatures accelerate fungal spore incubation.\n` +
        `• **Soil Moisture:** Optimal moisture supports growth, while continuous saturation causes root rot.`,
      textTa: () =>
        `🌡️ **வெப்பநிலை மற்றும் ஈரப்பதம்:**\n\n` +
        `• **இலை ஈரப்பதம்:** பூஞ்சை இலைக்குள் நுழைய தொடர் ஈரப்பதம் தேவை.\n` +
        `• **வெப்பநிலை (22–30°C):** மிதமான வெப்பம் பூஞ்சை வளர்ச்சியை துரிதப்படுத்துகிறது.\n` +
        `• **மண் ஈரப்பதம்:** மிதமான ஈரப்பதம் வளர்ச்சிக்கு நல்லது; நீர் தேங்குவது வேர் அழுகலை உண்டாக்கும்.`,
      followUpsEn: ['What is environmental risk?', 'Why is humidity important?'],
      followUpsTa: ['சுற்றுச்சூழல் அபாயம் என்றால் என்ன?', 'ஈரப்பதம் ஏன் முக்கியம்?'],
    },
  },

  {
    id: 'what_is_env_risk',
    match: (q) =>
      q.includes('environmental risk') ||
      q.includes('field risk') ||
      q.includes('risk score') ||
      q.includes('சுற்றுச்சூழல் அபாயம்') ||
      q.includes('வானிலை அபாயம்') ||
      q.includes('அபாய குறியீடு'),
    response: {
      category: 'environment',
      textEn: (ctx) => {
        const risk = ctx.envRiskResult?.riskLevel || 'Calculated in Field Check';
        return (
          `🌦️ **Environmental Risk** is Curcuma's computed index measuring how favorable current weather and field parameters are for turmeric foliar disease.\n\n` +
          `It combines temperature, humidity, rainfall, and leaf wetness.\n\n` +
          `Current Field Risk: **${risk}**.`
        );
      },
      textTa: (ctx) => {
        const risk = ctx.envRiskResult?.riskLevel || 'கள ஆய்வில் கணக்கிடப்படுகிறது';
        return (
          `🌦️ **சுற்றுச்சூழல் அபாயம்** என்பது தற்போதைய வானிலை காரணிகள் மஞ்சள் பயிர் நோய்கள் உருவாக எவ்வளவு சாதகமாக உள்ளன என்பதைக் கணக்கிடும் குறியீடாகும்.\n\n` +
          `தற்போதைய அபாய நிலை: **${risk}**.`
        );
      },
      followUpsEn: ['Is my current field risk high?', 'How do I use Field Check?'],
      followUpsTa: ['எனது வயல் அபாயம் அதிகமாக உள்ளதா?', 'கள ஆய்வு செய்வது எப்படி?'],
    },
  },

  // -------------------------------------------------------------
  // E. CURRENT CURCUMA CONTEXT
  // -------------------------------------------------------------
  {
    id: 'why_this_result',
    match: (q) =>
      (q.includes('result') && (q.includes('why') || q.includes('scan') || q.includes('leaf') || q.includes('get') || q.includes('show') || q.includes('my'))) ||
      q.includes('my scan') ||
      q.includes('last scan') ||
      q.includes('this leaf') ||
      q.includes('confidence mean') ||
      q.includes('what does this confidence mean') ||
      q.includes('எனது ஸ்கேன்') ||
      q.includes('ஸ்கேன் முடிவு') ||
      q.includes('ஏன் இந்த முடிவு') ||
      q.includes('நம்பிக்கை மதிப்பு என்ன'),
    response: {
      category: 'context',
      textEn: (ctx) => {
        if (!ctx.hasAnalyzedImage || !ctx.imageResult) {
          return (
            `📷 No leaf scan has been run in your active session yet.\n\n` +
            `Open **Scan Leaf**, upload or capture a clear turmeric leaf photo, and run analysis to see your prediction and confidence.`
          );
        }
        const disease = ctx.imageResult.disease;
        const conf = (ctx.imageResult.confidence * 100).toFixed(1);
        const status = ctx.imageResult.oodStatus;

        if (status === 'OOD_REJECTED' || status === 'VERIFIER_REJECTED') {
          return (
            `⚠️ Your last uploaded image was flagged by the **Out-of-Domain (OOD) safeguard** as non-turmeric or unclear.\n\n` +
            `Please upload a clear, focused photograph of a turmeric leaf surface.`
          );
        }

        return (
          `🍃 Your scan was classified as **${disease}** with **${conf}%** confidence.\n\n` +
          `The classification is based on the visual pattern detected by the model.\n\n` +
          `Open **Why this result?** on your result page for available prediction details.`
        );
      },
      textTa: (ctx) => {
        if (!ctx.hasAnalyzedImage || !ctx.imageResult) {
          return (
            `📷 இந்த அமர்வில் இதுவரை இலை ஸ்கேன் செய்யப்படவில்லை.\n\n` +
            `**Scan Leaf** பகுதிக்குச் சென்று மஞ்சள் இலைப் புகைப்படத்தைப் பதிவேற்றி நேரலை கணிப்பைப் பெறவும்.`
          );
        }
        const disease = ctx.imageResult.disease;
        const conf = (ctx.imageResult.confidence * 100).toFixed(1);

        return (
          `🍃 உங்கள் ஸ்கேன் முடிவு: **${disease}** (நம்பிக்கை மதிப்பு: **${conf}%**).\n\n` +
          `இந்த கணிப்பு AI மாடல் கண்டறிந்த இலை அறிகுறிகளின் அடிப்படையில் அமைந்தது.\n\n` +
          `கூடுதல் விவரங்களுக்கு Scan Leaf பக்கத்தில் உள்ள **Why this result?** பகுதியை பார்க்கவும்.`
        );
      },
      followUpsEn: (ctx) => {
        const d = ctx.imageResult?.disease;
        if (d === 'Aphids') return ['Why did my scan show Aphids?', 'How can I identify Aphids?', 'What should I monitor now?'];
        if (d === 'Leaf Blotch') return ['Why did my scan show Blotch?', 'How can I identify Blotch?', 'What should I monitor now?'];
        if (d === 'Healthy') return ['What does my Healthy result mean?', 'How can I maintain crop health?', 'What should I monitor next?'];
        return ['Why did my scan show Leaf Spot?', 'How can I identify Leaf Spot?', 'What should I do now?'];
      },
      followUpsTa: (ctx) => {
        const d = ctx.imageResult?.disease;
        if (d === 'Aphids') return ['எனது ஸ்கேன் ஏன் அசுவினியைக் காட்டியது?', 'அசுவினி பூச்சிகளை எவ்வாறு அடையாளம் காண்பது?', 'இப்போது எவற்றை கண்காணிக்க வேண்டும்?'];
        if (d === 'Leaf Blotch') return ['எனது ஸ்கேன் ஏன் இலைக்கருகல் நோயைக் காட்டியது?', 'இலைக்கருகல் நோயை எவ்வாறு அடையாளம் காண்பது?', 'இப்போது எவற்றை கண்காணிக்க வேண்டும்?'];
        if (d === 'Healthy') return ['ஆரோக்கியமான முடிவு என்றால் என்ன?', 'பயிரின் ஆரோக்கியத்தை எவ்வாறு பராமரிப்பது?', 'அடுத்து எவற்றை கண்காணிக்க வேண்டும்?'];
        return ['எனது ஸ்கேன் ஏன் இலைப்புள்ளி எனக் காட்டியது?', 'இலைப்புள்ளி நோயை எவ்வாறு அடையாளம் காண்பது?', 'இப்போது என்ன செய்ய வேண்டும்?'];
      },
    },
  },

  {
    id: 'current_field_risk',
    match: (q) =>
      q.includes('is my current field risk high') ||
      q.includes('my field risk') ||
      q.includes('current weather') ||
      q.includes('today weather') ||
      q.includes('எனது வயல் அபாயம்') ||
      q.includes('இன்றைய வானிலை'),
    response: {
      category: 'context',
      textEn: (ctx) => {
        const loc = ctx.selectedLocation ? `${ctx.selectedLocation.name}, ${ctx.selectedLocation.district}` : 'Tamil Nadu';
        const temp = ctx.envParameters?.temperature ?? 28;
        const hum = ctx.envParameters?.humidity ?? 75;
        const risk = ctx.envRiskResult?.riskLevel || 'Moderate';

        return (
          `📍 **Current Field Status (${loc}):**\n\n` +
          `• **Temperature:** ${temp}°C | **Humidity:** ${hum}%\n` +
          `• **Environmental Risk Level:** **${risk}**\n\n` +
          `View 14-day forecasts and hourly risk trends in **Weather & Risk**.`
        );
      },
      textTa: (ctx) => {
        const loc = ctx.selectedLocation ? `${ctx.selectedLocation.name}` : 'தமிழ்நாடு';
        const temp = ctx.envParameters?.temperature ?? 28;
        const hum = ctx.envParameters?.humidity ?? 75;
        const risk = ctx.envRiskResult?.riskLevel || 'மிதமானது';

        return (
          `📍 **தற்போதைய கள நிலை (${loc}):**\n\n` +
          `• **வெப்பநிலை:** ${temp}°C | **ஈரப்பதம்:** ${hum}%\n` +
          `• **சுற்றுச்சூழல் அபாய நிலை:** **${risk}**\n\n` +
          `14 நாள் வானிலை மற்றும் அபாயப் போக்கினை **Weather & Risk** பக்கத்தில் காணலாம்.`
        );
      },
      followUpsEn: ['Why is humidity important?', 'How do I use Field Check?'],
      followUpsTa: ['ஈரப்பதம் ஏன் முக்கியம்?', 'கள ஆய்வு செய்வது எப்படி?'],
    },
  },

  // -------------------------------------------------------------
  // F. APP HELP & NAVIGATION
  // -------------------------------------------------------------
  {
    id: 'how_to_scan',
    match: (q) =>
      q.includes('how do i scan') ||
      q.includes('how to scan') ||
      q.includes('upload a photo') ||
      q.includes('take a photo') ||
      q.includes('how to use scan') ||
      q.includes('ஸ்கேன் செய்வது எப்படி') ||
      q.includes('படம் எடுப்பது எப்படி') ||
      q.includes('புகைப்படம் பதிவேற்றம்'),
    response: {
      category: 'app',
      textEn: () =>
        `📸 **How to Scan a Leaf:**\n\n` +
        `1. Open **Scan Leaf** from the sidebar or dashboard.\n` +
        `2. Tap **Upload Photo** or take a clear photo of a single turmeric leaf.\n` +
        `3. Tap **Run AI Disease Analysis** to see the prediction.`,
      textTa: () =>
        `📸 **மஞ்சள் இலையை ஸ்கேன் செய்யும் முறை:**\n\n` +
        `1. மெனுவிலிருந்து **Scan Leaf** பக்கத்திற்குச் செல்லவும்.\n` +
        `2. **Upload Photo** அழுத்தி இலையின் தெளிவான புகைப்படத்தைப் பதிவேற்றவும்.\n` +
        `3. **Run AI Disease Analysis** அழுத்தி கணிப்பைப் பெறவும்.`,
      followUpsEn: ['What is Leaf Spot?', 'Why did my scan get this result?'],
      followUpsTa: ['இலைப்புள்ளி நோய் என்றால் என்ன?', 'எனது ஸ்கேன் முடிவு என்ன?'],
    },
  },

  {
    id: 'how_to_field_check',
    match: (q) =>
      q.includes('how to use field check') ||
      q.includes('how do i use field check') ||
      q.includes('field check') ||
      q.includes('field check values') ||
      q.includes('கள ஆய்வு') ||
      q.includes('field check எப்படி'),
    response: {
      category: 'app',
      textEn: () =>
        `🌾 **Using Field Check:**\n\n` +
        `• Navigate to **Field Check** in the menu.\n` +
        `• Adjust temperature, humidity, rainfall, and soil moisture sliders.\n` +
        `• The risk gauge instantly calculates the environmental risk score.`,
      textTa: () =>
        `🌾 **கள ஆய்வு (Field Check) பயன்படுத்தும் முறை:**\n\n` +
        `• மெனுவிலிருந்து **Field Check** பக்கத்தைத் திறக்கவும்.\n` +
        `• வெப்பநிலை, ஈரப்பதம், மழை அளவு ஆகிய அளவீடுகளை மாற்றி உடனடி அபாய அளவைக் கணக்கிடலாம்.`,
      followUpsEn: ['What is environmental risk?', 'Why does rainfall matter?'],
      followUpsTa: ['சுற்றுச்சூழல் அபாயம் என்றால் என்ன?', 'மழை அளவு ஏன் முக்கியம்?'],
    },
  },

  {
    id: 'history_and_language',
    match: (q) =>
      q.includes('previous scan') ||
      q.includes('see history') ||
      q.includes('previous scans') ||
      q.includes('change tamil') ||
      q.includes('change language') ||
      q.includes('english to tamil') ||
      q.includes('முந்தைய பதிவுகள்') ||
      q.includes('மொழி மாற்றம்') ||
      q.includes('தமிழ் ஆங்கிலம்'),
    response: {
      category: 'app',
      textEn: (ctx) =>
        `⚙️ **App Navigation Tips:**\n\n` +
        `• **Previous Scans:** Open **History** from the sidebar (you have ${ctx.historyCount} saved scans).\n` +
        `• **Change Language:** Tap **English / தமிழ்** at the top of the app or in this chat header to toggle anytime.`,
      textTa: (ctx) =>
        `⚙️ **பயன்பாட்டு வழிகாட்டல்:**\n\n` +
        `• **முந்தைய பதிவுகள்:** மெனுவில் **History** பக்கத்தைத் திறக்கவும் (தற்போது ${ctx.historyCount} பதிவுகள் உள்ளன).\n` +
        `• **மொழி மாற்றம்:** தலைப்புப் பட்டியில் உள்ள **English / தமிழ்** பொத்தானை அழுத்தி மொழியை மாற்றலாம்.`,
      followUpsEn: ['How do I scan a leaf?', 'What is turmeric?'],
      followUpsTa: ['இலையை ஸ்கேன் செய்வது எப்படி?', 'மஞ்சள் என்றால் என்ன?'],
    },
  },

  // -------------------------------------------------------------
  // G. PROJECT / RESEARCH FACTS
  // -------------------------------------------------------------
  {
    id: 'efficientnet_specific',
    match: (q) =>
      q.includes('efficientnet') ||
      q.includes('why efficientnet'),
    response: {
      category: 'research',
      textEn: () =>
        `🧠 **EfficientNet-B0** is the main image-classification model used in Curcuma.\n\n` +
        `It extracts visual features from the turmeric leaf image to help classify the foliar condition.`,
      textTa: () =>
        `🧠 **EfficientNet-B0** என்பது Curcuma செயலியில் பயன்படுத்தப்படும் முதன்மை பட வகைப்படுத்தல் மாதிரியாகும்.\n\n` +
        `இது இலைப்படத்திலிருந்து முக்கிய காட்சி அம்சங்களை பிரித்தெடுத்து நோயை வகைப்படுத்துகிறது.`,
      followUpsEn: ['Why MobileNetV2?', 'What is the hybrid model?'],
      followUpsTa: ['MobileNetV2 ஏன்?', 'ஹைப்ரிட் மாடல் என்றால் என்ன?'],
    },
  },

  {
    id: 'mobilenet_specific',
    match: (q) =>
      q.includes('mobilenet') ||
      q.includes('why mobilenet'),
    response: {
      category: 'research',
      textEn: () =>
        `⚡ **MobileNetV2** is a lightweight, edge-optimized convolutional network.\n\n` +
        `Curcuma pairs it with EfficientNet-B0 in a 50:50 hybrid ensemble to reduce individual model prediction variance.`,
      textTa: () =>
        `⚡ **MobileNetV2** என்பது ஒரு இலகுரக, விரைவான கன்வல்யூஷனல் நெட்வொர்க் ஆகும்.\n\n` +
        `தனிப்பட்ட மாதிரி பிழைகளைக் குறைப்பதற்காக இது EfficientNet-B0 உடன் 50:50 விகிதத்தில் இணைக்கப்பட்டுள்ளது.`,
      followUpsEn: ['What is EfficientNet-B0?', 'What is the hybrid model?'],
      followUpsTa: ['EfficientNet-B0 என்றால் என்ன?', 'ஹைப்ரிட் மாடல் என்றால் என்ன?'],
    },
  },

  {
    id: 'hybrid_model',
    match: (q) =>
      q.includes('hybrid model') ||
      q.includes('dual backbone') ||
      q.includes('ensemble') ||
      q.includes('ஹைப்ரிட் மாடல்'),
    response: {
      category: 'research',
      textEn: () =>
        `🧠 **The Hybrid Model** is a dual-backbone ensemble combining EfficientNet-B0 and MobileNetV2 using soft-voting (α = 0.50).\n\n` +
        `It balances feature richness with edge efficiency for robust turmeric disease detection.`,
      textTa: () =>
        `🧠 **ஹைப்ரிட் மாதிரி (Hybrid Model)** என்பது EfficientNet-B0 மற்றும் MobileNetV2 மாடல்களை சமவிகிதத்தில் (α = 0.50) இணைக்கும் ஒரு இரட்டை கூட்டமைப்பு மாதிரியாகும்.`,
      followUpsEn: ['What is the OOD safeguard?', 'What is your model accuracy?'],
      followUpsTa: ['OOD பாதுகாப்பு என்றால் என்ன?', 'மாடலின் துல்லியம் என்ன?'],
    },
  },

  {
    id: 'ood_and_mahalanobis',
    match: (q) =>
      q.includes('ood') ||
      q.includes('out-of-domain') ||
      q.includes('out of domain') ||
      q.includes('mahalanobis') ||
      q.includes('safeguard') ||
      q.includes('verifier') ||
      q.includes('மகலனோபிஸ்') ||
      q.includes('பாதுகாப்பு முறை'),
    response: {
      category: 'research',
      textEn: () =>
        `🛡️ **Mahalanobis Distance & OOD Safeguard:**\n\n` +
        `• Neural networks can make false predictions on non-leaf images.\n` +
        `• Curcuma extracts 1280-D features and computes **Mahalanobis statistical distance** (threshold τ = 63.10) to detect and reject non-turmeric photos.`,
      textTa: () =>
        `🛡️ **OOD பாதுகாப்பு & மகலனோபிஸ் தொலைவு:**\n\n` +
        `• மஞ்சள் இலை அல்லாத படங்களை (மனித முகங்கள், பிற பொருட்கள்) தவறாக கணிப்பதைத் தடுக்க இது உதவுகிறது.\n` +
        `• **மகலனோபிஸ் தொலைவு (τ = 63.10)** மூலம் இலை அல்லாத படங்கள் தானாக நிராகரிக்கப்படுகின்றன.`,
      followUpsEn: ['What dataset do you use?', 'What is your model accuracy?'],
      followUpsTa: ['என்ன தரவுத்தொகுப்பு பயன்படுத்தப்பட்டது?', 'மாடலின் துல்லியம் என்ன?'],
    },
  },

  {
    id: 'dataset_and_accuracy',
    match: (q) =>
      q.includes('dataset') ||
      q.includes('accuracy') ||
      q.includes('test accuracy') ||
      q.includes('performance') ||
      q.includes('limitation') ||
      q.includes('field validation') ||
      q.includes('தரவுத்தொகுப்பு') ||
      q.includes('துல்லியம்') ||
      q.includes('துல்லியத்தன்மை'),
    response: {
      category: 'research',
      textEn: () =>
        `📊 **Dataset & Model Accuracy Facts:**\n\n` +
        `• **Classes:** Leaf Blotch, Leaf Spot, Aphids, and Healthy turmeric foliage.\n` +
        `• **Accuracy:** Hybrid Ensemble achieved **98.1%** test accuracy (vs 97.4% EfficientNet-B0 and 95.8% MobileNetV2).\n` +
        `• **Scope:** A decision-support assistant; agronomist field validation remains essential for treatment.`,
      textTa: () =>
        `📊 **தரவுத்தொகுப்பு மற்றும் துல்லியத் தகவல்கள்:**\n\n` +
        `• **பிரிவுகள்:** இலைக்கருகல், இலைப்புள்ளி, அசுவினி மற்றும் ஆரோக்கியமான இலைகள்.\n` +
        `• **துல்லியம்:** ஹைப்ரிட் மாடல் **98.1%** சோதனை துல்லியத்தைக் கொண்டுள்ளது.\n` +
        `• **நோக்கம்:** இது விவசாயிகளுக்கான முடிவு ஆதரவு அமைப்பாகும்.`,
      followUpsEn: ['Why EfficientNet-B0?', 'What is the OOD safeguard?'],
      followUpsTa: ['EfficientNet-B0 ஏன்?', 'OOD பாதுகாப்பு என்றால் என்ன?'],
    },
  },

  // -------------------------------------------------------------
  // H. HARDWARE & SENSORS
  // -------------------------------------------------------------
  {
    id: 'esp32_specific',
    match: (q) =>
      q.includes('esp32') ||
      q.includes('microcontroller') ||
      q.includes('field controller'),
    response: {
      category: 'hardware',
      textEn: () =>
        `📡 **ESP32** is the field controller planned for Curcuma's sensor setup.\n\n` +
        `It collects measurements such as temperature, humidity, and soil moisture, then sends them to the application.`,
      textTa: () =>
        `📡 **ESP32** என்பது Curcuma IoT சென்சார் அமைப்பிற்காக திட்டமிடப்பட்ட கள மைக்ரோ கன்ட்ரோலர் ஆகும்.\n\n` +
        `இது வெப்பநிலை, ஈரப்பதம், மண் ஈரப்பதம் போன்ற அளவீடுகளை சேகரித்து பயன்பாட்டிற்கு அனுப்புகிறது.`,
      followUpsEn: ['What does DHT22 measure?', 'What does the soil moisture sensor measure?'],
      followUpsTa: ['DHT22 என்ன அளவிடுகிறது?', 'மண் சென்சார் என்ன அளவிடுகிறது?'],
    },
  },

  {
    id: 'dht22_specific',
    match: (q) =>
      q.includes('dht22') ||
      q.includes('temperature sensor'),
    response: {
      category: 'hardware',
      textEn: () =>
        `🌡️ The **DHT22 sensor** measures ambient air temperature and relative humidity in the crop canopy.`,
      textTa: () =>
        `🌡️ **DHT22 சென்சார்** பயிர் சூழ்நிலையின் காற்றின் வெப்பநிலை மற்றும் ஈரப்பதத்தை அளவிடுகிறது.`,
      followUpsEn: ['What is ESP32?', 'What does the soil moisture sensor measure?'],
      followUpsTa: ['ESP32 என்றால் என்ன?', 'மண் சென்சார் என்ன அளவிடுகிறது?'],
    },
  },

  {
    id: 'sensor_general',
    match: (q) =>
      q.includes('sensor') ||
      q.includes('soil moisture sensor') ||
      q.includes('hardware') ||
      q.includes('how does field sensor') ||
      q.includes('how does the field sensor') ||
      q.includes('simulation') ||
      q.includes('சென்சார்') ||
      q.includes('ஹார்டுவேர்') ||
      q.includes('மண் சென்சார்'),
    response: {
      category: 'hardware',
      textEn: () =>
        `📡 **Curcuma Sensor Architecture:**\n\n` +
        `• **DHT22:** Measures ambient temperature and relative humidity.\n` +
        `• **Soil Moisture Sensor:** Measures root-zone moisture content.\n` +
        `• **Data Flow:** ESP32 sends live sensor readings to the backend; manual sliders and Open-Meteo weather currently power Field Check.`,
      textTa: () =>
        `📡 **Curcuma சென்சார் கட்டமைப்பு:**\n\n` +
        `• **DHT22:** வெப்பநிலை மற்றும் காற்றின் ஈரப்பதத்தை அளவிடுகிறது.\n` +
        `• **மண் ஈரப்பதம் சென்சார்:** வேர்ப்பகுதி மண்ணின் ஈரப்பதத்தை அளவிடுகிறது.\n` +
        `• **செயல்முறை:** சென்சார் தரவுகள் சர்வர் வழியாக பயன்பாட்டை வந்தடைகின்றன.`,
      followUpsEn: ['What is ESP32?', 'What does DHT22 measure?'],
      followUpsTa: ['ESP32 என்றால் என்ன?', 'DHT22 என்ன அளவிடுகிறது?'],
    },
  },
];

/**
 * Semantic intent query matcher for Ask Curcuma
 */
export function queryCurcumaKnowledge(
  userQuery: string,
  currentLanguage: 'en' | 'ta',
  appContext?: ChatAppContext
): {
  reply: string;
  category: ChatMessage['category'];
  suggestedFollowUps: string[];
} {
  const normalized = userQuery
    .toLowerCase()
    .trim()
    .replace(/[?!.,;:"'()]/g, ' ')
    .replace(/\s+/g, ' ');

  const ctx: ChatAppContext = appContext || {
    hasAnalyzedImage: false,
    historyCount: 0,
  };

  // 1. Greeting
  const greetings = ['hi', 'hello', 'hey', 'வணக்கம்', 'ஹலோ', 'ஹாய்', 'good morning', 'good evening', 'who are you', 'ask curcuma'];
  if (greetings.some((g) => normalized === g || normalized.startsWith(g + ' '))) {
    return {
      reply:
        currentLanguage === 'ta'
          ? `🌱 வணக்கம்! நான் **Ask Curcuma** – உங்கள் மஞ்சள் பயிர் உதவி AI.\n\n` +
            `மஞ்சள் நலம், இலை நோய்கள், கள வானிலை அபாயம் அல்லது பயன்பாட்டு உதவி குறித்து என்னிடம் கேட்கலாம்.\n\n` +
            `கீழே உள்ள கேள்விகளில் ஒன்றைத் தேர்வு செய்யவும் அல்லது உங்கள் கேள்வியைத் தட்டச்சு செய்யவும்!`
          : `🌱 Hello! I am **Ask Curcuma** – your Turmeric crop and decision support assistant.\n\n` +
            `You can ask me about turmeric diseases, crop development, environmental risks, or your scan results.\n\n` +
            `Tap a question below or type your inquiry!`,
      category: 'general',
      suggestedFollowUps:
        currentLanguage === 'ta'
          ? ['மஞ்சள் என்றால் என்ன?', 'இலைப்புள்ளி நோய் என்றால் என்ன?', 'எனது ஸ்கேன் முடிவு என்ன?', 'வானிலை ஏன் முக்கியம்?']
          : ['What is turmeric?', 'What is Leaf Spot?', 'Why did my scan get this result?', 'Why does weather matter?'],
    };
  }

  // 2. Intent matching
  for (const intent of INTENTS) {
    if (intent.match(normalized)) {
      const resp = intent.response;
      const followUpsEn = typeof resp.followUpsEn === 'function' ? resp.followUpsEn(ctx, userQuery) : resp.followUpsEn;
      const followUpsTa = typeof resp.followUpsTa === 'function' ? resp.followUpsTa(ctx, userQuery) : resp.followUpsTa;
      return {
        reply: currentLanguage === 'ta' ? resp.textTa(ctx, userQuery) : resp.textEn(ctx, userQuery),
        category: resp.category,
        suggestedFollowUps: currentLanguage === 'ta' ? followUpsTa : followUpsEn,
      };
    }
  }

  // 3. Concise Domain Fallback
  if (currentLanguage === 'ta') {
    return {
      reply:
        `🌱 நான் மஞ்சள் (*Curcuma longa*) பயிர் நலம், இலை நோய்கள், கள வானிலை அபாயம் மற்றும் Curcuma செயலி வழிகாட்டலில் உதவ முடியும்.\n\n` +
        `மஞ்சள் இலை நோய்கள் (இலைக்கருகல், இலைப்புள்ளி, அசுவினி), வளர்ச்சி நிலைகள் அல்லது ஸ்கேன் முடிவுகள் குறித்து கேளுங்கள்!`,
      category: 'general',
      suggestedFollowUps: [
        'மஞ்சள் என்றால் என்ன?',
        'இலைப்புள்ளி நோய் என்றால் என்ன?',
        'இலைக்கருகல் நோய் என்றால் என்ன?',
        'வானிலை ஏன் முக்கியம்?',
      ],
    };
  }

  return {
    reply:
      `🌱 I specialize in Turmeric (*Curcuma longa*) crop health, disease diagnostics, weather risks, and Curcuma app guidance.\n\n` +
      `Ask me anything about turmeric leaves, diseases (Leaf Spot, Blotch, Aphids), growth stages, or your scan results!`,
    category: 'general',
    suggestedFollowUps: [
      'What is turmeric?',
      'What is Leaf Spot?',
      'What is Leaf Blotch?',
      'Why does weather matter?',
    ],
  };
}
