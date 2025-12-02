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
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// User Dashboard Analytics
router.get('/user-dashboard', isAuthenticated, getUserDashboardAnalytics);
router.get('/dashboard', isAuthenticated, getUserDashboardAnalytics);
router.get('/spending', isAuthenticated, getSpendingAnalytics);
router.get('/categories', isAuthenticated, getCategoryBreakdown);
router.get('/savings', isAuthenticated, getSavingsAnalytics);
router.get('/trends', isAuthenticated, getShoppingTrends);

// Price History Charts
router.get('/price-history/:productId', getPriceHistoryChart);
router.post('/price-alert', isAuthenticated, async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Price alert set successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/price-comparison', getProductPriceComparison);
router.get('/market-trends/:category', getMarketTrends);

// Personalized Deals
router.get('/deals/personalized', isAuthenticated, getPersonalizedDeals);
router.get('/personalized-deals', isAuthenticated, getPersonalizedDeals);
router.get('/deals/recommendations', isAuthenticated, getDealRecommendations);

// Admin Analytics
router.get('/admin/overview', isAuthenticated, authorizeRoles('admin'), getAdminAnalytics);
router.get('/admin/sales', isAuthenticated, authorizeRoles('admin'), getSalesAnalytics);
router.get('/admin/inventory', isAuthenticated, authorizeRoles('admin'), getInventoryAnalytics);
router.get('/admin/customers', isAuthenticated, authorizeRoles('admin'), getCustomerAnalytics);

export default router;
