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
import AdminWilayahPage from "../pages/admin/wilayah/AdminWilayahPage";
import AdminDataRisikoPage from "../pages/admin/risiko/AdminDataRisikoPage";

import AdminRekomendasiPage from "../pages/admin/rekomendasi/AdminRekomendasiPage";
import AdminPanganLokalPage from "../pages/admin/pangan/AdminPanganLokalPage";
import AdminIntervensiPage from "../pages/admin/intervensi/AdminIntervensiPage";

import BidanDashboard from "../pages/bidan/BidanDashboard";

import KaderDashboard from "../pages/kader/KaderDashboard";
import InputDataRT from "../pages/kader/InputDataRT";
import PetaRisiko from "../pages/kader/PetaRisiko";
import EdukasiPangan from "../pages/kader/EdukasiPangan";
import DataWarga from "../pages/kader/DataWarga";

function getAuthToken() {
  return localStorage.getItem("gizidesa_token");
}

function getAuthUser() {
  const rawUser = localStorage.getItem("gizidesa_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = getAuthToken();
  const user = getAuthUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
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

      {/* ADMIN */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin_desa"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/wilayah"
        element={
          <ProtectedRoute allowedRoles={["admin_desa"]}>
            <AdminWilayahPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/data-risiko"
        element={
          <ProtectedRoute allowedRoles={["admin_desa"]}>
            <AdminDataRisikoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rekomendasi"
        element={
            <ProtectedRoute>
            <AdminRekomendasiPage />
            </ProtectedRoute>
        }
        />

        <Route
  path="/admin/pangan"
  element={
    <ProtectedRoute>
      <AdminPanganLokalPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/intervensi"
  element={
    <ProtectedRoute allowedRoles={["admin_desa"]}>
      <AdminIntervensiPage />
    </ProtectedRoute>
  }
/>

      {/* KADER */}
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

      {/* BIDAN */}
      <Route
        path="/bidan/dashboard"
        element={
          <ProtectedRoute allowedRoles={["bidan_desa"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/peta-risiko"
        element={
          <ProtectedRoute allowedRoles={["bidan_desa"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/tindak-lanjut"
        element={
          <ProtectedRoute allowedRoles={["bidan_desa"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/rekomendasi"
        element={
          <ProtectedRoute allowedRoles={["bidan_desa"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/validasi-data"
        element={
          <ProtectedRoute allowedRoles={["bidan_desa"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/monitor-anc"
        element={
          <ProtectedRoute allowedRoles={["bidan_desa"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/pangan-lokal"
        element={
          <ProtectedRoute allowedRoles={["bidan_desa"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/tracking"
        element={
          <ProtectedRoute allowedRoles={["bidan_desa"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;