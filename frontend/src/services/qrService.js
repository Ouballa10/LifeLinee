import QRCode from "qrcode";
import { apiRequest } from "./api.js";
import { ROUTES } from "../utils/constants.js";

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
  const emergencyUrl = qrData.shareUrl || buildEmergencyUrl(qrToken);
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
