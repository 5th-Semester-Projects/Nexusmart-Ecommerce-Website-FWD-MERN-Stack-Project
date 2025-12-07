import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  BellAlertIcon,
  TagIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  CogIcon,
  TruckIcon,
  HeartIcon,
  GiftIcon,
  ExclamationCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Price Drop Alert Component
export const PriceDropAlert = ({ product, previousPrice, currentPrice, onDismiss }) => {
  const discount = Math.round(((previousPrice - currentPrice) / previousPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
          <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium">Price Drop Alert! 🎉</h4>
              <p className="text-gray-300 text-sm mt-1">{product?.name || 'Product'}</p>
            </div>
            <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-full">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-gray-400 line-through">${previousPrice}</span>
            <span className="text-2xl font-bold text-green-400">${currentPrice}</span>
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              -{discount}%
            </span>
          </div>
          <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2">
            <ShoppingCartIcon className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Back in Stock Alert Component
export const BackInStockAlert = ({ product, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium">Back in Stock! 🙌</h4>
              <p className="text-gray-300 text-sm mt-1">{product?.name || 'Product'}</p>
            </div>
            <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-full">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2 flex items-center gap-1">
            <ExclamationCircleIcon className="w-4 h-4 text-yellow-500" />
            Only {product?.stock || 5} left in stock - order soon!
          </p>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <ShoppingCartIcon className="w-4 h-4" />
              Add to Cart
            </button>
            <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm hover:bg-gray-800 transition-colors">
              View
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Cart Abandonment Reminder Component
export const CartAbandonmentReminder = ({ cartItems, totalValue, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
          <ShoppingCartIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium">Don't forget your cart! 🛒</h4>
              <p className="text-gray-300 text-sm mt-1">
                {cartItems || 3} items worth ${totalValue || '149.99'}
              </p>
            </div>
            <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-full">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Complete your purchase now and get free shipping!
          </p>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
              Complete Purchase
            </button>
            <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm hover:bg-gray-800 transition-colors">
              View Cart
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Personalized Deal Alert Component
export const PersonalizedDealAlert = ({ deal, onDismiss }) => {
  const expiresIn = deal?.expiresIn || '2 hours';

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <GiftIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium">Special Deal for You! ✨</h4>
              <p className="text-gray-300 text-sm mt-1">{deal?.title || 'Extra 20% Off'}</p>
            </div>
            <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-full">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <ClockIcon className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400">Expires in {expiresIn}</span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <code className="px-3 py-1 bg-gray-800 text-purple-400 rounded-lg text-sm font-mono">
              {deal?.code || 'SPECIAL20'}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(deal?.code || 'SPECIAL20');
                toast.success('Code copied!');
              }}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Notification Center Component
export const NotificationCenter = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'price_drop', title: 'Price Drop!', message: 'Nike Sneakers dropped by 25%', time: '2 min ago', read: false },
    { id: 2, type: 'back_in_stock', title: 'Back in Stock', message: 'Designer Bag is available again', time: '1 hour ago', read: false },
    { id: 3, type: 'deal', title: 'Flash Sale', message: '50% off electronics - 4 hours left', time: '3 hours ago', read: true },
    { id: 4, type: 'order', title: 'Order Shipped', message: 'Your order #12345 is on its way', time: '1 day ago', read: true },
    { id: 5, type: 'cart', title: 'Items in your cart', message: 'Complete your purchase before items sell out', time: '2 days ago', read: true },
  ]);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'deals', label: 'Deals' },
    { key: 'orders', label: 'Orders' },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'price_drop': return ArrowTrendingDownIcon;
      case 'back_in_stock': return SparklesIcon;
      case 'deal': return TagIcon;
      case 'order': return TruckIcon;
      case 'cart': return ShoppingCartIcon;
      default: return BellIcon;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'price_drop': return 'text-green-400 bg-green-500/20';
      case 'back_in_stock': return 'text-blue-400 bg-blue-500/20';
      case 'deal': return 'text-purple-400 bg-purple-500/20';
      case 'order': return 'text-orange-400 bg-orange-500/20';
      case 'cart': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'deals') return ['price_drop', 'deal'].includes(n.type);
    if (activeTab === 'orders') return n.type === 'order';
    return true;
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Mark all read
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.key ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="notificationTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const colorClass = getColor(notification.type);

            return (
              <motion.div
                key={notification.id}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 border-b border-gray-800 cursor-pointer ${
                  !notification.read ? 'bg-purple-500/5' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{notification.message}</p>
                    <p className="text-gray-600 text-xs mt-2">{notification.time}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 text-center">
        <button className="text-purple-400 hover:text-purple-300 text-sm">
          View All Notifications
        </button>
      </div>
    </motion.div>
  );
};

// Notification Preferences Component
export const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    priceDrops: true,
    backInStock: true,
    cartReminders: true,
    dealAlerts: true,
    orderUpdates: true,
    recommendations: false,
    newsletter: false,
    push: true,
    email: true,
    sms: false,
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preferences updated');
  };

  const categories = [
    {
      title: 'Shopping Alerts',
      items: [
        { key: 'priceDrops', label: 'Price Drop Alerts', description: 'Get notified when prices drop on items you viewed', icon: ArrowTrendingDownIcon },
        { key: 'backInStock', label: 'Back in Stock', description: 'Know when sold-out items are available again', icon: SparklesIcon },
        { key: 'cartReminders', label: 'Cart Reminders', description: 'Reminders about items left in your cart', icon: ShoppingCartIcon },
        { key: 'dealAlerts', label: 'Personalized Deals', description: 'Special offers based on your interests', icon: TagIcon },
      ]
    },
    {
      title: 'Order & Delivery',
      items: [
        { key: 'orderUpdates', label: 'Order Updates', description: 'Shipping and delivery notifications', icon: TruckIcon },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { key: 'recommendations', label: 'Product Recommendations', description: 'Curated suggestions based on your style', icon: HeartIcon },
        { key: 'newsletter', label: 'Newsletter', description: 'Weekly digest of new arrivals and trends', icon: GiftIcon },
      ]
    }
  ];

  const channels = [
    { key: 'push', label: 'Push Notifications', icon: BellIcon },
    { key: 'email', label: 'Email', icon: null },
    { key: 'sms', label: 'SMS', icon: null },
  ];

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <CogIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
            <p className="text-gray-400 text-sm">Customize how and when you receive alerts</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Notification Channels */}
        <div>
          <h4 className="text-white font-medium mb-4">Notification Channels</h4>
          <div className="flex gap-4">
            {channels.map((channel) => (
              <button
                key={channel.key}
                onClick={() => togglePreference(channel.key)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  preferences[channel.key]
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={preferences[channel.key] ? 'text-white' : 'text-gray-400'}>
                    {channel.label}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    preferences[channel.key]
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-600'
                  }`}>
                    {preferences[channel.key] && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alert Categories */}
        {categories.map((category) => (
          <div key={category.title}>
            <h4 className="text-white font-medium mb-4">{category.title}</h4>
            <div className="space-y-3">
              {category.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-gray-500 text-sm">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference(item.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      preferences[item.key] ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: preferences[item.key] ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Smart Notification Toast Container
export const SmartNotificationContainer = ({ notifications = [] }) => {
  const [activeNotifications, setActiveNotifications] = useState(notifications);

  const dismissNotification = (id) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    setActiveNotifications(notifications);
  }, [notifications]);

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 w-96 max-w-[calc(100vw-3rem)]">
      <AnimatePresence>
        {activeNotifications.slice(0, 3).map((notification) => {
          switch (notification.type) {
            case 'price_drop':
              return (
                <PriceDropAlert
                  key={notification.id}
                  product={notification.product}
                  previousPrice={notification.previousPrice}
                  currentPrice={notification.currentPrice}
                  onDismiss={() => dismissNotification(notification.id)}
                />
              );
            case 'back_in_stock':
              return (
                <BackInStockAlert
                  key={notification.id}
                  product={notification.product}
                  onDismiss={() => dismissNotification(notification.id)}
                />
              );
            case 'cart_abandonment':
              return (
                <CartAbandonmentReminder
                  key={notification.id}
                  cartItems={notification.cartItems}
                  totalValue={notification.totalValue}
                  onDismiss={() => dismissNotification(notification.id)}
                />
              );
            case 'deal':
              return (
                <PersonalizedDealAlert
                  key={notification.id}
                  deal={notification.deal}
                  onDismiss={() => dismissNotification(notification.id)}
                />
              );
            default:
              return null;
          }
        })}
      </AnimatePresence>
    </div>
  );
};

export default {
  PriceDropAlert,
  BackInStockAlert,
  CartAbandonmentReminder,
  PersonalizedDealAlert,
  NotificationCenter,
  NotificationPreferences,
  SmartNotificationContainer
};
