import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI, productsAPI, ordersAPI, categoriesAPI } from '../../utils/api';
import api from '../../utils/api';

const initialState = {
  // Dashboard Stats
  stats: null,
  statsLoading: false,

  // Products
  products: [],
  productsLoading: false,
  productsPagination: { current: 1, pages: 1, total: 0 },

  // Orders
  orders: [],
  ordersLoading: false,
  ordersPagination: { current: 1, pages: 1, total: 0 },

  // Users
  users: [],
  usersLoading: false,
  usersPagination: { current: 1, pages: 1, total: 0 },

  // Categories
  categories: [],
  categoriesLoading: false,

  // General
  error: null,
  success: null,
  actionLoading: false,
};

// ============= Dashboard Stats =============
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dashboard-stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

// ============= Products =============
export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// ============= Orders =============
export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/admin/all', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status, trackingInfo }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status, trackingInfo });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'admin/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/${orderId}`);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete order');
    }
  }
);

// ============= Users =============
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ userId, action, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { action, reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// ============= Categories =============
export const fetchCategories = createAsyncThunk(
  'admin/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'admin/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetAdminState: () => initialState,
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });

    // Fetch Products
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.products;
        state.productsPagination = action.payload.pagination || state.productsPagination;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload;
      });

    // Create Product
    builder
      .addCase(createProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products = [action.payload.product, ...state.products];
        state.success = 'Product created successfully';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Update Product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.products.findIndex(p => p._id === action.payload.product._id);
        if (index !== -1) {
          state.products[index] = action.payload.product;
        }
        state.success = 'Product updated successfully';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Delete Product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
        state.success = 'Product deleted successfully';
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Fetch Orders
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload.orders;
        state.ordersPagination = action.payload.pagination || state.ordersPagination;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload;
      });

    // Update Order Status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.orders.findIndex(o => o._id === action.payload.order._id);
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
        state.success = 'Order status updated successfully';
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Delete Order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.orders = state.orders.filter(o => o._id !== action.payload);
        state.success = 'Order deleted successfully';
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Fetch Users
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users;
        state.usersPagination = action.payload.pagination || state.usersPagination;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      });

    // Update User Role
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.users.findIndex(u => u._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        state.success = 'User role updated successfully';
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Toggle User Status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.users.findIndex(u => u._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        state.success = action.payload.message;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users = state.users.filter(u => u._id !== action.payload);
        state.success = 'User deleted successfully';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.categories || action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      });

    // Create Category
    builder
      .addCase(createCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories = [...state.categories, action.payload.category];
        state.success = 'Category created successfully';
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Update Category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.categories.findIndex(c => c._id === action.payload.category._id);
        if (index !== -1) {
          state.categories[index] = action.payload.category;
        }
        state.success = 'Category updated successfully';
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Delete Category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories = state.categories.filter(c => c._id !== action.payload);
        state.success = 'Category deleted successfully';
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;
