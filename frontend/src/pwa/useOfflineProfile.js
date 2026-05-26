/**
 * LifeLine Offline-First Profile Hook
 * Provides profile data with offline fallback from IndexedDB.
 */

import { useEffect, useRef } from "react";
import {
  saveProfileOffline,
  getProfileOffline,
  queueProfileUpdate,
} from "./offlineDb.js";
import { registerBackgroundSync } from "./offlineSync.js";

/**
 * Hook that syncs the user profile to IndexedDB for offline access
 * and handles background sync of pending updates.
 *
 * @param {object} options
 * @param {object|null} options.profile - Current user profile from context
 * @param {function} options.getToken - Async function to get auth token
 * @param {function} options.onSyncComplete - Callback when background sync completes
 */
export function useOfflineProfile({ profile, getToken, onSyncComplete }) {
  const syncCleanupRef = useRef(null);

  // Save profile to IndexedDB whenever it changes
  useEffect(() => {
    if (profile && profile.id) {
      saveProfileOffline(profile);
    }
  }, [profile]);

  // Register background sync
  useEffect(() => {
    if (getToken) {
      syncCleanupRef.current = registerBackgroundSync(getToken, onSyncComplete);
    }

    return () => {
      if (syncCleanupRef.current) {
        syncCleanupRef.current();
      }
    };
  }, [getToken, onSyncComplete]);
}

/**
 * Get cached profile for offline use.
 * Call this when the network request fails.
 */
export { getProfileOffline, queueProfileUpdate };
