import express from 'express';
import {
  getCustomer360View,
  updateCustomer360,
  createCohort,
  getCohortAnalysis,
  analyzeFunnel,
  getHeatmapData,
  getRevenueAttribution,
  predictCustomerLTV,
  getRealtimeDashboard,
  createABTest,
  getABTestResults
} from '../controllers/detailedAnalyticsController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Customer 360
router.get('/customer360/:userId', isAuthenticatedUser, authorizeRoles('admin'), getCustomer360View);
router.put('/customer360/:userId', isAuthenticatedUser, authorizeRoles('admin'), updateCustomer360);

// Cohort Analysis
router.post('/cohorts', isAuthenticatedUser, authorizeRoles('admin'), createCohort);
router.get('/cohorts/:cohortId', isAuthenticatedUser, authorizeRoles('admin'), getCohortAnalysis);

// Funnel Optimization
router.post('/funnel/analyze', isAuthenticatedUser, authorizeRoles('admin'), analyzeFunnel);

// Heat Mapping
router.get('/heatmap', isAuthenticatedUser, authorizeRoles('admin'), getHeatmapData);

// Revenue Attribution
router.get('/attribution', isAuthenticatedUser, authorizeRoles('admin'), getRevenueAttribution);

// Predictive LTV
router.get('/ltv/:userId', isAuthenticatedUser, authorizeRoles('admin'), predictCustomerLTV);

// Real-time Dashboards
router.get('/dashboard/realtime', isAuthenticatedUser, authorizeRoles('admin'), getRealtimeDashboard);

// A/B Testing
router.post('/ab-test', isAuthenticatedUser, authorizeRoles('admin'), createABTest);
router.get('/ab-test/:testId', isAuthenticatedUser, authorizeRoles('admin'), getABTestResults);

export default router;
