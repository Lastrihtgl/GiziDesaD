import {
  ArrowRight,
  BarChart3,
  Calculator,
  FileText,
  MapPin,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../../api/dashboardApi";
import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/ErrorAlert";
import LoadingState from "../../components/common/LoadingState";
import RiskBadge from "../../components/dashboard/RiskBadge";
import AdminLayout from "../../layouts/AdminLayout";
import {
  formatFactorLabel,
  formatNumber,
  formatStatusLabel,
} from "../../utils/formatters";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getDashboardSummary();
        setDashboard(data);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Dashboard gagal dimuat. Pastikan backend aktif dan akun admin sudah login."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const summary = dashboard?.summary || {};
  const wilayahPrioritas = dashboard?.wilayah_prioritas || [];
  const intervensiTerbaru = dashboard?.intervensi_terbaru || [];

  const intervensiAktif = useMemo(() => {
    return Number(summary.intervensi_direncanakan || 0) + Number(summary.intervensi_berjalan || 0);
  }, [summary]);

  const totalRisiko = useMemo(() => {
    return (
      Number(summary.risiko_rendah || 0) +
      Number(summary.risiko_sedang || 0) +
      Number(summary.risiko_tinggi || 0)
    );
  }, [summary]);

  const risikoTinggiPercent = useMemo(() => {
    if (!totalRisiko) {
      return 0;
    }

    return Math.round((Number(summary.risiko_tinggi || 0) / totalRisiko) * 100);
  }, [summary, totalRisiko]);

  const statusIntervensi = [
    {
      label: "Direncanakan",
      value: Number(summary.intervensi_direncanakan || 0),
      total: Number(summary.total_intervensi || 0),
    },
    {
      label: "Berjalan",
      value: Number(summary.intervensi_berjalan || 0),
      total: Number(summary.total_intervensi || 0),
    },
    {
      label: "Selesai",
      value: Number(summary.intervensi_selesai || 0),
      total: Number(summary.total_intervensi || 0),
    },
    {
      label: "Dibatalkan",
      value: Number(summary.intervensi_dibatalkan || 0),
      total: Number(summary.total_intervensi || 0),
    },
  ];

  const shortcutItems = [
    {
      title: "Peta Risiko",
      subtitle: "Visualisasi wilayah",
      icon: MapPin,
      path: "/admin/peta-risiko",
      tone: "green",
    },
    {
      title: "Hitung IRS",
      subtitle: "Data risiko wilayah",
      icon: Calculator,
      path: "/admin/data-risiko",
      tone: "yellow",
    },
    {
      title: "Laporan",
      subtitle: "Rekap program",
      icon: FileText,
      path: "/admin/laporan",
      tone: "soft-green",
    },
    {
      title: "Kelola Tim",
      subtitle: "Akun pengguna",
      icon: UsersRound,
      path: "/admin/tim",
      tone: "teal",
    },
  ];

  if (loading) {
    return (
      <AdminLayout
        title="Dashboard Admin Desa"
        subtitle="Memuat ringkasan data wilayah dan risiko."
      >
        <LoadingState
          title="Memuat Dashboard Admin"
          message="Sistem sedang mengambil data terbaru dari backend."
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard Admin Desa"
      subtitle="Monitoring dan pengelolaan program stunting"
    >
      <ErrorAlert message={errorMessage} />

      <section className="admin-overview-grid">
        <article className="admin-metric-card">
          <span>Total Wilayah</span>
          <strong>{formatNumber(summary.total_wilayah)}</strong>
          <p>RT/Dusun terdaftar</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Risiko Tinggi</span>
          <strong>{formatNumber(summary.risiko_tinggi)}</strong>
          <p>Wilayah perlu prioritas</p>
        </article>

        <article className="admin-metric-card success">
          <span>Intervensi Aktif</span>
          <strong>{formatNumber(intervensiAktif)}</strong>
          <p>Direncanakan dan berjalan</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Proporsi Risiko Tinggi</span>
          <strong>
            {risikoTinggiPercent}
            <small>%</small>
          </strong>
          <p>Dari seluruh data risiko</p>
        </article>
      </section>

      <section className="admin-shortcut-grid">
        {shortcutItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              className={`admin-shortcut-card ${item.tone}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={38} />
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </button>
          );
        })}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-priority-panel">
          <div className="admin-panel-header">
            <div>
              <span>Prioritas</span>
              <h2>Wilayah Prioritas Berdasarkan IRS</h2>
              <p>Wilayah dengan skor IRS tertinggi perlu dipantau lebih dahulu.</p>
            </div>

            <button type="button" onClick={() => navigate("/admin/data-risiko")}>
              Lihat semua
              <ArrowRight size={16} />
            </button>
          </div>

          {wilayahPrioritas.length === 0 ? (
            <EmptyState
              title="Belum ada wilayah prioritas"
              message="Data akan tampil setelah kader menginput data risiko."
            />
          ) : (
            <div className="priority-list">
              {wilayahPrioritas.slice(0, 5).map((item, index) => (
                <div key={item.id} className="priority-item">
                  <div className="priority-rank">#{index + 1}</div>

                  <div className="priority-content">
                    <strong>
                      {item.wilayah?.nama_rt || "RT"} {item.wilayah?.nama_dusun || ""}
                    </strong>
                    <span>
                      Faktor dominan: {formatFactorLabel(item.faktor_dominan)}
                    </span>
                  </div>

                  <div className="priority-score">
                    <strong>{item.skor_irs}</strong>
                    <span>Skor IRS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Analitik</span>
              <h2>Distribusi Risiko</h2>
              <p>Kategori IRS dari data risiko yang sudah masuk.</p>
            </div>
          </div>

          <div className="risk-distribution">
            <div className="risk-row low">
              <div>
                <strong>Rendah</strong>
                <span>{formatNumber(summary.risiko_rendah)} wilayah</span>
              </div>
              <RiskBadge value="rendah" />
            </div>

            <div className="risk-row medium">
              <div>
                <strong>Sedang</strong>
                <span>{formatNumber(summary.risiko_sedang)} wilayah</span>
              </div>
              <RiskBadge value="sedang" />
            </div>

            <div className="risk-row high">
              <div>
                <strong>Tinggi</strong>
                <span>{formatNumber(summary.risiko_tinggi)} wilayah</span>
              </div>
              <RiskBadge value="tinggi" />
            </div>
          </div>
        </article>
      </section>

      <section className="admin-dashboard-grid bottom">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Tracking</span>
              <h2>Status Intervensi</h2>
              <p>Pemantauan tindak lanjut berdasarkan status pelaksanaan.</p>
            </div>

            <button type="button" onClick={() => navigate("/admin/intervensi")}>
              Detail
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="intervention-progress-list">
            {statusIntervensi.map((item) => {
              const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;

              return (
                <div key={item.label} className="intervention-progress-item">
                  <div className="intervention-progress-label">
                    <strong>{item.label}</strong>
                    <span>
                      {formatNumber(item.value)} dari {formatNumber(item.total)}
                    </span>
                  </div>

                  <div className="progress-track">
                    <div style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Aktivitas</span>
              <h2>Intervensi Terbaru</h2>
              <p>Daftar tindak lanjut terakhir yang tercatat.</p>
            </div>
          </div>

          {intervensiTerbaru.length === 0 ? (
            <EmptyState
              title="Belum ada intervensi"
              message="Intervensi akan muncul setelah admin atau bidan mencatat tindak lanjut."
            />
          ) : (
            <div className="recent-intervention-list">
              {intervensiTerbaru.slice(0, 4).map((item) => (
                <div key={item.id} className="recent-intervention-item">
                  <span className="recent-icon">
                    <BarChart3 size={18} />
                  </span>

                  <div>
                    <strong>{item.judul}</strong>
                    <p>
                      {item.wilayah?.nama_dusun} - {item.wilayah?.nama_rt}
                    </p>
                    <small>
                      {formatStatusLabel(item.status)} · Prioritas {item.prioritas}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;