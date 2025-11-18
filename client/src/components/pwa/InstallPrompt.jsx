import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiSmartphone, FiCheckCircle } from 'react-icons/fi';

const InstallPrompt = ({ onInstall, onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after user interaction
      setTimeout(() => {
        setShowInstall(true);
      }, 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSince = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      
      // Don't show again for 7 days after dismiss
      if (daysSince < 7) {
        return;
      }
    }

    // Show iOS install instructions if on iOS
    if (iOS) {
      setTimeout(() => {
        setShowInstall(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstall(false);
      setIsInstalled(true);
      
      if (onInstall) {
        onInstall();
      }
    } else {
      console.log('User dismissed the install prompt');
      handleDismiss();
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-dismissed', new Date().toISOString());
    
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // iOS Install Instructions
  if (isIOS && showInstall) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <FiSmartphone className="text-primary-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Install NexusMart</h3>
                  <p className="text-primary-100 text-sm">Add to Home Screen</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-gray-600 text-sm">
                Install NexusMart app on your iPhone for a better experience:
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 font-semibold text-sm mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-gray-700">
                    Tap the <strong>Share</strong> button at the bottom of your browser
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 font-semibold text-sm mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 font-semibold text-sm mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    Tap <strong>"Add"</strong> in the top right corner
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <FiCheckCircle className="text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>✓ Faster access from home screen</p>
                    <p>✓ Work offline with cached products</p>
                    <p>✓ Get push notifications for deals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Android/Desktop Install Prompt
  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 backdrop-blur-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <FiSmartphone className="text-primary-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Install NexusMart</h3>
                  <p className="text-primary-100 text-sm">For the best experience</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-4">
                Install NexusMart on your device for faster access and a better shopping experience!
              </p>

              {/* Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Lightning-fast performance</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Browse products offline</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Instant notifications for deals</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>No app store required</span>
                </div>
              </div>

              {/* Install Button */}
              <button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
              >
                <FiDownload className="text-xl" />
                <span>Install Now</span>
              </button>

              {/* Dismiss Link */}
              <button
                onClick={handleDismiss}
                className="w-full text-gray-500 text-sm mt-3 hover:text-gray-700 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
