import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../utils/api';

const initialState = {
  products: [],
  currentProduct: null,
  trending: [],
  newArrivals: [],
  recommendations: [],
  loading: false,
  trendingLoading: false,
  newArrivalsLoading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 12,
  },
  filters: {
    category: '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
    brand: '',
    tags: [],
    sort: 'newest',
  },
};

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Fetch all products without limit
      const response = await productsAPI.getAll({ ...params, limit: 100 });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Fetch single product
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

// Fetch trending products
export const fetchTrendingProducts = createAsyncThunk(
  'products/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getTrending();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending products');
    }
  }
);

// Fetch new arrivals
export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getNewArrivals();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch new arrivals');
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'products/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await productsAPI.search(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch trending
    builder
      .addCase(fetchTrendingProducts.pending, (state) => {
        state.trendingLoading = true;
      })
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
        state.trendingLoading = false;
        state.trending = action.payload.products || [];
      })
      .addCase(fetchTrendingProducts.rejected, (state, action) => {
        state.trendingLoading = false;
        state.error = action.payload;
      });

    // Fetch new arrivals
    builder
      .addCase(fetchNewArrivals.pending, (state) => {
        state.newArrivalsLoading = true;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivalsLoading = false;
        state.newArrivals = action.payload.products || [];
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.newArrivalsLoading = false;
        state.error = action.payload;
      });

    // Search
    builder
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
