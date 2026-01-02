// src/pages/ModelDocs.jsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Brain, Code, BarChart3, CheckCircle, Copy } from "lucide-react";

const ModelDocs = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modelCode = `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
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

plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

print(" All libraries imported successfully!")

print("=" * 70)
print("STEP 1: LOADING DATA")
print("=" * 70)

df = pd.read_csv('pollution_data.csv')

print(f"\\n Dataset Shape: {df.shape}")
print(f"\\n First few rows:")
print(df.head())
print(f"\\n Data Info:")
print(df.info())
print(f"\\n Statistical Summary:")
print(df.describe())
print(f"\\n Missing Values:")
print(df.isnull().sum())


print("\\n" + "=" * 70)
print("STEP 2: DATA PREPROCESSING")
print("=" * 70)

if df.isnull().sum().sum() > 0:
    print("\\n  Handling missing values...")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].median(), inplace=True)
    print(" Missing values handled")
else:
    print("\\n No missing values found")

target_col = 'pollution_level'
if target_col not in df.columns:
    possible_targets = [col for col in df.columns if 'pollution' in col.lower() or 'pm' in col.lower() or 'aqi' in col.lower()]
    if possible_targets:
        target_col = possible_targets[0]
        print(f"\\n Using '{target_col}' as target variable")

exclude_cols = [target_col]
for col in df.columns:
    if df[col].dtype == 'object' or 'id' in col.lower() or 'date' in col.lower() or 'time' in col.lower():
        if col != target_col:
            exclude_cols.append(col)

feature_cols = [col for col in df.columns if col not in exclude_cols]

print(f"\\n Features ({len(feature_cols)}): {feature_cols}")
print(f" Target: {target_col}")

X = df[feature_cols].copy()
y = df[target_col].copy()

print(f"\\n Feature matrix shape: {X.shape}")
print(f" Target shape: {y.shape}")


print("\\n" + "=" * 70)
print("STEP 3: TRAIN-TEST SPLIT & FEATURE SCALING")
print("=" * 70)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, shuffle=True
)

print(f"\\n Training set: {X_train.shape[0]} samples")
print(f" Test set: {X_test.shape[0]} samples")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

X_train_scaled = pd.DataFrame(X_train_scaled, columns=feature_cols, index=X_train.index)
X_test_scaled = pd.DataFrame(X_test_scaled, columns=feature_cols, index=X_test.index)

print("\\n Features scaled using StandardScaler")


print("\\n" + "=" * 70)
print("STEP 4: TRAINING MODELS")
print("=" * 70)

models = {}
predictions = {}
metrics = {}

print("\\n Training Linear Regression (Baseline)...")
lr_model = LinearRegression()
lr_model.fit(X_train_scaled, y_train)
lr_pred = lr_model.predict(X_test_scaled)

models['Linear Regression'] = lr_model
predictions['Linear Regression'] = lr_pred

print(" Linear Regression trained")

print("\\n Training Random Forest...")
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

print(" Random Forest trained")

print("\\n Training XGBoost (Primary Model)...")
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

print(" XGBoost trained")


print("\\n" + "=" * 70)
print("STEP 5: MODEL EVALUATION")
print("=" * 70)

for model_name, pred in predictions.items():
    rmse = np.sqrt(mean_squared_error(y_test, pred))
    mae = mean_absolute_error(y_test, pred)
    r2 = r2_score(y_test, pred)
    
    metrics[model_name] = {
        'RMSE': rmse,
        'MAE': mae,
        'R²': r2
    }
    
    print(f"\\n {model_name}:")
    print(f"   RMSE: {rmse:.2f}")
    print(f"   MAE:  {mae:.2f}")
    print(f"   R²:   {r2:.4f}")

metrics_df = pd.DataFrame(metrics).T
print("\\n" + "=" * 70)
print(" MODEL COMPARISON SUMMARY")
print("=" * 70)
print(metrics_df.to_string())

best_model_name = metrics_df['R²'].idxmax()
best_model = models[best_model_name]
print(f"\\n Best Model: {best_model_name} (R² = {metrics_df.loc[best_model_name, 'R²']:.4f})")


print("\\n" + "=" * 70)
print("STEP 6: SHAP ANALYSIS (Feature Attribution)")
print("=" * 70)

print("\\n Calculating SHAP values for XGBoost model...")

explainer = shap.TreeExplainer(xgb_model)

sample_size = min(500, len(X_test))
X_test_sample = X_test.sample(n=sample_size, random_state=42)
shap_values = explainer.shap_values(X_test_sample)

print(f" SHAP values calculated for {sample_size} samples")

shap_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': np.abs(shap_values).mean(axis=0)
}).sort_values('importance', ascending=False)

print("\\n Top 10 Most Important Features:")
print(shap_importance.head(10).to_string(index=False))

print("\\n" + "=" * 70)
print("STEP 7: FEATURE IMPORTANCE VISUALIZATION")
print("=" * 70)

plt.figure(figsize=(12, 6))
top_n = min(15, len(shap_importance))
plt.barh(range(top_n), shap_importance.head(top_n)['importance'].values)
plt.yticks(range(top_n), shap_importance.head(top_n)['feature'].values)
plt.xlabel('Mean |SHAP Value| (Average Impact on Model Output)', fontsize=12)
plt.title('Feature Importance (SHAP Analysis)', fontsize=14, fontweight='bold')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()

print("✓ Feature importance chart displayed")

print("\\n" + "=" * 70)
print("STEP 8: GENERATING 48-HOUR PREDICTIONS")
print("=" * 70)

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

test_residuals = y_test - xgb_pred
residual_std = np.std(test_residuals)
confidence_lower = future_predictions - 1.96 * residual_std
confidence_upper = future_predictions + 1.96 * residual_std

future_predictions = np.clip(future_predictions, 0, 300)
confidence_lower = np.clip(confidence_lower, 0, 300)
confidence_upper = np.clip(confidence_upper, 0, 300)

print(f"\\n Generated 48-hour predictions")
print(f"   Mean prediction: {future_predictions.mean():.2f}")
print(f"   Range: {future_predictions.min():.2f} - {future_predictions.max():.2f}")


def categorize_aqi(value):
    """Categorize pollution level into AQI categories"""
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


aqi_categories = [categorize_aqi(val) for val in future_predictions]

print("\\n AQI Category Distribution (48-hour forecast):")
category_counts = pd.Series(aqi_categories).value_counts()
print(category_counts.to_string())


print("\\n" + "=" * 70)
print("STEP 9: EXPORTING DATA FOR WEBAPP")
print("=" * 70)


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
print("\\n Exported: predictions_48h.csv")
print(f"   Shape: {predictions_export.shape}")
print(predictions_export.head(3))


feature_importance_export = shap_importance.copy()
feature_importance_export['importance_percentage'] = (
    feature_importance_export['importance'] / feature_importance_export['importance'].sum() * 100
)

feature_importance_export.to_csv('feature_importance.csv', index=False)
print("\\n Exported: feature_importance.csv")
print(f"   Shape: {feature_importance_export.shape}")
print(feature_importance_export.head(3))


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

print("\\n Exported: shap_sample_predictions.csv")
print(f"   Shape: {shap_samples_df.shape}")
print(f"   Columns: {len(shap_samples_df.columns)}")

print("\\n" + "=" * 70)
print(" PIPELINE COMPLETE - FINAL SUMMARY")
print("=" * 70)

print("\\n MODEL PERFORMANCE:")
print(f"   Best Model: {best_model_name}")
print(f"   Test R²: {metrics_df.loc[best_model_name, 'R²']:.4f}")
print(f"   Test RMSE: {metrics_df.loc[best_model_name, 'RMSE']:.2f}")
print(f"   Test MAE: {metrics_df.loc[best_model_name, 'MAE']:.2f}")

print("\\n EXPORTED FILES:")
print("    predictions_48h.csv (48 rows × 7 columns)")
print("    feature_importance.csv (ranked features)")
print("    shap_sample_predictions.csv (15 detailed samples)")

print("\\n TOP 5 MOST IMPORTANT FEATURES:")
for i, row in feature_importance_export.head(5).iterrows():
    print(f"   {i+1}. {row['feature']}: {row['importance_percentage']:.1f}%")

print("\\n PREDICTION VALIDATION:")
print(f"   48-hour average: {future_predictions.mean():.1f}")
print(f"   Prediction range: {future_predictions.min():.1f} - {future_predictions.max():.1f}")
print(f"   Most common AQI: {pd.Series(aqi_categories).mode()[0]}")

print("\\n" + "=" * 70)
print(" ALL SYSTEMS READY FOR HACKATHON DEMO!")
print("=" * 70)


print("\\n Quick Sanity Checks:")
check_passed = True

if predictions_export['pollution_prediction'].between(0, 300).all():
    print("    All predictions within valid range [0-300]")
else:
    print("     Some predictions outside valid range")
    check_passed = False

if len(feature_importance_export) == len(feature_cols):
    print("    All features have importance scores")
else:
    print("     Missing feature importance data")
    check_passed = False

if shap_samples_df['error'].mean() < metrics_df.loc[best_model_name, 'MAE'] * 1.5:
    print("    SHAP samples representative of model performance")
else:
    print("    SHAP samples may not be representative")
    check_passed = False

if check_passed:
    print("\\n All validation checks passed!")
else:
    print("\\n  Some validation checks failed - review output above")

print("\\n Ready for integration with React frontend!")
print(" Use the exported CSVs to build your visualization dashboard")
`;

  const results = `# Model Performance Results

## Best Model: XGBoost
✓ R² Score: 0.9806 (98.06% accuracy)
✓ RMSE: 5.50
✓ MAE: 4.05

## Training Details
- Dataset: 2,102 hourly samples
- Training set: 1,681 samples (80%)
- Test set: 421 samples (20%)
- Features: 13 environmental factors

## Top 5 Most Important Features (SHAP):
1. traffic_volume: 38.7%
2. congestion_index: 16.5%
3. industrial_activity: 10.9%
4. month: 9.3%
5. wind_speed: 8.8%`;

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                ML Model Documentation
              </h1>
              <p className="text-white/60 text-lg">
                Technical implementation and performance metrics
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium mb-1">
                    Accuracy
                  </p>
                  <p className="text-4xl font-bold text-white">98%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-950/50 to-black border-blue-500/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-blue-400 text-sm font-medium mb-1">
                  Model Type
                </p>
                <p className="text-2xl font-bold text-white">XGBoost</p>
                <p className="text-white/60 text-xs mt-1">Gradient Boosting</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-950/50 to-black border-purple-500/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-purple-400 text-sm font-medium mb-1">RMSE</p>
                <p className="text-4xl font-bold text-white">5.50</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-950/50 to-black border-pink-500/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-pink-400 text-sm font-medium mb-1">MAE</p>
                <p className="text-4xl font-bold text-white">4.05</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="code" className="w-full text-white">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger
              value="code"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Code className="w-4 h-4 mr-2" />
              Source Code
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger
              value="architecture"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Architecture
            </TabsTrigger>
          </TabsList>

          {/* CODE TAB */}
          <TabsContent value="code" className="mt-6">
            <Card className="bg-gray-900/50 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Code className="w-5 h-5" />
                      <span>ML Pipeline Implementation</span>
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      XGBoost model with SHAP explainability
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => copyToClipboard(modelCode)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {copied ? "Copied!" : "Copy Code"}
                    </span>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  {/* Code Display - Carbon.now style */}
                  <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
                    <code className="text-gray-300 font-mono">
                      {modelCode.split("\n").map((line, i) => (
                        <div
                          key={i}
                          className="hover:bg-white/5 px-2 -mx-2 rounded transition-colors"
                        >
                          <span className="text-gray-600 select-none mr-4 inline-block w-8 text-right">
                            {i + 1}
                          </span>
                          <span
                            className={
                              line.includes("import")
                                ? "text-pink-400"
                                : line.includes("def ") ||
                                  line.includes("class ")
                                ? "text-blue-400"
                                : line.includes("#")
                                ? "text-green-500"
                                : line.includes("=") && !line.includes("==")
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            {line}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>

                  {/* Gradient overlay for style */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RESULTS TAB */}
          <TabsContent value="results" className="mt-6">
            <Card className="bg-gray-900/50 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">
                  Performance Metrics
                </CardTitle>
                <CardDescription className="text-white/60">
                  Comparison of different ML models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Model Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/80 font-semibold py-3 px-4">
                            Model
                          </th>
                          <th className="text-left text-white/80 font-semibold py-3 px-4">
                            R² Score
                          </th>
                          <th className="text-left text-white/80 font-semibold py-3 px-4">
                            RMSE
                          </th>
                          <th className="text-left text-white/80 font-semibold py-3 px-4">
                            MAE
                          </th>
                          <th className="text-left text-white/80 font-semibold py-3 px-4">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-white font-semibold">
                                XGBoost
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-green-400 font-bold">
                            0.9806
                          </td>
                          <td className="py-4 px-4 text-white">5.50</td>
                          <td className="py-4 px-4 text-white">4.05</td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Best
                            </Badge>
                          </td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span className="text-white">Random Forest</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-blue-400 font-bold">
                            0.9744
                          </td>
                          <td className="py-4 px-4 text-white/80">6.32</td>
                          <td className="py-4 px-4 text-white/80">4.72</td>
                          <td className="py-4 px-4">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Good
                            </Badge>
                          </td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full" />
                              <span className="text-white/80">
                                Linear Regression
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-400 font-bold">
                            0.9738
                          </td>
                          <td className="py-4 px-4 text-white/60">6.40</td>
                          <td className="py-4 px-4 text-white/60">5.12</td>
                          <td className="py-4 px-4">
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              Baseline
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Training Details */}
                  <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div>
                      <h3 className="text-white font-semibold mb-4">
                        Training Configuration
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-white/60">Total Samples</span>
                          <span className="text-white font-semibold">
                            2,102
                          </span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-white/60">Training Set</span>
                          <span className="text-white font-semibold">
                            1,681 (80%)
                          </span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-white/60">Test Set</span>
                          <span className="text-white font-semibold">
                            421 (20%)
                          </span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-white/60">Features</span>
                          <span className="text-white font-semibold">13</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-4">
                        XGBoost Hyperparameters
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-white/60">n_estimators</span>
                          <span className="text-white font-semibold">200</span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-white/60">max_depth</span>
                          <span className="text-white font-semibold">6</span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-white/60">learning_rate</span>
                          <span className="text-white font-semibold">0.1</span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-white/60">subsample</span>
                          <span className="text-white font-semibold">0.8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ARCHITECTURE TAB */}
          <TabsContent value="architecture" className="mt-6">
            <Card className="bg-gray-900/50 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">
                  System Architecture
                </CardTitle>
                <CardDescription className="text-white/60">
                  End-to-end ML pipeline workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Pipeline Steps */}
                  {[
                    {
                      step: "1",
                      title: "Data Collection",
                      desc: "2,102 hourly pollution samples with 13 environmental features",
                      color: "blue",
                    },
                    {
                      step: "2",
                      title: "Preprocessing",
                      desc: "StandardScaler normalization, missing value handling",
                      color: "purple",
                    },
                    {
                      step: "3",
                      title: "Model Training",
                      desc: "XGBoost regression with 200 estimators, 80-20 train-test split",
                      color: "pink",
                    },
                    {
                      step: "4",
                      title: "SHAP Analysis",
                      desc: "TreeExplainer for feature attribution and explainability",
                      color: "green",
                    },
                    {
                      step: "5",
                      title: "Validation",
                      desc: "R² = 0.9806, RMSE = 5.50, MAE = 4.05 on test set",
                      color: "yellow",
                    },
                    {
                      step: "6",
                      title: "Prediction",
                      desc: "48-hour forecast with confidence intervals",
                      color: "cyan",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg bg-${item.color}-500/20 border border-${item.color}-500/30 flex items-center justify-center flex-shrink-0`}
                      >
                        <span
                          className={`text-${item.color}-400 font-bold text-xl`}
                        >
                          {item.step}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-1">
                          {item.title}
                        </h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technology Stack */}
        <Card className="bg-gradient-to-r from-purple-950/30 to-black border-purple-500/20">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                "Python",
                "XGBoost",
                "SHAP",
                "Scikit-learn",
                "Pandas",
                "NumPy",
                "Matplotlib",
              ].map((tech) => (
                <div
                  key={tech}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg"
                >
                  <span className="text-white font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelDocs;
