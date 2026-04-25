import { apiRequest } from "./api.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
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

function getFirebaseProfileKeys(source = {}) {
  const keys = [];
  const uid = String(source?.uid || source?.id || source?.firebaseUid || "").trim();
  const email = String(source?.email || "").trim().toLowerCase();

  if (uid) {
    keys.push(`uid:${uid}`);
  }

  if (email) {
    keys.push(`email:${email}`);
  }

  return keys;
}

function readFirebaseProfilesStore() {
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
      const legacyKeys = getFirebaseProfileKeys(parsed);

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

function writeFirebaseProfilesStore(profiles = {}) {
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

  if (!session) {
    return null;
  }

  const savedFirebaseProfile = getStoredGoogleProfile(session?.user || session);

  if (!savedFirebaseProfile) {
    return session;
  }

  return {
    ...session,
    user: {
      ...(session.user || {}),
      ...savedFirebaseProfile,
      authProvider: session.authProvider || AUTH_PROVIDERS.firebase,
    },
  };
}

export function clearCurrentSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEYS.authSession);
  }
}

export function getStoredGoogleProfile(identitySource = {}) {
  const profiles = readFirebaseProfilesStore();

  for (const key of getFirebaseProfileKeys(identitySource)) {
    if (profiles[key]) {
      return profiles[key];
    }
  }

  return null;
}

export function saveGoogleProfile(profile) {
  const keys = getFirebaseProfileKeys(profile);

  if (!keys.length) {
    return;
  }

  const profiles = readFirebaseProfilesStore();

  keys.forEach((key) => {
    profiles[key] = profile;
  });

  writeFirebaseProfilesStore(profiles);
}

function requireFirebaseAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      "Firebase n'est pas configure. Ajoutez les variables VITE_FIREBASE_* dans frontend/.env."
    );
  }
}

function normalizeFirebaseError(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "Un compte Firebase existe deja avec cet email.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email ou mot de passe invalide.";
    case "auth/popup-closed-by-user":
      return "La fenetre Google a ete fermee avant la fin de la connexion.";
    case "auth/popup-blocked":
      return "Le navigateur a bloque la fenetre Google. Autorisez les popups puis reessayez.";
    case "auth/cancelled-popup-request":
      return "Une autre tentative de connexion est deja en cours.";
    case "auth/network-request-failed":
      return "Connexion reseau impossible. Verifiez Internet puis reessayez.";
    case "auth/weak-password":
      return "Le mot de passe doit contenir au moins 6 caracteres.";
    default:
      return error?.message || "Une erreur est survenue pendant l'authentification.";
  }
}

function buildFirebaseSessionFromApi(response, firebaseUser, existingProfile = {}, provider) {
  const apiProfile = mapProfileFromApi(response.profile);
  const firebaseProfile = response.firebaseProfile || {};
  const user = {
    ...existingProfile,
    ...apiProfile,
    id: firebaseUser.uid || firebaseProfile.firebaseUid || existingProfile?.id || "",
    firebaseUid: firebaseUser.uid || firebaseProfile.firebaseUid || existingProfile?.firebaseUid || "",
    fullName:
      apiProfile.fullName ||
      firebaseProfile.fullName ||
      existingProfile?.fullName ||
      firebaseUser.displayName ||
      "Utilisateur LifeLine",
    email: apiProfile.email || firebaseProfile.email || firebaseUser.email || existingProfile?.email || "",
    photoURL: firebaseProfile.photoURL || firebaseUser.photoURL || existingProfile?.photoURL || "",
    authProvider: provider,
  };

  saveGoogleProfile(user);

  return {
    token: response.token,
    user,
    authProvider: provider,
  };
}

export async function syncFirebaseSession(firebaseUser, existingProfile = {}, defaults = {}) {
  const idToken = await firebaseUser.getIdToken();
  const response = await apiRequest("/auth/firebase", {
    method: "POST",
    body: {
      idToken,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      fullName: defaults.fullName || firebaseUser.displayName || existingProfile?.fullName || "",
      phone: defaults.phone || existingProfile?.phone || "",
      city: defaults.city || existingProfile?.city || "",
      bloodType: defaults.bloodType || existingProfile?.bloodType || "Unknown",
      allergies: defaults.allergies || existingProfile?.allergiesList || existingProfile?.allergies || [],
      chronicDiseases:
        defaults.chronicDiseases || existingProfile?.chronicDiseases || existingProfile?.conditions || [],
      medications: defaults.medications || existingProfile?.medicationsList || existingProfile?.medications || [],
      emergencyContact: defaults.emergencyContact || existingProfile?.emergencyContact || "",
      doctorName: defaults.doctorName || existingProfile?.doctorName || "",
      criticalInstructions:
        defaults.criticalInstructions ||
        existingProfile?.criticalInstructions ||
        existingProfile?.notes ||
        "",
    },
  });

  return buildFirebaseSessionFromApi(
    response,
    firebaseUser,
    existingProfile,
    defaults.provider || AUTH_PROVIDERS.firebase
  );
}

export async function syncGoogleSession(firebaseUser, existingProfile = {}) {
  return syncFirebaseSession(firebaseUser, existingProfile, {
    provider: AUTH_PROVIDERS.google,
  });
}

export async function loginUser({ email, password }) {
  if (!email?.trim() || !password?.trim()) {
    throw new Error("Email and password are required.");
  }

  requireFirebaseAuth();

  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return await syncFirebaseSession(
      result.user,
      getStoredGoogleProfile(result.user) || {},
      {
        provider: AUTH_PROVIDERS.firebase,
      }
    );
  } catch (error) {
    if (error?.code) {
      throw new Error(normalizeFirebaseError(error));
    }

    throw error;
  }
}

export async function registerUser(formValues) {
  const { fullName, email, phone, bloodType, password, confirmPassword } = formValues;

  if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
    throw new Error("Please complete all required fields.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  requireFirebaseAuth();

  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateFirebaseProfile(result.user, {
      displayName: fullName.trim(),
    });

    return await syncFirebaseSession(result.user, {}, {
      provider: AUTH_PROVIDERS.firebase,
      fullName: fullName.trim(),
      phone: phone.trim(),
      bloodType,
    });
  } catch (error) {
    if (error?.code) {
      throw new Error(normalizeFirebaseError(error));
    }

    throw error;
  }
}

export async function loginGoogle() {
  requireFirebaseAuth();

  if (!googleProvider) {
    throw new Error("Google Auth n'est pas configure dans Firebase.");
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
