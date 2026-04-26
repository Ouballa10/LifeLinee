import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QrScanner from "qr-scanner";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { useAuth } from "../../hooks/useAuth.js";
import { parseEmergencyQrNavigation } from "../../services/qrService.js";
import { ROUTES } from "../../utils/constants.js";

export default function Scanner() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { appState, saveLastScan, setScannerPermission } = useContext(AppContext);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const scannerRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isPreparingCamera, setIsPreparingCamera] = useState(true);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [detectedValue, setDetectedValue] = useState("");

  useEffect(() => {
    let mounted = true;

    QrScanner.hasCamera()
      .then((available) => {
        if (!mounted) {
          return;
        }

        setHasCamera(available);
        setIsPreparingCamera(false);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setHasCamera(false);
        setIsPreparingCamera(false);
      });

    return () => {
      mounted = false;

      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  function handleDecoded(result) {
    const rawValue = typeof result === "string" ? result : result?.data || "";
    const parsed = parseEmergencyQrNavigation(rawValue);

    setDetectedValue(rawValue);
    saveLastScan(rawValue);

    if (scannerRef.current) {
      scannerRef.current.stop();
      setIsScannerActive(false);
    }

    if (parsed.route) {
      navigate(parsed.route);
    }
  }

  async function startScanner() {
    setScannerError("");

    try {
      if (!videoRef.current) {
        return;
      }

      if (!scannerRef.current) {
        scannerRef.current = new QrScanner(videoRef.current, handleDecoded, {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          overlay: overlayRef.current || undefined,
          maxScansPerSecond: 8,
          returnDetailedScanResult: true,
          onDecodeError: () => {
            return undefined;
          },
        });
      }

      await scannerRef.current.start();
      setScannerPermission(true);
      setIsScannerActive(true);
    } catch (error) {
      setScannerError(
        "Impossible d'acceder a la camera. Verifiez l'autorisation ou utilisez une image QR."
      );
      setIsScannerActive(false);
    }
  }

  function stopScanner() {
    if (!scannerRef.current) {
      return;
    }

    scannerRef.current.stop();
    setIsScannerActive(false);
  }

  async function handleImageScan(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setScannerError("");
    setIsReadingFile(true);

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });

      handleDecoded(result);
    } catch {
      setScannerError("Aucun QR valide n'a ete detecte dans cette image.");
    } finally {
      setIsReadingFile(false);
      event.target.value = "";
    }
  }

  const scannedNavigation = parseEmergencyQrNavigation(appState.lastScan || detectedValue);
  const scannerName = user?.fullName || "Scanner public";
  const scannerSubtitle = user?.email || "Aucun compte requis";

  return (
    <main className="screen app-redesign-screen">
      <section
        className={`mobile-shell app-redesign-shell scanner-shell ${
          !isAuthenticated ? "scanner-shell-public" : ""
        }`}
      >
        {isAuthenticated ? (
          <Navbar title="Scanner QR" subtitle="Lecture camera en direct" />
        ) : (
          <header className="public-scanner-header">
            <Link to={ROUTES.splash} className="public-scanner-brand">
              <span className="public-scanner-logo">
                <img className="lifeline-logo-image" src={lifelineLogo} alt="LifeLine" />
              </span>
              <span>
                <strong>LifeLine</strong>
                <small>Scanner QR medical</small>
              </span>
            </Link>

            <div className="public-scanner-links">
              <Link to={ROUTES.login}>Login</Link>
              <Link to={ROUTES.register}>Compte</Link>
            </div>
          </header>
        )}

        <div className="app-content app-redesign-content">
          <section className="form-intro-panel scanner-intro-panel">
            <span className="panel-kicker">Scanner</span>
            <h2>Cadrez un QR LifeLine.</h2>
            <p>
              La lecture ouvre automatiquement la fiche medicale publique quand
              le token est reconnu.
            </p>
          </section>

          <Card className="app-panel scanner-card scanner-card-light redesign-scanner-panel">
            <div className="scanner-video-shell redesign-video-shell">
              <div className="scanner-video-wrap">
                <video ref={videoRef} className="scanner-video" muted playsInline />
                <div ref={overlayRef} className="scanner-overlay" aria-hidden="true"></div>
              </div>

              {!isScannerActive ? (
                <div className="scanner-placeholder">
                  <span className="soft-badge">Camera QR</span>
                  <strong>{scannerName}</strong>
                  <span>{scannerSubtitle}</span>
                </div>
              ) : null}
            </div>

            <div className="scanner-profile-row scanner-toolbar redesign-scanner-toolbar">
              <div>
                <strong>{scannerName}</strong>
                <span>{scannerSubtitle}</span>
              </div>

              <span className="status-chip">
                {isScannerActive ? "Camera active" : "En attente"}
              </span>
            </div>

            <div className="scanner-actions redesign-actions">
              <Button onClick={startScanner} disabled={isPreparingCamera || !hasCamera}>
                {isScannerActive ? "Camera active" : "Autoriser"}
              </Button>
              <Button
                variant="accent"
                onClick={isScannerActive ? stopScanner : startScanner}
                disabled={isPreparingCamera || !hasCamera}
              >
                {isScannerActive ? "Arreter" : "Scanner"}
              </Button>
            </div>

            <label className="scanner-upload" htmlFor="scanner-file">
              Importer une image QR
            </label>
            <input
              id="scanner-file"
              className="scanner-file-input"
              type="file"
              accept="image/*"
              onChange={handleImageScan}
            />

            <p className="scanner-help">
              {isPreparingCamera
                ? "Verification de la camera..."
                : hasCamera
                  ? "Scannez un QR LifeLine ou importez une image pour le lire."
                  : "Aucune camera detectee. Utilisez l'import d'image pour tester le scan."}
            </p>

            {isReadingFile ? (
              <p className="scanner-help">Lecture de l'image en cours...</p>
            ) : null}

            {scannerError ? <p className="scanner-error">{scannerError}</p> : null}
          </Card>

          {appState.lastScan ? (
            <Card className="app-panel result-card">
              <p className="section-copy">QR detecte avec succes.</p>
              {scannedNavigation.route ? (
                <Link to={scannedNavigation.route} className="button button-primary">
                  Voir la fiche medicale
                </Link>
              ) : (
                <p className="scanner-help scanner-help-inline">
                  QR lu, mais il ne contient pas un token d'urgence LifeLine valide.
                </p>
              )}
            </Card>
          ) : null}

          {!isAuthenticated ? (
            <Card className="app-panel scanner-public-cta">
              <strong>Gardez votre propre QR LifeLine</strong>
              <p className="section-copy">
                Creez un compte pour enregistrer vos informations medicales et generer votre QR personnel.
              </p>
              <div className="split-actions redesign-actions">
                <Link to={ROUTES.register} className="button button-primary">
                  Creer un compte
                </Link>
                <Link to={ROUTES.login} className="button button-secondary">
                  Se connecter
                </Link>
              </div>
            </Card>
          ) : null}
        </div>

        {isAuthenticated ? <BottomNav /> : null}
      </section>
    </main>
  );
}
