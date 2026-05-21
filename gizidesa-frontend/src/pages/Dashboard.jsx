import { Navigate } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage";

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

function Dashboard() {
  const user = getAuthUser();
  const role = normalizeRole(user?.role);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin_desa") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === "kader") {
    return <Navigate to="/kader/dashboard" replace />;
  }

  if (role === "bidan") {
    return <Navigate to="/bidan/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default Dashboard;