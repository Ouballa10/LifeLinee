import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEmergencyProfile } from "../../services/profileService.js";

function formatList(items) {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  if (typeof items === "string") return items || null;
  return items.filter(Boolean).join(", ") || null;
}

function EmergencyInfoRow({ icon, label, value, urgent }) {
  if (!value) return null;
  return (
    <div className={`emer-row ${urgent ? "emer-row-urgent" : ""}`}>
      <div className="emer-row-icon">{icon}</div>
      <div className="emer-row-content">
        <span className="emer-row-label">{label}</span>
        <span className="emer-row-value">{value}</span>
      </div>
    </div>
  );
}

export default function Emergency() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(() => (token ? "" : "QR token manquant."));
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getEmergencyProfile(token)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          // Log access once per session
          const logKey = `lifeline.emergencyLogged.${token}`;
          if (!sessionStorage.getItem(logKey)) {
            sessionStorage.setItem(logKey, "1");
            fetch(`/api/emergency/${encodeURIComponent(token)}/log`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ responder: "anonymous", location: window.location.origin }),
            }).catch(() => {});
          }
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <main className="emer-screen">
        <div className="emer-loading">
          <div className="emer-loading-pulse" />
          <p>Chargement de la fiche d'urgence...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="emer-screen">
        <div className="emer-card emer-card-error">
          <div className="emer-error-icon">⚠️</div>
          <h1>Fiche introuvable</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  const profile = data?.profile || {};
  const visibility = data?.visibility || "full";
  const phoneHref = profile.emergencyContact?.phone
    ? `tel:${profile.emergencyContact.phone.replace(/\s/g, "")}`
    : null;
  const doctorPhoneHref = profile.doctorPhone
    ? `tel:${profile.doctorPhone.replace(/\s/g, "")}`
    : null;

  return (
    <main className="emer-screen">
      <div className="emer-card">
        {/* Header */}
        <header className="emer-header">
          <div className="emer-header-badge">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <div className="emer-header-text">
            <span className="emer-header-label">URGENCE MÉDICALE</span>
            <h1 className="emer-header-name">{profile.fullName || "Patient"}</h1>
          </div>
          {profile.bloodType && profile.bloodType !== "Unknown" && (
            <div className="emer-blood-badge">{profile.bloodType}</div>
          )}
        </header>

        {/* Blood type banner */}
        <div className="emer-blood-banner">
          <span className="emer-blood-banner-icon">🩸</span>
          <div>
            <strong>Groupe sanguin</strong>
            <span>{profile.bloodType || "Non renseigné"}</span>
          </div>
        </div>

        {/* Info sections based on visibility */}
        <div className="emer-body">
          {/* Allergies — always shown (life-critical) */}
          <EmergencyInfoRow icon="⚠️" label="Allergies" value={formatList(profile.allergies)} urgent />

          {/* Full mode: show all medical details */}
          {visibility === "full" && (
            <>
              <EmergencyInfoRow icon="🏥" label="Maladies chroniques" value={formatList(profile.chronicDiseases)} />
              <EmergencyInfoRow icon="💊" label="Médicaments en cours" value={formatList(profile.medications)} />
              <EmergencyInfoRow icon="📋" label="Consignes critiques" value={profile.criticalInstructions} urgent />
              {(profile.weight || profile.height) && (
                <EmergencyInfoRow
                  icon="📏"
                  label="Morphologie"
                  value={[profile.weight && `${profile.weight} kg`, profile.height && `${profile.height} cm`].filter(Boolean).join(" — ")}
                />
              )}
              <EmergencyInfoRow icon="👨‍⚕️" label="Médecin référent" value={profile.doctorName} />
            </>
          )}

          {/* Contact mode: show critical instructions */}
          {visibility === "contact" && (
            <EmergencyInfoRow icon="📋" label="Consignes critiques" value={profile.criticalInstructions} urgent />
          )}

          {/* Emergency contact — always shown */}
          {profile.emergencyContact?.phone && (
            <div className="emer-contact-section">
              <div className="emer-contact-info">
                <span className="emer-contact-label">Contact d'urgence</span>
                <strong className="emer-contact-name">{profile.emergencyContact.name || "Contact"}</strong>
                <span className="emer-contact-phone">{profile.emergencyContact.phone}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="emer-actions">
          {phoneHref && (
            <a href={phoneHref} className="emer-btn emer-btn-call">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Appeler le contact d'urgence
            </a>
          )}
          {visibility === "full" && doctorPhoneHref && (
            <a href={doctorPhoneHref} className="emer-btn emer-btn-doctor">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Appeler le médecin
            </a>
          )}
        </div>

        {/* Footer */}
        <footer className="emer-footer">
          <div className="emer-footer-logo">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20" /></svg>
            <span>LifeLine</span>
          </div>
          <p className="emer-footer-note">
            {visibility === "minimal" && "Mode minimal — infos vitales uniquement."}
            {visibility === "contact" && "Mode contact — infos vitales + contact d'urgence."}
            {visibility === "full" && "Fiche d'urgence complète."}
          </p>
        </footer>
      </div>
    </main>
  );
}
