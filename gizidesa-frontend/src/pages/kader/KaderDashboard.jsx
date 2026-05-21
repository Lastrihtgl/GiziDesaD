import {
	Bell,
	ChevronRight,
	ClipboardList,
	Home,
	LogOut,
	NotebookPen,
	UtensilsCrossed,
	CheckCircle2,
	Clock3,
	CircleDashed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function KaderDashboard() {
	const navigate = useNavigate();

	const stats = [
		{ label: "Total RT Binaan", value: "12" },
		{ label: "Sudah Diinput", value: "8" },
		{ label: "Belum Update", value: "4" },
	];

	const actions = [
		{
			title: "Input Data RT",
			description: "Isi 6 indikator risiko per RT",
			icon: ClipboardList,
			className: "is-green",
			onClick: () => navigate("/kader/input-data-rt"),
		},
		{
			title: "Status RT",
			description: "Cek RT sudah/belum diinput",
			icon: CheckCircle2,
			className: "is-amber",
			onClick: () => navigate("/kader/data-warga"),
		},
		{
			title: "Panduan Pangan Lokal",
			description: "Bahan edukasi saat kunjungan",
			icon: UtensilsCrossed,
			className: "is-green-soft",
			onClick: () => navigate("/kader/edukasi-pangan"),
		},
	];

	const recentRtUpdates = [
		{ rt: "RT 01", status: "Lengkap", icon: CheckCircle2, className: "is-complete" },
		{ rt: "RT 03", status: "Lengkap", icon: CheckCircle2, className: "is-complete" },
		{ rt: "RT 05", status: "Perlu Update", icon: Clock3, className: "is-pending" },
		{ rt: "RT 08", status: "Belum Input", icon: CircleDashed, className: "is-empty" },
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
						<button type="button" className="active" onClick={() => navigate("/kader/dashboard")}>
							<Home size={16} />
							Dashboard
							<ChevronRight size={16} />
						</button>
						<button type="button" onClick={() => navigate("/kader/input-data-rt")}>
							<NotebookPen size={16} />
							Input Data RT
						</button>
						<button type="button" onClick={() => navigate("/kader/data-warga")}>
							<ClipboardList size={16} />
							Status RT
						</button>
						<button type="button" onClick={() => navigate("/kader/edukasi-pangan")}>
							<UtensilsCrossed size={16} />
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

				<section className="kader-hero">
					<div>
						<h1>Kader Posyandu: Mata dan Tangan di Lapangan</h1>
						<p>Input data sederhana, cek status RT, lalu gunakan panduan pangan lokal saat edukasi warga.</p>
					</div>
				</section>

				<section className="kader-stats">
					{stats.map((item) => (
						<article key={item.label} className="kader-card kader-stat-card">
							<strong>{item.value}</strong>
							<span>{item.label}</span>
						</article>
					))}
				</section>

				<section className="kader-grid">
					<article className="kader-card kader-action-panel">
						<header>
							<h2>Aksi Kader</h2>
						</header>
						<div className="kader-action-grid kader-action-grid-three">
							{actions.map((item) => {
								const Icon = item.icon;

								return (
									<button key={item.title} type="button" className={`kader-action-card ${item.className}`} onClick={item.onClick}>
										<span className="kader-action-icon">
											<Icon size={22} />
										</span>
										<div>
											<strong>{item.title}</strong>
											<small>{item.description}</small>
										</div>
									</button>
								);
							})}
						</div>
					</article>

					<article className="kader-card kader-checklist-panel">
						<header>
							<h2>Status RT Terbaru</h2>
						</header>
						<div className="kader-status-list">
							{recentRtUpdates.map((item) => {
								const Icon = item.icon;

								return (
									<div key={item.rt} className={`kader-status-item ${item.className}`}>
										<div>
											<strong>{item.rt}</strong>
											<small>{item.status}</small>
										</div>
										<Icon size={18} />
									</div>
								);
							})}
						</div>
						<div className="kader-tip-box">
							<strong>Kenapa Penting?</strong>
							<p>Data yang kader input langsung dihitung menjadi IRS, jadi bidan dan perangkat desa bisa bertindak lebih cepat tanpa rekap manual.</p>
						</div>
					</article>
				</section>
			</main>
		</section>
	);
}

export default KaderDashboard;
