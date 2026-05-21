import {
  ClipboardList,
  Home,
  Leaf,
  LogOut,
  MapPin,
  Sprout,
  UsersRound,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuthData } from "../../utils/authStorage";

function KaderSidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/kader/dashboard",
      icon: Home,
    },
    {
      label: "Input Data RT",
      path: "/kader/input-data-rt",
      icon: ClipboardList,
    },
    {
      label: "Data Warga",
      path: "/kader/data-warga",
      icon: UsersRound,
    },
    {
      label: "Peta Risiko",
      path: "/kader/peta-risiko",
      icon: MapPin,
    },
    {
      label: "Edukasi Pangan",
      path: "/kader/edukasi-pangan",
      icon: Sprout,
    },
  ];

  const handleLogout = () => {
    clearAuthData();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <button
        type="button"
        className="admin-brand-block"
        onClick={() => navigate("/kader/dashboard")}
      >
        <span className="admin-brand-logo">
          <Leaf size={25} />
        </span>

        <div>
          <strong>GiziDesa</strong>
          <small>Kader Desa</small>
        </div>
      </button>

      <nav className="admin-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "admin-menu-item active" : "admin-menu-item"
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button type="button" className="admin-logout-button" onClick={handleLogout}>
        <LogOut size={18} />
        Keluar
      </button>
    </aside>
  );
}

export default KaderSidebar;