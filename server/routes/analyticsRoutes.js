import express from 'express';
import {
  getUserDashboardAnalytics,
  getSpendingAnalytics,
  getCategoryBreakdown,
  getSavingsAnalytics,
  getShoppingTrends,
  getPriceHistoryChart,
  getProductPriceComparison,
  getMarketTrends,
  getPersonalizedDeals,
  getDealRecommendations,
  getAdminAnalytics,
  getSalesAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
} from '../controllers/analyticsController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// User Dashboard Analytics
router.get('/user-dashboard', isAuthenticatedUser, getUserDashboardAnalytics);
router.get('/dashboard', isAuthenticatedUser, getUserDashboardAnalytics);
router.get('/spending', isAuthenticatedUser, getSpendingAnalytics);
router.get('/categories', isAuthenticatedUser, getCategoryBreakdown);
router.get('/savings', isAuthenticatedUser, getSavingsAnalytics);
router.get('/trends', isAuthenticatedUser, getShoppingTrends);

// Price History Charts
router.get('/price-history/:productId', getPriceHistoryChart);
router.post('/price-alert', isAuthenticatedUser, async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Price alert set successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/price-comparison', getProductPriceComparison);
router.get('/market-trends/:category', getMarketTrends);

// Personalized Deals
router.get('/deals/personalized', isAuthenticatedUser, getPersonalizedDeals);
router.get('/personalized-deals', isAuthenticatedUser, getPersonalizedDeals);
router.get('/deals/recommendations', isAuthenticatedUser, getDealRecommendations);

// Admin Analytics
router.get('/admin/overview', isAuthenticatedUser, authorizeRoles('admin'), getAdminAnalytics);
router.get('/admin/sales', isAuthenticatedUser, authorizeRoles('admin'), getSalesAnalytics);
router.get('/admin/inventory', isAuthenticatedUser, authorizeRoles('admin'), getInventoryAnalytics);
router.get('/admin/customers', isAuthenticatedUser, authorizeRoles('admin'), getCustomerAnalytics);

export default router;
