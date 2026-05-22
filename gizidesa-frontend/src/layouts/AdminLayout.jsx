import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

function AdminLayout({ children, title, subtitle }) {
    return (
    <div className="admin-layout">
        <AdminSidebar />
        
        <div className="admin-main">
            <AdminTopbar title={title} subtitle={subtitle} />
            <main className="admin-content">{children}</main>
        </div>
    </div>
    );
}

export default AdminLayout;