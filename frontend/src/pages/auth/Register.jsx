import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Loader from "../../components/ui/Loader.jsx";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import heroIllustration from "../../assets/images/onboarding-hero.png";
import { useAuth } from "../../hooks/useAuth.js";
import { isFirebaseConfigured } from "../../services/firebase.js";
import { BLOOD_GROUPS, ROUTES } from "../../utils/constants.js";

export default function Register() {
  const navigate = useNavigate();
  const { register, loginGoogle, isLoading } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodType: "O+",
    password: "",
    confirmPassword: "",
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
      await register(form);
      navigate(ROUTES.home, { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  async function handleGoogleRegister() {
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
        <Card className="auth-card auth-card-register">
          <div className="auth-card-header">
            <span className="soft-badge auth-badge-blue">Inscription</span>
            <Link to={ROUTES.login} className="auth-card-link">
              Retour au login
            </Link>
          </div>

          <div className="auth-brand-block auth-brand-block-form">
            <span className="auth-logo-image-shell">
              <img src={lifelineLogo} alt="LifeLine" className="auth-logo-image" />
            </span>
            <h1 className="auth-form-title">Creer un compte</h1>
            <p className="auth-form-subtitle">Activez votre compte LifeLine.</p>
          </div>

          <Button
            type="button"
            block
            variant="ghost"
            className="auth-action-button auth-action-button-google"
            onClick={handleGoogleRegister}
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
              <strong>Creer avec Google</strong>
              <span>Inscription rapide et sans formulaire long</span>
            </span>
          </Button>

          <Link to={ROUTES.scanner} className="auth-public-scan-link">
            Scanner un QR sans compte
          </Link>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Nom complet"
              name="fullName"
              placeholder="Abdelmounaim Ouballa"
              value={form.fullName}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="abdel10@gmail.com"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Telephone"
              name="phone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              label="Groupe sanguin"
              name="bloodType"
              as="select"
              options={BLOOD_GROUPS}
              value={form.bloodType}
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
            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <Button type="submit" block className="auth-action-button auth-action-button-primary">
              Creer mon compte
            </Button>
          </form>

          {!isFirebaseConfigured ? (
            <p className="feedback auth-notice">
              Activez Firebase dans `frontend/.env` pour Google.
            </p>
          ) : null}

          {error ? <p className="feedback feedback-error">{error}</p> : null}
          {isLoading ? <Loader label="Creation..." /> : null}

          <div className="auth-footer-row">
            <span>Vous avez deja un compte ?</span>
            <Link to={ROUTES.login} className="text-link">
              Connexion
            </Link>
          </div>

          <div className="auth-illustration auth-illustration-register auth-asset-stage" aria-hidden="true">
            <img src={heroIllustration} alt="" className="auth-asset-image auth-asset-hero" />
            <span className="auth-asset-chip auth-asset-chip-left">Secure</span>
            <span className="auth-asset-chip auth-asset-chip-right">SOS</span>
          </div>
        </Card>
      </section>
    </main>
  );
}
