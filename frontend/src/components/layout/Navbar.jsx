import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";
import { getInitials } from "../../utils/helpers.js";

export default function Navbar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="app-navbar">
      <div className="app-navbar-top">
        <Link to={ROUTES.home} className="brand-row brand-link brand-row-compact">
          <span className="brand-mark brand-mark-compact">+</span>
          <div className="brand-copy">
            <strong>LifeLine</strong>
          </div>
        </Link>

        <div className="navbar-tools">
          {user ? (
            <Link to={ROUTES.profile} className="avatar-link" aria-label="Ouvrir le profil">
              <span className="avatar-badge avatar-badge-small">{getInitials(user?.fullName || "LL")}</span>
            </Link>
          ) : null}

          <button type="button" className="menu-button" aria-label="Ouvrir le menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {title ? (
        <div className="page-heading">
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
      ) : null}
    </header>
  );
}
