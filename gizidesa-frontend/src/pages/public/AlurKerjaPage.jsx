import PublicLayout from "../../layouts/PublicLayout";

function AlurKerjaPage() {
  const flows = [
    {
      number: "01",
      title: "Kader menginput data",
      text: "Data risiko dikumpulkan per RT/dusun berdasarkan indikator yang sudah ditentukan.",
    },
    {
      number: "02",
      title: "Sistem menghitung IRS",
      text: "Backend menghitung skor risiko, kategori risiko, faktor dominan, dan rekomendasi awal.",
    },
    {
      number: "03",
      title: "Bidan membaca prioritas",
      text: "Bidan melihat wilayah yang membutuhkan pemantauan atau pendampingan lanjutan.",
    },
    {
      number: "04",
      title: "Admin mengelola laporan",
      text: "Admin memantau data wilayah, pangan lokal, intervensi, dan laporan ringkasan desa.",
    },
  ];

  return (
    <PublicLayout>
      <section className="workflow-detail-page">
        <div className="public-section-header light">
          <span>Alur Kerja</span>
          <h1>Proses kerja GiziDesa</h1>
          <p>
            Alur dibuat sederhana agar sesuai dengan pembagian tugas di tingkat
            desa dan posyandu.
          </p>
        </div>

        <div className="workflow-detail-grid">
          {flows.map((flow) => (
            <article key={flow.number} className="workflow-detail-card">
              <strong>{flow.number}</strong>
              <h3>{flow.title}</h3>
              <p>{flow.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export default AlurKerjaPage;