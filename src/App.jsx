// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import FactorAttribution from "./pages/FactorAttribution";
import WhatIfSimulator from "./pages/WhatIfSimulator";

// Placeholder pages (we'll build these next)





function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/attribution" element={<FactorAttribution />} />
          <Route path="/simulator" element={<WhatIfSimulator />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
