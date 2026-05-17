import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../components/ui/Loader.jsx";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { useAuth } from "../../hooks/useAuth.js";
import { useNetworkStatus } from "../../hooks/useNetworkStatus.js";
import { isFirebaseConfigured } from "../../services/firebase.js";
import { ROUTES } from "../../utils/constants.js";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginGoogle, isLoading } = useAuth();
  const { isOffline } = useNetworkStatus();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
        "Connexion Internet requise. L'authentification ne fonctionne pas en mode hors ligne."
      );
      return;
    }

    try {
      await login(form);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  async function handleGoogleLogin() {
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
    <main className="aurora-screen">
      {/* Animated mesh background */}
      <div className="aurora-bg" aria-hidden="true">
        <span className="aurora-blob aurora-blob-1"></span>
        <span className="aurora-blob aurora-blob-2"></span>
        <span className="aurora-blob aurora-blob-3"></span>
        <span className="aurora-dots"></span>
      </div>

      {/* Logo + Title */}
      <section className="aurora-header">
        <div className="aurora-logo-wrapper">
          <img src={lifelineLogo} alt="LifeLine" className="aurora-logo-img" />
        </div>
        <h1 className="aurora-title">Bon retour</h1>
        <p className="aurora-subtitle">
          Connectez-vous a votre espace medical
          <br />
          en toute securite.
        </p>
      </section>

      {/* Form card */}
      <section className="aurora-card">
        <form className="aurora-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="aurora-field-group">
            <label className="aurora-field-label">Adresse e-mail</label>
            <div className="aurora-field-input-wrapper">
              <span className="aurora-field-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
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
                className="aurora-field-input"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="aurora-field-group">
            <label className="aurora-field-label">Mot de passe</label>
            <div className="aurora-field-input-wrapper">
              <span className="aurora-field-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Votre mot de passe"
                value={form.password}
                onChange={handleChange}
                className="aurora-field-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="aurora-field-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
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
            <div className="aurora-field-extras">
              <Link to="/forgot-password" className="aurora-forgot-link">
                Mot de passe oublie ?
              </Link>
            </div>
          </div>

          {/* Remember me */}
          <label className="aurora-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="aurora-remember-checkbox"
            />
            <span className="aurora-remember-checkmark">
              {rememberMe && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="aurora-remember-text">Se souvenir de moi</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="aurora-submit-btn"
            disabled={isLoading || isOffline}
          >
            <span>Se connecter</span>
            <span className="aurora-submit-arrow">&rarr;</span>
          </button>

          {/* Create account */}
          <div className="aurora-bottom-link">
            <span>Vous n'avez pas de compte ?</span>
            <Link to={ROUTES.register}>Creer un compte</Link>
          </div>

          {/* Divider */}
          <div className="aurora-divider">
            <span>Ou continuer avec</span>
          </div>

          {/* Google */}
          <button
            type="button"
            className="aurora-google-btn"
            onClick={handleGoogleLogin}
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
          <Link to={ROUTES.scanner} className="aurora-scan-link">
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
          <p className="aurora-notice">
            Activez Firebase dans `frontend/.env` pour Google.
          </p>
        ) : null}

        {isOffline ? (
          <p className="aurora-notice">
            Mode hors ligne actif. La connexion demande Internet.
          </p>
        ) : null}

        {error ? <p className="aurora-error">{error}</p> : null}
        {isLoading ? <Loader label="Connexion..." /> : null}
      </section>

      {/* Privacy footer */}
      <div className="aurora-privacy">
        <span className="aurora-privacy-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </span>
        <span className="aurora-privacy-text">
          Vos donnees sont chiffrees
          <br />
          et 100% confidentielles.
        </span>
      </div>
    </main>
  );
}
