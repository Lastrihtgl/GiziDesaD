import {
  AlertTriangle,
  ClipboardList,
  MapPin,
  Sprout,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDataRisikoList } from "../../api/dataRisikoApi";
import KaderLayout from "../../layouts/KaderLayout";
import { getRtData, getWargaData } from "../../utils/kaderStorage";
import { formatFactorLabel, formatNumber } from "../../utils/formatters";

function normalizeRisiko(item) {
  return {
    ...item,
    wilayah: item.wilayah || {
      nama_dusun: "-",
      nama_rt: "-",
      kode_wilayah: "-",
    },
    skor_irs: Number(item.skor_irs ?? item.irs?.skor_irs ?? 0),
    kategori_risiko:
      item.kategori_risiko ?? item.irs?.kategori_risiko ?? "rendah",
    faktor_dominan: item.faktor_dominan ?? item.irs?.faktor_dominan ?? "",
    periode: item.periode || "",
  };
}

function KaderDashboard() {
  const [rtData, setRtData] = useState([]);
  const [wargaData, setWargaData] = useState([]);
  const [risikoData, setRisikoData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      setRtData(getRtData());
      setWargaData(getWargaData());

      const response = await getDataRisikoList();
      const rawData =
        response.data || response.data_risiko || response.items || response || [];

      setRisikoData(Array.isArray(rawData) ? rawData.map(normalizeRisiko) : []);
    } catch {
      setRisikoData([]);
      setRtData(getRtData());
      setWargaData(getWargaData());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalIbuHamil = useMemo(() => {
    return rtData.reduce(
      (total, item) => total + Number(item.jumlah_ibu_hamil || 0),
      0
    );
  }, [rtData]);

  const totalBalita = useMemo(() => {
    return rtData.reduce(
      (total, item) => total + Number(item.jumlah_balita || 0),
      0
    );
  }, [rtData]);

  const wilayahPerluPantau = useMemo(() => {
    return risikoData
      .filter(
        (item) =>
          item.kategori_risiko === "tinggi" || item.kategori_risiko === "sedang"
      )
      .sort((a, b) => Number(b.skor_irs || 0) - Number(a.skor_irs || 0))
      .slice(0, 4);
  }, [risikoData]);

  const sasaranPerluPantau = useMemo(() => {
    return wargaData
      .filter((item) => item.status_pemantauan === "perlu_dipantau")
      .slice(0, 4);
  }, [wargaData]);

  return (
    <KaderLayout
      title="Dashboard Kader"
      subtitle="Ringkasan tugas lapangan, data warga, wilayah risiko, dan edukasi pangan."
    >
      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Data RT</span>
          <strong>{formatNumber(rtData.length)}</strong>
          <p>Catatan lapangan</p>
        </article>

        <article className="admin-metric-card success">
          <span>Total Warga</span>
          <strong>{formatNumber(wargaData.length)}</strong>
          <p>Sasaran terdata</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Ibu Hamil</span>
          <strong>{formatNumber(totalIbuHamil)}</strong>
          <p>Sasaran pemantauan</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Balita</span>
          <strong>{formatNumber(totalBalita)}</strong>
          <p>Data dari RT</p>
        </article>
      </section>

      <section className="admin-panel kader-hero-card">
        <div className="kader-hero-content">
          <div>
            <span>Peran Kader</span>
            <h2>Pelaksana Pendataan dan Edukasi Lapangan</h2>
            <p>
              Kader bertugas membantu pendataan awal di tingkat RT, memantau
              sasaran warga, melihat wilayah risiko, dan menggunakan referensi
              pangan lokal sebagai bahan edukasi masyarakat.
            </p>
          </div>

          <div className="kader-hero-summary">
            <ClipboardList size={22} />
            <div>
              <strong>Fokus Kerja Lapangan</strong>
              <p>
                Input data RT, pantau warga sasaran, cek peta risiko, dan
                lakukan edukasi pangan lokal sesuai kebutuhan wilayah.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-dashboard-grid bottom">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Pemantauan Wilayah</span>
              <h2>Wilayah Perlu Perhatian</h2>
              <p>
                Daftar ini membantu kader mengetahui dusun/RT yang perlu
                dipantau berdasarkan data risiko yang sudah dikelola sistem.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="kader-simple-state">Memuat wilayah risiko...</div>
          ) : wilayahPerluPantau.length === 0 ? (
            <div className="kader-simple-state">
              Belum ada wilayah risiko sedang atau tinggi.
            </div>
          ) : (
            <div className="kader-task-list">
              {wilayahPerluPantau.map((item) => (
                <div className="kader-task-item" key={item.id}>
                  <span className={`kader-risk-icon ${item.kategori_risiko}`}>
                    <AlertTriangle size={17} />
                  </span>

                  <div>
                    <strong>
                      {item.wilayah?.nama_dusun || "-"} -{" "}
                      {item.wilayah?.nama_rt || "-"}
                    </strong>
                    <small>
                      IRS {Number(item.skor_irs || 0).toFixed(2)} ·{" "}
                      {formatFactorLabel(item.faktor_dominan)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Sasaran Warga</span>
              <h2>Warga Perlu Dipantau</h2>
              <p>
                Data ini membantu kader melihat sasaran yang perlu kunjungan
                atau pemantauan lanjutan.
              </p>
            </div>
          </div>

          {sasaranPerluPantau.length === 0 ? (
            <div className="kader-simple-state">
              Belum ada warga dengan status perlu dipantau.
            </div>
          ) : (
            <div className="kader-task-list">
              {sasaranPerluPantau.map((item) => (
                <div className="kader-task-item" key={item.id}>
                  <span className="kader-risk-icon rendah">
                    <UsersRound size={17} />
                  </span>

                  <div>
                    <strong>{item.nama}</strong>
                    <small>
                      {item.wilayah} · {item.kategori_sasaran.replaceAll("_", " ")}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="admin-dashboard-grid bottom">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Alur Kerja Kader</span>
              <h2>Tugas Utama Kader</h2>
              <p>
                Kader tidak mengubah skor IRS secara langsung. Kader membantu
                mengumpulkan data awal dan menjalankan edukasi lapangan.
              </p>
            </div>
          </div>

          <div className="kader-flow-list">
            <div>
              <ClipboardList size={18} />
              <span>Input data kondisi RT dan catatan lapangan</span>
            </div>
            <div>
              <UsersRound size={18} />
              <span>Pantau warga sasaran seperti ibu hamil dan balita</span>
            </div>
            <div>
              <MapPin size={18} />
              <span>Lihat peta risiko sebagai panduan pemantauan</span>
            </div>
            <div>
              <Sprout size={18} />
              <span>Gunakan pangan lokal untuk edukasi gizi</span>
            </div>
          </div>
        </article>
      </section>
    </KaderLayout>
  );
}

export default KaderDashboard;