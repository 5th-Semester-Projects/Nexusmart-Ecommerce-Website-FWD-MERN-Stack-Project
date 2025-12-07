import express from 'express';
import {
  getAllTickets,
  getTicket,
  createTicket,
  updateTicket,
  assignTicket,
  addMessage,
  resolveTicket,
  escalateTicket,
  checkSLAStatus,
  getOpenTickets,
  startChatSession,
  sendChatMessage,
  endChatSession,
  getAgentPerformance,
  getKnowledgeBaseArticles,
  createKnowledgeBaseArticle
} from '../controllers/customerServiceHubController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/customer-service/tickets')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'agent'), getAllTickets)
  .post(createTicket);

router.route('/customer-service/tickets/:ticketId')
  .get(isAuthenticatedUser, getTicket)
  .put(isAuthenticatedUser, updateTicket);

router.route('/customer-service/tickets/:ticketId/assign')
  .put(isAuthenticatedUser, authorizeRoles('admin', 'agent'), assignTicket);

router.route('/customer-service/tickets/:ticketId/messages')
  .post(isAuthenticatedUser, addMessage);

router.route('/customer-service/tickets/:ticketId/resolve')
  .put(isAuthenticatedUser, authorizeRoles('admin', 'agent'), resolveTicket);

router.route('/customer-service/tickets/:ticketId/escalate')
  .put(isAuthenticatedUser, authorizeRoles('admin', 'agent'), escalateTicket);

router.route('/customer-service/tickets/:ticketId/sla-status')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'agent'), checkSLAStatus);

router.route('/customer-service/tickets/open/:businessId')
  .get(isAuthenticatedUser, authorizeRoles('admin', 'agent'), getOpenTickets);

router.route('/customer-service/chat/start')
  .post(startChatSession);

router.route('/customer-service/chat/:sessionId/message')
  .post(sendChatMessage);

router.route('/customer-service/chat/:sessionId/end')
  .put(isAuthenticatedUser, authorizeRoles('admin', 'agent'), endChatSession);

router.route('/customer-service/agent/:agentId/performance')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAgentPerformance);

router.route('/customer-service/knowledge-base')
  .get(getKnowledgeBaseArticles)
  .post(isAuthenticatedUser, authorizeRoles('admin', 'agent'), createKnowledgeBaseArticle);

export default router;
