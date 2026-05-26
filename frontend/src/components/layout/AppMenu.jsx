import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { ROUTES } from "../../utils/constants.js";

export default function AppMenu() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, t, changeLang, LANGUAGES } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [isMenuOpen]);

  function goTo(route) {
    navigate(route);
    setIsMenuOpen(false);
  }

  async function handleLogout() {
    await logout();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div className="home-menu-wrap" ref={menuRef}>
      <button
        type="button"
        className={`home-topbar-btn ${isMenuOpen ? "is-open" : ""}`}
        onClick={() => setIsMenuOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={isMenuOpen}
      >
        <span className="home-hamburger-line"></span>
        <span className="home-hamburger-line"></span>
        <span className="home-hamburger-line"></span>
      </button>

      {isMenuOpen && (
        <div className="home-dropdown-menu">
          {/* Header with avatar */}
          <div className="home-dropdown-header">
            <div className="home-dropdown-avatar">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="" className="home-dropdown-avatar-img" />
              ) : (
                <span className="home-dropdown-avatar-initials">
                  {(user?.fullName || "U").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="home-dropdown-user-info">
              <strong>{user?.fullName || "LifeLine"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="home-dropdown-section">
            <span className="home-dropdown-section-label">Navigation</span>
            {isAuthenticated && (
              <>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.home)}>
                  <span className="home-dropdown-link-icon">🏠</span> {t.navHome}
                </button>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.dashboard)}>
                  <span className="home-dropdown-link-icon">📊</span> {t.navDashboard || "Tableau de bord"}
                </button>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.profile)}>
                  <span className="home-dropdown-link-icon">👤</span> {t.navProfile}
                </button>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.qr)}>
                  <span className="home-dropdown-link-icon">📱</span> {t.navQr}
                </button>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.scanner)}>
                  <span className="home-dropdown-link-icon">📷</span> {t.navScanner}
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.login)}>
                  <span className="home-dropdown-link-icon">🔑</span> {t.signIn || "Se connecter"}
                </button>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.register)}>
                  <span className="home-dropdown-link-icon">✨</span> {t.createAccount || "Créer un compte"}
                </button>
              </>
            )}
          </div>

          {/* Paramètres */}
          <div className="home-dropdown-section">
            <span className="home-dropdown-section-label">Paramètres</span>
            <button type="button" className="home-dropdown-link home-dropdown-link-toggle" onClick={toggleTheme}>
              <span className="home-dropdown-link-icon">{isDark ? "☀️" : "🌙"}</span>
              Mode sombre
              <span className={`home-dropdown-toggle ${isDark ? "is-active" : ""}`}>
                <span className="home-dropdown-toggle-dot" />
              </span>
            </button>
            {isAuthenticated && (
              <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.editProfile)}>
                <span className="home-dropdown-link-icon">⚙️</span> Paramètres du profil
              </button>
            )}
          </div>

          {/* Langue */}
          <div className="home-dropdown-section">
            <span className="home-dropdown-section-label">Langue</span>
            <div className="home-dropdown-lang-row">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`home-dropdown-lang-btn ${lang === l.code ? "is-active" : ""}`}
                  onClick={() => changeLang(l.code)}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Déconnexion */}
          {isAuthenticated && (
            <div className="home-dropdown-footer">
              <button type="button" className="home-dropdown-link home-dropdown-link-danger" onClick={handleLogout}>
                <span className="home-dropdown-link-icon">🚪</span> {t.logout}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
