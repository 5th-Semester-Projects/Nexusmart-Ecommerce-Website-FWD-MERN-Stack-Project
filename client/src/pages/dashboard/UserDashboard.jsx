import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiPackage, FiHeart, FiSettings, FiShoppingBag, FiCreditCard, FiTrash2, FiEye, FiShoppingCart, FiArrowRight, FiCheck, FiClock, FiTruck, FiX } from 'react-icons/fi';
import { fetchOrders } from '../../redux/slices/orderSlice';
import { removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

// Dashboard Overview Component
const DashboardOverview = ({ orders, wishlistItems, totalSpent }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const stats = [
    { 
      label: 'Total Orders', 
      value: orders?.length || 0, 
      icon: FiShoppingBag, 
      gradient: 'from-purple-500 to-blue-500',
      path: '/dashboard/orders'
    },
    { 
      label: 'Wishlist Items', 
      value: wishlistItems?.length || 0, 
      icon: FiHeart, 
      gradient: 'from-pink-500 to-red-500',
      path: '/dashboard/wishlist'
    },
    { 
      label: 'Total Spent', 
      value: `$${totalSpent.toFixed(2)}`, 
      icon: FiCreditCard, 
      gradient: 'from-green-500 to-emerald-500',
      path: '/dashboard/orders'
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-bold gradient-text mb-4">Welcome back, {user?.firstName || 'User'}! 👋</h2>
        <p className="text-purple-300/70">Manage your orders, wishlist and account settings from here.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(stat.path)}
            className="glass-card p-6 rounded-2xl cursor-pointer hover:border-purple-500/50 border border-transparent transition-all relative z-10"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="text-white text-xl" />
              </div>
              <div>
                <p className="text-purple-300/50 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-cyan-400 text-sm">
              <span>View details</span>
              <FiArrowRight className="ml-2" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders Preview */}
      {orders && orders.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Recent Orders</h3>
            <Link to="/dashboard/orders" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-purple-900/20 rounded-xl">
                <div>
                  <p className="text-white font-medium">Order #{order.orderNumber || order._id?.slice(-8)}</p>
                  <p className="text-purple-300/50 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-bold">${(order.pricing?.totalPrice || order.totalPrice || 0).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.orderStatus === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                    order.orderStatus === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    order.orderStatus === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>{order.orderStatus || 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Orders Page Component
const OrdersPage = ({ orders, loading }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered': return <FiCheck className="text-green-400" />;
      case 'Shipped': return <FiTruck className="text-blue-400" />;
      case 'Processing': return <FiClock className="text-yellow-400" />;
      case 'Cancelled': return <FiX className="text-red-400" />;
      default: return <FiPackage className="text-purple-400" />;
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <FiPackage className="w-16 h-16 mx-auto text-purple-500/50 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
        <p className="text-purple-300/70 mb-6">Start shopping to see your orders here!</p>
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          <FiShoppingBag /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 rounded-2xl">
        <h2 className="text-2xl font-bold text-white">My Orders ({orders.length})</h2>
      </div>
      
      {orders.map((order) => (
        <motion.div 
          key={order._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <p className="text-purple-300/50 text-sm">Order ID</p>
              <p className="text-white font-mono">#{order.orderNumber || order._id?.slice(-8)}</p>
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Date</p>
              <p className="text-white">{new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'short', day: 'numeric' 
              })}</p>
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Total</p>
              <p className="text-cyan-400 font-bold text-lg">${(order.pricing?.totalPrice || order.totalPrice || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Status</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.orderStatus)}
                <span className={`font-medium ${
                  order.orderStatus === 'Delivered' ? 'text-green-400' :
                  order.orderStatus === 'Shipped' ? 'text-blue-400' :
                  order.orderStatus === 'Processing' ? 'text-yellow-400' :
                  order.orderStatus === 'Cancelled' ? 'text-red-400' :
                  'text-purple-400'
                }`}>{order.orderStatus}</span>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="border-t border-purple-500/20 pt-4">
            <p className="text-purple-300/50 text-sm mb-3">Items ({order.orderItems?.length || 0})</p>
            <div className="space-y-3">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-purple-900/20 rounded-xl">
                  <img 
                    src={item.image || '/placeholder.jpg'} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-purple-300/50 text-sm">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                  </div>
                  <p className="text-cyan-400 font-bold">${(item.quantity * item.price)?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingInfo && (
            <div className="border-t border-purple-500/20 pt-4 mt-4">
              <p className="text-purple-300/50 text-sm mb-2">Shipping Address</p>
              <p className="text-white">
                {order.shippingInfo.firstName} {order.shippingInfo.lastName}<br/>
                {order.shippingInfo.address?.street || order.shippingInfo.address}, {order.shippingInfo.address?.city || order.shippingInfo.city}, {order.shippingInfo.address?.state || order.shippingInfo.state} {order.shippingInfo.address?.zipCode || order.shippingInfo.postalCode}, {order.shippingInfo.address?.country || order.shippingInfo.country}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Wishlist Page Component
const WishlistPage = ({ wishlistItems, dispatch }) => {
  const navigate = useNavigate();

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
    toast.success('Added to cart!');
  };

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <FiHeart className="w-16 h-16 mx-auto text-pink-500/50 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Wishlist is Empty</h2>
        <p className="text-purple-300/70 mb-6">Save items you love to your wishlist!</p>
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all"
        >
          <FiShoppingBag /> Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 rounded-2xl">
        <h2 className="text-2xl font-bold text-white">My Wishlist ({wishlistItems.length})</h2>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {wishlistItems.map((item) => (
          <motion.div 
            key={item._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-4 rounded-2xl"
          >
            <div className="flex gap-4">
              <img 
                src={item.images?.[0]?.url || item.image || '/placeholder.jpg'} 
                alt={item.name}
                className="w-24 h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/product/${item._id}`)}
              />
              <div className="flex-1">
                <h3 
                  className="text-white font-medium hover:text-cyan-400 cursor-pointer transition-colors line-clamp-2"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  {item.name}
                </h3>
                <p className="text-cyan-400 font-bold text-lg mt-1">${item.price?.toFixed(2)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    <FiShoppingCart className="text-sm" /> Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Settings Page Component
const SettingsPage = ({ user }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Profile update feature coming soon!');
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-300/70 text-sm mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-purple-300/70 text-sm mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-purple-300/70 text-sm mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled
            className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-purple-300/50 cursor-not-allowed"
          />
          <p className="text-purple-300/40 text-xs mt-1">Email cannot be changed</p>
        </div>
        
        <div>
          <label className="block text-purple-300/70 text-sm mb-2">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>
        
        <div className="border-t border-purple-500/20 pt-6">
          <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-purple-300/70 text-sm mb-2">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-purple-300/70 text-sm mb-2">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

// Main UserDashboard Component
const UserDashboard = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading: ordersLoading } = useSelector((state) => state.orders);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // Fetch orders on mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Calculate total spent - handle both old and new schema
  const totalSpent = orders?.reduce((sum, order) => sum + (order.pricing?.totalPrice || order.totalPrice || 0), 0) || 0;
  
  const menuItems = [
    { path: '/dashboard', name: 'Overview', icon: FiUser, end: true },
    { path: '/dashboard/orders', name: 'My Orders', icon: FiPackage, count: orders?.length || 0 },
    { path: '/dashboard/wishlist', name: 'Wishlist', icon: FiHeart, count: wishlistItems?.length || 0 },
    { path: '/dashboard/settings', name: 'Settings', icon: FiSettings },
  ];

  const isActive = (path, end = false) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - NexusMart</title>
      </Helmet>
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold gradient-text mb-8"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            User Dashboard
          </motion.h1>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 rounded-2xl h-fit relative z-10"
            >
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-purple-500/20">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-bold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-purple-300/50">{user?.email}</p>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive(item.path, item.end)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-purple-300 hover:bg-purple-500/10 hover:text-cyan-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="text-lg" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.count > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive(item.path, item.end) 
                          ? 'bg-white/20 text-white' 
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </motion.aside>
            
            {/* Main Content */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 relative z-10"
            >
              <Routes>
                <Route index element={
                  <DashboardOverview 
                    orders={orders} 
                    wishlistItems={wishlistItems} 
                    totalSpent={totalSpent} 
                  />
                } />
                <Route path="orders" element={
                  <OrdersPage orders={orders} loading={ordersLoading} />
                } />
                <Route path="wishlist" element={
                  <WishlistPage wishlistItems={wishlistItems} dispatch={dispatch} />
                } />
                <Route path="settings" element={
                  <SettingsPage user={user} />
                } />
              </Routes>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
