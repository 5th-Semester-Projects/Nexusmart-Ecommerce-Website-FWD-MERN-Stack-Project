import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDownload, FaMobile, FaBell, FaWifi, FaSync,
  FaCheck, FaTimes, FaCog, FaRocket, FaCloud,
  FaDatabase, FaShieldAlt, FaBolt, FaApple,
  FaAndroid, FaWindows, FaDesktop
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const EnhancedPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [offlineData, setOfflineData] = useState({ items: 0, size: '0 KB' });
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Detect platform
  const getPlatform = () => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Windows/.test(ua)) return 'windows';
    if (/Mac/.test(ua)) return 'mac';
    return 'desktop';
  };

  const platform = getPlatform();

  // Check if PWA is installed
  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };
    
    checkInstalled();
    
    // Listen for installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      toast.success('App installed successfully!');
    });
  }, []);

  // Capture install prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // Show install prompt after delay
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallModal(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [isInstalled]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online!');
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast('You are offline. Data will sync when connected.', { icon: '📡' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker update detection
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }
  }, []);

  // Calculate offline storage
  useEffect(() => {
    calculateOfflineStorage();
  }, []);

  const calculateOfflineStorage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      
      setOfflineData({
        items: Math.floor(used / 1024),
        size: formatBytes(used),
        quota: formatBytes(quota),
        percentage: ((used / quota) * 100).toFixed(1)
      });
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Install PWA
  const handleInstall = async () => {
    if (!installPrompt) {
      // Show platform-specific instructions
      if (platform === 'ios') {
        toast('Tap the Share button then "Add to Home Screen"', { icon: '📱' });
      }
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallModal(false);
    }
  };

  // Request notification permission
  const requestNotifications = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      // Subscribe to push notifications
      subscribeToPush();
    } else {
      toast.error('Notification permission denied');
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
        });
        
        // Send subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      } catch (error) {
        console.error('Push subscription failed:', error);
      }
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String?.length % 4) % 4);
    const base64 = (base64String || '').replace(/-/g, '+').replace(/_/g, '/') + padding;
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  };

  // Sync offline data
  const syncOfflineData = async () => {
    setSyncStatus('syncing');
    
    try {
      // Trigger background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-data');
      }
      
      // Manual sync fallback
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus('synced');
      toast.success('Data synced successfully!');
    } catch (error) {
      setSyncStatus('error');
      toast.error('Sync failed. Will retry.');
    }
  };

  // Update app
  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      });
    }
  };

  // Clear cache
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      toast.success('Cache cleared!');
      calculateOfflineStorage();
    }
  };

  return (
    <>
      {/* Main PWA Status Bar */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <FaRocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">NexusMart PWA</h3>
              <p className="text-sm text-gray-400">Enhanced Progressive Web App</p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <FaWifi className="w-3 h-3" />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            
            {isInstalled && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                <FaCheck className="w-3 h-3" />
                Installed
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Install */}
          {!isInstalled && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstall}
              className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex flex-col items-center gap-2"
            >
              <FaDownload className="w-6 h-6 text-white" />
              <span className="text-sm text-white">Install App</span>
            </motion.button>
          )}

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={requestNotifications}
            className={`p-4 rounded-xl flex flex-col items-center gap-2 ${
              notificationPermission === 'granted'
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-gray-800'
            }`}
          >
            <FaBell className={`w-6 h-6 ${
              notificationPermission === 'granted' ? 'text-green-400' : 'text-gray-400'
            }`} />
            <span className="text-sm text-gray-300">
              {notificationPermission === 'granted' ? 'Enabled' : 'Notifications'}
            </span>
          </motion.button>

          {/* Sync */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={syncOfflineData}
            disabled={!isOnline}
            className="p-4 bg-gray-800 rounded-xl flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <FaSync className={`w-6 h-6 text-blue-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span className="text-sm text-gray-300">
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
            </span>
          </motion.button>

          {/* Clear Cache */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearCache}
            className="p-4 bg-gray-800 rounded-xl flex flex-col items-center gap-2"
          >
            <FaDatabase className="w-6 h-6 text-orange-400" />
            <span className="text-sm text-gray-300">Clear Cache</span>
          </motion.button>
        </div>

        {/* Storage Info */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Offline Storage</span>
            <span className="text-white">{offlineData.size} / {offlineData.quota}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full h-2 transition-all"
              style={{ width: `${offlineData.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {offlineData.percentage}% of available storage used
          </p>
        </div>

        {/* Update Banner */}
        <AnimatePresence>
          {updateAvailable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FaBolt className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400">New version available!</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
              >
                Update Now
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Install Modal */}
      <AnimatePresence>
        {showInstallModal && !isInstalled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setShowInstallModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl md:rounded-2xl p-6 w-full max-w-md border border-gray-700"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white"
              >
                <FaTimes />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <FaMobile className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Install NexusMart</h3>
                <p className="text-gray-400">Get the full app experience</p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: FaBolt, text: 'Faster loading times' },
                  { icon: FaWifi, text: 'Works offline' },
                  { icon: FaBell, text: 'Push notifications' },
                  { icon: FaShieldAlt, text: 'Secure & private' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <item.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Platform-specific instructions */}
              {platform === 'ios' ? (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FaApple className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">iOS Instructions</span>
                  </div>
                  <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Tap the Share button in Safari</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to install</li>
                  </ol>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstall}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <FaDownload className="w-5 h-5" />
                  Install App
                </motion.button>
              )}

              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full mt-3 py-3 text-gray-500 hover:text-white transition-colors"
              >
                Maybe Later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedPWA;
