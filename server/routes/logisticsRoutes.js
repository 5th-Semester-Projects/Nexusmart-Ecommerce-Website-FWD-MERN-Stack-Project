import express from 'express';
import {
  requestCrowdsourcedDelivery,
  trackCrowdsourcedDelivery,
  findNearbyLockers,
  scheduleLockerDelivery,
  calculateCarbonFootprint,
  purchaseCarbonOffset,
  scheduleReturnPickup,
  getUserReturns
} from '../controllers/logisticsController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Crowdsourced Delivery
router.post('/crowdsourced/request', isAuthenticatedUser, requestCrowdsourcedDelivery);
router.get('/crowdsourced/track/:orderId', isAuthenticatedUser, trackCrowdsourcedDelivery);

// Locker Network
router.get('/lockers/nearby', findNearbyLockers);
router.post('/lockers/schedule', isAuthenticatedUser, scheduleLockerDelivery);

// Green Delivery
router.get('/green/calculate/:orderId', isAuthenticatedUser, calculateCarbonFootprint);
router.post('/green/offset', isAuthenticatedUser, purchaseCarbonOffset);

// Returns Aggregation
router.post('/returns/schedule-pickup', isAuthenticatedUser, scheduleReturnPickup);
router.get('/returns/my-returns', isAuthenticatedUser, getUserReturns);

export default router;
