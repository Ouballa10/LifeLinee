import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QrScanner from "qr-scanner";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { parseEmergencyQrNavigation } from "../../services/qrService.js";

export default function Scanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  return (
    <main className="screen">
      <section className="mobile-shell scanner-shell">
        <Navbar title="Scanner QR" subtitle="Lecture camera en direct" />

        <div className="app-content">
          <Card className="scanner-card scanner-card-light">
            <div className="scanner-video-shell">
              <div className="scanner-video-wrap">
                <video ref={videoRef} className="scanner-video" muted playsInline />
                <div ref={overlayRef} className="scanner-overlay" aria-hidden="true"></div>
              </div>

              {!isScannerActive ? (
                <div className="scanner-placeholder">
                  <span className="soft-badge">Camera QR</span>
                  <strong>{user?.fullName}</strong>
                  <span>{user?.email}</span>
                </div>
              ) : null}
            </div>

            <div className="scanner-profile-row scanner-toolbar">
              <div>
                <strong>{user?.fullName}</strong>
                <span>{user?.email}</span>
              </div>

              <span className="status-chip">
                {isScannerActive ? "Camera active" : "En attente"}
              </span>
            </div>

            <div className="scanner-actions">
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
            <Card className="menu-card result-card">
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
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
