import express from 'express';
import {
  requestInvoiceFinancing,
  getBusinessFinancing,
  approveFinancing,
  createDynamicPricing,
  updateCurrencyPrices,
  getProductPriceInCurrency,
  createInstallmentPlan,
  getUserInstallmentPlans,
  payInstallment,
  calculateEMI
} from '../controllers/advancedPaymentController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Invoice Financing
router.post('/invoice/request', isAuthenticatedUser, authorizeRoles('seller', 'business'), requestInvoiceFinancing);
router.get('/invoice/my-financings', isAuthenticatedUser, getBusinessFinancing);
router.put('/invoice/approve/:id', isAuthenticatedUser, authorizeRoles('admin'), approveFinancing);

// Dynamic Currency
router.post('/currency/create', isAuthenticatedUser, authorizeRoles('admin', 'seller'), createDynamicPricing);
router.put('/currency/update/:productId', updateCurrencyPrices);
router.get('/currency/:productId/:currency', getProductPriceInCurrency);

// Installments
router.post('/installment/create', isAuthenticatedUser, createInstallmentPlan);
router.get('/installment/my-plans', isAuthenticatedUser, getUserInstallmentPlans);
router.post('/installment/pay', isAuthenticatedUser, payInstallment);
router.post('/installment/calculate-emi', calculateEMI);

export default router;
