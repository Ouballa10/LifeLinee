import { createContext, startTransition, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { auth, isFirebaseConfigured } from "../services/firebase.js";
import {
  clearCurrentSession,
  getCurrentSession,
  getStoredGoogleProfile,
  loginUser,
  loginGoogle as loginWithGooglePopup,
  logoutGoogle,
  registerUser,
  saveGoogleProfile,
  syncFirebaseSession,
  syncGoogleSession,
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
    if (!storedSession?.user) {
      return;
    }

    saveGoogleProfile(storedSession.user);
  }, [storedSession?.user]);

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
      ![AUTH_PROVIDERS.firebase, AUTH_PROVIDERS.google].includes(storedSession?.authProvider)
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

      setIsLoading(true);

      try {
        const syncSession =
          storedSession?.authProvider === AUTH_PROVIDERS.google
            ? syncGoogleSession
            : syncFirebaseSession;
        const session = await syncSession(firebaseUser, {
          ...(getStoredGoogleProfile(firebaseUser) || {}),
          ...(storedSession?.user || {}),
        });
        const authProvider = session.authProvider || storedSession?.authProvider;

        startTransition(() => {
          setStoredSession((current) => ({
            ...(current || {}),
            ...session,
            user: {
              ...(current?.user || {}),
              ...session.user,
              authProvider,
            },
            authProvider,
          }));
        });
      } catch {
        clearCurrentSession();
        startTransition(() => {
          setStoredSession(null);
        });
      } finally {
        setIsLoading(false);
      }
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

    setIsLoading(true);

    try {
      const isFirebaseProvider = [AUTH_PROVIDERS.firebase, AUTH_PROVIDERS.google].includes(
        storedSession?.authProvider
      );
      const nextToken =
        auth?.currentUser && isFirebaseProvider
          ? await auth.currentUser.getIdToken()
          : storedSession.token;
      const user = await persistProfile(nextToken, updates);
      const nextUser =
        isFirebaseProvider
          ? {
              ...(storedSession.user || {}),
              ...user,
              authProvider: storedSession?.authProvider,
            }
          : user;

      if (isFirebaseProvider) {
        saveGoogleProfile(nextUser);
      }

      startTransition(() => {
        setStoredSession((current) =>
          current
            ? {
                ...current,
                token: nextToken,
                user: nextUser,
              }
            : current
        );
      });
      return nextUser;
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshProfile() {
    if (!storedSession?.token) {
      return null;
    }

    const isFirebaseProvider = [AUTH_PROVIDERS.firebase, AUTH_PROVIDERS.google].includes(
      storedSession?.authProvider
    );
    const nextToken =
      auth?.currentUser && isFirebaseProvider
        ? await auth.currentUser.getIdToken()
        : storedSession.token;
    const user = await fetchProfile(nextToken);
    const nextUser =
      isFirebaseProvider
        ? {
            ...(storedSession.user || {}),
            ...user,
            authProvider: storedSession?.authProvider,
          }
        : user;

    if (isFirebaseProvider) {
      saveGoogleProfile(nextUser);
    }

    startTransition(() => {
      setStoredSession((current) =>
        current
          ? {
              ...current,
              token: nextToken,
              user: nextUser,
            }
          : current
      );
    });
    return nextUser;
  }

  async function logout() {
    if ([AUTH_PROVIDERS.firebase, AUTH_PROVIDERS.google].includes(storedSession?.authProvider)) {
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
