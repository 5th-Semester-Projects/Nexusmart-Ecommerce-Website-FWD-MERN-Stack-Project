import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  registerSeller,
  getSellerProfile,
  updateSellerProfile,
  getSellerStats,
  getSellerProducts,
  getSellerOrders,
  requestPayout,
  getPayoutHistory,
  getAllSellers,
  approveSeller,
  rejectSeller,
  suspendSeller,
  processPayout,
  getStoreDetails
} from '../controllers/sellerController.js';

const router = express.Router();

// Public routes
router.get('/store/:storeName', getStoreDetails);

// Seller routes
router.post('/register', isAuthenticatedUser, registerSeller);
router.get('/profile', isAuthenticatedUser, getSellerProfile);
router.put('/profile', isAuthenticatedUser, updateSellerProfile);
router.get('/stats', isAuthenticatedUser, getSellerStats);
router.get('/products', isAuthenticatedUser, getSellerProducts);
router.get('/orders', isAuthenticatedUser, getSellerOrders);
router.post('/payout/request', isAuthenticatedUser, requestPayout);
router.get('/payout/history', isAuthenticatedUser, getPayoutHistory);

// Admin routes
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllSellers);
router.put('/admin/approve/:id', isAuthenticatedUser, authorizeRoles('admin'), approveSeller);
router.put('/admin/reject/:id', isAuthenticatedUser, authorizeRoles('admin'), rejectSeller);
router.put('/admin/suspend/:id', isAuthenticatedUser, authorizeRoles('admin'), suspendSeller);
router.put('/admin/payout/:id', isAuthenticatedUser, authorizeRoles('admin'), processPayout);

export default router;
