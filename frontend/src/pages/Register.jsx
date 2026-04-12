import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { buildUserProfile, saveStoredUser } from "../lib/session.js";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodType: "O+",
    password: "",
    confirmPassword: "",
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

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password.trim()
    ) {
      setError("Complete all required fields before continuing.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    saveStoredUser(
      buildUserProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        bloodType: form.bloodType,
        emergencyContact: `${form.fullName.trim()} - ${form.phone.trim()}`,
      })
    );

    navigate("/home", { replace: true });
  };

  return (
    <main className="screen">
      <div className="page-shell auth-shell">
        <div className="status-bar">
          <span className="status-badge">
            <span className="pulse-dot" aria-hidden="true"></span>
            New patient setup
          </span>
          <Link to="/" className="text-link">
            Back
          </Link>
        </div>

        <section className="auth-grid">
          <article className="surface-card form-card">
            <span className="soft-badge">Register</span>
            <h1 className="form-title">Create your emergency account.</h1>
            <p className="section-copy">
              Start with the basics. You can expand the medical profile after
              onboarding.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="field-input"
                  placeholder="Abdelmounaim Ouballa"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>

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
                <label className="field-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="field-input"
                  placeholder="06 12 34 56 78"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="bloodType">
                  Blood group
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  className="field-select"
                  value={form.bloodType}
                  onChange={handleChange}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
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
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="field-input"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {error ? (
                <div className="feedback feedback-error">{error}</div>
              ) : null}

              <button type="submit" className="button button-primary button-block">
                Create account
              </button>
            </form>

            <div className="helper-row">
              <span className="helper-text">Already registered?</span>
              <Link to="/login" className="text-link">
                Sign in
              </Link>
            </div>
          </article>

          <aside className="surface-card auth-panel">
            <span className="soft-badge">Onboarding</span>
            <h2 className="section-title">What gets prepared first</h2>

            <div className="bullet-list">
              <div className="bullet-item">
                <span className="bullet-marker">A</span>
                <div>
                  <strong>Identity basics</strong>
                  <p className="info-copy">
                    Name, email, phone, and blood type are ready from day one.
                  </p>
                </div>
              </div>
              <div className="bullet-item">
                <span className="bullet-marker">B</span>
                <div>
                  <strong>Medical card structure</strong>
                  <p className="info-copy">
                    Allergies, medication, doctor, and chronic conditions can be
                    completed next.
                  </p>
                </div>
              </div>
              <div className="bullet-item">
                <span className="bullet-marker">C</span>
                <div>
                  <strong>QR-ready account</strong>
                  <p className="info-copy">
                    The home screen is prepared for the QR feature integration.
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

export default RegisterPage;
