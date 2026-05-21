import {
  AlertTriangle,
  BarChart3,
  Filter,
  MapPin,
  Navigation,
  Search,
  Target,
} from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { getDataRisikoList } from "../../../api/dataRisikoApi";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import RiskBadge from "../../../components/dashboard/RiskBadge";
import AdminLayout from "../../../layouts/AdminLayout";
import { formatFactorLabel, formatNumber } from "../../../utils/formatters";

const CACHE_KEY = "gizidesa_data_risiko_cache";

const DEFAULT_CENTER = {
  lat: 2.3339,
  lng: 99.0669,
};

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
  const wilayah = item.wilayah || {};

  return {
    ...item,

    wilayah_id: item.wilayah_id || wilayah.id || "",

    wilayah: {
      id: wilayah.id || item.wilayah_id || "",
      nama_dusun: wilayah.nama_dusun || "-",
      nama_rt: wilayah.nama_rt || "-",
      kode_wilayah: wilayah.kode_wilayah || "-",
      latitude: wilayah.latitude ?? null,
      longitude: wilayah.longitude ?? null,
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

function hasCoordinate(item) {
  const rawLatitude = item.wilayah?.latitude;
  const rawLongitude = item.wilayah?.longitude;

  if (
    rawLatitude === null ||
    rawLatitude === undefined ||
    rawLatitude === "" ||
    rawLongitude === null ||
    rawLongitude === undefined ||
    rawLongitude === ""
  ) {
    return false;
  }

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return false;
  }

  if (latitude === 0 && longitude === 0) {
    return false;
  }

  return true;
}

function getCoordinate(item) {
  return [Number(item.wilayah.latitude), Number(item.wilayah.longitude)];
}

function getRiskColor(category) {
  if (category === "tinggi") {
    return "#dc2626";
  }

  if (category === "sedang") {
    return "#f59e0b";
  }

  if (category === "rendah") {
    return "#16a34a";
  }

  return "#64748b";
}

function getRiskFillColor(category) {
  if (category === "tinggi") {
    return "#fecaca";
  }

  if (category === "sedang") {
    return "#fde68a";
  }

  if (category === "rendah") {
    return "#bbf7d0";
  }

  return "#e5e7eb";
}

function getRiskDescription(category) {
  const descriptions = {
    tinggi:
      "Wilayah ini menjadi prioritas utama karena memiliki kategori risiko tinggi.",
    sedang:
      "Wilayah ini perlu dipantau secara berkala agar risiko tidak meningkat.",
    rendah:
      "Wilayah ini berada pada kondisi relatif terkendali, tetapi edukasi tetap diperlukan.",
  };

  return descriptions[category] || "Kategori risiko belum tersedia.";
}

function sortByRisk(a, b) {
  const order = {
    tinggi: 3,
    sedang: 2,
    rendah: 1,
  };

  const categoryDiff =
    (order[b.kategori_risiko] || 0) - (order[a.kategori_risiko] || 0);

  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  return Number(b.skor_irs || 0) - Number(a.skor_irs || 0);
}

function MapViewController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!center?.lat || !center?.lng) {
      return;
    }

    map.setView([center.lat, center.lng], zoom);
  }, [center, map, zoom]);

  return null;
}

function AdminPetaRisikoPage() {
  const [dataRisikoList, setDataRisikoList] = useState(() =>
    readCachedRisiko().map((item) => normalizeDataRisiko(item))
  );

  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [factorFilter, setFactorFilter] = useState("semua");

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(13);

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

      const firstMapped = normalizedData.find((item) => hasCoordinate(item));

      if (firstMapped) {
        const [lat, lng] = getCoordinate(firstMapped);
        setMapCenter({ lat, lng });
        setMapZoom(14);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data peta risiko gagal dimuat. Pastikan backend aktif dan token login valid."
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

  const factorOptions = useMemo(() => {
    const factors = dataRisikoList
      .map((item) => item.faktor_dominan)
      .filter(Boolean);

    return Array.from(new Set(factors));
  }, [dataRisikoList]);

  const filteredRiskData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return [...dataRisikoList].sort(sortByRisk).filter((item) => {
      const wilayahText = `${item.wilayah?.nama_dusun || ""} ${
        item.wilayah?.nama_rt || ""
      } ${item.wilayah?.kode_wilayah || ""}`.toLowerCase();

      const periodText = `${item.periode || ""} ${formatPeriodLabel(
        item.periode
      )}`.toLowerCase();

      const factorText = formatFactorLabel(item.faktor_dominan).toLowerCase();
      const recommendationText = String(
        item.rekomendasi_awal || ""
      ).toLowerCase();
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

      const matchFactor =
        factorFilter === "semua" || item.faktor_dominan === factorFilter;

      return matchKeyword && matchCategory && matchFactor;
    });
  }, [categoryFilter, dataRisikoList, factorFilter, searchKeyword]);

  const mappedRiskData = useMemo(() => {
    return filteredRiskData.filter((item) => hasCoordinate(item));
  }, [filteredRiskData]);

  const unmappedRiskData = useMemo(() => {
    return filteredRiskData.filter((item) => !hasCoordinate(item));
  }, [filteredRiskData]);

  const totalWilayahBerisiko = dataRisikoList.length;

  const totalTinggi = useMemo(() => {
    return dataRisikoList.filter((item) => item.kategori_risiko === "tinggi")
      .length;
  }, [dataRisikoList]);

  const totalSedang = useMemo(() => {
    return dataRisikoList.filter((item) => item.kategori_risiko === "sedang")
      .length;
  }, [dataRisikoList]);

  const totalRendah = useMemo(() => {
    return dataRisikoList.filter((item) => item.kategori_risiko === "rendah")
      .length;
  }, [dataRisikoList]);

  const totalDenganKoordinat = useMemo(() => {
    return dataRisikoList.filter((item) => hasCoordinate(item)).length;
  }, [dataRisikoList]);

  const highestRisk = useMemo(() => {
    if (dataRisikoList.length === 0) {
      return null;
    }

    return [...dataRisikoList].sort(sortByRisk)[0];
  }, [dataRisikoList]);

  const handleFocusMarker = (item) => {
    if (!hasCoordinate(item)) {
      return;
    }

    const [lat, lng] = getCoordinate(item);

    setMapCenter({
      lat,
      lng,
    });
    setMapZoom(17);
  };

  return (
    <AdminLayout
      title="Peta Risiko"
      subtitle="Visualisasi peta risiko wilayah berdasarkan koordinat, skor IRS, dan kategori risiko."
    >
      <ErrorAlert message={errorMessage} />

      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Data Risiko</span>
          <strong>{formatNumber(totalWilayahBerisiko)}</strong>
          <p>Data IRS tercatat</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Risiko Tinggi</span>
          <strong>{formatNumber(totalTinggi)}</strong>
          <p>Prioritas utama intervensi</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Risiko Sedang</span>
          <strong>{formatNumber(totalSedang)}</strong>
          <p>Perlu pemantauan berkala</p>
        </article>

        <article className="admin-metric-card success">
          <span>Risiko Rendah</span>
          <strong>{formatNumber(totalRendah)}</strong>
          <p>Kondisi relatif terkendali</p>
        </article>
      </section>

      <section className="admin-dashboard-grid bottom">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Prioritas</span>
              <h2>Titik Risiko Tertinggi</h2>
              <p>
                Wilayah dengan skor IRS dan kategori risiko tertinggi menjadi
                acuan awal untuk tindak lanjut intervensi.
              </p>
            </div>
          </div>

          {!highestRisk ? (
            <EmptyState
              title="Belum ada data risiko"
              message="Tambahkan data risiko agar titik prioritas dapat ditampilkan."
            />
          ) : (
            <div className="risk-map-highlight">
              <div className="risk-map-highlight-icon">
                <AlertTriangle size={28} />
              </div>

              <div className="risk-map-highlight-content">
                <span>Wilayah Prioritas</span>
                <h3>
                  {highestRisk.wilayah?.nama_dusun || "-"} -{" "}
                  {highestRisk.wilayah?.nama_rt || "-"}
                </h3>
                <p>{getRiskDescription(highestRisk.kategori_risiko)}</p>

                <div className="risk-map-highlight-meta">
                  <RiskBadge value={highestRisk.kategori_risiko} />
                  <strong>
                    IRS {Number(highestRisk.skor_irs || 0).toFixed(2)}
                  </strong>
                  <small>{formatPeriodLabel(highestRisk.periode)}</small>

                  {hasCoordinate(highestRisk) && (
                    <button
                      type="button"
                      className="risk-map-focus-button"
                      onClick={() => handleFocusMarker(highestRisk)}
                    >
                      <Navigation size={15} />
                      Lihat di Peta
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Legenda</span>
              <h2>Warna Marker Risiko</h2>
              <p>
                Warna marker menunjukkan kategori risiko berdasarkan hasil
                perhitungan IRS.
              </p>
            </div>
          </div>

          <div className="risk-distribution">
            <div className="risk-row high">
              <div>
                <strong>Risiko Tinggi</strong>
                <span>Marker merah, prioritas intervensi segera</span>
              </div>
              <RiskBadge value="tinggi" />
            </div>

            <div className="risk-row medium">
              <div>
                <strong>Risiko Sedang</strong>
                <span>Marker kuning, perlu pemantauan berkala</span>
              </div>
              <RiskBadge value="sedang" />
            </div>

            <div className="risk-row low">
              <div>
                <strong>Risiko Rendah</strong>
                <span>Marker hijau, edukasi pencegahan rutin</span>
              </div>
              <RiskBadge value="rendah" />
            </div>
          </div>
        </article>
      </section>

      <section className="admin-panel" style={{ marginTop: 18 }}>
        <div className="admin-list-toolbar">
          <div>
            <span>Peta Risiko Wilayah</span>
            <h2>Visualisasi Sebaran Risiko</h2>
            <p>
              Marker pada peta menampilkan wilayah yang sudah memiliki
              koordinat. Klik marker untuk melihat skor IRS, faktor dominan,
              dan rekomendasi awal.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari wilayah, periode, faktor..."
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

            <select
              className="admin-filter-select"
              value={factorFilter}
              onChange={(event) => setFactorFilter(event.target.value)}
            >
              <option value="semua">Semua Faktor</option>
              {factorOptions.map((factor) => (
                <option key={factor} value={factor}>
                  {formatFactorLabel(factor)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="risk-map-status-bar">
          <div>
            <MapPin size={18} />
            <span>
              {formatNumber(mappedRiskData.length)} titik tampil di peta
            </span>
          </div>

          <div>
            <AlertTriangle size={18} />
            <span>
              {formatNumber(unmappedRiskData.length)} data belum memiliki
              koordinat
            </span>
          </div>
        </div>

        {mappedRiskData.length === 0 ? (
          <EmptyState
            title="Belum ada marker pada peta"
            message="Pastikan data wilayah sudah memiliki latitude dan longitude, serta data risiko sudah terhubung dengan wilayah tersebut."
          />
        ) : (
          <div className="real-risk-map-wrapper">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapZoom}
              scrollWheelZoom
              className="real-risk-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapViewController center={mapCenter} zoom={mapZoom} />

              {mappedRiskData.map((item) => {
                const color = getRiskColor(item.kategori_risiko);
                const fillColor = getRiskFillColor(item.kategori_risiko);
                const [lat, lng] = getCoordinate(item);

                return (
                  <CircleMarker
                    key={item.id}
                    center={[lat, lng]}
                    radius={15}
                    pathOptions={{
                      color,
                      fillColor,
                      fillOpacity: 0.88,
                      weight: 4,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      <strong>
                        {item.wilayah?.nama_dusun || "-"} -{" "}
                        {item.wilayah?.nama_rt || "-"}
                      </strong>
                    </Tooltip>

                    <Popup>
                      <div className="risk-map-popup">
                        <span>Wilayah Risiko</span>

                        <h3>
                          {item.wilayah?.nama_dusun || "-"} -{" "}
                          {item.wilayah?.nama_rt || "-"}
                        </h3>

                        <p className="risk-map-popup-code">
                          {item.wilayah?.kode_wilayah || "-"}
                        </p>

                        <div className="risk-map-popup-row">
                          <small>Periode</small>
                          <strong>{formatPeriodLabel(item.periode)}</strong>
                        </div>

                        <div className="risk-map-popup-row">
                          <small>Skor IRS</small>
                          <strong>
                            {Number(item.skor_irs || 0).toFixed(2)}
                          </strong>
                        </div>

                        <div className="risk-map-popup-row">
                          <small>Kategori</small>
                          <RiskBadge value={item.kategori_risiko} />
                        </div>

                        <div className="risk-map-popup-row">
                          <small>Faktor Dominan</small>
                          <strong>
                            {formatFactorLabel(item.faktor_dominan)}
                          </strong>
                        </div>

                        <div className="risk-map-popup-recommendation">
                          <small>Rekomendasi Awal</small>
                          <p>{item.rekomendasi_awal || "-"}</p>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {unmappedRiskData.length > 0 && (
          <div className="risk-coordinate-warning">
            <AlertTriangle size={18} />
            <p>
              Ada {unmappedRiskData.length} data risiko yang belum tampil pada
              peta karena wilayahnya belum memiliki latitude dan longitude.
              Lengkapi koordinat melalui halaman Kelola Wilayah.
            </p>
          </div>
        )}
      </section>

      <section className="admin-panel" style={{ marginTop: 18 }}>
        <div className="admin-panel-header">
          <div>
            <span>Daftar Titik</span>
            <h2>Wilayah pada Peta Risiko</h2>
            <p>
              Daftar ini membantu admin melihat data risiko yang tampil atau
              belum tampil pada peta.
            </p>
          </div>
        </div>

        {filteredRiskData.length === 0 ? (
          <EmptyState
            title="Data tidak ditemukan"
            message="Tidak ada data risiko yang sesuai dengan pencarian atau filter."
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
                  <th>Faktor Dominan</th>
                  <th>Koordinat</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredRiskData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="risk-location-cell">
                        <span>
                          <MapPin size={15} />
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
                      <strong>
                        {Number(item.skor_irs || 0).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <RiskBadge value={item.kategori_risiko} />
                    </td>

                    <td>{formatFactorLabel(item.faktor_dominan)}</td>

                    <td>
                      {hasCoordinate(item) ? (
                        <span className="table-muted-text">
                          {Number(item.wilayah.latitude).toFixed(7)},{" "}
                          {Number(item.wilayah.longitude).toFixed(7)}
                        </span>
                      ) : (
                        <span className="risk-badge risk-badge-unknown">
                          Belum ada
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-button view"
                          disabled={!hasCoordinate(item)}
                          title={
                            hasCoordinate(item)
                              ? "Lihat titik pada peta"
                              : "Koordinat belum tersedia"
                          }
                          onClick={() => handleFocusMarker(item)}
                        >
                          <Navigation size={16} />
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
    </AdminLayout>
  );
}

export default AdminPetaRisikoPage;