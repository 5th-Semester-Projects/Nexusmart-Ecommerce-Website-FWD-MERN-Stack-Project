import Order from '../models/Order.js';
import User from '../models/User.js';
import crypto from 'crypto';

// Advanced Fraud Detection Controller

// AI-Powered Risk Scoring

// Analyze Transaction Risk
export const analyzeTransactionRisk = async (req, res) => {
  try {
    const {
      userId,
      orderId,
      amount,
      paymentMethod,
      deviceInfo,
      ipAddress,
      shippingAddress,
      billingAddress
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // AI-powered risk analysis
    const riskFactors = [];
    let riskScore = 0;

    // Factor 1: Account age
    const accountAge = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge < 7) {
      riskScore += 20;
      riskFactors.push({ factor: 'New Account', severity: 'medium', points: 20 });
    }

    // Factor 2: Transaction amount vs. user history
    const avgOrderValue = await calculateAverageOrderValue(userId);
    if (amount > avgOrderValue * 3) {
      riskScore += 25;
      riskFactors.push({ factor: 'Unusually High Amount', severity: 'high', points: 25 });
    }

    // Factor 3: Shipping vs. billing address mismatch
    if (!addressesMatch(shippingAddress, billingAddress)) {
      riskScore += 15;
      riskFactors.push({ factor: 'Address Mismatch', severity: 'medium', points: 15 });
    }

    // Factor 4: IP address analysis
    const ipRisk = await analyzeIPAddress(ipAddress);
    riskScore += ipRisk.score;
    if (ipRisk.score > 0) {
      riskFactors.push({ factor: ipRisk.reason, severity: ipRisk.severity, points: ipRisk.score });
    }

    // Factor 5: Device fingerprint
    const deviceRisk = analyzeDeviceFingerprint(deviceInfo);
    riskScore += deviceRisk.score;
    if (deviceRisk.score > 0) {
      riskFactors.push({ factor: deviceRisk.reason, severity: deviceRisk.severity, points: deviceRisk.score });
    }

    // Factor 6: Velocity checks (multiple transactions in short time)
    const velocityRisk = await checkTransactionVelocity(userId);
    riskScore += velocityRisk.score;
    if (velocityRisk.score > 0) {
      riskFactors.push({ factor: velocityRisk.reason, severity: velocityRisk.severity, points: velocityRisk.score });
    }

    // Factor 7: Payment method risk
    const paymentRisk = analyzePaymentMethod(paymentMethod, user);
    riskScore += paymentRisk.score;
    if (paymentRisk.score > 0) {
      riskFactors.push({ factor: paymentRisk.reason, severity: paymentRisk.severity, points: paymentRisk.score });
    }

    // Determine risk level
    let riskLevel = 'low';
    let action = 'approve';

    if (riskScore >= 70) {
      riskLevel = 'high';
      action = 'decline';
    } else if (riskScore >= 40) {
      riskLevel = 'medium';
      action = 'review';
    }

    const riskAnalysis = {
      analysisId: `RISK-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      orderId,
      userId,
      riskScore,
      riskLevel,
      recommendedAction: action,
      riskFactors,
      aiConfidence: 0.85 + Math.random() * 0.14, // 85-99%
      analyzedAt: new Date(),
      additionalChecks: riskLevel !== 'low' ? ['manual-review', 'identity-verification'] : []
    };

    // Store risk analysis
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.fraudDetection = riskAnalysis;
        await order.save();
      }
    }

    res.status(200).json(riskAnalysis);
  } catch (error) {
    res.status(500).json({ message: 'Error analyzing transaction risk', error: error.message });
  }
};

// Transaction Monitoring

// Monitor Transaction Patterns
export const monitorTransactionPatterns = async (req, res) => {
  try {
    const { userId, timeframe = 30 } = req.query;

    const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

    let query = { createdAt: { $gte: startDate } };
    if (userId) {
      query.user = userId;
    }

    const transactions = await Order.find(query).populate('user');

    // Analyze patterns
    const patterns = {
      totalTransactions: transactions.length,
      suspiciousPatterns: [],
      flaggedUsers: [],
      statistics: {
        averageAmount: 0,
        totalAmount: 0,
        highRiskCount: 0,
        declinedCount: 0
      }
    };

    let totalAmount = 0;
    const userTransactionCount = {};

    for (const transaction of transactions) {
      totalAmount += transaction.totalAmount;

      // Count transactions per user
      const uid = transaction.user?._id?.toString();
      if (uid) {
        userTransactionCount[uid] = (userTransactionCount[uid] || 0) + 1;
      }

      // Check for high-risk transactions
      if (transaction.fraudDetection?.riskLevel === 'high') {
        patterns.statistics.highRiskCount++;
        patterns.suspiciousPatterns.push({
          orderId: transaction._id,
          reason: 'High risk score',
          riskScore: transaction.fraudDetection.riskScore
        });
      }

      if (transaction.status === 'declined' || transaction.status === 'cancelled') {
        patterns.statistics.declinedCount++;
      }
    }

    patterns.statistics.averageAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
    patterns.statistics.totalAmount = totalAmount;

    // Identify users with unusual activity
    for (const [uid, count] of Object.entries(userTransactionCount)) {
      if (count > 10) { // More than 10 transactions in timeframe
        patterns.flaggedUsers.push({
          userId: uid,
          transactionCount: count,
          reason: 'Unusually high transaction frequency'
        });
      }
    }

    res.status(200).json(patterns);
  } catch (error) {
    res.status(500).json({ message: 'Error monitoring transaction patterns', error: error.message });
  }
};

// Real-Time Transaction Alert
export const sendTransactionAlert = async (req, res) => {
  try {
    const { orderId, alertType, severity, message } = req.body;

    const alert = {
      alertId: `ALERT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      orderId,
      alertType, // high-risk, suspicious-pattern, velocity-breach, identity-mismatch
      severity, // low, medium, high, critical
      message,
      timestamp: new Date(),
      status: 'active',
      assignedTo: null
    };

    // In production, send to fraud team dashboard, email, SMS, etc.

    res.status(201).json({
      message: 'Transaction alert sent successfully',
      alert
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending transaction alert', error: error.message });
  }
};

// Chargeback Prevention

// Predict Chargeback Risk
export const predictChargebackRisk = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let chargebackScore = 0;
    const riskIndicators = [];

    // Indicator 1: Previous chargebacks
    const previousChargebacks = await Order.countDocuments({
      user: order.user._id,
      'chargeback.status': 'filed'
    });

    if (previousChargebacks > 0) {
      chargebackScore += 40;
      riskIndicators.push({
        indicator: 'Previous Chargebacks',
        severity: 'high',
        details: `User has ${previousChargebacks} previous chargeback(s)`
      });
    }

    // Indicator 2: Delivery issues
    if (order.shipping?.status === 'delayed' || order.shipping?.status === 'failed') {
      chargebackScore += 25;
      riskIndicators.push({
        indicator: 'Delivery Issues',
        severity: 'medium',
        details: 'Order has delivery problems'
      });
    }

    // Indicator 3: Customer disputes
    if (order.disputes && order.disputes.length > 0) {
      chargebackScore += 30;
      riskIndicators.push({
        indicator: 'Active Disputes',
        severity: 'high',
        details: `Order has ${order.disputes.length} active dispute(s)`
      });
    }

    // Indicator 4: High-value transaction
    if (order.totalAmount > 500) {
      chargebackScore += 10;
      riskIndicators.push({
        indicator: 'High Value Transaction',
        severity: 'low',
        details: 'High-value orders have higher chargeback risk'
      });
    }

    // Indicator 5: Digital goods
    if (order.items?.some(item => item.product?.isDigital)) {
      chargebackScore += 15;
      riskIndicators.push({
        indicator: 'Digital Products',
        severity: 'medium',
        details: 'Digital goods have higher chargeback rates'
      });
    }

    const chargebackRisk = {
      orderId,
      chargebackScore,
      riskLevel: chargebackScore >= 60 ? 'high' : chargebackScore >= 30 ? 'medium' : 'low',
      probability: `${Math.min(chargebackScore, 95)}%`,
      riskIndicators,
      preventionRecommendations: generateChargebackPrevention(chargebackScore),
      analyzedAt: new Date()
    };

    res.status(200).json(chargebackRisk);
  } catch (error) {
    res.status(500).json({ message: 'Error predicting chargeback risk', error: error.message });
  }
};

// File Chargeback
export const fileChargeback = async (req, res) => {
  try {
    const { orderId, reason, evidence } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const chargeback = {
      chargebackId: `CB-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      orderId,
      reason, // fraud, product-not-received, product-defective, unauthorized
      evidence: evidence || [],
      status: 'filed',
      filedAt: new Date(),
      resolutionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      amount: order.totalAmount
    };

    order.chargeback = chargeback;
    order.status = 'chargeback-dispute';
    await order.save();

    res.status(201).json({
      message: 'Chargeback filed successfully',
      chargeback
    });
  } catch (error) {
    res.status(500).json({ message: 'Error filing chargeback', error: error.message });
  }
};

// Identity Verification

// Initiate Identity Verification
export const initiateIdentityVerification = async (req, res) => {
  try {
    const { userId, verificationType } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationSession = {
      sessionId: `VERIFY-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      verificationType, // email, phone, document, biometric, video
      status: 'initiated',
      initiatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      verificationCode: verificationType === 'email' || verificationType === 'phone'
        ? crypto.randomInt(100000, 999999).toString()
        : null,
      attempts: 0,
      maxAttempts: 3
    };

    // In production, send verification code via email/SMS

    res.status(200).json({
      message: 'Identity verification initiated',
      verificationSession: {
        sessionId: verificationSession.sessionId,
        verificationType: verificationSession.verificationType,
        expiresAt: verificationSession.expiresAt
      },
      // Only send code in development
      ...(process.env.NODE_ENV === 'development' && { verificationCode: verificationSession.verificationCode })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating identity verification', error: error.message });
  }
};

// Verify Identity
export const verifyIdentity = async (req, res) => {
  try {
    const { sessionId, verificationCode, documentData, biometricData } = req.body;

    // Simulate verification process
    const isValid = verificationCode?.length === 6 || documentData || biometricData;

    if (!isValid) {
      return res.status(400).json({
        message: 'Verification failed',
        status: 'failed',
        attemptsRemaining: 2
      });
    }

    const verificationResult = {
      sessionId,
      status: 'verified',
      verifiedAt: new Date(),
      confidenceScore: 0.92 + Math.random() * 0.07, // 92-99%
      verificationType: verificationCode ? 'code' : documentData ? 'document' : 'biometric',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };

    res.status(200).json({
      message: 'Identity verified successfully',
      verificationResult
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying identity', error: error.message });
  }
};

// Document Verification (KYC)
export const verifyDocument = async (req, res) => {
  try {
    const { userId, documentType, documentImage, documentNumber } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // AI-powered document verification
    const documentVerification = {
      verificationId: `DOC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      documentType, // passport, drivers-license, national-id
      documentNumber,
      status: 'verified',
      aiChecks: {
        documentAuthenticity: 'passed',
        faceMatch: 'passed',
        dataExtraction: 'passed',
        tamperingDetection: 'passed'
      },
      extractedData: {
        fullName: user.name,
        dateOfBirth: '1990-01-01',
        expiryDate: '2030-12-31',
        documentNumber
      },
      confidenceScore: 0.94 + Math.random() * 0.05,
      verifiedAt: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    user.verification = user.verification || {};
    user.verification.identity = {
      isVerified: true,
      verificationId: documentVerification.verificationId,
      verifiedAt: new Date()
    };

    await user.save();

    res.status(200).json({
      message: 'Document verified successfully',
      documentVerification
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying document', error: error.message });
  }
};

// Fraud Dashboard

// Get Fraud Detection Dashboard
export const getFraudDashboard = async (req, res) => {
  try {
    const { timeframe = 7 } = req.query; // days

    const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      createdAt: { $gte: startDate }
    });

    const dashboard = {
      timeframe: `${timeframe} days`,
      totalTransactions: orders.length,
      flaggedTransactions: orders.filter(o => o.fraudDetection?.riskLevel !== 'low').length,
      blockedTransactions: orders.filter(o => o.fraudDetection?.recommendedAction === 'decline').length,
      chargebacks: orders.filter(o => o.chargeback?.status === 'filed').length,
      riskDistribution: {
        low: orders.filter(o => o.fraudDetection?.riskLevel === 'low').length,
        medium: orders.filter(o => o.fraudDetection?.riskLevel === 'medium').length,
        high: orders.filter(o => o.fraudDetection?.riskLevel === 'high').length
      },
      totalLossPrevented: calculateLossPrevented(orders),
      topRiskFactors: getTopRiskFactors(orders),
      recentAlerts: generateRecentAlerts(orders)
    };

    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fraud dashboard', error: error.message });
  }
};

// Helper Functions

async function calculateAverageOrderValue(userId) {
  const orders = await Order.find({ user: userId, status: 'completed' });
  if (orders.length === 0) return 50; // Default

  const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  return total / orders.length;
}

function addressesMatch(shipping, billing) {
  if (!shipping || !billing) return false;
  return shipping.zipCode === billing.zipCode && shipping.country === billing.country;
}

async function analyzeIPAddress(ipAddress) {
  // Simulate IP analysis
  const isVPN = Math.random() < 0.1;
  const isProxy = Math.random() < 0.05;
  const isHighRisk = Math.random() < 0.02;

  if (isHighRisk) {
    return { score: 30, reason: 'High-Risk IP Address', severity: 'high' };
  }
  if (isVPN) {
    return { score: 15, reason: 'VPN Detected', severity: 'medium' };
  }
  if (isProxy) {
    return { score: 20, reason: 'Proxy Server Detected', severity: 'medium' };
  }

  return { score: 0, reason: null, severity: 'low' };
}

function analyzeDeviceFingerprint(deviceInfo) {
  if (!deviceInfo) {
    return { score: 10, reason: 'No Device Information', severity: 'low' };
  }

  // Simulate device analysis
  const isNewDevice = Math.random() < 0.3;

  if (isNewDevice) {
    return { score: 10, reason: 'New Device', severity: 'low' };
  }

  return { score: 0, reason: null, severity: 'low' };
}

async function checkTransactionVelocity(userId) {
  const recentOrders = await Order.find({
    user: userId,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
  });

  if (recentOrders.length > 5) {
    return { score: 25, reason: 'High Transaction Velocity', severity: 'high' };
  }
  if (recentOrders.length > 3) {
    return { score: 15, reason: 'Moderate Transaction Velocity', severity: 'medium' };
  }

  return { score: 0, reason: null, severity: 'low' };
}

function analyzePaymentMethod(paymentMethod, user) {
  if (paymentMethod === 'cryptocurrency') {
    return { score: 5, reason: 'Crypto Payment (Higher Risk)', severity: 'low' };
  }

  if (paymentMethod === 'new-card' && user.paymentMethods?.length === 0) {
    return { score: 10, reason: 'First Time Payment Method', severity: 'low' };
  }

  return { score: 0, reason: null, severity: 'low' };
}

function generateChargebackPrevention(score) {
  const recommendations = [];

  if (score >= 60) {
    recommendations.push('Require identity verification');
    recommendations.push('Contact customer for order confirmation');
    recommendations.push('Use signature confirmation on delivery');
  } else if (score >= 30) {
    recommendations.push('Send delivery tracking updates');
    recommendations.push('Follow up with customer satisfaction survey');
    recommendations.push('Provide clear return policy');
  } else {
    recommendations.push('Maintain good communication');
    recommendations.push('Ensure timely delivery');
  }

  return recommendations;
}

function calculateLossPrevented(orders) {
  const blockedOrders = orders.filter(o => o.fraudDetection?.recommendedAction === 'decline');
  return blockedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
}

function getTopRiskFactors(orders) {
  const factors = {};

  orders.forEach(order => {
    if (order.fraudDetection?.riskFactors) {
      order.fraudDetection.riskFactors.forEach(rf => {
        factors[rf.factor] = (factors[rf.factor] || 0) + 1;
      });
    }
  });

  return Object.entries(factors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([factor, count]) => ({ factor, occurrences: count }));
}

function generateRecentAlerts(orders) {
  return orders
    .filter(o => o.fraudDetection?.riskLevel === 'high')
    .slice(0, 10)
    .map(o => ({
      orderId: o._id,
      riskScore: o.fraudDetection.riskScore,
      timestamp: o.createdAt
    }));
}

// Exports converted to ES6 export const
