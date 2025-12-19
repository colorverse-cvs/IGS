import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import productReducer from '../features/products/productSlice';
import userReducer from '../features/user/userSlice';
import ordersReducer from '../features/orders/ordersSlice';
import adminReducer from '../admin/store/adminSlice';

/**
 * Redux Store Configuration
 * 
 * This file sets up the Redux store using Redux Toolkit's configureStore.
 * The store is the central place where all application state lives.
 * 
 * For beginners:
 * - configureStore automatically sets up Redux DevTools and middleware
 * - Each reducer manages a different part of the application state:
 *   - cart: Shopping cart items (session-based, not saved to localStorage)
 *   - products: Product catalog data
 *   - user: User authentication and profile (saved to localStorage as 'igs_user')
 *   - orders: Order history (saved to localStorage as 'igs_orders')
 * 
 * To access state in components, use: useSelector((state) => state.cart.items)
 * To update state in components, use: dispatch(addToCart(...))
 */
const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    user: userReducer,
    orders: ordersReducer,
    admin: adminReducer,
  }
});

export default store;
