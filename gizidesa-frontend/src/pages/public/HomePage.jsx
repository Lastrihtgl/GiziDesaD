import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Leaf,
  MapPin,
  ShieldCheck,
  Sprout,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";

function HomePage() {
  const navigate = useNavigate();

  const highlights = [
    {
      value: "6",
      label: "Indikator Risiko",
      description: "Sanitasi, air bersih, ibu hamil, ekonomi, akses layanan, dan pangan lokal.",
    },
    {
      value: "IRS",
      label: "Skor Otomatis",
      description: "Data risiko dihitung menjadi kategori rendah, sedang, atau tinggi.",
    },
    {
      value: "3",
      label: "Peran Pengguna",
      description: "Kader, bidan, dan admin desa bekerja sesuai fungsi masing-masing.",
    },
    {
      value: "RT",
      label: "Prioritas Wilayah",
      description: "Risiko dipetakan per RT/dusun agar tindak lanjut lebih terarah.",
    },
  ];

  const features = [
    {
      icon: ClipboardList,
      title: "Input Data Risiko",
      text: "Kader mengisi data indikator risiko per wilayah dengan form sederhana dan terstruktur.",
    },
    {
      icon: BarChart3,
      title: "Kalkulator IRS",
      text: "Sistem menghitung skor risiko dan menampilkan kategori wilayah secara otomatis.",
    },
    {
      icon: HeartPulse,
      title: "Tracking Intervensi",
      text: "Bidan dan admin dapat mencatat tindak lanjut terhadap wilayah prioritas.",
    },
  ];

  const roles = [
    {
      icon: UsersRound,
      title: "Kader Posyandu",
      text: "Mengumpulkan data lapangan dan melihat panduan edukasi pangan lokal.",
    },
    {
      icon: HeartPulse,
      title: "Bidan Desa",
      text: "Membaca risiko wilayah dan mencatat pendampingan atau kunjungan lanjutan.",
    },
    {
      icon: ShieldCheck,
      title: "Admin Desa",
      text: "Mengelola wilayah, referensi pangan lokal, intervensi, dan laporan.",
    },
  ];

  return (
    <PublicLayout>
      <section className="home-hero-section">
        <div className="home-hero-content">
          <span className="public-badge">
            <Leaf size={15} />
            Platform Kesehatan Berbasis Desa
          </span>

          <h1>
            Deteksi Dini Risiko Stunting Berbasis <span>Data Desa</span>
          </h1>

          <p>
            GiziDesa membantu kader posyandu, bidan desa, dan perangkat desa
            memetakan risiko stunting per RT/dusun, menghitung Indeks Risiko
            Stunting, serta mencatat tindak lanjut intervensi berbasis faktor
            risiko dominan.
          </p>

          <div className="home-hero-actions">
            <button className="primary-action" onClick={() => navigate("/login")}>
              Masuk ke Sistem
              <ArrowRight size={18} />
            </button>

            <button className="secondary-action" onClick={() => navigate("/fitur")}>
              Lihat Fitur
            </button>
          </div>

          <div className="home-hero-note">
            <CheckCircle2 size={18} />
            <span>
              Sistem ini mendukung pengambilan keputusan desa. Hasil risiko bukan
              diagnosis medis, tetapi dasar prioritas pemantauan.
            </span>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="risk-card">
            <div className="risk-card-header">
              <div>
                <span>Dashboard Prioritas</span>
                <h3>Peta Risiko RT/Dusun</h3>
              </div>
              <MapPin size={28} />
            </div>

            <div className="risk-level-grid">
              <div className="risk-level low">
                <strong>Rendah</strong>
                <span>2 Wilayah</span>
              </div>
              <div className="risk-level medium">
                <strong>Sedang</strong>
                <span>3 Wilayah</span>
              </div>
              <div className="risk-level high">
                <strong>Tinggi</strong>
                <span>1 Wilayah</span>
              </div>
            </div>

            <div className="risk-priority-box">
              <span>Faktor dominan</span>
              <strong>Sanitasi dan akses layanan</strong>
              <p>Direkomendasikan edukasi PHBS dan kunjungan pendampingan.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-highlight-section">
        {highlights.map((item) => (
          <article key={item.label} className="highlight-card">
            <strong>{item.value}</strong>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="public-section">
        <div className="public-section-header">
          <span>Fitur Utama</span>
          <h2>Sederhana untuk digunakan, cukup kuat untuk membantu keputusan desa</h2>
          <p>
            GiziDesa tidak menumpuk proses teknis di pengguna. Sistem membantu
            mengubah data lapangan menjadi prioritas wilayah yang mudah dibaca.
          </p>
        </div>

        <div className="home-feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="home-feature-card">
                <div className="feature-icon">
                  <Icon size={26} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="public-section compact">
        <div className="public-section-header">
          <span>Pengguna Sistem</span>
          <h2>Dirancang sesuai peran kerja di desa</h2>
          <p>
            Setiap pengguna hanya melihat fungsi yang relevan dengan tugasnya,
            sehingga sistem lebih mudah dipelajari dan digunakan.
          </p>
        </div>

        <div className="home-role-grid">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <article key={role.title} className="home-role-card">
                <Icon size={28} />
                <h3>{role.title}</h3>
                <p>{role.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-flow-section">
        <div className="public-section-header light">
          <span>Alur Kerja</span>
          <h2>Dari data lapangan menjadi tindak lanjut</h2>
        </div>

        <div className="flow-line">
          <div>
            <strong>1</strong>
            <span>Input Data</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Hitung IRS</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Lihat Prioritas</span>
          </div>
          <div>
            <strong>4</strong>
            <span>Catat Intervensi</span>
          </div>
        </div>
      </section>

      <section className="home-cta-section">
        <div>
          <span>Mulai Gunakan</span>
          <h2>Siap memetakan risiko stunting berbasis data desa?</h2>
          <p>
            Masuk sebagai admin, kader, atau bidan untuk mulai menggunakan
            sistem sesuai peran masing-masing.
          </p>
        </div>

        <button className="primary-action" onClick={() => navigate("/login")}>
          Masuk ke Sistem
          <ArrowRight size={18} />
        </button>
      </section>
    </PublicLayout>
  );
}

export default HomePage;