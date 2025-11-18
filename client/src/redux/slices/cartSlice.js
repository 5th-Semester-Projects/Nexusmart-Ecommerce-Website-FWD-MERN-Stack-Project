import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../utils/api';

// Get cart from localStorage
const getCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    return null;
  }
};

const savedCart = getCartFromStorage();

const initialState = {
  items: savedCart?.items || [],
  subtotal: savedCart?.subtotal || 0,
  tax: savedCart?.tax || 0,
  shipping: savedCart?.shipping || 0,
  discount: savedCart?.discount || 0,
  total: savedCart?.total || 0,
  appliedCoupon: null,
  loading: false,
  error: null,
};

// Fetch cart from server (for logged-in users)
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.get();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (item, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await cartAPI.add(item);
        return response.data;
      } else {
        // For guest users, add to localStorage
        return item;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state, action) => {
      const item = action.payload;
      const existingItemIndex = state.items.findIndex(
        (i) => i.product._id === item.product._id &&
          JSON.stringify(i.variant) === JSON.stringify(item.variant)
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += item.quantity;
      } else {
        state.items.push(item);
      }

      // Recalculate totals
      state.subtotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      state.tax = state.subtotal * 0.1; // 10% tax
      state.total = state.subtotal + state.tax + state.shipping - state.discount;

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeItemFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);

      // Recalculate totals
      state.subtotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      state.tax = state.subtotal * 0.1;
      state.total = state.subtotal + state.tax + state.shipping - state.discount;

      localStorage.setItem('cart', JSON.stringify(state));
    },
    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i._id === itemId);
      if (item) {
        item.quantity = quantity;

        // Recalculate totals
        state.subtotal = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        state.tax = state.subtotal * 0.1;
        state.total = state.subtotal + state.tax + state.shipping - state.discount;

        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
      if (action.payload.type === 'percentage') {
        state.discount = (state.subtotal * action.payload.discount) / 100;
      } else {
        state.discount = action.payload.discount;
      }
      state.total = state.subtotal + state.tax + state.shipping - state.discount;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;
      state.total = state.subtotal + state.tax + state.shipping;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.shipping = 0;
      state.discount = 0;
      state.total = 0;
      state.appliedCoupon = null;
      localStorage.removeItem('cart');
    },
    setShipping: (state, action) => {
      state.shipping = action.payload;
      state.total = state.subtotal + state.tax + state.shipping - state.discount;
      localStorage.setItem('cart', JSON.stringify(state));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.items;
        state.subtotal = action.payload.cart.subtotal;
        state.tax = action.payload.cart.tax;
        state.shipping = action.payload.cart.shipping;
        state.discount = action.payload.cart.discount;
        state.total = action.payload.cart.total;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response from server or local add
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
  setShipping,
} = cartSlice.actions;

export default cartSlice.reducer;
