import express from 'express';
import {
  startLiveChat,
  sendMessage,
  endLiveChat,
  getLiveChatHistory,
  rateLiveChat,
  getAgentChats,
  assignAgent,
  getOrderTracking,
  updateOrderTracking,
  startLiveTracking,
  getActiveFlashSales,
  createFlashSale,
  updateFlashSale,
  endFlashSale,
  getProductViewerCount,
  incrementViewerCount,
  decrementViewerCount,
  getProductActivityFeed,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket,
} from '../controllers/realTimeController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Live Chat Routes
router.post('/chat/start', isAuthenticatedUser, startLiveChat);
router.post('/chat/:sessionId/message', isAuthenticatedUser, sendMessage);
router.post('/chat/:sessionId/end', isAuthenticatedUser, endLiveChat);
router.get('/chat/:sessionId', isAuthenticatedUser, getLiveChatHistory);
router.post('/chat/:sessionId/rate', isAuthenticatedUser, rateLiveChat);

// Agent Routes
router.get('/chat/agent/pending', isAuthenticatedUser, authorizeRoles('admin', 'support'), getAgentChats);
router.post('/chat/:sessionId/assign', isAuthenticatedUser, authorizeRoles('admin', 'support'), assignAgent);

// Order Tracking Routes
router.get('/tracking/:orderId', isAuthenticatedUser, getOrderTracking);
router.put('/tracking/:orderId', isAuthenticatedUser, authorizeRoles('admin', 'delivery'), updateOrderTracking);
router.post('/tracking/:orderId/live', isAuthenticatedUser, startLiveTracking);

// Flash Sale Routes
router.get('/flash-sales', getActiveFlashSales);
router.post('/flash-sales', isAuthenticatedUser, authorizeRoles('admin'), createFlashSale);
router.put('/flash-sales/:id', isAuthenticatedUser, authorizeRoles('admin'), updateFlashSale);
router.post('/flash-sales/:id/end', isAuthenticatedUser, authorizeRoles('admin'), endFlashSale);

// Product Viewers Routes
router.get('/viewers/:productId', getProductViewerCount);
router.post('/viewers/:productId/join', incrementViewerCount);
router.post('/viewers/:productId/leave', decrementViewerCount);
router.get('/activity/:productId', getProductActivityFeed);

// Support Tickets
router.get('/tickets', isAuthenticatedUser, getSupportTickets);
router.post('/tickets', isAuthenticatedUser, createSupportTicket);
router.put('/tickets/:id', isAuthenticatedUser, updateSupportTicket);

export default router;
