import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../features/cart/cartSlice'
import productReducer from '../features/products/productSlice';
import userReducer from '../features/user/userSlice';
import ordersReducer from '../features/orders/ordersSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    user: userReducer,
    orders: ordersReducer,
  }
})

export default store