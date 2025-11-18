import Product from '../models/Product.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

/**
 * Create new product
 * @route POST /api/products
 * @access Private/Admin/Seller
 */
export const createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];
  let videos = [];
  let model3D = null;

  // Handle file uploads
  if (req.files) {
    if (req.files.images) {
      const imageUploads = await uploadMultipleToCloudinary(
        req.files.images,
        'products/images',
        'image'
      );
      images = imageUploads.map((upload, index) => ({
        public_id: upload.public_id,
        url: upload.secure_url,
        isPrimary: index === 0,
      }));
    }

    if (req.files.videos) {
      const videoUploads = await uploadMultipleToCloudinary(
        req.files.videos,
        'products/videos',
        'video'
      );
      videos = videoUploads.map(upload => ({
        public_id: upload.public_id,
        url: upload.secure_url,
        thumbnail: upload.eager ? upload.eager[0].secure_url : null,
        duration: upload.duration,
      }));
    }

    if (req.files.model3D && req.files.model3D[0]) {
      const modelUpload = await uploadToCloudinary(
        req.files.model3D[0].buffer,
        'products/3d-models',
        'raw'
      );
      model3D = {
        fileUrl: modelUpload.secure_url,
        format: req.files.model3D[0].originalname.split('.').pop(),
        size: req.files.model3D[0].size,
      };
    }
  }

  // Create product data
  const productData = {
    ...req.body,
    images,
    videos,
    model3D,
    seller: req.user._id,
    sellerInfo: {
      name: `${req.user.firstName} ${req.user.lastName}`,
    },
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product,
  });
});

/**
 * Get all products with filters, search, and pagination
 * @route GET /api/products
 * @access Public
 */
export const getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build query
  const query = { status: 'active', isPublished: true };

  // Search by keyword
  if (req.query.keyword) {
    query.$text = { $search: req.query.keyword };
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Filter by rating
  if (req.query.minRating) {
    query.ratings = { $gte: Number(req.query.minRating) };
  }

  // Filter by brand
  if (req.query.brand) {
    query.brand = req.query.brand;
  }

  // Filter by tags
  if (req.query.tags) {
    query.tags = { $in: req.query.tags.split(',') };
  }

  // Filter by features
  if (req.query.featured === 'true') {
    query.featured = true;
  }

  if (req.query.newArrival === 'true') {
    query.newArrival = true;
  }

  if (req.query.bestSeller === 'true') {
    query.bestSeller = true;
  }

  // Sorting
  let sort = {};
  if (req.query.sort) {
    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { ratings: -1 },
      newest: { createdAt: -1 },
      popular: { purchases: -1, views: -1 },
      trending: { trendingScore: -1 },
    };
    sort = sortOptions[req.query.sort] || { createdAt: -1 };
  } else {
    sort = { createdAt: -1 };
  }

  // Execute query
  const products = await Product.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('category', 'name slug')
    .populate('seller', 'firstName lastName email');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      limit,
    },
  });
});

/**
 * Get single product by ID or slug
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = catchAsyncErrors(async (req, res, next) => {
  let product;

  // Check if ID is MongoDB ObjectId or slug
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName email avatar')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar',
        },
      });
  } else {
    product = await Product.findOne({ 'seo.slug': req.params.id })
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName email avatar')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar',
        },
      });
  }

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Increment views
  await product.incrementViews();

  res.status(200).json({
    success: true,
    product,
  });
});

/**
 * Update product
 * @route PUT /api/products/:id
 * @access Private/Admin/Seller
 */
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check authorization
  if (
    req.user.role !== 'admin' &&
    product.seller.toString() !== req.user._id.toString()
  ) {
    return next(
      new ErrorHandler('You are not authorized to update this product', 403)
    );
  }

  // Handle file uploads if present
  if (req.files) {
    if (req.files.images) {
      const imageUploads = await uploadMultipleToCloudinary(
        req.files.images,
        'products/images',
        'image'
      );
      const newImages = imageUploads.map(upload => ({
        public_id: upload.public_id,
        url: upload.secure_url,
      }));
      req.body.images = [...(product.images || []), ...newImages];
    }

    if (req.files.videos) {
      const videoUploads = await uploadMultipleToCloudinary(
        req.files.videos,
        'products/videos',
        'video'
      );
      const newVideos = videoUploads.map(upload => ({
        public_id: upload.public_id,
        url: upload.secure_url,
      }));
      req.body.videos = [...(product.videos || []), ...newVideos];
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product,
  });
});

/**
 * Delete product
 * @route DELETE /api/products/:id
 * @access Private/Admin/Seller
 */
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check authorization
  if (
    req.user.role !== 'admin' &&
    product.seller.toString() !== req.user._id.toString()
  ) {
    return next(
      new ErrorHandler('You are not authorized to delete this product', 403)
    );
  }

  // Delete images from cloudinary
  for (const image of product.images) {
    await deleteFromCloudinary(image.public_id);
  }

  // Delete videos from cloudinary
  for (const video of product.videos) {
    await deleteFromCloudinary(video.public_id, 'video');
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

/**
 * Get trending products
 * @route GET /api/products/trending
 * @access Public
 */
export const getTrendingProducts = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await Product.getTrending(limit);

  res.status(200).json({
    success: true,
    products,
  });
});

/**
 * Get new arrivals
 * @route GET /api/products/new-arrivals
 * @access Public
 */
export const getNewArrivals = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await Product.getNewArrivals(limit);

  res.status(200).json({
    success: true,
    products,
  });
});

/**
 * Get similar products based on AI
 * @route GET /api/products/:id/similar
 * @access Public
 */
export const getSimilarProducts = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Find similar products based on category, tags, and price range
  const similarProducts = await Product.find({
    _id: { $ne: product._id },
    status: 'active',
    isPublished: true,
    $or: [
      { category: product.category },
      { tags: { $in: product.tags } },
      {
        price: {
          $gte: product.price * 0.7,
          $lte: product.price * 1.3,
        },
      },
    ],
  })
    .limit(8)
    .populate('category', 'name slug');

  res.status(200).json({
    success: true,
    products: similarProducts,
  });
});

/**
 * Search products with NLP
 * @route POST /api/products/search
 * @access Public
 */
export const searchProducts = catchAsyncErrors(async (req, res, next) => {
  const { query: searchQuery } = req.body;

  if (!searchQuery) {
    return next(new ErrorHandler('Search query is required', 400));
  }

  // Extract filters from natural language
  // Example: "red sneakers under $50" -> color: red, category: sneakers, price: <50
  // This is a simplified version. In production, use NLP libraries like natural or compromise

  const products = await Product.find({
    $text: { $search: searchQuery },
    status: 'active',
    isPublished: true,
  })
    .limit(20)
    .populate('category', 'name slug');

  res.status(200).json({
    success: true,
    products,
    count: products.length,
  });
});

/**
 * Get product recommendations for user
 * @route GET /api/products/recommendations
 * @access Private
 */
export const getRecommendations = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  // Get user's browsing history, wishlist, and preferences
  const favoriteCategories = user.styleProfile?.favoriteCategories || [];
  const browsedProducts = user.browsingHistory?.map(item => item.product) || [];

  // Build recommendation query
  const query = {
    status: 'active',
    isPublished: true,
    _id: { $nin: browsedProducts },
  };

  if (favoriteCategories.length > 0) {
    query.category = { $in: favoriteCategories };
  }

  const recommendedProducts = await Product.find(query)
    .sort({ aiRecommendationScore: -1, ratings: -1 })
    .limit(12)
    .populate('category', 'name slug');

  res.status(200).json({
    success: true,
    products: recommendedProducts,
  });
});

/**
 * Get admin product statistics
 * @route GET /api/products/admin/stats
 * @access Private/Admin
 */
export const getProductStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $facet: {
        totalProducts: [{ $count: 'count' }],
        activeProducts: [
          { $match: { status: 'active' } },
          { $count: 'count' },
        ],
        outOfStock: [
          { $match: { status: 'out-of-stock' } },
          { $count: 'count' },
        ],
        lowStock: [
          { $match: { $expr: { $lte: ['$stock', '$lowStockThreshold'] } } },
          { $count: 'count' },
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        priceRange: [
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' },
              avgPrice: { $avg: '$price' },
            },
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    stats: stats[0],
  });
});
