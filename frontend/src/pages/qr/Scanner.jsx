import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QrScanner from "qr-scanner";
import BottomNav from "../../components/layout/BottomNav.jsx";
import AppMenu from "../../components/layout/AppMenu.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { useLang } from "../../context/LanguageContext.jsx";
import lifelineLogo from "../../assets/images/lifeline-logo.webp";
import { useAuth } from "../../hooks/useAuth.js";
import { parseEmergencyQrNavigation } from "../../services/qrService.js";
import { apiRequest } from "../../services/api.js";
import { ROUTES } from "../../utils/constants.js";

export default function Scanner() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuth();
  const { t } = useLang();
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
  const [accessLogs, setAccessLogs] = useState([]);

  // Fetch who scanned MY QR (use session cache)
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const cacheKey = "lifeline.accessLogs";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try { setAccessLogs(JSON.parse(cached)); } catch {}
    }
    apiRequest("/qr/access-logs", { token })
      .then((data) => {
        if (data?.logs) {
          setAccessLogs(data.logs);
          sessionStorage.setItem(cacheKey, JSON.stringify(data.logs));
        }
      })
      .catch(() => {});
  }, [isAuthenticated, token]);

  useEffect(() => {
    let mounted = true;
    QrScanner.hasCamera()
      .then((available) => { if (mounted) { setHasCamera(available); setIsPreparingCamera(false); } })
      .catch(() => { if (mounted) { setHasCamera(false); setIsPreparingCamera(false); } });
    return () => { mounted = false; if (scannerRef.current) { scannerRef.current.destroy(); scannerRef.current = null; } };
  }, []);

  function handleDecoded(result) {
    const rawValue = typeof result === "string" ? result : result?.data || "";
    const parsed = parseEmergencyQrNavigation(rawValue);
    setDetectedValue(rawValue);
    saveLastScan(rawValue);
    if (scannerRef.current) { scannerRef.current.stop(); setIsScannerActive(false); }
    if (parsed.route) navigate(parsed.route);
  }

  async function startScanner() {
    setScannerError("");
    try {
      if (!videoRef.current) return;
      if (!scannerRef.current) {
        scannerRef.current = new QrScanner(videoRef.current, handleDecoded, {
          preferredCamera: "environment", highlightScanRegion: true, highlightCodeOutline: true,
          overlay: overlayRef.current || undefined, maxScansPerSecond: 8, returnDetailedScanResult: true,
          onDecodeError: () => undefined,
        });
      }
      await scannerRef.current.start();
      setScannerPermission(true);
      setIsScannerActive(true);
    } catch { setScannerError("Impossible d'acceder a la camera."); setIsScannerActive(false); }
  }

  function stopScanner() { if (scannerRef.current) { scannerRef.current.stop(); setIsScannerActive(false); } }

  async function handleImageScan(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setScannerError(""); setIsReadingFile(true);
    try {
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      handleDecoded(result);
    } catch { setScannerError("Aucun QR valide detecte dans cette image."); }
    finally { setIsReadingFile(false); event.target.value = ""; }
  }

  const scannedNavigation = parseEmergencyQrNavigation(appState.lastScan || detectedValue);

  return (
    <main className="home-screen">
      <section className="home-shell">
        <header className="home-topbar">
          <AppMenu />
          <div className="home-topbar-center"><img src={lifelineLogo} alt="LifeLine" className="home-topbar-logo" /></div>
          <button
            type="button"
            className="home-topbar-avatar"
            onClick={() => navigate(ROUTES.profile)}
            aria-label="Mon profil"
          >
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="" className="home-topbar-avatar-img" />
            ) : (
              <span className="home-topbar-avatar-initials">
                {(user?.fullName || "U").slice(0, 1).toUpperCase()}
              </span>
            )}
          </button>
        </header>

        <div className="home-scroll-content">
          <section className="home-welcome">
            <h1 className="home-greeting dash-title-gradient">{t.scannerTitle}</h1>
            <p className="home-greeting-sub">{t.scannerSub}</p>
          </section>

          {/* Camera Scanner */}
          <section className="scan-camera-card">
            <div className="scan-video-wrap">
              <video ref={videoRef} className="scan-video" muted playsInline />
              <div ref={overlayRef} className="scan-overlay" aria-hidden="true"></div>
              {!isScannerActive && (
                <div className="scan-placeholder">
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#6b8299" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M7 4H5.5A1.5 1.5 0 0 0 4 5.5V7M17 4h1.5A1.5 1.5 0 0 1 20 5.5V7M7 20H5.5A1.5 1.5 0 0 1 4 18.5V17M17 20h1.5a1.5 1.5 0 0 0 1.5-1.5V17" />
                    <rect x="8" y="8" width="8" height="8" rx="2" opacity="0.3" fill="#6b8299" />
                  </svg>
                  <span>{t.cameraWaiting}</span>
                </div>
              )}
            </div>

            <div className="scan-controls">
              <button type="button" className="scan-btn scan-btn-start" onClick={startScanner} disabled={isPreparingCamera || !hasCamera || isScannerActive}>
                {isScannerActive ? t.cameraActive : t.startCamera}
              </button>
              {isScannerActive && (
                <button type="button" className="scan-btn scan-btn-stop" onClick={stopScanner}>
                  {t.stop}
                </button>
              )}
            </div>

            <label className="scan-upload-label" htmlFor="scan-file-input">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {t.importImage}
            </label>
            <input id="scan-file-input" type="file" accept="image/*" onChange={handleImageScan} style={{ display: "none" }} />

            {isPreparingCamera && <p className="scan-status">{t.checkingCamera}</p>}
            {!hasCamera && !isPreparingCamera && <p className="scan-status">{t.noCamera}</p>}
            {isReadingFile && <p className="scan-status">{t.readingImage}</p>}
            {scannerError && <p className="scan-error">{scannerError}</p>}
          </section>

          {/* Result */}
          {appState.lastScan && (
            <section className="scan-result-card">
              <div className="scan-result-icon">✅</div>
              <div className="scan-result-text">
                <strong>{t.qrDetected}</strong>
                {scannedNavigation.route ? (
                  <Link to={scannedNavigation.route} className="scan-result-link">
                    {t.viewMedicalCard} &rsaquo;
                  </Link>
                ) : (
                  <span>Ce QR ne contient pas un token LifeLine valide.</span>
                )}
              </div>
            </section>
          )}

          {/* CTA for non-authenticated */}
          {!isAuthenticated && (
            <section className="scan-cta-card">
              <strong>{t.createQrCta}</strong>
              <p>{t.createQrCtaSub}</p>
              <div className="scan-cta-actions">
                <Link to={ROUTES.register} className="scan-cta-btn scan-cta-primary">{t.createAccount}</Link>
                <Link to={ROUTES.login} className="scan-cta-btn scan-cta-secondary">{t.signIn}</Link>
              </div>
            </section>
          )}

          {/* How it works */}
          <section className="scan-howto-card">
            <div className="scan-howto-icon">
              <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
                <rect x="8" y="4" width="32" height="40" rx="6" fill="#e4f0fb" stroke="#1a5fb4" strokeWidth="1.5" />
                <rect x="14" y="14" width="12" height="12" rx="2" fill="#1a5fb4" opacity="0.2" stroke="#1a5fb4" strokeWidth="1" />
                <rect x="28" y="14" width="6" height="6" rx="1" fill="#1a5fb4" opacity="0.3" />
                <rect x="14" y="28" width="6" height="6" rx="1" fill="#1a5fb4" opacity="0.3" />
                <path d="M14 38h20" stroke="#1a5fb4" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              </svg>
            </div>
            <div className="scan-howto-content">
              <strong>{t.howItWorks}</strong>
              <div className="scan-howto-steps">
                <div className="scan-howto-step">
                  <span className="scan-howto-num">1</span>
                  <span>{t.step1}</span>
                </div>
                <div className="scan-howto-step">
                  <span className="scan-howto-num">2</span>
                  <span>{t.step2}</span>
                </div>
                <div className="scan-howto-step">
                  <span className="scan-howto-num">3</span>
                  <span>{t.step3}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Scans — who accessed MY QR */}
          {isAuthenticated && (
            <section className="scan-recent-section">
              <div className="scan-recent-header">
                <h2 className="home-section-heading">{t.recentScans}</h2>
                <span className="home-link-btn">Voir tout &rsaquo;</span>
              </div>
              {accessLogs.length > 0 ? (
                accessLogs.slice(0, 5).map((log) => {
                  const logDate = new Date(log.openedAt);
                  return (
                    <div key={log.id} className="scan-recent-item">
                      <div className="scan-recent-avatar">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1a5fb4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="scan-recent-info">
                        <strong>{log.responder === "anonymous" ? "Utilisateur anonyme" : log.responder}</strong>
                        <span>Scanne le {logDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} a {logDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="scan-recent-badge">✓ Acces autorise</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="scan-recent-empty">
                  <span>📋</span>
                  <p>{t.noRecentScans}</p>
                </div>
              )}
            </section>
          )}
        </div>

        {isAuthenticated && <BottomNav />}
      </section>
    </main>
  );
}
