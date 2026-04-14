import { formatList, getInitials } from "../../utils/helpers.js";

export default function EmergencyCard({ profile }) {
  return (
    <article className="emergency-card">
      <header className="emergency-card-header">
        <div className="emergency-person">
          <span className="emergency-avatar">{getInitials(profile?.fullName || "LL")}</span>
          <div>
            <strong>{profile?.fullName}</strong>
            <span>{profile?.email || "abdel10@gmail.com"}</span>
          </div>
        </div>
        <span className="emergency-blood">{profile?.bloodType}</span>
      </header>

      <div className="emergency-card-body">
        <div className="emergency-stack">
          <div className="emergency-line">
            <span>Allergies</span>
            <strong>{formatList(profile?.allergies)}</strong>
          </div>
          <div className="emergency-line">
            <span>Pathologies</span>
            <strong>{formatList(profile?.conditions)}</strong>
          </div>
          <div className="emergency-line">
            <span>Medicaments</span>
            <strong>{formatList(profile?.medications)}</strong>
          </div>
          <div className="emergency-line">
            <span>Contact</span>
            <strong>{profile?.emergencyContact || "Non renseigne"}</strong>
          </div>
          <div className="emergency-line">
            <span>Medecin</span>
            <strong>{profile?.doctor || "Non renseigne"}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
