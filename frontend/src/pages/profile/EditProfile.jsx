import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { apiRequest } from "../../services/api.js";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { BLOOD_GROUPS, ROUTES } from "../../utils/constants.js";

const SECTIONS = [
  { id: "personal", icon: "👤", label: "Informations personnelles" },
  { id: "health", icon: "🩺", label: "Informations médicales" },
  { id: "emergency", icon: "🚨", label: "Contacts d'urgence" },
  { id: "documents", icon: "📄", label: "Documents" },
  { id: "privacy", icon: "🔒", label: "Sécurité" },
];

function buildForm(user) {
  return {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    address: user?.address || "",
    birthDate: user?.birthDate || "",
    gender: user?.gender || "",
    cin: user?.cin || "",
    bloodType: user?.bloodType || "O+",
    allergies: user?.allergies || "",
    conditions: user?.conditions || "",
    medications: user?.medications || "",
    medicalHistory: user?.medicalHistory || "",
    weight: user?.weight || "",
    height: user?.height || "",
    doctorName: user?.doctorName || "",
    criticalInstructions: user?.criticalInstructions || user?.notes || "",
    emergencyContact: user?.emergencyContact || "",
    secondaryContact: user?.secondaryContact || "",
    doctorPhone: user?.doctorPhone || "",
    qrVisibility: user?.qrVisibility || "full",
  };
}

const DOC_CATEGORIES = [
  { id: "all", label: "Tous", icon: "📁" },
  { id: "ordonnance", label: "Ordonnances", icon: "💊" },
  { id: "analyse", label: "Analyses", icon: "🔬" },
  { id: "radio", label: "Radios", icon: "🩻" },
  { id: "certificat", label: "Certificats", icon: "📜" },
  { id: "compte_rendu", label: "Comptes rendus", icon: "📝" },
  { id: "vaccination", label: "Vaccinations", icon: "💉" },
  { id: "other", label: "Autres", icon: "📎" },
];

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, token, updateProfile } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState(() => buildForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("personal");
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [docCategory, setDocCategory] = useState("all");
  const [docSortBy, setDocSortBy] = useState("date");
  const [docSortOrder, setDocSortOrder] = useState("desc");
  const [uploadCategory, setUploadCategory] = useState("ordonnance");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const activeProfileRef = useRef("");
  const isEditingRef = useRef(false);
  const profileIdentity = `${user?.authProvider || ""}:${user?.id || user?.email || ""}`;

  useEffect(() => {
    if (activeProfileRef.current !== profileIdentity) {
      activeProfileRef.current = profileIdentity;
      isEditingRef.current = false;
    }
    if (!isEditingRef.current) setForm(buildForm(user));
  }, [profileIdentity, user]);

  // Load documents only when documents tab is active
  const docsLoadedRef = useRef(false);
  useEffect(() => {
    if (!token || activeSection !== "documents" || docsLoadedRef.current) return;
    docsLoadedRef.current = true;
    loadDocuments();
  }, [token, activeSection]);

  function loadDocuments() {
    apiRequest("/documents", { token })
      .then((data) => { if (data?.documents) setDocuments(data.documents); })
      .catch(() => {});
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 10MB).");
      return;
    }

    setIsUploading(true);
    setUploadFileName(file.name);
    setUploadProgress(0);
    setUploadSuccess("");
    setError("");

    try {
      // Simulate progress during base64 encoding
      setUploadProgress(10);

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.min(10 + Math.round((e.loaded / e.total) * 40), 50));
          }
        };
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadProgress(60);

      await apiRequest("/documents/upload", {
        method: "POST",
        token,
        body: {
          fileName: file.name,
          fileType: file.type,
          fileBase64: base64,
          category: uploadCategory,
          notes: "",
        },
      });

      setUploadProgress(100);
      setUploadSuccess(`"${file.name}" uploadé avec succès !`);
      loadDocuments();

      // Clear success message after 4s
      setTimeout(() => setUploadSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Erreur lors de l'upload.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadFileName("");
      event.target.value = "";
    }
  }

  async function handleDeleteDoc(docId) {
    try {
      await apiRequest(`/documents/${docId}`, { method: "DELETE", token });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression.");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    isEditingRef.current = true;
    setForm((c) => ({ ...c, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile(form);
      isEditingRef.current = false;
      setSuccess("Profil mis à jour avec succès !");
      setTimeout(() => navigate(ROUTES.profile, { replace: true }), 1200);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="home-screen">
      <section className="home-shell">
        <header className="home-topbar">
          <button type="button" className="home-topbar-btn" onClick={() => navigate(-1)} aria-label="Retour">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="home-topbar-center"><img src={lifelineLogo} alt="LifeLine" className="home-topbar-logo" /></div>
          <div style={{ width: 42 }}></div>
        </header>

        <div className="home-scroll-content">
          <section className="home-welcome">
            <h1 className="home-greeting">{t.editProfileTitle}</h1>
            <p className="home-greeting-sub">{t.editProfileSub}</p>
          </section>

          {/* Section Tabs */}
          <div className="edit-section-tabs">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`edit-section-tab ${activeSection === s.id ? "is-active" : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="edit-section-tab-icon">{s.icon}</span>
                <span className="edit-section-tab-label">{s.label}</span>
              </button>
            ))}
          </div>

          <form className="edit-form" onSubmit={handleSubmit}>

            {/* ═══ SECTION 1: PERSONAL ═══ */}
            {activeSection === "personal" && (
              <div className="edit-section-card">
                <div className="edit-section-header">
                  <span className="edit-section-icon edit-section-icon-blue">👤</span>
                  <div>
                    <strong>Informations personnelles</strong>
                    <span>Identité et coordonnées</span>
                  </div>
                </div>
                <div className="edit-fields">
                  <Input label="Nom complet" name="fullName" value={form.fullName} onChange={handleChange} />
                  <Input label="Téléphone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                  <Input label="Date de naissance" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
                  <div className="edit-field-group">
                    <label className="field-group">
                      <span className="field-label">Sexe</span>
                      <select className="field-input field-select" name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">-- Sélectionner --</option>
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                      </select>
                    </label>
                  </div>
                  <Input label="Ville" name="city" value={form.city} onChange={handleChange} />
                  <Input label="Adresse complète" name="address" value={form.address} onChange={handleChange} />
                  <Input label="CIN / ID médical" name="cin" value={form.cin} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* ═══ SECTION 2: HEALTH ═══ */}
            {activeSection === "health" && (
              <div className="edit-section-card">
                <div className="edit-section-header">
                  <span className="edit-section-icon edit-section-icon-teal">🩺</span>
                  <div>
                    <strong>Informations médicales</strong>
                    <span>Données critiques pour les secouristes</span>
                  </div>
                </div>
                <div className="edit-fields">
                  <div className="edit-field-group">
                    <label className="field-group">
                      <span className="field-label">Groupe sanguin</span>
                      <select className="field-input field-select" name="bloodType" value={form.bloodType} onChange={handleChange}>
                        {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </label>
                  </div>
                  <Input label="Allergies" name="allergies" value={form.allergies} onChange={handleChange} />
                  <Input label="Maladies chroniques" name="conditions" value={form.conditions} onChange={handleChange} />
                  <Input label="Médicaments" name="medications" as="textarea" rows="2" value={form.medications} onChange={handleChange} />
                  <Input label="Antécédents médicaux" name="medicalHistory" as="textarea" rows="2" value={form.medicalHistory} onChange={handleChange} />
                  <div className="edit-row-2">
                    <Input label="Poids (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} />
                    <Input label="Taille (cm)" name="height" type="number" value={form.height} onChange={handleChange} />
                  </div>
                  <Input label="Médecin référent" name="doctorName" value={form.doctorName} onChange={handleChange} />
                  <Input label="Consignes médicales" name="criticalInstructions" as="textarea" rows="3" value={form.criticalInstructions} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* ═══ SECTION 3: EMERGENCY ═══ */}
            {activeSection === "emergency" && (
              <div className="edit-section-card">
                <div className="edit-section-header">
                  <span className="edit-section-icon edit-section-icon-red">🚨</span>
                  <div>
                    <strong>Contacts d'urgence</strong>
                    <span>Personnes à contacter en cas d'urgence</span>
                  </div>
                </div>
                <div className="edit-fields">
                  <Input label="Contact d'urgence principal" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
                  <Input label="Contact d'urgence secondaire" name="secondaryContact" value={form.secondaryContact} onChange={handleChange} />
                  <Input label="Numéro du médecin" name="doctorPhone" type="tel" value={form.doctorPhone} onChange={handleChange} />
                </div>

                {form.emergencyContact && (() => {
                  const phoneMatch = form.emergencyContact.match(/(\+?\d[\d\s\-.]{6,})/);
                  const phone = phoneMatch ? phoneMatch[1].replace(/\s/g, "") : null;
                  return phone ? (
                    <a href={`tel:${phone}`} className="edit-emergency-call">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Appeler maintenant
                    </a>
                  ) : null;
                })()}
              </div>
            )}

            {/* ═══ SECTION 4: DOCUMENTS ═══ */}
            {activeSection === "documents" && (
              <div className="edit-section-card doc-section">
                <div className="edit-section-header">
                  <span className="edit-section-icon edit-section-icon-blue">📄</span>
                  <div>
                    <strong>Dossier médical</strong>
                    <span>Gérez vos documents médicaux en toute sécurité</span>
                  </div>
                </div>

                {/* Stats summary */}
                {documents.length > 0 && (
                  <div className="doc-stats-bar">
                    <div className="doc-stat">
                      <span className="doc-stat-number">{documents.length}</span>
                      <span className="doc-stat-label">Documents</span>
                    </div>
                    <div className="doc-stat">
                      <span className="doc-stat-number">{formatFileSize(documents.reduce((s, d) => s + (d.file_size || 0), 0))}</span>
                      <span className="doc-stat-label">Espace utilisé</span>
                    </div>
                    <div className="doc-stat">
                      <span className="doc-stat-number">{new Set(documents.map((d) => d.category)).size}</span>
                      <span className="doc-stat-label">Catégories</span>
                    </div>
                  </div>
                )}

                {/* Search & Sort Bar */}
                <div className="doc-toolbar">
                  <div className="doc-search-box">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      className="doc-search-input"
                      placeholder="Rechercher par nom, catégorie..."
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                    />
                    {docSearch && (
                      <button type="button" className="doc-search-clear" onClick={() => setDocSearch("")} aria-label="Effacer">✕</button>
                    )}
                  </div>
                  <div className="doc-sort-controls">
                    <select className="doc-sort-select" value={docSortBy} onChange={(e) => setDocSortBy(e.target.value)} aria-label="Trier par">
                      <option value="date">📅 Date</option>
                      <option value="name">🔤 Nom</option>
                      <option value="size">📊 Taille</option>
                    </select>
                    <button
                      type="button"
                      className="doc-sort-order-btn"
                      onClick={() => setDocSortOrder((o) => o === "desc" ? "asc" : "desc")}
                      title={docSortOrder === "desc" ? "Plus récent d'abord" : "Plus ancien d'abord"}
                      aria-label="Ordre de tri"
                    >
                      {docSortOrder === "desc" ? "↓" : "↑"}
                    </button>
                  </div>
                </div>

                {/* Category Filter Chips */}
                <div className="doc-category-chips">
                  {DOC_CATEGORIES.map((cat) => {
                    const count = cat.id === "all"
                      ? documents.length
                      : documents.filter((d) => d.category === cat.id).length;
                    if (cat.id !== "all" && count === 0 && documents.length > 0) return null;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`doc-category-chip ${docCategory === cat.id ? "is-active" : ""}`}
                        onClick={() => setDocCategory(cat.id)}
                      >
                        <span className="doc-chip-icon">{cat.icon}</span>
                        <span className="doc-chip-label">{cat.label}</span>
                        {count > 0 && <span className="doc-chip-count">{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Upload Zone */}
                <div className="doc-upload-wrapper">
                  <div className="doc-upload-header">
                    <strong>Ajouter un document</strong>
                    <div className="doc-upload-category-select">
                      <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} aria-label="Catégorie du document">
                        {DOC_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                          <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isUploading ? (
                    <div className="doc-upload-progress">
                      <div className="doc-upload-progress-info">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1a5fb4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <div className="doc-upload-progress-text">
                          <strong>{uploadFileName}</strong>
                          <span>Upload en cours... {uploadProgress}%</span>
                        </div>
                      </div>
                      <div className="doc-upload-progress-bar">
                        <div className="doc-upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="doc-upload-zone" htmlFor="doc-file-input">
                      <div className="doc-upload-icon-circle">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a5fb4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <strong>Cliquez ou glissez un fichier ici</strong>
                      <span>PDF, JPEG, PNG, WebP — Max 10MB</span>
                    </label>
                  )}
                  <input
                    id="doc-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Upload success toast */}
                {uploadSuccess && (
                  <div className="doc-toast doc-toast-success">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                {/* Documents list filtered & sorted */}
                {(() => {
                  let filtered = [...documents];

                  if (docCategory !== "all") {
                    filtered = filtered.filter((d) => d.category === docCategory);
                  }

                  if (docSearch.trim()) {
                    const term = docSearch.toLowerCase();
                    filtered = filtered.filter((d) =>
                      d.file_name?.toLowerCase().includes(term) ||
                      d.notes?.toLowerCase().includes(term) ||
                      d.category?.toLowerCase().includes(term)
                    );
                  }

                  filtered.sort((a, b) => {
                    let cmp = 0;
                    if (docSortBy === "name") {
                      cmp = (a.file_name || "").localeCompare(b.file_name || "");
                    } else if (docSortBy === "size") {
                      cmp = (a.file_size || 0) - (b.file_size || 0);
                    } else {
                      cmp = new Date(a.created_at || 0) - new Date(b.created_at || 0);
                    }
                    return docSortOrder === "desc" ? -cmp : cmp;
                  });

                  if (filtered.length > 0) {
                    return (
                      <div className="doc-list-section">
                        <div className="doc-list-header">
                          <span className="doc-results-count">
                            {filtered.length} document{filtered.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="doc-list">
                          {filtered.map((doc) => {
                            const catInfo = DOC_CATEGORIES.find((c) => c.id === doc.category) || DOC_CATEGORIES[DOC_CATEGORIES.length - 1];
                            const isPdf = doc.file_type?.includes("pdf");
                            return (
                              <div key={doc.id} className="doc-item">
                                <div className={`doc-item-icon ${isPdf ? "doc-icon-pdf" : "doc-icon-img"}`}>
                                  {catInfo.icon}
                                </div>
                                <div className="doc-item-body">
                                  <div className="doc-item-info">
                                    <strong className="doc-item-name">{doc.file_name}</strong>
                                    <div className="doc-item-meta">
                                      <span className="doc-item-category-badge">{catInfo.label}</span>
                                      <span className="doc-item-size">{formatFileSize(doc.file_size)}</span>
                                      {doc.created_at && <span className="doc-item-date">{formatDate(doc.created_at)}</span>}
                                    </div>
                                  </div>
                                  <div className="doc-item-actions">
                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="doc-action-btn doc-action-view" title="Ouvrir">
                                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    </a>
                                    {deleteConfirm === doc.id ? (
                                      <div className="doc-delete-confirm">
                                        <button type="button" className="doc-action-btn doc-action-confirm-yes" onClick={() => handleDeleteDoc(doc.id)} title="Confirmer">✓</button>
                                        <button type="button" className="doc-action-btn doc-action-confirm-no" onClick={() => setDeleteConfirm(null)} title="Annuler">✕</button>
                                      </div>
                                    ) : (
                                      <button type="button" className="doc-action-btn doc-action-delete" onClick={() => setDeleteConfirm(doc.id)} title="Supprimer">
                                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="doc-empty-state">
                      <div className="doc-empty-icon">📂</div>
                      <strong>
                        {docSearch || docCategory !== "all"
                          ? "Aucun résultat"
                          : "Aucun document"}
                      </strong>
                      <p>
                        {docSearch || docCategory !== "all"
                          ? "Essayez de modifier votre recherche ou vos filtres."
                          : "Commencez par ajouter vos ordonnances, analyses ou radios."}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ═══ SECTION 5: PRIVACY ═══ */}
            {activeSection === "privacy" && (
              <div className="edit-section-card">
                <div className="edit-section-header">
                  <span className="edit-section-icon edit-section-icon-purple">🔒</span>
                  <div>
                    <strong>Sécurité et confidentialité</strong>
                    <span>Contrôlez la visibilité de vos données</span>
                  </div>
                </div>
                <div className="edit-fields">
                  <div className="edit-field-group">
                    <label className="field-group">
                      <span className="field-label">Niveau de visibilité du QR Code</span>
                      <select className="field-input field-select" name="qrVisibility" value={form.qrVisibility} onChange={handleChange}>
                        <option value="full">Complet — Toutes les infos d'urgence</option>
                        <option value="minimal">Minimal — Nom + groupe sanguin</option>
                        <option value="contact">Contact — Uniquement le contact d'urgence</option>
                      </select>
                    </label>
                  </div>

                  <div className="edit-privacy-info">
                    <div className="edit-privacy-row">
                      <span>🛡️</span>
                      <div>
                        <strong>Autorisations de partage</strong>
                        <span>Seules les personnes qui scannent votre QR peuvent voir vos infos d'urgence.</span>
                      </div>
                    </div>
                    <div className="edit-privacy-row">
                      <span>📊</span>
                      <div>
                        <strong>Historique des scans</strong>
                        <span>Consultez qui a scanné votre QR dans le tableau de bord.</span>
                      </div>
                    </div>
                    <div className="edit-privacy-row">
                      <span>🔐</span>
                      <div>
                        <strong>Paramètres de confidentialité</strong>
                        <span>Vos données sont chiffrées et stockées de manière sécurisée.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="edit-submit-btn" disabled={isSaving}>
              {isSaving ? t.saving : t.saveChanges}
            </button>

            {error && <p className="edit-feedback edit-feedback-error">{error}</p>}
            {success && <p className="edit-feedback edit-feedback-success">{success}</p>}
          </form>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
