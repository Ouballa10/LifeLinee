import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../components/ui/Loader.jsx";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { useAuth } from "../../hooks/useAuth.js";
import { useNetworkStatus } from "../../hooks/useNetworkStatus.js";
import { isFirebaseConfigured } from "../../services/firebase.js";
import { BLOOD_GROUPS, ROUTES } from "../../utils/constants.js";

export default function Register() {
  const navigate = useNavigate();
  const { register, loginGoogle, isLoading } = useAuth();
  const { isOffline } = useNetworkStatus();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodType: "O+",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isOffline) {
      setError(
        "Connexion Internet requise. La creation de compte ne fonctionne pas en mode hors ligne."
      );
      return;
    }

    try {
      await register(form);
      navigate(ROUTES.home, { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  async function handleGoogleRegister() {
    setError("");

    if (isOffline) {
      setError(
        "Connexion Internet requise. L'authentification Google ne fonctionne pas en mode hors ligne."
      );
      return;
    }

    try {
      await loginGoogle();
      navigate(ROUTES.dashboard, { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="register-screen">
      {/* Background decorations */}
      <div className="register-bg-decorations">
        <div className="register-bg-cityscape" aria-hidden="true"></div>
        <div className="register-bg-clouds" aria-hidden="true">
          <span className="register-cloud register-cloud-1"></span>
          <span className="register-cloud register-cloud-2"></span>
        </div>
        <div className="register-bg-crosses" aria-hidden="true">
          <span className="register-cross register-cross-1">+</span>
          <span className="register-cross register-cross-2">+</span>
          <span className="register-cross register-cross-3">+</span>
        </div>
        <div className="register-bg-leaves" aria-hidden="true">
          <div className="register-leaves register-leaves-left"></div>
          <div className="register-leaves register-leaves-right"></div>
        </div>
      </div>

      {/* Logo + Title */}
      <section className="register-header">
        <div className="register-logo-wrapper">
          <img src={lifelineLogo} alt="LifeLine" className="register-logo-img" />
        </div>
        <h1 className="register-title">Creer un compte</h1>
        <p className="register-subtitle">
          Activez votre espace medical LifeLine
          <br />
          en quelques secondes.
        </p>
      </section>

      {/* Form card */}
      <section className="register-card">
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Nom complet */}
          <div className="register-field-group">
            <label className="register-field-label">Nom complet</label>
            <div className="register-field-input-wrapper">
              <span className="register-field-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21a7 7 0 0 1 14 0" />
                </svg>
              </span>
              <input
                type="text"
                name="fullName"
                placeholder="Abdelmounaim Ouballa"
                value={form.fullName}
                onChange={handleChange}
                className="register-field-input"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="register-field-group">
            <label className="register-field-label">Adresse e-mail</label>
            <div className="register-field-input-wrapper">
              <span className="register-field-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                placeholder="exemple@email.com"
                value={form.email}
                onChange={handleChange}
                className="register-field-input"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone + Blood (2 cols) */}
          <div className="register-field-row">
            <div className="register-field-group">
              <label className="register-field-label">Telephone</label>
              <div className="register-field-input-wrapper">
                <span className="register-field-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="06 12 34 56 78"
                  value={form.phone}
                  onChange={handleChange}
                  className="register-field-input"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="register-field-group">
              <label className="register-field-label">Groupe sanguin</label>
              <div className="register-field-input-wrapper">
                <span className="register-field-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z" />
                  </svg>
                </span>
                <select
                  name="bloodType"
                  value={form.bloodType}
                  onChange={handleChange}
                  className="register-field-input register-field-select"
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="register-field-group">
            <label className="register-field-label">Mot de passe</label>
            <div className="register-field-input-wrapper">
              <span className="register-field-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Au moins 6 caracteres"
                value={form.password}
                onChange={handleChange}
                className="register-field-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-field-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div className="register-field-group">
            <label className="register-field-label">Confirmer le mot de passe</label>
            <div className="register-field-input-wrapper">
              <span className="register-field-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4" />
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Repetez votre mot de passe"
                value={form.confirmPassword}
                onChange={handleChange}
                className="register-field-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-field-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {showConfirm ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="register-submit-btn"
            disabled={isLoading || isOffline}
          >
            <span>Creer mon compte</span>
            <span className="register-submit-arrow">&rarr;</span>
          </button>

          {/* Login link */}
          <div className="register-login-link">
            <span>Vous avez deja un compte ?</span>
            <Link to={ROUTES.login}>Se connecter</Link>
          </div>

          {/* Divider */}
          <div className="register-divider">
            <span>Ou continuer avec</span>
          </div>

          {/* Google */}
          <button
            type="button"
            className="register-google-btn"
            onClick={handleGoogleRegister}
            disabled={isLoading || isOffline}
          >
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.89-1.74 2.97-4.3 2.97-7.29Z" fill="#4285F4" />
                <path d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.52c-.9.6-2.04.96-3.37.96-2.59 0-4.78-1.74-5.56-4.08H3.09v2.6A9.99 9.99 0 0 0 12 22Z" fill="#34A853" />
                <path d="M6.44 13.92A5.98 5.98 0 0 1 6.13 12c0-.67.11-1.31.31-1.92V7.48H3.09A9.99 9.99 0 0 0 2 12c0 1.61.38 3.13 1.09 4.52l3.35-2.6Z" fill="#FBBC04" />
                <path d="M12 5.98c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.98 14.69 2 12 2A9.99 9.99 0 0 0 3.09 7.48l3.35 2.6c.78-2.34 2.97-4.1 5.56-4.1Z" fill="#EA4335" />
              </svg>
            </span>
            <span>Continuer avec Google</span>
          </button>

          {/* Public scan */}
          <Link to={ROUTES.scanner} className="register-scan-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <rect x="7" y="7" width="10" height="10" rx="1" />
            </svg>
            <span>Scanner un QR sans compte</span>
          </Link>
        </form>

        {!isFirebaseConfigured ? (
          <p className="register-notice">
            Activez Firebase dans `frontend/.env` pour Google.
          </p>
        ) : null}

        {isOffline ? (
          <p className="register-notice">
            Le mode hors ligne est actif. La creation de compte demande Internet.
          </p>
        ) : null}

        {error ? <p className="register-error">{error}</p> : null}
        {isLoading ? <Loader label="Creation..." /> : null}
      </section>

      {/* Footer privacy */}
      <div className="register-privacy">
        <span className="register-privacy-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </span>
        <span className="register-privacy-text">
          Vos donnees medicales sont chiffrees
          <br />
          et 100% confidentielles.
        </span>
      </div>
    </main>
  );
}
