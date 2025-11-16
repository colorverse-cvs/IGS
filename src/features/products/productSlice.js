import { createSlice } from '@reduxjs/toolkit';
import categoriesData from '../../data/categories.json';

/**
 * Products Slice - Redux Toolkit State Management
 * 
 * This file manages product catalog data using Redux Toolkit.
 * Products are loaded from categories.json and stored in Redux state.
 * 
 * Note: Product data is NOT persisted to localStorage.
 * Products are loaded from JSON file on app startup.
 * For production, you would typically fetch products from an API.
 * 
 * For beginners:
 * - Redux Toolkit simplifies state management
 * - Products are stored in a single flat array for easy filtering/searching
 * - Each product includes categoryId and categoryName for reference
 * - Status and error fields are reserved for future async operations (API calls)
 */

/**
 * Build a flat array of all products from categories.json
 * Each product gets categoryId and categoryName attached for easy filtering
 * 
 * @returns {Array} Array of all products with category information
 */
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
  status: 'idle',
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    /**
     * Future reducers can be added here for:
     * - Filtering products
     * - Searching products
     * - Sorting products
     * - Fetching products from API
     * For now, products are loaded from JSON file in initialState
     */
  },
});

export default productSlice.reducer;
