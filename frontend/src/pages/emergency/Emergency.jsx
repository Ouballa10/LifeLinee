import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEmergencyProfile } from "../../services/profileService.js";

function formatList(items) {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  if (typeof items === "string") return items || null;
  return items.filter(Boolean).join(", ") || null;
}

function formatPhone(phone) {
  if (!phone) return "";
  const clean = phone.replace(/[^\d+]/g, "");
  // Format marocain: +212 6XX XX XX XX ou 06XX XX XX XX
  if (clean.startsWith("+212") && clean.length >= 12) {
    return `+212 ${clean.slice(4, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)} ${clean.slice(9, 11)} ${clean.slice(11)}`.trim();
  }
  if (clean.startsWith("0") && clean.length >= 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8)}`.trim();
  }
  // Format international générique
  if (clean.length > 8) {
    return clean.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  }
  return phone;
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
  const contactPhone = profile.emergencyContact?.phone || "";
  const contactName = profile.emergencyContact?.name || "";
  const doctorPhone = profile.doctorPhone || "";
  const now = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  // Determine the primary emergency number to call
  const primaryCallNumber = contactPhone || doctorPhone || "112";
  const primaryCallLabel = contactPhone
    ? (contactName || "Contact d'urgence")
    : doctorPhone
      ? (profile.doctorName || "Médecin")
      : "Urgences (112)";

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
          <p className="emer-header-subtitle">FICHE D'URGENCE MÉDICALE</p>
          <div className="emer-header-badge">⚡ ACCÈS D'URGENCE</div>
        </div>

        <div className="emer-body">

          {/* ═══ GROS BOUTON APPEL URGENCE ═══ */}
          <a
            href={`tel:${primaryCallNumber.replace(/\s/g, "")}`}
            className="emer-big-call-btn"
          >
            <div className="emer-big-call-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className="emer-big-call-text">
              <strong>APPELER URGENCE</strong>
              <span>{primaryCallLabel}</span>
              <span className="emer-big-call-number">{formatPhone(primaryCallNumber)}</span>
            </div>
          </a>

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

          {/* ═══ CONTACTS D'URGENCE ═══ */}
          <div className="emer-section">
            <div className="emer-section-title">
              <span className="emer-section-title-icon">📞</span>
              CONTACTS D'URGENCE
            </div>

            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="emer-contact-call-card">
                <div className="emer-contact-call-left">
                  <div className="emer-contact-call-avatar">👤</div>
                  <div className="emer-contact-call-info">
                    <strong>{contactName || "Contact principal"}</strong>
                    <span>Contact d'urgence</span>
                  </div>
                </div>
                <div className="emer-contact-call-right">
                  <span className="emer-contact-call-phone">{formatPhone(contactPhone)}</span>
                  <span className="emer-contact-call-action">APPELER →</span>
                </div>
              </a>
            )}

            {doctorPhone && (
              <a href={`tel:${doctorPhone.replace(/\s/g, "")}`} className="emer-contact-call-card emer-contact-call-card-blue">
                <div className="emer-contact-call-left">
                  <div className="emer-contact-call-avatar emer-contact-call-avatar-blue">👨‍⚕️</div>
                  <div className="emer-contact-call-info">
                    <strong>{profile.doctorName || "Médecin traitant"}</strong>
                    <span>Médecin</span>
                  </div>
                </div>
                <div className="emer-contact-call-right">
                  <span className="emer-contact-call-phone">{formatPhone(doctorPhone)}</span>
                  <span className="emer-contact-call-action">APPELER →</span>
                </div>
              </a>
            )}

            {!contactPhone && !doctorPhone && (
              <div className="emer-no-contact">
                <span>⚠️</span>
                <p>Aucun contact d'urgence enregistré. Appelez le 112.</p>
              </div>
            )}
          </div>

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

          {/* ═══ IMPORTANT ═══ */}
          <div className="emer-emergency-box">
            <strong>⚠️ EN CAS D'URGENCE VITALE</strong>
            <p>Appelez immédiatement les secours et le contact d'urgence du patient.</p>
            <a href="tel:112" className="emer-emergency-box-call-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              APPELER LE 112
            </a>
          </div>

          {/* ═══ RETOUR ═══ */}
          <Link to="/" className="emer-return-btn">← Retour à l'application</Link>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="emer-footer">
          <p>🩺 Fiche médicale LifeLine — {now}</p>
          <p>Ces informations sont fournies par le titulaire du profil.</p>
        </div>
      </div>
    </main>
  );
}
