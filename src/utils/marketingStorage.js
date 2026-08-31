/**
 * marketingStorage.js
 * ---------------------
 * Shared localStorage helpers for marketing banners & strips.
 * Images are stored as base64 data-URLs so they survive page reloads.
 * In future, swap these helpers with API calls.
 */

const STORAGE_KEY = "igs_marketing_items";

/** Read all items from localStorage */
export function loadMarketingItems() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/** Persist the full items array to localStorage */
export function saveMarketingItems(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.warn("marketingStorage: failed to save", e);
    }
}

/** Return only the active banner items */
export function getActiveBanners() {
    return loadMarketingItems().filter((i) => i.type === "banner" && i.active);
}

/** Return only the active strip items (flat array of text strings) */
export function getActiveStripTexts() {
    const strips = loadMarketingItems().filter((i) => i.type === "strip" && i.active);
    return strips.flatMap((s) => s.texts ?? [s.name]);
}
