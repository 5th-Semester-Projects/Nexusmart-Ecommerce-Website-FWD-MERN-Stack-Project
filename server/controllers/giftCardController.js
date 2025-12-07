import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { GiftCard, GiftWrap } from '../models/GiftCard.js';
import crypto from 'crypto';

/**
 * Gift Card Controller
 */

// Generate unique gift card code
const generateGiftCardCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Purchase a gift card
export const purchaseGiftCard = catchAsyncErrors(async (req, res, next) => {
  const {
    amount,
    recipientEmail,
    recipientName,
    senderName,
    message,
    deliveryDate,
    design
  } = req.body;

  if (amount < 10 || amount > 1000) {
    return next(new ErrorHandler('Gift card amount must be between $10 and $1000', 400));
  }

  const giftCard = await GiftCard.create({
    code: generateGiftCardCode(),
    purchaser: req.user._id,
    initialBalance: amount,
    currentBalance: amount,
    recipientEmail,
    recipientName,
    senderName: senderName || req.user.name,
    message,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
    design,
    status: 'active',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  });

  // TODO: Send gift card email to recipient

  res.status(201).json({
    success: true,
    message: 'Gift card purchased successfully',
    giftCard: {
      code: giftCard.code,
      balance: giftCard.currentBalance,
      expiresAt: giftCard.expiresAt
    }
  });
});

// Check gift card balance
export const checkBalance = catchAsyncErrors(async (req, res, next) => {
  const { code, pin } = req.body;

  const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    return next(new ErrorHandler('Invalid gift card code', 404));
  }

  if (giftCard.pin && giftCard.pin !== pin) {
    return next(new ErrorHandler('Invalid PIN', 400));
  }

  if (giftCard.status !== 'active') {
    return next(new ErrorHandler(`Gift card is ${giftCard.status}`, 400));
  }

  if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
    return next(new ErrorHandler('Gift card has expired', 400));
  }

  res.status(200).json({
    success: true,
    balance: giftCard.currentBalance,
    expiresAt: giftCard.expiresAt,
    status: giftCard.status
  });
});

// Redeem gift card
export const redeemGiftCard = catchAsyncErrors(async (req, res, next) => {
  const { code, amount, orderId } = req.body;

  const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    return next(new ErrorHandler('Invalid gift card code', 404));
  }

  if (giftCard.status !== 'active') {
    return next(new ErrorHandler(`Gift card is ${giftCard.status}`, 400));
  }

  if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
    giftCard.status = 'expired';
    await giftCard.save();
    return next(new ErrorHandler('Gift card has expired', 400));
  }

  if (amount > giftCard.currentBalance) {
    return next(new ErrorHandler(`Insufficient balance. Available: $${giftCard.currentBalance}`, 400));
  }

  // Process redemption
  giftCard.currentBalance -= amount;
  giftCard.transactions.push({
    type: 'redemption',
    amount: -amount,
    orderId,
    date: new Date()
  });

  if (giftCard.currentBalance === 0) {
    giftCard.status = 'used';
  }

  if (!giftCard.redeemedBy) {
    giftCard.redeemedBy = req.user._id;
    giftCard.redeemedAt = new Date();
  }

  await giftCard.save();

  res.status(200).json({
    success: true,
    message: 'Gift card redeemed successfully',
    amountUsed: amount,
    remainingBalance: giftCard.currentBalance
  });
});

// Add balance to gift card (for refunds)
export const addBalance = catchAsyncErrors(async (req, res, next) => {
  const { code, amount, reason } = req.body;

  const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    return next(new ErrorHandler('Invalid gift card code', 404));
  }

  giftCard.currentBalance += amount;
  giftCard.transactions.push({
    type: 'refund',
    amount,
    description: reason || 'Balance added',
    date: new Date()
  });

  if (giftCard.status === 'used') {
    giftCard.status = 'active';
  }

  await giftCard.save();

  res.status(200).json({
    success: true,
    message: 'Balance added successfully',
    newBalance: giftCard.currentBalance
  });
});

// Get user's gift cards
export const getMyGiftCards = catchAsyncErrors(async (req, res, next) => {
  const purchased = await GiftCard.find({ purchaser: req.user._id })
    .sort({ createdAt: -1 });

  const redeemed = await GiftCard.find({ redeemedBy: req.user._id })
    .sort({ redeemedAt: -1 });

  res.status(200).json({
    success: true,
    purchased,
    redeemed
  });
});

// Get gift card designs
export const getGiftCardDesigns = catchAsyncErrors(async (req, res, next) => {
  const designs = [
    { id: 'birthday', name: 'Birthday', image: '/designs/birthday.jpg' },
    { id: 'celebration', name: 'Celebration', image: '/designs/celebration.jpg' },
    { id: 'thank-you', name: 'Thank You', image: '/designs/thank-you.jpg' },
    { id: 'holiday', name: 'Holiday', image: '/designs/holiday.jpg' },
    { id: 'wedding', name: 'Wedding', image: '/designs/wedding.jpg' },
    { id: 'graduation', name: 'Graduation', image: '/designs/graduation.jpg' },
    { id: 'generic', name: 'Classic', image: '/designs/generic.jpg' }
  ];

  res.status(200).json({
    success: true,
    designs
  });
});

// Get gift wrapping options
export const getGiftWrapOptions = catchAsyncErrors(async (req, res, next) => {
  const options = await GiftWrap.find({ isActive: true })
    .sort({ price: 1 });

  res.status(200).json({
    success: true,
    options
  });
});

// Admin: Get all gift cards
export const getAllGiftCards = catchAsyncErrors(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const total = await GiftCard.countDocuments(query);
  const giftCards = await GiftCard.find(query)
    .populate('purchaser', 'name email')
    .populate('redeemedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    giftCards,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Admin: Deactivate gift card
export const deactivateGiftCard = catchAsyncErrors(async (req, res, next) => {
  const giftCard = await GiftCard.findById(req.params.id);

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  giftCard.status = 'deactivated';
  await giftCard.save();

  res.status(200).json({
    success: true,
    message: 'Gift card deactivated'
  });
});

// Admin: Create gift wrap option
export const createGiftWrapOption = catchAsyncErrors(async (req, res, next) => {
  const option = await GiftWrap.create(req.body);

  res.status(201).json({
    success: true,
    option
  });
});
