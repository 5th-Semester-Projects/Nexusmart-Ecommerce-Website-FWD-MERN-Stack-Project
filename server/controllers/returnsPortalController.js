const ReturnsPortal = require('../models/ReturnsPortal');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create return request
export const createReturn = catchAsyncErrors(async (req, res) => {
  const returnRequest = await ReturnsPortal.create({
    ...req.body,
    user: req.user._id,
    returnNumber: `RET${Date.now()}${Math.floor(Math.random() * 1000)}`
  });

  await returnRequest.populate('order user');

  res.status(201).json({
    success: true,
    returnRequest
  });
});

// Get return by return number
export const getReturn = catchAsyncErrors(async (req, res) => {
  const { returnNumber } = req.params;

  const returnRequest = await ReturnsPortal.findOne({ returnNumber })
    .populate('order user items.product');

  if (!returnRequest) {
    return res.status(404).json({
      success: false,
      message: 'Return request not found'
    });
  }

  res.status(200).json({
    success: true,
    returnRequest
  });
});

// Get user returns
export const getUserReturns = catchAsyncErrors(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const returns = await ReturnsPortal.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('order');

  const count = await ReturnsPortal.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    returns,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

// Update return status
export const updateStatus = catchAsyncErrors(async (req, res) => {
  const { returnNumber } = req.params;
  const { status, notes, updatedBy } = req.body;

  const returnRequest = await ReturnsPortal.findOne({ returnNumber });

  if (!returnRequest) {
    return res.status(404).json({
      success: false,
      message: 'Return not found'
    });
  }

  returnRequest.updateStatus(status, notes, updatedBy);
  await returnRequest.save();

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    returnRequest
  });
});

// Approve return
export const approveReturn = catchAsyncErrors(async (req, res) => {
  const { returnNumber } = req.params;

  const returnRequest = await ReturnsPortal.findOne({ returnNumber });

  if (!returnRequest) {
    return res.status(404).json({
      success: false,
      message: 'Return not found'
    });
  }

  returnRequest.approve(req.user._id);
  await returnRequest.save();

  res.status(200).json({
    success: true,
    message: 'Return approved',
    returnRequest
  });
});

// Reject return
export const rejectReturn = catchAsyncErrors(async (req, res) => {
  const { returnNumber } = req.params;
  const { reason } = req.body;

  const returnRequest = await ReturnsPortal.findOne({ returnNumber });

  if (!returnRequest) {
    return res.status(404).json({
      success: false,
      message: 'Return not found'
    });
  }

  returnRequest.reject(req.user._id, reason);
  await returnRequest.save();

  res.status(200).json({
    success: true,
    message: 'Return rejected',
    returnRequest
  });
});

// Calculate refund
export const calculateRefund = catchAsyncErrors(async (req, res) => {
  const { returnNumber } = req.params;

  const returnRequest = await ReturnsPortal.findOne({ returnNumber });

  if (!returnRequest) {
    return res.status(404).json({
      success: false,
      message: 'Return not found'
    });
  }

  const refund = returnRequest.calculateRefund();

  res.status(200).json({
    success: true,
    refund
  });
});

// Get pending returns
export const getPendingReturns = catchAsyncErrors(async (req, res) => {
  const returns = await ReturnsPortal.getPendingReturns();

  res.status(200).json({
    success: true,
    count: returns.length,
    returns
  });
});

module.exports = exports;
