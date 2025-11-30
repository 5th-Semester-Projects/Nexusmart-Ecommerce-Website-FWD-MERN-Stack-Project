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

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

const StatCard = ({ title, value, change, icon: Icon, color, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-semibold ${
        change >= 0 ? 'text-green-400' : 'text-red-400'
      }`}>
        {change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
        {Math.abs(change)}%
      </div>
    </div>
    <h3 className="mt-4 text-purple-300 text-sm font-medium">{title}</h3>
    <p className="mt-1 text-3xl font-bold text-white">
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
      processing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      delivered: 'bg-green-500/20 text-green-400 border border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
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
            <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>Dashboard Overview</h1>
            <p className="text-purple-300">Monitor your store's performance</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-500 hover:to-cyan-500 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30"
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
            className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#a855f7" />
                <YAxis stroke="#a855f7" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
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
            className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6">Sales by Category</h3>
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
                    backgroundColor: '#1e1b4b',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
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
            className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              >
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-white">
                      {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
                    </p>
                    <p className="text-sm text-purple-300">
                      {order.user?.firstName || 'Customer'} {order.user?.lastName || ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-cyan-400">
                      ${order.totalPrice?.toFixed(2) || '0.00'}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-purple-300 py-8">No recent orders</p>
              )}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Top Products</h3>
              <Link
                to="/admin/products"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              >
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
                >
                  <img
                    src={product.images?.[0]?.url || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border border-purple-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{product.name}</p>
                    <p className="text-sm text-purple-300">
                      Stock: {product.stock} | Sold: {product.purchases || 0}
                    </p>
                  </div>
                  <p className="font-bold text-cyan-400">${product.price}</p>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-center text-purple-300 py-8">No products found</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
