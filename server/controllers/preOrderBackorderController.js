import PreOrderBackorder from '../models/PreOrderBackorder.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Get pre-order configuration
export const getPreOrderConfig = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const config = await PreOrderBackorder.findOne({ product: productId })
    .populate('product');

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    config
  });
});

// Create pre-order configuration
export const createPreOrderConfig = catchAsyncErrors(async (req, res, next) => {
  const config = await PreOrderBackorder.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Pre-order configuration created',
    config
  });
});

// Update pre-order configuration
export const updatePreOrderConfig = catchAsyncErrors(async (req, res, next) => {
  let config = await PreOrderBackorder.findById(req.params.id);

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  config = await PreOrderBackorder.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Configuration updated',
    config
  });
});

// Add to waitlist
export const addToWaitlist = catchAsyncErrors(async (req, res, next) => {
  const { productId, userId, type, quantity, variant } = req.body;

  const config = await PreOrderBackorder.findOne({ product: productId });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  await config.addToWaitlist({ userId, type, quantity, variant });

  res.status(200).json({
    success: true,
    message: 'Added to waitlist'
  });
});

// Get user waitlist
export const getUserWaitlist = catchAsyncErrors(async (req, res, next) => {
  const configs = await PreOrderBackorder.find({ 'waitlist.user': req.user._id })
    .populate('product');

  const userWaitlist = configs.map(config => ({
    product: config.product,
    waitlistEntry: config.waitlist.find(w => w.user.toString() === req.user._id.toString())
  }));

  res.status(200).json({
    success: true,
    waitlist: userWaitlist
  });
});

// Notify waitlist
export const notifyWaitlist = catchAsyncErrors(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const config = await PreOrderBackorder.findOne({ product: productId });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  await config.notifyWaitlist(quantity);

  res.status(200).json({
    success: true,
    message: 'Waitlist notified'
  });
});

// Create pre-order
export const createPreOrder = catchAsyncErrors(async (req, res, next) => {
  const { productId, orderId, quantity } = req.body;

  const config = await PreOrderBackorder.findOne({ product: productId });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  config.orders.push({
    order: orderId,
    user: req.user._id,
    quantity,
    type: 'pre-order',
    paymentStatus: 'fully-paid',
    paidAmount: config.preOrder.pricing.preOrderPrice * quantity,
    estimatedShipDate: config.preOrder.estimatedDelivery.date
  });

  config.preOrder.currentQuantity += quantity;
  await config.save();

  res.status(201).json({
    success: true,
    message: 'Pre-order created'
  });
});

// Fulfill order
export const fulfillOrder = catchAsyncErrors(async (req, res, next) => {
  const { productId, orderId } = req.body;

  const config = await PreOrderBackorder.findOne({ product: productId });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  await config.fulfillOrder(orderId);

  res.status(200).json({
    success: true,
    message: 'Order fulfilled'
  });
});

// Get active pre-orders
export const getActivePreOrders = catchAsyncErrors(async (req, res, next) => {
  const preOrders = await PreOrderBackorder.getActivePreOrders(req.user._id);

  res.status(200).json({
    success: true,
    count: preOrders.length,
    preOrders
  });
});

// Get backorder queue
export const getBackorderQueue = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const queue = await PreOrderBackorder.getBackorderQueue(productId);

  if (!queue) {
    return next(new ErrorHandler('Queue not found', 404));
  }

  res.status(200).json({
    success: true,
    queue
  });
});

// Update inventory allocation
export const updateInventoryAllocation = catchAsyncErrors(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const config = await PreOrderBackorder.findOne({ product: productId });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  config.inventoryAllocation.availableForAllocation = quantity;
  await config.save();

  res.status(200).json({
    success: true,
    message: 'Inventory updated'
  });
});

// Cancel pre-order
export const cancelPreOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { productId } = req.body;

  const config = await PreOrderBackorder.findOne({ product: productId });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const order = config.orders.find(o => o.order.toString() === orderId);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  order.fulfillmentStatus = 'cancelled';
  await config.save();

  res.status(200).json({
    success: true,
    message: 'Pre-order cancelled'
  });
});
