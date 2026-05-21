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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberRole, setRememberRole] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roles = [
    {
      key: "admin_desa",
      title: "Admin Desa",
      subtitle: "Kelola wilayah & laporan",
      icon: ShieldCheck,
      email: "admin@gizidesa.test",
    },
    {
      key: "kader_posyandu",
      title: "Kader Posyandu",
      subtitle: "Input data risiko",
      icon: UsersRound,
      email: "kader@gizidesa.test",
    },
    {
      key: "bidan_desa",
      title: "Bidan Desa",
      subtitle: "Pantau & tindak lanjut",
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

      const response = await loginUser({ email, password });

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

        {/* ── LEFT PANEL ── */}
        <aside className="login-left-panel">
          <button className="login-back-button" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            Kembali ke Beranda
          </button>

          <div className="login-left-content">
            <span>Platform Kesehatan Desa</span>
            <h1>Masuk untuk mengelola data risiko stunting berbasis wilayah.</h1>
            <p>
              GiziDesa membantu kader, bidan, dan admin desa bekerja sesuai
              perannya, mulai dari input data risiko, perhitungan IRS,
              pemantauan intervensi, sampai laporan program desa.
            </p>
          </div>

          <div className="login-brand">
            <span><Leaf size={28} /></span>
            <strong>GiziDesa</strong>
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <section className="login-form-panel">
          <div className="login-form-header">
            <span><UserRound size={25} /></span>
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
                  <span className="login-role-icon">
                    <Icon size={20} />
                  </span>
                  <div className="login-role-text">
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
                  onClick={() => setShowPassword((v) => !v)}
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
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>
        </section>
      </section>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #fff8e1 100%);
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .login-shell {
          display: flex;
          width: 100%;
          max-width: 1080px;
          height: 100vh;
          max-height: 680px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.13);
          margin: 0 20px;
        }

        /* ── LEFT PANEL ── */
        .login-left-panel {
          width: 40%;
          min-width: 280px;
          background: linear-gradient(160deg, #1b5e20 0%, #2e7d32 55%, #388e3c 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 28px 32px;
          position: relative;
          overflow: hidden;
          justify-content: space-between;
        }
        .login-left-panel::before {
          content: '';
          position: absolute;
          bottom: -80px; right: -60px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .login-left-panel::after {
          content: '';
          position: absolute;
          top: -50px; left: -70px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }

        .login-back-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.15);
          border: none;
          border-radius: 20px;
          color: #fff;
          font-size: 12.5px;
          font-weight: 500;
          padding: 6px 13px;
          cursor: pointer;
          width: fit-content;
          transition: background 0.2s;
        }
        .login-back-button:hover { background: rgba(255,255,255,0.25); }

        .login-left-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 28px;
        }
        .login-left-content > span {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
        }
        .login-left-content h1 {
          font-size: 24px;
          font-weight: 800;
          line-height: 1.32;
        }
        .login-left-content p {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.76);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.15);
        }
        .login-brand span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.18);
          border-radius: 12px;
        }
        .login-brand strong {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        /* ── RIGHT PANEL ── */
        .login-form-panel {
          flex: 1;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 32px 44px;
          overflow: hidden;
        }

        .login-form-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .login-form-header > span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px; height: 50px;
          background: #e8f5e9;
          border-radius: 50%;
          color: #2e7d32;
          margin-bottom: 8px;
        }
        .login-form-header h2 {
          font-size: 21px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 3px;
        }
        .login-form-header p {
          font-size: 13px;
          color: #777;
        }

        .login-role-list {
          display: flex;
          flex-direction: row;
          gap: 10px;
          margin-bottom: 18px;
        }
        .login-role-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 14px 8px 12px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        .login-role-card:hover {
          border-color: #4caf50;
          background: #f1f8f1;
        }
        .login-role-card.active {
          border-color: #2e7d32;
          background: #e8f5e9;
          box-shadow: 0 0 0 3px rgba(46,125,50,0.12);
        }
        .login-role-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          border-radius: 10px;
          background: #e8f5e9;
          color: #2e7d32;
          flex-shrink: 0;
        }
        .login-role-card.active .login-role-icon {
          background: #2e7d32;
          color: #fff;
        }
        .login-role-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .login-role-text strong {
          font-size: 11.5px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.25;
        }
        .login-role-text small {
          font-size: 10px;
          color: #888;
          line-height: 1.3;
        }

        .login-error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 9px 13px;
          margin-bottom: 13px;
          color: #b91c1c;
          font-size: 12.5px;
        }
        .login-error strong { display: block; margin-bottom: 2px; }
        .login-error p { margin: 0; }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .login-form label {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .login-form label > span {
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }
        .login-input {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          padding: 10px 13px;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fff;
        }
        .login-input:focus-within {
          border-color: #2e7d32;
          box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
        }
        .login-input svg { color: #999; flex-shrink: 0; }
        .login-input input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          color: #1a1a1a;
          background: transparent;
        }
        .login-input input::placeholder { color: #bbb; }

        .login-password-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .login-password-toggle:hover { color: #2e7d32; }

        .login-options {
          display: flex;
          align-items: center;
        }
        .login-remember {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #555;
          cursor: pointer;
        }
        .login-remember input[type="checkbox"] {
          accent-color: #2e7d32;
          width: 15px; height: 15px;
          cursor: pointer;
        }

        .login-submit {
          width: 100%;
          padding: 13px;
          background: #2e7d32;
          color: #fff;
          font-size: 14.5px;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.2px;
          margin-top: 2px;
        }
        .login-submit:hover:not(:disabled) { background: #1b5e20; }
        .login-submit:active:not(:disabled) { transform: scale(0.99); }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 700px) {
          .login-page { align-items: flex-start; }
          .login-shell {
            flex-direction: column;
            max-height: none;
            height: auto;
            min-height: 100vh;
            margin: 0;
            border-radius: 0;
          }
          .login-left-panel { width: 100%; padding: 22px; }
          .login-left-content h1 { font-size: 19px; }
          .login-form-panel { padding: 24px 20px; overflow-y: auto; }
          .login-role-text strong { font-size: 10.5px; }
          .login-role-text small { font-size: 9px; }
        }
      `}</style>
    </main>
  );
}

export default Login;