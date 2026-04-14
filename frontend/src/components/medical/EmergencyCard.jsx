import { buildEmergencyContactLabel } from "../../services/profileService.js";
import { formatList } from "../../utils/helpers.js";

function EmergencyRow({ tone = "red", title, value, symbol }) {
  return (
    <div className="emergency-info-row">
      <span className={`emergency-info-icon emergency-info-icon-${tone}`} aria-hidden="true">
        {symbol}
      </span>
      <div className="emergency-info-copy">
        <strong>{title}</strong>
        <span>{value}</span>
      </div>
    </div>
  );
}

export default function EmergencyCard({ profile }) {
  const allergies = formatList(profile?.allergies);
  const conditions = formatList(profile?.chronicDiseases || profile?.conditions);
  const medications = formatList(profile?.medications);
  const emergencyContact = buildEmergencyContactLabel(profile?.emergencyContact);
  const criticalInstructions =
    profile?.criticalInstructions || profile?.notes || "Aucune consigne critique renseignee";

  return (
    <article className="emergency-card">
      <header className="emergency-alert-banner">
        <span className="emergency-banner-bag" aria-hidden="true">
          +
        </span>
        <strong>Urgence medicale</strong>
      </header>

      <div className="emergency-card-body">
        <h2 className="emergency-patient-name">{profile?.fullName}</h2>

        <div className="emergency-stack emergency-stack-tight">
          <EmergencyRow
            tone="red"
            symbol="+"
            title={`${profile?.bloodType || "Non renseigne"} - Groupe sanguin`}
            value="Information vitale"
          />
          <EmergencyRow
            tone="red"
            symbol="!"
            title="Allergies"
            value={allergies}
          />
          <EmergencyRow
            tone="blue"
            symbol="i"
            title="Maladies chroniques"
            value={conditions}
          />
          {medications !== "Non renseigne" ? (
            <EmergencyRow
              tone="blue"
              symbol="Rx"
              title="Medicaments"
              value={medications}
            />
          ) : null}
          <EmergencyRow
            tone="blue"
            symbol="tel"
            title="Contact d'urgence"
            value={emergencyContact}
          />
          <EmergencyRow
            tone="blue"
            symbol="!"
            title="Consignes critiques"
            value={criticalInstructions}
          />
        </div>
      </div>
    </article>
  );
}
