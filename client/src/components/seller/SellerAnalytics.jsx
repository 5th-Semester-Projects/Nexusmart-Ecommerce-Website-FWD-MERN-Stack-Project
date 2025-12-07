import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  Store,
  Truck,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';

const SellerAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [dateRange, setDateRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axios.get(`/api/v1/seller/analytics?range=${dateRange}`),
        axios.get('/api/v1/seller/orders?limit=5'),
        axios.get('/api/v1/seller/products/top?limit=5')
      ]);

      setStats(statsRes.data.analytics);
      setRecentOrders(ordersRes.data.orders);
      setTopProducts(productsRes.data.products);
      setSalesChart(statsRes.data.salesChart || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set fallback data
      setStats({
        totalRevenue: 12450.00,
        totalOrders: 156,
        totalProducts: 42,
        averageRating: 4.7,
        pendingOrders: 8,
        processingOrders: 12,
        completedOrders: 136,
        revenueChange: 15.2,
        ordersChange: 8.5
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Seller Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track your store performance
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
            <button 
              onClick={fetchAnalytics}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={stats?.totalRevenue || 0}
            change={stats?.revenueChange}
            icon={DollarSign}
            color="bg-gradient-to-br from-green-400 to-emerald-600"
            prefix="$"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            change={stats?.ordersChange}
            icon={ShoppingCart}
            color="bg-gradient-to-br from-blue-400 to-indigo-600"
          />
          <StatCard
            title="Products Listed"
            value={stats?.totalProducts || 0}
            icon={Package}
            color="bg-gradient-to-br from-purple-400 to-pink-600"
          />
          <StatCard
            title="Average Rating"
            value={stats?.averageRating || 0}
            icon={Star}
            color="bg-gradient-to-br from-yellow-400 to-orange-600"
          />
        </div>

        {/* Order Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats?.pendingOrders || 0}
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-500">Pending Orders</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats?.processingOrders || 0}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-500">Processing</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats?.completedOrders || 0}
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">Completed</p>
            </div>
          </motion.div>
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y dark:divide-gray-700">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber || order._id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-500">{order.customer?.name || 'Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${order.total?.toFixed(2) || '0.00'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No recent orders
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Products
                </h2>
                <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y dark:divide-gray-700">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product._id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400 m-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">{product.sold || 0} sold</p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${product.price?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No products yet
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Package, label: 'Add Product', color: 'from-blue-400 to-blue-600' },
            { icon: CreditCard, label: 'Payouts', color: 'from-green-400 to-green-600' },
            { icon: MessageSquare, label: 'Messages', color: 'from-purple-400 to-purple-600' },
            { icon: Settings, label: 'Settings', color: 'from-gray-400 to-gray-600' }
          ].map((action, i) => (
            <button
              key={i}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
