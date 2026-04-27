import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import onboardingControlIllustration from "../assets/images/onboarding-control-real.png.jpeg";
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

function ControlChecklistIcon({ type }) {
  const icons = {
    edit: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M12 33.5V38h4.5L33 21.5L28.5 17L12 33.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path
          d="M25.5 20L30 24.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M18 38H36"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="20" cy="18" r="6" fill="currentColor" />
        <path
          d="M10.5 34C10.5 28.8 14.8 24.5 20 24.5C25.2 24.5 29.5 28.8 29.5 34"
          fill="currentColor"
        />
        <circle cx="32.5" cy="21" r="4.5" fill="currentColor" opacity="0.9" />
        <path
          d="M28.5 34C28.8 30.4 31.8 27.5 35.5 27.5C39.2 27.5 42 30.3 42 34"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M24 10C18.8 10 14.5 14.3 14.5 19.5V24.5C14.5 27.1 13.6 29.7 11.8 31.6L10 33.5H38L36.2 31.6C34.4 29.7 33.5 27.1 33.5 24.5V19.5C33.5 14.3 29.2 10 24 10Z"
          fill="currentColor"
        />
        <path
          d="M20 37C20.7 39 22.2 40 24 40C25.8 40 27.3 39 28 37"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return icons[type] || icons.edit;
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
          <span className="onboarding-title-accent-red">sauvent des vies</span>
        </>
      ),
      titleAccent: "sauvent des vies",
      description: (
        <>
          Partagez les informations essentielles en{" "}
          <span className="onboarding-copy-accent-blue">cas d'urgence</span> avec les secouristes pour une prise
          en charge rapide et claire.
        </>
      ),
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
          <span className="onboarding-title-accent-red">le contrôle</span>
        </>
      ),
      titleAccent: "le contrôle",
      description: (
        <>
          Gérez votre compte, décidez ce qui est visible et démarrez votre espace LifeLine{" "}
          <span className="onboarding-copy-accent-blue">en toute confiance</span>.
        </>
      ),
      cta: "Commencer",
      panelType: "security",
      checklist: [
        {
          title: "Modifier mes infos",
          text: "Mettez à jour vos données quand vous le souhaitez",
          icon: "edit",
        },
        {
          title: "Confidentialité",
          text: "Vous décidez qui y a accès",
          icon: "users",
        },
        {
          title: "Notifications",
          text: "Restez informé à tout moment",
          icon: "bell",
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
              <img
                src={onboardingControlIllustration}
                alt=""
                className="onboarding-control-image"
              />
            ) : null}
          </div>

          {slide.features ? (
            <div className={`onboarding-feature-grid onboarding-feature-grid-${slide.panelType}`}>
              {slide.features.map((feature) => (
                <article
                  key={feature.title}
                  className={`onboarding-feature-card onboarding-feature-card-${slide.panelType}`}
                >
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
                  <span className="onboarding-check-icon">
                    <ControlChecklistIcon type={item.icon} />
                  </span>
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

            <div className="onboarding-secondary-actions">
              <Link to={ROUTES.scanner} className="text-link">
                Scanner un QR
              </Link>
              {currentSlide === 2 ? (
                <>
                <Link to={ROUTES.login} className="text-link">
                  Se connecter
                </Link>
                <Link to={ROUTES.register} className="text-link">
                  Creer un compte
                </Link>
                </>
              ) : null}
            </div>
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
