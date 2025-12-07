import express from 'express';
import {
  createEmailCampaign,
  sendEmailCampaign,
  getCampaignAnalytics,
  createRetargetingCampaign,
  launchRetargetingCampaign,
  getRetargetingPerformance,
  createReferralCode,
  inviteReferral,
  getReferralStats,
  createFlashSale,
  activateFlashSale,
  getActiveFlashSales,
  getLoyaltyTier,
  addLoyaltyPoints,
  redeemPoints
} from '../controllers/marketingController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Email Marketing
router.post('/email/campaign', isAuthenticatedUser, authorizeRoles('admin', 'marketing'), createEmailCampaign);
router.post('/email/campaign/:campaignId/send', isAuthenticatedUser, authorizeRoles('admin', 'marketing'), sendEmailCampaign);
router.get('/email/campaign/:campaignId/analytics', isAuthenticatedUser, authorizeRoles('admin', 'marketing'), getCampaignAnalytics);

// Retargeting
router.post('/retargeting/campaign', isAuthenticatedUser, authorizeRoles('admin', 'marketing'), createRetargetingCampaign);
router.post('/retargeting/campaign/:campaignId/launch', isAuthenticatedUser, authorizeRoles('admin', 'marketing'), launchRetargetingCampaign);
router.get('/retargeting/campaign/:campaignId/performance', isAuthenticatedUser, authorizeRoles('admin', 'marketing'), getRetargetingPerformance);

// Referral Program
router.post('/referral/create-code', isAuthenticatedUser, createReferralCode);
router.post('/referral/invite', isAuthenticatedUser, inviteReferral);
router.get('/referral/stats', isAuthenticatedUser, getReferralStats);

// Flash Sales
router.post('/flash-sale', isAuthenticatedUser, authorizeRoles('admin'), createFlashSale);
router.post('/flash-sale/:saleId/activate', isAuthenticatedUser, authorizeRoles('admin'), activateFlashSale);
router.get('/flash-sale/active', getActiveFlashSales);

// Loyalty Program
router.get('/loyalty/tier', isAuthenticatedUser, getLoyaltyTier);
router.post('/loyalty/points/add', isAuthenticatedUser, authorizeRoles('admin'), addLoyaltyPoints);
router.post('/loyalty/points/redeem', isAuthenticatedUser, redeemPoints);

export default router;
