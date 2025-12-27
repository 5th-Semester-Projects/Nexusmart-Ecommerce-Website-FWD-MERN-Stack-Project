import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, 
  FiPackage, FiSettings, FiLogOut, FiZap, FiShield, FiBell 
} from 'react-icons/fi';
import { toggleMobileMenu } from '../../redux/slices/uiSlice';
import { clearCredentials } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { NotificationsCenter } from '../notifications';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { isAuthenticated, user } = useSelector((state) => state?.auth || {});
  const { theme, mobileMenuOpen } = useSelector((state) => state?.ui || { theme: 'magical' });
  const { items: cartItems = [] } = useSelector((state) => state?.cart || {});
  const { items: wishlistItems = [] } = useSelector((state) => state?.wishlist || {});

  const handleLogout = () => {
    setUserMenuOpen(false);
    // Clear all auth data
    dispatch(clearCredentials());
    // Clear any cached data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();
    // Navigate and force reload to clear any stale state
    navigate('/login');
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{ overflow: 'visible !important', overflowY: 'visible !important', overflowX: 'hidden' }}
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl border-b border-purple-500/20 w-full" style={{ overflow: 'visible' }}></div>
        
        {/* Animated Border Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
        
        {/* Floating Orb Effect */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-between h-20 w-full" style={{ overflow: 'visible' }}>
            
            {/* Logo - Enhanced with 3D effect */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative w-12 h-12"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiZap className="text-white text-2xl" />
                </div>
              </motion.div>
              <motion.span
                className="text-2xl font-bold hidden sm:block"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="gradient-text">NexusMart</span>
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/products"
                className="text-purple-300 hover:text-cyan-400 transition-colors duration-300 font-medium relative group"
              >
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              
              <Link
                to="/categories"
                className="text-purple-300 hover:text-cyan-400 transition-colors duration-300 font-medium relative group"
              >
                Categories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
              </Link>

              <Link
                to="/deals"
                className="text-purple-300 hover:text-cyan-400 transition-colors duration-300 font-medium relative group"
              >
                Deals
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
              </Link>

              <Link
                to="/rewards"
                className="text-purple-300 hover:text-cyan-400 transition-colors duration-300 font-medium relative group flex items-center gap-1"
              >
                <span className="text-yellow-400">🎮</span> Rewards
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl
                         bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30
                         text-purple-300 hover:text-cyan-400 transition-all duration-300"
              >
                <FiSearch className="text-xl" />
              </motion.button>

              {/* Theme Switcher */}
              <div className="hidden md:block">
                <ThemeSwitcher variant="dropdown" />
              </div>

              {/* Wishlist */}
              <Link to="/wishlist">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl
                           bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30
                           text-purple-300 hover:text-cyan-400 transition-all duration-300"
                >
                  <FiHeart className="text-xl" />
                  {wishlistItems.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-500 to-red-500 
                               text-white text-xs rounded-full flex items-center justify-center font-bold
                               shadow-lg shadow-pink-500/50"
                    >
                      {wishlistItems.length}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Notifications Bell */}
              {isAuthenticated && (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative flex items-center justify-center w-10 h-10 rounded-xl
                             bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30
                             text-purple-300 hover:text-cyan-400 transition-all duration-300"
                  >
                    <FiBell className="text-xl" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-cyan-500 to-blue-500 
                                 text-white text-xs rounded-full flex items-center justify-center font-bold
                                 shadow-lg shadow-cyan-500/50"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </motion.button>

                  {/* Notifications Dropdown */}
                  <NotificationsCenter 
                    isOpen={notificationsOpen} 
                    onClose={() => setNotificationsOpen(false)}
                    onUnreadCountChange={setUnreadCount}
                  />
                </div>
              )}

              {/* Cart */}
              <Link to="/cart">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl
                           bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30
                           text-purple-300 hover:text-cyan-400 transition-all duration-300"
                >
                  <FiShoppingCart className="text-xl" />
                  {cartItems.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 
                               text-white text-xs rounded-full flex items-center justify-center font-bold
                               shadow-lg shadow-purple-500/50"
                    >
                      {cartItems.length}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* User Menu or Login */}
              {isAuthenticated ? (
                <div className="relative z-[100]">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl
                             ${user?.role === 'admin' 
                               ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 border-yellow-500/30' 
                               : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-purple-500/30'}
                             border transition-all duration-300 cursor-pointer`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                                  ${user?.role === 'admin' 
                                    ? 'bg-gradient-to-br from-yellow-400 to-red-500' 
                                    : 'bg-gradient-to-br from-cyan-400 to-purple-400'}`}>
                      {user?.role === 'admin' ? <FiShield className="text-sm" /> : (user?.name?.[0] || user?.firstName?.[0] || 'U')}
                    </div>
                    <span className="hidden md:flex items-center gap-2 text-white font-medium">
                      {user?.name?.split(' ')[0] || user?.firstName || 'User'}
                      {user?.role === 'admin' && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
                      )}
                    </span>
                  </motion.button>

                  {/* Dropdown - Click based */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        {/* Backdrop to close menu */}
                        <div 
                          className="fixed inset-0 z-[99]" 
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-56 z-[100]
                                   bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 
                                   rounded-xl shadow-2xl shadow-purple-500/20"
                        >
                          <div className="p-2 space-y-1">
                            <Link
                              to="/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg
                                       text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10
                                       transition-all duration-300"
                            >
                              <FiUser className="text-lg" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              to="/dashboard/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg
                                       text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10
                                       transition-all duration-300"
                            >
                              <FiPackage className="text-lg" />
                              <span>My Orders</span>
                            </Link>
                            <Link
                              to="/dashboard/settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg
                                       text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10
                                       transition-all duration-300"
                            >
                              <FiSettings className="text-lg" />
                              <span>Settings</span>
                            </Link>
                            
                            {/* Admin Panel Link - Only for admins */}
                            {user?.role === 'admin' && (
                              <Link
                                to="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg
                                         text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10
                                         transition-all duration-300"
                              >
                                <FiShield className="text-lg" />
                                <span>Admin Panel</span>
                              </Link>
                            )}
                            
                            <div className="border-t border-purple-500/20 my-2"></div>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                                       text-red-400 hover:text-red-300 hover:bg-red-500/10
                                       transition-all duration-300"
                            >
                              <FiLogOut className="text-lg" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="neon" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(toggleMobileMenu())}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl
                         bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30
                         text-purple-300 hover:text-cyan-400 transition-all duration-300"
              >
                {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-gray-950/90 backdrop-blur-xl flex items-start justify-center pt-32"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  autoFocus
                  className="w-full px-6 py-6 pl-16 pr-16 bg-gray-900/50 border-2 border-purple-500/30 rounded-2xl
                           text-white text-lg placeholder-purple-400/50
                           focus:border-cyan-500 focus:outline-none
                           transition-all duration-300 backdrop-blur-sm"
                />
                <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl text-purple-400" />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl text-purple-400 hover:text-cyan-400 transition-colors"
                >
                  <FiX />
                </button>
              </form>
              <p className="mt-4 text-center text-purple-300/50 text-sm">
                Press ESC to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(toggleMobileMenu())}
              className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[54] lg:hidden"
            />
            
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed right-0 top-0 bottom-0 w-80 z-[55] lg:hidden"
            >
              <div className="h-full glass-card rounded-l-3xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Menu
                </h3>
                <button
                  onClick={() => dispatch(toggleMobileMenu())}
                  className="text-purple-300 hover:text-cyan-400"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <Link
                  to="/"
                  onClick={() => dispatch(toggleMobileMenu())}
                  className="block px-4 py-3 rounded-xl text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10 transition-all"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  onClick={() => dispatch(toggleMobileMenu())}
                  className="block px-4 py-3 rounded-xl text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10 transition-all"
                >
                  Products
                </Link>
                <Link
                  to="/categories"
                  onClick={() => dispatch(toggleMobileMenu())}
                  className="block px-4 py-3 rounded-xl text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10 transition-all"
                >
                  Categories
                </Link>
                <Link
                  to="/deals"
                  onClick={() => dispatch(toggleMobileMenu())}
                  className="block px-4 py-3 rounded-xl text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10 transition-all"
                >
                  Deals
                </Link>

                {isAuthenticated && (
                  <>
                    <div className="border-t border-purple-500/20 my-4"></div>
                    <Link
                      to="/dashboard"
                      onClick={() => dispatch(toggleMobileMenu())}
                      className="block px-4 py-3 rounded-xl text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10 transition-all"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/orders"
                      onClick={() => dispatch(toggleMobileMenu())}
                      className="block px-4 py-3 rounded-xl text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10 transition-all"
                    >
                      My Orders
                    </Link>
                  </>
                )}
              </div>

              {/* Theme Switcher in Mobile Menu */}
              <div className="mt-6 pt-6 border-t border-purple-500/20">
                <div className="px-4 mb-3 text-sm text-purple-400 font-semibold uppercase tracking-wide">
                  Theme
                </div>
                <ThemeSwitcher variant="mobile" />
              </div>

              <div className="mt-8 pt-6 border-t border-purple-500/20">
                {isAuthenticated ? (
                  <Button variant="danger" fullWidth onClick={handleLogout}>
                    Logout
                  </Button>
                ) : (
                  <Link to="/login" onClick={() => dispatch(toggleMobileMenu())}>
                    <Button variant="neon" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;
