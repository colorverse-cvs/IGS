import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/constants';

/**
 * User Slice - Redux Toolkit State Management with localStorage Persistence
 * 
 * This file manages user authentication and profile data using Redux Toolkit.
 * User data is persisted to localStorage so it remains after browser refresh.
 * 
 * How localStorage works here:
 * 1. loadState() - Reads user data from localStorage when app starts
 * 2. saveState() - Saves user data to localStorage whenever state changes
 * 3. Key used: 'igs_user' - You can see this in browser DevTools > Application > Local Storage
 * 
 * For beginners:
 * - localStorage stores data in the browser (survives page refresh)
 * - Data is stored as JSON strings, so we use JSON.parse() and JSON.stringify()
 * - Redux Toolkit handles state updates, then we save to localStorage
 */

/**
 * Load user state from localStorage
 * Returns null if no data exists or if there's an error
 */
const loadState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('igs_user');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed) {
      return { ...parsed, token, refreshToken };
    }
    return null;
  } catch (error) {
    console.error('Error loading user state from localStorage:', error);
    return null;
  }
};

/**
 * Save user state to localStorage
 * Converts the state object to JSON string before saving
 */
const saveState = (state) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('igs_user', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving user state to localStorage:', error);
  }
};

const initialState = loadState() || {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  profile: {
    id: null,
    name: '',
    email: '',
    mobile: '',
    gender: '',
    dob: '',
    addresses: [],
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Log in an existing user
     * Updates authentication status and user profile
     * Saves to localStorage automatically
     */
    login(state, action) {
      const { name, email, mobile, token, refreshToken, id } = action.payload || {};
      state.isAuthenticated = true;
      if (token) {
        state.token = token;
        localStorage.setItem('token', token);
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem('refreshToken', refreshToken);
      }
      // Prefer payload ID (from API), then existing ID. Do not generate fake ID for auth'd user.
      if (id) state.profile.id = id;

      state.profile.name = name || state.profile.name || 'User';
      state.profile.email = email || state.profile.email || '';
      state.profile.mobile = mobile || state.profile.mobile || '';
      saveState(state);
    },

    /**
     * Sign up a new user
     * Creates a new user profile with a unique ID
     * Saves to localStorage automatically
     */
    signup(state, action) {
      const { name, email, mobile, id } = action.payload || {};
      state.isAuthenticated = true;
      // Use ID from backend if available, otherwise fake it only if absolutely necessary (or leave null)
      state.profile.id = id || nanoid();
      state.profile.name = name || 'User';
      state.profile.email = email || '';
      state.profile.mobile = mobile || '';
      state.profile.addresses = [];
      saveState(state);
    },

    /**
     * Log out the current user
     * Resets authentication and profile data
     * Saves to localStorage automatically
     */
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.profile = { id: null, name: '', email: '', mobile: '', gender: '', dob: '', addresses: [] };
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      saveState(state);
    },

    /**
     * Add a new address or update an existing one
     * If address has no id, creates a new one with nanoid()
     * If isDefault is true, removes default flag from all other addresses
     * Saves to localStorage automatically
     */
    addOrUpdateAddress(state, action) {
      const addr = action.payload;
      if (!addr.id) addr.id = nanoid();
      const idx = state.profile.addresses.findIndex((a) => a.id === addr.id);
      if (addr.isDefault) {
        state.profile.addresses = state.profile.addresses.map((a) => ({ ...a, isDefault: a.id === addr.id }));
      }
      if (idx >= 0) state.profile.addresses[idx] = { ...addr };
      else state.profile.addresses.push({ ...addr });
      saveState(state);
    },

    /**
     * Set a specific address as the default address
     * Removes default flag from all other addresses
     * Saves to localStorage automatically
     */
    setDefaultAddress(state, action) {
      const id = action.payload;
      state.profile.addresses = state.profile.addresses.map((a) => ({ ...a, isDefault: a.id === id }));
      saveState(state);
    },

    /**
     * Remove an address from the user's profile
     * Saves to localStorage automatically
     */
    removeAddress(state, action) {
      const id = action.payload;
      state.profile.addresses = state.profile.addresses.filter((a) => a.id !== id);
      saveState(state);
    },

    /**
     * Update user profile information
     * Merges new data with existing profile
     * Saves to localStorage automatically
     */
    updateProfile(state, action) {
      state.profile = { ...state.profile, ...action.payload };
      saveState(state);
    },
  },
});

export const { login, signup, logout, addOrUpdateAddress, setDefaultAddress, removeAddress, updateProfile } = userSlice.actions;

/**
 * Async Thunks
 */
export const fetchUserProfileAsync = createAsyncThunk(
  'user/fetchUserProfileAsync',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.user.token || localStorage.getItem('token');
      const userId = state.user.profile.id;

      if (!token) {
        console.log('No token found, skipping profile fetch');
        return rejectWithValue('No authentication token');
      }

      console.log('Fetching user profile...', { userId, hasToken: !!token });

      const response = await fetch(`${BASE_URL}/api/v1/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch user profile:', errorData);
        return rejectWithValue(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      console.log('User profile fetched successfully:', data);

      // Update profile with fetched data
      dispatch(userSlice.actions.updateProfile({
        id: data._id || data.id || userId,
        name: data.name || data.fullName || '',
        email: data.email || '',
        mobile: data.mobile || data.phone || '',
        gender: data.gender || '',
        dob: data.dob || data.dateOfBirth || ''
      }));

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'user/logoutAsync',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const token = state.user.token;
      const refreshToken = state.user.refreshToken;
      const userId = state.user.profile.id;

      console.log('Logout initiated', { token, refreshToken, userId });

      if (token && refreshToken && userId) {
        console.log('Calling logout API...');
        const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId, refreshToken })
        });
        console.log('Logout API response status:', response.status);
      } else {
        console.log('Skipping Logout API: Missing credentials');
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      dispatch(userSlice.actions.logout());
    }
  }
);

export const fetchAddressesAsync = createAsyncThunk(
  'user/fetchAddressesAsync',
  async (userId, { dispatch, getState }) => {
    try {
      const state = getState();
      const token = state.user.token;
      if (!userId) return;

      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      if (response.ok) {
        // Handle various response structures: array, {data: []}, {addresses: []}
        const addresses = Array.isArray(json)
          ? json
          : (json.data || json.addresses || []);

        dispatch(userSlice.actions.updateProfile({ addresses }));
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  }
);

export const addAddressAsync = createAsyncThunk(
  'user/addAddressAsync',
  async (addressData, { dispatch, getState }) => {
    try {
      const state = getState();
      const token = state.user.token;
      const userId = state.user.profile.id;
      if (!token || !userId) return;

      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      const json = await response.json();
      if (response.ok) {
        // Refresh addresses list
        dispatch(fetchAddressesAsync(userId));
      } else {
        console.error("Failed to add address", json);
      }
    } catch (err) {
      console.error("Error adding address", err);
    }
  }
);

export const updateAddressAsync = createAsyncThunk(
  'user/updateAddressAsync',
  async ({ addressId, addressData }, { dispatch, getState }) => {
    try {
      const state = getState();
      const token = state.user.token;
      const userId = state.user.profile.id;
      if (!token || !userId || !addressId) return;

      const { addressLine, id, ...payload } = addressData;
      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Refresh addresses list
        dispatch(fetchAddressesAsync(userId));
      } else {
        const json = await response.json();
        console.error("Failed to update address", json);
      }
    } catch (err) {
      console.error("Error updating address", err);
    }
  }
);

export const removeAddressAsync = createAsyncThunk(
  'user/removeAddressAsync',
  async (addressId, { dispatch, getState }) => {
    try {
      const state = getState();
      const token = state.user.token;
      const userId = state.user.profile.id;
      if (!token || !userId || !addressId) return;
      console.log("Removing address", { token, userId, addressId });
      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh addresses list
        dispatch(fetchAddressesAsync(userId));
      } else {
        const json = await response.json();
        console.error("Failed to remove address", json);
      }
    } catch (err) {
      console.error("Error removing address", err);
    }
  }
);

export const setDefaultAddressAsync = createAsyncThunk(
  'user/setDefaultAddressAsync',
  async (addressId, { dispatch, getState }) => {
    try {
      const state = getState();
      const token = state.user.token;
      const userId = state.user.profile.id;
      if (!token || !userId || !addressId) return;

      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isDefault: true })
      });

      if (response.ok) {
        // Refresh addresses list
        dispatch(fetchAddressesAsync(userId));
      } else {
        const json = await response.json();
        console.error("Failed to set default address", json);
      }
    } catch (err) {
      console.error("Error setting default address", err);
    }
  }
);

export default userSlice.reducer;
