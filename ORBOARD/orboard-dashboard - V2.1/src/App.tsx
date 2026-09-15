import { Routes, Route } from "react-router-dom";

import ProductionDashboard from "./pages/ProductionDashboard";
import SystemConfig from "./pages/SystemConfig";

export default function App() {
  return (
    <Routes>
      <Route element={<ProductionDashboard />} path="/" />
      <Route element={<SystemConfig />} path="/system-config" />
    </Routes>
  );
}
