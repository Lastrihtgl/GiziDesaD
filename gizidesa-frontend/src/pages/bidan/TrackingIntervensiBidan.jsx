import { CheckCircle2, Clock, Search, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import BidanLayout from "../../layouts/BidanLayout";
import { getTindakLanjutData } from "../../utils/bidanStorage";

function getStatusLabel(status) {
  const labels = {
    direncanakan: "Direncanakan",
    berjalan: "Berjalan",
    selesai: "Selesai",
  };

  return labels[status] || status;
}

function TrackingIntervensiBidan() {
  const [dataList] = useState(getTindakLanjutData());
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return dataList.filter((item) => {
      const text = `${item.wilayah} ${item.sasaran} ${item.jenis} ${item.fokus} ${item.status}`.toLowerCase();

      const matchKeyword = !keyword || text.includes(keyword);
      const matchStatus = statusFilter === "semua" || item.status === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [dataList, searchKeyword, statusFilter]);

  const totalSelesai = dataList.filter((item) => item.status === "selesai").length;
  const totalBerjalan = dataList.filter((item) => item.status === "berjalan").length;
  const totalDirencanakan = dataList.filter(
    (item) => item.status === "direncanakan"
  ).length;

  return (
    <BidanLayout
      title="Tracking Intervensi"
      subtitle="Memantau progres tindak lanjut kesehatan yang sudah direncanakan atau sedang berjalan."
    >
      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Intervensi</span>
          <strong>{dataList.length}</strong>
          <p>Kegiatan tercatat</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Direncanakan</span>
          <strong>{totalDirencanakan}</strong>
          <p>Menunggu pelaksanaan</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Berjalan</span>
          <strong>{totalBerjalan}</strong>
          <p>Sedang ditindaklanjuti</p>
        </article>

        <article className="admin-metric-card success">
          <span>Selesai</span>
          <strong>{totalSelesai}</strong>
          <p>Tindak lanjut selesai</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Tracking Bidan</span>
            <h2>Progres Tindak Lanjut</h2>
            <p>
              Halaman ini digunakan untuk membaca status kegiatan kesehatan yang
              sudah dicatat pada menu tindak lanjut.
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

            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="direncanakan">Direncanakan</option>
              <option value="berjalan">Berjalan</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        <div className="bidan-timeline-list">
          {filteredData.map((item) => (
            <article className="bidan-timeline-card" key={item.id}>
              <div className={`bidan-icon ${item.status}`}>
                {item.status === "selesai" ? (
                  <CheckCircle2 size={19} />
                ) : item.status === "berjalan" ? (
                  <Stethoscope size={19} />
                ) : (
                  <Clock size={19} />
                )}
              </div>

              <div>
                <div className="bidan-card-header">
                  <strong>{item.sasaran}</strong>
                  <small className={`bidan-status-badge ${item.status}`}>
                    {getStatusLabel(item.status)}
                  </small>
                </div>

                <span>
                  {item.wilayah} · {item.jenis} · {item.fokus}
                </span>

                <p>{item.hasil || item.catatan || "Belum ada hasil pelaksanaan."}</p>

                <small className="bidan-muted-line">
                  Rencana: {item.tanggal_rencana || "-"} · Pelaksanaan:{" "}
                  {item.tanggal_pelaksanaan || "-"}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </BidanLayout>
  );
}

export default TrackingIntervensiBidan;