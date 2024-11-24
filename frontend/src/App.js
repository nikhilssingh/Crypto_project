import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import IssuerDashboard from "./components/IssuerDashboard";
import VerifierDashboard from "./components/VerifierDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/issuer" element={<IssuerDashboard />} />
        <Route path="/verifier" element={<VerifierDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
