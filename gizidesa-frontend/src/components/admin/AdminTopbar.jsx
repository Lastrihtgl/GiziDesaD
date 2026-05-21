import { Bell } from "lucide-react";

function AdminTopbar({ title = "Dashboard Admin Desa", subtitle }) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <h1>{title}</h1>
        <p>
          {subtitle ||
            "Monitoring dan pengelolaan program stunting berbasis data desa."}
        </p>
      </div>

      <div className="admin-topbar-actions">
        <button type="button" className="admin-icon-button" aria-label="Notifikasi">
          <Bell size={19} />
          <span />
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;