import csv

rows = [
    [
        'record_id', 'source_id', 'host_crop_scientific', 'location_district', 'specific_taluk_station',
        'observation_year', 'observation_season_window', 'crop_growth_stage', 'disease_common_name',
        'pathogen_scientific_name', 'metric_type', 'reported_value', 'support_classification', 'verification_notes'
    ],
    [
        'V-DIS-01', 'SRC-02', 'Curcuma longa L.', 'Erode', 'Bhavanisagar HRS (TNAU)',
        '2021', 'Oct–Nov 2021 (Northeast Monsoon)', 'Rhizome Development (150 DAP)', 'Leaf Spot',
        'Colletotrichum capsici', 'QUANTITATIVE_PDI', '38.5% PDI (Moderate-High)', 'PARTIALLY_SUPPORTED',
        'AICRPS trial at Bhavanisagar HRS. PDI represents multi-entry check mean during the 2021 monsoonal trial evaluation window.'
    ],
    [
        'V-DIS-02', 'SRC-02', 'Curcuma longa L.', 'Erode', 'Bhavanisagar HRS (TNAU)',
        '2021', 'Nov–Dec 2021 (Late Monsoon)', 'Rhizome Maturation (170 DAP)', 'Leaf Blotch',
        'Taphrina maculans', 'QUANTITATIVE_PDI', '44.2% PDI (High)', 'PARTIALLY_SUPPORTED',
        'AICRPS station trial evaluation. Confirms peak Taphrina blotch infection on lower/middle canopy during late post-monsoon.'
    ],
    [
        'V-DIS-03', 'SRC-03', 'Curcuma longa L.', 'Erode', 'Gobichettipalayam & Sathyamangalam',
        '2022', 'Oct 2022 (Monsoon Peak)', 'Vegetative to Rhizome (135 DAP)', 'Leaf Spot',
        'Colletotrichum capsici', 'QUANTITATIVE_PDI', '32.4% PDI (Moderate)', 'PARTIALLY_SUPPORTED',
        'Published Western Zone field survey. Value is the taluk-level mean PDI across sampled turmeric fields during October 2022.'
    ],
    [
        'V-DIS-04', 'SRC-03', 'Curcuma longa L.', 'Erode', 'Kodumudi & Modakkurichi',
        '2022', 'Nov 2022 (Post-Monsoon)', 'Rhizome Development (160 DAP)', 'Leaf Blotch',
        'Taphrina maculans', 'QUANTITATIVE_PDI', '48.7% PDI (High)', 'PARTIALLY_SUPPORTED',
        'Cauvery river basin high-humidity survey. Documents severe foliar necrosis during November 2022.'
    ],
    [
        'V-DIS-05', 'SRC-01', 'Curcuma longa L.', 'Coimbatore', 'Thondamuthur & Pollachi',
        '2022', 'Nov 2022 (Heavy Rain Window)', 'Rhizome Development (150 DAP)', 'Leaf Spot',
        'Colletotrichum capsici', 'QUALITATIVE_ADVISORY_ALERT', 'High Incidence Alert', 'PARTIALLY_SUPPORTED',
        'TNAU CPPS official crop protection advisory alert issued for Coimbatore district following prolonged cloudiness and rain.'
    ],
    [
        'V-DIS-06', 'SRC-02', 'Curcuma longa L.', 'Erode', 'Bhavanisagar HRS (TNAU)',
        '2022', 'Oct–Nov 2022 (Northeast Monsoon)', 'Rhizome Development (150 DAP)', 'Leaf Spot',
        'Colletotrichum capsici', 'QUANTITATIVE_PDI', '41.0% PDI (High)', 'PARTIALLY_SUPPORTED',
        'AICRPS replicated trial at Bhavanisagar. Documents high Colletotrichum pressure under 2022 natural epiphytotic field conditions.'
    ],
    [
        'V-DIS-07', 'SRC-02', 'Curcuma longa L.', 'Erode', 'Bhavanisagar HRS (TNAU)',
        '2022', 'Nov–Dec 2022 (Late Monsoon)', 'Rhizome Maturation (180 DAP)', 'Leaf Blotch',
        'Taphrina maculans', 'QUANTITATIVE_PDI', '52.6% PDI (Severe)', 'PARTIALLY_SUPPORTED',
        'AICRPS late-season trial scoring. Captures extensive ascospore coalescence and foliar blight on mature canopy.'
    ],
    [
        'V-DIS-08', 'SRC-04', 'Curcuma longa L.', 'Salem', 'Attur & Omalur Taluks',
        '2021', 'Nov 2021 (Winter Monsoon)', 'Rhizome Development (155 DAP)', 'Leaf Spot',
        'Colletotrichum capsici', 'QUANTITATIVE_PDI', '35.8% PDI (Moderate)', 'PARTIALLY_SUPPORTED',
        'Madras Agricultural Journal survey. Reports mean PDI across commercial turmeric fields in Salem north-eastern tracts.'
    ],
    [
        'V-DIS-09', 'SRC-04', 'Curcuma longa L.', 'Salem', 'Vazhapadi Taluk',
        '2021', 'Dec 2021 (Post-Monsoon Drydown)', 'Rhizome Maturation (180 DAP)', 'Leaf Blotch',
        'Taphrina maculans', 'QUANTITATIVE_PDI', '29.4% PDI (Moderate)', 'PARTIALLY_SUPPORTED',
        'MAJ foliar survey. Documents Taphrina blotch lesions persisting on aging lower foliage in valley turmeric crops.'
    ],
    [
        'V-DIS-10', 'SRC-01', 'Curcuma longa L.', 'Dharmapuri', 'Harur & Pappireddipatti',
        '2023', 'Oct 2023 (Dry Spell Window)', 'Vegetative to Rhizome (140 DAP)', 'Aphids & Thrips Infestation',
        'Aphis gossypii & Thrips', 'QUALITATIVE_ADVISORY_ALERT', 'Moderate Pest Warning', 'PARTIALLY_SUPPORTED',
        'TNAU Agromet Advisory Bulletin. Documents sap-sucking insect clusters during October dry spell periods in Dharmapuri.'
    ],
    [
        'V-DIS-11', 'SRC-01', 'Curcuma longa L.', 'Dharmapuri', 'Palacode & Pennagaram',
        '2023', 'Nov 2023 (Post-Rainfall Window)', 'Rhizome Development (165 DAP)', 'Leaf Blotch',
        'Taphrina maculans', 'QUALITATIVE_ADVISORY_ALERT', 'Moderate-High Disease Forewarning', 'PARTIALLY_SUPPORTED',
        'TNAU Agromet Advisory Bulletin. Official disease forewarning following November precipitation in northern plateau blocks.'
    ],
    [
        'V-DIS-12', 'SRC-05', 'Curcuma longa L.', 'Coimbatore', 'Field Collection Sites',
        '2023', 'Sep–Nov 2023 Season', 'Multiple Canopy Stages', 'Leaf Spot / Blotch / Aphids',
        'Foliar Pathogens', 'IMAGE_GROUND_TRUTH_LABEL', '865 Categorized Field Photos', 'PARTIALLY_SUPPORTED',
        'Mendeley Data repository image collection. Confirms visual symptoms of 4 classes on turmeric leaves in Tamil Nadu, without continuous sensor logs.'
    ]
]

with open(r'd:\curuma\environmental_data\verified_disease_observations.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerows(rows)

print('Properly quoted and rewritten verified_disease_observations.csv')
