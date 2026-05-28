import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import lifelineLogo from "../../assets/images/lifeline-logo.png";
import { useLang } from "../../context/LanguageContext.jsx";
import { ROUTES } from "../../utils/constants.js";
import {
  buildEmergencyUrl,
  buildQRCodePayload,
  buildQRCodeText,
  downloadQRCode,
  generateQRCodeImage,
  getQRCodeData,
} from "../../services/qrService.js";

function buildProfileQrData(profile = {}) {
  const qrToken = profile?.qrToken || profile?.emergencyId || "";
  if (!qrToken) return null;
  return {
    qrToken,
    shareId: qrToken,
    emergencyPath: `/emergency/${qrToken}`,
    shareUrl: profile?.emergencyUrl || buildEmergencyUrl(qrToken),
  };
}

export default function QRCodePage() {
  const navigate = useNavigate();
  const { user, token, refreshProfile, logout } = useAuth();
  const { t } = useLang();
  const [qrData, setQrData] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadQRCode() {
      if (!user) return;
      setQrData(null); setQrImageUrl(""); setQrError("");
      try {
        let qrProfile = user;
        let data = buildProfileQrData(qrProfile);
        if (!data && token) {
          const refreshed = await refreshProfile().catch(() => null);
          qrProfile = refreshed || qrProfile;
          data = buildProfileQrData(qrProfile);
        }
        if (!data) {
          if (!token) throw new Error("Session manquante. Reconnectez-vous.");
          data = await getQRCodeData(token);
        }
        if (!data?.qrToken || !data?.shareUrl) throw new Error("Impossible de generer le QR.");
        const qrText = buildQRCodeText(qrProfile, data);
        const qrPayload = buildQRCodePayload(data);
        const imageUrl = await generateQRCodeImage(qrPayload);
        if (!cancelled) { setQrData({ ...data, shareUrl: qrPayload, qrPayload, qrText }); setQrImageUrl(imageUrl); }
      } catch (error) { if (!cancelled) setQrError(error.message || "Erreur QR."); }
    }
    loadQRCode();
    return () => { cancelled = true; };
  }, [token, user?.qrToken]);

  async function handleShare() {
    if (!qrData?.shareUrl) return;
    if (navigator.share) {
      try { setIsSharing(true); await navigator.share({ title: "LifeLine QR", text: qrData.qrText || "Mon QR LifeLine", url: qrData.shareUrl }); } catch {} finally { setIsSharing(false); }
      return;
    }
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(qrData.shareUrl);
  }

  return (
    <main className="home-screen">
      <section className="home-shell">
        {/* Top Bar */}
        <header className="home-topbar">
          <button type="button" className="home-topbar-btn" onClick={() => navigate(-1)} aria-label="Retour">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="home-topbar-center">
            <img src={lifelineLogo} alt="LifeLine" className="home-topbar-logo" />
          </div>
          <div style={{ width: 42 }}></div>
        </header>

        <div className="home-scroll-content">
          {/* Title */}
          <section className="home-welcome">
            <h1 className="home-greeting dash-title-gradient">{t.qrTitle}</h1>
            <p className="home-greeting-sub">{t.qrSub}</p>
          </section>

          {/* QR Card */}
          <section className="qr-main-card">
            {qrData && qrImageUrl ? (
              <>
                {/* Header */}
                <div className="qr-main-header">
                  <span className="qr-main-header-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path d="M14 14h3v3h-3zM20 14v3h-3M20 20h-3v-3" />
                    </svg>
                  </span>
                  <div>
                    <strong>{t.qrReady}</strong>
                    <span>{t.qrReadySub}</span>
                  </div>
                </div>

                {/* QR Image */}
                <div className="qr-main-frame">
                  <div className="qr-main-corners">
                    <span className="qr-corner qr-corner-tl"></span>
                    <span className="qr-corner qr-corner-tr"></span>
                    <span className="qr-corner qr-corner-bl"></span>
                    <span className="qr-corner qr-corner-br"></span>
                    <img src={qrImageUrl} alt="QR Code LifeLine" className="qr-main-image" />
                  </div>
                </div>

                {/* User info */}
                <div className="qr-user-card">
                  <span className="qr-user-avatar">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </span>
                  <div className="qr-user-info">
                    <strong>{user?.fullName || "LifeLine"}</strong>
                    <span>QR médical actif</span>
                  </div>
                </div>

                {/* Security notice */}
                <div className="qr-main-notice">
                  <span className="qr-main-notice-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a5fb4" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <span>{t.qrSecure}</span>
                </div>

                {/* Actions */}
                <div className="qr-main-actions">
                  <button type="button" className="qr-main-btn qr-main-btn-share" onClick={handleShare} disabled={isSharing}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    {t.share}
                  </button>
                  <button type="button" className="qr-main-btn qr-main-btn-download" onClick={() => downloadQRCode(qrImageUrl, `${qrData.qrToken}-qr.png`)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {t.download}
                  </button>
                </div>
              </>
            ) : qrError ? (
              <div className="qr-main-error">
                <span>⚠️</span>
                <p>{qrError}</p>
                <button type="button" className="qr-retry-btn" onClick={() => navigate(ROUTES.login)}>{t.reconnect}</button>
              </div>
            ) : (
              <Loader label="Generation du QR..." />
            )}
          </section>

          {/* Info Cards */}
          <section className="qr-info-list">
            <div className="qr-info-item">
              <span className="qr-info-item-icon qr-info-item-icon-blue">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M23 4l-6 6-3-3-8 8" />
                  <polyline points="17 4 23 4 23 10" />
                </svg>
              </span>
              <div className="qr-info-item-text">
                <strong>{t.infoUpToDate}</strong>
                <span>{t.infoUpToDateSub}</span>
              </div>
              <span className="qr-info-item-badge">✓ {t.upToDate}</span>
            </div>

            <div className="qr-info-item">
              <span className="qr-info-item-icon qr-info-item-icon-navy">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <div className="qr-info-item-text">
                <strong>{t.secureUse}</strong>
                <span>{t.secureUseSub}</span>
              </div>
              <span className="qr-info-item-arrow">&rsaquo;</span>
            </div>
          </section>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
