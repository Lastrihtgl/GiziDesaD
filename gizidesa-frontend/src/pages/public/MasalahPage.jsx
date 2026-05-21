import { AlertTriangle, Droplets, HeartPulse, Home, Utensils } from "lucide-react";
import PublicLayout from "../../layouts/PublicLayout";

function MasalahPage() {
  const problems = [
    {
      icon: HeartPulse,
      title: "Risiko ibu hamil belum mudah diprioritaskan",
      text: "Data seperti KEK dan kepatuhan ANC perlu dibaca bersama faktor lingkungan dan akses layanan.",
    },
    {
      icon: Droplets,
      title: "Sanitasi dan air bersih memengaruhi risiko",
      text: "Faktor lingkungan perlu dicatat secara terstruktur agar desa dapat menentukan tindak lanjut.",
    },
    {
      icon: Home,
      title: "Pemetaan masih perlu berbasis wilayah kecil",
      text: "Risiko stunting lebih mudah ditangani jika dibaca per RT atau dusun, bukan hanya angka umum desa.",
    },
    {
      icon: Utensils,
      title: "Pangan lokal belum selalu menjadi dasar edukasi",
      text: "Desa membutuhkan referensi pangan lokal agar edukasi gizi lebih dekat dengan kondisi masyarakat.",
    },
  ];

  return (
    <PublicLayout>
      <section className="public-detail-page">
        <div className="public-section-header">
          <span>Masalah</span>
          <h1>Mengapa GiziDesa dibutuhkan?</h1>
          <p>
            GiziDesa dirancang untuk membantu desa membaca risiko stunting secara
            lebih terarah berdasarkan indikator komunitas dan kondisi wilayah.
          </p>
        </div>

        <div className="detail-card-grid">
          {problems.map((problem) => {
            const Icon = problem.icon;

            return (
              <article key={problem.title} className="detail-card">
                <div className="detail-icon warning">
                  <Icon size={25} />
                </div>
                <h3>{problem.title}</h3>
                <p>{problem.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}

export default MasalahPage;