import { Salad, Search } from "lucide-react";
import { useMemo, useState } from "react";
import BidanLayout from "../../layouts/BidanLayout";
import { panganBidan } from "../../utils/bidanStorage";

function PanganLokalBidan() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");

  const categories = useMemo(() => {
    return Array.from(new Set(panganBidan.map((item) => item.kategori)));
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return panganBidan.filter((item) => {
      const text = `${item.nama} ${item.kategori} ${item.manfaat} ${item.catatan}`.toLowerCase();

      const matchKeyword = !keyword || text.includes(keyword);
      const matchCategory =
        categoryFilter === "semua" || item.kategori === categoryFilter;

      return matchKeyword && matchCategory;
    });
  }, [searchKeyword, categoryFilter]);

  return (
    <BidanLayout
      title="Pangan Lokal"
      subtitle="Referensi edukasi pangan lokal untuk mendukung konseling gizi ibu dan anak."
    >
      <section className="admin-panel bidan-hero-card">
        <div className="bidan-hero-content">
          <div>
            <span>Pangan Lokal</span>
            <h2>Referensi Edukasi Gizi untuk Bidan</h2>
            <p>
              Bidan dapat menggunakan daftar pangan lokal sebagai bahan edukasi
              saat posyandu, kunjungan rumah, atau konseling ibu hamil dan
              keluarga risiko.
            </p>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Pangan</span>
            <h2>Pangan Lokal Pendukung Gizi</h2>
            <p>
              Informasi ini bersifat edukatif dan dapat disesuaikan dengan
              kondisi pangan yang tersedia di desa.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                value={searchKeyword}
                placeholder="Cari pangan, manfaat, sasaran..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <select
              className="admin-filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="semua">Semua Sasaran</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bidan-pangan-grid">
          {filteredData.map((item) => (
            <article className="bidan-pangan-card" key={item.id}>
              <div className="bidan-icon sedang">
                <Salad size={20} />
              </div>

              <div>
                <span>{item.kategori}</span>
                <h3>{item.nama}</h3>
                <p>{item.manfaat}</p>

                <div className="bidan-note-box">
                  <strong>Catatan Edukasi</strong>
                  <small>{item.catatan}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </BidanLayout>
  );
}

export default PanganLokalBidan;