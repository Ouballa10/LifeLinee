/**
 * LifeLine Background Sync
 * Syncs pending profile updates when the user comes back online.
 */

import { getPendingUpdates, clearPendingUpdates, saveProfileOffline } from "./offlineDb.js";
import { updateProfile as persistProfile, getProfile } from "../services/profileService.js";

let isSyncing = false;

/**
 * Attempt to sync all pending offline updates to the server.
 * Returns true if all updates were synced successfully.
 */
export async function syncPendingUpdates(getToken) {
  if (isSyncing || !navigator.onLine) {
    return false;
  }

  isSyncing = true;

  try {
    const pending = await getPendingUpdates();

    if (pending.length === 0) {
      return true;
    }

    const token = await getToken();

    if (!token) {
      return false;
    }

    // Merge all pending updates into one payload (latest wins)
    const mergedUpdates = pending
      .sort((a, b) => a.createdAt - b.createdAt)
      .reduce((acc, item) => ({ ...acc, ...item.updates }), {});

    // Send merged update to server
    const updatedProfile = await persistProfile(token, mergedUpdates);

    // Clear pending queue
    await clearPendingUpdates();

    // Update offline cache with fresh data
    await saveProfileOffline(updatedProfile);

    return true;
  } catch (error) {
    console.warn("[LifeLine] Background sync failed:", error);
    return false;
  } finally {
    isSyncing = false;
  }
}

/**
 * Register online listener to auto-sync when connection returns.
 */
export function registerBackgroundSync(getToken, onSyncComplete) {
  function handleOnline() {
    syncPendingUpdates(getToken).then((success) => {
      if (success && onSyncComplete) {
        onSyncComplete();
      }
    });
  }

  window.addEventListener("online", handleOnline);

  // Also try to sync immediately if already online
  if (navigator.onLine) {
    syncPendingUpdates(getToken).then((success) => {
      if (success && onSyncComplete) {
        onSyncComplete();
      }
    });
  }

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
