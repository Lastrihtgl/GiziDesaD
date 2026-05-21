import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  HeartPulse,
  MapPin,
  Stethoscope,
} from "lucide-react";
import BidanLayout from "../../layouts/BidanLayout";
import {
  getAncData,
  getTindakLanjutData,
  getValidasiData,
  rekomendasiBidan,
} from "../../utils/bidanStorage";

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

function BidanDashboard() {
  const validasiData = getValidasiData();
  const ancData = getAncData();
  const tindakLanjut = getTindakLanjutData();

  const totalKek = ancData.filter((item) => item.status_kek === "kek").length;
  const totalAncTidakRutin = ancData.filter(
    (item) => item.anc_status === "tidak_rutin"
  ).length;
  const totalTindakSelesai = tindakLanjut.filter(
    (item) => item.status === "selesai"
  ).length;
  const prioritas = ancData.filter((item) => item.prioritas !== "rendah");

  return (
    <BidanLayout
      title="Dashboard Bidan"
      subtitle="Memantau kondisi ibu hamil, ANC, KEK, dan tindak lanjut kesehatan wilayah."
    >
      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Data Validasi</span>
          <strong>{formatNumber(validasiData.length)}</strong>
          <p>Data sasaran masuk</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Ibu Hamil KEK</span>
          <strong>{formatNumber(totalKek)}</strong>
          <p>Perlu perhatian gizi</p>
        </article>

        <article className="admin-metric-card trend">
          <span>ANC Tidak Rutin</span>
          <strong>{formatNumber(totalAncTidakRutin)}</strong>
          <p>Butuh pemantauan</p>
        </article>

        <article className="admin-metric-card success">
          <span>Intervensi Selesai</span>
          <strong>{formatNumber(totalTindakSelesai)}</strong>
          <p>Dari {formatNumber(tindakLanjut.length)} tindak lanjut</p>
        </article>
      </section>

      <section className="admin-panel bidan-hero-card">
        <div className="bidan-hero-content">
          <div>
            <span>Fokus Bidan Desa</span>
            <h2>Pemantauan Kesehatan Ibu dan Sasaran Risiko</h2>
            <p>
              Halaman bidan membantu membaca data risiko, memvalidasi sasaran,
              memantau ANC, serta mencatat tindak lanjut kesehatan di wilayah
              prioritas.
            </p>
          </div>

          <div className="bidan-hero-summary">
            <HeartPulse size={22} />
            <div>
              <strong>{formatNumber(prioritas.length)} Sasaran Prioritas</strong>
              <p>
                Sasaran dengan KEK, ANC tidak rutin, atau wilayah risiko perlu
                dipantau lebih awal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bidan-grid-2">
        <article className="admin-panel">
          <div className="bidan-section-heading">
            <span>Prioritas Hari Ini</span>
            <h2>Sasaran Perlu Pemantauan</h2>
            <p>Daftar sasaran yang perlu diperhatikan oleh bidan desa.</p>
          </div>

          <div className="bidan-list">
            {prioritas.map((item) => (
              <div className="bidan-list-item" key={item.id}>
                <div className={`bidan-icon ${item.prioritas}`}>
                  <AlertTriangle size={18} />
                </div>

                <div>
                  <strong>{item.nama}</strong>
                  <small>
                    {item.wilayah} · LILA {item.lila} cm ·{" "}
                    {item.anc_status === "tidak_rutin"
                      ? "ANC tidak rutin"
                      : "ANC rutin"}
                  </small>
                </div>

                <b>{item.prioritas}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="bidan-section-heading">
            <span>Rekomendasi Awal</span>
            <h2>Arah Tindak Lanjut</h2>
            <p>Rekomendasi berbasis faktor dominan risiko wilayah.</p>
          </div>

          <div className="bidan-list">
            {rekomendasiBidan.slice(0, 3).map((item) => (
              <div className="bidan-list-item" key={item.id}>
                <div className={`bidan-icon ${item.prioritas}`}>
                  <MapPin size={18} />
                </div>

                <div>
                  <strong>{item.wilayah}</strong>
                  <small>{item.faktor}</small>
                </div>

                <b>{item.prioritas}</b>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="bidan-grid-3">
        <article className="bidan-mini-card">
          <CalendarCheck size={20} />
          <strong>Validasi Data</strong>
          <p>Periksa data sasaran dari kader sebelum tindak lanjut.</p>
        </article>

        <article className="bidan-mini-card">
          <Stethoscope size={20} />
          <strong>Tindak Lanjut</strong>
          <p>Catat kunjungan, edukasi, rujukan, atau hasil pemantauan.</p>
        </article>

        <article className="bidan-mini-card">
          <CheckCircle2 size={20} />
          <strong>Tracking</strong>
          <p>Pantau progres intervensi sampai status selesai.</p>
        </article>
      </section>
    </BidanLayout>
  );
}

export default BidanDashboard;