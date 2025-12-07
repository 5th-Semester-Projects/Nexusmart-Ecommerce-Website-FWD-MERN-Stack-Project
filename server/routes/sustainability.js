import express from 'express';
import * as sustainabilityController from '../controllers/sustainabilityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Carbon Footprint Routes
router.get('/carbon/product/:productId', sustainabilityController.calculateProductCarbonFootprint);
router.get('/carbon/order/:orderId', authenticate, sustainabilityController.calculateOrderCarbonFootprint);
router.post('/carbon/offset', authenticate, sustainabilityController.purchaseCarbonOffset);

// Eco Badges Routes
router.post('/eco-badge/assign', authenticate, sustainabilityController.assignEcoBadge);
router.get('/eco-badge/products', sustainabilityController.getEcoFriendlyProducts);

// Sustainable Packaging Routes
router.get('/packaging/options', sustainabilityController.getPackagingOptions);
router.post('/packaging/select', authenticate, sustainabilityController.selectPackaging);

// Green Shipping Routes
router.get('/shipping/green-options', sustainabilityController.getGreenShippingOptions);

// Sustainability Dashboard Routes
router.get('/dashboard', authenticate, sustainabilityController.getSustainabilityDashboard);

export default router;
