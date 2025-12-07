import mongoose from 'mongoose';

/**
 * Buy Now Pay Later (BNPL) Model
 */

const bnplApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },

  // Credit Assessment
  creditLimit: {
    type: Number,
    default: 0
  },
  availableCredit: {
    type: Number,
    default: 0
  },
  creditScore: Number,
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Personal Info (for credit check)
  dateOfBirth: Date,
  ssn: String, // Encrypted
  annualIncome: Number,
  employmentStatus: {
    type: String,
    enum: ['employed', 'self-employed', 'unemployed', 'student', 'retired']
  },
  employer: String,

  // Verification
  identityVerified: { type: Boolean, default: false },
  incomeVerified: { type: Boolean, default: false },

  // Terms
  agreedToTerms: { type: Boolean, default: false },
  termsAgreedAt: Date,

  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  expiresAt: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * BNPL Installment Plan
 */
const installmentPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  // Plan Details
  totalAmount: {
    type: Number,
    required: true
  },
  downPayment: {
    type: Number,
    default: 0
  },
  financedAmount: Number,

  // Installments
  numberOfInstallments: {
    type: Number,
    required: true,
    enum: [3, 4, 6, 12]
  },
  installmentAmount: Number,

  // Interest/Fees
  interestRate: {
    type: Number,
    default: 0 // 0 for interest-free
  },
  processingFee: {
    type: Number,
    default: 0
  },
  totalInterest: Number,
  totalPayable: Number,

  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'defaulted', 'cancelled'],
    default: 'active'
  },

  // Schedule
  startDate: {
    type: Date,
    default: Date.now
  },
  installments: [{
    number: Number,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'failed'],
      default: 'pending'
    },
    paidAt: Date,
    paidAmount: Number,
    paymentMethod: String,
    transactionId: String,
    lateFee: { type: Number, default: 0 },
    remindersSent: { type: Number, default: 0 },
    lastReminderAt: Date
  }],

  // Payment Method
  paymentMethod: {
    type: { type: String, enum: ['card', 'bank_account'] },
    last4: String,
    brand: String
  },
  autoDebit: { type: Boolean, default: true },

  // Tracking
  paidInstallments: { type: Number, default: 0 },
  remainingAmount: Number,
  nextDueDate: Date,

  // Late Payments
  missedPayments: { type: Number, default: 0 },
  totalLateFees: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate installment schedule
installmentPlanSchema.methods.generateSchedule = function () {
  const installments = [];
  const amount = this.financedAmount / this.numberOfInstallments;
  const startDate = new Date(this.startDate);

  for (let i = 1; i <= this.numberOfInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    installments.push({
      number: i,
      amount: Math.round(amount * 100) / 100,
      dueDate,
      status: 'pending'
    });
  }

  this.installments = installments;
  this.installmentAmount = amount;
  this.nextDueDate = installments[0].dueDate;
  this.remainingAmount = this.financedAmount;

  return installments;
};

export const BNPLApplication = mongoose.model('BNPLApplication', bnplApplicationSchema);
export const InstallmentPlan = mongoose.model('InstallmentPlan', installmentPlanSchema);
