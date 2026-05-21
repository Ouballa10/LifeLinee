import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { ROUTES } from "../../utils/constants.js";
import { firstName, formatList } from "../../utils/helpers.js";

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BloodIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" />
    </svg>
  );
}

function AllergyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M10.5 1.5l-8 8a5 5 0 0 0 7 7l8-8a5 5 0 0 0-7-7z" />
      <path d="M7 10.5L13.5 4" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(0,185,242,0.2)" stroke="#00b9f2" strokeWidth="1.5" />
      <path d="M9 12l2 2 4-4" stroke="#00b9f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { appState } = useContext(AppContext);
  const { user, logout } = useAuth();
  const profileName = firstName(user?.fullName);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return undefined;
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

  const menuItems = [
    { label: "Accueil", route: ROUTES.home },
    { label: "Tableau de bord", route: ROUTES.dashboard },
    { label: "Mon profil", route: ROUTES.profile },
    { label: "Mon QR", route: ROUTES.qr },
    { label: "Scanner", route: ROUTES.scanner },
    { label: "Modifier profil", route: ROUTES.editProfile },
  ];

  async function handleLogout() {
    await logout();
    navigate(ROUTES.login, { replace: true });
  }

  // Calculate profile completeness
  const profileFields = [
    user?.fullName,
    user?.bloodType,
    user?.allergies,
    user?.conditions,
    user?.medications,
    user?.emergencyContact,
    user?.criticalInstructions || user?.notes,
    user?.phone,
    user?.city,
    user?.doctorName,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completenessPercent = Math.round((completedFields / profileFields.length) * 100);

  const quickActions = [
    {
      icon: <ProfileIcon />,
      title: "Mon profil medical",
      subtitle: "Afficher mon code QR",
      route: ROUTES.profile,
      color: "blue",
    },
    {
      icon: <InfoIcon />,
      title: "Mes informations",
      subtitle: "Voir et modifier mes informations",
      route: ROUTES.editProfile,
      color: "indigo",
    },
    {
      icon: <PhoneIcon />,
      title: "Contacts d'urgence",
      subtitle: "Gerer mes contacts d'urgence",
      route: ROUTES.medicalForm,
      color: "red",
    },
    {
      icon: <HistoryIcon />,
      title: "Historique des acces",
      subtitle: "Voir les acces a mes informations",
      route: ROUTES.dashboard,
      color: "purple",
    },
  ];

  const medicalItems = [
    {
      icon: <BloodIcon />,
      label: "Groupe sanguin",
      value: user?.bloodType || "Non renseigne",
      color: "red",
    },
    {
      icon: <AllergyIcon />,
      label: "Allergies",
      value: formatList(user?.allergies, "Aucune"),
      color: "blue",
    },
    {
      icon: <HeartIcon />,
      label: "Maladies chroniques",
      value: formatList(user?.conditions, "Aucune"),
      color: "teal",
    },
    {
      icon: <PillIcon />,
      label: "Traitements",
      value: formatList(user?.medications, "Aucun"),
      color: "orange",
    },
  ];

  return (
    <main className="home-screen">
      <section className="home-shell">
        {/* Top Bar */}
        <header className="home-topbar">
          <div className="home-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className={`home-topbar-btn ${isMenuOpen ? "is-open" : ""}`}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <span className="home-hamburger-line"></span>
              <span className="home-hamburger-line"></span>
              <span className="home-hamburger-line"></span>
            </button>

            {isMenuOpen && (
              <div className="home-dropdown-menu">
                <div className="home-dropdown-header">
                  <strong>{user?.fullName || "LifeLine"}</strong>
                  <span>{user?.email || "Menu"}</span>
                </div>
                <div className="home-dropdown-links">
                  {menuItems.map((item) => (
                    <button
                      key={item.route}
                      type="button"
                      className="home-dropdown-link"
                      onClick={() => {
                        navigate(item.route);
                        setIsMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="home-dropdown-link home-dropdown-link-danger"
                  onClick={handleLogout}
                >
                  Deconnexion
                </button>
              </div>
            )}
          </div>

          <div className="home-topbar-center">
            <img src={lifelineLogo} alt="LifeLine" className="home-topbar-logo" />
          </div>

          <button
            type="button"
            className="home-topbar-btn"
            aria-label="Notifications"
            onClick={() => navigate(ROUTES.dashboard)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0a2540" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="home-notif-badge"></span>
          </button>
        </header>

        <div className="home-scroll-content">
          {/* Welcome */}
          <section className="home-welcome">
            <div className="home-welcome-left">
              <h1 className="home-greeting">Bonjour, {profileName} 👋</h1>
              <p className="home-greeting-sub">
                Prenez soin de vous, vos informations peuvent sauver des vies.
              </p>
            </div>
          </section>

          {/* Hero Banner */}
          <section className="home-hero-banner">
            <div className="home-hero-bg-shapes">
              <div className="home-hero-circle home-hero-circle-1"></div>
              <div className="home-hero-circle home-hero-circle-2"></div>
              <div className="home-hero-tree home-hero-tree-left"></div>
              <div className="home-hero-tree home-hero-tree-right"></div>
            </div>
            <div className="home-hero-text">
              <h2>Votre sante, notre priorite</h2>
              <p>Gardez vos informations medicales a portee de main en cas d'urgence.</p>
              <button
                type="button"
                className="home-hero-cta"
                onClick={() => navigate(ROUTES.qr)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3zM20 14v7h-3" />
                </svg>
                Afficher mon QR
              </button>
            </div>
            <div className="home-hero-visual">
              <div className="home-hero-phone">
                <div className="home-hero-phone-screen">
                  <div className="home-hero-phone-qr"></div>
                  <span className="home-hero-phone-label">Mon QR medical</span>
                </div>
              </div>
              <div className="home-hero-shield-float">
                <svg viewBox="0 0 32 36" width="32" height="36" fill="none">
                  <path d="M16 2L4 7v9c0 10 12 16 12 16s12-6 12-16V7L16 2z" fill="#00b9f2" opacity="0.9" />
                  <path d="M13 18h6M16 15v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="home-section">
            <h2 className="home-section-heading">Actions rapides</h2>
            <div className="home-actions-row">
              {quickActions.map((action) => (
                <button
                  key={action.route}
                  type="button"
                  className="home-action-item"
                  onClick={() => navigate(action.route)}
                >
                  <span className={`home-action-icon home-action-icon-${action.color}`}>
                    {action.icon}
                  </span>
                  <strong>{action.title}</strong>
                  <small>{action.subtitle}</small>
                </button>
              ))}
            </div>
          </section>

          {/* Medical Summary */}
          <section className="home-section">
            <div className="home-section-header-row">
              <h2 className="home-section-heading">Resume de mon profil medical</h2>
              <button
                type="button"
                className="home-link-btn"
                onClick={() => navigate(ROUTES.profile)}
              >
                Voir tout &rsaquo;
              </button>
            </div>

            <div className="home-medical-list">
              {medicalItems.map((item) => (
                <div key={item.label} className="home-medical-row">
                  <span className={`home-med-icon home-med-icon-${item.color}`}>
                    {item.icon}
                  </span>
                  <div className="home-med-info">
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Contacts row */}
            <button
              type="button"
              className="home-contacts-btn"
              onClick={() => navigate(ROUTES.medicalForm)}
            >
              <span className="home-med-icon home-med-icon-purple">
                <ContactsIcon />
              </span>
              <div className="home-med-info">
                <strong>Contacts d'urgence</strong>
                <span>{user?.emergencyContact || "Non renseigne"}</span>
              </div>
              <span className="home-arrow">&rsaquo;</span>
            </button>
          </section>

          {/* Security Banner */}
          <section className="home-security">
            <div className="home-security-icon">
              <ShieldCheckIcon />
            </div>
            <div className="home-security-copy">
              <strong>Vos donnees sont securisees</strong>
              <p>Nous protegeons vos informations medicales avec la plus haute securite.</p>
            </div>
          </section>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
