import express from 'express';
import {
  createReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  markHelpful,
  addSellerResponse,
  getMyReviews,
} from '../controllers/reviewController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { uploadMultipleImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.route('/product/:productId').get(getProductReviews);
router.route('/:id').get(getReview);

// User routes
router
  .route('/')
  .post(isAuthenticatedUser, uploadMultipleImages, createReview);

router.route('/my-reviews').get(isAuthenticatedUser, getMyReviews);

router
  .route('/:id')
  .put(isAuthenticatedUser, uploadMultipleImages, updateReview)
  .delete(isAuthenticatedUser, deleteReview);

router.route('/:id/helpful').put(isAuthenticatedUser, markHelpful);

// Seller/Admin routes
router
  .route('/:id/response')
  .post(
    isAuthenticatedUser,
    authorizeRoles('admin', 'seller'),
    addSellerResponse
  );

export default router;
