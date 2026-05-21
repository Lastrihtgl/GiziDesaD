import {
	Bell,
	ChevronRight,
	ClipboardList,
	Droplets,
	HeartPulse,
	Home,
	LogOut,
	MapPinned,
	NotebookPen,
	Shield,
	Trees,
	Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function PetaRisiko() {
	const navigate = useNavigate();

	const rtNodes = [
		{ label: "RT 01", score: 38, tier: "low", top: "24%", left: "18%", rotate: "-16deg" },
		{ label: "RT 02", score: 56, tier: "medium", top: "18%", left: "34%", rotate: "-10deg" },
		{ label: "RT 03", score: 78, tier: "high", top: "16%", left: "49%", rotate: "10deg" },
		{ label: "RT 04", score: 41, tier: "low", top: "40%", left: "15%", rotate: "-12deg" },
		{ label: "RT 05", score: 73, tier: "high", top: "47%", left: "32%", rotate: "8deg" },
		{ label: "RT 06", score: 49, tier: "medium", top: "53%", left: "47%", rotate: "-14deg" },
		{ label: "RT 07", score: 33, tier: "low", top: "26%", left: "66%", rotate: "12deg" },
		{ label: "RT 08", score: 61, tier: "medium", top: "46%", left: "69%", rotate: "-8deg" },
	];

	const factors = [
		{ label: "Sanitasi buruk", value: "Utama", icon: Droplets },
		{ label: "Keterbatasan pangan bergizi", value: "Kedua", icon: Trees },
		{ label: "Ekonomi lemah", value: "Ketiga", icon: HeartPulse },
	];

	const metrics = [
		{ label: "Penduduk", value: "156", icon: Users },
		{ label: "Ibu Hamil", value: "15", icon: HeartPulse },
		{ label: "Rumah Tak Layak", value: "8", icon: Shield },
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
						<button type="button" onClick={() => navigate("/kader/data-warga")}>
							<ClipboardList size={16} />
							Tugas Saya
						</button>
						<button type="button" className="active" onClick={() => navigate("/kader/peta-risiko")}>
							<MapPinned size={16} />
							Peta Risiko
							<ChevronRight size={16} />
						</button>
						<button type="button" onClick={() => navigate("/kader/edukasi-pangan")}>
							<Trees size={16} />
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

				<section className="kader-page-header">
					<div>
						<h1>Peta Risiko Stunting</h1>
						<p>Visualisasi zona risiko per RT agar prioritas pendampingan lebih mudah ditentukan.</p>
					</div>
				</section>

				<section className="kader-map-layout">
					<article className="kader-card kader-map-card">
						<div className="kader-map-card-head">
							<div>
								<strong>Desa Pangururan</strong>
								<span>Zona risiko per RT / Dusun</span>
							</div>
							<span className="kader-map-badge">IRS aktif</span>
						</div>

						<div className="kader-map-board">
							{rtNodes.map((node) => (
								<div
									key={node.label}
									className={`kader-rt-chip ${node.tier}`}
									style={{ top: node.top, left: node.left, transform: `rotate(${node.rotate})` }}
								>
									<strong>{node.label}</strong>
									<small>{node.score}/100</small>
								</div>
							))}

							<div className="kader-map-legend">
								<strong>Kategori Risiko</strong>
								<div>
									<span className="is-low" />
									<small>Rendah (0-40)</small>
								</div>
								<div>
									<span className="is-medium" />
									<small>Sedang (41-70)</small>
								</div>
								<div>
									<span className="is-high" />
									<small>Tinggi (71-100)</small>
								</div>
							</div>
						</div>
					</article>

					<aside className="kader-card kader-detail-card">
						<div className="kader-detail-head">
							<strong>Detail RT</strong>
							<span className="kader-map-badge is-danger">Risiko Tinggi</span>
						</div>

						<div className="kader-detail-summary">
							<h2>RT 03 - Dusun A</h2>
							<p>Skor Risiko (IRS)</p>
							<strong>78/100</strong>
							<div className="kader-score-bar">
								<span />
							</div>
						</div>

						<div className="kader-metric-grid">
							{metrics.map((item) => {
								const Icon = item.icon;

								return (
									<div key={item.label} className="kader-metric-card">
										<Icon size={18} />
										<strong>{item.value}</strong>
										<span>{item.label}</span>
									</div>
								);
							})}
						</div>

						<div className="kader-factor-list">
							<strong>Faktor Dominan</strong>
							{factors.map((item) => {
								const Icon = item.icon;

								return (
									<div key={item.label} className="kader-factor-item">
										<Icon size={16} />
										<div>
											<strong>{item.label}</strong>
											<span>{item.value}</span>
										</div>
									</div>
								);
							})}
						</div>

						<button type="button" className="kader-button is-primary kader-wide-button" onClick={() => navigate("/kader/data-warga")}>
							Lihat Rekomendasi
						</button>
					</aside>
				</section>
			</main>
		</section>
	);
}

export default PetaRisiko;
