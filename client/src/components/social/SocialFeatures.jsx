import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  VideoCameraIcon,
  UserGroupIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  ShoppingCartIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  GiftIcon,
  UsersIcon,
  LinkIcon,
  SparklesIcon,
  StarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Live Shopping Stream Component
export const LiveShoppingStream = ({ stream, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [viewers, setViewers] = useState(stream?.viewers?.current || 1247);
  const [liked, setLiked] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);

  const products = stream?.products || [
    { id: 1, name: 'Summer Dress', price: 79.99, specialPrice: 59.99, image: '/api/placeholder/100/100' },
    { id: 2, name: 'Designer Handbag', price: 199.99, specialPrice: 149.99, image: '/api/placeholder/100/100' },
    { id: 3, name: 'Gold Necklace', price: 299.99, specialPrice: 249.99, image: '/api/placeholder/100/100' },
  ];

  useEffect(() => {
    // Simulate live chat messages
    const interval = setInterval(() => {
      const randomMessages = [
        'Love this! 😍',
        'Where can I get this?',
        'Just added to cart!',
        'Beautiful collection!',
        'Is this available in blue?',
        'Amazing deal! 🔥',
      ];
      setMessages(prev => [...prev.slice(-50), {
        id: Date.now(),
        user: `User${Math.floor(Math.random() * 1000)}`,
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        timestamp: new Date()
      }]);
    }, 3000);

    // Simulate viewer count changes
    const viewerInterval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 10) - 3);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(viewerInterval);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: 'You',
      message: message.trim(),
      timestamp: new Date(),
      isOwn: true
    }]);
    setMessage('');
  };

  const featureProduct = (product) => {
    setFeaturedProduct(product);
    setTimeout(() => setFeaturedProduct(null), 5000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      <div className="h-full flex">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Video Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <VideoCameraIcon className="w-20 h-20 text-white/30 mx-auto mb-4" />
                <p className="text-white/50">Live Stream</p>
              </div>
            </div>
          </div>

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-4">
              {/* Host Info */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{stream?.host?.name || 'Fashion Guru'}</p>
                  <p className="text-xs text-gray-300">@fashionguru</p>
                </div>
              </div>
              {/* Live Badge */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                  LIVE
                </span>
                <span className="text-white text-sm flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {viewers.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Featured Product Popup */}
          <AnimatePresence>
            {featuredProduct && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-32 left-4 bg-white rounded-xl shadow-2xl p-4 max-w-xs"
              >
                <div className="flex gap-3">
                  <img
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{featuredProduct.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-pink-500">${featuredProduct.specialPrice}</span>
                      <span className="text-sm text-gray-400 line-through">${featuredProduct.price}</span>
                    </div>
                    <button className="mt-2 px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm rounded-full">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Strip */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-sm mb-2">Featured Products</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {products.map((product) => (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => featureProduct(product)}
                  className="flex-shrink-0 bg-white/10 backdrop-blur rounded-lg p-2 flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{product.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-pink-400 font-bold">${product.specialPrice}</span>
                      <span className="text-gray-400 text-xs line-through">${product.price}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Side Controls */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
              onClick={() => setLiked(!liked)}
              className="p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              {liked ? (
                <HeartSolidIcon className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-white" />
              )}
            </button>
            <button className="p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
              <ShareIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-full transition-colors ${showChat ? 'bg-pink-500' : 'bg-black/50 hover:bg-black/70'}`}
            >
              <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-6 h-6 text-white" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-900 border-l border-gray-800 flex flex-col"
            >
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">Live Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.isOwn ? 'justify-end' : ''}`}>
                    <div className={`max-w-[80%] ${msg.isOwn ? 'order-2' : ''}`}>
                      <p className={`text-xs ${msg.isOwn ? 'text-pink-400' : 'text-gray-500'}`}>{msg.user}</p>
                      <p className={`text-sm rounded-lg px-3 py-1 ${
                        msg.isOwn ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Say something..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm focus:border-pink-500 outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Influencer Storefront Component
export const InfluencerStorefront = ({ influencer }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [isFollowing, setIsFollowing] = useState(false);

  const stats = influencer?.stats || {
    followers: '125K',
    products: 48,
    rating: 4.9,
  };

  const products = influencer?.products || [
    { id: 1, name: 'Signature Lipstick', price: 34.99, image: '/api/placeholder/200/200', rating: 4.8 },
    { id: 2, name: 'Glow Serum', price: 59.99, image: '/api/placeholder/200/200', rating: 4.9 },
    { id: 3, name: 'Makeup Set', price: 129.99, image: '/api/placeholder/200/200', rating: 4.7 },
    { id: 4, name: 'Face Palette', price: 49.99, image: '/api/placeholder/200/200', rating: 4.8 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent">
          <div className="max-w-4xl mx-auto flex items-end gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {influencer?.name || 'Sarah Beauty'}
                </h1>
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Verified</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                {influencer?.bio || 'Beauty & Fashion Influencer | Sharing my favorite products with you 💄✨'}
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-white font-bold">{stats.followers}</p>
                  <p className="text-gray-400 text-xs">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">{stats.products}</p>
                  <p className="text-gray-400 text-xs">Products</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-bold">{stats.rating}</span>
                  </div>
                  <p className="text-gray-400 text-xs">Rating</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                isFollowing
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-pink-500/30'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex gap-6 border-b border-gray-800">
          {['products', 'collections', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 capitalize font-medium transition-colors relative ${
                activeTab === tab ? 'text-pink-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 rounded-xl overflow-hidden group"
            >
              <div className="aspect-square bg-gray-700 relative">
                <div className="absolute top-2 right-2 px-2 py-1 bg-pink-500 text-white text-xs rounded-full">
                  Curated
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-pink-400 font-bold">${product.price}</span>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    {product.rating}
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-pink-500/20 text-pink-400 rounded-lg text-sm font-medium hover:bg-pink-500 hover:text-white transition-all">
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Wishlist Sharing Component
export const WishlistSharing = ({ wishlist, isOpen, onClose }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const friends = [
    { id: 1, name: 'Emma Watson', avatar: null },
    { id: 2, name: 'John Doe', avatar: null },
    { id: 3, name: 'Sarah Smith', avatar: null },
    { id: 4, name: 'Mike Johnson', avatar: null },
  ];

  const generateLink = () => {
    const link = `https://nexusmart.com/wishlist/share/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const shareWithFriends = () => {
    toast.success(`Wishlist shared with ${selectedFriends.length} friends!`);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      generateLink();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-800"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Share Wishlist</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Share Link */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
              >
                {copied ? 'Copied!' : <LinkIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Share with Friends */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">Share with Friends</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {friends.map((friend) => (
                <label
                  key={friend.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFriends.includes(friend.id)
                      ? 'bg-pink-500/20 border border-pink-500'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFriends([...selectedFriends, friend.id]);
                      } else {
                        setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                    {friend.name[0]}
                  </div>
                  <span className="text-white flex-1">{friend.name}</span>
                  {selectedFriends.includes(friend.id) && (
                    <span className="text-pink-500">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Social Sharing */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">Share on Social</label>
            <div className="flex gap-3">
              {['Facebook', 'Twitter', 'WhatsApp', 'Email'].map((platform) => (
                <button
                  key={platform}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={shareWithFriends}
            disabled={selectedFriends.length === 0}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-pink-500/30 transition-all"
          >
            Share with {selectedFriends.length > 0 ? `${selectedFriends.length} Friend${selectedFriends.length > 1 ? 's' : ''}` : 'Selected Friends'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Group Buying Component
export const GroupBuying = ({ product, isOpen, onClose }) => {
  const [groupSize, setGroupSize] = useState(2);
  const [participants, setParticipants] = useState([
    { id: 1, name: 'You', status: 'joined', isHost: true }
  ]);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour

  const discounts = [
    { minSize: 2, discount: 10 },
    { minSize: 5, discount: 20 },
    { minSize: 10, discount: 30 },
  ];

  const getCurrentDiscount = () => {
    const applicable = discounts.filter(d => participants.length >= d.minSize);
    return applicable.length > 0 ? applicable[applicable.length - 1].discount : 0;
  };

  const getNextDiscount = () => {
    const next = discounts.find(d => participants.length < d.minSize);
    return next || null;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const inviteFriend = () => {
    toast.success('Invitation link copied! Share with friends.');
  };

  if (!isOpen) return null;

  const currentDiscount = getCurrentDiscount();
  const nextDiscount = getNextDiscount();
  const discountedPrice = product?.price * (1 - currentDiscount / 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-orange-500/20"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Group Buy</h3>
                <p className="text-xs text-gray-400">Shop together, save together!</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Timer */}
          <div className="text-center mb-6 p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">Deal ends in</p>
            <p className="text-3xl font-bold text-orange-400 font-mono">{formatTime(timeLeft)}</p>
          </div>

          {/* Product Preview */}
          <div className="flex gap-4 mb-6 p-4 bg-gray-800/50 rounded-xl">
            <div className="w-20 h-20 bg-gray-700 rounded-lg" />
            <div>
              <h4 className="text-white font-medium">{product?.name || 'Premium Product'}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-orange-400">${discountedPrice?.toFixed(2) || '79.99'}</span>
                <span className="text-gray-500 line-through">${product?.price || '99.99'}</span>
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  -{currentDiscount}%
                </span>
              </div>
            </div>
          </div>

          {/* Discount Tiers */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Group Discounts</p>
            <div className="flex gap-2">
              {discounts.map((tier) => (
                <div
                  key={tier.minSize}
                  className={`flex-1 p-3 rounded-lg text-center border ${
                    participants.length >= tier.minSize
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <p className={`font-bold ${participants.length >= tier.minSize ? 'text-orange-400' : 'text-gray-500'}`}>
                    {tier.discount}% OFF
                  </p>
                  <p className="text-xs text-gray-500">{tier.minSize}+ people</p>
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">Participants ({participants.length})</p>
              {nextDiscount && (
                <p className="text-xs text-orange-400">
                  {nextDiscount.minSize - participants.length} more for {nextDiscount.discount}% off!
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-full"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-xs">
                    {p.name[0]}
                  </div>
                  <span className="text-white text-sm">{p.name}</span>
                  {p.isHost && (
                    <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded">Host</span>
                  )}
                </div>
              ))}
              <button
                onClick={inviteFriend}
                className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-600 rounded-full text-gray-400 hover:border-orange-500 hover:text-orange-400 transition-colors"
              >
                <span className="text-lg">+</span>
                Invite
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={inviteFriend}
              className="flex-1 py-3 border border-orange-500 text-orange-400 rounded-lg font-medium hover:bg-orange-500/10 transition-colors flex items-center justify-center gap-2"
            >
              <ShareIcon className="w-5 h-5" />
              Invite Friends
            </button>
            <button className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2">
              <ShoppingCartIcon className="w-5 h-5" />
              Join & Buy
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default {
  LiveShoppingStream,
  InfluencerStorefront,
  WishlistSharing,
  GroupBuying
};
