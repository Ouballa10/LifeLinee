import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { BLOOD_GROUPS, ROUTES } from "../../utils/constants.js";

function buildGeneralForm(user) {
  return {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    bloodType: user?.bloodType || "O+",
    emergencyContact: user?.emergencyContact || "",
  };
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => buildGeneralForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const activeProfileRef = useRef("");
  const isEditingRef = useRef(false);
  const profileIdentity = `${user?.authProvider || ""}:${user?.id || user?.email || ""}`;

  useEffect(() => {
    if (activeProfileRef.current !== profileIdentity) {
      activeProfileRef.current = profileIdentity;
      isEditingRef.current = false;
    }
    if (!isEditingRef.current) setForm(buildGeneralForm(user));
  }, [profileIdentity, user?.fullName, user?.email, user?.phone, user?.city, user?.bloodType, user?.emergencyContact]);

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
            <h1 className="home-greeting">Modifier le profil</h1>
            <p className="home-greeting-sub">Mettez a jour vos informations personnelles et de contact.</p>
          </section>

          {/* Tabs */}
          <div className="edit-tabs">
            <button type="button" className="edit-tab is-active">Generalite</button>
            <button type="button" className="edit-tab" onClick={() => navigate(ROUTES.medicalForm)}>Medical</button>
          </div>

          {/* Form */}
          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="edit-field-group">
              <Input label="Nom complet" name="fullName" value={form.fullName} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label="Telephone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label="Ville" name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label="Groupe sanguin" name="bloodType" as="select" options={BLOOD_GROUPS} value={form.bloodType} onChange={handleChange} />
            </div>
            <div className="edit-field-group">
              <Input label="Contact d'urgence" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
            </div>

            <button type="submit" className="edit-submit-btn" disabled={isSaving}>
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
