import {
	Bell,
	CalendarDays,
	ChevronRight,
	ClipboardList,
	FlaskConical,
	HeartPulse,
	LayoutDashboard,
	Lightbulb,
	LogOut,
	MapPinned,
	NotebookPen,
	ShieldCheck,
	Trees,
	Droplets,
	Stethoscope,
	Wallet,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function BidanDashboard() {
	const navigate = useNavigate();
	const location = useLocation();

	const summaryCards = [
		{ label: "RT Prioritas", value: "6", color: "is-red" },
		{ label: "RT Risiko Tinggi", value: "3", color: "is-amber" },
		{ label: "Pendampingan Aktif", value: "8", color: "is-green" },
		{ label: "Intervensi Bulan Ini", value: "14", color: "is-green" },
	];

	const menuItems = [
		{ label: "Dashboard", icon: LayoutDashboard, path: "/bidan/dashboard" },
		{ label: "Peta Prioritas", icon: MapPinned, path: "/bidan/peta-risiko" },
		{ label: "Tindak Lanjut", icon: NotebookPen, path: "/bidan/tindak-lanjut" },
		{ label: "Rekomendasi", icon: Lightbulb, path: "/bidan/rekomendasi" },
	];

	const rtMap = [
		{
			name: "RT 03",
			score: 85,
			status: "Risiko Tinggi",
			color: "is-red",
			factors: ["ANC rendah", "Sanitasi buruk"],
		},
		{
			name: "RT 05",
			score: 72,
			status: "Risiko Tinggi",
			color: "is-red",
			factors: ["Akses layanan rendah", "Ekonomi rentan"],
		},
		{
			name: "RT 08",
			score: 66,
			status: "Risiko Sedang",
			color: "is-amber",
			factors: ["Pangan lokal terbatas", "Air bersih terbatas"],
		},
	];

	const interventionLog = [
		{
			title: "Kunjungan ANC rumah Ibu Maya",
			meta: "RT 03 • 20 Mei 2026",
			action: "Edukasi ANC + jadwal kontrol puskesmas",
			status: "Selesai",
		},
		{
			title: "Pemantauan sanitasi keluarga rentan",
			meta: "RT 05 • 19 Mei 2026",
			action: "Koordinasi perbaikan jamban dengan kader",
			status: "Berjalan",
		},
		{
			title: "Edukasi menu ibu hamil berbasis pangan lokal",
			meta: "RT 08 • 18 Mei 2026",
			action: "Sosialisasi ikan jurung dan daun kelor",
			status: "Selesai",
		},
	];

	const autoRecommendations = [
		{
			title: "RT 03 - ANC Rendah + Sanitasi Buruk",
			recommendation: "Prioritaskan kunjungan bidan mingguan, edukasi ANC, dan rujukan perbaikan sanitasi rumah tangga.",
			icon: Stethoscope,
		},
		{
			title: "RT 05 - Ekonomi Rentan + Akses Layanan Rendah",
			recommendation: "Gabungkan layanan ANC keliling dengan dukungan bantuan pangan ibu hamil dari desa.",
			icon: Wallet,
		},
		{
			title: "RT 08 - Pangan Lokal Terbatas",
			recommendation: "Lakukan edukasi gizi dengan pangan lokal yang tersedia dan pemantauan konsumsi mingguan.",
			icon: Trees,
		},
	];

	const path = location.pathname;
	const activeLabel = menuItems.find((item) => path.startsWith(item.path))?.label || "Dashboard";

 	const isDashboard = path === "/bidan/dashboard" || path === "/bidan/peta-risiko";
	const isTindakLanjut = path === "/bidan/tindak-lanjut";
	const isRekomendasi = path === "/bidan/rekomendasi";

	function renderPriorityPanel() {
		const detail = rtMap[0];

		return (
			<section className="bidan-map-layout">
				<article className="bidan-card bidan-panel bidan-map-panel">
					<header className="bidan-panel-head">
						<h2>
							<MapPinned size={18} /> Dashboard Prioritas Wilayah
						</h2>
					</header>
					<div className="bidan-map-grid">
						{rtMap.map((item) => (
							<div key={item.name} className={`bidan-map-chip ${item.color}`}>
								<strong>{item.name}</strong>
								<span>{item.score}</span>
							</div>
						))}
					</div>
					<div className="bidan-map-legend">
						<span className="is-red">Merah: 71-100</span>
						<span className="is-amber">Kuning: 41-70</span>
						<span className="is-green">Hijau: 0-40</span>
					</div>
				</article>

				<aside className="bidan-card bidan-panel bidan-factor-panel">
					<header className="bidan-panel-head">
						<h2>
							<FlaskConical size={18} /> Detail Faktor Dominan
						</h2>
					</header>
					<div className="bidan-factor-detail">
						<strong>{detail.name} - {detail.status}</strong>
						<p>IRS {detail.score}/100</p>
						<ul>
							{detail.factors.map((factor) => (
								<li key={factor}>{factor}</li>
							))}
						</ul>
					</div>
					<button type="button" className="bidan-button is-approve" onClick={() => navigate("/bidan/tindak-lanjut")}>
						Catat Tindak Lanjut
					</button>
				</aside>
			</section>
		);
	}

	function renderTindakLanjutPanel() {
		return (
			<>
				<section className="bidan-card bidan-panel">
					<header className="bidan-panel-head">
						<h2>
							<NotebookPen size={18} /> Catat Tindak Lanjut Pendampingan
						</h2>
					</header>
					<div className="bidan-followup-form">
						<label>
							<span>RT / Wilayah Prioritas</span>
							<input type="text" placeholder="Contoh: RT 03 Dusun A" />
						</label>
						<label>
							<span>Nama Ibu Hamil / Keluarga</span>
							<input type="text" placeholder="Contoh: Ibu Maya" />
						</label>
						<label>
							<span>Tindak Lanjut yang Dilakukan</span>
							<textarea rows={3} placeholder="Contoh: Edukasi ANC, jadwal kunjungan ulang, koordinasi kader" />
						</label>
						<div className="bidan-validation-actions">
							<button type="button" className="bidan-button is-outline">Simpan Draft</button>
							<button type="button" className="bidan-button is-approve">Simpan Riwayat</button>
						</div>
					</div>
				</section>

				<section className="bidan-card bidan-panel">
					<header className="bidan-panel-head">
						<h2>
							<ClipboardList size={18} /> Riwayat Intervensi
						</h2>
					</header>
					<div className="bidan-intervensi-list">
						{interventionLog.map((item) => (
							<article key={item.title} className="bidan-intervensi-item">
								<div className="bidan-intervensi-head">
									<div>
										<strong>{item.title}</strong>
										<p>{item.meta}</p>
										<small>{item.action}</small>
									</div>
									<span className={`bidan-badge ${item.status === "Selesai" ? "is-green" : "is-amber"}`}>{item.status}</span>
								</div>
							</article>
						))}
					</div>
				</section>
			</>
		);
	}

	function renderRecommendationPanel() {
		return (
			<>
				<section className="bidan-card bidan-panel">
					<header className="bidan-panel-head">
						<h2>Daftar Intervensi</h2>
					</header>
					<div className="bidan-recommendation-list">
						{autoRecommendations.map((item) => {
							const Icon = item.icon;

							return (
								<article key={item.title} className="bidan-recommendation-item">
									<div className="bidan-recommendation-head">
										<Icon size={18} />
										<strong>{item.title}</strong>
									</div>
									<p>{item.recommendation}</p>
									<button type="button" className="bidan-button is-outline">Gunakan Sebagai Rencana Kunjungan</button>
								</article>
							);
						})}
					</div>
				</section>

				<section className="bidan-card bidan-achievement-panel">
					<header className="bidan-panel-head">
						<h2>Dasar Rule yang Digunakan</h2>
					</header>
					<div className="bidan-achievement-grid">
						<article>
							<strong>ANC</strong>
							<span>Kepatuhan ANC rendah - prioritas kunjungan bidan</span>
						</article>
						<article>
							<strong>Sanitasi</strong>
							<span>Sanitasi buruk - edukasi PHBS + koordinasi desa</span>
						</article>
						<article>
							<strong>Pangan</strong>
							<span>Pangan lokal terbatas - edukasi menu bergizi lokal</span>
						</article>
					</div>
				</section>
			</>
		);
	}

	function renderPlaceholder(title, subtitle) {
		return (
			<section className="bidan-card bidan-placeholder">
				<h2>{title}</h2>
				<p>{subtitle}</p>
			</section>
		);
	}

	function renderMainContent() {
		if (isDashboard) {
			return renderPriorityPanel();
		}

		if (isTindakLanjut) {
			return renderTindakLanjutPanel();
		}

		if (isRekomendasi) {
			return renderRecommendationPanel();
		}

		return renderPlaceholder("Halaman Bidan", "Pilih menu bidan untuk melihat dashboard prioritas, tindak lanjut, atau rekomendasi otomatis.");
	}

	return (
		<section className="bidan-shell">
			<aside className="bidan-sidebar">
				<div>
					<div className="bidan-brand">
						<span className="bidan-brand-mark">G</span>
						<strong>GiziDesa</strong>
					</div>

					<div className="bidan-role-card">
						<span>Anda masuk sebagai</span>
						<strong>Bidan Desa</strong>
						<small>Desa Pangururan</small>
					</div>

					<nav className="bidan-nav">
						{menuItems.map((item) => {
							const Icon = item.icon;
							const isActive = path.startsWith(item.path);

							return (
								<button
									key={item.path}
									type="button"
									className={isActive ? "active" : ""}
									onClick={() => navigate(item.path)}
								>
									<Icon size={16} />
									<span>{item.label}</span>
									{isActive ? <ChevronRight size={16} /> : null}
								</button>
							);
						})}
					</nav>
				</div>

				<button type="button" className="bidan-logout">
					<LogOut size={16} />
					Keluar
				</button>
			</aside>

			<main className="bidan-main">
				<header className="bidan-topbar">
					<div />
					<div className="bidan-topbar-actions">
						<button type="button" className="bidan-icon-button" aria-label="Notifikasi">
							<Bell size={16} />
						</button>
						<div className="bidan-user-chip">
							<div>
								<strong>a</strong>
								<span>Bidan Desa</span>
							</div>
							<span className="bidan-avatar">A</span>
						</div>
					</div>
				</header>

				<section className="bidan-header">
					<h1>{isTindakLanjut ? "Tindak Lanjut Pendampingan" : isRekomendasi ? "Rekomendasi Intervensi Otomatis" : "Dashboard Bidan Desa"}</h1>
					<p>
						{isTindakLanjut
							? "Catat riwayat intervensi setelah kunjungan agar perubahan kondisi dapat dipantau periode berikutnya."
							: isRekomendasi
								? "Sistem men-generate saran intervensi berbasis faktor risiko dominan per RT."
								: "Baca prioritas wilayah berdasarkan IRS dan fokuskan kunjungan ke RT berisiko tertinggi."}
					</p>
					{!isDashboard ? <span className="bidan-page-pill">{activeLabel}</span> : null}
				</section>

				<section className="bidan-summary-grid">
					{summaryCards.map((item) => (
						<article key={item.label} className="bidan-card bidan-summary-card">
							<strong className={item.color}>{item.value}</strong>
							<span>{item.label}</span>
						</article>
					))}
				</section>

				{renderMainContent()}
			</main>
		</section>
	);
}

export default BidanDashboard;
