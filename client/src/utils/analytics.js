/**
 * Google Analytics 4 Configuration
 */

/**
 * Initialize Google Analytics
 */
export const initGA = (gaId) => {
  const analyticsId = gaId || import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  if (!analyticsId || import.meta.env.MODE !== 'production') {
    console.log('Google Analytics not initialized (dev mode or missing ID)');
    return;
  }

  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', analyticsId, {
    send_page_view: false, // We'll send manually
    cookie_flags: 'SameSite=None;Secure',
  });

  console.log('Google Analytics initialized');
};

/**
 * Track page view
 */
export const trackPageView = (path, title) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Track custom event
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track product view
 */
export const trackProductView = (product) => {
  trackEvent('view_item', {
    currency: 'USD',
    value: product.price,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category,
      item_brand: product.brand || 'NexusMart',
      price: product.price,
    }],
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category,
      item_brand: product.brand || 'NexusMart',
      price: product.price,
      quantity: quantity,
    }],
  });
};

/**
 * Track remove from cart
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  trackEvent('remove_from_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product._id,
      item_name: product.name,
      price: product.price,
      quantity: quantity,
    }],
  });
};

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (cartItems, totalValue) => {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: totalValue,
    items: cartItems.map(item => ({
      item_id: item.product._id,
      item_name: item.product.name,
      item_category: item.product.category,
      price: item.product.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Track purchase
 */
export const trackPurchase = (orderId, transaction) => {
  trackEvent('purchase', {
    transaction_id: orderId,
    currency: 'USD',
    value: transaction.total,
    tax: transaction.tax,
    shipping: transaction.shipping,
    items: transaction.items.map(item => ({
      item_id: item.product._id,
      item_name: item.product.name,
      item_category: item.product.category,
      price: item.product.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm, resultsCount) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

/**
 * Track user signup
 */
export const trackSignup = (method = 'email') => {
  trackEvent('sign_up', {
    method: method,
  });
};

/**
 * Track user login
 */
export const trackLogin = (method = 'email') => {
  trackEvent('login', {
    method: method,
  });
};

/**
 * Track share
 */
export const trackShare = (method, contentType, itemId) => {
  trackEvent('share', {
    method: method,
    content_type: contentType,
    item_id: itemId,
  });
};

/**
 * Track wishlist add
 */
export const trackAddToWishlist = (product) => {
  trackEvent('add_to_wishlist', {
    currency: 'USD',
    value: product.price,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
    }],
  });
};

/**
 * Track 3D viewer usage
 */
export const track3DViewer = (productId) => {
  trackEvent('3d_viewer_opened', {
    product_id: productId,
    feature: '3D Viewer',
  });
};

/**
 * Track AR try-on usage
 */
export const trackARTryOn = (productId) => {
  trackEvent('ar_tryon_opened', {
    product_id: productId,
    feature: 'AR Try-On',
  });
};

/**
 * Track wallet connection
 */
export const trackWalletConnect = (walletType) => {
  trackEvent('wallet_connected', {
    wallet_type: walletType,
    feature: 'Web3',
  });
};

/**
 * Track crypto payment
 */
export const trackCryptoPayment = (currency, amount) => {
  trackEvent('crypto_payment', {
    currency: currency,
    value: amount,
    payment_method: 'cryptocurrency',
  });
};

/**
 * Track NFT reward claim
 */
export const trackNFTClaim = (tier, nftId) => {
  trackEvent('nft_reward_claimed', {
    tier: tier,
    nft_id: nftId,
    feature: 'NFT Loyalty',
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (userId, properties) => {
  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', {
      user_id: userId,
      ...properties,
    });
  }
};

/**
 * Track exception
 */
export const trackException = (description, fatal = false) => {
  trackEvent('exception', {
    description: description,
    fatal: fatal,
  });
};

/**
 * Track timing
 */
export const trackTiming = (category, variable, value, label) => {
  trackEvent('timing_complete', {
    name: variable,
    value: value,
    event_category: category,
    event_label: label,
  });
};
