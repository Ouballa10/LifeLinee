import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";
import { getInitials } from "../../utils/helpers.js";

export default function Navbar({ title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isMenuOpen]);

  const menuItems = [
    { label: "Accueil", route: ROUTES.home },
    { label: "Bord", route: ROUTES.dashboard },
    { label: "Profil", route: ROUTES.profile },
    { label: "Mon QR", route: ROUTES.qr },
    { label: "Scanner", route: ROUTES.scanner },
  ];

  async function handleLogout() {
    await logout();
    navigate(ROUTES.login, { replace: true });
  }

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

          <div className="navbar-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className={`menu-button ${isMenuOpen ? "is-open" : ""}`}
              aria-label="Ouvrir le menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {isMenuOpen ? (
              <div className="navbar-menu">
                <div className="navbar-menu-header">
                  <strong>{user?.fullName || "LifeLine"}</strong>
                  <span>{user?.email || "Menu rapide"}</span>
                </div>

                <div className="navbar-menu-links">
                  {menuItems.map((item) => (
                    <button
                      key={item.route}
                      type="button"
                      className="navbar-menu-link"
                      onClick={() => navigate(item.route)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button type="button" className="navbar-menu-link navbar-menu-link-danger" onClick={handleLogout}>
                  Deconnexion
                </button>
              </div>
            ) : null}
          </div>
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
