export function formatNumber(value) {
  if (value === null || value === undefined) {
    return "0";
  }

  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatRiskLabel(value) {
  const labels = {
    rendah: "Rendah",
    sedang: "Sedang",
    tinggi: "Tinggi",
  };

  return labels[value] || "-";
}

export function formatStatusLabel(value) {
  const labels = {
    direncanakan: "Direncanakan",
    berjalan: "Berjalan",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };

  return labels[value] || "-";
}

export function formatFactorLabel(value) {
  const labels = {
    ibu_hamil_kek: "Ibu Hamil KEK",
    anc_tidak_rutin: "ANC Tidak Rutin",
    air_bersih: "Air Bersih",
    sanitasi: "Sanitasi",
    ekonomi: "Ekonomi",
    akses_layanan: "Akses Layanan",
    pangan_lokal: "Pangan Lokal",
  };

  return labels[value] || "-";
}