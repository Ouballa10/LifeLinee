import QRCode from "qrcode";
import { simulateRequest } from "./api.js";
import { ROUTES } from "../utils/constants.js";
import { buildEmergencyId, splitList } from "../utils/helpers.js";

export function buildEmergencyUrl(shareId) {
  if (typeof window === "undefined") {
    return `/emergency/${shareId}`;
  }

  return new URL(`/emergency/${shareId}`, window.location.origin).toString();
}

export async function getQRCodeData(profile) {
  return simulateRequest(() => {
    const shareId = profile?.emergencyId || buildEmergencyId(profile?.fullName);

    return {
      shareId,
      shareUrl: buildEmergencyUrl(shareId),
      fullName: profile?.fullName,
      email: profile?.email,
      bloodType: profile?.bloodType,
      allergies: splitList(profile?.allergies),
      emergencyContact: profile?.emergencyContact,
    };
  });
}

export async function getEmergencyPreview(profile) {
  return simulateRequest(() => ({
    shareId: profile?.emergencyId || buildEmergencyId(profile?.fullName),
    identity: {
      fullName: profile?.fullName,
      email: profile?.email,
      bloodType: profile?.bloodType,
      phone: profile?.phone,
    },
    allergies: splitList(profile?.allergies),
    conditions: splitList(profile?.conditions),
    medications: splitList(profile?.medications),
    doctor: profile?.doctor,
    emergencyContact: profile?.emergencyContact,
    notes: profile?.notes,
  }));
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

export function extractEmergencyShareId(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  const fallbackBase =
    typeof window !== "undefined" ? window.location.origin : "https://lifeline.local";

  const directMatch = rawValue.match(/\/emergency\/([^/?#]+)/i);

  if (directMatch?.[1]) {
    return decodeURIComponent(directMatch[1]);
  }

  try {
    const url = new URL(rawValue, fallbackBase);
    const routePrefix = `${ROUTES.emergency}/`;

    if (url.pathname.startsWith(routePrefix)) {
      return decodeURIComponent(url.pathname.slice(routePrefix.length));
    }
  } catch {
    return /^[a-z0-9-]+$/i.test(rawValue) ? rawValue : "";
  }

  return /^[a-z0-9-]+$/i.test(rawValue) ? rawValue : "";
}
