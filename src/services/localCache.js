/**
 * Persistent Local Cache for Commons Photo Album
 * Uses browser IndexedDB for high-capacity, instant-load local caching.
 * Falls back to localStorage if IndexedDB is unavailable.
 */

const DB_NAME = 'CommonsPhotoAlbumDB';
const DB_VERSION = 1;
const STORE_NAME = 'user_albums';

// Open or initialize the IndexedDB database
function getDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'username' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('IndexedDB open error, falling back to in-memory/localStorage', request.error);
      resolve(null);
    };
  });
}

/**
 * Get cached photos & metadata for a contributor
 * @param {string} username
 */
export async function getCachedContributor(username) {
  if (!username) return null;
  const key = username.toLowerCase().trim();

  try {
    const db = await getDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    }

    // LocalStorage fallback
    const raw = localStorage.getItem(`cpa_user_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to read from local cache:', err);
    return null;
  }
}

/**
 * Save or update cached photos & metadata for a contributor
 * @param {string} username
 * @param {object} data - { photos, continueToken, totalUploads, userInfo, hasMore }
 */
export async function saveCachedContributor(username, data) {
  if (!username || !data) return;
  const key = username.toLowerCase().trim();

  const record = {
    username: key,
    originalUsername: username,
    photos: data.photos || [],
    continueToken: data.continueToken || null,
    totalUploads: data.totalUploads || 0,
    userInfo: data.userInfo || null,
    hasMore: Boolean(data.hasMore),
    timestamp: Date.now(),
  };

  try {
    const db = await getDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }

    // LocalStorage fallback (store first 100 photos if storage limit allows)
    try {
      const slim = { ...record, photos: record.photos.slice(0, 80) };
      localStorage.setItem(`cpa_user_${key}`, JSON.stringify(slim));
    } catch (e) {
      console.warn('LocalStorage quota reached, skipped fallback save');
    }
  } catch (err) {
    console.warn('Failed to save to local cache:', err);
  }
}

/**
 * Clear cached contributor data
 */
export async function clearCachedContributor(username) {
  if (!username) return;
  const key = username.toLowerCase().trim();
  try {
    const db = await getDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
    }
    localStorage.removeItem(`cpa_user_${key}`);
  } catch (e) {
    console.warn(e);
  }
}
