import express from 'express';
import {
  getDashboard,
  createDashboard,
  getSalesForecast,
  getConversionFunnel,
  getRevenueAttribution,
  getProductPerformance,
  getCustomerAnalytics,
  getBehaviorHeatmaps,
  getRealTimeMetrics,
  predictNextMonthRevenue,
  generateReport,
  getRecentDashboards,
  updateDashboardSettings
} from '../controllers/advancedAnalyticsDashboardController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/analytics/dashboard')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getDashboard)
  .post(isAuthenticatedUser, authorizeRoles('admin'), createDashboard);

router.route('/analytics/dashboard/settings')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateDashboardSettings);

router.route('/analytics/dashboard/recent')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getRecentDashboards);

router.route('/analytics/sales-forecast')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getSalesForecast);

router.route('/analytics/funnel')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getConversionFunnel);

router.route('/analytics/attribution')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getRevenueAttribution);

router.route('/analytics/products')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getProductPerformance);

router.route('/analytics/customers')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getCustomerAnalytics);

router.route('/analytics/heatmaps')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getBehaviorHeatmaps);

router.route('/analytics/realtime')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getRealTimeMetrics);

router.route('/analytics/predict-revenue')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), predictNextMonthRevenue);

router.route('/analytics/report')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), generateReport);

export default router;
