import {
	Bell,
	ChevronLeft,
	ChevronRight,
	House,
	LogOut,
	NotebookPen,
	ShieldCheck,
	Syringe,
	Trees,
	Waves,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function InputDataRT() {
	const navigate = useNavigate();

	const steps = [
		{ label: "Kesehatan Ibu", icon: ShieldCheck, active: true },
		{ label: "Sanitasi", icon: House },
		{ label: "Air Bersih", icon: Waves },
		{ label: "Ekonomi", icon: NotebookPen },
		{ label: "Akses Kesehatan", icon: Syringe },
		{ label: "Pangan Lokal", icon: Trees },
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
							<House size={16} />
							Dashboard
						</button>
						<button type="button" className="active" onClick={() => navigate("/kader/input-data-rt")}>
							<NotebookPen size={16} />
							Input Data RT
							<ChevronRight size={16} />
						</button>
						<button type="button" onClick={() => navigate("/kader/data-warga")}>
							<NotebookPen size={16} />
							Tugas Saya
						</button>
						<button type="button" onClick={() => navigate("/kader/peta-risiko")}>
							<NotebookPen size={16} />
							Peta Risiko
						</button>
						<button type="button" onClick={() => navigate("/kader/edukasi-pangan")}>
							<NotebookPen size={16} />
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
						<h1>Input Data RT</h1>
						<p>Lengkapi data kesehatan dan kondisi RT secara bertahap.</p>
					</div>
				</section>

				<section className="kader-card kader-form-shell">
					<div className="kader-progress-head">
						<span>Langkah 1 dari 6</span>
						<small>17% selesai</small>
					</div>
					<div className="kader-progress-bar">
						<span />
					</div>

					<div className="kader-step-list">
						{steps.map((step) => {
							const Icon = step.icon;

							return (
								<div key={step.label} className={step.active ? "kader-step active" : "kader-step"}>
									<Icon size={18} />
									<span>{step.label}</span>
								</div>
							);
						})}
					</div>

					<div className="kader-form-card">
						<div className="kader-form-title">
							<span className="kader-form-icon">❤</span>
							<div>
								<h2>Kesehatan Ibu</h2>
								<p>Isi informasi terkait kesehatan ibu</p>
							</div>
						</div>

						<div className="kader-form-grid">
							<label>
								<span>Jumlah ibu hamil</span>
								<input type="text" placeholder="Masukkan jumlah ibu hamil" />
							</label>
							<label>
								<span>Rutin periksa ANC</span>
								<input type="text" placeholder="Ya / Tidak" />
							</label>
							<label>
								<span>Konsumsi tablet Fe</span>
								<input type="text" placeholder="Masukkan keterangan" />
							</label>
							<label>
								<span>Status gizi ibu hamil</span>
								<input type="text" placeholder="Masukkan status gizi" />
							</label>
						</div>

						<div className="kader-form-actions">
							<button type="button" className="kader-button is-secondary" onClick={() => navigate("/kader/dashboard")}>
								<ChevronLeft size={16} />
								Sebelumnya
							</button>
							<div className="kader-form-actions-right">
								<button type="button" className="kader-button is-secondary">
									Simpan Draft
								</button>
								<button type="button" className="kader-button is-primary">
									Selanjutnya
									<ChevronRight size={16} />
								</button>
							</div>
						</div>
					</div>

					<div className="kader-tip-box">
						<strong>Tips Pengisian Data</strong>
						<p>Data yang Anda masukkan akan digunakan untuk menghitung skor risiko stunting (IRS). Pastikan informasi yang diberikan akurat. Anda bisa menyimpan draft dan melanjutkan nanti.</p>
					</div>
				</section>
			</main>
		</section>
	);
}

export default InputDataRT;
