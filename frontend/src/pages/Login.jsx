import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  buildUserProfile,
  getStoredUser,
  nameFromEmail,
  saveStoredUser,
} from "../lib/session.js";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    const currentUser = getStoredUser();
    const nextUser =
      currentUser && currentUser.email?.toLowerCase() === form.email.toLowerCase()
        ? currentUser
        : buildUserProfile({
            email: form.email.trim(),
            fullName: nameFromEmail(form.email),
          });

    saveStoredUser(nextUser);
    navigate("/home", { replace: true });
  };

  return (
    <main className="screen">
      <div className="page-shell auth-shell">
        <div className="status-bar">
          <span className="status-badge">
            <span className="pulse-dot" aria-hidden="true"></span>
            Secure access
          </span>
          <Link to="/" className="text-link">
            Back
          </Link>
        </div>

        <section className="auth-grid">
          <article className="surface-card form-card">
            <span className="soft-badge">Login</span>
            <h1 className="form-title">Welcome back to LifeLine.</h1>
            <p className="section-copy">
              Sign in to manage your emergency profile and keep your medical QR
              access ready.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="field-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <p className="field-hint">
                  Current flow uses local storage so you can continue building
                  the app before backend auth is connected.
                </p>
              </div>

              {error ? (
                <div className="feedback feedback-error">{error}</div>
              ) : null}

              <button type="submit" className="button button-primary button-block">
                Sign in
              </button>
            </form>

            <div className="helper-row">
              <span className="helper-text">No account yet?</span>
              <Link to="/register" className="text-link">
                Create one
              </Link>
            </div>
          </article>

          <aside className="surface-card auth-panel">
            <span className="soft-badge">Emergency ready</span>
            <h2 className="section-title">
              Your account unlocks the first emergency tools.
            </h2>

            <div className="bullet-list">
              <div className="bullet-item">
                <span className="bullet-marker">1</span>
                <div>
                  <strong>Medical identity</strong>
                  <p className="info-copy">
                    Save the profile that should appear during emergency care.
                  </p>
                </div>
              </div>
              <div className="bullet-item">
                <span className="bullet-marker">2</span>
                <div>
                  <strong>QR generation</strong>
                  <p className="info-copy">
                    Attach one code to a bracelet, card, or emergency tag.
                  </p>
                </div>
              </div>
              <div className="bullet-item">
                <span className="bullet-marker">3</span>
                <div>
                  <strong>Responder access</strong>
                  <p className="info-copy">
                    Surface the key information needed in critical moments.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
