import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

// Async thunk to fetch all orders
export const fetchAllOrdersAsync = createAsyncThunk(
    "admin/fetchAllOrders",
    async (_, { rejectWithValue }) => {
        try {
            // Using the centralized api utility handles base URL, tokens, and errors
            const response = await api.get('/api/v1/orders');
            return response;
        } catch (error) {
            return rejectWithValue(
                error.message || "Failed to fetch orders"
            );
        }
    }
);

// Async thunk to fetch all payments
export const fetchAllPaymentsAsync = createAsyncThunk(
    "admin/fetchAllPayments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/v1/payments');
            return response;
        } catch (error) {
            return rejectWithValue(
                error.message || "Failed to fetch payments"
            );
        }
    }
);

// Async thunk to fetch all customers
export const fetchAllCustomersAsync = createAsyncThunk(
    "admin/fetchAllCustomers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/v1/reports/customers');
            return response;
        } catch (error) {
            return rejectWithValue(
                error.message || "Failed to fetch customers"
            );
        }
    }
);

// Async thunk to fetch all products
export const fetchAllProductsAsync = createAsyncThunk(
    "admin/fetchAllProducts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/v1/products');
            return response;
        } catch (error) {
            return rejectWithValue(
                error.message || "Failed to fetch products"
            );
        }
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        orders: [],
        payments: [],
        customers: [],
        products: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Orders
            .addCase(fetchAllOrdersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrdersAsync.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                // Robust extraction of array data
                if (Array.isArray(payload)) {
                    state.orders = payload;
                } else if (payload && Array.isArray(payload.orders)) {
                    state.orders = payload.orders;
                } else if (payload && Array.isArray(payload.data)) {
                    state.orders = payload.data;
                } else if (payload && Array.isArray(payload.result)) {
                    state.orders = payload.result;
                } else {
                    state.orders = [];
                    console.warn("fetchAllOrdersAsync: Could not find orders array in payload", payload);
                }
            })
            .addCase(fetchAllOrdersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Payments
            .addCase(fetchAllPaymentsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPaymentsAsync.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                // Robust extraction of array data
                if (Array.isArray(payload)) {
                    state.payments = payload;
                } else if (payload && Array.isArray(payload.payments)) {
                    state.payments = payload.payments;
                } else if (payload && Array.isArray(payload.data)) {
                    state.payments = payload.data;
                } else if (payload && Array.isArray(payload.result)) {
                    state.payments = payload.result;
                } else {
                    state.payments = [];
                    console.warn("fetchAllPaymentsAsync: Could not find payments array in payload", payload);
                }
            })
            .addCase(fetchAllPaymentsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Customers
            .addCase(fetchAllCustomersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCustomersAsync.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                // Robust extraction of array data
                if (Array.isArray(payload)) {
                    state.customers = payload;
                } else if (payload && Array.isArray(payload.customers)) {
                    state.customers = payload.customers;
                } else if (payload && Array.isArray(payload.data)) {
                    state.customers = payload.data;
                } else if (payload && Array.isArray(payload.users)) {
                    state.customers = payload.users;
                } else if (payload && Array.isArray(payload.result)) {
                    state.customers = payload.result;
                } else {
                    state.customers = [];
                    console.warn("fetchAllCustomersAsync: Could not find customers array in payload", payload);
                }
            })
            .addCase(fetchAllCustomersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Products
            .addCase(fetchAllProductsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllProductsAsync.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                // Robust extraction of array data
                if (Array.isArray(payload)) {
                    state.products = payload;
                } else if (payload && Array.isArray(payload.products)) {
                    state.products = payload.products;
                } else if (payload && Array.isArray(payload.data)) {
                    state.products = payload.data;
                } else if (payload && Array.isArray(payload.items)) {
                    state.products = payload.items;
                } else if (payload && Array.isArray(payload.result)) {
                    state.products = payload.result;
                } else {
                    state.products = [];
                    console.warn("fetchAllProductsAsync: Could not find products array in payload", payload);
                }
            })
            .addCase(fetchAllProductsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const selectAdminOrders = (state) => state.admin.orders;
export const selectAdminPayments = (state) => state.admin.payments;
export const selectAdminCustomers = (state) => state.admin.customers;
export const selectAdminProducts = (state) => state.admin.products;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;

export default adminSlice.reducer;
