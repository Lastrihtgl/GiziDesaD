import { Edit3, Save, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import BidanLayout from "../../layouts/BidanLayout";
import { getValidasiData, updateValidasiData } from "../../utils/bidanStorage";

function getStatusLabel(status) {
  const labels = {
    valid: "Valid",
    perlu_revisi: "Perlu Revisi",
    perlu_tindak_lanjut: "Perlu Tindak Lanjut",
  };

  return labels[status] || status;
}

function ValidasiData() {
  const [dataList, setDataList] = useState(getValidasiData());
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [catatanBidan, setCatatanBidan] = useState("");
  const [statusValidasi, setStatusValidasi] = useState("valid");

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return dataList.filter((item) => {
      const text = `${item.nama} ${item.wilayah} ${item.kategori} ${item.faktor} ${item.status}`.toLowerCase();
      return !keyword || text.includes(keyword);
    });
  }, [dataList, searchKeyword]);

  function openEdit(item) {
    setEditingId(item.id);
    setCatatanBidan(item.catatan_bidan || "");
    setStatusValidasi(item.status || "valid");
  }

  function closeEdit() {
    setEditingId(null);
    setCatatanBidan("");
    setStatusValidasi("valid");
  }

  function saveValidation(id) {
    const updated = updateValidasiData(id, {
      status: statusValidasi,
      catatan_bidan: catatanBidan.trim(),
    });

    setDataList(updated);
    closeEdit();
  }

  return (
    <BidanLayout
      title="Validasi Data"
      subtitle="Memeriksa data sasaran dari kader sebelum digunakan untuk pemantauan kesehatan."
    >
      <section className="admin-panel bidan-hero-card">
        <div className="bidan-hero-content">
          <div>
            <span>Validasi Bidan</span>
            <h2>Peninjauan Data Sasaran Kesehatan</h2>
            <p>
              Bidan memeriksa data ibu hamil, balita, dan keluarga risiko, lalu
              memberi status validasi serta catatan kesehatan.
            </p>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Validasi</span>
            <h2>Data Sasaran Masuk</h2>
            <p>Gunakan validasi untuk memastikan data layak ditindaklanjuti.</p>
          </div>

          <div className="admin-search-control">
            <Search size={18} />
            <input
              value={searchKeyword}
              placeholder="Cari nama, wilayah, faktor..."
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
                    {item.wilayah} · {item.kategori} · {item.faktor}
                  </span>
                  <p>Catatan kader: {item.catatan_kader}</p>
                </div>

                <small className={`bidan-status-badge ${item.status}`}>
                  {getStatusLabel(item.status)}
                </small>
              </div>

              {editingId === item.id ? (
                <div className="bidan-inline-form">
                  <select
                    value={statusValidasi}
                    onChange={(event) => setStatusValidasi(event.target.value)}
                  >
                    <option value="valid">Valid</option>
                    <option value="perlu_revisi">Perlu Revisi</option>
                    <option value="perlu_tindak_lanjut">
                      Perlu Tindak Lanjut
                    </option>
                  </select>

                  <textarea
                    rows={3}
                    value={catatanBidan}
                    placeholder="Tulis catatan validasi bidan..."
                    onChange={(event) => setCatatanBidan(event.target.value)}
                  />

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
                      onClick={() => saveValidation(item.id)}
                    >
                      <Save size={16} />
                      Simpan Validasi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bidan-validation-footer">
                  <p>Catatan bidan: {item.catatan_bidan || "-"}</p>

                  <button
                    type="button"
                    className="team-action-button edit"
                    onClick={() => openEdit(item)}
                    title="Validasi Data"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </BidanLayout>
  );
}

export default ValidasiData;