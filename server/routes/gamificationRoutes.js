import express from 'express';
import {
  getLoyaltyPoints,
  earnPoints,
  redeemPoints,
  getAchievements,
  getUserAchievements,
  claimAchievement,
  checkAchievementProgress,
  getSpinWheel,
  spinWheel,
  claimSpinPrize,
  getSpinHistory,
  createReferralCode,
  applyReferralCode,
  getReferralStats,
  getGamificationSettings,
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
router.get('/achievements/user', isAuthenticated, getUserAchievements);
router.post('/achievements/:id/claim', isAuthenticated, claimAchievement);
router.post('/achievements/check', isAuthenticated, checkAchievementProgress);

// Spin Wheel Routes
router.get('/spin', isAuthenticated, getSpinWheel);
router.post('/spin', isAuthenticated, spinWheel);
router.post('/spin-wheel', isAuthenticated, spinWheel);
router.post('/spin/:id/claim', isAuthenticated, claimSpinPrize);
router.get('/spin/history', isAuthenticated, getSpinHistory);

// Referral Routes
router.post('/referral/create', isAuthenticated, createReferralCode);
router.post('/referral/apply', isAuthenticated, applyReferralCode);
router.get('/referral/stats', isAuthenticated, getReferralStats);
router.get('/referral-stats', isAuthenticated, getReferralStats);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Admin Routes
router.get('/settings', isAuthenticated, authorizeRoles('admin'), getGamificationSettings);
router.put('/settings', isAuthenticated, authorizeRoles('admin'), updateGamificationSettings);

export default router;
