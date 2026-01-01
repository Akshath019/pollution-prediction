// src/components/layout/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { Activity, BarChart3, Clock, Sliders, Lightbulb } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Activity },
    { path: "/timeline", label: "Timeline", icon: Clock },
    { path: "/attribution", label: "Factor Attribution", icon: BarChart3 },
    { path: "/simulator", label: "What-If", icon: Sliders },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Links to HOME now */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Urban Pollution
              </h1>
              <p className="text-xs text-white/50">AI Prediction System</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      active
                        ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">
              Live Data
            </span>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around mt-4 pb-2 border-t border-white/10 pt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all
                  ${active ? "text-blue-400" : "text-white/50 hover:text-white"}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
