from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load trained model and scaler
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'xgboost_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'models', 'scaler.pkl')

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ XGBoost model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

try:
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    print("✅ Scaler loaded successfully")
except Exception as e:
    print(f"⚠️  Scaler not found, will use unscaled features: {e}")
    scaler = None

# Feature names (extracted from your notebook)
FEATURE_NAMES = [
    'hour', 'day_of_week', 'is_weekend', 'is_rush_hour',
    'traffic_volume', 'temperature', 'humidity', 'wind_speed',
    'industrial_activity', 'vehicle_emissions', 'construction_activity',
    'population_density', 'green_cover_percentage'
]


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


def generate_base_features(timestamp):
    """Generate time-based features from timestamp"""
    hour = timestamp.hour
    day_of_week = timestamp.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    is_rush_hour = 1 if hour in [7, 8, 9, 17, 18, 19] else 0
    
    return {
        'hour': hour,
        'day_of_week': day_of_week,
        'is_weekend': is_weekend,
        'is_rush_hour': is_rush_hour
    }


def generate_default_features(timestamp, baseline_data=None):
    """Generate complete feature set with realistic defaults"""
    base_features = generate_base_features(timestamp)
    
    # Default values based on typical urban pollution patterns
    defaults = {
        'traffic_volume': 5000,
        'temperature': 25,
        'humidity': 60,
        'wind_speed': 10,
        'industrial_activity': 50,
        'vehicle_emissions': 45,
        'construction_activity': 30,
        'population_density': 1000,
        'green_cover_percentage': 20
    }
    
    # Apply rush hour multiplier for traffic
    if base_features['is_rush_hour']:
        defaults['traffic_volume'] *= 1.5
        defaults['vehicle_emissions'] *= 1.3
    
    # Apply weekend reduction
    if base_features['is_weekend']:
        defaults['traffic_volume'] *= 0.7
        defaults['industrial_activity'] *= 0.5
    
    # Add time-of-day temperature variation
    defaults['temperature'] += 5 * np.sin(2 * np.pi * base_features['hour'] / 24)
    
    # Merge with baseline if provided
    if baseline_data:
        defaults.update(baseline_data)
    
    return {**base_features, **defaults}


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/predict', methods=['POST'])
def predict_single():
    """
    Predict pollution for a single timestamp
    
    Request body:
    {
        "timestamp": "2025-01-06T14:30:00",  // Optional, defaults to now
        "features": {  // Optional custom features
            "traffic_volume": 6000,
            "temperature": 28,
            ...
        }
    }
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json or {}
        
        # Parse timestamp
        timestamp_str = data.get('timestamp')
        if timestamp_str:
            timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        else:
            timestamp = datetime.now()
        
        # Generate features
        custom_features = data.get('features', {})
        features = generate_default_features(timestamp, custom_features)
        
        # Create feature vector in correct order
        feature_vector = [features.get(name, 0) for name in FEATURE_NAMES]
        X = np.array([feature_vector])
        
        # Make prediction
        prediction = model.predict(X)[0]
        prediction = float(np.clip(prediction, 0, 300))
        
        # Calculate confidence interval (using ±10% as estimate)
        confidence_margin = prediction * 0.1
        
        return jsonify({
            'timestamp': timestamp.isoformat(),
            'pollution_prediction': round(prediction, 2),
            'confidence_lower': round(max(0, prediction - confidence_margin), 2),
            'confidence_upper': round(min(300, prediction + confidence_margin), 2),
            'aqi_category': categorize_aqi(prediction),
            'features_used': features
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/predict-48h', methods=['POST'])
def predict_48h():
    """
    Generate 48-hour forecast
    
    Request body:
    {
        "start_time": "2025-01-06T14:30:00",  // Optional, defaults to now
        "baseline_features": {  // Optional baseline values
            "traffic_volume": 5500,
            "temperature": 26,
            ...
        }
    }
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json or {}
        
        # Parse start time
        start_time_str = data.get('start_time')
        if start_time_str:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        else:
            start_time = datetime.now()
        
        baseline = data.get('baseline_features', {})
        
        # Generate 48 timestamps
        timestamps = [start_time + timedelta(hours=i) for i in range(48)]
        predictions = []
        
        for ts in timestamps:
            features = generate_default_features(ts, baseline)
            feature_vector = [features.get(name, 0) for name in FEATURE_NAMES]
            X = np.array([feature_vector])
            
            pred = model.predict(X)[0]
            pred = float(np.clip(pred, 0, 300))
            confidence_margin = pred * 0.1
            
            predictions.append({
                'timestamp': ts.isoformat(),
                'hour': ts.hour,
                'day': ts.strftime('%A'),
                'pollution_prediction': round(pred, 2),
                'confidence_lower': round(max(0, pred - confidence_margin), 2),
                'confidence_upper': round(min(300, pred + confidence_margin), 2),
                'aqi_category': categorize_aqi(pred)
            })
        
        # Calculate summary stats
        pred_values = [p['pollution_prediction'] for p in predictions]
        summary = {
            'mean': round(np.mean(pred_values), 2),
            'max': round(np.max(pred_values), 2),
            'min': round(np.min(pred_values), 2),
            'std': round(np.std(pred_values), 2)
        }
        
        return jsonify({
            'predictions': predictions,
            'summary': summary,
            'start_time': start_time.isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/predict-whatif', methods=['POST'])
def predict_whatif():
    """
    What-if scenario simulator
    
    Request body:
    {
        "baseline": {
            "traffic_volume": 5000,
            "temperature": 25,
            ...
        },
        "scenario": {
            "traffic_volume": 3000,  // Reduced by 40%
            "green_cover_percentage": 35  // Increased from 20 to 35
        },
        "duration_hours": 24  // Optional, defaults to 24
    }
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        baseline = data.get('baseline', {})
        scenario = data.get('scenario', {})
        duration = data.get('duration_hours', 24)
        
        start_time = datetime.now()
        timestamps = [start_time + timedelta(hours=i) for i in range(duration)]
        
        baseline_predictions = []
        scenario_predictions = []
        
        for ts in timestamps:
            # Baseline prediction
            base_features = generate_default_features(ts, baseline)
            base_vector = [base_features.get(name, 0) for name in FEATURE_NAMES]
            base_pred = float(model.predict(np.array([base_vector]))[0])
            base_pred = np.clip(base_pred, 0, 300)
            
            # Scenario prediction
            scenario_features = {**base_features, **scenario}
            scenario_vector = [scenario_features.get(name, 0) for name in FEATURE_NAMES]
            scenario_pred = float(model.predict(np.array([scenario_vector]))[0])
            scenario_pred = np.clip(scenario_pred, 0, 300)
            
            baseline_predictions.append({
                'timestamp': ts.isoformat(),
                'hour': ts.hour,
                'pollution_prediction': round(base_pred, 2),
                'aqi_category': categorize_aqi(base_pred)
            })
            
            scenario_predictions.append({
                'timestamp': ts.isoformat(),
                'hour': ts.hour,
                'pollution_prediction': round(scenario_pred, 2),
                'aqi_category': categorize_aqi(scenario_pred)
            })
        
        # Calculate impact
        base_avg = np.mean([p['pollution_prediction'] for p in baseline_predictions])
        scenario_avg = np.mean([p['pollution_prediction'] for p in scenario_predictions])
        reduction = base_avg - scenario_avg
        reduction_pct = (reduction / base_avg) * 100 if base_avg > 0 else 0
        
        return jsonify({
            'baseline': baseline_predictions,
            'scenario': scenario_predictions,
            'impact': {
                'baseline_avg': round(base_avg, 2),
                'scenario_avg': round(scenario_avg, 2),
                'reduction': round(reduction, 2),
                'reduction_percentage': round(reduction_pct, 2)
            },
            'scenario_changes': scenario
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/features', methods=['GET'])
def get_features():
    """Return list of features the model expects"""
    return jsonify({
        'features': FEATURE_NAMES,
        'count': len(FEATURE_NAMES)
    })


if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 POLLUTION PREDICTION API STARTING")
    print("="*70)
    print(f"Model loaded: {'✅' if model else '❌'}")
    print(f"Scaler loaded: {'✅' if scaler else '⚠️  (optional)'}")
    print(f"Features: {len(FEATURE_NAMES)}")
    print("\n📡 Endpoints:")
    print("   GET  /health           - Health check")
    print("   POST /predict          - Single prediction")
    print("   POST /predict-48h      - 48-hour forecast")
    print("   POST /predict-whatif   - What-if simulator")
    print("   GET  /features         - List features")
    print("\n🌐 Starting server on http://localhost:5000")
    print("="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)