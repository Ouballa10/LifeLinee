const STORAGE_KEY = "lifeline.user";

const defaultProfile = {
  fullName: "Nadia Benali",
  email: "nadia@example.com",
  phone: "06 12 34 56 78",
  bloodType: "O+",
  allergies: "Penicilline",
  conditions: "Diabete type 1",
  medications: "Insuline",
  emergencyContact: "Meryem Benali - 06 98 45 22 11",
  doctor: "Dr Karim El Idrissi",
};

export function buildUserProfile(overrides = {}) {
  return {
    ...defaultProfile,
    ...overrides,
  };
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function nameFromEmail(email) {
  const fallback = "Utilisateur LifeLine";
  const safeEmail = email?.trim();

  if (!safeEmail || !safeEmail.includes("@")) {
    return fallback;
  }

  const localPart = safeEmail.split("@")[0];
  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return cleaned || fallback;
}
