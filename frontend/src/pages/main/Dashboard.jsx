import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import AppMenu from "../../components/layout/AppMenu.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { apiRequest } from "../../services/api.js";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { ROUTES } from "../../utils/constants.js";
import { firstName, formatList } from "../../utils/helpers.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useLang();
  const profileName = firstName(user?.fullName);
  const [accessLogs, setAccessLogs] = useState([]);

  // Fetch access logs (with simple cache to avoid refetch on quick navigation)
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

  const shortcuts = [
    { label: t.identity, sub: t.identitySub, route: ROUTES.editProfile, icon: "👤" },
    { label: "Dossier médical", sub: "Mon carnet de santé", route: ROUTES.dossier, icon: "📋" },
    { label: "Ma fiche urgence", sub: "", route: user?.qrToken ? `${ROUTES.emergency}/${user.qrToken}` : ROUTES.editProfile, icon: "🚑" },
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
            <h1 className="home-greeting">{t.dashTitle}</h1>
            <p className="home-greeting-sub">{t.dashSub}</p>
          </section>

          {/* Progress Ring Card */}
          <section className="dash-progress-card">
            <div className="dash-ring-wrap">
              <svg viewBox="0 0 120 120" width="100" height="100" className="dash-ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${completenessPercent * 3.14} 314`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="dash-ring-text">
                <span className="dash-ring-pct">{completenessPercent}%</span>
                <span className="dash-ring-label">complet</span>
              </div>
            </div>
            <div className="dash-progress-info">
              <span className="dash-kicker">✓ {completenessPercent === 100 ? "DOSSIER COMPLET" : "DOSSIER MÉDICAL"}</span>
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
              <span className="dash-stat-icon">👁️</span>
              <strong>{accessLogs.length}</strong>
              <span>{t.qrScans}</span>
            </div>
            <div className="dash-stat-card">
              <span className="dash-stat-icon">🩸</span>
              <strong>{user?.bloodType || "—"}</strong>
              <span>{t.bloodType}</span>
            </div>
            <div className="dash-stat-card">
              <span className="dash-stat-icon">📱</span>
              <strong>{user?.qrToken ? t.active : t.inactive}</strong>
              <span>{t.qrStatus}</span>
            </div>
          </section>

          {/* Access Logs */}
          <section className="dash-logs-section">
            <div className="home-section-header-row">
              <h2 className="home-section-heading">{t.whoScanned}</h2>
              <button type="button" className="home-link-btn" onClick={() => navigate(ROUTES.scanner)}>{t.seeAll} &rsaquo;</button>
            </div>

            {accessLogs.length > 0 ? (
              <div className="dash-logs-list">
                {accessLogs.slice(0, 4).map((log) => {
                  const logDate = new Date(log.openedAt);
                  return (
                    <div key={log.id} className="dash-log-item">
                      <div className="dash-log-avatar">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1a5fb4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="dash-log-info">
                        <strong>{log.responder === "anonymous" ? t.anonymousUser : log.responder}</strong>
                        <span>{logDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} a {logDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <span className="dash-log-badge">✓</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dash-logs-empty">
                <span>📋</span>
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
                  <span className="dash-shortcut-icon">{item.icon}</span>
                  <strong>{item.label}</strong>
                  <small>{item.sub}</small>
                </button>
              ))}
            </div>
          </section>

          {/* Last Update */}
          <button type="button" className="dash-update-row" onClick={() => navigate(ROUTES.editProfile)}>
            <span className="dash-update-icon">🕐</span>
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
