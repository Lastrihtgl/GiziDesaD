import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../pages/public/HomePage";
import MasalahPage from "../pages/public/MasalahPage";
import FiturPage from "../pages/public/FiturPage";
import PenggunaPage from "../pages/public/PenggunaPage";
import AlurKerjaPage from "../pages/public/AlurKerjaPage";
import SdgsPage from "../pages/public/SdgsPage";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("gizidesa_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/masalah" element={<MasalahPage />} />
      <Route path="/fitur" element={<FiturPage />} />
      <Route path="/pengguna" element={<PenggunaPage />} />
      <Route path="/alur-kerja" element={<AlurKerjaPage />} />
      <Route path="/sdgs" element={<SdgsPage />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;