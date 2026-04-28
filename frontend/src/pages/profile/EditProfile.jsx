import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";

import { useAuth } from "../../hooks/useAuth.js";
import { BLOOD_GROUPS, ROUTES } from "../../utils/constants.js";

const DEFAULT_BLOOD_TYPE = "O+";

const FORM_FIELDS = [
  {
    label: "Nom complet",
    name: "fullName",
  },
  {
    label: "Groupe sanguin",
    name: "bloodType",
    as: "select",
    options: BLOOD_GROUPS,
  },
  {
    label: "Telephone",
    name: "phone",
  },
  {
    label: "Ville",
    name: "city",
  },
  {
    label: "Email",
    name: "email",
    type: "email",
  },
  {
    label: "Contact d'urgence",
    name: "emergencyContact",
  },
];

function buildGeneralForm(user) {
  return {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    bloodType: user?.bloodType || DEFAULT_BLOOD_TYPE,
    emergencyContact: user?.emergencyContact || "",
  };
}

function getProfileIdentity(user) {
  return `${user?.authProvider || ""}:${user?.id || user?.email || ""}`;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState(() => buildGeneralForm(user));

  const activeProfileRef = useRef("");
  const isEditingRef = useRef(false);

  const profileIdentity = getProfileIdentity(user);

  useEffect(() => {
    const identityChanged = activeProfileRef.current !== profileIdentity;

    if (identityChanged) {
      activeProfileRef.current = profileIdentity;
      isEditingRef.current = false;
    }

    if (!isEditingRef.current) {
      setForm(buildGeneralForm(user));
    }
  }, [
    profileIdentity,
    user?.fullName,
    user?.email,
    user?.phone,
    user?.city,
    user?.bloodType,
    user?.emergencyContact,
  ]);

  function handleChange(event) {
    const { name, value } = event.target;

    isEditingRef.current = true;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await updateProfile(form);

    isEditingRef.current = false;
    navigate(ROUTES.profile, { replace: true });
  }

  function goToMedicalForm() {
    navigate(ROUTES.medicalForm);
  }

  return (
    <main className="screen app-redesign-screen">
      <section className="mobile-shell app-redesign-shell">
        <Navbar title="Modifier le profil" subtitle="Informations generales" />

        <div className="app-content app-redesign-content">
          <section className="form-intro-panel">
            <span className="panel-kicker">Compte</span>
            <h2>Identite et contact</h2>
            <p>
              Ces informations aident les proches et les secours a verifier
              rapidement la bonne fiche.
            </p>
          </section>

          <Card className="app-panel edit-form-card redesign-form-card">
            <div className="segmented-tabs redesign-tabs">
              <button
                type="button"
                className="tab-pill"
                onClick={goToMedicalForm}
              >
                Groupe medical
              </button>

              <button type="button" className="tab-pill is-active">
                Generalite
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {FORM_FIELDS.map((field) => (
                  <Input
                    key={field.name}
                    {...field}
                    value={form[field.name]}
                    onChange={handleChange}
                  />
                ))}
              </div>

              <Button type="submit" block className="form-submit-button">
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