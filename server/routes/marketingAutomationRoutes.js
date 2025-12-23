import express from 'express';
import {
  getAllCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  pauseCampaign,
  getActiveCampaigns,
  activateCampaign,
  getCampaignMetrics,
  getCampaignPerformance,
  addSendRecord,
  recordInteraction,
  selectABTestWinner
} from '../controllers/marketingAutomationController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/marketing/campaigns')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getAllCampaigns)
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), createCampaign);

router.route('/marketing/campaigns/active')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getActiveCampaigns);

router.route('/marketing/campaigns/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getCampaign)
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateCampaign)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCampaign);

router.route('/marketing/campaigns/:id/activate')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), activateCampaign);

router.route('/marketing/campaigns/:id/pause')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), pauseCampaign);

router.route('/marketing/campaigns/:id/metrics')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getCampaignMetrics);

router.route('/marketing/campaigns/:id/send')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), addSendRecord);

router.route('/marketing/campaigns/:id/interaction')
  .post(recordInteraction);

router.route('/marketing/campaigns/:id/ab-test/select-winner')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), selectABTestWinner);

router.route('/marketing/campaigns/performance/:businessId/:campaignType')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getCampaignPerformance);

export default router;
