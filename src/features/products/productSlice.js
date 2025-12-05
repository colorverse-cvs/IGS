import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// Map category names to slugs for filtering
const getCategorySlug = (categoryName) => {
  const categoryMap = {
    "Chhatrapati Shivaji Maharaj Statues": "shivaji",
    "Mavale Statues": "mavale",
    "God Statues": "god-statues",
    "Home Decor": "home-decor",
    "Motivational Statues": "motivational",
  };
  return categoryMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, "-");
};

// Transform API product to expected format
const transformProduct = (apiProduct) => {
  // Get first image URL
  let imageURL = "https://picsum.photos/300/300?random=1";
  if (apiProduct.images && apiProduct.images.length > 0) {
    const firstImage = apiProduct.images[0];
    if (typeof firstImage === 'string') {
      imageURL = firstImage.startsWith('http') ? firstImage : `http://localhost:3000${firstImage}`;
    } else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
      const url = firstImage.url;
      imageURL = url.startsWith('http') ? url : `http://localhost:3000${url}`;
    }
  }

  // Get discount percentage
  let discount = "0% Off";
  if (apiProduct.discount && apiProduct.discount > 0) {
    discount = `${Math.round(apiProduct.discount)}% Off`;
  } else if (apiProduct.listPrice && apiProduct.price && apiProduct.listPrice > apiProduct.price) {
    discount = `${Math.round(((apiProduct.listPrice - apiProduct.price) / apiProduct.listPrice) * 100)}% Off`;
  }

  // Get category info
  const categoryName = apiProduct.category?.name || "Uncategorized";
  const categorySlug = getCategorySlug(categoryName);

  return {
    id: apiProduct._id || apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    mrp: apiProduct.listPrice || apiProduct.price,
    discount: discount,
    rating: apiProduct.rating || 4.5,
    reviews: apiProduct.reviews || 0,
    isFeatured: apiProduct.isFeatured || false,
    isCustomizable: apiProduct.isCustomizable || false,
    imageURL: imageURL,
    material: (apiProduct.attributes?.material || apiProduct.attributes?.primaryMaterial || "resin").toLowerCase(),
    size: apiProduct.dimensions?.size || "medium",
    sizeDescription: apiProduct.dimensions?.sizeDescription || "6 in - 10 in",
    category: categoryName,
    categoryId: categorySlug,
    categoryName: categoryName,
  };
};

// Async thunk to fetch products from API
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await fetch("http://localhost:3000/api/v1/products");
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const result = await response.json();
    const apiProducts = result.data || [];
    
    // Transform products to expected format
    return apiProducts.map(transformProduct);
  }
);

const initialState = {
  products: [],
  status: 'idle',
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Clear products if needed
    clearProducts: (state) => {
      state.products = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { clearProducts } = productSlice.actions;
export default productSlice.reducer;
