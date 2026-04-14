import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";

export default function MedicalForm() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    allergies: user?.allergies || "",
    conditions: user?.conditions || "",
    medications: user?.medications || "",
    emergencyContact: user?.emergencyContact || "",
    notes: user?.criticalInstructions || user?.notes || "",
  });

  useEffect(() => {
    setForm({
      allergies: user?.allergies || "",
      conditions: user?.conditions || "",
      medications: user?.medications || "",
      emergencyContact: user?.emergencyContact || "",
      notes: user?.criticalInstructions || user?.notes || "",
    });
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await updateProfile(form);
    navigate(ROUTES.dashboard, { replace: true });
  }

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Modifier le profil" subtitle="Groupe medical" />

        <div className="app-content">
          <Card className="edit-form-card">
            <div className="segmented-tabs" aria-hidden="true">
              <span className="tab-pill is-active">Groupe medical</span>
              <span className="tab-pill">Generalite</span>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <Input label="Allergies" name="allergies" value={form.allergies} onChange={handleChange} />
              <Input label="Maladies chroniques" name="conditions" value={form.conditions} onChange={handleChange} />
              <Input label="Medicaments" name="medications" as="textarea" rows="3" value={form.medications} onChange={handleChange} />
              <Input label="Contact d'urgence" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
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
