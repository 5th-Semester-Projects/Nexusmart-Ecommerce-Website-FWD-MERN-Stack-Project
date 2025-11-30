import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { sendEmail, getOrderConfirmationTemplate } from '../utils/sendEmail.js';
import shippingService from '../services/shippingService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderNumber,
    orderItems,
    shippingInfo,
    paymentInfo,
    pricing,
    // Legacy fields (for backwards compatibility)
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponApplied,
    discountPrice,
  } = req.body;

  // Validate order items
  if (!orderItems || orderItems.length === 0) {
    return next(new ErrorHandler('No order items provided', 400));
  }

  // Check stock availability and update product quantities
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new ErrorHandler(`Product not found: ${item.name}`, 404));
    }

    if (product.stock < item.quantity) {
      return next(
        new ErrorHandler(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400)
      );
    }

    // Reduce stock
    product.stock -= item.quantity;
    product.purchases += item.quantity;
    await product.save();
  }

  // Generate order number if not provided
  const finalOrderNumber = orderNumber || `NXS${Date.now().toString().slice(-8)}`;

  // Use pricing object or legacy fields
  const finalPricing = pricing || {
    itemsPrice: itemsPrice || 0,
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
    discountPrice: discountPrice || 0,
    totalPrice: totalPrice || 0,
  };

  // Create order
  const order = await Order.create({
    orderNumber: finalOrderNumber,
    user: req.user._id,
    orderItems,
    shippingInfo,
    paymentInfo,
    pricing: finalPricing,
    couponApplied,
    paidAt: paymentInfo?.status === 'completed' || paymentInfo?.status === 'paid' ? Date.now() : null,
  });

  // Clear user's cart after successful order
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } }
  );

  // Send order confirmation email
  try {
    const orderDetailsForEmail = {
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingInfo: {
        name: shippingInfo.firstName && shippingInfo.lastName
          ? `${shippingInfo.firstName} ${shippingInfo.lastName}`
          : shippingInfo.name || `${req.user.firstName} ${req.user.lastName}`,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state || shippingInfo.province || '',
        postalCode: shippingInfo.postalCode || shippingInfo.zipCode,
        country: shippingInfo.country,
        phone: shippingInfo.phone || req.user.phone || 'N/A',
      },
      itemsPrice: itemsPrice || 0,
      shippingPrice: shippingPrice || 0,
      taxPrice: taxPrice || 0,
      totalPrice: totalPrice,
      discountPrice: discountPrice || 0,
      paymentMethod: paymentInfo.method || 'Credit Card',
      orderDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    const emailTemplate = getOrderConfirmationTemplate(
      req.user.firstName || 'Customer',
      order.orderNumber,
      orderDetailsForEmail
    );

    await sendEmail({
      email: req.user.email,
      subject: `Order Confirmation - #${order.orderNumber}`,
      message: emailTemplate,
    });

    console.log(`✅ Order confirmation email sent to ${req.user.email}`);
  } catch (emailError) {
    console.error('❌ Failed to send order confirmation email:', emailError.message);
    // Don't fail the order creation if email fails
  }

  // Emit socket event for real-time order tracking
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${req.user._id}`).emit('order:created', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email phone')
    .populate('orderItems.product', 'name images price');

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Check if user owns this order or is admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorHandler('Not authorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { user: req.user._id };

  // Filter by status if provided
  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  const orders = await Order.find(query)
    .populate('orderItems.product', 'name images price')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalOrders = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    },
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  // Filters
  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  if (req.query.paymentStatus) {
    query['paymentInfo.status'] = req.query.paymentStatus;
  }

  if (req.query.fromDate) {
    query.createdAt = { $gte: new Date(req.query.fromDate) };
  }

  if (req.query.toDate) {
    query.createdAt = { ...query.createdAt, $lte: new Date(req.query.toDate) };
  }

  const orders = await Order.find(query)
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalOrders = await Order.countDocuments(query);

  // Calculate statistics
  const totalAmount = await Order.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    },
    statistics: {
      totalRevenue: totalAmount[0]?.total || 0,
    },
  });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (order.orderStatus === 'delivered') {
    return next(new ErrorHandler('Order already delivered', 400));
  }

  // Update status
  order.orderStatus = status;

  // Update delivery date if status is delivered
  if (status === 'delivered') {
    order.deliveredAt = Date.now();
  }

  // Update shipped date if status is shipped
  if (status === 'shipped' && !order.shippedAt) {
    order.shippedAt = Date.now();
  }

  await order.save();

  // Emit socket event for real-time updates
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user}`).emit('order:updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      message: `Your order ${order.orderNumber} status updated to ${status}`,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = catchAsyncErrors(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Check if user owns this order or is admin
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorHandler('Not authorized to cancel this order', 403));
  }

  // Check if order can be cancelled
  if (!order.canBeCancelled()) {
    return next(
      new ErrorHandler('Order cannot be cancelled at this stage', 400)
    );
  }

  // Restore product stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      product.purchases -= item.quantity;
      await product.save();
    }
  }

  // Update order
  order.orderStatus = 'cancelled';
  order.cancellationReason = reason;
  order.cancelledBy = req.user._id;
  order.cancelledAt = Date.now();

  await order.save();

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user}`).emit('order:cancelled', {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order,
  });
});

// @desc    Request order return
// @route   POST /api/orders/:id/return
// @access  Private
export const requestReturn = catchAsyncErrors(async (req, res, next) => {
  const { reason, description } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Check if user owns this order
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Not authorized', 403));
  }

  // Check if order can be returned
  if (!order.canBeReturned()) {
    return next(
      new ErrorHandler('Return window has expired or order not eligible', 400)
    );
  }

  if (order.returnRequest && order.returnRequest.status === 'pending') {
    return next(new ErrorHandler('Return request already submitted', 400));
  }

  // Create return request
  order.returnRequest = {
    reason,
    description,
    status: 'pending',
    requestedAt: Date.now(),
  };

  await order.save();

  // Notify admin
  const io = req.app.get('io');
  if (io) {
    io.to('admin_room').emit('order:return_requested', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: req.user._id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Return request submitted successfully',
    order,
  });
});

// @desc    Process return request (Admin)
// @route   PUT /api/orders/:id/return
// @access  Private/Admin
export const processReturn = catchAsyncErrors(async (req, res, next) => {
  const { status, adminNotes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (!order.returnRequest) {
    return next(new ErrorHandler('No return request found', 400));
  }

  order.returnRequest.status = status;
  order.returnRequest.adminNotes = adminNotes;
  order.returnRequest.processedAt = Date.now();
  order.returnRequest.processedBy = req.user._id;

  if (status === 'approved') {
    order.orderStatus = 'returned';

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
  }

  await order.save();

  // Notify user
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user}`).emit('order:return_processed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status,
    });
  }

  res.status(200).json({
    success: true,
    message: `Return request ${status}`,
    order,
  });
});

// @desc    Update tracking info (Admin)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
export const updateTracking = catchAsyncErrors(async (req, res, next) => {
  const { trackingNumber, trackingUrl, carrier, estimatedDelivery } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  order.trackingNumber = trackingNumber;
  order.trackingUrl = trackingUrl;
  order.shippingCarrier = carrier;
  order.estimatedDelivery = estimatedDelivery;

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Tracking information updated',
    order,
  });
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Order.getOrderStats();

  res.status(200).json({
    success: true,
    stats,
  });
});

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully',
  });
});

// @desc    Calculate shipping cost
// @route   POST /api/orders/calculate-shipping
// @access  Public
export const calculateShipping = catchAsyncErrors(async (req, res, next) => {
  const { city, country, cartTotal, cartWeight, shippingMethod, timeSlot } = req.body;

  if (!city) {
    return next(new ErrorHandler('City is required for shipping calculation', 400));
  }

  const result = shippingService.calculateShipping({
    city,
    country: country || 'Pakistan',
    cartTotal: cartTotal || 0,
    cartWeight: cartWeight || 1,
    shippingMethod: shippingMethod || 'standard',
    timeSlot: timeSlot || 'any',
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Get available shipping methods
// @route   GET /api/orders/shipping-methods
// @access  Public
export const getShippingMethods = catchAsyncErrors(async (req, res, next) => {
  const { zone } = req.query;

  const methods = shippingService.getAvailableShippingMethods(zone || 'national');
  const timeSlots = shippingService.getTimeSlots();

  res.status(200).json({
    success: true,
    methods,
    timeSlots,
  });
});

// @desc    Get available delivery dates
// @route   GET /api/orders/delivery-dates
// @access  Public
export const getDeliveryDates = catchAsyncErrors(async (req, res, next) => {
  const { zone, method } = req.query;

  const dates = shippingService.getAvailableDeliveryDates(zone || 'national', method || 'standard');

  res.status(200).json({
    success: true,
    dates,
  });
});
