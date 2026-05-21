import {
	Bell,
	ChevronRight,
	ClipboardList,
	Droplets,
	HeartPulse,
	LogOut,
	MapPin,
	NotebookPen,
	Trees,
	Stethoscope,
	Wallet,
	Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function InputDataRT() {
	const navigate = useNavigate();

	const indicators = [
		{ label: "Kondisi ibu hamil & kepatuhan ANC", icon: HeartPulse, placeholder: "Contoh: 5 ibu hamil, 4 rutin ANC" },
		{ label: "Sanitasi", icon: ClipboardList, placeholder: "Contoh: 12 rumah layak, 3 belum layak" },
		{ label: "Akses air bersih", icon: Droplets, placeholder: "Contoh: mayoritas akses air bersih" },
		{ label: "Kondisi ekonomi keluarga", icon: Wallet, placeholder: "Contoh: 8 keluarga rentan ekonomi" },
		{ label: "Akses layanan kesehatan", icon: Stethoscope, placeholder: "Contoh: jarak posyandu 1 km" },
		{ label: "Ketersediaan pangan lokal", icon: Trees, placeholder: "Contoh: ikan jurung dan daun kelor tersedia" },
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
						<button type="button" className="active" onClick={() => navigate("/kader/input-data-rt")}>
							<NotebookPen size={16} />
							Input Data RT
							<ChevronRight size={16} />
						</button>
						<button type="button" onClick={() => navigate("/kader/data-warga")}>
							<MapPin size={16} />
							Status RT
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
						<h1>Input Data RT</h1>
						<p>Form sederhana untuk 6 indikator risiko stunting per RT.</p>
					</div>
				</section>

				<section className="kader-card kader-form-shell">
					<div className="kader-form-card">
						<div className="kader-form-title">
							<span className="kader-form-icon">6</span>
							<div>
								<h2>Data Risiko Per RT</h2>
								<p>Isi singkat, jelas, dan sesuai kondisi lapangan.</p>
							</div>
						</div>

						<div className="kader-form-grid">
							<label>
								<span>RT / Dusun</span>
								<input type="text" placeholder="Contoh: RT 05 Dusun A" />
							</label>

							{indicators.map((item) => {
								const Icon = item.icon;

								return (
									<label key={item.label}>
										<span className="kader-label-with-icon">
											<Icon size={15} /> {item.label}
										</span>
										<input type="text" placeholder={item.placeholder} />
									</label>
								);
							})}
						</div>

						<div className="kader-form-actions">
							<button type="button" className="kader-button is-secondary" onClick={() => navigate("/kader/data-warga")}>
								Lihat Status RT
							</button>
							<div className="kader-form-actions-right">
								<button type="button" className="kader-button is-secondary">
									Simpan Draft
								</button>
								<button type="button" className="kader-button is-primary">
									Kirim Data RT
									<ChevronRight size={16} />
								</button>
							</div>
						</div>
					</div>

					<div className="kader-tip-box">
						<strong>Tips Pengisian Data</strong>
						<p>Gunakan bahasa sederhana saat mencatat. Jika ragu, isi poin utama dulu lalu simpan draft untuk dilengkapi setelah kunjungan berikutnya.</p>
					</div>
				</section>
			</main>
		</section>
	);
}

export default InputDataRT;
