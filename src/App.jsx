// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import FactorAttribution from "./pages/FactorAttribution";
import WhatIfSimulator from "./pages/WhatIfSimulator";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          {/* Home page - NO navbar (has its own hero design) */}
          <Route path="/" element={<Home />} />

          {/* All other pages - WITH navbar */}
          <Route
            path="/dashboard"
            element={
              <>
                <Navbar />
                <Dashboard />
              </>
            }
          />
          <Route
            path="/timeline"
            element={
              <>
                <Navbar />
                <Timeline />
              </>
            }
          />
          <Route
            path="/attribution"
            element={
              <>
                <Navbar />
                <FactorAttribution />
              </>
            }
          />
          <Route
            path="/simulator"
            element={
              <>
                <Navbar />
                <WhatIfSimulator />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
