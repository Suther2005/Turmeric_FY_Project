# TurmeriCare AI — Environmental Data Dictionary

**Dataset Identifier:** `TURMERIC-ENV-TN-ERA5-2021-2023`  
**Dataset Version:** 1.0.0 (Research Archive Edition)  
**Geographic Coverage:** Tamil Nadu, India (Erode, Coimbatore, Salem, Dharmapuri)  
**Temporal Span:** 2021-01-01 00:00:00 to 2023-12-31 23:00:00 IST (UTC+05:30)  
**Total Records:** 105,120 hourly time-series observations (26,280 records/district)  
**Temporal Resolution:** 1 hour continuous intervals  
**Data Classification:** Historical Meteorological Reanalysis (Not real-time IoT field sensors)

---

## 1. Column-by-Column Schema Specification

| Column Name | Data Type | Physical Unit | Valid Range | Missingness | Measurement Height / Depth | Description & Epidemiological Relevance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `timestamp_ist` | ISO-8601 String | `YYYY-MM-DDTHH:MM` | 2021-01-01 to 2023-12-31 | 0 (0.0%) | — | Local observation timestamp in Indian Standard Time (UTC+05:30). |
| `location_district` | String (Categorical) | Categorical | `Erode`, `Coimbatore`, `Salem`, `Dharmapuri` | 0 (0.0%) | Surface | Administrative district representing major turmeric farming belts in Tamil Nadu. |
| `latitude` | Float (Decimal) | Decimal Degrees (°N) | `11.0` to `12.2` | 0 (0.0%) | Surface | Geographic latitude of target production cluster centroid. |
| `longitude` | Float (Decimal) | Decimal Degrees (°E) | `76.9` to `78.2` | 0 (0.0%) | Surface | Geographic longitude of target production cluster centroid. |
| `elevation_m` | Float | Meters (m MSL) | `170.0` to `470.0` | 0 (0.0%) | Topography | Elevation above mean sea level of reanalysis land grid cell. |
| `temperature_2m_degC` | Float | Celsius (°C) | `10.0` to `45.0` | 0 (0.0%) | 2.0 m above ground | Air temperature at 2m height. Modulates fungal incubation rate (*Taphrina*, *Colletotrichum* optimum: 22–32°C). |
| `relative_humidity_2m_pct` | Float | Percentage (%) | `0.0` to `100.0` | 0 (0.0%) | 2.0 m above ground | Relative atmospheric moisture. $\text{RH} \ge 80\%$ is the critical threshold for foliar spore germination. |
| `dew_point_2m_degC` | Float | Celsius (°C) | `-10.0` to `35.0` | 0 (0.0%) | 2.0 m above ground | Temperature at which air reaches saturation. Used with temperature to derive dew condensation windows. |
| `precipitation_mm` | Float | Millimeters (mm) | `0.0` to `200.0` | 0 (0.0%) | Surface Accumulation | Hourly rainfall accumulation. Governs splash dispersal of fungal conidia and soil saturation. |
| `wind_speed_10m_kmh` | Float | Kilometers/hour (km/h) | `0.0` to `100.0` | 0 (0.0%) | 10.0 m above ground | Surface wind speed. Stagnant air ($< 5\text{ km/h}$) preserves canopy wetness; moderate air ($8\text{–}18\text{ km/h}$) disperses airborne ascospores. |
| `solar_radiation_Wm2` | Float | Watts/square meter ($\text{W/m}^2$) | `0.0` to `1200.0` | 0 (0.0%) | Surface | Global horizontal shortwave solar irradiance (direct + diffuse). Governs foliar drying and spore UV mortality. |
| `soil_moisture_0_to_7cm_m3m3` | Float | Volume fraction ($\text{m}^3/\text{m}^3$) | `0.0` to `0.6` | 0 (0.0%) | 0 to 7 cm topsoil | Volumetric water content in the topsoil layer. Saturated conditions ($> 0.35$) create root hypoxia and elevate sub-canopy humidity. |
| `leaf_wetness_status` | String (Status) | Status Indicator | `UNAVAILABLE_IN_MET_REANALYSIS` | 100% | Foliar canopy | **UNAVAILABLE** in atmospheric reanalysis. Marked explicitly to prevent synthetic fabrication. Requires in-situ hardware. |
| `soil_ph_status` | String (Status) | Status Indicator | `UNAVAILABLE_IN_MET_REANALYSIS` | 100% | Root zone | **UNAVAILABLE** in atmospheric reanalysis. Marked explicitly to prevent synthetic fabrication. Requires soil testing lab logs. |
| `data_provenance` | String (Metadata) | Enum | `ECMWF_ERA5_REANALYSIS_OPEN_METEO` | 0 (0.0%) | — | Provenance declaration confirming source origin and quality standard. |

---

## 2. Parameter Mapping & Representation Standards

* **Missing Values Protocol:** No missing numerical timestamps or values exist in the reanalysis series. Missing physical channels (leaf wetness, soil pH) are recorded with the explicit string token `UNAVAILABLE_IN_MET_REANALYSIS`.
* **Zero Policy:** Precipitation and solar radiation of `0.0` strictly represent physical zero values (no rain / nighttime), not missing observations.
* **Coordinate Consistency:** All coordinates correspond to verified agricultural production centres within the respective districts.
