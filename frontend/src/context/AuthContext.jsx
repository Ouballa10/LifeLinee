import { createContext, startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import {
  clearCurrentSession,
  getCurrentSession,
  loginUser,
  registerUser,
} from "../services/authService.js";
import { getProfile as fetchProfile, updateProfile as persistProfile } from "../services/profileService.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [storedSession, setStoredSession] = useLocalStorage(
    STORAGE_KEYS.authSession,
    getCurrentSession()
  );
  const [isLoading, setIsLoading] = useState(Boolean(storedSession?.token && !storedSession?.user));
  const hydratedTokenRef = useRef("");

  useEffect(() => {
    const currentToken = storedSession?.token || "";

    if (!currentToken || hydratedTokenRef.current === currentToken) {
      return;
    }

    hydratedTokenRef.current = currentToken;
    setIsLoading(true);

    fetchProfile(currentToken)
      .then((user) => {
        startTransition(() => {
          setStoredSession((current) => (current ? { ...current, user } : current));
        });
      })
      .catch(() => {
        clearCurrentSession();
        startTransition(() => {
          setStoredSession(null);
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setStoredSession, storedSession?.token]);

  async function login(formValues) {
    setIsLoading(true);

    try {
      const session = await loginUser(formValues);
      startTransition(() => {
        setStoredSession(session);
      });
      return session.user;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(formValues) {
    setIsLoading(true);

    try {
      const session = await registerUser(formValues);
      startTransition(() => {
        setStoredSession(session);
      });
      return session.user;
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(updates) {
    if (!storedSession?.token) {
      throw new Error("You must be connected to update the profile.");
    }

    setIsLoading(true);

    try {
      const user = await persistProfile(storedSession.token, updates);
      startTransition(() => {
        setStoredSession((current) =>
          current
            ? {
                ...current,
                user,
              }
            : current
        );
      });
      return user;
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshProfile() {
    if (!storedSession?.token) {
      return null;
    }

    const user = await fetchProfile(storedSession.token);
    startTransition(() => {
      setStoredSession((current) =>
        current
          ? {
              ...current,
              user,
            }
          : current
      );
    });
    return user;
  }

  function logout() {
    clearCurrentSession();
    setStoredSession(null);
  }

  const value = useMemo(
    () => ({
      user: storedSession?.user || null,
      token: storedSession?.token || "",
      isAuthenticated: Boolean(storedSession?.token),
      isLoading,
      login,
      register,
      updateProfile,
      refreshProfile,
      logout,
    }),
    [isLoading, storedSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
