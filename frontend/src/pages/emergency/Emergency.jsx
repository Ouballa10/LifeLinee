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
      <main className="emer-page">
        <div className="emer-loader">
          <div className="emer-loader-ring" />
          <p>Chargement...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="emer-page">
        <div className="emer-wrap">
          <div className="emer-top">
            <span className="emer-top-cross">+</span>
            <h1>Fiche introuvable</h1>
          </div>
          <div className="emer-content">
            <p style={{ textAlign: "center", padding: 24, color: "#666" }}>{error}</p>
            <Link to="/" className="emer-btn-return">Retour à l'application</Link>
          </div>
        </div>
      </main>
    );
  }

  const p = data?.profile || {};
  const contactPhone = p.emergencyContact?.phone || "";
  const contactName = p.emergencyContact?.name || "";
  const doctorPhone = p.doctorPhone || "";

  return (
    <main className="emer-page">
      <div className="emer-wrap">

        {/* TOP BANNER */}
        <div className="emer-top">
          <span className="emer-top-cross">+</span>
          <div className="emer-top-avatar">{(p.fullName || "?")[0]}</div>
          <h1 className="emer-top-name">{p.fullName || "Patient"}</h1>
          <p className="emer-top-sub">FICHE MÉDICALE D'URGENCE</p>
        </div>

        <div className="emer-content">

          {/* GROUPE SANGUIN */}
          <div className="emer-blood">
            <span className="emer-blood-label">Groupe sanguin</span>
            <span className="emer-blood-value">{p.bloodType || "—"}</span>
          </div>

          {/* INFOS VITALES */}
          <div className="emer-grid">
            <div className="emer-grid-item">
              <span className="emer-grid-label">Allergies</span>
              <span className="emer-grid-value">{formatList(p.allergies) || "Aucune"}</span>
            </div>
            <div className="emer-grid-item">
              <span className="emer-grid-label">Maladies chroniques</span>
              <span className="emer-grid-value">{formatList(p.chronicDiseases) || "Aucune"}</span>
            </div>
            <div className="emer-grid-item emer-grid-item-full">
              <span className="emer-grid-label">Médicaments</span>
              <span className="emer-grid-value">{formatList(p.medications) || "Aucun"}</span>
            </div>
            {p.criticalInstructions && (
              <div className="emer-grid-item emer-grid-item-full emer-grid-item-alert">
                <span className="emer-grid-label">Consignes critiques</span>
                <span className="emer-grid-value">{p.criticalInstructions}</span>
              </div>
            )}
          </div>

          {/* CONTACTS */}
          <div className="emer-contacts">
            <h3 className="emer-contacts-title">Contacts d'urgence</h3>

            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="emer-contact-card">
                <div className="emer-contact-left">
                  <div className="emer-contact-dot emer-contact-dot-red" />
                  <div>
                    <strong>{contactName || "Contact principal"}</strong>
                    <span>{contactPhone}</span>
                  </div>
                </div>
                <div className="emer-contact-call">Appeler</div>
              </a>
            )}

            {doctorPhone && (
              <a href={`tel:${doctorPhone.replace(/\s/g, "")}`} className="emer-contact-card">
                <div className="emer-contact-left">
                  <div className="emer-contact-dot emer-contact-dot-blue" />
                  <div>
                    <strong>{p.doctorName || "Médecin"}</strong>
                    <span>{doctorPhone}</span>
                  </div>
                </div>
                <div className="emer-contact-call">Appeler</div>
              </a>
            )}
          </div>

          {/* NUMÉROS D'URGENCE */}
          <div className="emer-nums">
            <h3 className="emer-nums-title">Appel d'urgence</h3>
            <div className="emer-nums-row">
              <a href="tel:15" className="emer-num">
                <strong>15</strong><span>SAMU</span>
              </a>
              <a href="tel:150" className="emer-num">
                <strong>150</strong><span>Ambulance</span>
              </a>
              <a href="tel:19" className="emer-num">
                <strong>19</strong><span>Pompiers</span>
              </a>
              <a href="tel:112" className="emer-num emer-num-main">
                <strong>112</strong><span>Urgence</span>
              </a>
            </div>
          </div>

          {/* RETURN */}
          <Link to="/" className="emer-btn-return">← Retour à l'application</Link>

        </div>
      </div>
    </main>
  );
}
