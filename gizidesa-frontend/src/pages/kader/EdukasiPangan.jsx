import {
	BadgeInfo,
	Bell,
	ChevronRight,
	Fish,
	Home,
	Leaf,
	LogOut,
	MapPin,
	NotebookPen,
	Sparkles,
	Sprout,
	Trees,
	ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function EdukasiPangan() {
	const navigate = useNavigate();

	const foods = [
		{
			name: "Ikan Jurung",
			subtitle: "Ikan Jurung",
			category: "Protein Hewani",
			icon: Fish,
			tags: ["Protein tinggi", "Omega-3", "Vitamin D"],
			price: "Rp 25.000/kg",
			availability: "Mudah & Murah",
			recipe: "Arsik ikan jurung dengan andaliman dan daun kunyit",
			sustainability: "Ikan lokal dari Danau Toba, mendukung ekonomi nelayan lokal",
			benefit: "Membantu pertumbuhan otak janin dan balita.",
		},
		{
			name: "Ikan Mas",
			subtitle: "Ikan Mas",
			category: "Protein Hewani",
			icon: Fish,
			tags: ["Protein", "Omega-3", "Vitamin B12"],
			price: "Rp 35.000/kg",
			availability: "Mudah",
			recipe: "Ikan mas kuah kuning dengan daun kemangi",
			sustainability: "Budidaya lokal berkelanjutan",
			benefit: "Protein mudah dicerna, baik untuk ibu hamil dan balita.",
		},
		{
			name: "Daun Kelor",
			subtitle: "Daun Kelor",
			category: "Sayuran Hijau",
			icon: Leaf,
			tags: ["Zat besi tinggi", "Kalsium", "Vitamin A"],
			price: "Gratis - Rp 5.000/ikat",
			availability: "Sangat Mudah",
			recipe: "Sayur bening daun kelor dengan jagung manis",
			sustainability: "Tanaman lokal yang mudah tumbuh dan tidak perlu pestisida",
			benefit: "Membantu cegah anemia dan menjaga kualitas ASI.",
		},
		{
			name: "Andaliman",
			subtitle: "Andaliman",
			category: "Bumbu Lokal",
			icon: Sparkles,
			tags: ["Antioksidan", "Vitamin C", "Mineral"],
			price: "Rp 10.000/ons",
			availability: "Cukup Mudah",
			recipe: "Bumbu arsik, sambal andaliman",
			sustainability: "Rempah khas Batak yang tumbuh liar di pegunungan",
			benefit: "Meningkatkan nafsu makan dan membantu pencernaan.",
		},
		{
			name: "Sayur Kubis Lokal",
			subtitle: "Kobis",
			category: "Sayuran",
			icon: Trees,
			tags: ["Serat", "Vitamin K", "Folat"],
			price: "Rp 8.000/kg",
			availability: "Mudah & Murah",
			recipe: "Tumis kubis dengan wortel dan sosis",
			sustainability: "Budidaya lokal di dataran tinggi Toba",
			benefit: "Mendukung pencernaan ibu hamil dan mencegah cacat lahir.",
		},
		{
			name: "Taoge Kacang Hijau",
			subtitle: "Taoge",
			category: "Sayuran",
			icon: Sprout,
			tags: ["Asam folat tinggi", "Vitamin C", "Protein nabati"],
			price: "Rp 5.000/kg",
			availability: "Sangat Mudah",
			recipe: "Tumis taoge dengan tempe atau capcay taoge",
			sustainability: "Mudah diproduksi di rumah dari kacang hijau lokal",
			benefit: "Cocok untuk kebutuhan gizi ibu hamil dan balita.",
		},
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
							Status RT
						</button>
						<button type="button" className="active" onClick={() => navigate("/kader/edukasi-pangan")}>
							<MapPin size={16} />
							Panduan Pangan
							<ChevronRight size={16} />
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
						<h1>Pangan Bergizi Lokal</h1>
						<p>Makanan bergizi dari sumber lokal untuk mendukung ibu hamil dan balita.</p>
					</div>
				</section>

				<section className="kader-feature-banner">
					<div className="kader-feature-icon">
						<BadgeInfo size={18} />
					</div>
					<div>
						<h2>Gizi Baik dari Pangan Lokal</h2>
						<p>
							Makanan bergizi tidak harus mahal dan dari luar daerah. Danau Toba dan sekitarnya punya bahan pangan lokal yang kaya nutrisi, mudah didapat, dan terjangkau.
						</p>
					</div>
				</section>

				<section className="kader-food-grid">
					{foods.map((food) => {
						const Icon = food.icon;

						return (
							<article key={food.name} className="kader-food-card">
								<div className="kader-food-header">
									<div className="kader-food-visual">
										<Icon size={34} />
										<strong>{food.name}</strong>
										<span>{food.subtitle}</span>
									</div>
									<span className="kader-food-badge">{food.category}</span>
								</div>

								<div className="kader-food-body">
									<div className="kader-food-section">
										<strong>Kandungan Gizi</strong>
										<div className="kader-pill-list">
											{food.tags.map((tag) => (
												<span key={tag}>{tag}</span>
											))}
										</div>
									</div>

									<div className="kader-food-meta-grid">
										<div>
											<small>Harga</small>
											<strong>{food.price}</strong>
										</div>
										<div>
											<small>Ketersediaan</small>
											<strong>{food.availability}</strong>
										</div>
									</div>

									<div className="kader-food-section">
										<strong>Manfaat untuk Ibu & Anak</strong>
										<p>{food.benefit}</p>
									</div>

									<div className="kader-info-note">
										<strong>Ide Resep</strong>
										<p>{food.recipe}</p>
									</div>

									<div className="kader-info-note is-green">
										<strong>Keberlanjutan</strong>
										<p>{food.sustainability}</p>
									</div>
								</div>
							</article>
						);
					})}
				</section>

				<section className="kader-download-card">
					<h2>Butuh Resep Lebih Lengkap?</h2>
					<p>Dapatkan buku resep makanan bergizi untuk ibu hamil dan balita menggunakan bahan pangan lokal Danau Toba.</p>
					<button type="button" className="kader-button is-primary">
						Download Buku Resep Gratis
						<ChevronRight size={16} />
					</button>
				</section>
			</main>
		</section>
	);
}

export default EdukasiPangan;
