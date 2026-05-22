const STORAGE_KEY = "gizidesa_admin_tim";

const DEFAULT_TIM = [
    {
        id: 1,
        nama: "Lastri Anna Hutagalung",
        peran: "kader_posyandu",
        wilayah_tugas: "Dusun 1 - RT 01",
        nomor_hp: "081234567890",
        email: "lastri@gizidesa.local",
        status: "aktif",
        catatan: "Bertugas membantu pendataan ibu hamil dan pemantauan risiko wilayah.",
        created_at: "2026-05-21 08:00:00",
        updated_at: "2026-05-21 08:00:00",
    },
    {
        id: 2,
        nama: "Sarah Amelya Zalukhu",
        peran: "bidan_desa",
        wilayah_tugas: "Semua Wilayah",
        nomor_hp: "081298765432",
        email: "sarah@gizidesa.local",
        status: "aktif",
        catatan: "Bertugas memvalidasi kondisi ibu hamil, KEK, dan ANC tidak rutin.",
        created_at: "2026-05-21 08:00:00",
        updated_at: "2026-05-21 08:00:00",
    },
];

function delay(ms = 250) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredTim() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    
    if (!rawData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TIM));
        return DEFAULT_TIM;
    }
    
    try {
        const parsed = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed : DEFAULT_TIM;
    } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TIM));
        return DEFAULT_TIM;
    }
}

function saveStoredTim(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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

export async function getTimList() {
    await delay();
    
    return {
        message: "Data tim berhasil diambil.",
        data: getStoredTim(),
    };
}

export async function getTimDetail(id) {
    await delay();

    const tim = getStoredTim();
    const detail = tim.find((item) => String(item.id) === String(id));

    if (!detail) {
        throw new Error("Data tim tidak ditemukan.");
    }

    return {
        message: "Detail tim berhasil diambil.",
        data: detail,
    };
}

export async function createTim(payload) {
    await delay();

    const tim = getStoredTim();
    const timestamp = createTimestamp();

    const newItem = {
        id: Date.now(),
        nama: payload.nama,
        peran: payload.peran,
        wilayah_tugas: payload.wilayah_tugas,
        nomor_hp: payload.nomor_hp,
        email: payload.email,
        status: payload.status || "aktif",
        catatan: payload.catatan || "",
        created_at: timestamp,
        updated_at: timestamp,
    };

    const updatedData = [newItem, ...tim];
    saveStoredTim(updatedData);

    return {
        message: "Data tim berhasil ditambahkan.",
        data: newItem,
    };
}

export async function updateTim(id, payload) {
    await delay();

    const tim = getStoredTim();
    const timestamp = createTimestamp();

    const updatedData = tim.map((item) => {
        if (String(item.id) !== String(id)) {
        return item;
        }

        return {
        ...item,
        ...payload,
        updated_at: timestamp,
        };
    });
    
    saveStoredTim(updatedData);

    return {
        message: "Data tim berhasil diperbarui.",
        data: updatedData.find((item) => String(item.id) === String(id)),
    };
}

export async function deleteTim(id) {
    await delay();
    
    const tim = getStoredTim();
    const updatedData = tim.filter((item) => String(item.id) !== String(id));
    saveStoredTim(updatedData);
    return {
        message: "Data tim berhasil dihapus.",
    };
}