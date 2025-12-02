import {
  LiveChatSession,
  OrderTracking,
  FlashSale,
  ProductViewer,
  ProductActivity,
  SupportTicket,
} from '../models/RealTimeFeatures.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import { ErrorHandler } from '../utils/errorHandler.js';

// ==================== LIVE CHAT SUPPORT ====================

// @desc    Start live chat session
// @route   POST /api/realtime/chat/start
// @access  Private
export const startLiveChat = catchAsyncErrors(async (req, res) => {
  const { category, relatedOrderId, relatedProductId, initialMessage } = req.body;

  // Check for existing active session
  const existingSession = await LiveChatSession.findOne({
    customer: req.user._id,
    status: { $in: ['waiting', 'active'] },
  });

  if (existingSession) {
    return res.status(200).json({
      success: true,
      data: existingSession,
      message: 'Existing session found',
    });
  }

  const session = await LiveChatSession.create({
    customer: req.user._id,
    category: category || 'general',
    relatedOrder: relatedOrderId,
    relatedProduct: relatedProductId,
    messages: initialMessage ? [{
      role: 'customer',
      content: initialMessage,
    }] : [],
    metadata: {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      page: req.body.currentPage,
    },
  });

  // Emit to available agents via Socket.IO
  if (req.app.get('io')) {
    req.app.get('io').to('support-agents').emit('new-chat', {
      sessionId: session._id,
      customer: req.user.name,
      category,
      message: initialMessage,
    });
  }

  res.status(201).json({
    success: true,
    data: session,
    position: await LiveChatSession.countDocuments({ status: 'waiting' }),
  });
});

// @desc    Send message in chat
// @route   POST /api/realtime/chat/:sessionId/message
// @access  Private
export const sendMessage = catchAsyncErrors(async (req, res) => {
  const { content, attachments } = req.body;
  const session = await LiveChatSession.findById(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Chat session not found',
    });
  }

  const isAgent = session.agent?.toString() === req.user._id.toString();
  const isCustomer = session.customer.toString() === req.user._id.toString();

  if (!isAgent && !isCustomer) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized for this chat',
    });
  }

  const message = {
    role: isAgent ? 'agent' : 'customer',
    content,
    attachments,
  };

  session.messages.push(message);

  // Calculate response time for first agent response
  if (isAgent && !session.responseTime) {
    session.responseTime = Math.floor((new Date() - session.startedAt) / 1000);
  }

  await session.save();

  // Emit message via Socket.IO
  if (req.app.get('io')) {
    req.app.get('io').to(`chat-${session._id}`).emit('chat-message', {
      sessionId: session._id,
      message,
    });
  }

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    End live chat session
// @route   POST /api/realtime/chat/:sessionId/end
// @access  Private
export const endLiveChat = catchAsyncErrors(async (req, res) => {
  const session = await LiveChatSession.findById(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Chat session not found',
    });
  }

  session.status = 'closed';
  session.endedAt = new Date();
  session.messages.push({
    role: 'system',
    content: 'Chat session ended',
  });

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Chat session ended',
  });
});

// @desc    Get chat history
// @route   GET /api/realtime/chat/:sessionId
// @access  Private
export const getLiveChatHistory = catchAsyncErrors(async (req, res) => {
  const session = await LiveChatSession.findById(req.params.sessionId)
    .populate('customer', 'name email avatar')
    .populate('agent', 'name avatar')
    .populate('relatedOrder', 'orderNumber status')
    .populate('relatedProduct', 'name images');

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Chat session not found',
    });
  }

  res.status(200).json({
    success: true,
    data: session,
  });
});

// @desc    Rate live chat
// @route   POST /api/realtime/chat/:sessionId/rate
// @access  Private
export const rateLiveChat = catchAsyncErrors(async (req, res) => {
  const { score, feedback } = req.body;

  const session = await LiveChatSession.findOneAndUpdate(
    { _id: req.params.sessionId, customer: req.user._id },
    {
      rating: {
        score,
        feedback,
        ratedAt: new Date(),
      },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Thank you for your feedback!',
  });
});

// @desc    Get pending chats for agents
// @route   GET /api/realtime/chat/agent/pending
// @access  Private (Admin/Support)
export const getAgentChats = catchAsyncErrors(async (req, res) => {
  const pendingChats = await LiveChatSession.find({
    status: 'waiting',
  })
    .populate('customer', 'name email')
    .sort({ priority: -1, createdAt: 1 })
    .limit(20);

  const myActiveChats = await LiveChatSession.find({
    agent: req.user._id,
    status: 'active',
  })
    .populate('customer', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      pending: pendingChats,
      active: myActiveChats,
    },
  });
});

// @desc    Assign agent to chat
// @route   POST /api/realtime/chat/:sessionId/assign
// @access  Private (Admin/Support)
export const assignAgent = catchAsyncErrors(async (req, res) => {
  const session = await LiveChatSession.findById(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Chat session not found',
    });
  }

  session.agent = req.user._id;
  session.status = 'active';
  session.waitTime = Math.floor((new Date() - session.startedAt) / 1000);
  session.messages.push({
    role: 'system',
    content: `${req.user.name} joined the chat`,
  });

  await session.save();

  // Notify customer via Socket.IO
  if (req.app.get('io')) {
    req.app.get('io').to(`chat-${session._id}`).emit('agent-joined', {
      agentName: req.user.name,
      sessionId: session._id,
    });
  }

  res.status(200).json({
    success: true,
    data: session,
  });
});

// ==================== LIVE ORDER TRACKING ====================

// @desc    Get order tracking info
// @route   GET /api/realtime/tracking/:orderId
// @access  Private
export const getOrderTracking = catchAsyncErrors(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order || order.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  let tracking = await OrderTracking.findOne({ order: req.params.orderId });

  if (!tracking) {
    // Create initial tracking record
    tracking = await OrderTracking.create({
      order: req.params.orderId,
      status: 'preparing',
      statusHistory: [{
        status: 'preparing',
        note: 'Order confirmed and being prepared',
      }],
    });
  }

  res.status(200).json({
    success: true,
    data: {
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        shippingAddress: order.shippingAddress,
      },
      tracking,
    },
  });
});

// @desc    Update order tracking (for delivery partners)
// @route   PUT /api/realtime/tracking/:orderId
// @access  Private (Admin/Delivery)
export const updateOrderTracking = catchAsyncErrors(async (req, res) => {
  const { status, location, note, deliveryPartner, estimatedArrival } = req.body;

  let tracking = await OrderTracking.findOne({ order: req.params.orderId });

  if (!tracking) {
    tracking = await OrderTracking.create({
      order: req.params.orderId,
      status,
      statusHistory: [{ status, note, location }],
    });
  } else {
    if (status) {
      tracking.status = status;
      tracking.statusHistory.push({
        status,
        note,
        location,
      });
    }

    if (location) {
      tracking.currentLocation = {
        ...location,
        timestamp: new Date(),
      };
      tracking.route.push({
        ...location,
        timestamp: new Date(),
      });
    }

    if (deliveryPartner) {
      tracking.deliveryPartner = deliveryPartner;
    }

    if (estimatedArrival) {
      tracking.estimatedArrival = estimatedArrival;
    }

    await tracking.save();
  }

  // Emit tracking update via Socket.IO
  if (req.app.get('io')) {
    req.app.get('io').to(`order-${req.params.orderId}`).emit('tracking-update', {
      orderId: req.params.orderId,
      tracking,
    });
  }

  // Update order status if needed
  if (status === 'delivered') {
    await Order.findByIdAndUpdate(req.params.orderId, { status: 'Delivered' });
    tracking.actualArrival = new Date();
    await tracking.save();
  }

  res.status(200).json({
    success: true,
    data: tracking,
  });
});

// @desc    Start live tracking
// @route   POST /api/realtime/tracking/:orderId/live
// @access  Private
export const startLiveTracking = catchAsyncErrors(async (req, res) => {
  const tracking = await OrderTracking.findOne({ order: req.params.orderId });

  if (!tracking) {
    return res.status(404).json({
      success: false,
      message: 'Tracking not found',
    });
  }

  tracking.isLiveTracking = true;
  await tracking.save();

  res.status(200).json({
    success: true,
    message: 'Live tracking enabled',
    data: tracking,
  });
});

// ==================== FLASH SALES ====================

// @desc    Get active flash sales
// @route   GET /api/realtime/flash-sales
// @access  Public
export const getActiveFlashSales = catchAsyncErrors(async (req, res) => {
  const now = new Date();

  const flashSales = await FlashSale.find({
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gt: now },
  })
    .populate('products.product', 'name images price ratings stock')
    .sort({ endTime: 1 });

  // Update remaining stock based on sold quantities
  const salesWithDetails = flashSales.map(sale => ({
    ...sale.toObject(),
    products: sale.products.map(p => ({
      ...p.toObject(),
      remainingStock: p.stockLimit - p.soldCount,
      percentSold: Math.floor((p.soldCount / p.stockLimit) * 100),
    })),
    timeRemaining: Math.max(0, sale.endTime - now),
    isEnding: (sale.endTime - now) < 3600000, // Less than 1 hour
  }));

  res.status(200).json({
    success: true,
    data: salesWithDetails,
  });
});

// @desc    Create flash sale
// @route   POST /api/realtime/flash-sales
// @access  Private (Admin)
export const createFlashSale = catchAsyncErrors(async (req, res) => {
  const { name, description, startTime, endTime, products, banner } = req.body;

  const flashSale = await FlashSale.create({
    name,
    description,
    startTime,
    endTime,
    products: products.map(p => ({
      product: p.productId,
      salePrice: p.salePrice,
      stockLimit: p.stockLimit,
      maxPerUser: p.maxPerUser || 1,
    })),
    banner,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: flashSale,
  });
});

// @desc    Update flash sale
// @route   PUT /api/realtime/flash-sales/:id
// @access  Private (Admin)
export const updateFlashSale = catchAsyncErrors(async (req, res) => {
  const flashSale = await FlashSale.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!flashSale) {
    return res.status(404).json({
      success: false,
      message: 'Flash sale not found',
    });
  }

  res.status(200).json({
    success: true,
    data: flashSale,
  });
});

// @desc    End flash sale
// @route   POST /api/realtime/flash-sales/:id/end
// @access  Private (Admin)
export const endFlashSale = catchAsyncErrors(async (req, res) => {
  const flashSale = await FlashSale.findByIdAndUpdate(
    req.params.id,
    { isActive: false, endTime: new Date() },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Flash sale ended',
  });
});

// ==================== PRODUCT VIEWERS ====================

// @desc    Get product viewer count
// @route   GET /api/realtime/viewers/:productId
// @access  Public
export const getProductViewerCount = catchAsyncErrors(async (req, res) => {
  let viewer = await ProductViewer.findOne({ product: req.params.productId });

  if (!viewer) {
    viewer = { currentViewers: 0, peakViewers: 0, recentPurchases: 0 };
  }

  res.status(200).json({
    success: true,
    data: {
      currentViewers: viewer.currentViewers,
      peakViewers: viewer.peakViewers,
      recentPurchases: viewer.recentPurchases,
    },
  });
});

// @desc    Increment viewer count
// @route   POST /api/realtime/viewers/:productId/join
// @access  Public
export const incrementViewerCount = catchAsyncErrors(async (req, res) => {
  const { sessionId } = req.body;

  let viewer = await ProductViewer.findOne({ product: req.params.productId });

  if (!viewer) {
    viewer = await ProductViewer.create({
      product: req.params.productId,
      currentViewers: 1,
      peakViewers: 1,
      viewerSessions: [{ sessionId, user: req.user?._id }],
    });
  } else {
    // Check if session already exists
    const existingSession = viewer.viewerSessions.find(s => s.sessionId === sessionId);
    if (!existingSession) {
      viewer.currentViewers += 1;
      viewer.viewerSessions.push({ sessionId, user: req.user?._id });
      if (viewer.currentViewers > viewer.peakViewers) {
        viewer.peakViewers = viewer.currentViewers;
      }
      await viewer.save();
    }
  }

  // Emit viewer count via Socket.IO
  if (req.app.get('io')) {
    req.app.get('io').to(`product-${req.params.productId}`).emit('viewer-update', {
      productId: req.params.productId,
      count: viewer.currentViewers,
    });
  }

  res.status(200).json({
    success: true,
    data: { count: viewer.currentViewers },
  });
});

// @desc    Decrement viewer count
// @route   POST /api/realtime/viewers/:productId/leave
// @access  Public
export const decrementViewerCount = catchAsyncErrors(async (req, res) => {
  const { sessionId } = req.body;

  const viewer = await ProductViewer.findOne({ product: req.params.productId });

  if (viewer) {
    const sessionIndex = viewer.viewerSessions.findIndex(s => s.sessionId === sessionId);
    if (sessionIndex > -1) {
      viewer.viewerSessions.splice(sessionIndex, 1);
      viewer.currentViewers = Math.max(0, viewer.currentViewers - 1);
      await viewer.save();

      // Emit viewer count via Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').to(`product-${req.params.productId}`).emit('viewer-update', {
          productId: req.params.productId,
          count: viewer.currentViewers,
        });
      }
    }
  }

  res.status(200).json({
    success: true,
  });
});

// @desc    Get product activity feed
// @route   GET /api/realtime/activity/:productId
// @access  Public
export const getProductActivityFeed = catchAsyncErrors(async (req, res) => {
  const activities = await ProductActivity.find({ product: req.params.productId })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: activities,
  });
});

// ==================== SUPPORT TICKETS ====================

// @desc    Get user's support tickets
// @route   GET /api/realtime/tickets
// @access  Private
export const getSupportTickets = catchAsyncErrors(async (req, res) => {
  const query = req.user.role === 'admin'
    ? {}
    : { user: req.user._id };

  const tickets = await SupportTicket.find(query)
    .populate('user', 'name email')
    .populate('relatedOrder', 'orderNumber')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: tickets,
  });
});

// @desc    Create support ticket
// @route   POST /api/realtime/tickets
// @access  Private
export const createSupportTicket = catchAsyncErrors(async (req, res) => {
  const { subject, category, priority, message, relatedOrderId } = req.body;

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject,
    category,
    priority: priority || 'medium',
    relatedOrder: relatedOrderId,
    messages: [{
      sender: req.user._id,
      content: message,
    }],
  });

  res.status(201).json({
    success: true,
    data: ticket,
  });
});

// @desc    Update support ticket
// @route   PUT /api/realtime/tickets/:id
// @access  Private
export const updateSupportTicket = catchAsyncErrors(async (req, res) => {
  const { status, message, assignedTo } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found',
    });
  }

  if (status) ticket.status = status;
  if (assignedTo) ticket.assignedTo = assignedTo;
  if (message) {
    ticket.messages.push({
      sender: req.user._id,
      content: message,
      isStaff: req.user.role === 'admin' || req.user.role === 'support',
    });
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    data: ticket,
  });
});

export default {
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
};
