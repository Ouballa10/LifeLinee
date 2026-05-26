/**
 * LifeLine PWA Install Prompt Hook
 * Captures the beforeinstallprompt event and provides install functionality.
 */

import { useEffect, useState, useCallback } from "react";

let deferredPrompt = null;

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    function handleBeforeInstall(event) {
      event.preventDefault();
      deferredPrompt = event;
      setCanInstall(true);
    }

    function handleAppInstalled() {
      deferredPrompt = null;
      setCanInstall(false);
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // If prompt was already captured before this hook mounted
    if (deferredPrompt) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      setCanInstall(false);

      if (outcome === "accepted") {
        setIsInstalled(true);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, []);

  return { canInstall, isInstalled, install };
}
