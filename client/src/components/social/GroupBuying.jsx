import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, FaShoppingCart, FaClock, FaPercentage,
  FaShare, FaUserPlus, FaCopy, FaCheck, FaGift,
  FaTrophy, FaChartLine, FaLock, FaUnlock
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const GroupBuying = ({ product, onJoinGroup, onCreateGroup }) => {
  const [activeGroups, setActiveGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupSize, setGroupSize] = useState(5);
  const [discount, setDiscount] = useState(20);
  const [duration, setDuration] = useState(24);
  const [copied, setCopied] = useState(false);
  const [myGroup, setMyGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  // Discount tiers based on group size
  const discountTiers = [
    { size: 3, discount: 10, label: 'Starter' },
    { size: 5, discount: 15, label: 'Popular' },
    { size: 10, discount: 25, label: 'Super Saver' },
    { size: 20, discount: 35, label: 'Mega Deal' },
    { size: 50, discount: 50, label: 'Ultimate' }
  ];

  // Fetch active groups for this product
  useEffect(() => {
    fetchActiveGroups();
  }, [product?._id]);

  const fetchActiveGroups = async () => {
    try {
      // Simulated active groups
      setActiveGroups([
        {
          id: 'grp1',
          creator: 'Ahmed K.',
          members: 3,
          targetSize: 5,
          discount: 15,
          expiresAt: new Date(Date.now() + 3600000 * 12),
          price: product?.price * 0.85
        },
        {
          id: 'grp2',
          creator: 'Sara M.',
          members: 8,
          targetSize: 10,
          discount: 25,
          expiresAt: new Date(Date.now() + 3600000 * 6),
          price: product?.price * 0.75
        }
      ]);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Create new group
  const createGroup = async () => {
    setLoading(true);
    try {
      const group = {
        id: `grp_${Date.now()}`,
        productId: product._id,
        creator: 'You',
        members: 1,
        targetSize: groupSize,
        discount: discountTiers.find(t => t.size === groupSize)?.discount || discount,
        expiresAt: new Date(Date.now() + duration * 3600000),
        price: product.price * (1 - discount / 100),
        shareLink: `${window.location.origin}/group-buy/${product._id}/${Date.now()}`
      };

      setMyGroup(group);
      setShowCreateModal(false);
      toast.success('Group created! Share the link to invite friends.');
      
      if (onCreateGroup) onCreateGroup(group);
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  // Join existing group
  const joinGroup = async (groupId) => {
    setLoading(true);
    try {
      // API call to join group
      toast.success('Successfully joined the group!');
      if (onJoinGroup) onJoinGroup(groupId);
    } catch (error) {
      toast.error('Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  // Copy share link
  const copyShareLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard!');
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  // Calculate progress percentage
  const getProgress = (current, target) => (current / target) * 100;

  return (
    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <FaUsers className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Group Buying</h3>
            <p className="text-sm text-gray-400">Save more when you buy together!</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium flex items-center gap-2"
        >
          <FaUserPlus />
          Create Group
        </motion.button>
      </div>

      {/* Discount Tiers */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Discount Tiers</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {discountTiers.map((tier, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border border-gray-700 min-w-[100px]"
            >
              <div className="text-center">
                <span className="text-2xl font-bold text-orange-400">{tier.discount}%</span>
                <p className="text-xs text-gray-400">{tier.size}+ people</p>
                <span className="text-xs text-orange-300">{tier.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* My Group */}
      {myGroup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-4 border border-orange-500/50"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              Your Group
            </h4>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              Active
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{myGroup.members}/{myGroup.targetSize}</p>
              <p className="text-xs text-gray-400">Members</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{myGroup.discount}%</p>
              <p className="text-xs text-gray-400">Discount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{getTimeRemaining(myGroup.expiresAt)}</p>
              <p className="text-xs text-gray-400">Time Left</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(getProgress(myGroup.members, myGroup.targetSize))}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgress(myGroup.members, myGroup.targetSize)}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
          </div>

          {/* Share link */}
          <div className="flex gap-2">
            <input
              type="text"
              value={myGroup.shareLink}
              readOnly
              className="flex-1 px-4 py-2 bg-black/30 border border-gray-700 rounded-lg text-gray-300 text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyShareLink(myGroup.shareLink)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg"
            >
              {copied ? <FaCheck /> : <FaCopy />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              <FaShare />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Active Groups */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Join Existing Groups</h4>
        <div className="space-y-3">
          {activeGroups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <FaUsers className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {group.members}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Created by {group.creator}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <FaUsers className="w-3 h-3" />
                        {group.members}/{group.targetSize}
                      </span>
                      <span className="text-green-400 flex items-center gap-1">
                        <FaPercentage className="w-3 h-3" />
                        {group.discount}% off
                      </span>
                      <span className="text-orange-400 flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {getTimeRemaining(group.expiresAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 line-through">${product?.price}</p>
                  <p className="text-xl font-bold text-green-400">${group.price?.toFixed(2)}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => joinGroup(group.id)}
                    disabled={loading}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg text-sm font-medium"
                  >
                    Join Group
                  </motion.button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress(group.members, group.targetSize)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {group.targetSize - group.members} more people needed to unlock {group.discount}% discount
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-orange-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaUserPlus className="text-orange-400" />
                Create Group Buy
              </h3>

              <div className="space-y-6">
                {/* Product info */}
                <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl">
                  {Array.isArray(product?.images) && product.images[0] && (
                    <img 
                      src={product.images[0]?.url || product.images[0]} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  {!Array.isArray(product?.images) && product?.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="text-white font-medium">{product?.name}</p>
                    <p className="text-orange-400 font-bold">${product?.price}</p>
                  </div>
                </div>

                {/* Group size selection */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Select Group Size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {discountTiers.map((tier) => (
                      <motion.button
                        key={tier.size}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setGroupSize(tier.size);
                          setDiscount(tier.discount);
                        }}
                        className={`p-3 rounded-xl text-center transition-all ${
                          groupSize === tier.size
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <p className="text-lg font-bold">{tier.size}</p>
                        <p className="text-xs">{tier.discount}%</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Duration (hours)</label>
                  <div className="flex gap-2">
                    {[12, 24, 48, 72].map((h) => (
                      <motion.button
                        key={h}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDuration(h)}
                        className={`flex-1 py-2 rounded-lg font-medium ${
                          duration === h
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {h}h
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Price preview */}
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Original Price:</span>
                    <span className="text-gray-400 line-through">${product?.price}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-white font-medium">Group Price:</span>
                    <span className="text-2xl font-bold text-green-400">
                      ${(product?.price * (1 - discount / 100)).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-green-400 mt-2">
                    You save ${(product?.price * discount / 100).toFixed(2)} ({discount}% off)
                  </p>
                </div>

                {/* Create button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createGroup}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaGift />
                      Create Group & Share
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupBuying;
