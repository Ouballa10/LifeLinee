import { getInitials } from "../../utils/helpers.js";

export default function QRCard({ profile, shareId, qrImageUrl }) {
  return (
    <article className="qr-card">
      <div className="qr-top-row redesign-qr-top">
        <div>
          <span className="panel-kicker">Code medical</span>
          <h2 className="section-title">Carte de scan</h2>
        </div>
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
        <div className="qr-user-row redesign-qr-user">
          <span className="qr-avatar redesign-avatar">{getInitials(profile?.fullName || "LL")}</span>
          <div>
            <strong>{profile?.fullName}</strong>
            <span>{profile?.email || "abdel10@gmail.com"}</span>
          </div>
        </div>

        <div className="data-list qr-meta-list">
          <div className="data-row qr-meta">
            <span>Code d'urgence</span>
            <strong>{shareId || "LifeLine"}</strong>
          </div>
          <div className="data-row qr-meta">
            <span>Contact</span>
            <strong>{profile?.emergencyContact || "Non renseigne"}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
