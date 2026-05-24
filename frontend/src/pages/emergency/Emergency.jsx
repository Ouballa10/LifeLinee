import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEmergencyProfile } from "../../services/profileService.js";

function formatList(items) {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  if (typeof items === "string") return items || null;
  return items.filter(Boolean).join(", ") || null;
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
        <div className="emer-card">
          <div className="emer-header">
            <div className="emer-header-cross">✚</div>
            <div className="emer-header-text">
              <h1>Fiche introuvable</h1>
              <p>INFORMATIONS D'URGENCE</p>
            </div>
          </div>
          <div className="emer-body">
            <div className="emer-section">
              <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const profile = data?.profile || {};
  const visibility = data?.visibility || "full";
  const contactPhone = profile.emergencyContact?.phone || "";
  const contactName = profile.emergencyContact?.name || "";
  const doctorPhone = profile.doctorPhone || "";
  const now = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="emer-screen">
      <div className="emer-card">

        {/* ═══ HEADER ═══ */}
        <div className="emer-header">
          <div className="emer-header-cross">✚</div>
          <div className="emer-header-avatar">
            {(profile.fullName || "U").slice(0, 1).toUpperCase()}
          </div>
          <h1 className="emer-header-name">{profile.fullName || "Patient"}</h1>
          <p className="emer-header-subtitle">INFORMATIONS D'URGENCE</p>
          <p className="emer-header-note">Ces informations peuvent sauver une vie.</p>
          <div className="emer-header-badge">⚡ ACCÈS D'URGENCE</div>
        </div>

        <div className="emer-body">

          {/* ═══ INFORMATIONS VITALES ═══ */}
          <div className="emer-section">
            <div className="emer-section-title">
              <span className="emer-section-title-icon">❤️</span>
              INFORMATIONS VITALES
            </div>

            <div className="emer-vital-row">
              <span className="emer-vital-icon">🩸</span>
              <span className="emer-vital-label">Groupe sanguin</span>
              <strong className="emer-vital-value emer-vital-value-red">{profile.bloodType || "—"}</strong>
            </div>

            <div className="emer-vital-row">
              <span className="emer-vital-icon">⚠️</span>
              <span className="emer-vital-label">Allergies</span>
              <span className={`emer-vital-value ${!formatList(profile.allergies) ? "emer-vital-value-muted" : "emer-vital-value-red"}`}>
                {formatList(profile.allergies) || "Aucune connue"}
              </span>
            </div>

            <div className="emer-vital-row">
              <span className="emer-vital-icon">💜</span>
              <span className="emer-vital-label">Maladies chroniques</span>
              <span className={`emer-vital-value ${!formatList(profile.chronicDiseases) ? "emer-vital-value-muted" : ""}`}>
                {formatList(profile.chronicDiseases) || "Aucune connue"}
              </span>
            </div>

            <div className="emer-vital-row">
              <span className="emer-vital-icon">💊</span>
              <span className="emer-vital-label">Médicaments en cours</span>
              <span className={`emer-vital-value ${!formatList(profile.medications) ? "emer-vital-value-muted" : ""}`}>
                {formatList(profile.medications) || "Aucun"}
              </span>
            </div>

            {profile.criticalInstructions && (
              <div className="emer-vital-row emer-vital-row-alert">
                <span className="emer-vital-icon">🚨</span>
                <span className="emer-vital-label">Consignes critiques</span>
                <span className="emer-vital-value emer-vital-value-red">{profile.criticalInstructions}</span>
              </div>
            )}
          </div>

          {/* ═══ CONTACT D'URGENCE PRINCIPAL ═══ */}
          {contactPhone && (
            <div className="emer-section">
              <div className="emer-section-title">
                <span className="emer-section-title-icon">📞</span>
                CONTACT D'URGENCE PRINCIPAL
              </div>
              <div className="emer-contact-row">
                <div className="emer-contact-avatar">👤</div>
                <div className="emer-contact-info">
                  <strong>{contactName || "Contact"}</strong>
                  <span>Contact principal</span>
                </div>
                <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="emer-contact-phone-btn">
                  📞 {contactPhone}
                </a>
              </div>
            </div>
          )}

          {/* ═══ AUTRES CONTACTS ═══ */}
          {(doctorPhone || profile.doctorName) && (
            <div className="emer-section">
              <div className="emer-section-title">
                <span className="emer-section-title-icon">👥</span>
                AUTRES CONTACTS D'URGENCE
              </div>
              {doctorPhone && (
                <div className="emer-contact-row">
                  <div className="emer-contact-avatar emer-contact-avatar-blue">👨‍⚕️</div>
                  <div className="emer-contact-info">
                    <strong>{profile.doctorName || "Médecin"}</strong>
                    <span>Numéro du médecin</span>
                  </div>
                  <a href={`tel:${doctorPhone.replace(/\s/g, "")}`} className="emer-contact-phone-btn">
                    📞 {doctorPhone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ═══ NUMÉROS D'URGENCE NATIONAUX ═══ */}
          <div className="emer-section">
            <div className="emer-section-title">
              <span className="emer-section-title-icon">🚨</span>
              NUMÉROS D'URGENCE
            </div>
            <div className="emer-nums-grid">
              <a href="tel:15" className="emer-num-card">
                <strong>15</strong>
                <span>SAMU</span>
              </a>
              <a href="tel:150" className="emer-num-card">
                <strong>150</strong>
                <span>Ambulance</span>
              </a>
              <a href="tel:19" className="emer-num-card">
                <strong>19</strong>
                <span>Pompiers</span>
              </a>
              <a href="tel:112" className="emer-num-card emer-num-card-main">
                <strong>112</strong>
                <span>Urgence EU</span>
              </a>
            </div>
          </div>

          {/* ═══ IMPORTANT BOX ═══ */}
          <div className="emer-emergency-box">
            <div className="emer-emergency-box-left">
              <strong className="emer-emergency-box-title">⚠️ IMPORTANT</strong>
              <p>En cas d'urgence, contactez immédiatement le service médical et le contact d'urgence.</p>
            </div>
            <a href="tel:112" className="emer-emergency-box-call">
              <span className="emer-emergency-box-call-icon">📞</span>
              <strong>112</strong>
              <span>APPELER</span>
            </a>
          </div>

          {/* ═══ RETURN BUTTON ═══ */}
          <Link to="/" className="emer-return-btn">
            ← Retour à l'application
          </Link>

        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="emer-footer">
          <p>🩺 Informations fournies par le titulaire du profil LifeLine</p>
          <p>Dernière mise à jour : {now}</p>
        </div>

      </div>
    </main>
  );
}
