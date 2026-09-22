/**
 * TurmeriCare AI — Live Weather API & Tamil Nadu Geocoding Service
 * ================================================================
 * Connects to Open-Meteo API for real-time 14-day antecedent hourly meteorological data.
 * Resolves arbitrary Tamil Nadu districts, cities, and towns to exact geographic coordinates.
 * Directly feeds into existing normalizeReanalysisPayload() and validateHourlySeries().
 */

import type { LocationOption } from '../types';
export type { LocationOption };

/**
 * Cleanly formats a location for UI display, avoiding redundant "Erode, Erode" or "Salem, Salem".
 */
export function formatLocationDisplay(location?: LocationOption | null, lang: 'en' | 'ta' = 'en'): string {
  if (!location) return lang === 'ta' ? 'தமிழ்நாடு' : 'Tamil Nadu';
  
  const name = location.name?.trim() || '';
  const district = location.district?.trim() || '';
  
  if (!district || name.toLowerCase() === district.toLowerCase()) {
    return `${name}, ${location.state || (lang === 'ta' ? 'தமிழ்நாடு' : 'Tamil Nadu')}`;
  }
  
  return `${name}, ${district}`;
}
import {
  HourlyEnvironmentalRecord,
  normalizeReanalysisPayload,
  validateHourlySeries,
} from '../utils/researchRiskEngine';

/**
 * Verified Historical Research Benchmark Districts (Strictly 4 Districts with Reanalysis CSV Archives)
 */
export const HISTORICAL_RESEARCH_DISTRICTS: LocationOption[] = [
  {
    id: 'erode',
    name: 'Erode',
    tamilName: 'ஈரோடு',
    district: 'Erode',
    latitude: 11.341,
    longitude: 77.7172,
    state: 'Tamil Nadu',
    description: 'AICRPS Bhavanisagar Benchmark & Major Turmeric Market',
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    tamilName: 'கோயம்புத்தூர்',
    district: 'Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    state: 'Tamil Nadu',
    description: 'Western Agroclimatic Zone (TNAU CPPS Center)',
  },
  {
    id: 'salem',
    name: 'Salem',
    tamilName: 'சேலம்',
    district: 'Salem',
    latitude: 11.6643,
    longitude: 78.146,
    state: 'Tamil Nadu',
    description: 'Eastern Turmeric Belt (Attur / Omalur / Vazhapadi)',
  },
  {
    id: 'dharmapuri',
    name: 'Dharmapuri',
    tamilName: 'தருமபுரி',
    district: 'Dharmapuri',
    latitude: 12.1211,
    longitude: 78.1582,
    state: 'Tamil Nadu',
    description: 'North-Western Turmeric Tract (Pennagaram / Palacode)',
  },
];

/**
 * Curated Directory of All 38 Tamil Nadu Districts and Major Agricultural Taluks
 */
export const ALL_TAMIL_NADU_LOCATIONS: LocationOption[] = [
  // Primary Turmeric Growing Belt
  {
    id: 'erode',
    name: 'Erode',
    tamilName: 'ஈரோடு',
    district: 'Erode',
    latitude: 11.341,
    longitude: 77.7172,
    state: 'Tamil Nadu',
    description: 'Turmeric City • Major Commercial Market Hub',
  },
  {
    id: 'gobichettipalayam',
    name: 'Gobichettipalayam',
    tamilName: 'கோபிசெட்டிபாளையம்',
    district: 'Erode',
    latitude: 11.4552,
    longitude: 77.4379,
    state: 'Tamil Nadu',
    description: 'Lower Bhavani Project Turmeric Basin',
  },
  {
    id: 'sathyamangalam',
    name: 'Sathyamangalam',
    tamilName: 'சத்தியமங்கலம்',
    district: 'Erode',
    latitude: 11.5034,
    longitude: 77.2441,
    state: 'Tamil Nadu',
    description: 'Bhavanisagar Foothill Turmeric Tract',
  },
  {
    id: 'bhavani',
    name: 'Bhavani',
    tamilName: 'பவானி',
    district: 'Erode',
    latitude: 11.4503,
    longitude: 77.6834,
    state: 'Tamil Nadu',
    description: 'Cauvery-Bhavani River Confluence Belt',
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    tamilName: 'கோயம்புத்தூர்',
    district: 'Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    state: 'Tamil Nadu',
    description: 'Western Agroclimatic Zone • TNAU Agro-Met Center',
  },
  {
    id: 'pollachi',
    name: 'Pollachi',
    tamilName: 'பொள்ளாச்சி',
    district: 'Coimbatore',
    latitude: 10.6582,
    longitude: 77.0088,
    state: 'Tamil Nadu',
    description: 'Anamalai Foothills Agricultural Plain',
  },
  {
    id: 'salem',
    name: 'Salem',
    tamilName: 'சேலம்',
    district: 'Salem',
    latitude: 11.6643,
    longitude: 78.146,
    state: 'Tamil Nadu',
    description: 'Eastern Turmeric Center • Attur & Omalur Tract',
  },
  {
    id: 'attur',
    name: 'Attur',
    tamilName: 'ஆத்தூர்',
    district: 'Salem',
    latitude: 11.5975,
    longitude: 78.5985,
    state: 'Tamil Nadu',
    description: 'Vashista River Turmeric & Tapioca Belt',
  },
  {
    id: 'dharmapuri',
    name: 'Dharmapuri',
    tamilName: 'தருமபுரி',
    district: 'Dharmapuri',
    latitude: 12.1211,
    longitude: 78.1582,
    state: 'Tamil Nadu',
    description: 'North-Western Turmeric Belt (Pennagaram / Palacode)',
  },
  {
    id: 'namakkal',
    name: 'Namakkal',
    tamilName: 'நாமக்கல்',
    district: 'Namakkal',
    latitude: 11.2189,
    longitude: 78.1674,
    state: 'Tamil Nadu',
    description: 'Kolli Hills Valley Turmeric Tract',
  },
  {
    id: 'tiruchengode',
    name: 'Tiruchengode',
    tamilName: 'திருச்செங்கோடு',
    district: 'Namakkal',
    latitude: 11.3789,
    longitude: 77.8967,
    state: 'Tamil Nadu',
    description: 'Cauvery River Basin Turmeric Belt',
  },
  {
    id: 'rasipuram',
    name: 'Rasipuram',
    tamilName: 'ராசிபுரம்',
    district: 'Namakkal',
    latitude: 11.4642,
    longitude: 78.1741,
    state: 'Tamil Nadu',
    description: 'Eastern Namakkal Agricultural Zone',
  },
  {
    id: 'tiruppur',
    name: 'Tiruppur',
    tamilName: 'திருப்பூர்',
    district: 'Tiruppur',
    latitude: 11.1085,
    longitude: 77.3411,
    state: 'Tamil Nadu',
    description: 'Kongu Agroclimatic Zone',
  },
  {
    id: 'dharapuram',
    name: 'Dharapuram',
    tamilName: 'தாராபுரம்',
    district: 'Tiruppur',
    latitude: 10.7289,
    longitude: 77.5256,
    state: 'Tamil Nadu',
    description: 'Amaravathi River Basin Turmeric Tract',
  },
  {
    id: 'karur',
    name: 'Karur',
    tamilName: 'கரூர்',
    district: 'Karur',
    latitude: 10.9601,
    longitude: 78.0766,
    state: 'Tamil Nadu',
    description: 'Cauvery-Amaravathi Turmeric Belt',
  },
  {
    id: 'dindigul',
    name: 'Dindigul',
    tamilName: 'திண்டுக்கல்',
    district: 'Dindigul',
    latitude: 10.3673,
    longitude: 77.9803,
    state: 'Tamil Nadu',
    description: 'Central Southern Agroclimatic Zone',
  },
  {
    id: 'thanjavur',
    name: 'Thanjavur',
    tamilName: 'தஞ்சாவூர்',
    district: 'Thanjavur',
    latitude: 10.787,
    longitude: 79.1378,
    state: 'Tamil Nadu',
    description: 'Cauvery Delta Agro-Zone',
  },
  {
    id: 'tiruchirappalli',
    name: 'Tiruchirappalli',
    tamilName: 'திருச்சிராப்பள்ளி',
    district: 'Tiruchirappalli',
    latitude: 10.7905,
    longitude: 78.7047,
    state: 'Tamil Nadu',
    description: 'Central Cauvery River Basin',
  },
  {
    id: 'krishnagiri',
    name: 'Krishnagiri',
    tamilName: 'கிருஷ்ணகிரி',
    district: 'Krishnagiri',
    latitude: 12.5186,
    longitude: 78.2137,
    state: 'Tamil Nadu',
    description: 'North-Western High Altitude Zone',
  },
  {
    id: 'theni',
    name: 'Theni',
    tamilName: 'தேனி',
    district: 'Theni',
    latitude: 10.0104,
    longitude: 77.4768,
    state: 'Tamil Nadu',
    description: 'Western Ghats Cumbum Valley',
  },
  {
    id: 'madurai',
    name: 'Madurai',
    tamilName: 'மதுரை',
    district: 'Madurai',
    latitude: 9.9252,
    longitude: 78.1198,
    state: 'Tamil Nadu',
    description: 'Vaigai River Basin Agro-Zone',
  },
  {
    id: 'vellore',
    name: 'Vellore',
    tamilName: 'வேலூர்',
    district: 'Vellore',
    latitude: 12.9165,
    longitude: 79.1325,
    state: 'Tamil Nadu',
    description: 'Palar River Basin Agro-Zone',
  },
  {
    id: 'tiruvannamalai',
    name: 'Tiruvannamalai',
    tamilName: 'திருவண்ணாமலை',
    district: 'Tiruvannamalai',
    latitude: 12.2253,
    longitude: 79.0747,
    state: 'Tamil Nadu',
    description: 'North-Eastern Agroclimatic Zone',
  },
  {
    id: 'cuddalore',
    name: 'Cuddalore',
    tamilName: 'கடலூர்',
    district: 'Cuddalore',
    latitude: 11.748,
    longitude: 79.7714,
    state: 'Tamil Nadu',
    description: 'Coastal Agricultural Plain',
  },
  {
    id: 'villupuram',
    name: 'Villupuram',
    tamilName: 'விழுப்புரம்',
    district: 'Villupuram',
    latitude: 11.9401,
    longitude: 79.4861,
    state: 'Tamil Nadu',
    description: 'Gingee / Pennaiyar River Basin',
  },
  {
    id: 'kallakurichi',
    name: 'Kallakurichi',
    tamilName: 'கள்ளக்குறிச்சி',
    district: 'Kallakurichi',
    latitude: 11.7383,
    longitude: 78.9639,
    state: 'Tamil Nadu',
    description: 'Kalrayan Hills Agricultural Foothills',
  },
  {
    id: 'perambalur',
    name: 'Perambalur',
    tamilName: 'பெரம்பலூர்',
    district: 'Perambalur',
    latitude: 11.2342,
    longitude: 78.882,
    state: 'Tamil Nadu',
    description: 'Central Tamil Nadu Dry Farming Tract',
  },
  {
    id: 'ariyalur',
    name: 'Ariyalur',
    tamilName: 'அரியலூர்',
    district: 'Ariyalur',
    latitude: 11.1401,
    longitude: 79.0786,
    state: 'Tamil Nadu',
    description: 'Marudaiyaru River Basin',
  },
  {
    id: 'pudukkottai',
    name: 'Pudukkottai',
    tamilName: 'புதுக்கோட்டை',
    district: 'Pudukkottai',
    latitude: 10.3833,
    longitude: 78.8001,
    state: 'Tamil Nadu',
    description: 'Southern Red Loam Agro-Zone',
  },
  {
    id: 'sivaganga',
    name: 'Sivaganga',
    tamilName: 'சிவகங்கை',
    district: 'Sivaganga',
    latitude: 9.8433,
    longitude: 78.4809,
    state: 'Tamil Nadu',
    description: 'Vaigai Basin Rainfed Agro-Zone',
  },
  {
    id: 'virudhunagar',
    name: 'Virudhunagar',
    tamilName: 'விருதுநகர்',
    district: 'Virudhunagar',
    latitude: 9.5872,
    longitude: 77.9514,
    state: 'Tamil Nadu',
    description: 'Southern Black Soil Zone',
  },
  {
    id: 'tenkasi',
    name: 'Tenkasi',
    tamilName: 'தென்காசி',
    district: 'Tenkasi',
    latitude: 8.9594,
    longitude: 77.3152,
    state: 'Tamil Nadu',
    description: 'Western Ghats Foothill Agro-Zone',
  },
  {
    id: 'tirunelveli',
    name: 'Tirunelveli',
    tamilName: 'திருநெல்வேலி',
    district: 'Tirunelveli',
    latitude: 8.7139,
    longitude: 77.7567,
    state: 'Tamil Nadu',
    description: 'Thamirabarani River Basin',
  },
  {
    id: 'thoothukudi',
    name: 'Thoothukudi',
    tamilName: 'தூத்துக்குடி',
    district: 'Thoothukudi',
    latitude: 8.7642,
    longitude: 78.1348,
    state: 'Tamil Nadu',
    description: 'Southern Coastal Agro-Zone',
  },
  {
    id: 'kanniyakumari',
    name: 'Kanniyakumari (Nagercoil)',
    tamilName: 'கன்னியாகுமரி',
    district: 'Kanniyakumari',
    latitude: 8.1833,
    longitude: 77.4119,
    state: 'Tamil Nadu',
    description: 'High Rainfall Southern Agro-Zone',
  },
  {
    id: 'nilgiris',
    name: 'The Nilgiris',
    tamilName: 'நீலகிரி',
    district: 'The Nilgiris',
    latitude: 11.4102,
    longitude: 76.695,
    state: 'Tamil Nadu',
    description: 'High Altitude Hill Agroclimatic Zone',
  },
  {
    id: 'tiruvarur',
    name: 'Tiruvarur',
    tamilName: 'திருவாரூர்',
    district: 'Tiruvarur',
    latitude: 10.7725,
    longitude: 79.6365,
    state: 'Tamil Nadu',
    description: 'Cauvery Delta Rice & Spice Basin',
  },
  {
    id: 'nagapattinam',
    name: 'Nagapattinam',
    tamilName: 'நாகப்பட்டினம்',
    district: 'Nagapattinam',
    latitude: 10.7672,
    longitude: 79.8449,
    state: 'Tamil Nadu',
    description: 'Coastal Delta Agro-Zone',
  },
  {
    id: 'mayiladuthurai',
    name: 'Mayiladuthurai',
    tamilName: 'மயிலாடுதுறை',
    district: 'Mayiladuthurai',
    latitude: 11.1075,
    longitude: 79.6523,
    state: 'Tamil Nadu',
    description: 'Lower Cauvery Delta Basin',
  },
  {
    id: 'ranipet',
    name: 'Ranipet',
    tamilName: 'ராணிப்பேட்டை',
    district: 'Ranipet',
    latitude: 12.9272,
    longitude: 79.333,
    state: 'Tamil Nadu',
    description: 'Palar River Agricultural Plain',
  },
  {
    id: 'tirupathur',
    name: 'Tirupathur',
    tamilName: 'திருப்பத்தூர்',
    district: 'Tirupathur',
    latitude: 12.4958,
    longitude: 78.5678,
    state: 'Tamil Nadu',
    description: 'Yelagiri Foothill Agricultural Tract',
  },
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    tamilName: 'காஞ்சிபுரம்',
    district: 'Kanchipuram',
    latitude: 12.8342,
    longitude: 79.7036,
    state: 'Tamil Nadu',
    description: 'Vegavathi River Agro-Zone',
  },
  {
    id: 'chengalpattu',
    name: 'Chengalpattu',
    tamilName: 'செங்கல்பட்டு',
    district: 'Chengalpattu',
    latitude: 12.6841,
    longitude: 79.9836,
    state: 'Tamil Nadu',
    description: 'Palar Delta Agro-Zone',
  },
  {
    id: 'tiruvallur',
    name: 'Tiruvallur',
    tamilName: 'திருவள்ளூர்',
    district: 'Tiruvallur',
    latitude: 13.1432,
    longitude: 79.9083,
    state: 'Tamil Nadu',
    description: 'Kosasthalaiyar River Basin',
  },
  {
    id: 'ramanathapuram',
    name: 'Ramanathapuram',
    tamilName: 'ராமநாதபுரம்',
    district: 'Ramanathapuram',
    latitude: 9.3639,
    longitude: 78.8395,
    state: 'Tamil Nadu',
    description: 'Southern Coastal Semi-Arid Zone',
  },
  {
    id: 'chennai',
    name: 'Chennai',
    tamilName: 'சென்னை',
    district: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    state: 'Tamil Nadu',
    description: 'North Coastal Agro-Met Station',
  },
];

// Default fallback reference for live weather (Erode)
export const TAMIL_NADU_LOCATIONS = HISTORICAL_RESEARCH_DISTRICTS;

export interface LiveWeatherFetchResult {
  records: HourlyEnvironmentalRecord[];
  location: LocationOption;
  fetchedAt: string;
  currentHourRecord: HourlyEnvironmentalRecord;
}

/**
 * Resolves search query against precompiled Tamil Nadu directory + Open-Meteo Geocoding API.
 * Supports any district, city, taluk, or village in Tamil Nadu.
 */
export async function searchTamilNaduLocations(
  query: string
): Promise<LocationOption[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return ALL_TAMIL_NADU_LOCATIONS.slice(0, 8);
  }

  // 1. Search local precompiled Tamil Nadu directory
  const localMatches = ALL_TAMIL_NADU_LOCATIONS.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(cleanQuery) ||
      loc.tamilName.toLowerCase().includes(cleanQuery) ||
      loc.district.toLowerCase().includes(cleanQuery) ||
      loc.description.toLowerCase().includes(cleanQuery)
    );
  });

  // If sufficient local matches found, return them immediately
  if (localMatches.length >= 4 || cleanQuery.length < 3) {
    return localMatches;
  }

  // 2. Query Open-Meteo official Geocoding API for additional Tamil Nadu towns/villages
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cleanQuery
    )}&count=10&language=en&format=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(geoUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        const externalMatches: LocationOption[] = data.results
          .filter((item: any) => {
            // Filter strictly for India and Tamil Nadu or within Tamil Nadu geographic bounding box
            const isIndia = item.country_code === 'IN' || item.country === 'India';
            const isTN =
              item.admin1 === 'Tamil Nadu' ||
              item.admin2 === 'Tamil Nadu' ||
              (item.latitude >= 8.0 &&
                item.latitude <= 13.6 &&
                item.longitude >= 76.2 &&
                item.longitude <= 80.4);
            return isIndia && isTN;
          })
          .map((item: any) => ({
            id: `geo-${item.id || item.latitude.toFixed(4)}-${item.longitude.toFixed(4)}`,
            name: item.name,
            tamilName: item.name,
            district: item.admin2 || item.admin1 || 'Tamil Nadu',
            latitude: item.latitude,
            longitude: item.longitude,
            state: 'Tamil Nadu',
            description: `${item.name}, ${item.admin2 ? item.admin2 + ' District, ' : ''}Tamil Nadu`,
          }));

        // Merge local matches and external matches avoiding duplicates
        const existingIds = new Set(localMatches.map((m) => m.id));
        const combined = [...localMatches];
        for (const ext of externalMatches) {
          if (!existingIds.has(ext.id)) {
            combined.push(ext);
            existingIds.add(ext.id);
          }
        }
        return combined;
      }
    }
  } catch (err) {
    // If external geocoding times out or fails, fallback safely to local matches
    console.warn('Geocoding search fallback to local directory:', err);
  }

  return localMatches;
}

/**
 * Fetches hourly meteorological data for past 14 days + today from Open-Meteo.
 * Passes response through existing normalizeReanalysisPayload() with zero duplicate logic.
 */
export async function fetchLiveWeather14Day(
  location: LocationOption
): Promise<LiveWeatherFetchResult> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,wind_speed_10m,shortwave_radiation,soil_moisture_0_to_7cm&past_days=14&forecast_days=1&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Open-Meteo API returned status ${response.status}: ${response.statusText}`
      );
    }

    const json = await response.json();

    if (!json || !json.hourly || !Array.isArray(json.hourly.time)) {
      throw new Error(
        'Invalid response structure from Open-Meteo: missing hourly time series.'
      );
    }

    // 1. REUSE EXISTING normalizeReanalysisPayload()
    const records = normalizeReanalysisPayload(json);

    // 2. REUSE EXISTING validateHourlySeries()
    const validation = validateHourlySeries(records);
    if (!validation.isValid) {
      throw new Error(
        `Live weather validation failed: ${validation.errors.join(' | ')}`
      );
    }

    // Extract the hourly record matching the current local hour (not the 23:00 future end-of-day forecast)
    const nowLocalStr = new Date().toLocaleDateString('en-CA') + 'T' + String(new Date().getHours()).padStart(2, '0') + ':00';
    let currentHourRecord = records.find((r) => r.timestamp === nowLocalStr);

    if (!currentHourRecord) {
      const pastRecords = records.filter((r) => r.timestamp <= nowLocalStr);
      currentHourRecord = pastRecords.length > 0 ? pastRecords[pastRecords.length - 1] : records[records.length - 1];
    }

    return {
      records,
      location,
      fetchedAt: new Date().toISOString(),
      currentHourRecord,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(
        'Weather API request timed out. Please check your internet connection.'
      );
    }
    throw new Error(err.message || 'Failed to fetch live weather data.');
  }
}

/**
 * Calculates Euclidean / approximate distance to locate the nearest Tamil Nadu district/town.
 */
export function findNearestTamilNaduLocation(
  latitude: number,
  longitude: number
): LocationOption {
  let closest = ALL_TAMIL_NADU_LOCATIONS[0];
  let minDistanceSq = Number.MAX_VALUE;

  for (const loc of ALL_TAMIL_NADU_LOCATIONS) {
    const dLat = loc.latitude - latitude;
    const dLon = loc.longitude - longitude;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closest = loc;
    }
  }

  return closest;
}

/**
 * Helper to clean locality/town/district names by stripping house numbers,
 * street names, road suffixes, and administrative suffixes.
 */
function cleanLocalityPart(val?: string | null): string {
  if (!val) return '';
  let v = val.trim();
  // Remove house numbers or door numbers (e.g., "12/4", "45A", "#10")
  v = v.replace(/^#?\d+[\w\-\/]*\s*/, '');
  // Remove street/road/lane/salai/nagar/colony terms
  v = v.replace(/\b(Street|Road|Salai|Lane|St|Rd|Avenue|Cross|Main\s+Road|Main\s+St)\b.*$/i, '');
  // Remove administrative suffixes
  v = v.replace(/\s+(Taluk|District|Tk|Dt|Post|PO|Sub-District)\b/gi, '');
  return v.trim().replace(/^,+|,+$/g, '');
}

/**
 * Reverse geocodes exact device coordinates (lat, lon, accuracy) into a specific, farmer-friendly locality.
 *
 * Preferred Display Hierarchy:
 * 1. [locality/village], [town/city]  (e.g., "Thokkavadi, Tiruchengode")
 * 2. [locality/village], [district]   (e.g., "Thokkavadi, Namakkal")
 * 3. [town/city], [district]          (e.g., "Tiruchengode, Namakkal")
 * 4. [district], Tamil Nadu           (e.g., "Namakkal, Tamil Nadu")
 *
 * CRITICAL REQUIREMENTS:
 * - Keeps original latitude and longitude internally for exact Open-Meteo weather forecasts.
 * - Does NOT round or replace coordinates with district/town center coordinates.
 * - Does NOT display exact street address or house number.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number,
  accuracy?: number
): Promise<LocationOption> {
  const nearestLocal = findNearestTamilNaduLocation(latitude, longitude);

  // Strategy 1: High-resolution OpenStreetMap / Nominatim Reverse Geocoding
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&zoom=18&addressdetails=1&email=app@turmericare.ai`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(osmUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TurmeriCareAI-App/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      // Locality keys in order of granularity
      const localityKeys = [
        'village',
        'suburb',
        'neighbourhood',
        'locality',
        'hamlet',
        'quarter',
        'residential',
        'isolated_dwelling',
      ];
      let locality = '';
      for (const k of localityKeys) {
        if (addr[k]) {
          const cleaned = cleanLocalityPart(addr[k]);
          if (cleaned) {
            locality = cleaned;
            break;
          }
        }
      }

      // Town / City / Taluk keys
      const townKeys = ['town', 'city', 'municipality', 'county', 'subdistrict'];
      let town = '';
      for (const k of townKeys) {
        if (addr[k]) {
          const cleaned = cleanLocalityPart(addr[k]);
          if (cleaned && cleaned.toLowerCase() !== locality.toLowerCase()) {
            town = cleaned;
            break;
          }
        }
      }

      // District keys
      const districtKeys = ['state_district', 'district', 'county'];
      let district = '';
      for (const k of districtKeys) {
        if (addr[k]) {
          const cleaned = cleanLocalityPart(addr[k]);
          if (cleaned) {
            district = cleaned;
            break;
          }
        }
      }

      const state = addr.state || 'Tamil Nadu';

      let displayName = '';
      let displaySecondary = '';

      if (locality && town && locality.toLowerCase() !== town.toLowerCase()) {
        displayName = locality;
        displaySecondary = town;
      } else if (locality && district && locality.toLowerCase() !== district.toLowerCase()) {
        displayName = locality;
        displaySecondary = district;
      } else if (town && district && town.toLowerCase() !== district.toLowerCase()) {
        displayName = town;
        displaySecondary = district;
      } else if (district) {
        displayName = district;
        displaySecondary = state;
      } else {
        displayName = locality || town || nearestLocal.name;
        displaySecondary = district || nearestLocal.district;
      }

      return {
        id: `current-loc-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
        name: displayName,
        tamilName: displayName,
        district: displaySecondary,
        latitude: latitude,
        longitude: longitude,
        state: state,
        description: `${displayName}, ${displaySecondary}`,
        isCurrentLocation: true,
        accuracy: accuracy,
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed or timed out, falling back to secondary provider:', err);
  }

  // Strategy 2: BigDataCloud Reverse Geocoding Fallback
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawLocality =
        data.locality ||
        data.localityInfo?.administrative?.[3]?.name;
      const rawCity =
        data.city ||
        data.principalSubdivisionCity ||
        data.localityInfo?.administrative?.[2]?.name;
      const rawDistrict =
        data.localityInfo?.administrative?.[2]?.name ||
        data.principalSubdivisionCity ||
        nearestLocal.district;

      const cleanLocality = cleanLocalityPart(rawLocality);
      const cleanCity = cleanLocalityPart(rawCity);
      const cleanDistrict = cleanLocalityPart(rawDistrict);

      let displayName = cleanLocality || cleanCity || nearestLocal.name;
      let displaySecondary = cleanDistrict || nearestLocal.district;

      if (cleanLocality && cleanCity && cleanLocality.toLowerCase() !== cleanCity.toLowerCase()) {
        displayName = cleanLocality;
        displaySecondary = cleanCity;
      } else if (cleanLocality && cleanDistrict && cleanLocality.toLowerCase() !== cleanDistrict.toLowerCase()) {
        displayName = cleanLocality;
        displaySecondary = cleanDistrict;
      } else if (cleanCity && cleanDistrict && cleanCity.toLowerCase() !== cleanDistrict.toLowerCase()) {
        displayName = cleanCity;
        displaySecondary = cleanDistrict;
      }

      return {
        id: `current-loc-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
        name: displayName,
        tamilName: displayName,
        district: displaySecondary,
        latitude: latitude,
        longitude: longitude,
        state: 'Tamil Nadu',
        description: `${displayName}, ${displaySecondary}`,
        isCurrentLocation: true,
        accuracy: accuracy,
      };
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode fallback failed:', err);
  }

  // Strategy 3: Graceful fallback to nearest Tamil Nadu location WITH original coordinates preserved
  return {
    ...nearestLocal,
    id: `current-loc-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
    latitude: latitude,
    longitude: longitude,
    description: `${nearestLocal.name}, ${nearestLocal.district}, Tamil Nadu`,
    isCurrentLocation: true,
    accuracy: accuracy,
  };
}
