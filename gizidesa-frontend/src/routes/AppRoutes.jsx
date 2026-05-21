import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../pages/public/HomePage";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminWilayahPage from "../pages/admin/wilayah/AdminWilayahPage";
import AdminDataRisikoPage from "../pages/admin/risiko/AdminDataRisikoPage";
import AdminRekomendasiPage from "../pages/admin/rekomendasi/AdminRekomendasiPage";
import AdminPanganLokalPage from "../pages/admin/pangan/AdminPanganLokalPage";
import AdminIntervensiPage from "../pages/admin/intervensi/AdminIntervensiPage";
import AdminPetaRisikoPage from "../pages/admin/peta/AdminPetaRisikoPage";
import AdminLaporanPage from "../pages/admin/laporan/AdminLaporanPage";
import AdminAnalitikPage from "../pages/admin/analitik/AdminAnalitikPage";
import AdminTimPage from "../pages/admin/tim/AdminTimPage";

import BidanDashboard from "../pages/bidan/BidanDashboard";
import ValidasiData from "../pages/bidan/ValidasiData";
import MonitorAnc from "../pages/bidan/MonitorAnc";
import RekomendasiBidan from "../pages/bidan/RekomendasiBidan";
import TindakLanjut from "../pages/bidan/TindakLanjut";
import PetaRisikoBidan from "../pages/bidan/PetaRisikoBidan";
import PanganLokalBidan from "../pages/bidan/PanganLokalBidan";
import TrackingIntervensiBidan from "../pages/bidan/TrackingIntervensiBidan";

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

function normalizeRole(role) {
  if (!role) {
    return "";
  }

  const value = String(role).toLowerCase();

  const roleMap = {
    admin: "admin_desa",
    admin_desa: "admin_desa",

    kader: "kader",
    kader_desa: "kader",
    kader_posyandu: "kader",

    bidan: "bidan",
    bidan_desa: "bidan",
  };

  return roleMap[value] || value;
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = getAuthToken();
  const user = getAuthUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user.role);

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<HomePage />} />

      {/* Redirect route public lama ke landing page baru */}
      <Route path="/masalah" element={<Navigate to="/" replace />} />
      <Route path="/fitur" element={<Navigate to="/" replace />} />
      <Route path="/pengguna" element={<Navigate to="/" replace />} />
      <Route path="/alur-kerja" element={<Navigate to="/" replace />} />
      <Route path="/sdgs" element={<Navigate to="/" replace />} />

      {/* AUTH */}
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
        path="/admin/analitik"
        element={
          <ProtectedRoute allowedRoles={["admin_desa"]}>
            <AdminAnalitikPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tim"
        element={
          <ProtectedRoute allowedRoles={["admin_desa"]}>
            <AdminTimPage />
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
          <ProtectedRoute allowedRoles={["admin_desa"]}>
            <AdminRekomendasiPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/peta-risiko"
        element={
          <ProtectedRoute allowedRoles={["admin_desa"]}>
            <AdminPetaRisikoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/pangan"
        element={
          <ProtectedRoute allowedRoles={["admin_desa"]}>
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

      <Route
        path="/admin/laporan"
        element={
          <ProtectedRoute allowedRoles={["admin_desa"]}>
            <AdminLaporanPage />
          </ProtectedRoute>
        }
      />

      {/* KADER */}
      <Route
        path="/kader/dashboard"
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <KaderDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kader/input-data-rt"
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <InputDataRT />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kader/data-warga"
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <DataWarga />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kader/peta-risiko"
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <PetaRisiko />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kader/edukasi-pangan"
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <EdukasiPangan />
          </ProtectedRoute>
        }
      />

      {/* BIDAN */}
      <Route
        path="/bidan/dashboard"
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/validasi-data"
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <ValidasiData />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/monitor-anc"
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <MonitorAnc />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/rekomendasi"
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <RekomendasiBidan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/tindak-lanjut"
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <TindakLanjut />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/peta-risiko"
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <PetaRisikoBidan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/pangan-lokal"
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <PanganLokalBidan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bidan/tracking"
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <TrackingIntervensiBidan />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;