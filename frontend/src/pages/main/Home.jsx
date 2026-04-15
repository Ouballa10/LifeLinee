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
  const actions = [
    {
      title: "Urgence",
      subtitle: "Ouvrir ma fiche secouriste publique",
      route: user?.qrToken ? `${ROUTES.emergency}/${user.qrToken}` : ROUTES.qr,
      symbol: "U",
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
      title: "Mon profil",
      subtitle: "Consulter et corriger mes informations",
      route: ROUTES.profile,
      symbol: "P",
    },
  ];
  const lastScanLabel = appState.lastScan ? "Dernier scan enregistre" : "Aucun scan recent";

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Accueil" subtitle={`Bonjour, ${firstName(user?.fullName)},`} />

        <div className="app-content">
          <Card className="dashboard-welcome-card home-hero-card">
            <div className="card-top-row">
              <span className="soft-badge">Centre d'action</span>
              <span className="status-chip">Pret maintenant</span>
            </div>
            <p className="section-copy">
              Accedez rapidement au QR, au scanner et a la fiche d'urgence sans
              passer par les reglages du compte.
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

          <Card className="home-scan-card">
            <div className="card-top-row">
              <span className="soft-badge">Activite</span>
              <span className="status-chip">{appState.scannerPermission ? "Camera ok" : "Camera off"}</span>
            </div>
            <strong>{lastScanLabel}</strong>
            <p className="section-copy">
              {appState.lastScan
                ? "Un QR a ete lu sur cet appareil. Vous pouvez rouvrir la fiche medicale si besoin."
                : "Aucun QR n'a encore ete scanne sur cet appareil."}
            </p>
            <div className="split-actions">
              <Button block onClick={() => navigate(ROUTES.scanner)}>
                Ouvrir scanner
              </Button>
              <Button block variant="secondary" onClick={() => navigate(ROUTES.qr)}>
                Voir mon QR
              </Button>
            </div>
          </Card>

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
