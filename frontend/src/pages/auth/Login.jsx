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
      setError("Connexion Internet requise. L'authentification LifeLine ne fonctionne pas en mode hors ligne.");
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
      setError("Connexion Internet requise. L'authentification Google ne fonctionne pas en mode hors ligne.");
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
    <main className="login-screen">
      {/* Background decorations */}
      <div className="login-bg-decorations">
        <div className="login-bg-cityscape" aria-hidden="true"></div>
        <div className="login-bg-clouds" aria-hidden="true">
          <span className="login-cloud login-cloud-1"></span>
          <span className="login-cloud login-cloud-2"></span>
          <span className="login-cloud login-cloud-3"></span>
        </div>
        <div className="login-bg-crosses" aria-hidden="true">
          <span className="login-cross login-cross-1">+</span>
          <span className="login-cross login-cross-2">+</span>
          <span className="login-cross login-cross-3">+</span>
          <span className="login-cross login-cross-4">+</span>
        </div>
        <div className="login-bg-dots" aria-hidden="true">
          <span className="login-dots-grid"></span>
        </div>
        <div className="login-bg-leaves" aria-hidden="true">
          <div className="login-leaves login-leaves-left"></div>
          <div className="login-leaves login-leaves-right"></div>
        </div>
      </div>

      {/* Logo section */}
      <section className="login-header">
        <div className="login-logo-wrapper">
          <img src={lifelineLogo} alt="LifeLine" className="login-logo-img" />
        </div>
        <h1 className="login-title">Connectez-vous</h1>
        <p className="login-subtitle">
          Accédez à votre espace médical<br />simplement et en toute sécurité.
        </p>
      </section>

      {/* Form card */}
      <section className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="login-field-group">
            <label className="login-field-label">Adresse e-mail</label>
            <div className="login-field-input-wrapper">
              <span className="login-field-icon" aria-hidden="true">
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
                className="login-field-input"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="login-field-group">
            <label className="login-field-label">Mot de passe</label>
            <div className="login-field-input-wrapper">
              <span className="login-field-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                className="login-field-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-field-toggle"
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
            <div className="login-field-extras">
              <Link to="/forgot-password" className="login-forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          {/* Remember me */}
          <label className="login-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="login-remember-checkbox"
            />
            <span className="login-remember-checkmark">
              {rememberMe && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="login-remember-text">Se souvenir de moi</span>
          </label>

          {/* Submit button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading || isOffline}
          >
            <span>Se connecter</span>
            <span className="login-submit-arrow">&rarr;</span>
          </button>

          {/* Create account link */}
          <div className="login-create-account">
            <span>Vous n'avez pas de compte ?</span>
            <Link to={ROUTES.register} className="login-create-link">
              Créer un compte
            </Link>
          </div>

          {/* Divider */}
          <div className="login-divider">
            <span>Ou continuer avec</span>
          </div>

          {/* Google button */}
          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading || isOffline}
          >
            <span className="login-google-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.89-1.74 2.97-4.3 2.97-7.29Z" fill="#4285F4" />
                <path d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.52c-.9.6-2.04.96-3.37.96-2.59 0-4.78-1.74-5.56-4.08H3.09v2.6A9.99 9.99 0 0 0 12 22Z" fill="#34A853" />
                <path d="M6.44 13.92A5.98 5.98 0 0 1 6.13 12c0-.67.11-1.31.31-1.92V7.48H3.09A9.99 9.99 0 0 0 2 12c0 1.61.38 3.13 1.09 4.52l3.35-2.6Z" fill="#FBBC04" />
                <path d="M12 5.98c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.98 14.69 2 12 2A9.99 9.99 0 0 0 3.09 7.48l3.35 2.6c.78-2.34 2.97-4.1 5.56-4.1Z" fill="#EA4335" />
              </svg>
            </span>
            <span>Continuer avec Google</span>
          </button>
        </form>

        {/* Error / notices */}
        {!isFirebaseConfigured ? (
          <p className="login-notice">
            Activez Firebase dans `frontend/.env` pour Google.
          </p>
        ) : null}

        {isOffline ? (
          <p className="login-notice">
            Le mode hors ligne est actif. La connexion demande Internet.
          </p>
        ) : null}

        {error ? <p className="login-error">{error}</p> : null}
        {isLoading ? <Loader label="Connexion..." /> : null}
      </section>

      {/* Footer privacy note */}
      <div className="login-privacy">
        <span className="login-privacy-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </span>
        <span className="login-privacy-text">
          Vos données sont protégées<br />et confidentielles.
        </span>
      </div>
    </main>
  );
}
