import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { isFirebaseConfigured } from "../../services/firebase.js";
import { ROUTES } from "../../utils/constants.js";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginGoogle, isLoading, user } = useAuth();
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
    <main className="screen">
      <section className="auth-shell">
        <Card className="auth-panel auth-panel-featured">
          <div className="auth-topbar">
            <span className="soft-badge">Connexion</span>
            <div className="menu-button" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <h1 className="auth-title">Bienvenue sur LifeLine</h1>
          <p className="section-copy">
            Votre application medicale d'urgence.
          </p>

          <div className="auth-visual">
            <div className="illustration-stage">
              <div className="illustration-circle"></div>
              <div className="illustration-card illustration-card-large"></div>
              <div className="illustration-card illustration-card-small"></div>
              <div className="illustration-plus">+</div>
            </div>

            <div className="visual-shortcuts">
              <span className="shortcut-pill">Generer QR</span>
              <span className="shortcut-pill">Scanner QR</span>
              <span className="shortcut-pill shortcut-pill-alert">Urgence rapide</span>
            </div>
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
              placeholder="Entrez votre mot de passe"
              value={form.password}
              onChange={handleChange}
              error={error}
            />

            <div className="forgot-row">
              <span className="helper-text">Acces securise</span>
              <Link to={ROUTES.register} className="text-link">
                Mot de passe oublie?
              </Link>
            </div>

            <Button type="submit" block disabled={isLoading}>
              Connexion
            </Button>

            <Button
              type="button"
              block
              variant="secondary"
              className="google-login-button"
              onClick={handleGoogleLogin}
              disabled={isLoading || !isFirebaseConfigured}
            >
              Se connecter avec Google
            </Button>
          </form>

          {!isFirebaseConfigured ? (
            <p className="feedback">
              Activez d'abord Firebase dans `frontend/.env` pour utiliser Google.
            </p>
          ) : null}

          {error ? <p className="feedback feedback-error">{error}</p> : null}
          {isLoading ? <Loader label="Verification du compte..." /> : null}

          {user ? (
            <div className="connected-user-card">
              <strong>Utilisateur connecte</strong>
              <span>{user.fullName}</span>
              <span>{user.email}</span>
            </div>
          ) : null}

          <div className="helper-row">
            <span className="helper-text">Vous n'avez pas de compte ?</span>
            <Link to={ROUTES.register} className="text-link">
              Inscription
            </Link>
          </div>
          <Link to={ROUTES.splash} className="text-link text-link-subtle">
            Retour a l'accueil
          </Link>

          <div className="auth-tips">
            <span className="auth-tip">Au moins 6 caracteres</span>
            <span className="auth-tip">Une majuscule conseillee</span>
            <span className="auth-tip">Un symbole special utile</span>
          </div>
        </Card>
      </section>
    </main>
  );
}
