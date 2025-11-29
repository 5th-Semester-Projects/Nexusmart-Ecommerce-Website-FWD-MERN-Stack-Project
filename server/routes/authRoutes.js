import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  updateAvatar,
  changePassword,
  enableTwoFactor,
  verifyTwoFactorSetup,
  verifyTwoFactor,
  disableTwoFactor,
} from '../controllers/authController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/verify-2fa', verifyTwoFactor);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', isAuthenticatedUser, getUserProfile);
router.get('/logout', isAuthenticatedUser, logoutUser);
router.put('/update-password', isAuthenticatedUser, updatePassword);
router.put('/update-profile', isAuthenticatedUser, updateProfile);
router.put('/update-avatar', isAuthenticatedUser, uploadAvatar, updateAvatar);
router.put('/change-password', isAuthenticatedUser, changePassword);

// Two-Factor Authentication routes
router.post('/enable-2fa', isAuthenticatedUser, enableTwoFactor);
router.post('/verify-2fa-setup', isAuthenticatedUser, verifyTwoFactorSetup);
router.post('/disable-2fa', isAuthenticatedUser, disableTwoFactor);

export default router;
