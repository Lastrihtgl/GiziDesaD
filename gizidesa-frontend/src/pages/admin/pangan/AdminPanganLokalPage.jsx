import {
  Edit,
  Leaf,
  Plus,
  Search,
  Sprout,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createPanganLokal,
  deletePanganLokal,
  getPanganLokalList,
  updatePanganLokal,
} from "../../../api/panganLokalApi";
import ConfirmModal from "../../../components/common/ConfirmModal";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import AdminLayout from "../../../layouts/AdminLayout";
import { formatNumber } from "../../../utils/formatters";

const CACHE_KEY = "gizidesa_pangan_lokal_cache";

const initialForm = {
  nama_pangan: "",
  kategori: "",
  manfaat_gizi: "",
  ketersediaan: "",
  rekomendasi_pemanfaatan: "",
  catatan: "",
};

function readCachedPangan() {
  const cached = sessionStorage.getItem(CACHE_KEY);

  if (!cached) {
    return [];
  }

  try {
    return JSON.parse(cached);
  } catch {
    return [];
  }
}

function normalizePangan(item) {
  return {
    ...item,
    nama_pangan: item.nama_pangan || item.nama || "",
    kategori: item.kategori || "",
    manfaat_gizi: item.manfaat_gizi || item.manfaat || "",
    ketersediaan: item.ketersediaan || "tersedia",
    rekomendasi_pemanfaatan:
      item.rekomendasi_pemanfaatan || item.rekomendasi || "",
    catatan: item.catatan || "",
  };
}

function formatCategoryLabel(value) {
  const labels = {
    karbohidrat: "Karbohidrat",
    protein_hewani: "Protein Hewani",
    protein_nabati: "Protein Nabati",
    sayur_buah: "Sayur dan Buah",
    pangan_lokal: "Pangan Lokal",
    lainnya: "Lainnya",
  };

  return labels[value] || value || "-";
}

function formatAvailabilityLabel(value) {
  const labels = {
    tersedia: "Tersedia",
    musiman: "Musiman",
    terbatas: "Terbatas",
  };

  return labels[value] || value || "-";
}

function getAvailabilityClass(value) {
  if (value === "tersedia") {
    return "risk-badge risk-badge-rendah";
  }

  if (value === "musiman") {
    return "risk-badge risk-badge-sedang";
  }

  if (value === "terbatas") {
    return "risk-badge risk-badge-tinggi";
  }

  return "risk-badge risk-badge-unknown";
}

function AdminPanganLokalPage() {
  const [panganList, setPanganList] = useState(() =>
    readCachedPangan().map((item) => normalizePangan(item))
  );

  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [availabilityFilter, setAvailabilityFilter] = useState("semua");

  const [formData, setFormData] = useState(initialForm);
  const [selectedPangan, setSelectedPangan] = useState(null);
  const [panganToDelete, setPanganToDelete] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function fetchPanganLokal() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getPanganLokalList();

      const data =
        response.data ||
        response.pangan_lokal ||
        response.items ||
        response ||
        [];

      const normalizedData = Array.isArray(data)
        ? data.map((item) => normalizePangan(item))
        : [];

      setPanganList(normalizedData);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(normalizedData));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data pangan lokal gagal dimuat. Pastikan backend aktif dan token login valid."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPanganLokal();
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

  const filteredPangan = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return panganList.filter((item) => {
      const text = `${item.nama_pangan || ""} ${item.kategori || ""} ${
        item.manfaat_gizi || ""
      } ${item.ketersediaan || ""} ${
        item.rekomendasi_pemanfaatan || ""
      } ${item.catatan || ""}`.toLowerCase();

      const matchKeyword = !keyword || text.includes(keyword);

      const matchCategory =
        categoryFilter === "semua" || item.kategori === categoryFilter;

      const matchAvailability =
        availabilityFilter === "semua" ||
        item.ketersediaan === availabilityFilter;

      return matchKeyword && matchCategory && matchAvailability;
    });
  }, [panganList, searchKeyword, categoryFilter, availabilityFilter]);

  const totalPangan = panganList.length;

  const totalProtein = useMemo(() => {
    return panganList.filter((item) =>
      ["protein_hewani", "protein_nabati"].includes(item.kategori)
    ).length;
  }, [panganList]);

  const totalSayurBuah = useMemo(() => {
    return panganList.filter((item) => item.kategori === "sayur_buah").length;
  }, [panganList]);

  const totalTersedia = useMemo(() => {
    return panganList.filter((item) => item.ketersediaan === "tersedia")
      .length;
  }, [panganList]);

  const handleOpenCreateModal = () => {
    setSelectedPangan(null);
    setFormData(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    const normalizedItem = normalizePangan(item);

    setSelectedPangan(normalizedItem);
    setFormData({
      nama_pangan: normalizedItem.nama_pangan || "",
      kategori: normalizedItem.kategori || "",
      manfaat_gizi: normalizedItem.manfaat_gizi || "",
      ketersediaan: normalizedItem.ketersediaan || "",
      rekomendasi_pemanfaatan:
        normalizedItem.rekomendasi_pemanfaatan || "",
      catatan: normalizedItem.catatan || "",
    });

    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setSelectedPangan(null);
    setFormData(initialForm);
    setFormErrorMessage("");
    setFieldErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

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

    if (!formData.nama_pangan.trim()) {
      errors.nama_pangan = "Nama pangan lokal wajib diisi.";
    }

    if (!formData.kategori) {
      errors.kategori = "Kategori pangan wajib dipilih.";
    }

    if (!formData.manfaat_gizi.trim()) {
      errors.manfaat_gizi = "Manfaat gizi wajib diisi.";
    }

    if (!formData.ketersediaan) {
      errors.ketersediaan = "Ketersediaan wajib dipilih.";
    }

    if (!formData.rekomendasi_pemanfaatan.trim()) {
      errors.rekomendasi_pemanfaatan =
        "Rekomendasi pemanfaatan wajib diisi.";
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
        nama_pangan: formData.nama_pangan.trim(),
        kategori: formData.kategori,
        manfaat_gizi: formData.manfaat_gizi.trim(),
        ketersediaan: formData.ketersediaan,
        rekomendasi_pemanfaatan:
          formData.rekomendasi_pemanfaatan.trim(),
        catatan: formData.catatan.trim() || null,
      };

      if (selectedPangan) {
        await updatePanganLokal(selectedPangan.id, payload);
        setSuccessMessage("Data pangan lokal berhasil diperbarui.");
      } else {
        await createPanganLokal(payload);
        setSuccessMessage("Data pangan lokal berhasil ditambahkan.");
      }

      setModalOpen(false);
      setSelectedPangan(null);
      setFormData(initialForm);
      setFormErrorMessage("");
      setFieldErrors({});

      await fetchPanganLokal();
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
            "Validasi data pangan lokal gagal."
        );
      } else {
        setFormErrorMessage(
          error.response?.data?.message ||
            "Data pangan lokal gagal disimpan. Periksa kembali input yang diberikan."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    setPanganToDelete(normalizePangan(item));
    setConfirmOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setConfirmOpen(false);
    setPanganToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!panganToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deletePanganLokal(panganToDelete.id);

      setSuccessMessage("Data pangan lokal berhasil dihapus.");
      setConfirmOpen(false);
      setPanganToDelete(null);

      await fetchPanganLokal();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data pangan lokal gagal dihapus. Data mungkin masih digunakan oleh rekomendasi atau intervensi."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Pangan Lokal"
      subtitle="Mengelola referensi pangan lokal sebagai bahan edukasi gizi dan pendukung intervensi desa."
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
          <span>Total Pangan Lokal</span>
          <strong>{formatNumber(totalPangan)}</strong>
          <p>Referensi pangan tercatat</p>
        </article>

        <article className="admin-metric-card success">
          <span>Sumber Protein</span>
          <strong>{formatNumber(totalProtein)}</strong>
          <p>Protein hewani dan nabati</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Sayur dan Buah</span>
          <strong>{formatNumber(totalSayurBuah)}</strong>
          <p>Sumber vitamin dan mineral</p>
        </article>

        <article className="admin-metric-card success">
          <span>Tersedia</span>
          <strong>{formatNumber(totalTersedia)}</strong>
          <p>Mudah diperoleh di desa</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Pangan Lokal</span>
            <h2>Referensi Edukasi Pangan</h2>
            <p>
              Data pangan lokal digunakan untuk mendukung edukasi gizi,
              rekomendasi pemanfaatan bahan pangan, dan intervensi berbasis
              potensi desa.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari pangan, manfaat, rekomendasi..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <select
              className="admin-filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="semua">Semua Kategori</option>
              <option value="karbohidrat">Karbohidrat</option>
              <option value="protein_hewani">Protein Hewani</option>
              <option value="protein_nabati">Protein Nabati</option>
              <option value="sayur_buah">Sayur dan Buah</option>
              <option value="pangan_lokal">Pangan Lokal</option>
              <option value="lainnya">Lainnya</option>
            </select>

            <select
              className="admin-filter-select"
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="musiman">Musiman</option>
              <option value="terbatas">Terbatas</option>
            </select>

            <button
              type="button"
              className="admin-primary-button"
              onClick={handleOpenCreateModal}
            >
              <Plus size={18} />
              Tambah Pangan
            </button>
          </div>
        </div>

        {filteredPangan.length === 0 ? (
          <EmptyState
            title={
              loading
                ? "Data pangan lokal sedang diperbarui"
                : "Data pangan lokal belum tersedia"
            }
            message={
              loading
                ? "Data akan tampil otomatis setelah berhasil dimuat."
                : "Tambahkan referensi pangan lokal agar dapat digunakan sebagai bahan edukasi dan intervensi."
            }
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Pangan</th>
                  <th>Kategori</th>
                  <th>Manfaat Gizi</th>
                  <th>Ketersediaan</th>
                  <th>Rekomendasi</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredPangan.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="risk-location-cell">
                        <span>
                          <Leaf size={15} />
                        </span>
                        <div>
                          <strong>{item.nama_pangan || "-"}</strong>
                          <small>{item.catatan || "Referensi pangan lokal"}</small>
                        </div>
                      </div>
                    </td>

                    <td>{formatCategoryLabel(item.kategori)}</td>

                    <td>
                      <span className="table-muted-text">
                        {item.manfaat_gizi || "-"}
                      </span>
                    </td>

                    <td>
                      <span className={getAvailabilityClass(item.ketersediaan)}>
                        {formatAvailabilityLabel(item.ketersediaan)}
                      </span>
                    </td>

                    <td>
                      <span className="table-muted-text">
                        {item.rekomendasi_pemanfaatan || "-"}
                      </span>
                    </td>

                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-button edit"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit pangan lokal"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="table-action-button delete"
                          onClick={() => handleOpenDeleteConfirm(item)}
                          title="Hapus pangan lokal"
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
              <span>Edukasi</span>
              <h2>Peran Pangan Lokal</h2>
              <p>
                Referensi pangan lokal membantu admin dan kader menyampaikan
                edukasi gizi dengan bahan pangan yang dekat dengan masyarakat.
              </p>
            </div>
          </div>

          <div className="recent-intervention-list">
            <div className="recent-intervention-item">
              <div className="recent-icon">
                <Utensils size={18} />
              </div>
              <div>
                <strong>Penguatan Konsumsi Bergizi</strong>
                <p>
                  Pangan lokal dapat diarahkan untuk memenuhi kebutuhan gizi ibu
                  hamil dan keluarga.
                </p>
                <small>Edukasi gizi keluarga</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <Sprout size={18} />
              </div>
              <div>
                <strong>Berbasis Potensi Desa</strong>
                <p>
                  Pemanfaatan bahan pangan setempat membuat rekomendasi lebih
                  mudah diterapkan.
                </p>
                <small>Intervensi kontekstual</small>
              </div>
            </div>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Klasifikasi</span>
              <h2>Kategori Pangan</h2>
              <p>
                Kategori membantu admin menyusun edukasi pangan secara lebih
                terarah dan mudah dipahami.
              </p>
            </div>
          </div>

          <div className="recent-intervention-list">
            <div className="recent-intervention-item">
              <div className="recent-icon">
                <Leaf size={18} />
              </div>
              <div>
                <strong>Karbohidrat, Protein, Sayur, dan Buah</strong>
                <p>
                  Klasifikasi digunakan untuk membedakan fungsi bahan pangan
                  dalam edukasi gizi.
                </p>
                <small>Referensi edukasi pangan</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <Sprout size={18} />
              </div>
              <div>
                <strong>Ketersediaan</strong>
                <p>
                  Status tersedia, musiman, atau terbatas membantu admin memilih
                  rekomendasi yang realistis.
                </p>
                <small>Kesesuaian kondisi desa</small>
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
                <span>Form Pangan Lokal</span>
                <h2>
                  {selectedPangan
                    ? "Edit Pangan Lokal"
                    : "Tambah Pangan Lokal"}
                </h2>
                <p>
                  Lengkapi referensi pangan lokal agar dapat digunakan sebagai
                  bahan edukasi dan rekomendasi intervensi.
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

            <form className="admin-form risk-compact-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid risk-form-grid">
                <label>
                  <span>Nama Pangan Lokal</span>
                  <input
                    type="text"
                    name="nama_pangan"
                    value={formData.nama_pangan}
                    className={getFieldClassName("nama_pangan")}
                    placeholder="Contoh: Ikan mujair"
                    onChange={handleChange}
                  />
                  {fieldErrors.nama_pangan && (
                    <small className="field-error-text">
                      {fieldErrors.nama_pangan}
                    </small>
                  )}
                </label>

                <label>
                  <span>Kategori</span>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    className={getFieldClassName("kategori")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih kategori</option>
                    <option value="karbohidrat">Karbohidrat</option>
                    <option value="protein_hewani">Protein Hewani</option>
                    <option value="protein_nabati">Protein Nabati</option>
                    <option value="sayur_buah">Sayur dan Buah</option>
                    <option value="pangan_lokal">Pangan Lokal</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                  {fieldErrors.kategori && (
                    <small className="field-error-text">
                      {fieldErrors.kategori}
                    </small>
                  )}
                </label>

                <label>
                  <span>Ketersediaan</span>
                  <select
                    name="ketersediaan"
                    value={formData.ketersediaan}
                    className={getFieldClassName("ketersediaan")}
                    onChange={handleChange}
                  >
                    <option value="">Pilih ketersediaan</option>
                    <option value="tersedia">Tersedia</option>
                    <option value="musiman">Musiman</option>
                    <option value="terbatas">Terbatas</option>
                  </select>
                  {fieldErrors.ketersediaan && (
                    <small className="field-error-text">
                      {fieldErrors.ketersediaan}
                    </small>
                  )}
                </label>

                <label>
                  <span>Catatan</span>
                  <input
                    type="text"
                    name="catatan"
                    value={formData.catatan}
                    placeholder="Opsional, misalnya mudah ditemukan di pasar desa."
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label className="risk-note-field">
                <span>Manfaat Gizi</span>
                <textarea
                  name="manfaat_gizi"
                  value={formData.manfaat_gizi}
                  className={getFieldClassName("manfaat_gizi")}
                  placeholder="Contoh: Mengandung protein untuk mendukung pertumbuhan dan pemulihan gizi."
                  onChange={handleChange}
                />
                {fieldErrors.manfaat_gizi && (
                  <small className="field-error-text">
                    {fieldErrors.manfaat_gizi}
                  </small>
                )}
              </label>

              <label className="risk-note-field">
                <span>Rekomendasi Pemanfaatan</span>
                <textarea
                  name="rekomendasi_pemanfaatan"
                  value={formData.rekomendasi_pemanfaatan}
                  className={getFieldClassName("rekomendasi_pemanfaatan")}
                  placeholder="Contoh: Dianjurkan sebagai lauk keluarga dengan pengolahan rendah minyak."
                  onChange={handleChange}
                />
                {fieldErrors.rekomendasi_pemanfaatan && (
                  <small className="field-error-text">
                    {fieldErrors.rekomendasi_pemanfaatan}
                  </small>
                )}
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
                  {saving ? "Menyimpan..." : "Simpan Pangan Lokal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Hapus Pangan Lokal?"
        message={
          panganToDelete
            ? `Data ${panganToDelete.nama_pangan} akan dihapus. Aksi ini tidak dapat dibatalkan.`
            : "Data pangan lokal akan dihapus. Aksi ini tidak dapat dibatalkan."
        }
        confirmText="Hapus Pangan"
        cancelText="Batal"
        loading={deleting}
        variant="danger"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}

export default AdminPanganLokalPage;