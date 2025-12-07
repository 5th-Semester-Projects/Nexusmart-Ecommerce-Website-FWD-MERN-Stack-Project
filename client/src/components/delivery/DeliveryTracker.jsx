import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, 
  FiTruck, 
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiPhone,
  FiStar,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';

/**
 * Delivery Tracker Component
 * Real-time delivery tracking with map visualization
 */
const DeliveryTracker = ({ orderId }) => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (orderId) {
      fetchTracking();
      
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchTracking, 30000);
      return () => clearInterval(interval);
    }
  }, [orderId]);
  
  const fetchTracking = async () => {
    try {
      const response = await fetch(`/api/v1/delivery/track/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTracking(data.tracking);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-5 h-5" />;
      case 'picked_up':
        return <FiPackage className="w-5 h-5" />;
      case 'in_transit':
        return <FiTruck className="w-5 h-5" />;
      case 'out_for_delivery':
        return <FiMapPin className="w-5 h-5" />;
      case 'delivered':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiPackage className="w-5 h-5" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'picked_up':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'in_transit':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20';
      case 'out_for_delivery':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'delivered':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'cancelled':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="space-y-3 mt-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="text-center py-8">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Tracking Not Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchTracking}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!tracking) return null;
  
  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];
  
  const currentStepIndex = statusSteps.findIndex(s => s.key === tracking.status);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Delivery Tracking
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tracking.status)}`}>
            {tracking.status.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
        
        {tracking.estimatedDelivery && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <FiClock className="w-4 h-4" />
            <span>Estimated Delivery: {formatDate(tracking.estimatedDelivery)}</span>
          </div>
        )}
      </div>
      
      {/* Progress Steps */}
      <div className="p-6">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="absolute top-0 left-0 w-full bg-purple-600"
              initial={{ height: 0 }}
              animate={{ height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <motion.div
                  key={step.key}
                  className="relative flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-purple-200 dark:ring-purple-900' : ''}`}>
                    {getStatusIcon(step.key)}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-medium ${
                      isCompleted 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {tracking.timeline?.[step.key] && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tracking.timeline[step.key])}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Delivery Partner Info */}
      {tracking.deliveryPartner && (
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Partner
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={tracking.deliveryPartner.photo || '/default-avatar.png'}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {tracking.deliveryPartner.name}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{tracking.deliveryPartner.rating || 4.5}</span>
                  <span>•</span>
                  <span>{tracking.deliveryPartner.vehicleType}</span>
                </div>
              </div>
            </div>
            {tracking.deliveryPartner.phone && (
              <a
                href={`tel:${tracking.deliveryPartner.phone}`}
                className="p-3 bg-green-500 text-white rounded-full"
              >
                <FiPhone className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      )}
      
      {/* Live Location */}
      {tracking.currentLocation && (
        <div className="p-6 border-t dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Live Location
          </h3>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FiMapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tracking.currentLocation.address || 'Tracking delivery location...'}
              </p>
              {tracking.currentLocation.lastUpdated && (
                <p className="text-xs text-gray-400 mt-1">
                  Updated: {formatTime(tracking.currentLocation.lastUpdated)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* OTP Section */}
      {tracking.otp && tracking.status === 'out_for_delivery' && (
        <div className="p-6 border-t dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Share this OTP with delivery partner
            </p>
            <div className="text-3xl font-bold text-purple-600 tracking-widest">
              {tracking.otp}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;
