import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { AlertTriangle, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { getDataRisikoList } from "../../api/dataRisikoApi";
import KaderLayout from "../../layouts/KaderLayout";
import { formatFactorLabel, formatNumber } from "../../utils/formatters";

function normalizeRisiko(item) {
  return {
    ...item,
    wilayah: item.wilayah || {
      nama_dusun: "-",
      nama_rt: "-",
      kode_wilayah: "-",
      latitude: null,
      longitude: null,
    },
    skor_irs: Number(item.skor_irs ?? item.irs?.skor_irs ?? 0),
    kategori_risiko:
      item.kategori_risiko ?? item.irs?.kategori_risiko ?? "rendah",
    faktor_dominan: item.faktor_dominan ?? item.irs?.faktor_dominan ?? "",
    rekomendasi_awal: item.rekomendasi_awal || "",
  };
}

function getMarkerColor(category) {
  if (category === "tinggi") {
    return "#dc2626";
  }

  if (category === "sedang") {
    return "#f6cf58";
  }

  return "#1f7a35";
}

function createRiskIcon(category) {
  const color = getMarkerColor(category);

  return L.divIcon({
    className: "kader-risk-marker",
    html: `<span style="background:${color};"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -10],
  });
}

function hasCoordinate(item) {
  const latitude = Number(item.wilayah?.latitude);
  const longitude = Number(item.wilayah?.longitude);

  return (
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0
  );
}

function PetaRisiko() {
  const [risikoData, setRisikoData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [riskFilter, setRiskFilter] = useState("semua");
  const [loading, setLoading] = useState(true);

  async function fetchMapData() {
    try {
      setLoading(true);

      const response = await getDataRisikoList();
      const rawData =
        response.data || response.data_risiko || response.items || response || [];

      setRisikoData(Array.isArray(rawData) ? rawData.map(normalizeRisiko) : []);
    } catch {
      setRisikoData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMapData();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return risikoData.filter((item) => {
      const wilayahText = `${item.wilayah?.nama_dusun || ""} ${
        item.wilayah?.nama_rt || ""
      } ${item.wilayah?.kode_wilayah || ""}`.toLowerCase();

      const factorText = formatFactorLabel(item.faktor_dominan).toLowerCase();

      const matchKeyword =
        !keyword ||
        wilayahText.includes(keyword) ||
        factorText.includes(keyword) ||
        String(item.rekomendasi_awal || "").toLowerCase().includes(keyword);

      const matchRisk =
        riskFilter === "semua" || item.kategori_risiko === riskFilter;

      return matchKeyword && matchRisk;
    });
  }, [risikoData, searchKeyword, riskFilter]);

  const markerData = useMemo(() => {
    return filteredData.filter(hasCoordinate);
  }, [filteredData]);

  const noCoordinateData = useMemo(() => {
    return filteredData.filter((item) => !hasCoordinate(item));
  }, [filteredData]);

  const center = useMemo(() => {
    if (markerData.length === 0) {
      return [-2.5489, 118.0149];
    }

    return [
      Number(markerData[0].wilayah.latitude),
      Number(markerData[0].wilayah.longitude),
    ];
  }, [markerData]);

  return (
    <KaderLayout
      title="Peta Risiko"
      subtitle="Melihat sebaran risiko wilayah sebagai panduan pemantauan lapangan."
    >
      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Data Risiko</span>
          <strong>{formatNumber(filteredData.length)}</strong>
          <p>Data terbaca</p>
        </article>

        <article className="admin-metric-card success">
          <span>Tampil di Peta</span>
          <strong>{formatNumber(markerData.length)}</strong>
          <p>Memiliki koordinat</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Belum Ada Koordinat</span>
          <strong>{formatNumber(noCoordinateData.length)}</strong>
          <p>Perlu dilengkapi admin</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Peta Risiko</span>
            <h2>Panduan Pemantauan Wilayah</h2>
            <p>
              Kader hanya melihat peta sebagai panduan lapangan. Perubahan
              koordinat dan data risiko tetap dikelola oleh admin desa.
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
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
            >
              <option value="semua">Semua Risiko</option>
              <option value="rendah">Risiko Rendah</option>
              <option value="sedang">Risiko Sedang</option>
              <option value="tinggi">Risiko Tinggi</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="kader-map-empty">Memuat peta risiko...</div>
        ) : markerData.length === 0 ? (
          <div className="kader-map-empty">
            <MapPin size={28} />
            <strong>Belum ada marker risiko</strong>
            <span>
              Data risiko belum memiliki koordinat wilayah. Koordinat dapat
              dilengkapi oleh admin melalui halaman Kelola Wilayah.
            </span>
          </div>
        ) : (
          <div className="kader-map-box">
            <MapContainer center={center} zoom={12} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {markerData.map((item) => (
                <Marker
                  key={item.id}
                  position={[
                    Number(item.wilayah.latitude),
                    Number(item.wilayah.longitude),
                  ]}
                  icon={createRiskIcon(item.kategori_risiko)}
                >
                  <Popup>
                    <div className="kader-map-popup">
                      <strong>
                        {item.wilayah?.nama_dusun || "-"} -{" "}
                        {item.wilayah?.nama_rt || "-"}
                      </strong>
                      <span>IRS {Number(item.skor_irs || 0).toFixed(2)}</span>
                      <span>
                        Risiko {item.kategori_risiko || "-"} ·{" "}
                        {formatFactorLabel(item.faktor_dominan)}
                      </span>
                      <p>{item.rekomendasi_awal || "Belum ada rekomendasi."}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <span>Daftar Pemantauan</span>
            <h2>Wilayah Berdasarkan Risiko</h2>
            <p>
              Daftar ini membantu kader melihat ringkasan wilayah yang perlu
              diperhatikan tanpa mengubah data utama sistem.
            </p>
          </div>
        </div>

        <div className="kader-risk-list">
          {filteredData.length === 0 ? (
            <div className="kader-table-empty">Belum ada data risiko.</div>
          ) : (
            filteredData.map((item) => (
              <div className="kader-risk-row" key={item.id}>
                <span className={`kader-risk-icon ${item.kategori_risiko}`}>
                  <AlertTriangle size={17} />
                </span>

                <div>
                  <strong>
                    {item.wilayah?.nama_dusun || "-"} -{" "}
                    {item.wilayah?.nama_rt || "-"}
                  </strong>
                  <small>
                    IRS {Number(item.skor_irs || 0).toFixed(2)} ·{" "}
                    {formatFactorLabel(item.faktor_dominan)}
                  </small>
                </div>

                <b>{hasCoordinate(item) ? "Tampil di Peta" : "Belum Koordinat"}</b>
              </div>
            ))
          )}
        </div>
      </section>
    </KaderLayout>
  );
}

export default PetaRisiko;