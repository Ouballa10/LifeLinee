import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { ROUTES } from "../../utils/constants.js";

/* SVG Icons — clean, consistent, premium */
function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function IconQR() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <path d="M21 14v3h-3M21 21h-3v-3" />
    </svg>
  );
}

function IconScanner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

function IconLogin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </svg>
  );
}

function IconRegister() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function AppMenu() {
  const navigate = useNavigate();
  const location = useLocation();
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

  function isActive(route) {
    return location.pathname === route;
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
            <span className="home-dropdown-section-label">
              <span className="home-dropdown-section-bar"></span>
              Navigation
            </span>
            {isAuthenticated && (
              <>
                <button type="button" className={`home-dropdown-link ${isActive(ROUTES.home) ? "is-active" : ""}`} onClick={() => goTo(ROUTES.home)}>
                  <span className="home-dropdown-link-icon"><IconHome /></span> {t.navHome}
                </button>
                <button type="button" className={`home-dropdown-link ${isActive(ROUTES.dashboard) ? "is-active" : ""}`} onClick={() => goTo(ROUTES.dashboard)}>
                  <span className="home-dropdown-link-icon"><IconDashboard /></span> {t.navDashboard || "Tableau de bord"}
                </button>
                <button type="button" className={`home-dropdown-link ${isActive(ROUTES.profile) ? "is-active" : ""}`} onClick={() => goTo(ROUTES.profile)}>
                  <span className="home-dropdown-link-icon"><IconProfile /></span> {t.navProfile}
                </button>
                <button type="button" className={`home-dropdown-link ${isActive(ROUTES.qr) ? "is-active" : ""}`} onClick={() => goTo(ROUTES.qr)}>
                  <span className="home-dropdown-link-icon"><IconQR /></span> {t.navQr}
                </button>
                <button type="button" className={`home-dropdown-link ${isActive(ROUTES.scanner) ? "is-active" : ""}`} onClick={() => goTo(ROUTES.scanner)}>
                  <span className="home-dropdown-link-icon"><IconScanner /></span> {t.navScanner}
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.login)}>
                  <span className="home-dropdown-link-icon"><IconLogin /></span> {t.signIn || "Se connecter"}
                </button>
                <button type="button" className="home-dropdown-link" onClick={() => goTo(ROUTES.register)}>
                  <span className="home-dropdown-link-icon"><IconRegister /></span> {t.createAccount || "Créer un compte"}
                </button>
              </>
            )}
          </div>

          {/* Paramètres */}
          <div className="home-dropdown-section">
            <span className="home-dropdown-section-label">
              <span className="home-dropdown-section-bar"></span>
              {t.appSettings || "Paramètres"}
            </span>
            <button type="button" className="home-dropdown-link home-dropdown-link-toggle" onClick={toggleTheme}>
              <span className="home-dropdown-link-icon">{isDark ? <IconSun /> : <IconMoon />}</span>
              {t.darkMode}
              <span className={`home-dropdown-toggle ${isDark ? "is-active" : ""}`}>
                <span className="home-dropdown-toggle-dot" />
              </span>
            </button>
            {isAuthenticated && (
              <button type="button" className={`home-dropdown-link ${isActive(ROUTES.editProfile) ? "is-active" : ""}`} onClick={() => goTo(ROUTES.editProfile)}>
                <span className="home-dropdown-link-icon"><IconSettings /></span> {t.navEditProfile || "Paramètres du profil"}
              </button>
            )}
          </div>

          {/* Langue */}
          <div className="home-dropdown-section">
            <span className="home-dropdown-section-label">
              <span className="home-dropdown-section-bar"></span>
              {t.language}
            </span>
            <div className="home-dropdown-lang-row">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`home-dropdown-lang-btn ${lang === l.code ? "is-active" : ""}`}
                  onClick={() => changeLang(l.code)}
                >
                  <span className="home-dropdown-lang-code">{l.code.toUpperCase()}</span>
                  <span className="home-dropdown-lang-name">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Déconnexion */}
          {isAuthenticated && (
            <div className="home-dropdown-footer">
              <button type="button" className="home-dropdown-link home-dropdown-link-danger" onClick={handleLogout}>
                <span className="home-dropdown-link-icon"><IconLogout /></span> {t.logout}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
