import InvoiceFinancing from '../models/InvoiceFinancing.js';
import DynamicCurrencyPricing from '../models/DynamicCurrencyPricing.js';
import InstallmentPlan from '../models/InstallmentPlan.js';
import Order from '../models/Order.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Invoice Financing Controllers

export const requestInvoiceFinancing = catchAsyncErrors(async (req, res, next) => {
  const { invoiceNumber, orderId, amount, dueDate, paymentTerms, advanceRate } = req.body;

  // Check if order exists
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  // Calculate financing amounts
  const calculatedAdvanceRate = advanceRate || 80;
  const advanceAmount = (amount * calculatedAdvanceRate) / 100;
  const feeRate = 2; // 2% fee
  const feeAmount = (advanceAmount * feeRate) / 100;
  const netAmount = advanceAmount - feeAmount;

  // Create invoice financing request
  const financing = await InvoiceFinancing.create({
    business: req.user.id,
    invoice: {
      invoiceNumber,
      order: orderId,
      customer: order.user,
      amount,
      issueDate: Date.now(),
      dueDate,
      paymentTerms: paymentTerms || 'net30'
    },
    financing: {
      requested: true,
      requestedAt: Date.now(),
      advanceRate: calculatedAdvanceRate,
      advanceAmount,
      feeRate,
      feeAmount,
      netAmount,
      remainingAmount: amount
    },
    riskAssessment: {
      creditScore: 750, // Would be calculated based on business history
      riskLevel: 'low',
      assessedAt: Date.now()
    },
    status: 'pending_approval'
  });

  res.status(201).json({
    success: true,
    data: financing
  });
});

export const getBusinessFinancing = catchAsyncErrors(async (req, res, next) => {
  const financings = await InvoiceFinancing.find({ business: req.user.id })
    .populate('invoice.order')
    .populate('invoice.customer', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: financings.length,
    data: financings
  });
});

export const approveFinancing = catchAsyncErrors(async (req, res, next) => {
  const financing = await InvoiceFinancing.findById(req.params.id);

  if (!financing) {
    return next(new ErrorHandler('Financing request not found', 404));
  }

  financing.financing.approved = true;
  financing.financing.approvedAt = Date.now();
  financing.financing.approvedBy = req.user.id;
  financing.status = 'approved';

  await financing.save();

  res.status(200).json({
    success: true,
    data: financing
  });
});

// Dynamic Currency Pricing Controllers

export const createDynamicPricing = catchAsyncErrors(async (req, res, next) => {
  const { productId, baseCurrency, basePrice, currencies } = req.body;

  // Simulate fetching exchange rates (integrate with real API in production)
  const enhancedCurrencies = await Promise.all(currencies.map(async (currency) => {
    const exchangeRate = await getExchangeRate(baseCurrency, currency.code);
    return {
      code: currency.code,
      symbol: currency.symbol,
      price: basePrice * exchangeRate,
      exchangeRate,
      lastUpdated: Date.now(),
      markup: currency.markup || 0
    };
  }));

  const pricing = await DynamicCurrencyPricing.create({
    product: productId,
    baseCurrency,
    basePrice,
    currencies: enhancedCurrencies,
    autoUpdate: {
      enabled: true,
      frequency: 'hourly',
      lastUpdateAt: Date.now()
    }
  });

  res.status(201).json({
    success: true,
    data: pricing
  });
});

export const updateCurrencyPrices = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const pricing = await DynamicCurrencyPricing.findOne({ product: productId });
  if (!pricing) {
    return next(new ErrorHandler('Dynamic pricing not found', 404));
  }

  // Update all currency prices
  for (let i = 0; i < pricing.currencies.length; i++) {
    const currency = pricing.currencies[i];
    const newRate = await getExchangeRate(pricing.baseCurrency, currency.code);

    // Save to history
    pricing.priceHistory.push({
      currency: currency.code,
      price: currency.price,
      exchangeRate: currency.exchangeRate,
      timestamp: Date.now()
    });

    // Update current price
    pricing.currencies[i].exchangeRate = newRate;
    pricing.currencies[i].price = pricing.basePrice * newRate * (1 + currency.markup / 100);
    pricing.currencies[i].lastUpdated = Date.now();
  }

  pricing.autoUpdate.lastUpdateAt = Date.now();
  await pricing.save();

  res.status(200).json({
    success: true,
    data: pricing
  });
});

export const getProductPriceInCurrency = catchAsyncErrors(async (req, res, next) => {
  const { productId, currency } = req.params;

  const pricing = await DynamicCurrencyPricing.findOne({ product: productId });
  if (!pricing) {
    return next(new ErrorHandler('Product pricing not found', 404));
  }

  const currencyPrice = pricing.currencies.find(c => c.code === currency.toUpperCase());
  if (!currencyPrice) {
    return next(new ErrorHandler(`Currency ${currency} not supported`, 404));
  }

  res.status(200).json({
    success: true,
    data: {
      productId,
      currency: currencyPrice.code,
      price: currencyPrice.price,
      symbol: currencyPrice.symbol,
      exchangeRate: currencyPrice.exchangeRate,
      lastUpdated: currencyPrice.lastUpdated
    }
  });
});

// Installment Plan Controllers

export const createInstallmentPlan = catchAsyncErrors(async (req, res, next) => {
  const { orderId, numberOfInstallments, downPaymentPercent, interestRate } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  const totalAmount = order.totalPrice;
  const downPaymentAmount = (totalAmount * (downPaymentPercent || 0)) / 100;
  const remainingAmount = totalAmount - downPaymentAmount;
  const totalInterest = (remainingAmount * (interestRate || 0) * numberOfInstallments) / 1200;
  const totalPayable = remainingAmount + totalInterest;
  const installmentAmount = totalPayable / numberOfInstallments;

  // Create installment schedule
  const installments = [];
  const today = new Date();
  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() + i + 1);

    installments.push({
      number: i + 1,
      amount: installmentAmount,
      dueDate,
      status: 'pending'
    });
  }

  const plan = await InstallmentPlan.create({
    user: req.user.id,
    order: orderId,
    totalAmount,
    downPayment: downPaymentAmount > 0 ? {
      amount: downPaymentAmount,
      paidAt: Date.now()
    } : undefined,
    numberOfInstallments,
    installmentAmount,
    interestRate: interestRate || 0,
    totalInterest,
    totalPayable,
    installments,
    paymentMethod: req.body.paymentMethod,
    autoPayEnabled: req.body.autoPayEnabled || false
  });

  res.status(201).json({
    success: true,
    data: plan
  });
});

export const getUserInstallmentPlans = catchAsyncErrors(async (req, res, next) => {
  const plans = await InstallmentPlan.find({ user: req.user.id })
    .populate('order')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans
  });
});

export const payInstallment = catchAsyncErrors(async (req, res, next) => {
  const { planId, installmentNumber, transactionId } = req.body;

  const plan = await InstallmentPlan.findOne({
    _id: planId,
    user: req.user.id
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

  installment.status = 'paid';
  installment.paidAmount = installment.amount;
  installment.paidAt = Date.now();
  installment.transactionId = transactionId;

  // Check if all installments are paid
  const allPaid = plan.installments.every(i => i.status === 'paid');
  if (allPaid) {
    plan.status = 'completed';
  }

  await plan.save();

  res.status(200).json({
    success: true,
    data: plan
  });
});

export const calculateEMI = catchAsyncErrors(async (req, res, next) => {
  const { amount, tenure, interestRate } = req.body;

  const monthlyRate = (interestRate || 0) / 1200;
  const totalInterest = (amount * monthlyRate * tenure);
  const totalPayable = amount + totalInterest;
  const emi = totalPayable / tenure;

  res.status(200).json({
    success: true,
    data: {
      principal: amount,
      tenure,
      interestRate: interestRate || 0,
      totalInterest,
      totalPayable,
      emi: Math.round(emi * 100) / 100
    }
  });
});

// Helper function
async function getExchangeRate(from, to) {
  // Simulate exchange rate API call
  // In production, integrate with forex API
  const rates = {
    'USD-EUR': 0.85,
    'USD-GBP': 0.73,
    'USD-INR': 83.12,
    'USD-JPY': 149.50,
    'USD-AUD': 1.52
  };

  return rates[`${from}-${to}`] || 1;
}
