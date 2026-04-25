import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Loader from "../../components/ui/Loader.jsx";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import onboardingPhoneIllustration from "../../assets/images/onboarding-phone.png";
import { useAuth } from "../../hooks/useAuth.js";
import { isFirebaseConfigured } from "../../services/firebase.js";
import { ROUTES } from "../../utils/constants.js";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginGoogle, isLoading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
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

    try {
      await login(form);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  async function handleGoogleLogin() {
    setError("");

    try {
      await loginGoogle();
      navigate(ROUTES.dashboard, { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="screen auth-screen">
      <section className="auth-shell auth-shell-compact">
        <Card className="auth-card auth-card-login">
          <div className="auth-card-header">
            <span className="soft-badge auth-badge-blue">Connexion</span>
            <Link to={ROUTES.splash} className="auth-card-link">
              Retour
            </Link>
          </div>

          <div className="auth-brand-block auth-brand-block-form">
            <span className="auth-logo-image-shell">
              <img src={lifelineLogo} alt="LifeLine" className="auth-logo-image" />
            </span>
            <h1 className="auth-form-title">Connexion</h1>
            <p className="auth-form-subtitle">Connectez-vous a votre espace LifeLine.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="abdel10@gmail.com"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Mot de passe"
              name="password"
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
            />

            <Button type="submit" block className="auth-action-button auth-action-button-primary">
              Se connecter
            </Button>

            <div className="auth-divider">
              <span>ou</span>
            </div>

            <Button
              type="button"
              block
              variant="ghost"
              className="auth-action-button auth-action-button-google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <span className="google-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.89-1.74 2.97-4.3 2.97-7.29Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.52c-.9.6-2.04.96-3.37.96-2.59 0-4.78-1.74-5.56-4.08H3.09v2.6A9.99 9.99 0 0 0 12 22Z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.44 13.92A5.98 5.98 0 0 1 6.13 12c0-.67.11-1.31.31-1.92V7.48H3.09A9.99 9.99 0 0 0 2 12c0 1.61.38 3.13 1.09 4.52l3.35-2.6Z"
                    fill="#FBBC04"
                  />
                  <path
                    d="M12 5.98c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.98 14.69 2 12 2A9.99 9.99 0 0 0 3.09 7.48l3.35 2.6c.78-2.34 2.97-4.1 5.56-4.1Z"
                    fill="#EA4335"
                  />
                </svg>
              </span>
              <span className="google-copy">
                <strong>Connexion avec Google</strong>
                <span>Acces rapide avec votre compte Google</span>
              </span>
            </Button>

            <Link to={ROUTES.scanner} className="auth-public-scan-link">
              Scanner un QR sans compte
            </Link>
          </form>

          {!isFirebaseConfigured ? (
            <p className="feedback auth-notice">
              Activez Firebase dans `frontend/.env` pour Google.
            </p>
          ) : null}

          {error ? <p className="feedback feedback-error">{error}</p> : null}
          {isLoading ? <Loader label="Connexion..." /> : null}

          <div className="auth-footer-row">
            <span>Vous n'avez pas de compte ?</span>
            <Link to={ROUTES.register} className="text-link">
              Inscription
            </Link>
          </div>

          <div className="auth-illustration auth-illustration-login auth-asset-stage" aria-hidden="true">
            <img
              src={onboardingPhoneIllustration}
              alt=""
              className="auth-asset-image auth-asset-phone"
            />
            <span className="auth-asset-chip auth-asset-chip-left">QR</span>
            <span className="auth-asset-chip auth-asset-chip-right">24/7</span>
          </div>
        </Card>
      </section>
    </main>
  );
}
