import { apiRequest } from "./api.js";
import { isSupabaseConfigured, supabase } from "./supabaseClient.js";
import { splitList } from "../utils/helpers.js";

export function buildEmergencyContactLabel(contact = {}) {
  return [contact?.name, contact?.phone].filter(Boolean).join(" - ") || "Non renseigne";
}

function extractPhoneNumber(value = "") {
  const text = String(value || "").trim();
  const matches = text.match(/\+?\d[\d\s().-]{5,}\d/g) || [];

  return (
    matches.find((candidate) => candidate.replace(/\D/g, "").length >= 6)?.trim() || ""
  );
}

function removePhoneFromText(value = "", phone = "") {
  return String(value || "")
    .replace(phone, "")
    .replace(/[-:|,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTelNumber(value = "") {
  const phone = extractPhoneNumber(value);

  if (!phone) {
    return "";
  }

  const hasLeadingPlus = phone.trim().startsWith("+");
  const digits = phone.replace(/\D/g, "");

  return digits ? `${hasLeadingPlus ? "+" : ""}${digits}` : "";
}

export function buildEmergencyPhoneHref(contact = {}) {
  const phone = normalizeTelNumber(
    [contact?.phone, contact?.name, contact?.relationship].filter(Boolean).join(" ")
  );

  return phone ? `tel:${phone}` : "";
}

function joinList(value) {
  return splitList(value).join(", ");
}

function parseEmergencyContact(value = {}) {
  if (typeof value === "string") {
    const phone = extractPhoneNumber(value);
    const parts = value
      .split(/\s*-\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
    const phonePart = parts.find((part) => extractPhoneNumber(part)) || "";
    const namePart =
      parts.find((part) => part !== phonePart && !extractPhoneNumber(part)) || "";

    return {
      name: namePart || removePhoneFromText(value, phone) || (!phone ? parts[0] || "" : ""),
      phone: phone || parts[1] || "",
      relationship: "",
    };
  }

  const name = String(value?.name || "").trim();
  const relationship = String(value?.relationship || "").trim();
  const explicitPhone = String(value?.phone || "").trim();
  const fallbackPhone = extractPhoneNumber([name, relationship].filter(Boolean).join(" "));
  const phone = explicitPhone || fallbackPhone;

  return {
    name: explicitPhone ? name : removePhoneFromText(name, fallbackPhone) || (!fallbackPhone ? name : ""),
    phone,
    relationship,
  };
}

export function mapProfileFromApi(profile = {}) {
  const allergies = splitList(profile?.allergies);
  const chronicDiseases = splitList(profile?.chronicDiseases);
  const medications = splitList(profile?.medications);
  const emergencyContact = parseEmergencyContact(profile?.emergencyContact);
  const criticalInstructions = String(profile?.criticalInstructions || "").trim();

  return {
    id: profile?.id || profile?._id || "",
    userId: profile?.userId || "",
    fullName: profile?.fullName || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    bloodType: profile?.bloodType || "Unknown",
    allergies: joinList(allergies),
    allergiesList: allergies,
    conditions: joinList(chronicDiseases),
    chronicDiseases,
    medications: joinList(medications),
    medicationsList: medications,
    emergencyContact: buildEmergencyContactLabel(emergencyContact),
    emergencyContactName: emergencyContact.name,
    emergencyContactPhone: emergencyContact.phone,
    emergencyContactRelationship: emergencyContact.relationship,
    doctorName: profile?.doctorName || profile?.doctor_name || "",
    criticalInstructions,
    notes: criticalInstructions,
    qrToken: profile?.qrToken || "",
    emergencyId: profile?.qrToken || "",
    emergencyUrl: profile?.emergencyUrl || "",
  };
}

export function mapEmergencyProfileFromApi(profile = {}) {
  const allergies = splitList(profile?.allergies);
  const chronicDiseases = splitList(profile?.chronicDiseases);
  const medications = splitList(profile?.medications);
  const emergencyContact = parseEmergencyContact(profile?.emergencyContact);

  return {
    fullName: profile?.fullName || "",
    bloodType: profile?.bloodType || "Unknown",
    allergies,
    conditions: chronicDiseases,
    chronicDiseases,
    medications,
    emergencyContact,
    emergencyContactLabel: buildEmergencyContactLabel(emergencyContact),
    criticalInstructions: String(profile?.criticalInstructions || "").trim(),
  };
}

function mapEmergencyProfileFromSupabase(row = {}) {
  const emergencyContact = parseEmergencyContact({
    name: row?.emergency_contact_name,
    phone: row?.emergency_contact_phone,
  });
  const allergies = splitList(row?.allergies);
  const chronicDiseases = splitList(row?.chronic_diseases);
  const medications = splitList(row?.medications);

  return {
    fullName: row?.full_name || "",
    bloodType: row?.blood_type || "Unknown",
    allergies,
    conditions: chronicDiseases,
    chronicDiseases,
    medications,
    emergencyContact,
    emergencyContactLabel: buildEmergencyContactLabel(emergencyContact),
    criticalInstructions: String(row?.critical_instructions || "").trim(),
    qrToken: row?.qr_token || "",
  };
}

function mapProfileUpdatesToApi(updates = {}) {
  const payload = {};

  if (updates.fullName !== undefined) {
    payload.fullName = String(updates.fullName || "").trim();
  }

  if (updates.email !== undefined) {
    payload.email = String(updates.email || "").trim();
  }

  if (updates.phone !== undefined) {
    payload.phone = String(updates.phone || "").trim();
  }

  if (updates.city !== undefined) {
    payload.city = String(updates.city || "").trim();
  }

  if (updates.bloodType !== undefined) {
    payload.bloodType = String(updates.bloodType || "").trim();
  }

  if (updates.allergies !== undefined) {
    payload.allergies = splitList(updates.allergies);
  }

  if (updates.conditions !== undefined || updates.chronicDiseases !== undefined) {
    payload.chronicDiseases = splitList(updates.chronicDiseases ?? updates.conditions);
  }

  if (updates.medications !== undefined) {
    payload.medications = splitList(updates.medications);
  }

  if (
    updates.emergencyContact !== undefined ||
    updates.emergencyContactName !== undefined ||
    updates.emergencyContactPhone !== undefined
  ) {
    payload.emergencyContact =
      updates.emergencyContact !== undefined
        ? parseEmergencyContact(updates.emergencyContact)
        : parseEmergencyContact({
            name: updates.emergencyContactName,
            phone: updates.emergencyContactPhone,
            relationship: updates.emergencyContactRelationship,
        });
  }

  if (updates.doctorName !== undefined) {
    payload.doctorName = String(updates.doctorName || "").trim();
  }

  if (updates.criticalInstructions !== undefined || updates.notes !== undefined) {
    payload.criticalInstructions = String(
      updates.criticalInstructions ?? updates.notes ?? ""
    ).trim();
  }

  return payload;
}

export async function getProfile(token) {
  const response = await apiRequest("/users/me", { token });
  return mapProfileFromApi(response.profile);
}

export async function updateProfile(token, updates) {
  const response = await apiRequest("/users/me", {
    method: "PUT",
    token,
    body: mapProfileUpdatesToApi(updates),
  });

  return mapProfileFromApi(response.profile);
}

export async function getEmergencyProfile(qrToken) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("public_emergency_profiles")
      .select(
        "full_name,blood_type,allergies,chronic_diseases,medications,emergency_contact_name,emergency_contact_phone,critical_instructions,qr_token"
      )
      .eq("qr_token", qrToken)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || "Impossible de charger la fiche d'urgence.");
    }

    if (!data) {
      throw new Error("Aucune fiche medicale d'urgence n'a ete trouvee pour ce QR.");
    }

    return {
      token: qrToken,
      profile: mapEmergencyProfileFromSupabase(data),
    };
  }

  const response = await apiRequest(`/emergency/${encodeURIComponent(qrToken)}`);

  return {
    token: response.token,
    profile: mapEmergencyProfileFromApi(response.profile),
  };
}
