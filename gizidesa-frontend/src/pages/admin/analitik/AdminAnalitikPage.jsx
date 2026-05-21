import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  LineChart,
  MapPin,
  Search,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
      id: item.wilayah_id || "",
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
    akses_air_bersih:
      item.akses_air_bersih ?? item.indikator?.akses_air_bersih ?? "",
    kondisi_sanitasi:
      item.kondisi_sanitasi ?? item.indikator?.kondisi_sanitasi ?? "",
    tingkat_ekonomi:
      item.tingkat_ekonomi ?? item.indikator?.tingkat_ekonomi ?? "",
    akses_layanan_kesehatan:
      item.akses_layanan_kesehatan ??
      item.indikator?.akses_layanan_kesehatan ??
      "",
    pemanfaatan_pangan_lokal:
      item.pemanfaatan_pangan_lokal ??
      item.indikator?.pemanfaatan_pangan_lokal ??
      "",
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
    status: item.status || "direncanakan",
    tanggal_mulai: item.tanggal_mulai || item.start_date || "",
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

function getCurrentYear() {
  return String(new Date().getFullYear());
}

function getYearFromPeriod(period) {
  if (!period || !period.includes("-")) {
    return "";
  }

  return period.split("-")[0];
}

function getRiskWeight(category) {
  const weights = {
    tinggi: 3,
    sedang: 2,
    rendah: 1,
  };

  return weights[category] || 0;
}

function getRiskLabel(category) {
  const labels = {
    tinggi: "Risiko Tinggi",
    sedang: "Risiko Sedang",
    rendah: "Risiko Rendah",
  };

  return labels[category] || "Belum Tersedia";
}

function getRiskLabelShort(category) {
  const labels = {
    tinggi: "Tinggi",
    sedang: "Sedang",
    rendah: "Rendah",
  };

  return labels[category] || "-";
}

function getDominantCategory(items) {
  const counter = {
    tinggi: 0,
    sedang: 0,
    rendah: 0,
  };

  items.forEach((item) => {
    if (counter[item.kategori_risiko] !== undefined) {
      counter[item.kategori_risiko] += 1;
    }
  });

  return Object.entries(counter).sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return getRiskWeight(b[0]) - getRiskWeight(a[0]);
  })[0]?.[0];
}

function getLatestPeriod(items) {
  return [...items]
    .map((item) => item.periode)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function getLatestRiskItem(items) {
  return [...items]
    .filter((item) => item.periode)
    .sort((a, b) => {
      if (a.periode !== b.periode) {
        return b.periode.localeCompare(a.periode);
      }

      return Number(b.skor_irs || 0) - Number(a.skor_irs || 0);
    })[0];
}

function getInsightText(totalTinggi, totalSedang, totalRendah, dominantFactor) {
  if (totalTinggi > 0) {
    return `Terdapat ${totalTinggi} wilayah dengan risiko tinggi. Admin perlu memprioritaskan pemantauan dan intervensi pada wilayah tersebut.`;
  }

  if (totalSedang > 0 && totalSedang >= totalRendah) {
    return "Sebagian wilayah berada pada risiko sedang. Fokus analitik sebaiknya diarahkan pada pencegahan agar risiko tidak meningkat.";
  }

  if (dominantFactor) {
    return `Faktor dominan yang paling sering muncul adalah ${formatFactorLabel(
      dominantFactor
    )}. Faktor ini dapat menjadi dasar penentuan prioritas program desa.`;
  }

  return "Data risiko desa masih relatif terkendali. Pemantauan berkala tetap diperlukan agar kondisi risiko tidak meningkat.";
}

function AdminAnalitikPage() {
  const [dataRisikoList, setDataRisikoList] = useState([]);
  const [intervensiList, setIntervensiList] = useState([]);

  const [yearFilter, setYearFilter] = useState(getCurrentYear());
  const [riskFilter, setRiskFilter] = useState("semua");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchAnalyticData() {
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
          "Data analitik gagal dimuat. Pastikan backend aktif dan token login valid."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalyticData();
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
      const year = getYearFromPeriod(item.periode);

      const wilayahText = `${item.wilayah?.nama_dusun || ""} ${
        item.wilayah?.nama_rt || ""
      } ${item.wilayah?.kode_wilayah || ""}`.toLowerCase();

      const factorText = formatFactorLabel(item.faktor_dominan).toLowerCase();

      const matchYear = !yearFilter || year === yearFilter;
      const matchRisk =
        riskFilter === "semua" || item.kategori_risiko === riskFilter;

      const matchKeyword =
        !keyword ||
        wilayahText.includes(keyword) ||
        factorText.includes(keyword) ||
        String(item.rekomendasi_awal || "").toLowerCase().includes(keyword);

      return matchYear && matchRisk && matchKeyword;
    });
  }, [dataRisikoList, riskFilter, searchKeyword, yearFilter]);

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

  const riskGradient = useMemo(() => {
    if (totalDataRisiko === 0) {
      return "radial-gradient(circle, #ffffff 43%, transparent 44%), conic-gradient(#e9efe6 0 100%)";
    }

    const highPercent = (totalTinggi / totalDataRisiko) * 100;
    const mediumPercent = (totalSedang / totalDataRisiko) * 100;
    const highEnd = highPercent;
    const mediumEnd = highPercent + mediumPercent;

    return `radial-gradient(circle, #ffffff 43%, transparent 44%),
      conic-gradient(
        #dc2626 0 ${highEnd}%,
        #f6cf58 ${highEnd}% ${mediumEnd}%,
        #4ade80 ${mediumEnd}% 100%
      )`;
  }, [totalDataRisiko, totalTinggi, totalSedang]);

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
        percentage:
          totalDataRisiko === 0
            ? 0
            : Math.round((total / totalDataRisiko) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredRisiko, totalDataRisiko]);

  const dominantFactor = dominantFactors[0]?.factor || "";

  const areaRiskDistribution = useMemo(() => {
    const grouped = new Map();

    filteredRisiko.forEach((item) => {
      const wilayahId =
        item.wilayah_id ||
        item.wilayah?.id ||
        `${item.wilayah?.nama_dusun}-${item.wilayah?.nama_rt}`;

      const existing = grouped.get(String(wilayahId)) || {
        wilayahId,
        wilayah: item.wilayah,
        totalScore: 0,
        totalData: 0,
        highestScore: 0,
        items: [],
      };

      existing.totalScore += Number(item.skor_irs || 0);
      existing.totalData += 1;
      existing.highestScore = Math.max(
        existing.highestScore,
        Number(item.skor_irs || 0)
      );
      existing.items.push(item);

      grouped.set(String(wilayahId), existing);
    });

    return Array.from(grouped.values())
      .map((entry) => {
        const averageScore =
          entry.totalData === 0 ? 0 : entry.totalScore / entry.totalData;

        const latestRiskItem = getLatestRiskItem(entry.items);

        return {
          ...entry,
          averageScore,
          category: getDominantCategory(entry.items),
          latestPeriod: getLatestPeriod(entry.items),
          latestRiskItem,
        };
      })
      .sort((a, b) => {
        const riskDiff = getRiskWeight(b.category) - getRiskWeight(a.category);

        if (riskDiff !== 0) {
          return riskDiff;
        }

        return b.averageScore - a.averageScore;
      })
      .slice(0, 8);
  }, [filteredRisiko]);

  const maxAreaScore = useMemo(() => {
    return Math.max(
      ...areaRiskDistribution.map((item) => item.averageScore),
      1
    );
  }, [areaRiskDistribution]);

  const topRiskAreas = useMemo(() => {
    return areaRiskDistribution
      .map((item) => {
        const riskSource = item.latestRiskItem || item.items?.[0] || null;

        return {
          id: item.wilayahId,
          wilayah: item.wilayah,
          periode: riskSource?.periode || item.latestPeriod || "",
          skor_irs: item.highestScore || item.averageScore || 0,
          averageScore: item.averageScore,
          kategori_risiko: item.category,
          faktor_dominan: riskSource?.faktor_dominan || "",
        };
      })
      .sort((a, b) => {
        const riskDiff =
          getRiskWeight(b.kategori_risiko) - getRiskWeight(a.kategori_risiko);

        if (riskDiff !== 0) {
          return riskDiff;
        }

        return Number(b.skor_irs || 0) - Number(a.skor_irs || 0);
      })
      .slice(0, 6);
  }, [areaRiskDistribution]);

  const interventionStats = useMemo(() => {
    const relatedRiskIds = new Set(filteredRisiko.map((item) => String(item.id)));

    const relatedInterventions = intervensiList.filter((item) => {
      const dataRisikoId = String(item.data_risiko_id || "");
      const interventionYear = item.tanggal_mulai
        ? String(new Date(item.tanggal_mulai).getFullYear())
        : "";

      return relatedRiskIds.has(dataRisikoId) || interventionYear === yearFilter;
    });

    const selesai = relatedInterventions.filter(
      (item) => item.status === "selesai"
    ).length;

    const berjalan = relatedInterventions.filter(
      (item) => item.status === "berjalan"
    ).length;

    const direncanakan = relatedInterventions.filter(
      (item) => item.status === "direncanakan"
    ).length;

    return {
      total: relatedInterventions.length,
      selesai,
      berjalan,
      direncanakan,
      completionRate:
        relatedInterventions.length === 0
          ? 0
          : Math.round((selesai / relatedInterventions.length) * 100),
    };
  }, [filteredRisiko, intervensiList, yearFilter]);

  const insightText = getInsightText(
    totalTinggi,
    totalSedang,
    totalRendah,
    dominantFactor
  );

  return (
    <AdminLayout
      title="Analitik Desa"
      subtitle="Menganalisis data risiko, faktor dominan, sebaran IRS wilayah, dan tindak lanjut intervensi."
    >
      <ErrorAlert message={errorMessage} />

      <section className="admin-panel analytic-hero-card">
        <div className="analytic-hero-content">
          <div>
            <span>Analitik Desa</span>
            <h2>Pembacaan Kondisi Risiko Wilayah</h2>
            <p>
              Halaman ini menyajikan analisis berbasis data risiko dan IRS untuk
              membantu admin desa melihat pola risiko, faktor dominan, serta
              dusun/RT yang perlu diprioritaskan.
            </p>
          </div>

          <div className="analytic-insight-box">
            <TrendingUp size={20} />
            <div>
              <strong>Insight Utama</strong>
              <p>{insightText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel analytic-filter-card">
        <div className="admin-list-toolbar">
          <div>
            <span>Filter Analitik</span>
            <h2>Periode dan Wilayah</h2>
            <p>
              Gunakan filter untuk membaca analisis berdasarkan tahun, kategori
              risiko, wilayah, atau faktor tertentu.
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

      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Data Risiko</span>
          <strong>{formatNumber(totalDataRisiko)}</strong>
          <p>Data IRS pada {yearFilter}</p>
        </article>

        <article className="admin-metric-card danger">
          <span>Risiko Tinggi</span>
          <strong>{formatNumber(totalTinggi)}</strong>
          <p>Wilayah prioritas utama</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Rata-rata IRS</span>
          <strong>{averageIrs.toFixed(2)}</strong>
          <p>Nilai rata-rata seluruh data</p>
        </article>

        <article className="admin-metric-card success">
          <span>Intervensi Selesai</span>
          <strong>{interventionStats.completionRate}%</strong>
          <p>
            {formatNumber(interventionStats.selesai)} dari{" "}
            {formatNumber(interventionStats.total)} intervensi
          </p>
        </article>
      </section>

      <section className="analytic-summary-grid">
        <article className="admin-panel analytic-card">
          <div className="admin-panel-header">
            <div>
              <span>Komposisi Risiko</span>
              <h2>Distribusi Kategori</h2>
              <p>
                Menunjukkan proporsi risiko rendah, sedang, dan tinggi pada
                periode terpilih.
              </p>
            </div>
          </div>

          {loading ? (
            <EmptyState
              title="Memuat analitik"
              message="Sistem sedang mengambil data risiko."
            />
          ) : totalDataRisiko === 0 ? (
            <EmptyState
              title="Belum ada data risiko"
              message="Distribusi risiko akan muncul setelah data IRS tersedia."
            />
          ) : (
            <div className="analytic-risk-distribution">
              <div className="analytic-donut" style={{ background: riskGradient }}>
                <div>
                  <strong>{totalDataRisiko}</strong>
                  <span>Data</span>
                </div>
              </div>

              <div className="analytic-risk-list">
                <div>
                  <span className="risk-dot high" />
                  <p>Risiko Tinggi</p>
                  <strong>{formatNumber(totalTinggi)}</strong>
                </div>

                <div>
                  <span className="risk-dot medium" />
                  <p>Risiko Sedang</p>
                  <strong>{formatNumber(totalSedang)}</strong>
                </div>

                <div>
                  <span className="risk-dot low" />
                  <p>Risiko Rendah</p>
                  <strong>{formatNumber(totalRendah)}</strong>
                </div>
              </div>
            </div>
          )}
        </article>

        <article className="admin-panel analytic-card">
          <div className="admin-panel-header">
            <div>
              <span>Indikator Sasaran</span>
              <h2>Ibu Hamil dan KEK</h2>
              <p>
                Menunjukkan jumlah sasaran ibu hamil, kondisi KEK, dan ANC
                tidak rutin.
              </p>
            </div>
          </div>

          <div className="analytic-indicator-list">
            <div>
              <UsersRound size={18} />
              <span>Total Ibu Hamil</span>
              <strong>{formatNumber(totalIbuHamil)}</strong>
            </div>

            <div>
              <AlertTriangle size={18} />
              <span>Ibu Hamil KEK</span>
              <strong>{formatNumber(totalKek)}</strong>
            </div>

            <div>
              <CalendarDays size={18} />
              <span>ANC Tidak Rutin</span>
              <strong>{formatNumber(totalAncTidakRutin)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-dashboard-grid bottom analytic-main-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Sebaran Wilayah</span>
              <h2>Perbandingan Skor IRS per Dusun/RT</h2>
              <p>
                Grafik ini membandingkan rata-rata skor IRS setiap wilayah agar
                admin lebih cepat mengenali lokasi yang membutuhkan pemantauan.
              </p>
            </div>
          </div>

          {loading ? (
            <EmptyState
              title="Memuat sebaran wilayah"
              message="Sistem sedang menghitung perbandingan skor IRS wilayah."
            />
          ) : areaRiskDistribution.length === 0 ? (
            <EmptyState
              title="Belum ada sebaran wilayah"
              message="Sebaran wilayah akan muncul setelah data risiko tersedia."
            />
          ) : (
            <div className="analytic-area-chart">
              {areaRiskDistribution.map((item) => {
                const barWidth = Math.max(
                  (item.averageScore / maxAreaScore) * 100,
                  6
                );

                return (
                  <div className="analytic-area-row" key={item.wilayahId}>
                    <div className="analytic-area-info">
                      <strong>
                        {item.wilayah?.nama_dusun || "-"} -{" "}
                        {item.wilayah?.nama_rt || "-"}
                      </strong>
                      <small>
                        {item.wilayah?.kode_wilayah || "-"} ·{" "}
                        {item.latestPeriod
                          ? formatPeriodLabel(item.latestPeriod)
                          : "-"}{" "}
                        · {item.totalData} data
                      </small>
                    </div>

                    <div className="analytic-area-meter">
                      <span
                        className={`analytic-area-bar ${item.category}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    <div className="analytic-area-score">
                      <strong>{item.averageScore.toFixed(2)}</strong>
                      <small>{getRiskLabel(item.category)}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Faktor Dominan</span>
              <h2>Faktor Risiko Terbanyak</h2>
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
            <div className="analytic-factor-list">
              {dominantFactors.map((item) => (
                <div className="analytic-factor-item" key={item.factor}>
                  <div>
                    <strong>{formatFactorLabel(item.factor)}</strong>
                    <small>{item.total} data risiko</small>
                  </div>

                  <div className="analytic-factor-meter">
                    <span style={{ width: `${item.percentage}%` }} />
                  </div>

                  <b>{item.percentage}%</b>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="admin-dashboard-grid bottom analytic-main-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <span>Prioritas Wilayah</span>
              <h2>Wilayah Perlu Pemantauan</h2>
              <p>
                Daftar ini menampilkan wilayah unik berdasarkan kategori risiko
                tertinggi dan skor IRS acuan.
              </p>
            </div>
          </div>

          {topRiskAreas.length === 0 ? (
            <EmptyState
              title="Belum ada wilayah prioritas"
              message="Wilayah prioritas akan muncul setelah data risiko tersedia."
            />
          ) : (
            <div className="analytic-priority-list">
              {topRiskAreas.map((item, index) => (
                <div className="analytic-priority-item" key={item.id}>
                  <div className="analytic-rank">{index + 1}</div>

                  <div>
                    <strong>
                      {item.wilayah?.nama_dusun || "-"} -{" "}
                      {item.wilayah?.nama_rt || "-"}
                    </strong>
                    <small>
                      {formatPeriodLabel(item.periode)} · IRS{" "}
                      {Number(item.skor_irs || 0).toFixed(2)} ·{" "}
                      {item.faktor_dominan
                        ? formatFactorLabel(item.faktor_dominan)
                        : getRiskLabelShort(item.kategori_risiko)}
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
              <span>Intervensi</span>
              <h2>Status Tindak Lanjut</h2>
              <p>
                Memantau status tindak lanjut program berdasarkan data risiko
                wilayah.
              </p>
            </div>
          </div>

          <div className="analytic-intervention-status">
            <div>
              <LineChart size={18} />
              <span>Total Intervensi</span>
              <strong>{formatNumber(interventionStats.total)}</strong>
            </div>

            <div>
              <BarChart3 size={18} />
              <span>Direncanakan</span>
              <strong>{formatNumber(interventionStats.direncanakan)}</strong>
            </div>

            <div>
              <TrendingUp size={18} />
              <span>Berjalan</span>
              <strong>{formatNumber(interventionStats.berjalan)}</strong>
            </div>

            <div>
              <MapPin size={18} />
              <span>Selesai</span>
              <strong>{formatNumber(interventionStats.selesai)}</strong>
            </div>
          </div>
        </article>
      </section>
    </AdminLayout>
  );
}

export default AdminAnalitikPage;