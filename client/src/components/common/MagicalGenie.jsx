import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMessageCircle, FiStar, FiZap } from 'react-icons/fi';

const MagicalGenie = ({ onOrderConfirm = false }) => {
  const [isVisible, setIsVisible] = useState(true); // Always visible initially
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isHidden, setIsHidden] = useState(false); // Track if user manually hid it
  const [isDragging, setIsDragging] = useState(false);

  // Random genie messages
  const randomMessages = [
    "🧞‍♂️ Need help finding something magical?",
    "✨ Your wish is my command, master!",
    "🌟 I sense great shopping destiny ahead!",
    "💫 Looking for deals? I know all the secrets!",
    "🎭 Let me guide you through this magical marketplace!",
    "🔮 I foresee amazing products in your cart!",
    "⭐ Master, shall I show you today's treasures?",
    "🎪 Welcome to the most magical shopping experience!",
    "🌙 The stars align for great shopping today!",
    "💎 Need assistance, oh wise shopper?",
  ];

  const orderConfirmMessages = [
    "🎉 Congratulations! Your order is confirmed!",
    "✨ Magic has been done! Your order is on its way!",
    "🌟 Excellent choice, master! Order confirmed!",
    "💫 Your wish has been granted! Order successful!",
    "🎊 Fantastic! Your magical items are being prepared!",
    "🎁 Order confirmed! May these items bring you joy!",
    "⭐ Success! Your order will arrive like magic!",
    "🔮 The universe has blessed your purchase!",
  ];

  const checkoutMessages = [
    "💳 Ready to complete your magical purchase?",
    "✨ Just a few more steps to shopping bliss!",
    "🌟 Your cart looks amazing! Let's seal the deal!",
    "💫 Almost there! Complete your magical journey!",
    "🎯 Perfect choices! Proceed with confidence!",
    "🔮 I sense great satisfaction in your future!",
    "⭐ Excellent selections! Time to make them yours!",
    "💎 These items were meant for you, master!",
  ];

  // Show genie randomly or on specific events
  useEffect(() => {
    if (isHidden) return; // Don't show if user manually hid it

    if (onOrderConfirm) {
      setIsVisible(true);
      setIsOpen(true);
      const randomMsg = orderConfirmMessages[Math.floor(Math.random() * orderConfirmMessages.length)];
      setMessage(randomMsg);
      
      // Auto hide after celebration
      setTimeout(() => {
        setIsOpen(false);
      }, 8000);
    } else {
      // Always visible, just set a message
      setIsVisible(true);
      const randomMsg = window.location.pathname.includes('checkout')
        ? checkoutMessages[Math.floor(Math.random() * checkoutMessages.length)]
        : randomMessages[Math.floor(Math.random() * randomMessages.length)];
      setMessage(randomMsg);
    }
  }, [onOrderConfirm, isHidden]);

  // No more random movement - stay fixed
  // Removed the random movement useEffect

  const handleGenieClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const randomMsg = window.location.pathname.includes('checkout')
        ? checkoutMessages[Math.floor(Math.random() * checkoutMessages.length)]
        : randomMessages[Math.floor(Math.random() * randomMessages.length)];
      setMessage(randomMsg);
    }
  };

  const handleClose = () => {
    setIsHidden(true); // User manually hid it
    setIsVisible(false);
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, duration: 0.8 }}
          className="fixed bottom-[180px] right-6 z-[60] pointer-events-auto"
          style={{ width: '80px', height: '80px' }}
          title="AI Shopping Assistant"
        >
          {/* Genie Character - Compact Size */}
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative cursor-pointer"
          >
            {/* Simple glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute -inset-3 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full blur-lg"
            />

            {/* Main Genie Container - Small */}
            <motion.div
              onClick={handleGenieClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-20 h-20 cursor-pointer flex items-center justify-center"
            >
              {/* Genie emoji - small size */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="relative z-20 text-5xl"
                style={{ 
                  filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))',
                }}
              >
                🧞‍♂️
              </motion.div>

              {/* Simple sparkles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  className="absolute text-sm"
                  style={{
                    left: `${50 + Math.cos((i * Math.PI * 2) / 4) * 120}%`,
                    top: `${50 + Math.sin((i * Math.PI * 2) / 4) * 120}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>

            {/* Chat bubble - Compact */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute bottom-24 right-0 w-64 pointer-events-auto"
                >
                  <div className="relative bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-cyan-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border-2 border-purple-500/50">
                    {/* Close button */}
                    <button
                      onClick={handleMinimize}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-purple-600 transition-colors"
                    >
                      <FiX />
                    </button>

                    {/* Message */}
                    <p className="text-white text-sm font-medium text-center leading-relaxed">
                      {message}
                    </p>

                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-purple-900/95" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notification badge */}
            {!isOpen && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
              >
                💬
              </motion.div>
            )}

            {/* Hide/Remove button */}
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors shadow-lg"
              title="Hide Genie"
            >
              <FiX className="text-xs" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MagicalGenie;
