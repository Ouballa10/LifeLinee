import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import AppMenu from "../../components/layout/AppMenu.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { useLang } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { ROUTES } from "../../utils/constants.js";
import { firstName, formatList } from "../../utils/helpers.js";
import { buildEmergencyUrl, generateQRCodeImage } from "../../services/qrService.js";

/* ─── Icons ─── */
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
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l3-6 4 12 3-6h4" />
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(14,165,233,0.15)" stroke="#0ea5e9" strokeWidth="1.5" />
      <path d="M9 12l2 2 4-4" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Completeness Ring SVG ─── */
function CompletenessRing({ percent }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="home-completeness-ring-svg">
      <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(14,165,233,0.12)" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={radius}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
        className="home-ring-progress"
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <text x="24" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0ea5e9">
        {percent}%
      </text>
    </svg>
  );
}

/* ─── Health tips ─── */
const HEALTH_TIPS = [
  "Pensez à mettre à jour vos allergies régulièrement.",
  "Partagez votre QR avec vos proches en cas d'urgence.",
  "Vérifiez que votre contact d'urgence est toujours joignable.",
  "Un profil complet peut sauver des vies en situation critique.",
  "Ajoutez vos traitements en cours pour une prise en charge rapide.",
];

export default function Home() {
  const navigate = useNavigate();
  const { appState } = useContext(AppContext);
  const { user, logout } = useAuth();
  const { t } = useLang();
  const profileName = firstName(user?.fullName);

  const [showContacts, setShowContacts] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");

  // Generate QR code image
  useEffect(() => {
    if (!user?.qrToken) return;
    const url = buildEmergencyUrl(user.qrToken);
    generateQRCodeImage(url)
      .then((img) => setQrImageUrl(img))
      .catch(() => {});
  }, [user?.qrToken]);

  // Profile completeness
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

  // Daily tip (based on day of year)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const dailyTip = HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];

  // Today's date formatted
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const quickActions = [
    {
      icon: <ProfileIcon />,
      title: t.myMedicalProfile,
      subtitle: t.myInfoSub,
      route: ROUTES.dossier,
      color: "blue",
    },
    {
      icon: <InfoIcon />,
      title: t.myInfo,
      subtitle: t.myInfoSub,
      route: ROUTES.editProfile,
      color: "indigo",
    },
    {
      icon: <PhoneIcon />,
      title: t.emergencyContacts,
      subtitle: t.emergencyContactsSub,
      route: null,
      color: "red",
      action: () => setShowContacts(true),
    },
    {
      icon: <HistoryIcon />,
      title: t.accessHistory,
      subtitle: t.accessHistorySub,
      route: ROUTES.dashboard,
      color: "purple",
    },
  ];

  const medicalItems = [
    {
      icon: <BloodIcon />,
      label: t.bloodType,
      value: user?.bloodType || t.notSpecified,
      color: "red",
      filled: !!user?.bloodType,
    },
    {
      icon: <AllergyIcon />,
      label: t.allergies,
      value: formatList(user?.allergies, t.none),
      color: "blue",
      filled: !!user?.allergies,
    },
    {
      icon: <HeartIcon />,
      label: t.chronicDiseases,
      value: formatList(user?.conditions, t.none),
      color: "teal",
      filled: !!user?.conditions,
    },
    {
      icon: <PillIcon />,
      label: t.treatments,
      value: formatList(user?.medications, t.noneM),
      color: "orange",
      filled: !!user?.medications,
    },
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

          {/* ─── Premium Greeting Card ─── */}
          <section className="home-greeting-card">
            <div className="home-greeting-card-content">
              <span className="home-greeting-date">{today}</span>
              <h1 className="home-greeting">{t.homeGreeting}, {profileName} 👋</h1>
              <p className="home-greeting-sub">Vos données médicales à portée de main.</p>
            </div>
            <div className="home-greeting-ring">
              <CompletenessRing percent={completenessPercent} />
            </div>
          </section>

          {/* ─── Hero Banner ─── */}
          <section className="home-hero-banner">
            <div className="home-hero-bg-shapes">
              <div className="home-hero-circle home-hero-circle-1"></div>
              <div className="home-hero-circle home-hero-circle-2"></div>
            </div>
            <div className="home-hero-text">
              <h2>{t.heroTitle}</h2>
              <p>{t.heroSub}</p>
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
                {t.showMyQr}
              </button>
            </div>
            <div className="home-hero-visual">
              <div className="home-hero-phone">
                <div className="home-hero-phone-screen">
                  {qrImageUrl ? (
                    <img src={qrImageUrl} alt="Mon QR" className="home-hero-qr-real" />
                  ) : (
                    <div className="home-hero-phone-qr"></div>
                  )}
                  <span className="home-hero-phone-label">{t.navQr}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Stat Cards Row ─── */}
          <section className="home-stats-row">
            <div className="home-stat-chip">
              <span className="home-stat-chip-icon home-stat-chip-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="home-stat-chip-text">Profil {completenessPercent}%</span>
            </div>
            <div className="home-stat-chip" onClick={() => navigate(ROUTES.qr)}>
              <span className="home-stat-chip-icon home-stat-chip-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              <span className="home-stat-chip-text">QR actif</span>
            </div>
            <div className="home-stat-chip" onClick={() => navigate(ROUTES.dashboard)}>
              <span className="home-stat-chip-icon home-stat-chip-cyan">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span className="home-stat-chip-text">Sécurisé</span>
            </div>
          </section>

          {/* ─── Quick Actions Row ─── */}
          <section className="home-section">
            <h2 className="home-section-heading">{t.quickActions}</h2>
            <div className="home-actions-row">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  className="home-action-item"
                  onClick={() => action.action ? action.action() : navigate(action.route)}
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

          {/* ─── Medical Summary ─── */}
          <section className="home-section">
            <div className="home-section-header-row">
              <h2 className="home-section-heading">{t.medicalSummary}</h2>
              <button
                type="button"
                className="home-link-btn"
                onClick={() => navigate(ROUTES.profile)}
              >
                {t.seeAll} &rsaquo;
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
                  <span className={`home-med-status ${item.filled ? "is-filled" : ""}`}>
                    {item.filled ? "✓" : "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Contacts row */}
            <button
              type="button"
              className="home-contacts-btn"
              onClick={() => setShowContacts(true)}
            >
              <span className="home-med-icon home-med-icon-red">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <div className="home-med-info">
                <strong>{t.emergencyContacts}</strong>
                <span>{user?.emergencyContact || t.notSpecified}</span>
              </div>
              <span className="home-arrow">&rsaquo;</span>
            </button>
          </section>

          {/* ─── Security Banner ─── */}
          <section className="home-security">
            <div className="home-security-icon home-security-icon-pulse">
              <ShieldCheckIcon />
            </div>
            <div className="home-security-copy">
              <strong>{t.securityTitle}</strong>
              <p>{t.securitySub}</p>
            </div>
          </section>
        </div>

        {/* ─── Contacts Modal ─── */}
        {showContacts && (
          <div className="contacts-overlay" onClick={() => setShowContacts(false)}>
            <div className="contacts-modal" onClick={(e) => e.stopPropagation()}>
              <div className="contacts-modal-header">
                <h2>{t.contactsTitle}</h2>
                <button type="button" className="contacts-close" onClick={() => setShowContacts(false)}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {user?.emergencyContact ? (
                <div className="contacts-list">
                  <div className="contacts-item">
                    <div className="contacts-item-icon">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div className="contacts-item-info">
                      <strong>{user.emergencyContact}</strong>
                      <span>Contact d'urgence principal</span>
                    </div>
                  </div>

                  {(() => {
                    const phoneMatch = user.emergencyContact.match(/(\+?\d[\d\s\-.]{6,})/);
                    const phone = phoneMatch ? phoneMatch[1].replace(/\s/g, "") : null;
                    return phone ? (
                      <a href={`tel:${phone}`} className="contacts-call-btn">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Appeler maintenant
                      </a>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="contacts-empty">
                  <span>📞</span>
                  <p>Aucun contact d'urgence enregistré.</p>
                  <button type="button" className="contacts-add-btn" onClick={() => { setShowContacts(false); navigate(ROUTES.editProfile); }}>
                    Ajouter un contact
                  </button>
                </div>
              )}

              <button type="button" className="contacts-edit-btn" onClick={() => { setShowContacts(false); navigate(ROUTES.editProfile); }}>
                Modifier les contacts
              </button>
            </div>
          </div>
        )}

        <BottomNav />
      </section>
    </main>
  );
}
