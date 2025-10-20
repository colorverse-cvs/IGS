import { createSlice } from '@reduxjs/toolkit';
import categoriesData from '../../data/categories.json';

function buildAllProducts() {
  const products = [];
  categoriesData.sections.forEach((section) => {
    section.products.forEach((p) => {
      products.push({
        ...p,
        categoryId: section.id,
        categoryName: section.title,
      });
    });
  });
  return products;
}

const initialState = {
  products: buildAllProducts(),
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