import { BarChart3, ClipboardList, FileText, MapPin, Sprout, TrendingUp } from "lucide-react";
import PublicLayout from "../../layouts/PublicLayout";

function FiturPage() {
  const features = [
    {
      icon: MapPin,
      title: "Kelola Wilayah",
      text: "Admin mengelola data dusun dan RT sebagai unit dasar pemetaan risiko.",
    },
    {
      icon: ClipboardList,
      title: "Input Data Risiko",
      text: "Kader mencatat enam indikator risiko stunting dalam form yang sederhana.",
    },
    {
      icon: BarChart3,
      title: "Kalkulator IRS",
      text: "Sistem menghitung skor dan kategori risiko secara otomatis.",
    },
    {
      icon: Sprout,
      title: "Pangan Lokal",
      text: "Admin mengelola referensi pangan lokal untuk edukasi komunitas.",
    },
    {
      icon: TrendingUp,
      title: "Intervensi",
      text: "Bidan dan admin mencatat tindak lanjut pada wilayah prioritas.",
    },
    {
      icon: FileText,
      title: "Laporan",
      text: "Admin melihat rekap data risiko, intervensi, dan status program desa.",
    },
  ];

  return (
    <PublicLayout>
      <section className="public-detail-page">
        <div className="public-section-header">
          <span>Fitur</span>
          <h1>Fitur utama GiziDesa</h1>
          <p>
            Fitur disusun berdasarkan kebutuhan kerja kader, bidan, dan admin
            desa agar data lapangan dapat berubah menjadi tindak lanjut.
          </p>
        </div>

        <div className="detail-card-grid three">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="detail-card">
                <div className="detail-icon">
                  <Icon size={25} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}

export default FiturPage;