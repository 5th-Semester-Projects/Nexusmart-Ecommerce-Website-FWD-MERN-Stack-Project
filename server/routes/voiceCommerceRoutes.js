import express from 'express';
import { isAuthenticatedUser } from '../middleware/auth.js';
import {
  startVoiceSession,
  processVoiceCommand,
  voiceSearch,
  addToVoiceCart,
  placeVoiceOrder,
  voiceCheckout,
  getSessionHistory,
  updateVoicePreferences,
  trainVoiceprint,
  getVoiceAnalytics,
  handleVoiceError
} from '../controllers/voiceCommerceController.js';

const router = express.Router();

router.route('/voice/session/start').post(isAuthenticatedUser, startVoiceSession);
router.route('/voice/session/history').get(isAuthenticatedUser, getSessionHistory);

router.route('/voice/command/process').post(isAuthenticatedUser, processVoiceCommand);
router.route('/voice/search').post(isAuthenticatedUser, voiceSearch);
router.route('/voice/cart/add').post(isAuthenticatedUser, addToVoiceCart);
router.route('/voice/order/place').post(isAuthenticatedUser, placeVoiceOrder);
router.route('/voice/checkout').post(isAuthenticatedUser, voiceCheckout);

router.route('/voice/preferences').put(isAuthenticatedUser, updateVoicePreferences);
router.route('/voice/voiceprint/train').post(isAuthenticatedUser, trainVoiceprint);

router.route('/voice/analytics').get(isAuthenticatedUser, getVoiceAnalytics);
router.route('/voice/error').post(isAuthenticatedUser, handleVoiceError);

export default router;
