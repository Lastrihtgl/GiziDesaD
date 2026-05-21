import {
  Edit3,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createTim,
  deleteTim,
  getTimList,
  updateTim,
} from "../../../api/timApi";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import AdminLayout from "../../../layouts/AdminLayout";
import { formatNumber } from "../../../utils/formatters";

const INITIAL_FORM = {
  nama: "",
  peran: "",
  wilayah_tugas: "",
  nomor_hp: "",
  email: "",
  status: "aktif",
  catatan: "",
};

const ROLE_OPTIONS = [
  { value: "kader_posyandu", label: "Kader Posyandu" },
  { value: "bidan_desa", label: "Bidan Desa" },
  { value: "petugas_gizi", label: "Petugas Gizi" },
  { value: "koordinator_wilayah", label: "Koordinator Wilayah" },
  { value: "admin_pendamping", label: "Admin Pendamping" },
];

function getRoleLabel(value) {
  return ROLE_OPTIONS.find((item) => item.value === value)?.label || value || "-";
}

function getStatusLabel(value) {
  const labels = {
    aktif: "Aktif",
    nonaktif: "Nonaktif",
  };

  return labels[value] || value || "-";
}

function validateEmail(value) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
  if (!value) {
    return false;
  }

  return /^(\+62|62|0)8[0-9]{8,13}$/.test(value.replace(/\s/g, ""));
}

function normalizePhone(value) {
  return value.replace(/\s/g, "");
}

function AdminTimPage() {
  const [timList, setTimList] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedTim, setSelectedTim] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");

  const [modalMode, setModalMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function fetchTimData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getTimList();
      const data = response.data || response.items || response || [];

      setTimList(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Data tim gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTimData();
  }, []);

  useEffect(() => {
    if (!errorMessage && !successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, 4500);

    return () => clearTimeout(timer);
  }, [errorMessage, successMessage]);

  const filteredTim = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return timList.filter((item) => {
      const searchableText = `${item.nama || ""} ${getRoleLabel(item.peran)} ${
        item.wilayah_tugas || ""
      } ${item.nomor_hp || ""} ${item.email || ""}`.toLowerCase();

      const matchKeyword = !keyword || searchableText.includes(keyword);
      const matchRole = roleFilter === "semua" || item.peran === roleFilter;
      const matchStatus =
        statusFilter === "semua" || item.status === statusFilter;

      return matchKeyword && matchRole && matchStatus;
    });
  }, [timList, searchKeyword, roleFilter, statusFilter]);

  const totalTim = timList.length;
  const totalAktif = timList.filter((item) => item.status === "aktif").length;
  const totalNonaktif = timList.filter((item) => item.status === "nonaktif").length;

  const totalPeran = useMemo(() => {
    return new Set(timList.map((item) => item.peran).filter(Boolean)).size;
  }, [timList]);

  const dominantRole = useMemo(() => {
    const counter = {};

    timList.forEach((item) => {
      if (!item.peran) return;
      counter[item.peran] = (counter[item.peran] || 0) + 1;
    });

    const topRole = Object.entries(counter).sort((a, b) => b[1] - a[1])[0];

    return topRole ? getRoleLabel(topRole[0]) : "-";
  }, [timList]);

  function resetForm() {
    setFormData(INITIAL_FORM);
    setSelectedTim(null);
    setFieldErrors({});
  }

  function openCreateModal() {
    resetForm();
    setModalMode("create");
  }

  function openDetailModal(item) {
    setSelectedTim(item);
    setModalMode("detail");
  }

  function openEditModal(item) {
    setSelectedTim(item);
    setFormData({
      nama: item.nama || "",
      peran: item.peran || "",
      wilayah_tugas: item.wilayah_tugas || "",
      nomor_hp: item.nomor_hp || "",
      email: item.email || "",
      status: item.status || "aktif",
      catatan: item.catatan || "",
    });
    setFieldErrors({});
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode("");
    resetForm();
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateForm() {
    const errors = {};

    if (!formData.nama.trim()) {
      errors.nama = "Nama anggota tim wajib diisi.";
    }

    if (!formData.peran) {
      errors.peran = "Peran anggota tim wajib dipilih.";
    }

    if (!formData.wilayah_tugas.trim()) {
      errors.wilayah_tugas = "Wilayah tugas wajib diisi.";
    }

    if (!validatePhone(formData.nomor_hp)) {
      errors.nomor_hp =
        "Nomor HP wajib diisi dengan format Indonesia, misalnya 081234567890.";
    }

    if (!validateEmail(formData.email)) {
      errors.email = "Format email tidak valid.";
    }

    if (!formData.status) {
      errors.status = "Status anggota tim wajib dipilih.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Periksa kembali input yang belum valid.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        ...formData,
        nama: formData.nama.trim(),
        wilayah_tugas: formData.wilayah_tugas.trim(),
        nomor_hp: normalizePhone(formData.nomor_hp),
        email: formData.email.trim(),
        catatan: formData.catatan.trim(),
      };

      if (modalMode === "edit" && selectedTim?.id) {
        const response = await updateTim(selectedTim.id, payload);
        setSuccessMessage(response.message || "Data tim berhasil diperbarui.");
      } else {
        const response = await createTim(payload);
        setSuccessMessage(response.message || "Data tim berhasil ditambahkan.");
      }

      closeModal();
      fetchTimData();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Data tim gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await deleteTim(deleteTarget.id);
      setSuccessMessage(response.message || "Data tim berhasil dihapus.");
      setDeleteTarget(null);
      fetchTimData();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Data tim gagal dihapus."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminLayout
      title="Kelola Tim"
      subtitle="Mengelola data petugas desa yang terlibat dalam pendataan risiko, edukasi, dan tindak lanjut intervensi."
    >
      <ErrorAlert message={errorMessage} />

      {successMessage ? (
        <div className="admin-success-alert">
          <ShieldCheck size={18} />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <section className="admin-overview-grid team-overview">
        <article className="admin-metric-card">
          <span>Total Anggota Tim</span>
          <strong>{formatNumber(totalTim)}</strong>
          <p>Petugas terdaftar</p>
        </article>

        <article className="admin-metric-card success">
          <span>Tim Aktif</span>
          <strong>{formatNumber(totalAktif)}</strong>
          <p>Siap menjalankan tugas</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Tim Nonaktif</span>
          <strong>{formatNumber(totalNonaktif)}</strong>
          <p>Tidak sedang bertugas</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Jenis Peran</span>
          <strong>{formatNumber(totalPeran)}</strong>
          <p>Dominan: {dominantRole}</p>
        </article>
      </section>

      <section className="admin-panel team-info-card">
        <div className="team-info-content">
          <div>
            <span>Fungsi Tim</span>
            <h2>Petugas Operasional GiziDesa</h2>
            <p>
              Data tim digunakan sebagai referensi pelaksana lapangan dalam
              kegiatan pendataan risiko, pemantauan ibu hamil, edukasi gizi,
              pangan lokal, serta tindak lanjut intervensi wilayah.
            </p>
          </div>

          <div className="team-role-summary">
            <UsersRound size={22} />
            <div>
              <strong>{formatNumber(totalAktif)} Tim Aktif</strong>
              <p>
                Pastikan setiap anggota memiliki peran, wilayah tugas, dan
                kontak yang jelas agar koordinasi program berjalan tertib.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Tim</span>
            <h2>Anggota Pelaksana Desa</h2>
            <p>
              Daftar ini memuat petugas yang membantu pelaksanaan program
              GiziDesa sesuai peran dan wilayah tugasnya.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari nama, peran, wilayah, kontak..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <select
              className="admin-filter-select"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="semua">Semua Peran</option>
              {ROLE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>

            <button
              type="button"
              className="admin-primary-button"
              onClick={openCreateModal}
            >
              <Plus size={18} />
              Tambah Tim
            </button>
          </div>
        </div>

        {loading ? (
          <EmptyState
            title="Memuat data tim"
            message="Sistem sedang mengambil daftar anggota tim."
          />
        ) : filteredTim.length === 0 ? (
          <EmptyState
            title="Data tim tidak ditemukan"
            message="Belum ada anggota tim yang sesuai dengan filter pencarian."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table team-table">
              <thead>
                <tr>
                  <th>Anggota Tim</th>
                  <th>Peran</th>
                  <th>Wilayah Tugas</th>
                  <th>Kontak</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredTim.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="team-member-cell">
                        <span>
                          <UserRound size={16} />
                        </span>

                        <div>
                          <strong>{item.nama || "-"}</strong>
                          <small>{item.email || "Email belum tersedia"}</small>
                        </div>
                      </div>
                    </td>

                    <td>{getRoleLabel(item.peran)}</td>

                    <td>
                      <span className="table-muted-text">
                        {item.wilayah_tugas || "-"}
                      </span>
                    </td>

                    <td>
                      <div className="team-contact-cell">
                        <span>
                          <Phone size={14} />
                          {item.nomor_hp || "-"}
                        </span>
                        <span>
                          <Mail size={14} />
                          {item.email || "-"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`team-status-pill ${item.status}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

                    <td>
                      <div className="team-action-group">
                        <button
                          type="button"
                          className="team-action-button info"
                          title="Lihat Detail"
                          onClick={() => openDetailModal(item)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="team-action-button edit"
                          title="Edit Data"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          className="team-action-button danger"
                          title="Hapus Data"
                          onClick={() => setDeleteTarget(item)}
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

      {(modalMode === "create" || modalMode === "edit") && (
        <div className="admin-modal-backdrop">
          <div className="team-modal-shell">
            <button
              type="button"
              className="team-modal-close"
              onClick={closeModal}
            >
              <X size={20} />
            </button>

            <div className="team-modal-header">
              <div>
                <span>Form Tim</span>
                <h2>{modalMode === "edit" ? "Edit Data Tim" : "Tambah Tim"}</h2>
              </div>

              <p>
                Lengkapi data anggota tim agar admin dapat mengetahui peran,
                wilayah tugas, dan kontak pelaksana program GiziDesa.
              </p>
            </div>

            <form className="team-form-grid" onSubmit={handleSubmit}>
              <div className="team-form-group">
                <label>Nama Anggota Tim</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  placeholder="Contoh: Lastri Anna Hutagalung"
                  onChange={handleChange}
                />
                {fieldErrors.nama && <small>{fieldErrors.nama}</small>}
              </div>

              <div className="team-form-group">
                <label>Peran</label>
                <select name="peran" value={formData.peran} onChange={handleChange}>
                  <option value="">Pilih peran</option>
                  {ROLE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.peran && <small>{fieldErrors.peran}</small>}
              </div>

              <div className="team-form-group">
                <label>Wilayah Tugas</label>
                <input
                  type="text"
                  name="wilayah_tugas"
                  value={formData.wilayah_tugas}
                  placeholder="Contoh: Dusun 1 - RT 01"
                  onChange={handleChange}
                />
                {fieldErrors.wilayah_tugas && (
                  <small>{fieldErrors.wilayah_tugas}</small>
                )}
              </div>

              <div className="team-form-group">
                <label>Nomor HP</label>
                <input
                  type="text"
                  name="nomor_hp"
                  value={formData.nomor_hp}
                  placeholder="Contoh: 081234567890"
                  onChange={handleChange}
                />
                {fieldErrors.nomor_hp && <small>{fieldErrors.nomor_hp}</small>}
              </div>

              <div className="team-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Opsional, contoh: kader@gizidesa.local"
                  onChange={handleChange}
                />
                {fieldErrors.email && <small>{fieldErrors.email}</small>}
              </div>

              <div className="team-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
                {fieldErrors.status && <small>{fieldErrors.status}</small>}
              </div>

              <div className="team-form-group full">
                <label>Catatan</label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  placeholder="Opsional, misalnya tugas utama, catatan koordinasi, atau tanggung jawab lapangan."
                  rows={4}
                  onChange={handleChange}
                />
              </div>

              <div className="team-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Data Tim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === "detail" && selectedTim && (
        <div className="admin-modal-backdrop">
          <div className="team-modal-shell team-detail-modal">
            <button
              type="button"
              className="team-modal-close"
              onClick={closeModal}
            >
              <X size={20} />
            </button>

            <div className="team-modal-header">
              <div>
                <span>Detail Tim</span>
                <h2>{selectedTim.nama}</h2>
              </div>

              <p>
                Informasi anggota tim yang terlibat dalam pelaksanaan program
                GiziDesa.
              </p>
            </div>

            <div className="team-detail-grid">
              <div className="team-detail-card primary">
                <span>Peran</span>
                <strong>{getRoleLabel(selectedTim.peran)}</strong>
                <small>{getStatusLabel(selectedTim.status)}</small>
              </div>

              <div className="team-detail-card">
                <span>Wilayah Tugas</span>
                <strong>{selectedTim.wilayah_tugas || "-"}</strong>
              </div>

              <div className="team-detail-card">
                <span>Nomor HP</span>
                <strong>{selectedTim.nomor_hp || "-"}</strong>
              </div>

              <div className="team-detail-card">
                <span>Email</span>
                <strong>{selectedTim.email || "-"}</strong>
              </div>

              <div className="team-detail-card full">
                <span>Catatan</span>
                <p>{selectedTim.catatan || "Tidak ada catatan tambahan."}</p>
              </div>
            </div>

            <div className="team-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={closeModal}
              >
                Tutup
              </button>

              <button
                type="button"
                className="admin-primary-button"
                onClick={() => openEditModal(selectedTim)}
              >
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal-backdrop">
          <div className="team-delete-modal">
            <div className="team-delete-icon">
              <Trash2 size={22} />
            </div>

            <h2>Hapus Data Tim?</h2>

            <p>
              Data <strong>{deleteTarget.nama}</strong> akan dihapus dari daftar
              anggota pelaksana GiziDesa. Data yang sudah dihapus tidak akan
              tampil lagi pada halaman Kelola Tim.
            </p>

            <div className="team-delete-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Batal
              </button>

              <button
                type="button"
                className="team-danger-button"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Menghapus..." : "Hapus Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminTimPage;