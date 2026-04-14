import { getInitials } from "../../utils/helpers.js";

export default function QRCard({ profile, shareId, qrImageUrl }) {
  return (
    <article className="qr-card">
      <div className="qr-top-row">
        <span className="soft-badge">Code medical</span>
        <span className="qr-blood-pill">{profile?.bloodType || "O+"}</span>
      </div>

      <div className="qr-frame">
        {qrImageUrl ? (
          <img
            className="qr-image"
            src={qrImageUrl}
            alt={`QR code LifeLine pour ${profile?.fullName || "utilisateur"}`}
          />
        ) : null}
      </div>

      <div className="qr-copy">
        <div className="qr-user-row">
          <span className="qr-avatar">{getInitials(profile?.fullName || "LL")}</span>
          <div>
            <strong>{profile?.fullName}</strong>
            <span>{profile?.email || "abdel10@gmail.com"}</span>
          </div>
        </div>

        <div className="qr-meta-list">
          <div className="qr-meta">
            <span>Token QR</span>
            <strong>{shareId || profile?.qrToken || profile?.emergencyId}</strong>
          </div>
          <div className="qr-meta">
            <span>Contact</span>
            <strong>{profile?.emergencyContact || "Non renseigne"}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
