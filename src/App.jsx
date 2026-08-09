import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { startPresence } from "./services/presenceService.js";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Assessment from "./pages/Assessment.jsx";
import Profile from "./pages/Profile.jsx";
import Discover from "./pages/Discover.jsx";
import VendorRegister from "./pages/VendorRegister.jsx";
import LogExperience from "./pages/LogExperience.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Founder from "./pages/Founder.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InvestorPitch from "./pages/InvestorPitch.jsx";
import AdminPortal from "./pages/AdminPortal.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";
import Privacy from "./pages/Privacy.jsx";
import Merch from "./pages/Merch.jsx";
import LiveActivity from "./components/LiveActivity.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">🌿</div>;
  return user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  useEffect(() => startPresence(), []);

  return (
    <>
      <Navbar />
      <LiveActivity />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/founder" element={<Founder />} />
        <Route path="/investors" element={<InvestorPitch />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/vendor/dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/log" element={<ProtectedRoute><LogExperience /></ProtectedRoute>} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
