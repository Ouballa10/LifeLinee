import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import "./styles/variables.css";
import "./styles/main.css";
import "./styles/auth.css";
import "./styles/profile.css";
import "./styles/emergency.css";
import "./styles/app-redesign.css";
import "./styles/login.css";

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
    </>
  );
}

export default App;
