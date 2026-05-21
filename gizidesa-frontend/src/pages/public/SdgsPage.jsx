import PublicLayout from "../../layouts/PublicLayout";

function SdgsPage() {
  const sdgs = [
    {
      number: "2",
      label: "Zero Hunger",
      title: "Mendukung perbaikan gizi",
      text: "GiziDesa membantu desa mengidentifikasi risiko gizi dan memanfaatkan pangan lokal.",
    },
    {
      number: "3",
      label: "Good Health",
      title: "Kesehatan ibu dan anak",
      text: "Sistem membantu pemantauan risiko dan tindak lanjut kesehatan berbasis wilayah.",
    },
    {
      number: "6",
      label: "Clean Water",
      title: "Air bersih dan sanitasi",
      text: "Indikator air bersih dan sanitasi masuk dalam penilaian risiko wilayah.",
    },
    {
      number: "9",
      label: "Innovation",
      title: "Inovasi layanan desa",
      text: "GiziDesa menggunakan sistem digital untuk mendukung keputusan berbasis data.",
    },
  ];

  return (
    <PublicLayout>
      <section className="public-detail-page">
        <div className="public-section-header">
          <span>SDGs</span>
          <h1>Keterkaitan GiziDesa dengan SDGs</h1>
          <p>
            GiziDesa mendukung tujuan pembangunan berkelanjutan melalui
            pemanfaatan data desa, kesehatan komunitas, dan pangan lokal.
          </p>
        </div>

        <div className="sdg-grid">
          {sdgs.map((sdg) => (
            <article key={sdg.number} className="sdg-card">
              <strong>{sdg.number}</strong>
              <span>{sdg.label}</span>
              <h3>{sdg.title}</h3>
              <p>{sdg.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export default SdgsPage;