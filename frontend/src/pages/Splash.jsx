import { Link } from "react-router-dom";

function SplashPage() {
  return (
    <main className="screen">
      <div className="page-shell">
        <div className="status-bar">
          <span className="status-badge">
            <span className="pulse-dot" aria-hidden="true"></span>
            Emergency mode ready
          </span>
          <span>LifeLine mobile app</span>
        </div>

        <section className="medical-card hero-card">
          <div className="hero-grid">
            <div>
              <div className="brand-row">
                <span className="brand-mark">LL</span>
                <div className="brand-copy">
                  <strong>LifeLine</strong>
                  <span>Medical emergency QR access</span>
                </div>
              </div>

              <span className="eyebrow">
                <span className="icon-dot" aria-hidden="true"></span>
                Emergency medical app
              </span>

              <h1 className="hero-title">Reach critical medical info faster.</h1>
              <p className="hero-text">
                Build a secure emergency profile, keep your QR code ready, and
                help responders access the essentials when every second matters.
              </p>

              <div className="button-row">
                <Link to="/login" className="button button-primary">
                  Sign in
                </Link>
                <Link to="/register" className="button button-secondary">
                  Create account
                </Link>
              </div>
            </div>

            <aside className="hero-panel">
              <div className="preview-card">
                <p className="preview-label">Emergency snapshot</p>
                <div className="preview-main">
                  <div>
                    <strong>Patient profile active</strong>
                    <p>Identity, blood group, allergies, treatment, contacts.</p>
                  </div>
                  <span className="soft-badge">QR ready</span>
                </div>

                <div className="mini-grid">
                  <article className="mini-card">
                    <strong>Blood group</strong>
                    <span>Visible instantly for responders.</span>
                  </article>
                  <article className="mini-card">
                    <strong>Allergies</strong>
                    <span>Prevent unsafe treatment decisions.</span>
                  </article>
                  <article className="mini-card">
                    <strong>Emergency contact</strong>
                    <span>Reach the right person without delay.</span>
                  </article>
                </div>
              </div>

              <div className="preview-card">
                <p className="preview-label">Ready for the first flow</p>
                <p className="hero-text">
                  Start with your secure account, complete your emergency data,
                  then generate your personal medical QR card.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SplashPage;
