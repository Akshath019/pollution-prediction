// src/hooks/usePollutionData.jsx
import { useState, useEffect } from "react";
import Papa from "papaparse";

export const usePollutionData = () => {
  const [data, setData] = useState({
    predictions: [],
    featureImportance: [],
    shapSamples: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load all 3 CSV files
        const [predictionsRes, featuresRes, shapRes] = await Promise.all([
          fetch("/data/predictions_48h.csv"),
          fetch("/data/feature_importance.csv"),
          fetch("/data/shap_sample_predictions.csv"),
        ]);

        // Parse predictions
        const predictionsText = await predictionsRes.text();
        const predictionsParsed = Papa.parse(predictionsText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        // Parse feature importance
        const featuresText = await featuresRes.text();
        const featuresParsed = Papa.parse(featuresText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        // Parse SHAP samples
        const shapText = await shapRes.text();
        const shapParsed = Papa.parse(shapText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        setData({
          predictions: predictionsParsed.data,
          featureImportance: featuresParsed.data,
          shapSamples: shapParsed.data,
          loading: false,
          error: null,
        });

        console.log("✅ Data loaded successfully!");
        console.log("Predictions:", predictionsParsed.data.length, "rows");
        console.log("Features:", featuresParsed.data.length, "rows");
        console.log("SHAP Samples:", shapParsed.data.length, "rows");
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      }
    };

    loadAllData();
  }, []);

  return data;
};

// Helper function to get current pollution level (first prediction)
export const getCurrentPollution = (predictions) => {
  if (!predictions || predictions.length === 0) return null;
  return predictions[0];
};

// Helper function to categorize AQI color
export const getAQIColor = (category) => {
  const colors = {
    Good: "bg-green-500",
    Moderate: "bg-yellow-500",
    "Unhealthy for Sensitive Groups": "bg-orange-500",
    Unhealthy: "bg-red-500",
    "Very Unhealthy": "bg-purple-500",
    Hazardous: "bg-rose-900",
  };
  return colors[category] || "bg-gray-500";
};

// Helper function to get top N features
export const getTopFeatures = (featureImportance, n = 5) => {
  if (!featureImportance || featureImportance.length === 0) return [];
  return featureImportance.slice(0, n);
};
