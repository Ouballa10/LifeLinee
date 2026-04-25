import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";
import { formatList, getInitials } from "../../utils/helpers.js";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rows = [
    ["Groupe sanguin", user?.bloodType || "O+"],
    ["Allergies", formatList(user?.allergies)],
    ["Pathologies", formatList(user?.conditions)],
    ["Medicaments", formatList(user?.medications)],
    ["Contact", user?.emergencyContact || "Non renseigne"],
    ["Medecin", user?.doctorName || "Non renseigne"],
    ["Consignes critiques", user?.criticalInstructions || user?.notes || "Non renseigne"],
  ];

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Profilime" subtitle="Ma carte medicale" />

        <div className="app-content">
          <Card className="profile-detail-card">
            <div className="profile-hero">
              <span className="profile-avatar profile-avatar-large">{getInitials(user?.fullName || "LL")}</span>
              <div>
                <h2>{user?.fullName}</h2>
                <p>{user?.email}</p>
              </div>
            </div>

            <div className="profile-list">
              {rows.map(([label, value]) => (
                <div key={label} className="profile-line">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="split-actions">
              <Button block onClick={() => navigate(ROUTES.editProfile)}>
                Modifier generalite
              </Button>
              <Button block variant="secondary" onClick={() => navigate(ROUTES.medicalForm)}>
                Modifier medical
              </Button>
            </div>
          </Card>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
