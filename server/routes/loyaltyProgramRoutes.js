import express from 'express';
const router = express.Router();
import { isAuthenticatedUser } from '../middleware/auth.js';
import * as loyaltyProgramController from '../controllers/loyaltyProgramController.js';

router.get('/me', isAuthenticatedUser, loyaltyProgramController.getUserLoyalty);
router.post('/points/add', isAuthenticatedUser, loyaltyProgramController.addPoints);
router.post('/points/redeem', isAuthenticatedUser, loyaltyProgramController.redeemPoints);
router.get('/leaderboard', loyaltyProgramController.getLeaderboard);
router.get('/referral/:code/validate', loyaltyProgramController.validateReferralCode);

export default router;
