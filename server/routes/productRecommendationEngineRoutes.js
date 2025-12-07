import express from 'express';
import {
  getRecommendations,
  getById,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  trainModel,
  updateUserProfile,
  getSimilarProducts,
  getPopularProducts,
  getCrossSellItems,
  getUpsellItems,
  trackInteraction
} from '../controllers/productRecommendationEngineController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/recommendations')
  .get(isAuthenticatedUser, getRecommendations)
  .post(isAuthenticatedUser, createRecommendation);

router.route('/recommendations/:id')
  .get(isAuthenticatedUser, getById)
  .put(isAuthenticatedUser, updateRecommendation)
  .delete(isAuthenticatedUser, deleteRecommendation);

router.route('/recommendations/:id/train')
  .post(isAuthenticatedUser, authorizeRoles('admin'), trainModel);

router.route('/recommendations/:id/profile')
  .post(isAuthenticatedUser, updateUserProfile);

router.route('/recommendations/similar/:productId')
  .get(getSimilarProducts);

router.route('/recommendations/popular')
  .get(getPopularProducts);

router.route('/recommendations/cross-sell/:productId')
  .get(getCrossSellItems);

router.route('/recommendations/upsell/:productId')
  .get(getUpsellItems);

router.route('/recommendations/track')
  .post(trackInteraction);

export default router;
