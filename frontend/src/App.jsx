import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

function App() {
  const [blood, setBlood] = useState("");
  const [allergy, setAllergy] = useState("");
  const [contact, setContact] = useState("");
  const [disease, setDisease] = useState("");
  const [medicaments, setMedicaments] = useState("");
  const [doctor, setDoctor] = useState("");

  const [showQR, setShowQR] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const data = JSON.stringify({
    bg: blood,
    al: allergy,
    ds: disease,
    md: medicaments,
    ec: contact,
    dr: doctor,
  });

  useEffect(() => {
    if (scanActive) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        (result) => {
          setScanResult(result);
          scanner.clear();
          setScanActive(false);
        },
        (error) => {
          console.log(error);
        }
      );

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [scanActive]);

  const handleContactChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setContact(value);
  };

  const inputStyle = {
    width: "320px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    textAlign: "left",
    width: "320px",
    margin: "0 auto 6px",
    fontWeight: "bold",
    color: "#333",
  };

  const buttonStyle = {
    padding: "12px 20px",
    margin: "8px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "30px 15px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "450px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#1f3c88" }}>LifeLine 🩺</h1>
        <p style={{ color: "#666", marginBottom: "25px" }}>
          Remplissez vos informations médicales pour générer votre QR Code
        </p>

        <label style={labelStyle}>Groupe sanguin</label>
        <input
          style={inputStyle}
          placeholder="Ex: A+, O-, B+"
          value={blood}
          onChange={(e) => setBlood(e.target.value)}
        />
        <br />
        <br />

        <label style={labelStyle}>Allergies</label>
        <input
          style={inputStyle}
          placeholder="Ex: Pénicilline, arachides"
          value={allergy}
          onChange={(e) => setAllergy(e.target.value)}
        />
        <br />
        <br />

        <label style={labelStyle}>Maladies chroniques</label>
        <input
          style={inputStyle}
          placeholder="Ex: Diabète, asthme"
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
        />
        <br />
        <br />

        <label style={labelStyle}>Médicaments</label>
        <input
          style={inputStyle}
          placeholder="Ex: Doliprane, Insuline"
          value={medicaments}
          onChange={(e) => setMedicaments(e.target.value)}
        />
        <br />
        <br />

        <label style={labelStyle}>Médecin / consignes</label>
        <input
          style={inputStyle}
          placeholder="Ex: Dr. Karim - éviter ibuprofène"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
        />
        <br />
        <br />

        <label style={labelStyle}>Contact d'urgence</label>
        <input
          style={inputStyle}
          type="tel"
          inputMode="numeric"
          placeholder="Ex: 0612345678"
          value={contact}
          onChange={handleContactChange}
          maxLength={15}
        />
        <p style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>
          Vous pouvez entrer uniquement des chiffres
        </p>

        <button
          style={{
            ...buttonStyle,
            background: "#1f3c88",
            color: "white",
          }}
          onClick={() => setShowQR(true)}
        >
          Générer QR Code
        </button>

        <button
          style={{
            ...buttonStyle,
            background: "#00a896",
            color: "white",
          }}
          onClick={() => setScanActive(true)}
        >
          Scanner QR Code
        </button>

        <br />
        <br />

        {showQR && (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ color: "#333" }}>Votre QR Code</h3>
            <div
              style={{
                padding: "15px",
                background: "#fff",
                display: "inline-block",
                borderRadius: "15px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <QRCodeCanvas value={data} size={220} />
            </div>
          </div>
        )}

        <br />
        <br />

        <div id="reader" style={{ width: "300px", margin: "auto" }}></div>

        {scanResult && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "15px",
              padding: "18px",
              marginTop: "20px",
              textAlign: "left",
              background: "#fafafa",
            }}
          >
            <h3 style={{ textAlign: "center", color: "#1f3c88" }}>
              Informations médicales
            </h3>

            {(() => {
              try {
                const data = JSON.parse(scanResult);
                return (
                  <div style={{ lineHeight: "1.8" }}>
                    <p><strong>Groupe sanguin:</strong> {data.bg || "Non renseigné"}</p>
                    <p><strong>Allergies:</strong> {data.al || "Non renseigné"}</p>
                    <p><strong>Maladies:</strong> {data.ds || "Non renseigné"}</p>
                    <p><strong>Médicaments:</strong> {data.md || "Non renseigné"}</p>
                    <p><strong>Contact:</strong> {data.ec || "Non renseigné"}</p>
                    <p><strong>Médecin:</strong> {data.dr || "Non renseigné"}</p>
                  </div>
                );
              } catch {
                return <p style={{ color: "red" }}>Erreur de lecture</p>;
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;