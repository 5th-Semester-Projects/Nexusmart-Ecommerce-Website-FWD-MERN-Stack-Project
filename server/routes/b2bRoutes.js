import express from 'express';
import {
  createRFQ,
  sendQuote,
  acceptQuote,
  createContract,
  signContract,
  createApprovalRequest,
  approveRequest,
  createVolumeDiscount,
  calculateVolumeDiscount
} from '../controllers/b2bController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Quote Management
router.post('/quote/create', isAuthenticatedUser, authorizeRoles('business', 'seller'), createRFQ);
router.post('/quote/send/:id', isAuthenticatedUser, sendQuote);
router.post('/quote/accept/:id', isAuthenticatedUser, acceptQuote);

// Contract Management
router.post('/contract/create', isAuthenticatedUser, authorizeRoles('business'), createContract);
router.post('/contract/sign/:id', isAuthenticatedUser, signContract);

// Approval Workflow
router.post('/approval/create', isAuthenticatedUser, createApprovalRequest);
router.post('/approval/approve/:id', isAuthenticatedUser, approveRequest);

// Volume Discounting
router.post('/discount/create', isAuthenticatedUser, authorizeRoles('admin', 'seller'), createVolumeDiscount);
router.get('/discount/calculate', calculateVolumeDiscount);

export default router;
