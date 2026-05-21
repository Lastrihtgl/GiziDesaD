import {
	Bell,
	ChevronRight,
	ClipboardList,
	Home,
	LogOut,
	MapPinned,
	NotebookPen,
	Users,
	UtensilsCrossed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function KaderDashboard() {
	const navigate = useNavigate();

	const stats = [
		{ label: "RT Binaan", value: "RT 05" },
		{ label: "Risiko Tinggi", value: "2" },
		{ label: "Kunjungan Hari Ini", value: "3" },
	];

	const actions = [
		{
			title: "Input Data RT",
			description: "Update kondisi terbaru",
			icon: ClipboardList,
			className: "is-green",
			onClick: () => navigate("/kader/input-data-rt"),
		},
		{
			title: "Lihat Peta Risiko",
			description: "Cek kondisi desa",
			icon: MapPinned,
			className: "is-amber",
			onClick: () => navigate("/kader/peta-risiko"),
		},
		{
			title: "Edukasi Pangan",
			description: "Materi untuk warga",
			icon: UtensilsCrossed,
			className: "is-green-soft",
			onClick: () => navigate("/kader/edukasi-pangan"),
		},
		{
			title: "Rekomendasi",
			description: "Saran intervensi",
			icon: Users,
			className: "is-teal",
			onClick: () => navigate("/kader/data-warga"),
		},
	];

	const checklist = [
		"Kunjungi Ibu Siti (hamil 7 bulan)",
		"Update data sanitasi RT 05",
		"Posyandu minggu ini",
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
							Tugas Saya
						</button>
						<button type="button" onClick={() => navigate("/kader/peta-risiko")}>
							<MapPinned size={16} />
							Peta Risiko
						</button>
						<button type="button" onClick={() => navigate("/kader/edukasi-pangan")}>
							<UtensilsCrossed size={16} />
							Pangan Lokal
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
						<h1>Selamat Pagi, Kader! 👋</h1>
						<p>Apa yang perlu dilakukan hari ini?</p>
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
							<h2>Aksi Utama</h2>
						</header>
						<div className="kader-action-grid">
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
							<h2>Checklist Tugas Minggu Ini</h2>
						</header>
						<div className="kader-checklist-list">
							{checklist.map((item, index) => (
								<label key={item} className={index === checklist.length - 1 ? "kader-checklist-item is-complete" : "kader-checklist-item"}>
									<input type="checkbox" defaultChecked={index === checklist.length - 1} />
									<span>{item}</span>
								</label>
							))}
						</div>
						<div className="kader-tip-box">
							<strong>Tips</strong>
							<p>Selalu update data setelah kunjungan. Data yang akurat membantu Bidan dan Admin membuat keputusan terbaik untuk warga.</p>
						</div>
					</article>
				</section>
			</main>
		</section>
	);
}

export default KaderDashboard;
