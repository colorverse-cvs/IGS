import { createSlice, nanoid } from '@reduxjs/toolkit';

const loadOrders = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('igs_orders');
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

const saveOrders = (orders) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('igs_orders', JSON.stringify(orders));
  } catch (_) {}
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: loadOrders(),
  },
  reducers: {
    addOrder(state, action) {
      const order = {
        id: action.payload?.id || `ORD-${nanoid(6)}`,
        status: action.payload?.status || 'placed', // 'placed' | 'delivered' | 'cancelled'
        ...action.payload,
      };
      state.orders.unshift(order);
      saveOrders(state.orders);
    },
    updateOrderStatus(state, action) {
      const { id, status } = action.payload || {};
      const o = state.orders.find((x) => x.id === id);
      if (o) o.status = status;
      saveOrders(state.orders);
    },
    replaceOrders(state, action) {
      state.orders = Array.isArray(action.payload) ? action.payload : [];
      saveOrders(state.orders);
    },
    clearOrders(state) {
      state.orders = [];
      saveOrders(state.orders);
    },
  },
});

export const { addOrder, replaceOrders, clearOrders, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
