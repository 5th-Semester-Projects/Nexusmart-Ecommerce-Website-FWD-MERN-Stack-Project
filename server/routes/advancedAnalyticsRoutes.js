import express from 'express';
import {
  recordHeatmapClick,
  getHeatmapData,
  recordScrollDepth,
  createABTest,
  getABTestVariant,
  recordABTestConversion,
  getABTestResults,
  createCohort,
  getCohortRetention,
  getRevenueDashboard,
  getConversionFunnel,
  getCustomerLTV
} from '../controllers/advancedAnalyticsController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Advanced Analytics Routes
 * Handles heatmaps, A/B testing, cohort analysis, and revenue dashboards
 */

// Heatmap routes
router.post('/heatmap/click', recordHeatmapClick);
router.post('/heatmap/scroll', recordScrollDepth);
router.get('/heatmap/data', isAuthenticated, isAdmin, getHeatmapData);

// A/B Testing routes
router.post('/ab-test', isAuthenticated, isAdmin, createABTest);
router.get('/ab-test/:testId/variant', getABTestVariant);
router.post('/ab-test/conversion', recordABTestConversion);
router.get('/ab-test/:testId/results', isAuthenticated, isAdmin, getABTestResults);

// Cohort Analysis routes
router.post('/cohort', isAuthenticated, isAdmin, createCohort);
router.get('/cohort/:cohortId/retention', isAuthenticated, isAdmin, getCohortRetention);

// Revenue Dashboard routes
router.get('/revenue', isAuthenticated, isAdmin, getRevenueDashboard);
router.get('/funnel', isAuthenticated, isAdmin, getConversionFunnel);
router.get('/ltv', isAuthenticated, isAdmin, getCustomerLTV);

export default router;
