import { useState } from "react";
import { useInstallPrompt } from "../../pwa/useInstallPrompt.js";

export default function InstallBanner() {
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem("lifeline.installDismissed") === "1";
  });

  if (isInstalled || !canInstall || dismissed) {
    return null;
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("lifeline.installDismissed", "1");
  }

  return (
    <div className="install-banner" role="banner" aria-label="Installer l'application">
      <div className="install-banner__content">
        <div className="install-banner__icon">📲</div>
        <div className="install-banner__text">
          <strong>Installer LifeLine</strong>
          <span>Accès rapide, mode hors ligne et notifications.</span>
        </div>
      </div>
      <div className="install-banner__actions">
        <button
          className="install-banner__btn install-banner__btn--install"
          onClick={install}
          type="button"
        >
          Installer
        </button>
        <button
          className="install-banner__btn install-banner__btn--dismiss"
          onClick={handleDismiss}
          type="button"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
