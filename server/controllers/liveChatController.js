import LiveChat from '../models/LiveChat.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Live Chat Controllers

export const startLiveChatSession = catchAsyncErrors(async (req, res, next) => {
  const { metadata } = req.body;

  const sessionId = `CHAT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const chatSession = await LiveChat.create({
    sessionId,
    customer: req.user.id,
    status: 'waiting',
    metadata: {
      source: metadata?.source || 'website',
      currentPage: metadata?.currentPage,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip
    },
    priority: 'medium'
  });

  // Emit socket event for agents
  const io = req.app.get('io');
  if (io) {
    io.emit('new_chat_request', {
      sessionId: chatSession.sessionId,
      customer: req.user.id,
      priority: chatSession.priority
    });
  }

  res.status(201).json({
    success: true,
    data: chatSession
  });
});

export const assignAgentToChat = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;

  const chatSession = await LiveChat.findOne({ sessionId });

  if (!chatSession) {
    return next(new ErrorHandler('Chat session not found', 404));
  }

  chatSession.agent = req.user.id;
  chatSession.status = 'active';
  chatSession.timing.assignedAt = Date.now();
  chatSession.timing.waitTime = Date.now() - chatSession.timing.startedAt;

  await chatSession.save();

  // Notify customer
  const io = req.app.get('io');
  if (io) {
    io.to(sessionId).emit('agent_assigned', {
      agent: req.user.name,
      message: 'An agent has joined the chat'
    });
  }

  res.status(200).json({
    success: true,
    data: chatSession
  });
});

export const sendChatMessage = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;
  const { message, type, fileUrl, productId, orderId } = req.body;

  const chatSession = await LiveChat.findOne({ sessionId });

  if (!chatSession) {
    return next(new ErrorHandler('Chat session not found', 404));
  }

  const newMessage = {
    sender: req.user.id,
    senderType: chatSession.customer.toString() === req.user.id.toString() ? 'customer' : 'agent',
    message: {
      text: message,
      type: type || 'text',
      fileUrl,
      productId,
      orderId
    },
    timestamp: Date.now(),
    read: false
  };

  chatSession.messages.push(newMessage);

  // Update first response time
  if (!chatSession.timing.firstResponseAt && newMessage.senderType === 'agent') {
    chatSession.timing.firstResponseAt = Date.now();
    chatSession.timing.responseTime = Date.now() - chatSession.timing.startedAt;
  }

  await chatSession.save();

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(sessionId).emit('new_message', newMessage);
  }

  res.status(200).json({
    success: true,
    data: newMessage
  });
});

export const getChatHistory = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;

  const chatSession = await LiveChat.findOne({ sessionId })
    .populate('customer', 'name email avatar')
    .populate('agent', 'name email avatar')
    .populate('messages.sender', 'name');

  if (!chatSession) {
    return next(new ErrorHandler('Chat session not found', 404));
  }

  res.status(200).json({
    success: true,
    data: chatSession
  });
});

export const endChatSession = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;

  const chatSession = await LiveChat.findOne({ sessionId });

  if (!chatSession) {
    return next(new ErrorHandler('Chat session not found', 404));
  }

  chatSession.status = 'resolved';
  chatSession.timing.resolvedAt = Date.now();
  chatSession.timing.closedAt = Date.now();
  chatSession.timing.totalDuration = Date.now() - chatSession.timing.startedAt;

  await chatSession.save();

  res.status(200).json({
    success: true,
    message: 'Chat session ended',
    data: chatSession
  });
});

export const rateChatSession = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;
  const { score, feedback } = req.body;

  const chatSession = await LiveChat.findOne({ sessionId });

  if (!chatSession) {
    return next(new ErrorHandler('Chat session not found', 404));
  }

  chatSession.rating = {
    score,
    feedback,
    ratedAt: Date.now()
  };

  await chatSession.save();

  res.status(200).json({
    success: true,
    message: 'Rating submitted'
  });
});

export const getAgentChats = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.query;

  const filter = { agent: req.user.id };
  if (status) filter.status = status;

  const chats = await LiveChat.find(filter)
    .populate('customer', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: chats.length,
    data: chats
  });
});

export const getCustomerChats = catchAsyncErrors(async (req, res, next) => {
  const chats = await LiveChat.find({ customer: req.user.id })
    .populate('agent', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: chats.length,
    data: chats
  });
});
