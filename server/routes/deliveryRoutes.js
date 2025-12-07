import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  checkDeliveryAvailability,
  getDeliverySlots,
  createDeliveryTracking,
  getTrackingDetails,
  updatePartnerLocation,
  updateDeliveryStatus,
  verifyDeliveryOTP,
  sendChatMessage,
  rateDelivery,
  getAllZones,
  createDeliveryZone,
  getAllPartners,
  assignPartner
} from '../controllers/deliveryController.js';

const router = express.Router();

// Public routes
router.get('/check-availability', checkDeliveryAvailability);
router.get('/slots', getDeliverySlots);

// User routes
router.get('/track/:orderId', isAuthenticatedUser, getTrackingDetails);
router.post('/chat/:id', isAuthenticatedUser, sendChatMessage);
router.post('/rate/:id', isAuthenticatedUser, rateDelivery);

// Delivery partner routes
router.put('/partner/location', isAuthenticatedUser, updatePartnerLocation);
router.put('/status/:id', isAuthenticatedUser, updateDeliveryStatus);
router.post('/verify-otp/:id', isAuthenticatedUser, verifyDeliveryOTP);

// Admin routes
router.post('/create', isAuthenticatedUser, authorizeRoles('admin'), createDeliveryTracking);
router.get('/admin/zones', isAuthenticatedUser, authorizeRoles('admin'), getAllZones);
router.post('/admin/zones', isAuthenticatedUser, authorizeRoles('admin'), createDeliveryZone);
router.get('/admin/partners', isAuthenticatedUser, authorizeRoles('admin'), getAllPartners);
router.put('/admin/assign/:id', isAuthenticatedUser, authorizeRoles('admin'), assignPartner);

export default router;
