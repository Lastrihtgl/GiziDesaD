import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function PublicNavbar() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const navItems = [
        { label: "Beranda", path: "/" },
        { label: "Masalah", path: "/masalah" },
        { label: "Fitur", path: "/fitur" },
        { label: "Pengguna", path: "/pengguna" },
        { label: "Alur Kerja", path: "/alur-kerja" },
        { label: "SDGs", path: "/sdgs" },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setOpen(false);
    };

    return (
        <header className="public-navbar">
        <button className="public-brand" onClick={() => handleNavigate("/")}>
            <span className="public-brand-icon">
            <Leaf size={22} />
            </span>
            <span>GiziDesa</span>
        </button>

        <nav className="public-nav-links">
            {navItems.map((item) => (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                isActive ? "public-nav-link active" : "public-nav-link"
                }
            >
                {item.label}
            </NavLink>
            ))}
        </nav>

        <div className="public-nav-actions">
            <button className="public-login-button" onClick={() => navigate("/login")}>
            Masuk
            </button>

            <button className="public-menu-button" onClick={() => setOpen((prev) => !prev)}>
            {open ? <X size={22} /> : <Menu size={22} />}
            </button>
        </div>

        {open && (
            <div className="public-mobile-menu">
            {navItems.map((item) => (
                <button key={item.path} onClick={() => handleNavigate(item.path)}>
                {item.label}
                </button>
            ))}

            <button className="mobile-login" onClick={() => handleNavigate("/login")}>
                Masuk ke Sistem
            </button>
            </div>
        )}
        </header>
    );
}

export default PublicNavbar;