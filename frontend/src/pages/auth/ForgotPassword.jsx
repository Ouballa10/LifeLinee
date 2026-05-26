import { useState } from "react";
import { Link } from "react-router-dom";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { auth, isFirebaseConfigured } from "../../services/firebase.js";
import { ROUTES } from "../../utils/constants.js";
import "../../styles/login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Veuillez entrer votre adresse e-mail.");
      return;
    }

    setLoading(true);

    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("Aucun compte trouvé avec cet e-mail.");
      } else if (err.code === "auth/invalid-email") {
        setError("Adresse e-mail invalide.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Trop de tentatives. Réessayez plus tard.");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="login-screen">
        <section className="login-header">
          <div className="login-logo-wrapper">
            <img src={lifelineLogo} alt="LifeLine" className="login-logo-img" />
          </div>
          <h1 className="login-title">Email envoyé ✓</h1>
          <p className="login-subtitle">
            Un lien de réinitialisation a été envoyé à<br />
            <strong>{email}</strong>
          </p>
        </section>

        <section className="login-card">
          <div className="forgot-success">
            <span className="forgot-success-icon">📧</span>
            <p>Vérifiez votre boîte de réception (et les spams) puis cliquez sur le lien pour créer un nouveau mot de passe.</p>
          </div>
          <Link to={ROUTES.login} className="login-submit-btn" style={{ textDecoration: "none", textAlign: "center", display: "block" }}>
            ← Retour à la connexion
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="login-screen">
      <section className="login-header">
        <div className="login-logo-wrapper">
          <img src={lifelineLogo} alt="LifeLine" className="login-logo-img" />
        </div>
        <h1 className="login-title">Mot de passe oublié</h1>
        <p className="login-subtitle">
          Entrez votre e-mail et nous vous enverrons<br />un lien de réinitialisation.
        </p>
      </section>

      <section className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
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
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-field-input"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            <span>{loading ? "Envoi en cours..." : "Envoyer le lien"}</span>
            <span className="login-submit-arrow">→</span>
          </button>

          <div className="login-create-account">
            <Link to={ROUTES.login} className="login-create-link">
              ← Retour à la connexion
            </Link>
          </div>
        </form>

        {error && <p className="login-error">{error}</p>}
      </section>
    </main>
  );
}
