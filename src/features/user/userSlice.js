import { createSlice, nanoid } from '@reduxjs/toolkit';

const loadState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('igs_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

const saveState = (state) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('igs_user', JSON.stringify(state));
  } catch (_) {}
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
    login(state, action) {
      const { name, email, mobile } = action.payload || {};
      state.isAuthenticated = true;
      state.profile.id = state.profile.id || nanoid();
      state.profile.name = name || state.profile.name || 'User';
      state.profile.email = email || state.profile.email || '';
      state.profile.mobile = mobile || state.profile.mobile || '';
      saveState(state);
    },
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
    logout(state) {
      state.isAuthenticated = false;
      state.profile = { id: null, name: '', email: '', mobile: '', addresses: [] };
      saveState(state);
    },
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
    setDefaultAddress(state, action) {
      const id = action.payload;
      state.profile.addresses = state.profile.addresses.map((a) => ({ ...a, isDefault: a.id === id }));
      saveState(state);
    },
    removeAddress(state, action) {
      const id = action.payload;
      state.profile.addresses = state.profile.addresses.filter((a) => a.id !== id);
      saveState(state);
    },
    updateProfile(state, action) {
      state.profile = { ...state.profile, ...action.payload };
      saveState(state);
    },
  },
});

export const { login, signup, logout, addOrUpdateAddress, setDefaultAddress, removeAddress, updateProfile } = userSlice.actions;
export default userSlice.reducer;
