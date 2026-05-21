const RT_STORAGE_KEY = "gizidesa_kader_rt_data";
const WARGA_STORAGE_KEY = "gizidesa_kader_warga_data";

const DEFAULT_RT_DATA = [
  {
    id: 1,
    wilayah: "Dusun 1 - RT 01",
    jumlah_keluarga: 42,
    jumlah_ibu_hamil: 8,
    jumlah_balita: 18,
    akses_air_bersih: "cukup",
    kondisi_sanitasi: "perlu_pemantauan",
    status: "tercatat",
    catatan: "Sebagian keluarga masih membutuhkan edukasi PHBS.",
    created_at: "2026-05-21 08:00:00",
  },
];

const DEFAULT_WARGA_DATA = [
  {
    id: 1,
    nama: "Marta Simanjuntak",
    nik: "1201010101010001",
    wilayah: "Dusun 1 - RT 01",
    kategori_sasaran: "ibu_hamil",
    status_pemantauan: "perlu_dipantau",
    nomor_hp: "081234567890",
    catatan: "Perlu pemantauan konsumsi pangan bergizi.",
    created_at: "2026-05-21 08:00:00",
  },
  {
    id: 2,
    nama: "Riko Sitorus",
    nik: "1201010101010002",
    wilayah: "Dusun 2 - RT 02",
    kategori_sasaran: "balita",
    status_pemantauan: "normal",
    nomor_hp: "081298765432",
    catatan: "Pemantauan rutin posyandu.",
    created_at: "2026-05-21 08:00:00",
  },
];

function createTimestamp() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function getStoredData(key, defaultData) {
  const rawData = localStorage.getItem(key);

  if (!rawData) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }

  try {
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : defaultData;
  } catch {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
}

function saveStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getRtData() {
  return getStoredData(RT_STORAGE_KEY, DEFAULT_RT_DATA);
}

export function createRtData(payload) {
  const currentData = getRtData();

  const newData = {
    id: Date.now(),
    ...payload,
    status: payload.status || "tercatat",
    created_at: createTimestamp(),
  };

  const updatedData = [newData, ...currentData];
  saveStoredData(RT_STORAGE_KEY, updatedData);

  return newData;
}

export function updateRtData(id, payload) {
  const updatedData = getRtData().map((item) => {
    if (String(item.id) !== String(id)) {
      return item;
    }

    return {
      ...item,
      ...payload,
      updated_at: createTimestamp(),
    };
  });

  saveStoredData(RT_STORAGE_KEY, updatedData);
  return updatedData.find((item) => String(item.id) === String(id));
}

export function deleteRtData(id) {
  const updatedData = getRtData().filter((item) => String(item.id) !== String(id));
  saveStoredData(RT_STORAGE_KEY, updatedData);
}

export function getWargaData() {
  return getStoredData(WARGA_STORAGE_KEY, DEFAULT_WARGA_DATA);
}

export function createWargaData(payload) {
  const currentData = getWargaData();

  const newData = {
    id: Date.now(),
    ...payload,
    created_at: createTimestamp(),
  };

  const updatedData = [newData, ...currentData];
  saveStoredData(WARGA_STORAGE_KEY, updatedData);

  return newData;
}

export function updateWargaData(id, payload) {
  const updatedData = getWargaData().map((item) => {
    if (String(item.id) !== String(id)) {
      return item;
    }

    return {
      ...item,
      ...payload,
      updated_at: createTimestamp(),
    };
  });

  saveStoredData(WARGA_STORAGE_KEY, updatedData);
  return updatedData.find((item) => String(item.id) === String(id));
}

export function deleteWargaData(id) {
  const updatedData = getWargaData().filter(
    (item) => String(item.id) !== String(id)
  );
  saveStoredData(WARGA_STORAGE_KEY, updatedData);
}