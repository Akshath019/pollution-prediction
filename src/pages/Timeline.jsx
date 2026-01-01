// src/pages/Timeline.jsx
import { usePollutionData, getAQIColor } from "../hooks/usePollutionData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AlertTriangle, Download, Clock, TrendingUp } from "lucide-react";
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
  ReferenceLine,
} from "recharts";

const Timeline = () => {
  const { predictions, loading, error } = usePollutionData();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-lg">Loading timeline data...</p>
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

  // Get pollution value safely
  const getPollutionValue = (data) => {
    return (
      data.pollution_prediction ||
      data.predicted_pollution ||
      data.pollution ||
      0
    );
  };

  const getConfidenceLower = (data) => {
    return data.confidence_lower || data.lower_bound || 0;
  };

  const getConfidenceUpper = (data) => {
    return data.confidence_upper || data.upper_bound || 100;
  };

  const getAQICategory = (data) => {
    return data.aqi_category || data.category || "Unknown";
  };

  // Prepare chart data
  const chartData = predictions.map((p, idx) => ({
    index: idx,
    hour: p.hour || idx,
    pollution: getPollutionValue(p),
    lower: getConfidenceLower(p),
    upper: getConfidenceUpper(p),
    category: getAQICategory(p),
    timestamp: p.timestamp || `Hour ${idx}`,
  }));

  // Calculate statistics
  const avgPollution =
    chartData.reduce((sum, d) => sum + d.pollution, 0) / chartData.length;
  const maxPollution = Math.max(...chartData.map((d) => d.pollution));
  const minPollution = Math.min(...chartData.map((d) => d.pollution));
  const peakHour = chartData.find((d) => d.pollution === maxPollution);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-4 backdrop-blur-xl">
          <p className="text-white/60 text-xs mb-2">{data.timestamp}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-white/80 text-sm">Pollution:</span>
              <span className="text-blue-400 font-bold">
                {data.pollution.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-white/80 text-sm">Range:</span>
              <span className="text-white/60 text-sm">
                {data.lower.toFixed(1)} - {data.upper.toFixed(1)}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <Badge
                className={`${getAQIColor(data.category)} text-white text-xs`}
              >
                {data.category}
              </Badge>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              48-Hour Timeline
            </h1>
            <p className="text-white/60 text-lg">
              Complete pollution forecast with confidence intervals
            </p>
          </div>
 
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Average</p>
                <p className="text-3xl font-bold text-white">
                  {avgPollution.toFixed(1)}
                </p>
                <p className="text-white/40 text-xs">AQI Index</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-red-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Peak Level</p>
                <p className="text-3xl font-bold text-red-400">
                  {maxPollution.toFixed(1)}
                </p>
                <p className="text-white/40 text-xs">Hour {peakHour?.hour}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-green-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Lowest</p>
                <p className="text-3xl font-bold text-green-400">
                  {minPollution.toFixed(1)}
                </p>
                <p className="text-white/40 text-xs">Best Quality</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-yellow-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Variation</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {(maxPollution - minPollution).toFixed(1)}
                </p>
                <p className="text-white/40 text-xs">Range</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart */}
        <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">
              Complete 48-Hour Forecast
            </CardTitle>
            <CardDescription className="text-white/60">
              Hover over the chart to see detailed predictions for each hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                    <linearGradient
                      id="colorConfidence"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="hour"
                    stroke="#ffffff40"
                    tick={{ fill: "#ffffff60" }}
                    label={{
                      value: "Hour",
                      position: "insideBottom",
                      offset: -5,
                      fill: "#ffffff60",
                    }}
                  />
                  <YAxis
                    stroke="#ffffff40"
                    tick={{ fill: "#ffffff60" }}
                    label={{
                      value: "Pollution Level (AQI)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#ffffff60",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Reference lines for AQI categories */}
                  <ReferenceLine
                    y={50}
                    stroke="#22c55e"
                    strokeDasharray="3 3"
                    label={{ value: "Good", fill: "#22c55e", fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="#eab308"
                    strokeDasharray="3 3"
                    label={{ value: "Moderate", fill: "#eab308", fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={150}
                    stroke="#f97316"
                    strokeDasharray="3 3"
                    label={{
                      value: "Unhealthy",
                      fill: "#f97316",
                      fontSize: 12,
                    }}
                  />

                  {/* Confidence interval */}
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="url(#colorConfidence)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#000000"
                  />

                  {/* Main prediction line */}
                  <Line
                    type="monotone"
                    dataKey="pollution"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6, fill: "#60a5fa" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Breakdown */}
        <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Hourly Breakdown</span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Detailed predictions for each hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto pr-2">
              {chartData.map((data, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-xs font-medium">
                      Hour {data.hour}
                    </span>
                    <Badge
                      className={`${getAQIColor(
                        data.category
                      )} text-white text-[10px] px-2 py-0`}
                    >
                      {data.category.split(" ")[0]}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {data.pollution.toFixed(0)}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {data.lower.toFixed(0)}-{data.upper.toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Section */}
        {maxPollution > 100 && (
          <Card className="bg-gradient-to-br from-red-950/50 to-black border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    High Pollution Alert
                  </h3>
                  <p className="text-white/60 mb-3">
                    Pollution levels are expected to exceed safe thresholds
                    around{" "}
                    <span className="text-red-400 font-semibold">
                      Hour {peakHour?.hour}
                    </span>{" "}
                    reaching{" "}
                    <span className="text-red-400 font-semibold">
                      {maxPollution.toFixed(1)} AQI
                    </span>
                    .
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      Sensitive groups should limit outdoor activities
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Consider alternative transportation
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Timeline;
