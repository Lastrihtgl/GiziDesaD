

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
    </header>
  );
}

export default AdminTopbar;