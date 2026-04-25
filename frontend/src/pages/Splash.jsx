import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroIllustration from "../assets/images/onboarding-hero.png";
import lifelineLogo from "../assets/images/lifeline-logo.png";
import onboardingPhoneIllustration from "../assets/images/onboarding-phone.png";
import { ROUTES } from "../utils/constants.js";

function FeatureIcon({ type }) {
  const icons = {
    shield: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M24 7L35 11.5V21.5C35 29.2 30.3 35.1 24 38C17.7 35.1 13 29.2 13 21.5V11.5L24 7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path
          d="M19 23.5L22.5 27L29.5 19.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    lock: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="14" y="21" width="20" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="3.2" />
        <path
          d="M18 21V17.5C18 14.2 20.7 11.5 24 11.5C27.3 11.5 30 14.2 30 17.5V21"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="28" r="2.5" fill="currentColor" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M24 36C15 30.4 10 24.7 10 18.7C10 14.7 13 12 16.8 12C20 12 22.3 13.6 24 16C25.7 13.6 28 12 31.2 12C35 12 38 14.7 38 18.7C38 24.7 33 30.4 24 36Z"
          fill="currentColor"
        />
        <path
          d="M15.5 23.5H21L23.4 19L26 27L28.6 22.7H32.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    refresh: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M16 18C17.8 15.5 20.7 14 24 14C29.5 14 34 18.5 34 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M32 14V19H27"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 30C30.2 32.5 27.3 34 24 34C18.5 34 14 29.5 14 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M16 34V29H21"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M27 8L17 24H24L21 40L31 23H24L27 8Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return icons[type] || icons.shield;
}

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
        { title: "Rapide", text: "Accedez a vos informations en un instant.", icon: "shield" },
        { title: "Securise", text: "Vos donnees sont protegees et privees.", icon: "lock" },
        { title: "Toujours la", text: "Disponibles partout quand vous en avez besoin.", icon: "heart" },
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
        { title: "Confidentiel", text: "Les donnees restent privees et securisees.", icon: "lock" },
        { title: "Accessible", text: "Disponibles pour les secours au bon moment.", icon: "refresh" },
        { title: "Instantane", text: "Des informations simples, lisibles et utiles.", icon: "bolt" },
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
              <img
                src={onboardingPhoneIllustration}
                alt="Illustration partage des informations medicales"
                className="onboarding-phone-image"
              />
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
                  <span className="onboarding-feature-icon">
                    <FeatureIcon type={feature.icon} />
                  </span>
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
