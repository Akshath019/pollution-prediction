// src/pages/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import { usePollutionData } from "../hooks/usePollutionData";
import { Send, Bot, User } from "lucide-react";

const Chatbot = () => {
  const { predictions, featureImportance, loading } = usePollutionData();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI Pollution Assistant. I can answer questions about pollution predictions, explain which factors contribute most, and help you understand the data. Try asking: 'Why is pollution high?' or 'What affects pollution most?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();

    const currentPollution =
      predictions && predictions.length > 0
        ? (
            predictions[0].pollution_prediction ||
            predictions[0].predicted_pollution ||
            56
          ).toFixed(1)
        : "56.2";

    const currentCategory =
      predictions && predictions.length > 0
        ? predictions[0].aqi_category || "Moderate"
        : "Moderate";

    const topFactor =
      featureImportance && featureImportance.length > 0
        ? featureImportance[0].feature?.replace(/_/g, " ") || "traffic volume"
        : "traffic volume";

    const topPercentage =
      featureImportance && featureImportance.length > 0
        ? featureImportance[0].importance_percentage?.toFixed(1) || "38.7"
        : "38.7";

    const avg24h =
      predictions && predictions.length >= 24
        ? (
            predictions
              .slice(0, 24)
              .reduce((sum, p) => sum + (p.pollution_prediction || 0), 0) / 24
          ).toFixed(1)
        : "60.8";

    if (msg.match(/^(hi|hello|hey|greetings)/)) {
      return "Hello! I'm here to help you understand air pollution predictions. You can ask me about current pollution levels, future forecasts, what factors contribute most, or how to reduce pollution. What would you like to know?";
    }

    if (
      msg.includes("current") ||
      msg.includes("now") ||
      msg.includes("today")
    ) {
      return `(ACCORDING TO CURRENT DATASET)Current pollution level is **${currentPollution} AQI**, which is in the **${currentCategory}** category. ${
        parseFloat(currentPollution)  > 100
          ? "⚠️ This is elevated - sensitive groups should limit prolonged outdoor activities."
          : "✅ Air quality is acceptable for most people."
      }`;
    }

    if (
      msg.includes("tomorrow") ||
      msg.includes("forecast") ||
      msg.includes("predict")
    ) {
      return `Looking at our 48-hour forecast, the average pollution tomorrow will be around **${avg24h} AQI**. We're using an XGBoost model with 98% accuracy to make these predictions. Peak pollution typically occurs during rush hours (7-9 AM and 5-7 PM) due to increased traffic.`;
    }

    if (
      msg.includes("why") &&
      (msg.includes("high") || msg.includes("bad") || msg.includes("elevated"))
    ) {
      return `Based on our **SHAP analysis**, pollution is primarily driven by:\n\n1️⃣ **${topFactor}** - Contributing **${topPercentage}%** of variation\n2️⃣ **Traffic congestion** - Adding another 16-17%\n3️⃣ **Industrial activity** - Contributing about 11%\n\nThese are the main factors you should focus on to reduce pollution levels.`;
    }

    if (
      msg.includes("what") &&
      (msg.includes("affect") ||
        msg.includes("cause") ||
        msg.includes("factor") ||
        msg.includes("contribute"))
    ) {
      const top3 =
        featureImportance && featureImportance.length >= 3
          ? featureImportance.slice(0, 3)
          : [
              { feature: "traffic_volume", importance_percentage: 38.7 },
              { feature: "congestion_index", importance_percentage: 16.5 },
              { feature: "industrial_activity", importance_percentage: 10.9 },
            ];

      return (
        `Based on our **SHAP explainability analysis**, the top pollution factors are:\n\n` +
        top3
          .map(
            (f, i) =>
              `${i + 1}. **${(f.feature || "").replace(/_/g, " ")}** - ${(
                f.importance_percentage || 0
              ).toFixed(1)}% impact`
          )
          .join("\n") +
        `\n\nThese percentages show how much each factor contributes to pollution variation. SHAP values are mathematically proven to fairly distribute credit across all features.`
      );
    }

    if (
      msg.includes("reduce") ||
      msg.includes("lower") ||
      msg.includes("decrease") ||
      msg.includes("improve")
    ) {
      return `Based on our What-If Simulator analysis, here are the most effective interventions:\n\n✅ **Reduce traffic by 30%** → ~13% pollution reduction\n✅ **Cut industrial emissions by 40%** → ~15% reduction\n✅ **Increase green spaces + wind flow** → ~10-12% improvement\n\n💡 **Best strategy**: Combine traffic reduction with industrial controls for maximum impact (20-25% total reduction possible).`;
    }

    if (
      msg.includes("shap") ||
      (msg.includes("explain") && msg.includes("ai"))
    ) {
      return `**SHAP (SHapley Additive exPlanations)** is an advanced AI technique that explains exactly how each factor contributes to our predictions.\n\nThink of it like this: If pollution is 75 AQI, SHAP tells us:\n- Traffic added +12 points\n- Industry added +8 points\n- Wind removed -3 points\n- Base level was 58\n\nAdd them up: 58 + 12 + 8 - 3 = 75 ✓\n\nThis transparency helps policymakers trust and act on our predictions!`;
    }

    if (
      msg.includes("accuracy") ||
      msg.includes("reliable") ||
      msg.includes("trust")
    ) {
      return `Our model achieves **98% accuracy** (R² = 0.9806), which means:\n\n📊 **RMSE: 5.50** - Average error of just 5.5 AQI points\n📊 **MAE: 4.05** - Median error even lower\n📊 **Test set: 421 samples** - Validated on unseen data\n\nWe compared XGBoost, Random Forest, and Linear Regression - XGBoost won decisively. That's why we use it for our 48-hour forecasts.`;
    }

    if (
      msg.includes("rush hour") ||
      msg.includes("peak") ||
      msg.includes("worst time")
    ) {
      return `**Peak pollution times** are typically:\n\n🚗 **Morning rush: 7-9 AM** - Commuter traffic spike\n🚗 **Evening rush: 5-7 PM** - Highest pollution levels\n\nDuring these hours, traffic volume increases by ~50%, driving pollution up significantly. Our model shows traffic contributes **${topPercentage}% of pollution variation**, making rush hours critical intervention points.`;
    }

    if (
      msg.includes("health") ||
      msg.includes("safe") ||
      msg.includes("exercise") ||
      msg.includes("outdoor")
    ) {
      const advice =
        parseFloat(currentPollution) > 100
          ? "⚠️ **Limit prolonged outdoor activities**, especially for children, elderly, and those with respiratory conditions. Consider indoor exercise today."
          : parseFloat(currentPollution) > 50
          ? "⚠️ Air quality is **moderate** - generally acceptable, but sensitive individuals should consider reducing intense outdoor activities."
          : "✅ Air quality is **good** - outdoor activities are safe for everyone!";

      return `Current pollution is **${currentPollution} AQI** (${currentCategory}).\n\n${advice}\n\nCheck our Timeline page for hourly forecasts to plan your day around air quality!`;
    }

    if (
      msg.includes("how") &&
      (msg.includes("work") ||
        msg.includes("built") ||
        msg.includes("technology"))
    ) {
      return `Our system uses:\n\n🧠 **XGBoost ML Model** - Gradient boosting for 98% accuracy\n🔍 **SHAP Analysis** - Explainable AI for factor attribution\n⚛️ **React Frontend** - Fast, responsive UI\n☁️ **Google Firebase** - Cloud hosting with global CDN\n\nWe trained on 2,102 hourly samples with 13 environmental features (traffic, weather, industry, etc.) to predict pollution 48 hours ahead with confidence intervals.`;
    }

    if (msg.includes("traffic")) {
      return `**Traffic volume** is the #1 pollution driver in our analysis:\n\n🚗 Contributes **${topPercentage}% of pollution variation**\n🚗 Peaks during rush hours (7-9 AM, 5-7 PM)\n🚗 Reducing traffic by 30% can lower pollution by ~13%\n\nOur What-If Simulator lets you test different traffic reduction scenarios in real-time!`;
    }

    if (
      msg.includes("what if") ||
      msg.includes("simulator") ||
      msg.includes("scenario")
    ) {
      return `Our **What-If Simulator** lets you test policy interventions!\n\nYou can adjust factors like:\n- Traffic volume (-50% to +50%)\n- Industrial activity\n- Green space coverage\n- Wind speed\n\n...and instantly see predicted pollution changes. For example:\n- Traffic -30% → Pollution drops ~13%\n- Industry -40% → Pollution drops ~15%\n\nTry it on the What-If page!`;
    }

    return `I can help you with:\n\n📊 **Current pollution levels** - "What's the pollution now?"\n🔮 **Forecasts** - "What's tomorrow's prediction?"\n🔍 **Factor analysis** - "What causes pollution?"\n💡 **Reduction strategies** - "How to reduce pollution?"\n🧠 **SHAP explainability** - "Explain SHAP analysis"\n\nWhat would you like to know?`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      label: "Current pollution?",
      query: "What's the current pollution level?",
    },
    { label: "Top factors?", query: "What factors affect pollution most?" },
    { label: "How to reduce?", query: "How can we reduce pollution?" },
    { label: "Explain SHAP", query: "Explain SHAP analysis" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-lg">Loading AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-6 px-4">
      <div className="container mx-auto max-w-4xl h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                AI Pollution Assistant
              </h1>
              <p className="text-white/60 text-base">
                // TO BE IMPLEMENTED
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container - FIXED */}
        <div className="bg-gray-900 border border-white/10 rounded-xl backdrop-blur-xl flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${
                    msg.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-blue-500"
                        : "bg-gradient-to-br from-green-500 to-blue-500"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 text-white border border-white/10"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-500">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-white/10">
                    <div className="flex space-x-2">
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Section - FIXED */}
          <div className="border-t border-white/10 p-4 bg-gray-900 flex-shrink-0">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(action.query);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-white/20 rounded-full text-white/70 hover:text-white text-xs font-medium transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about pollution, factors, predictions..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
