import AdvancedReturnsManagement from '../models/AdvancedReturnsManagement.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Get all returns for user
export const getUserReturns = catchAsyncErrors(async (req, res, next) => {
  const returns = await AdvancedReturnsManagement.find({ user: req.user._id })
    .populate('order items.product')
    .sort({ requestedAt: -1 });

  res.status(200).json({
    success: true,
    count: returns.length,
    returns
  });
});

// Get return by ID
export const getReturn = catchAsyncErrors(async (req, res, next) => {
  const returnItem = await AdvancedReturnsManagement.findById(req.params.id)
    .populate('order items.product user');

  if (!returnItem) {
    return next(new ErrorHandler('Return not found', 404));
  }

  res.status(200).json({
    success: true,
    returnItem
  });
});

// Create return request
export const createReturnRequest = catchAsyncErrors(async (req, res, next) => {
  const returnData = {
    ...req.body,
    user: req.user._id,
    returnId: `RET${Date.now()}`,
    requestedAt: Date.now()
  };

  const returnItem = await AdvancedReturnsManagement.create(returnData);
  await returnItem.generateQRCode();

  res.status(201).json({
    success: true,
    message: 'Return request created successfully',
    returnItem
  });
});

// Update return status
export const updateReturnStatus = catchAsyncErrors(async (req, res, next) => {
  const { status, note } = req.body;

  const returnItem = await AdvancedReturnsManagement.findById(req.params.id);

  if (!returnItem) {
    return next(new ErrorHandler('Return not found', 404));
  }

  returnItem.status = status;
  returnItem.statusHistory.push({
    status,
    timestamp: Date.now(),
    note,
    updatedBy: 'seller'
  });

  await returnItem.save();

  res.status(200).json({
    success: true,
    message: 'Return status updated',
    returnItem
  });
});

// Approve return
export const approveReturn = catchAsyncErrors(async (req, res, next) => {
  const { approvedBy, note } = req.body;

  const returnItem = await AdvancedReturnsManagement.findById(req.params.id);

  if (!returnItem) {
    return next(new ErrorHandler('Return not found', 404));
  }

  await returnItem.approveReturn(approvedBy, note);

  res.status(200).json({
    success: true,
    message: 'Return approved',
    returnItem
  });
});

// Process instant refund
export const processInstantRefund = catchAsyncErrors(async (req, res, next) => {
  const returnItem = await AdvancedReturnsManagement.findById(req.params.id);

  if (!returnItem) {
    return next(new ErrorHandler('Return not found', 404));
  }

  if (!returnItem.instantRefund.eligible) {
    return next(new ErrorHandler('Not eligible for instant refund', 400));
  }

  await returnItem.processInstantRefund();

  res.status(200).json({
    success: true,
    message: 'Instant refund processed',
    returnItem
  });
});

// Inspect returned items
export const inspectReturn = catchAsyncErrors(async (req, res, next) => {
  const inspectionData = req.body;

  const returnItem = await AdvancedReturnsManagement.findById(req.params.id);

  if (!returnItem) {
    return next(new ErrorHandler('Return not found', 404));
  }

  await returnItem.inspectReturn(inspectionData);

  res.status(200).json({
    success: true,
    message: 'Return inspected',
    returnItem
  });
});

// Generate shipping label
export const generateShippingLabel = catchAsyncErrors(async (req, res, next) => {
  const returnItem = await AdvancedReturnsManagement.findById(req.params.id);

  if (!returnItem) {
    return next(new ErrorHandler('Return not found', 404));
  }

  returnItem.returnMethod.shippingLabel = {
    url: `https://labels.example.com/${returnItem.returnId}.pdf`,
    trackingNumber: `TRACK${Date.now()}`,
    carrier: 'FedEx',
    generatedAt: Date.now(),
    cost: 0,
    paidBy: 'seller'
  };

  returnItem.status = 'label-generated';
  await returnItem.save();

  res.status(200).json({
    success: true,
    message: 'Shipping label generated',
    shippingLabel: returnItem.returnMethod.shippingLabel
  });
});

// Get exchange suggestions
export const getExchangeSuggestions = catchAsyncErrors(async (req, res, next) => {
  const returnItem = await AdvancedReturnsManagement.findById(req.params.id)
    .populate('exchangeSuggestions.suggestions.product');

  if (!returnItem) {
    return next(new ErrorHandler('Return not found', 404));
  }

  res.status(200).json({
    success: true,
    suggestions: returnItem.exchangeSuggestions.suggestions
  });
});

// Get pending returns (seller)
export const getPendingReturns = catchAsyncErrors(async (req, res, next) => {
  const returns = await AdvancedReturnsManagement.getPendingReturns(req.user._id);

  res.status(200).json({
    success: true,
    count: returns.length,
    returns
  });
});

// Get return analytics
export const getReturnAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const analytics = await AdvancedReturnsManagement.getReturnAnalytics(
    req.user._id,
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.status(200).json({
    success: true,
    analytics
  });
});

// Cancel return
export const cancelReturn = catchAsyncErrors(async (req, res, next) => {
  const { reason } = req.body;

  const returnItem = await AdvancedReturnsManagement.findById(req.params.id);

  if (!returnItem) {
    return next(new ErrorHandler('Return not found', 404));
  }

  returnItem.status = 'cancelled';
  returnItem.statusHistory.push({
    status: 'cancelled',
    timestamp: Date.now(),
    note: reason,
    updatedBy: 'customer'
  });

  await returnItem.save();

  res.status(200).json({
    success: true,
    message: 'Return cancelled'
  });
});
