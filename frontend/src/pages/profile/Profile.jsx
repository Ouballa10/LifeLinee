import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { ROUTES } from "../../utils/constants.js";
import { formatList, getInitials } from "../../utils/helpers.js";

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

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MedicalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    await logout();
    navigate(ROUTES.login, { replace: true });
  }

  const profileFields = [
    user?.fullName, user?.bloodType, user?.allergies, user?.conditions,
    user?.medications, user?.emergencyContact, user?.criticalInstructions || user?.notes,
    user?.phone, user?.city, user?.doctorName,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completenessPercent = Math.round((completedFields / profileFields.length) * 100);

  const medicalBadges = [
    { icon: <BloodIcon />, label: "Groupe sanguin", value: user?.bloodType || "—", color: "red" },
    { icon: <AllergyIcon />, label: "Allergies", value: formatList(user?.allergies, "Aucune"), color: "blue" },
    { icon: <HeartIcon />, label: "Maladies chroniques", value: formatList(user?.conditions, "Aucune"), color: "teal" },
    { icon: <PillIcon />, label: "Traitements", value: formatList(user?.medications, "Aucun"), color: "orange" },
  ];

  const menuLinks = [
    { icon: <PersonIcon />, label: "Informations personnelles", sub: "Gerez vos informations personnelles", route: ROUTES.editProfile, color: "blue" },
    { icon: <MedicalIcon />, label: "Informations medicales", sub: "Consultez et mettez a jour vos informations de sante", route: ROUTES.medicalForm, color: "red" },
    { icon: <ContactIcon />, label: "Contacts d'urgence", sub: "Gerez vos contacts d'urgence", route: ROUTES.medicalForm, color: "purple" },
    { icon: <LockIcon />, label: "Securite et confidentialite", sub: "Parametres de securite et confidentialite", route: ROUTES.profile, color: "orange" },
    { icon: <SettingsIcon />, label: "Parametres de l'application", sub: "Preferences, langue, notifications...", route: ROUTES.profile, color: "pink" },
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
                  <span>{user?.email || ""}</span>
                </div>
                <div className="home-dropdown-links">
                  <button type="button" className="home-dropdown-link" onClick={() => { navigate(ROUTES.home); setIsMenuOpen(false); }}>Accueil</button>
                  <button type="button" className="home-dropdown-link" onClick={() => { navigate(ROUTES.dashboard); setIsMenuOpen(false); }}>Tableau de bord</button>
                  <button type="button" className="home-dropdown-link" onClick={() => { navigate(ROUTES.qr); setIsMenuOpen(false); }}>Mon QR</button>
                  <button type="button" className="home-dropdown-link" onClick={() => { navigate(ROUTES.scanner); setIsMenuOpen(false); }}>Scanner</button>
                </div>
                <button type="button" className="home-dropdown-link home-dropdown-link-danger" onClick={handleLogout}>Deconnexion</button>
              </div>
            )}
          </div>
          <div className="home-topbar-center">
            <img src={lifelineLogo} alt="LifeLine" className="home-topbar-logo" />
          </div>
          <button type="button" className="home-topbar-btn" aria-label="Notifications" onClick={() => navigate(ROUTES.dashboard)}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1e3a5f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="home-notif-badge"></span>
          </button>
        </header>

        <div className="home-scroll-content">
          {/* Page Title */}
          <section className="home-welcome">
            <h1 className="home-greeting">Mon profil</h1>
            <p className="home-greeting-sub">Gerez vos informations personnelles et medicales en toute securite.</p>
          </section>

          {/* Profile Card */}
          <section className="prof-card">
            <div className="prof-card-top">
              <div className="prof-avatar-wrap">
                <div className="prof-avatar">
                  <span>{getInitials(user?.fullName || "LL")}</span>
                </div>
              </div>
              <div className="prof-card-info">
                <div className="prof-name-row">
                  <strong>{user?.fullName || "Utilisateur"}</strong>
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="#1a5fb4"><circle cx="10" cy="10" r="10" /><path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="prof-verified">Compte verifie</span>
                <button type="button" className="prof-edit-btn" onClick={() => navigate(ROUTES.editProfile)}>
                  Modifier le profil
                </button>
              </div>
            </div>
            <div className="prof-details">
              <div className="prof-detail-row">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#6b8299" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>{user?.email || "Non renseigne"}</span>
              </div>
              <div className="prof-detail-row">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#6b8299" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{user?.phone || "Non renseigne"}</span>
              </div>
              <div className="prof-detail-row">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#6b8299" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{user?.city || "Non renseigne"}</span>
              </div>
            </div>
          </section>

          {/* Medical Badges */}
          <section className="prof-badges">
            {medicalBadges.map((badge) => (
              <div key={badge.label} className="prof-badge">
                <span className={`prof-badge-icon prof-badge-icon-${badge.color}`}>{badge.icon}</span>
                <strong>{badge.label}</strong>
                <span>{badge.value}</span>
              </div>
            ))}
          </section>

          {/* Completeness */}
          <section className="prof-completeness">
            <div className="prof-completeness-left">
              <div className="prof-completeness-ring">
                <span>{completenessPercent}%</span>
              </div>
              <div className="prof-completeness-text">
                <strong>Completude du profil medical</strong>
                <p>Plus votre profil est complet, plus vous etes en securite.</p>
                <div className="home-progress-bar">
                  <div className="home-progress-fill" style={{ width: `${completenessPercent}%` }}></div>
                </div>
                <span className="home-progress-pct">{completenessPercent}%</span>
              </div>
            </div>
            <button type="button" className="prof-complete-btn" onClick={() => navigate(ROUTES.medicalForm)}>
              Completer &rsaquo;
            </button>
          </section>

          {/* Menu Links */}
          <section className="prof-menu-list">
            {menuLinks.map((item) => (
              <button key={item.label} type="button" className="prof-menu-item" onClick={() => navigate(item.route)}>
                <span className={`prof-menu-icon prof-menu-icon-${item.color}`}>{item.icon}</span>
                <div className="prof-menu-text">
                  <strong>{item.label}</strong>
                  <span>{item.sub}</span>
                </div>
                <span className="prof-menu-arrow">&rsaquo;</span>
              </button>
            ))}
          </section>

          {/* Logout */}
          <button type="button" className="prof-logout-btn" onClick={handleLogout}>
            <span className="prof-logout-icon"><LogoutIcon /></span>
            <div className="prof-menu-text">
              <strong>Se deconnecter</strong>
              <span>Deconnectez-vous de votre compte</span>
            </div>
            <span className="prof-menu-arrow">&rsaquo;</span>
          </button>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
