import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../lib/session.js";

function HomePage() {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);

  const initials = user?.fullName
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    clearStoredUser();
    navigate("/login", { replace: true });
  };

  return (
    <main className="screen">
      <div className="page-shell">
        <div className="status-bar">
          <span className="status-badge">
            <span className="pulse-dot" aria-hidden="true"></span>
            Emergency profile active
          </span>
          <button type="button" className="button button-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <section className="home-grid">
          <article className="surface-card top-card">
            <div className="profile-strip">
              <div className="profile-main">
                <div className="inline-row">
                  <span className="avatar-badge">{initials || "LL"}</span>
                  <div>
                    <span className="soft-badge">Home</span>
                    <h1>{user?.fullName || "LifeLine User"}</h1>
                    <p>{user?.email || "No email saved"}</p>
                  </div>
                </div>
                <div className="qr-tile" aria-hidden="true"></div>
              </div>

              <div className="status-grid">
                <article className="status-item">
                  <span>Blood group</span>
                  <strong>{user?.bloodType || "Not set"}</strong>
                </article>
                <article className="status-item">
                  <span>Emergency contact</span>
                  <strong>{user?.emergencyContact || "Not set"}</strong>
                </article>
                <article className="status-item">
                  <span>Doctor</span>
                  <strong>{user?.doctor || "Not set"}</strong>
                </article>
              </div>

              <div className="action-row">
                <button type="button" className="button button-primary">
                  Generate QR
                </button>
                <button type="button" className="button button-ghost">
                  Edit profile
                </button>
              </div>
            </div>
          </article>

          <aside className="surface-card top-card">
            <span className="soft-badge">Medical summary</span>
            <h2 className="section-title">Critical information snapshot</h2>
            <div className="detail-grid">
              <article className="detail-card">
                <strong>Allergies</strong>
                <p className="info-copy">{user?.allergies || "No allergy added yet."}</p>
              </article>
              <article className="detail-card">
                <strong>Conditions</strong>
                <p className="info-copy">{user?.conditions || "No condition added yet."}</p>
              </article>
              <article className="detail-card">
                <strong>Medication</strong>
                <p className="info-copy">{user?.medications || "No medication added yet."}</p>
              </article>
              <article className="detail-card">
                <strong>Phone</strong>
                <p className="info-copy">{user?.phone || "No phone added yet."}</p>
              </article>
            </div>
          </aside>
        </section>

        <section className="home-grid">
          <article className="surface-card top-card">
            <span className="soft-badge">Quick actions</span>
            <h2 className="section-title">Next real app modules</h2>
            <div className="quick-grid">
              <article className="quick-card">
                <span className="soft-badge">Step 1</span>
                <strong>My QR card</strong>
                <span>Generate and display the personal emergency QR code.</span>
              </article>
              <article className="quick-card">
                <span className="soft-badge">Step 2</span>
                <strong>Medical profile</strong>
                <span>Complete allergies, diseases, medication, and instructions.</span>
              </article>
              <article className="quick-card">
                <span className="soft-badge">Step 3</span>
                <strong>Emergency contacts</strong>
                <span>Keep family and doctor details easy to reach.</span>
              </article>
              <article className="quick-card">
                <span className="soft-badge">Step 4</span>
                <strong>Scanner</strong>
                <span>Read a QR code and display the emergency summary instantly.</span>
              </article>
            </div>
          </article>

          <aside className="surface-card top-card">
            <span className="soft-badge">Prepared state</span>
            <h2 className="section-title">What this page is already doing</h2>
            <div className="bullet-list">
              <div className="bullet-item">
                <span className="bullet-marker">1</span>
                <div>
                  <strong>Session persistence</strong>
                  <p className="info-copy">
                    Login and register flows save the active user in local
                    storage.
                  </p>
                </div>
              </div>
              <div className="bullet-item">
                <span className="bullet-marker">2</span>
                <div>
                  <strong>Protected access</strong>
                  <p className="info-copy">
                    Home is available only after sign-in or registration.
                  </p>
                </div>
              </div>
              <div className="bullet-item">
                <span className="bullet-marker">3</span>
                <div>
                  <strong>Medical-first design</strong>
                  <p className="info-copy">
                    The layout is ready for real emergency profile modules.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <p className="app-footer">
          LifeLine emergency shell ready for QR generation, scanner, and medical
          profile modules.
        </p>
      </div>
    </main>
  );
}

export default HomePage;
