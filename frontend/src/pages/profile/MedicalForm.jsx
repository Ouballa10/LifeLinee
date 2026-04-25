import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
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
  const [form, setForm] = useState(() => buildMedicalForm(user));
  const activeProfileRef = useRef("");
  const isEditingRef = useRef(false);
  const profileIdentity = `${user?.authProvider || ""}:${user?.id || user?.email || ""}`;

  useEffect(() => {
    const identityChanged = activeProfileRef.current !== profileIdentity;

    if (identityChanged) {
      activeProfileRef.current = profileIdentity;
      isEditingRef.current = false;
    }

    if (isEditingRef.current) {
      return;
    }

    setForm(buildMedicalForm(user));
  }, [
    profileIdentity,
    user?.allergies,
    user?.conditions,
    user?.medications,
    user?.emergencyContact,
    user?.doctorName,
    user?.criticalInstructions,
    user?.notes,
  ]);

  function handleChange(event) {
    const { name, value } = event.target;
    isEditingRef.current = true;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await updateProfile(form);
    isEditingRef.current = false;
    navigate(ROUTES.profile, { replace: true });
  }

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Modifier le profil" subtitle="Groupe medical" />

        <div className="app-content">
          <Card className="edit-form-card">
            <div className="segmented-tabs">
              <button type="button" className="tab-pill is-active">
                Groupe medical
              </button>
              <button
                type="button"
                className="tab-pill"
                onClick={() => navigate(ROUTES.editProfile)}
              >
                Generalite
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <Input label="Allergies" name="allergies" value={form.allergies} onChange={handleChange} />
              <Input label="Maladies chroniques" name="conditions" value={form.conditions} onChange={handleChange} />
              <Input label="Medicaments" name="medications" as="textarea" rows="3" value={form.medications} onChange={handleChange} />
              <Input label="Contact d'urgence" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
              <Input label="Medecin referent" name="doctorName" value={form.doctorName} onChange={handleChange} />
              <Input label="Consignes d'urgence" name="notes" as="textarea" rows="4" value={form.notes} onChange={handleChange} />
              <Button type="submit" block>
                Enregistrer
              </Button>
            </form>
          </Card>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
