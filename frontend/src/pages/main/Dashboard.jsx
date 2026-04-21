import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import InfoCard from "../../components/medical/InfoCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";
import { formatList, getInitials } from "../../utils/helpers.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const shortcuts = [
    {
      title: "Generalite",
      subtitle: "Nom, email, telephone, ville",
      route: ROUTES.editProfile,
      symbol: "G",
    },
    {
      title: "Medical",
      subtitle: "Allergies, pathologies, medicaments",
      route: ROUTES.medicalForm,
      symbol: "M",
    },
    {
      title: "Profil complet",
      subtitle: "Voir la carte medicale complete",
      route: ROUTES.profile,
      symbol: "P",
    },
  ];
  const readinessItems = [
    ["Contact d'urgence", user?.emergencyContact || "Non renseigne"],
    ["Consignes critiques", user?.criticalInstructions || user?.notes || "Non renseigne"],
    ["QR public", user?.qrToken ? "Active" : "A generer"],
  ];

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Bord" subtitle={`Compte de ${user?.fullName?.split(" ")[0] || "Utilisateur"}`} />

        <div className="app-content">
          <Card className="profile-summary-card board-profile-card">
            <div className="profile-summary-row">
              <span className="profile-avatar">{getInitials(user?.fullName || "LL")}</span>
              <div className="profile-summary-copy">
                <strong>{user?.fullName}</strong>
                <span>{user?.email}</span>
              </div>
              <span className="status-chip">{user?.bloodType || "O+"}</span>
            </div>
            <div className="profile-list board-readiness-list">
              <div className="profile-line">
                <span>Nom</span>
                <strong>{user?.fullName || "Non renseigne"}</strong>
              </div>
              <div className="profile-line">
                <span>Email</span>
                <strong>{user?.email || "Non renseigne"}</strong>
              </div>
            </div>
            <p className="section-copy board-profile-copy">
              Cet espace sert a gerer votre compte medical, verifier les donnees enregistrees
              et completer les informations d'urgence.
            </p>
          </Card>

          <div className="info-grid board-info-grid">
            <InfoCard label="Pathologies" value={formatList(user?.conditions)} />
            <InfoCard label="Medicaments" value={formatList(user?.medications)} tone="soft" />
          </div>

          <Card className="menu-card board-menu-card">
            <div className="menu-list">
              {shortcuts.map((item, index) => (
                <button
                  key={item.route}
                  type="button"
                  className={`menu-item ${index === 1 ? "menu-item-primary" : ""}`}
                  onClick={() => navigate(item.route)}
                >
                  <span className="menu-icon">{item.symbol}</span>
                  <div className="menu-item-copy">
                    <strong>{item.title}</strong>
                    <p>{item.subtitle}</p>
                  </div>
                  <span className="menu-arrow">{">"}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="board-readiness-card">
            <div className="card-top-row">
              <span className="soft-badge">Etat medical</span>
              <span className="status-chip">Compte actif</span>
            </div>
            <div className="profile-list board-readiness-list">
              {readinessItems.map(([label, value]) => (
                <div key={label} className="profile-line">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="split-actions">
              <Button block onClick={() => navigate(ROUTES.medicalForm)}>
                Modifier urgence
              </Button>
              <Button block variant="secondary" onClick={() => navigate(ROUTES.editProfile)}>
                Modifier compte
              </Button>
              <Button
                block
                variant="ghost"
                onClick={async () => {
                  await logout();
                  navigate(ROUTES.login, { replace: true });
                }}
              >
                Se deconnecter
              </Button>
            </div>
          </Card>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
