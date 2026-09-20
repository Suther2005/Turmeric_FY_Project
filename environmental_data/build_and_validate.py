import urllib.request
import json
import csv
import os
import time
from datetime import datetime, timedelta

locations = [
    {'name': 'erode', 'display': 'Erode', 'lat': 11.3410, 'lon': 77.7172, 'district': 'Erode', 'state': 'Tamil Nadu'},
    {'name': 'coimbatore', 'display': 'Coimbatore', 'lat': 11.0168, 'lon': 76.9558, 'district': 'Coimbatore', 'state': 'Tamil Nadu'},
    {'name': 'salem', 'display': 'Salem', 'lat': 11.6643, 'lon': 78.1460, 'district': 'Salem', 'state': 'Tamil Nadu'},
    {'name': 'dharmapuri', 'display': 'Dharmapuri', 'lat': 12.1211, 'lon': 78.1582, 'district': 'Dharmapuri', 'state': 'Tamil Nadu'}
]

base_dir = r'd:\curuma\environmental_data'
raw_dir = os.path.join(base_dir, 'raw')
clean_dir = os.path.join(base_dir, 'cleaned')
meta_dir = os.path.join(base_dir, 'metadata')
val_dir = os.path.join(base_dir, 'validation')

for d in [raw_dir, clean_dir, meta_dir, val_dir]:
    os.makedirs(d, exist_ok=True)

start_date = '2021-01-01'
end_date = '2023-12-31'
params = 'temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,wind_speed_10m,shortwave_radiation,soil_moisture_0_to_7cm'

all_results = {}

for loc in locations:
    name = loc['name']
    display = loc['display']
    lat = loc['lat']
    lon = loc['lon']
    print(f'Fetching {display} ({lat}, {lon})...')
    
    url = f'https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={start_date}&end_date={end_date}&hourly={params}&timezone=Asia/Kolkata'
    req = urllib.request.Request(url, headers={'User-Agent': 'TurmeriCareAI-Research/1.0'})
    
    with urllib.request.urlopen(req) as resp:
        raw_json = json.loads(resp.read().decode('utf-8'))
        
    raw_json_path = os.path.join(raw_dir, f'{name}_raw_2021_2023.json')
    with open(raw_json_path, 'w', encoding='utf-8') as f:
        json.dump(raw_json, f, indent=2)
        
    hourly = raw_json['hourly']
    times = hourly['time']
    n = len(times)
    
    # Write raw CSV
    raw_csv_path = os.path.join(raw_dir, f'{name}_raw_2021_2023.csv')
    with open(raw_csv_path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['# SOURCE: Open-Meteo ERA5 Reanalysis'])
        w.writerow([f'# LOCATION: {display}, Tamil Nadu (Target: {lat}N, {lon}E)'])
        w.writerow([f'# PERIOD: {start_date} to {end_date} IST'])
        w.writerow(['timestamp_ist', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'precipitation', 'wind_speed_10m', 'shortwave_radiation', 'soil_moisture_0_to_7cm'])
        for i in range(n):
            w.writerow([
                times[i],
                hourly['temperature_2m'][i],
                hourly['relative_humidity_2m'][i],
                hourly['dew_point_2m'][i],
                hourly['precipitation'][i],
                hourly['wind_speed_10m'][i],
                hourly['shortwave_radiation'][i],
                hourly['soil_moisture_0_to_7cm'][i]
            ])
            
    # Write cleaned CSV
    clean_csv_path = os.path.join(clean_dir, f'{name}_hourly_2021_2023.csv')
    with open(clean_csv_path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow([
            'timestamp_ist',
            'location_district',
            'latitude',
            'longitude',
            'elevation_m',
            'temperature_2m_degC',
            'relative_humidity_2m_pct',
            'dew_point_2m_degC',
            'precipitation_mm',
            'wind_speed_10m_kmh',
            'solar_radiation_Wm2',
            'soil_moisture_0_to_7cm_m3m3',
            'leaf_wetness_status',
            'soil_ph_status',
            'data_provenance'
        ])
        for i in range(n):
            w.writerow([
                times[i],
                display,
                lat,
                lon,
                raw_json.get('elevation', 0),
                round(hourly['temperature_2m'][i], 2),
                round(hourly['relative_humidity_2m'][i], 1),
                round(hourly['dew_point_2m'][i], 2),
                round(hourly['precipitation'][i], 2),
                round(hourly['wind_speed_10m'][i], 2),
                round(hourly['shortwave_radiation'][i], 1),
                round(hourly['soil_moisture_0_to_7cm'][i], 4),
                'UNAVAILABLE_IN_MET_REANALYSIS',
                'UNAVAILABLE_IN_MET_REANALYSIS',
                'ECMWF_ERA5_REANALYSIS_OPEN_METEO'
            ])
            
    all_results[name] = {
        'display': display,
        'lat': lat,
        'lon': lon,
        'res_lat': raw_json.get('latitude'),
        'res_lon': raw_json.get('longitude'),
        'elevation': raw_json.get('elevation'),
        'records': n,
        'hourly': hourly,
        'times': times
    }
    print(f'Saved {display}: {n} records.')
    time.sleep(1)

print('Starting data validation checks across all 4 locations...')

val_summary = []

for name, data in all_results.items():
    disp = data['display']
    times = data['times']
    hourly = data['hourly']
    n = data['records']
    
    # 1. Duplicate timestamp check
    unique_times = set(times)
    has_duplicates = len(unique_times) != len(times)
    
    # 2. Missing timestamp / temporal continuity check (1-hour step)
    dt_objects = [datetime.fromisoformat(t) for t in times]
    is_continuous = True
    gap_count = 0
    for idx in range(len(dt_objects) - 1):
        delta = dt_objects[idx+1] - dt_objects[idx]
        if delta != timedelta(hours=1):
            is_continuous = False
            gap_count += 1
            
    # 3. Missing values per variable & physical range checks
    var_metrics = {}
    range_valid = True
    
    ranges = {
        'temperature_2m': (0.0, 50.0),
        'relative_humidity_2m': (0.0, 100.0),
        'dew_point_2m': (-10.0, 40.0),
        'precipitation': (0.0, 250.0),
        'wind_speed_10m': (0.0, 120.0),
        'shortwave_radiation': (0.0, 1400.0),
        'soil_moisture_0_to_7cm': (0.0, 1.0)
    }
    
    for vname, (min_lim, max_lim) in ranges.items():
        vlist = hourly[vname]
        null_count = sum(1 for x in vlist if x is None)
        valid_v = [x for x in vlist if x is not None]
        v_min = min(valid_v) if valid_v else None
        v_max = max(valid_v) if valid_v else None
        v_avg = sum(valid_v)/len(valid_v) if valid_v else None
        
        in_range = (v_min >= min_lim and v_max <= max_lim) if valid_v else False
        if not in_range:
            range_valid = False
            
        var_metrics[vname] = {
            'nulls': null_count,
            'min': v_min,
            'max': v_max,
            'mean': v_avg,
            'in_range': in_range
        }
        
    val_summary.append({
        'location': disp,
        'records': n,
        'start': times[0],
        'end': times[-1],
        'has_duplicates': has_duplicates,
        'is_continuous': is_continuous,
        'gaps': gap_count,
        'range_valid': range_valid,
        'metrics': var_metrics
    })

print('Validation completed successfully!')

# Write dataset_summary.csv
summary_csv_path = os.path.join(base_dir, 'dataset_summary.csv')
with open(summary_csv_path, 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow([
        'location',
        'district',
        'latitude',
        'longitude',
        'elevation_m',
        'start_date',
        'end_date',
        'total_records',
        'temporal_resolution',
        'missing_values_count',
        'temporal_gaps',
        'temp_min_degC',
        'temp_max_degC',
        'temp_mean_degC',
        'rh_min_pct',
        'rh_max_pct',
        'rh_mean_pct',
        'precip_total_mm',
        'data_source'
    ])
    for s in val_summary:
        loc_info = next(l for l in locations if l['display'] == s['location'])
        vm = s['metrics']
        t_precip = sum(all_results[loc_info['name']]['hourly']['precipitation'])
        w.writerow([
            s['location'],
            loc_info['district'],
            loc_info['lat'],
            loc_info['lon'],
            all_results[loc_info['name']]['elevation'],
            s['start'],
            s['end'],
            s['records'],
            '1 hour',
            sum(v['nulls'] for v in vm.values()),
            s['gaps'],
            f"{vm['temperature_2m']['min']:.1f}",
            f"{vm['temperature_2m']['max']:.1f}",
            f"{vm['temperature_2m']['mean']:.1f}",
            f"{vm['relative_humidity_2m']['min']:.0f}",
            f"{vm['relative_humidity_2m']['max']:.0f}",
            f"{vm['relative_humidity_2m']['mean']:.1f}",
            f"{t_precip:.1f}",
            'ECMWF ERA5 via Open-Meteo'
        ])

print('Saved dataset_summary.csv')
