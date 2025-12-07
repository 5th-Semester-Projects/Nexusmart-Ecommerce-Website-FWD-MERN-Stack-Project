import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getConfiguration,
  updateConfiguration,
  addRecentPurchase,
  updateLiveVisitors,
  trackImpression,
  trackClick,
  getFOMOTriggers,
  activateFOMOTrigger,
  getAnalytics,
  manageTrustBadges,
  updateReviewHighlights
} from '../controllers/socialProofEngineController.js';

const router = express.Router();

router.route('/social-proof/config')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getConfiguration)
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateConfiguration);

router.route('/social-proof/purchase/add')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), addRecentPurchase);

router.route('/social-proof/visitors/update')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateLiveVisitors);

router.route('/social-proof/track/impression').post(trackImpression);
router.route('/social-proof/track/click').post(trackClick);

router.route('/social-proof/fomo/triggers').get(getFOMOTriggers);
router.route('/social-proof/fomo/triggers/:triggerId/activate')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), activateFOMOTrigger);

router.route('/social-proof/analytics')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getAnalytics);

router.route('/social-proof/badges')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), manageTrustBadges);

router.route('/social-proof/reviews/highlights')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateReviewHighlights);

export default router;
