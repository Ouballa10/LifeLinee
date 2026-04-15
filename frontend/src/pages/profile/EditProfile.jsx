import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { BLOOD_GROUPS, ROUTES } from "../../utils/constants.js";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    bloodType: user?.bloodType || "O+",
    emergencyContact: user?.emergencyContact || "",
  });

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      city: user?.city || "",
      bloodType: user?.bloodType || "O+",
      emergencyContact: user?.emergencyContact || "",
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
    navigate(ROUTES.profile, { replace: true });
  }

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Modifier le profil" subtitle="Informations generales" />

        <div className="app-content">
          <Card className="edit-form-card">
            <div className="segmented-tabs">
              <button
                type="button"
                className="tab-pill"
                onClick={() => navigate(ROUTES.medicalForm)}
              >
                Groupe medical
              </button>
              <button type="button" className="tab-pill is-active">
                Generalite
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <Input label="Nom complet" name="fullName" value={form.fullName} onChange={handleChange} />
              <Input label="Groupe sanguin" name="bloodType" as="select" options={BLOOD_GROUPS} value={form.bloodType} onChange={handleChange} />
              <Input label="Telephone" name="phone" value={form.phone} onChange={handleChange} />
              <Input label="Ville" name="city" value={form.city} onChange={handleChange} />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
              <Input label="Contact d'urgence" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
              <Button type="submit" block>
                Modifier le profil
              </Button>
            </form>
          </Card>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
