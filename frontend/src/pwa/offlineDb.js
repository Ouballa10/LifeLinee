/**
 * LifeLine Offline Database (IndexedDB)
 * Stores medical profile data locally for offline access.
 */

const DB_NAME = "lifeline-offline";
const DB_VERSION = 1;

const STORES = {
  profile: "profile",
  pendingUpdates: "pendingUpdates",
};

let dbInstance = null;

function openDb() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.profile)) {
        db.createObjectStore(STORES.profile, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(STORES.pendingUpdates)) {
        db.createObjectStore(STORES.pendingUpdates, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save the user's medical profile for offline access.
 */
export async function saveProfileOffline(profile) {
  if (!profile) return;

  try {
    const db = await openDb();
    const tx = db.transaction(STORES.profile, "readwrite");
    const store = tx.objectStore(STORES.profile);

    store.put({
      key: "currentProfile",
      data: profile,
      savedAt: Date.now(),
    });

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn("[LifeLine] Failed to save profile offline:", error);
  }
}

/**
 * Retrieve the cached profile from IndexedDB.
 */
export async function getProfileOffline() {
  try {
    const db = await openDb();
    const tx = db.transaction(STORES.profile, "readonly");
    const store = tx.objectStore(STORES.profile);
    const request = store.get("currentProfile");

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[LifeLine] Failed to read offline profile:", error);
    return null;
  }
}

/**
 * Queue a profile update for later sync when back online.
 */
export async function queueProfileUpdate(updates) {
  try {
    const db = await openDb();
    const tx = db.transaction(STORES.pendingUpdates, "readwrite");
    const store = tx.objectStore(STORES.pendingUpdates);

    store.add({
      updates,
      createdAt: Date.now(),
    });

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn("[LifeLine] Failed to queue offline update:", error);
  }
}

/**
 * Get all pending updates that need to be synced.
 */
export async function getPendingUpdates() {
  try {
    const db = await openDb();
    const tx = db.transaction(STORES.pendingUpdates, "readonly");
    const store = tx.objectStore(STORES.pendingUpdates);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[LifeLine] Failed to get pending updates:", error);
    return [];
  }
}

/**
 * Clear all pending updates after successful sync.
 */
export async function clearPendingUpdates() {
  try {
    const db = await openDb();
    const tx = db.transaction(STORES.pendingUpdates, "readwrite");
    const store = tx.objectStore(STORES.pendingUpdates);
    store.clear();

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn("[LifeLine] Failed to clear pending updates:", error);
  }
}

/**
 * Save an emergency profile (scanned QR) for offline viewing.
 */
export async function saveEmergencyProfileOffline(qrToken, profile) {
  if (!qrToken || !profile) return;

  try {
    const db = await openDb();
    const tx = db.transaction(STORES.profile, "readwrite");
    const store = tx.objectStore(STORES.profile);

    store.put({
      key: `emergency_${qrToken}`,
      data: profile,
      savedAt: Date.now(),
    });

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn("[LifeLine] Failed to save emergency profile offline:", error);
  }
}

/**
 * Get a cached emergency profile by QR token.
 */
export async function getEmergencyProfileOffline(qrToken) {
  if (!qrToken) return null;

  try {
    const db = await openDb();
    const tx = db.transaction(STORES.profile, "readonly");
    const store = tx.objectStore(STORES.profile);
    const request = store.get(`emergency_${qrToken}`);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[LifeLine] Failed to read offline emergency profile:", error);
    return null;
  }
}
