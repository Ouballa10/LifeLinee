import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmergencyCard from "../../components/medical/EmergencyCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { buildEmergencyContactLabel, getEmergencyProfile } from "../../services/profileService.js";
import { ROUTES } from "../../utils/constants.js";

export default function Emergency() {
  const { token } = useParams();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(() => (token ? "" : "QR token missing."));

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setPreview(null);
      setError("QR token missing.");
      return () => {
        cancelled = true;
      };
    }

    setPreview(null);
    setError("");

    getEmergencyProfile(token)
      .then((data) => {
        if (!cancelled) {
          setPreview(data.profile);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(nextError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!preview && !error) {
    return <Loader label="Chargement de la carte d'urgence..." />;
  }

  if (error) {
    return (
      <main className="screen emergency-screen">
        <section className="emergency-shell">
          <Card className="emergency-wrapper">
            <p className="section-copy">{error}</p>
            <Link to={ROUTES.home} className="button button-primary">
              Retour a l'app
            </Link>
          </Card>
        </section>
      </main>
    );
  }

  const emergencyPhone = preview?.emergencyContact?.phone || "";
  const emergencyContactLabel = buildEmergencyContactLabel(preview?.emergencyContact);

  return (
    <main className="screen emergency-screen">
      <section className="emergency-shell">
        <Card className="emergency-wrapper">
          <EmergencyCard profile={preview} />

          <div className="emergency-actions">
            <a
              href={emergencyPhone ? `tel:${emergencyPhone}` : "#"}
              className="button button-emergency"
            >
              Appeler
            </a>
          </div>

          <div className="emergency-secondary-actions">
            <Button variant="ghost" onClick={() => window.print()}>
              Imprimer
            </Button>
            <Link to={ROUTES.home} className="text-link emergency-back-link">
              Retour a l'app
            </Link>
          </div>

          <p className="scanner-help scanner-help-inline">
            Contact d'urgence: {emergencyContactLabel}
          </p>
        </Card>
      </section>
    </main>
  );
}
