import Order from '../models/Order.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import {
  createStripePaymentIntent,
  verifyStripePayment,
  createStripeRefund,
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayPayment,
  createRazorpayRefund,
  verifyStripeWebhook,
} from '../services/paymentService.js';

// @desc    Create Stripe payment intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private
export const createStripeIntent = catchAsyncErrors(async (req, res, next) => {
  const { amount, orderId } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorHandler('Invalid amount', 400));
  }

  const result = await createStripePaymentIntent(amount, 'usd', {
    userId: req.user._id.toString(),
    orderId: orderId || 'temp',
  });

  if (!result.success) {
    return next(new ErrorHandler(result.error, 500));
  }

  res.status(200).json({
    success: true,
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
  });
});

// @desc    Verify Stripe payment
// @route   POST /api/payments/stripe/verify
// @access  Private
export const verifyStripe = catchAsyncErrors(async (req, res, next) => {
  const { paymentIntentId, orderId } = req.body;

  const result = await verifyStripePayment(paymentIntentId);

  if (!result.success) {
    return next(new ErrorHandler('Payment verification failed', 400));
  }

  // Update order payment status
  if (orderId) {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentInfo.status = 'paid';
      order.paymentInfo.transactionId = paymentIntentId;
      order.paidAt = Date.now();
      await order.save();

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${order.user}`).emit('payment:success', {
          orderId: order._id,
          orderNumber: order.orderNumber,
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    payment: result,
  });
});

// @desc    Create Razorpay order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
export const createRazorpayOrderHandler = catchAsyncErrors(async (req, res, next) => {
  const { amount, orderId } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorHandler('Invalid amount', 400));
  }

  const receipt = `receipt_${Date.now()}`;
  const result = await createRazorpayOrder(amount, 'INR', receipt, {
    userId: req.user._id.toString(),
    orderId: orderId || 'temp',
  });

  if (!result.success) {
    return next(new ErrorHandler(result.error, 500));
  }

  res.status(200).json({
    success: true,
    orderId: result.orderId,
    amount: result.amount,
    currency: result.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/razorpay/verify
// @access  Private
export const verifyRazorpay = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return next(new ErrorHandler('Invalid payment signature', 400));
  }

  // Get payment details
  const paymentDetails = await getRazorpayPayment(razorpay_payment_id);

  if (!paymentDetails.success || paymentDetails.status !== 'captured') {
    return next(new ErrorHandler('Payment verification failed', 400));
  }

  // Update order payment status
  if (orderId) {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentInfo.status = 'paid';
      order.paymentInfo.transactionId = razorpay_payment_id;
      order.paidAt = Date.now();
      await order.save();

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${order.user}`).emit('payment:success', {
          orderId: order._id,
          orderNumber: order.orderNumber,
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    payment: paymentDetails,
  });
});

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private/Admin
export const processRefund = catchAsyncErrors(async (req, res, next) => {
  const { orderId, amount, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (order.paymentInfo.status !== 'paid') {
    return next(new ErrorHandler('Order is not paid', 400));
  }

  let result;

  // Process refund based on payment provider
  if (order.paymentInfo.provider === 'stripe') {
    result = await createStripeRefund(
      order.paymentInfo.transactionId,
      amount,
      reason || 'requested_by_customer'
    );
  } else if (order.paymentInfo.provider === 'razorpay') {
    result = await createRazorpayRefund(
      order.paymentInfo.transactionId,
      amount,
      { reason: reason || 'Customer requested refund' }
    );
  } else {
    return next(new ErrorHandler('Invalid payment provider', 400));
  }

  if (!result.success) {
    return next(new ErrorHandler(result.error, 500));
  }

  // Update order
  order.paymentInfo.status = 'refunded';
  order.orderStatus = 'refunded';
  order.refundDetails = {
    refundId: result.refundId,
    amount: result.amount,
    reason,
    refundedAt: Date.now(),
    refundedBy: req.user._id,
  };

  await order.save();

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user}`).emit('payment:refunded', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: result.amount,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    refund: result,
  });
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook/stripe
// @access  Public (Webhook)
export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  const payload = req.body;

  const result = verifyStripeWebhook(payload, signature);

  if (!result.success) {
    return next(new ErrorHandler('Webhook signature verification failed', 400));
  }

  const event = result.event;

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);

      // Update order status if metadata contains orderId
      if (paymentIntent.metadata.orderId) {
        const order = await Order.findById(paymentIntent.metadata.orderId);
        if (order) {
          order.paymentInfo.status = 'paid';
          order.paymentInfo.transactionId = paymentIntent.id;
          order.paidAt = Date.now();
          await order.save();
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);

      if (failedPayment.metadata.orderId) {
        const order = await Order.findById(failedPayment.metadata.orderId);
        if (order) {
          order.paymentInfo.status = 'failed';
          await order.save();
        }
      }
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log('Refund processed:', refund.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook/razorpay
// @access  Public (Webhook)
export const razorpayWebhook = catchAsyncErrors(async (req, res, next) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return next(new ErrorHandler('Invalid webhook signature', 400));
  }

  const event = req.body.event;
  const payload = req.body.payload;

  // Handle different event types
  switch (event) {
    case 'payment.captured':
      console.log('Payment captured:', payload.payment.entity.id);
      // Update order status
      break;

    case 'payment.failed':
      console.log('Payment failed:', payload.payment.entity.id);
      // Update order status
      break;

    case 'refund.processed':
      console.log('Refund processed:', payload.refund.entity.id);
      break;

    default:
      console.log(`Unhandled event type: ${event}`);
  }

  res.status(200).json({ received: true });
});

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Public
export const getPaymentMethods = catchAsyncErrors(async (req, res, next) => {
  const methods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      provider: 'Stripe',
      enabled: !!process.env.STRIPE_SECRET_KEY,
      currencies: ['USD', 'EUR', 'GBP'],
      icon: '💳',
    },
    {
      id: 'razorpay',
      name: 'UPI/Cards/NetBanking',
      provider: 'Razorpay',
      enabled: !!process.env.RAZORPAY_KEY_ID,
      currencies: ['INR'],
      icon: '🇮🇳',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      provider: 'COD',
      enabled: true,
      currencies: ['USD', 'INR', 'EUR'],
      icon: '💵',
    },
  ];

  res.status(200).json({
    success: true,
    methods: methods.filter(m => m.enabled),
  });
});
