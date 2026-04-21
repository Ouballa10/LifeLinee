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

export function getCurrentSession() {
  return readStoredSession();
}

export function clearCurrentSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEYS.authSession);
    window.localStorage.removeItem(STORAGE_KEYS.firebaseUser);
  }
}

function mapFirebaseUser(firebaseUser) {
  return {
    id: firebaseUser.uid,
    fullName: firebaseUser.displayName || "Utilisateur Google",
    email: firebaseUser.email || "",
    phone: firebaseUser.phoneNumber || "",
    photoURL: firebaseUser.photoURL || "",
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
    const token = await firebaseUser.getIdToken();
    const user = mapFirebaseUser(firebaseUser);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.firebaseUser, JSON.stringify(user));
    }

    return {
      token,
      user,
      authProvider: AUTH_PROVIDERS.google,
    };
  } catch (error) {
    throw new Error(normalizeFirebaseError(error));
  }
}

export async function logoutGoogle() {
  if (auth) {
    await signOut(auth);
  }
}
