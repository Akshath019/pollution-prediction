// src/pages/WhatIfSimulator.jsx
import { useState, useEffect } from "react";
import { usePollutionData, getAQIColor } from "../hooks/usePollutionData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import {
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const WhatIfSimulator = () => {
  const { featureImportance, predictions, loading, error } = usePollutionData();

  // Get baseline prediction (first hour)
  const baselinePollution =
    predictions && predictions.length > 0
      ? predictions[0].pollution_prediction ||
        predictions[0].predicted_pollution ||
        56
      : 56;

  // Factor adjustments (percentage changes)
  const [factors, setFactors] = useState({
    traffic_volume: 0,
    congestion_index: 0,
    industrial_activity: 0,
    wind_speed: 0,
    temperature: 0,
    green_space_percentage: 0,
  });

  const [simulatedPollution, setSimulatedPollution] =
    useState(baselinePollution);

  // Calculate impact based on feature importance
  const getFeatureWeight = (featureName) => {
    if (!featureImportance || featureImportance.length === 0) {
      // Default weights if no data
      const defaults = {
        traffic_volume: 0.35,
        congestion_index: 0.2,
        industrial_activity: 0.15,
        wind_speed: 0.1,
        temperature: 0.08,
        green_space_percentage: 0.08,
      };
      return defaults[featureName] || 0.05;
    }

    const feature = featureImportance.find((f) =>
      (f.feature || "").toLowerCase().includes(featureName.toLowerCase())
    );

    return feature ? feature.importance_percentage / 100 || 0.1 : 0.1;
  };

  // Recalculate pollution when factors change
  useEffect(() => {
    let adjustedPollution = baselinePollution;

    // Apply each factor's impact
    Object.keys(factors).forEach((factorName) => {
      const change = factors[factorName];
      const weight = getFeatureWeight(factorName);

      // Green space and wind speed reduce pollution (inverse relationship)
      const multiplier =
        factorName === "green_space_percentage" || factorName === "wind_speed"
          ? -1
          : 1;

      // Impact = baseline * weight * percentage_change * direction
      const impact = baselinePollution * weight * (change / 100) * multiplier;
      adjustedPollution += impact;
    });

    // Keep within reasonable bounds
    adjustedPollution = Math.max(0, Math.min(300, adjustedPollution));
    setSimulatedPollution(adjustedPollution);
  }, [factors, baselinePollution, featureImportance]);

  const handleFactorChange = (factorName, value) => {
    setFactors((prev) => ({
      ...prev,
      [factorName]: value[0],
    }));
  };

  const resetFactors = () => {
    setFactors({
      traffic_volume: 0,
      congestion_index: 0,
      industrial_activity: 0,
      wind_speed: 0,
      temperature: 0,
      green_space_percentage: 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-lg">Loading simulator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Error Loading Data</h2>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  const pollutionChange = simulatedPollution - baselinePollution;
  const percentageChange = (pollutionChange / baselinePollution) * 100;

  // Get AQI category
  const getCategory = (value) => {
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for Sensitive Groups";
    if (value <= 200) return "Unhealthy";
    return "Very Unhealthy";
  };

  const currentCategory = getCategory(simulatedPollution);

  // Comparison data for chart
  const comparisonData = [
    {
      name: "Baseline",
      value: baselinePollution,
      color: "#60a5fa",
    },
    {
      name: "Simulated",
      value: simulatedPollution,
      color: pollutionChange > 0 ? "#ef4444" : "#22c55e",
    },
  ];

  // Factor configurations
  const factorConfigs = [
    {
      key: "traffic_volume",
      label: "Traffic Volume",
      icon: "🚗",
      description: "Adjust vehicle count on roads",
      color: "blue",
    },
    {
      key: "congestion_index",
      label: "Traffic Congestion",
      icon: "🚦",
      description: "How congested are the roads",
      color: "orange",
    },
    {
      key: "industrial_activity",
      label: "Industrial Activity",
      icon: "🏭",
      description: "Factory and industrial emissions",
      color: "red",
    },
    {
      key: "wind_speed",
      label: "Wind Speed",
      icon: "💨",
      description: "Higher wind disperses pollution",
      color: "cyan",
      inverse: true,
    },
    {
      key: "green_space_percentage",
      label: "Green Spaces",
      icon: "🌳",
      description: "Parks and vegetation coverage",
      color: "green",
      inverse: true,
    },
    {
      key: "temperature",
      label: "Temperature",
      icon: "🌡️",
      description: "Ambient temperature",
      color: "yellow",
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                What-If Simulator
              </h1>
              <p className="text-white/60 text-lg">
                Interactive tool to explore pollution scenarios
              </p>
            </div>
            <button
              onClick={resetFactors}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-purple-950/50 to-blue-950/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  How to Use
                </h3>
                <p className="text-white/70 text-sm">
                  Adjust the sliders below to simulate different scenarios. See
                  how reducing traffic, increasing green spaces, or changing
                  weather conditions affects pollution levels in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Adjust Factors</CardTitle>
                <CardDescription className="text-white/60">
                  Move sliders to simulate changes (-50% to +50%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {factorConfigs.map((config) => {
                  const value = factors[config.key];
                  return (
                    <div key={config.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <p className="text-white font-medium">
                              {config.label}
                            </p>
                            <p className="text-white/40 text-xs">
                              {config.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-lg font-bold ${
                              value === 0
                                ? "text-white/60"
                                : value > 0
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {value > 0 ? "+" : ""}
                            {value}%
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(val) =>
                          handleFactorChange(config.key, val)
                        }
                        min={-50}
                        max={50}
                        step={5}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-white/40">
                        <span>-50% (Reduce)</span>
                        <span>0% (Baseline)</span>
                        <span>+50% (Increase)</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            {/* Main Result Card */}
            <Card
              className={`bg-gradient-to-br ${
                pollutionChange > 10
                  ? "from-red-950/50 to-black border-red-500/20"
                  : pollutionChange < -10
                  ? "from-green-950/50 to-black border-green-500/20"
                  : "from-blue-950/50 to-black border-blue-500/20"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Simulated Pollution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-6xl font-bold text-white mb-2">
                      {simulatedPollution.toFixed(1)}
                    </p>
                    <Badge
                      className={`${getAQIColor(currentCategory)} text-white`}
                    >
                      {currentCategory}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">
                        Change from baseline
                      </span>
                      <div
                        className={`flex items-center space-x-2 ${
                          pollutionChange > 0
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {pollutionChange > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-bold">
                          {pollutionChange > 0 ? "+" : ""}
                          {pollutionChange.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">
                        Percentage change
                      </span>
                      <span
                        className={`font-bold ${
                          pollutionChange > 0
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {percentageChange > 0 ? "+" : ""}
                        {percentageChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Chart */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Before vs After
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis
                        dataKey="name"
                        stroke="#ffffff40"
                        tick={{ fill: "#ffffff60" }}
                      />
                      <YAxis stroke="#ffffff40" tick={{ fill: "#ffffff60" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #ffffff20",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Quick Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() =>
                    setFactors({
                      traffic_volume: -30,
                      congestion_index: -30,
                      industrial_activity: 0,
                      wind_speed: 0,
                      temperature: 0,
                      green_space_percentage: 0,
                    })
                  }
                  className="w-full p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium transition-colors text-left"
                >
                  🚗 Reduce Traffic by 30%
                </button>
                <button
                  onClick={() =>
                    setFactors({
                      traffic_volume: 0,
                      congestion_index: 0,
                      industrial_activity: -40,
                      wind_speed: 0,
                      temperature: 0,
                      green_space_percentage: 0,
                    })
                  }
                  className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-colors text-left"
                >
                  🏭 Cut Industrial Emissions 40%
                </button>
                <button
                  onClick={() =>
                    setFactors({
                      traffic_volume: 0,
                      congestion_index: 0,
                      industrial_activity: 0,
                      wind_speed: 30,
                      temperature: 0,
                      green_space_percentage: 20,
                    })
                  }
                  className="w-full p-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-medium transition-colors text-left"
                >
                  🌳 Increase Green Spaces + Wind
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Insights */}
        {Math.abs(pollutionChange) > 5 && (
          <Card className="bg-gradient-to-r from-purple-950/30 to-black border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Policy Insight
                  </h3>
                  <p className="text-white/70">
                    {pollutionChange < -10 ? (
                      <>
                        Your changes could reduce pollution by{" "}
                        <span className="text-green-400 font-bold">
                          {Math.abs(pollutionChange).toFixed(1)} AQI points
                        </span>
                        . This would improve air quality significantly and
                        benefit public health.
                      </>
                    ) : pollutionChange > 10 ? (
                      <>
                        Warning: These changes would increase pollution by{" "}
                        <span className="text-red-400 font-bold">
                          {pollutionChange.toFixed(1)} AQI points
                        </span>
                        . Consider mitigation strategies.
                      </>
                    ) : (
                      <>
                        Your changes show a{" "}
                        <span className="text-blue-400 font-bold">
                          {Math.abs(pollutionChange).toFixed(1)} AQI point
                        </span>{" "}
                        shift. Try adjusting multiple factors for greater
                        impact.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WhatIfSimulator;
