import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

function readFirebaseEnv(key) {
  return String(import.meta.env[key] || "").trim();
}

// Firebase configuration loaded from Vite environment variables.
const firebaseConfig = {
  apiKey: readFirebaseEnv("VITE_FIREBASE_API_KEY"),
  authDomain: readFirebaseEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: readFirebaseEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: readFirebaseEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readFirebaseEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readFirebaseEnv("VITE_FIREBASE_APP_ID"),
};

const requiredConfigKeys = ["apiKey", "authDomain", "projectId", "appId"];
const missingConfigKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key]);

export const isFirebaseConfigured = missingConfigKeys.length === 0;

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;

export const googleProvider = auth ? new GoogleAuthProvider() : null;

if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
}

export default app;
