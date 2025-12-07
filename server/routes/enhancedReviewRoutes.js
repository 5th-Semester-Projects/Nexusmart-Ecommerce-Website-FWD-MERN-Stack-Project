import express from 'express';
const router = express.Router();
import { isAuthenticatedUser } from '../middleware/auth.js';
import * as enhancedReviewController from '../controllers/enhancedReviewController.js';

router.post('/create', isAuthenticatedUser, enhancedReviewController.createReview);
router.get('/product/:productId', enhancedReviewController.getProductReviews);
router.get('/product/:productId/featured', enhancedReviewController.getFeaturedReviews);
router.post('/:reviewId/vote', isAuthenticatedUser, enhancedReviewController.voteHelpful);
router.post('/:reviewId/reply', isAuthenticatedUser, enhancedReviewController.addReply);

export default router;
