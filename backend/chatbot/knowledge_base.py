"""
Curcuma Domain Knowledge Base (Structured RAG Chunks)
=====================================================
Contains verified Curcuma project facts, disease definitions, symptoms, formation biology,
treatment & cultural management guidelines, environmental factors, and app help:
1. General Turmeric (Curcuma longa)
2. Diseases & Pests (Definitions, Symptoms, Formation, and Non-Chemical Treatment/Management)
3. Environmental Factors (Humidity, Rainfall, Leaf Wetness, Temp, Risk)
4. Curcuma Project & ML Research (Architecture, EfficientNet 99.22%, Verifier, OOD) - Authoritative Project Facts
5. Hardware & IoT Sensors (ESP32, DHT22, Capacitive Soil Moisture)
6. App Help & Usage (Scan Leaf, Field Check, Weather & Risk, History)
"""

from typing import List, Dict, Any

KNOWLEDGE_CHUNKS: List[Dict[str, Any]] = [
    # -------------------------------------------------------------
    # 1. GENERAL TURMERIC
    # -------------------------------------------------------------
    {
        "id": "turmeric_basics",
        "topic": "General Turmeric Basics",
        "category": "general_turmeric",
        "keywords": ["turmeric", "curcuma longa", "what is turmeric", "manjal", "curcumin", "plant", "spice", "crop", "மஞ்சள்"],
        "content_en": (
            "Turmeric (Curcuma longa) is a tropical herbaceous perennial plant belonging to the Zingiberaceae (ginger) family. "
            "It is widely cultivated in India, especially in Tamil Nadu and Andhra Pradesh, for its underground rhizomes. "
            "The primary active bioactive constituent is curcumin, which imparts the vibrant yellow color and possesses antioxidant and anti-inflammatory properties. "
            "In agriculture, turmeric is an 7-9 month duration crop requiring warm, humid tropical conditions and well-drained soil."
        ),
        "content_ta": (
            "மஞ்சள் (Curcuma longa) என்பது இஞ்சி குடும்பத்தைச் (Zingiberaceae) சேர்ந்த ஒரு வெப்பமண்டல கிழங்குப் பயிராகும். "
            "தமிழ்நாடு மற்றும் ஆந்திராவில் பரவலாக சாகுபடி செய்யப்படுகிறது. "
            "இதன் முக்கிய செயல்திறன் கொண்ட வேதிப்பொருள் குர்குமின் (Curcumin) ஆகும், இது சிறந்த மருத்துவ குணங்களையும் மஞ்சள் நிறத்தையும் தருகிறது. "
            "இது 7 முதல் 9 மாத கால பயிராகும்."
        ),
    },
    {
        "id": "turmeric_rhizome_growth",
        "topic": "Rhizome & Growth Stages",
        "category": "general_turmeric",
        "keywords": ["rhizome", "growth stage", "stages", "mother rhizome", "finger rhizome", "harvest", "dap", "planting", "sprouting", "bulking", "maturity", "வளர்ச்சி நிலை", "கிழங்கு"],
        "content_en": (
            "The turmeric crop cycle lasts 210–270 Days After Planting (DAP) across four primary stages:\n"
            "1. Sprouting Stage (0–30 DAP): Mother rhizome buds emerge from moist soil.\n"
            "2. Vegetative Phase (30–90 DAP): Leaf sheath and canopy development, tillering, and vigorous foliar growth.\n"
            "3. Rhizome Bulking Stage (90–180 DAP): Active formation and thickening of primary and secondary finger rhizomes underground.\n"
            "4. Maturity & Senescence (180–240+ DAP): Vegetative canopy yellows and naturally dries down, signaling harvest readiness."
        ),
        "content_ta": (
            "மஞ்சள் பயிரின் வளர்ச்சி நிலைகள் (210–270 நாட்கள்):\n"
            "1. முளைப்பு பருவம் (0–30 நாள்): விதைக்கிழங்கில் இருந்து தளிர்கள் தோன்றுதல்.\n"
            "2. தழை வளர்ச்சி பருவம் (30–90 நாள்): இலைகள் விரிவடைந்து தூர்கள் உருவாகுதல்.\n"
            "3. கிழங்கு பெருக்கும் பருவம் (90–180 நாள்): பக்கவாட்டு விரல் கிழங்குகள் பெருகுதல்.\n"
            "4. முதிர்ச்சி பருவம் (180–240+ நாள்): இலைகள் மஞ்சள் நிறமாகி காய்ந்து அறுவடைக்கு தயாராதல்."
        ),
    },
    {
        "id": "turmeric_field_care",
        "topic": "Field Management & Irrigation",
        "category": "general_turmeric",
        "keywords": ["maintain", "care", "field care", "cultivation", "ridges", "drainage", "irrigation", "soil", "bed", "பராமரிப்பு", "பாசனம்", "வடிகால்"],
        "content_en": (
            "Turmeric field management essentials (General Background):\n"
            "• Soil & Bedding: Raised beds or ridges-and-furrows are recommended in loamy soil to provide root aeration.\n"
            "• Drainage: Stagnant furrow water can lead to root stress and rhizome decay. Good drainage is essential.\n"
            "• Canopy Monitoring: Regular visual scouting of lower leaf undersides enables early observation of spots or pest clusters."
        ),
        "content_ta": (
            "மஞ்சள் வயல் பராமரிப்பு குறிப்புகள் (பொது வழிகாட்டல்):\n"
            "• பாத்தி அமைப்பு: வேர் காற்றோட்டத்திற்கு மேட்டுப்பாத்திகள் அல்லது பார்-சால் அமைப்புகள் சிறந்தது.\n"
            "• வடிகால் வசதி: பாத்திகளில் நீர் தேங்குவதை தவிர்க்க வடிகால் வசதி மிக அவசியம்.\n"
            "• கள ஆய்வு: இலைகளின் அடிப்பகுதியை தொடர்ந்து கண்காணிப்பது ஆரம்ப அறிகுறிகளை கண்டறிய உதவும்."
        ),
    },

    # -------------------------------------------------------------
    # 2. TREATMENT & MANAGEMENT (Highest Priority for Treatment Queries)
    # -------------------------------------------------------------
    {
        "id": "treatment_leaf_spot",
        "topic": "Leaf Spot Treatment & Non-Chemical Management",
        "category": "treatment_management",
        "keywords": [
            "pesticide for leaf spot", "fungicide for leaf spot", "treatment for leaf spot", "control leaf spot",
            "manage leaf spot", "spray for leaf spot", "prevent leaf spot", "how to treat leaf spot",
            "leaf spot chemical", "leaf spot medicine", "leaf spot cure", "leaf spot control",
            "இலைப்புள்ளி மருந்து", "இலைப்புள்ளி கட்டுப்பாடு", "இலைப்புள்ளி மேலாண்மை", "இலைப்புள்ளி சிகிச்சை",
            "இலைப்புள்ளி தெளிக்க", "இலைப்புள்ளி தடுப்பு"
        ],
        "content_en": (
            "Leaf Spot Treatment & Management Guidance:\n"
            "• Chemical Treatment Safety: Chemical treatment must be based on currently approved product labels and local agricultural-extension (TNAU/ICAR/KVK) recommendations for turmeric Leaf Spot. Never guess or invent an unverified pesticide name, dosage, spray frequency, or chemical cocktail.\n"
            "• Immediate Non-Chemical / Cultural Management:\n"
            "  1. Regular scouting: Inspect lower canopy leaf surfaces frequently for early spot formation.\n"
            "  2. Field sanitation: Carefully remove and safely destroy severely affected diseased leaves to curb fungal spore transmission.\n"
            "  3. Moisture management: Reduce prolonged leaf wetness duration, avoid overhead sprinkler wetting, and ensure proper ridge-and-furrow drainage.\n"
            "  4. Canopy airflow: Maintain adequate plant spacing to allow good air circulation through the crop foliage.\n"
            "• Extension Advisory: Consult local TNAU / KVK agricultural extension specialists for current regionally registered products."
        ),
        "content_ta": (
            "மஞ்சள் இலைப்புள்ளி நோய் கட்டுப்பாடு மற்றும் மேலாண்மை வழிகாட்டல்:\n"
            "• வேதியியல் பாதுகாப்பு: பூஞ்சைக்கொல்லி அல்லது பூச்சிக்கொல்லி மருந்துகளைப் பயன்படுத்தும்போது, மத்திய/மாநில அரசால் அங்கீகரிக்கப்பட்ட தயாரிப்புகள் மற்றும் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU/KVK) பரிந்துரைகளை மட்டுமே பின்பற்ற வேண்டும். தவறான பூச்சிக்கொல்லி அல்லது மருந்தளவை ஒருபோதும் பயன்படுத்தக் கூடாது.\n"
            "• உடனடி உழவியல் மேலாண்மை முறைகள்:\n"
            "  1. தீவிரமாக பாதிக்கப்பட்ட இலைகளை பறித்து வயலை விட்டு அப்புறப்படுத்தி அழிக்கவும் (Field Sanitation).\n"
            "  2. இலைகளில் அதிக நேரம் பனி அல்லது நீர் தேங்காமல் பார்த்துக் கொள்ளுதல் மற்றும் நல்ல வடிகால் அமைத்தல்.\n"
            "  3. செடிகளுக்கு இடையே போதிய இடைவெளி விட்டு காற்றோட்டத்தை அதிகரிக்கவும்.\n"
            "  4. இலைகளின் அடிப்பகுதியை தொடர்ந்து கள ஆய்வு செய்து நோய் பரவலைக் கண்காணிக்கவும்."
        ),
    },
    {
        "id": "treatment_leaf_blotch",
        "topic": "Leaf Blotch Treatment & Non-Chemical Management",
        "category": "treatment_management",
        "keywords": [
            "pesticide for leaf blotch", "treatment for leaf blotch", "control leaf blotch", "manage leaf blotch",
            "spray for blotch", "prevent leaf blotch", "blotch medicine", "blotch chemical", "blotch cure",
            "இலைக்கருகல் மருந்து", "இலைக்கருகல் கட்டுப்பாடு", "இலைக்கருகல் மேலாண்மை", "இலைக்கருகல் சிகிச்சை"
        ],
        "content_en": (
            "Leaf Blotch Treatment & Management Guidance:\n"
            "• Chemical Treatment Safety: Chemical management must strictly follow current approved labels and local agricultural-extension (TNAU/ICAR/KVK) guidelines for Taphrina leaf blotch. Do not guess chemical concentrations or dosages.\n"
            "• Immediate Non-Chemical / Cultural Management:\n"
            "  1. Field sanitation: Collect and destroy heavily scorched and dried foliar debris.\n"
            "  2. Moisture control: Avoid water stagnation in furrows and ensure proper drainage during rainy periods.\n"
            "  3. Balanced nutrition: Avoid excessive nitrogenous fertilizers that promote lush, susceptible foliage.\n"
            "  4. Canopy aeration: Ensure adequate spacing between rows to enhance sunlight penetration and wind drying."
        ),
        "content_ta": (
            "மஞ்சள் இலைக்கருகல் நோய் கட்டுப்பாடு மற்றும் மேலாண்மை வழிகாட்டல்:\n"
            "• வேதியியல் பாதுகாப்பு: Taphrina இலைக்கருகல் நோய்க்கு அரசு மற்றும் TNAU/KVK பரிந்துரைத்த பூஞ்சைக்கொல்லி மருந்துகளை மட்டுமே லேபிள் விதிகளின்படி பயன்படுத்த வேண்டும். அங்கீகரிக்கப்படாத அளவுகளைப் பயன்படுத்தக் கூடாது.\n"
            "• உடனடி உழவியல் மேலாண்மை முறைகள்:\n"
            "  1. கருகிய மற்றும் உதிர்ந்த இலைகளைச் சேகரித்து எரிக்கவும்.\n"
            "  2. மழைக்காலங்களில் வயலில் நீர் தேங்காதவாறு வடிகால் வசதியை உறுதி செய்யவும்.\n"
            "  3. அளவுக்கு அதிகமான தழைச்சத்து (Nitrogen) உரங்களைத் தவிர்த்து சீரான உர மேலாண்மையைக் கையாளவும்.\n"
            "  4. சூரிய ஒளி மற்றும் காற்று படுமாறு செடிகளுக்கிடையே காற்றோட்டத்தை பராமரிக்கவும்."
        ),
    },
    {
        "id": "treatment_aphids",
        "topic": "Aphids Pest Control & Integrated Pest Management (IPM)",
        "category": "treatment_management",
        "keywords": [
            "pesticide for aphids", "control aphids", "treatment for aphids", "manage aphids",
            "spray for aphids", "aphid pest control", "aphid medicine", "aphid chemical",
            "அசுவினி மருந்து", "அசுவினி கட்டுப்பாடு", "அசுவினி மேலாண்மை", "பூச்சி மருந்து"
        ],
        "content_en": (
            "Aphids Pest Control & Integrated Pest Management Guidance:\n"
            "• Integrated Pest Management (IPM):\n"
            "  1. Yellow sticky traps: Install yellow sticky traps (15–20 traps/ha) across the field to monitor and mass-trap winged aphids.\n"
            "  2. Natural biological predators: Conserve beneficial natural enemies such as ladybird beetles (Coccinellids) and lacewings.\n"
            "  3. Water wash: In early mild clusters, a targeted clean water jet can dislodge colonies from tender shoots.\n"
            "• Chemical Treatment Safety: For severe infestations, consult TNAU/KVK extension for approved botanical (neem-based) or registered insecticidal formulations per official label instructions."
        ),
        "content_ta": (
            "அசுவினி பூச்சி கட்டுப்பாடு மற்றும் ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM):\n"
            "• உழவியல் மற்றும் உயிரியல் முறைகள்:\n"
            "  1. மஞ்சள் நிற ஒட்டும் பொறிகள்: ஹெக்டேருக்கு 15–20 மஞ்சள் நிற ஒட்டும் பொறிகளை வைத்து அசுவினிகளைக் கவரவும்.\n"
            "  2. இயற்கை எதிரிகள்: பொறிவண்டுகள் (Ladybird beetles) போன்ற நன்மை செய்யும் பூச்சிகளைப் பாதுகாக்கவும்.\n"
            "  3. ஆரம்பநிலை தடுப்பு: வேப்ப எண்ணெய் போன்ற தாவர பூச்சிவிரட்டிகளைப் பயன்படுத்தலாம்.\n"
            "• பூச்சிக்கொல்லி பாதுகாப்பு: கடுமையான தாக்குதல் இருந்தால், TNAU/KVK பரிந்துரைத்த பூச்சிக்கொல்லி மருந்துகளை மட்டுமே சரியான அளவில் பயன்படுத்தவும்."
        ),
    },
    {
        "id": "treatment_general_guidance",
        "topic": "General Turmeric Disease Treatment & Safety Guidance",
        "category": "treatment_management",
        "keywords": [
            "treatment", "pesticide", "fungicide", "chemical", "dosage", "how to treat", "how to manage",
            "how to control", "prevent disease", "what medicine", "spray rate", "spray schedule",
            "சிகிச்சை", "மருந்து", "பூச்சிக்கொல்லி", "கட்டுப்பாடு", "மேலாண்மை", "தெளிப்பு"
        ],
        "content_en": (
            "Turmeric Crop Protection & Treatment Safety Policy:\n"
            "• Chemical Safety Principle: Chemical pesticides and fungicides must strictly follow official registered product labels and state agricultural university recommendations (TNAU / ICAR-IISR / KVK). Unverified chemical cocktails, unofficial dosages, and unapproved spray schedules are strictly avoided.\n"
            "• Core Agronomic Management Principles:\n"
            "  - Regular Scouting: Early detection on lower canopy leaves enables prompt cultural intervention.\n"
            "  - Sanitation: Prompt removal and destruction of heavily infected plant tissues stops secondary pathogen spread.\n"
            "  - Moisture & Aeration: Maintain good ridge drainage, avoid unnecessary overhead wetting, and provide adequate plant spacing.\n"
            "• Farmers should consult their local district agricultural officer or KVK for official label-approved chemical guidance."
        ),
        "content_ta": (
            "மஞ்சள் பயிர் பாதுகாப்பு மற்றும் மேலாண்மை பொதுக் கொள்கை:\n"
            "• பாதுகாப்பு விதி: பூச்சிக்கொல்லி/பூஞ்சைக்கொல்லி மருந்துகள் அதிகாரப்பூர்வ லேபிள் மற்றும் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU/KVK) பரிந்துரைகளின்படி மட்டுமே பயன்படுத்தப்பட வேண்டும். ஆதாரமற்ற மருந்தளவுகளை வழங்க முடியாது.\n"
            "• முக்கிய மேலாண்மை நெறிமுறைகள்: தீவிரமாக பாதிக்கப்பட்ட பகுதிகளை அகற்றுதல், வடிகால் மேலாண்மை, இலை ஈரப்பதத்தைக் குறைத்தல், மற்றும் தொடர் கள ஆய்வு."
        ),
    },

    # -------------------------------------------------------------
    # 3. DISEASE DEFINITION, SYMPTOMS & FORMATION (4-CLASS COVERAGE)
    # -------------------------------------------------------------
    # A. Leaf Spot
    {
        "id": "disease_leaf_spot_definition",
        "topic": "Leaf Spot Definition & Overview",
        "category": "disease_definition",
        "keywords": ["what is leaf spot", "leaf spot", "colletotrichum capsici", "spot overview", "spot disease", "இலைப்புள்ளி என்றால் என்ன", "இலைப்புள்ளி நோய்"],
        "content_en": (
            "Leaf Spot in turmeric (Curcuma longa):\n"
            "• Definition: A common foliar fungal disease associated in agricultural literature with Colletotrichum capsici.\n"
            "• Significance: Attacks foliage during warm, humid conditions, reducing effective photosynthetic leaf area if left unmanaged.\n"
            "• Diagnostic Approach: Can be identified by characteristic circular to oval spots with yellow halos and confirmed using Curcuma's vision pipeline."
        ),
        "content_ta": (
            "இலைப்புள்ளி நோய் விளக்கம்:\n"
            "• விளக்கம்: Colletotrichum capsici பூஞ்சையால் மஞ்சள் பயிரில் ஏற்படும் பொதுவான இலை நோய்.\n"
            "• தாக்கம்: வெப்பமும் ஈரப்பதமும் நிறைந்த காலங்களில் இலைகளில் தோன்றி ஒளிச்சேர்க்கை திறனைக் குறைக்கிறது.\n"
            "• கண்டறிதல்: வட்டமான மஞ்சள் வளைய புள்ளிகள் மூலம் அடையாளம் காணப்பட்டு Curcuma AI மூலம் வகைப்படுத்தப்படுகிறது."
        ),
    },
    {
        "id": "disease_leaf_spot_symptoms",
        "topic": "Leaf Spot Visual Symptoms & Identification",
        "category": "disease_symptoms",
        "keywords": [
            "what does leaf spot look like", "leaf spot look like", "leaf spot symptoms", "leaf spot visual",
            "leaf spot appearance", "yellow halo", "circular spots", "spot look", "concentric rings",
            "how to identify leaf spot", "how do i identify leaf spot", "how can i identify leaf spot",
            "identify leaf spot", "recognize leaf spot",
            "இலைப்புள்ளி அறிகுறிகள்", "இலைப்புள்ளி தோற்றம்", "இலைப்புள்ளி எப்படி இருக்கும்", "இலைப்புள்ளி அடையாளம்"
        ],
        "content_en": (
            "Leaf Spot Visual Symptoms & Identification (What it looks like):\n"
            "• Lesion Shape & Color: Elliptical to circular brown necrotic spots appearing predominantly on leaf blades.\n"
            "• Distinctive Diagnostic Feature: Prominent, bright yellow halo borders clearly surrounding each dark brown spot.\n"
            "• Progression: Centers become thin and papery (shot-hole appearance) as spots enlarge and coalesce.\n"
            "• Canopy Distribution: Typically appears first on mature lower foliage before progressing upwards."
        ),
        "content_ta": (
            "இலைப்புள்ளி நோய் அறிகுறிகள் மற்றும் அடையாளம்:\n"
            "• தோற்றம்: இலைகளில் வட்டமான அல்லது நீள்வட்ட பழுப்பு நிற புள்ளிகள் தோன்றும்.\n"
            "• முக்கிய அடையாளம்: பழுப்பு நிற புள்ளியைச் சுற்றி தெளிவான பிரகாசமான மஞ்சள் நிற வளையம் (Yellow Halo) காணப்படும்.\n"
            "• வளர்ச்சி: நோய் முதிரும்போது புள்ளியின் நடுப்பகுதி காய்ந்து மெல்லிய காகிதம் போலாகி ஓட்டைகள் விழலாம்.\n"
            "• பரவல்: பொதுவாக கீழ்மட்ட பழைய இலைகளில் முதலில் தோன்றும்."
        ),
    },
    {
        "id": "disease_leaf_spot_formation",
        "topic": "Leaf Spot Formation & Pathogen Biology",
        "category": "disease_formation",
        "keywords": [
            "how does leaf spot form", "why does leaf spot form", "leaf spot formation", "how leaf spot happens",
            "leaf spot cause", "pathogen biology", "spore germination", "how spot develops",
            "இலைப்புள்ளி எப்படி உருவாகிறது", "இலைப்புள்ளி காரணம்", "இலைப்புள்ளி ஏன் ஏற்படுகிறது"
        ],
        "content_en": (
            "How Leaf Spot Forms (Disease Formation & Biology):\n"
            "• Primary Pathogen: Fungal spores (Colletotrichum capsici) harbored in soil or on crop debris.\n"
            "• Infection Pathway: Spores germinate in the presence of continuous free moisture or water films on leaf surfaces.\n"
            "• Environmental Drivers: Warm temperatures (25–30°C) and prolonged relative humidity (>80%) accelerate hyphal penetration.\n"
            "• Rain Splashing: Rain splash and overhead irrigation physically transfer secondary conidia to adjacent healthy leaves."
        ),
        "content_ta": (
            "இலைப்புள்ளி நோய் எவ்வாறு உருவாகிறது (காரணம் & பரவல்):\n"
            "• முதன்மைக் காரணம்: மண்ணிலோ அல்லது முந்தைய பயிர் கழிவுகளிலோ இருக்கும் Colletotrichum பூஞ்சை வித்துக்கள்.\n"
            "• தொற்று முறை: இலைகளில் தொடர்ந்து நீர் துளிகள் அல்லது பனி இருக்கும்போது வித்துக்கள் முளைத்து இலைக்குள் நுழைகின்றன.\n"
            "• சாதகமான சூழல்: 25–30°C வெப்பநிலையும் 80%-க்கு மேற்பட்ட காற்றில் ஈரப்பதமும் பூஞ்சை வளர்ச்சியை துரிதப்படுத்துகின்றன.\n"
            "• பரவல்: மழைத் தூறல் மற்றும் காற்று மூலம் வித்துக்கள் மற்ற இலைகளுக்கு பரவுகின்றன."
        ),
    },

    # B. Leaf Blotch
    {
        "id": "disease_leaf_blotch_definition",
        "topic": "Leaf Blotch Definition & Biology",
        "category": "disease_definition",
        "keywords": [
            "what is leaf blotch", "what is blotch", "leaf blotch", "blotch", "taphrina maculans",
            "blotch disease", "blotch overview", "இலைக்கருகல் என்றால் என்ன", "இலைக்கருகல் நோய்"
        ],
        "content_en": (
            "Leaf Blotch in turmeric (Curcuma longa):\n"
            "• Definition: A foliar ascomycete fungal disease caused by Taphrina maculans.\n"
            "• Crop Impact: Causes extensive scorched foliar blighting, reducing photosynthetic capacity and rhizome yield if unmanaged.\n"
            "• Environmental Association: Highly active during cloudy, overcast, humid weather with frequent rain showers."
        ),
        "content_ta": (
            "இலைக்கருகல் நோய் விளக்கம் (Taphrina maculans):\n"
            "• விளக்கம்: Taphrina maculans பூஞ்சையால் மஞ்சள் பயிரில் ஏற்படும் இலைக்கருகல் நோய்.\n"
            "• தாக்கம்: இலைகள் கருகி பச்சையத்தை இழப்பதால் பயிரின் ஒளிச்சேர்க்கை குறைந்து கிழங்கு பெருக்கம் பாதிக்கப்படுகிறது.\n"
            "• சாதகமான சூழல்: மேகமூட்டமான வானிலை, அதிக ஈரப்பதம் மற்றும் தொடர் தூறல் மழை."
        ),
    },
    {
        "id": "disease_leaf_blotch_symptoms",
        "topic": "Leaf Blotch Visual Symptoms & Identification",
        "category": "disease_symptoms",
        "keywords": [
            "what does leaf blotch look like", "what does blotch look like", "blotch look like",
            "blotch symptoms", "leaf blotch symptoms", "how to identify blotch", "how do i identify blotch",
            "how can i identify blotch", "identify blotch", "recognize blotch", "scorch", "brown patch",
            "இலைக்கருகல் அறிகுறிகள்", "இலைக்கருகல் தோற்றம்", "இலைக்கருகல் எப்படி இருக்கும்", "இலைக்கருகல் அடையாளம்"
        ],
        "content_en": (
            "Leaf Blotch Visual Symptoms & Identification (What it looks like):\n"
            "• Lesion Appearance: Starts as numerous small, irregular yellowish-brown to reddish-brown spots on both leaf surfaces.\n"
            "• Coalescence: As infection progresses, hundreds of tiny spots rapidly coalesce into large, dark brown scorched patches.\n"
            "• Distinctive Contrast with Leaf Spot: Blotch forms large continuous scorched sheets and DOES NOT have distinct individual yellow halo rings.\n"
            "• Upper and Lower Lamina: Both upper and lower leaf surfaces show intense reddish-brown discoloration."
        ),
        "content_ta": (
            "இலைக்கருகல் நோய் அறிகுறிகள் மற்றும் அடையாளம்:\n"
            "• தோற்றம்: இலைகளின் இருபுறங்களிலும் சிறிய மஞ்சள்-பழுப்பு முதல் அடர் பழுப்பு நிற புள்ளிகளாகத் தொடங்கும்.\n"
            "• வளர்ச்சி: புள்ளிகள் மிக வேகமாக ஒன்றிணைந்து பெரிய கருகிய தகடுகள் போன்ற திட்டுகளாக (Scorched patches) மாறும்.\n"
            "• இலைப்புள்ளிக்கும் இதற்கும் உள்ள முக்கிய வித்தியாசம்: இதில் தனித்தனியான மஞ்சள் வளையங்கள் இருக்காது; மாறாக பரவலான கருகல் தோற்றம் இருக்கும்."
        ),
    },
    {
        "id": "disease_leaf_blotch_formation",
        "topic": "Leaf Blotch Development & Environmental Spread",
        "category": "disease_formation",
        "keywords": [
            "how does blotch develop", "how does leaf blotch develop", "how does blotch form",
            "why does blotch develop", "blotch formation", "blotch cause", "taphrina spread",
            "இலைக்கருகல் எப்படி உருவாகிறது", "இலைக்கருகல் காரணம்", "இலைக்கருகல் பரவல்"
        ],
        "content_en": (
            "How Leaf Blotch Develops (Formation & Spread):\n"
            "• Pathogen Source: Taphrina maculans fungal asci and ascospores resting on infected crop residue in the field.\n"
            "• Favorable Environment: Extended overcast skies, moderate temperatures (22–28°C), and relative humidity above 85%.\n"
            "• Spore Transmission: Ascospores are forcibly discharged and carried by gentle wind drafts and rain splashes to new foliage.\n"
            "• Leaf Canopy Spread: Once established, secondary spread occurs rapidly through the middle and upper canopy under dense foliage."
        ),
        "content_ta": (
            "இலைக்கருகல் நோய் எவ்வாறு உருவாகிறது (காரணம் & பரவல்):\n"
            "• முதன்மைக் காரணம்: வயல் பயிர் கழிவுகளில் தங்கியிருக்கும் Taphrina maculans பூஞ்சை வித்துக்கள்.\n"
            "• சாதகமான சூழல்: தொடர்ந்து நிலவும் மேகமூட்டம், 22-28°C வெப்பநிலை மற்றும் 85%-க்கு அதிகமான காற்றின் ஈரப்பதம்.\n"
            "• பரவல் முறை: காற்றில் பரவும் வித்துக்கள் மற்றும் மழைத் தூறல் மூலம் புதிய இலைகளுக்கு மிக வேகமாகப் பரவுகிறது."
        ),
    },

    # C. Aphids
    {
        "id": "disease_aphids_definition",
        "topic": "Aphids Pest Overview & Crop Impact",
        "category": "disease_definition",
        "keywords": [
            "what are aphids", "what is aphids", "what is aphid", "aphids", "aphid", "aphis gossypii",
            "aphid pest", "sap sucking pest", "அசுவினி என்றால் என்ன", "அசுவினி பூச்சி", "அசுவினி"
        ],
        "content_en": (
            "Aphids in Turmeric (Aphis gossypii):\n"
            "• Definition: Small soft-bodied, sap-sucking insect pests that colonize turmeric foliage and tender shoots.\n"
            "• Crop Impact: Direct feeding drains vital plant sap, causing stunted growth, foliage distortion, and vigor loss.\n"
            "• Secondary Impact (Sooty Mold): Aphids excrete sticky honeydew, which fosters black sooty mold fungus on the leaf surface, physically blocking sunlight and reducing photosynthesis."
        ),
        "content_ta": (
            "மஞ்சள் அசுவினி பூச்சி விளக்கம் (Aphis gossypii):\n"
            "• விளக்கம்: மஞ்சள் இலைகளின் அடிப்பகுதியில் கூட்டமாக வாழும் மிகச்சிறிய சாறு உறிஞ்சும் பூச்சிகள்.\n"
            "• பயிர் பாதிப்பு: தாவரத்தின் சாற்றை உறிஞ்சுவதால் இலைகள் சுருங்கி பயிரின் வளர்ச்சி குன்றும்.\n"
            "• கரும்பூஞ்சை பாதிப்பு: அசுவினிகள் சுரக்கும் பிசுபிசுப்பான தேன் போன்ற திரவத்தில் கரும்பூஞ்சை (Sooty mold) படர்ந்து ஒளிச்சேர்க்கையைத் தடுக்கும்."
        ),
    },
    {
        "id": "disease_aphids_symptoms",
        "topic": "Aphids Visual Symptoms & Identification",
        "category": "disease_symptoms",
        "keywords": [
            "how to identify aphids", "how do i identify aphids", "how can i identify aphids",
            "identify aphids", "recognize aphids", "what do aphids look like", "aphids look like",
            "aphid symptoms", "leaf curling", "honeydew", "sooty mold", "crinkling",
            "அசுவினி அறிகுறிகள்", "அசுவினி அடையாளம்", "அசுவினி எப்படி இருக்கும்", "இலை சுருட்டுதல்"
        ],
        "content_en": (
            "Aphids Visual Symptoms & Identification (How to recognize them):\n"
            "• Physical Clusters: Dense colonies of tiny green, yellowish, or black soft-bodied insects clustered on the undersides of leaves and young shoots.\n"
            "• Foliar Distortion: Infested young leaves display downward crinkling, cupping, curling, and uneven growth.\n"
            "• Honeydew & Sooty Mold: Shiny sticky residue (honeydew) and dark velvety black mold coatings covering the upper leaf lamina.\n"
            "• Ant Activity: Increased presence of black ants actively tending aphid colonies for honeydew."
        ),
        "content_ta": (
            "அசுவினி பூச்சி அறிகுறிகள் மற்றும் அடையாளம்:\n"
            "• பூச்சி கூட்டங்கள்: இளம் இலைகளின் அடிப்பகுதியில் பச்சை, மஞ்சள் அல்லது கருப்பு நிற சிறிய பூச்சிகள் கூட்டமாக அமர்ந்திருக்கும்.\n"
            "• இலை சுருக்கம்: பாதிக்கப்பட்ட இலைகள் கீழ்நோக்கி சுருண்டு, நெளிந்து ஒழுங்கற்ற வடிவத்தைப் பெறும்.\n"
            "• கரும்பூஞ்சை & பிசுபிசுப்பு: இலைகளின் மேல் பளபளப்பான பிசுபிசுப்பு திரவம் மற்றும் கறுப்பு நிற பூஞ்சை படிந்திருக்கும்.\n"
            "• எறும்புகள் நடமாட்டம்: தேன் போன்ற திரவத்தை உண்பதற்காக கறுப்பு எறும்புகள் அதிகளவில் நடமாடும்."
        ),
    },

    # D. Healthy
    {
        "id": "disease_healthy_definition",
        "topic": "Healthy Turmeric Foliage Characteristics & Meaning",
        "category": "disease_definition",
        "keywords": [
            "what does a healthy result mean", "what does a healthy turmeric leaf mean",
            "what is healthy", "healthy leaf mean", "healthy result mean", "healthy turmeric leaf",
            "healthy foliage", "normal leaf", "green leaf", "ஆரோக்கியமான இலை", "ஆரோக்கியமான முடிவு"
        ],
        "content_en": (
            "Healthy Turmeric Foliage Characteristics & Result Meaning:\n"
            "• Result Meaning: A Healthy prediction indicates that the AI vision model detected visual features consistent with normal, undamaged turmeric foliage, without detectable signs of Leaf Spot, Leaf Blotch, or Aphids.\n"
            "• Visual Attributes: An intact, smooth, vibrant green lamina with uniform parallel venation and no necrotic lesions, yellow halos, scorched patches, or insect colonies.\n"
            "• Preventive Reminder: A Healthy result reflects the condition of the scanned leaf at that moment. It does not mean future disease is impossible if environmental risks rise."
        ),
        "content_ta": (
            "ஆரோக்கியமான மஞ்சள் இலை மற்றும் முடிவு விளக்கம்:\n"
            "• முடிவின் பொருள்: உங்கள் ஸ்கேன் படத்தில் இலைப்புள்ளி, இலைக்கருகல் அல்லது அசுவினி தாக்குதலின் அறிகுறிகள் எதுவுமின்றி, இலை ஆரோக்கியமான இயல்பு நிலையில் இருப்பதை AI மாதிரி உறுதி செய்துள்ளது.\n"
            "• தோற்றம்: சீரான அடர் பச்சை நிறம், தெளிவான நரம்பமைப்பு மற்றும் கறைகள் அற்ற மென்மையான இலைப்பரப்பு.\n"
            "• நினைவூட்டல்: தற்போதைய ஸ்கேன் ஆரோக்கியமாக இருந்தாலும், சாதகமான வானிலை மாறும்போது எதிர்காலத்தில் நோய் வர வாய்ப்புள்ளது; எனவே தொடர் கண்காணிப்பு அவசியம்."
        ),
    },
    {
        "id": "disease_healthy_monitoring",
        "topic": "Maintaining Crop Health & Routine Field Scouting",
        "category": "disease_symptoms",
        "keywords": [
            "how can i maintain crop health", "maintain crop health", "what should i monitor",
            "what to monitor", "what should i monitor next", "routine monitoring", "crop care",
            "பயிரின் ஆரோக்கியத்தை எவ்வாறு பராமரிப்பது", "எவற்றை கண்காணிக்க வேண்டும்", "பயிர் பாதுகாப்பு"
        ],
        "content_en": (
            "Maintaining Turmeric Crop Health & Ongoing Field Scouting:\n"
            "• Routine Scouting: Inspect lower canopy leaves and shoot undersides weekly for early lesion pinpoints or pest colonies.\n"
            "• Water & Soil Management: Maintain well-drained raised beds, avoid waterlogging around rhizomes, and maintain balanced soil moisture.\n"
            "• Nutrient Stewardship: Apply balanced organic/inorganic nutrients per state agronomy guidelines and avoid excessive nitrogen that softens leaf tissues.\n"
            "• Microclimate Awareness: Check field humidity and rainfall in the Weather & Risk and Field Check pages to anticipate risk spikes."
        ),
        "content_ta": (
            "மஞ்சள் பயிர் ஆரோக்கியத்தைப் பேணுதல் & தொடர் கண்காணிப்பு:\n"
            "• வாராந்திர கள ஆய்வு: கீழ்மட்ட இலைகளின் அடிப்பகுதியை வாரம் ஒருமுறை ஆய்வு செய்து புதிய புள்ளிகள் அல்லது பூச்சிகள் உள்ளதா எனப் பார்க்கவும்.\n"
            "• பாசன மேலாண்மை: பாத்திகளில் நீர் தேங்காமல் வடிகால் அமைத்து சீரான மண் ஈரப்பதத்தை பராமரிக்கவும்.\n"
            "• உர மேலாண்மை: அளவுக்கு அதிகமான தழைச்சத்தைத் தவிர்த்து சமச்சீரான ஊட்டச்சத்துக்களை வழங்கவும்.\n"
            "• வானிலை விழிப்புணர்வு: Weather & Risk பக்கத்தில் சுற்றுச்சூழல் அபாயத்தை அவ்வப்போது சரிபார்க்கவும்."
        ),
    },

    # -------------------------------------------------------------
    # 4. ENVIRONMENT & WEATHER RISKS
    # -------------------------------------------------------------
    {
        "id": "env_factors",
        "topic": "Environmental Risk Drivers & Humidity Impact",
        "category": "environment",
        "keywords": [
            "humidity", "rainfall", "temperature", "leaf wetness", "soil moisture", "weather",
            "monsoon", "environmental risk", "why humidity increase risk", "humidity leaf spot",
            "வானிலை", "ஈரப்பதம்", "மழை அளவு", "அபாயம்"
        ],
        "content_en": (
            "Environmental Risk Drivers & Foliar Disease Susceptibility:\n"
            "• High Relative Humidity (>80%): Retards foliar transpiration and prolongs free canopy moisture, dramatically enhancing fungal spore germination and penetration.\n"
            "• Rainfall & Splashing: Rain splash mechanically dislodges and disperses fungal conidia across adjacent leaves; waterlogging creates root stress.\n"
            "• Leaf Wetness Duration: Extended wetness periods (>6–8 hours) are the primary prerequisite for spore germination in Leaf Spot and Blotch.\n"
            "• Temperature (22–30°C): Warm tropical temperatures accelerate fungal metabolic rates.\n"
            "Curcuma combines these telemetry factors into a real-time Environmental Risk Index."
        ),
        "content_ta": (
            "மஞ்சள் பயிர் நோய்களைத் தூண்டும் சுற்றுச்சூழல் காரணிகள்:\n"
            "• காற்றில் ஈரப்பதம் (>80%): இலைகளில் நீர் ஆவியாவதைத் தடுத்து, பூஞ்சை வித்துக்கள் முளைக்க ஏதுவான ஈரமான சூழலைத் தருகிறது.\n"
            "• மழை & நீர் தேக்கம்: மழைத் தூறல் பூஞ்சையை மற்ற இலைகளுக்கு பரப்புகிறது; நீர் தேங்குவது வேர் அழுகலை உண்டாக்குகிறது.\n"
            "• இலை ஈரப்பதம்: இலைகளில் 6-8 மணி நேரத்திற்கு மேல் நீடிக்கும் பனி/ஈரம் பூஞ்சை இலைக்குள் நுழைய வழிவகுக்கிறது.\n"
            "• வெப்பநிலை (22–30°C): மிதமான வெப்பம் பூஞ்சை வளர்ச்சியை துரிதப்படுத்துகிறது."
        ),
    },

    # -------------------------------------------------------------
    # 5. CURCUMA PROJECT & AI RESEARCH (Authoritative Project Facts)
    # -------------------------------------------------------------
    {
        "id": "project_architecture",
        "topic": "Curcuma AI Architecture & Dual-Backbone Hybrid",
        "category": "project",
        "keywords": ["architecture", "efficientnet", "efficientnet-b0", "mobilenet", "mobilenetv2", "hybrid", "hybrid model", "dual backbone", "ensemble", "soft voting", "மாடல் கட்டமைப்பு", "ஹைப்ரிட் மாடல்"],
        "content_en": (
            "Curcuma AI Architecture (Authoritative Project Facts):\n"
            "• Clean EfficientNet-B0: Primary deep convolutional backbone with compound scaling that captures subtle lesion textures and chlorotic halos.\n"
            "• MobileNetV2: Fast, inverted-residual convolutional backbone optimized for low latency.\n"
            "• Late-Fusion Soft-Voting (alpha = 0.50): Predictions from both networks are averaged (P_hybrid = 0.50 * P_eff + 0.50 * P_mob) to reduce variance.\n"
            "• Stage-1 Verifier: MobileNetV3-Small binary verifier (threshold tau = 0.50) ensuring input is a botanical turmeric leaf."
        ),
        "content_ta": (
            "Curcuma AI மாதிரி கட்டமைப்பு (திட்ட உண்மைத் தகவல்கள்):\n"
            "• EfficientNet-B0: இலை நுண்ணிய அறிகுறிகளை அடையாளம் காணும் முதன்மை மாடல்.\n"
            "• MobileNetV2: விரைவான கணிப்பிற்கான இலகுரக மாடல்.\n"
            "• ஹைப்ரிட் கூட்டமைப்பு (Hybrid Ensemble, alpha = 0.50): இவ்விரு மாடல்களையும் சமவிகிதத்தில் இணைக்கிறது.\n"
            "• Stage-1 Verifier (MobileNetV3, tau = 0.50): படம் மஞ்சள் இலைதானா என்பதை சரிபார்க்கிறது."
        ),
    },
    {
        "id": "project_ood_safeguard",
        "topic": "Mahalanobis Out-of-Distribution (OOD) Safeguard",
        "category": "project",
        "keywords": ["ood", "out of domain", "out-of-distribution", "mahalanobis", "mahalanobis distance", "safeguard", "verifier", "mobilenetv3", "reject", "rejection", "மகலனோபிஸ்", "OOD பாதுகாப்பு"],
        "content_en": (
            "Mahalanobis OOD Safeguard (Authoritative Project Facts):\n"
            "• Purpose: Prevents closed-world Softmax failures when non-turmeric photos (faces, objects, unrelated plants) are uploaded.\n"
            "• Mechanism: Extracts 1280-dimensional penultimate embeddings from EfficientNet-B0 and computes Mahalanobis statistical distance D_M against class centroids with Ledoit-Wolf covariance regularization.\n"
            "• Calibrated Decision Boundary: Rejection threshold tau_98 = 63.10. Non-turmeric inputs exceeding this threshold are safely rejected."
        ),
        "content_ta": (
            "OOD (Out-of-Distribution) பாதுகாப்பு & மகலனோபிஸ் தொலைவு (திட்ட உண்மைத் தகவல்கள்):\n"
            "• நோக்கம்: மனித முகங்கள், பிற தாவரங்கள் அல்லது தேவையற்ற பொருட்களை AI தவறாக கணிப்பதைத் தடுக்கிறது.\n"
            "• செயல்முறை: EfficientNet-B0 மாடலின் 1280-பரிமாண feature space-ல் தொலைவை கணக்கிடுகிறது.\n"
            "• முடிவு எல்லை: மகலனோபிஸ் தொலைவு tau_98 = 63.10-க்கு மேல் உள்ள படங்கள் தானாக நிராகரிக்கப்படுகின்றன."
        ),
    },
    {
        "id": "project_dataset_metrics",
        "topic": "Dataset, Authoritative Test Metrics & Scope",
        "category": "project",
        "keywords": ["dataset", "accuracy", "test accuracy", "metrics", "performance", "limitation", "limitations", "precision", "recall", "f1", "துல்லியம்", "தரவுத்தொகுப்பு"],
        "content_en": (
            "Curcuma Dataset & Authoritative Model Metrics:\n"
            "• 4 Target Classes: Aphids, Blotch, Healthy, Leaf Spot.\n"
            "• Authoritative Test Metrics (EfficientNet-B0 clean test partition):\n"
            "  - Internal Test Accuracy: 99.22%\n"
            "  - Weighted Precision: 99.25%\n"
            "  - Weighted Recall: 99.22%\n"
            "  - Weighted F1-Score: 99.23%\n"
            "• Scope & Decision Support: Curcuma is an agronomic decision support system. Physical agronomic verification remains standard practice."
        ),
        "content_ta": (
            "Curcuma தரவுத்தொகுப்பு & சரிபார்க்கப்பட்ட அளவீடுகள்:\n"
            "• 4 பிரிவுகள்: அசுவினி (Aphids), இலைக்கருகல் (Blotch), ஆரோக்கியமான இலை (Healthy), இலைப்புள்ளி (Leaf Spot).\n"
            "• மாதிரி செயல்திறன் (EfficientNet-B0):\n"
            "  - உள் சோதனை துல்லியம் (Accuracy): 99.22%\n"
            "  - Weighted Precision: 99.25%\n"
            "  - Weighted Recall: 99.22%\n"
            "  - Weighted F1-Score: 99.23%\n"
            "• பயன்பாட்டு நோக்கம்: இது விவசாயிகளுக்கான முடிவு ஆதரவு அமைப்பாகும்."
        ),
    },

    # -------------------------------------------------------------
    # 6. HARDWARE & IOT SENSORS
    # -------------------------------------------------------------
    {
        "id": "hardware_iot",
        "topic": "IoT Field Sensors & Telemetry Architecture",
        "category": "hardware",
        "keywords": ["esp32", "dht22", "sensor", "soil moisture", "capacitive", "hardware", "telemetry", "simulation", "சென்சார்", "ESP32", "DHT22"],
        "content_en": (
            "Curcuma IoT Hardware Architecture:\n"
            "• ESP32: Low-power Wi-Fi/BLE microcontroller planned for in-field telemetry transmission.\n"
            "• DHT22 Sensor: Measures ambient canopy temperature and relative humidity.\n"
            "• Capacitive Soil Moisture Sensor: Measures root-zone volumetric water content.\n"
            "• Telemetry: The application currently supports manual slider exploration and live Open-Meteo 14-day weather streams, architected to ingest physical ESP32 telemetry."
        ),
        "content_ta": (
            "Curcuma IoT சென்சார் கட்டமைப்பு:\n"
            "• ESP32: வயலில் இருந்து தரவுகளை அனுப்பும் மைக்ரோ கன்ட்ரோலர்.\n"
            "• DHT22 சென்சார்: காற்றின் வெப்பநிலை மற்றும் ஈரப்பதத்தை அளவிடுகிறது.\n"
            "• மண் ஈரப்பதம் சென்சார்: வேர்ப்பகுதி மண்ணின் ஈரப்பதத்தை அளவிடுகிறது.\n"
            "• செயல்முறை: தற்போது கைமுறை அளவீடுகள் மற்றும் நேரலை Open-Meteo வானிலை மூலம் இயங்குகிறது; ESP32 உடன் இணைக்க தயாராக உள்ளது."
        ),
    },

    # -------------------------------------------------------------
    # 7. FIELD CONDITIONS & FIELD CHECK
    # -------------------------------------------------------------
    {
        "id": "field_conditions_check",
        "topic": "Field Conditions & Field Check Workflow",
        "category": "field_conditions",
        "keywords": [
            "field conditions", "field check", "check field conditions", "check my field",
            "enter field conditions", "record field conditions", "field temperature", "soil moisture",
            "temperature and humidity", "environmental parameters", "how do i check my field conditions",
            "how can i check my field conditions", "what can i check in field check", "field check page",
            "enter soil moisture", "enter field temperature", "soil ph", "leaf wetness",
            "வயல் நிலைமை", "கள ஆய்வு", "வயல் நிலைமைகளை எவ்வாறு சோதிப்பது", "மண் ஈரப்பதம்"
        ],
        "content_en": (
            "TurmeriCare Field Check (/field-conditions) Guide:\n"
            "• Open the 'Field Check' page from the top navigation.\n"
            "• Enter or adjust your field's current environmental parameters:\n"
            "  - Ambient Temperature (°C) and Relative Humidity (%)\n"
            "  - Soil Moisture (%) and Soil pH\n"
            "  - Leaf Wetness duration (hours) and Rainfall (mm)\n"
            "  - Wind Speed (km/h) and Sunlight Hours\n"
            "• The system immediately computes your Environmental Risk Index (Low, Moderate, High, Severe) to alert you if microclimate conditions favor Leaf Spot or Blotch formation.\n"
            "• You can also load regional presets for major Tamil Nadu turmeric growing districts."
        ),
        "content_ta": (
            "TurmeriCare கள ஆய்வு (Field Check) வழிகாட்டி (/field-conditions):\n"
            "• மேல் மெனுவில் உள்ள 'Field Check' பக்கத்தைத் திறக்கவும்.\n"
            "• உங்கள் வயலின் கள அளவீடுகளை உள்ளிடலாம் அல்லது மாற்றலாம்:\n"
            "  - வெப்பநிலை (°C) மற்றும் காற்றின் ஈரப்பதம் (%)\n"
            "  - மண் ஈரப்பதம் (%) மற்றும் மண்ணின் pH அளவு\n"
            "  - இலை ஈரப்பதம் (Leaf Wetness hours) மற்றும் மழைப்பொழிவு (mm)\n"
            "  - காற்றின் வேகம் மற்றும் சூரிய ஒளி நேரம்\n"
            "• இந்த அளவீடுகளை உள்ளிட்டவுடன், கணினி சுற்றுச்சூழல் நோய் அபாயக் குறியீட்டை (Low, Moderate, High, Severe) உடனுக்குடன் கணக்கிடும்.\n"
            "• இதன் மூலம் இலைப்புள்ளி அல்லது இலைக்கருகல் நோய் பரவும் சாதகமான சூழலை முன்கூட்டியே அறிந்து தடுக்கலாம்."
        ),
    },

    # -------------------------------------------------------------
    # 8. APP HELP & NAVIGATION
    # -------------------------------------------------------------
    {
        "id": "app_help",
        "topic": "Curcuma App Features & Navigation Guide",
        "category": "app_help",
        "keywords": ["scan leaf", "field check", "weather & risk", "advice", "history", "help", "how to use", "language", "பயன்படுத்துவது எப்படி", "ஸ்கேன்"],
        "content_en": (
            "Curcuma Application Navigation:\n"
            "• Scan Leaf (/disease-detection): Upload or photograph a leaf to run Stage-1 Verifier, OOD check, and disease prediction.\n"
            "• Weather & Risk (/environmental-risk): 14-day live weather telemetry, hourly risk indices, and Northeast Monsoon alerts for Tamil Nadu.\n"
            "• Field Check (/field-conditions): Interactive environmental parameter simulator to test risk scores.\n"
            "• Advice (/recommendations): Contextual agronomic management guidance.\n"
            "• History (/history): View previous scan records with timestamps, confidence scores, and detailed report export.\n"
            "• Language Toggle: Switch between English and தமிழ் anytime in the header or chat window."
        ),
        "content_ta": (
            "Curcuma செயலி வழிகாட்டி:\n"
            "• Scan Leaf: இலைப் படத்தைப் பதிவேற்றி நோய் கணிப்பைப் பெறலாம்.\n"
            "• Weather & Risk: 14 நாள் நேரலை வானிலை மற்றும் அபாயக் குறியீடுகள்.\n"
            "• Field Check: வெப்பநிலை, ஈரப்பதத்தை மாற்றி அபாயத்தை கணக்கிடும் பகுதி.\n"
            "• Advice: பரிந்துரைக்கப்பட்ட வேளாண் ஆலோசனைகள்.\n"
            "• History: முந்தைய ஸ்கேன் பதிவுகள் மற்றும் அறிக்கை.\n"
            "• மொழி மாற்றம்: English / தமிழ் பொத்தானை அழுத்தி மாற்றலாம்."
        ),
    },
]
