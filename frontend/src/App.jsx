import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import InstallBanner from "./components/ui/InstallBanner.jsx";
import "./styles/variables.css";
import "./styles/main.css";
import "./styles/auth.css";
import "./styles/auth-aurora.css";
import "./styles/profile.css";
import "./styles/emergency.css";
import "./styles/emergency-new.css";
import "./styles/app-redesign.css";
import "./styles/home.css";
import "./styles/dashboard.css";
import "./styles/profile-new.css";
import "./styles/doc-section.css";
import "./styles/qr-scanner.css";
import "./styles/dossier.css";
import "./styles/dark-mode.css";
import "./styles/luxury.css";
import "./styles/home-luxury.css";
import "./styles/pwa.css";
import "./styles/splash-premium.css";
import "./styles/home-premium.css";
import "./styles/dashboard-premium.css";

function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }

    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="offline-notice" role="status" aria-live="polite">
      <strong>Mode hors ligne</strong>
      <span>LifeLine fonctionne actuellement sans connexion Internet.</span>
    </div>
  );
}

function App() {
  return (
    <>
      <OfflineNotice />
      <AppRoutes />
      <InstallBanner />
    </>
  );
}

export default App;
