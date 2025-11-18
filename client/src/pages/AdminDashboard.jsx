import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, FiPackage, FiEdit2, FiTrash2, FiPlus, FiDownload } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { PageLoader } from '../components/common/Loader';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', name: 'Overview' },
  { id: 'products', name: 'Products' },
  { id: 'orders', name: 'Orders' },
  { id: 'users', name: 'Users' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Check admin access
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [user, navigate]);

  // Mock data
  const stats = [
    { id: 1, name: 'Total Revenue', value: '$45,231', change: '+12.5%', icon: FiDollarSign, color: 'bg-green-500' },
    { id: 2, name: 'Total Orders', value: '1,234', change: '+8.2%', icon: FiShoppingBag, color: 'bg-blue-500' },
    { id: 3, name: 'Total Users', value: '892', change: '+23.1%', icon: FiUsers, color: 'bg-purple-500' },
    { id: 4, name: 'Total Products', value: '456', change: '+5.4%', icon: FiPackage, color: 'bg-orange-500' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 4000, orders: 240 },
    { month: 'Feb', revenue: 3000, orders: 198 },
    { month: 'Mar', revenue: 5000, orders: 310 },
    { month: 'Apr', revenue: 4500, orders: 280 },
    { month: 'May', revenue: 6000, orders: 390 },
    { month: 'Jun', revenue: 5500, orders: 350 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400, color: '#6366f1' },
    { name: 'Fashion', value: 300, color: '#ec4899' },
    { name: 'Home', value: 200, color: '#f59e0b' },
    { name: 'Sports', value: 150, color: '#10b981' },
  ];

  const topProducts = [
    { id: 1, name: 'Wireless Headphones', sales: 234, revenue: '$11,700', stock: 45 },
    { id: 2, name: 'Smart Watch', sales: 189, revenue: '$37,800', stock: 23 },
    { id: 3, name: 'Laptop Stand', sales: 156, revenue: '$4,680', stock: 67 },
    { id: 4, name: 'USB-C Cable', sales: 142, revenue: '$2,840', stock: 120 },
  ];

  const recentOrders = [
    { id: '1', orderNumber: 'ORD-2024-345', customer: 'John Doe', total: '$159.99', status: 'processing', date: '2024-11-13' },
    { id: '2', orderNumber: 'ORD-2024-344', customer: 'Jane Smith', total: '$89.99', status: 'shipped', date: '2024-11-13' },
    { id: '3', orderNumber: 'ORD-2024-343', customer: 'Bob Johnson', total: '$299.99', status: 'delivered', date: '2024-11-12' },
  ];

  const products = [
    { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 49.99, stock: 45, status: 'active' },
    { id: 2, name: 'Smart Watch', category: 'Electronics', price: 199.99, stock: 23, status: 'active' },
    { id: 3, name: 'Yoga Mat', category: 'Sports', price: 29.99, stock: 0, status: 'out_of_stock' },
  ];

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', orders: 12, joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', orders: 8, joined: '2024-02-20' },
    { id: 3, name: 'Admin User', email: 'admin@nexusmart.com', role: 'admin', orders: 0, joined: '2023-12-01' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <PageLoader text="Loading admin dashboard..." />;

  return (
    <>
      <Helmet><title>Admin Dashboard - NexusMart</title></Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your e-commerce platform</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stat.id * 0.1 }}
                    className="card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-green-600 dark:text-green-400 text-sm font-semibold flex items-center gap-1">
                        <FiTrendingUp className="w-4 h-4" />
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.name}</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                    <Button variant="outline" size="sm" icon={FiDownload}>Export</Button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} />
                      <Line type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sales by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Products & Recent Orders */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Top Products</h3>
                  <div className="space-y-4">
                    {topProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{product.sales} sales</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600 dark:text-primary-400">{product.revenue}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{order.total}</p>
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h2>
                <Button variant="primary" icon={FiPlus} onClick={() => setShowProductModal(true)}>
                  Add Product
                </Button>
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {typeof product.category === 'object' ? product.category?.name : product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">${product.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{product.stock}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(product.status)}`}>
                              {product.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" icon={FiEdit2}>Edit</Button>
                            <Button variant="ghost" size="sm" icon={FiTrash2} className="text-red-600">Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h2>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{order.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{order.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">{order.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>{order.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button variant="ghost" size="sm">View Details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.orders}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.joined}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button variant="ghost" size="sm">Manage</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="Add New Product" size="lg">
        <div className="space-y-4">
          <Input label="Product Name" placeholder="Enter product name" required />
          <Input label="Price" type="number" placeholder="0.00" required />
          <Input label="Stock" type="number" placeholder="0" required />
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowProductModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={() => { toast.success('Product added!'); setShowProductModal(false); }}>Add Product</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminDashboard;
