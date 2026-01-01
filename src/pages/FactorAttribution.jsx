// src/pages/FactorAttribution.jsx
import { useState } from "react";
import { usePollutionData } from "../hooks/usePollutionData";
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
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Car,
  Factory,
  Wind,
  Droplets,
  Gauge,
  Trees,
  Sun,
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

const FactorAttribution = () => {
  const { featureImportance, shapSamples, predictions, loading, error } =
    usePollutionData();
  const [selectedSample, setSelectedSample] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-lg">Analyzing factors...</p>
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

  // Get icon for feature
  const getFeatureIcon = (feature) => {
    const name = feature.toLowerCase();
    if (name.includes("traffic")) return <Car className="w-5 h-5" />;
    if (name.includes("industrial")) return <Factory className="w-5 h-5" />;
    if (name.includes("wind")) return <Wind className="w-5 h-5" />;
    if (name.includes("humidity")) return <Droplets className="w-5 h-5" />;
    if (name.includes("pressure")) return <Gauge className="w-5 h-5" />;
    if (name.includes("green") || name.includes("space"))
      return <Trees className="w-5 h-5" />;
    if (name.includes("temperature")) return <Sun className="w-5 h-5" />;
    return <TrendingUp className="w-5 h-5" />;
  };

  // Prepare chart data for global importance
  const importanceData = featureImportance.slice(0, 10).map((f) => ({
    name: (f.feature || "Unknown").replace(/_/g, " "),
    value: f.importance_percentage || 0,
    rawFeature: f.feature,
  }));

  // Get SHAP contributions for selected sample
  const getSampleShapData = () => {
    if (!shapSamples || shapSamples.length === 0) return [];

    const sample = shapSamples[selectedSample];
    if (!sample) return [];

    const shapData = [];

    // Extract SHAP values from the sample
    Object.keys(sample).forEach((key) => {
      if (key.endsWith("_shap")) {
        const featureName = key.replace("_shap", "");
        const shapValue = sample[key];
        const featureValue = sample[`${featureName}_value`];

        if (shapValue !== undefined && shapValue !== null) {
          shapData.push({
            feature: featureName.replace(/_/g, " "),
            shap: shapValue,
            value: featureValue,
            rawFeature: featureName,
          });
        }
      }
    });

    // Sort by absolute SHAP value
    return shapData
      .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
      .slice(0, 10);
  };

  const sampleShapData = getSampleShapData();
  const currentSample =
    shapSamples && shapSamples.length > 0 ? shapSamples[selectedSample] : null;

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 backdrop-blur-xl">
          <p className="text-white font-medium">{payload[0].payload.name}</p>
          <p className="text-blue-400 font-bold">
            {payload[0].value.toFixed(1)}%
          </p>
          <p className="text-white/60 text-xs mt-1">of total impact</p>
        </div>
      );
    }
    return null;
  };

  const ShapTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 backdrop-blur-xl">
          <p className="text-white font-medium capitalize">{data.feature}</p>
          <p
            className={`font-bold ${
              data.shap > 0 ? "text-red-400" : "text-green-400"
            }`}
          >
            {data.shap > 0 ? "+" : ""}
            {data.shap.toFixed(2)} impact
          </p>
          <p className="text-white/60 text-xs mt-1">
            Value: {data.value?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Factor Attribution
              </h1>
              <p className="text-white/60 text-lg">
                AI-powered analysis showing which factors drive pollution
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-blue-950/50 to-purple-950/50 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  What is SHAP Analysis?
                </h3>
                <p className="text-white/70 text-sm">
                  SHAP (SHapley Additive exPlanations) is an advanced AI
                  technique that explains{" "}
                  <span className="text-blue-400 font-semibold">
                    exactly how much
                  </span>{" "}
                  each factor (traffic, weather, industry) contributes to
                  pollution levels. This helps policymakers make{" "}
                  <span className="text-blue-400 font-semibold">
                    data-driven decisions
                  </span>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 text-white">
            <TabsTrigger
              value="global"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Global Importance
            </TabsTrigger>
            <TabsTrigger
              value="specific"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Specific Examples
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Global Feature Importance */}
          <TabsContent value="global" className="space-y-6 mt-6">
            <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">
                  Top 10 Pollution Drivers
                </CardTitle>
                <CardDescription className="text-white/60">
                  Ranked by overall impact across all predictions (based on SHAP
                  values)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={importanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis
                        type="number"
                        stroke="#ffffff40"
                        tick={{ fill: "#ffffff60" }}
                        label={{
                          value: "Impact (%)",
                          position: "insideBottom",
                          offset: -5,
                          fill: "#ffffff60",
                        }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#ffffff40"
                        tick={{ fill: "#ffffff60" }}
                        width={150}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {importanceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(${220 - index * 15}, 80%, ${
                              60 - index * 3
                            }%)`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importanceData.slice(0, 6).map((item, idx) => (
                <Card
                  key={idx}
                  className="bg-black/50 border-white/10 backdrop-blur-xl hover:border-blue-500/50 transition-colors"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        {getFeatureIcon(item.rawFeature)}
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        #{idx + 1}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-1 capitalize">
                      {item.name}
                    </h3>
                    <p className="text-3xl font-bold text-blue-400 mb-2">
                      {item.value.toFixed(1)}%
                    </p>
                    <p className="text-white/60 text-sm">
                      {item.value > 30
                        ? "Critical factor"
                        : item.value > 15
                        ? "Major contributor"
                        : "Moderate impact"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: Specific SHAP Examples */}
          <TabsContent value="specific" className="space-y-6 mt-6">
            {/* Sample Selector */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">
                  Explore Specific Predictions
                </CardTitle>
                <CardDescription className="text-white/60">
                  See how different factors contributed to pollution at specific
                  times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {shapSamples &&
                    shapSamples.slice(0, 10).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSample(idx)}
                        className={`
                        px-4 py-2 rounded-lg font-medium transition-all
                        ${
                          selectedSample === idx
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }
                      `}
                      >
                        Sample {idx + 1}
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {currentSample && (
              <>
                {/* Prediction Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-950/50 to-black border-blue-500/20">
                    <CardContent className="pt-6">
                      <p className="text-white/60 text-sm mb-1">
                        Predicted Pollution
                      </p>
                      <p className="text-4xl font-bold text-blue-400">
                        {currentSample.predicted_pollution?.toFixed(1) || "N/A"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-950/50 to-black border-purple-500/20">
                    <CardContent className="pt-6">
                      <p className="text-white/60 text-sm mb-1">
                        Actual Pollution
                      </p>
                      <p className="text-4xl font-bold text-purple-400">
                        {currentSample.actual_pollution?.toFixed(1) || "N/A"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20">
                    <CardContent className="pt-6">
                      <p className="text-white/60 text-sm mb-1">
                        Prediction Error
                      </p>
                      <p className="text-4xl font-bold text-green-400">
                        {currentSample.error?.toFixed(1) || "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* SHAP Waterfall Chart */}
                <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Factor Contribution Breakdown
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      How each factor pushed pollution up (red) or down (green)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sampleShapData} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#ffffff10"
                          />
                          <XAxis
                            type="number"
                            stroke="#ffffff40"
                            tick={{ fill: "#ffffff60" }}
                            label={{
                              value: "Impact on Prediction",
                              position: "insideBottom",
                              offset: -5,
                              fill: "#ffffff60",
                            }}
                          />
                          <YAxis
                            type="category"
                            dataKey="feature"
                            stroke="#ffffff40"
                            tick={{ fill: "#ffffff60" }}
                            width={150}
                          />
                          <Tooltip content={<ShapTooltip />} />
                          <Bar dataKey="shap" radius={[0, 8, 8, 0]}>
                            {sampleShapData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.shap > 0 ? "#ef4444" : "#22c55e"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-white/60 text-sm">
                          Increases Pollution
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-white/60 text-sm">
                          Decreases Pollution
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Factor Breakdown */}
                <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Detailed Factor Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sampleShapData.slice(0, 8).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div
                              className={`p-2 rounded-lg ${
                                item.shap > 0
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {getFeatureIcon(item.rawFeature)}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium capitalize">
                                {item.feature}
                              </p>
                              <p className="text-white/40 text-sm">
                                Value: {item.value?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-xl font-bold ${
                                item.shap > 0
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            >
                              {item.shap > 0 ? "+" : ""}
                              {item.shap.toFixed(2)}
                            </p>
                            <p className="text-white/40 text-xs">
                              {item.shap > 0 ? "increases" : "decreases"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Key Insights */}
        <Card className="bg-gradient-to-br from-purple-950/30 to-black border-purple-500/20">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span>Key Insights for Policymakers</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60 text-sm mb-2">💡 Primary Driver</p>
                <p className="text-white font-semibold">
                  {importanceData[0]?.name} accounts for{" "}
                  {importanceData[0]?.value.toFixed(1)}% of pollution variation
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60 text-sm mb-2">🎯 Action Item</p>
                <p className="text-white font-semibold">
                  Reducing top 3 factors could decrease pollution by ~
                  {(
                    importanceData
                      .slice(0, 3)
                      .reduce((sum, d) => sum + d.value, 0) * 0.7
                  ).toFixed(0)}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FactorAttribution;
