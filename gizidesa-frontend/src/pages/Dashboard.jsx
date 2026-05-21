import { Navigate } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage";

function Dashboard() {
  const user = getAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin_desa") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "bidan_desa") {
    return <Navigate to="/bidan/dashboard" replace />;
  }

  if (user.role === "kader_posyandu") {
    return <Navigate to="/kader/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default Dashboard;