import { createSlice, nanoid } from '@reduxjs/toolkit';

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
    return raw ? JSON.parse(raw) : null;
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
  profile: {
    id: null,
    name: '',
    email: '',
    mobile: '',
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
      const { name, email, mobile } = action.payload || {};
      state.isAuthenticated = true;
      state.profile.id = state.profile.id || nanoid();
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
      const { name, email, mobile } = action.payload || {};
      state.isAuthenticated = true;
      state.profile.id = nanoid();
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
      state.profile = { id: null, name: '', email: '', mobile: '', addresses: [] };
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
export default userSlice.reducer;
