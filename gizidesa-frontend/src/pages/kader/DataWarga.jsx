import {
  AlertTriangle,
  Edit3,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import KaderLayout from "../../layouts/KaderLayout";
import {
  createWargaData,
  deleteWargaData,
  getWargaData,
  updateWargaData,
} from "../../utils/kaderStorage";
import { formatNumber } from "../../utils/formatters";

const INITIAL_FORM = {
  nama: "",
  nik: "",
  wilayah: "",
  kategori_sasaran: "",
  status_pemantauan: "normal",
  nomor_hp: "",
  catatan: "",
};

function getCategoryLabel(value) {
  const labels = {
    ibu_hamil: "Ibu Hamil",
    balita: "Balita",
    keluarga_risiko: "Keluarga Risiko",
    remaja_putri: "Remaja Putri",
    lainnya: "Lainnya",
  };

  return labels[value] || "-";
}

function getStatusLabel(value) {
  const labels = {
    normal: "Normal",
    perlu_dipantau: "Perlu Dipantau",
    sudah_dikunjungi: "Sudah Dikunjungi",
  };

  return labels[value] || "-";
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 13);
}

function isValidPhone(value) {
  return /^08[0-9]{8,11}$/.test(value);
}

function isValidNik(value) {
  if (!value) {
    return true;
  }

  return /^[0-9]{16}$/.test(value);
}

function DataWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingData, setEditingData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [showForm, setShowForm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  function loadData() {
    setWargaList(getWargaData());
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return wargaList.filter((item) => {
      const text = `${item.nama || ""} ${item.nik || ""} ${
        item.wilayah || ""
      } ${item.kategori_sasaran || ""} ${item.status_pemantauan || ""} ${
        item.nomor_hp || ""
      } ${item.catatan || ""}`.toLowerCase();

      const matchKeyword = !keyword || text.includes(keyword);
      const matchCategory =
        categoryFilter === "semua" || item.kategori_sasaran === categoryFilter;

      return matchKeyword && matchCategory;
    });
  }, [wargaList, searchKeyword, categoryFilter]);

  const totalPerluDipantau = useMemo(() => {
    return wargaList.filter(
      (item) => item.status_pemantauan === "perlu_dipantau"
    ).length;
  }, [wargaList]);

  const totalIbuHamil = useMemo(() => {
    return wargaList.filter((item) => item.kategori_sasaran === "ibu_hamil")
      .length;
  }, [wargaList]);

  const totalBalita = useMemo(() => {
    return wargaList.filter((item) => item.kategori_sasaran === "balita").length;
  }, [wargaList]);

  function resetForm() {
    setFormData(INITIAL_FORM);
    setEditingData(null);
    setFieldErrors({});
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEditForm(item) {
    setEditingData(item);
    setFormData({
      nama: item.nama || "",
      nik: item.nik || "",
      wilayah: item.wilayah || "",
      kategori_sasaran: item.kategori_sasaran || "",
      status_pemantauan: item.status_pemantauan || "normal",
      nomor_hp: item.nomor_hp || "",
      catatan: item.catatan || "",
    });
    setFieldErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  function handleChange(event) {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "nik") {
      nextValue = value.replace(/\D/g, "").slice(0, 16);
    }

    if (name === "nomor_hp") {
      nextValue = normalizePhone(value);
    }

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateForm() {
    const errors = {};

    if (!formData.nama.trim()) {
      errors.nama = "Nama warga wajib diisi.";
    } else if (formData.nama.trim().length < 3) {
      errors.nama = "Nama warga minimal 3 karakter.";
    }

    if (!isValidNik(formData.nik.trim())) {
      errors.nik = "NIK harus berisi 16 digit angka. Kosongkan jika belum ada.";
    }

    if (!formData.wilayah.trim()) {
      errors.wilayah = "Wilayah wajib diisi.";
    } else if (formData.wilayah.trim().length < 5) {
      errors.wilayah = "Wilayah terlalu pendek. Contoh: Dusun 1 - RT 01.";
    }

    if (!formData.kategori_sasaran) {
      errors.kategori_sasaran = "Kategori sasaran wajib dipilih.";
    }

    if (!formData.status_pemantauan) {
      errors.status_pemantauan = "Status pemantauan wajib dipilih.";
    }

    if (!formData.nomor_hp.trim()) {
      errors.nomor_hp = "Nomor HP wajib diisi untuk kebutuhan koordinasi kader.";
    } else if (!isValidPhone(formData.nomor_hp.trim())) {
      errors.nomor_hp =
        "Nomor HP harus diawali 08 dan berisi 10 sampai 13 digit angka. Contoh: 081234567890.";
    }

    if (formData.catatan.trim().length > 300) {
      errors.catatan = "Catatan maksimal 300 karakter.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      nama: formData.nama.trim(),
      nik: formData.nik.trim(),
      wilayah: formData.wilayah.trim(),
      nomor_hp: normalizePhone(formData.nomor_hp.trim()),
      catatan: formData.catatan.trim(),
    };

    if (editingData?.id) {
      updateWargaData(editingData.id, payload);
      setSuccessMessage("Data warga berhasil diperbarui.");
    } else {
      createWargaData(payload);
      setSuccessMessage("Data warga berhasil ditambahkan.");
    }

    closeForm();
    loadData();
  }

  function confirmDelete() {
    if (!deleteTarget?.id) {
      return;
    }

    deleteWargaData(deleteTarget.id);
    setDeleteTarget(null);
    setSuccessMessage("Data warga berhasil dihapus.");
    loadData();
  }

  return (
    <KaderLayout
      title="Data Warga"
      subtitle="Mencatat dan memantau warga atau sasaran yang perlu diperhatikan oleh kader."
    >
      {successMessage ? (
        <div className="kader-success-alert">{successMessage}</div>
      ) : null}

      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Warga</span>
          <strong>{formatNumber(wargaList.length)}</strong>
          <p>Sasaran terdata</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Ibu Hamil</span>
          <strong>{formatNumber(totalIbuHamil)}</strong>
          <p>Perlu pemantauan gizi</p>
        </article>

        <article className="admin-metric-card success">
          <span>Balita</span>
          <strong>{formatNumber(totalBalita)}</strong>
          <p>Sasaran posyandu</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Perlu Dipantau</span>
          <strong>{formatNumber(totalPerluDipantau)}</strong>
          <p>Prioritas kunjungan</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Warga</span>
            <h2>Sasaran Pemantauan Kader</h2>
            <p>
              Data ini membantu kader memantau ibu hamil, balita, keluarga
              risiko, dan sasaran edukasi gizi di wilayah kerja.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari nama, wilayah, kategori..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <select
              className="admin-filter-select kader-category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="semua">Semua Kategori</option>
              <option value="ibu_hamil">Ibu Hamil</option>
              <option value="balita">Balita</option>
              <option value="keluarga_risiko">Keluarga Risiko</option>
              <option value="remaja_putri">Remaja Putri</option>
              <option value="lainnya">Lainnya</option>
            </select>

            <button
              type="button"
              className="admin-primary-button"
              onClick={openCreateForm}
            >
              <Plus size={18} />
              Tambah Warga
            </button>
          </div>
        </div>

        {showForm ? (
          <form className="kader-form-card" onSubmit={handleSubmit}>
            <div className="kader-form-header">
              <div>
                <span>Form Warga</span>
                <h2>{editingData ? "Edit Data Warga" : "Tambah Data Warga"}</h2>
                <p>
                  Isi data sasaran dengan benar. NIK hanya angka 16 digit jika
                  diisi, sedangkan nomor HP wajib menggunakan format 08.
                </p>
              </div>

              <button type="button" onClick={closeForm} aria-label="Tutup form">
                <X size={18} />
              </button>
            </div>

            <div className="kader-form-grid">
              <div className="kader-field">
                <label>Nama Warga</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  placeholder="Contoh: Marta Simanjuntak"
                  onChange={handleChange}
                />
                {fieldErrors.nama ? <small>{fieldErrors.nama}</small> : null}
              </div>

              <div className="kader-field">
                <label>NIK</label>
                <input
                  type="text"
                  name="nik"
                  inputMode="numeric"
                  value={formData.nik}
                  placeholder="Opsional, contoh: 1201010101010001"
                  onChange={handleChange}
                />
                <div className="kader-field-helper">
                  <span>{formData.nik.length}/16 digit</span>
                </div>
                {fieldErrors.nik ? <small>{fieldErrors.nik}</small> : null}
              </div>

              <div className="kader-field">
                <label>Wilayah</label>
                <input
                  type="text"
                  name="wilayah"
                  value={formData.wilayah}
                  placeholder="Contoh: Dusun 1 - RT 01"
                  onChange={handleChange}
                />
                {fieldErrors.wilayah ? (
                  <small>{fieldErrors.wilayah}</small>
                ) : null}
              </div>

              <div className="kader-field">
                <label>Nomor HP</label>
                <input
                  type="text"
                  name="nomor_hp"
                  inputMode="numeric"
                  value={formData.nomor_hp}
                  placeholder="Wajib, contoh: 081234567890"
                  onChange={handleChange}
                />

                {fieldErrors.nomor_hp ? (
                  <small>{fieldErrors.nomor_hp}</small>
                ) : (
                  <div className="kader-field-helper left">
                    <span>Gunakan format 08, hanya angka, 10 sampai 13 digit.</span>
                  </div>
                )}
              </div>

              <div className="kader-field">
                <label>Kategori Sasaran</label>
                <select
                  name="kategori_sasaran"
                  value={formData.kategori_sasaran}
                  onChange={handleChange}
                >
                  <option value="">Pilih kategori sasaran</option>
                  <option value="ibu_hamil">Ibu Hamil</option>
                  <option value="balita">Balita</option>
                  <option value="keluarga_risiko">Keluarga Risiko</option>
                  <option value="remaja_putri">Remaja Putri</option>
                  <option value="lainnya">Lainnya</option>
                </select>
                {fieldErrors.kategori_sasaran ? (
                  <small>{fieldErrors.kategori_sasaran}</small>
                ) : null}
              </div>

              <div className="kader-field">
                <label>Status Pemantauan</label>
                <select
                  name="status_pemantauan"
                  value={formData.status_pemantauan}
                  onChange={handleChange}
                >
                  <option value="normal">Normal</option>
                  <option value="perlu_dipantau">Perlu Dipantau</option>
                  <option value="sudah_dikunjungi">Sudah Dikunjungi</option>
                </select>
                {fieldErrors.status_pemantauan ? (
                  <small>{fieldErrors.status_pemantauan}</small>
                ) : null}
              </div>

              <div className="kader-field full">
                <label>Catatan</label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  placeholder="Contoh: Perlu edukasi konsumsi pangan bergizi atau pemantauan posyandu."
                  rows={4}
                  maxLength={300}
                  onChange={handleChange}
                />
                <div className="kader-field-helper">
                  <span>{formData.catatan.length}/300 karakter</span>
                </div>
                {fieldErrors.catatan ? (
                  <small>{fieldErrors.catatan}</small>
                ) : null}
              </div>
            </div>

            <div className="team-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={closeForm}
              >
                Batal
              </button>

              <button type="submit" className="admin-primary-button">
                <Save size={18} />
                Simpan Data
              </button>
            </div>
          </form>
        ) : null}

        <div className="kader-warga-grid">
          {filteredData.length === 0 ? (
            <div className="kader-table-empty">Belum ada data warga.</div>
          ) : (
            filteredData.map((item) => (
              <article className="kader-warga-card" key={item.id}>
                <div className="kader-warga-icon">
                  <UserRound size={20} />
                </div>

                <div className="kader-warga-content">
                  <strong>{item.nama}</strong>
                  <span>{item.wilayah}</span>
                  <p>{item.catatan || "Tidak ada catatan tambahan."}</p>

                  <div className="kader-warga-meta">
                    <small className="kader-meta-badge category">
                      {getCategoryLabel(item.kategori_sasaran)}
                    </small>

                    <small
                      className={`kader-meta-badge status ${item.status_pemantauan}`}
                    >
                      {getStatusLabel(item.status_pemantauan)}
                    </small>

                    {item.nik ? (
                      <small className="kader-meta-badge identity">
                        NIK: {item.nik}
                      </small>
                    ) : null}

                    {item.nomor_hp ? (
                      <small className="kader-meta-badge contact">
                        HP: {item.nomor_hp}
                      </small>
                    ) : null}
                  </div>
                </div>

                <div className="team-action-group">
                  <button
                    type="button"
                    className="team-action-button edit"
                    title="Edit Data"
                    onClick={() => openEditForm(item)}
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
              </article>
            ))
          )}
        </div>
      </section>

      {deleteTarget ? (
        <div className="kader-confirm-backdrop">
          <div className="kader-confirm-dialog">
            <div className="kader-confirm-icon">
              <AlertTriangle size={24} />
            </div>

            <h2>Hapus Data Warga?</h2>
            <p>
              Data <strong>{deleteTarget.nama}</strong> akan dihapus dari daftar
              sasaran pemantauan kader. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="kader-confirm-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className="kader-danger-button"
                onClick={confirmDelete}
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </KaderLayout>
  );
}

export default DataWarga;