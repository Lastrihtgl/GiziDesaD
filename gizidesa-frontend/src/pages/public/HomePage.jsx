import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  HeartPulse,
  LineChart,
  MapPin,
  Menu,
  ShieldCheck,
  Sprout,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoGiziDesa from "../../assets/logo-gizidesa.jpeg";
import "../../styles/public.css";

function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Beranda", target: "beranda" },
    { label: "Masalah", target: "masalah" },
    { label: "Fitur", target: "fitur" },
    { label: "Pengguna", target: "pengguna" },
  ];

  const problemItems = [
    {
      icon: ClipboardList,
      title: "Data risiko belum terpusat",
      description:
        "Data lapangan sering tersebar sehingga sulit digunakan sebagai dasar keputusan desa.",
    },
    {
      icon: MapPin,
      title: "Prioritas wilayah belum jelas",
      description:
        "Desa membutuhkan pemetaan risiko per RT/dusun agar tindak lanjut lebih terarah.",
    },
    {
      icon: LineChart,
      title: "Tindak lanjut sulit dipantau",
      description:
        "Intervensi perlu dicatat agar progres pemantauan dapat dilihat kembali.",
    },
  ];

  const featureItems = [
    {
      icon: ClipboardList,
      title: "Input Data Risiko",
      description:
        "Kader mencatat indikator risiko berdasarkan kondisi RT/dusun.",
    },
    {
      icon: BarChart3,
      title: "Kalkulator IRS",
      description:
        "Sistem menghitung skor dan kategori risiko secara otomatis.",
    },
    {
      icon: MapPin,
      title: "Peta Risiko",
      description:
        "Wilayah prioritas ditampilkan berdasarkan kategori rendah, sedang, dan tinggi.",
    },
    {
      icon: HeartPulse,
      title: "Tracking Intervensi",
      description:
        "Tindak lanjut dapat dicatat dan dipantau kembali oleh pihak terkait.",
    },
  ];

  const userItems = [
    {
      icon: UsersRound,
      title: "Kader Posyandu",
      description:
        "Menginput data risiko dan melihat panduan edukasi pangan lokal.",
    },
    {
      icon: HeartPulse,
      title: "Bidan Desa",
      description:
        "Memantau data kesehatan, membaca prioritas, dan mencatat tindak lanjut.",
    },
    {
      icon: ShieldCheck,
      title: "Admin Desa",
      description:
        "Mengelola wilayah, pengguna, data risiko, rekomendasi, dan laporan.",
    },
  ];

  function scrollToSection(target) {
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMenuOpen(false);
  }

  return (
    <div className="public-page">
      <header className="public-navbar">
        <button
          type="button"
          className="public-brand"
          onClick={() => scrollToSection("beranda")}
        >
          <img src={logoGiziDesa} alt="Logo GiziDesa" />
          <span>GiziDesa</span>
        </button>

        <nav className={isMenuOpen ? "public-nav open" : "public-nav"}>
          {navItems.map((item) => (
            <button
              type="button"
              key={item.target}
              onClick={() => scrollToSection(item.target)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="public-navbar-actions">
          <button
            type="button"
            className="public-login-button"
            onClick={() => navigate("/login")}
          >
            Masuk
          </button>

          <button
            type="button"
            className="public-menu-button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="Buka menu"
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main>
        <section className="public-hero" id="beranda">
          <div className="public-container public-hero-grid">
            <div className="public-hero-content">
              <span className="public-eyebrow">
                Platform Kesehatan Berbasis Desa
              </span>

              <h1>Deteksi Dini Risiko Stunting Berbasis Data Desa</h1>

              <p>
                GiziDesa membantu desa memetakan risiko stunting per RT/dusun,
                menghitung Indeks Risiko Stunting, dan menentukan prioritas
                tindak lanjut berdasarkan data lapangan.
              </p>

              <div className="public-hero-actions">
                <button
                  type="button"
                  className="public-primary-button"
                  onClick={() => navigate("/login")}
                >
                  Masuk ke Sistem
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  className="public-secondary-button"
                  onClick={() => scrollToSection("fitur")}
                >
                  Lihat Fitur
                </button>
              </div>

              <div className="public-hero-note">
                <ShieldCheck size={18} />
                <span>
                  Sistem ini membantu pengambilan keputusan desa. Hasil risiko
                  bukan diagnosis medis, tetapi dasar prioritas pemantauan.
                </span>
              </div>
            </div>

            <div className="public-dashboard-card">
              <div className="public-dashboard-header">
                <div>
                  <span>Dashboard Prioritas</span>
                  <h2>Peta Risiko RT/Dusun</h2>
                </div>
                <MapPin size={28} />
              </div>

              <div className="public-risk-list">
                <div className="low">
                  <strong>Rendah</strong>
                  <span>2 Wilayah</span>
                </div>
                <div className="medium">
                  <strong>Sedang</strong>
                  <span>3 Wilayah</span>
                </div>
                <div className="high">
                  <strong>Tinggi</strong>
                  <span>1 Wilayah</span>
                </div>
              </div>

              <div className="public-factor-box">
                <small>Faktor dominan</small>
                <strong>Sanitasi dan akses layanan</strong>
                <p>
                  Direkomendasikan edukasi PHBS dan kunjungan pendampingan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="public-section" id="masalah">
          <div className="public-container">
            <div className="public-section-header">
              <span>Masalah</span>
              <h2>Mengapa GiziDesa dibutuhkan?</h2>
              <p>
                GiziDesa dirancang untuk membantu desa membaca data risiko
                stunting secara lebih terarah dan mudah dipantau.
              </p>
            </div>

            <div className="public-card-grid three">
              {problemItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article className="public-info-card" key={item.title}>
                    <div className="public-card-icon warning">
                      <Icon size={23} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="public-section soft" id="fitur">
          <div className="public-container">
            <div className="public-section-header">
              <span>Fitur</span>
              <h2>Fitur utama GiziDesa</h2>
              <p>
                Fitur GiziDesa membantu data lapangan berubah menjadi informasi
                prioritas yang mudah dibaca oleh kader, bidan, dan admin desa.
              </p>
            </div>

            <div className="public-card-grid four">
              {featureItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article className="public-info-card compact" key={item.title}>
                    <div className="public-card-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>

            <div className="public-flow-card">
              <span>Alur Singkat</span>
              <div>
                <strong>Kader input data</strong>
                <ArrowRight size={17} />
                <strong>Sistem hitung IRS</strong>
                <ArrowRight size={17} />
                <strong>Bidan membaca prioritas</strong>
                <ArrowRight size={17} />
                <strong>Admin memantau laporan</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="public-section" id="pengguna">
          <div className="public-container">
            <div className="public-section-header">
              <span>Pengguna</span>
              <h2>Digunakan sesuai peran di desa</h2>
              <p>
                Setiap pengguna hanya melihat fungsi yang relevan dengan tugasnya
                sehingga sistem lebih mudah digunakan.
              </p>
            </div>

            <div className="public-card-grid three">
              {userItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article className="public-user-card" key={item.title}>
                    <Icon size={30} />
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="public-cta-section">
          <div className="public-container">
            <div className="public-cta-card">
              <div>
                <span>Mulai Gunakan</span>
                <h2>Siap menggunakan GiziDesa?</h2>
                <p>
                  Masuk sebagai admin, kader, atau bidan untuk mulai mengelola
                  data risiko dan tindak lanjut wilayah.
                </p>
              </div>

              <button
                type="button"
                className="public-primary-button"
                onClick={() => navigate("/login")}
              >
                Masuk ke Sistem
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="public-container public-footer-grid">
          <div className="public-footer-brand">
            <div>
              <img src={logoGiziDesa} alt="Logo GiziDesa" />
              <strong>GiziDesa</strong>
            </div>
            <p>
              Platform pendukung pemetaan risiko stunting berbasis data desa.
            </p>
          </div>

          <div>
            <strong>Fitur</strong>
            <span>Input Data Risiko</span>
            <span>Kalkulator IRS</span>
            <span>Peta Risiko</span>
            <span>Tracking Intervensi</span>
          </div>

          <div>
            <strong>Pengguna</strong>
            <span>Kader Posyandu</span>
            <span>Bidan Desa</span>
            <span>Admin Desa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;