import express from 'express';
import {
  registerSeller,
  getSellerProfile,
  updateSellerProfile,
  addSellerProduct,
  getSellerProducts,
  getSellerAnalytics,
  requestPayout,
  approveSeller,
  getAllSellers,
  rateVendor
} from '../controllers/multiVendorController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Seller Registration & Profile
router.post('/register', isAuthenticatedUser, registerSeller);
router.get('/profile/:sellerId', getSellerProfile);
router.put('/profile', isAuthenticatedUser, updateSellerProfile);

// Seller Products
router.post('/products', isAuthenticatedUser, addSellerProduct);
router.get('/products', isAuthenticatedUser, getSellerProducts);

// Seller Analytics
router.get('/analytics', isAuthenticatedUser, getSellerAnalytics);

// Payouts
router.post('/payout/request', isAuthenticatedUser, requestPayout);

// Admin endpoints
router.put('/:vendorId/approve', isAuthenticatedUser, authorizeRoles('admin'), approveSeller);
router.get('/all', getAllSellers);

// Ratings
router.post('/:vendorId/rate', isAuthenticatedUser, rateVendor);

export default router;
