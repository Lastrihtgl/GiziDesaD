import PublicFooter from "../components/public/PublicFooter";
import PublicNavbar from "../components/public/PublicNavbar";

function PublicLayout({ children }) {
  return (
    <div className="public-page">
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}

export default PublicLayout;