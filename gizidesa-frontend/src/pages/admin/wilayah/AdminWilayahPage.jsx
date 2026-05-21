import { Edit, MapPin, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createWilayah,
  deleteWilayah,
  getWilayahList,
  updateWilayah,
} from "../../../api/wilayahApi";
import ConfirmModal from "../../../components/common/ConfirmModal";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import AdminLayout from "../../../layouts/AdminLayout";

const initialForm = {
  nama_dusun: "",
  nama_rt: "",
  kode_wilayah: "",
  keterangan: "",
};

function AdminWilayahPage() {
  const [wilayahList, setWilayahList] = useState(() => {
    const cached = sessionStorage.getItem("gizidesa_wilayah_cache");

    if (!cached) {
        return [];
    }

    try {
        return JSON.parse(cached);
    } catch {
        return [];
    }
    });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [wilayahToDelete, setWilayahToDelete] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function fetchWilayah() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getWilayahList();

      const data =
        response.data ||
        response.wilayah ||
        response.items ||
        response ||
        [];

      const normalizedData = Array.isArray(data) ? data : [];

    setWilayahList(normalizedData);
    sessionStorage.setItem(
        "gizidesa_wilayah_cache",
        JSON.stringify(normalizedData)
        );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data wilayah gagal dimuat. Pastikan backend aktif dan token login valid."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWilayah();
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
    }, 4500);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const filteredWilayah = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    if (!keyword) {
      return wilayahList;
    }

    return wilayahList.filter((item) => {
      const dusun = item.nama_dusun?.toLowerCase() || "";
      const rt = item.nama_rt?.toLowerCase() || "";
      const kode = item.kode_wilayah?.toLowerCase() || "";
      const keterangan = item.keterangan?.toLowerCase() || "";

      return (
        dusun.includes(keyword) ||
        rt.includes(keyword) ||
        kode.includes(keyword) ||
        keterangan.includes(keyword)
      );
    });
  }, [searchKeyword, wilayahList]);

  const totalWilayah = wilayahList.length;

  const totalDusun = useMemo(() => {
    const dusunSet = new Set(
      wilayahList.map((item) => item.nama_dusun).filter(Boolean)
    );

    return dusunSet.size;
  }, [wilayahList]);

  const totalDataAktif = filteredWilayah.length;

  const handleOpenCreateModal = () => {
    setSelectedWilayah(null);
    setFormData(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedWilayah(item);
    setFormData({
      nama_dusun: item.nama_dusun || "",
      nama_rt: item.nama_rt || "",
      kode_wilayah: item.kode_wilayah || "",
      keterangan: item.keterangan || "",
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
    setSelectedWilayah(null);
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

    if (!formData.nama_dusun.trim()) {
      errors.nama_dusun = "Nama dusun wajib diisi.";
    }

    if (!formData.nama_rt.trim()) {
      errors.nama_rt = "Nama RT wajib diisi.";
    }

    if (!formData.kode_wilayah.trim()) {
      errors.kode_wilayah = "Kode wilayah wajib diisi.";
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
        nama_dusun: formData.nama_dusun.trim(),
        nama_rt: formData.nama_rt.trim(),
        kode_wilayah: formData.kode_wilayah.trim(),
        keterangan: formData.keterangan.trim() || null,
      };

      if (selectedWilayah) {
        await updateWilayah(selectedWilayah.id, payload);
        setSuccessMessage("Data wilayah berhasil diperbarui.");
      } else {
        await createWilayah(payload);
        setSuccessMessage("Data wilayah berhasil ditambahkan.");
      }

      setModalOpen(false);
      setSelectedWilayah(null);
      setFormData(initialForm);
      setFormErrorMessage("");
      setFieldErrors({});

      await fetchWilayah();
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
          Object.values(formattedErrors)[0] || "Validasi data wilayah gagal."
        );
      } else {
        setFormErrorMessage(
          error.response?.data?.message ||
            "Data wilayah gagal disimpan. Periksa kembali input yang diberikan."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    setWilayahToDelete(item);
    setConfirmOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setConfirmOpen(false);
    setWilayahToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!wilayahToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteWilayah(wilayahToDelete.id);

      setSuccessMessage("Data wilayah berhasil dihapus.");
      setConfirmOpen(false);
      setWilayahToDelete(null);

      await fetchWilayah();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data wilayah gagal dihapus. Wilayah mungkin masih digunakan oleh data risiko atau intervensi."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Kelola Wilayah"
      subtitle="Mengelola data dusun dan RT sebagai basis pemetaan risiko stunting."
    >
      <ErrorAlert message={errorMessage} />

      {successMessage && (
        <div className="admin-success-alert">
          <strong>Berhasil</strong>
          <p>{successMessage}</p>
        </div>
      )}

      <section className="admin-overview-grid wilayah-overview">
        <article className="admin-metric-card">
          <span>Total Wilayah</span>
          <strong>{totalWilayah}</strong>
          <p>RT/Dusun terdaftar</p>
        </article>

        <article className="admin-metric-card success">
          <span>Total Dusun</span>
          <strong>{totalDusun}</strong>
          <p>Kelompok dusun unik</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Data Aktif</span>
          <strong>{totalDataAktif}</strong>
          <p>Hasil sesuai pencarian</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Wilayah</span>
            <h2>Wilayah Pemantauan</h2>
            <p>
              Data wilayah menjadi referensi utama untuk input data risiko,
              perhitungan IRS, rekomendasi, intervensi, dan laporan desa.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari dusun, RT, atau kode..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={handleOpenCreateModal}
            >
              <Plus size={18} />
              Tambah Wilayah
            </button>
          </div>
        </div>

        {filteredWilayah.length === 0 ? (
          <EmptyState
            title="Data wilayah belum tersedia"
            message="Tambahkan data dusun/RT agar sistem dapat digunakan untuk pemetaan risiko."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kode Wilayah</th>
                  <th>Dusun</th>
                  <th>RT</th>
                  <th>Keterangan</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredWilayah.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-code-cell">
                        <span>
                          <MapPin size={15} />
                        </span>
                        <strong>{item.kode_wilayah || "-"}</strong>
                      </div>
                    </td>

                    <td>{item.nama_dusun || "-"}</td>
                    <td>{item.nama_rt || "-"}</td>
                    <td>
                      <span className="table-muted-text">
                        {item.keterangan || "-"}
                      </span>
                    </td>

                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-button edit"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit wilayah"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="table-action-button delete"
                          onClick={() => handleOpenDeleteConfirm(item)}
                          title="Hapus wilayah"
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

      {modalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <span>Form Wilayah</span>
                <h2>{selectedWilayah ? "Edit Wilayah" : "Tambah Wilayah"}</h2>
                <p>
                  Lengkapi data wilayah agar dapat digunakan pada pencatatan
                  risiko, perhitungan IRS, dan intervensi.
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

            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                <span>Nama Dusun</span>
                <input
                  type="text"
                  name="nama_dusun"
                  value={formData.nama_dusun}
                  className={getFieldClassName("nama_dusun")}
                  placeholder="Contoh: Dusun I"
                  onChange={handleChange}
                />
                {fieldErrors.nama_dusun && (
                  <small className="field-error-text">
                    {fieldErrors.nama_dusun}
                  </small>
                )}
              </label>

              <label>
                <span>Nama RT</span>
                <input
                  type="text"
                  name="nama_rt"
                  value={formData.nama_rt}
                  className={getFieldClassName("nama_rt")}
                  placeholder="Contoh: RT 01"
                  onChange={handleChange}
                />
                {fieldErrors.nama_rt && (
                  <small className="field-error-text">
                    {fieldErrors.nama_rt}
                  </small>
                )}
              </label>

              <label>
                <span>Kode Wilayah</span>
                <input
                  type="text"
                  name="kode_wilayah"
                  value={formData.kode_wilayah}
                  className={getFieldClassName("kode_wilayah")}
                  placeholder="Contoh: DSN1-RT01"
                  onChange={handleChange}
                />
                {fieldErrors.kode_wilayah && (
                  <small className="field-error-text">
                    {fieldErrors.kode_wilayah}
                  </small>
                )}
              </label>

              <label>
                <span>Keterangan</span>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  placeholder="Opsional, misalnya catatan lokasi atau informasi tambahan."
                  onChange={handleChange}
                />
              </label>

              <div className="admin-form-actions">
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
                  {saving ? "Menyimpan..." : "Simpan Wilayah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Hapus Data Wilayah?"
        message={
          wilayahToDelete
            ? `Data ${wilayahToDelete.nama_dusun} - ${wilayahToDelete.nama_rt} akan dihapus. Aksi ini tidak dapat dibatalkan.`
            : "Data wilayah akan dihapus. Aksi ini tidak dapat dibatalkan."
        }
        confirmText="Hapus Wilayah"
        cancelText="Batal"
        loading={deleting}
        variant="danger"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}

export default AdminWilayahPage;