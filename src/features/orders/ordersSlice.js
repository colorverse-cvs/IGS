import { createSlice, nanoid } from '@reduxjs/toolkit';

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
const loadOrders = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('igs_orders');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
    return [];
  }
};

/**
 * Save orders array to localStorage
 * Converts the orders array to JSON string before saving
 */
const saveOrders = (orders) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('igs_orders', JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving orders to localStorage:', error);
  }
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: loadOrders(),
  },
  reducers: {
    /**
     * Add a new order to the orders list
     * Creates a unique order ID if one isn't provided
     * Orders are added to the beginning of the array (most recent first)
     * Saves to localStorage automatically
     */
    addOrder(state, action) {
      const order = {
        id: action.payload?.id || `ORD-${nanoid(6)}`,
        status: action.payload?.status || 'placed',
        ...action.payload,
      };
      state.orders.unshift(order);
      saveOrders(state.orders);
    },
    
    /**
     * Update the status of an existing order
     * Status values: 'placed', 'processing', 'delivered', 'cancelled'
     * Saves to localStorage automatically
     */
    updateOrderStatus(state, action) {
      const { id, status } = action.payload || {};
      const order = state.orders.find((x) => x.id === id);
      if (order) {
        order.status = status;
        saveOrders(state.orders);
      }
    },
    
    /**
     * Replace the entire orders array
     * Useful for syncing with server or bulk updates
     * Saves to localStorage automatically
     */
    replaceOrders(state, action) {
      state.orders = Array.isArray(action.payload) ? action.payload : [];
      saveOrders(state.orders);
    },
    
    /**
     * Clear all orders from the history
     * Saves to localStorage automatically
     */
    clearOrders(state) {
      state.orders = [];
      saveOrders(state.orders);
    },
  },
});

export const { addOrder, replaceOrders, clearOrders, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
