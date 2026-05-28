import { useEffect, useState, useCallback } from "react";
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
    lockRed: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="14" y="21" width="20" height="16" rx="5" fill="none" stroke="#dc2626" strokeWidth="3.2" />
        <path
          d="M18 21V17.5C18 14.2 20.7 11.5 24 11.5C27.3 11.5 30 14.2 30 17.5V21"
          fill="none"
          stroke="#dc2626"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="28" r="2.5" fill="#dc2626" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M24 36C15 30.4 10 24.7 10 18.7C10 14.7 13 12 16.8 12C20 12 22.3 13.6 24 16C25.7 13.6 28 12 31.2 12C35 12 38 14.7 38 18.7C38 24.7 33 30.4 24 36Z"
          fill="#dc2626"
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
          fill="#dc2626"
        />
        <path
          d="M20 37C20.7 39 22.2 40 24 40C25.8 40 27.3 39 28 37"
          fill="none"
          stroke="#dc2626"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return icons[type] || icons.edit;
}

/* Floating medical elements for premium background */
function FloatingElements() {
  return (
    <div className="splash-floating-elements" aria-hidden="true">
      <span className="splash-float splash-float-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20" strokeLinecap="round" />
        </svg>
      </span>
      <span className="splash-float splash-float-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </span>
      <span className="splash-float splash-float-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </span>
      <span className="splash-float splash-float-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </span>
      <span className="splash-float splash-float-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </span>
      <span className="splash-float splash-float-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

export default function Splash() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState("next");

  const slides = [
    {
      id: "intro",
      eyebrow: "LifeLine",
      title: (
        <>
          Vos informations médicales
          <br />
          <span className="onboarding-title-accent-red">en cas d'urgence</span>
        </>
      ),
      description:
        "Accédez rapidement à votre profil médical, votre QR et vos données essentielles en quelques secondes.",
      cta: "Suivant",
      panelType: "hero",
      features: [
        { title: "Toujours là", text: "Disponibles partout quand vous en avez besoin.", icon: "heart" },
        { title: "Rapide", text: "Accédez à vos informations en un instant.", icon: "shield" },
        { title: "Sécurisé", text: "Vos données sont protégées et privées.", icon: "lock" },
      ],
    },
    {
      id: "share",
      eyebrow: "Urgence",
      title: (
        <>
          Vos données,
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
        { title: "Accessible", text: "Disponibles pour les secours au bon moment.", icon: "refresh" },
        { title: "Confidentiel", text: "Les données restent privées et sécurisées.", icon: "lockRed" },
        { title: "Instantané", text: "Des informations simples, lisibles et utiles.", icon: "bolt" },
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
          title: "Modifier mes informations",
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

  const goToSlide = useCallback((nextIndex, dir = "next") => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(dir);

    setTimeout(() => {
      setCurrentSlide(nextIndex);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, [isTransitioning]);

  useEffect(() => {
    if (currentSlide >= 2) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      goToSlide(currentSlide + 1, "next");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [currentSlide, goToSlide]);

  const slide = slides[currentSlide];

  function handlePrimaryAction() {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1, "next");
      return;
    }

    navigate(ROUTES.login);
  }

  return (
    <main className="screen screen-splash onboarding-screen">
      <section className="splash-shell">
        <div className={`splash-card splash-card-centered onboarding-card onboarding-card-${slide.panelType}`}>

          {/* Animated gradient background */}
          <div className="splash-animated-bg" aria-hidden="true" />

          {/* Floating medical elements */}
          <FloatingElements />

          {/* Ornaments */}
          <div className="onboarding-ornaments" aria-hidden="true">
            <span className="onboarding-plus onboarding-plus-left">+</span>
            <span className="onboarding-plus onboarding-plus-right">+</span>
            <span className="onboarding-dot-grid"></span>
          </div>

          {/* Content with transition */}
          <div
            className={`splash-slide-content ${isTransitioning ? `splash-exit-${direction}` : "splash-enter"}`}
            key={slide.id}
          >
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
                {slide.features.map((feature, index) => (
                  <article
                    key={feature.title}
                    className={`onboarding-feature-card onboarding-feature-card-${slide.panelType} splash-stagger-${index + 1}`}
                  >
                    <span className={`onboarding-feature-icon ${feature.iconColor ? `onboarding-feature-icon-${feature.iconColor}` : ""}`}>
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
                {slide.checklist.map((item, index) => (
                  <article key={item.title} className={`onboarding-check-item splash-stagger-${index + 1}`}>
                    <span className="onboarding-check-icon">
                      <ControlChecklistIcon type={item.icon} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className={`onboarding-actions onboarding-actions-${slide.panelType}`}>
            <button type="button" className="button button-primary onboarding-cta" onClick={handlePrimaryAction}>
              {slide.cta}
              <span className="onboarding-cta-arrow">→</span>
            </button>

            <div className={`onboarding-secondary-actions onboarding-secondary-actions-${slide.panelType}`}>
              <Link to={ROUTES.scanner} className="text-link">
                Scanner un QR
              </Link>
              {currentSlide === 2 ? (
                <>
                <Link to={ROUTES.login} className="text-link">
                  Se connecter
                </Link>
                <Link to={ROUTES.register} className="text-link">
                  Créer un compte
                </Link>
                </>
              ) : null}
            </div>
          </div>

          {/* Dots navigation */}
          <div className="splash-dots onboarding-dots" aria-label="Navigation onboarding">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`splash-dot onboarding-dot ${index === currentSlide ? "is-active" : ""}`}
                aria-label={`Aller à la page ${index + 1}`}
                onClick={() => {
                  const dir = index > currentSlide ? "next" : "prev";
                  goToSlide(index, dir);
                }}
              ></button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
