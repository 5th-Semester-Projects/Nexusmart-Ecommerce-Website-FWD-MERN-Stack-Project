import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Percent,
  ShoppingCart,
  Users,
  Calendar,
  Info
} from 'lucide-react';
import axios from 'axios';

const AIPricingOptimizer = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pricingStrategy, setPricingStrategy] = useState('balanced');
  const [settings, setSettings] = useState({
    minDiscount: 5,
    maxDiscount: 30,
    competitorTracking: true,
    demandSensitivity: 'medium',
    autoApply: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPricingSuggestions();
  }, [pricingStrategy]);

  const fetchPricingSuggestions = async () => {
    setIsLoading(true);
    try {
      const [suggestionsRes, statsRes] = await Promise.all([
        axios.get(`/api/v1/ai/pricing/suggestions?strategy=${pricingStrategy}`),
        axios.get('/api/v1/ai/pricing/stats')
      ]);

      setProducts(suggestionsRes.data.suggestions);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching pricing suggestions:', error);
      // Fallback data
      setStats({
        totalProducts: 156,
        optimizedProducts: 42,
        averageOptimization: 12.5,
        projectedRevenueIncrease: 8500,
        competitorPriceChanges: 23
      });
      setProducts([
        {
          _id: '1',
          name: 'Wireless Bluetooth Headphones',
          sku: 'WH-001',
          currentPrice: 79.99,
          suggestedPrice: 89.99,
          competitorPrice: 94.99,
          demand: 'high',
          inventory: 45,
          priceChange: 12.5,
          confidence: 92,
          factors: ['High demand', 'Low inventory', 'Competitor price higher']
        },
        {
          _id: '2',
          name: 'Smart Watch Series 5',
          sku: 'SW-005',
          currentPrice: 299.99,
          suggestedPrice: 279.99,
          competitorPrice: 269.99,
          demand: 'medium',
          inventory: 120,
          priceChange: -6.7,
          confidence: 85,
          factors: ['Competitor price lower', 'Excess inventory']
        },
        {
          _id: '3',
          name: 'USB-C Hub Pro',
          sku: 'UH-003',
          currentPrice: 49.99,
          suggestedPrice: 54.99,
          competitorPrice: 59.99,
          demand: 'high',
          inventory: 28,
          priceChange: 10,
          confidence: 88,
          factors: ['High demand', 'Below market average']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPrice = async (productId, newPrice) => {
    try {
      await axios.put(`/api/v1/ai/pricing/apply`, {
        productId,
        newPrice
      });
      
      // Update local state
      setProducts(products.map(p => 
        p._id === productId 
          ? { ...p, currentPrice: newPrice, applied: true }
          : p
      ));
    } catch (error) {
      console.error('Error applying price:', error);
    }
  };

  const strategies = [
    { id: 'aggressive', label: 'Aggressive', desc: 'Maximize revenue', icon: Zap, color: 'from-red-500 to-orange-500' },
    { id: 'balanced', label: 'Balanced', desc: 'Revenue + competitiveness', icon: Activity, color: 'from-purple-500 to-pink-500' },
    { id: 'competitive', label: 'Competitive', desc: 'Match competitors', icon: Target, color: 'from-blue-500 to-cyan-500' },
    { id: 'conservative', label: 'Conservative', desc: 'Minimize risk', icon: BarChart3, color: 'from-green-500 to-emerald-500' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Analyzing market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Dynamic Pricing
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Optimize prices based on demand, competition, and market trends
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={fetchPricingSuggestions}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              +${(stats?.projectedRevenueIncrease || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Projected Revenue Increase</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Percent className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.averageOptimization || 0}%
            </p>
            <p className="text-sm text-gray-500">Avg. Optimization</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.optimizedProducts || 0}
            </p>
            <p className="text-sm text-gray-500">Optimized Products</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.competitorPriceChanges || 0}
            </p>
            <p className="text-sm text-gray-500">Competitor Changes</p>
          </motion.div>
        </div>

        {/* Strategy Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pricing Strategy
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setPricingStrategy(strategy.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  pricingStrategy === strategy.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${strategy.color} flex items-center justify-center mb-3`}>
                  <strategy.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-left">
                  {strategy.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                  {strategy.desc}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pricing Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Price Optimization Suggestions
            </h2>
          </div>

          <div className="divide-y dark:divide-gray-700">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <span className="text-sm text-gray-500">{product.sku}</span>
                    </div>
                    
                    {/* Price Comparison */}
                    <div className="flex items-center gap-6 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Current Price</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          ${product.currentPrice}
                        </p>
                      </div>
                      <div className="text-2xl text-gray-300">→</div>
                      <div>
                        <p className="text-sm text-gray-500">Suggested Price</p>
                        <p className={`text-xl font-bold ${
                          product.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${product.suggestedPrice}
                        </p>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Competitor</p>
                        <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
                          ${product.competitorPrice}
                        </p>
                      </div>
                    </div>

                    {/* Factors */}
                    <div className="flex flex-wrap gap-2">
                      {product.factors?.map((factor, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Change & Actions */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`flex items-center gap-1 text-lg font-bold ${
                        product.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.priceChange > 0 ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        {Math.abs(product.priceChange)}%
                      </div>
                      <p className="text-xs text-gray-500">Change</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${product.confidence}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{product.confidence}% confidence</p>
                    </div>

                    <button
                      onClick={() => handleApplyPrice(product._id, product.suggestedPrice)}
                      disabled={product.applied}
                      className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                        product.applied
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {product.applied ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Applied
                        </span>
                      ) : (
                        'Apply Price'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Pricing Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Discount (%)
                    </label>
                    <input
                      type="number"
                      value={settings.minDiscount}
                      onChange={(e) => setSettings({ ...settings, minDiscount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Discount (%)
                    </label>
                    <input
                      type="number"
                      value={settings.maxDiscount}
                      onChange={(e) => setSettings({ ...settings, maxDiscount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Demand Sensitivity
                    </label>
                    <select
                      value={settings.demandSensitivity}
                      onChange={(e) => setSettings({ ...settings, demandSensitivity: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-apply prices</span>
                    <button
                      onClick={() => setSettings({ ...settings, autoApply: !settings.autoApply })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.autoApply ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                        settings.autoApply ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full mt-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Save Settings
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIPricingOptimizer;
