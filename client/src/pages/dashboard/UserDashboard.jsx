import React from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiUser, FiPackage, FiHeart, FiSettings, FiShoppingBag, FiCreditCard } from 'react-icons/fi';

const DashboardOverview = () => {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-bold gradient-text mb-4">Welcome back, {user?.firstName || 'User'}! 👋</h2>
        <p className="text-purple-300/70">Manage your orders, wishlist and account settings from here.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <FiShoppingBag className="text-white text-xl" />
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
              <FiHeart className="text-white text-xl" />
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Wishlist Items</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <FiCreditCard className="text-white text-xl" />
            </div>
            <div>
              <p className="text-purple-300/50 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-white">$0.00</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  const menuItems = [
    { path: '/dashboard', name: 'Overview', icon: FiUser, end: true },
    { path: '/dashboard/orders', name: 'My Orders', icon: FiPackage },
    { path: '/dashboard/wishlist', name: 'Wishlist', icon: FiHeart },
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
              className="glass-card p-6 rounded-2xl h-fit"
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive(item.path, item.end)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-purple-300 hover:bg-purple-500/10 hover:text-cyan-400'
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
            
            {/* Main Content */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/orders" element={
                  <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">My Orders</h2>
                    <p className="text-purple-300/70">You haven't placed any orders yet.</p>
                  </div>
                } />
                <Route path="/wishlist" element={
                  <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">My Wishlist</h2>
                    <p className="text-purple-300/70">Your wishlist is empty.</p>
                  </div>
                } />
                <Route path="/settings" element={
                  <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Account Settings</h2>
                    <p className="text-purple-300/70">Coming soon...</p>
                  </div>
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
