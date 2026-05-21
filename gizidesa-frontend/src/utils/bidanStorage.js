const STORAGE_KEYS = {
  validasi: "gizidesa_bidan_validasi",
  anc: "gizidesa_bidan_anc",
  tindakLanjut: "gizidesa_bidan_tindak_lanjut",
};

const seedValidasi = [
  {
    id: 1,
    nama: "Marta Simanjuntak",
    wilayah: "Dusun 1 - RT 01",
    kategori: "Ibu Hamil",
    faktor: "Ibu Hamil KEK",
    status: "perlu_tindak_lanjut",
    catatan_kader: "Perlu pemantauan konsumsi pangan bergizi.",
    catatan_bidan: "Perlu kunjungan rumah dan edukasi gizi ibu hamil.",
    tanggal: "2026-05-21",
  },
  {
    id: 2,
    nama: "Riko Sitorus",
    wilayah: "Dusun 2 - RT 02",
    kategori: "Balita",
    faktor: "Pemantauan Posyandu",
    status: "valid",
    catatan_kader: "Pemantauan rutin posyandu.",
    catatan_bidan: "Data valid, lanjut pemantauan berkala.",
    tanggal: "2026-05-20",
  },
  {
    id: 3,
    nama: "Dewi Hutagalung",
    wilayah: "Dusun 3 - RT 04",
    kategori: "Ibu Hamil",
    faktor: "ANC Tidak Rutin",
    status: "perlu_tindak_lanjut",
    catatan_kader: "Belum melakukan pemeriksaan ANC bulan ini.",
    catatan_bidan: "",
    tanggal: "2026-05-22",
  },
];

const seedAnc = [
  {
    id: 1,
    nama: "Marta Simanjuntak",
    wilayah: "Dusun 1 - RT 01",
    usia_kehamilan: 24,
    status_kek: "kek",
    anc_status: "tidak_rutin",
    lila: 22.5,
    catatan: "Perlu edukasi gizi dan pemeriksaan ANC lanjutan.",
    prioritas: "tinggi",
  },
  {
    id: 2,
    nama: "Dewi Hutagalung",
    wilayah: "Dusun 3 - RT 04",
    usia_kehamilan: 18,
    status_kek: "normal",
    anc_status: "tidak_rutin",
    lila: 24.8,
    catatan: "Perlu diingatkan jadwal pemeriksaan ANC.",
    prioritas: "sedang",
  },
  {
    id: 3,
    nama: "Rina Nainggolan",
    wilayah: "Dusun 2 - RT 02",
    usia_kehamilan: 30,
    status_kek: "normal",
    anc_status: "rutin",
    lila: 25.2,
    catatan: "Pemantauan rutin tetap dilanjutkan.",
    prioritas: "rendah",
  },
];

const seedTindakLanjut = [
  {
    id: 1,
    wilayah: "Dusun 1 - RT 01",
    sasaran: "Marta Simanjuntak",
    jenis: "Kunjungan Rumah",
    fokus: "Ibu Hamil KEK",
    tanggal_rencana: "2026-05-25",
    tanggal_pelaksanaan: "",
    status: "direncanakan",
    hasil: "",
    catatan: "Prioritaskan edukasi gizi dan jadwal ANC.",
  },
  {
    id: 2,
    wilayah: "Dusun 2 - RT 02",
    sasaran: "Riko Sitorus",
    jenis: "Pemantauan Posyandu",
    fokus: "Balita",
    tanggal_rencana: "2026-05-27",
    tanggal_pelaksanaan: "",
    status: "berjalan",
    hasil: "Pemantauan awal sudah dilakukan.",
    catatan: "Lanjutkan pemantauan bulanan.",
  },
];

export const rekomendasiBidan = [
  {
    id: 1,
    wilayah: "Dusun 1 - RT 01",
    kategori: "Sedang",
    faktor: "Ibu Hamil KEK",
    rekomendasi:
      "Lakukan kunjungan rumah, edukasi konsumsi pangan bergizi, dan dorong pemeriksaan ANC secara rutin.",
    prioritas: "tinggi",
  },
  {
    id: 2,
    wilayah: "Dusun 2 - RT 02",
    kategori: "Rendah",
    faktor: "Pemantauan Posyandu",
    rekomendasi:
      "Pertahankan pemantauan posyandu dan edukasi pencegahan risiko gizi keluarga.",
    prioritas: "sedang",
  },
  {
    id: 3,
    wilayah: "Dusun 3 - RT 04",
    kategori: "Sedang",
    faktor: "ANC Tidak Rutin",
    rekomendasi:
      "Pastikan ibu hamil memperoleh pendampingan berkala dan informasi jadwal pemeriksaan ANC.",
    prioritas: "sedang",
  },
];

export const risikoWilayahBidan = [
  {
    id: 1,
    wilayah: "Dusun 1 - RT 01",
    kode: "DSN1-RT01",
    kategori: "Sedang",
    skor_irs: 65,
    faktor: "Ibu Hamil KEK",
    latitude: 2.544954,
    longitude: 98.5625975,
    rekomendasi: "Kunjungan rumah dan pemantauan ANC perlu diprioritaskan.",
  },
  {
    id: 2,
    wilayah: "Dusun 2 - RT 02",
    kode: "DSN2-RT02",
    kategori: "Rendah",
    skor_irs: 35,
    faktor: "Pemantauan Posyandu",
    latitude: 2.548,
    longitude: 98.566,
    rekomendasi: "Lanjutkan edukasi pencegahan dan pemantauan berkala.",
  },
  {
    id: 3,
    wilayah: "Dusun 3 - RT 04",
    kode: "DSN3-RT04",
    kategori: "Sedang",
    skor_irs: 50,
    faktor: "ANC Tidak Rutin",
    latitude: 2.541,
    longitude: 98.559,
    rekomendasi: "Perlu koordinasi bidan dan kader untuk pemantauan ibu hamil.",
  },
];

export const panganBidan = [
  {
    id: 1,
    nama: "Daun Kelor",
    kategori: "Ibu Hamil",
    manfaat:
      "Mendukung asupan zat gizi mikro dan dapat digunakan dalam edukasi konsumsi sayur lokal.",
    catatan: "Dapat diolah menjadi sayur bening atau campuran lauk.",
  },
  {
    id: 2,
    nama: "Ikan Mujair",
    kategori: "Balita",
    manfaat: "Sumber protein hewani lokal untuk mendukung pertumbuhan anak.",
    catatan: "Dianjurkan diolah dengan cara direbus, dikukus, atau dipanggang.",
  },
  {
    id: 3,
    nama: "Telur",
    kategori: "Ibu Hamil",
    manfaat:
      "Sumber protein yang mudah diperoleh dan relevan untuk edukasi gizi keluarga.",
    catatan: "Pastikan dimasak matang.",
  },
  {
    id: 4,
    nama: "Ubi Jalar",
    kategori: "Keluarga",
    manfaat:
      "Sumber karbohidrat lokal yang dapat menjadi variasi pangan rumah tangga.",
    catatan: "Cocok untuk edukasi diversifikasi pangan lokal.",
  },
];

function readStorage(key, seed) {
  const raw = localStorage.getItem(key);

  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
}

function writeStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function createId(data) {
  if (!data.length) {
    return 1;
  }

  return Math.max(...data.map((item) => Number(item.id))) + 1;
}

export function getValidasiData() {
  return readStorage(STORAGE_KEYS.validasi, seedValidasi);
}

export function updateValidasiData(id, payload) {
  const data = getValidasiData();
  const updated = data.map((item) =>
    Number(item.id) === Number(id) ? { ...item, ...payload } : item
  );

  writeStorage(STORAGE_KEYS.validasi, updated);
  return updated;
}

export function getAncData() {
  return readStorage(STORAGE_KEYS.anc, seedAnc);
}

export function updateAncData(id, payload) {
  const data = getAncData();
  const updated = data.map((item) =>
    Number(item.id) === Number(id) ? { ...item, ...payload } : item
  );

  writeStorage(STORAGE_KEYS.anc, updated);
  return updated;
}

export function getTindakLanjutData() {
  return readStorage(STORAGE_KEYS.tindakLanjut, seedTindakLanjut);
}

export function createTindakLanjutData(payload) {
  const data = getTindakLanjutData();
  const nextData = [
    ...data,
    {
      ...payload,
      id: createId(data),
    },
  ];

  writeStorage(STORAGE_KEYS.tindakLanjut, nextData);
  return nextData;
}

export function updateTindakLanjutData(id, payload) {
  const data = getTindakLanjutData();
  const updated = data.map((item) =>
    Number(item.id) === Number(id) ? { ...item, ...payload } : item
  );

  writeStorage(STORAGE_KEYS.tindakLanjut, updated);
  return updated;
}

export function deleteTindakLanjutData(id) {
  const data = getTindakLanjutData();
  const updated = data.filter((item) => Number(item.id) !== Number(id));

  writeStorage(STORAGE_KEYS.tindakLanjut, updated);
  return updated;
}