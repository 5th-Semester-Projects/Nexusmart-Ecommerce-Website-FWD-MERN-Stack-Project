import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Bell,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Download,
  Zap,
  Target,
  ShoppingCart,
  Layers,
  Activity
} from 'lucide-react';
import axios from 'axios';

const AIInventoryForecasting = () => {
  const [forecasts, setForecasts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [view, setView] = useState('overview');

  useEffect(() => {
    fetchForecasts();
  }, [timeRange]);

  const fetchForecasts = async () => {
    setIsLoading(true);
    try {
      const [forecastRes, alertsRes, statsRes] = await Promise.all([
        axios.get(`/api/v1/ai/inventory/forecast?range=${timeRange}`),
        axios.get('/api/v1/ai/inventory/alerts'),
        axios.get('/api/v1/ai/inventory/stats')
      ]);

      setForecasts(forecastRes.data.forecasts);
      setAlerts(alertsRes.data.alerts);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
      // Fallback data
      setStats({
        totalProducts: 156,
        lowStockCount: 12,
        outOfStockCount: 3,
        overstockCount: 8,
        accuracyScore: 94.2,
        potentialSavings: 4500,
        reorderSuggestions: 15
      });
      setForecasts([
        {
          _id: '1',
          product: { name: 'Wireless Headphones', sku: 'WH-001', image: null },
          currentStock: 45,
          predictedDemand: 120,
          daysToStockout: 8,
          reorderPoint: 30,
          suggestedOrder: 100,
          confidence: 92,
          trend: 'increasing'
        },
        {
          _id: '2',
          product: { name: 'Smart Watch Pro', sku: 'SW-002', image: null },
          currentStock: 12,
          predictedDemand: 80,
          daysToStockout: 3,
          reorderPoint: 25,
          suggestedOrder: 75,
          confidence: 88,
          trend: 'increasing'
        }
      ]);
      setAlerts([
        { _id: '1', type: 'critical', message: 'Smart Watch Pro will be out of stock in 3 days', product: 'SW-002' },
        { _id: '2', type: 'warning', message: 'Wireless Headphones approaching reorder point', product: 'WH-001' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (productId, quantity) => {
    try {
      await axios.post('/api/v1/ai/inventory/reorder', {
        productId,
        quantity
      });
      // Show success notification
      fetchForecasts();
    } catch (error) {
      console.error('Error placing reorder:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Analyzing inventory patterns...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Inventory Forecasting
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Powered by predictive analytics and machine learning
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7days">Next 7 Days</option>
              <option value="30days">Next 30 Days</option>
              <option value="90days">Next 90 Days</option>
            </select>
            <button 
              onClick={fetchForecasts}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-2"
          >
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert._id}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  alert.type === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 ${
                  alert.type === 'critical' ? 'text-red-500' : 'text-yellow-500'
                }`} />
                <p className={`text-sm font-medium ${
                  alert.type === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                }`}>
                  {alert.message}
                </p>
                <button className="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Take Action
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Forecast Accuracy"
            value={`${stats?.accuracyScore || 0}%`}
            icon={Target}
            color="bg-gradient-to-br from-green-400 to-emerald-600"
            subtitle="Based on last 30 days"
          />
          <StatCard
            title="Low Stock Items"
            value={stats?.lowStockCount || 0}
            icon={AlertTriangle}
            color="bg-gradient-to-br from-yellow-400 to-orange-600"
            subtitle="Need attention"
          />
          <StatCard
            title="Reorder Suggestions"
            value={stats?.reorderSuggestions || 0}
            icon={ShoppingCart}
            color="bg-gradient-to-br from-blue-400 to-indigo-600"
            subtitle="AI recommended"
          />
          <StatCard
            title="Potential Savings"
            value={`$${(stats?.potentialSavings || 0).toLocaleString()}`}
            icon={DollarSign}
            color="bg-gradient-to-br from-purple-400 to-pink-600"
            subtitle="With optimized ordering"
          />
        </div>

        {/* Forecasts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Demand Forecasts
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('overview')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    view === 'overview'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setView('detailed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    view === 'detailed'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Detailed
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Predicted Demand
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Days to Stockout
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {forecasts.map((forecast) => (
                  <tr key={forecast._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {forecast.product?.name}
                          </p>
                          <p className="text-sm text-gray-500">{forecast.product?.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-medium ${
                        forecast.currentStock <= forecast.reorderPoint
                          ? 'text-red-600'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {forecast.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white font-medium">
                      {forecast.predictedDemand}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        forecast.daysToStockout <= 3
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : forecast.daysToStockout <= 7
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {forecast.daysToStockout} days
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {forecast.trend === 'increasing' ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Up</span>
                          </>
                        ) : forecast.trend === 'decreasing' ? (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Down</span>
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Stable</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${forecast.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {forecast.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleReorder(forecast.product?._id, forecast.suggestedOrder)}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Reorder {forecast.suggestedOrder}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIInventoryForecasting;
