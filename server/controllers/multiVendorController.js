import MultiVendor from '../models/MultiVendor.js';
import Product from '../models/Product.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Multi-Vendor Controllers

export const registerSeller = catchAsyncErrors(async (req, res, next) => {
  const { businessInfo, contact, bankDetails } = req.body;

  // Check if seller already exists
  const existingSeller = await MultiVendor.findOne({ seller: req.user.id });

  if (existingSeller) {
    return next(new ErrorHandler('Seller account already exists', 400));
  }

  const vendor = await MultiVendor.create({
    seller: req.user.id,
    businessInfo,
    contact,
    bankDetails,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Seller registration submitted for review',
    data: vendor
  });
});

export const getSellerProfile = catchAsyncErrors(async (req, res, next) => {
  const { sellerId } = req.params;

  const vendor = await MultiVendor.findById(sellerId)
    .populate('seller', 'name email')
    .populate('products');

  if (!vendor) {
    return next(new ErrorHandler('Seller not found', 404));
  }

  res.status(200).json({
    success: true,
    data: vendor
  });
});

export const updateSellerProfile = catchAsyncErrors(async (req, res, next) => {
  const updates = req.body;

  const vendor = await MultiVendor.findOne({ seller: req.user.id });

  if (!vendor) {
    return next(new ErrorHandler('Seller account not found', 404));
  }

  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      vendor[key] = updates[key];
    }
  });

  await vendor.save();

  res.status(200).json({
    success: true,
    data: vendor
  });
});

export const addSellerProduct = catchAsyncErrors(async (req, res, next) => {
  const productData = req.body;

  const vendor = await MultiVendor.findOne({ seller: req.user.id });

  if (!vendor) {
    return next(new ErrorHandler('Seller account not found', 404));
  }

  if (vendor.status !== 'active') {
    return next(new ErrorHandler('Seller account not active', 403));
  }

  const product = await Product.create({
    ...productData,
    seller: vendor._id
  });

  vendor.products.push(product._id);
  await vendor.save();

  res.status(201).json({
    success: true,
    data: product
  });
});

export const getSellerProducts = catchAsyncErrors(async (req, res, next) => {
  const vendor = await MultiVendor.findOne({ seller: req.user.id })
    .populate('products');

  if (!vendor) {
    return next(new ErrorHandler('Seller account not found', 404));
  }

  res.status(200).json({
    success: true,
    count: vendor.products.length,
    data: vendor.products
  });
});

export const getSellerAnalytics = catchAsyncErrors(async (req, res, next) => {
  const vendor = await MultiVendor.findOne({ seller: req.user.id });

  if (!vendor) {
    return next(new ErrorHandler('Seller account not found', 404));
  }

  const analytics = {
    performance: vendor.performance,
    ratings: vendor.ratings,
    recentPayouts: vendor.payouts.slice(-5),
    topProducts: [], // Could be calculated
    salesTrend: [] // Could be calculated
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const requestPayout = catchAsyncErrors(async (req, res, next) => {
  const { amount, period } = req.body;

  const vendor = await MultiVendor.findOne({ seller: req.user.id });

  if (!vendor) {
    return next(new ErrorHandler('Seller account not found', 404));
  }

  // Check available balance
  const pendingAmount = vendor.payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = vendor.performance.totalRevenue - vendor.performance.commissionEarned - pendingAmount;

  if (amount > availableBalance) {
    return next(new ErrorHandler('Insufficient balance', 400));
  }

  vendor.payouts.push({
    amount,
    period: period || { start: new Date(), end: new Date() },
    status: 'pending'
  });

  await vendor.save();

  res.status(200).json({
    success: true,
    message: 'Payout request submitted'
  });
});

export const approveSeller = catchAsyncErrors(async (req, res, next) => {
  const { vendorId } = req.params;

  const vendor = await MultiVendor.findById(vendorId);

  if (!vendor) {
    return next(new ErrorHandler('Seller not found', 404));
  }

  vendor.status = 'active';
  vendor.verification.isVerified = true;
  vendor.verification.verifiedAt = Date.now();

  await vendor.save();

  res.status(200).json({
    success: true,
    message: 'Seller approved',
    data: vendor
  });
});

export const getAllSellers = catchAsyncErrors(async (req, res, next) => {
  const { status, minRating } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (minRating) filter['ratings.average'] = { $gte: parseFloat(minRating) };

  const vendors = await MultiVendor.find(filter)
    .populate('seller', 'name email')
    .sort('-ratings.average');

  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  });
});

export const rateVendor = catchAsyncErrors(async (req, res, next) => {
  const { vendorId } = req.params;
  const { rating } = req.body;

  if (rating < 1 || rating > 5) {
    return next(new ErrorHandler('Rating must be between 1 and 5', 400));
  }

  const vendor = await MultiVendor.findById(vendorId);

  if (!vendor) {
    return next(new ErrorHandler('Seller not found', 404));
  }

  // Update ratings
  vendor.ratings.distribution[rating] += 1;
  vendor.ratings.count += 1;

  const totalPoints = Object.keys(vendor.ratings.distribution).reduce((sum, star) => {
    return sum + (parseInt(star) * vendor.ratings.distribution[star]);
  }, 0);

  vendor.ratings.average = totalPoints / vendor.ratings.count;

  await vendor.save();

  res.status(200).json({
    success: true,
    data: vendor.ratings
  });
});
