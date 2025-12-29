import { BASE_URL } from './constants';


export const getAccessToken = () => {
    return localStorage.getItem('token');
};

/**
 * Set the access token in localStorage
 * @param {string} token - The access token to store
 */
export const setAccessToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    }
};

/**
 * Remove the access token from localStorage
 * Used during logout
 */
export const removeAccessToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

/**
 * Get default headers with authentication
 * @returns {Object} Headers object with Content-Type and Authorization
 */
const getAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const token = getAccessToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};


// Token refresh queue management
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

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

        // We use fetch directly here to avoid circular dependency or interceptor loops
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
        localStorage.setItem('token', newToken); // Legacy key

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
        localStorage.removeItem('token');
        localStorage.removeItem('igs_user');
        window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));

        // Optional: Redirect to login
        window.location.href = 'http://localhost:5000';

        throw error;
    }
};


export const apiRequest = async (endpoint, options = {}) => {
    const {
        method = 'GET',
        body = null,
        headers = {},
        skipAuth = false,
        _retry = false,
    } = options;

    // Build full URL
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    // Merge headers
    const requestHeaders = skipAuth
        ? { 'Content-Type': 'application/json', ...headers }
        : { ...getAuthHeaders(), ...headers };

    // Build fetch options
    const fetchOptions = {
        method,
        headers: requestHeaders,
        credentials: 'include',
    };

    // Add body if present
    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, fetchOptions);

        // Parse JSON response
        const data = await response.json().catch(() => ({}));

        // Handle 401 Unauthorized (Token Expiry)
        if (response.status === 401 && !skipAuth && !_retry) {
            if (isRefreshing) {
                // If refresh is already in progress, queue this request
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((newToken) => {
                        if (newToken) {
                            // Retry with new token
                            apiRequest(endpoint, {
                                ...options,
                                _retry: true,
                                headers: { ...headers, Authorization: `Bearer ${newToken}` }
                            }).then(resolve).catch(reject);
                        } else {
                            reject(new Error('Token refresh failed'));
                        }
                    });
                });
            }

            // Start refresh process
            isRefreshing = true;
            try {
                const newToken = await refreshAccessToken();
                isRefreshing = false;
                onTokenRefreshed(newToken);

                // Retry original request
                return apiRequest(endpoint, {
                    ...options,
                    _retry: true,
                    headers: { ...headers, Authorization: `Bearer ${newToken}` }
                });

            } catch (refreshError) {
                isRefreshing = false;
                onTokenRefreshed(null);
                throw refreshError; // Will fall through to catch block or be caught here
            }
        }

        // Handle other non-OK responses
        if (!response.ok) {
            // Extract error message, handling nested message objects
            let errorMessage = `Request failed with status ${response.status}`;

            if (data.message) {
                if (typeof data.message === 'object' && data.message.message) {
                    // Handle nested message object: { message: { message: "...", error: "...", statusCode: ... } }
                    errorMessage = data.message.message;
                } else if (typeof data.message === 'string') {
                    // Handle string message
                    errorMessage = data.message;
                }
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        // Re-throw with additional context
        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
};

/**
 * Convenience methods for common HTTP verbs
 */

export const api = {

    get: (endpoint, options = {}) =>
        apiRequest(endpoint, { ...options, method: 'GET' }),


    post: (endpoint, body, options = {}) =>
        apiRequest(endpoint, { ...options, method: 'POST', body }),

    put: (endpoint, body, options = {}) =>
        apiRequest(endpoint, { ...options, method: 'PUT', body }),

    patch: (endpoint, body, options = {}) =>
        apiRequest(endpoint, { ...options, method: 'PATCH', body }),

    delete: (endpoint, options = {}) =>
        apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
