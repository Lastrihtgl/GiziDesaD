import {
  BookOpen,
  Search,
  Sprout,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getPanganLokalList } from "../../api/panganLokalApi";
import KaderLayout from "../../layouts/KaderLayout";
import { formatNumber } from "../../utils/formatters";

const DEFAULT_PANGAN = [
  {
    id: 1,
    nama_pangan: "Daun Kelor",
    kategori: "sayuran",
    manfaat: "Sumber zat besi, vitamin, dan mineral untuk mendukung kebutuhan gizi keluarga.",
    sasaran: "Ibu hamil, balita, dan keluarga risiko gizi.",
    cara_penggunaan:
      "Dapat diolah sebagai sayur bening, campuran bubur, atau lauk pendamping.",
  },
  {
    id: 2,
    nama_pangan: "Ikan Mujair",
    kategori: "protein",
    manfaat: "Sumber protein hewani untuk membantu pertumbuhan balita dan pemenuhan gizi keluarga.",
    sasaran: "Balita dan keluarga dengan risiko gizi.",
    cara_penggunaan:
      "Dapat dimasak sebagai lauk harian dengan cara direbus, dikukus, atau dipanggang.",
  },
];

function normalizePangan(item) {
  return {
    id: item.id,
    nama_pangan: item.nama_pangan || item.nama || item.name || "-",
    kategori: item.kategori || item.category || "lainnya",
    manfaat: item.manfaat || item.deskripsi || item.description || "",
    sasaran: item.sasaran || item.target || "Masyarakat umum",
    cara_penggunaan:
      item.cara_penggunaan ||
      item.rekomendasi_penggunaan ||
      item.catatan ||
      "Gunakan sesuai kebutuhan edukasi gizi masyarakat.",
  };
}

function getCategoryLabel(value) {
  const labels = {
    sayuran: "Sayuran",
    buah: "Buah",
    protein: "Protein",
    karbohidrat: "Karbohidrat",
    kacang_kacangan: "Kacang-kacangan",
    lainnya: "Lainnya",
  };

  return labels[value] || value || "-";
}

function EdukasiPangan() {
  const [panganList, setPanganList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [loading, setLoading] = useState(true);

  async function fetchPanganData() {
    try {
      setLoading(true);

      const response = await getPanganLokalList();
      const rawData =
        response.data || response.pangan_lokal || response.items || response || [];

      const normalized = Array.isArray(rawData)
        ? rawData.map(normalizePangan)
        : DEFAULT_PANGAN;

      setPanganList(normalized.length > 0 ? normalized : DEFAULT_PANGAN);
    } catch {
      setPanganList(DEFAULT_PANGAN);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPanganData();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(panganList.map((item) => item.kategori))).filter(
      Boolean
    );
  }, [panganList]);

  const filteredPangan = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return panganList.filter((item) => {
      const text = `${item.nama_pangan} ${item.kategori} ${item.manfaat} ${item.sasaran} ${item.cara_penggunaan}`.toLowerCase();

      const matchKeyword = !keyword || text.includes(keyword);
      const matchCategory =
        categoryFilter === "semua" || item.kategori === categoryFilter;

      return matchKeyword && matchCategory;
    });
  }, [panganList, searchKeyword, categoryFilter]);

  return (
    <KaderLayout
      title="Edukasi Pangan"
      subtitle="Referensi pangan lokal untuk membantu kader memberikan edukasi gizi kepada masyarakat."
    >
      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Pangan</span>
          <strong>{formatNumber(panganList.length)}</strong>
          <p>Referensi tersedia</p>
        </article>

        <article className="admin-metric-card success">
          <span>Kategori</span>
          <strong>{formatNumber(categories.length)}</strong>
          <p>Kelompok pangan</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Ditampilkan</span>
          <strong>{formatNumber(filteredPangan.length)}</strong>
          <p>Hasil filter</p>
        </article>
      </section>

      <section className="admin-panel kader-hero-card">
        <div className="kader-hero-content">
          <div>
            <span>Edukasi Pangan</span>
            <h2>Referensi Pangan Lokal untuk Penyuluhan</h2>
            <p>
              Kader dapat menggunakan informasi pangan lokal sebagai bahan
              edukasi kepada ibu hamil, keluarga risiko, dan masyarakat agar
              pemenuhan gizi dapat disesuaikan dengan potensi lokal desa.
            </p>
          </div>

          <div className="kader-hero-summary">
            <Sprout size={22} />
            <div>
              <strong>Berbasis Potensi Lokal</strong>
              <p>
                Edukasi pangan lokal membantu masyarakat memilih sumber gizi
                yang dekat, mudah diperoleh, dan relevan dengan kondisi desa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Edukasi</span>
            <h2>Pangan Lokal</h2>
            <p>
              Informasi ini bersifat edukatif. Kader dapat menjadikannya bahan
              komunikasi saat kunjungan atau kegiatan posyandu.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
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
              <option value="semua">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="kader-table-empty">Memuat edukasi pangan...</div>
        ) : (
          <div className="kader-pangan-grid">
            {filteredPangan.length === 0 ? (
              <div className="kader-table-empty">
                Belum ada pangan lokal yang sesuai.
              </div>
            ) : (
              filteredPangan.map((item) => (
                <article className="kader-pangan-card" key={item.id}>
                  <div className="kader-pangan-icon">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <span>{getCategoryLabel(item.kategori)}</span>
                    <h3>{item.nama_pangan}</h3>
                    <p>{item.manfaat}</p>

                    <div className="kader-pangan-note">
                      <strong>Sasaran Edukasi</strong>
                      <small>{item.sasaran}</small>
                    </div>

                    <div className="kader-pangan-note">
                      <strong>Cara Penggunaan</strong>
                      <small>{item.cara_penggunaan}</small>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </KaderLayout>
  );
}

export default EdukasiPangan;