import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { BLOOD_GROUPS, ROUTES } from "../../utils/constants.js";

const SECTIONS = [
  { id: "personal", icon: "👤", label: "Informations personnelles" },
  { id: "health", icon: "🩺", label: "Informations médicales" },
  { id: "emergency", icon: "🚨", label: "Contacts d'urgence" },
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

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState(() => buildForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("personal");
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

            {/* ═══ SECTION 4: PRIVACY ═══ */}
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
