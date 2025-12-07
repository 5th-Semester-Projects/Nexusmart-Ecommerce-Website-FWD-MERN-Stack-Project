import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { Seller, Payout } from '../models/Seller.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

/**
 * Multi-Vendor Seller Controller
 */

// Register as seller
export const registerSeller = catchAsyncErrors(async (req, res, next) => {
  const {
    storeName,
    storeDescription,
    businessType,
    businessName,
    businessAddress,
    taxId,
    bankDetails
  } = req.body;

  // Check if user is already a seller
  const existingSeller = await Seller.findOne({ user: req.user._id });
  if (existingSeller) {
    return next(new ErrorHandler('You are already registered as a seller', 400));
  }

  // Check if store name is taken
  const storeExists = await Seller.findOne({ storeName });
  if (storeExists) {
    return next(new ErrorHandler('Store name is already taken', 400));
  }

  const seller = await Seller.create({
    user: req.user._id,
    storeName,
    storeDescription,
    businessType,
    businessName,
    businessAddress,
    taxId,
    bankDetails,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Seller registration submitted. Awaiting approval.',
    seller
  });
});

// Get seller profile
export const getSellerProfile = catchAsyncErrors(async (req, res, next) => {
  const seller = await Seller.findOne({ user: req.user._id })
    .populate('user', 'name email');

  if (!seller) {
    return next(new ErrorHandler('Seller profile not found', 404));
  }

  res.status(200).json({
    success: true,
    seller
  });
});

// Update seller profile
export const updateSellerProfile = catchAsyncErrors(async (req, res, next) => {
  const updates = {
    storeDescription: req.body.storeDescription,
    storeLogo: req.body.storeLogo,
    storeBanner: req.body.storeBanner,
    businessAddress: req.body.businessAddress,
    contactEmail: req.body.contactEmail,
    contactPhone: req.body.contactPhone,
    socialLinks: req.body.socialLinks,
    shippingPolicy: req.body.shippingPolicy,
    returnPolicy: req.body.returnPolicy
  };

  // Remove undefined fields
  Object.keys(updates).forEach(key =>
    updates[key] === undefined && delete updates[key]
  );

  const seller = await Seller.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!seller) {
    return next(new ErrorHandler('Seller profile not found', 404));
  }

  res.status(200).json({
    success: true,
    seller
  });
});

// Get seller dashboard stats
export const getSellerStats = catchAsyncErrors(async (req, res, next) => {
  const seller = await Seller.findOne({ user: req.user._id });

  if (!seller) {
    return next(new ErrorHandler('Seller profile not found', 404));
  }

  // Get products count
  const totalProducts = await Product.countDocuments({ seller: seller._id });
  const activeProducts = await Product.countDocuments({ seller: seller._id, status: 'active' });

  // Get orders
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const recentOrders = await Order.aggregate([
    {
      $match: {
        'items.seller': seller._id,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    { $unwind: '$items' },
    { $match: { 'items.seller': seller._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    }
  ]);

  const stats = recentOrders[0] || { totalOrders: 0, totalRevenue: 0 };

  res.status(200).json({
    success: true,
    stats: {
      totalProducts,
      activeProducts,
      recentOrders: stats.totalOrders,
      recentRevenue: stats.totalRevenue,
      rating: seller.rating,
      totalSales: seller.totalSales,
      totalRevenue: seller.totalRevenue,
      currentBalance: seller.balance
    }
  });
});

// Get seller's products
export const getSellerProducts = catchAsyncErrors(async (req, res, next) => {
  const seller = await Seller.findOne({ user: req.user._id });

  if (!seller) {
    return next(new ErrorHandler('Seller profile not found', 404));
  }

  const { page = 1, limit = 20, status } = req.query;

  const query = { seller: seller._id };
  if (status) query.status = status;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    products,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get seller's orders
export const getSellerOrders = catchAsyncErrors(async (req, res, next) => {
  const seller = await Seller.findOne({ user: req.user._id });

  if (!seller) {
    return next(new ErrorHandler('Seller profile not found', 404));
  }

  const { page = 1, limit = 20, status } = req.query;

  const matchStage = { 'items.seller': seller._id };
  if (status) matchStage.orderStatus = status;

  const orders = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.seller': seller._id } },
    {
      $group: {
        _id: '$_id',
        orderId: { $first: '$orderId' },
        user: { $first: '$user' },
        items: { $push: '$items' },
        orderStatus: { $first: '$orderStatus' },
        createdAt: { $first: '$createdAt' }
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) }
  ]);

  res.status(200).json({
    success: true,
    orders
  });
});

// Request payout
export const requestPayout = catchAsyncErrors(async (req, res, next) => {
  const { amount, paymentMethod } = req.body;

  const seller = await Seller.findOne({ user: req.user._id });

  if (!seller) {
    return next(new ErrorHandler('Seller profile not found', 404));
  }

  if (amount > seller.balance) {
    return next(new ErrorHandler('Insufficient balance', 400));
  }

  if (amount < 50) {
    return next(new ErrorHandler('Minimum payout amount is $50', 400));
  }

  const payout = await Payout.create({
    seller: seller._id,
    amount,
    paymentMethod: paymentMethod || seller.bankDetails,
    status: 'pending'
  });

  // Deduct from balance
  seller.balance -= amount;
  await seller.save();

  res.status(201).json({
    success: true,
    message: 'Payout request submitted',
    payout
  });
});

// Get payout history
export const getPayoutHistory = catchAsyncErrors(async (req, res, next) => {
  const seller = await Seller.findOne({ user: req.user._id });

  if (!seller) {
    return next(new ErrorHandler('Seller profile not found', 404));
  }

  const payouts = await Payout.find({ seller: seller._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    payouts
  });
});

// Admin: Get all sellers
export const getAllSellers = catchAsyncErrors(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const total = await Seller.countDocuments(query);
  const sellers = await Seller.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    sellers,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Admin: Approve seller
export const approveSeller = catchAsyncErrors(async (req, res, next) => {
  const seller = await Seller.findById(req.params.id);

  if (!seller) {
    return next(new ErrorHandler('Seller not found', 404));
  }

  seller.status = 'approved';
  seller.approvedAt = new Date();
  seller.approvedBy = req.user._id;

  await seller.save();

  res.status(200).json({
    success: true,
    message: 'Seller approved successfully',
    seller
  });
});

// Admin: Reject seller
export const rejectSeller = catchAsyncErrors(async (req, res, next) => {
  const { reason } = req.body;

  const seller = await Seller.findById(req.params.id);

  if (!seller) {
    return next(new ErrorHandler('Seller not found', 404));
  }

  seller.status = 'rejected';
  seller.rejectionReason = reason;

  await seller.save();

  res.status(200).json({
    success: true,
    message: 'Seller rejected',
    seller
  });
});

// Admin: Suspend seller
export const suspendSeller = catchAsyncErrors(async (req, res, next) => {
  const { reason } = req.body;

  const seller = await Seller.findById(req.params.id);

  if (!seller) {
    return next(new ErrorHandler('Seller not found', 404));
  }

  seller.status = 'suspended';
  seller.suspensionReason = reason;
  seller.suspendedAt = new Date();

  await seller.save();

  // Deactivate all seller products
  await Product.updateMany(
    { seller: seller._id },
    { status: 'suspended' }
  );

  res.status(200).json({
    success: true,
    message: 'Seller suspended',
    seller
  });
});

// Admin: Process payout
export const processPayout = catchAsyncErrors(async (req, res, next) => {
  const { transactionId } = req.body;

  const payout = await Payout.findById(req.params.id);

  if (!payout) {
    return next(new ErrorHandler('Payout not found', 404));
  }

  payout.status = 'completed';
  payout.processedAt = new Date();
  payout.transactionId = transactionId;
  payout.processedBy = req.user._id;

  await payout.save();

  res.status(200).json({
    success: true,
    message: 'Payout processed',
    payout
  });
});

// Public: Get store details
export const getStoreDetails = catchAsyncErrors(async (req, res, next) => {
  const seller = await Seller.findOne({
    storeName: req.params.storeName,
    status: 'approved'
  }).select('-bankDetails -taxId -balance');

  if (!seller) {
    return next(new ErrorHandler('Store not found', 404));
  }

  const products = await Product.find({
    seller: seller._id,
    status: 'active'
  })
    .limit(20)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    store: seller,
    products
  });
});
