import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import AppMenu from "../../components/layout/AppMenu.jsx";
import { useAuth } from "../../hooks/useAuth.js";
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

const CATEGORY_ICONS = {
  ordonnance: "💊",
  analyse: "🧪",
  radio: "🩻",
  certificat: "📋",
  compte_rendu: "📝",
  vaccination: "💉",
  other: "📄",
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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiRequest("/documents", { token })
      .then((data) => {
        // Filter out avatar/profile photos from documents list
        const docs = (data?.documents || []).filter(
          (doc) => !doc.file_name?.startsWith("avatar_") && doc.category !== "avatar"
        );
        setDocuments(docs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // Group documents by category
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
          {/* Header */}
          <section className="dossier-header">
            <h1 className="dossier-title">📋 Mon Dossier Médical</h1>
            <p className="dossier-subtitle">Votre carnet de santé numérique complet</p>
            <button
              type="button"
              className="dossier-edit-btn"
              onClick={() => navigate(ROUTES.editProfile)}
            >
              ✏️ Modifier
            </button>
          </section>

          {/* Identity Section */}
          <section className="dossier-section">
            <div className="dossier-section-header">
              <span className="dossier-section-icon">👤</span>
              <h2>Identité</h2>
            </div>
            <div className="dossier-card">
              <div className="dossier-row">
                <span className="dossier-label">Nom complet</span>
                <strong className="dossier-value">{user?.fullName || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Téléphone</span>
                <strong className="dossier-value">{user?.phone || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Email</span>
                <strong className="dossier-value">{user?.email || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Date de naissance</span>
                <strong className="dossier-value">{user?.birthDate || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Sexe</span>
                <strong className="dossier-value">{user?.gender || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">Ville</span>
                <strong className="dossier-value">{user?.city || "—"}</strong>
              </div>
              {user?.address && (
                <div className="dossier-row">
                  <span className="dossier-label">Adresse</span>
                  <strong className="dossier-value">{user.address}</strong>
                </div>
              )}
            </div>
          </section>

          {/* Vital Info Section */}
          <section className="dossier-section">
            <div className="dossier-section-header">
              <span className="dossier-section-icon">❤️</span>
              <h2>Informations vitales</h2>
            </div>
            <div className="dossier-card">
              <div className="dossier-row dossier-row-highlight">
                <span className="dossier-label">🩸 Groupe sanguin</span>
                <strong className="dossier-value dossier-value-red">{user?.bloodType || "—"}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">⚠️ Allergies</span>
                <strong className="dossier-value">{formatList(user?.allergies, "Aucune connue")}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">💜 Maladies chroniques</span>
                <strong className="dossier-value">{formatList(user?.conditions, "Aucune")}</strong>
              </div>
              <div className="dossier-row">
                <span className="dossier-label">💊 Médicaments en cours</span>
                <strong className="dossier-value">{formatList(user?.medications, "Aucun")}</strong>
              </div>
              {(user?.weight || user?.height) && (
                <div className="dossier-row">
                  <span className="dossier-label">📏 Poids / Taille</span>
                  <strong className="dossier-value">
                    {user?.weight ? `${user.weight} kg` : "—"} / {user?.height ? `${user.height} cm` : "—"}
                  </strong>
                </div>
              )}
              {user?.medicalHistory && (
                <div className="dossier-row">
                  <span className="dossier-label">📖 Antécédents</span>
                  <strong className="dossier-value">{user.medicalHistory}</strong>
                </div>
              )}
            </div>
          </section>

          {/* Critical Instructions */}
          {(user?.criticalInstructions || user?.notes) && (
            <section className="dossier-section">
              <div className="dossier-section-header">
                <span className="dossier-section-icon">🚨</span>
                <h2>Consignes critiques</h2>
              </div>
              <div className="dossier-card dossier-card-alert">
                <p className="dossier-alert-text">{user?.criticalInstructions || user?.notes}</p>
              </div>
            </section>
          )}

          {/* Emergency Contacts */}
          <section className="dossier-section">
            <div className="dossier-section-header">
              <span className="dossier-section-icon">📞</span>
              <h2>Contacts d'urgence</h2>
            </div>
            <div className="dossier-card dossier-contacts-card">
              {user?.emergencyContact && (() => {
                const phone = (user.emergencyContact.match(/[\d+][\d\s\-().]+/)?.[0] || "").replace(/\s/g, "");
                return (
                  <div className="dossier-contact-row">
                    <div className="dossier-contact-info">
                      <strong>Contact principal</strong>
                      <span>{user.emergencyContact}</span>
                    </div>
                    {phone && (
                      <a href={`tel:${phone}`} className="dossier-call-btn">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        Appeler
                      </a>
                    )}
                  </div>
                );
              })()}
              {!user?.emergencyContact && (
                <div className="dossier-contact-row">
                  <div className="dossier-contact-info">
                    <strong>Contact principal</strong>
                    <span>Non renseigné</span>
                  </div>
                </div>
              )}
              {user?.secondaryContact && (() => {
                const phone = (user.secondaryContact.match(/[\d+][\d\s\-().]+/)?.[0] || "").replace(/\s/g, "");
                return (
                  <div className="dossier-contact-row">
                    <div className="dossier-contact-info">
                      <strong>Contact secondaire</strong>
                      <span>{user.secondaryContact}</span>
                    </div>
                    {phone && (
                      <a href={`tel:${phone}`} className="dossier-call-btn">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        Appeler
                      </a>
                    )}
                  </div>
                );
              })()}
              {user?.doctorName && (
                <div className="dossier-contact-row">
                  <div className="dossier-contact-info">
                    <strong>Médecin référent</strong>
                    <span>{user.doctorName}</span>
                  </div>
                  {user?.doctorPhone && (
                    <a href={`tel:${user.doctorPhone.replace(/\s/g, "")}`} className="dossier-call-btn dossier-call-btn-blue">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      Appeler
                    </a>
                  )}
                </div>
              )}
              {!user?.doctorName && (
                <div className="dossier-contact-row">
                  <div className="dossier-contact-info">
                    <strong>Médecin référent</strong>
                    <span>Non renseigné</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Documents Section */}
          <section className="dossier-section">
            <div className="dossier-section-header">
              <span className="dossier-section-icon">📁</span>
              <h2>Documents médicaux</h2>
              <span className="dossier-doc-count">{documents.length}</span>
            </div>

            {loading ? (
              <div className="dossier-loading">Chargement...</div>
            ) : documents.length === 0 ? (
              <div className="dossier-empty">
                <span>📂</span>
                <p>Aucun document ajouté</p>
                <button
                  type="button"
                  className="dossier-add-doc-btn"
                  onClick={() => navigate(ROUTES.editProfile)}
                >
                  + Ajouter un document
                </button>
              </div>
            ) : (
              <div className="dossier-docs-grid">
                {Object.entries(groupedDocs).map(([category, docs]) => (
                  <div key={category} className="dossier-doc-group">
                    <h3 className="dossier-doc-group-title">
                      {CATEGORY_ICONS[category] || "📄"} {CATEGORY_LABELS[category] || category}
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
                            {doc.file_type?.includes("pdf") ? "📄" : "🖼️"}
                          </span>
                          <div className="dossier-doc-info">
                            <strong>{doc.file_name}</strong>
                            <span>
                              {formatFileSize(doc.file_size)}
                              {doc.created_at && ` • ${formatDate(doc.created_at)}`}
                            </span>
                          </div>
                          <span className="dossier-doc-open">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Footer */}
          <div className="dossier-footer">
            <p>🩺 Dossier médical LifeLine — Dernière mise à jour : {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
