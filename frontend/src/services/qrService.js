import QRCode from "qrcode";
import { apiRequest } from "./api.js";
import { ROUTES } from "../utils/constants.js";

function isLocalHostname(hostname = "") {
  const normalizedHostname = hostname.toLowerCase();
  return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(normalizedHostname);
}

function isVercelDashboardHostname(hostname = "") {
  return ["vercel.com", "www.vercel.com"].includes(hostname.toLowerCase());
}

function isUsableAppBaseUrl(value = "") {
  try {
    const url = new URL(value);
    return (
      /^https?:$/i.test(url.protocol) &&
      !isLocalHostname(url.hostname) &&
      !isVercelDashboardHostname(url.hostname)
    );
  } catch {
    return false;
  }
}

function getConfiguredAppBaseUrl() {
  const explicitUrl = String(
    import.meta.env.VITE_PUBLIC_APP_URL || import.meta.env.VITE_FRONTEND_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (explicitUrl && isUsableAppBaseUrl(explicitUrl)) {
    return explicitUrl;
  }

  const apiUrl = String(import.meta.env.VITE_API_URL || "").trim();

  if (/^https?:\/\//i.test(apiUrl)) {
    const appUrl = apiUrl.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
    return isUsableAppBaseUrl(appUrl) ? appUrl : "";
  }

  return "";
}

function getCurrentPublicOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname, origin } = window.location;

  if (!/^https?:$/i.test(protocol) || isLocalHostname(hostname) || isVercelDashboardHostname(hostname)) {
    return "";
  }

  return origin.replace(/\/+$/, "");
}

function getPreferredAppBaseUrl() {
  return getConfiguredAppBaseUrl() || getCurrentPublicOrigin();
}

function getQueryStringFromUrl(value) {
  if (!value) {
    return "";
  }

  const fallbackBase =
    typeof window !== "undefined" ? window.location.origin : "https://lifeline.local";

  try {
    return new URL(value, fallbackBase).search.replace(/^\?/, "");
  } catch {
    return "";
  }
}

function isLocalUrl(value) {
  if (!value) {
    return false;
  }

  const fallbackBase =
    typeof window !== "undefined" ? window.location.origin : "https://lifeline.local";

  try {
    const url = new URL(value, fallbackBase);
    return isLocalHostname(url.hostname);
  } catch {
    return false;
  }
}

export function buildEmergencyUrl(qrToken, queryString = "") {
  if (!qrToken) {
    return "";
  }

  const pathname = `${ROUTES.emergency}/${qrToken}`;
  const search = queryString ? `?${queryString}` : "";
  const configuredBaseUrl = getPreferredAppBaseUrl();

  if (configuredBaseUrl) {
    return `${configuredBaseUrl}${pathname}${search}`;
  }

  if (typeof window === "undefined") {
    return `${pathname}${search}`;
  }

  return new URL(`${pathname}${search}`, window.location.origin).toString();
}

export async function getQRCodeData(token) {
  const response = await apiRequest("/qr/me", { token });
  const qrToken = response?.qr?.qrToken || "";
  const shareUrl = response?.qr?.shareUrl || response?.qr?.emergencyUrl || buildEmergencyUrl(qrToken);

  return {
    qrToken,
    shareId: qrToken,
    emergencyPath: response?.qr?.emergencyPath || `${ROUTES.emergency}/${qrToken}`,
    shareUrl,
  };
}

function buildQrLine(label, value) {
  const text = Array.isArray(value) ? value.join(", ") : String(value || "").trim();
  return text ? `${label}: ${text}` : "";
}

export function buildQRCodeText(profile = {}, qrData = {}) {
  const qrToken = qrData.qrToken || profile?.qrToken || "";
  const emergencyUrl = buildQRCodePayload({ ...qrData, qrToken });
  const lines = [
    "LifeLine Emergency Profile",
    buildQrLine("Name", profile?.fullName),
    buildQrLine("Blood type", profile?.bloodType || "Unknown"),
    buildQrLine("Allergies", profile?.allergiesList || profile?.allergies),
    buildQrLine("Chronic diseases", profile?.chronicDiseases || profile?.conditions),
    buildQrLine("Medications", profile?.medicationsList || profile?.medications),
    buildQrLine("Emergency contact", profile?.emergencyContact),
    buildQrLine("Doctor", profile?.doctorName),
    buildQrLine("Critical instructions", profile?.criticalInstructions || profile?.notes),
    buildQrLine("Emergency link", emergencyUrl),
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildQRCodePayload(qrData = {}) {
  const qrToken = qrData.qrToken || qrData.shareId || "";
  const value = qrData.shareUrl || qrData.emergencyUrl || buildEmergencyUrl(qrToken);
  const queryString = getQueryStringFromUrl(value);
  const preferredBaseUrl = getPreferredAppBaseUrl();

  if (qrToken && preferredBaseUrl) {
    return buildEmergencyUrl(qrToken, queryString);
  }

  if (qrToken && isLocalUrl(value)) {
    return buildEmergencyUrl(qrToken, queryString);
  }

  if (!value || /^https?:\/\//i.test(value)) {
    return value;
  }

  if (typeof window === "undefined") {
    return value;
  }

  return new URL(value, window.location.origin).toString();
}

export async function generateQRCodeImage(content) {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 520,
    color: {
      dark: "#111915",
      light: "#FFFFFF",
    },
  });
}

export function downloadQRCode(dataUrl, filename = "lifeline-qr.png") {
  if (typeof window === "undefined") {
    return;
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function extractTokenFromPath(pathname = "") {
  const emergencyPrefixes = [`${ROUTES.emergency}/`, "/api/emergency/"];

  for (const prefix of emergencyPrefixes) {
    if (pathname.startsWith(prefix)) {
      return decodeURIComponent(pathname.slice(prefix.length));
    }
  }

  return "";
}

export function parseEmergencyQrNavigation(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return {
      shareId: "",
      route: "",
      rawValue: "",
    };
  }

  const fallbackBase =
    typeof window !== "undefined" ? window.location.origin : "https://lifeline.local";

  const embeddedEmergencyLink = rawValue.match(
    /(?:https?:\/\/[^\s]+)?\/emergency\/([a-z0-9_-]+)(?:\?[^\s]*)?/i
  );

  if (embeddedEmergencyLink?.[0] && embeddedEmergencyLink?.[1]) {
    try {
      const url = new URL(embeddedEmergencyLink[0], fallbackBase);
      const shareId = extractTokenFromPath(url.pathname);

      if (shareId) {
        return {
          shareId,
          route: `${ROUTES.emergency}/${shareId}${url.search}`,
          rawValue,
        };
      }
    } catch {
      return {
        shareId: embeddedEmergencyLink[1],
        route: `${ROUTES.emergency}/${embeddedEmergencyLink[1]}`,
        rawValue,
      };
    }
  }

  try {
    const url = new URL(rawValue, fallbackBase);
    const shareId = extractTokenFromPath(url.pathname);

    if (shareId) {
      return {
        shareId,
        route: `${ROUTES.emergency}/${shareId}${url.search}`,
        rawValue,
      };
    }
  } catch {
    if (/^[a-z0-9_-]+$/i.test(rawValue)) {
      return {
        shareId: rawValue,
        route: `${ROUTES.emergency}/${rawValue}`,
        rawValue,
      };
    }

    return {
      shareId: "",
      route: "",
      rawValue,
    };
  }

  if (/^[a-z0-9_-]+$/i.test(rawValue)) {
    return {
      shareId: rawValue,
      route: `${ROUTES.emergency}/${rawValue}`,
      rawValue,
    };
  }

  return {
    shareId: "",
    route: "",
    rawValue,
  };
}
