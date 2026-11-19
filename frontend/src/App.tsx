import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LakeMonitoring from './pages/LakeMonitoring';
import LakeAnalysis from './pages/LakeAnalysis';
import RiskIntelligence from './pages/RiskIntelligence';
import FloodSimulation from './pages/FloodSimulation';
import SatelliteData from './pages/SatelliteData';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import FutureScope from './pages/FutureScope';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lakes" element={<LakeMonitoring />} />
          <Route path="/lakes/:id" element={<LakeAnalysis />} />
          <Route path="/risk" element={<RiskIntelligence />} />
          <Route path="/flood" element={<FloodSimulation />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/future-scope" element={<FutureScope />} />
          <Route path="/satellite" element={<SatelliteData />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
