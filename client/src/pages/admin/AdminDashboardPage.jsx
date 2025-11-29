import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchAdminOrders, fetchAdminProducts } from '../../redux/slices/adminSlice';
import { PageLoader } from '../../components/common/Loader';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

const StatCard = ({ title, value, change, icon: Icon, color, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-semibold ${
        change >= 0 ? 'text-green-500' : 'text-red-500'
      }`}>
        {change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
        {Math.abs(change)}%
      </div>
    </div>
    <h3 className="mt-4 text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
    <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
      {isLoading ? '...' : value}
    </p>
  </motion.div>
);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, statsLoading, orders, products } = useSelector((state) => state.admin);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAdminOrders({ limit: 5 }));
    dispatch(fetchAdminProducts({ limit: 5 }));
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchAdminOrders({ limit: 5 })),
      dispatch(fetchAdminProducts({ limit: 5 })),
    ]);
    setRefreshing(false);
  };

  // Sample/default data for charts (will be replaced by real data from stats)
  const revenueData = stats?.revenueChart || [
    { month: 'Jan', revenue: 4000, orders: 240 },
    { month: 'Feb', revenue: 3000, orders: 198 },
    { month: 'Mar', revenue: 5000, orders: 310 },
    { month: 'Apr', revenue: 4500, orders: 280 },
    { month: 'May', revenue: 6000, orders: 390 },
    { month: 'Jun', revenue: 5500, orders: 350 },
  ];

  const categoryData = stats?.categoryDistribution || [
    { name: 'Electronics', value: 400, color: '#6366f1' },
    { name: 'Fashion', value: 300, color: '#ec4899' },
    { name: 'Home', value: 200, color: '#f59e0b' },
    { name: 'Sports', value: 150, color: '#10b981' },
  ];

  const dashboardStats = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`,
      change: stats?.revenueChange || 12.5,
      icon: FiDollarSign,
      color: 'bg-gradient-to-br from-green-400 to-green-600',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders?.toLocaleString() || '0',
      change: stats?.ordersChange || 8.2,
      icon: FiShoppingBag,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: stats?.usersChange || 23.1,
      icon: FiUsers,
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts?.toLocaleString() || '0',
      change: stats?.productsChange || 5.4,
      icon: FiPackage,
      color: 'bg-gradient-to-br from-orange-400 to-orange-600',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - NexusMart</title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-500 dark:text-gray-400">Monitor your store's performance</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <StatCard key={index} {...stat} isLoading={statsLoading} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activity Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.user?.firstName || 'Customer'} {order.user?.lastName || ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${order.totalPrice?.toFixed(2) || '0.00'}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent orders</p>
              )}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Products</h3>
              <Link
                to="/admin/products"
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <img
                    src={product.images?.[0]?.url || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Stock: {product.stock} | Sold: {product.purchases || 0}
                    </p>
                  </div>
                  <p className="font-bold text-primary-600 dark:text-primary-400">${product.price}</p>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No products found</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
