import express from 'express';
const router = express.Router();
import * as virtualTryOnController from '../controllers/virtualTryOnController.js';

router.post('/session/create', virtualTryOnController.createSession);
router.get('/session/:sessionId', virtualTryOnController.getSession);
router.post('/session/:sessionId/interaction', virtualTryOnController.trackInteraction);
router.post('/session/:sessionId/share', virtualTryOnController.generateShareLink);
router.get('/popular', virtualTryOnController.getPopularTryOns);
router.get('/product/:productId/conversion', virtualTryOnController.getConversionRate);

export default router;
