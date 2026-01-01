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
  Car,
  Factory,
  Wind,
  Droplets,
  Trees,
  Thermometer,
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

  const baselinePollution =
    predictions && predictions.length > 0
      ? predictions[0].pollution_prediction ||
        predictions[0].predicted_pollution ||
        56
      : 56;

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

  const getFeatureWeight = (featureName) => {
    if (!featureImportance || featureImportance.length === 0) {
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

  useEffect(() => {
    let adjustedPollution = baselinePollution;

    Object.keys(factors).forEach((factorName) => {
      const change = factors[factorName];
      const weight = getFeatureWeight(factorName);

      const multiplier =
        factorName === "green_space_percentage" || factorName === "wind_speed"
          ? -1
          : 1;

      const impact = baselinePollution * weight * (change / 100) * multiplier;
      adjustedPollution += impact;
    });

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

  const getCategory = (value) => {
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for Sensitive Groups";
    if (value <= 200) return "Unhealthy";
    return "Very Unhealthy";
  };

  const currentCategory = getCategory(simulatedPollution);

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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-white/30 rounded-lg p-4 shadow-2xl">
          <p className="text-white font-semibold text-sm mb-2">
            {payload[0].payload.name}
          </p>
          <p className="text-blue-400 font-bold text-2xl">
            {payload[0].value.toFixed(1)}
          </p>
          <p className="text-white/60 text-xs mt-1">AQI Level</p>
        </div>
      );
    }
    return null;
  };

  const factorConfigs = [
    {
      key: "traffic_volume",
      label: "Traffic Volume",
      icon: Car,
      description: "Adjust vehicle count on roads",
      color: "blue",
    },
    {
      key: "congestion_index",
      label: "Traffic Congestion",
      icon: Car,
      description: "How congested are the roads",
      color: "orange",
    },
    {
      key: "industrial_activity",
      label: "Industrial Activity",
      icon: Factory,
      description: "Factory and industrial emissions",
      color: "red",
    },
    {
      key: "wind_speed",
      label: "Wind Speed",
      icon: Wind,
      description: "Higher wind disperses pollution",
      color: "cyan",
      inverse: true,
    },
    {
      key: "green_space_percentage",
      label: "Green Spaces",
      icon: Trees,
      description: "Parks and vegetation coverage",
      color: "green",
      inverse: true,
    },
    {
      key: "temperature",
      label: "Temperature",
      icon: Thermometer,
      description: "Ambient temperature",
      color: "yellow",
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header with Reset Button */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              What-If Simulator
            </h1>
            <p className="text-white/60 text-lg">
              Interactive tool to explore pollution scenarios
            </p>
          </div>
          <button
            onClick={resetFactors}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all border border-red-500/30 font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-purple-950/50 to-blue-950/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Lightbulb className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  How to Use This Simulator
                </h3>
                <p className="text-white/70">
                  Adjust the factor sliders below to simulate different policy
                  scenarios. Watch how reducing traffic, increasing green
                  spaces, or changing weather conditions affects pollution
                  levels in real-time. Use the quick scenario buttons for common
                  policy actions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Layout: Results on Top, Controls Below */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT: Current vs Simulated Result */}
          <Card
            className={`bg-gradient-to-br ${
              pollutionChange > 10
                ? "from-red-950/50 to-black border-red-500/30"
                : pollutionChange < -10
                ? "from-green-950/50 to-black border-green-500/30"
                : "from-blue-950/50 to-black border-blue-500/30"
            } backdrop-blur-xl`}
          >
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Simulation Results
              </CardTitle>
              <CardDescription className="text-white/60">
                Predicted pollution level with your adjustments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Baseline */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-blue-400 text-sm font-medium mb-2">
                    Baseline (Current)
                  </p>
                  <p className="text-5xl font-bold text-white">
                    {baselinePollution.toFixed(1)}
                  </p>
                  <p className="text-white/60 text-sm mt-2">AQI Index</p>
                </div>

                {/* Simulated */}
                <div
                  className={`p-4 rounded-xl ${
                    pollutionChange > 0
                      ? "bg-red-500/10 border border-red-500/30"
                      : "bg-green-500/10 border border-green-500/30"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-2 ${
                      pollutionChange > 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    Simulated Result
                  </p>
                  <p className="text-5xl font-bold text-white">
                    {simulatedPollution.toFixed(1)}
                  </p>
                  <Badge
                    className={`${getAQIColor(
                      currentCategory
                    )} text-white mt-2`}
                  >
                    {currentCategory}
                  </Badge>
                </div>
              </div>

              {/* Change Metrics */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white/80 font-medium">
                    Absolute Change
                  </span>
                  <div
                    className={`flex items-center space-x-2 ${
                      pollutionChange > 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {pollutionChange > 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="font-bold text-xl">
                      {pollutionChange > 0 ? "+" : ""}
                      {pollutionChange.toFixed(1)} AQI
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white/80 font-medium">
                    Percentage Change
                  </span>
                  <span
                    className={`font-bold text-xl ${
                      pollutionChange > 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {percentageChange > 0 ? "+" : ""}
                    {percentageChange.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="pt-4">
                <p className="text-white/80 font-semibold mb-4">
                  Before vs After Comparison
                </p>
                <div className="h-64 p-4 rounded-xl bg-gray-900/50 border border-white/10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis
                        dataKey="name"
                        stroke="#ffffff60"
                        tick={{ fill: "#ffffff90", fontSize: 14 }}
                      />
                      <YAxis
                        stroke="#ffffff60"
                        tick={{ fill: "#ffffff90", fontSize: 14 }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Quick Scenario Buttons */}
          <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Quick Policy Scenarios
              </CardTitle>
              <CardDescription className="text-white/60">
                Test common policy interventions with one click
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                className="w-full p-5 bg-green-500/10 hover:bg-green-500/20 border-2 border-green-500/30 hover:border-green-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                      <Car className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-green-400 font-bold text-lg">
                        Reduce Traffic
                      </p>
                      <p className="text-white/60 text-sm">
                        30% decrease in vehicle volume
                      </p>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold text-2xl">-30%</div>
                </div>
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
                className="w-full p-5 bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500/30 hover:border-blue-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                      <Factory className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold text-lg">
                        Cut Industrial Emissions
                      </p>
                      <p className="text-white/60 text-sm">
                        40% reduction in factory output
                      </p>
                    </div>
                  </div>
                  <div className="text-blue-400 font-bold text-2xl">-40%</div>
                </div>
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
                className="w-full p-5 bg-cyan-500/10 hover:bg-cyan-500/20 border-2 border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                      <Trees className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-cyan-400 font-bold text-lg">
                        Green Infrastructure
                      </p>
                      <p className="text-white/60 text-sm">
                        More parks + better wind flow
                      </p>
                    </div>
                  </div>
                  <div className="text-cyan-400 font-bold text-2xl">+20%</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Factor Adjustment Sliders */}
        <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              Adjust Individual Factors
            </CardTitle>
            <CardDescription className="text-white/60">
              Fine-tune each factor with precision control (-50% to +50%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {factorConfigs.map((config) => {
                const value = factors[config.key];
                const IconComponent = config.icon;
                return (
                  <div
                    key={config.key}
                    className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">
                            {config.label}
                          </p>
                          <p className="text-white/40 text-xs">
                            {config.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-2xl font-bold ${
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
                    <div className="flex justify-between text-xs text-white/40 font-medium">
                      <span>-50%</span>
                      <span>0%</span>
                      <span>+50%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Policy Insight */}
        {Math.abs(pollutionChange) > 5 && (
          <Card className="bg-gradient-to-r from-purple-950/30 to-black border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Policy Recommendation
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    {pollutionChange < -10 ? (
                      <>
                        These interventions could reduce pollution by{" "}
                        <span className="text-green-400 font-bold">
                          {Math.abs(pollutionChange).toFixed(1)} AQI points (
                          {Math.abs(percentageChange).toFixed(1)}%)
                        </span>
                        . This would significantly improve air quality and
                        public health outcomes. Recommended for immediate
                        implementation.
                      </>
                    ) : pollutionChange > 10 ? (
                      <>
                        Warning: These changes would increase pollution by{" "}
                        <span className="text-red-400 font-bold">
                          {pollutionChange.toFixed(1)} AQI points (
                          {percentageChange.toFixed(1)}%)
                        </span>
                        . Additional mitigation strategies are required to
                        offset negative impacts.
                      </>
                    ) : (
                      <>
                        Current adjustments show a{" "}
                        <span className="text-blue-400 font-bold">
                          {Math.abs(pollutionChange).toFixed(1)} AQI point (
                          {Math.abs(percentageChange).toFixed(1)}%)
                        </span>{" "}
                        change. Consider combining multiple interventions for
                        greater impact.
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
