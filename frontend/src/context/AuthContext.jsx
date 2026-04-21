import { createContext, startTransition, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { auth, isFirebaseConfigured } from "../services/firebase.js";
import {
  clearCurrentSession,
  getCurrentSession,
  loginUser,
  loginGoogle as loginWithGooglePopup,
  logoutGoogle,
  registerUser,
} from "../services/authService.js";
import { getProfile as fetchProfile, updateProfile as persistProfile } from "../services/profileService.js";
import { AUTH_PROVIDERS, STORAGE_KEYS } from "../utils/constants.js";

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
    const currentProvider = storedSession?.authProvider || AUTH_PROVIDERS.backend;

    if (
      !currentToken ||
      currentProvider !== AUTH_PROVIDERS.backend ||
      hydratedTokenRef.current === currentToken
    ) {
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

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      !auth ||
      storedSession?.authProvider !== AUTH_PROVIDERS.google
    ) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearCurrentSession();
        startTransition(() => {
          setStoredSession(null);
        });
        return;
      }

      const token = await firebaseUser.getIdToken();
      const nextUser = {
        id: firebaseUser.uid,
        fullName: firebaseUser.displayName || "Utilisateur Google",
        email: firebaseUser.email || "",
        phone: firebaseUser.phoneNumber || "",
        photoURL: firebaseUser.photoURL || "",
        authProvider: AUTH_PROVIDERS.google,
      };

      startTransition(() => {
        setStoredSession((current) => ({
          ...(current || {}),
          token,
          user: nextUser,
          authProvider: AUTH_PROVIDERS.google,
        }));
      });
    });

    return unsubscribe;
  }, [setStoredSession, storedSession?.authProvider]);

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

  async function loginGoogle() {
    setIsLoading(true);

    try {
      const session = await loginWithGooglePopup();
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

    if (storedSession?.authProvider === AUTH_PROVIDERS.google) {
      const user = {
        ...(storedSession.user || {}),
        ...updates,
      };

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

    if (storedSession?.authProvider === AUTH_PROVIDERS.google) {
      return storedSession.user || null;
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

  async function logout() {
    if (storedSession?.authProvider === AUTH_PROVIDERS.google) {
      await logoutGoogle();
    }

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
      loginGoogle,
      register,
      updateProfile,
      refreshProfile,
      logout,
    }),
    [isLoading, storedSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
