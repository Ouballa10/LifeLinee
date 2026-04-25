import { useEffect, useState } from "react";
import BottomNav from "../../components/layout/BottomNav.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import QRCard from "../../components/medical/QRCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  buildQRCodeText,
  downloadQRCode,
  generateQRCodeImage,
  getQRCodeData,
} from "../../services/qrService.js";

export default function QRCodePage() {
  const { user, token } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [qrNotice, setQrNotice] = useState("");
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadQRCode() {
      if (!user) {
        return;
      }

      setQrData(null);
      setQrImageUrl("");
      setQrNotice("");
      setQrError("");

      try {
        if (!token) {
          throw new Error("Session Firebase manquante. Reconnectez-vous pour generer un QR stable.");
        }

        const data = await getQRCodeData(token);

        if (!data?.qrToken || !data?.shareUrl) {
          throw new Error("Impossible de generer le QR pour ce compte.");
        }

        const qrText = buildQRCodeText(user, data);
        const imageUrl = await generateQRCodeImage(qrText);

        if (!cancelled) {
          setQrData({
            ...data,
            qrText,
          });
          setQrImageUrl(imageUrl);
        }
      } catch (error) {
        if (!cancelled) {
          setQrError(error.message || "Impossible de generer le QR pour ce compte.");
        }
      }
    }

    loadQRCode();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  async function handleShare() {
    if (!qrData?.shareUrl) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: "LifeLine QR",
          text: qrData.qrText || "Mon QR medical LifeLine",
          url: qrData.shareUrl,
        });
      } catch {
        return;
      } finally {
        setIsSharing(false);
      }

      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(qrData.shareUrl);
    }
  }

  return (
    <main className="screen">
      <section className="mobile-shell">
        <Navbar title="Mon QR Code" subtitle="Mon code partageable" />

        <div className="app-content">
          <Card className="qr-page-card">
            {qrData && qrImageUrl ? (
              <QRCard profile={user} shareId={qrData.qrToken} qrImageUrl={qrImageUrl} />
            ) : qrError ? (
              <p className="scanner-error">{qrError}</p>
            ) : (
              <Loader label="Generation du QR..." />
            )}

            {qrNotice ? <p className="scanner-help scanner-help-inline">{qrNotice}</p> : null}

            <div className="split-actions">
              <Button
                block
                onClick={() =>
                  qrImageUrl
                    ? downloadQRCode(qrImageUrl, `${qrData?.qrToken || "lifeline"}-qr.png`)
                    : null
                }
              >
                Telecharger
              </Button>
              <Button block variant="accent" onClick={handleShare} disabled={!qrData || isSharing}>
                Partager
              </Button>
            </div>
          </Card>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
