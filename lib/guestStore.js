export const DB_NAME = 'MoodFolioGuestDB';
export const STORE_NAME = 'guestPortfolios';
const DB_VERSION = 1;

/**
 * Open the database
 * @returns {Promise<IDBDatabase>}
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

/**
 * Save guest portfolio to IndexedDB
 * @param {string} id 
 * @param {object} data 
 * @returns {Promise<void>}
 */
export const saveGuestPortfolio = async (id, data) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data); // data must have 'id' property matching keyPath

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

/**
 * Load guest portfolio from IndexedDB
 * @param {string} id 
 * @returns {Promise<object>}
 */
export const loadGuestPortfolio = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

/**
 * Remove guest portfolio from IndexedDB
 * @param {string} id 
 * @returns {Promise<void>}
 */
export const removeGuestPortfolio = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

/**
 * Clear all guest portfolios (optional cleanup)
 * @returns {Promise<void>}
 */
export const clearGuestPortfolios = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};
