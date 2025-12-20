import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

/**
 * Cart Slice - Redux Toolkit State Management with Persistence
 * 
 * Manages shopping cart state with user-specific persistence logic.
 * - Guest users use 'igs_cart_guest'
 * - Logged in users use 'igs_cart_{userId}'
 */

const getStorageKey = (userId) => userId ? `igs_cart_${userId}` : 'igs_cart_guest';

const loadCartFromStorage = (userId = null) => {
  try {
    const key = getStorageKey(userId);
    const savedCart = localStorage.getItem(key);
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};


const initialState = {
  items: [], // Start empty, fetch from API
  currentUserId: null,
  status: 'idle',
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Initialize cart for a specific user (or guest)
     * Called on Login (with userId) and Logout (with null)
     */
    initializeCart: (state, action) => {
      // Just set user ID, don't load from storage
      state.currentUserId = action.payload;
      state.items = []; // Clear items on init/switch, await API fetch
    },

    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);

      if (existingItem) {
        existingItem.qty += 1;
        if (newItem._id) existingItem._id = newItem._id;
        if (newItem.cartItemId) existingItem.cartItemId = newItem.cartItemId;
      } else {
        state.items.push({ ...newItem, qty: newItem.qty || 1 });
      }

      // saveCartToStorage(state.items, state.currentUserId);
    },

    removeFromCart: (state, action) => {
      const idToRemove = action.payload;
      state.items = state.items.filter(item => item.id !== idToRemove);
      // saveCartToStorage(state.items, state.currentUserId);
    },

    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      const itemToUpdate = state.items.find(item => item.id === id);
      if (itemToUpdate) {
        itemToUpdate.qty = Math.max(1, qty);
      }
      // saveCartToStorage(state.items, state.currentUserId);
    },

    clearCart: (state) => {
      state.items = [];
      // saveCartToStorage([], state.currentUserId);
    },

    setCart: (state, action) => {
      state.items = action.payload;
      // saveCartToStorage(state.items, state.currentUserId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartSummaryAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCartSummaryAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // Payload is already mapped to frontend structure
      })
      .addCase(fetchCartSummaryAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart, setCart, initializeCart } = cartSlice.actions;

// Async Thunks

export const fetchCartSummaryAsync = createAsyncThunk(
  'cart/fetchCartSummaryAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/cart/summary');

      // Map API response to frontend item structure
      if (response && response.items) {
        return response.items.map(item => ({
          id: item.product._id || item.product.id, // Product ID
          _id: item._id, // Cart Item ID
          cartItemId: item._id, // Redundancy
          title: item.product.name,
          price: item.product.price,
          image: item.product.images?.[0]?.url || "",
          qty: item.quantity,
          mrp: item.product.mrp || item.product.price, // Fallback if mrp invalid
          discount: item.product.discount,
          material: item.product.attributes?.material,
          size: item.product.dimensions?.sizeCategory,
          // Add other fields as needed from product object
        }));
      }
      return [];
    } catch (error) {
      console.error('Fetch cart summary failed:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (productData, { dispatch, rejectWithValue }) => {
    try {
      // API call kept for backend sync if required, but primary source of truth is now local for UI
      // If backend sync is required, uncomment:
      const response = await api.post('/api/v1/cart/add', {
        productId: productData.id,
        quantity: productData.qty || 1,
      });

      let cartItemId = null;

      // Extract proper Cart Item ID from response
      // Structure: { items: [ { _id: "cart_item_id", product: { ... } }, ... ] }
      if (response && response.items && Array.isArray(response.items)) {
        // Find the item matching our product ID
        const addedItem = response.items.find(item =>
          (item.product && (item.product._id === productData.id || item.product === productData.id))
        );

        if (addedItem && addedItem._id) {
          cartItemId = addedItem._id;
        }
      }

      // Fallback extraction patterns
      if (!cartItemId && response.data && response.data._id) cartItemId = response.data._id;
      if (!cartItemId && response._id) cartItemId = response._id;

      if (!cartItemId) {
        console.warn("Could not extract cart item ID from response. Future updates/removes might fail for this session.", response);
      }

      // Dispatch to local store with the extracted ID
      dispatch(addToCart({
        ...productData,
        _id: cartItemId, // Store as _id
        cartItemId: cartItemId // Store as cartItemId for redundancy/compatibility
      }));

      return productData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemQuantityAsync = createAsyncThunk(
  "cart/updateCartItemQuantityAsync",
  async ({ productId, quantity }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      // console.log("Updating cart item quantity for product:", productId);

      // Find cart item by productId
      const cartItem = state.cart.items.find(i => i.id === productId);

      if (!cartItem) {
        throw new Error("Cart item not found in local state");
      }

      // Use Cart Item ID (_id) as the target for API calls
      // The user confirmed the ID format "6942..." which is the cart item _id, NOT product ID
      const targetId = cartItem._id || cartItem.cartItemId;

      if (!targetId) {
        console.error("Cart item missing Cart Item ID (_id):", cartItem);
        // Fallback or just update local
        dispatch(updateQty({ id: productId, qty: quantity }));
        return { productId, quantity };
      }

      // console.log(`Updating Cart Item (ID: ${targetId}) to quantity: ${quantity}`);

      // Using the centralized API utility - token is automatically included
      const data = await api.patch(`/api/v1/cart/update/${targetId}`, { quantity });

      // console.log("Update cart quantity API response:", data);

      // Update local state on success
      dispatch(updateQty({ id: productId, qty: quantity }));

      return data;
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      // Fallback: update local state even if API fails
      dispatch(updateQty({ id: productId, qty: quantity }));
      return rejectWithValue(error.message);
    }
  }
);

export const removeItemFromCartAsync = createAsyncThunk(
  'cart/removeItemFromCartAsync',
  async (productId, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      // console.log('Removing item from cart', productId);

      // Find the item in the cart
      const cartItem = state.cart.items.find(item => item.id === productId);

      if (!cartItem) {
        throw new Error("Cart item not found in local state");
      }

      // Use Cart Item ID for removal
      const targetId = cartItem._id || cartItem.cartItemId;

      if (!targetId) {
        // If we really can't find the ID, we might need to rely on local removal only
        console.warn("Missing Cart Item ID for removal, attempting local removal only.");
        dispatch(removeFromCart(productId));
        return true;
      }

      // console.log(`Removing cart item (ID: ${targetId})`);

      // Using the centralized API utility - token is automatically included
      await api.delete(`/api/v1/cart/remove/${targetId}`);

      // Update local state on success
      dispatch(removeFromCart(productId));

      return true;
    } catch (error) {
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log("Clearing cart");
      dispatch(clearCart());
      await api.delete('/api/v1/cart/remove'); // Clears entire cart
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return rejectWithValue(error.message);
    }
  }
);

export default cartSlice.reducer;
