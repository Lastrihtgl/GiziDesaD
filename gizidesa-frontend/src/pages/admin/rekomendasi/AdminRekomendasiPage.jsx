import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  Lightbulb,
  Search,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDataRisikoList } from "../../../api/dataRisikoApi";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import RiskBadge from "../../../components/dashboard/RiskBadge";
import AdminLayout from "../../../layouts/AdminLayout";
import { formatFactorLabel, formatNumber } from "../../../utils/formatters";

const CACHE_KEY = "gizidesa_data_risiko_cache";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function readCachedRisiko() {
  const cached = sessionStorage.getItem(CACHE_KEY);

  if (!cached) {
    return [];
  }

  try {
    return JSON.parse(cached);
  } catch {
    return [];
  }
}

function normalizeDataRisiko(item) {
  return {
    ...item,

    wilayah_id: item.wilayah_id || item.wilayah?.id || "",

    wilayah: {
      id: item.wilayah?.id || item.wilayah_id || "",
      nama_dusun: item.wilayah?.nama_dusun || "-",
      nama_rt: item.wilayah?.nama_rt || "-",
      kode_wilayah: item.wilayah?.kode_wilayah || "-",
    },

    periode: item.periode || "",

    skor_irs: Number(item.skor_irs ?? item.irs?.skor_irs ?? 0),

    kategori_risiko:
      item.kategori_risiko ?? item.irs?.kategori_risiko ?? "rendah",

    faktor_dominan: item.faktor_dominan ?? item.irs?.faktor_dominan ?? null,

    rekomendasi_awal:
      item.rekomendasi_awal ||
      "Lakukan pemantauan berkala berdasarkan kondisi wilayah.",
  };
}

function formatPeriodLabel(period) {
  if (!period || !period.includes("-")) {
    return "-";
  }

  const [year, month] = period.split("-");
  const monthIndex = Number(month) - 1;

  if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return period;
  }

  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

function getPriorityLabel(category) {
  const labels = {
    tinggi: "Prioritas Utama",
    sedang: "Perlu Pemantauan",
    rendah: "Pemantauan Berkala",
  };

  return labels[category] || "Pemantauan Berkala";
}

function getPriorityDescription(category) {
  const descriptions = {
    tinggi:
      "Wilayah perlu diprioritaskan untuk tindak lanjut intervensi karena memiliki skor risiko tinggi.",
    sedang:
      "Wilayah perlu dipantau dan diarahkan ke intervensi berkala agar risiko tidak meningkat.",
    rendah:
      "Wilayah tetap perlu edukasi pencegahan dan pemantauan rutin agar kondisi tetap terkendali.",
  };

  return descriptions[category] || descriptions.rendah;
}

function sortByPriorityAndScore(a, b) {
  const priorityOrder = {
    tinggi: 3,
    sedang: 2,
    rendah: 1,
  };

  const priorityA = priorityOrder[a.kategori_risiko] || 0;
  const priorityB = priorityOrder[b.kategori_risiko] || 0;

  if (priorityA !== priorityB) {
    return priorityB - priorityA;
  }

  return Number(b.skor_irs || 0) - Number(a.skor_irs || 0);
}

function AdminRekomendasiPage() {
  const navigate = useNavigate();

  const [dataRisikoList, setDataRisikoList] = useState(() =>
    readCachedRisiko().map((item) => normalizeDataRisiko(item))
  );

  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchDataRisiko() {
    try {
      setErrorMessage("");

      const response = await getDataRisikoList();

      const risikoData =
        response.data ||
        response.data_risiko ||
        response.items ||
        response ||
        [];

      const normalizedData = Array.isArray(risikoData)
        ? risikoData.map((item) => normalizeDataRisiko(item))
        : [];

      setDataRisikoList(normalizedData);

      sessionStorage.setItem(CACHE_KEY, JSON.stringify(normalizedData));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data rekomendasi gagal dimuat. Pastikan backend aktif dan token login valid."
      );
    }
  }

  useEffect(() => {
    fetchDataRisiko();
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const recommendationList = useMemo(() => {
    return [...dataRisikoList].sort(sortByPriorityAndScore);
  }, [dataRisikoList]);

  const filteredRecommendations = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return recommendationList.filter((item) => {
      const wilayahText = `${item.wilayah?.nama_dusun || ""} ${
        item.wilayah?.nama_rt || ""
      } ${item.wilayah?.kode_wilayah || ""}`.toLowerCase();

      const periodText = `${item.periode || ""} ${formatPeriodLabel(
        item.periode
      )}`.toLowerCase();

      const factorText = formatFactorLabel(item.faktor_dominan).toLowerCase();
      const recommendationText = String(item.rekomendasi_awal || "").toLowerCase();
      const categoryText = String(item.kategori_risiko || "").toLowerCase();

      const matchKeyword =
        !keyword ||
        wilayahText.includes(keyword) ||
        periodText.includes(keyword) ||
        factorText.includes(keyword) ||
        recommendationText.includes(keyword) ||
        categoryText.includes(keyword);

      const matchCategory =
        categoryFilter === "semua" || item.kategori_risiko === categoryFilter;

      return matchKeyword && matchCategory;
    });
  }, [recommendationList, searchKeyword, categoryFilter]);

  const totalRecommendations = dataRisikoList.length;

  const totalPriority = useMemo(() => {
    return dataRisikoList.filter((item) => item.kategori_risiko === "tinggi")
      .length;
  }, [dataRisikoList]);

  const totalMonitoring = useMemo(() => {
    return dataRisikoList.filter((item) => item.kategori_risiko === "sedang")
      .length;
  }, [dataRisikoList]);

  const dominantFactorCount = useMemo(() => {
    const factors = dataRisikoList
      .map((item) => item.faktor_dominan)
      .filter(Boolean);

    return new Set(factors).size;
  }, [dataRisikoList]);

  const topPriorityItems = useMemo(() => {
    return recommendationList.slice(0, 3);
  }, [recommendationList]);

  const handleGoToTracking = () => {
    navigate("/admin/intervensi");
  };

  const handleGoToDataRisiko = () => {
    navigate("/admin/data-risiko");
  };

  return (
    <AdminLayout
      title="Rekomendasi"
      subtitle="Menampilkan rekomendasi awal berdasarkan skor IRS, kategori risiko, dan faktor dominan wilayah."
    >
      <ErrorAlert message={errorMessage} />

      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Rekomendasi</span>
          <strong>{formatNumber(totalRecommendations)}</strong>
          <p>Berbasis data risiko</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Prioritas Utama</span>
          <strong>{formatNumber(totalPriority)}</strong>
          <p>Wilayah risiko tinggi</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Perlu Pemantauan</span>
          <strong>{formatNumber(totalMonitoring)}</strong>
          <p>Wilayah risiko sedang</p>
        </article>

        <article className="admin-metric-card success">
          <span>Faktor Dominan</span>
          <strong>{formatNumber(dominantFactorCount)}</strong>
          <p>Jenis faktor teridentifikasi</p>
        </article>
      </section>

      <section className="admin-dashboard-grid bottom">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Prioritas</span>
              <h2>Rekomendasi Utama</h2>
              <p>
                Wilayah dengan skor dan kategori risiko tertinggi ditampilkan
                lebih dahulu agar mudah ditindaklanjuti.
              </p>
            </div>

            <button type="button" onClick={handleGoToDataRisiko}>
              Lihat Data Risiko
              <ArrowUpRight size={14} />
            </button>
          </div>

          {topPriorityItems.length === 0 ? (
            <EmptyState
              title="Belum ada rekomendasi"
              message="Tambahkan data risiko agar sistem dapat menghasilkan rekomendasi awal."
            />
          ) : (
            <div className="priority-list">
              {topPriorityItems.map((item, index) => (
                <div className="priority-item" key={item.id}>
                  <div className="priority-rank">#{index + 1}</div>

                  <div className="priority-content">
                    <strong>
                      {item.wilayah?.nama_dusun || "-"} -{" "}
                      {item.wilayah?.nama_rt || "-"}
                    </strong>
                    <span>
                      {formatPeriodLabel(item.periode)} ·{" "}
                      {formatFactorLabel(item.faktor_dominan)}
                    </span>
                  </div>

                  <div className="priority-score">
                    <strong>{Number(item.skor_irs || 0).toFixed(2)}</strong>
                    <span>Skor IRS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Arah Tindak Lanjut</span>
              <h2>Alur Rekomendasi</h2>
              <p>
                Rekomendasi digunakan sebagai dasar untuk menentukan tindak lanjut
                intervensi di wilayah prioritas.
              </p>
            </div>

            <button type="button" onClick={handleGoToTracking}>
              Buka Tracking
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="recent-intervention-list">
            <div className="recent-intervention-item">
              <div className="recent-icon">
                <BarChart3 size={18} />
              </div>
              <div>
                <strong>Analisis IRS</strong>
                <p>Skor risiko dihitung dari indikator wilayah.</p>
                <small>Dasar pemetaan prioritas</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <Lightbulb size={18} />
              </div>
              <div>
                <strong>Rekomendasi Awal</strong>
                <p>Rekomendasi dibuat berdasarkan faktor dominan.</p>
                <small>Arah tindakan awal</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <ClipboardList size={18} />
              </div>
              <div>
                <strong>Tracking Intervensi</strong>
                <p>Admin dapat memantau status tindak lanjut program.</p>
                <small>Monitoring pelaksanaan</small>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Rekomendasi</span>
            <h2>Rekomendasi Wilayah</h2>
            <p>
              Rekomendasi ditampilkan berdasarkan wilayah, periode, skor IRS,
              faktor dominan, dan kategori risiko.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari wilayah, faktor, rekomendasi..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <select
              className="admin-filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="semua">Semua Risiko</option>
              <option value="tinggi">Risiko Tinggi</option>
              <option value="sedang">Risiko Sedang</option>
              <option value="rendah">Risiko Rendah</option>
            </select>
          </div>
        </div>

        {filteredRecommendations.length === 0 ? (
          <EmptyState
            title="Rekomendasi belum tersedia"
            message="Data rekomendasi akan muncul setelah data risiko dan skor IRS tersedia."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>Periode</th>
                  <th>Skor IRS</th>
                  <th>Kategori</th>
                  <th>Prioritas</th>
                  <th>Faktor Dominan</th>
                  <th>Rekomendasi</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecommendations.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="risk-location-cell">
                        <span>
                          <Target size={15} />
                        </span>
                        <div>
                          <strong>
                            {item.wilayah?.nama_dusun || "-"} -{" "}
                            {item.wilayah?.nama_rt || "-"}
                          </strong>
                          <small>{item.wilayah?.kode_wilayah || "-"}</small>
                        </div>
                      </div>
                    </td>

                    <td>{formatPeriodLabel(item.periode)}</td>

                    <td>
                      <strong className="irs-score">
                        {Number(item.skor_irs || 0).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <RiskBadge value={item.kategori_risiko} />
                    </td>

                    <td>{getPriorityLabel(item.kategori_risiko)}</td>

                    <td>{formatFactorLabel(item.faktor_dominan)}</td>

                    <td>
                      <span className="table-muted-text">
                        {item.rekomendasi_awal}
                      </span>
                    </td>

                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-button view"
                          title="Buka tracking intervensi"
                          onClick={handleGoToTracking}
                        >
                          <ArrowUpRight size={16} />
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

      {filteredRecommendations.length > 0 && (
        <section className="admin-panel" style={{ marginTop: 18 }}>
          <div className="admin-panel-header">
            <div>
              <span>Catatan Penggunaan</span>
              <h2>Interpretasi Rekomendasi</h2>
              <p>
                Rekomendasi awal membantu admin menentukan wilayah yang perlu
                dipantau dan diarahkan ke tindak lanjut intervensi.
              </p>
            </div>
          </div>

          <div className="recent-intervention-list">
            <div className="recent-intervention-item">
              <div className="recent-icon">
                <Target size={18} />
              </div>
              <div>
                <strong>Risiko Tinggi</strong>
                <p>{getPriorityDescription("tinggi")}</p>
                <small>Prioritas intervensi</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <BarChart3 size={18} />
              </div>
              <div>
                <strong>Risiko Sedang</strong>
                <p>{getPriorityDescription("sedang")}</p>
                <small>Pemantauan berkala</small>
              </div>
            </div>

            <div className="recent-intervention-item">
              <div className="recent-icon">
                <Lightbulb size={18} />
              </div>
              <div>
                <strong>Risiko Rendah</strong>
                <p>{getPriorityDescription("rendah")}</p>
                <small>Edukasi pencegahan</small>
              </div>
            </div>
          </div>
        </section>
      )}
    </AdminLayout>
  );
}

export default AdminRekomendasiPage;