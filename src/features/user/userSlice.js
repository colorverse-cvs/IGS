import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/constants';

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
      if (id) {
        state.profile.id = id;
        localStorage.setItem('id', id);
      }

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
      const { name, email, mobile, id, token, refreshToken } = action.payload || {};
      state.isAuthenticated = true;

      if (token) {
        state.token = token;
        localStorage.setItem('token', token);
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Use ID from backend if available, otherwise fake it only if absolutely necessary (or leave null)
      state.profile.id = id || nanoid();
      if (state.profile.id) localStorage.setItem('id', state.profile.id);
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
      localStorage.removeItem('id');
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
        return rejectWithValue('No authentication token');
      }

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

      if (token && refreshToken && userId) {
        const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId, refreshToken })
        });
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
      if (!userId) {
        console.error('[fetchAddressesAsync] Missing userId');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();

      if (response.ok) {
        // API returns array of address IDs in data field
        const addressIds = json.data || [];

        if (!Array.isArray(addressIds) || addressIds.length === 0) {
          dispatch(userSlice.actions.updateProfile({ addresses: [] }));
          return;
        }

        // Fetch each address individually
        const addressPromises = addressIds.map(addressId =>
          fetch(`${BASE_URL}/api/v1/users/${userId}/addresses/${addressId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(res => res.json())
        );

        const addressResponses = await Promise.all(addressPromises);

        // Extract address data from responses
        const addresses = addressResponses.map(res => res.data || res).filter(Boolean);

        dispatch(userSlice.actions.updateProfile({ addresses }));
      }
    } catch (err) {
      console.error('[fetchAddressesAsync] Error fetching addresses', err);
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

      if (!token || !userId) {
        console.error('[addAddressAsync] Missing token or userId', { token: !!token, userId });
        return;
      }

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
        // Store the full address object (including _id) in Redux
        const newAddress = json.data || json;
        const currentAddresses = state.user.profile.addresses || [];
        const updatedAddresses = [...currentAddresses, newAddress];

        dispatch(userSlice.actions.updateProfile({ addresses: updatedAddresses }));
      }
    } catch (err) {
      console.error('[addAddressAsync] Error adding address', err);
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

      if (!token || !userId || !addressId) {
        console.error('[updateAddressAsync] Missing required data', { token: !!token, userId, addressId });
        return;
      }

      const { addressLine, id, ...payload } = addressData;
      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        // Update the address in local state
        const updatedAddressData = json.data || json;
        const currentAddresses = state.user.profile.addresses || [];
        const updatedAddresses = currentAddresses.map(addr =>
          (addr._id === addressId || addr.id === addressId)
            ? { ...addr, ...updatedAddressData, _id: addressId }
            : addr
        );

        dispatch(userSlice.actions.updateProfile({ addresses: updatedAddresses }));
      }
    } catch (err) {
      console.error('[updateAddressAsync] Error updating address', err);
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

      if (!token || !userId || !addressId) {
        console.error('[removeAddressAsync] Missing required data', { token: !!token, userId, addressId });
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        // Remove the address from local state
        const currentAddresses = state.user.profile.addresses || [];
        const updatedAddresses = currentAddresses.filter(addr =>
          addr._id !== addressId && addr.id !== addressId
        );

        dispatch(userSlice.actions.updateProfile({ addresses: updatedAddresses }));
      }
    } catch (err) {
      console.error('[removeAddressAsync] Error removing address', err);
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

      if (!token || !userId || !addressId) {
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isDefault: true })
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        // Update isDefault flag in local state
        const currentAddresses = state.user.profile.addresses || [];
        const updatedAddresses = currentAddresses.map(addr => ({
          ...addr,
          isDefault: (addr._id === addressId || addr.id === addressId)
        }));

        dispatch(userSlice.actions.updateProfile({ addresses: updatedAddresses }));
      }
    } catch (err) {
      console.error('[setDefaultAddressAsync] Error setting default address', err);
    }
  }
);

export default userSlice.reducer;
