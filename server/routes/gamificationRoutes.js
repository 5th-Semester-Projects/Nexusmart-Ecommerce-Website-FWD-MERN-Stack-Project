import express from 'express';
import {
  getLoyaltyPoints,
  earnPoints,
  redeemPoints,
  getAchievements,
  claimAchievement,
  checkAchievements,
  getSpinWheel,
  spinWheel,
  claimSpinPrize,
  getReferralInfo,
  applyReferralCode,
  updateGamificationSettings,
  getLeaderboard,
} from '../controllers/gamificationController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Loyalty Points Routes
router.get('/points', isAuthenticatedUser, getLoyaltyPoints);
router.get('/loyalty-points', isAuthenticatedUser, getLoyaltyPoints);
router.post('/points/earn', isAuthenticatedUser, earnPoints);
router.post('/points/redeem', isAuthenticatedUser, redeemPoints);
router.post('/redeem-points', isAuthenticatedUser, redeemPoints);

// Achievements Routes
router.get('/achievements', getAchievements);
router.get('/achievements/user', isAuthenticatedUser, getAchievements);
router.post('/achievements/:id/claim', isAuthenticatedUser, claimAchievement);

// Spin Wheel Routes
router.get('/spin', isAuthenticatedUser, getSpinWheel);
router.post('/spin', isAuthenticatedUser, spinWheel);
router.post('/spin-wheel', isAuthenticatedUser, spinWheel);
router.post('/spin/:id/claim', isAuthenticatedUser, claimSpinPrize);

// Referral Routes
router.get('/referral', isAuthenticatedUser, getReferralInfo);
router.post('/referral/apply', isAuthenticatedUser, applyReferralCode);
router.get('/referral/stats', isAuthenticatedUser, getReferralInfo);
router.get('/referral-stats', isAuthenticatedUser, getReferralInfo);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Admin Routes
router.put('/settings', isAuthenticatedUser, authorizeRoles('admin'), updateGamificationSettings);

export default router;
