import {
  AlertTriangle,
  BarChart3,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createDataRisiko,
  deleteDataRisiko,
  getDataRisikoList,
  updateDataRisiko,
} from "../../../api/dataRisikoApi";
import { getWilayahList } from "../../../api/wilayahApi";
import ConfirmModal from "../../../components/common/ConfirmModal";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import RiskBadge from "../../../components/dashboard/RiskBadge";
import AdminLayout from "../../../layouts/AdminLayout";
import { formatFactorLabel, formatNumber } from "../../../utils/formatters";

const initialForm = {
  wilayah_id: "",
  periode: "",
  jumlah_ibu_hamil: "",
  jumlah_ibu_hamil_kek: "",
  jumlah_ibu_hamil_anc_tidak_rutin: "",
  akses_air_bersih: "",
  kondisi_sanitasi: "",
  tingkat_ekonomi: "",
  akses_layanan_kesehatan: "",
  pemanfaatan_pangan_lokal: "",
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

function normalizeDataRisiko(item) {
  return {
    ...item,

    wilayah_id: item.wilayah_id || item.wilayah?.id || "",

    jumlah_ibu_hamil:
      item.jumlah_ibu_hamil ?? item.indikator?.jumlah_ibu_hamil ?? 0,

    jumlah_ibu_hamil_kek:
      item.jumlah_ibu_hamil_kek ?? item.indikator?.jumlah_ibu_hamil_kek ?? 0,

    jumlah_ibu_hamil_anc_tidak_rutin:
      item.jumlah_ibu_hamil_anc_tidak_rutin ??
      item.indikator?.jumlah_ibu_hamil_anc_tidak_rutin ??
      0,

    akses_air_bersih:
      item.akses_air_bersih ?? item.indikator?.akses_air_bersih ?? "",

    kondisi_sanitasi:
      item.kondisi_sanitasi ?? item.indikator?.kondisi_sanitasi ?? "",

    tingkat_ekonomi:
      item.tingkat_ekonomi ?? item.indikator?.tingkat_ekonomi ?? "",

    akses_layanan_kesehatan:
      item.akses_layanan_kesehatan ??
      item.indikator?.akses_layanan_kesehatan ??
      "",

    pemanfaatan_pangan_lokal:
      item.pemanfaatan_pangan_lokal ??
      item.indikator?.pemanfaatan_pangan_lokal ??
      "",

    skor_irs: item.skor_irs ?? item.irs?.skor_irs ?? 0,

    kategori_risiko:
      item.kategori_risiko ?? item.irs?.kategori_risiko ?? "rendah",

    faktor_dominan: item.faktor_dominan ?? item.irs?.faktor_dominan ?? null,

    rekomendasi_awal: item.rekomendasi_awal ?? "",
    catatan: item.catatan ?? "",
  };
}

function formatIndicatorValue(value) {
  const labels = {
    baik: "Baik",
    terbatas: "Terbatas",
    layak: "Layak",
    tidak_layak: "Tidak Layak",
    stabil: "Stabil",
    rentan: "Rentan",
    mudah: "Mudah",
    sulit: "Sulit",
    optimal: "Optimal",
    belum_optimal: "Belum Optimal",
  };

  return labels[value] || value || "-";
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

function generatePeriodOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const startYear = currentYear - 3;
  const periods = [];

  for (let year = currentYear; year >= startYear; year -= 1) {
    const lastMonth = year === currentYear ? currentMonth : 12;

    for (let month = lastMonth; month >= 1; month -= 1) {
      const monthValue = String(month).padStart(2, "0");
      const value = `${year}-${monthValue}`;

      periods.push({
        value,
        label: `${MONTH_NAMES[month - 1]} ${year}`,
      });
    }
  }

  return periods;
}

function AdminDataRisikoPage() {
  const [dataRisikoList, setDataRisikoList] = useState(() => {
  const cached = sessionStorage.getItem("gizidesa_data_risiko_cache");

  if (!cached) {
    return [];
  }

  try {
    return JSON.parse(cached);
  } catch {
    return [];
  }
});
  const [wilayahList, setWilayahList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");

  const [formData, setFormData] = useState(initialForm);
  const [selectedDataRisiko, setSelectedDataRisiko] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [dataToDelete, setDataToDelete] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const periodOptions = useMemo(() => generatePeriodOptions(), []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [risikoResponse, wilayahResponse] = await Promise.all([
        getDataRisikoList(),
        getWilayahList(),
      ]);

      const risikoData =
        risikoResponse.data ||
        risikoResponse.data_risiko ||
        risikoResponse.items ||
        risikoResponse ||
        [];

      const wilayahData =
        wilayahResponse.data ||
        wilayahResponse.wilayah ||
        wilayahResponse.items ||
        wilayahResponse ||
        [];

      const normalizedRisiko = Array.isArray(risikoData)
        ? risikoData.map((item) => normalizeDataRisiko(item))
        : [];

      setDataRisikoList(normalizedRisiko);
        sessionStorage.setItem(
        "gizidesa_data_risiko_cache",
        JSON.stringify(normalizedRisiko)
        );
      setWilayahList(Array.isArray(wilayahData) ? wilayahData : []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data risiko gagal dimuat. Pastikan backend aktif dan token login valid."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
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

  const usedPeriodsBySelectedWilayah = useMemo(() => {
    if (!formData.wilayah_id) {
      return [];
    }

    return dataRisikoList
      .filter((item) => {
        const sameWilayah = String(item.wilayah_id) === String(formData.wilayah_id);

        const notEditedItem = selectedDataRisiko
          ? String(item.id) !== String(selectedDataRisiko.id)
          : true;

        return sameWilayah && notEditedItem;
      })
      .map((item) => item.periode);
  }, [dataRisikoList, formData.wilayah_id, selectedDataRisiko]);

  const filteredDataRisiko = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return dataRisikoList.filter((item) => {
      const wilayahText = `${item.wilayah?.nama_dusun || ""} ${
        item.wilayah?.nama_rt || ""
      } ${item.wilayah?.kode_wilayah || ""}`.toLowerCase();

      const factorText = formatFactorLabel(item.faktor_dominan).toLowerCase();
      const periodText = `${item.periode || ""} ${formatPeriodLabel(
        item.periode
      )}`.toLowerCase();
      const categoryText = String(item.kategori_risiko || "").toLowerCase();
      const recommendationText = String(
        item.rekomendasi_awal || ""
      ).toLowerCase();

      const matchKeyword =
        !keyword ||
        wilayahText.includes(keyword) ||
        factorText.includes(keyword) ||
        periodText.includes(keyword) ||
        categoryText.includes(keyword) ||
        recommendationText.includes(keyword);

      const matchCategory =
        categoryFilter === "semua" || item.kategori_risiko === categoryFilter;

      return matchKeyword && matchCategory;
    });
  }, [dataRisikoList, searchKeyword, categoryFilter]);

  const totalRisiko = dataRisikoList.length;

  const totalRendah = useMemo(() => {
    return dataRisikoList.filter((item) => item.kategori_risiko === "rendah")
      .length;
  }, [dataRisikoList]);

  const totalSedang = useMemo(() => {
    return dataRisikoList.filter((item) => item.kategori_risiko === "sedang")
      .length;
  }, [dataRisikoList]);

  const totalTinggi = useMemo(() => {
    return dataRisikoList.filter((item) => item.kategori_risiko === "tinggi")
      .length;
  }, [dataRisikoList]);

  const handleOpenCreateModal = () => {
    setSelectedDataRisiko(null);
    setFormData(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    const normalizedItem = normalizeDataRisiko(item);

    setSelectedDataRisiko(normalizedItem);

    setFormData({
      wilayah_id: normalizedItem.wilayah_id || normalizedItem.wilayah?.id || "",
      periode: normalizedItem.periode || "",
      jumlah_ibu_hamil: normalizedItem.jumlah_ibu_hamil ?? "",
      jumlah_ibu_hamil_kek: normalizedItem.jumlah_ibu_hamil_kek ?? "",
      jumlah_ibu_hamil_anc_tidak_rutin:
        normalizedItem.jumlah_ibu_hamil_anc_tidak_rutin ?? "",
      akses_air_bersih: normalizedItem.akses_air_bersih ?? "",
      kondisi_sanitasi: normalizedItem.kondisi_sanitasi ?? "",
      tingkat_ekonomi: normalizedItem.tingkat_ekonomi ?? "",
      akses_layanan_kesehatan:
        normalizedItem.akses_layanan_kesehatan ?? "",
      pemanfaatan_pangan_lokal:
        normalizedItem.pemanfaatan_pangan_lokal ?? "",
      catatan: normalizedItem.catatan || "",
    });

    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (saving) {
      return;
    }

    setFormModalOpen(false);
    setSelectedDataRisiko(null);
    setFormData(initialForm);
    setFormErrorMessage("");
    setFieldErrors({});
  };

  const handleOpenDetailModal = (item) => {
    setDetailData(normalizeDataRisiko(item));
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setDetailData(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "wilayah_id" ? { periode: "" } : {}),
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previous) => {
        const updated = { ...previous };
        delete updated[name];

        if (name === "wilayah_id") {
          delete updated.periode;
        }

        return updated;
      });
    }

    if (formErrorMessage) {
      setFormErrorMessage("");
    }
  };

  const validateForm = () => {
    const errors = {};
    const jumlahIbuHamil = Number(formData.jumlah_ibu_hamil || 0);
    const jumlahKek = Number(formData.jumlah_ibu_hamil_kek || 0);
    const jumlahAncTidakRutin = Number(
      formData.jumlah_ibu_hamil_anc_tidak_rutin || 0
    );

    if (!formData.wilayah_id) {
      errors.wilayah_id = "Wilayah wajib dipilih.";
    }

    if (!formData.periode) {
      errors.periode = "Periode wajib dipilih.";
    }

    if (
      formData.wilayah_id &&
      formData.periode &&
      usedPeriodsBySelectedWilayah.includes(formData.periode)
    ) {
      errors.periode =
        "Data risiko untuk wilayah dan periode ini sudah tersedia.";
    }

    if (formData.jumlah_ibu_hamil === "") {
      errors.jumlah_ibu_hamil = "Jumlah ibu hamil wajib diisi.";
    } else if (jumlahIbuHamil < 0) {
      errors.jumlah_ibu_hamil = "Jumlah ibu hamil tidak boleh bernilai negatif.";
    }

    if (formData.jumlah_ibu_hamil_kek === "") {
      errors.jumlah_ibu_hamil_kek = "Jumlah ibu hamil KEK wajib diisi.";
    } else if (jumlahKek < 0) {
      errors.jumlah_ibu_hamil_kek =
        "Jumlah ibu hamil KEK tidak boleh bernilai negatif.";
    } else if (jumlahKek > jumlahIbuHamil) {
      errors.jumlah_ibu_hamil_kek =
        "Jumlah ibu hamil KEK tidak boleh melebihi jumlah ibu hamil.";
    }

    if (formData.jumlah_ibu_hamil_anc_tidak_rutin === "") {
      errors.jumlah_ibu_hamil_anc_tidak_rutin =
        "Jumlah ibu hamil dengan ANC tidak rutin wajib diisi.";
    } else if (jumlahAncTidakRutin < 0) {
      errors.jumlah_ibu_hamil_anc_tidak_rutin =
        "Jumlah ibu hamil dengan ANC tidak rutin tidak boleh bernilai negatif.";
    } else if (jumlahAncTidakRutin > jumlahIbuHamil) {
      errors.jumlah_ibu_hamil_anc_tidak_rutin =
        "Jumlah ibu hamil dengan ANC tidak rutin tidak boleh melebihi jumlah ibu hamil.";
    }

    if (formData.akses_air_bersih === "") {
      errors.akses_air_bersih = "Akses air bersih wajib dipilih.";
    }

    if (formData.kondisi_sanitasi === "") {
      errors.kondisi_sanitasi = "Kondisi sanitasi wajib dipilih.";
    }

    if (formData.tingkat_ekonomi === "") {
      errors.tingkat_ekonomi = "Tingkat ekonomi wajib dipilih.";
    }

    if (formData.akses_layanan_kesehatan === "") {
      errors.akses_layanan_kesehatan = "Akses layanan kesehatan wajib dipilih.";
    }

    if (formData.pemanfaatan_pangan_lokal === "") {
      errors.pemanfaatan_pangan_lokal =
        "Pemanfaatan pangan lokal wajib dipilih.";
    }

    setFieldErrors(errors);

    return Object.values(errors)[0] || "";
  };

  const toNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }

    return Number(value);
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
        wilayah_id: Number(formData.wilayah_id),
        periode: formData.periode,
        jumlah_ibu_hamil: toNumber(formData.jumlah_ibu_hamil),
        jumlah_ibu_hamil_kek: toNumber(formData.jumlah_ibu_hamil_kek),
        jumlah_ibu_hamil_anc_tidak_rutin: toNumber(
          formData.jumlah_ibu_hamil_anc_tidak_rutin
        ),
        akses_air_bersih: formData.akses_air_bersih,
        kondisi_sanitasi: formData.kondisi_sanitasi,
        tingkat_ekonomi: formData.tingkat_ekonomi,
        akses_layanan_kesehatan: formData.akses_layanan_kesehatan,
        pemanfaatan_pangan_lokal: formData.pemanfaatan_pangan_lokal,
        catatan: formData.catatan.trim() || null,
      };

      if (selectedDataRisiko) {
        await updateDataRisiko(selectedDataRisiko.id, payload);
        setSuccessMessage("Data risiko berhasil diperbarui.");
      } else {
        await createDataRisiko(payload);
        setSuccessMessage("Data risiko berhasil ditambahkan.");
      }

      setFormModalOpen(false);
      setSelectedDataRisiko(null);
      setFormData(initialForm);
      setFormErrorMessage("");
      setFieldErrors({});

      await fetchInitialData();
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
          Object.values(formattedErrors)[0] || "Validasi data risiko gagal."
        );
      } else {
        setFormErrorMessage(
          error.response?.data?.message ||
            "Data risiko gagal disimpan. Periksa kembali input yang diberikan."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    setDataToDelete(normalizeDataRisiko(item));
    setConfirmOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setConfirmOpen(false);
    setDataToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!dataToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteDataRisiko(dataToDelete.id);

      setSuccessMessage("Data risiko berhasil dihapus.");
      setConfirmOpen(false);
      setDataToDelete(null);

      await fetchInitialData();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data risiko gagal dihapus. Data mungkin masih digunakan oleh intervensi."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getFieldClassName = (field) => {
    return fieldErrors[field] ? "field-invalid" : "";
  };

  return (
    <AdminLayout
      title="Data Risiko & IRS"
      subtitle="Mengelola data indikator risiko, skor IRS, kategori risiko, dan rekomendasi awal."
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
          <span>Total Data Risiko</span>
          <strong>{formatNumber(totalRisiko)}</strong>
          <p>Data indikator tercatat</p>
        </article>

        <article className="admin-metric-card success">
          <span>Risiko Rendah</span>
          <strong>{formatNumber(totalRendah)}</strong>
          <p>Wilayah kategori rendah</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Risiko Sedang</span>
          <strong>{formatNumber(totalSedang)}</strong>
          <p>Wilayah perlu pemantauan</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Risiko Tinggi</span>
          <strong>{formatNumber(totalTinggi)}</strong>
          <p>Wilayah prioritas utama</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Risiko</span>
            <h2>Data Risiko Wilayah</h2>
            <p>
              Data ditampilkan berdasarkan wilayah, periode, skor IRS, kategori
              risiko, faktor dominan, dan rekomendasi awal.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari wilayah, periode, faktor..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <select
              className="admin-filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="semua">Semua Risiko</option>
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="tinggi">Tinggi</option>
            </select>

            <button
              type="button"
              className="admin-primary-button"
              onClick={handleOpenCreateModal}
            >
              <Plus size={18} />
              Tambah Data
            </button>
          </div>
        </div>

        {!loading && filteredDataRisiko.length === 0 ? (
          <EmptyState
            title="Data risiko belum tersedia"
            message="Tambahkan data risiko agar sistem dapat menghitung IRS dan menentukan wilayah prioritas."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>Periode</th>
                  <th>Skor IRS</th>
                  <th>Kategori</th>
                  <th>Faktor Dominan</th>
                  <th>Rekomendasi Awal</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredDataRisiko.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="risk-location-cell">
                        <span>
                          <BarChart3 size={15} />
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

                    <td>{formatPeriodLabel(item.periode)}</td>

                    <td>
                      <strong className="irs-score">
                        {item.skor_irs ?? "-"}
                      </strong>
                    </td>

                    <td>
                      <RiskBadge value={item.kategori_risiko} />
                    </td>

                    <td>{formatFactorLabel(item.faktor_dominan)}</td>

                    <td>
                      <span className="table-muted-text">
                        {item.rekomendasi_awal || "-"}
                      </span>
                    </td>

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
                          title="Edit data"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="table-action-button delete"
                          onClick={() => handleOpenDeleteConfirm(item)}
                          title="Hapus data"
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

      {formModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal large risk-form-modal">
            <div className="admin-modal-header risk-form-header">
              <div>
                <span>Form Data Risiko</span>
                <h2>
                  {selectedDataRisiko
                    ? "Edit Data Risiko"
                    : "Tambah Data Risiko"}
                </h2>
                <p>
                  Isi indikator risiko per wilayah. Skor IRS dan kategori risiko
                  mengikuti logika perhitungan pada backend.
                </p>
              </div>

              <button type="button" onClick={handleCloseFormModal}>
                <X size={20} />
              </button>
            </div>

            {formErrorMessage && (
              <div className="admin-form-error compact">
                <strong>Periksa kembali input</strong>
                <p>{formErrorMessage}</p>
              </div>
            )}

            <form className="admin-form risk-compact-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid risk-form-grid">
                <label>
                  <span>Wilayah</span>
                  <select
                    name="wilayah_id"
                    value={formData.wilayah_id}
                    className={getFieldClassName("wilayah_id")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih wilayah</option>
                    {wilayahList.map((wilayah) => (
                      <option key={wilayah.id} value={wilayah.id}>
                        {wilayah.nama_dusun} - {wilayah.nama_rt} (
                        {wilayah.kode_wilayah})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.wilayah_id && (
                    <small className="field-error-text">
                      {fieldErrors.wilayah_id}
                    </small>
                  )}
                </label>

                <label>
                  <span>Periode</span>
                  <select
                    name="periode"
                    value={formData.periode}
                    className={getFieldClassName("periode")}
                    onChange={handleChange}
                    disabled={!formData.wilayah_id}
                  >
                    <option value="">
                      {formData.wilayah_id
                        ? "Pilih periode"
                        : "Pilih wilayah terlebih dahulu"}
                    </option>

                    {periodOptions.map((period) => {
                      const isUsed = usedPeriodsBySelectedWilayah.includes(
                        period.value
                      );

                      return (
                        <option
                          key={period.value}
                          value={period.value}
                          disabled={isUsed}
                        >
                          {isUsed
                            ? `${period.label} - Sudah tersedia`
                            : period.label}
                        </option>
                      );
                    })}
                  </select>
                  {fieldErrors.periode && (
                    <small className="field-error-text">
                      {fieldErrors.periode}
                    </small>
                  )}
                </label>

                <label>
                  <span>Jumlah Ibu Hamil</span>
                  <input
                    type="number"
                    min="0"
                    name="jumlah_ibu_hamil"
                    value={formData.jumlah_ibu_hamil}
                    className={getFieldClassName("jumlah_ibu_hamil")}
                    placeholder="Contoh: 12"
                    onChange={handleChange}
                  />
                  {fieldErrors.jumlah_ibu_hamil && (
                    <small className="field-error-text">
                      {fieldErrors.jumlah_ibu_hamil}
                    </small>
                  )}
                </label>

                <label>
                  <span>Ibu Hamil KEK</span>
                  <input
                    type="number"
                    min="0"
                    name="jumlah_ibu_hamil_kek"
                    value={formData.jumlah_ibu_hamil_kek}
                    className={getFieldClassName("jumlah_ibu_hamil_kek")}
                    placeholder="Contoh: 2"
                    onChange={handleChange}
                  />
                  {fieldErrors.jumlah_ibu_hamil_kek && (
                    <small className="field-error-text">
                      {fieldErrors.jumlah_ibu_hamil_kek}
                    </small>
                  )}
                </label>

                <label>
                  <span>ANC Tidak Rutin</span>
                  <input
                    type="number"
                    min="0"
                    name="jumlah_ibu_hamil_anc_tidak_rutin"
                    value={formData.jumlah_ibu_hamil_anc_tidak_rutin}
                    className={getFieldClassName(
                      "jumlah_ibu_hamil_anc_tidak_rutin"
                    )}
                    placeholder="Contoh: 1"
                    onChange={handleChange}
                  />
                  {fieldErrors.jumlah_ibu_hamil_anc_tidak_rutin && (
                    <small className="field-error-text">
                      {fieldErrors.jumlah_ibu_hamil_anc_tidak_rutin}
                    </small>
                  )}
                </label>

                <label>
                  <span>Akses Air Bersih</span>
                  <select
                    name="akses_air_bersih"
                    value={formData.akses_air_bersih}
                    className={getFieldClassName("akses_air_bersih")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="baik">Baik</option>
                    <option value="terbatas">Terbatas</option>
                  </select>
                  {fieldErrors.akses_air_bersih && (
                    <small className="field-error-text">
                      {fieldErrors.akses_air_bersih}
                    </small>
                  )}
                </label>

                <label>
                  <span>Kondisi Sanitasi</span>
                  <select
                    name="kondisi_sanitasi"
                    value={formData.kondisi_sanitasi}
                    className={getFieldClassName("kondisi_sanitasi")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="layak">Layak</option>
                    <option value="tidak_layak">Tidak Layak</option>
                  </select>
                  {fieldErrors.kondisi_sanitasi && (
                    <small className="field-error-text">
                      {fieldErrors.kondisi_sanitasi}
                    </small>
                  )}
                </label>

                <label>
                  <span>Tingkat Ekonomi</span>
                  <select
                    name="tingkat_ekonomi"
                    value={formData.tingkat_ekonomi}
                    className={getFieldClassName("tingkat_ekonomi")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="stabil">Stabil</option>
                    <option value="rentan">Rentan</option>
                  </select>
                  {fieldErrors.tingkat_ekonomi && (
                    <small className="field-error-text">
                      {fieldErrors.tingkat_ekonomi}
                    </small>
                  )}
                </label>

                <label>
                  <span>Akses Layanan Kesehatan</span>
                  <select
                    name="akses_layanan_kesehatan"
                    value={formData.akses_layanan_kesehatan}
                    className={getFieldClassName("akses_layanan_kesehatan")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="mudah">Mudah</option>
                    <option value="sulit">Sulit</option>
                  </select>
                  {fieldErrors.akses_layanan_kesehatan && (
                    <small className="field-error-text">
                      {fieldErrors.akses_layanan_kesehatan}
                    </small>
                  )}
                </label>

                <label>
                  <span>Pemanfaatan Pangan Lokal</span>
                  <select
                    name="pemanfaatan_pangan_lokal"
                    value={formData.pemanfaatan_pangan_lokal}
                    className={getFieldClassName("pemanfaatan_pangan_lokal")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="optimal">Optimal</option>
                    <option value="belum_optimal">Belum Optimal</option>
                  </select>
                  {fieldErrors.pemanfaatan_pangan_lokal && (
                    <small className="field-error-text">
                      {fieldErrors.pemanfaatan_pangan_lokal}
                    </small>
                  )}
                </label>
              </div>

              <label className="risk-note-field">
                <span>Catatan</span>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  placeholder="Opsional, misalnya kondisi dominan atau temuan lapangan."
                  onChange={handleChange}
                />
              </label>

              <div className="admin-form-actions risk-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={handleCloseFormModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Data Risiko"}
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
                <span>Detail IRS</span>
                <h2>
                  {detailData.wilayah?.nama_dusun || "-"} -{" "}
                  {detailData.wilayah?.nama_rt || "-"}
                </h2>
                <p>
                  Ringkasan indikator risiko, skor IRS, faktor dominan, dan
                  rekomendasi awal untuk wilayah pemantauan.
                </p>
              </div>

              <button type="button" onClick={handleCloseDetailModal}>
                <X size={20} />
              </button>
            </div>

            <div className="risk-detail-summary">
              <div className="risk-score-panel">
                <span>Skor IRS</span>
                <strong>{detailData.skor_irs ?? "-"}</strong>
                <RiskBadge value={detailData.kategori_risiko} />
              </div>

              <div className="risk-summary-grid">
                <div className="risk-summary-card">
                  <span>Periode</span>
                  <p>{formatPeriodLabel(detailData.periode)}</p>
                </div>

                <div className="risk-summary-card">
                  <span>Kode Wilayah</span>
                  <p>{detailData.wilayah?.kode_wilayah || "-"}</p>
                </div>

                <div className="risk-summary-card">
                  <span>Faktor Dominan</span>
                  <p>{formatFactorLabel(detailData.faktor_dominan)}</p>
                </div>

                <div className="risk-summary-card recommendation">
                  <span>Rekomendasi Awal</span>
                  <p>{detailData.rekomendasi_awal || "-"}</p>
                </div>
              </div>
            </div>

            <div className="risk-section-title">
              <span>Indikator Risiko</span>
              <p>Data indikator yang digunakan sebagai dasar perhitungan IRS.</p>
            </div>

            <div className="risk-indicator-grid refined">
              <IndicatorItem
                label="Jumlah Ibu Hamil"
                value={detailData.jumlah_ibu_hamil}
              />

              <IndicatorItem
                label="Ibu Hamil KEK"
                value={detailData.jumlah_ibu_hamil_kek}
              />

              <IndicatorItem
                label="ANC Tidak Rutin"
                value={detailData.jumlah_ibu_hamil_anc_tidak_rutin}
              />

              <IndicatorItem
                label="Akses Air Bersih"
                value={formatIndicatorValue(detailData.akses_air_bersih)}
              />

              <IndicatorItem
                label="Kondisi Sanitasi"
                value={formatIndicatorValue(detailData.kondisi_sanitasi)}
              />

              <IndicatorItem
                label="Tingkat Ekonomi"
                value={formatIndicatorValue(detailData.tingkat_ekonomi)}
              />

              <IndicatorItem
                label="Akses Kesehatan"
                value={formatIndicatorValue(
                  detailData.akses_layanan_kesehatan
                )}
              />

              <IndicatorItem
                label="Pemanfaatan Pangan Lokal"
                value={formatIndicatorValue(
                  detailData.pemanfaatan_pangan_lokal
                )}
              />
            </div>

            {detailData.catatan && (
              <div className="risk-note-box refined">
                <AlertTriangle size={18} />
                <p>{detailData.catatan}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Hapus Data Risiko?"
        message={
          dataToDelete
            ? `Data risiko ${dataToDelete.wilayah?.nama_dusun || ""} - ${
                dataToDelete.wilayah?.nama_rt || ""
              } periode ${formatPeriodLabel(
                dataToDelete.periode
              )} akan dihapus. Aksi ini tidak dapat dibatalkan.`
            : "Data risiko akan dihapus. Aksi ini tidak dapat dibatalkan."
        }
        confirmText="Hapus Data"
        cancelText="Batal"
        loading={deleting}
        variant="danger"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}

function IndicatorItem({ label, value }) {
  return (
    <div className="risk-indicator-item">
      <span>{label}</span>
      <p>{value ?? "-"}</p>
    </div>
  );
}

export default AdminDataRisikoPage;