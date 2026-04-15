import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants.js";

export default function Splash() {
  return (
    <main className="screen screen-splash">
      <section className="splash-shell">
        <div className="splash-card splash-card-centered">
          <div className="splash-glow"></div>
          <div className="splash-glow splash-glow-top"></div>

          <div className="splash-floating-icons" aria-hidden="true">
            <span className="splash-float splash-float-cross">+</span>
            <span className="splash-float splash-float-shield">✓</span>
            <span className="splash-float splash-float-plus">+</span>
          </div>

          <div className="splash-top-content">
            <div className="splash-logo">
              <span className="brand-mark brand-mark-hero">+</span>
              <div className="splash-copy">
                <h1 className="splash-title">LifeLine</h1>
                <span className="splash-divider" aria-hidden="true"></span>
                <p>Vos informations medicales en cas d'urgence</p>
              </div>
            </div>

            <div className="splash-scene" aria-hidden="true">
              <div className="splash-scene-glow"></div>
              <div className="splash-cloud splash-cloud-a"></div>
              <div className="splash-cloud splash-cloud-b"></div>
              <div className="splash-cloud splash-cloud-c"></div>

              <div className="splash-hospital">
                <span className="splash-hospital-sign">+</span>
                <span className="splash-hospital-window splash-window-a"></span>
                <span className="splash-hospital-window splash-window-b"></span>
                <span className="splash-hospital-window splash-window-c"></span>
                <span className="splash-hospital-window splash-window-d"></span>
              </div>

              <div className="splash-ambulance">
                <span className="splash-ambulance-cabin"></span>
                <span className="splash-ambulance-mark">+</span>
                <span className="splash-wheel splash-wheel-left"></span>
                <span className="splash-wheel splash-wheel-right"></span>
              </div>

              <div className="splash-doctor">
                <span className="splash-doctor-head"></span>
                <span className="splash-doctor-hair"></span>
                <span className="splash-doctor-body"></span>
                <span className="splash-doctor-clipboard"></span>
              </div>

              <div className="splash-ground-wave splash-wave-back"></div>
              <div className="splash-ground-wave splash-wave-front"></div>
            </div>

            <p className="splash-tagline">Rapide • Securise • Toujours a portee</p>
          </div>

          <div className="splash-dots" aria-hidden="true">
            <span className="splash-dot is-active"></span>
            <span className="splash-dot"></span>
            <span className="splash-dot"></span>
          </div>

          <div className="button-row splash-actions">
            <Link to={ROUTES.login} className="button button-primary">
              Se connecter
            </Link>
            <Link to={ROUTES.register} className="button button-secondary">
              Creer un compte
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
