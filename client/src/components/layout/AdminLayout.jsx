import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiBell,
  FiSearch,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const menuItems = [
  { path: '/admin', name: 'Dashboard', icon: FiHome, end: true },
  { path: '/admin/products', name: 'Products', icon: FiPackage },
  { path: '/admin/orders', name: 'Orders', icon: FiShoppingBag },
  { path: '/admin/users', name: 'Users', icon: FiUsers },
  { path: '/admin/categories', name: 'Categories', icon: FiGrid },
  { path: '/admin/settings', name: 'Settings', icon: FiSettings },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Check admin access
  useEffect(() => {
    if (!user) {
      toast.error('Please login to access admin panel');
      navigate('/login');
    } else if (user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [user, navigate]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getPageTitle = () => {
    const current = menuItems.find(item => 
      item.end ? location.pathname === item.path : location.pathname.startsWith(item.path) && item.path !== '/admin'
    );
    return current?.name || 'Dashboard';
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none"></div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-gray-900/95 backdrop-blur-xl border-r border-purple-500/20 shadow-2xl shadow-purple-500/10 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-purple-500/20">
          <motion.div
            initial={false}
            animate={{ opacity: sidebarOpen ? 1 : 0 }}
            className={`flex items-center gap-3 ${!sidebarOpen && 'hidden'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-bold text-xl gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>NexusMart</span>
          </motion.div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-purple-500/20 border border-transparent hover:border-purple-500/30 transition-all"
          >
            <FiChevronRight className={`w-5 h-5 text-purple-300 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-purple-500/20"
          >
            <FiX className="w-5 h-5 text-purple-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-purple-300 hover:bg-purple-500/10 hover:text-cyan-400 border border-transparent hover:border-purple-500/30'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={false}
                animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                className={`font-medium whitespace-nowrap overflow-hidden ${!sidebarOpen && 'hidden'}`}
              >
                {item.name}
              </motion.span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-500/20 bg-gray-900/50">
          <div className={`flex items-center gap-3 mb-4 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-orange-500/30">
              {user?.firstName?.[0] || 'A'}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-yellow-400">⚡ Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all ${!sidebarOpen && 'justify-center'}`}
          >
            <FiLogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-purple-500/20 border border-purple-500/30"
            >
              <FiMenu className="w-6 h-6 text-purple-300" />
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>{getPageTitle()}</h1>
              <p className="text-sm text-purple-300">
                Welcome back, <span className="text-cyan-400">{user?.firstName || 'Admin'}</span>!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-xl">
              <FiSearch className="w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-white placeholder-purple-400/50 w-40"
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-purple-500/20 border border-purple-500/30 transition-all"
            >
              {isDark ? (
                <FiSun className="w-5 h-5 text-yellow-400" />
              ) : (
                <FiMoon className="w-5 h-5 text-purple-300" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-purple-500/20 border border-purple-500/30 transition-all">
              <FiBell className="w-5 h-5 text-purple-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Profile */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-lg shadow-orange-500/30">
              {user?.firstName?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
