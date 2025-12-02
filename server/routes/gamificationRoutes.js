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
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Loyalty Points Routes
router.get('/points', isAuthenticated, getLoyaltyPoints);
router.get('/loyalty-points', isAuthenticated, getLoyaltyPoints);
router.post('/points/earn', isAuthenticated, earnPoints);
router.post('/points/redeem', isAuthenticated, redeemPoints);
router.post('/redeem-points', isAuthenticated, redeemPoints);

// Achievements Routes
router.get('/achievements', getAchievements);
router.get('/achievements/user', isAuthenticated, getAchievements);
router.post('/achievements/:id/claim', isAuthenticated, claimAchievement);

// Spin Wheel Routes
router.get('/spin', isAuthenticated, getSpinWheel);
router.post('/spin', isAuthenticated, spinWheel);
router.post('/spin-wheel', isAuthenticated, spinWheel);
router.post('/spin/:id/claim', isAuthenticated, claimSpinPrize);

// Referral Routes
router.get('/referral', isAuthenticated, getReferralInfo);
router.post('/referral/apply', isAuthenticated, applyReferralCode);
router.get('/referral/stats', isAuthenticated, getReferralInfo);
router.get('/referral-stats', isAuthenticated, getReferralInfo);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Admin Routes
router.put('/settings', isAuthenticated, authorizeRoles('admin'), updateGamificationSettings);

export default router;
