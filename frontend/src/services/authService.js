import { apiRequest } from "./api.js";
import { mapProfileFromApi } from "./profileService.js";
import { STORAGE_KEYS } from "../utils/constants.js";

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
  };
}
