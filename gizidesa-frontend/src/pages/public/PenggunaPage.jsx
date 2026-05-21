import { HeartPulse, ShieldCheck, UsersRound } from "lucide-react";
import PublicLayout from "../../layouts/PublicLayout";

function PenggunaPage() {
  const roles = [
    {
      icon: UsersRound,
      title: "Kader Posyandu",
      tag: "Pengumpul Data",
      text: "Menginput data enam indikator risiko per RT/dusun dan melihat panduan pangan lokal untuk edukasi komunitas.",
    },
    {
      icon: HeartPulse,
      title: "Bidan Desa",
      tag: "Pemantau Kesehatan",
      text: "Membaca dashboard risiko, melihat wilayah prioritas, dan mencatat tindak lanjut pendampingan.",
    },
    {
      icon: ShieldCheck,
      title: "Admin Desa",
      tag: "Pengelola Sistem",
      text: "Mengelola wilayah, pangan lokal, intervensi, pengguna, dan laporan ringkasan program desa.",
    },
  ];

  return (
    <PublicLayout>
      <section className="public-detail-page">
        <div className="public-section-header">
          <span>Pengguna</span>
          <h1>Setiap role memiliki fungsi yang berbeda</h1>
          <p>
            Pembagian role membuat sistem lebih mudah digunakan dan mengurangi
            kebingungan dalam pengelolaan data.
          </p>
        </div>

        <div className="role-detail-grid">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <article key={role.title} className="role-detail-card">
                <Icon size={34} />
                <span>{role.tag}</span>
                <h3>{role.title}</h3>
                <p>{role.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}

export default PenggunaPage;