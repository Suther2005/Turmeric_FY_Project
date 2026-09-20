import pandas as pd
import numpy as np
import os
import re
import scipy.stats as stats
import matplotlib.pyplot as plt

base_dir = r'd:\curuma\environmental_data\epidemiology'
fig_dir = os.path.join(base_dir, 'association_figures')
os.makedirs(fig_dir, exist_ok=True)

# Load exposure features CSV
feat_path = os.path.join(base_dir, 'disease_exposure_features.csv')
df = pd.read_csv(feat_path)

# Extract numeric PDI for quantitative records
def extract_pdi(val):
    if pd.isna(val):
        return np.nan
    m = re.search(r'([\d\.]+)%', str(val))
    if m:
        return float(m.group(1))
    return np.nan

df['pdi_numeric'] = df['reported_severity_value'].apply(extract_pdi)

# Subset quantitative records
quant_df = df[df['pdi_numeric'].notna()].copy()
print(f'Total quantitative PDI records: n = {len(quant_df)}')
print('Distribution of quantitative records by disease:')
print(quant_df['disease_type'].value_counts())

feature_cols = [
    ('cumulative_rainfall_14d_mm', '14-Day Cumulative Rainfall (mm)'),
    ('rainfall_days_14d_count', '14-Day Rain Days Count'),
    ('temp_mean_degC', 'Mean Temperature (°C)'),
    ('hours_temp_favorable_22_32C', 'Hours in Favorable Temp 22-32°C (hrs)'),
    ('rh_mean_pct', 'Mean Relative Humidity (%)'),
    ('hours_rh_ge_80pct', 'Hours with RH >= 80% (hrs)'),
    ('hours_dew_condensation_proxy', 'Hours with Dew Condensation Proxy (hrs)'),
    ('wind_speed_mean_kmh', 'Mean Wind Speed (km/h)'),
    ('solar_rad_mean_Wm2', 'Mean Downward Solar Radiation (W/m²)'),
    ('soil_moisture_0_7cm_mean_m3m3', 'Mean Soil Moisture 0-7cm (m³/m³)')
]

results = []

# 1. Overall Quantitative Foliar Diseases (n=8)
for col, col_label in feature_cols:
    x = quant_df[col].values
    y = quant_df['pdi_numeric'].values
    
    # Spearman rank correlation
    rho, p_spearman = stats.spearmanr(x, y)
    # Pearson linear correlation
    r, p_pearson = stats.pearsonr(x, y)
    
    direction = 'Positive' if rho > 0.15 else ('Negative' if rho < -0.15 else 'Neutral / Weak')
    
    results.append({
        'analysis_cohort': 'All Foliar Pathogens Combined',
        'sample_size_n': len(quant_df),
        'feature_name': col,
        'feature_display_label': col_label,
        'feature_mean': round(np.mean(x), 2),
        'feature_std': round(np.std(x), 2),
        'pdi_mean': round(np.mean(y), 2),
        'pdi_std': round(np.std(y), 2),
        'spearman_rho': round(rho, 3),
        'spearman_p_value': round(p_spearman, 4),
        'pearson_r': round(r, 3),
        'pearson_p_value': round(p_pearson, 4),
        'observed_effect_direction': direction,
        'statistical_significance_alpha_0_05': bool(p_spearman < 0.05),
        'methodological_note': 'Exploratory small-sample correlation (n=8). Non-causal.'
    })

# 2. Leaf Spot Cohort (n=4)
ls_df = quant_df[quant_df['disease_type'] == 'Leaf Spot'].copy()
for col, col_label in feature_cols:
    x = ls_df[col].values
    y = ls_df['pdi_numeric'].values
    
    rho, p_spearman = stats.spearmanr(x, y) if len(set(x)) > 1 else (0.0, 1.0)
    r, p_pearson = stats.pearsonr(x, y) if len(set(x)) > 1 else (0.0, 1.0)
    direction = 'Positive' if rho > 0.15 else ('Negative' if rho < -0.15 else 'Neutral / Weak')
    
    results.append({
        'analysis_cohort': 'Leaf Spot Only (Colletotrichum)',
        'sample_size_n': len(ls_df),
        'feature_name': col,
        'feature_display_label': col_label,
        'feature_mean': round(np.mean(x), 2),
        'feature_std': round(np.std(x), 2),
        'pdi_mean': round(np.mean(y), 2),
        'pdi_std': round(np.std(y), 2),
        'spearman_rho': round(rho, 3),
        'spearman_p_value': round(p_spearman, 4),
        'pearson_r': round(r, 3),
        'pearson_p_value': round(p_pearson, 4),
        'observed_effect_direction': direction,
        'statistical_significance_alpha_0_05': bool(p_spearman < 0.05),
        'methodological_note': 'Small subset (n=4). Descriptive direction only.'
    })

# 3. Leaf Blotch Cohort (n=4)
lb_df = quant_df[quant_df['disease_type'] == 'Leaf Blotch'].copy()
for col, col_label in feature_cols:
    x = lb_df[col].values
    y = lb_df['pdi_numeric'].values
    
    rho, p_spearman = stats.spearmanr(x, y) if len(set(x)) > 1 else (0.0, 1.0)
    r, p_pearson = stats.pearsonr(x, y) if len(set(x)) > 1 else (0.0, 1.0)
    direction = 'Positive' if rho > 0.15 else ('Negative' if rho < -0.15 else 'Neutral / Weak')
    
    results.append({
        'analysis_cohort': 'Leaf Blotch Only (Taphrina)',
        'sample_size_n': len(lb_df),
        'feature_name': col,
        'feature_display_label': col_label,
        'feature_mean': round(np.mean(x), 2),
        'feature_std': round(np.std(x), 2),
        'pdi_mean': round(np.mean(y), 2),
        'pdi_std': round(np.std(y), 2),
        'spearman_rho': round(rho, 3),
        'spearman_p_value': round(p_spearman, 4),
        'pearson_r': round(r, 3),
        'pearson_p_value': round(p_pearson, 4),
        'observed_effect_direction': direction,
        'statistical_significance_alpha_0_05': bool(p_spearman < 0.05),
        'methodological_note': 'Small subset (n=4). Descriptive direction only.'
    })

res_df = pd.DataFrame(results)
res_csv_path = os.path.join(base_dir, 'association_analysis.csv')
res_df.to_csv(res_csv_path, index=False)
print(f'Saved statistical association results to {res_csv_path}')

# Generate Publication-Quality Visualizations
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

# Plot 1: PDI vs RH >= 80% Hours
fig, ax = plt.subplots(figsize=(7, 5), dpi=300)
colors = {'Leaf Spot': '#2563eb', 'Leaf Blotch': '#dc2626'}
markers = {'Leaf Spot': 'o', 'Leaf Blotch': 's'}

for d_type, group in quant_df.groupby('disease_type'):
    ax.scatter(group['hours_rh_ge_80pct'], group['pdi_numeric'], 
               color=colors[d_type], marker=markers[d_type], s=90, label=f'{d_type} (n={len(group)})', zorder=4)
    for _, r_item in group.iterrows():
        ax.annotate(r_item['record_id'], (r_item['hours_rh_ge_80pct']+2, r_item['pdi_numeric']+0.5), 
                    fontsize=8, color='#475569')

ax.set_xlabel('Antecedent Hours with RH ≥ 80% (14-Day Window, max 336 hrs)', fontsize=10, fontweight='bold')
ax.set_ylabel('Reported Percent Disease Index (PDI %)', fontsize=10, fontweight='bold')
ax.set_title('Turmeric PDI vs. High Relative Humidity Exposure (n=8)', fontsize=11, fontweight='bold')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True)
plt.tight_layout()
p1_path = os.path.join(fig_dir, 'pdi_vs_rh_exposure.png')
plt.savefig(p1_path)
plt.close()
print('Saved:', p1_path)

# Plot 2: PDI vs Cumulative Rainfall
fig, ax = plt.subplots(figsize=(7, 5), dpi=300)
for d_type, group in quant_df.groupby('disease_type'):
    ax.scatter(group['cumulative_rainfall_14d_mm'], group['pdi_numeric'], 
               color=colors[d_type], marker=markers[d_type], s=90, label=f'{d_type} (n={len(group)})', zorder=4)
    for _, r_item in group.iterrows():
        ax.annotate(r_item['record_id'], (r_item['cumulative_rainfall_14d_mm']+2, r_item['pdi_numeric']+0.5), 
                    fontsize=8, color='#475569')

ax.set_xlabel('14-Day Cumulative Precipitation (mm)', fontsize=10, fontweight='bold')
ax.set_ylabel('Reported Percent Disease Index (PDI %)', fontsize=10, fontweight='bold')
ax.set_title('Turmeric PDI vs. 14-Day Cumulative Rainfall (n=8)', fontsize=11, fontweight='bold')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True)
plt.tight_layout()
p2_path = os.path.join(fig_dir, 'pdi_vs_rainfall.png')
plt.savefig(p2_path)
plt.close()
print('Saved:', p2_path)

# Plot 3: PDI vs Temperature Favorable Hours
fig, ax = plt.subplots(figsize=(7, 5), dpi=300)
for d_type, group in quant_df.groupby('disease_type'):
    ax.scatter(group['hours_temp_favorable_22_32C'], group['pdi_numeric'], 
               color=colors[d_type], marker=markers[d_type], s=90, label=f'{d_type} (n={len(group)})', zorder=4)
    for _, r_item in group.iterrows():
        ax.annotate(r_item['record_id'], (r_item['hours_temp_favorable_22_32C']+1, r_item['pdi_numeric']+0.5), 
                    fontsize=8, color='#475569')

ax.set_xlabel('Hours within Favorable Temp Range 22–32°C (14-Day Window)', fontsize=10, fontweight='bold')
ax.set_ylabel('Reported Percent Disease Index (PDI %)', fontsize=10, fontweight='bold')
ax.set_title('Turmeric PDI vs. Thermal Incubation Exposure (n=8)', fontsize=11, fontweight='bold')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True)
plt.tight_layout()
p3_path = os.path.join(fig_dir, 'pdi_vs_temp_favorable.png')
plt.savefig(p3_path)
plt.close()
print('Saved:', p3_path)

# Plot 4: PDI vs Dew Proxy Hours
fig, ax = plt.subplots(figsize=(7, 5), dpi=300)
for d_type, group in quant_df.groupby('disease_type'):
    ax.scatter(group['hours_dew_condensation_proxy'], group['pdi_numeric'], 
               color=colors[d_type], marker=markers[d_type], s=90, label=f'{d_type} (n={len(group)})', zorder=4)
    for _, r_item in group.iterrows():
        ax.annotate(r_item['record_id'], (r_item['hours_dew_condensation_proxy']+2, r_item['pdi_numeric']+0.5), 
                    fontsize=8, color='#475569')

ax.set_xlabel('Hours with Dew Point Depression ≤ 1.5°C (Canopy Dew Proxy)', fontsize=10, fontweight='bold')
ax.set_ylabel('Reported Percent Disease Index (PDI %)', fontsize=10, fontweight='bold')
ax.set_title('Turmeric PDI vs. Condensation / Dew Proxy Hours (n=8)', fontsize=11, fontweight='bold')
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(frameon=True)
plt.tight_layout()
p4_path = os.path.join(fig_dir, 'pdi_vs_dew_proxy.png')
plt.savefig(p4_path)
plt.close()
print('Saved:', p4_path)

# Plot 5: 4-Panel Multi-Variable Diagnostic Summary
fig, axs = plt.subplots(2, 2, figsize=(11, 9), dpi=300)

# Panel A: PDI vs RH >= 80%
for d_type, group in quant_df.groupby('disease_type'):
    axs[0, 0].scatter(group['hours_rh_ge_80pct'], group['pdi_numeric'], 
                     color=colors[d_type], marker=markers[d_type], s=70, label=d_type)
    for _, r_item in group.iterrows():
        axs[0, 0].annotate(r_item['record_id'], (r_item['hours_rh_ge_80pct']+2, r_item['pdi_numeric']+0.4), fontsize=7)
axs[0, 0].set_xlabel('Hours RH ≥ 80% (hrs)', fontsize=9, fontweight='bold')
axs[0, 0].set_ylabel('PDI (%)', fontsize=9, fontweight='bold')
axs[0, 0].set_title('(A) Moisture Exposure (RH ≥ 80%)', fontsize=10, fontweight='bold')
axs[0, 0].legend(fontsize=8)
axs[0, 0].grid(True, linestyle='--', alpha=0.5)

# Panel B: PDI vs Cum Rain
for d_type, group in quant_df.groupby('disease_type'):
    axs[0, 1].scatter(group['cumulative_rainfall_14d_mm'], group['pdi_numeric'], 
                     color=colors[d_type], marker=markers[d_type], s=70, label=d_type)
    for _, r_item in group.iterrows():
        axs[0, 1].annotate(r_item['record_id'], (r_item['cumulative_rainfall_14d_mm']+2, r_item['pdi_numeric']+0.4), fontsize=7)
axs[0, 1].set_xlabel('14-Day Cumulative Rain (mm)', fontsize=9, fontweight='bold')
axs[0, 1].set_ylabel('PDI (%)', fontsize=9, fontweight='bold')
axs[0, 1].set_title('(B) Antecedent Rainfall (mm)', fontsize=10, fontweight='bold')
axs[0, 1].grid(True, linestyle='--', alpha=0.5)

# Panel C: PDI vs Dew Condensation Hours
for d_type, group in quant_df.groupby('disease_type'):
    axs[1, 0].scatter(group['hours_dew_condensation_proxy'], group['pdi_numeric'], 
                     color=colors[d_type], marker=markers[d_type], s=70, label=d_type)
    for _, r_item in group.iterrows():
        axs[1, 0].annotate(r_item['record_id'], (r_item['hours_dew_condensation_proxy']+2, r_item['pdi_numeric']+0.4), fontsize=7)
axs[1, 0].set_xlabel('Condensation Proxy Hours (T - T_dew ≤ 1.5°C)', fontsize=9, fontweight='bold')
axs[1, 0].set_ylabel('PDI (%)', fontsize=9, fontweight='bold')
axs[1, 0].set_title('(C) Dew / Surface Wetness Proxy', fontsize=10, fontweight='bold')
axs[1, 0].grid(True, linestyle='--', alpha=0.5)

# Panel D: PDI vs Topsoil Moisture
for d_type, group in quant_df.groupby('disease_type'):
    axs[1, 1].scatter(group['soil_moisture_0_7cm_mean_m3m3'], group['pdi_numeric'], 
                     color=colors[d_type], marker=markers[d_type], s=70, label=d_type)
    for _, r_item in group.iterrows():
        axs[1, 1].annotate(r_item['record_id'], (r_item['soil_moisture_0_7cm_mean_m3m3']+0.005, r_item['pdi_numeric']+0.4), fontsize=7)
axs[1, 1].set_xlabel('Mean Topsoil Moisture 0-7cm (m³/m³)', fontsize=9, fontweight='bold')
axs[1, 1].set_ylabel('PDI (%)', fontsize=9, fontweight='bold')
axs[1, 1].set_title('(D) Root-Zone Soil Moisture', fontsize=10, fontweight='bold')
axs[1, 1].grid(True, linestyle='--', alpha=0.5)

plt.suptitle('Multi-Variable Biophysical Exposure vs. Turmeric Disease Severity (PDI %, n=8)', 
             fontsize=12, fontweight='bold', y=0.99)
plt.tight_layout()
p5_path = os.path.join(fig_dir, 'pdi_multi_variable_panel.png')
plt.savefig(p5_path)
plt.close()
print('Saved:', p5_path)
