// Utility to clean localStorage and fix category object issues

export const cleanWishlistStorage = () => {
  try {
    const wishlist = localStorage.getItem('wishlist');
    if (wishlist) {
      const items = JSON.parse(wishlist);
      const cleanedItems = items.map(item => ({
        ...item,
        category: typeof item.category === 'object'
          ? (item.category?.name || item.category?._id || 'Unknown')
          : item.category
      }));
      localStorage.setItem('wishlist', JSON.stringify(cleanedItems));
      console.log('✅ Wishlist storage cleaned');
    }
  } catch (error) {
    console.error('Error cleaning wishlist:', error);
    localStorage.removeItem('wishlist');
  }
};

export const cleanCartStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    if (cart) {
      const cartData = JSON.parse(cart);
      if (cartData.items) {
        cartData.items = cartData.items.map(item => ({
          ...item,
          category: typeof item.category === 'object'
            ? (item.category?.name || item.category?._id || 'Unknown')
            : item.category
        }));
        localStorage.setItem('cart', JSON.stringify(cartData));
        console.log('✅ Cart storage cleaned');
      }
    }
  } catch (error) {
    console.error('Error cleaning cart:', error);
    localStorage.removeItem('cart');
  }
};

export const cleanAllStorage = () => {
  cleanWishlistStorage();
  cleanCartStorage();
};
