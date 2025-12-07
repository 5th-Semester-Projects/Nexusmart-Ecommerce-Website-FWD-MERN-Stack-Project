import QuoteManagement from '../models/QuoteManagement.js';
import ContractManagement from '../models/ContractManagement.js';
import ApprovalWorkflow from '../models/ApprovalWorkflow.js';
import VolumeDiscounting from '../models/VolumeDiscounting.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Quote Management Controllers

export const createRFQ = catchAsyncErrors(async (req, res, next) => {
  const { rfq, items, terms } = req.body;

  const quoteNumber = generateQuoteNumber();

  // Calculate pricing
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const total = subtotal + (subtotal * 0.1); // 10% tax

  const quote = await QuoteManagement.create({
    business: req.user.id,
    quoteNumber,
    rfq,
    items,
    pricing: {
      subtotal,
      tax: subtotal * 0.1,
      total,
      currency: 'USD'
    },
    terms: terms || {},
    status: 'draft'
  });

  res.status(201).json({
    success: true,
    data: quote
  });
});

export const sendQuote = catchAsyncErrors(async (req, res, next) => {
  const quote = await QuoteManagement.findOne({
    _id: req.params.id,
    business: req.user.id
  });

  if (!quote) {
    return next(new ErrorHandler('Quote not found', 404));
  }

  quote.status = 'sent';
  quote.workflow.push({
    stage: 'sent',
    user: req.user.id,
    action: 'Quote sent to customer',
    timestamp: Date.now()
  });

  await quote.save();

  res.status(200).json({
    success: true,
    data: quote
  });
});

export const acceptQuote = catchAsyncErrors(async (req, res, next) => {
  const quote = await QuoteManagement.findById(req.params.id);

  if (!quote) {
    return next(new ErrorHandler('Quote not found', 404));
  }

  quote.status = 'accepted';
  quote.workflow.push({
    stage: 'accepted',
    user: req.user.id,
    action: 'Quote accepted by customer',
    timestamp: Date.now()
  });

  await quote.save();

  res.status(200).json({
    success: true,
    data: quote
  });
});

// Contract Management Controllers

export const createContract = catchAsyncErrors(async (req, res, next) => {
  const { sellerId, type, title, description, terms, value } = req.body;

  const contractNumber = generateContractNumber();

  const contract = await ContractManagement.create({
    parties: {
      buyer: req.user.id,
      seller: sellerId
    },
    contractNumber,
    type,
    title,
    description,
    terms,
    value,
    status: 'draft'
  });

  res.status(201).json({
    success: true,
    data: contract
  });
});

export const signContract = catchAsyncErrors(async (req, res, next) => {
  const { signature, signatureType } = req.body;

  const contract = await ContractManagement.findById(req.params.id);

  if (!contract) {
    return next(new ErrorHandler('Contract not found', 404));
  }

  // Check if user is a party to the contract
  const isParty =
    contract.parties.buyer.toString() === req.user.id ||
    contract.parties.seller.toString() === req.user.id;

  if (!isParty) {
    return next(new ErrorHandler('Not authorized to sign this contract', 403));
  }

  contract.signatures.push({
    party: req.user.id,
    signedAt: Date.now(),
    signature,
    signatureType: signatureType || 'electronic',
    verified: true
  });

  // Check if all parties have signed
  const allSigned = contract.signatures.length >= 2;
  if (allSigned) {
    contract.status = 'active';
  } else {
    contract.status = 'pending_signature';
  }

  await contract.save();

  res.status(200).json({
    success: true,
    data: contract
  });
});

// Approval Workflow Controllers

export const createApprovalRequest = catchAsyncErrors(async (req, res, next) => {
  const { type, referenceId, amount, description, workflowTemplate } = req.body;

  // Define workflow levels based on amount
  const workflow = getWorkflowLevels(amount, type);

  const approval = await ApprovalWorkflow.create({
    request: {
      type,
      referenceId,
      amount,
      currency: 'USD',
      requestedBy: req.user.id,
      description
    },
    workflow: {
      template: workflowTemplate || 'standard',
      levels: workflow
    },
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: approval
  });
});

export const approveRequest = catchAsyncErrors(async (req, res, next) => {
  const { comments } = req.body;

  const approval = await ApprovalWorkflow.findById(req.params.id);

  if (!approval) {
    return next(new ErrorHandler('Approval request not found', 404));
  }

  // Check if user is an approver for current level
  const currentLevel = approval.workflow.levels.find(l => l.level === approval.currentLevel);
  const isApprover = currentLevel.approvers.some(a => a.user.toString() === req.user.id);

  if (!isApprover) {
    return next(new ErrorHandler('Not authorized to approve', 403));
  }

  approval.approvals.push({
    level: approval.currentLevel,
    approver: req.user.id,
    status: 'approved',
    comments,
    timestamp: Date.now()
  });

  // Check if we need to move to next level
  if (approval.currentLevel < approval.workflow.levels.length) {
    approval.currentLevel++;
    approval.status = 'in_progress';
  } else {
    approval.status = 'approved';
    approval.finalDecision = {
      decision: 'approved',
      decidedAt: Date.now(),
      decidedBy: req.user.id
    };
  }

  await approval.save();

  res.status(200).json({
    success: true,
    data: approval
  });
});

// Volume Discounting Controllers

export const createVolumeDiscount = catchAsyncErrors(async (req, res, next) => {
  const { productId, discountType, tiers, conditions } = req.body;

  const discount = await VolumeDiscounting.create({
    product: productId,
    discountType,
    tiers,
    conditions: conditions || {},
    status: 'active'
  });

  res.status(201).json({
    success: true,
    data: discount
  });
});

export const calculateVolumeDiscount = catchAsyncErrors(async (req, res, next) => {
  const { productId, quantity } = req.query;

  const discount = await VolumeDiscounting.findOne({
    product: productId,
    status: 'active'
  });

  if (!discount) {
    return res.status(200).json({
      success: true,
      data: {
        hasDiscount: false,
        discount: 0
      }
    });
  }

  // Find applicable tier
  const applicableTier = discount.tiers
    .filter(t => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity))
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  if (!applicableTier) {
    return res.status(200).json({
      success: true,
      data: {
        hasDiscount: false,
        discount: 0
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      hasDiscount: true,
      discount: applicableTier.discount,
      tierDescription: applicableTier.description
    }
  });
});

// Helper functions
function generateQuoteNumber() {
  return 'Q-' + Date.now() + '-' + Math.random().toString(36).substring(7).toUpperCase();
}

function generateContractNumber() {
  return 'CNT-' + Date.now() + '-' + Math.random().toString(36).substring(7).toUpperCase();
}

function getWorkflowLevels(amount, type) {
  if (amount < 1000) {
    return [{
      level: 1,
      name: 'Manager Approval',
      approvers: [],
      requireAll: false
    }];
  } else if (amount < 10000) {
    return [
      {
        level: 1,
        name: 'Manager Approval',
        approvers: [],
        requireAll: false
      },
      {
        level: 2,
        name: 'Director Approval',
        approvers: [],
        requireAll: false
      }
    ];
  } else {
    return [
      {
        level: 1,
        name: 'Manager Approval',
        approvers: [],
        requireAll: false
      },
      {
        level: 2,
        name: 'Director Approval',
        approvers: [],
        requireAll: false
      },
      {
        level: 3,
        name: 'Executive Approval',
        approvers: [],
        requireAll: false
      }
    ];
  }
}
