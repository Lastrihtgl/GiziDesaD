import {
  AlertTriangle,
  BarChart3,
  FileDown,
  FileText,
  Search,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDataRisikoList } from "../../../api/dataRisikoApi";
import { getIntervensiList } from "../../../api/intervensiApi";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import RiskBadge from "../../../components/dashboard/RiskBadge";
import AdminLayout from "../../../layouts/AdminLayout";
import { formatFactorLabel, formatNumber } from "../../../utils/formatters";

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

function normalizeDataRisiko(item) {
  return {
    ...item,
    wilayah_id: item.wilayah_id || item.wilayah?.id || "",
    wilayah: item.wilayah || {
      nama_dusun: "-",
      nama_rt: "-",
      kode_wilayah: "-",
    },
    jumlah_ibu_hamil:
      item.jumlah_ibu_hamil ?? item.indikator?.jumlah_ibu_hamil ?? 0,
    jumlah_ibu_hamil_kek:
      item.jumlah_ibu_hamil_kek ?? item.indikator?.jumlah_ibu_hamil_kek ?? 0,
    jumlah_ibu_hamil_anc_tidak_rutin:
      item.jumlah_ibu_hamil_anc_tidak_rutin ??
      item.indikator?.jumlah_ibu_hamil_anc_tidak_rutin ??
      0,
    skor_irs: Number(item.skor_irs ?? item.irs?.skor_irs ?? 0),
    kategori_risiko:
      item.kategori_risiko ?? item.irs?.kategori_risiko ?? "rendah",
    faktor_dominan: item.faktor_dominan ?? item.irs?.faktor_dominan ?? null,
    rekomendasi_awal: item.rekomendasi_awal ?? "",
    periode: item.periode || "",
  };
}

function normalizeIntervensi(item) {
  const dataRisiko = item.data_risiko || item.dataRisiko || item.risiko || null;
  const wilayah = item.wilayah || dataRisiko?.wilayah || {};

  return {
    ...item,
    id: item.id,
    data_risiko_id:
      item.data_risiko_id || item.dataRisikoId || dataRisiko?.id || "",
    wilayah_id: item.wilayah_id || wilayah?.id || dataRisiko?.wilayah_id || "",
    wilayah: {
      id: wilayah?.id || item.wilayah_id || "",
      nama_dusun: wilayah?.nama_dusun || "-",
      nama_rt: wilayah?.nama_rt || "-",
      kode_wilayah: wilayah?.kode_wilayah || "-",
    },
    data_risiko: dataRisiko ? normalizeDataRisiko(dataRisiko) : null,
    judul_intervensi:
      item.judul_intervensi ||
      item.judul ||
      item.nama_intervensi ||
      item.nama ||
      "",
    jenis_intervensi: item.jenis_intervensi || item.jenis || "",
    tanggal_mulai: item.tanggal_mulai || item.start_date || "",
    tanggal_selesai: item.tanggal_selesai || item.end_date || "",
    status: item.status || "direncanakan",
    catatan: item.catatan || "",
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

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getCurrentYear() {
  return String(new Date().getFullYear());
}

function getYearFromPeriod(period) {
  if (!period || !period.includes("-")) {
    return "";
  }

  return period.split("-")[0];
}

function getMonthFromPeriod(period) {
  if (!period || !period.includes("-")) {
    return "";
  }

  return period.split("-")[1];
}

function getStatusLabel(status) {
  const labels = {
    direncanakan: "Direncanakan",
    berjalan: "Berjalan",
    selesai: "Selesai",
    ditunda: "Ditunda",
  };

  return labels[status] || status || "-";
}

function getJenisLabel(value) {
  const labels = {
    edukasi_gizi: "Edukasi Gizi",
    sanitasi: "Sanitasi dan Air Bersih",
    pemantauan_ibu_hamil: "Pemantauan Ibu Hamil",
    pangan_lokal: "Pangan Lokal",
    akses_kesehatan: "Akses Layanan Kesehatan",
    pendataan_lanjutan: "Pendataan Lanjutan",
    perbaikan_sanitasi: "Perbaikan Sanitasi",
  };

  return labels[value] || value || "-";
}

function sanitizeFilename(value) {
  return String(value || "laporan")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function truncateText(value, maxLength = 130) {
  const text = String(value || "-");

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function AdminLaporanPage() {
  const pdfRef = useRef(null);

  const [dataRisikoList, setDataRisikoList] = useState([]);
  const [intervensiList, setIntervensiList] = useState([]);

  const [yearFilter, setYearFilter] = useState(getCurrentYear());
  const [monthFilter, setMonthFilter] = useState("semua");
  const [riskFilter, setRiskFilter] = useState("semua");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchReportData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [risikoResponse, intervensiResponse] = await Promise.all([
        getDataRisikoList(),
        getIntervensiList(),
      ]);

      const risikoData =
        risikoResponse.data ||
        risikoResponse.data_risiko ||
        risikoResponse.items ||
        risikoResponse ||
        [];

      const intervensiData =
        intervensiResponse.data ||
        intervensiResponse.intervensi ||
        intervensiResponse.items ||
        intervensiResponse ||
        [];

      setDataRisikoList(
        Array.isArray(risikoData)
          ? risikoData.map((item) => normalizeDataRisiko(item))
          : []
      );

      setIntervensiList(
        Array.isArray(intervensiData)
          ? intervensiData.map((item) => normalizeIntervensi(item))
          : []
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data laporan gagal dimuat. Pastikan backend aktif dan token login valid."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReportData();
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

  const availableYears = useMemo(() => {
    const years = dataRisikoList
      .map((item) => getYearFromPeriod(item.periode))
      .filter(Boolean);

    const uniqueYears = Array.from(new Set([...years, getCurrentYear()]));

    return uniqueYears.sort((a, b) => Number(b) - Number(a));
  }, [dataRisikoList]);

  const filteredRisiko = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    return dataRisikoList.filter((item) => {
      const itemYear = getYearFromPeriod(item.periode);
      const itemMonth = getMonthFromPeriod(item.periode);

      const wilayahText = `${item.wilayah?.nama_dusun || ""} ${
        item.wilayah?.nama_rt || ""
      } ${item.wilayah?.kode_wilayah || ""}`.toLowerCase();

      const periodText = `${item.periode} ${formatPeriodLabel(
        item.periode
      )}`.toLowerCase();

      const factorText = formatFactorLabel(item.faktor_dominan).toLowerCase();
      const recommendationText = String(
        item.rekomendasi_awal || ""
      ).toLowerCase();

      const matchYear = !yearFilter || itemYear === yearFilter;
      const matchMonth = monthFilter === "semua" || itemMonth === monthFilter;
      const matchRisk =
        riskFilter === "semua" || item.kategori_risiko === riskFilter;

      const matchKeyword =
        !keyword ||
        wilayahText.includes(keyword) ||
        periodText.includes(keyword) ||
        factorText.includes(keyword) ||
        recommendationText.includes(keyword);

      return matchYear && matchMonth && matchRisk && matchKeyword;
    });
  }, [dataRisikoList, monthFilter, riskFilter, searchKeyword, yearFilter]);

  const filteredIntervensi = useMemo(() => {
    const riskIds = new Set(filteredRisiko.map((item) => String(item.id)));

    return intervensiList.filter((item) => {
      const dataRisikoId = String(item.data_risiko_id || "");
      const intervensiYear = item.tanggal_mulai
        ? String(new Date(item.tanggal_mulai).getFullYear())
        : "";

      if (riskIds.has(dataRisikoId)) {
        return true;
      }

      return intervensiYear === yearFilter;
    });
  }, [filteredRisiko, intervensiList, yearFilter]);

  const totalDataRisiko = filteredRisiko.length;

  const totalRendah = useMemo(() => {
    return filteredRisiko.filter((item) => item.kategori_risiko === "rendah")
      .length;
  }, [filteredRisiko]);

  const totalSedang = useMemo(() => {
    return filteredRisiko.filter((item) => item.kategori_risiko === "sedang")
      .length;
  }, [filteredRisiko]);

  const totalTinggi = useMemo(() => {
    return filteredRisiko.filter((item) => item.kategori_risiko === "tinggi")
      .length;
  }, [filteredRisiko]);

  const totalIbuHamil = useMemo(() => {
    return filteredRisiko.reduce(
      (total, item) => total + Number(item.jumlah_ibu_hamil || 0),
      0
    );
  }, [filteredRisiko]);

  const totalKek = useMemo(() => {
    return filteredRisiko.reduce(
      (total, item) => total + Number(item.jumlah_ibu_hamil_kek || 0),
      0
    );
  }, [filteredRisiko]);

  const totalAncTidakRutin = useMemo(() => {
    return filteredRisiko.reduce(
      (total, item) =>
        total + Number(item.jumlah_ibu_hamil_anc_tidak_rutin || 0),
      0
    );
  }, [filteredRisiko]);

  const averageIrs = useMemo(() => {
    if (filteredRisiko.length === 0) {
      return 0;
    }

    const total = filteredRisiko.reduce(
      (sum, item) => sum + Number(item.skor_irs || 0),
      0
    );

    return total / filteredRisiko.length;
  }, [filteredRisiko]);

  const totalIntervensi = filteredIntervensi.length;

  const totalIntervensiSelesai = useMemo(() => {
    return filteredIntervensi.filter((item) => item.status === "selesai").length;
  }, [filteredIntervensi]);

  const completionRate = useMemo(() => {
    if (filteredIntervensi.length === 0) {
      return 0;
    }

    return Math.round(
      (totalIntervensiSelesai / filteredIntervensi.length) * 100
    );
  }, [filteredIntervensi, totalIntervensiSelesai]);

  const dominantFactors = useMemo(() => {
    const counter = {};

    filteredRisiko.forEach((item) => {
      const key = item.faktor_dominan || "belum_tersedia";
      counter[key] = (counter[key] || 0) + 1;
    });

    return Object.entries(counter)
      .map(([factor, total]) => ({
        factor,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredRisiko]);

  const highestRiskList = useMemo(() => {
    const order = {
      tinggi: 3,
      sedang: 2,
      rendah: 1,
    };

    return [...filteredRisiko]
      .sort((a, b) => {
        const riskDiff =
          (order[b.kategori_risiko] || 0) - (order[a.kategori_risiko] || 0);

        if (riskDiff !== 0) {
          return riskDiff;
        }

        return Number(b.skor_irs || 0) - Number(a.skor_irs || 0);
      })
      .slice(0, 5);
  }, [filteredRisiko]);

  const reportPeriodLabel = useMemo(() => {
    const yearText = yearFilter || "Semua Tahun";

    if (monthFilter === "semua") {
      return yearText;
    }

    const monthIndex = Number(monthFilter) - 1;
    const monthText = MONTH_NAMES[monthIndex] || monthFilter;

    return `${monthText} ${yearText}`;
  }, [monthFilter, yearFilter]);

  const compactSummary = [
    {
      label: "Rata-rata IRS",
      value: averageIrs.toFixed(2),
      note: "Intensitas risiko",
    },
    {
      label: "Total Ibu Hamil",
      value: formatNumber(totalIbuHamil),
      note: "Sasaran tercatat",
    },
    {
      label: "Ibu Hamil KEK",
      value: formatNumber(totalKek),
      note: "Perlu perhatian gizi",
    },
    {
      label: "ANC Tidak Rutin",
      value: formatNumber(totalAncTidakRutin),
      note: "Perlu pemantauan",
    },
    {
      label: "Intervensi Selesai",
      value: `${completionRate}%`,
      note: `${formatNumber(totalIntervensiSelesai)} dari ${formatNumber(
        totalIntervensi
      )} intervensi`,
    },
  ];

  const handleDownloadPdf = async () => {
    if (!pdfRef.current || downloadingPdf) {
      return;
    }

    try {
      setDownloadingPdf(true);

      await new Promise((resolve) => setTimeout(resolve, 120));

      const fileName = `laporan-gizidesa-${sanitizeFilename(
        reportPeriodLabel
      )}.pdf`;

      const options = {
        margin: [7, 7, 7, 7],
        filename: fileName,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1122,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape",
          compress: true,
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [".pdf-avoid-break", ".pdf-summary-card"],
        },
      };

      await html2pdf().set(options).from(pdfRef.current).save();
    } catch (error) {
      setErrorMessage("PDF gagal diunduh. Silakan coba kembali.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <AdminLayout
      title="Laporan"
      subtitle="Rekapitulasi data risiko, rekomendasi, dan tindak lanjut intervensi desa."
    >
      <ErrorAlert message={errorMessage} />

      <section className="admin-panel report-header-card">
        <div className="report-header-content">
          <div>
            <span>Laporan Program</span>
            <h2>Ringkasan Risiko dan Intervensi GiziDesa</h2>
            <p>
              Laporan ini menyajikan hasil pendataan risiko wilayah, skor IRS,
              faktor dominan, rekomendasi awal, dan capaian intervensi pada
              periode terpilih.
            </p>
          </div>

          <div className="report-action-group vertical">
            <button
              type="button"
              className="admin-primary-button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || loading}
            >
              <FileDown size={17} />
              {downloadingPdf ? "Mengunduh..." : "Unduh PDF"}
            </button>
          </div>
        </div>
      </section>

      <section className="admin-panel report-filter-card compact-report-filter">
        <div className="admin-list-toolbar">
          <div>
            <span>Filter Laporan</span>
            <h2>Periode dan Kategori</h2>
            <p>
              Saring laporan berdasarkan tahun, bulan, kategori risiko, atau
              wilayah tertentu.
            </p>
          </div>

          <div className="admin-filter-group">
            <select
              className="admin-filter-select"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  Tahun {year}
                </option>
              ))}
            </select>

            <select
              className="admin-filter-select"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            >
              <option value="semua">Semua Bulan</option>
              {MONTH_NAMES.map((month, index) => (
                <option
                  key={month}
                  value={String(index + 1).padStart(2, "0")}
                >
                  {month}
                </option>
              ))}
            </select>

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

            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari wilayah, faktor, rekomendasi..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="admin-overview-grid risiko-overview report-print-section">
        <article className="admin-metric-card">
          <span>Total Data Risiko</span>
          <strong>{formatNumber(totalDataRisiko)}</strong>
          <p>Data IRS pada {reportPeriodLabel}</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Risiko Tinggi</span>
          <strong>{formatNumber(totalTinggi)}</strong>
          <p>Wilayah prioritas utama</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Risiko Sedang</span>
          <strong>{formatNumber(totalSedang)}</strong>
          <p>Wilayah perlu pemantauan</p>
        </article>

        <article className="admin-metric-card success">
          <span>Risiko Rendah</span>
          <strong>{formatNumber(totalRendah)}</strong>
          <p>Kondisi relatif terkendali</p>
        </article>
      </section>

      <section className="admin-panel report-compact-summary-panel">
        <div className="admin-panel-header">
          <div>
            <span>Ringkasan Laporan</span>
            <h2>Indikator Utama</h2>
            <p>
              Ringkasan inti untuk membaca kondisi risiko dan capaian tindak
              lanjut tanpa membuat halaman terlalu padat.
            </p>
          </div>
        </div>

        <div className="report-compact-summary-grid">
          {compactSummary.map((item) => (
            <div className="report-compact-summary-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-dashboard-grid bottom report-analysis-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Prioritas</span>
              <h2>Wilayah Risiko Tertinggi</h2>
              <p>
                Daftar ini menunjukkan wilayah yang perlu mendapatkan perhatian
                lebih awal.
              </p>
            </div>
          </div>

          {highestRiskList.length === 0 ? (
            <EmptyState
              title="Belum ada data prioritas"
              message="Data prioritas akan muncul setelah data risiko tersedia."
            />
          ) : (
            <div className="report-priority-list compact">
              {highestRiskList.map((item) => (
                <div key={item.id} className="report-priority-item">
                  <div className="report-priority-icon">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <strong>
                      {item.wilayah?.nama_dusun || "-"} -{" "}
                      {item.wilayah?.nama_rt || "-"}
                    </strong>
                    <small>
                      {formatPeriodLabel(item.periode)} · IRS{" "}
                      {Number(item.skor_irs || 0).toFixed(2)}
                    </small>
                  </div>

                  <RiskBadge value={item.kategori_risiko} />
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Faktor Dominan</span>
              <h2>Distribusi Faktor Risiko</h2>
              <p>
                Faktor dominan membantu admin menentukan fokus intervensi
                wilayah.
              </p>
            </div>
          </div>

          {dominantFactors.length === 0 ? (
            <EmptyState
              title="Belum ada faktor dominan"
              message="Faktor dominan akan muncul setelah data IRS tersedia."
            />
          ) : (
            <div className="report-factor-list compact">
              {dominantFactors.map((item) => {
                const percentage =
                  totalDataRisiko === 0
                    ? 0
                    : Math.round((item.total / totalDataRisiko) * 100);

                return (
                  <div key={item.factor} className="report-factor-item">
                    <div>
                      <strong>{formatFactorLabel(item.factor)}</strong>
                      <small>{item.total} data risiko</small>
                    </div>

                    <div className="report-factor-meter">
                      <span style={{ width: `${percentage}%` }} />
                    </div>

                    <b>{percentage}%</b>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>

      <section className="admin-panel report-detail-panel">
        <div className="admin-panel-header">
          <div>
            <span>Detail Laporan</span>
            <h2>Data Risiko Wilayah</h2>
            <p>
              Tabel ini berisi data risiko yang menjadi dasar laporan periode{" "}
              {reportPeriodLabel}.
            </p>
          </div>
        </div>

        {loading ? (
          <EmptyState
            title="Memuat laporan"
            message="Sistem sedang mengambil data laporan."
          />
        ) : filteredRisiko.length === 0 ? (
          <EmptyState
            title="Data laporan tidak ditemukan"
            message="Tidak ada data risiko yang sesuai dengan filter laporan."
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
                  <th>Ibu Hamil</th>
                  <th>KEK</th>
                  <th>Rekomendasi</th>
                </tr>
              </thead>

              <tbody>
                {filteredRisiko.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="risk-location-cell">
                        <span>
                          <BarChart3 size={15} />
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
                      <strong>{Number(item.skor_irs || 0).toFixed(2)}</strong>
                    </td>

                    <td>
                      <RiskBadge value={item.kategori_risiko} />
                    </td>

                    <td>{formatFactorLabel(item.faktor_dominan)}</td>

                    <td>{formatNumber(item.jumlah_ibu_hamil)}</td>

                    <td>{formatNumber(item.jumlah_ibu_hamil_kek)}</td>

                    <td>
                      <span className="table-muted-text">
                        {item.rekomendasi_awal || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel report-detail-panel">
        <div className="admin-panel-header">
          <div>
            <span>Detail Intervensi</span>
            <h2>Tindak Lanjut Program</h2>
            <p>
              Tabel ini menampilkan tindak lanjut program yang berkaitan dengan
              data risiko pada periode laporan.
            </p>
          </div>
        </div>

        {filteredIntervensi.length === 0 ? (
          <EmptyState
            title="Belum ada intervensi terkait"
            message="Data intervensi akan muncul setelah admin membuat tindak lanjut dari data risiko."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>Intervensi</th>
                  <th>Jenis</th>
                  <th>Jadwal</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredIntervensi.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.wilayah?.nama_dusun || "-"} -{" "}
                        {item.wilayah?.nama_rt || "-"}
                      </strong>
                      <br />
                      <small className="table-muted-text">
                        {item.wilayah?.kode_wilayah || "-"}
                      </small>
                    </td>

                    <td>{item.judul_intervensi || "-"}</td>

                    <td>{getJenisLabel(item.jenis_intervensi)}</td>

                    <td>
                      {formatDate(item.tanggal_mulai)}
                      <br />
                      <small className="table-muted-text">
                        s.d. {formatDate(item.tanggal_selesai)}
                      </small>
                    </td>

                    <td>
                      <span className={`report-status-pill ${item.status}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="report-print-footer compact">
        <FileText size={15} />
        <span>
          Dicetak otomatis oleh Sistem GiziDesa pada{" "}
          {new Date().toLocaleString("id-ID")}
        </span>
      </div>

      <div ref={pdfRef} className="pdf-report-template">
        <section className="pdf-report-page">
          <header className="pdf-report-header">
            <div>
              <span>Laporan Program</span>
              <h1>Ringkasan Risiko dan Intervensi GiziDesa</h1>
              <p>
                Periode laporan: <strong>{reportPeriodLabel}</strong>
              </p>
            </div>

            <div className="pdf-report-meta">
              <strong>GiziDesa</strong>
              <small>{new Date().toLocaleString("id-ID")}</small>
            </div>
          </header>

          <div className="pdf-section pdf-avoid-break">
            <h2>Ringkasan Risiko</h2>

            <div className="pdf-stat-grid">
              <div className="pdf-summary-card">
                <span>Total Data Risiko</span>
                <strong>{formatNumber(totalDataRisiko)}</strong>
                <small>Data IRS pada {reportPeriodLabel}</small>
              </div>

              <div className="pdf-summary-card">
                <span>Risiko Tinggi</span>
                <strong>{formatNumber(totalTinggi)}</strong>
                <small>Wilayah prioritas utama</small>
              </div>

              <div className="pdf-summary-card">
                <span>Risiko Sedang</span>
                <strong>{formatNumber(totalSedang)}</strong>
                <small>Wilayah perlu pemantauan</small>
              </div>

              <div className="pdf-summary-card">
                <span>Risiko Rendah</span>
                <strong>{formatNumber(totalRendah)}</strong>
                <small>Kondisi relatif terkendali</small>
              </div>
            </div>
          </div>

          <div className="pdf-section pdf-avoid-break">
            <h2>Indikator Utama</h2>

            <table className="pdf-info-table">
              <tbody>
                <tr>
                  <td>Rata-rata Skor IRS</td>
                  <td>{averageIrs.toFixed(2)}</td>
                  <td>Total Ibu Hamil</td>
                  <td>{formatNumber(totalIbuHamil)}</td>
                </tr>
                <tr>
                  <td>Ibu Hamil KEK</td>
                  <td>{formatNumber(totalKek)}</td>
                  <td>ANC Tidak Rutin</td>
                  <td>{formatNumber(totalAncTidakRutin)}</td>
                </tr>
                <tr>
                  <td>Total Intervensi</td>
                  <td>{formatNumber(totalIntervensi)}</td>
                  <td>Intervensi Selesai</td>
                  <td>
                    {formatNumber(totalIntervensiSelesai)} dari{" "}
                    {formatNumber(totalIntervensi)} ({completionRate}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pdf-two-column pdf-avoid-break">
            <div className="pdf-section">
              <h2>Wilayah Risiko Tertinggi</h2>

              <table className="pdf-compact-table">
                <thead>
                  <tr>
                    <th>Wilayah</th>
                    <th>Periode</th>
                    <th>IRS</th>
                    <th>Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {highestRiskList.length === 0 ? (
                    <tr>
                      <td colSpan="4">Belum ada data prioritas.</td>
                    </tr>
                  ) : (
                    highestRiskList.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.wilayah?.nama_dusun || "-"} -{" "}
                          {item.wilayah?.nama_rt || "-"}
                        </td>
                        <td>{formatPeriodLabel(item.periode)}</td>
                        <td>{Number(item.skor_irs || 0).toFixed(2)}</td>
                        <td>{item.kategori_risiko || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pdf-section">
              <h2>Distribusi Faktor Dominan</h2>

              <table className="pdf-compact-table">
                <thead>
                  <tr>
                    <th>Faktor Dominan</th>
                    <th>Jumlah</th>
                    <th>Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {dominantFactors.length === 0 ? (
                    <tr>
                      <td colSpan="3">Belum ada faktor dominan.</td>
                    </tr>
                  ) : (
                    dominantFactors.map((item) => {
                      const percentage =
                        totalDataRisiko === 0
                          ? 0
                          : Math.round((item.total / totalDataRisiko) * 100);

                      return (
                        <tr key={item.factor}>
                          <td>{formatFactorLabel(item.factor)}</td>
                          <td>{item.total}</td>
                          <td>{percentage}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pdf-section pdf-page-break-before">
            <h2>Detail Data Risiko Wilayah</h2>

            <table className="pdf-data-table">
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>Kode</th>
                  <th>Periode</th>
                  <th>IRS</th>
                  <th>Kategori</th>
                  <th>Faktor</th>
                  <th>Ibu Hamil</th>
                  <th>KEK</th>
                  <th>Rekomendasi Awal</th>
                </tr>
              </thead>

              <tbody>
                {filteredRisiko.length === 0 ? (
                  <tr>
                    <td colSpan="9">Data laporan tidak ditemukan.</td>
                  </tr>
                ) : (
                  filteredRisiko.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.wilayah?.nama_dusun || "-"} -{" "}
                        {item.wilayah?.nama_rt || "-"}
                      </td>
                      <td>{item.wilayah?.kode_wilayah || "-"}</td>
                      <td>{formatPeriodLabel(item.periode)}</td>
                      <td>{Number(item.skor_irs || 0).toFixed(2)}</td>
                      <td>{item.kategori_risiko || "-"}</td>
                      <td>{formatFactorLabel(item.faktor_dominan)}</td>
                      <td>{formatNumber(item.jumlah_ibu_hamil)}</td>
                      <td>{formatNumber(item.jumlah_ibu_hamil_kek)}</td>
                      <td>{truncateText(item.rekomendasi_awal, 120)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pdf-section">
            <h2>Detail Tindak Lanjut Program</h2>

            <table className="pdf-data-table">
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>Kode</th>
                  <th>Intervensi</th>
                  <th>Jenis</th>
                  <th>Jadwal</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredIntervensi.length === 0 ? (
                  <tr>
                    <td colSpan="6">Belum ada intervensi terkait.</td>
                  </tr>
                ) : (
                  filteredIntervensi.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.wilayah?.nama_dusun || "-"} -{" "}
                        {item.wilayah?.nama_rt || "-"}
                      </td>
                      <td>{item.wilayah?.kode_wilayah || "-"}</td>
                      <td>{item.judul_intervensi || "-"}</td>
                      <td>{getJenisLabel(item.jenis_intervensi)}</td>
                      <td>
                        {formatDate(item.tanggal_mulai)} s.d.{" "}
                        {formatDate(item.tanggal_selesai)}
                      </td>
                      <td>{getStatusLabel(item.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="pdf-report-footer">
            Dicetak otomatis oleh Sistem GiziDesa pada{" "}
            {new Date().toLocaleString("id-ID")}
          </footer>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminLaporanPage;