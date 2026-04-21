import { apiRequest } from "./api.js";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "./firebase.js";
import { mapProfileFromApi } from "./profileService.js";
import { AUTH_PROVIDERS, STORAGE_KEYS } from "../utils/constants.js";

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.authSession);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getGoogleProfileKeys(source = {}) {
  const keys = [];
  const uid = String(source?.uid || source?.id || "").trim();
  const email = String(source?.email || "").trim().toLowerCase();

  if (uid) {
    keys.push(`uid:${uid}`);
  }

  if (email) {
    keys.push(`email:${email}`);
  }

  return keys;
}

function readGoogleProfilesStore() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.firebaseUser);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && parsed.profiles && typeof parsed.profiles === "object") {
      return parsed.profiles;
    }

    if (parsed && typeof parsed === "object") {
      const legacyKeys = getGoogleProfileKeys(parsed);

      if (legacyKeys.length) {
        return legacyKeys.reduce((profiles, key) => {
          profiles[key] = parsed;
          return profiles;
        }, {});
      }
    }
  } catch {
    return {};
  }

  return {};
}

function writeGoogleProfilesStore(profiles = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const entries = Object.entries(profiles).filter(([, value]) => value && typeof value === "object");

  if (!entries.length) {
    window.localStorage.removeItem(STORAGE_KEYS.firebaseUser);
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEYS.firebaseUser,
    JSON.stringify({
      profiles: Object.fromEntries(entries),
    })
  );
}

export function getCurrentSession() {
  const session = readStoredSession();

  if (!session || session.authProvider !== AUTH_PROVIDERS.google) {
    return session;
  }

  const savedGoogleProfile = getStoredGoogleProfile(session?.user || session);

  if (!savedGoogleProfile) {
    return session;
  }

  return {
    ...session,
    user: {
      ...(session.user || {}),
      ...savedGoogleProfile,
      authProvider: AUTH_PROVIDERS.google,
    },
  };
}

export function clearCurrentSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEYS.authSession);
  }
}

export function getStoredGoogleProfile(identitySource = {}) {
  const profiles = readGoogleProfilesStore();

  for (const key of getGoogleProfileKeys(identitySource)) {
    if (profiles[key]) {
      return profiles[key];
    }
  }

  return null;
}

export function saveGoogleProfile(profile) {
  const keys = getGoogleProfileKeys(profile);

  if (!keys.length) {
    return;
  }

  const profiles = readGoogleProfilesStore();

  keys.forEach((key) => {
    profiles[key] = profile;
  });

  writeGoogleProfilesStore(profiles);
}

export function mergeGoogleUserProfile(firebaseUser, existingProfile = {}) {
  return {
    ...existingProfile,
    id: firebaseUser.uid,
    fullName: existingProfile?.fullName || firebaseUser.displayName || "Utilisateur Google",
    email: firebaseUser.email || existingProfile?.email || "",
    phone: existingProfile?.phone || firebaseUser.phoneNumber || "",
    photoURL: firebaseUser.photoURL || existingProfile?.photoURL || "",
    bloodType: existingProfile?.bloodType || "Unknown",
    city: existingProfile?.city || "",
    allergies: existingProfile?.allergies || "",
    conditions: existingProfile?.conditions || "",
    medications: existingProfile?.medications || "",
    emergencyContact: existingProfile?.emergencyContact || "",
    criticalInstructions: existingProfile?.criticalInstructions || existingProfile?.notes || "",
    notes: existingProfile?.notes || existingProfile?.criticalInstructions || "",
    authProvider: AUTH_PROVIDERS.google,
  };
}

function normalizeFirebaseError(error) {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
      return "La fenetre Google a ete fermee avant la fin de la connexion.";
    case "auth/popup-blocked":
      return "Le navigateur a bloque la fenetre Google. Autorisez les popups puis reessayez.";
    case "auth/cancelled-popup-request":
      return "Une autre tentative de connexion est deja en cours.";
    case "auth/network-request-failed":
      return "Connexion reseau impossible. Verifiez Internet puis reessayez.";
    default:
      return error?.message || "Une erreur est survenue pendant la connexion avec Google.";
  }
}

function buildGoogleSessionFromApi(response, firebaseUser, existingProfile = {}) {
  const apiProfile = mapProfileFromApi(response.profile);
  const googleProfile = response.googleProfile || {};
  const user = {
    ...apiProfile,
    id: firebaseUser.uid || existingProfile?.id || apiProfile.id || "",
    userId: apiProfile.userId || existingProfile?.userId || "",
    firebaseUid: firebaseUser.uid || googleProfile.googleUid || existingProfile?.firebaseUid || "",
    fullName:
      apiProfile.fullName ||
      googleProfile.fullName ||
      existingProfile?.fullName ||
      firebaseUser.displayName ||
      "Utilisateur Google",
    email:
      apiProfile.email ||
      googleProfile.email ||
      firebaseUser.email ||
      existingProfile?.email ||
      "",
    photoURL: googleProfile.photoURL || firebaseUser.photoURL || existingProfile?.photoURL || "",
    authProvider: AUTH_PROVIDERS.google,
  };

  saveGoogleProfile(user);

  return {
    token: response.token,
    user,
    authProvider: AUTH_PROVIDERS.google,
  };
}

export async function syncGoogleSession(firebaseUser, existingProfile = {}) {
  const idToken = await firebaseUser.getIdToken();
  const response = await apiRequest("/auth/google", {
    method: "POST",
    body: {
      idToken,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      fullName: firebaseUser.displayName || existingProfile?.fullName || "",
      photoURL: firebaseUser.photoURL || existingProfile?.photoURL || "",
    },
  });

  return buildGoogleSessionFromApi(response, firebaseUser, existingProfile);
}

export async function loginUser({ email, password }) {
  if (!email?.trim() || !password?.trim()) {
    throw new Error("Email and password are required.");
  }

  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: {
      email: email.trim(),
      password,
    },
  });

  return {
    token: response.token,
    user: mapProfileFromApi(response.profile),
    authProvider: AUTH_PROVIDERS.backend,
  };
}

export async function registerUser(formValues) {
  const { fullName, email, phone, bloodType, password, confirmPassword } = formValues;

  if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
    throw new Error("Please complete all required fields.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bloodType,
      password,
    },
  });

  return {
    token: response.token,
    user: mapProfileFromApi(response.profile),
    authProvider: AUTH_PROVIDERS.backend,
  };
}

export async function loginGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error(
      "Firebase n'est pas configure. Ajoutez les variables VITE_FIREBASE_* dans frontend/.env."
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    return await syncGoogleSession(firebaseUser, getStoredGoogleProfile(firebaseUser) || {});
  } catch (error) {
    if (error?.code) {
      throw new Error(normalizeFirebaseError(error));
    }

    throw new Error(
      error?.message || "Une erreur est survenue pendant la connexion avec Google."
    );
  }
}

export async function logoutGoogle() {
  if (auth) {
    await signOut(auth);
  }
}
