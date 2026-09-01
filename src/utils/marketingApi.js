/**
 * marketingApi.js
 * ----------------
 * API helpers for the marketing banner image endpoints.
 *
 * Endpoints:
 *   POST   /api/v1/marketing/banner/image  — upload a JPG (multipart/form-data)
 *   GET    /api/v1/marketing/banner/image  — fetch current banner URL
 *   DELETE /api/v1/marketing/banner/image  — remove the current banner
 *
 * Admin-only: POST and DELETE require a Bearer token (sent automatically
 * by apiFetch via the `igs_user` localStorage entry).
 * GET is public — no auth header needed.
 */

import { BASE_URL } from './constants';
import { apiFetch } from './apiClient';

const BANNER_ENDPOINT = `${BASE_URL}/api/v1/marketing/banner/image`;

/**
 * Upload a banner image (admin only).
 * @param {File} file - The JPG/PNG/WEBP file to upload.
 * @returns {Promise<{ imageUrl: string, imageFilename: string }>}
 */
export async function uploadBannerImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiFetch(BANNER_ENDPOINT, {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets it with the correct boundary
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Upload failed (${response.status})`);
    }

    const json = await response.json();
    // Expected: { success: true, data: { imageUrl, imageFilename } }
    // imageUrl is a relative path — prefix with BASE_URL for a fully-qualified URL
    const { imageUrl, imageFilename } = json.data;
    return {
        imageUrl: imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`,
        imageFilename,
    };
}

/**
 * Fetch the current banner image URL (public, no auth required).
 * @returns {Promise<{ imageUrl: string, imageFilename: string } | null>}
 */
export async function fetchBannerImage() {
    const response = await fetch(BANNER_ENDPOINT);

    if (response.status === 404) return null; // No banner set yet
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Fetch failed (${response.status})`);
    }

    const json = await response.json();
    if (!json.data) return null;
    const { imageUrl, imageFilename } = json.data;
    return {
        imageUrl: imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`,
        imageFilename,
    };
}

/**
 * Delete the current banner image (admin only).
 * @returns {Promise<void>}
 */
export async function deleteBannerImage() {
    const response = await apiFetch(BANNER_ENDPOINT, { method: 'DELETE' });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Delete failed (${response.status})`);
    }
}

/* ─────────────────────────────────
   Banner Texts API
   POST   /api/v1/marketing/banner/texts   — add texts array (admin)
   GET    /api/v1/marketing/banner/texts   — fetch texts (public)
   DELETE /api/v1/marketing/banner/texts/:index — remove by index (admin)
───────────────────────────────── */

const TEXTS_ENDPOINT = `${BASE_URL}/api/v1/marketing/banner/texts`;

/**
 * Fetch current banner texts (public, no auth required).
 * @returns {Promise<string[]>}
 */
export async function fetchBannerTexts() {
    const response = await fetch(TEXTS_ENDPOINT);

    if (response.status === 404) return [];
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Fetch texts failed (${response.status})`);
    }

    const json = await response.json();
    // Expected: { success: true, data: { texts: [...] } }  or  { texts: [...] }
    return json.data?.texts ?? json.texts ?? [];
}

/**
 * Add texts to the banner strip (admin only).
 * @param {string[]} texts
 * @returns {Promise<string[]>} — updated full texts array
 */
export async function addBannerTexts(texts) {
    const response = await apiFetch(TEXTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Add texts failed (${response.status})`);
    }

    const json = await response.json();
    return json.data?.texts ?? json.texts ?? texts;
}

/**
 * Delete a single text by its index (admin only).
 * @param {number} index
 * @returns {Promise<string[]>} — updated texts array
 */
export async function deleteBannerText(index) {
    const response = await apiFetch(`${TEXTS_ENDPOINT}/${index}`, { method: 'DELETE' });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Delete text failed (${response.status})`);
    }

    const json = await response.json();
    return json.data?.texts ?? json.texts ?? [];
}
