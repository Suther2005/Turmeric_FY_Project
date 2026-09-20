# Environmental Dataset Provenance & Methodology Statement

**Project:** TurmeriCare AI  
**Collection Date:** September 2026  
**Primary Archive Provider:** Open-Meteo Historical Weather API  
**Underlying Assimilation Model:** European Centre for Medium-Range Weather Forecasts (**ECMWF Copernicus ERA5 / ERA5-Land Reanalysis**)  
**Legal / Licensing Framework:** Open Database License (ODbL) / Copernicus Open Access Data Policy

---

## 1. Source Origin & Extraction Pipeline

1. **Reanalysis Provider:**
   * ECMWF ERA5 is the 5th generation atmospheric reanalysis of global climate, combining model data with observations from synoptic weather stations, radar, soundings, and satellite radiances through 4D-Var data assimilation.
2. **Access Method:**
   * Direct programmatic HTTPS retrieval from `https://archive-api.open-meteo.com/v1/archive` using standardized REST queries.
   * Parameter selection: `temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,wind_speed_10m,shortwave_radiation,soil_moisture_0_to_7cm`.
   * Timezone alignment: Local `Asia/Kolkata` (IST / UTC+05:30).

---

## 2. Target Locations & Geospatial Grid Alignment

| District | Target Latitude (°N) | Target Longitude (°E) | Model Grid Centroid | Elevation (m) | Agricultural Significance |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Erode** | `11.3410` | `77.7172` | `11.3500° N, 77.7000° E` | 177.0 m | Primary turmeric production hub of Tamil Nadu (GI Tag zone, Bhavanisagar research belt). |
| **Coimbatore** | `11.0168` | `76.9558` | `11.0000° N, 76.9500° E` | 431.0 m | Western agroclimatic zone (TNAU main campus trial farm coordinates). |
| **Salem** | `11.6643` | `78.1460` | `11.6500° N, 78.1500° E` | 284.0 m | Major commercial turmeric trading & processing cluster. |
| **Dharmapuri** | `12.1211` | `78.1582` | `12.1000° N, 78.1500° E` | 461.0 m | North-western high-altitude dry-to-semi-humid turmeric growing pocket. |

---

## 3. Data Integrity & Non-Fabrication Declaration

* **No Synthetic Generation:** Every numerical value represents reanalyzed meteorological observations produced by ECMWF numerical weather assimilation models.
* **Absence of Leaf Wetness & Soil pH:** Leaf wetness and soil pH are **not** present in global meteorological reanalysis models. These fields have been explicitly preserved as `UNAVAILABLE_IN_MET_REANALYSIS` to ensure research honesty and avoid synthetic fabrication.
* **No Live Sensor Claims:** This dataset is strictly categorized as **historical meteorological reanalysis data**, intended for baseline training and validation, and is not represented as live IoT sensor telemetry.
