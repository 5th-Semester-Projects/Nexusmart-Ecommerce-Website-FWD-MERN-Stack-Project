import LiveShopping from '../models/LiveShopping.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Create live shopping event
export const createEvent = catchAsyncErrors(async (req, res, next) => {
  const {
    title,
    description,
    schedule,
    products,
    streamProvider
  } = req.body;

  // Generate stream credentials
  const streamCredentials = await generateStreamCredentials(streamProvider);

  const event = await LiveShopping.create({
    title,
    description,
    host: {
      type: req.user.role === 'seller' ? 'seller' : 'internal',
      id: req.user.id,
      name: req.user.name,
      avatar: req.user.avatar,
      verified: req.user.verified
    },
    schedule,
    products,
    stream: {
      provider: streamProvider,
      streamKey: streamCredentials.streamKey,
      streamUrl: streamCredentials.streamUrl,
      playbackUrl: streamCredentials.playbackUrl,
      rtmpUrl: streamCredentials.rtmpUrl
    },
    features: {
      chat: {
        enabled: true,
        moderators: [req.user.id],
        bannedUsers: []
      }
    }
  });

  res.status(201).json({
    success: true,
    event,
    streamCredentials
  });
});

// Get live shopping events
export const getEvents = catchAsyncErrors(async (req, res, next) => {
  const { status, upcoming, live } = req.query;

  let query = {};

  if (status) {
    query.status = status;
  } else if (upcoming) {
    query.status = 'scheduled';
    query['schedule.startTime'] = { $gt: new Date() };
  } else if (live) {
    query.status = 'live';
  }

  const events = await LiveShopping.find(query)
    .populate('products.product')
    .sort({ 'schedule.startTime': -1 });

  res.status(200).json({
    success: true,
    count: events.length,
    events
  });
});

// Get single event
export const getEvent = catchAsyncErrors(async (req, res, next) => {
  const event = await LiveShopping.findById(req.params.id)
    .populate('products.product');

  if (!event) {
    return next(new ErrorHandler('Event not found', 404));
  }

  // Increment total viewers if accessing for first time
  if (req.user) {
    event.viewers.total += 1;
    await event.save();
  }

  res.status(200).json({
    success: true,
    event
  });
});

// Start live stream
export const startStream = catchAsyncErrors(async (req, res, next) => {
  const event = await LiveShopping.findById(req.params.id);

  if (!event) {
    return next(new ErrorHandler('Event not found', 404));
  }

  if (event.host.id.toString() !== req.user.id) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  event.status = 'live';
  event.schedule.startTime = Date.now();
  await event.save();

  // Send notifications to followers
  await sendLiveNotifications(event);

  res.status(200).json({
    success: true,
    message: 'Stream started successfully',
    event
  });
});

// End live stream
export const endStream = catchAsyncErrors(async (req, res, next) => {
  const event = await LiveShopping.findById(req.params.id);

  if (!event) {
    return next(new ErrorHandler('Event not found', 404));
  }

  if (event.host.id.toString() !== req.user.id) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  event.status = 'ended';
  event.schedule.endTime = Date.now();
  event.schedule.duration = Math.floor((Date.now() - new Date(event.schedule.startTime)) / 60000);

  // Calculate analytics
  event.analytics = calculateEventAnalytics(event);

  await event.save();

  res.status(200).json({
    success: true,
    message: 'Stream ended successfully',
    analytics: event.analytics
  });
});

// Add comment to live chat
export const addComment = catchAsyncErrors(async (req, res, next) => {
  const { eventId, message } = req.body;

  const event = await LiveShopping.findById(eventId);

  if (!event) {
    return next(new ErrorHandler('Event not found', 404));
  }

  // Check if user is banned
  if (event.features.chat.bannedUsers.includes(req.user.id)) {
    return next(new ErrorHandler('You are banned from this chat', 403));
  }

  const comment = {
    user: req.user.id,
    username: req.user.name,
    message,
    timestamp: Date.now(),
    pinned: false,
    moderated: false
  };

  event.engagement.comments.push(comment);
  await event.save();

  // Broadcast to all viewers via WebSocket
  broadcastComment(eventId, comment);

  res.status(201).json({
    success: true,
    comment
  });
});

// Add reaction
export const addReaction = catchAsyncErrors(async (req, res, next) => {
  const { eventId, reactionType } = req.body;

  const event = await LiveShopping.findById(eventId);

  if (!event) {
    return next(new ErrorHandler('Event not found', 404));
  }

  if (reactionType === 'like') {
    event.engagement.likes += 1;
  } else {
    if (!event.engagement.reactions) {
      event.engagement.reactions = {};
    }
    event.engagement.reactions[reactionType] = (event.engagement.reactions[reactionType] || 0) + 1;
  }

  await event.save();

  // Broadcast reaction
  broadcastReaction(eventId, reactionType);

  res.status(200).json({
    success: true,
    engagement: event.engagement
  });
});

// Create flash deal during live
export const createFlashDeal = catchAsyncErrors(async (req, res, next) => {
  const { eventId, productId, dealPrice, duration, quantity } = req.body;

  const event = await LiveShopping.findById(eventId);

  if (!event) {
    return next(new ErrorHandler('Event not found', 404));
  }

  if (event.host.id.toString() !== req.user.id) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  const product = await Product.findById(productId);

  const flashDeal = {
    product: productId,
    originalPrice: product.price,
    dealPrice,
    startTime: Date.now(),
    endTime: new Date(Date.now() + duration * 60000), // duration in minutes
    quantity,
    claimed: 0
  };

  event.features.flashDeals.push(flashDeal);
  await event.save();

  // Notify all viewers
  notifyFlashDeal(eventId, flashDeal);

  res.status(201).json({
    success: true,
    flashDeal
  });
});

// Purchase during live stream
export const livePurchase = catchAsyncErrors(async (req, res, next) => {
  const { eventId, productId, quantity } = req.body;

  const event = await LiveShopping.findById(eventId);

  if (!event) {
    return next(new ErrorHandler('Event not found', 404));
  }

  // Find product in event
  const eventProduct = event.products.find(
    p => p.product.toString() === productId
  );

  if (!eventProduct) {
    return next(new ErrorHandler('Product not in this event', 404));
  }

  // Check special price
  const price = eventProduct.specialPrice || eventProduct.product.price;

  // Create order (simplified)
  // In real implementation, this would go through full order creation flow

  // Update event statistics
  eventProduct.soldDuringLive += quantity;
  event.purchases.totalOrders += 1;
  event.purchases.totalRevenue += price * quantity;

  const orderStats = event.purchases.ordersByProduct.find(
    o => o.product.toString() === productId
  );

  if (orderStats) {
    orderStats.count += 1;
    orderStats.revenue += price * quantity;
  } else {
    event.purchases.ordersByProduct.push({
      product: productId,
      count: 1,
      revenue: price * quantity
    });
  }

  await event.save();

  // Show purchase notification to viewers
  showPurchaseNotification(eventId, req.user.name, eventProduct.product);

  res.status(201).json({
    success: true,
    message: 'Purchase successful!',
    orderDetails: {
      product: productId,
      quantity,
      price
    }
  });
});

// Update viewer count
export const updateViewers = catchAsyncErrors(async (req, res, next) => {
  const { eventId, action } = req.body;

  const event = await LiveShopping.findById(eventId);

  if (!event) {
    return next(new ErrorHandler('Event not found', 404));
  }

  if (action === 'join') {
    event.viewers.current += 1;
    if (event.viewers.current > event.viewers.peak) {
      event.viewers.peak = event.viewers.current;
    }
  } else if (action === 'leave') {
    event.viewers.current = Math.max(0, event.viewers.current - 1);
  }

  await event.save();

  res.status(200).json({
    success: true,
    viewers: event.viewers
  });
});

// Helper Functions
async function generateStreamCredentials(provider) {
  // Integrate with actual streaming service APIs (AWS IVS, Agora, Twilio, Mux)
  const streamingService = process.env.STREAMING_SERVICE || 'agora';
  const streamingDomain = process.env.STREAMING_DOMAIN || 'live.nexusmart.app';

  return {
    streamKey: `sk_${Math.random().toString(36).substring(7)}`,
    streamUrl: `rtmps://${streamingDomain}/app/${Math.random().toString(36).substring(7)}`,
    playbackUrl: `https://${streamingDomain}/${Math.random().toString(36).substring(7)}`,
    rtmpUrl: `rtmp://${streamingDomain}/app`
  };
}

async function sendLiveNotifications(event) {
  // Send push notifications to followers
  console.log(`Sending live notifications for event: ${event.title}`);
}

function broadcastComment(eventId, comment) {
  // WebSocket broadcast
  console.log(`Broadcasting comment to event ${eventId}`);
}

function broadcastReaction(eventId, reaction) {
  // WebSocket broadcast
  console.log(`Broadcasting reaction to event ${eventId}`);
}

function notifyFlashDeal(eventId, deal) {
  // Notify all viewers about flash deal
  console.log(`Flash deal created in event ${eventId}`);
}

function showPurchaseNotification(eventId, userName, product) {
  // Show "X just bought this product" notification
  console.log(`${userName} purchased during live event`);
}

function calculateEventAnalytics(event) {
  const totalComments = event.engagement.comments.length;
  const totalReactions = event.engagement.likes;
  const conversionRate = event.viewers.total > 0
    ? (event.purchases.totalOrders / event.viewers.total * 100).toFixed(2)
    : 0;

  // Calculate actual average watch time from viewer data
  const totalWatchTime = event.viewers.concurrent.reduce((sum, v) => sum + v.duration, 0);
  const averageWatchTime = event.viewers.total > 0
    ? Math.round(totalWatchTime / event.viewers.total)
    : Math.round(event.schedule.duration / 2);

  return {
    averageWatchTime,
    engagementRate: totalComments + totalReactions / event.viewers.total * 100,
    conversionRate,
    clickThroughRate: event.products.length > 0
      ? (event.purchases.totalOrders / event.products.length * 100).toFixed(2)
      : 0
  };
}
