import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import InfoCard from "../../components/medical/InfoCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";
import { firstName, formatList } from "../../utils/helpers.js";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const actions = [
    {
      title: "Mon profil",
      subtitle: "Consulter mes informations medicales",
      route: ROUTES.profile,
      symbol: "P",
      primary: true,
    },
    {
      title: "Mon QR Code",
      subtitle: "Afficher et partager ma carte LifeLine",
      route: ROUTES.qr,
      symbol: "Q",
    },
    {
      title: "Scanner QR",
      subtitle: "Lire un code medical rapidement",
      route: ROUTES.scanner,
      symbol: "S",
    },
    {
      title: "Urgence",
      subtitle: "Acces direct a la fiche secouriste",
      route: `${ROUTES.emergency}/${user?.emergencyId}`,
      symbol: "U",
    },
  ];

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Tableau de bord" subtitle={`Bonjour, ${firstName(user?.fullName)},`} />

        <div className="app-content">
          <Card className="dashboard-welcome-card">
            <div className="card-top-row">
              <span className="soft-badge">Profil actif</span>
              <span className="status-chip">Secours pret</span>
            </div>
            <p className="section-copy">
              Accedez en un geste a votre profil, votre QR code et vos outils
              d'urgence.
            </p>
          </Card>

          <Card className="menu-card">
            <div className="menu-list">
              {actions.map((action) => (
                <button
                  key={action.route}
                  type="button"
                  className={`menu-item ${action.primary ? "menu-item-primary" : ""}`}
                  onClick={() => navigate(action.route)}
                >
                  <span className="menu-icon">{action.symbol}</span>
                  <div className="menu-item-copy">
                    <strong>{action.title}</strong>
                    <p>{action.subtitle}</p>
                  </div>
                  <span className="menu-arrow">{">"}</span>
                </button>
              ))}
            </div>
          </Card>

          <div className="info-grid">
            <InfoCard label="Groupe sanguin" value={user?.bloodType || "O+"} />
            <InfoCard label="Allergies" value={formatList(user?.allergies)} tone="soft" />
          </div>

          <Button block onClick={() => navigate(ROUTES.editProfile)}>
            Modifier mes infos
          </Button>

          <div className="footer-dots" aria-hidden="true">
            <span className="footer-dot is-active"></span>
            <span className="footer-dot"></span>
            <span className="footer-dot"></span>
            <span className="footer-dot"></span>
          </div>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
