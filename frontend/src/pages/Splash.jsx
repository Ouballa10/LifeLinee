import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants.js";

export default function Splash() {
  return (
    <main className="screen screen-splash">
      <section className="splash-shell">
        <div className="splash-card splash-card-centered">
          <div className="splash-glow"></div>

          <div className="splash-logo">
            <span className="brand-mark brand-mark-hero">+</span>
            <div className="splash-copy">
              <h1 className="splash-title">LifeLine</h1>
              <p>Vos informations medicales en cas d'urgence</p>
            </div>
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
