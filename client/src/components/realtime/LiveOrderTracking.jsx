import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaTruck, FaBox, FaCheck, FaWarehouse, FaHome } from 'react-icons/fa';
import { io } from 'socket.io-client';

// Helper to get socket URL
const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD && typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5000';
};

const LiveOrderTracking = ({ orderId, initialStatus }) => {
  const [trackingData, setTrackingData] = useState({
    status: initialStatus || 'processing',
    currentLocation: 'Warehouse - Karachi',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    updates: [
      { status: 'Order Placed', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), completed: true },
      { status: 'Processing', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completed: true },
      { status: 'Shipped', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: true },
      { status: 'Out for Delivery', time: null, completed: false },
      { status: 'Delivered', time: null, completed: false },
    ],
    driver: {
      name: 'Muhammad Ali',
      phone: '+92 300 1234567',
      vehicle: 'White Suzuki Van - ABC-123'
    },
    coordinates: { lat: 24.8607, lng: 67.0011 }
  });

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(getSocketURL(), {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      newSocket.emit('track-order', { orderId });
    });

    newSocket.on('order-update', (data) => {
      setTrackingData(prev => ({
        ...prev,
        ...data
      }));
    });

    newSocket.on('location-update', (coords) => {
      setTrackingData(prev => ({
        ...prev,
        coordinates: coords
      }));
    });

    setSocket(newSocket);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTrackingData(prev => ({
        ...prev,
        coordinates: {
          lat: prev.coordinates.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.coordinates.lng + (Math.random() - 0.5) * 0.001
        }
      }));
    }, 5000);

    return () => {
      newSocket.disconnect();
      clearInterval(interval);
    };
  }, [orderId]);

  const statusIcons = {
    'Order Placed': FaBox,
    'Processing': FaWarehouse,
    'Shipped': FaTruck,
    'Out for Delivery': FaTruck,
    'Delivered': FaHome
  };

  const formatDate = (date) => {
    if (!date) return 'Pending';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaTruck className="text-purple-500" /> Live Order Tracking
          </h2>
          <p className="text-gray-400 text-sm">Order #{orderId || 'NXS123456'}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Estimated Delivery</p>
          <p className="text-white font-semibold">
            {formatDate(trackingData.estimatedDelivery)}
          </p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-48 bg-gray-800 rounded-xl mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <FaMapMarkerAlt className="text-5xl text-red-500 drop-shadow-lg" />
            </motion.div>
            <p className="text-white mt-2 font-semibold">{trackingData.currentLocation}</p>
            <p className="text-gray-400 text-sm">
              Lat: {trackingData.coordinates.lat.toFixed(4)}, 
              Lng: {trackingData.coordinates.lng.toFixed(4)}
            </p>
          </div>
        </div>
        
        {/* Animated route */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.path
            d="M 50 150 Q 150 50, 250 100 T 350 80"
            stroke="rgba(139, 92, 246, 0.5)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      </div>

      {/* Status Timeline */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-4">Delivery Status</h3>
        <div className="relative">
          {trackingData.updates.map((update, index) => {
            const IconComponent = statusIcons[update.status] || FaBox;
            return (
              <div key={index} className="flex gap-4 mb-4 last:mb-0">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      update.completed 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gray-700'
                    }`}
                  >
                    {update.completed ? (
                      <FaCheck className="text-white" />
                    ) : (
                      <IconComponent className="text-gray-400" />
                    )}
                  </motion.div>
                  {index < trackingData.updates.length - 1 && (
                    <div className={`absolute left-1/2 top-10 w-0.5 h-8 -translate-x-1/2 ${
                      update.completed ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className={`font-semibold ${update.completed ? 'text-white' : 'text-gray-500'}`}>
                    {update.status}
                  </p>
                  <p className="text-gray-500 text-sm">{formatDate(update.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Info */}
      {trackingData.status === 'out_for_delivery' && trackingData.driver && (
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Delivery Partner</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {trackingData.driver.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{trackingData.driver.name}</p>
              <p className="text-gray-400 text-sm">{trackingData.driver.vehicle}</p>
            </div>
            <a
              href={`tel:${trackingData.driver.phone}`}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Call
            </a>
          </div>
        </div>
      )}

      {/* Live Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-green-400">Live Tracking Active</span>
      </div>
    </div>
  );
};

export default LiveOrderTracking;
