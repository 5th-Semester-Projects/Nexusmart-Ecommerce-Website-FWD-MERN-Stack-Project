import GiftCardStoreCredit from '../models/GiftCardStoreCredit.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get all gift cards
// @route   GET /api/v1/gift-cards
// @access  Private/Admin
export const getAllGiftCards = catchAsyncErrors(async (req, res, next) => {
  const { status, type, recipientEmail } = req.query;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (recipientEmail) query['recipient.email'] = recipientEmail;

  const giftCards = await GiftCardStoreCredit.find(query)
    .populate('purchasedBy.userId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: giftCards.length,
    giftCards
  });
});

// @desc    Get gift card by card number
// @route   GET /api/v1/gift-cards/:cardNumber
// @access  Public
export const getGiftCard = catchAsyncErrors(async (req, res, next) => {
  const giftCard = await GiftCardStoreCredit.findOne({
    cardNumber: req.params.cardNumber
  });

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  res.status(200).json({
    success: true,
    giftCard
  });
});

// @desc    Create gift card
// @route   POST /api/v1/gift-cards
// @access  Private
export const createGiftCard = catchAsyncErrors(async (req, res, next) => {
  const giftCardData = {
    ...req.body,
    purchasedBy: {
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  };

  const giftCard = await GiftCardStoreCredit.create(giftCardData);

  // Send to recipient if delivery method is immediate
  if (giftCard.delivery.method === 'email' || giftCard.delivery.method === 'sms') {
    await giftCard.sendToRecipient(giftCard.delivery.method);
  }

  res.status(201).json({
    success: true,
    giftCard
  });
});

// @desc    Update gift card
// @route   PUT /api/v1/gift-cards/:id
// @access  Private/Admin
export const updateGiftCard = catchAsyncErrors(async (req, res, next) => {
  let giftCard = await GiftCardStoreCredit.findById(req.params.id);

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  giftCard = await GiftCardStoreCredit.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    giftCard
  });
});

// @desc    Delete/Cancel gift card
// @route   DELETE /api/v1/gift-cards/:id
// @access  Private/Admin
export const cancelGiftCard = catchAsyncErrors(async (req, res, next) => {
  const giftCard = await GiftCardStoreCredit.findById(req.params.id);

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  giftCard.status = 'cancelled';
  giftCard.statusHistory.push({
    status: 'cancelled',
    changedAt: Date.now(),
    reason: req.body.reason || 'Cancelled by admin'
  });

  await giftCard.save();

  res.status(200).json({
    success: true,
    message: 'Gift card cancelled'
  });
});

// @desc    Check gift card balance
// @route   GET /api/v1/gift-cards/:cardNumber/balance
// @access  Public
export const checkBalance = catchAsyncErrors(async (req, res, next) => {
  const giftCard = await GiftCardStoreCredit.findOne({
    cardNumber: req.params.cardNumber
  });

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  const balance = await giftCard.checkBalance();

  res.status(200).json({
    success: true,
    cardNumber: giftCard.cardNumber,
    balance,
    currency: giftCard.currency,
    status: giftCard.status,
    expiryDate: giftCard.expiry.expiryDate
  });
});

// @desc    Redeem gift card
// @route   POST /api/v1/gift-cards/redeem
// @access  Public
export const redeemGiftCard = catchAsyncErrors(async (req, res, next) => {
  const { cardNumber, pin, amount, orderId } = req.body;

  const giftCard = await GiftCardStoreCredit.findOne({ cardNumber });

  if (!giftCard) {
    return next(new ErrorHandler('Invalid gift card', 404));
  }

  // Verify PIN
  const isValidPin = await giftCard.comparePin(pin);
  if (!isValidPin) {
    return next(new ErrorHandler('Invalid PIN', 401));
  }

  // Check if card is active
  if (giftCard.status !== 'active') {
    return next(new ErrorHandler(`Card is ${giftCard.status}`, 400));
  }

  // Check if expired
  if (giftCard.expiry.expiryDate && new Date(giftCard.expiry.expiryDate) < new Date()) {
    return next(new ErrorHandler('Gift card has expired', 400));
  }

  // Redeem amount
  const transaction = await giftCard.redeemAmount(amount, orderId);

  res.status(200).json({
    success: true,
    message: 'Gift card redeemed successfully',
    transaction,
    remainingBalance: giftCard.currentBalance
  });
});

// @desc    Transfer gift card
// @route   POST /api/v1/gift-cards/:id/transfer
// @access  Private
export const transferGiftCard = catchAsyncErrors(async (req, res, next) => {
  const giftCard = await GiftCardStoreCredit.findById(req.params.id);

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  const { newRecipient } = req.body;

  await giftCard.transferCard(newRecipient);

  res.status(200).json({
    success: true,
    message: 'Gift card transferred successfully',
    giftCard
  });
});

// @desc    Send gift card to recipient
// @route   POST /api/v1/gift-cards/:id/send
// @access  Private
export const sendGiftCard = catchAsyncErrors(async (req, res, next) => {
  const giftCard = await GiftCardStoreCredit.findById(req.params.id);

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  const { method } = req.body;

  await giftCard.sendToRecipient(method || giftCard.delivery.method);

  res.status(200).json({
    success: true,
    message: `Gift card sent via ${method || giftCard.delivery.method}`
  });
});

// @desc    Get user's active gift cards
// @route   GET /api/v1/gift-cards/user/active
// @access  Private
export const getUserActiveCards = catchAsyncErrors(async (req, res, next) => {
  const giftCards = await GiftCardStoreCredit.getActiveCards(req.user._id);

  res.status(200).json({
    success: true,
    count: giftCards.length,
    giftCards
  });
});

// @desc    Get expiring gift cards
// @route   GET /api/v1/gift-cards/expiring/:days
// @access  Private/Admin
export const getExpiringCards = catchAsyncErrors(async (req, res, next) => {
  const days = parseInt(req.params.days) || 30;

  const giftCards = await GiftCardStoreCredit.getExpiringCards(days);

  res.status(200).json({
    success: true,
    count: giftCards.length,
    giftCards
  });
});

// @desc    Get total balance for user
// @route   GET /api/v1/gift-cards/user/balance
// @access  Private
export const getUserTotalBalance = catchAsyncErrors(async (req, res, next) => {
  const totalBalance = await GiftCardStoreCredit.getTotalBalance(req.user._id);

  res.status(200).json({
    success: true,
    totalBalance
  });
});

// @desc    Get transaction history
// @route   GET /api/v1/gift-cards/:cardNumber/transactions
// @access  Public
export const getTransactionHistory = catchAsyncErrors(async (req, res, next) => {
  const giftCard = await GiftCardStoreCredit.findOne({
    cardNumber: req.params.cardNumber
  });

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  res.status(200).json({
    success: true,
    transactions: giftCard.transactions
  });
});

// @desc    Validate gift card for purchase
// @route   POST /api/v1/gift-cards/validate
// @access  Public
export const validateGiftCard = catchAsyncErrors(async (req, res, next) => {
  const { cardNumber, pin, amount } = req.body;

  const giftCard = await GiftCardStoreCredit.findOne({ cardNumber });

  if (!giftCard) {
    return res.status(200).json({
      success: false,
      valid: false,
      message: 'Invalid gift card'
    });
  }

  // Verify PIN
  const isValidPin = await giftCard.comparePin(pin);
  if (!isValidPin) {
    return res.status(200).json({
      success: false,
      valid: false,
      message: 'Invalid PIN'
    });
  }

  // Check status and expiry
  if (giftCard.status !== 'active') {
    return res.status(200).json({
      success: false,
      valid: false,
      message: `Card is ${giftCard.status}`
    });
  }

  if (giftCard.expiry.expiryDate && new Date(giftCard.expiry.expiryDate) < new Date()) {
    return res.status(200).json({
      success: false,
      valid: false,
      message: 'Card has expired'
    });
  }

  // Check if sufficient balance
  if (amount && giftCard.currentBalance < amount) {
    return res.status(200).json({
      success: false,
      valid: false,
      message: 'Insufficient balance',
      availableBalance: giftCard.currentBalance
    });
  }

  res.status(200).json({
    success: true,
    valid: true,
    message: 'Gift card is valid',
    balance: giftCard.currentBalance,
    currency: giftCard.currency
  });
});

// @desc    Reload gift card balance
// @route   POST /api/v1/gift-cards/:id/reload
// @access  Private
export const reloadGiftCard = catchAsyncErrors(async (req, res, next) => {
  const giftCard = await GiftCardStoreCredit.findById(req.params.id);

  if (!giftCard) {
    return next(new ErrorHandler('Gift card not found', 404));
  }

  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorHandler('Invalid amount', 400));
  }

  giftCard.currentBalance += amount;
  giftCard.transactions.push({
    type: 'reload',
    amount,
    balanceAfter: giftCard.currentBalance,
    timestamp: Date.now(),
    description: 'Balance reloaded'
  });

  await giftCard.save();

  res.status(200).json({
    success: true,
    message: 'Gift card reloaded successfully',
    newBalance: giftCard.currentBalance
  });
});
