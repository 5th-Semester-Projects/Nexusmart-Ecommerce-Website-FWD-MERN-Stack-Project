import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  purchaseGiftCard,
  checkBalance,
  redeemGiftCard,
  addBalance,
  getMyGiftCards,
  getGiftCardDesigns,
  getGiftWrapOptions,
  getAllGiftCards,
  deactivateGiftCard,
  createGiftWrapOption
} from '../controllers/giftCardController.js';

const router = express.Router();

// Public routes
router.get('/designs', getGiftCardDesigns);
router.get('/wrap-options', getGiftWrapOptions);
router.post('/check-balance', checkBalance);

// User routes
router.post('/purchase', isAuthenticatedUser, purchaseGiftCard);
router.post('/redeem', isAuthenticatedUser, redeemGiftCard);
router.get('/my-cards', isAuthenticatedUser, getMyGiftCards);

// Admin routes
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllGiftCards);
router.post('/admin/add-balance', isAuthenticatedUser, authorizeRoles('admin'), addBalance);
router.put('/admin/deactivate/:id', isAuthenticatedUser, authorizeRoles('admin'), deactivateGiftCard);
router.post('/admin/wrap-option', isAuthenticatedUser, authorizeRoles('admin'), createGiftWrapOption);

export default router;
