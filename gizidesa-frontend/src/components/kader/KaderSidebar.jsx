import {
  ClipboardList,
  Home,
  LogOut,
  MapPin,
  Sprout,
  UsersRound,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import logoGiziDesa from "../../assets/logo-gizidesa.jpeg";
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
            className="admin-brand-block gizidesa-brand-block"
            onClick={() => navigate("/kader/dashboard")}
        >
            <div className="gizidesa-sidebar-logo">
            <img src={logoGiziDesa} alt="Logo GiziDesa" />
            </div>

            <div className="gizidesa-sidebar-title">
            <strong>Kader Desa</strong>
            <small>Pencatatan data lapangan</small>
            </div>
        </button>

        <nav className="admin-menu" aria-label="Menu Kader">
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

        <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
        >
            <LogOut size={18} />
            <span>Keluar</span>
        </button>
        </aside>
    );
}

export default KaderSidebar;