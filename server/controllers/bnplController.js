import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import { BNPLApplication, InstallmentPlan } from '../models/BNPL.js';
import { Order } from '../models/Order.js';

/**
 * Buy Now Pay Later (BNPL) Controller
 */

// Check BNPL eligibility
export const checkEligibility = catchAsyncErrors(async (req, res, next) => {
  // Check if user has existing approved application
  const existingApplication = await BNPLApplication.findOne({
    user: req.user._id,
    status: 'approved',
    expiresAt: { $gt: new Date() }
  });

  if (existingApplication) {
    return res.status(200).json({
      success: true,
      eligible: true,
      creditLimit: existingApplication.creditLimit,
      availableCredit: existingApplication.availableCredit,
      application: existingApplication
    });
  }

  // Check for pending application
  const pendingApplication = await BNPLApplication.findOne({
    user: req.user._id,
    status: 'pending'
  });

  if (pendingApplication) {
    return res.status(200).json({
      success: true,
      eligible: false,
      status: 'pending',
      message: 'Your application is being reviewed'
    });
  }

  // No application yet
  res.status(200).json({
    success: true,
    eligible: false,
    canApply: true,
    message: 'Apply for BNPL to get instant credit'
  });
});

// Apply for BNPL
export const applyForBNPL = catchAsyncErrors(async (req, res, next) => {
  const {
    dateOfBirth,
    annualIncome,
    employmentStatus,
    employer,
    agreedToTerms
  } = req.body;

  if (!agreedToTerms) {
    return next(new ErrorHandler('You must agree to the terms and conditions', 400));
  }

  // Check for existing application
  const existingApplication = await BNPLApplication.findOne({
    user: req.user._id,
    status: { $in: ['pending', 'approved'] }
  });

  if (existingApplication) {
    return next(new ErrorHandler('You already have an active BNPL application', 400));
  }

  // Create application
  const application = await BNPLApplication.create({
    user: req.user._id,
    dateOfBirth,
    annualIncome,
    employmentStatus,
    employer,
    agreedToTerms: true,
    termsAgreedAt: new Date(),
    status: 'pending'
  });

  // Simulate quick credit assessment
  setTimeout(async () => {
    try {
      await processApplication(application._id);
    } catch (error) {
      console.error('BNPL processing error:', error);
    }
  }, 5000);

  res.status(201).json({
    success: true,
    message: 'Application submitted. You will be notified of the decision shortly.',
    applicationId: application._id
  });
});

// Process BNPL application (internal)
const processApplication = async (applicationId) => {
  const application = await BNPLApplication.findById(applicationId);

  if (!application || application.status !== 'pending') {
    return;
  }

  // Simple credit scoring (in production, use actual credit bureau APIs)
  let creditScore = 650;

  // Adjust based on income
  if (application.annualIncome >= 100000) creditScore += 50;
  else if (application.annualIncome >= 50000) creditScore += 25;

  // Adjust based on employment
  if (application.employmentStatus === 'employed') creditScore += 30;
  else if (application.employmentStatus === 'self-employed') creditScore += 20;

  // Determine credit limit based on score
  let creditLimit = 0;
  let riskLevel = 'high';

  if (creditScore >= 700) {
    creditLimit = 5000;
    riskLevel = 'low';
  } else if (creditScore >= 650) {
    creditLimit = 2500;
    riskLevel = 'medium';
  } else if (creditScore >= 600) {
    creditLimit = 1000;
    riskLevel = 'medium';
  }

  // Update application
  if (creditLimit > 0) {
    application.status = 'approved';
    application.creditLimit = creditLimit;
    application.availableCredit = creditLimit;
    application.creditScore = creditScore;
    application.riskLevel = riskLevel;
    application.approvedAt = new Date();
    application.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  } else {
    application.status = 'rejected';
    application.rejectedAt = new Date();
    application.rejectionReason = 'Credit criteria not met';
  }

  await application.save();
};

// Get available BNPL plans for an order
export const getBNPLPlans = catchAsyncErrors(async (req, res, next) => {
  const { orderTotal } = req.query;
  const total = parseFloat(orderTotal);

  if (!total || total < 50) {
    return next(new ErrorHandler('Order total must be at least $50 for BNPL', 400));
  }

  // Check eligibility
  const application = await BNPLApplication.findOne({
    user: req.user._id,
    status: 'approved',
    expiresAt: { $gt: new Date() }
  });

  if (!application) {
    return next(new ErrorHandler('You need an approved BNPL application', 400));
  }

  if (total > application.availableCredit) {
    return next(new ErrorHandler(`Order exceeds your available credit of $${application.availableCredit}`, 400));
  }

  // Generate available plans
  const plans = [];

  // Pay in 4 (interest-free)
  if (total >= 50) {
    plans.push({
      id: 'pay-in-4',
      name: 'Pay in 4',
      installments: 4,
      frequency: 'biweekly',
      interestRate: 0,
      processingFee: 0,
      downPayment: total / 4,
      installmentAmount: total / 4,
      totalPayable: total
    });
  }

  // 3 months (interest-free)
  if (total >= 100) {
    plans.push({
      id: '3-months',
      name: '3 Monthly Payments',
      installments: 3,
      frequency: 'monthly',
      interestRate: 0,
      processingFee: 0,
      downPayment: total / 3,
      installmentAmount: total / 3,
      totalPayable: total
    });
  }

  // 6 months (low interest)
  if (total >= 200) {
    const interest = total * 0.05;
    const totalPayable = total + interest;
    plans.push({
      id: '6-months',
      name: '6 Monthly Payments',
      installments: 6,
      frequency: 'monthly',
      interestRate: 5,
      processingFee: 0,
      downPayment: 0,
      installmentAmount: totalPayable / 6,
      totalPayable
    });
  }

  // 12 months
  if (total >= 500) {
    const interest = total * 0.1;
    const totalPayable = total + interest;
    plans.push({
      id: '12-months',
      name: '12 Monthly Payments',
      installments: 12,
      frequency: 'monthly',
      interestRate: 10,
      processingFee: 0,
      downPayment: 0,
      installmentAmount: totalPayable / 12,
      totalPayable
    });
  }

  res.status(200).json({
    success: true,
    availableCredit: application.availableCredit,
    plans
  });
});

// Create installment plan for order
export const createInstallmentPlan = catchAsyncErrors(async (req, res, next) => {
  const { orderId, planId, paymentMethod } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user._id });

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Get user's BNPL application
  const application = await BNPLApplication.findOne({
    user: req.user._id,
    status: 'approved',
    expiresAt: { $gt: new Date() }
  });

  if (!application) {
    return next(new ErrorHandler('No approved BNPL application found', 400));
  }

  if (order.totalPrice > application.availableCredit) {
    return next(new ErrorHandler('Insufficient BNPL credit', 400));
  }

  // Parse plan details
  const planConfig = {
    'pay-in-4': { installments: 4, interest: 0 },
    '3-months': { installments: 3, interest: 0 },
    '6-months': { installments: 6, interest: 0.05 },
    '12-months': { installments: 12, interest: 0.1 }
  };

  const plan = planConfig[planId];
  if (!plan) {
    return next(new ErrorHandler('Invalid plan selected', 400));
  }

  const totalInterest = order.totalPrice * plan.interest;
  const totalPayable = order.totalPrice + totalInterest;

  // Create installment plan
  const installmentPlan = await InstallmentPlan.create({
    user: req.user._id,
    order: orderId,
    totalAmount: order.totalPrice,
    financedAmount: order.totalPrice,
    numberOfInstallments: plan.installments,
    interestRate: plan.interest * 100,
    totalInterest,
    totalPayable,
    paymentMethod,
    status: 'active'
  });

  // Generate schedule
  installmentPlan.generateSchedule();
  await installmentPlan.save();

  // Deduct from available credit
  application.availableCredit -= order.totalPrice;
  await application.save();

  // Update order payment status
  order.paymentMethod = 'bnpl';
  order.bnplPlan = installmentPlan._id;
  await order.save();

  res.status(201).json({
    success: true,
    message: 'Installment plan created successfully',
    installmentPlan
  });
});

// Get user's installment plans
export const getMyInstallmentPlans = catchAsyncErrors(async (req, res, next) => {
  const plans = await InstallmentPlan.find({ user: req.user._id })
    .populate('order', 'orderId totalPrice items')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    plans
  });
});

// Pay installment
export const payInstallment = catchAsyncErrors(async (req, res, next) => {
  const { planId, installmentNumber, paymentMethod } = req.body;

  const plan = await InstallmentPlan.findOne({
    _id: planId,
    user: req.user._id
  });

  if (!plan) {
    return next(new ErrorHandler('Installment plan not found', 404));
  }

  const installment = plan.installments.find(i => i.number === installmentNumber);

  if (!installment) {
    return next(new ErrorHandler('Installment not found', 404));
  }

  if (installment.status === 'paid') {
    return next(new ErrorHandler('Installment already paid', 400));
  }

  // Process payment (integrate with payment gateway)
  installment.status = 'paid';
  installment.paidAt = new Date();
  installment.paidAmount = installment.amount + (installment.lateFee || 0);
  installment.paymentMethod = paymentMethod;
  installment.transactionId = `TXN-${Date.now()}`;

  plan.paidInstallments += 1;
  plan.remainingAmount = plan.totalPayable -
    plan.installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.paidAmount, 0);

  // Update next due date
  const nextUnpaid = plan.installments.find(i => i.status === 'pending');
  plan.nextDueDate = nextUnpaid?.dueDate;

  // Check if all paid
  if (plan.paidInstallments === plan.numberOfInstallments) {
    plan.status = 'completed';

    // Restore credit
    const application = await BNPLApplication.findOne({ user: req.user._id, status: 'approved' });
    if (application) {
      application.availableCredit += plan.totalAmount;
      await application.save();
    }
  }

  await plan.save();

  res.status(200).json({
    success: true,
    message: 'Payment successful',
    plan
  });
});

// Admin: Get all BNPL applications
export const getAllApplications = catchAsyncErrors(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const total = await BNPLApplication.countDocuments(query);
  const applications = await BNPLApplication.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    applications,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Admin: Manually approve/reject application
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { status, creditLimit, rejectionReason } = req.body;

  const application = await BNPLApplication.findById(req.params.id);

  if (!application) {
    return next(new ErrorHandler('Application not found', 404));
  }

  if (status === 'approved') {
    application.status = 'approved';
    application.creditLimit = creditLimit || 1000;
    application.availableCredit = creditLimit || 1000;
    application.approvedAt = new Date();
    application.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  } else if (status === 'rejected') {
    application.status = 'rejected';
    application.rejectedAt = new Date();
    application.rejectionReason = rejectionReason;
  }

  await application.save();

  res.status(200).json({
    success: true,
    application
  });
});
