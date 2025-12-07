import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getProductPrice,
  updateProductPrice,
  trackCompetitorPrices,
  calculateDemandScore,
  activateFlashSale,
  setPersonalizedPrice,
  updatePricingRules,
  getPriceHistory,
  getPricingAnalytics,
  handlePricingAlerts,
  updateCompetitorPricesBatch,
  createPricingConfiguration
} from '../controllers/dynamicPricingEngineController.js';

const router = express.Router();

router.route('/pricing/:productId/price').get(getProductPrice);
router.route('/pricing/:productId/price/update')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateProductPrice);

router.route('/pricing/:productId/competitors')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), trackCompetitorPrices);

router.route('/pricing/:productId/demand/calculate')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), calculateDemandScore);

router.route('/pricing/:productId/flash-sale')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), activateFlashSale);

router.route('/pricing/:productId/personalized')
  .post(isAuthenticatedUser, setPersonalizedPrice);

router.route('/pricing/:productId/rules')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updatePricingRules);

router.route('/pricing/:productId/history')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getPriceHistory);

router.route('/pricing/:productId/analytics')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getPricingAnalytics);

router.route('/pricing/:productId/alerts')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), handlePricingAlerts);

router.route('/pricing/competitors/update')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateCompetitorPricesBatch);

router.route('/pricing/config/new')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), createPricingConfiguration);

export default router;
