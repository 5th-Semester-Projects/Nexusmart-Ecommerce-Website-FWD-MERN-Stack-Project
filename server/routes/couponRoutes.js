import express from 'express';
import {
  getPublicCoupons,
  getAvailableCoupons,
  validateCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
} from '../controllers/couponController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicCoupons);
router.get('/available', isAuthenticatedUser, getAvailableCoupons);
router.post('/validate', isAuthenticatedUser, validateCoupon);

// Admin routes
router.get('/admin', isAuthenticatedUser, authorizeRoles('admin'), getAllCoupons);
router.get('/admin/stats', isAuthenticatedUser, authorizeRoles('admin'), getCouponStats);
router.post('/admin', isAuthenticatedUser, authorizeRoles('admin'), createCoupon);
router.put('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), updateCoupon);
router.delete('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteCoupon);

export default router;
