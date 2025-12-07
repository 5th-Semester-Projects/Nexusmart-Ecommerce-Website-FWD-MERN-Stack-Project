import express from 'express';
import {
  createLiveStream,
  startLiveStream,
  endLiveStream,
  getLiveStreams,
  joinLiveStream,
  sendStreamMessage,
  createFlashSale,
  createGroupBuy,
  joinGroupBuy,
  getGroupBuys,
  getGroupBuyDetails,
  uploadVideoReview,
  getVideoReviews,
  moderateVideoReview,
  generateShareLink
} from '../controllers/socialCommerceController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * Social Commerce Routes
 * Handles live shopping, group buying, video reviews, and social sharing
 */

// Live Shopping Routes
router.post('/live/create', isAuthenticated, createLiveStream);
router.put('/live/:streamId/start', isAuthenticated, startLiveStream);
router.put('/live/:streamId/end', isAuthenticated, endLiveStream);
router.get('/live', getLiveStreams);
router.get('/live/:streamId/join', joinLiveStream);
router.post('/live/:streamId/message', isAuthenticated, sendStreamMessage);
router.post('/live/:streamId/flash-sale', isAuthenticated, createFlashSale);

// Group Buying Routes
router.post('/group-buy/create', isAuthenticated, createGroupBuy);
router.post('/group-buy/:inviteCode/join', isAuthenticated, joinGroupBuy);
router.get('/group-buy', getGroupBuys);
router.get('/group-buy/:inviteCode', getGroupBuyDetails);

// Video Reviews Routes
router.post('/video-review', isAuthenticated, upload.single('video'), uploadVideoReview);
router.get('/video-reviews', getVideoReviews);
router.put('/video-review/:reviewId/moderate', isAuthenticated, isAdmin, moderateVideoReview);

// Social Sharing Routes
router.post('/share', generateShareLink);

export default router;
