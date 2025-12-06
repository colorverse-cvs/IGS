import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/constants';

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (productData, { dispatch, rejectWithValue }) => {
    console.log("Adding to cart", productData);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/v1/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productData.id,
          quantity: productData.qty || 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();

      // Dispatch the local reducer to update UI immediately (optimistic or confirmed)
      // We pass the full productData because the API might not return all details needed for the UI
      dispatch(addToCart(productData));

      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Cart Slice - Redux Toolkit State Management
 * 
 * This file manages the shopping cart state using Redux Toolkit.
 * The cart stores an array of items that users want to purchase.
 * 
 * Note: Cart state is NOT persisted to localStorage.
 * Cart items are cleared when the user closes the browser (session-based).
 * For persistent cart, you would add localStorage save/load logic here.
 * 
 * For beginners:
 * - Redux Toolkit simplifies state management
 * - createSlice automatically generates action creators and reducers
 * - State is immutable (we don't modify it directly, we return new state)
 */

const initialState = {
  items: [], // Array of cart items: { id, title, price, image, qty, mrp, discount, material, size }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Add an item to the cart
     * If the item already exists, increase its quantity by 1
     * If it's a new item, add it to the cart with quantity 1
     */
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);

      if (existingItem) {
        existingItem.qty += 1;
      } else {
        state.items.push({ ...newItem, qty: 1 });
      }
    },

    /**
     * Remove an item from the cart completely
     * Uses filter to create a new array without the item with matching id
     */
    removeFromCart: (state, action) => {
      const idToRemove = action.payload;
      state.items = state.items.filter(item => item.id !== idToRemove);
    },

    /**
     * Update the quantity of a specific cart item
     * Ensures quantity is always at least 1 (can't go below 1)
     */
    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      const itemToUpdate = state.items.find(item => item.id === id);
      if (itemToUpdate) {
        itemToUpdate.qty = Math.max(1, qty);
      }
    },

    /**
     * Clear all items from the cart
     * Used after successful order placement
     */
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
