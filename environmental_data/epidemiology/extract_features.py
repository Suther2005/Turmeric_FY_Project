import pandas as pd
import numpy as np
import os
import csv
from datetime import datetime, timedelta

base_dir = r'd:\curuma\environmental_data'
clean_dir = os.path.join(base_dir, 'cleaned')
epi_dir = os.path.join(base_dir, 'epidemiology')
os.makedirs(epi_dir, exist_ok=True)

# Load cleaned environmental datasets
env_dfs = {
    'Erode': pd.read_csv(os.path.join(clean_dir, 'erode_hourly_2021_2023.csv')),
    'Coimbatore': pd.read_csv(os.path.join(clean_dir, 'coimbatore_hourly_2021_2023.csv')),
    'Salem': pd.read_csv(os.path.join(clean_dir, 'salem_hourly_2021_2023.csv')),
    'Dharmapuri': pd.read_csv(os.path.join(clean_dir, 'dharmapuri_hourly_2021_2023.csv'))
}

for k in env_dfs:
    env_dfs[k]['dt'] = pd.to_datetime(env_dfs[k]['timestamp_ist'])
    env_dfs[k].set_index('dt', inplace=True)

# Load verified disease observations
verified_obs_path = os.path.join(base_dir, 'verified_disease_observations.csv')
obs_df = pd.read_csv(verified_obs_path)

# Define explicit 14-day antecedent exposure windows
# Window starts 14 days prior to documented start of observation scoring period
exposure_windows = [
    ('V-DIS-01', '2021-10-01 00:00:00', '2021-10-14 23:00:00', 'Antecedent 14-day monsoonal infection build-up prior to mid-Oct trial scoring'),
    ('V-DIS-02', '2021-10-18 00:00:00', '2021-10-31 23:00:00', 'Antecedent 14-day late monsoonal period prior to Nov blotch evaluation'),
    ('V-DIS-03', '2022-09-17 00:00:00', '2022-09-30 23:00:00', 'Antecedent 14-day pre-October survey build-up in western taluks'),
    ('V-DIS-04', '2022-10-18 00:00:00', '2022-10-31 23:00:00', 'Antecedent 14-day post-monsoon exposure prior to November blotch survey'),
    ('V-DIS-05', '2022-10-27 00:00:00', '2022-11-09 23:00:00', 'Antecedent 14-day heavy rain exposure window preceding TNAU advisory alert'),
    ('V-DIS-06', '2022-10-01 00:00:00', '2022-10-14 23:00:00', 'Antecedent 14-day monsoon period preceding 2022 AICRPS trial scoring'),
    ('V-DIS-07', '2022-11-01 00:00:00', '2022-11-14 23:00:00', 'Antecedent 14-day late-season exposure preceding peak blotch scoring'),
    ('V-DIS-08', '2021-10-18 00:00:00', '2021-10-31 23:00:00', 'Antecedent 14-day winter monsoon exposure preceding Salem survey'),
    ('V-DIS-09', '2021-11-17 00:00:00', '2021-11-30 23:00:00', 'Antecedent 14-day post-monsoon drydown exposure preceding December survey'),
    ('V-DIS-10', '2023-09-26 00:00:00', '2023-10-09 23:00:00', 'Antecedent 14-day dry spell window preceding October aphid warning'),
    ('V-DIS-11', '2023-11-01 00:00:00', '2023-11-14 23:00:00', 'Antecedent 14-day humid post-rain exposure preceding November blotch alert'),
    ('V-DIS-12', '2023-10-01 00:00:00', '2023-10-14 23:00:00', 'Representative mid-season 14-day exposure window during image collection season')
]

window_map = {w[0]: (w[1], w[2], w[3]) for w in exposure_windows}

features_list = []

for idx, row in obs_df.iterrows():
    rec_id = row['record_id']
    dist = row['location_district']
    src_id = row['source_id']
    disease = row['disease_common_name']
    rep_val = row['reported_value']
    met_type = row['metric_type']
    
    start_str, end_str, win_note = window_map[rec_id]
    
    env_df = env_dfs[dist]
    sub = env_df.loc[start_str:end_str]
    
    total_hours = len(sub) # Expect 336 hours (14 days * 24 hrs)
    
    # 1. Rainfall features
    cum_rain = sub['precipitation_mm'].sum()
    # Daily resampled rainfall count (days with > 0.1mm)
    daily_rain = sub['precipitation_mm'].resample('1D').sum()
    rain_days = (daily_rain > 0.1).sum()
    
    # 2. Temperature features
    t_mean = sub['temperature_2m_degC'].mean()
    t_min = sub['temperature_2m_degC'].min()
    t_max = sub['temperature_2m_degC'].max()
    # Literature threshold: 22 to 32 deg C optimal range for foliar fungal pathogens
    hours_temp_opt = ((sub['temperature_2m_degC'] >= 22.0) & (sub['temperature_2m_degC'] <= 32.0)).sum()
    
    # 3. Relative Humidity features
    rh_mean = sub['relative_humidity_2m_pct'].mean()
    # Literature threshold: RH >= 80% critical for spore germination & lesion expansion
    hours_rh80 = (sub['relative_humidity_2m_pct'] >= 80.0).sum()
    hours_rh90 = (sub['relative_humidity_2m_pct'] >= 90.0).sum()
    
    # 4. Dew Point & Condensation Proxy
    # Dew-point depression: (T - T_dew) <= 1.5 deg C indicates high probability of canopy surface condensation/dew
    dew_dep = sub['temperature_2m_degC'] - sub['dew_point_2m_degC']
    hours_dew = (dew_dep <= 1.5).sum()
    
    # 5. Wind Speed
    wind_mean = sub['wind_speed_10m_kmh'].mean()
    wind_max = sub['wind_speed_10m_kmh'].max()
    
    # 6. Solar Radiation
    solar_mean = sub['solar_radiation_Wm2'].mean()
    solar_max = sub['solar_radiation_Wm2'].max()
    # Low solar radiation hours (< 100 W/m2 during daylight 06:00-18:00) indicating overcast canopy dampness
    daylight_sub = sub.between_time('06:00', '18:00')
    overcast_daylight_hrs = (daylight_sub['solar_radiation_Wm2'] < 150.0).sum()
    
    # 7. Soil Moisture
    sm_mean = sub['soil_moisture_0_to_7cm_m3m3'].mean()
    sm_max = sub['soil_moisture_0_to_7cm_m3m3'].max()
    
    features_list.append({
        'record_id': rec_id,
        'source_id': src_id,
        'location_district': dist,
        'disease_type': disease,
        'metric_type': met_type,
        'reported_severity_value': rep_val,
        'crop_growth_stage': row['crop_growth_stage'],
        'exposure_window_start': start_str,
        'exposure_window_end': end_str,
        'total_exposure_hours': total_hours,
        'cumulative_rainfall_14d_mm': round(cum_rain, 1),
        'rainfall_days_14d_count': int(rain_days),
        'temp_mean_degC': round(t_mean, 2),
        'temp_min_degC': round(t_min, 1),
        'temp_max_degC': round(t_max, 1),
        'hours_temp_favorable_22_32C': int(hours_temp_opt),
        'pct_hours_temp_favorable': round(hours_temp_opt / total_hours * 100, 1),
        'rh_mean_pct': round(rh_mean, 1),
        'hours_rh_ge_80pct': int(hours_rh80),
        'pct_hours_rh_ge_80pct': round(hours_rh80 / total_hours * 100, 1),
        'hours_rh_ge_90pct': int(hours_rh90),
        'hours_dew_condensation_proxy': int(hours_dew),
        'pct_hours_dew_condensation': round(hours_dew / total_hours * 100, 1),
        'wind_speed_mean_kmh': round(wind_mean, 2),
        'wind_speed_max_kmh': round(wind_max, 1),
        'solar_rad_mean_Wm2': round(solar_mean, 1),
        'solar_rad_max_Wm2': round(solar_max, 1),
        'overcast_daylight_hours': int(overcast_daylight_hrs),
        'soil_moisture_0_7cm_mean_m3m3': round(sm_mean, 4),
        'soil_moisture_0_7cm_max_m3m3': round(sm_max, 4),
        'linkage_quality': 'PARTIALLY_SUPPORTED_14D_ANTECEDENT'
    })

feat_df = pd.DataFrame(features_list)
feat_csv_path = os.path.join(epi_dir, 'disease_exposure_features.csv')
feat_df.to_csv(feat_csv_path, index=False)
print(f'Successfully generated {feat_csv_path} ({len(feat_df)} records).')

# Generate Feature Definitions Dictionary
feature_defs = [
    {
        'feature_name': 'cumulative_rainfall_14d_mm',
        'physical_unit': 'mm',
        'feature_category': 'Derived Statistical Feature',
        'scientific_justification': 'Sum of precipitation over 14 antecedent days. Splash dispersal and soil waterlogging driver.',
        'literature_source': 'TNAU Agritech Portal; ICAR-IISR Turmeric Production Manual',
        'threshold_or_formula': 'Sum of hourly precipitation over 336 hours'
    },
    {
        'feature_name': 'rainfall_days_14d_count',
        'physical_unit': 'days (count 0-14)',
        'feature_category': 'Derived Statistical Feature',
        'scientific_justification': 'Number of discrete 24-hour days with measurable precipitation (>0.1mm), indicating rain persistence.',
        'literature_source': 'Palakshappa et al. (2013), Journal of Spices & Aromatic Crops',
        'threshold_or_formula': 'Daily aggregate precipitation > 0.1 mm'
    },
    {
        'feature_name': 'temp_mean_degC',
        'physical_unit': '°C',
        'feature_category': 'Derived Statistical Feature',
        'scientific_justification': 'Mean ambient air temperature at 2m during the 14-day exposure window.',
        'literature_source': 'Standard Meteorological Reanalysis Variable (ERA5-Land)',
        'threshold_or_formula': 'Arithmetic mean over 336 hourly observations'
    },
    {
        'feature_name': 'hours_temp_favorable_22_32C',
        'physical_unit': 'hours (count 0-336)',
        'feature_category': 'Literature-Supported Threshold Feature',
        'scientific_justification': 'Cumulative hours within optimal fungal mycelial growth and incubation range for Colletotrichum & Taphrina.',
        'literature_source': 'TNAU Crop Protection Guide; Reddy et al. (Indian Phytopathology); Palakshappa et al.',
        'threshold_or_formula': 'Count of hours where 22.0°C <= temperature_2m <= 32.0°C'
    },
    {
        'feature_name': 'rh_mean_pct',
        'physical_unit': '%',
        'feature_category': 'Derived Statistical Feature',
        'scientific_justification': 'Mean relative atmospheric humidity at 2m over the 14-day window.',
        'literature_source': 'Standard Meteorological Reanalysis Variable (ERA5-Land)',
        'threshold_or_formula': 'Arithmetic mean over 336 hourly observations'
    },
    {
        'feature_name': 'hours_rh_ge_80pct',
        'physical_unit': 'hours (count 0-336)',
        'feature_category': 'Literature-Supported Threshold Feature',
        'scientific_justification': 'Cumulative hours with relative humidity >= 80%. Critical threshold for spore germination and lesion halo expansion.',
        'literature_source': 'TNAU Agritech Portal (Turmeric Pathology); Indian Phytopathology (2022)',
        'threshold_or_formula': 'Count of hours where relative_humidity_2m >= 80.0%'
    },
    {
        'feature_name': 'hours_rh_ge_90pct',
        'physical_unit': 'hours (count 0-336)',
        'feature_category': 'Literature-Supported Threshold Feature',
        'scientific_justification': 'Cumulative hours of near-saturated air humidity facilitating rapid acervuli/ascus maturation.',
        'literature_source': 'Magarey et al. (Foliar Infection Models); Plant Disease Journal',
        'threshold_or_formula': 'Count of hours where relative_humidity_2m >= 90.0%'
    },
    {
        'feature_name': 'hours_dew_condensation_proxy',
        'physical_unit': 'hours (count 0-336)',
        'feature_category': 'Derived Biophysical Proxy Feature',
        'scientific_justification': 'Hours where dew point depression (T - T_dew) <= 1.5°C, serving as a meteorological proxy for canopy condensation and leaf wetness film.',
        'literature_source': 'Monteith & Unsworth (Principles of Environmental Physics); Sentelhas et al. (Agricultural Meteorology)',
        'threshold_or_formula': 'Count of hours where (temperature_2m - dew_point_2m) <= 1.5°C'
    },
    {
        'feature_name': 'wind_speed_mean_kmh',
        'physical_unit': 'km/h',
        'feature_category': 'Derived Statistical Feature',
        'scientific_justification': 'Mean surface wind speed at 10m. Stagnant airflow (<5 km/h) prevents drying; moderate wind aids ascospore transport.',
        'literature_source': 'Standard Meteorological Reanalysis Variable (ERA5-Land)',
        'threshold_or_formula': 'Arithmetic mean over 336 hourly observations'
    },
    {
        'feature_name': 'solar_rad_mean_Wm2',
        'physical_unit': 'W/m²',
        'feature_category': 'Derived Statistical Feature',
        'scientific_justification': 'Mean downward surface solar radiation. High solar flux accelerates leaf drying and exposes surface spores to UV degradation.',
        'literature_source': 'Standard Meteorological Reanalysis Variable (ERA5-Land)',
        'threshold_or_formula': 'Arithmetic mean over 336 hourly observations'
    },
    {
        'feature_name': 'overcast_daylight_hours',
        'physical_unit': 'hours (count 0-182)',
        'feature_category': 'Literature-Supported Threshold Feature',
        'scientific_justification': 'Count of daylight hours (06:00-18:00) with low solar radiation (<150 W/m²), indicating overcast skies that preserve foliar moisture.',
        'literature_source': 'TNAU Agrometeorology Advisory Manual',
        'threshold_or_formula': 'Count of hours between 06:00 and 18:00 where shortwave_radiation < 150.0 W/m²'
    },
    {
        'feature_name': 'soil_moisture_0_7cm_mean_m3m3',
        'physical_unit': 'm³/m³',
        'feature_category': 'Derived Statistical Feature',
        'scientific_justification': 'Mean topsoil volumetric moisture (0-7cm). Elevated soil water (>0.30) elevates sub-canopy boundary layer humidity.',
        'literature_source': 'ECMWF ERA5-Land Land Surface Hydrology Scheme (HTESSEL)',
        'threshold_or_formula': 'Arithmetic mean over 336 hourly observations'
    }
]

def_df = pd.DataFrame(feature_defs)
def_csv_path = os.path.join(epi_dir, 'feature_definitions.csv')
def_df.to_csv(def_csv_path, index=False)
print(f'Successfully generated {def_csv_path}.')
