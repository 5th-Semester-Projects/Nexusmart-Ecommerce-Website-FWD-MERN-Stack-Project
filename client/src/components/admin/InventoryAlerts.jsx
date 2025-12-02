import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertTriangle, FiPackage, FiTrendingDown, FiBell, 
  FiSettings, FiCheck, FiX, FiMail, FiRefreshCw, FiFilter,
  FiChevronRight, FiEdit2
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Stock Level Indicator
const StockLevelIndicator = ({ stock, threshold = 10 }) => {
  let color = 'bg-green-500';
  let text = 'In Stock';
  
  if (stock === 0) {
    color = 'bg-red-500';
    text = 'Out of Stock';
  } else if (stock <= threshold / 2) {
    color = 'bg-red-500';
    text = 'Critical';
  } else if (stock <= threshold) {
    color = 'bg-yellow-500';
    text = 'Low Stock';
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} animate-pulse`} />
      <span className={`text-sm font-medium ${
        stock === 0 ? 'text-red-400' : 
        stock <= threshold / 2 ? 'text-red-400' : 
        stock <= threshold ? 'text-yellow-400' : 'text-green-400'
      }`}>
        {text} ({stock})
      </span>
    </div>
  );
};

// Alert Item Component
const AlertItem = ({ alert, onDismiss, onRestock }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border ${
        alert.stock === 0 
          ? 'bg-red-900/20 border-red-500/30' 
          : 'bg-yellow-900/20 border-yellow-500/30'
      }`}
    >
      {/* Product Image */}
      <img
        src={alert.image || '/placeholder.jpg'}
        alt={alert.name}
        className="w-16 h-16 rounded-xl object-cover"
      />

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{alert.name}</h4>
        <p className="text-sm text-gray-400">SKU: {alert.sku || 'N/A'}</p>
        <StockLevelIndicator stock={alert.stock} threshold={alert.threshold} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onRestock?.(alert)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          Restock
        </button>
        <button
          onClick={() => onDismiss?.(alert._id)}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <FiX />
        </button>
      </div>
    </motion.div>
  );
};

// Inventory Alerts Settings Modal
const AlertSettingsModal = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave?.(localSettings);
    onClose();
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiSettings className="text-cyan-400" />
                Alert Settings
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Low Stock Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={localSettings.lowStockThreshold || 10}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    lowStockThreshold: parseInt(e.target.value)
                  }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alert when stock falls below this number
                </p>
              </div>

              {/* Critical Stock Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Critical Stock Threshold
                </label>
                <input
                  type="number"
                  value={localSettings.criticalStockThreshold || 5}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    criticalStockThreshold: parseInt(e.target.value)
                  }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none"
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-gray-400">Get alerts via email</p>
                </div>
                <button
                  onClick={() => setLocalSettings(prev => ({
                    ...prev,
                    emailNotifications: !prev.emailNotifications
                  }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    localSettings.emailNotifications ? 'bg-cyan-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.emailNotifications ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Daily Digest */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Daily Digest</p>
                  <p className="text-sm text-gray-400">Send summary at 9 AM</p>
                </div>
                <button
                  onClick={() => setLocalSettings(prev => ({
                    ...prev,
                    dailyDigest: !prev.dailyDigest
                  }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    localSettings.dailyDigest ? 'bg-cyan-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.dailyDigest ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main Inventory Alerts Component
const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'low' | 'out'
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    emailNotifications: true,
    dailyDigest: false,
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/inventory/alerts');
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Demo data
      setAlerts([
        { _id: '1', name: 'Premium Wireless Headphones', stock: 0, threshold: 10, sku: 'HDP-001', image: null },
        { _id: '2', name: 'Smart Watch Pro', stock: 3, threshold: 10, sku: 'SWP-002', image: null },
        { _id: '3', name: 'Bluetooth Speaker Mini', stock: 5, threshold: 10, sku: 'BSM-003', image: null },
        { _id: '4', name: 'USB-C Hub Adapter', stock: 8, threshold: 10, sku: 'UCH-004', image: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await api.delete(`/admin/inventory/alerts/${alertId}`);
      setAlerts(prev => prev.filter(a => a._id !== alertId));
      toast.success('Alert dismissed');
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const handleRestock = (product) => {
    // Navigate to product edit page or open restock modal
    toast.success(`Redirecting to restock ${product.name}`);
  };

  const handleSaveSettings = async (newSettings) => {
    try {
      await api.put('/admin/inventory/settings', newSettings);
      setSettings(newSettings);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'out') return alert.stock === 0;
    if (filter === 'critical') return alert.stock > 0 && alert.stock <= settings.criticalStockThreshold;
    if (filter === 'low') return alert.stock > settings.criticalStockThreshold && alert.stock <= settings.lowStockThreshold;
    return true;
  });

  const stats = {
    total: alerts.length,
    outOfStock: alerts.filter(a => a.stock === 0).length,
    critical: alerts.filter(a => a.stock > 0 && a.stock <= settings.criticalStockThreshold).length,
    low: alerts.filter(a => a.stock > settings.criticalStockThreshold && a.stock <= settings.lowStockThreshold).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiAlertTriangle className="text-yellow-400" />
            Inventory Alerts
          </h1>
          <p className="text-gray-400 mt-1">{stats.total} products need attention</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAlerts}
            className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            <FiRefreshCw />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            <FiSettings />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FiPackage className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-400">Total Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 border border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <FiX className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
              <p className="text-xs text-gray-400">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <FiTrendingDown className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{stats.critical}</p>
              <p className="text-xs text-gray-400">Critical</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <FiAlertTriangle className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{stats.low}</p>
              <p className="text-xs text-gray-400">Low Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'out', label: 'Out of Stock', color: 'text-red-400' },
          { key: 'critical', label: 'Critical', color: 'text-orange-400' },
          { key: 'low', label: 'Low Stock', color: 'text-yellow-400' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                : `bg-white/5 ${f.color || 'text-gray-400'} hover:bg-white/10`
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl">
          <FiCheck className="text-5xl text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">All Good!</h3>
          <p className="text-gray-400">No inventory alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAlerts.map((alert) => (
              <AlertItem
                key={alert._id}
                alert={alert}
                onDismiss={handleDismiss}
                onRestock={handleRestock}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Settings Modal */}
      <AlertSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default InventoryAlerts;
