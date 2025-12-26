import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaShoppingCart, FaFire, FaUsers } from 'react-icons/fa';
import { io } from 'socket.io-client';

// Helper to get socket URL
const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD && typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5000';
};

const LiveViewerCount = ({ productId, initialCount = 0 }) => {
  const [viewerCount, setViewerCount] = useState(initialCount || Math.floor(Math.random() * 50) + 10);
  const [recentActions, setRecentActions] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(getSocketURL(), {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      newSocket.emit('view-product', { productId });
    });

    newSocket.on('viewer-count', (data) => {
      setViewerCount(data.count);
    });

    newSocket.on('product-action', (action) => {
      setRecentActions(prev => [action, ...prev.slice(0, 4)]);
    });

    setSocket(newSocket);

    // Simulate real-time viewer changes
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(1, prev + change);
      });
    }, 5000);

    // Simulate purchase/add to cart notifications
    const actionInterval = setInterval(() => {
      const actions = [
        { type: 'purchase', user: 'Someone in Karachi', time: 'Just now' },
        { type: 'cart', user: 'A user in Lahore', time: '1 min ago' },
        { type: 'purchase', user: 'Someone nearby', time: 'Just now' },
        { type: 'cart', user: 'A user in Islamabad', time: '2 min ago' },
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setRecentActions(prev => [randomAction, ...prev.slice(0, 4)]);
    }, 8000);

    return () => {
      newSocket.emit('leave-product', { productId });
      newSocket.disconnect();
      clearInterval(viewerInterval);
      clearInterval(actionInterval);
    };
  }, [productId]);

  return (
    <div className="space-y-3">
      {/* Live Viewer Count */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/30"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <FaEye className="text-purple-400" />
        <span className="text-white font-semibold">
          <motion.span
            key={viewerCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {viewerCount}
          </motion.span>
          {' '}people viewing this
        </span>
      </motion.div>

      {/* Urgency Indicator */}
      {viewerCount > 30 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-orange-400 text-sm"
        >
          <FaFire className="animate-pulse" />
          <span>High demand! This product is trending</span>
        </motion.div>
      )}

      {/* Recent Actions */}
      <AnimatePresence>
        {recentActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {recentActions.slice(0, 3).map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                  action.type === 'purchase' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {action.type === 'purchase' ? (
                  <FaShoppingCart className="text-green-400" />
                ) : (
                  <FaShoppingCart className="text-blue-400" />
                )}
                <span>
                  {action.user} {action.type === 'purchase' ? 'purchased' : 'added to cart'}
                </span>
                <span className="text-gray-500 text-xs ml-auto">{action.time}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Compact version for product cards
export const LiveViewerBadge = ({ productId, className = '' }) => {
  const [count, setCount] = useState(Math.floor(Math.random() * 30) + 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <FaUsers className="text-gray-300" />
      <span>{count}</span>
    </motion.div>
  );
};

export default LiveViewerCount;
