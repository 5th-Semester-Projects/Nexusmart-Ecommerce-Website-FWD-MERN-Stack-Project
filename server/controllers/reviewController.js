import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Create product review
// @route   POST /api/reviews
// @access  Private
export const createReview = catchAsyncErrors(async (req, res, next) => {
  const { product, rating, title, comment, pros, cons } = req.body;

  // Check if user has purchased the product
  const order = await Order.findOne({
    user: req.user._id,
    'orderItems.product': product,
    orderStatus: 'delivered',
  });

  if (!order) {
    return next(
      new ErrorHandler('You can only review products you have purchased', 403)
    );
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user._id,
    product,
  });

  if (existingReview) {
    return next(
      new ErrorHandler('You have already reviewed this product', 400)
    );
  }

  const reviewData = {
    user: req.user._id,
    product,
    rating,
    title,
    comment,
    pros: pros ? pros.split(',').map(p => p.trim()) : [],
    cons: cons ? cons.split(',').map(c => c.trim()) : [],
    isVerifiedPurchase: true,
  };

  // Upload images if provided
  if (req.files && req.files.length > 0) {
    const imageUploadPromises = req.files.map(file =>
      uploadToCloudinary(file.path, 'reviews')
    );
    const uploadedImages = await Promise.all(imageUploadPromises);

    reviewData.images = uploadedImages.map(img => ({
      public_id: img.public_id,
      url: img.secure_url,
    }));
  }

  const review = await Review.create(reviewData);

  // Update product rating
  await updateProductRating(product);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review,
  });
});

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { product: req.params.productId };

  // Filter by rating
  if (req.query.rating) {
    query.rating = parseInt(req.query.rating);
  }

  // Filter verified purchases only
  if (req.query.verifiedOnly === 'true') {
    query.isVerifiedPurchase = true;
  }

  // Sort options
  let sortOption = { createdAt: -1 }; // Default: newest first
  if (req.query.sort === 'helpful') {
    sortOption = { helpfulCount: -1 };
  } else if (req.query.sort === 'rating-high') {
    sortOption = { rating: -1 };
  } else if (req.query.sort === 'rating-low') {
    sortOption = { rating: 1 };
  }

  const reviews = await Review.find(query)
    .populate('user', 'firstName lastName avatar')
    .populate('sellerResponse.respondedBy', 'firstName lastName')
    .sort(sortOption)
    .limit(limit)
    .skip(skip);

  const totalReviews = await Review.countDocuments(query);

  // Get rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { product: req.params.productId } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    reviews,
    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
    ratingDistribution,
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = catchAsyncErrors(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'firstName lastName avatar')
    .populate('product', 'name images')
    .populate('sellerResponse.respondedBy', 'firstName lastName');

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  res.status(200).json({
    success: true,
    review,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = catchAsyncErrors(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  // Check if user owns this review
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized to update this review', 403));
  }

  const { rating, title, comment, pros, cons } = req.body;

  const updateData = {
    rating,
    title,
    comment,
    pros: pros ? pros.split(',').map(p => p.trim()) : review.pros,
    cons: cons ? cons.split(',').map(c => c.trim()) : review.cons,
  };

  // Upload new images if provided
  if (req.files && req.files.length > 0) {
    const imageUploadPromises = req.files.map(file =>
      uploadToCloudinary(file.path, 'reviews')
    );
    const uploadedImages = await Promise.all(imageUploadPromises);

    updateData.images = [
      ...review.images,
      ...uploadedImages.map(img => ({
        public_id: img.public_id,
        url: img.secure_url,
      })),
    ];
  }

  review = await Review.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  // Update product rating
  await updateProductRating(review.product);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  // Check if user owns this review or is admin
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new ErrorHandler('Not authorized to delete this review', 403));
  }

  const productId = review.product;

  await review.deleteOne();

  // Update product rating
  await updateProductRating(productId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
export const markHelpful = catchAsyncErrors(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  // Check if user already marked this review as helpful
  const alreadyMarked = review.helpfulBy.includes(req.user._id);

  if (alreadyMarked) {
    // Remove helpful mark
    review.helpfulBy = review.helpfulBy.filter(
      id => id.toString() !== req.user._id.toString()
    );
    review.helpfulCount = review.helpfulBy.length;
  } else {
    // Add helpful mark
    review.helpfulBy.push(req.user._id);
    review.helpfulCount = review.helpfulBy.length;
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: alreadyMarked ? 'Helpful mark removed' : 'Marked as helpful',
    helpfulCount: review.helpfulCount,
  });
});

// @desc    Add seller response
// @route   POST /api/reviews/:id/response
// @access  Private/Admin/Seller
export const addSellerResponse = catchAsyncErrors(async (req, res, next) => {
  const { response } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorHandler('Review not found', 404));
  }

  if (review.sellerResponse) {
    return next(new ErrorHandler('Seller has already responded', 400));
  }

  review.sellerResponse = {
    response,
    respondedBy: req.user._id,
    respondedAt: Date.now(),
  };

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Response added successfully',
    review,
  });
});

// @desc    Get user reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ user: req.user._id })
    .populate('product', 'name images price')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalReviews = await Review.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    reviews,
    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
  });
});

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });

  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings: 0,
      numOfReviews: 0,
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = totalRating / reviews.length;

  // Calculate rating breakdown
  const ratingBreakdown = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  await Product.findByIdAndUpdate(productId, {
    ratings: avgRating.toFixed(1),
    numOfReviews: reviews.length,
    ratingBreakdown,
  });
}
