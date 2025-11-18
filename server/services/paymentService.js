import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Initialize Razorpay
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  : null;

/**
 * Create Stripe Payment Intent
 */
export const createStripePaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.'
      };
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify Stripe Payment
 */
export const verifyStripePayment = async (paymentIntentId) => {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.'
      };
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create Stripe Refund
 */
export const createStripeRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
  try {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.'
      };
    }
    const refundData = {
      payment_intent: paymentIntentId,
      reason,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create Razorpay Order
 */
export const createRazorpayOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.'
      };
    }
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes,
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify Razorpay Payment Signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return false;
    }
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    return false;
  }
};

/**
 * Fetch Razorpay Payment Details
 */
export const getRazorpayPayment = async (paymentId) => {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.'
      };
    }
    const payment = await razorpay.payments.fetch(paymentId);

    return {
      success: true,
      status: payment.status,
      amount: payment.amount / 100,
      currency: payment.currency,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create Razorpay Refund
 */
export const createRazorpayRefund = async (paymentId, amount = null, notes = {}) => {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.'
      };
    }
    const refundData = { notes };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify Stripe Webhook Signature
 */
export const verifyStripeWebhook = (payload, signature) => {
  try {
    if (!stripe) {
      return { success: false, error: 'Stripe is not configured' };
    }
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return { success: true, event };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  createStripePaymentIntent,
  verifyStripePayment,
  createStripeRefund,
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayPayment,
  createRazorpayRefund,
  verifyStripeWebhook,
};
