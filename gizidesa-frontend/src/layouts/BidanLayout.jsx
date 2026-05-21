import BidanSidebar from "../components/bidan/BidanSidebar";
import "../styles/bidan.css";

function BidanLayout({ title, subtitle, children }) {
  return (
    <div className="admin-layout">
      <BidanSidebar />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

export default BidanLayout;