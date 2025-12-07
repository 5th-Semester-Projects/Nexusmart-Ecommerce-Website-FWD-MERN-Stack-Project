import express from 'express';
import {
  startLiveChatSession,
  assignAgentToChat,
  sendChatMessage,
  getChatHistory,
  endChatSession,
  rateChatSession,
  getAgentChats,
  getCustomerChats
} from '../controllers/liveChatController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Customer endpoints
router.post('/start', isAuthenticatedUser, startLiveChatSession);
router.get('/my-chats', isAuthenticatedUser, getCustomerChats);

// Agent endpoints
router.post('/:sessionId/assign', isAuthenticatedUser, authorizeRoles('admin', 'support'), assignAgentToChat);
router.get('/agent/chats', isAuthenticatedUser, authorizeRoles('admin', 'support'), getAgentChats);

// Shared endpoints
router.post('/:sessionId/message', isAuthenticatedUser, sendChatMessage);
router.get('/:sessionId/history', isAuthenticatedUser, getChatHistory);
router.post('/:sessionId/end', isAuthenticatedUser, endChatSession);
router.post('/:sessionId/rate', isAuthenticatedUser, rateChatSession);

export default router;
