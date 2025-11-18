import { createSlice } from '@reduxjs/toolkit';

// Utility to serialize category to prevent object rendering errors
const serializeProduct = (product) => {
  if (!product) return null;
  return {
    ...product,
    category: typeof product.category === 'object'
      ? (product.category?.name || product.category?._id || 'Unknown')
      : product.category
  };
};

const getWishlistFromStorage = () => {
  try {
    const saved = localStorage.getItem('wishlist');
    const items = saved ? JSON.parse(saved) : [];
    // Clean all items to ensure category is serialized
    return items.map(item => serializeProduct(item));
  } catch (error) {
    console.error('Error parsing wishlist from localStorage:', error);
    return [];
  }
};

const initialState = {
  items: getWishlistFromStorage(),
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const exists = state.items.find(item => item._id === action.payload._id);
      if (!exists) {
        const serializedProduct = serializeProduct(action.payload);
        state.items.push(serializedProduct);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
    isInWishlist: (state, action) => {
      return state.items.some(item => item._id === action.payload);
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, isInWishlist } = wishlistSlice.actions;

// Alias exports for compatibility with component imports
export const addItemToWishlist = addToWishlist;
export const removeItemFromWishlist = removeFromWishlist;

export default wishlistSlice.reducer;
