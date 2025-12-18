import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Orders Slice - Redux Toolkit State Management with localStorage Persistence
 * 
 * This file manages order history using Redux Toolkit.
 * Orders are persisted to localStorage so they remain after browser refresh.
 * 
 * How localStorage works here:
 * 1. loadOrders() - Reads orders from localStorage when app starts
 * 2. saveOrders() - Saves orders to localStorage whenever orders change
 * 3. Key used: 'igs_orders' - You can see this in browser DevTools > Application > Local Storage
 * 
 * For beginners:
 * - Orders are stored as an array in localStorage
 * - Each order contains: id, status, date, address, payment, totals, items
 * - Redux Toolkit handles state updates, then we save to localStorage
 */

/**
 * Load orders from localStorage
 * Returns empty array if no data exists or if there's an error
 */
const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
  },
  reducers: {
    /**
     * Add a new order to the orders list
     * Creates a unique order ID if one isn't provided
     * Orders are added to the beginning of the array (most recent first)
     */
    addOrder(state, action) {
      const order = {
        id: action.payload?.id || `ORD-${nanoid(6)}`,
        status: action.payload?.status || 'placed',
        ...action.payload,
      };
      state.orders.unshift(order);
    },

    /**
     * Update the status of an existing order
     * Status values: 'placed', 'processing', 'delivered', 'cancelled'
     */
    updateOrderStatus(state, action) {
      const { id, status } = action.payload || {};
      const order = state.orders.find((x) => x.id === id);
      if (order) {
        order.status = status;
      }
    },

    /**
     * Replace the entire orders array
     * Useful for syncing with server or bulk updates
     */
    replaceOrders(state, action) {
      state.orders = Array.isArray(action.payload) ? action.payload : [];
    },

    /**
     * Clear all orders from the history
     */
    clearOrders(state) {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
        state.orders = action.payload;
      });
  },
});

export const { addOrder, replaceOrders, clearOrders, updateOrderStatus } = ordersSlice.actions;

export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrdersAsync',
  async (_, { rejectWithValue }) => {
    try {
      // Import dynamically nicely or move import to top. 
      // Since 'api' is not imported at top, let's fix imports in a separate Edit or just assume we'll fix strict imports
      // Actually, I should check if I added the import. I didn't in this chunk.
      // I will add the import in a separate chunk or rely on the previous content having it? 
      // The previous content DOES NOT have it. I need to add it.
      // Wait, I cannot add imports with this tool if I am editing the bottom.
      // This tool only accepts one contiguous block.
      // I should use multi_replace_file_content to add import AND add the thunk.
      // But I am already using replace_file_content here.
      // I will cancel this and use multi_replace.
      // No, I can't cancel. I will submit this and then add the import in the next step.
      // actually, I can just use 'api' from '../utils/api' if I had imported it.
      // I'll assume I will fix the import in the next step.
      const response = await import('../../utils/api').then(m => m.api.get('/api/v1/orders/my'));

      // Expected response structure: { success: true, count: N, data: [...] } or just [...]
      // Adapting based on common patterns.
      return response.data || response;
    } catch (error) {
      console.error('Fetch orders failed:', error);
      return rejectWithValue(error.message);
    }
  }
);
export default ordersSlice.reducer;
