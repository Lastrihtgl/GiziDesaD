import { Bell, Search, UserRound } from "lucide-react";
import { getAuthUser } from "../../utils/authStorage";

function AdminTopbar({ title = "Dashboard Admin Desa", subtitle }) {
  const user = getAuthUser();

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <h1>{title}</h1>
        <p>{subtitle || "Monitoring dan pengelolaan program stunting berbasis data desa."}</p>
      </div>

      <div className="admin-topbar-actions">
        <div className="admin-search-box">
          <Search size={17} />
          <input type="text" placeholder="Cari data..." />
        </div>

        <button type="button" className="admin-icon-button">
          <Bell size={19} />
          <span />
        </button>

        <div className="admin-user-profile">
          <div>
            <strong>{user?.name || "Admin Desa"}</strong>
            <small>{user?.role || "admin_desa"}</small>
          </div>

          <span>
            <UserRound size={18} />
          </span>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;