// src/pages/Home.jsx
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Zap,
  Shield,
  BarChart3,
  Activity,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import AnimatedShaderBackground from "../components/ui/animated-shader-background";

const Home = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Shader Background */}
      <AnimatedShaderBackground />

      {/* Gradient Overlay for better text readability */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"
        style={{ zIndex: 1 }}
      />

      {/* Content Overlay */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* Top Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/30">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  EcoSolutions
                </h1>
                <p className="text-xs text-white/50"></p>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all border border-white/20 text-sm"
            >
              Launch App
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center px-4 py-32">
          <div className="max-w-6xl w-full text-center space-y-8">
            {/* Badge */}
            <div className="inline-block animate-fade-in">
              <div className="flex items-center space-x-2 py-2 px-4 border border-purple-500/30 rounded-full text-xs font-medium text-purple-300 bg-purple-500/10 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>Team Astra Minds</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none">
                Predict
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                  Pollution
                </span>
              </h1>
              <p className="text-2xl md:text-3xl font-light text-white/80 max-w-3xl mx-auto leading-relaxed">
                48 Hours Ahead
              </p>
            </div>

            {/* Subheadline */}
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/60 leading-relaxed">
              AI-powered system using{" "}
              <span className="text-blue-400 font-semibold">
                XGBoost + SHAP
              </span>{" "}
              to predict urban pollution with{" "}
              <span className="text-green-400 font-semibold">98% accuracy</span>{" "}
              and show exactly which factors drive it.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-blue-500/50 transition-all group">
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-600 group-hover:scale-110 transition-transform">
                  98%
                </p>
                <p className="text-white/60 text-sm mt-2 font-medium">
                  Accuracy
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-all group">
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 group-hover:scale-110 transition-transform">
                  48h
                </p>
                <p className="text-white/60 text-sm mt-2 font-medium">
                  Forecast
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-green-500/50 transition-all group">
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-green-600 group-hover:scale-110 transition-transform">
                  13
                </p>
                <p className="text-white/60 text-sm mt-2 font-medium">
                  Factors
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-pink-500/50 transition-all group">
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-pink-600 group-hover:scale-110 transition-transform">
                  AI
                </p>
                <p className="text-white/60 text-sm mt-2 font-medium">SHAP</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full font-bold tracking-wide overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/50"
              >
                <span className="relative z-10">Explore Dashboard</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/attribution"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold tracking-wide border border-white/30 backdrop-blur-sm transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Factor Analysis</span>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="pt-12 animate-bounce">
              <ChevronDown className="w-6 h-6 text-white/40 mx-auto" />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-32 px-4 border-t border-white/10 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
                Why This{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Wins
                </span>
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Not just another pollution dashboard. This is explainable AI for
                real-world impact.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-blue-950/40 to-transparent border border-blue-500/20 hover:border-blue-500/60 transition-all backdrop-blur-md hover:scale-105">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-xl shadow-blue-500/30">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Explainable AI
                </h3>
                <p className="text-white/70 leading-relaxed">
                  <span className="text-blue-400 font-semibold">
                    SHAP analysis
                  </span>{" "}
                  reveals exactly which factors (traffic, industry, weather)
                  drive pollution. No black boxes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 to-transparent border border-purple-500/20 hover:border-purple-500/60 transition-all backdrop-blur-md hover:scale-105">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-xl shadow-purple-500/30">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Actionable Insights
                </h3>
                <p className="text-white/70 leading-relaxed">
                  <span className="text-purple-400 font-semibold">
                    What-If simulator
                  </span>{" "}
                  shows: "Reduce traffic 30% = 15% less pollution." Perfect for
                  policymakers.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-green-950/40 to-transparent border border-green-500/20 hover:border-green-500/60 transition-all backdrop-blur-md hover:scale-105">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-xl shadow-green-500/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Real Impact
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Helps{" "}
                  <span className="text-green-400 font-semibold">
                    9 out of 10 people
                  </span>{" "}
                  who breathe polluted air daily. Early warnings save lives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack & CTA */}
        <div className="py-20 px-4 border-t border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div>
              <p className="text-white/40 text-sm mb-6 uppercase tracking-widest">
                Powered By
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-lg">
                <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white/80 font-medium">
                  React + Vite
                </span>
                <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white/80 font-medium">
                  XGBoost ML
                </span>
                <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white/80 font-medium">
                  SHAP AI
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 text-blue-400 font-bold">
                  Firebase
                </span>
                <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white/80 font-medium">
                  Tailwind CSS
                </span>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full font-black text-lg tracking-wide shadow-2xl shadow-blue-500/50 hover:scale-105 transition-all"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
