import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import AppMenu from "../../components/layout/AppMenu.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { apiRequest } from "../../services/api.js";
import lifelineLogo from "../../assets/images/lifeline-logo.webp";
import { ROUTES } from "../../utils/constants.js";
import { firstName, formatList } from "../../utils/helpers.js";

/* ─── SVG Icons ─── */
function IconEye() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconBlood() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" />
    </svg>
  );
}

function IconQrStatus() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v7h-3" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconAmbulance() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4M10 10h4" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconScan() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useLang();
  const profileName = firstName(user?.fullName);
  const [accessLogs, setAccessLogs] = useState([]);

  useEffect(() => {
    if (!token) return;
    const cacheKey = "lifeline.accessLogs";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try { setAccessLogs(JSON.parse(cached)); } catch {}
    }
    apiRequest("/qr/access-logs", { token })
      .then((data) => {
        if (data?.logs) {
          setAccessLogs(data.logs);
          sessionStorage.setItem(cacheKey, JSON.stringify(data.logs));
        }
      })
      .catch(() => {});
  }, [token]);

  // Profile completeness
  const profileFields = [
    user?.fullName, user?.bloodType, user?.allergies, user?.conditions,
    user?.medications, user?.emergencyContact, user?.criticalInstructions || user?.notes,
    user?.phone, user?.city, user?.doctorName,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completenessPercent = Math.round((completedFields / profileFields.length) * 100);
  const missingFields = profileFields.length - completedFields;

  // Ring calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completenessPercent / 100) * circumference;

  const shortcuts = [
    { label: t.identity, sub: t.identitySub, route: ROUTES.editProfile, Icon: IconUser, color: "blue" },
    { label: t.medicalDossier || "Dossier médical", sub: t.medicalDossierSub || "Mon carnet de santé", route: ROUTES.dossier, Icon: IconFolder, color: "cyan" },
    { label: t.emergencyPage || "Ma fiche urgence", sub: "Visible aux secouristes", route: user?.qrToken ? `${ROUTES.emergency}/${user.qrToken}` : ROUTES.editProfile, Icon: IconAmbulance, color: "red" },
  ];

  return (
    <main className="home-screen">
      <section className="home-shell">
        {/* Top Bar */}
        <header className="home-topbar">
          <AppMenu />
          <div className="home-topbar-center"><img src={lifelineLogo} alt="LifeLine" className="home-topbar-logo" /></div>
          <button
            type="button"
            className="home-topbar-avatar"
            onClick={() => navigate(ROUTES.profile)}
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
          {/* Title */}
          <section className="home-welcome">
            <h1 className="home-greeting dash-title-gradient">{t.dashTitle}</h1>
            <p className="home-greeting-sub">{t.dashSub}</p>
          </section>

          {/* Progress Ring Card */}
          <section className="dash-progress-card">
            <div className="dash-ring-wrap">
              <svg viewBox="0 0 120 120" width="100" height="100" className="dash-ring-svg">
                <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" stroke="rgba(14,165,233,0.1)" />
                <circle
                  cx="60" cy="60" r={radius} fill="none"
                  stroke="url(#dashRingGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform="rotate(-90 60 60)"
                  className="dash-ring-animated"
                />
                <defs>
                  <linearGradient id="dashRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="dash-ring-text">
                <span className="dash-ring-pct">{completenessPercent}%</span>
                <span className="dash-ring-label">complet</span>
              </div>
            </div>
            <div className="dash-progress-info">
              <span className="dash-kicker">{completenessPercent === 100 ? "✓ DOSSIER COMPLET" : "DOSSIER MÉDICAL"}</span>
              <strong>{t.completeness}</strong>
              <p>
                {completenessPercent === 100
                  ? "Votre dossier médical est complet. Bravo !"
                  : `${missingFields} ${t.fieldsRemaining}`}
              </p>
              <button type="button" className="dash-complete-btn" onClick={() => navigate(ROUTES.editProfile)}>
                {completenessPercent === 100 ? t.seeAll : t.complete} &rsaquo;
              </button>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="dash-stats">
            <div className="dash-stat-card">
              <span className="dash-stat-icon dash-stat-icon-blue">
                <IconEye />
              </span>
              <strong>{accessLogs.length}</strong>
              <span>{t.qrScans}</span>
            </div>
            <div className="dash-stat-card">
              <span className="dash-stat-icon dash-stat-icon-red">
                <IconBlood />
              </span>
              <strong>{user?.bloodType || "—"}</strong>
              <span>{t.bloodType}</span>
            </div>
            <div className="dash-stat-card">
              <span className="dash-stat-icon dash-stat-icon-green">
                <IconQrStatus />
              </span>
              <strong>{user?.qrToken ? t.active : t.inactive}</strong>
              <span>{t.qrStatus}</span>
            </div>
          </section>

          {/* Access Logs — Timeline */}
          <section className="dash-logs-section">
            <div className="home-section-header-row">
              <h2 className="home-section-heading">{t.whoScanned}</h2>
              <button type="button" className="home-link-btn" onClick={() => navigate(ROUTES.scanner)}>{t.seeAll} &rsaquo;</button>
            </div>

            {accessLogs.length > 0 ? (
              <div className="dash-logs-list dash-timeline">
                {accessLogs.slice(0, 3).map((log, index) => {
                  const logDate = new Date(log.openedAt);
                  return (
                    <div key={log.id} className="dash-log-item">
                      <div className="dash-timeline-dot">
                        <span className="dash-timeline-dot-inner"></span>
                        {index < Math.min(accessLogs.length, 3) - 1 && <span className="dash-timeline-line"></span>}
                      </div>
                      <div className="dash-log-content">
                        <div className="dash-log-avatar">
                          <IconScan />
                        </div>
                        <div className="dash-log-info">
                          <strong>{log.responder === "anonymous" ? t.anonymousUser : log.responder}</strong>
                          <span>{logDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} à {logDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <span className="dash-log-badge">✓</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dash-logs-empty">
                <IconEye />
                <p>{t.noScansYet}</p>
              </div>
            )}
          </section>

          {/* Quick Edit Shortcuts */}
          <section className="dash-shortcuts">
            <h2 className="home-section-heading">{t.quickEdit}</h2>
            <div className="dash-shortcuts-grid">
              {shortcuts.map((item) => (
                <button key={item.route + item.label} type="button" className="dash-shortcut-item" onClick={() => navigate(item.route)}>
                  <span className={`dash-shortcut-icon dash-shortcut-icon-${item.color}`}>
                    <item.Icon />
                  </span>
                  <strong>{item.label}</strong>
                  <small>{item.sub}</small>
                </button>
              ))}
            </div>
          </section>

          {/* Last Update */}
          <button type="button" className="dash-update-row" onClick={() => navigate(ROUTES.editProfile)}>
            <span className="dash-update-icon">
              <IconClock />
            </span>
            <div className="dash-update-info">
              <strong>Dernière mise à jour</strong>
              <span>Dossier mis à jour aujourd'hui</span>
            </div>
            <span className="dash-update-arrow">&rsaquo;</span>
          </button>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
