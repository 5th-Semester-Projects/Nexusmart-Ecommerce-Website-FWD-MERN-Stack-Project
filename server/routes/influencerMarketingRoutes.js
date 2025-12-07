import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getInfluencers,
  getInfluencer,
  createInfluencerProfile,
  updateInfluencerProfile,
  generateDiscountCode,
  trackSale,
  createCampaign,
  approveContent,
  rejectContent,
  getCommissionReport,
  processPayout,
  getTopInfluencers,
  getInfluencerAnalytics
} from '../controllers/influencerMarketingController.js';

const router = express.Router();

router.route('/influencers')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getInfluencers);

router.route('/influencers/top')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getTopInfluencers);

router.route('/influencers/new')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), createInfluencerProfile);

router.route('/influencers/:id')
  .get(isAuthenticatedUser, getInfluencer)
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateInfluencerProfile);

router.route('/influencers/:id/discount-code')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), generateDiscountCode);

router.route('/influencers/:id/track-sale')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), trackSale);

router.route('/influencers/:id/campaigns')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), createCampaign);

router.route('/influencers/content/:contentId/approve')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), approveContent);

router.route('/influencers/content/:contentId/reject')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), rejectContent);

router.route('/influencers/:id/commission')
  .get(isAuthenticatedUser, getCommissionReport);

router.route('/influencers/:id/payout')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), processPayout);

router.route('/influencers/:id/analytics')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getInfluencerAnalytics);

export default router;
