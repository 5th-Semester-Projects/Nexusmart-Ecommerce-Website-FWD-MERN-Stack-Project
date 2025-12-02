import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Get all public coupons
export const getPublicCoupons = catchAsyncErrors(async (req, res) => {
  const coupons = await Coupon.findPublicCoupons();

  res.status(200).json({
    success: true,
    coupons,
  });
});

// Get available coupons for user
export const getAvailableCoupons = catchAsyncErrors(async (req, res) => {
  const userId = req.user?._id;
  const now = new Date();

  const coupons = await Coupon.find({
    isActive: true,
    isPublic: true,
    startDate: { $lte: now },
    expiresAt: { $gt: now },
  });

  // Filter out coupons user has already used (if logged in)
  let availableCoupons = coupons;
  if (userId) {
    availableCoupons = coupons.filter(coupon => {
      const userUsage = coupon.usedBy.filter(u => u.user.toString() === userId.toString()).length;
      return userUsage < coupon.userUsageLimit;
    });
  }

  res.status(200).json({
    success: true,
    coupons: availableCoupons,
  });
});

// Validate coupon
export const validateCoupon = catchAsyncErrors(async (req, res, next) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    return next(new ErrorHandler('Please provide a coupon code', 400));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return next(new ErrorHandler('Invalid coupon code', 404));
  }

  // Get user's order count for first order check
  let userOrderCount = 0;
  if (req.user) {
    userOrderCount = await Order.countDocuments({ user: req.user._id });
  }

  // Check validity
  const validity = coupon.isValid(req.user?._id, cartTotal, userOrderCount);
  if (!validity.valid) {
    return next(new ErrorHandler(validity.message, 400));
  }

  // Calculate discount
  const discount = coupon.calculateDiscount(cartTotal);

  res.status(200).json({
    success: true,
    valid: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
    },
    discount,
    newTotal: cartTotal - discount,
  });
});

// Apply coupon to order (internal use)
export const applyCoupon = async (code, userId, orderId) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (coupon) {
    await coupon.recordUsage(userId, orderId);
  }
};

// Admin: Create coupon
export const createCoupon = catchAsyncErrors(async (req, res, next) => {
  const couponData = {
    ...req.body,
    createdBy: req.user._id,
  };

  const coupon = await Coupon.create(couponData);

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    coupon,
  });
});

// Admin: Get all coupons
export const getAllCoupons = catchAsyncErrors(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const skip = (page - 1) * limit;

  const query = {};

  if (status === 'active') {
    query.isActive = true;
    query.expiresAt = { $gt: new Date() };
  } else if (status === 'expired') {
    query.expiresAt = { $lt: new Date() };
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  if (search) {
    query.code = { $regex: search, $options: 'i' };
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Coupon.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    coupons,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Admin: Update coupon
export const updateCoupon = catchAsyncErrors(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorHandler('Coupon not found', 404));
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    coupon,
  });
});

// Admin: Delete coupon
export const deleteCoupon = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorHandler('Coupon not found', 404));
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

// Admin: Get coupon stats
export const getCouponStats = catchAsyncErrors(async (req, res) => {
  const now = new Date();

  const [
    totalCoupons,
    activeCoupons,
    expiredCoupons,
    totalUsage,
    totalDiscount,
  ] = await Promise.all([
    Coupon.countDocuments(),
    Coupon.countDocuments({ isActive: true, expiresAt: { $gt: now } }),
    Coupon.countDocuments({ expiresAt: { $lt: now } }),
    Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } },
    ]),
    Order.aggregate([
      { $match: { 'coupon.discount': { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$coupon.discount' } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage: totalUsage[0]?.total || 0,
      totalDiscount: totalDiscount[0]?.total || 0,
    },
  });
});