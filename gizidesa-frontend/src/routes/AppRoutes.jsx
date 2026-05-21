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

import KaderDashboard from "../pages/kader/KaderDashboard";
import InputDataRT from "../pages/kader/InputDataRT";
import PetaRisiko from "../pages/kader/PetaRisiko";
import EdukasiPangan from "../pages/kader/EdukasiPangan";
import DataWarga from "../pages/kader/DataWarga";

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

      <Route
        path="/kader/dashboard"
        element={
          <ProtectedRoute>
            <KaderDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kader/input-data-rt"
        element={
          <ProtectedRoute>
            <InputDataRT />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kader/peta-risiko"
        element={
          <ProtectedRoute>
            <PetaRisiko />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kader/edukasi-pangan"
        element={
          <ProtectedRoute>
            <EdukasiPangan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kader/data-warga"
        element={
          <ProtectedRoute>
            <DataWarga />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;