// src/pages/Dashboard.jsx
import {
  usePollutionData,
  getAQIColor,
  getTopFeatures,
} from "../hooks/usePollutionData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Wind,
  Factory,
  Car,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const Dashboard = () => {
  const { predictions, featureImportance, loading, error } = usePollutionData();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-lg">Loading pollution data...</p>
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
          <p className="text-sm text-white/40">
            Make sure CSV files are in /public/data/
          </p>
        </div>
      </div>
    );
  }

  // Debug log to see actual data structure
  console.log("First prediction:", predictions[0]);
  console.log("First feature:", featureImportance[0]);

  // Safely get current data with flexible column names
  const currentData =
    predictions && predictions.length > 0 ? predictions[0] : null;

  // Get pollution value - try different possible column names
  const getPollutionValue = (data) => {
    if (!data) return 0;
    return (
      data.pollution_prediction ||
      data.predicted_pollution ||
      data.pollution ||
      0
    );
  };

  const getConfidenceLower = (data) => {
    if (!data) return 0;
    return data.confidence_lower || data.lower_bound || 0;
  };

  const getConfidenceUpper = (data) => {
    if (!data) return 0;
    return data.confidence_upper || data.upper_bound || 100;
  };

  const getAQICategory = (data) => {
    if (!data) return "Unknown";
    return data.aqi_category || data.category || "Unknown";
  };

  const topFeatures = getTopFeatures(featureImportance, 5);

  // Get next 12 hours for mini chart
  const next12Hours = predictions.slice(0, 12).map((p) => ({
    ...p,
    pollution: getPollutionValue(p),
    hour: p.hour || 0,
  }));

  // Calculate trend
  const currentPollution = getPollutionValue(predictions[0]);
  const nextPollution = getPollutionValue(predictions[1]);
  const trend = nextPollution - currentPollution;

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-white/60 text-lg">
            Real-time pollution monitoring and AI predictions
          </p>
        </div>

        {/* Current Status - Hero Section */}
        <Card className="bg-gradient-to-br from-blue-950/50 to-black border-blue-500/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-2xl">
                  Current Pollution Level
                </CardTitle>
                <CardDescription className="text-white/60">
                  {currentData?.timestamp || "Live data"}
                </CardDescription>
              </div>
              <Badge
                className={`${getAQIColor(
                  getAQICategory(currentData)
                )} text-white px-4 py-2 text-sm`}
              >
                {getAQICategory(currentData)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-end space-x-4">
              <div className="text-7xl font-bold text-white">
                {getPollutionValue(currentData).toFixed(1)}
              </div>
              <div className="pb-4 space-y-1">
                <p className="text-white/40 text-sm">AQI Index</p>
                <div
                  className={`flex items-center space-x-2 ${
                    trend > 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {trend > 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {Math.abs(trend).toFixed(1)} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Range */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-sm mb-2">Confidence Range</p>
              <div className="flex items-center space-x-2">
                <span className="text-white/60">
                  {getConfidenceLower(currentData).toFixed(1)}
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                    style={{ width: "70%" }}
                  />
                </div>
                <span className="text-white/60">
                  {getConfidenceUpper(currentData).toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 12-Hour Trend Chart */}
        <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Next 12 Hours Forecast</CardTitle>
            <CardDescription className="text-white/60">
              Predicted pollution levels with confidence intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={next12Hours}>
                  <defs>
                    <linearGradient
                      id="colorPollution"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="hour"
                    stroke="#ffffff40"
                    tick={{ fill: "#ffffff60" }}
                  />
                  <YAxis stroke="#ffffff40" tick={{ fill: "#ffffff60" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #ffffff20",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pollution"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorPollution)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Contributing Factors */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-black/50 border-white/10 backdrop-blur-xl md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">
                Top Pollution Factors
              </CardTitle>
              <CardDescription className="text-white/60">
                AI-identified key contributors (SHAP analysis)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topFeatures.map((feature, idx) => {
                const percentage = feature.importance_percentage || 0;
                const featureName = feature.feature || "Unknown";

                // Safe icon selection
                const getIcon = () => {
                  const name = featureName.toLowerCase();
                  if (name.includes("traffic"))
                    return <Car className="w-4 h-4 text-blue-400" />;
                  if (name.includes("industrial"))
                    return <Factory className="w-4 h-4 text-blue-400" />;
                  if (name.includes("wind"))
                    return <Wind className="w-4 h-4 text-blue-400" />;
                  return (
                    <span className="text-blue-400 font-bold text-xs">
                      {idx + 1}
                    </span>
                  );
                };

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          {getIcon()}
                        </div>
                        <span className="text-white font-medium capitalize">
                          {featureName.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="text-blue-400 font-bold">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="bg-black/50 border-green-500/20 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Good Hours</p>
                    <p className="text-3xl font-bold text-green-400">
                      {
                        predictions.filter((p) => getAQICategory(p) === "Good")
                          .length
                      }
                    </p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-green-500/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-yellow-500/20 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Moderate Hours</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {
                        predictions.filter(
                          (p) => getAQICategory(p) === "Moderate"
                        ).length
                      }
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-yellow-500/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-red-500/20 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Unhealthy Hours</p>
                    <p className="text-3xl font-bold text-red-400">
                      {
                        predictions.filter((p) => {
                          const category = getAQICategory(p);
                          return category && category.includes("Unhealthy");
                        }).length
                      }
                    </p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-500/40" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
