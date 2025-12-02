import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiBellOff, FiMail, FiCheck, FiPhone, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Stock Alert Button Component
export const StockAlertButton = ({ 
  productId, 
  productName,
  variant = 'button', // 'button' | 'icon' | 'inline'
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleClick = () => {
    if (isSubscribed) {
      handleUnsubscribe();
    } else {
      setShowModal(true);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await api.delete(`/products/${productId}/stock-alert`);
      setIsSubscribed(false);
      toast.success('Stock alert removed');
    } catch (error) {
      toast.error('Failed to remove alert');
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`p-3 rounded-xl transition-all ${
            isSubscribed 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
          } ${className}`}
          title={isSubscribed ? 'Remove stock alert' : 'Notify when in stock'}
        >
          {isSubscribed ? <FiBellOff /> : <FiBell />}
        </button>
        <StockAlertModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          productId={productId}
          productName={productName}
          userEmail={user?.email}
          isAuthenticated={isAuthenticated}
          onSuccess={() => setIsSubscribed(true)}
        />
      </>
    );
  }

  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 text-sm ${
            isSubscribed ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'
          } transition-colors ${className}`}
        >
          {isSubscribed ? <FiBellOff className="text-lg" /> : <FiBell className="text-lg" />}
          {isSubscribed ? 'Notification Set' : 'Notify Me'}
        </button>
        <StockAlertModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          productId={productId}
          productName={productName}
          userEmail={user?.email}
          isAuthenticated={isAuthenticated}
          onSuccess={() => setIsSubscribed(true)}
        />
      </>
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`w-full py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
          isSubscribed
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
            : 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:from-purple-600/30 hover:to-cyan-600/30'
        } ${className}`}
      >
        {isSubscribed ? (
          <>
            <FiCheck /> Notification Set
          </>
        ) : (
          <>
            <FiBell /> Notify When Available
          </>
        )}
      </motion.button>
      <StockAlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        productId={productId}
        productName={productName}
        userEmail={user?.email}
        isAuthenticated={isAuthenticated}
        onSuccess={() => setIsSubscribed(true)}
      />
    </>
  );
};

// Stock Alert Modal
export const StockAlertModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  userEmail = '',
  isAuthenticated = false,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    email: userEmail,
    phone: '',
    notifyVia: ['email'],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email && !formData.phone) {
      toast.error('Please provide email or phone number');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/products/${productId}/stock-alert`, {
        email: formData.email,
        phone: formData.phone,
        notifyVia: formData.notifyVia,
      });
      
      setSuccess(true);
      onSuccess?.();
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set alert');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifyMethod = (method) => {
    setFormData(prev => ({
      ...prev,
      notifyVia: prev.notifyVia.includes(method)
        ? prev.notifyVia.filter(m => m !== method)
        : [...prev.notifyVia, method],
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
                >
                  <FiCheck className="text-4xl text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Alert Set!</h3>
                <p className="text-gray-400">
                  We'll notify you when "{productName}" is back in stock.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-b border-white/10">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <FiX className="text-gray-400" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center">
                      <FiBell className="text-2xl text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Stock Alert</h2>
                      <p className="text-sm text-gray-400">Get notified when available</p>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-6 py-4 bg-white/5 border-b border-white/10">
                  <p className="text-sm text-gray-400">Product</p>
                  <p className="font-medium text-white truncate">{productName}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Notification Methods */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">
                      Notify me via
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => toggleNotifyMethod('email')}
                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                          formData.notifyVia.includes('email')
                            ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-cyan-500/50'
                        }`}
                      >
                        <FiMail />
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleNotifyMethod('sms')}
                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                          formData.notifyVia.includes('sms')
                            ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-cyan-500/50'
                        }`}
                      >
                        <FiPhone />
                        SMS
                      </button>
                    </div>
                  </div>

                  {/* Email Input */}
                  {formData.notifyVia.includes('email') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Phone Input */}
                  {formData.notifyVia.includes('sms') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+92 300 1234567"
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiBell />
                        Set Alert
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-gray-500 text-center">
                    We'll only notify you once when this product is back in stock.
                    You can unsubscribe anytime.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Out of Stock Banner with Alert Option
export const OutOfStockBanner = ({ productId, productName }) => {
  return (
    <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">😔</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">Out of Stock</h3>
          <p className="text-sm text-gray-400 mb-3">
            This item is currently unavailable. Get notified when it's back!
          </p>
          <StockAlertButton
            productId={productId}
            productName={productName}
            variant="button"
          />
        </div>
      </div>
    </div>
  );
};

// Low Stock Warning
export const LowStockWarning = ({ stock, threshold = 5 }) => {
  if (stock > threshold) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
      </span>
      <span className="text-sm font-medium">
        Only {stock} left in stock - order soon!
      </span>
    </motion.div>
  );
};

export default StockAlertButton;
