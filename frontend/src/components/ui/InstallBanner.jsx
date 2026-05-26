import { useState, useEffect } from "react";
import { useInstallPrompt } from "../../pwa/useInstallPrompt.js";

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function IOSInstallGuide({ onDismiss }) {
  return (
    <div className="install-banner install-banner--ios" role="banner" aria-label="Installer l'application">
      <div className="install-banner__content">
        <div className="install-banner__icon">📲</div>
        <div className="install-banner__text">
          <strong>Installer LifeLine</strong>
          <span>
            Appuyez sur{" "}
            <span className="install-banner__share-icon" aria-label="icône partager">
              ⬆️
            </span>{" "}
            puis <strong>« Sur l'écran d'accueil »</strong>
          </span>
        </div>
      </div>
      <div className="install-banner__actions">
        <button
          className="install-banner__btn install-banner__btn--dismiss"
          onClick={onDismiss}
          type="button"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function InstallBanner() {
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem("lifeline.installDismissed") === "1";
  });
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Show iOS guide if on iOS, not already installed, and not dismissed
    if (isIOS() && !isInStandaloneMode() && !dismissed) {
      setShowIOSGuide(true);
    }
  }, [dismissed]);

  function handleDismiss() {
    setDismissed(true);
    setShowIOSGuide(false);
    sessionStorage.setItem("lifeline.installDismissed", "1");
  }

  // Already installed or dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  // iOS: show manual install guide
  if (showIOSGuide) {
    return <IOSInstallGuide onDismiss={handleDismiss} />;
  }

  // Android/Chrome: show native install prompt
  if (!canInstall) {
    return null;
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
