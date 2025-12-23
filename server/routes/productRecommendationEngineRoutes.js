import express from 'express';
import {
  getUserRecommendations,
  createRecommendationEngine,
  updateUserProfile,
  recordImpression,
  recordClick,
  recordConversion,
  getCrossSellRecommendations,
  getUpSellRecommendations,
  getTrendingRecommendations,
  getPersonalizedBundles,
  getSimilarItems,
  getRecommendationPerformance,
  getTopPerformers
} from '../controllers/productRecommendationEngineController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/recommendations')
  .get(isAuthenticatedUser, getUserRecommendations)
  .post(isAuthenticatedUser, authorizeRoles('admin'), createRecommendationEngine);

router.route('/recommendations/profile')
  .post(isAuthenticatedUser, updateUserProfile);

router.route('/recommendations/similar/:productId')
  .get(getSimilarItems);

router.route('/recommendations/trending')
  .get(getTrendingRecommendations);

router.route('/recommendations/bundles')
  .get(isAuthenticatedUser, getPersonalizedBundles);

router.route('/recommendations/cross-sell/:productId')
  .get(getCrossSellRecommendations);

router.route('/recommendations/upsell/:productId')
  .get(getUpSellRecommendations);

router.route('/recommendations/impression')
  .post(recordImpression);

router.route('/recommendations/click')
  .post(recordClick);

router.route('/recommendations/conversion')
  .post(recordConversion);

router.route('/recommendations/performance')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getRecommendationPerformance);

router.route('/recommendations/top-performers')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getTopPerformers);

export default router;
