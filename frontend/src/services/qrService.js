import QRCode from "qrcode";
import { apiRequest } from "./api.js";
import { ROUTES } from "../utils/constants.js";
import { buildEmergencyId, splitList } from "../utils/helpers.js";

function parseEmergencyContact(value = {}) {
  if (typeof value === "string") {
    const parts = value
      .split(/\s*-\s*/)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      name: parts[0] || "",
      phone: parts[1] || "",
      relationship: "",
    };
  }

  return {
    name: String(value?.name || "").trim(),
    phone: String(value?.phone || "").trim(),
    relationship: String(value?.relationship || "").trim(),
  };
}

function encodePreviewValue(value = "") {
  if (typeof window === "undefined") {
    return "";
  }

  return window
    .btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodePreviewValue(value = "") {
  if (!value || typeof window === "undefined") {
    return null;
  }

  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    return decodeURIComponent(escape(window.atob(`${normalized}${padding}`)));
  } catch {
    return null;
  }
}

function buildPreviewQuery(profile = {}) {
  const serializedProfile = JSON.stringify({
    fullName: profile?.fullName || "",
    bloodType: profile?.bloodType || "Unknown",
    allergies: splitList(profile?.allergies),
    conditions: splitList(profile?.conditions || profile?.chronicDiseases),
    chronicDiseases: splitList(profile?.chronicDiseases || profile?.conditions),
    medications: splitList(profile?.medications),
    emergencyContact: parseEmergencyContact(
      profile?.emergencyContact !== undefined
        ? profile.emergencyContact
        : {
            name: profile?.emergencyContactName,
            phone: profile?.emergencyContactPhone,
            relationship: profile?.emergencyContactRelationship,
          }
    ),
    criticalInstructions: String(profile?.criticalInstructions || profile?.notes || "").trim(),
    notes: String(profile?.notes || profile?.criticalInstructions || "").trim(),
  });

  const encoded = encodePreviewValue(serializedProfile);
  return encoded ? `preview=${encodeURIComponent(encoded)}` : "";
}

function createLocalQrToken(profile = {}) {
  const baseIdentifier =
    profile?.qrToken ||
    profile?.id ||
    profile?.userId ||
    profile?.email ||
    profile?.fullName ||
    "lifeline-user";

  return buildEmergencyId(`ll-${baseIdentifier}`);
}

export function buildLocalQRCodeData(profile = {}) {
  const qrToken = createLocalQrToken(profile);
  const previewQuery = buildPreviewQuery(profile);

  return {
    qrToken,
    shareId: qrToken,
    emergencyPath: `${ROUTES.emergency}/${qrToken}`,
    shareUrl: buildEmergencyUrl(qrToken, previewQuery),
    isLocalFallback: true,
  };
}

export function decodeEmergencyPreview(encodedPreview = "") {
  const decoded = decodePreviewValue(encodedPreview);

  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function buildEmergencyUrl(qrToken, queryString = "") {
  if (!qrToken) {
    return "";
  }

  const pathname = `${ROUTES.emergency}/${qrToken}`;
  const search = queryString ? `?${queryString}` : "";

  if (typeof window === "undefined") {
    return `${pathname}${search}`;
  }

  return new URL(`${pathname}${search}`, window.location.origin).toString();
}

export async function getQRCodeData(token) {
  const response = await apiRequest("/qr/me", { token });
  const qrToken = response?.qr?.qrToken || "";

  return {
    qrToken,
    shareId: qrToken,
    emergencyPath: response?.qr?.emergencyPath || `${ROUTES.emergency}/${qrToken}`,
    shareUrl: buildEmergencyUrl(qrToken),
  };
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
