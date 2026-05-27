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

function cleanPhoneForTel(phone) {
  return (phone || "").replace(/[^\d+]/g, "");
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
            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  const profile = data?.profile || {};
  const visibility = data?.visibility || 'full';
  const contactPhone = profile.emergencyContact?.phone || "";
  const contactName = profile.emergencyContact?.name || "";
  const secondaryContact = profile.secondaryContact || "";
  const doctorPhone = profile.doctorPhone || "";
  const doctorName = profile.doctorName || "";
  const photoUrl = profile.photoUrl || "";
  const weight = profile.weight || "";
  const height = profile.height || "";
  const now = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  // Parse secondary contact (format: "Name - Phone" or "Name - Phone (Relation)")
  const secParts = secondaryContact.split(/\s*-\s*/);
  const secName = secParts[0]?.replace(/\s*\(.*\)\s*$/, "").trim() || "";
  const secPhoneRaw = secParts[1]?.replace(/\s*\(.*\)\s*$/, "").trim() || "";
  const secPhone = secPhoneRaw.replace(/[^\d+]/g, "");

  // Primary call = contact d'urgence du dossier, fallback = docteur, fallback = 112
  const primaryPhone = contactPhone || doctorPhone || "112";
  const primaryLabel = contactPhone ? (contactName || "Contact d'urgence") : doctorPhone ? (doctorName || "Médecin") : "Urgences";
  // Secondary = si primary est le contact, secondary est le docteur ou 112
  const secondaryPhone = contactPhone && doctorPhone ? doctorPhone : (!contactPhone && doctorPhone ? "112" : (contactPhone ? "112" : ""));
  const secondaryLabel = contactPhone && doctorPhone ? (doctorName || "Médecin") : "Urgences (112)";

  return (
    <main className="emer-screen">
      <div className="emer-card">

        {/* ═══ HEADER ═══ */}
        <div className="emer-header">
          <div className="emer-header-top-row">
            <div className="emer-header-cross">✚</div>
            <div className="emer-header-badge">⚡ ACCÈS D'URGENCE</div>
          </div>
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

          {/* Visibility level indicator */}
          {visibility !== 'full' && (
            <div className="emer-visibility-notice">
              <span className="emer-visibility-icon">🔒</span>
              <span>
                {visibility === 'minimal' && "Mode minimal — Seuls le nom et le groupe sanguin sont visibles."}
                {visibility === 'contact' && "Mode contact — Seuls les contacts d'urgence sont visibles."}
              </span>
            </div>
          )}

          {/* ═══ GROS BOUTON APPEL — Contact d'urgence du dossier ═══ */}
          <a href={`tel:${cleanPhoneForTel(primaryPhone)}`} className="emer-big-call-btn">
            <div className="emer-big-call-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className="emer-big-call-text">
              <strong>APPELER URGENCE</strong>
              <span>{primaryLabel}</span>
              <span className="emer-big-call-number">{formatPhone(primaryPhone)}</span>
            </div>
          </a>

          {/* ═══ 2ème numéro backup ═══ */}
          {secondaryPhone && (
            <a href={`tel:${cleanPhoneForTel(secondaryPhone)}`} className="emer-secondary-call-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{secondaryLabel} — {formatPhone(secondaryPhone)}</span>
            </a>
          )}

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
                <span className="emer-vital-value">{weight ? `${weight} kg` : "—"} / {height ? `${height} cm` : "—"}</span>
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
              <a href={`tel:${cleanPhoneForTel(contactPhone)}`} className="emer-contact-call-card">
                <div className="emer-contact-call-left">
                  <div className="emer-contact-call-avatar">👤</div>
                  <div className="emer-contact-call-info">
                    <strong>{contactName || "Contact"}</strong>
                    <span>Contact principal</span>
                  </div>
                </div>
                <div className="emer-contact-call-right">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="emer-contact-call-phone">{formatPhone(contactPhone)}</span>
                </div>
              </a>
            </div>
          )}

          {/* ═══ AUTRES CONTACTS ═══ */}
          {(secondaryContact || doctorPhone) && (
            <div className="emer-section">
              <div className="emer-section-title">
                <span className="emer-section-title-icon">👥</span>
                AUTRES CONTACTS D'URGENCE
              </div>
              {secPhone && (
                <a href={`tel:${secPhone}`} className="emer-contact-call-card">
                  <div className="emer-contact-call-left">
                    <div className="emer-contact-call-avatar">👤</div>
                    <div className="emer-contact-call-info">
                      <strong>{secName || "Contact secondaire"}</strong>
                      <span>Contact secondaire</span>
                    </div>
                  </div>
                  <div className="emer-contact-call-right">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="emer-contact-call-phone">{formatPhone(secPhoneRaw || secPhone)}</span>
                  </div>
                </a>
              )}
              {doctorPhone && (
                <a href={`tel:${cleanPhoneForTel(doctorPhone)}`} className="emer-contact-call-card emer-contact-call-card-blue">
                  <div className="emer-contact-call-left">
                    <div className="emer-contact-call-avatar emer-contact-call-avatar-blue">👨‍⚕️</div>
                    <div className="emer-contact-call-info">
                      <strong>{doctorName || "Médecin"}</strong>
                      <span>Médecin référent</span>
                    </div>
                  </div>
                  <div className="emer-contact-call-right">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="emer-contact-call-phone emer-contact-call-phone-blue">{formatPhone(doctorPhone)}</span>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* ═══ IMPORTANT ═══ */}
          <div className="emer-emergency-box">
            <div className="emer-emergency-box-left">
              <strong className="emer-emergency-box-title">⚠️ IMPORTANT</strong>
              <p>En cas d'urgence, contactez immédiatement le service médical et le contact d'urgence.</p>
            </div>
            <a href="tel:112" className="emer-emergency-box-call">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <strong>112</strong>
              <span>NUMÉRO D'URGENCE</span>
            </a>
          </div>

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
