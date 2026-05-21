import {
  AlertTriangle,
  Edit3,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import KaderLayout from "../../layouts/KaderLayout";
import {
  createRtData,
  deleteRtData,
  getRtData,
  updateRtData,
} from "../../utils/kaderStorage";
import { formatNumber } from "../../utils/formatters";

const INITIAL_FORM = {
  wilayah: "",
  jumlah_keluarga: "",
  jumlah_ibu_hamil: "",
  jumlah_balita: "",
  akses_air_bersih: "",
  kondisi_sanitasi: "",
  status: "tercatat",
  catatan: "",
};

function getConditionLabel(value) {
  const labels = {
    baik: "Baik",
    cukup: "Cukup",
    perlu_pemantauan: "Perlu Pemantauan",
    buruk: "Buruk",
  };

  return labels[value] || "-";
}

function isValidNonNegativeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue >= 0;
}

function InputDataRT() {
  const [dataList, setDataList] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingData, setEditingData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  function loadData() {
    setDataList(getRtData());
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

    return dataList.filter((item) => {
      const text = `${item.wilayah || ""} ${item.akses_air_bersih || ""} ${
        item.kondisi_sanitasi || ""
      } ${item.catatan || ""}`.toLowerCase();

      return !keyword || text.includes(keyword);
    });
  }, [dataList, searchKeyword]);

  const totalKeluarga = useMemo(() => {
    return dataList.reduce(
      (total, item) => total + Number(item.jumlah_keluarga || 0),
      0
    );
  }, [dataList]);

  const totalIbuHamil = useMemo(() => {
    return dataList.reduce(
      (total, item) => total + Number(item.jumlah_ibu_hamil || 0),
      0
    );
  }, [dataList]);

  const totalBalita = useMemo(() => {
    return dataList.reduce(
      (total, item) => total + Number(item.jumlah_balita || 0),
      0
    );
  }, [dataList]);

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
      wilayah: item.wilayah || "",
      jumlah_keluarga: item.jumlah_keluarga ?? "",
      jumlah_ibu_hamil: item.jumlah_ibu_hamil ?? "",
      jumlah_balita: item.jumlah_balita ?? "",
      akses_air_bersih: item.akses_air_bersih || "",
      kondisi_sanitasi: item.kondisi_sanitasi || "",
      status: item.status || "tercatat",
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

    if (!formData.wilayah.trim()) {
      errors.wilayah = "Wilayah/RT wajib diisi.";
    } else if (formData.wilayah.trim().length < 5) {
      errors.wilayah = "Wilayah terlalu pendek. Contoh: Dusun 1 - RT 01.";
    }

    if (!isValidNonNegativeNumber(formData.jumlah_keluarga)) {
      errors.jumlah_keluarga = "Jumlah keluarga wajib berupa angka 0 atau lebih.";
    }

    if (!isValidNonNegativeNumber(formData.jumlah_ibu_hamil)) {
      errors.jumlah_ibu_hamil =
        "Jumlah ibu hamil wajib berupa angka 0 atau lebih.";
    }

    if (!isValidNonNegativeNumber(formData.jumlah_balita)) {
      errors.jumlah_balita = "Jumlah balita wajib berupa angka 0 atau lebih.";
    }

    if (
      isValidNonNegativeNumber(formData.jumlah_ibu_hamil) &&
      isValidNonNegativeNumber(formData.jumlah_keluarga) &&
      Number(formData.jumlah_ibu_hamil) > Number(formData.jumlah_keluarga)
    ) {
      errors.jumlah_ibu_hamil =
        "Jumlah ibu hamil tidak boleh lebih besar dari jumlah keluarga.";
    }

    if (
      isValidNonNegativeNumber(formData.jumlah_balita) &&
      isValidNonNegativeNumber(formData.jumlah_keluarga) &&
      Number(formData.jumlah_balita) > Number(formData.jumlah_keluarga) * 3
    ) {
      errors.jumlah_balita =
        "Jumlah balita terlalu besar dibanding jumlah keluarga. Periksa kembali.";
    }

    if (!formData.akses_air_bersih) {
      errors.akses_air_bersih = "Akses air bersih wajib dipilih.";
    }

    if (!formData.kondisi_sanitasi) {
      errors.kondisi_sanitasi = "Kondisi sanitasi wajib dipilih.";
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
      wilayah: formData.wilayah.trim(),
      jumlah_keluarga: Number(formData.jumlah_keluarga || 0),
      jumlah_ibu_hamil: Number(formData.jumlah_ibu_hamil || 0),
      jumlah_balita: Number(formData.jumlah_balita || 0),
      catatan: formData.catatan.trim(),
    };

    if (editingData?.id) {
      updateRtData(editingData.id, payload);
      setSuccessMessage("Data RT berhasil diperbarui.");
    } else {
      createRtData(payload);
      setSuccessMessage("Data RT berhasil ditambahkan.");
    }

    closeForm();
    loadData();
  }

  function confirmDelete() {
    if (!deleteTarget?.id) {
      return;
    }

    deleteRtData(deleteTarget.id);
    setDeleteTarget(null);
    setSuccessMessage("Data RT berhasil dihapus.");
    loadData();
  }

  return (
    <KaderLayout
      title="Input Data RT"
      subtitle="Mencatat data awal lapangan di tingkat RT sebagai bahan pemantauan risiko."
    >
      {successMessage ? (
        <div className="kader-success-alert">{successMessage}</div>
      ) : null}

      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Data RT</span>
          <strong>{formatNumber(dataList.length)}</strong>
          <p>Catatan lapangan</p>
        </article>

        <article className="admin-metric-card success">
          <span>Total Keluarga</span>
          <strong>{formatNumber(totalKeluarga)}</strong>
          <p>Keluarga tercatat</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Ibu Hamil</span>
          <strong>{formatNumber(totalIbuHamil)}</strong>
          <p>Sasaran pemantauan</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Balita</span>
          <strong>{formatNumber(totalBalita)}</strong>
          <p>Sasaran gizi</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Data Lapangan</span>
            <h2>Catatan Kondisi RT</h2>
            <p>
              Data ini menjadi catatan awal kader. Perhitungan IRS tetap menjadi
              bagian pengolahan data risiko pada sistem utama.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari wilayah, sanitasi, catatan..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={openCreateForm}
            >
              <Plus size={18} />
              Tambah Data RT
            </button>
          </div>
        </div>

        {showForm ? (
          <form className="kader-form-card" onSubmit={handleSubmit}>
            <div className="kader-form-header">
              <div>
                <span>Form Data RT</span>
                <h2>{editingData ? "Edit Data RT" : "Tambah Data RT"}</h2>
                <p>
                  Isi data sesuai kondisi lapangan. Gunakan angka valid agar data
                  dapat dibaca dengan benar oleh sistem.
                </p>
              </div>

              <button type="button" onClick={closeForm} aria-label="Tutup form">
                <X size={18} />
              </button>
            </div>

            <div className="kader-form-grid">
              <div className="kader-field">
                <label>Wilayah/RT</label>
                <input
                  type="text"
                  name="wilayah"
                  value={formData.wilayah}
                  placeholder="Contoh: Dusun 1 - RT 01"
                  onChange={handleChange}
                />
                {fieldErrors.wilayah ? <small>{fieldErrors.wilayah}</small> : null}
              </div>

              <div className="kader-field">
                <label>Jumlah Keluarga</label>
                <input
                  type="number"
                  name="jumlah_keluarga"
                  min="0"
                  step="1"
                  value={formData.jumlah_keluarga}
                  placeholder="Contoh: 42"
                  onChange={handleChange}
                />
                {fieldErrors.jumlah_keluarga ? (
                  <small>{fieldErrors.jumlah_keluarga}</small>
                ) : null}
              </div>

              <div className="kader-field">
                <label>Jumlah Ibu Hamil</label>
                <input
                  type="number"
                  name="jumlah_ibu_hamil"
                  min="0"
                  step="1"
                  value={formData.jumlah_ibu_hamil}
                  placeholder="Contoh: 3"
                  onChange={handleChange}
                />
                {fieldErrors.jumlah_ibu_hamil ? (
                  <small>{fieldErrors.jumlah_ibu_hamil}</small>
                ) : null}
              </div>

              <div className="kader-field">
                <label>Jumlah Balita</label>
                <input
                  type="number"
                  name="jumlah_balita"
                  min="0"
                  step="1"
                  value={formData.jumlah_balita}
                  placeholder="Contoh: 12"
                  onChange={handleChange}
                />
                {fieldErrors.jumlah_balita ? (
                  <small>{fieldErrors.jumlah_balita}</small>
                ) : null}
              </div>

              <div className="kader-field">
                <label>Akses Air Bersih</label>
                <select
                  name="akses_air_bersih"
                  value={formData.akses_air_bersih}
                  onChange={handleChange}
                >
                  <option value="">Pilih kondisi air bersih</option>
                  <option value="baik">Baik</option>
                  <option value="cukup">Cukup</option>
                  <option value="perlu_pemantauan">Perlu Pemantauan</option>
                  <option value="buruk">Buruk</option>
                </select>
                {fieldErrors.akses_air_bersih ? (
                  <small>{fieldErrors.akses_air_bersih}</small>
                ) : null}
              </div>

              <div className="kader-field">
                <label>Kondisi Sanitasi</label>
                <select
                  name="kondisi_sanitasi"
                  value={formData.kondisi_sanitasi}
                  onChange={handleChange}
                >
                  <option value="">Pilih kondisi sanitasi</option>
                  <option value="baik">Baik</option>
                  <option value="cukup">Cukup</option>
                  <option value="perlu_pemantauan">Perlu Pemantauan</option>
                  <option value="buruk">Buruk</option>
                </select>
                {fieldErrors.kondisi_sanitasi ? (
                  <small>{fieldErrors.kondisi_sanitasi}</small>
                ) : null}
              </div>

              <div className="kader-field full">
                <label>Catatan Lapangan</label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  placeholder="Contoh: Sebagian keluarga membutuhkan edukasi PHBS atau pemantauan sanitasi."
                  rows={4}
                  maxLength={300}
                  onChange={handleChange}
                />
                <div className="kader-field-helper">
                  <span>{formData.catatan.length}/300 karakter</span>
                </div>
                {fieldErrors.catatan ? <small>{fieldErrors.catatan}</small> : null}
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

        <div className="admin-table-wrapper">
          <table className="admin-table kader-rt-table">
            <thead>
              <tr>
                <th>Wilayah</th>
                <th>Keluarga</th>
                <th>Ibu Hamil</th>
                <th>Balita</th>
                <th>Air Bersih</th>
                <th>Sanitasi</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="kader-table-empty">
                      Belum ada data RT yang sesuai.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="kader-table-main-text">
                        <strong>{item.wilayah}</strong>
                        <small>{item.catatan || "Tidak ada catatan"}</small>
                      </div>
                    </td>
                    <td>{formatNumber(item.jumlah_keluarga)}</td>
                    <td>{formatNumber(item.jumlah_ibu_hamil)}</td>
                    <td>{formatNumber(item.jumlah_balita)}</td>
                    <td>{getConditionLabel(item.akses_air_bersih)}</td>
                    <td>{getConditionLabel(item.kondisi_sanitasi)}</td>
                    <td>
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {deleteTarget ? (
        <div className="kader-confirm-backdrop">
          <div className="kader-confirm-dialog">
            <div className="kader-confirm-icon">
              <AlertTriangle size={24} />
            </div>

            <h2>Hapus Data RT?</h2>
            <p>
              Data <strong>{deleteTarget.wilayah}</strong> akan dihapus dari
              catatan lapangan kader. Tindakan ini tidak dapat dibatalkan.
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

export default InputDataRT;