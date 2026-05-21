import { Edit3, Save, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import BidanLayout from "../../layouts/BidanLayout";
import { getAncData, updateAncData } from "../../utils/bidanStorage";

function getKekLabel(value) {
  return value === "kek" ? "KEK" : "Normal";
}

function getAncLabel(value) {
  return value === "tidak_rutin" ? "ANC Tidak Rutin" : "ANC Rutin";
}

function MonitorAnc() {
  const [dataList, setDataList] = useState(getAncData());
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    status_kek: "normal",
    anc_status: "rutin",
    lila: "",
    prioritas: "sedang",
    catatan: "",
  });
  const [errors, setErrors] = useState({});

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return dataList.filter((item) => {
      const text = `${item.nama} ${item.wilayah} ${item.status_kek} ${item.anc_status} ${item.prioritas}`.toLowerCase();
      return !keyword || text.includes(keyword);
    });
  }, [dataList, searchKeyword]);

  function openEdit(item) {
    setEditingId(item.id);
    setErrors({});
    setFormData({
      status_kek: item.status_kek || "normal",
      anc_status: item.anc_status || "rutin",
      lila: item.lila || "",
      prioritas: item.prioritas || "sedang",
      catatan: item.catatan || "",
    });
  }

  function closeEdit() {
    setEditingId(null);
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
    const lilaValue = Number(formData.lila);

    if (!formData.lila) {
      nextErrors.lila = "LILA wajib diisi.";
    } else if (Number.isNaN(lilaValue) || lilaValue < 10 || lilaValue > 40) {
      nextErrors.lila = "LILA harus berupa angka realistis, contoh 23.5.";
    }

    if (!formData.catatan.trim()) {
      nextErrors.catatan = "Catatan pemantauan wajib diisi.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function saveData(id) {
    if (!validateForm()) {
      return;
    }

    const updated = updateAncData(id, {
      ...formData,
      lila: Number(formData.lila || 0),
      catatan: formData.catatan.trim(),
    });

    setDataList(updated);
    closeEdit();
  }

  return (
    <BidanLayout
      title="Monitor ANC"
      subtitle="Memantau ibu hamil, status KEK, LILA, dan kepatuhan pemeriksaan ANC."
    >
      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Ibu Hamil</span>
          <strong>{dataList.length}</strong>
          <p>Sasaran terpantau</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Ibu Hamil KEK</span>
          <strong>
            {dataList.filter((item) => item.status_kek === "kek").length}
          </strong>
          <p>Butuh perhatian</p>
        </article>

        <article className="admin-metric-card trend">
          <span>ANC Tidak Rutin</span>
          <strong>
            {dataList.filter((item) => item.anc_status === "tidak_rutin").length}
          </strong>
          <p>Perlu pemantauan</p>
        </article>

        <article className="admin-metric-card success">
          <span>Prioritas Tinggi</span>
          <strong>
            {dataList.filter((item) => item.prioritas === "tinggi").length}
          </strong>
          <p>Kunjungan awal</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Pemantauan ANC</span>
            <h2>Daftar Ibu Hamil</h2>
            <p>Perbarui status KEK, LILA, dan kepatuhan ANC.</p>
          </div>

          <div className="admin-search-control">
            <Search size={18} />
            <input
              value={searchKeyword}
              placeholder="Cari nama, wilayah, status..."
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </div>
        </div>

        <div className="bidan-validation-list">
          {filteredData.map((item) => (
            <article className="bidan-validation-card" key={item.id}>
              <div className="bidan-validation-main">
                <div>
                  <strong>{item.nama}</strong>
                  <span>
                    {item.wilayah} · Usia kehamilan {item.usia_kehamilan} minggu
                  </span>
                  <p>{item.catatan}</p>

                  <div className="bidan-meta-row">
                    <small className={`bidan-status-badge ${item.status_kek}`}>
                      {getKekLabel(item.status_kek)}
                    </small>
                    <small className={`bidan-status-badge ${item.anc_status}`}>
                      {getAncLabel(item.anc_status)}
                    </small>
                    <small className="bidan-status-badge netral">
                      LILA {item.lila} cm
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="team-action-button edit"
                  onClick={() => openEdit(item)}
                  title="Edit Pemantauan"
                >
                  <Edit3 size={16} />
                </button>
              </div>

              {editingId === item.id ? (
                <div className="bidan-inline-form">
                  <div className="bidan-form-grid">
                    <select
                      name="status_kek"
                      value={formData.status_kek}
                      onChange={handleChange}
                    >
                      <option value="normal">Normal</option>
                      <option value="kek">KEK</option>
                    </select>

                    <select
                      name="anc_status"
                      value={formData.anc_status}
                      onChange={handleChange}
                    >
                      <option value="rutin">ANC Rutin</option>
                      <option value="tidak_rutin">ANC Tidak Rutin</option>
                    </select>

                    <div>
                      <input
                        type="number"
                        name="lila"
                        value={formData.lila}
                        placeholder="LILA, contoh 23.5"
                        onChange={handleChange}
                      />
                      {errors.lila ? <small>{errors.lila}</small> : null}
                    </div>

                    <select
                      name="prioritas"
                      value={formData.prioritas}
                      onChange={handleChange}
                    >
                      <option value="tinggi">Tinggi</option>
                      <option value="sedang">Sedang</option>
                      <option value="rendah">Rendah</option>
                    </select>
                  </div>

                  <textarea
                    rows={3}
                    name="catatan"
                    value={formData.catatan}
                    placeholder="Catatan pemantauan bidan..."
                    onChange={handleChange}
                  />
                  {errors.catatan ? <small>{errors.catatan}</small> : null}

                  <div className="bidan-action-row">
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={closeEdit}
                    >
                      <XCircle size={16} />
                      Batal
                    </button>

                    <button
                      type="button"
                      className="admin-primary-button"
                      onClick={() => saveData(item.id)}
                    >
                      <Save size={16} />
                      Simpan Pemantauan
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </BidanLayout>
  );
}

export default MonitorAnc;