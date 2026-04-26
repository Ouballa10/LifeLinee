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
  ];
  const supportRows = [
    ["Contact", user?.emergencyContact || "Non renseigne"],
    ["Medecin", user?.doctorName || "Non renseigne"],
    ["Consignes critiques", user?.criticalInstructions || user?.notes || "Non renseigne"],
  ];

  return (
    <main className="screen app-redesign-screen">
      <section className="mobile-shell app-redesign-shell">
        <Navbar title="Profil" subtitle="Carte medicale personnelle" />

        <div className="app-content app-redesign-content">
          <section className="profile-passport">
            <div className="profile-passport-main">
              <span className="profile-avatar profile-avatar-large redesign-avatar">
                {getInitials(user?.fullName || "LL")}
              </span>
              <div>
                <span className="panel-kicker">Passeport LifeLine</span>
                <h2>{user?.fullName}</h2>
                <p>{user?.email}</p>
              </div>
            </div>
            <span className="blood-large">{user?.bloodType || "O+"}</span>
          </section>

          <Card className="app-panel profile-detail-card">
            <div className="panel-title-row">
              <div>
                <span className="panel-kicker">Medical</span>
                <h2 className="section-title">Informations critiques</h2>
              </div>
            </div>
            <div className="data-list">
              {rows.map(([label, value]) => (
                <div key={label} className="data-row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card className="app-panel profile-detail-card">
            <div className="panel-title-row">
              <div>
                <span className="panel-kicker">Support</span>
                <h2 className="section-title">Contacts et consignes</h2>
              </div>
            </div>
            <div className="data-list">
              {supportRows.map(([label, value]) => (
                <div key={label} className="data-row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card className="app-panel action-footer-panel">
            <div className="split-actions redesign-actions">
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
