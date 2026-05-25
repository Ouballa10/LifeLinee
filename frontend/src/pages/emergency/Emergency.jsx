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
  if (clean.startsWith("+212") && clean.length >= 12) {
    return `+212 ${clean.slice(4, 5)}${clean.slice(5, 7)} ${clean.slice(7, 9)} ${clean.slice(9, 11)} ${clean.slice(11)}`.trim();
  }
  if (clean.startsWith("0") && clean.length >= 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8)}`.trim();
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
            <h1 className="emer-header-name">Fiche introuvable</h1>
            <p className="emer-header-subtitle">INFORMATIONS D'URGENCE</p>
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
  const photoUrl = profile.photoUrl || "";
  const weight = profile.weight || "";
  const height = profile.height || "";
  const now = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="emer-screen">
      <div className="emer-card">

        {/* ═══ HEADER — Red gradient with ECG line ═══ */}
        <div className="emer-header">
          <div className="emer-header-top-row">
            <div className="emer-header-cross">✚</div>
            <div className="emer-header-badge">⚡ ACCÈS D'URGENCE</div>
          </div>

          {/* Profile Photo */}
          <div className="emer-header-photo">
            {photoUrl ? (
              <img src={photoUrl} alt={profile.fullName} className="emer-header-photo-img" />
            ) : (
              <span className="emer-header-photo-initials">
                {(profile.fullName || "U").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="emer-header-name">{profile.fullName || "Patient"}</h1>
          <p className="emer-header-subtitle">INFORMATIONS D'URGENCE</p>
          <p className="emer-header-note">Ces informations peuvent sauver une vie.</p>
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

            {(weight || height) && (
              <div className="emer-vital-row">
                <span className="emer-vital-icon">📏</span>
                <span className="emer-vital-label">Poids / Taille</span>
                <span className="emer-vital-value">
                  {weight ? `${weight} kg` : "—"} / {height ? `${height} cm` : "—"}
                </span>
              </div>
            )}

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
              <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="emer-contact-call-card">
                <div className="emer-contact-call-left">
                  <div className="emer-contact-call-avatar">👤</div>
                  <div className="emer-contact-call-info">
                    <strong>{contactName || "Contact principal"}</strong>
                    <span>Contact principal</span>
                  </div>
                </div>
                <div className="emer-contact-call-right">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="emer-contact-call-phone">{formatPhone(contactPhone)}</span>
                </div>
              </a>
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
                <a href={`tel:${doctorPhone.replace(/\s/g, "")}`} className="emer-contact-call-card emer-contact-call-card-blue">
                  <div className="emer-contact-call-left">
                    <div className="emer-contact-call-avatar emer-contact-call-avatar-blue">👨‍⚕️</div>
                    <div className="emer-contact-call-info">
                      <strong>{profile.doctorName || "Médecin"}</strong>
                      <span>Numéro du médecin</span>
                    </div>
                  </div>
                  <div className="emer-contact-call-right">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="emer-contact-call-phone emer-contact-call-phone-blue">{formatPhone(doctorPhone)}</span>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* ═══ IMPORTANT — Big 112 call ═══ */}
          <div className="emer-emergency-box">
            <div className="emer-emergency-box-left">
              <strong className="emer-emergency-box-title">⚠️ IMPORTANT</strong>
              <p>En cas d'urgence, contactez immédiatement le service médical et le contact d'urgence.</p>
            </div>
            <a href="tel:112" className="emer-emergency-box-call">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <strong>112</strong>
              <span>NUMÉRO D'URGENCE</span>
            </a>
          </div>

          {/* ═══ RETOUR ═══ */}
          <Link to="/" className="emer-return-btn">← Retour à l'application</Link>
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
