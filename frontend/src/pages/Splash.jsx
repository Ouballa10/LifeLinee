import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroIllustration from "../assets/images/onboarding-hero.png";
import lifelineLogo from "../assets/images/lifeline-logo.png";
import { ROUTES } from "../utils/constants.js";

export default function Splash() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "intro",
      eyebrow: "LifeLine",
      title: (
        <>
          Vos informations medicales
          <br />
          en cas d'urgence
        </>
      ),
      description:
        "Accedez rapidement a votre profil medical, votre QR et vos donnees essentielles en quelques secondes.",
      cta: "Suivant",
      panelType: "hero",
      features: [
        { title: "Rapide", text: "Accedez a vos informations en un instant." },
        { title: "Securise", text: "Vos donnees sont protegees et privees." },
        { title: "Toujours la", text: "Disponibles partout quand vous en avez besoin." },
      ],
    },
    {
      id: "share",
      eyebrow: "Urgence",
      title: (
        <>
          Vos donnees,
          <br />
          sauvent des vies
        </>
      ),
      titleAccent: "sauvent des vies",
      description:
        "Partagez les informations essentielles avec les secouristes pour une prise en charge rapide et claire.",
      cta: "Suivant",
      panelType: "phone",
      features: [
        { title: "Confidentiel", text: "Les donnees restent privees et securisees." },
        { title: "Accessible", text: "Disponibles pour les secours au bon moment." },
        { title: "Instantane", text: "Des informations simples, lisibles et utiles." },
      ],
    },
    {
      id: "control",
      eyebrow: "Protection",
      title: (
        <>
          Vous gardez
          <br />
          le controle
        </>
      ),
      titleAccent: "le controle",
      description:
        "Gerez votre compte, decidez ce qui est visible et demarrez votre espace LifeLine en toute confiance.",
      cta: "Commencer",
      panelType: "security",
      checklist: [
        {
          title: "Confidentialite garantie",
          text: "Vos donnees restent privees et ne sont jamais partagees sans votre autorisation.",
        },
        {
          title: "Controle total",
          text: "Vous choisissez ce qui est visible ou modifiable a tout moment.",
        },
        {
          title: "Sur et conforme",
          text: "Un espace pense pour vos besoins medicaux et vos situations d'urgence.",
        },
      ],
    },
  ];

  useEffect(() => {
    if (currentSlide >= 2) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentSlide((current) => Math.min(current + 1, 2));
    }, 6000);

    return () => window.clearTimeout(timeoutId);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  function handlePrimaryAction() {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((current) => Math.min(current + 1, slides.length - 1));
      return;
    }

    navigate(ROUTES.login);
  }

  return (
    <main className="screen screen-splash onboarding-screen">
      <section className="splash-shell">
        <div className={`splash-card splash-card-centered onboarding-card onboarding-card-${slide.panelType}`}>
          <div className="onboarding-ornaments" aria-hidden="true">
            <span className="onboarding-plus onboarding-plus-left">+</span>
            <span className="onboarding-plus onboarding-plus-right">+</span>
            <span className="onboarding-dot-grid"></span>
          </div>

          <div className="onboarding-header">
            <div className="onboarding-logo-shell">
              <img src={lifelineLogo} alt="Logo LifeLine" className="onboarding-logo-image" />
            </div>

            <div className="onboarding-copy">
              <h1 className="onboarding-title">{slide.title}</h1>
              <p>{slide.description}</p>
            </div>
          </div>

          <div className={`onboarding-stage onboarding-stage-${slide.panelType}`} aria-hidden="true">
            {slide.panelType === "hero" ? (
              <img
                src={heroIllustration}
                alt="Illustration medicale LifeLine avec medecin, hopital et ambulance"
                className="onboarding-hero-image"
              />
            ) : null}

            {slide.panelType === "phone" ? (
              <>
                <div className="phone-ring phone-ring-left"></div>
                <div className="phone-ring phone-ring-right"></div>
                <div className="onboarding-phone">
                  <div className="onboarding-phone-notch"></div>
                  <div className="onboarding-phone-screen">
                    <div className="phone-profile-row">
                      <span className="phone-avatar"></span>
                      <div className="phone-lines">
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                    <div className="phone-info-list">
                      <div className="phone-info-card">
                        <strong>Groupe sanguin</strong>
                        <span>O+</span>
                      </div>
                      <div className="phone-info-card">
                        <strong>Allergies</strong>
                        <span>Penicilline</span>
                      </div>
                      <div className="phone-info-card">
                        <strong>Contacts</strong>
                        <span>2 proches</span>
                      </div>
                    </div>
                    <div className="phone-share-bar">Partager</div>
                  </div>
                </div>
                <span className="floating-badge floating-badge-red">♥</span>
                <span className="floating-badge floating-badge-green">✓</span>
                <span className="floating-badge floating-badge-purple">👥</span>
              </>
            ) : null}

            {slide.panelType === "security" ? (
              <>
                <div className="security-shield"></div>
                <div className="security-phone">
                  <div className="security-phone-top"></div>
                  <div className="security-phone-list">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="security-lock"></div>
                <div className="security-mini-card security-mini-card-left">
                  <strong>Acces securise</strong>
                  <span>Protection avancee</span>
                </div>
                <div className="security-mini-card security-mini-card-right">
                  <strong>Historique</strong>
                  <span>Suivi des acces</span>
                </div>
              </>
            ) : null}
          </div>

          {slide.features ? (
            <div className="onboarding-feature-grid">
              {slide.features.map((feature) => (
                <article key={feature.title} className="onboarding-feature-card">
                  <span className="onboarding-feature-icon">✦</span>
                  <strong>{feature.title}</strong>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          ) : null}

          {slide.checklist ? (
            <div className="onboarding-checklist">
              {slide.checklist.map((item) => (
                <article key={item.title} className="onboarding-check-item">
                  <span className="onboarding-check-icon">✓</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                  <span className="onboarding-check-arrow">{">"}</span>
                </article>
              ))}
            </div>
          ) : null}

          <div className="onboarding-actions">
            <button type="button" className="button button-primary onboarding-cta" onClick={handlePrimaryAction}>
              {slide.cta}
              <span className="onboarding-cta-arrow">→</span>
            </button>

            {currentSlide === 2 ? (
              <div className="onboarding-secondary-actions">
                <Link to={ROUTES.login} className="text-link">
                  Se connecter
                </Link>
                <Link to={ROUTES.register} className="text-link">
                  Creer un compte
                </Link>
              </div>
            ) : null}
          </div>

          <div className="splash-dots onboarding-dots" aria-label="Navigation onboarding">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`splash-dot onboarding-dot ${index === currentSlide ? "is-active" : ""}`}
                aria-label={`Aller a la page ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
