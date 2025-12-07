import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle, 
  FiX, 
  FiSend,
  FiShoppingBag,
  FiPackage,
  FiHelpCircle,
  FiPhone,
  FiCheck,
  FiCheckCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

/**
 * WhatsApp Widget Component
 * Quick access to WhatsApp Business chat
 */
const WhatsAppWidget = ({ phoneNumber, businessName = "ShopSmart" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const WHATSAPP_NUMBER = phoneNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '1234567890';
  
  // Show widget after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWidget(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const quickOptions = [
    {
      id: 'order',
      icon: FiShoppingBag,
      title: 'Track My Order',
      message: `Hi ${businessName}! I'd like to track my order. My order ID is: `
    },
    {
      id: 'product',
      icon: FiPackage,
      title: 'Product Inquiry',
      message: `Hi ${businessName}! I have a question about a product: `
    },
    {
      id: 'support',
      icon: FiHelpCircle,
      title: 'Customer Support',
      message: `Hi ${businessName}! I need help with: `
    },
    {
      id: 'call',
      icon: FiPhone,
      title: 'Request Callback',
      message: `Hi ${businessName}! Please call me back. My phone number is: `
    }
  ];
  
  const openWhatsApp = (message = '') => {
    const encodedMessage = encodeURIComponent(message || `Hi ${businessName}!`);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
    
    // Track interaction
    try {
      fetch('/api/v1/whatsapp/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'open_chat',
          option: selectedOption
        })
      });
    } catch (error) {
      console.error('Track error:', error);
    }
  };
  
  if (!showWidget) return null;
  
  return (
    <>
      {/* Main Widget Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isOpen 
              ? 'bg-gray-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <FiX className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="whatsapp"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <FaWhatsapp className="w-7 h-7 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        
        {/* Notification Badge */}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-white text-xs">1</span>
          </motion.div>
        )}
      </motion.div>
      
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {/* Header */}
            <div className="bg-green-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <FaWhatsapp className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{businessName}</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                    <span className="text-green-100 text-sm">Online</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chat Bubble */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <p className="text-gray-700 dark:text-gray-200 text-sm">
                  👋 Hi there! How can we help you today? Start a conversation on WhatsApp.
                </p>
                <span className="text-xs text-gray-400 mt-1 block">
                  Typically replies within minutes
                </span>
              </div>
            </div>
            
            {/* Quick Options */}
            <div className="p-4 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Quick options:
              </p>
              {quickOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedOption(option.id);
                    openWhatsApp(option.message);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <option.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {option.title}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Start Chat Button */}
            <div className="p-4 pt-0">
              <button
                onClick={() => openWhatsApp()}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <FiMessageCircle className="w-5 h-5" />
                Start Chat
              </button>
            </div>
            
            {/* Footer */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <FiCheckCircle className="w-3 h-3 text-green-500" />
                <span>Secured with WhatsApp Business</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppWidget;
