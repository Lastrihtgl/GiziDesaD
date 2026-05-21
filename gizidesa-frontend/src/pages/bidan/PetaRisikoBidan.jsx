import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import BidanLayout from "../../layouts/BidanLayout";
import { risikoWilayahBidan } from "../../utils/bidanStorage";

function getMarkerColor(kategori) {
  if (kategori === "Tinggi") return "#dc2626";
  if (kategori === "Sedang") return "#f59e0b";
  return "#16a34a";
}

function createMarkerIcon(kategori) {
  const color = getMarkerColor(kategori);

  return L.divIcon({
    className: "bidan-risk-marker",
    html: `<span style="background:${color}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });
}

function PetaRisikoBidan() {
  const [searchKeyword, setSearchKeyword] = useState("");

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return risikoWilayahBidan.filter((item) => {
      const text = `${item.wilayah} ${item.kategori} ${item.faktor}`.toLowerCase();
      return !keyword || text.includes(keyword);
    });
  }, [searchKeyword]);

  const center = [2.544954, 98.5625975];

  return (
    <BidanLayout
      title="Peta Risiko"
      subtitle="Melihat sebaran wilayah risiko sebagai dasar prioritas kunjungan bidan."
    >
      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Peta Risiko Bidan</span>
            <h2>Sebaran Risiko Kesehatan Wilayah</h2>
            <p>
              Bidan menggunakan peta untuk melihat wilayah dengan faktor dominan
              seperti ibu hamil KEK, ANC tidak rutin, dan kebutuhan pemantauan.
            </p>
          </div>

          <div className="admin-search-control">
            <Search size={18} />
            <input
              value={searchKeyword}
              placeholder="Cari wilayah atau faktor risiko..."
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </div>
        </div>

        <div className="bidan-map-box">
          <MapContainer center={center} zoom={12} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredData.map((item) => (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={createMarkerIcon(item.kategori)}
              >
                <Popup>
                  <div className="bidan-map-popup">
                    <strong>{item.wilayah}</strong>
                    <span>
                      IRS {item.skor_irs} · Risiko {item.kategori}
                    </span>
                    <span>Faktor: {item.faktor}</span>
                    <p>{item.rekomendasi}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      <section className="admin-panel">
        <div className="bidan-section-heading">
          <span>Daftar Wilayah</span>
          <h2>Wilayah Perlu Pemantauan</h2>
          <p>Ringkasan wilayah berdasarkan marker pada peta risiko.</p>
        </div>

        <div className="bidan-list">
          {filteredData.map((item) => (
            <div className="bidan-list-item" key={item.id}>
              <div className={`bidan-icon ${item.kategori.toLowerCase()}`}>
                <MapPin size={18} />
              </div>

              <div>
                <strong>{item.wilayah}</strong>
                <small>
                  IRS {item.skor_irs} · {item.faktor}
                </small>
              </div>

              <b>{item.kategori}</b>
            </div>
          ))}
        </div>
      </section>
    </BidanLayout>
  );
}

export default PetaRisikoBidan;