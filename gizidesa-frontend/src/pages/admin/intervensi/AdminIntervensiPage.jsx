import {
  CalendarDays,
  ClipboardList,
  Edit,
  Eye,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDataRisikoList } from "../../../api/dataRisikoApi";
import {
  createIntervensi,
  deleteIntervensi,
  getIntervensiList,
  updateIntervensi,
} from "../../../api/intervensiApi";
import ConfirmModal from "../../../components/common/ConfirmModal";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import RiskBadge from "../../../components/dashboard/RiskBadge";
import AdminLayout from "../../../layouts/AdminLayout";
import { formatFactorLabel, formatNumber } from "../../../utils/formatters";

const INTERVENSI_CACHE_KEY = "gizidesa_intervensi_cache";
const DATA_RISIKO_CACHE_KEY = "gizidesa_data_risiko_cache";

const initialForm = {
  data_risiko_id: "",
  wilayah_id: "",
  jenis_intervensi: "",
  judul: "",
  deskripsi: "",
  tanggal_rencana: "",
  tanggal_pelaksanaan: "",
  status: "direncanakan",
  prioritas: "sedang",
  hasil_intervensi: "",
  catatan: "",
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function readCache(key) {
  const cached = sessionStorage.getItem(key);

  if (!cached) {
    return [];
  }

  try {
    return JSON.parse(cached);
  } catch {
    return [];
  }
}

function normalizeDataRisiko(item) {
  return {
    ...item,

    wilayah_id: item.wilayah_id || item.wilayah?.id || "",

    wilayah: {
      id: item.wilayah?.id || item.wilayah_id || "",
      nama_dusun: item.wilayah?.nama_dusun || "-",
      nama_rt: item.wilayah?.nama_rt || "-",
      kode_wilayah: item.wilayah?.kode_wilayah || "-",
    },

    periode: item.periode || "",
    skor_irs: Number(item.skor_irs ?? item.irs?.skor_irs ?? 0),
    kategori_risiko:
      item.kategori_risiko ?? item.irs?.kategori_risiko ?? "rendah",
    faktor_dominan: item.faktor_dominan ?? item.irs?.faktor_dominan ?? null,
    rekomendasi_awal:
      item.rekomendasi_awal ||
      "Lakukan pemantauan berkala berdasarkan kondisi wilayah.",
  };
}

function normalizeIntervensi(item) {
  return {
    ...item,

    data_risiko_id:
      item.data_risiko_id || item.data_risiko?.id || item.dataRisiko?.id || "",

    wilayah_id:
      item.wilayah_id ||
      item.wilayah?.id ||
      item.data_risiko?.wilayah?.id ||
      item.dataRisiko?.wilayah?.id ||
      "",

    wilayah: item.wilayah ||
      item.data_risiko?.wilayah ||
      item.dataRisiko?.wilayah || {
        nama_dusun: "-",
        nama_rt: "-",
        kode_wilayah: "-",
      },

    data_risiko: item.data_risiko || item.dataRisiko || null,

    jenis_intervensi: item.jenis_intervensi || "",
    judul: item.judul || "",
    deskripsi: item.deskripsi || "",
    tanggal_rencana: item.tanggal_rencana || "",
    tanggal_pelaksanaan: item.tanggal_pelaksanaan || "",
    status: item.status || "direncanakan",
    prioritas: item.prioritas || "sedang",
    hasil_intervensi: item.hasil_intervensi || "",
    catatan: item.catatan || "",
  };
}

function formatPeriodLabel(period) {
  if (!period || !period.includes("-")) {
    return "-";
  }

  const [year, month] = period.split("-");
  const monthIndex = Number(month) - 1;

  if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return period;
  }

  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatStatusLabel(value) {
  const labels = {
    direncanakan: "Direncanakan",
    berjalan: "Berjalan",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };

  return labels[value] || value || "-";
}

function formatPriorityLabel(value) {
  const labels = {
    rendah: "Rendah",
    sedang: "Sedang",
    tinggi: "Tinggi",
  };

  return labels[value] || value || "-";
}

function formatInterventionType(value) {
  const labels = {
    edukasi_gizi: "Edukasi Gizi",
    sanitasi: "Sanitasi",
    akses_kesehatan: "Akses Kesehatan",
    pangan_lokal: "Pangan Lokal",
    pendampingan_ibu_hamil: "Pendampingan Ibu Hamil",
    pemantauan_rutin: "Pemantauan Rutin",
    lainnya: "Lainnya",
  };

  return labels[value] || value || "-";
}

function getStatusBadgeClass(value) {
  if (value === "selesai") {
    return "risk-badge risk-badge-rendah";
  }

  if (value === "berjalan") {
    return "risk-badge risk-badge-sedang";
  }

  if (value === "dibatalkan") {
    return "risk-badge risk-badge-tinggi";
  }

  return "risk-badge risk-badge-unknown";
}

function getPriorityBadgeClass(value) {
  if (value === "rendah") {
    return "risk-badge risk-badge-rendah";
  }

  if (value === "sedang") {
    return "risk-badge risk-badge-sedang";
  }

  if (value === "tinggi") {
    return "risk-badge risk-badge-tinggi";
  }

  return "risk-badge risk-badge-unknown";
}

function sortIntervensi(a, b) {
  const priorityOrder = {
    tinggi: 3,
    sedang: 2,
    rendah: 1,
  };

  const statusOrder = {
    berjalan: 4,
    direncanakan: 3,
    selesai: 2,
    dibatalkan: 1,
  };

  const statusDiff =
    (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);

  if (statusDiff !== 0) {
    return statusDiff;
  }

  return (priorityOrder[b.prioritas] || 0) - (priorityOrder[a.prioritas] || 0);
}

function AdminIntervensiPage() {
  const [intervensiList, setIntervensiList] = useState(() =>
    readCache(INTERVENSI_CACHE_KEY).map((item) => normalizeIntervensi(item))
  );

  const [dataRisikoList, setDataRisikoList] = useState(() =>
    readCache(DATA_RISIKO_CACHE_KEY).map((item) => normalizeDataRisiko(item))
  );

  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [priorityFilter, setPriorityFilter] = useState("semua");

  const [formData, setFormData] = useState(initialForm);
  const [selectedIntervensi, setSelectedIntervensi] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [intervensiToDelete, setIntervensiToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function fetchDataRisiko() {
    try {
      const response = await getDataRisikoList();

      const risikoData =
        response.data ||
        response.data_risiko ||
        response.items ||
        response ||
        [];

      const normalizedData = Array.isArray(risikoData)
        ? risikoData.map((item) => normalizeDataRisiko(item))
        : [];

      setDataRisikoList(normalizedData);
      sessionStorage.setItem(
        DATA_RISIKO_CACHE_KEY,
        JSON.stringify(normalizedData)
      );
    } catch {
      setDataRisikoList((previous) => previous);
    }
  }

  async function fetchIntervensi() {
    try {
      setErrorMessage("");

      const response = await getIntervensiList();

      const data =
        response.data ||
        response.intervensi ||
        response.items ||
        response ||
        [];

      const normalizedData = Array.isArray(data)
        ? data.map((item) => normalizeIntervensi(item))
        : [];

      setIntervensiList(normalizedData);
      sessionStorage.setItem(
        INTERVENSI_CACHE_KEY,
        JSON.stringify(normalizedData)
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data intervensi gagal dimuat. Pastikan backend aktif dan token login valid."
      );
    }
  }

  useEffect(() => {
    fetchDataRisiko();
    fetchIntervensi();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const filteredIntervensi = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return [...intervensiList].sort(sortIntervensi).filter((item) => {
      const wilayahText = `${item.wilayah?.nama_dusun || ""} ${
        item.wilayah?.nama_rt || ""
      } ${item.wilayah?.kode_wilayah || ""}`.toLowerCase();

      const text = `${wilayahText} ${item.judul || ""} ${
        item.jenis_intervensi || ""
      } ${item.deskripsi || ""} ${item.status || ""} ${
        item.prioritas || ""
      } ${item.catatan || ""}`.toLowerCase();

      const matchKeyword = !keyword || text.includes(keyword);

      const matchStatus =
        statusFilter === "semua" || item.status === statusFilter;

      const matchPriority =
        priorityFilter === "semua" || item.prioritas === priorityFilter;

      return matchKeyword && matchStatus && matchPriority;
    });
  }, [intervensiList, priorityFilter, searchKeyword, statusFilter]);

  const totalIntervensi = intervensiList.length;

  const totalAktif = useMemo(() => {
    return intervensiList.filter((item) =>
      ["direncanakan", "berjalan"].includes(item.status)
    ).length;
  }, [intervensiList]);

  const totalSelesai = useMemo(() => {
    return intervensiList.filter((item) => item.status === "selesai").length;
  }, [intervensiList]);

  const totalPrioritasTinggi = useMemo(() => {
    return intervensiList.filter((item) => item.prioritas === "tinggi").length;
  }, [intervensiList]);

  const selectedRiskData = useMemo(() => {
    if (!formData.data_risiko_id) {
      return null;
    }

    return dataRisikoList.find(
      (item) => String(item.id) === String(formData.data_risiko_id)
    );
  }, [dataRisikoList, formData.data_risiko_id]);

  const handleOpenCreateModal = () => {
    setSelectedIntervensi(null);
    setFormData(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    const normalizedItem = normalizeIntervensi(item);

    setSelectedIntervensi(normalizedItem);
    setFormData({
      data_risiko_id: normalizedItem.data_risiko_id || "",
      wilayah_id: normalizedItem.wilayah_id || "",
      jenis_intervensi: normalizedItem.jenis_intervensi || "",
      judul: normalizedItem.judul || "",
      deskripsi: normalizedItem.deskripsi || "",
      tanggal_rencana: normalizedItem.tanggal_rencana || "",
      tanggal_pelaksanaan: normalizedItem.tanggal_pelaksanaan || "",
      status: normalizedItem.status || "direncanakan",
      prioritas: normalizedItem.prioritas || "sedang",
      hasil_intervensi: normalizedItem.hasil_intervensi || "",
      catatan: normalizedItem.catatan || "",
    });

    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleOpenDetailModal = (item) => {
    setDetailData(normalizeIntervensi(item));
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setDetailData(null);
  };

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setSelectedIntervensi(null);
    setFormData(initialForm);
    setFormErrorMessage("");
    setFieldErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "data_risiko_id") {
      const selectedRisk = dataRisikoList.find(
        (item) => String(item.id) === String(value)
      );

      setFormData((previous) => ({
        ...previous,
        data_risiko_id: value,
        wilayah_id: selectedRisk?.wilayah_id || selectedRisk?.wilayah?.id || "",
        prioritas:
          selectedRisk?.kategori_risiko === "tinggi"
            ? "tinggi"
            : selectedRisk?.kategori_risiko === "sedang"
              ? "sedang"
              : previous.prioritas,
        judul:
          previous.judul ||
          (selectedRisk
            ? `Tindak lanjut ${formatFactorLabel(
                selectedRisk.faktor_dominan
              ).toLowerCase()}`
            : ""),
        deskripsi: previous.deskripsi || selectedRisk?.rekomendasi_awal || "",
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((previous) => {
        const updated = { ...previous };
        delete updated[name];
        return updated;
      });
    }

    if (formErrorMessage) {
      setFormErrorMessage("");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.data_risiko_id) {
      errors.data_risiko_id = "Data risiko wajib dipilih.";
    }

    if (!formData.jenis_intervensi) {
      errors.jenis_intervensi = "Jenis intervensi wajib dipilih.";
    }

    if (!formData.judul.trim()) {
      errors.judul = "Judul intervensi wajib diisi.";
    }

    if (!formData.deskripsi.trim()) {
      errors.deskripsi = "Deskripsi intervensi wajib diisi.";
    }

    if (!formData.tanggal_rencana) {
      errors.tanggal_rencana = "Tanggal rencana wajib diisi.";
    }

    if (!formData.status) {
      errors.status = "Status wajib dipilih.";
    }

    if (!formData.prioritas) {
      errors.prioritas = "Prioritas wajib dipilih.";
    }

    if (
      formData.status === "selesai" &&
      !formData.tanggal_pelaksanaan
    ) {
      errors.tanggal_pelaksanaan =
        "Tanggal pelaksanaan wajib diisi jika status selesai.";
    }

    setFieldErrors(errors);

    return Object.values(errors)[0] || "";
  };

  const getFieldClassName = (field) => {
    return fieldErrors[field] ? "field-invalid" : "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setFormErrorMessage(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");
      setFormErrorMessage("");
      setFieldErrors({});

      const payload = {
        data_risiko_id: Number(formData.data_risiko_id),
        wilayah_id: Number(formData.wilayah_id),
        jenis_intervensi: formData.jenis_intervensi,
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        tanggal_rencana: formData.tanggal_rencana,
        tanggal_pelaksanaan: formData.tanggal_pelaksanaan || null,
        status: formData.status,
        prioritas: formData.prioritas,
        hasil_intervensi: formData.hasil_intervensi.trim() || null,
        catatan: formData.catatan.trim() || null,
      };

      if (selectedIntervensi) {
        await updateIntervensi(selectedIntervensi.id, payload);
        setSuccessMessage("Data intervensi berhasil diperbarui.");
      } else {
        await createIntervensi(payload);
        setSuccessMessage("Data intervensi berhasil ditambahkan.");
      }

      setModalOpen(false);
      setSelectedIntervensi(null);
      setFormData(initialForm);
      setFormErrorMessage("");
      setFieldErrors({});

      await fetchIntervensi();
    } catch (error) {
      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        const formattedErrors = {};

        Object.entries(validationErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages)
            ? messages[0]
            : String(messages);
        });

        setFieldErrors(formattedErrors);
        setFormErrorMessage(
          Object.values(formattedErrors)[0] ||
            "Validasi data intervensi gagal."
        );
      } else {
        setFormErrorMessage(
          error.response?.data?.message ||
            "Data intervensi gagal disimpan. Periksa kembali input yang diberikan."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    setIntervensiToDelete(normalizeIntervensi(item));
    setConfirmOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setConfirmOpen(false);
    setIntervensiToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!intervensiToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteIntervensi(intervensiToDelete.id);

      setSuccessMessage("Data intervensi berhasil dihapus.");
      setConfirmOpen(false);
      setIntervensiToDelete(null);

      await fetchIntervensi();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data intervensi gagal dihapus. Periksa kembali koneksi backend."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Tracking Intervensi"
      subtitle="Memantau tindak lanjut intervensi wilayah berdasarkan risiko dan rekomendasi awal."
    >
      <ErrorAlert message={errorMessage} />

      {successMessage && (
        <div className="admin-success-alert">
          <strong>Berhasil</strong>
          <p>{successMessage}</p>
        </div>
      )}

      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Intervensi</span>
          <strong>{formatNumber(totalIntervensi)}</strong>
          <p>Tindak lanjut tercatat</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Intervensi Aktif</span>
          <strong>{formatNumber(totalAktif)}</strong>
          <p>Direncanakan dan berjalan</p>
        </article>

        <article className="admin-metric-card success">
          <span>Selesai</span>
          <strong>{formatNumber(totalSelesai)}</strong>
          <p>Tindak lanjut selesai</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Prioritas Tinggi</span>
          <strong>{formatNumber(totalPrioritasTinggi)}</strong>
          <p>Perlu perhatian utama</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Intervensi</span>
            <h2>Monitoring Tindak Lanjut</h2>
            <p>
              Data intervensi digunakan untuk memantau status pelaksanaan
              tindak lanjut pada wilayah prioritas.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari wilayah, judul, status..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="direncanakan">Direncanakan</option>
              <option value="berjalan">Berjalan</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>

            <select
              className="admin-filter-select"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="semua">Semua Prioritas</option>
              <option value="tinggi">Tinggi</option>
              <option value="sedang">Sedang</option>
              <option value="rendah">Rendah</option>
            </select>

            <button
              type="button"
              className="admin-primary-button"
              onClick={handleOpenCreateModal}
            >
              <Plus size={18} />
              Tambah Intervensi
            </button>
          </div>
        </div>

        {filteredIntervensi.length === 0 ? (
          <EmptyState
            title="Data intervensi belum tersedia"
            message="Tambahkan tindak lanjut intervensi berdasarkan data risiko dan rekomendasi awal wilayah."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>Jenis</th>
                  <th>Judul</th>
                  <th>Status</th>
                  <th>Prioritas</th>
                  <th>Tanggal Rencana</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredIntervensi.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="risk-location-cell">
                        <span>
                          <Target size={15} />
                        </span>
                        <div>
                          <strong>
                            {item.wilayah?.nama_dusun || "-"} -{" "}
                            {item.wilayah?.nama_rt || "-"}
                          </strong>
                          <small>{item.wilayah?.kode_wilayah || "-"}</small>
                        </div>
                      </div>
                    </td>

                    <td>{formatInterventionType(item.jenis_intervensi)}</td>

                    <td>
                      <span className="table-muted-text">
                        {item.judul || "-"}
                      </span>
                    </td>

                    <td>
                      <span className={getStatusBadgeClass(item.status)}>
                        {formatStatusLabel(item.status)}
                      </span>
                    </td>

                    <td>
                      <span className={getPriorityBadgeClass(item.prioritas)}>
                        {formatPriorityLabel(item.prioritas)}
                      </span>
                    </td>

                    <td>{formatDate(item.tanggal_rencana)}</td>

                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-button view"
                          onClick={() => handleOpenDetailModal(item)}
                          title="Lihat detail"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="table-action-button edit"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit intervensi"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="table-action-button delete"
                          onClick={() => handleOpenDeleteConfirm(item)}
                          title="Hapus intervensi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-dashboard-grid bottom" style={{ marginTop: 18 }}>
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Proses</span>
              <h2>Alur Tracking Intervensi</h2>
              <p>
                Tracking membantu admin memastikan rekomendasi awal benar-benar
                ditindaklanjuti.
              </p>
            </div>
          </div>

          <div className="recent-intervention-list">
            <div className="recent-intervention-item">
              <div className="recent-icon">
                <ClipboardList size={18} />
              </div>
              <div>
                <strong>Direncanakan</strong>
                <p>Admin mencatat rencana intervensi dari data risiko.</p>
                <small>Tahap awal tindak lanjut</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <TrendingUp size={18} />
              </div>
              <div>
                <strong>Berjalan</strong>
                <p>Intervensi sedang dilaksanakan dan dipantau progresnya.</p>
                <small>Monitoring pelaksanaan</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <CalendarDays size={18} />
              </div>
              <div>
                <strong>Selesai</strong>
                <p>Hasil intervensi dicatat untuk bahan laporan desa.</p>
                <small>Evaluasi tindak lanjut</small>
              </div>
            </div>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Dasar Data</span>
              <h2>Berbasis Data Risiko</h2>
              <p>
                Intervensi yang baik harus terhubung dengan wilayah, skor IRS,
                faktor dominan, dan rekomendasi awal.
              </p>
            </div>
          </div>

          <div className="recent-intervention-list">
            <div className="recent-intervention-item">
              <div className="recent-icon">
                <Target size={18} />
              </div>
              <div>
                <strong>Wilayah Prioritas</strong>
                <p>
                  Pilih data risiko agar intervensi memiliki dasar wilayah yang
                  jelas.
                </p>
                <small>Konsisten dengan IRS</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <ClipboardList size={18} />
              </div>
              <div>
                <strong>Catatan Hasil</strong>
                <p>
                  Hasil intervensi dapat digunakan kembali untuk evaluasi dan
                  laporan program.
                </p>
                <small>Bahan pelaporan</small>
              </div>
            </div>
          </div>
        </article>
      </section>

      {modalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal large risk-form-modal">
            <div className="admin-modal-header risk-form-header">
              <div>
                <span>Form Intervensi</span>
                <h2>
                  {selectedIntervensi
                    ? "Edit Intervensi"
                    : "Tambah Intervensi"}
                </h2>
                <p>
                  Lengkapi data tindak lanjut berdasarkan data risiko wilayah.
                </p>
              </div>

              <button type="button" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {formErrorMessage && (
              <div className="admin-form-error compact">
                <strong>Periksa kembali input</strong>
                <p>{formErrorMessage}</p>
              </div>
            )}

            <form
              className="admin-form risk-compact-form"
              onSubmit={handleSubmit}
            >
              <div className="admin-form-grid risk-form-grid">
                <label>
                  <span>Data Risiko Wilayah</span>
                  <select
                    name="data_risiko_id"
                    value={formData.data_risiko_id}
                    className={getFieldClassName("data_risiko_id")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih data risiko</option>
                    {dataRisikoList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.wilayah?.nama_dusun || "-"} -{" "}
                        {item.wilayah?.nama_rt || "-"} ·{" "}
                        {formatPeriodLabel(item.periode)} · IRS{" "}
                        {Number(item.skor_irs || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.data_risiko_id && (
                    <small className="field-error-text">
                      {fieldErrors.data_risiko_id}
                    </small>
                  )}
                </label>

                <label>
                  <span>Jenis Intervensi</span>
                  <select
                    name="jenis_intervensi"
                    value={formData.jenis_intervensi}
                    className={getFieldClassName("jenis_intervensi")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih jenis</option>
                    <option value="edukasi_gizi">Edukasi Gizi</option>
                    <option value="sanitasi">Sanitasi</option>
                    <option value="akses_kesehatan">Akses Kesehatan</option>
                    <option value="pangan_lokal">Pangan Lokal</option>
                    <option value="pendampingan_ibu_hamil">
                      Pendampingan Ibu Hamil
                    </option>
                    <option value="pemantauan_rutin">Pemantauan Rutin</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                  {fieldErrors.jenis_intervensi && (
                    <small className="field-error-text">
                      {fieldErrors.jenis_intervensi}
                    </small>
                  )}
                </label>

                <label>
                  <span>Judul Intervensi</span>
                  <input
                    type="text"
                    name="judul"
                    value={formData.judul}
                    className={getFieldClassName("judul")}
                    placeholder="Contoh: Edukasi PHBS dan pangan bergizi"
                    onChange={handleChange}
                  />
                  {fieldErrors.judul && (
                    <small className="field-error-text">
                      {fieldErrors.judul}
                    </small>
                  )}
                </label>

                <label>
                  <span>Tanggal Rencana</span>
                  <input
                    type="date"
                    name="tanggal_rencana"
                    value={formData.tanggal_rencana}
                    className={getFieldClassName("tanggal_rencana")}
                    onChange={handleChange}
                  />
                  {fieldErrors.tanggal_rencana && (
                    <small className="field-error-text">
                      {fieldErrors.tanggal_rencana}
                    </small>
                  )}
                </label>

                <label>
                  <span>Status</span>
                  <select
                    name="status"
                    value={formData.status}
                    className={getFieldClassName("status")}
                    onChange={handleChange}
                  >
                    <option value="direncanakan">Direncanakan</option>
                    <option value="berjalan">Berjalan</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                  {fieldErrors.status && (
                    <small className="field-error-text">
                      {fieldErrors.status}
                    </small>
                  )}
                </label>

                <label>
                  <span>Prioritas</span>
                  <select
                    name="prioritas"
                    value={formData.prioritas}
                    className={getFieldClassName("prioritas")}
                    onChange={handleChange}
                  >
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                  </select>
                  {fieldErrors.prioritas && (
                    <small className="field-error-text">
                      {fieldErrors.prioritas}
                    </small>
                  )}
                </label>

                <label>
                  <span>Tanggal Pelaksanaan</span>
                  <input
                    type="date"
                    name="tanggal_pelaksanaan"
                    value={formData.tanggal_pelaksanaan}
                    className={getFieldClassName("tanggal_pelaksanaan")}
                    onChange={handleChange}
                  />
                  {fieldErrors.tanggal_pelaksanaan && (
                    <small className="field-error-text">
                      {fieldErrors.tanggal_pelaksanaan}
                    </small>
                  )}
                </label>

                <label>
                  <span>Catatan</span>
                  <input
                    type="text"
                    name="catatan"
                    value={formData.catatan}
                    placeholder="Opsional, misalnya kendala lapangan."
                    onChange={handleChange}
                  />
                </label>
              </div>

              {selectedRiskData && (
                <div className="risk-note-box refined">
                  <Target size={18} />
                  <p>
                    Data terpilih: {selectedRiskData.wilayah?.nama_dusun} -{" "}
                    {selectedRiskData.wilayah?.nama_rt}, periode{" "}
                    {formatPeriodLabel(selectedRiskData.periode)}, kategori{" "}
                    <RiskBadge value={selectedRiskData.kategori_risiko} />{" "}
                    dengan faktor dominan{" "}
                    {formatFactorLabel(selectedRiskData.faktor_dominan)}.
                  </p>
                </div>
              )}

              <label className="risk-note-field">
                <span>Deskripsi Intervensi</span>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  className={getFieldClassName("deskripsi")}
                  placeholder="Jelaskan rencana tindak lanjut intervensi."
                  onChange={handleChange}
                />
                {fieldErrors.deskripsi && (
                  <small className="field-error-text">
                    {fieldErrors.deskripsi}
                  </small>
                )}
              </label>

              <label className="risk-note-field">
                <span>Hasil Intervensi</span>
                <textarea
                  name="hasil_intervensi"
                  value={formData.hasil_intervensi}
                  placeholder="Opsional, isi setelah intervensi berjalan atau selesai."
                  onChange={handleChange}
                />
              </label>

              <div className="admin-form-actions risk-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Intervensi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailModalOpen && detailData && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal large risk-detail-modal">
            <div className="risk-detail-header">
              <div>
                <span>Detail Intervensi</span>
                <h2>{detailData.judul || "-"}</h2>
                <p>
                  Ringkasan status, prioritas, jadwal, dan hasil tindak lanjut
                  intervensi wilayah.
                </p>
              </div>

              <button type="button" onClick={handleCloseDetailModal}>
                <X size={20} />
              </button>
            </div>

            <div className="risk-detail-summary">
              <div className="risk-score-panel">
                <span>Status</span>
                <strong style={{ fontSize: 34 }}>
                  {formatStatusLabel(detailData.status)}
                </strong>
                <span className={getPriorityBadgeClass(detailData.prioritas)}>
                  Prioritas {formatPriorityLabel(detailData.prioritas)}
                </span>
              </div>

              <div className="risk-summary-grid">
                <div className="risk-summary-card">
                  <span>Wilayah</span>
                  <p>
                    {detailData.wilayah?.nama_dusun || "-"} -{" "}
                    {detailData.wilayah?.nama_rt || "-"}
                  </p>
                </div>

                <div className="risk-summary-card">
                  <span>Jenis Intervensi</span>
                  <p>{formatInterventionType(detailData.jenis_intervensi)}</p>
                </div>

                <div className="risk-summary-card">
                  <span>Tanggal Rencana</span>
                  <p>{formatDate(detailData.tanggal_rencana)}</p>
                </div>

                <div className="risk-summary-card">
                  <span>Tanggal Pelaksanaan</span>
                  <p>{formatDate(detailData.tanggal_pelaksanaan)}</p>
                </div>
              </div>
            </div>

            <div className="risk-section-title">
              <span>Uraian Intervensi</span>
              <p>Deskripsi, hasil, dan catatan tindak lanjut.</p>
            </div>

            <div className="risk-summary-grid">
              <div className="risk-summary-card recommendation">
                <span>Deskripsi</span>
                <p>{detailData.deskripsi || "-"}</p>
              </div>

              <div className="risk-summary-card recommendation">
                <span>Hasil Intervensi</span>
                <p>{detailData.hasil_intervensi || "-"}</p>
              </div>

              <div className="risk-summary-card recommendation">
                <span>Catatan</span>
                <p>{detailData.catatan || "-"}</p>
              </div>

              <div className="risk-summary-card recommendation">
                <span>Kode Wilayah</span>
                <p>{detailData.wilayah?.kode_wilayah || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Hapus Intervensi?"
        message={
          intervensiToDelete
            ? `Data intervensi "${intervensiToDelete.judul}" akan dihapus. Aksi ini tidak dapat dibatalkan.`
            : "Data intervensi akan dihapus. Aksi ini tidak dapat dibatalkan."
        }
        confirmText="Hapus Intervensi"
        cancelText="Batal"
        loading={deleting}
        variant="danger"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}

export default AdminIntervensiPage;