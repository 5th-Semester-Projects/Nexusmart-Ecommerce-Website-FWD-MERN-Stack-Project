import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPackage, FiCheck, FiTruck, FiHome, FiClock, 
  FiX, FiRefreshCw, FiMapPin, FiBox, FiCheckCircle,
  FiAlertCircle, FiPhone, FiCalendar, FiNavigation
} from 'react-icons/fi';

// Order status stages with icons and colors
const ORDER_STAGES = [
  {
    status: 'pending',
    label: 'Order Placed',
    icon: FiPackage,
    color: 'purple',
    description: 'Your order has been placed successfully',
  },
  {
    status: 'confirmed',
    label: 'Confirmed',
    icon: FiCheckCircle,
    color: 'blue',
    description: 'Seller has confirmed your order',
  },
  {
    status: 'processing',
    label: 'Processing',
    icon: FiBox,
    color: 'yellow',
    description: 'Your order is being prepared',
  },
  {
    status: 'shipped',
    label: 'Shipped',
    icon: FiTruck,
    color: 'cyan',
    description: 'Your order is on the way',
  },
  {
    status: 'out-for-delivery',
    label: 'Out for Delivery',
    icon: FiNavigation,
    color: 'green',
    description: 'Your order will be delivered today',
  },
  {
    status: 'delivered',
    label: 'Delivered',
    icon: FiHome,
    color: 'green',
    description: 'Order has been delivered',
  },
];

const CANCELLED_STAGE = {
  status: 'cancelled',
  label: 'Cancelled',
  icon: FiX,
  color: 'red',
  description: 'Order has been cancelled',
};

const RETURNED_STAGE = {
  status: 'returned',
  label: 'Returned',
  icon: FiRefreshCw,
  color: 'orange',
  description: 'Order has been returned',
};

const getColorClasses = (color, active = false) => {
  const colors = {
    purple: active ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400',
    blue: active ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400',
    yellow: active ? 'bg-yellow-500 text-white' : 'bg-yellow-500/20 text-yellow-400',
    cyan: active ? 'bg-cyan-500 text-white' : 'bg-cyan-500/20 text-cyan-400',
    green: active ? 'bg-green-500 text-white' : 'bg-green-500/20 text-green-400',
    red: active ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400',
    orange: active ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400',
  };
  return colors[color] || colors.purple;
};

const getLineColor = (color) => {
  const colors = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  };
  return colors[color] || 'bg-purple-500';
};

const OrderTracking = ({ 
  order,
  showDetails = true,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!order) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center">
        <FiAlertCircle className="w-12 h-12 mx-auto text-purple-500/50 mb-3" />
        <p className="text-purple-300/70">Order information not available</p>
      </div>
    );
  }

  const currentStatus = order.orderStatus || 'pending';
  const isCancelled = currentStatus === 'cancelled';
  const isReturned = currentStatus === 'returned' || currentStatus === 'refunded';
  const statusHistory = order.statusHistory || [];

  // Determine which stages to show
  let stages = [...ORDER_STAGES];
  if (isCancelled) {
    // Find where cancellation happened and replace remaining stages
    const cancelIndex = stages.findIndex(s => s.status === currentStatus) + 1;
    stages = stages.slice(0, Math.max(1, cancelIndex));
    stages.push(CANCELLED_STAGE);
  } else if (isReturned) {
    stages.push(RETURNED_STAGE);
  }

  // Find current stage index
  const currentStageIndex = stages.findIndex(s => s.status === currentStatus);

  // Get status timestamp from history
  const getStatusTime = (status) => {
    const entry = statusHistory.find(h => h.status === status);
    if (entry) {
      return new Date(entry.timestamp).toLocaleString('en-PK', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      {showDetails && (
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex flex-wrap gap-6 justify-between items-start">
            <div>
              <p className="text-purple-300/50 text-sm">Order Number</p>
              <p className="text-white font-mono text-lg">#{order.orderNumber || order._id?.slice(-8)}</p>
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Order Date</p>
              <p className="text-white flex items-center gap-2">
                <FiCalendar className="text-cyan-400" />
                {new Date(order.createdAt).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Estimated Delivery</p>
              <p className="text-white flex items-center gap-2">
                <FiTruck className="text-green-400" />
                {order.estimatedDelivery 
                  ? new Date(order.estimatedDelivery).toLocaleDateString('en-PK', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Processing'
                }
              </p>
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Current Status</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isCancelled ? 'bg-red-500/20 text-red-400' :
                isReturned ? 'bg-orange-500/20 text-orange-400' :
                currentStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                'bg-cyan-500/20 text-cyan-400'
              }`}>
                {currentStatus === 'out-for-delivery' ? 'Out for Delivery' : 
                 currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tracking */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FiMapPin className="text-cyan-400" />
          Order Tracking
        </h3>

        {/* Desktop Timeline - Horizontal */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-purple-500/20 -z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(currentStageIndex / (stages.length - 1)) * 100}%` 
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${
                  isCancelled ? 'bg-red-500' : 
                  isReturned ? 'bg-orange-500' : 
                  'bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500'
                }`}
              />
            </div>

            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isPending = index > currentStageIndex;
              const timestamp = getStatusTime(stage.status);

              return (
                <motion.div
                  key={stage.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center flex-1"
                >
                  {/* Icon Circle */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                      isCompleted || isCurrent
                        ? getColorClasses(stage.color, true)
                        : 'bg-purple-900/50 text-purple-500/50'
                    } ${isCurrent ? 'ring-4 ring-offset-2 ring-offset-transparent ring-purple-500/30' : ''}`}
                  >
                    {isCompleted ? (
                      <FiCheck className="text-xl" />
                    ) : (
                      <Icon className="text-xl" />
                    )}
                  </motion.div>

                  {/* Label */}
                  <p className={`font-semibold text-sm ${
                    isCompleted || isCurrent ? 'text-white' : 'text-purple-500/50'
                  }`}>
                    {stage.label}
                  </p>

                  {/* Timestamp or Description */}
                  <p className={`text-xs mt-1 ${
                    isCompleted || isCurrent ? 'text-purple-300/70' : 'text-purple-500/30'
                  }`}>
                    {timestamp || (isCurrent ? 'In Progress' : isPending ? 'Pending' : '')}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile Timeline - Vertical */}
        <div className="md:hidden space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const timestamp = getStatusTime(stage.status);

            return (
              <motion.div
                key={stage.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                {/* Icon and Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted || isCurrent
                      ? getColorClasses(stage.color, true)
                      : 'bg-purple-900/50 text-purple-500/50'
                  }`}>
                    {isCompleted ? <FiCheck /> : <Icon />}
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      isCompleted ? getLineColor(stage.color) : 'bg-purple-500/20'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <p className={`font-semibold ${
                    isCompleted || isCurrent ? 'text-white' : 'text-purple-500/50'
                  }`}>
                    {stage.label}
                  </p>
                  <p className={`text-sm ${
                    isCompleted || isCurrent ? 'text-purple-300/70' : 'text-purple-500/30'
                  }`}>
                    {stage.description}
                  </p>
                  {timestamp && (
                    <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                      <FiClock className="text-xs" /> {timestamp}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Shipping Details */}
      {showDetails && order.shippingInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl"
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiTruck className="text-cyan-400" />
              Shipping Details
            </h3>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              className="text-purple-400"
            >
              ▼
            </motion.span>
          </button>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-purple-500/20 space-y-4"
            >
              {/* Delivery Address */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <FiMapPin className="text-purple-400" />
                </div>
                <div>
                  <p className="text-purple-300/50 text-sm">Delivery Address</p>
                  <p className="text-white">
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  </p>
                  <p className="text-purple-300/80 text-sm">
                    {order.shippingInfo.address?.street || order.shippingInfo.address}
                  </p>
                  <p className="text-purple-300/60 text-sm">
                    {order.shippingInfo.address?.city || order.shippingInfo.city}, 
                    {order.shippingInfo.address?.state || order.shippingInfo.state} 
                    {order.shippingInfo.address?.zipCode || order.shippingInfo.postalCode}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <FiPhone className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-purple-300/50 text-sm">Contact</p>
                  <p className="text-white">{order.shippingInfo.phone}</p>
                  <p className="text-purple-300/60 text-sm">{order.shippingInfo.email}</p>
                </div>
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <FiPackage className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-purple-300/50 text-sm">Tracking Number</p>
                    <p className="text-white font-mono">{order.trackingNumber}</p>
                    {order.shippingProvider && (
                      <p className="text-purple-300/60 text-sm">via {order.shippingProvider}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Time Slot */}
              {order.deliveryTimeSlot && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <FiClock className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-purple-300/50 text-sm">Preferred Delivery Time</p>
                    <p className="text-white">{order.deliveryTimeSlot.slotLabel || order.deliveryTimeSlot.slot}</p>
                    {order.deliveryTimeSlot.date && (
                      <p className="text-purple-300/60 text-sm">
                        {new Date(order.deliveryTimeSlot.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OrderTracking;
