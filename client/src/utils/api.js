import axios from 'axios';

// Dynamic API URL configuration
let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let configFetched = false;

// Function to fetch runtime config
const fetchConfig = async () => {
  if (configFetched || !import.meta.env.PROD) return;

  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    API_BASE = config.apiUrl;
    configFetched = true;
    console.log('Runtime API URL:', API_BASE);
  } catch (error) {
    console.error('Failed to fetch API config:', error);
  }
};

// Fetch config immediately in production
if (import.meta.env.PROD) {
  fetchConfig();
}

const getApiUrl = () => `${API_BASE}/api`;

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL dynamically when config changes
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiUrl();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data?.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response received');
    } else {
      // Error in request configuration
      console.error('Request configuration error:', error.message);
    }
    return Promise.reject(error);
  }
);

// =============== AUTH API ===============
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/update-profile', userData),
  updateAvatar: (formData) => api.put('/auth/update-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  updatePassword: (passwords) => api.put('/auth/password', passwords),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// =============== PRODUCTS API ===============
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getTrending: () => api.get('/products/trending'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getFeatured: () => api.get('/products/featured'),
  search: (query) => api.post('/products/search', { query }),
  getByCategory: (category, params) => api.get(`/products/category/${category}`, { params }),
  getRecommendations: (productId) => api.get(`/products/${productId}/recommendations`),
  // Admin only
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// =============== CART API ===============
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (item) => api.post('/cart/add', item),
  update: (itemId, quantity) => api.put(`/cart/update/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  sync: (cartItems) => api.post('/cart/sync', { items: cartItems }),
};

// =============== ORDERS API ===============
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  // Admin only
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),
};

// =============== REVIEWS API ===============
export const reviewsAPI = {
  create: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
  getByProduct: (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  update: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
  helpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
};

// =============== CATEGORIES API ===============
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  // Admin only
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// =============== PAYMENT API ===============
export const paymentAPI = {
  createIntent: (amount) => api.post('/payment/create-intent', { amount }),
  processPayment: (paymentData) => api.post('/payment/process', paymentData),
  verifyPayment: (paymentId) => api.get(`/payment/verify/${paymentId}`),
  getPaymentMethods: () => api.get('/payment/methods'),
  addPaymentMethod: (methodData) => api.post('/payment/methods', methodData),
  removePaymentMethod: (methodId) => api.delete(`/payment/methods/${methodId}`),
};

// =============== WISHLIST API ===============
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
  clear: () => api.delete('/wishlist/clear'),
};

// =============== USER API ===============
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (address) => api.post('/users/addresses', address),
  updateAddress: (id, address) => api.put(`/users/addresses/${id}`, address),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/users/addresses/${id}/default`),
};

// =============== ADMIN API ===============
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
};

// =============== ANALYTICS API ===============
export const analyticsAPI = {
  trackEvent: (eventData) => api.post('/analytics/event', eventData),
  trackPageView: (pageData) => api.post('/analytics/pageview', pageData),
  getStats: () => api.get('/analytics/stats'),
};

// =============== COUPONS API ===============
export const couponsAPI = {
  // Public
  getPublic: () => api.get('/coupons/public'),
  validate: (code, cartTotal) => api.post('/coupons/validate', { code, cartTotal }),
  // User
  apply: (code, cartTotal) => api.post('/coupons/apply', { code, cartTotal }),
  getMyHistory: () => api.get('/coupons/my-history'),
  // Admin
  getAll: (params) => api.get('/coupons/admin', { params }),
  getById: (id) => api.get(`/coupons/admin/${id}`),
  create: (couponData) => api.post('/coupons/admin', couponData),
  update: (id, couponData) => api.put(`/coupons/admin/${id}`, couponData),
  delete: (id) => api.delete(`/coupons/admin/${id}`),
  getStats: () => api.get('/coupons/admin/stats'),
};

// =============== STOCK ALERTS API ===============
export const stockAlertsAPI = {
  // User
  subscribe: (productId, email) => api.post('/stock-alerts', { productId, email }),
  getMyAlerts: () => api.get('/stock-alerts/my-alerts'),
  checkSubscription: (productId) => api.get(`/stock-alerts/check/${productId}`),
  unsubscribe: (alertId) => api.delete(`/stock-alerts/${alertId}`),
  // Admin
  getAll: (params) => api.get('/stock-alerts/admin/all', { params }),
  getPopular: () => api.get('/stock-alerts/admin/popular'),
  notifySubscribers: (productId) => api.post(`/stock-alerts/admin/notify/${productId}`),
  cleanup: (daysOld) => api.delete('/stock-alerts/admin/cleanup', { params: { daysOld } }),
};

// =============== QUESTIONS API ===============
export const questionsAPI = {
  // Public
  getProductQuestions: (productId, params) => api.get(`/questions/product/${productId}`, { params }),
  // User
  ask: (productId, question) => api.post('/questions', { productId, question }),
  answer: (questionId, answer) => api.post(`/questions/${questionId}/answer`, { answer }),
  voteQuestion: (questionId, voteType) => api.post(`/questions/${questionId}/vote`, { voteType }),
  voteAnswer: (questionId, answerId, voteType) =>
    api.post(`/questions/${questionId}/answer/${answerId}/vote`, { voteType }),
  getMyQuestions: () => api.get('/questions/my-questions'),
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`),
  // Admin
  getAllQuestions: (params) => api.get('/questions/admin/all', { params }),
  updateStatus: (questionId, status) => api.patch(`/questions/admin/${questionId}/status`, { status }),
  getQAStats: () => api.get('/questions/admin/stats'),
};

// =============== NEWSLETTER API ===============
export const newsletterAPI = {
  // Public
  subscribe: (email, name, preferences) => api.post('/newsletter/subscribe', { email, name, preferences }),
  confirm: (token) => api.get(`/newsletter/confirm/${token}`),
  unsubscribe: (email, token) => api.post('/newsletter/unsubscribe', { email, token }),
  // User
  getStatus: () => api.get('/newsletter/status'),
  updatePreferences: (preferences) => api.patch('/newsletter/preferences', { preferences }),
  // Admin
  getSubscribers: (params) => api.get('/newsletter/admin/subscribers', { params }),
  getStats: () => api.get('/newsletter/admin/stats'),
  exportSubscribers: (params) => api.get('/newsletter/admin/export', { params }),
  sendNewsletter: (data) => api.post('/newsletter/admin/send', data),
  deleteSubscriber: (subscriberId) => api.delete(`/newsletter/admin/${subscriberId}`),
};

// =============== NOTIFICATIONS API ===============
export const notificationsAPI = {
  // User
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  clearRead: () => api.delete('/notifications/clear-read'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => api.patch('/notifications/preferences', { preferences }),
  // Admin
  send: (data) => api.post('/notifications/admin/send', data),
  getStats: () => api.get('/notifications/admin/stats'),
  cleanup: (daysOld) => api.delete('/notifications/admin/cleanup', { params: { daysOld } }),
};

// =============== SECURITY API ===============
export const securityAPI = {
  // 2FA
  get2FAStatus: () => api.get('/security/2fa/status'),
  setup2FA: (method, phoneNumber) => api.post('/security/2fa/setup', { method, phoneNumber }),
  verify2FA: (code) => api.post('/security/2fa/verify', { code }),
  disable2FA: (password, code) => api.post('/security/2fa/disable', { password, code }),
  generateBackupCodes: (password) => api.post('/security/2fa/backup-codes', { password }),
  getTrustedDevices: () => api.get('/security/2fa/trusted-devices'),
  removeTrustedDevice: (deviceId) => api.delete(`/security/2fa/trusted-devices/${deviceId}`),
  // Login History & Sessions
  getLoginHistory: (params) => api.get('/security/login-history', { params }),
  getActiveSessions: () => api.get('/security/sessions'),
  terminateSession: (sessionId) => api.delete(`/security/sessions/${sessionId}`),
  terminateAllSessions: () => api.delete('/security/sessions'),
  checkSuspiciousActivity: () => api.get('/security/suspicious-activity'),
};

// Export configured axios instance as default
export default api;
