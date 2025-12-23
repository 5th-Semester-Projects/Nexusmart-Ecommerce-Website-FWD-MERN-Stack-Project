import mongoose from 'mongoose';
import InstallmentPlan from './InstallmentPlan.js';

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

export const BNPLApplication = mongoose.models.BNPLApplication || mongoose.model('BNPLApplication', bnplApplicationSchema);
export { InstallmentPlan };
