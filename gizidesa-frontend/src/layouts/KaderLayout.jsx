import { Bell } from "lucide-react";
import KaderSidebar from "../components/kader/KaderSidebar";
import "../styles/kader.css";

function KaderLayout({ title, subtitle, children }) {
  return (
    <div className="admin-layout">
      <KaderSidebar />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <button type="button" className="admin-notification-button">
            <Bell size={19} />
            <span />
          </button>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

export default KaderLayout;