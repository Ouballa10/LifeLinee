import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { apiRequest } from "../../services/api.js";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { ROUTES } from "../../utils/constants.js";
import { formatList } from "../../utils/helpers.js";

const CATEGORY_LABELS = {
  ordonnance: "Ordonnances",
  analyse: "Analyses",
  radio: "Radiologies",
  certificat: "Certificats",
  compte_rendu: "Comptes rendus",
  vaccination: "Vaccinations",
  other: "Autres",
};

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MedicalDossier() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useLang();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiRequest("/documents", { token })
      .then((data) => {
        const docs = (data?.documents || []).filter(
          (doc) => !doc.file_name?.startsWith("avatar_") && doc.category !== "avatar"
        );
        setDocuments(docs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const groupedDocs = documents.reduce((acc, doc) => {
    const cat = doc.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  return (
    <main className="home-screen">
      <section className="home-shell">
        <header className="home-topbar">
          <button type="button" className="home-topbar-btn" onClick={() => navigate(-1)} aria-label="Retour">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
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
          {/* Header */}
          <section className="dossier-header">
            <h1 className="home-greeting dash-title-gradient">{t.dossierTitle}</h1>
            <p className="home-greeting-sub">{t.dossierSubtitle}</p>
            <button
              type="button"
              className="dossier-edit-btn"
              onClick={() => navigate(ROUTES.editProfile)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t.dossierEdit}
            </button>
          </section>

          {/* Identity Section */}
          <section className="dossier-section">
            <h2 className="home-section-heading">{t.dossierIdentity}</h2>
            <div className="dossier-card">
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierFullName}</span>
                <strong className="dossier-value">{user?.fullName || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierPhone}</span>
                <strong className="dossier-value">{user?.phone || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierEmail}</span>
                <strong className="dossier-value">{user?.email || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierBirthDate}</span>
                <strong className="dossier-value">{user?.birthDate || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierGender}</span>
                <strong className="dossier-value">{user?.gender || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierCity}</span>
                <strong className="dossier-value">{user?.city || "—"}</strong>
              </div>
              {user?.address && (
                <div className="dossier-row">
                  <span className="dossier-label">{t.dossierAddress}</span>
                  <strong className="dossier-value">{user.address}</strong>
                </div>
              )}
            </div>
          </section>

          {/* Vital Info Section */}
          <section className="dossier-section">
            <h2 className="home-section-heading">{t.dossierVitalInfo}</h2>
            <div className="dossier-card">
              <div className="dossier-row dossier-row-highlight">
                <span className="dossier-label">{t.dossierBloodType}</span>
                <strong className="dossier-value dossier-value-red">{user?.bloodType || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierAllergies}</span>
                <strong className="dossier-value">{formatList(user?.allergies, t.dossierNoneKnown)}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierDiseases}</span>
                <strong className="dossier-value">{formatList(user?.conditions, t.dossierNoneKnown)}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">{t.dossierMedications}</span>
                <strong className="dossier-value">{formatList(user?.medications, t.dossierNone)}</strong>
              </div>
              {(user?.weight || user?.height) && (
                <div className="dossier-row">
                  <span className="dossier-label">{t.dossierWeightHeight}</span>
                  <strong className="dossier-value">
                    {user?.weight ? `${user.weight} kg` : "—"} / {user?.height ? `${user.height} cm` : "—"}
                  </strong>
                </div>
              )}
              {user?.medicalHistory && (
                <div className="dossier-row">
                  <span className="dossier-label">{t.dossierHistory}</span>
                  <strong className="dossier-value">{user.medicalHistory}</strong>
                </div>
              )}
            </div>
          </section>

          {/* Critical Instructions */}
          {(user?.criticalInstructions || user?.notes) && (
            <section className="dossier-section">
              <h2 className="home-section-heading">{t.dossierCritical}</h2>
              <div className="dossier-card dossier-card-alert">
                <p className="dossier-alert-text">{user?.criticalInstructions || user?.notes}</p>
              </div>
            </section>
          )}

          {/* Emergency Contacts */}
          <section className="dossier-section">
            <h2 className="home-section-heading">{t.dossierContacts}</h2>
            <div className="dossier-card dossier-contacts-card">
              {user?.emergencyContact && (() => {
                const phone = (user.emergencyContact.match(/[\d+][\d\s\-().]+/)?.[0] || "").replace(/\s/g, "");
                return (
                  <div className="dossier-contact-row">
                    <div className="dossier-contact-info">
                      <strong>{t.dossierPrimaryContact}</strong>
                      <span>{user.emergencyContact}</span>
                    </div>
                    {phone && (
                      <a href={`tel:${phone}`} className="dossier-call-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {t.dossierCall}
                      </a>
                    )}
                  </div>
                );
              })()}
              {!user?.emergencyContact && (
                <div className="dossier-contact-row">
                  <div className="dossier-contact-info">
                    <strong>{t.dossierPrimaryContact}</strong>
                    <span>—</span>
                  </div>
                </div>
              )}
              {user?.secondaryContact && (() => {
                const phone = (user.secondaryContact.match(/[\d+][\d\s\-().]+/)?.[0] || "").replace(/\s/g, "");
                return (
                  <div className="dossier-contact-row">
                    <div className="dossier-contact-info">
                      <strong>{t.dossierSecondaryContact}</strong>
                      <span>{user.secondaryContact}</span>
                    </div>
                    {phone && (
                      <a href={`tel:${phone}`} className="dossier-call-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {t.dossierCall}
                      </a>
                    )}
                  </div>
                );
              })()}
              {user?.doctorName && (
                <div className="dossier-contact-row">
                  <div className="dossier-contact-info">
                    <strong>{t.dossierDoctor}</strong>
                    <span>{user.doctorName}</span>
                  </div>
                  {user?.doctorPhone && (
                    <a href={`tel:${user.doctorPhone.replace(/\s/g, "")}`} className="dossier-call-btn dossier-call-btn-blue">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {t.dossierCall}
                    </a>
                  )}
                </div>
              )}
              {!user?.doctorName && (
                <div className="dossier-contact-row">
                  <div className="dossier-contact-info">
                    <strong>{t.dossierDoctor}</strong>
                    <span>—</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Documents Section */}
          <section className="dossier-section">
            <div className="home-section-header-row">
              <h2 className="home-section-heading">{t.dossierDocuments}</h2>
              <span className="dossier-doc-count">{documents.length}</span>
            </div>

            {loading ? (
              <div className="dossier-loading">Chargement...</div>
            ) : documents.length === 0 ? (
              <div className="dossier-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <p>{t.dossierNoDoc}</p>
                <button
                  type="button"
                  className="dossier-add-doc-btn"
                  onClick={() => navigate(ROUTES.editProfile)}
                >
                  + {t.dossierAddDoc}
                </button>
              </div>
            ) : (
              <div className="dossier-docs-grid">
                {Object.entries(groupedDocs).map(([category, docs]) => (
                  <div key={category} className="dossier-doc-group">
                    <h3 className="dossier-doc-group-title">
                      {CATEGORY_LABELS[category] || category}
                      <span className="dossier-doc-group-count">{docs.length}</span>
                    </h3>
                    <div className="dossier-doc-list">
                      {docs.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dossier-doc-item"
                        >
                          <span className="dossier-doc-icon">
                            {doc.file_type?.includes("pdf") ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            )}
                          </span>
                          <div className="dossier-doc-info">
                            <strong>{doc.file_name}</strong>
                            <span>
                              {formatFileSize(doc.file_size)}
                              {doc.created_at && ` • ${formatDate(doc.created_at)}`}
                            </span>
                          </div>
                          <span className="dossier-doc-open">&rsaquo;</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
