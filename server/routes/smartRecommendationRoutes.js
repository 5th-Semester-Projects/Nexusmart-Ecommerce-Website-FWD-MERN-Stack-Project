import express from 'express';
const router = express.Router();
import { isAuthenticatedUser } from '../middleware/auth.js';
import * as smartRecommendationController from '../controllers/smartRecommendationController.js';

router.get('/personalized', isAuthenticatedUser, smartRecommendationController.getPersonalizedRecommendations);
router.get('/trending', smartRecommendationController.getTrendingProducts);
router.post('/create', isAuthenticatedUser, smartRecommendationController.createRecommendation);
router.put('/:recommendationId/performance', isAuthenticatedUser, smartRecommendationController.updatePerformance);

export default router;
