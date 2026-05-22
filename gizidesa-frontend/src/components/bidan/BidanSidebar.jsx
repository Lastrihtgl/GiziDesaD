import {
    ClipboardCheck,
    FileCheck2,
    HeartPulse,
    Home,
    LogOut,
    MapPin,
    Salad,
    Stethoscope,
    TrendingUp,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import logoGiziDesa from "../../assets/logo-gizidesa.jpeg";
import { clearAuthData } from "../../utils/authStorage";

function BidanSidebar() {
    const navigate = useNavigate();
    
    const menuItems = [
        {
        label: "Dashboard",
        path: "/bidan/dashboard",
        icon: Home,
        },
        {
        label: "Validasi Data",
        path: "/bidan/validasi-data",
        icon: FileCheck2,
        },
        {
        label: "Monitor ANC",
        path: "/bidan/monitor-anc",
        icon: HeartPulse,
        },
        {
        label: "Rekomendasi",
        path: "/bidan/rekomendasi",
        icon: ClipboardCheck,
        },
        {
        label: "Tindak Lanjut",
        path: "/bidan/tindak-lanjut",
        icon: Stethoscope,
        },
        {
        label: "Peta Risiko",
        path: "/bidan/peta-risiko",
        icon: MapPin,
        },
        {
        label: "Pangan Lokal",
        path: "/bidan/pangan-lokal",
        icon: Salad,
        },
        {
        label: "Tracking",
        path: "/bidan/tracking",
        icon: TrendingUp,
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
            onClick={() => navigate("/bidan/dashboard")}
        >
            <div className="gizidesa-sidebar-logo">
            <img src={logoGiziDesa} alt="Logo GiziDesa" />
            </div>

            <div className="gizidesa-sidebar-title">
            <strong>Bidan Desa</strong>
            <small>Monitoring kesehatan wilayah</small>
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

export default BidanSidebar;