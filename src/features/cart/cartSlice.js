import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Array of { id, title, price, image, qty }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);

      if (existingItem) {
        // If item exists, increase quantity
        existingItem.qty += 1;
      } else {
        // If item is new, add it with qty of 1
        state.items.push({ ...newItem, qty: 1 });
      }
    },
    removeFromCart: (state, action) => {
      const idToRemove = action.payload;
      state.items = state.items.filter(item => item.id !== idToRemove);
    },
    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      const itemToUpdate = state.items.find(item => item.id === id);
      if (itemToUpdate) {
        itemToUpdate.qty = Math.max(1, qty); // Ensure quantity is at least 1
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    // openCartDrawer: (state) => {
    //   state.isCartDrawerOpen = true;
    // },
    // closeCartDrawer: (state) => {
    //   state.isCartDrawerOpen = false;
    // },
  },
});
// openCartDrawer, closeCartDrawer
export const { addToCart, removeFromCart, updateQty, clearCart, } = cartSlice.actions;
export default cartSlice.reducer;