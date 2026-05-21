import {
  AlertTriangle,
  Edit3,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import BidanLayout from "../../layouts/BidanLayout";
import {
  createTindakLanjutData,
  deleteTindakLanjutData,
  getTindakLanjutData,
  updateTindakLanjutData,
} from "../../utils/bidanStorage";

const INITIAL_FORM = {
  wilayah: "",
  sasaran: "",
  jenis: "",
  fokus: "",
  tanggal_rencana: "",
  tanggal_pelaksanaan: "",
  status: "direncanakan",
  hasil: "",
  catatan: "",
};

function getStatusLabel(status) {
  const labels = {
    direncanakan: "Direncanakan",
    berjalan: "Berjalan",
    selesai: "Selesai",
  };

  return labels[status] || status;
}

function TindakLanjut() {
  const [dataList, setDataList] = useState(getTindakLanjutData());
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingData, setEditingData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [errors, setErrors] = useState({});

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return dataList.filter((item) => {
      const text = `${item.wilayah} ${item.sasaran} ${item.jenis} ${item.fokus} ${item.status}`.toLowerCase();
      return !keyword || text.includes(keyword);
    });
  }, [dataList, searchKeyword]);

  function openCreateForm() {
    setEditingData(null);
    setFormData(INITIAL_FORM);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEditForm(item) {
    setEditingData(item);
    setFormData({
      wilayah: item.wilayah || "",
      sasaran: item.sasaran || "",
      jenis: item.jenis || "",
      fokus: item.fokus || "",
      tanggal_rencana: item.tanggal_rencana || "",
      tanggal_pelaksanaan: item.tanggal_pelaksanaan || "",
      status: item.status || "direncanakan",
      hasil: item.hasil || "",
      catatan: item.catatan || "",
    });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingData(null);
    setFormData(INITIAL_FORM);
    setErrors({});
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.wilayah.trim()) {
      nextErrors.wilayah = "Wilayah wajib diisi.";
    }

    if (!formData.sasaran.trim()) {
      nextErrors.sasaran = "Nama sasaran wajib diisi.";
    }

    if (!formData.jenis) {
      nextErrors.jenis = "Jenis tindak lanjut wajib dipilih.";
    }

    if (!formData.fokus.trim()) {
      nextErrors.fokus = "Fokus intervensi wajib diisi.";
    }

    if (!formData.tanggal_rencana) {
      nextErrors.tanggal_rencana = "Tanggal rencana wajib diisi.";
    }

    if (formData.status === "selesai" && !formData.tanggal_pelaksanaan) {
      nextErrors.tanggal_pelaksanaan =
        "Tanggal pelaksanaan wajib diisi jika status selesai.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      wilayah: formData.wilayah.trim(),
      sasaran: formData.sasaran.trim(),
      fokus: formData.fokus.trim(),
      hasil: formData.hasil.trim(),
      catatan: formData.catatan.trim(),
    };

    let updated;

    if (editingData?.id) {
      updated = updateTindakLanjutData(editingData.id, payload);
    } else {
      updated = createTindakLanjutData(payload);
    }

    setDataList(updated);
    closeForm();
  }

  function confirmDelete() {
    const updated = deleteTindakLanjutData(deleteTarget.id);
    setDataList(updated);
    setDeleteTarget(null);
  }

  return (
    <BidanLayout
      title="Tindak Lanjut"
      subtitle="Mencatat kunjungan, edukasi, rujukan, dan hasil pemantauan kesehatan."
    >
      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Tindak Lanjut Bidan</span>
            <h2>Program Kesehatan Wilayah</h2>
            <p>
              Catat kegiatan bidan berdasarkan data risiko, rekomendasi, dan
              pemantauan sasaran.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                value={searchKeyword}
                placeholder="Cari wilayah, sasaran, jenis..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={openCreateForm}
            >
              <Plus size={18} />
              Tambah Tindak Lanjut
            </button>
          </div>
        </div>

        {showForm ? (
          <form className="bidan-form-card" onSubmit={handleSubmit}>
            <div className="bidan-form-header">
              <div>
                <span>Form Tindak Lanjut</span>
                <h2>
                  {editingData
                    ? "Edit Tindak Lanjut"
                    : "Tambah Tindak Lanjut"}
                </h2>
                <p>
                  Isi kegiatan kesehatan berdasarkan sasaran dan wilayah yang
                  membutuhkan pemantauan.
                </p>
              </div>

              <button type="button" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>

            <div className="bidan-form-grid">
              <div className="bidan-field">
                <label>Wilayah</label>
                <input
                  name="wilayah"
                  value={formData.wilayah}
                  placeholder="Contoh: Dusun 1 - RT 01"
                  onChange={handleChange}
                />
                {errors.wilayah ? <small>{errors.wilayah}</small> : null}
              </div>

              <div className="bidan-field">
                <label>Nama Sasaran</label>
                <input
                  name="sasaran"
                  value={formData.sasaran}
                  placeholder="Contoh: Marta Simanjuntak"
                  onChange={handleChange}
                />
                {errors.sasaran ? <small>{errors.sasaran}</small> : null}
              </div>

              <div className="bidan-field">
                <label>Jenis Tindak Lanjut</label>
                <select
                  name="jenis"
                  value={formData.jenis}
                  onChange={handleChange}
                >
                  <option value="">Pilih jenis</option>
                  <option value="Kunjungan Rumah">Kunjungan Rumah</option>
                  <option value="Edukasi Gizi">Edukasi Gizi</option>
                  <option value="Pemantauan ANC">Pemantauan ANC</option>
                  <option value="Rujukan">Rujukan</option>
                  <option value="Pemantauan Posyandu">
                    Pemantauan Posyandu
                  </option>
                </select>
                {errors.jenis ? <small>{errors.jenis}</small> : null}
              </div>

              <div className="bidan-field">
                <label>Fokus</label>
                <input
                  name="fokus"
                  value={formData.fokus}
                  placeholder="Contoh: Ibu Hamil KEK"
                  onChange={handleChange}
                />
                {errors.fokus ? <small>{errors.fokus}</small> : null}
              </div>

              <div className="bidan-field">
                <label>Tanggal Rencana</label>
                <input
                  type="date"
                  name="tanggal_rencana"
                  value={formData.tanggal_rencana}
                  onChange={handleChange}
                />
                {errors.tanggal_rencana ? (
                  <small>{errors.tanggal_rencana}</small>
                ) : null}
              </div>

              <div className="bidan-field">
                <label>Tanggal Pelaksanaan</label>
                <input
                  type="date"
                  name="tanggal_pelaksanaan"
                  value={formData.tanggal_pelaksanaan}
                  onChange={handleChange}
                />
                {errors.tanggal_pelaksanaan ? (
                  <small>{errors.tanggal_pelaksanaan}</small>
                ) : null}
              </div>

              <div className="bidan-field">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="direncanakan">Direncanakan</option>
                  <option value="berjalan">Berjalan</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              <div className="bidan-field">
                <label>Hasil</label>
                <input
                  name="hasil"
                  value={formData.hasil}
                  placeholder="Contoh: Edukasi sudah diberikan"
                  onChange={handleChange}
                />
              </div>

              <div className="bidan-field full">
                <label>Catatan</label>
                <textarea
                  rows={4}
                  name="catatan"
                  value={formData.catatan}
                  placeholder="Catatan tambahan tindak lanjut..."
                  onChange={handleChange}
                />
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

        <div className="bidan-table-list">
          {filteredData.map((item) => (
            <article className="bidan-tindak-card" key={item.id}>
              <div>
                <strong>{item.sasaran}</strong>
                <span>
                  {item.wilayah} · {item.jenis} · {item.fokus}
                </span>
                <p>{item.catatan || "Tidak ada catatan tambahan."}</p>
              </div>

              <small className={`bidan-status-badge ${item.status}`}>
                {getStatusLabel(item.status)}
              </small>

              <div className="team-action-group">
                <button
                  type="button"
                  className="team-action-button edit"
                  onClick={() => openEditForm(item)}
                >
                  <Edit3 size={16} />
                </button>

                <button
                  type="button"
                  className="team-action-button danger"
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {deleteTarget ? (
        <div className="bidan-confirm-backdrop">
          <div className="bidan-confirm-dialog">
            <div className="bidan-confirm-icon">
              <AlertTriangle size={24} />
            </div>

            <h2>Hapus Tindak Lanjut?</h2>
            <p>
              Data tindak lanjut untuk <strong>{deleteTarget.sasaran}</strong>{" "}
              akan dihapus dari daftar bidan.
            </p>

            <div className="bidan-confirm-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className="bidan-danger-button"
                onClick={confirmDelete}
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </BidanLayout>
  );
}

export default TindakLanjut;