import { NavLink } from "react-router-dom";
import { ROUTES } from "../../utils/constants.js";
import { classNames } from "../../utils/helpers.js";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-svg" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-3.5V14h-6v6H5.5A1.5 1.5 0 0 1 4 18.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-svg" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="13" y="4" width="7" height="4.5" rx="2" fill="currentColor" opacity="0.85" />
      <rect x="13" y="10.5" width="7" height="9.5" rx="2" fill="currentColor" />
      <rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-svg" aria-hidden="true">
      <path
        d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm2 2v2h2v-2zm0-10v2h2V6zm10 0v2h2V6zm2 10h2v4h-4v-2h2zm-4-4h2v2h-2zm2 2h2v2h-2zm-4-4h2v2h-2zm0 4h2v6h-2zm4 4h2v2h-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-svg" aria-hidden="true">
      <path
        d="M7 4H5.5A1.5 1.5 0 0 0 4 5.5V7M17 4h1.5A1.5 1.5 0 0 1 20 5.5V7M7 20H5.5A1.5 1.5 0 0 1 4 18.5V17M17 20h1.5a1.5 1.5 0 0 0 1.5-1.5V17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="8" y="8" width="8" height="8" rx="2" fill="currentColor" opacity="0.2" />
      <path
        d="M9 12h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="bottom-nav-svg" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path
        d="M5 19a7 7 0 0 1 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems = [
  { label: "Accueil", Icon: HomeIcon, to: ROUTES.home },
  { label: "Bord", Icon: DashboardIcon, to: ROUTES.dashboard },
  { label: "QR", Icon: QrIcon, to: ROUTES.qr },
  { label: "Scan", Icon: ScanIcon, to: ROUTES.scanner },
  { label: "Profil", Icon: ProfileIcon, to: ROUTES.profile },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {navItems.map(({ label, Icon, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => classNames("bottom-nav-link", isActive && "is-active")}
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            <Icon />
          </span>
          <span className="bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
