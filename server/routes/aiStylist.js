import express from 'express';
import * as aiStylistController from '../controllers/aiStylistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Style Quiz Routes
router.post('/style-quiz', authenticate, aiStylistController.submitStyleQuiz);
router.get('/style-profile/:userId', authenticate, aiStylistController.updateStyleProfile);
router.put('/style-profile/:userId', authenticate, aiStylistController.updateStyleProfile);

// Outfit Recommendations
router.get('/outfit-recommendations', authenticate, aiStylistController.getOutfitRecommendations);

// Styling Sessions
router.post('/styling-session', authenticate, aiStylistController.bookStylingSession);
router.get('/styling-sessions/:userId', authenticate, aiStylistController.getStylingSessions);

// Personal Shopper
router.get('/personal-shopper', authenticate, aiStylistController.getPersonalShopperSuggestions);

export default router;
