import express from 'express';
import * as aiStylistController from '../controllers/aiStylistController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Style Quiz Routes
router.post('/style-quiz', isAuthenticatedUser, aiStylistController.submitStyleQuiz);
router.get('/style-profile/:userId', isAuthenticatedUser, aiStylistController.updateStyleProfile);
router.put('/style-profile/:userId', isAuthenticatedUser, aiStylistController.updateStyleProfile);

// Outfit Recommendations
router.get('/outfit-recommendations', isAuthenticatedUser, aiStylistController.getOutfitRecommendations);

// Styling Sessions
router.post('/styling-session', isAuthenticatedUser, aiStylistController.bookStylingSession);
router.get('/styling-sessions/:userId', isAuthenticatedUser, aiStylistController.getStylingSessions);

// Personal Shopper
router.get('/personal-shopper', isAuthenticatedUser, aiStylistController.getPersonalShopperSuggestions);

export default router;
