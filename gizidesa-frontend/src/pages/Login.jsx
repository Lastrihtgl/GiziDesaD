import {
  ArrowLeft,
  Eye,
  EyeOff,
  HeartPulse,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { saveAuthData } from "../utils/authStorage";

function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("admin_desa");
  const [email, setEmail] = useState("admin@gizidesa.test");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberRole, setRememberRole] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roles = [
    {
      key: "admin_desa",
      title: "Admin Desa",
      subtitle: "Kelola wilayah, pangan lokal, intervensi, dan laporan",
      icon: ShieldCheck,
      email: "admin@gizidesa.test",
    },
    {
      key: "kader_posyandu",
      title: "Kader Posyandu",
      subtitle: "Input data risiko dan lihat panduan pangan lokal",
      icon: UsersRound,
      email: "kader@gizidesa.test",
    },
    {
      key: "bidan_desa",
      title: "Bidan Desa",
      subtitle: "Pantau risiko dan catat tindak lanjut kesehatan",
      icon: HeartPulse,
      email: "bidan@gizidesa.test",
    },
  ];

  const handleRoleClick = (role) => {
    setSelectedRole(role.key);
    setEmail(role.email);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await loginUser({
        email,
        password,
      });

      const token = response.token;
      const user = response.user || response.data?.user;

      if (!token || !user) {
        setErrorMessage("Response login tidak lengkap. Token atau data user tidak ditemukan.");
        return;
      }

      if (user.role !== selectedRole) {
        setErrorMessage(
          `Role yang dipilih tidak sesuai. Akun ini terdaftar sebagai ${user.role}.`
        );
        return;
      }

      saveAuthData(token, user);

      if (rememberRole) {
        localStorage.setItem("gizidesa_remember_role", selectedRole);
      } else {
        localStorage.removeItem("gizidesa_remember_role");
      }

      if (user.role === "admin_desa") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (user.role === "bidan_desa") {
        navigate("/bidan/dashboard", { replace: true });
        return;
      }

      if (user.role === "kader_posyandu") {
        navigate("/kader/dashboard", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Login gagal. Pastikan email, password, dan backend sudah berjalan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <aside className="login-left-panel">
          <button className="login-back-button" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            Kembali ke Beranda
          </button>

          <div className="login-brand">
            <span>
              <Leaf size={28} />
            </span>
            <strong>GiziDesa</strong>
          </div>

          <div className="login-left-content">
            <span>Platform Kesehatan Desa</span>
            <h1>Masuk untuk mengelola data risiko stunting berbasis wilayah.</h1>
            <p>
              GiziDesa membantu kader, bidan, dan admin desa bekerja sesuai
              perannya, mulai dari input data risiko, perhitungan IRS,
              pemantauan intervensi, sampai laporan program desa.
            </p>
          </div>

          <div className="login-flow-list">
            <div>
              <strong>01</strong>
              <p>Data risiko dicatat per RT/dusun.</p>
            </div>
            <div>
              <strong>02</strong>
              <p>IRS membantu menentukan wilayah prioritas.</p>
            </div>
            <div>
              <strong>03</strong>
              <p>Intervensi dicatat sebagai tindak lanjut.</p>
            </div>
          </div>
        </aside>

        <section className="login-form-panel">
          <div className="login-form-header">
            <span>
              <UserRound size={25} />
            </span>
            <h2>Masuk ke Sistem</h2>
            <p>Pilih peran Anda, lalu masukkan email dan password.</p>
          </div>

          <div className="login-role-list">
            {roles.map((role) => {
              const Icon = role.icon;
              const active = selectedRole === role.key;

              return (
                <button
                  key={role.key}
                  type="button"
                  className={active ? "login-role-card active" : "login-role-card"}
                  onClick={() => handleRoleClick(role)}
                >
                  <span>
                    <Icon size={22} />
                  </span>

                  <div>
                    <strong>{role.title}</strong>
                    <small>{role.subtitle}</small>
                  </div>
                </button>
              );
            })}
          </div>

          {errorMessage && (
            <div className="login-error">
              <strong>Login gagal</strong>
              <p>{errorMessage}</p>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <div className="login-input">
                <Mail size={19} />
                <input
                  type="email"
                  value={email}
                  placeholder="Masukkan email"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="login-input">
                <Lock size={19} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Masukkan password"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberRole}
                  onChange={(event) => setRememberRole(event.target.checked)}
                />
                <span>Ingat role</span>
              </label>

              <small>Akun uji tersedia dari seeder</small>
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <div className="login-test-account">
            <strong>Akun uji</strong>
            <p>Admin: admin@gizidesa.test / password123</p>
            <p>Kader: kader@gizidesa.test / password123</p>
            <p>Bidan: bidan@gizidesa.test / password123</p>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Login;