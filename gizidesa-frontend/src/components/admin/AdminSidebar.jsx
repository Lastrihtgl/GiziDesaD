import {
    BarChart3,
    Calculator,
    FileText,
    LayoutDashboard,
    Lightbulb,
    LogOut,
    MapPin,
    Sprout,
    TrendingUp,
    UsersRound,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import logoGiziDesa from "../../assets/logo-gizidesa.jpeg";
import { clearAuthData } from "../../utils/authStorage";

function AdminSidebar() {
    const navigate = useNavigate();
    
    const menuItems = [
        {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
        },
        {
        label: "Analitik Desa",
        path: "/admin/analitik",
        icon: TrendingUp,
        },
        {
        label: "Kelola Tim",
        path: "/admin/tim",
        icon: UsersRound,
        },
        {
        label: "Wilayah",
        path: "/admin/wilayah",
        icon: MapPin,
        },
        {
        label: "Data Risiko & IRS",
        path: "/admin/data-risiko",
        icon: Calculator,
        },
        {
        label: "Rekomendasi",
        path: "/admin/rekomendasi",
        icon: Lightbulb,
        },
        {
        label: "Peta Risiko",
        path: "/admin/peta-risiko",
        icon: MapPin,
        },
        {
        label: "Pangan Lokal",
        path: "/admin/pangan",
        icon: Sprout,
        },
        {
        label: "Tracking Intervensi",
        path: "/admin/intervensi",
        icon: BarChart3,
        },
        {
        label: "Laporan",
        path: "/admin/laporan",
        icon: FileText,
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
            onClick={() => navigate("/admin/dashboard")}
        >
            <div className="gizidesa-sidebar-logo">
            <img src={logoGiziDesa} alt="Logo GiziDesa" />
            </div>

            <div className="gizidesa-sidebar-title">
            <strong>Admin Desa</strong>
            <small>Pengelolaan data GiziDesa</small>
            </div>
        </button>

        <nav className="admin-menu" aria-label="Menu Admin">
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

export default AdminSidebar;