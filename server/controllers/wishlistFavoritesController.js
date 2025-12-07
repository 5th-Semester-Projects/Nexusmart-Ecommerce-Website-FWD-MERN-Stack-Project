import WishlistFavorites from '../models/WishlistFavorites.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get user's wishlists
// @route   GET /api/v1/wishlist
// @access  Private
export const getUserWishlists = catchAsyncErrors(async (req, res, next) => {
  const wishlists = await WishlistFavorites.getUserWishlists(req.user._id);

  res.status(200).json({
    success: true,
    count: wishlists.length,
    wishlists
  });
});

// @desc    Get single wishlist
// @route   GET /api/v1/wishlist/:id
// @access  Private
export const getWishlistById = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id)
    .populate('items.product')
    .populate('user', 'name email')
    .populate('sharedWith.users', 'name email');

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user has access
  if (wishlist.user.toString() !== req.user._id.toString() &&
    wishlist.visibility !== 'public' &&
    !wishlist.sharedWith.users.some(u => u._id.toString() === req.user._id.toString())) {
    return next(new ErrorHandler('Access denied', 403));
  }

  res.status(200).json({
    success: true,
    wishlist
  });
});

// @desc    Create wishlist
// @route   POST /api/v1/wishlist
// @access  Private
export const createWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlistData = {
    user: req.user._id,
    name: req.body.name || 'My Wishlist',
    ...req.body
  };

  const wishlist = await WishlistFavorites.create(wishlistData);

  res.status(201).json({
    success: true,
    wishlist
  });
});

// @desc    Update wishlist
// @route   PUT /api/v1/wishlist/:id
// @access  Private
export const updateWishlist = catchAsyncErrors(async (req, res, next) => {
  let wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized to update this wishlist', 403));
  }

  wishlist = await WishlistFavorites.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    wishlist
  });
});

// @desc    Delete wishlist
// @route   DELETE /api/v1/wishlist/:id
// @access  Private
export const deleteWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized to delete this wishlist', 403));
  }

  await wishlist.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Wishlist deleted'
  });
});

// @desc    Add item to wishlist
// @route   POST /api/v1/wishlist/:id/items
// @access  Private
export const addItemToWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized to modify this wishlist', 403));
  }

  const { product, variant, quantity, priority, notes } = req.body;

  const item = wishlist.addItem(product, variant, quantity, priority, notes);
  await wishlist.save();

  res.status(200).json({
    success: true,
    item
  });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/v1/wishlist/:id/items/:productId
// @access  Private
export const removeItemFromWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized to modify this wishlist', 403));
  }

  wishlist.removeItem(req.params.productId);
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Item removed from wishlist'
  });
});

// @desc    Share wishlist with users
// @route   POST /api/v1/wishlist/:id/share
// @access  Private
export const shareWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized to share this wishlist', 403));
  }

  const { userIds, permissions } = req.body;

  wishlist.shareWithFriends(userIds, permissions);
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist shared',
    wishlist
  });
});

// @desc    Check price drops
// @route   GET /api/v1/wishlist/:id/price-drops
// @access  Private
export const checkPriceDrops = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  const priceDrops = await wishlist.checkPriceDrops();
  await wishlist.save();

  res.status(200).json({
    success: true,
    priceDrops
  });
});

// @desc    Enable price alerts
// @route   PUT /api/v1/wishlist/:id/price-alerts
// @access  Private
export const enablePriceAlerts = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized', 403));
  }

  const { enabled, threshold, notificationMethod } = req.body;

  wishlist.priceAlerts.enabled = enabled !== undefined ? enabled : true;
  if (threshold) wishlist.priceAlerts.threshold = threshold;
  if (notificationMethod) wishlist.priceAlerts.notificationMethod = notificationMethod;

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Price alerts updated'
  });
});

// @desc    Move items to cart
// @route   POST /api/v1/wishlist/:id/move-to-cart
// @access  Private
export const moveToCart = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized', 403));
  }

  const { productIds } = req.body;

  const result = await wishlist.moveToCart(productIds);
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Items moved to cart',
    result
  });
});

// @desc    Get public wishlists
// @route   GET /api/v1/wishlist/public
// @access  Public
export const getPublicWishlists = catchAsyncErrors(async (req, res, next) => {
  const { category, featured } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (featured === 'true') filters.featured = true;

  const wishlists = await WishlistFavorites.getPublicWishlists(filters);

  res.status(200).json({
    success: true,
    count: wishlists.length,
    wishlists
  });
});

// @desc    Get wishlist analytics
// @route   GET /api/v1/wishlist/:id/analytics
// @access  Private
export const getWishlistAnalytics = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user has access
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Access denied', 403));
  }

  res.status(200).json({
    success: true,
    analytics: wishlist.analytics
  });
});

// @desc    Update item notes
// @route   PUT /api/v1/wishlist/:id/items/:productId/notes
// @access  Private
export const updateItemNotes = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized', 403));
  }

  const item = wishlist.items.find(i => i.product.toString() === req.params.productId);

  if (!item) {
    return next(new ErrorHandler('Item not found in wishlist', 404));
  }

  item.notes = req.body.notes;
  await wishlist.save();

  res.status(200).json({
    success: true,
    item
  });
});

// @desc    Update item priority
// @route   PUT /api/v1/wishlist/:id/items/:productId/priority
// @access  Private
export const updateItemPriority = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await WishlistFavorites.findById(req.params.id);

  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  // Check if user owns wishlist
  if (wishlist.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized', 403));
  }

  const item = wishlist.items.find(i => i.product.toString() === req.params.productId);

  if (!item) {
    return next(new ErrorHandler('Item not found in wishlist', 404));
  }

  item.priority = req.body.priority;
  await wishlist.save();

  res.status(200).json({
    success: true,
    item
  });
});
