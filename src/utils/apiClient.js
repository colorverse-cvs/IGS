import { BASE_URL } from './constants';

/**
 * API Client with Automatic Token Refresh
 * 
 * This utility wraps fetch() to automatically handle token refresh when the access token expires.
 * 
 * Features:
 * - Detects 401 (Unauthorized) errors
 * - Automatically calls refresh token API
 * - Retries the original request with new token
 * - Prevents multiple concurrent refresh calls
 * - Logs user out if refresh token is also expired
 */

let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to token refresh completion
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

// Notify all subscribers when token is refreshed
const onTokenRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

/**
 * Refresh the access token using the refresh token
 */
const refreshAccessToken = async () => {
    try {
        // Get user data from localStorage
        const userDataString = localStorage.getItem('igs_user');
        if (!userDataString) {
            throw new Error('No user data found');
        }

        const userData = JSON.parse(userDataString);
        const { refreshToken, profile } = userData;
        const userId = profile?.id;

        if (!refreshToken || !userId) {
            throw new Error('Missing refresh token or user ID');
        }


        const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                refreshToken,
            }),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        const newToken = data.data?.token || data.token;
        const newRefreshToken = data.data?.refreshToken || data.refreshToken || refreshToken;

        if (!newToken) {
            throw new Error('No token in refresh response');
        }


        // Update localStorage with new tokens
        const updatedUserData = {
            ...userData,
            token: newToken,
            refreshToken: newRefreshToken,
        };
        localStorage.setItem('igs_user', JSON.stringify(updatedUserData));

        // Dispatch custom event to update Redux store
        window.dispatchEvent(new CustomEvent('tokenRefreshed', {
            detail: { token: newToken, refreshToken: newRefreshToken }
        }));

        return newToken;
    } catch (error) {
        console.error('[Token Refresh] Failed:', error);

        // Clear localStorage and redirect to login
        localStorage.removeItem('igs_user');
        window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));

        throw error;
    }
};

/**
 * Enhanced fetch with automatic token refresh
 * 
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - The fetch response
 */
export const apiFetch = async (url, options = {}) => {
    // Get current token from localStorage
    const getUserToken = () => {
        try {
            const userDataString = localStorage.getItem('igs_user');
            if (!userDataString) return null;
            const userData = JSON.parse(userDataString);
            return userData.token;
        } catch {
            return null;
        }
    };

    // Add authorization header if token exists
    const token = getUserToken();
    const headers = {
        ...options.headers,
    };

    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Make the initial request
    let response = await fetch(url, {
        ...options,
        headers,
    });

    // If 401 (Unauthorized), try to refresh token
    if (response.status === 401) {

        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                isRefreshing = false;
                onTokenRefreshed(newToken);

                // Retry the original request with new token
                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...headers,
                        Authorization: `Bearer ${newToken}`,
                    },
                });

                return response;
            } catch (error) {
                isRefreshing = false;
                onTokenRefreshed(null);
                throw error;
            }
        } else {
            // If already refreshing, wait for it to complete
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((newToken) => {
                    if (newToken) {
                        // Retry with new token
                        fetch(url, {
                            ...options,
                            headers: {
                                ...headers,
                                Authorization: `Bearer ${newToken}`,
                            },
                        })
                            .then(resolve)
                            .catch(reject);
                    } else {
                        reject(new Error('Token refresh failed'));
                    }
                });
            });
        }
    }

    return response;
};

/**
 * Helper function to make API calls with automatic token refresh
 * Returns the parsed JSON response
 */
export const apiCall = async (url, options = {}) => {
    const response = await apiFetch(url, options);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API call failed with status ${response.status}`);
    }

    return response.json();
};

export default apiFetch;
