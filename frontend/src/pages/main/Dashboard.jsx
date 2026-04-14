import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";
import { getInitials } from "../../utils/helpers.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const shortcuts = [
    {
      title: "Mon profil",
      subtitle: "Autonomie",
      route: ROUTES.profile,
      symbol: "M",
    },
    {
      title: "Mon QR Code",
      subtitle: "Acces medical",
      route: ROUTES.qr,
      symbol: "Q",
    },
    {
      title: "Scanner QR",
      subtitle: "Lecture rapide",
      route: ROUTES.scanner,
      symbol: "S",
    },
  ];

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Profil" subtitle={`Bonjour, ${user?.fullName?.split(" ")[0] || "Utilisateur"}`} />

        <div className="app-content">
          <Card className="profile-summary-card">
            <div className="profile-summary-row">
              <span className="profile-avatar">{getInitials(user?.fullName || "LL")}</span>
              <div className="profile-summary-copy">
                <strong>{user?.fullName}</strong>
                <span>{user?.email}</span>
              </div>
              <span className="status-chip">{user?.bloodType || "O+"}</span>
            </div>
          </Card>

          <Card className="menu-card">
            <div className="menu-list">
              {shortcuts.map((item, index) => (
                <button
                  key={item.route}
                  type="button"
                  className={`menu-item ${index === 0 ? "menu-item-primary" : ""}`}
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

          <Button block onClick={() => navigate(ROUTES.medicalForm)}>
            Urgence mes infos
          </Button>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
