import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaGift, FaCrown, FaCoins, FaTrophy, FaFire } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoyaltyPoints = () => {
  const { user } = useSelector((state) => state.auth);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState(100);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const { data } = await axios.get('/api/v1/gamification/loyalty-points');
      setLoyaltyData(data.data);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async () => {
    try {
      const { data } = await axios.post('/api/v1/gamification/redeem-points', {
        points: redeemAmount,
      });
      toast.success(`Successfully redeemed ${redeemAmount} points for Rs. ${data.discount} discount!`);
      fetchLoyaltyData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem points');
    }
  };

  const tierColors = {
    Bronze: 'from-amber-600 to-amber-800',
    Silver: 'from-gray-400 to-gray-600',
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-purple-400 to-purple-600',
    Diamond: 'from-cyan-400 to-blue-600',
  };

  const tierIcons = {
    Bronze: FaStar,
    Silver: FaCoins,
    Gold: FaCrown,
    Platinum: FaTrophy,
    Diamond: FaFire,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const TierIcon = tierIcons[loyaltyData?.tier] || FaStar;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl p-6 shadow-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${tierColors[loyaltyData?.tier]} mb-4`}>
          <TierIcon className="text-4xl text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {loyaltyData?.tier} Member
        </h2>
        <p className="text-gray-400">Keep shopping to unlock more rewards!</p>
      </motion.div>

      {/* Points Display */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm">Available Points</p>
            <p className="text-4xl font-bold text-white">{loyaltyData?.points || 0}</p>
          </div>
          <FaCoins className="text-6xl text-yellow-300 opacity-50" />
        </div>
        <div className="mt-4">
          <p className="text-purple-200 text-sm">Lifetime Earnings</p>
          <p className="text-xl font-semibold text-white">{loyaltyData?.lifetimePoints || 0} points</p>
        </div>
      </motion.div>

      {/* Tier Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{loyaltyData?.tier}</span>
          <span>{loyaltyData?.nextTier}</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${loyaltyData?.tierProgress || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${tierColors[loyaltyData?.nextTier]}`}
          />
        </div>
        <p className="text-gray-400 text-sm mt-2 text-center">
          {loyaltyData?.pointsToNextTier} points to {loyaltyData?.nextTier}
        </p>
      </div>

      {/* Redeem Section */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FaGift className="text-pink-500" /> Redeem Points
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(Math.max(100, parseInt(e.target.value) || 0))}
            min="100"
            step="50"
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={redeemPoints}
            disabled={loyaltyData?.points < redeemAmount}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            Redeem
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          100 points = Rs. 10 discount (Min. 100 points required)
        </p>
      </div>

      {/* How to Earn */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-4">How to Earn Points</h3>
        <div className="space-y-3">
          {[
            { action: 'Every Rs. 100 spent', points: '10 points' },
            { action: 'Write a review', points: '50 points' },
            { action: 'Refer a friend', points: '200 points' },
            { action: 'Daily check-in', points: '5 points' },
            { action: 'Complete profile', points: '100 points' },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">{item.action}</span>
              <span className="text-purple-400 font-semibold">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPoints;
