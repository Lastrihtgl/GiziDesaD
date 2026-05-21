import {
	Bell,
	ChevronRight,
	ClipboardList,
	CircleDashed,
	Clock3,
	CheckCircle2,
	Home,
	LogOut,
	MapPin,
	NotebookPen,
	Trees,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function DataWarga() {
	const navigate = useNavigate();

	const summary = [
		{ label: "Total RT", value: "12" },
		{ label: "Sudah Lengkap", value: "8" },
		{ label: "Belum Diupdate", value: "4" },
	];

	const rtChecklist = [
		{
			rt: "RT 01",
			dusun: "Dusun A",
			status: "Lengkap",
			statusClass: "is-success",
			updatedAt: "Diperbarui 2 jam lalu",
			icon: CheckCircle2,
		},
		{
			rt: "RT 03",
			dusun: "Dusun A",
			status: "Lengkap",
			statusClass: "is-success",
			updatedAt: "Diperbarui 5 jam lalu",
			icon: CheckCircle2,
		},
		{
			rt: "RT 05",
			dusun: "Dusun A",
			status: "Perlu Update",
			statusClass: "is-warning",
			updatedAt: "Terakhir 7 hari lalu",
			icon: Clock3,
		},
		{
			rt: "RT 08",
			dusun: "Dusun B",
			status: "Belum Input",
			statusClass: "is-muted",
			updatedAt: "Belum ada data periode ini",
			icon: CircleDashed,
		},
	];

	const updateNotes = [
		"Prioritaskan RT berstatus Belum Input sebelum akhir minggu.",
		"Jika data belum lengkap, simpan draft saat kunjungan dan lanjutkan setelah konfirmasi.",
		"Status RT otomatis membantu bidan membaca wilayah prioritas lebih cepat.",
	];

	return (
		<section className="kader-shell">
			<aside className="kader-sidebar">
				<div>
					<div className="kader-brand">
						<span className="kader-brand-mark">G</span>
						<div>
							<strong>GiziDesa</strong>
							<small>RT 05 Dusun A</small>
						</div>
					</div>

					<div className="kader-role-card">
						<span>Anda masuk sebagai</span>
						<strong>Kader Posyandu</strong>
						<small>Desa Pangururan</small>
					</div>

					<nav className="kader-nav">
						<button type="button" onClick={() => navigate("/kader/dashboard")}>
							<Home size={16} />
							Dashboard
						</button>
						<button type="button" onClick={() => navigate("/kader/input-data-rt")}>
							<NotebookPen size={16} />
							Input Data RT
						</button>
						<button type="button" className="active" onClick={() => navigate("/kader/data-warga")}>
							<ClipboardList size={16} />
							Status RT
							<ChevronRight size={16} />
						</button>
						<button type="button" onClick={() => navigate("/kader/edukasi-pangan")}>
							<Trees size={16} />
							Panduan Pangan
						</button>
					</nav>
				</div>

				<button type="button" className="kader-logout">
					<LogOut size={16} />
					Keluar
				</button>
			</aside>

			<main className="kader-main">
				<header className="kader-topbar">
					<div className="kader-context">
						<strong>GiziDesa</strong>
						<span>RT 05 Dusun A</span>
					</div>
					<div className="kader-topbar-actions">
						<button type="button" className="kader-icon-button" aria-label="Notifikasi">
							<Bell size={16} />
						</button>
						<div className="kader-user-chip">
							<div>
								<strong>ibu sianturi</strong>
								<span>Kader Posyandu</span>
							</div>
							<span className="kader-avatar">IS</span>
						</div>
					</div>
				</header>

				<section className="kader-page-header">
					<div>
						<h1>Status Input RT</h1>
						<p>Checklist wilayah agar kader tahu RT mana yang sudah lengkap dan mana yang belum diperbarui.</p>
					</div>
				</section>

				<section className="kader-stats">
					{summary.map((item) => (
						<article key={item.label} className="kader-card kader-stat-card">
							<strong>{item.value}</strong>
							<span>{item.label}</span>
						</article>
					))}
				</section>

				<section className="kader-task-layout">
					<article className="kader-card kader-task-panel">
						<div className="kader-panel-head">
							<div>
								<h2>Checklist Wilayah</h2>
								<p>Perbarui status setiap RT setelah kunjungan lapangan.</p>
							</div>
							<span className="kader-map-badge">Periode minggu ini</span>
						</div>

						<div className="kader-task-list">
							{rtChecklist.map((item) => {
								const Icon = item.icon;

								return (
								<article key={item.rt} className="kader-task-card">
									<div className="kader-task-card-head">
										<div>
											<strong>{item.rt}</strong>
											<span>{item.dusun}</span>
										</div>
										<span className={`kader-map-badge ${item.statusClass}`}>{item.status}</span>
									</div>
									<div className="kader-status-meta">
										<Icon size={16} />
										<span>{item.updatedAt}</span>
									</div>
								</article>
							)})}
						</div>
					</article>

					<aside className="kader-card kader-priority-panel">
						<div className="kader-priority-head">
							<strong>Catatan Lapangan</strong>
							<span>Untuk periode input berikutnya</span>
						</div>

						<div className="kader-priority-list">
							{updateNotes.map((item) => (
								<div key={item} className="kader-priority-item">
									<MapPin size={16} />
									<div>
										<strong>{item}</strong>
									</div>
								</div>
							))}
						</div>

						<div className="kader-tip-box">
							<strong>Manfaat untuk Sistem</strong>
							<p>Checklist status RT mempercepat proses analisis IRS dan membantu bidan mengambil keputusan kunjungan yang lebih tepat sasaran.</p>
						</div>
					</aside>
				</section>
			</main>
		</section>
	);
}

export default DataWarga;
