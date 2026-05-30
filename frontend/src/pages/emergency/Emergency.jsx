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
              <span className="emer-visibility-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </span>
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
              <span className="emer-section-title-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h4l3-6 4 12 3-6h4" />
                </svg>
              </span>
              INFORMATIONS VITALES
            </div>
            <div className="emer-vital-row">
              <span className="emer-vital-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" /></svg>
              </span>
              <span className="emer-vital-label">Groupe sanguin</span>
              <strong className="emer-vital-value emer-vital-value-red">{profile.bloodType || "—"}</strong>
            </div>
            <div className="emer-vital-row">
              <span className="emer-vital-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </span>
              <span className="emer-vital-label">Allergies</span>
              <span className={`emer-vital-value ${!formatList(profile.allergies) ? "emer-vital-value-muted" : "emer-vital-value-red"}`}>
                {formatList(profile.allergies) || "Aucune connue"}
              </span>
            </div>
            <div className="emer-vital-row">
              <span className="emer-vital-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-6 4 12 3-6h4" /></svg>
              </span>
              <span className="emer-vital-label">Maladies chroniques</span>
              <span className={`emer-vital-value ${!formatList(profile.chronicDiseases) ? "emer-vital-value-muted" : ""}`}>
                {formatList(profile.chronicDiseases) || "Aucune connue"}
              </span>
            </div>
            <div className="emer-vital-row">
              <span className="emer-vital-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10.5 1.5l-8 8a5 5 0 0 0 7 7l8-8a5 5 0 0 0-7-7z" /></svg>
              </span>
              <span className="emer-vital-label">Médicaments en cours</span>
              <span className={`emer-vital-value ${!formatList(profile.medications) ? "emer-vital-value-muted" : ""}`}>
                {formatList(profile.medications) || "Aucun"}
              </span>
            </div>
            {(weight || height) && (
              <div className="emer-vital-row">
                <span className="emer-vital-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /></svg>
                </span>
                <span className="emer-vital-label">Poids / Taille</span>
                <span className="emer-vital-value">{weight ? `${weight} kg` : "—"} / {height ? `${height} cm` : "—"}</span>
              </div>
            )}
            {profile.criticalInstructions && (
              <div className="emer-vital-row emer-vital-row-alert">
                <span className="emer-vital-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </span>
                <span className="emer-vital-label">Consignes critiques</span>
                <span className="emer-vital-value emer-vital-value-red">{profile.criticalInstructions}</span>
              </div>
            )}
          </div>

          {/* ═══ CONTACT D'URGENCE PRINCIPAL ═══ */}
          {contactPhone && (
            <div className="emer-section">
              <div className="emer-section-title">
                <span className="emer-section-title-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </span>
                CONTACT D'URGENCE PRINCIPAL
              </div>
              <a href={`tel:${cleanPhoneForTel(contactPhone)}`} className="emer-contact-call-card">
                <div className="emer-contact-call-left">
                  <div className="emer-contact-call-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
                  </div>
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
                <span className="emer-section-title-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </span>
                AUTRES CONTACTS D'URGENCE
              </div>
              {secPhone && (
                <a href={`tel:${secPhone}`} className="emer-contact-call-card">
                  <div className="emer-contact-call-left">
                    <div className="emer-contact-call-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
                    </div>
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
                    <div className="emer-contact-call-avatar emer-contact-call-avatar-blue">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /></svg>
                    </div>
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
              <strong className="emer-emergency-box-title">IMPORTANT</strong>
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

          <Link to="/home" className="emer-return-btn">← Retour à l'application</Link>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="emer-footer">
          <p>Informations fournies par le titulaire du profil LifeLine</p>
          <p>Dernière mise à jour : {now}</p>
        </div>
      </div>
    </main>
  );
}
