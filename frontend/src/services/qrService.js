import QRCode from "qrcode";
import { apiRequest } from "./api.js";
import { ROUTES } from "../utils/constants.js";

export function buildEmergencyUrl(qrToken) {
  if (!qrToken) {
    return "";
  }

  if (typeof window === "undefined") {
    return `${ROUTES.emergency}/${qrToken}`;
  }

  return new URL(`${ROUTES.emergency}/${qrToken}`, window.location.origin).toString();
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
        route: `${ROUTES.emergency}/${shareId}`,
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
