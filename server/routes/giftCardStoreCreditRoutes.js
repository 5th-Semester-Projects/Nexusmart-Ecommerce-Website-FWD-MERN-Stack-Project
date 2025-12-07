import express from 'express';
import {
  getAllGiftCards,
  getGiftCard,
  createGiftCard,
  updateGiftCard,
  cancelGiftCard,
  checkBalance,
  redeemGiftCard,
  transferGiftCard,
  sendGiftCard,
  getUserActiveCards,
  getExpiringCards,
  getUserTotalBalance,
  getTransactionHistory,
  validateGiftCard,
  reloadGiftCard
} from '../controllers/giftCardStoreCreditController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/gift-cards')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllGiftCards)
  .post(isAuthenticatedUser, createGiftCard);

router.route('/gift-cards/validate')
  .post(validateGiftCard);

router.route('/gift-cards/user/active')
  .get(isAuthenticatedUser, getUserActiveCards);

router.route('/gift-cards/user/balance')
  .get(isAuthenticatedUser, getUserTotalBalance);

router.route('/gift-cards/expiring/:days')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getExpiringCards);

router.route('/gift-cards/redeem')
  .post(redeemGiftCard);

router.route('/gift-cards/:cardNumber')
  .get(getGiftCard);

router.route('/gift-cards/:cardNumber/balance')
  .get(checkBalance);

router.route('/gift-cards/:cardNumber/transactions')
  .get(getTransactionHistory);

router.route('/gift-cards/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateGiftCard)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), cancelGiftCard);

router.route('/gift-cards/:id/transfer')
  .post(isAuthenticatedUser, transferGiftCard);

router.route('/gift-cards/:id/send')
  .post(isAuthenticatedUser, sendGiftCard);

router.route('/gift-cards/:id/reload')
  .post(isAuthenticatedUser, reloadGiftCard);

export default router;
