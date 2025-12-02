import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiBellOff, FiCheck, FiX, FiShoppingBag, 
  FiTruck, FiTag, FiPackage, FiMessageCircle, FiSettings,
  FiTrash2, FiExternalLink
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

// Check if Push Notifications are supported
const isPushSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Get notification icon based on type
const getNotificationIcon = (type) => {
  const icons = {
    order: FiShoppingBag,
    shipping: FiTruck,
    promo: FiTag,
    stock: FiPackage,
    message: FiMessageCircle,
  };
  return icons[type] || FiBell;
};

// Single Notification Item
const NotificationItem = ({ notification, onRead, onDelete }) => {
  const Icon = getNotificationIcon(notification.type);
  const isUnread = !notification.read;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex gap-4 p-4 rounded-2xl transition-colors ${
        isUnread 
          ? 'bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-cyan-500/30' 
          : 'bg-white/5 border border-white/10'
      }`}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
        notification.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
        notification.type === 'shipping' ? 'bg-green-500/20 text-green-400' :
        notification.type === 'promo' ? 'bg-purple-500/20 text-purple-400' :
        notification.type === 'stock' ? 'bg-orange-500/20 text-orange-400' :
        'bg-cyan-500/20 text-cyan-400'
      }`}>
        <Icon className="text-xl" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={`font-medium ${isUnread ? 'text-white' : 'text-gray-300'}`}>
              {notification.title}
            </h4>
            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
          </div>
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">{notification.time}</span>
          <div className="flex gap-2">
            {notification.link && (
              <a
                href={notification.link}
                className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <FiExternalLink />
              </a>
            )}
            {isUnread && (
              <button
                onClick={() => onRead?.(notification.id)}
                className="p-2 text-gray-400 hover:text-green-400 transition-colors"
              >
                <FiCheck />
              </button>
            )}
            <button
              onClick={() => onDelete?.(notification.id)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Push Notification Permission Request
export const PushNotificationBanner = ({ onEnable, onDismiss }) => {
  const [permission, setPermission] = useState(
    isPushSupported() ? Notification.permission : 'denied'
  );

  if (!isPushSupported() || permission === 'granted') {
    return null;
  }

  if (permission === 'denied') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-purple-500/30 rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center">
          <FiBell className="text-xl text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">Enable Push Notifications</h3>
          <p className="text-sm text-gray-400">
            Get instant updates about your orders, special offers, and back-in-stock alerts!
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={onEnable}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium"
          >
            Enable
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Notification Settings Component
export const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    shipping: true,
    promotions: true,
    stockAlerts: true,
    newsletter: true,
    pushEnabled: false,
    emailEnabled: true,
    smsEnabled: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notification settings updated');
  };

  const settingGroups = [
    {
      title: 'Order Notifications',
      items: [
        { key: 'orderUpdates', label: 'Order Updates', desc: 'Order confirmation, status changes' },
        { key: 'shipping', label: 'Shipping Updates', desc: 'Tracking updates, delivery notifications' },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { key: 'promotions', label: 'Promotions & Offers', desc: 'Exclusive deals and discounts' },
        { key: 'stockAlerts', label: 'Stock Alerts', desc: 'When items you want are back in stock' },
        { key: 'newsletter', label: 'Newsletter', desc: 'Weekly updates and new arrivals' },
      ],
    },
    {
      title: 'Notification Channels',
      items: [
        { key: 'pushEnabled', label: 'Push Notifications', desc: 'Browser and mobile notifications' },
        { key: 'emailEnabled', label: 'Email Notifications', desc: 'Receive updates via email' },
        { key: 'smsEnabled', label: 'SMS Notifications', desc: 'Get text messages for important updates' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {settingGroups.map((group) => (
        <div key={group.title} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-3 bg-white/5 border-b border-white/10">
            <h3 className="font-bold text-white">{group.title}</h3>
          </div>
          <div className="p-5 space-y-4">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings[item.key] ? 'bg-cyan-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings[item.key] ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Notifications Center Component
const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Demo notifications
      setNotifications([
        {
          id: '1',
          type: 'order',
          title: 'Order Confirmed!',
          message: 'Your order #NM12345 has been confirmed and is being processed.',
          time: '2 min ago',
          read: false,
          link: '/orders/NM12345',
        },
        {
          id: '2',
          type: 'shipping',
          title: 'Out for Delivery',
          message: 'Your package is out for delivery. Expected by 6 PM today.',
          time: '1 hour ago',
          read: false,
          link: '/orders/NM12344',
        },
        {
          id: '3',
          type: 'promo',
          title: '🎉 Flash Sale Alert!',
          message: 'Get up to 50% off on electronics. Limited time only!',
          time: '3 hours ago',
          read: true,
          link: '/sale',
        },
        {
          id: '4',
          type: 'stock',
          title: 'Back in Stock!',
          message: 'Premium Wireless Headphones is back in stock.',
          time: 'Yesterday',
          read: true,
          link: '/product/headphones',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Push notifications enabled!');
        setShowBanner(false);
        // Register service worker and subscribe to push
        // This would be implemented with your push notification service
      } else {
        toast.error('Push notifications were denied');
      }
    } catch (error) {
      toast.error('Failed to enable push notifications');
    }
  };

  const handleMarkRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.read)
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Push Notification Banner */}
      <AnimatePresence>
        {showBanner && (
          <PushNotificationBanner
            onEnable={handleEnablePush}
            onDismiss={() => setShowBanner(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiBell className="text-cyan-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-cyan-600 text-white rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white/5 rounded-xl p-1">
            {['all', 'unread'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : 'Unread'}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-white/5 text-gray-400 hover:text-white rounded-xl transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl">
          <FiBellOff className="text-5xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Notifications</h3>
          <p className="text-gray-400">
            {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
