import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiVideo, FiX, FiMessageSquare, FiHeart, FiShare2,
  FiShoppingCart, FiUsers, FiGift, FiDollarSign,
  FiMic, FiMicOff, FiCamera, FiCameraOff
} from 'react-icons/fi';
import { FaPlay, FaPause, FaExpand, FaCompress } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const LiveShopping = ({ streamId, onClose }) => {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showProducts, setShowProducts] = useState(true);
  const [flashSale, setFlashSale] = useState(null);
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    fetchStreamData();
    setupSocket();
    simulateActivity();
  }, [streamId]);

  const fetchStreamData = async () => {
    try {
      const response = await axios.get(`/api/live-shopping/stream/${streamId}`);
      setStream(response.data);
      setProducts(response.data.products);
      setFeaturedProduct(response.data.featuredProduct);
    } catch (error) {
      // Demo data
      setStream({
        id: streamId || 'demo-stream',
        title: '🔥 Flash Sale Friday - Up to 70% Off!',
        host: {
          name: 'Sarah Johnson',
          avatar: '/avatars/host1.jpg',
          followers: 125000
        },
        thumbnail: '/streams/live-shopping.jpg'
      });
      
      setProducts([
        { _id: '1', name: 'Wireless Earbuds Pro', price: 79.99, originalPrice: 149.99, image: '/products/earbuds.jpg', stock: 50 },
        { _id: '2', name: 'Smart Watch Series X', price: 199.99, originalPrice: 349.99, image: '/products/watch.jpg', stock: 30 },
        { _id: '3', name: 'Portable Speaker', price: 49.99, originalPrice: 99.99, image: '/products/speaker.jpg', stock: 100 }
      ]);
      
      setFeaturedProduct({
        _id: '1',
        name: 'Wireless Earbuds Pro',
        price: 79.99,
        originalPrice: 149.99,
        discount: 47,
        image: '/products/earbuds.jpg'
      });
    } finally {
      setLoading(false);
      setIsLive(true);
    }
  };

  const setupSocket = () => {
    // In production, use Socket.IO
    // Demo messages
    const demoMessages = [
      { id: 1, user: 'Alex', text: 'These earbuds look amazing! 🎧', timestamp: new Date() },
      { id: 2, user: 'Maria', text: 'Just bought 2! Great deal!', timestamp: new Date() },
      { id: 3, user: 'John', text: 'Is shipping free?', timestamp: new Date() },
      { id: 4, user: 'Host', text: 'Yes! Free shipping on all orders today! 🚚', isHost: true, timestamp: new Date() }
    ];
    setMessages(demoMessages);
  };

  const simulateActivity = () => {
    // Simulate viewer count changes
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => Math.max(100, prev + Math.floor(Math.random() * 20 - 5)));
    }, 3000);

    // Simulate new messages
    const messageInterval = setInterval(() => {
      const newMessages = [
        'This is so cool!',
        'Added to cart! 🛒',
        'What colors are available?',
        'Best price ever! 🔥',
        'Love this! ❤️'
      ];
      const randomMessage = newMessages[Math.floor(Math.random() * newMessages.length)];
      const randomUser = ['User' + Math.floor(Math.random() * 1000), 'Shopper', 'Fan', 'Buyer'][Math.floor(Math.random() * 4)];
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: randomUser,
        text: randomMessage,
        timestamp: new Date()
      }].slice(-50));
    }, 5000);

    setViewerCount(1234);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(messageInterval);
    };
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: 'You',
      text: newMessage,
      isMe: true,
      timestamp: new Date()
    }]);
    setNewMessage('');
  };

  const addReaction = (emoji) => {
    const reaction = {
      id: Date.now(),
      emoji,
      x: Math.random() * 80 + 10,
      y: 100
    };
    setReactions(prev => [...prev, reaction]);
    
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 2000);
  };

  const addToCart = (product) => {
    toast.success(`${product.name} added to cart!`);
  };

  const startFlashSale = () => {
    setFlashSale({
      product: products[0],
      discount: 60,
      timeLeft: 300,
      claimed: 0,
      total: 50
    });

    const interval = setInterval(() => {
      setFlashSale(prev => {
        if (!prev || prev.timeLeft <= 0) {
          clearInterval(interval);
          return null;
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
          claimed: Math.min(prev.total, prev.claimed + Math.floor(Math.random() * 2))
        };
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          <p className="mt-4">Connecting to live stream...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex"
    >
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Video Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <FiVideo className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-xl">Live Stream Preview</p>
              <p className="text-white/60">Video player would be here</p>
            </div>
          </div>
        </div>

        {/* Floating Reactions */}
        <AnimatePresence>
          {reactions.map(reaction => (
            <motion.div
              key={reaction.id}
              initial={{ y: '100%', x: `${reaction.x}%`, opacity: 1, scale: 1 }}
              animate={{ y: '-100%', opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute text-3xl pointer-events-none"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-3">
            {isLive && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            <div className="flex items-center gap-2 text-white">
              <FiUsers />
              <span>{viewerCount.toLocaleString()} watching</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-white"
            >
              {isMuted ? <FiMicOff /> : <FiMic />}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-white"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-white"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Host Info */}
        <div className="absolute top-16 left-4">
          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-full p-2 pr-4">
            <img
              src={stream?.host?.avatar || '/avatars/default.jpg'}
              alt={stream?.host?.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => e.target.src = '/api/placeholder/40/40'}
            />
            <div>
              <p className="text-white font-medium text-sm">{stream?.host?.name}</p>
              <p className="text-white/60 text-xs">{(stream?.host?.followers / 1000).toFixed(1)}K followers</p>
            </div>
          </div>
        </div>

        {/* Flash Sale Banner */}
        <AnimatePresence>
          {flashSale && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs opacity-80">FLASH SALE</p>
                  <p className="text-2xl font-bold">{Math.floor(flashSale.timeLeft / 60)}:{(flashSale.timeLeft % 60).toString().padStart(2, '0')}</p>
                </div>
                <div className="border-l border-white/30 pl-4">
                  <p className="font-medium">{flashSale.product.name}</p>
                  <p className="text-sm">{flashSale.discount}% OFF - Only {flashSale.total - flashSale.claimed} left!</p>
                </div>
                <button className="px-4 py-2 bg-white text-red-500 rounded-lg font-medium">
                  Grab Now!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured Product */}
        {featuredProduct && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute bottom-24 left-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg max-w-xs"
          >
            <div className="flex gap-3">
              <img
                src={featuredProduct.image || '/api/placeholder/80/80'}
                alt={featuredProduct.name}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => e.target.src = '/api/placeholder/80/80'}
              />
              <div className="flex-1">
                <p className="font-medium dark:text-white text-sm">{featuredProduct.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-purple-500">${featuredProduct.price}</span>
                  <span className="text-sm text-gray-400 line-through">${featuredProduct.originalPrice}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-500 text-xs rounded-full">
                    -{featuredProduct.discount}%
                  </span>
                </div>
                <button
                  onClick={() => addToCart(featuredProduct)}
                  className="mt-2 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reaction Buttons */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-2">
          {['❤️', '🔥', '😍', '👏', '🎉'].map(emoji => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-xl transition-transform hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white flex items-center gap-2"
            >
              <FiShoppingCart />
              Products ({products.length})
            </button>
            <button
              onClick={() => addReaction('❤️')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white flex items-center gap-2"
            >
              <FiHeart />
              Like
            </button>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white flex items-center gap-2">
              <FiShare2 />
              Share
            </button>
            {!flashSale && (
              <button
                onClick={startFlashSale}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white flex items-center gap-2"
              >
                <FiGift />
                Flash Sale
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Chat & Products */}
      <div className="w-96 bg-gray-900 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setShowProducts(false)}
            className={`flex-1 py-3 text-center ${!showProducts ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setShowProducts(true)}
            className={`flex-1 py-3 text-center ${showProducts ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'}`}
          >
            Products
          </button>
        </div>

        {showProducts ? (
          /* Products List */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-3"
              >
                <div className="flex gap-3">
                  <img
                    src={product.image || '/api/placeholder/60/60'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => e.target.src = '/api/placeholder/60/60'}
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-purple-400 font-bold">${product.price}</span>
                      <span className="text-gray-500 text-sm line-through">${product.originalPrice}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{product.stock} in stock</p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg self-center"
                  >
                    <FiShoppingCart />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${msg.isHost ? 'bg-purple-900/50' : 'bg-gray-800'} rounded-lg p-3`}
              >
                <div className="flex items-start gap-2">
                  <span className={`font-medium text-sm ${msg.isHost ? 'text-purple-400' : msg.isMe ? 'text-green-400' : 'text-white'}`}>
                    {msg.user}
                    {msg.isHost && ' 🎤'}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-1">{msg.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Message Input */}
        {!showProducts && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Say something..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveShopping;
