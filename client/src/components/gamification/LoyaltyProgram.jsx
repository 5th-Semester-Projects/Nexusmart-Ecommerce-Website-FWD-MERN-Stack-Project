import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCrown, FaStar, FaGem, FaGift, FaPercent,
  FaTruck, FaHeadset, FaRocket, FaCheck, FaLock,
  FaFire, FaMedal, FaAward, FaTrophy, FaCoins,
  FaHistory, FaChartLine, FaBolt
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';

const LoyaltyProgram = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('status');
  const [loyaltyData, setLoyaltyData] = useState({
    tier: 'silver',
    points: 2450,
    pointsToNext: 550,
    totalEarned: 5200,
    totalRedeemed: 2750,
    streakDays: 12,
    multiplier: 1.5,
    expiringPoints: 200,
    expiryDate: '2024-03-15'
  });

  const tiers = [
    {
      name: 'Bronze',
      icon: FaMedal,
      color: 'from-orange-600 to-orange-400',
      minPoints: 0,
      benefits: ['5% points on purchases', 'Birthday reward', 'Member-only deals'],
      multiplier: 1.0
    },
    {
      name: 'Silver',
      icon: FaStar,
      color: 'from-gray-400 to-gray-300',
      minPoints: 1000,
      benefits: ['10% points on purchases', 'Free shipping over $50', 'Early access to sales', 'Extended returns'],
      multiplier: 1.5
    },
    {
      name: 'Gold',
      icon: FaCrown,
      color: 'from-yellow-500 to-yellow-400',
      minPoints: 3000,
      benefits: ['15% points on purchases', 'Free shipping always', 'Priority support', 'Exclusive products', 'VIP events'],
      multiplier: 2.0
    },
    {
      name: 'Platinum',
      icon: FaGem,
      color: 'from-purple-600 to-purple-400',
      minPoints: 10000,
      benefits: ['20% points on purchases', 'Free express shipping', 'Personal stylist', 'First dibs on new arrivals', 'Luxury gifts', 'Concierge service'],
      multiplier: 3.0
    }
  ];

  const rewards = [
    { id: 1, name: '$5 Off', points: 500, type: 'discount', value: 5 },
    { id: 2, name: '$10 Off', points: 900, type: 'discount', value: 10 },
    { id: 3, name: '$25 Off', points: 2000, type: 'discount', value: 25 },
    { id: 4, name: 'Free Shipping', points: 300, type: 'shipping' },
    { id: 5, name: '2x Points Day', points: 750, type: 'multiplier' },
    { id: 6, name: 'Mystery Gift', points: 1500, type: 'gift' },
    { id: 7, name: 'Exclusive Access', points: 2500, type: 'access' },
    { id: 8, name: '$50 Off', points: 4000, type: 'discount', value: 50 }
  ];

  const activities = [
    { id: 1, action: 'Purchase', points: 450, date: '2024-01-15', order: '#12345' },
    { id: 2, action: 'Review', points: 50, date: '2024-01-14', product: 'Wireless Earbuds' },
    { id: 3, action: 'Referral', points: 500, date: '2024-01-10', friend: 'John D.' },
    { id: 4, action: 'Birthday Bonus', points: 200, date: '2024-01-01' },
    { id: 5, action: 'Redeemed', points: -500, date: '2023-12-28', reward: '$5 Off' },
    { id: 6, action: 'Daily Login', points: 10, date: '2024-01-15' }
  ];

  const challenges = [
    { id: 1, name: 'First Purchase of Month', points: 100, progress: 1, goal: 1, completed: true },
    { id: 2, name: 'Write 3 Reviews', points: 150, progress: 1, goal: 3, completed: false },
    { id: 3, name: 'Spend $100', points: 200, progress: 75, goal: 100, completed: false },
    { id: 4, name: 'Refer a Friend', points: 500, progress: 0, goal: 1, completed: false },
    { id: 5, name: '7-Day Login Streak', points: 100, progress: 5, goal: 7, completed: false }
  ];

  const getCurrentTier = () => {
    return tiers.find(t => t.name.toLowerCase() === loyaltyData.tier) || tiers[0];
  };

  const getNextTier = () => {
    const currentIndex = tiers.findIndex(t => t.name.toLowerCase() === loyaltyData.tier);
    return tiers[currentIndex + 1] || null;
  };

  const redeemReward = (reward) => {
    if (loyaltyData.points >= reward.points) {
      setLoyaltyData(prev => ({
        ...prev,
        points: prev.points - reward.points,
        totalRedeemed: prev.totalRedeemed + reward.points
      }));
      toast.success(`Redeemed: ${reward.name}`);
    } else {
      toast.error('Not enough points');
    }
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentTier.color} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-xl">
              <currentTier.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm opacity-80">Current Status</p>
              <h2 className="text-3xl font-bold">{currentTier.name} Member</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Available Points</p>
            <p className="text-4xl font-bold">{loyaltyData.points.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{loyaltyData.points.toLocaleString()} points</span>
              <span>{nextTier.minPoints.toLocaleString()} for {nextTier.name}</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(loyaltyData.points / nextTier.minPoints) * 100}%` }}
                className="bg-white rounded-full h-3"
              />
            </div>
            <p className="text-sm mt-2 opacity-80">
              {loyaltyData.pointsToNext.toLocaleString()} points to {nextTier.name}
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <FaFire className="w-4 h-4" />
              <span className="text-sm">{loyaltyData.streakDays} Day Streak</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <FaBolt className="w-4 h-4" />
              <span className="text-sm">{loyaltyData.multiplier}x Multiplier</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <FaCoins className="w-4 h-4" />
              <span className="text-sm">{loyaltyData.totalEarned.toLocaleString()} Lifetime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Points Alert */}
      {loyaltyData.expiringPoints > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FaHistory className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400">
              {loyaltyData.expiringPoints} points expiring on {loyaltyData.expiryDate}
            </span>
          </div>
          <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm font-semibold">
            Use Now
          </button>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['status', 'rewards', 'challenges', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'status' && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Tier Benefits */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTier.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <FaCheck className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All Tiers */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Membership Tiers</h3>
              <div className="space-y-4">
                {tiers.map((tier, index) => {
                  const isCurrentOrPast = index <= tiers.findIndex(t => t.name.toLowerCase() === loyaltyData.tier);
                  return (
                    <div
                      key={tier.name}
                      className={`p-4 rounded-xl border ${
                        tier.name.toLowerCase() === loyaltyData.tier
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.color}`}>
                            <tier.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{tier.name}</h4>
                            <p className="text-sm text-gray-400">{tier.minPoints.toLocaleString()}+ points</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{tier.multiplier}x points</span>
                          {isCurrentOrPast ? (
                            <FaCheck className="w-4 h-4 text-green-400" />
                          ) : (
                            <FaLock className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rewards' && (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {rewards.map(reward => {
              const canRedeem = loyaltyData.points >= reward.points;
              return (
                <motion.div
                  key={reward.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border ${
                    canRedeem
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        reward.type === 'discount' ? 'bg-green-500/20' :
                        reward.type === 'shipping' ? 'bg-blue-500/20' :
                        reward.type === 'gift' ? 'bg-pink-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        {reward.type === 'discount' && <FaPercent className="w-4 h-4 text-green-400" />}
                        {reward.type === 'shipping' && <FaTruck className="w-4 h-4 text-blue-400" />}
                        {reward.type === 'gift' && <FaGift className="w-4 h-4 text-pink-400" />}
                        {reward.type === 'multiplier' && <FaBolt className="w-4 h-4 text-yellow-400" />}
                        {reward.type === 'access' && <FaStar className="w-4 h-4 text-purple-400" />}
                      </div>
                      <span className="text-white font-semibold">{reward.name}</span>
                    </div>
                    <span className="text-gray-400">{reward.points.toLocaleString()} pts</span>
                  </div>
                  <button
                    onClick={() => redeemReward(reward)}
                    disabled={!canRedeem}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      canRedeem
                        ? 'bg-purple-600 text-white hover:bg-purple-500'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canRedeem ? 'Redeem' : `Need ${(reward.points - loyaltyData.points).toLocaleString()} more`}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {challenges.map(challenge => (
              <div
                key={challenge.id}
                className={`p-4 rounded-xl border ${
                  challenge.completed
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {challenge.completed ? (
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <FaCheck className="w-4 h-4 text-green-400" />
                      </div>
                    ) : (
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <FaTrophy className="w-4 h-4 text-purple-400" />
                      </div>
                    )}
                    <span className="text-white">{challenge.name}</span>
                  </div>
                  <span className={challenge.completed ? 'text-green-400' : 'text-purple-400'}>
                    +{challenge.points} pts
                  </span>
                </div>
                {!challenge.completed && (
                  <>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                        className="bg-purple-500 rounded-full h-2"
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      {challenge.progress} / {challenge.goal}
                    </p>
                  </>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Points History</h3>
            <div className="space-y-3">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.points > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      <FaCoins className={`w-4 h-4 ${
                        activity.points > 0 ? 'text-green-400' : 'text-red-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    activity.points > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {activity.points > 0 ? '+' : ''}{activity.points}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoyaltyProgram;
