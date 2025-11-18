import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiPackage, FiHeart, FiUser, FiBell, FiShoppingBag, FiMapPin, FiEdit2, FiCamera, FiAward } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProductCard from '../components/products/ProductCard';
import { PageLoader } from '../components/common/Loader';
import NFTLoyalty from '../components/web3/NFTLoyalty';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'orders', name: 'My Orders', icon: FiPackage },
  { id: 'wishlist', name: 'Wishlist', icon: FiHeart },
  { id: 'nft-rewards', name: 'NFT Rewards', icon: FiAward },
  { id: 'profile', name: 'Profile', icon: FiUser },
  { id: 'notifications', name: 'Notifications', icon: FiBell },
];

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch user orders, notifications
    // Mock data for now
    setOrders([
      { _id: '1', orderNumber: 'ORD-2024-001', status: 'delivered', total: 159.99, items: 3, date: '2024-11-01', deliveredDate: '2024-11-05' },
      { _id: '2', orderNumber: 'ORD-2024-002', status: 'processing', total: 89.99, items: 2, date: '2024-11-10' },
    ]);
    setNotifications([
      { _id: '1', title: 'Order Delivered', message: 'Your order ORD-2024-001 has been delivered', read: false, date: '2024-11-05' },
      { _id: '2', title: 'Price Drop Alert', message: 'Item in your wishlist is now 20% off!', read: false, date: '2024-11-12' },
    ]);
  }, []);

  const handleProfileUpdate = () => {
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  if (loading) return <PageLoader text="Loading dashboard..." />;

  return (
    <>
      <Helmet><title>My Dashboard - NexusMart</title></Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}!</p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6 space-y-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                    {tab.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="card p-6 mt-6 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Orders</span>
                    <span className="font-bold text-gray-900 dark:text-white">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Wishlist Items</span>
                    <span className="font-bold text-gray-900 dark:text-white">{wishlistItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {/* My Orders Tab */}
                {activeTab === 'orders' && (
                  <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h2>
                        <Button variant="outline" icon={FiShoppingBag}>Continue Shopping</Button>
                      </div>

                      {orders.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📦</div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">Start shopping to create your first order!</p>
                          <Button variant="primary">Browse Products</Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <motion.div
                              key={order._id}
                              whileHover={{ scale: 1.01 }}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{order.orderNumber}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Placed on {new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Items</span>
                                  <p className="font-semibold text-gray-900 dark:text-white">{order.items}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                                  <p className="font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                                  <p className="font-semibold text-gray-900 dark:text-white capitalize">{order.status}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Delivered</span>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <Button variant="primary" size="sm">View Details</Button>
                                {order.status === 'delivered' && (
                                  <>
                                    <Button variant="outline" size="sm">Write Review</Button>
                                    <Button variant="outline" size="sm">Reorder</Button>
                                  </>
                                )}
                                {order.status === 'processing' && <Button variant="outline" size="sm">Track Order</Button>}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="card p-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist ({wishlistItems.length})</h2>
                      {wishlistItems.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">❤️</div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Wishlist is Empty</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">Save items you love for later!</p>
                          <Button variant="primary">Start Shopping</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {wishlistItems.map((product) => (
                            <ProductCard key={product._id} product={product} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
                        <Button
                          variant={isEditing ? 'primary' : 'outline'}
                          icon={FiEdit2}
                          onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                        >
                          {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                              {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            {isEditing && (
                              <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                                <FiCamera className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{profileData.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>
                          </div>
                        </div>

                        {/* Profile Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Full Name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!isEditing}
                          />
                          <Input
                            label="Email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!isEditing}
                          />
                          <Input
                            label="Phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>

                        {/* Addresses */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Addresses</h3>
                            <Button variant="outline" size="sm" icon={FiMapPin}>Add New</Button>
                          </div>
                          <div className="space-y-3">
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">Home</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">123 Main St, New York, NY 10001</p>
                                </div>
                                <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded">Default</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* NFT Rewards Tab */}
                {activeTab === 'nft-rewards' && (
                  <motion.div key="nft-rewards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <NFTLoyalty />
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                        <Button variant="outline" size="sm">Mark All as Read</Button>
                      </div>

                      {notifications.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🔔</div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Notifications</h3>
                          <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map((notification) => (
                            <motion.div
                              key={notification._id}
                              whileHover={{ scale: 1.01 }}
                              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                                notification.read
                                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                  : 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h4>
                                    {!notification.read && (
                                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    {new Date(notification.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm">Dismiss</Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
