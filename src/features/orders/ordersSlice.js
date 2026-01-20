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
      })
      .addCase(cancelOrderAsync.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o._id === action.payload.orderId);
        if (order) {
          order.status = 'cancelled';
        }
      });
  },
});

export const { addOrder, replaceOrders, clearOrders, updateOrderStatus } = ordersSlice.actions;

export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrdersAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await import('../../utils/api').then(m => m.api.get('/api/v1/orders/my'));

      return response.data || response;
    } catch (error) {
      console.error('Fetch orders failed:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const cancelOrderAsync = createAsyncThunk(
  'orders/cancelOrderAsync',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await import('../../utils/api').then(m =>
        m.api.patch(`/api/v1/orders/${orderId}/cancel`)
      );

      return { orderId, data: response.data || response };
    } catch (error) {
      console.error('Cancel order failed:', error);
      return rejectWithValue(error.message);
    }
  }
);

export default ordersSlice.reducer;
