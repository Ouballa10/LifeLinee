import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants.js";

export default function Splash() {
  return (
    <main className="screen auth-screen auth-screen-splash">
      <section className="auth-shell auth-shell-compact">
        <div className="auth-splash-card">
          <div className="auth-splash-floating" aria-hidden="true">
            <span className="auth-splash-float auth-splash-float-left">+</span>
            <span className="auth-splash-float auth-splash-float-right">+</span>
          </div>

          <div className="auth-brand-block auth-brand-block-splash">
            <span className="auth-logo-mark">+</span>
            <h1 className="auth-brand-title">LifeLine</h1>
            <p className="auth-brand-subtitle">
              Vos informations medicales
              <br />
              en cas d'urgence
            </p>
          </div>

          <div className="auth-illustration auth-illustration-splash" aria-hidden="true">
            <div className="auth-illustration-wave auth-illustration-wave-back"></div>
            <div className="auth-illustration-wave auth-illustration-wave-front"></div>
            <div className="auth-illustration-phone">
              <div className="auth-phone-screen">
                <div className="auth-phone-qr-grid">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <span
                      key={index}
                      className={`auth-phone-qr-cell ${
                        index % 2 === 0 || index % 5 === 0 ? "is-active" : ""
                      }`}
                    ></span>
                  ))}
                </div>
              </div>
            </div>
            <div className="auth-illustration-card auth-illustration-card-left"></div>
            <div className="auth-illustration-card auth-illustration-card-right"></div>
            <div className="auth-illustration-badge auth-illustration-badge-heart">+</div>
            <div className="auth-illustration-badge auth-illustration-badge-shield">✓</div>
          </div>

          <p className="auth-splash-tagline">Rapide • Securise • Toujours a portee</p>

          <div className="auth-splash-dots" aria-hidden="true">
            <span className="auth-splash-dot is-active"></span>
            <span className="auth-splash-dot"></span>
            <span className="auth-splash-dot"></span>
          </div>

          <div className="auth-actions auth-actions-splash">
            <Link to={ROUTES.login} className="button auth-link-button auth-link-button-primary">
              Se connecter
            </Link>
            <Link to={ROUTES.register} className="button auth-link-button auth-link-button-secondary">
              Creer un compte
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
