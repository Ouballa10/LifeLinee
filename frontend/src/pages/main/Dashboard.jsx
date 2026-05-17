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
      title: "Identite",
      subtitle: "Nom, email, telephone, ville",
      route: ROUTES.editProfile,
      symbol: "G",
    },
    {
      title: "Sante",
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
  const readinessFields = [
    user?.fullName,
    user?.bloodType,
    user?.allergies,
    user?.conditions,
    user?.medications,
    user?.emergencyContact,
    user?.criticalInstructions || user?.notes,
  ];
  const readinessScore = Math.round(
    (readinessFields.filter(Boolean).length / readinessFields.length) * 100
  );

  return (
    <main className="screen app-redesign-screen">
      <section className="mobile-shell app-redesign-shell">
        <Navbar title="Bord" subtitle={`Compte de ${user?.fullName?.split(" ")[0] || "Utilisateur"}`} />

        <div className="app-content app-redesign-content">
          <section className="app-hero-panel dashboard-control-panel">
            <div className="hero-copy">
              <span className="panel-kicker">Tableau de bord</span>
              <h2>Votre dossier medical est complet a {readinessScore}%.</h2>
              <p>
                Completez les elements critiques pour rendre la fiche plus utile
                quand chaque seconde compte.
              </p>
            </div>
            <div
              className="readiness-ring"
              style={{ "--lx-progress": readinessScore }}
              aria-label={`Dossier complete a ${readinessScore}%`}
            >
              <span>{readinessScore}</span>
              <small>%</small>
            </div>
          </section>

          <Card className="app-panel profile-identity-panel">
            <div className="profile-summary-row redesign-profile-row">
              <span className="profile-avatar redesign-avatar">{getInitials(user?.fullName || "LL")}</span>
              <div className="profile-summary-copy">
                <span className="panel-kicker">Profil principal</span>
                <strong>{user?.fullName || "Non renseigne"}</strong>
                <span>{user?.email || "Non renseigne"}</span>
              </div>
              <span className="status-chip redesign-status">{user?.bloodType || "O+"}</span>
            </div>
          </Card>

          <section className="metric-strip board-info-grid">
            <InfoCard label="Pathologies" value={formatList(user?.conditions)} />
            <InfoCard label="Medicaments" value={formatList(user?.medications)} tone="soft" />
          </section>

          <section className="section-block">
            <div className="section-heading-row">
              <div>
                <span className="panel-kicker">Edition</span>
                <h2 className="section-title">Mettre a jour</h2>
              </div>
            </div>
            <div className="route-list">
              {shortcuts.map((item, index) => (
                <button
                  key={item.route}
                  type="button"
                  className={`route-row ${index === 1 ? "route-row-primary" : ""}`}
                  onClick={() => navigate(item.route)}
                >
                  <span className="route-symbol">{item.symbol}</span>
                  <span className="route-copy">
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </span>
                  <span className="route-arrow">{">"}</span>
                </button>
              ))}
            </div>
          </section>

          <Card className="app-panel board-readiness-panel">
            <div className="panel-title-row">
              <div>
                <span className="panel-kicker">Etat medical</span>
                <h2 className="section-title">Verification rapide</h2>
              </div>
              <span className="status-chip redesign-status">Compte actif</span>
            </div>
            <div className="data-list">
              {readinessItems.map(([label, value]) => (
                <div key={label} className="data-row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="split-actions redesign-actions">
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
