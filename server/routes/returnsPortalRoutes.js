import express from 'express';
const router = express.Router();
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import * as returnsPortalController from '../controllers/returnsPortalController.js';

router.post('/create', isAuthenticatedUser, returnsPortalController.createReturn);
router.get('/me', isAuthenticatedUser, returnsPortalController.getUserReturns);
router.get('/:returnNumber', isAuthenticatedUser, returnsPortalController.getReturn);
router.put('/:returnNumber/status', isAuthenticatedUser, authorizeRoles('admin'), returnsPortalController.updateStatus);
router.post('/:returnNumber/approve', isAuthenticatedUser, authorizeRoles('admin'), returnsPortalController.approveReturn);
router.post('/:returnNumber/reject', isAuthenticatedUser, authorizeRoles('admin'), returnsPortalController.rejectReturn);
router.get('/:returnNumber/refund/calculate', isAuthenticatedUser, returnsPortalController.calculateRefund);
router.get('/pending/all', isAuthenticatedUser, authorizeRoles('admin'), returnsPortalController.getPendingReturns);

export default router;
