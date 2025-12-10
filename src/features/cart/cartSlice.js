import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/constants';
import { api } from '../../utils/api';

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (productData, { dispatch, rejectWithValue }) => {
    try {
      // Using the centralized API utility - token is automatically included
      const data = await api.post('/api/v1/cart/add', {
        productId: productData.id,
        quantity: productData.qty || 1,
      });

      let cartItemId = null;

      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        const addedItem = data.items.find(item => item.product && item.product._id === productData.id);
        if (addedItem) {
          cartItemId = addedItem._id;
        }
      }
      // PRIORITY 2: Check if response has data._id (nested structure)
      else if (data.data && data.data._id) {
        cartItemId = data.data._id;
      }
      // PRIORITY 3: Check if response has _id directly (might be cart session ID, use as fallback)
      else if (data._id) {
        cartItemId = data._id;
      }
      // PRIORITY 4: Fallback to other common patterns
      else {
        cartItemId = data.id || data.cartItemId || (data.data && data.data.id);
      }

      if (!cartItemId) {
        console.warn("Could not extract cart item ID from response. Full response:", data);
      }

      dispatch(addToCart({
        ...productData,
        _id: cartItemId,
        cartItemId: cartItemId
      }));

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
  items: [], // Array of cart items: { id, title, price, image, qty, mrp, discount, material, size, _id }
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
        // Update the cart item ID if provided
        if (newItem._id) existingItem._id = newItem._id;
        if (newItem.cartItemId) existingItem.cartItemId = newItem.cartItemId;
      } else {
        state.items.push({ ...newItem, qty: newItem.qty || 1 });
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


export const updateCartItemQuantityAsync = createAsyncThunk(
  "cart/updateCartItemQuantityAsync",
  async ({ productId, quantity }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      console.log("Updating cart item quantity for product:", productId);

      // Find cart item by productId
      const cartItem = state.cart.items.find(i => i.id === productId);

      if (!cartItem) {
        throw new Error("Cart item not found in local state");
      }

      // Use _id (from API response) or cartItemId as fallback
      const targetId = cartItem._id || cartItem.cartItemId;

      if (!targetId) {
        console.error("Cart item missing ID:", cartItem);
        throw new Error("Cart item ID not found. Please refresh and try again.");
      }

      // Check if token exists
      const token = localStorage.getItem('token');
      console.log("Token exists:", token);
      console.log(`Updating Cart Item ID: ${targetId} to quantity: ${quantity}`);

      // Using the centralized API utility - token is automatically included
      const data = await api.patch(`/api/v1/cart/update/${targetId}`, { quantity });

      console.log("Update cart quantity API response:", data);

      // Update local state on success
      dispatch(updateQty({ id: productId, qty: quantity }));

      return data;
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      return rejectWithValue(error.message);
    }
  }
);



export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('Clearing cart...');

      // Using the centralized API utility - token is automatically included
      await api.delete('/api/v1/cart/remove');

      // Update local state on success
      dispatch(clearCart());

      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const removeItemFromCartAsync = createAsyncThunk(
  'cart/removeItemFromCartAsync',
  async (productId, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      console.log('Removing item from cart', productId);

      // Find the item in the cart to get the cart item ID
      const cartItem = state.cart.items.find(item => item.id === productId);

      if (!cartItem) {
        throw new Error("Cart item not found in local state");
      }

      // Use _id (from API response) or cartItemId as fallback, or productId as last resort
      const targetId = cartItem._id || cartItem.cartItemId || productId;

      console.log(`Removing cart item ${productId} (Cart Item ID: ${targetId})`);

      // Using the centralized API utility - token is automatically included
      await api.delete(`/api/v1/cart/remove/${targetId}`);

      // Update local state on success
      dispatch(removeFromCart(productId));

      return true;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
