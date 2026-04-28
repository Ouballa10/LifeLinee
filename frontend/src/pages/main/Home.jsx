import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import InfoCard from "../../components/medical/InfoCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";
import { firstName, formatList } from "../../utils/helpers.js";

export default function Home() {
  const navigate = useNavigate();
  const { appState } = useContext(AppContext);
  const { user } = useAuth();
  const profileName = firstName(user?.fullName);
  const actions = [
    {
      title: "Fiche urgence",
      subtitle: "Carte publique pour secouristes",
      route: user?.qrToken ? `${ROUTES.emergency}/${user.qrToken}` : ROUTES.qr,
      symbol: "+",
      primary: true,
    },
    {
      title: "Mon QR Code",
      subtitle: "Afficher et partager la carte",
      route: ROUTES.qr,
      symbol: "Q",
    },
    {
      title: "Scanner QR",
      subtitle: "Lire un code LifeLine",
      route: ROUTES.scanner,
      symbol: "S",
    },
    {
      title: "Mon profil",
      subtitle: "Verifier mes donnees",
      route: ROUTES.profile,
      symbol: "P",
    },
  ];
  const lastScanLabel = appState.lastScan ? "Dernier scan enregistre" : "Aucun scan recent";

  return (
    <main className="screen app-redesign-screen">
      <section className="mobile-shell app-redesign-shell">
        <Navbar title="Accueil" subtitle={`Bonjour ${profileName}`} />

        <div className="app-content app-redesign-content">
          <section className="app-hero-panel home-command-panel">
            <div className="hero-copy">
              <span className="panel-kicker">Centre LifeLine</span>
              <h2>Tout ce qui compte en urgence, pret en un geste</h2>
              <p>
                Gardez votre QR votre fiche medicale et le scanner dans un seul
                
              </p>
            </div>
            <div className="hero-status-card">
              <span>Statut</span>
              <strong>{user?.qrToken ? "QR actif" : "QR a creer"}</strong>
              <small>{user?.bloodType || "O+"} groupe sanguin</small>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading-row">
              <div>
                <span className="panel-kicker">Actions</span>
                <h2 className="section-title">Raccourcis essentiels</h2>
              </div>
              <span className="status-chip redesign-status">Pret</span>
            </div>

            <div className="action-grid">
              {actions.map((action) => (
                <button
                  key={action.route}
                  type="button"
                  className={`action-tile ${action.primary ? "action-tile-primary" : ""}`}
                  onClick={() => navigate(action.route)}
                >
                  <span className="action-symbol">{action.symbol}</span>
                  <span className="action-copy">
                    <strong>{action.title}</strong>
                    <small>{action.subtitle}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="metric-strip">
            <InfoCard label="Groupe sanguin" value={user?.bloodType || "O+"} />
            <InfoCard label="Allergies" value={formatList(user?.allergies)} tone="soft" />
          </section>

          <Card className="app-panel home-activity-panel">
            <div className="panel-title-row">
              <div>
                <span className="panel-kicker">Activite</span>
                <h2 className="section-title">{lastScanLabel}</h2>
              </div>
              <span className="status-chip redesign-status">
                {appState.scannerPermission ? "Camera ok" : "Camera off"}
              </span>
            </div>
            <p className="section-copy">
              {appState.lastScan
                ? "Un QR a ete lu sur cet appareil. Vous pouvez rouvrir la fiche medicale si besoin."
                : "Aucun QR n'a encore ete scanne sur cet appareil."}
            </p>
            <div className="split-actions redesign-actions">
              <Button block onClick={() => navigate(ROUTES.scanner)}>
                Ouvrir scanner
              </Button>
              <Button block variant="secondary" onClick={() => navigate(ROUTES.qr)}>
                Voir mon QR
              </Button>
            </div>
          </Card>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
