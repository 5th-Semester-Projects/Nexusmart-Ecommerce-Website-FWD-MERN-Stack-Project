import express from 'express';
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  triggerCampaign,
  pauseCampaign,
  resumeCampaign,
  getActiveCampaigns,
  getTopPerforming,
  trackEngagement,
  runABTest
} from '../controllers/marketingAutomationController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/marketing/campaigns')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getAllCampaigns)
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), createCampaign);

router.route('/marketing/campaigns/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getCampaignById)
  .put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateCampaign)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCampaign);

router.route('/marketing/campaigns/:id/trigger')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), triggerCampaign);

router.route('/marketing/campaigns/:id/pause')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), pauseCampaign);

router.route('/marketing/campaigns/:id/resume')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), resumeCampaign);

router.route('/marketing/campaigns/active')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getActiveCampaigns);

router.route('/marketing/campaigns/top-performing')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'seller'), getTopPerforming);

router.route('/marketing/campaigns/:id/track')
  .post(isAuthenticatedUser, trackEngagement);

router.route('/marketing/campaigns/:id/ab-test')
  .post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), runABTest);

export default router;
