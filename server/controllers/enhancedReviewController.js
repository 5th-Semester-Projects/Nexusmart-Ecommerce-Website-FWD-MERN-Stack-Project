import EnhancedReview from '../models/EnhancedReview.js';
import { Product } from '../models/Product.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';

// Create enhanced review
export const createReview = catchAsyncErrors(async (req, res) => {
  const review = await EnhancedReview.create({
    ...req.body,
    user: req.user._id,
    userProfile: {
      displayName: req.user.name,
      avatar: req.user.avatar
    }
  });

  await review.populate('product user');

  res.status(201).json({
    success: true,
    review
  });
});

// Get product reviews
export const getProductReviews = catchAsyncErrors(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = 'helpful' } = req.query;

  const query = {
    product: productId,
    status: 'approved',
    'visibility.isPublic': true
  };

  let sortOption = {};
  if (sort === 'helpful') {
    sortOption = { 'engagement.helpfulVotes': -1 };
  } else if (sort === 'recent') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'rating_high') {
    sortOption = { 'ratings.overall': -1 };
  } else if (sort === 'rating_low') {
    sortOption = { 'ratings.overall': 1 };
  }

  const reviews = await EnhancedReview.find(query)
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'name avatar');

  const count = await EnhancedReview.countDocuments(query);

  res.status(200).json({
    success: true,
    reviews,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

// Vote helpful
export const voteHelpful = catchAsyncErrors(async (req, res) => {
  const { reviewId } = req.params;
  const { helpful } = req.body;

  const review = await EnhancedReview.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  review.voteHelpful(req.user._id, helpful);
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Vote recorded successfully'
  });
});

// Add reply
export const addReply = catchAsyncErrors(async (req, res) => {
  const { reviewId } = req.params;
  const { content } = req.body;

  const review = await EnhancedReview.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  const userType = req.user.role === 'admin' ? 'admin' : 'customer';
  review.addReply(req.user._id, userType, content);
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Reply added successfully'
  });
});

// Get featured reviews
export const getFeaturedReviews = catchAsyncErrors(async (req, res) => {
  const { productId } = req.params;
  const { limit = 5 } = req.query;

  const reviews = await EnhancedReview.getFeaturedReviews(productId, parseInt(limit));

  res.status(200).json({
    success: true,
    reviews
  });
});

module.exports = exports;
