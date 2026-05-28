 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import AppMenu from "../../components/layout/AppMenu.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
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
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
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
  const { lang, t, changeLang, LANGUAGES } = useLang();
  const { isDark, toggleTheme } = useTheme();

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

  const [openPanel, setOpenPanel] = useState("");

  const menuLinks = [
    { icon: <PersonIcon />, label: t.personalInfo, sub: t.personalInfoSub, route: ROUTES.editProfile, color: "blue", id: "personal" },
    { icon: <MedicalIcon />, label: t.medicalDossier, sub: t.medicalDossierSub, route: ROUTES.dossier, color: "teal", id: "dossier" },
    { icon: <ContactIcon />, label: t.emergencyPage, sub: t.emergencyPageSub, route: user?.qrToken ? `${ROUTES.emergency}/${user.qrToken}` : ROUTES.editProfile, color: "red", id: "urgence" },
    { icon: <LockIcon />, label: t.security, sub: t.securitySub2, route: null, color: "purple", id: "security" },
    { icon: <SettingsIcon />, label: t.appSettings, sub: t.appSettingsSub, route: null, color: "pink", id: "settings" },
  ];

  return (
    <main className="home-screen">
      <section className="home-shell">
        {/* Top Bar */}
        <header className="home-topbar">
          <AppMenu />
          <div className="home-topbar-center">
            <img src={lifelineLogo} alt="LifeLine" className="home-topbar-logo" />
          </div>
          <button
            type="button"
            className="home-topbar-avatar"
            onClick={() => navigate(ROUTES.editProfile)}
            aria-label="Mon profil"
          >
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="" className="home-topbar-avatar-img" />
            ) : (
              <span className="home-topbar-avatar-initials">
                {(user?.fullName || "U").slice(0, 1).toUpperCase()}
              </span>
            )}
          </button>
        </header>

        <div className="home-scroll-content">
          {/* Page Title */}
          <section className="home-welcome">
            <h1 className="home-greeting dash-title-gradient">{t.profileTitle}</h1>
            <p className="home-greeting-sub">{t.profileSub}</p>
          </section>

          {/* Profile Card */}
          <section className="prof-card">
            <div className="prof-card-top">
              <div className="prof-avatar-wrap">
                <div className="prof-avatar">
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt={user.fullName || "Photo"} className="prof-avatar-img" />
                  ) : (
                    <span>{getInitials(user?.fullName || "LL")}</span>
                  )}
                </div>
              </div>
              <div className="prof-card-info">
                <div className="prof-name-row">
                  <strong>{user?.fullName || "Utilisateur"}</strong>
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="#0ea5e9"><circle cx="10" cy="10" r="10" /><path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="prof-verified">{t.verifiedAccount}</span>
                <button type="button" className="prof-edit-btn" onClick={() => navigate(ROUTES.editProfile)}>
                  {t.editProfile}
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
                <strong>{t.profileCompleteness}</strong>
                <p>{t.profileCompletenessSub}</p>
                <div className="home-progress-bar">
                  <div className="home-progress-fill" style={{ width: `${completenessPercent}%` }}></div>
                </div>
                <span className="home-progress-pct">{completenessPercent}%</span>
              </div>
            </div>
            <button type="button" className="prof-complete-btn" onClick={() => navigate(ROUTES.editProfile)}>
              {t.complete} &rsaquo;
            </button>
          </section>

          {/* Menu Links */}
          <section className="prof-menu-list">
            {menuLinks.map((item) => (
              <div key={item.id}>
                <button
                  type="button"
                  className={`prof-menu-item ${openPanel === item.id ? "is-active" : ""}`}
                  onClick={() => {
                    if (item.route) {
                      navigate(item.route);
                    } else {
                      setOpenPanel(openPanel === item.id ? "" : item.id);
                    }
                  }}
                >
                  <span className={`prof-menu-icon prof-menu-icon-${item.color}`}>{item.icon}</span>
                  <div className="prof-menu-text">
                    <strong>{item.label}</strong>
                    <span>{item.sub}</span>
                  </div>
                  <span className="prof-menu-arrow">{openPanel === item.id ? "∨" : "›"}</span>
                </button>

                {/* Contacts Panel */}
                {item.id === "contacts" && openPanel === "contacts" && (
                  <div className="prof-panel">
                    {user?.emergencyContact ? (
                      <>
                        <div className="prof-panel-row">
                          <span className="prof-panel-icon">👤</span>
                          <div>
                            <strong>Contact principal</strong>
                            <span>{user.emergencyContact}</span>
                          </div>
                        </div>
                        {(() => {
                          const phoneMatch = user.emergencyContact.match(/(\+?\d[\d\s\-.]{6,})/);
                          const phone = phoneMatch ? phoneMatch[1].replace(/\s/g, "") : null;
                          return phone ? (
                            <a href={`tel:${phone}`} className="prof-panel-call-btn">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              Appeler maintenant
                            </a>
                          ) : null;
                        })()}
                        <button type="button" className="prof-panel-edit-btn" onClick={() => navigate(ROUTES.editProfile)}>
                          Modifier le contact
                        </button>
                      </>
                    ) : (
                      <div className="prof-panel-row">
                        <span className="prof-panel-icon">📞</span>
                        <div>
                          <strong>Aucun contact enregistre</strong>
                          <span>Ajoutez un contact d'urgence pour votre securite.</span>
                        </div>
                      </div>
                    )}
                    {!user?.emergencyContact && (
                      <button type="button" className="prof-panel-edit-btn" onClick={() => navigate(ROUTES.editProfile)}>
                        Ajouter un contact
                      </button>
                    )}
                  </div>
                )}

                {/* Security Panel */}
                {item.id === "security" && openPanel === "security" && (
                  <div className="prof-panel">
                    {user?.authProvider !== "google" && (
                      <div className="prof-panel-row prof-panel-row-action">
                        <span className="prof-panel-icon prof-panel-icon-svg">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <div style={{ flex: 1 }}>
                          <strong>{t.password}</strong>
                          <span>Modifier votre mot de passe</span>
                        </div>
                        <button
                          type="button"
                          className="prof-change-pwd-btn"
                          onClick={async () => {
                            try {
                              const { auth } = await import("../../services/firebase.js");
                              const { sendPasswordResetEmail } = await import("firebase/auth");
                              if (auth && user?.email) {
                                await sendPasswordResetEmail(auth, user.email);
                                alert("Un email de réinitialisation a été envoyé à " + user.email);
                              }
                            } catch (err) {
                              alert("Erreur: " + (err.message || "Réessayez plus tard."));
                            }
                          }}
                        >
                          Changer
                        </button>
                      </div>
                    )}
                    {user?.authProvider === "google" && (
                      <div className="prof-panel-row">
                        <span className="prof-panel-icon prof-panel-icon-svg">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <div>
                          <strong>{t.password}</strong>
                          <span>Géré par Google — modifiez-le depuis votre compte Google</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Panel */}
                {item.id === "settings" && openPanel === "settings" && (
                  <div className="prof-panel">
                    <div className="prof-panel-row prof-panel-row-lang">
                      <span className="prof-panel-icon prof-panel-icon-svg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </span>
                      <div>
                        <strong>{t.language}</strong>
                        <div className="prof-lang-options">
                          {LANGUAGES.map((l) => (
                            <button
                              key={l.code}
                              type="button"
                              className={`prof-lang-btn ${lang === l.code ? "is-active" : ""}`}
                              onClick={() => changeLang(l.code)}
                            >
                              <span className="prof-lang-code">{l.code.toUpperCase()}</span>
                              <span>{l.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="prof-panel-row">
                      <span className="prof-panel-icon prof-panel-icon-svg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </span>
                      <div>
                        <strong>{t.notifications}</strong>
                        <span>{t.notificationsSub}</span>
                      </div>
                    </div>
                    <div className="prof-panel-row prof-panel-row-toggle">
                      <span className="prof-panel-icon prof-panel-icon-svg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      </span>
                      <div>
                        <strong>{t.darkMode}</strong>
                        <span>{isDark ? t.darkModeOn : t.darkModeOff}</span>
                      </div>
                      <button
                        type="button"
                        className={`prof-toggle ${isDark ? "is-on" : ""}`}
                        onClick={toggleTheme}
                        aria-label="Activer le mode sombre"
                      >
                        <span className="prof-toggle-knob"></span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Logout */}
          <button type="button" className="prof-logout-btn" onClick={handleLogout}>
            <span className="prof-logout-icon"><LogoutIcon /></span>
            <div className="prof-menu-text">
              <strong>{t.logout}</strong>
              <span>{t.logoutSub}</span>
            </div>
            <span className="prof-menu-arrow">&rsaquo;</span>
          </button>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
