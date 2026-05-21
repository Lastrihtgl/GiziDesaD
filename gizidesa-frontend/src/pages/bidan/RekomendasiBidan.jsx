import { ClipboardCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";
import BidanLayout from "../../layouts/BidanLayout";
import { rekomendasiBidan } from "../../utils/bidanStorage";

function RekomendasiBidan() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("semua");

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return rekomendasiBidan.filter((item) => {
      const text = `${item.wilayah} ${item.kategori} ${item.faktor} ${item.rekomendasi}`.toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword);
      const matchPriority =
        priorityFilter === "semua" || item.prioritas === priorityFilter;

      return matchKeyword && matchPriority;
    });
  }, [searchKeyword, priorityFilter]);

  return (
    <BidanLayout
      title="Rekomendasi Bidan"
      subtitle="Membaca rekomendasi kesehatan berdasarkan faktor risiko wilayah."
    >
      <section className="admin-panel bidan-hero-card">
        <div className="bidan-hero-content">
          <div>
            <span>Rekomendasi</span>
            <h2>Acuan Tindak Lanjut Kesehatan Wilayah</h2>
            <p>
              Rekomendasi membantu bidan menentukan prioritas edukasi,
              kunjungan, rujukan, dan pemantauan kesehatan ibu dan anak.
            </p>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Rekomendasi</span>
            <h2>Rekomendasi Prioritas</h2>
            <p>Gunakan rekomendasi ini sebagai acuan tindak lanjut bidan.</p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                value={searchKeyword}
                placeholder="Cari wilayah, faktor, rekomendasi..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

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
          </div>
        </div>

        <div className="bidan-rekomendasi-grid">
          {filteredData.map((item) => (
            <article className="bidan-rekomendasi-card" key={item.id}>
              <div className={`bidan-icon ${item.prioritas}`}>
                <ClipboardCheck size={20} />
              </div>

              <div>
                <div className="bidan-card-header">
                  <strong>{item.wilayah}</strong>
                  <small className={`bidan-status-badge ${item.prioritas}`}>
                    {item.prioritas}
                  </small>
                </div>

                <span>
                  {item.kategori} · {item.faktor}
                </span>
                <p>{item.rekomendasi}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </BidanLayout>
  );
}

export default RekomendasiBidan;    