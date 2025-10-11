import { createSlice } from '@reduxjs/toolkit';
import products from '../../data/products.json'; // Import the data

const initialState = {
  products: products,
  status: 'idle', // For future async operations
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Reducers to handle future filtering logic can go here (e.g., setFilter, clearFilter)
    // For now, we only need the initial state.
  },
});

// Export actions if you add any
// export const { setFilter } = productSlice.actions; 
export default productSlice.reducer;