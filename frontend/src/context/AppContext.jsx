import { createContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { STORAGE_KEYS } from "../utils/constants.js";

const defaultAppState = {
  scannerPermission: false,
  lastScan: "",
  scanHistory: [],
};

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [appState, setAppState] = useLocalStorage(STORAGE_KEYS.appState, defaultAppState);

  function setScannerPermission(scannerPermission) {
    setAppState((current) => ({
      ...current,
      scannerPermission,
    }));
  }

  function saveLastScan(lastScan) {
    const history = Array.isArray(appState.scanHistory) ? appState.scanHistory : [];
    const newEntry = {
      value: lastScan,
      date: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    // Keep last 20 scans
    const updatedHistory = [newEntry, ...history].slice(0, 20);

    setAppState((current) => ({
      ...current,
      lastScan,
      scanHistory: updatedHistory,
    }));
  }

  const value = useMemo(
    () => ({
      appState,
      setScannerPermission,
      saveLastScan,
    }),
    [appState]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
