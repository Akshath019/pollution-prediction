"""
Complete ML Pipeline: Train XGBoost model and save everything
Run this once to generate all required files
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import shap
import pickle

print("=" * 70)
print("🚀 URBAN POLLUTION PREDICTION - MODEL TRAINING PIPELINE")
print("=" * 70)

# ============================================================================
# STEP 1: LOAD DATA
# ============================================================================
print("\n📊 STEP 1: Loading data...")

df = pd.read_csv('pollution_data.csv')
print(f"✅ Loaded {df.shape[0]} rows, {df.shape[1]} columns")
print(f"\n📋 Columns: {list(df.columns)}")

# ============================================================================
# STEP 2: IDENTIFY FEATURES AND TARGET
# ============================================================================
print("\n🎯 STEP 2: Identifying features and target...")

# Find target column
target_col = None
for col in df.columns:
    if 'pollution' in col.lower() and 'level' in col.lower():
        target_col = col
        break
    elif col.lower() in ['pollution', 'pm2.5', 'pm10', 'aqi', 'pollution_level']:
        target_col = col
        break

if target_col is None:
    print("⚠️  Could not auto-detect target column. Available columns:")
    print(df.columns.tolist())
    target_col = input("Enter the name of your pollution/target column: ")

print(f"✅ Target column: '{target_col}'")

# Identify feature columns (exclude target, IDs, dates, strings)
exclude_cols = [target_col]
for col in df.columns:
    if df[col].dtype == 'object' or 'id' in col.lower() or 'date' in col.lower() or 'time' in col.lower():
        if col != target_col:
            exclude_cols.append(col)

feature_cols = [col for col in df.columns if col not in exclude_cols]
print(f"✅ Features ({len(feature_cols)}): {feature_cols}")

# Check for missing values
if df[feature_cols + [target_col]].isnull().sum().sum() > 0:
    print("\n⚠️  Handling missing values...")
    for col in feature_cols + [target_col]:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].median(), inplace=True)
    print("✅ Missing values filled with median")

X = df[feature_cols].copy()
y = df[target_col].copy()

print(f"\n📐 Feature matrix: {X.shape}")
print(f"📐 Target vector: {y.shape}")

# ============================================================================
# STEP 3: TRAIN-TEST SPLIT & SCALING
# ============================================================================
print("\n✂️  STEP 3: Splitting data (80/20)...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, shuffle=True
)

print(f"✅ Training: {X_train.shape[0]} samples")
print(f"✅ Testing: {X_test.shape[0]} samples")

# Fit scaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("✅ Features scaled with StandardScaler")

# ============================================================================
# STEP 4: TRAIN MODELS
# ============================================================================
print("\n🤖 STEP 4: Training models...")

models = {}
predictions = {}

# Linear Regression (Baseline)
print("  - Training Linear Regression...")
lr_model = LinearRegression()
lr_model.fit(X_train_scaled, y_train)
lr_pred = lr_model.predict(X_test_scaled)
models['Linear Regression'] = lr_model
predictions['Linear Regression'] = lr_pred

# Random Forest
print("  - Training Random Forest...")
rf_model = RandomForestRegressor(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)
models['Random Forest'] = rf_model
predictions['Random Forest'] = rf_pred

# XGBoost (Primary Model)
print("  - Training XGBoost...")
xgb_model = xgb.XGBRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)
xgb_model.fit(X_train, y_train)
xgb_pred = xgb_model.predict(X_test)
models['XGBoost'] = xgb_model
predictions['XGBoost'] = xgb_pred

print("✅ All models trained")

# ============================================================================
# STEP 5: EVALUATE MODELS
# ============================================================================
print("\n📊 STEP 5: Evaluating models...")

metrics = {}
for model_name, pred in predictions.items():
    rmse = np.sqrt(mean_squared_error(y_test, pred))
    mae = mean_absolute_error(y_test, pred)
    r2 = r2_score(y_test, pred)
    
    metrics[model_name] = {
        'RMSE': rmse,
        'MAE': mae,
        'R²': r2
    }
    
    print(f"\n  {model_name}:")
    print(f"    RMSE: {rmse:.2f}")
    print(f"    MAE:  {mae:.2f}")
    print(f"    R²:   {r2:.4f}")

metrics_df = pd.DataFrame(metrics).T
best_model_name = metrics_df['R²'].idxmax()
print(f"\n🏆 Best Model: {best_model_name} (R² = {metrics_df.loc[best_model_name, 'R²']:.4f})")

# ============================================================================
# STEP 6: SAVE MODELS
# ============================================================================
print("\n💾 STEP 6: Saving models...")

# Save XGBoost model
with open('xgboost_model.pkl', 'wb') as f:
    pickle.dump(xgb_model, f)
print("✅ xgboost_model.pkl saved")

# Save scaler
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
print("✅ scaler.pkl saved")

# Save feature names
with open('feature_names.pkl', 'wb') as f:
    pickle.dump(feature_cols, f)
print("✅ feature_names.pkl saved")

# ============================================================================
# STEP 7: SHAP ANALYSIS
# ============================================================================
print("\n🔍 STEP 7: Calculating SHAP values...")

explainer = shap.TreeExplainer(xgb_model)

# Use smaller sample for SHAP (it's slow)
sample_size = min(500, len(X_test))
X_test_sample = X_test.sample(n=sample_size, random_state=42)
shap_values = explainer.shap_values(X_test_sample)

print(f"✅ SHAP values calculated for {sample_size} samples")

# Calculate feature importance
shap_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': np.abs(shap_values).mean(axis=0)
}).sort_values('importance', ascending=False)

shap_importance['importance_percentage'] = (
    shap_importance['importance'] / shap_importance['importance'].sum() * 100
)

print("\n📊 Top 5 Most Important Features:")
for idx, row in shap_importance.head(5).iterrows():
    print(f"  {row['feature']}: {row['importance_percentage']:.1f}%")

# ============================================================================
# STEP 8: GENERATE 48-HOUR PREDICTIONS
# ============================================================================
print("\n🔮 STEP 8: Generating 48-hour forecast...")

def categorize_aqi(value):
    if value <= 50:
        return 'Good'
    elif value <= 100:
        return 'Moderate'
    elif value <= 150:
        return 'Unhealthy for Sensitive Groups'
    elif value <= 200:
        return 'Unhealthy'
    elif value <= 300:
        return 'Very Unhealthy'
    else:
        return 'Hazardous'

current_time = datetime.now()
future_timestamps = [current_time + timedelta(hours=i) for i in range(48)]

future_data = []
for timestamp in future_timestamps:
    hour = timestamp.hour
    day_of_week = timestamp.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    is_rush_hour = 1 if hour in [7, 8, 9, 17, 18, 19] else 0
    
    feature_dict = {}
    for col in feature_cols:
        if col == 'hour':
            feature_dict[col] = hour
        elif col == 'day_of_week':
            feature_dict[col] = day_of_week
        elif col == 'is_weekend':
            feature_dict[col] = is_weekend
        elif col == 'is_rush_hour':
            feature_dict[col] = is_rush_hour
        elif 'traffic' in col.lower() or 'congestion' in col.lower():
            base_value = X[col].mean()
            feature_dict[col] = base_value * (1.5 if is_rush_hour else 0.8)
        elif 'temperature' in col.lower():
            base_temp = X[col].mean()
            feature_dict[col] = base_temp + 5 * np.sin(2 * np.pi * hour / 24)
        else:
            feature_dict[col] = X[col].mean() + np.random.normal(0, X[col].std() * 0.1)
    
    future_data.append(feature_dict)

future_df = pd.DataFrame(future_data)
future_predictions = xgb_model.predict(future_df)

# Calculate confidence intervals
test_residuals = y_test - xgb_pred
residual_std = np.std(test_residuals)
confidence_lower = future_predictions - 1.96 * residual_std
confidence_upper = future_predictions + 1.96 * residual_std

# Clip to valid range
future_predictions = np.clip(future_predictions, 0, 300)
confidence_lower = np.clip(confidence_lower, 0, 300)
confidence_upper = np.clip(confidence_upper, 0, 300)

aqi_categories = [categorize_aqi(val) for val in future_predictions]

print(f"✅ Generated 48-hour forecast")
print(f"  Mean: {future_predictions.mean():.1f}")
print(f"  Range: {future_predictions.min():.1f} - {future_predictions.max():.1f}")

# ============================================================================
# STEP 9: EXPORT DATA FOR WEBAPP
# ============================================================================
print("\n📤 STEP 9: Exporting CSVs for webapp...")

# 1. predictions_48h.csv
predictions_export = pd.DataFrame({
    'timestamp': future_timestamps,
    'hour': [t.hour for t in future_timestamps],
    'day': [t.strftime('%A') for t in future_timestamps],
    'pollution_prediction': future_predictions,
    'confidence_lower': confidence_lower,
    'confidence_upper': confidence_upper,
    'aqi_category': aqi_categories
})
predictions_export.to_csv('predictions_48h.csv', index=False)
print("✅ predictions_48h.csv (48 rows)")

# 2. feature_importance.csv
shap_importance.to_csv('feature_importance.csv', index=False)
print("✅ feature_importance.csv")

# 3. shap_sample_predictions.csv
n_samples = min(15, len(X_test_sample))
sample_indices = np.linspace(0, len(X_test_sample)-1, n_samples, dtype=int)

shap_samples = []
for idx in sample_indices:
    sample_idx = X_test_sample.index[idx]
    base_value = explainer.expected_value
    prediction = xgb_model.predict(X_test_sample.iloc[[idx]])[0]
    actual = y_test.loc[sample_idx]
    
    sample_row = {
        'sample_id': f'sample_{idx+1}',
        'actual_pollution': actual,
        'predicted_pollution': prediction,
        'base_value': base_value,
        'error': abs(prediction - actual)
    }
    
    for feat_idx, feature in enumerate(feature_cols):
        shap_value = shap_values[idx, feat_idx]
        feature_value = X_test_sample.iloc[idx][feature]
        sample_row[f'{feature}_value'] = feature_value
        sample_row[f'{feature}_shap'] = shap_value
    
    shap_samples.append(sample_row)

shap_samples_df = pd.DataFrame(shap_samples)
shap_samples_df.to_csv('shap_sample_predictions.csv', index=False)
print("✅ shap_sample_predictions.csv")

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print("\n" + "=" * 70)
print("✅ PIPELINE COMPLETE - ALL FILES GENERATED")
print("=" * 70)

print("\n📦 Model Files Created:")
print("  ✅ xgboost_model.pkl")
print("  ✅ scaler.pkl")
print("  ✅ feature_names.pkl")

print("\n📊 CSV Files Created:")
print("  ✅ predictions_48h.csv")
print("  ✅ feature_importance.csv")
print("  ✅ shap_sample_predictions.csv")

print("\n🎯 Model Performance:")
print(f"  R²:   {metrics['XGBoost']['R²']:.4f}")
print(f"  RMSE: {metrics['XGBoost']['RMSE']:.2f}")
print(f"  MAE:  {metrics['XGBoost']['MAE']:.2f}")

print("\n📋 Features Used:")
print(f"  {len(feature_cols)} features: {feature_cols}")

print("\n🚀 Next Steps:")
print("  1. Move .pkl files to backend/models/")
print("  2. Move .csv files to public/data/")
print("  3. Run backend API: cd backend && python app.py")

print("\n" + "=" * 70)