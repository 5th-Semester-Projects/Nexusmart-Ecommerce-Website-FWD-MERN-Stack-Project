import CustomerServiceHub from '../models/CustomerServiceHub.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get all tickets
// @route   GET /api/v1/customer-service/tickets
// @access  Private/Admin
export const getAllTickets = catchAsyncErrors(async (req, res, next) => {
  const { businessId, status, priority, assignedTo } = req.query;

  const query = {};
  if (businessId) query.businessId = businessId;
  if (status) query['ticket.status'] = status;
  if (priority) query['ticket.priority'] = priority;
  if (assignedTo) query['ticket.assignedTo.agent'] = assignedTo;

  const tickets = await CustomerServiceHub.find(query)
    .populate('ticket.customer.userId', 'name email')
    .populate('ticket.assignedTo.agent', 'name email')
    .sort({ 'ticket.createdAt': -1 });

  res.status(200).json({
    success: true,
    count: tickets.length,
    tickets
  });
});

// @desc    Get single ticket
// @route   GET /api/v1/customer-service/tickets/:ticketId
// @access  Private
export const getTicket = catchAsyncErrors(async (req, res, next) => {
  const ticket = await CustomerServiceHub.findOne({ 'ticket.ticketId': req.params.ticketId })
    .populate('ticket.customer.userId')
    .populate('ticket.assignedTo.agent')
    .populate('ticket.messages.from.userId');

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  res.status(200).json({
    success: true,
    ticket
  });
});

// @desc    Create ticket
// @route   POST /api/v1/customer-service/tickets
// @access  Public
export const createTicket = catchAsyncErrors(async (req, res, next) => {
  const ticketData = {
    businessId: req.body.businessId,
    ticket: {
      ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...req.body.ticket
    }
  };

  const ticket = await CustomerServiceHub.create(ticketData);

  res.status(201).json({
    success: true,
    ticket
  });
});

// @desc    Update ticket
// @route   PUT /api/v1/customer-service/tickets/:ticketId
// @access  Private
export const updateTicket = catchAsyncErrors(async (req, res, next) => {
  const ticket = await CustomerServiceHub.findOneAndUpdate(
    { 'ticket.ticketId': req.params.ticketId },
    { 'ticket': { ...req.body } },
    { new: true, runValidators: true }
  );

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  res.status(200).json({
    success: true,
    ticket
  });
});

// @desc    Assign ticket to agent
// @route   PUT /api/v1/customer-service/tickets/:ticketId/assign
// @access  Private/Admin
export const assignTicket = catchAsyncErrors(async (req, res, next) => {
  const ticket = await CustomerServiceHub.findOne({ 'ticket.ticketId': req.params.ticketId });

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  ticket.assignTicket(req.body.agentId, req.user._id);
  await ticket.save();

  res.status(200).json({
    success: true,
    ticket
  });
});

// @desc    Add message to ticket
// @route   POST /api/v1/customer-service/tickets/:ticketId/messages
// @access  Private
export const addMessage = catchAsyncErrors(async (req, res, next) => {
  const ticket = await CustomerServiceHub.findOne({ 'ticket.ticketId': req.params.ticketId });

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const { content, isInternal, attachments } = req.body;

  const message = ticket.addMessage(
    req.user._id,
    req.user.name,
    req.user.role,
    content,
    isInternal,
    attachments
  );

  await ticket.save();

  res.status(200).json({
    success: true,
    message
  });
});

// @desc    Resolve ticket
// @route   PUT /api/v1/customer-service/tickets/:ticketId/resolve
// @access  Private/Agent
export const resolveTicket = catchAsyncErrors(async (req, res, next) => {
  const ticket = await CustomerServiceHub.findOne({ 'ticket.ticketId': req.params.ticketId });

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const { resolutionNote, resolutionType } = req.body;

  ticket.resolveTicket(req.user._id, resolutionNote, resolutionType);
  await ticket.save();

  res.status(200).json({
    success: true,
    ticket
  });
});

// @desc    Escalate ticket
// @route   PUT /api/v1/customer-service/tickets/:ticketId/escalate
// @access  Private/Agent
export const escalateTicket = catchAsyncErrors(async (req, res, next) => {
  const ticket = await CustomerServiceHub.findOne({ 'ticket.ticketId': req.params.ticketId });

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const { escalatedTo, escalationReason, escalationLevel } = req.body;

  ticket.escalateTicket(escalatedTo, escalationReason, escalationLevel);
  await ticket.save();

  res.status(200).json({
    success: true,
    ticket
  });
});

// @desc    Check SLA breach
// @route   GET /api/v1/customer-service/tickets/:ticketId/sla-status
// @access  Private
export const checkSLAStatus = catchAsyncErrors(async (req, res, next) => {
  const ticket = await CustomerServiceHub.findOne({ 'ticket.ticketId': req.params.ticketId });

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const slaStatus = ticket.checkSLABreach();
  await ticket.save();

  res.status(200).json({
    success: true,
    slaStatus
  });
});

// @desc    Get open tickets
// @route   GET /api/v1/customer-service/tickets/open/:businessId
// @access  Private/Admin
export const getOpenTickets = catchAsyncErrors(async (req, res, next) => {
  const tickets = await CustomerServiceHub.getOpenTickets(req.params.businessId);

  res.status(200).json({
    success: true,
    count: tickets.length,
    tickets
  });
});

// @desc    Start live chat session
// @route   POST /api/v1/customer-service/chat/start
// @access  Public
export const startChatSession = catchAsyncErrors(async (req, res, next) => {
  const { businessId, customer, page, device } = req.body;

  const chatData = {
    businessId,
    liveChat: {
      enabled: true,
      session: {
        sessionId: `CHAT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        customer,
        status: 'waiting',
        startedAt: Date.now(),
        messages: [],
        page,
        device
      }
    }
  };

  const chat = await CustomerServiceHub.create(chatData);

  res.status(201).json({
    success: true,
    chat
  });
});

// @desc    Send chat message
// @route   POST /api/v1/customer-service/chat/:sessionId/message
// @access  Public
export const sendChatMessage = catchAsyncErrors(async (req, res, next) => {
  const chat = await CustomerServiceHub.findOne({ 'liveChat.session.sessionId': req.params.sessionId });

  if (!chat) {
    return next(new ErrorHandler('Chat session not found', 404));
  }

  const { from, content, type } = req.body;

  chat.liveChat.session.messages.push({
    from,
    content,
    timestamp: Date.now(),
    type: type || 'text',
    read: false
  });

  await chat.save();

  res.status(200).json({
    success: true,
    message: 'Message sent'
  });
});

// @desc    End chat session
// @route   PUT /api/v1/customer-service/chat/:sessionId/end
// @access  Private/Agent
export const endChatSession = catchAsyncErrors(async (req, res, next) => {
  const chat = await CustomerServiceHub.findOne({ 'liveChat.session.sessionId': req.params.sessionId });

  if (!chat) {
    return next(new ErrorHandler('Chat session not found', 404));
  }

  chat.liveChat.session.status = 'ended';
  chat.liveChat.session.endedAt = Date.now();
  chat.liveChat.session.duration = Math.floor(
    (chat.liveChat.session.endedAt - chat.liveChat.session.startedAt) / 1000
  );

  // Add to chat history
  chat.liveChat.chatHistory.push({
    sessionId: chat.liveChat.session.sessionId,
    startedAt: chat.liveChat.session.startedAt,
    endedAt: chat.liveChat.session.endedAt,
    duration: chat.liveChat.session.duration,
    messageCount: chat.liveChat.session.messages.length,
    agent: chat.liveChat.session.agent
  });

  await chat.save();

  res.status(200).json({
    success: true,
    chat
  });
});

// @desc    Get agent performance
// @route   GET /api/v1/customer-service/agent/:agentId/performance
// @access  Private/Admin
export const getAgentPerformance = catchAsyncErrors(async (req, res, next) => {
  const performance = await CustomerServiceHub.getAgentPerformance(
    req.body.businessId,
    req.params.agentId
  );

  res.status(200).json({
    success: true,
    performance
  });
});

// @desc    Get knowledge base articles
// @route   GET /api/v1/customer-service/knowledge-base
// @access  Public
export const getKnowledgeBaseArticles = catchAsyncErrors(async (req, res, next) => {
  const { businessId, category } = req.query;

  const query = { businessId };
  if (category) query['knowledgeBase.category'] = category;

  const hub = await CustomerServiceHub.findOne(query);

  if (!hub) {
    return next(new ErrorHandler('Knowledge base not found', 404));
  }

  const articles = hub.knowledgeBase.filter(a => a.status === 'published');

  res.status(200).json({
    success: true,
    articles
  });
});

// @desc    Create knowledge base article
// @route   POST /api/v1/customer-service/knowledge-base
// @access  Private/Admin
export const createKnowledgeBaseArticle = catchAsyncErrors(async (req, res, next) => {
  const hub = await CustomerServiceHub.findOne({ businessId: req.body.businessId });

  if (!hub) {
    return next(new ErrorHandler('Customer service hub not found', 404));
  }

  const article = {
    articleId: `KB-${Date.now()}`,
    ...req.body.article,
    author: req.user._id,
    publishedAt: Date.now()
  };

  hub.knowledgeBase.push(article);
  await hub.save();

  res.status(201).json({
    success: true,
    article
  });
});
