/**
 * Socket.IO Event Handlers
 * Handles real-time communication for orders, chat, notifications, and stock updates
 */

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Join user room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined their room`);
      socket.emit('joined', { userId, socketId: socket.id });
    });

    // Join admin room
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log('👨‍💼 Admin joined admin room');
    });

    // Join product room for stock updates
    socket.on('join_product', (productId) => {
      socket.join(`product_${productId}`);
      console.log(`📦 Joined product room: ${productId}`);
    });

    /**
     * CHAT EVENTS
     */

    // Send chat message
    socket.on('chat:message', (data) => {
      const { recipientId, senderId, message, senderName, timestamp } = data;

      // Emit to recipient
      io.to(`user_${recipientId}`).emit('chat:receive', {
        senderId,
        senderName,
        message,
        timestamp: timestamp || new Date(),
        read: false,
      });

      // Also emit to admins if support chat
      if (data.isSupport) {
        io.to('admin_room').emit('chat:support_message', {
          userId: senderId,
          message,
          timestamp: timestamp || new Date(),
        });
      }
    });

    // Typing indicator
    socket.on('chat:typing', (data) => {
      const { recipientId, senderId, isTyping } = data;
      io.to(`user_${recipientId}`).emit('chat:typing_indicator', {
        senderId,
        isTyping,
      });
    });

    // Mark messages as read
    socket.on('chat:mark_read', (data) => {
      const { recipientId, senderId } = data;
      io.to(`user_${recipientId}`).emit('chat:messages_read', {
        senderId,
        timestamp: new Date(),
      });
    });

    /**
     * ORDER EVENTS
     */

    // Order status update (from admin/seller)
    socket.on('order:update_status', (data) => {
      const { userId, orderId, orderNumber, status, message } = data;

      io.to(`user_${userId}`).emit('order:status_updated', {
        orderId,
        orderNumber,
        status,
        message: message || `Your order ${orderNumber} status updated to ${status}`,
        timestamp: new Date(),
      });
    });

    // Track order location in real-time
    socket.on('order:track', (data) => {
      const { orderId, userId } = data;
      socket.join(`order_${orderId}`);

      // Send current location if available
      socket.emit('order:location', {
        orderId,
        location: data.currentLocation,
        estimatedArrival: data.estimatedArrival,
      });
    });

    // Update order location (from delivery partner)
    socket.on('order:update_location', (data) => {
      const { orderId, location, estimatedArrival } = data;

      io.to(`order_${orderId}`).emit('order:location_updated', {
        orderId,
        location,
        estimatedArrival,
        timestamp: new Date(),
      });
    });

    /**
     * PRODUCT STOCK EVENTS
     */

    // Stock update notification
    socket.on('product:stock_update', (data) => {
      const { productId, stock, productName } = data;

      // Notify all users watching this product
      io.to(`product_${productId}`).emit('product:stock_changed', {
        productId,
        productName,
        stock,
        available: stock > 0,
        lowStock: stock > 0 && stock <= 10,
        timestamp: new Date(),
      });
    });

    // Alert when product back in stock
    socket.on('product:notify_restock', (data) => {
      const { productId, userIds, productName } = data;

      userIds.forEach(userId => {
        io.to(`user_${userId}`).emit('product:back_in_stock', {
          productId,
          productName,
          message: `${productName} is back in stock!`,
          timestamp: new Date(),
        });
      });
    });

    /**
     * NOTIFICATION EVENTS
     */

    // Send notification to user
    socket.on('notification:send', (data) => {
      const { userId, title, message, type, link } = data;

      io.to(`user_${userId}`).emit('notification:receive', {
        title,
        message,
        type, // 'order', 'payment', 'stock', 'promotion', 'system'
        link,
        read: false,
        timestamp: new Date(),
      });
    });

    // Broadcast announcement to all users
    socket.on('notification:broadcast', (data) => {
      const { title, message, type } = data;

      io.emit('notification:announcement', {
        title,
        message,
        type,
        timestamp: new Date(),
      });
    });

    /**
     * ADMIN DASHBOARD EVENTS
     */

    // New order alert for admin
    socket.on('admin:new_order', (data) => {
      io.to('admin_room').emit('admin:order_created', {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customer: data.customer,
        total: data.total,
        timestamp: new Date(),
      });
    });

    // Live user count
    socket.on('admin:request_stats', () => {
      const connectedUsers = io.sockets.sockets.size;
      socket.emit('admin:stats', {
        connectedUsers,
        timestamp: new Date(),
      });
    });

    /**
     * PAYMENT EVENTS
     */

    // Payment success notification
    socket.on('payment:success', (data) => {
      const { userId, orderId, amount } = data;

      io.to(`user_${userId}`).emit('payment:confirmed', {
        orderId,
        amount,
        message: 'Payment successful!',
        timestamp: new Date(),
      });
    });

    // Payment failed notification
    socket.on('payment:failed', (data) => {
      const { userId, orderId, reason } = data;

      io.to(`user_${userId}`).emit('payment:failed', {
        orderId,
        reason,
        message: 'Payment failed. Please try again.',
        timestamp: new Date(),
      });
    });

    /**
     * WISHLIST EVENTS
     */

    // Price drop alert
    socket.on('wishlist:price_drop', (data) => {
      const { userId, productId, productName, oldPrice, newPrice } = data;

      io.to(`user_${userId}`).emit('wishlist:price_alert', {
        productId,
        productName,
        oldPrice,
        newPrice,
        discount: ((oldPrice - newPrice) / oldPrice * 100).toFixed(0),
        message: `Price dropped for ${productName}!`,
        timestamp: new Date(),
      });
    });

    /**
     * REVIEW EVENTS
     */

    // New review notification (to seller/admin)
    socket.on('review:new', (data) => {
      const { productId, rating, productName } = data;

      io.to('admin_room').emit('review:created', {
        productId,
        productName,
        rating,
        timestamp: new Date(),
      });
    });

    /**
     * ERROR HANDLING
     */

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      socket.emit('error_message', {
        message: 'An error occurred',
        details: error.message,
      });
    });

    /**
     * DISCONNECT
     */

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  // Periodic updates (every 30 seconds)
  setInterval(() => {
    io.to('admin_room').emit('admin:heartbeat', {
      connectedUsers: io.sockets.sockets.size,
      timestamp: new Date(),
    });
  }, 30000);
};

export default setupSocketHandlers;
