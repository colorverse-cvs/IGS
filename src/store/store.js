import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../features/cart/cartSlice'
import productReducer from '../features/products/productSlice';
import userReducer from '../features/user/userSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    user: userReducer,
  }
})

export default store