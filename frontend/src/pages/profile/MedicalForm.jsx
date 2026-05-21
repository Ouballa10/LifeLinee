import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useLang } from "../../context/LanguageContext.jsx";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { ROUTES } from "../../utils/constants.js";

function buildMedicalForm(user) {
  return {
    allergies: user?.allergies || "",
    conditions: user?.conditions || "",
    medications: user?.medications || "",
    emergencyContact: user?.emergencyContact || "",
    doctorName: user?.doctorName || "",
    notes: user?.criticalInstructions || user?.notes || "",
  };
}

export default function MedicalForm() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState(() => buildMedicalForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const activeProfileRef = useRef("");
  const isEditingRef = useRef(false);
  const profileIdentity = `${user?.authProvider || ""}:${user?.id || user?.email || ""}`;

  useEffect(() => {
    if (activeProfileRef.current !== profileIdentity) {
      activeProfileRef.current = profileIdentity;
      isEditingRef.current = false;
    }
    if (!isEditingRef.current) setForm(buildMedicalForm(user));
  }, [profileIdentity, user?.allergies, user?.conditions, user?.medications, user?.emergencyContact, user?.doctorName, user?.criticalInstructions, user?.notes]);

  function handleChange(event) {
    const { name, value } = event.target;
    isEditingRef.current = true;
    setForm((c) => ({ ...c, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(form);
      isEditingRef.current = false;
      navigate(ROUTES.profile, { replace: true });
    } finally { setIsSaving(false); }
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
            <h1 className="home-greeting">{t.medicalFormTitle}</h1>
            <p className="home-greeting-sub">{t.medicalFormSub}</p>
          </section>

          {/* Tabs */}
          <div className="edit-tabs">
            <button type="button" className="edit-tab" onClick={() => navigate(ROUTES.editProfile)}>{t.general}</button>
            <button type="button" className="edit-tab is-active">{t.medical}</button>
          </div>

          {/* Form */}
          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="edit-field-group">
              <Input label={t.allergiesLabel} name="allergies" value={form.allergies} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label={t.chronicDiseasesLabel} name="conditions" value={form.conditions} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label={t.medicationsLabel} name="medications" as="textarea" rows="3" value={form.medications} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label={t.emergencyContact} name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label={t.doctorName} name="doctorName" value={form.doctorName} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label={t.criticalInstructions} name="notes" as="textarea" rows="4" value={form.notes} onChange={handleChange} />
            </div>

            <button type="submit" className="edit-submit-btn" disabled={isSaving}>
              {isSaving ? t.saving : t.saveChanges}
            </button>
          </form>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
