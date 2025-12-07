import express from 'express';
const router = express.Router();
import { isAuthenticatedUser } from '../middleware/auth.js';
import * as socialShoppingController from '../controllers/socialShoppingController.js';

router.post('/create', isAuthenticatedUser, socialShoppingController.createPost);
router.get('/feed', isAuthenticatedUser, socialShoppingController.getUserFeed);
router.get('/trending', socialShoppingController.getTrendingPosts);
router.get('/:postId', socialShoppingController.getPost);
router.post('/:postId/like', isAuthenticatedUser, socialShoppingController.toggleLike);
router.post('/:postId/save', isAuthenticatedUser, socialShoppingController.toggleSave);
router.post('/:postId/comment', isAuthenticatedUser, socialShoppingController.addComment);

export default router;
