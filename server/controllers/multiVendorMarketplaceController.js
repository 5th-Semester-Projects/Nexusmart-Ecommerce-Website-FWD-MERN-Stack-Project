import MultiVendorMarketplace from '../models/MultiVendorMarketplace.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';

// Create vendor store
export const createStore = catchAsyncErrors(async (req, res) => {
  const store = await MultiVendorMarketplace.create({
    ...req.body,
    vendor: req.user._id
  });

  res.status(201).json({
    success: true,
    store
  });
});

// Get vendor store
export const getStore = catchAsyncErrors(async (req, res) => {
  const { slug } = req.params;

  const store = await MultiVendorMarketplace.findOne({
    'storeSettings.storeSlug': slug,
    status: 'active'
  }).populate('vendor', 'name email');

  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'Store not found'
    });
  }

  res.status(200).json({
    success: true,
    store
  });
});

// Update store
export const updateStore = catchAsyncErrors(async (req, res) => {
  const store = await MultiVendorMarketplace.findOneAndUpdate(
    { vendor: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'Store not found'
    });
  }

  res.status(200).json({
    success: true,
    store
  });
});

// Update rating
export const updateRating = catchAsyncErrors(async (req, res) => {
  const { storeId } = req.params;
  const { rating } = req.body;

  const store = await MultiVendorMarketplace.findById(storeId);

  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'Store not found'
    });
  }

  store.updateRating(rating);
  await store.save();

  res.status(200).json({
    success: true,
    message: 'Rating updated'
  });
});

// Request payout
export const requestPayout = catchAsyncErrors(async (req, res) => {
  const { amount } = req.body;

  const store = await MultiVendorMarketplace.findOne({ vendor: req.user._id });

  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'Store not found'
    });
  }

  if (store.financialTracking.balance.available < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance'
    });
  }

  await store.requestPayout(amount);
  await store.save();

  res.status(200).json({
    success: true,
    message: 'Payout requested successfully'
  });
});

// Get top vendors
export const getTopVendors = catchAsyncErrors(async (req, res) => {
  const { limit = 10 } = req.query;

  const vendors = await MultiVendorMarketplace.getTopVendors(parseInt(limit));

  res.status(200).json({
    success: true,
    vendors
  });
});
