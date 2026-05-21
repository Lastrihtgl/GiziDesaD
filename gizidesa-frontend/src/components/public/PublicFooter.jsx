import { Leaf } from "lucide-react";

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-main">
        <div>
          <div className="public-footer-brand">
            <span>
              <Leaf size={20} />
            </span>
            <strong>GiziDesa</strong>
          </div>

          <p>
            Platform pendukung pemetaan risiko stunting berbasis data desa,
            indikator komunitas, dan pangan lokal.
          </p>

          <small>
            GiziDesa berfungsi sebagai sistem pendukung keputusan, bukan alat
            diagnosis medis.
          </small>
        </div>

        <div>
          <h4>Fitur</h4>
          <span>Input Data Risiko</span>
          <span>Kalkulator IRS</span>
          <span>Dashboard Prioritas</span>
          <span>Tracking Intervensi</span>
        </div>

        <div>
          <h4>Pengguna</h4>
          <span>Kader Posyandu</span>
          <span>Bidan Desa</span>
          <span>Admin Desa</span>
        </div>

        <div>
          <h4>Fokus</h4>
          <span>Risiko Stunting</span>
          <span>RT/Dusun</span>
          <span>Pangan Lokal</span>
          <span>Laporan Desa</span>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;