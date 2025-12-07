import express from 'express';
import {
  getDashboardData,
  getById,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  generateForecast,
  getHeatmapData,
  getConversionFunnel,
  getRevenueAttribution,
  getProductPerformance,
  getTopPerformers,
  generateReport
} from '../controllers/advancedAnalyticsDashboardController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/analytics/dashboard')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getDashboardData)
  .post(isAuthenticatedUser, authorizeRoles('admin'), createDashboard);

router.route('/analytics/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getById)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateDashboard)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteDashboard);

router.route('/analytics/:id/forecast')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), generateForecast);

router.route('/analytics/:id/heatmap')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getHeatmapData);

router.route('/analytics/:id/funnel')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getConversionFunnel);

router.route('/analytics/:id/attribution')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getRevenueAttribution);

router.route('/analytics/:id/products')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getProductPerformance);

router.route('/analytics/:id/top-performers')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getTopPerformers);

router.route('/analytics/:id/report')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), generateReport);

export default router;
