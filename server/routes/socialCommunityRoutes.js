import express from 'express';
import {
  askQuestion,
  answerQuestion,
  voteAnswer,
  getProductQuestions,
  createInfluencerProfile,
  searchInfluencers,
  createCampaignProposal,
  createGroupBuy,
  joinGroupBuy,
  getActiveGroupBuys,
  createSharedWishlist,
  voteWishlistItem,
  purchaseWishlistItem,
  getSharedWishlist
} from '../controllers/socialCommunityController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Community Q&A
router.post('/qa/ask', isAuthenticatedUser, askQuestion);
router.post('/qa/answer/:questionId', isAuthenticatedUser, answerQuestion);
router.post('/qa/vote', isAuthenticatedUser, voteAnswer);
router.get('/qa/product/:productId', getProductQuestions);

// Influencer Marketplace
router.post('/influencer/create', isAuthenticatedUser, createInfluencerProfile);
router.get('/influencer/search', searchInfluencers);
router.post('/influencer/campaign/:influencerId', isAuthenticatedUser, authorizeRoles('seller', 'business'), createCampaignProposal);

// Group Buying
router.post('/group-buy/create', isAuthenticatedUser, createGroupBuy);
router.post('/group-buy/join/:groupBuyId', isAuthenticatedUser, joinGroupBuy);
router.get('/group-buy/active', getActiveGroupBuys);

// Wishlist Sharing
router.post('/wishlist/create', isAuthenticatedUser, createSharedWishlist);
router.post('/wishlist/:wishlistId/vote/:itemId', isAuthenticatedUser, voteWishlistItem);
router.post('/wishlist/:wishlistId/purchase/:itemId', isAuthenticatedUser, purchaseWishlistItem);
router.get('/wishlist/shared/:shareUrl', getSharedWishlist);

export default router;
