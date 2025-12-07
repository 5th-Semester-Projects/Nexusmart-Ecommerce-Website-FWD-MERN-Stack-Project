import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  GiftIcon,
  SparklesIcon,
  CakeIcon,
  FireIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  LockClosedIcon,
  TagIcon,
  TruckIcon,
  HeartIcon,
  ClockIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Tier Configuration
const TIERS = {
  bronze: {
    name: 'Bronze',
    color: 'from-amber-700 to-amber-500',
    textColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    minPoints: 0,
    maxPoints: 999,
    multiplier: 1,
    icon: '🥉',
    benefits: ['5% off on first order', 'Free shipping over $100', 'Birthday surprise'],
  },
  silver: {
    name: 'Silver',
    color: 'from-gray-400 to-gray-300',
    textColor: 'text-gray-300',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/30',
    minPoints: 1000,
    maxPoints: 4999,
    multiplier: 1.25,
    icon: '🥈',
    benefits: ['10% off all orders', 'Free shipping over $50', 'Early sale access', 'Birthday double points'],
  },
  gold: {
    name: 'Gold',
    color: 'from-yellow-500 to-yellow-400',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    minPoints: 5000,
    maxPoints: 14999,
    multiplier: 1.5,
    icon: '🥇',
    benefits: ['15% off all orders', 'Free express shipping', 'Priority support', 'Exclusive collections', 'Birthday triple points'],
  },
  platinum: {
    name: 'Platinum',
    color: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    minPoints: 15000,
    maxPoints: Infinity,
    multiplier: 2,
    icon: '💎',
    benefits: ['20% off all orders', 'Free same-day shipping', 'VIP concierge', 'First access to new products', 'Exclusive events', 'Birthday 5x points + gift'],
  },
};

// Membership Tier Card Component
export const MembershipTierCard = ({ tier, points = 0, className = '' }) => {
  const currentTier = Object.entries(TIERS).find(([key, t]) => 
    points >= t.minPoints && points <= t.maxPoints
  )?.[0] || 'bronze';
  
  const tierData = TIERS[tier || currentTier];
  const nextTier = Object.entries(TIERS).find(([key, t]) => t.minPoints > points);
  const progress = nextTier 
    ? ((points - tierData.minPoints) / (nextTier[1].minPoints - tierData.minPoints)) * 100
    : 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${tierData.color} rounded-2xl p-6 text-white shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm opacity-80">Your Status</p>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            {tierData.icon} {tierData.name}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">{tierData.multiplier}x Points</p>
          <p className="text-2xl font-bold">{points.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{tierData.name}</span>
            <span>{nextTier[1].name}</span>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-xs mt-1 opacity-80">
            {(nextTier[1].minPoints - points).toLocaleString()} points to {nextTier[1].name}
          </p>
        </div>
      )}

      {/* Quick Benefits */}
      <div className="space-y-2">
        {tierData.benefits.slice(0, 3).map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <CheckCircleIcon className="w-4 h-4" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Points Display Component
export const PointsDisplay = ({ points = 0, pendingPoints = 0 }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
          <StarSolidIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Available Points</p>
          <p className="text-3xl font-bold text-white">{points.toLocaleString()}</p>
          {pendingPoints > 0 && (
            <p className="text-sm text-yellow-400">
              +{pendingPoints.toLocaleString()} pending
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all">
          Redeem Points
        </button>
        <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors">
          History
        </button>
      </div>
    </div>
  );
};

// Rewards Catalog Component
export const RewardsCatalog = ({ userPoints = 2500, userTier = 'silver' }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const rewards = [
    { id: 1, name: '$5 Off Coupon', points: 500, type: 'discount', value: 5, minTier: 'bronze', stock: -1 },
    { id: 2, name: '$15 Off Coupon', points: 1200, type: 'discount', value: 15, minTier: 'bronze', stock: -1 },
    { id: 3, name: 'Free Shipping', points: 300, type: 'free_shipping', minTier: 'bronze', stock: -1 },
    { id: 4, name: 'Mystery Box', points: 2000, type: 'product', minTier: 'silver', stock: 50 },
    { id: 5, name: 'Exclusive Tote Bag', points: 3000, type: 'product', minTier: 'silver', stock: 25 },
    { id: 6, name: 'VIP Early Access', points: 5000, type: 'experience', minTier: 'gold', stock: -1 },
    { id: 7, name: '$50 Gift Card', points: 4500, type: 'gift_card', minTier: 'gold', stock: -1 },
    { id: 8, name: 'Personal Stylist Session', points: 10000, type: 'experience', minTier: 'platinum', stock: 10 },
  ];

  const categories = [
    { key: 'all', label: 'All Rewards' },
    { key: 'discount', label: 'Discounts' },
    { key: 'product', label: 'Products' },
    { key: 'experience', label: 'Experiences' },
    { key: 'gift_card', label: 'Gift Cards' },
  ];

  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  const userTierIndex = tierOrder.indexOf(userTier);

  const filteredRewards = rewards.filter(r => 
    selectedCategory === 'all' || r.type === selectedCategory
  );

  const redeemReward = (reward) => {
    if (userPoints < reward.points) {
      toast.error('Not enough points!');
      return;
    }
    if (tierOrder.indexOf(reward.minTier) > userTierIndex) {
      toast.error(`This reward requires ${TIERS[reward.minTier].name} tier or higher`);
      return;
    }
    toast.success(`Redeemed: ${reward.name}!`);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <GiftIcon className="w-6 h-6 text-pink-500" />
        Rewards Catalog
      </h3>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRewards.map((reward) => {
          const canRedeem = userPoints >= reward.points && tierOrder.indexOf(reward.minTier) <= userTierIndex;
          const tierLocked = tierOrder.indexOf(reward.minTier) > userTierIndex;

          return (
            <motion.div
              key={reward.id}
              whileHover={{ y: -5 }}
              className={`bg-gray-800/50 rounded-xl overflow-hidden border ${
                canRedeem ? 'border-gray-700 hover:border-pink-500/50' : 'border-gray-800 opacity-75'
              } transition-all`}
            >
              <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
                {reward.type === 'discount' && <TagIcon className="w-16 h-16 text-pink-500" />}
                {reward.type === 'product' && <GiftIcon className="w-16 h-16 text-purple-500" />}
                {reward.type === 'free_shipping' && <TruckIcon className="w-16 h-16 text-blue-500" />}
                {reward.type === 'experience' && <SparklesIcon className="w-16 h-16 text-yellow-500" />}
                {reward.type === 'gift_card' && <CurrencyDollarIcon className="w-16 h-16 text-green-500" />}
                
                {tierLocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <LockClosedIcon className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-400 text-xs mt-1">{TIERS[reward.minTier].name} Only</p>
                    </div>
                  </div>
                )}

                {reward.stock > 0 && reward.stock < 100 && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {reward.stock} left
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="text-white font-medium mb-1">{reward.name}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <StarSolidIcon className="w-4 h-4" />
                    <span className="font-bold">{reward.points.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => redeemReward(reward)}
                    disabled={!canRedeem}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      canRedeem
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Exclusive Member Deals Component
export const MemberDeals = ({ userTier = 'silver' }) => {
  const deals = [
    { id: 1, title: '20% Off Electronics', minTier: 'silver', expires: '2 days', code: 'SILVER20' },
    { id: 2, title: 'Free Gift with Purchase', minTier: 'gold', expires: '5 days', code: 'GOLDGIFT' },
    { id: 3, title: 'Early Access: Winter Sale', minTier: 'gold', expires: '1 week', code: 'EARLYWIN' },
    { id: 4, title: 'VIP 30% Off Everything', minTier: 'platinum', expires: '3 days', code: 'PLAT30' },
  ];

  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  const userTierIndex = tierOrder.indexOf(userTier);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <FireIcon className="w-6 h-6 text-orange-500" />
        Exclusive Member Deals
      </h3>

      <div className="space-y-4">
        {deals.map((deal) => {
          const isUnlocked = tierOrder.indexOf(deal.minTier) <= userTierIndex;

          return (
            <motion.div
              key={deal.id}
              whileHover={isUnlocked ? { x: 5 } : {}}
              className={`p-4 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-r from-gray-800/50 to-gray-800/30 border-gray-700 cursor-pointer hover:border-orange-500/50'
                  : 'bg-gray-800/30 border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isUnlocked ? TIERS[deal.minTier].bgColor : 'bg-gray-800'
                  }`}>
                    {isUnlocked ? (
                      <span className="text-lg">{TIERS[deal.minTier].icon}</span>
                    ) : (
                      <LockClosedIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{deal.title}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={TIERS[deal.minTier].textColor}>{TIERS[deal.minTier].name}+</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {deal.expires}
                      </span>
                    </div>
                  </div>
                </div>
                {isUnlocked ? (
                  <button
                    onClick={() => copyCode(deal.code)}
                    className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition-all"
                  >
                    {deal.code}
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm">Upgrade to unlock</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Birthday Rewards Component
export const BirthdayRewards = ({ birthday, tier = 'silver' }) => {
  const isBirthdayMonth = birthday && new Date().getMonth() === new Date(birthday).getMonth();
  
  const rewards = {
    bronze: { bonus: '2x Points', gift: 'Surprise discount' },
    silver: { bonus: '2x Points + 10% Off', gift: '$10 coupon' },
    gold: { bonus: '3x Points + 15% Off', gift: '$25 coupon + free shipping' },
    platinum: { bonus: '5x Points + 20% Off', gift: '$50 coupon + exclusive gift' },
  };

  const tierReward = rewards[tier];

  return (
    <div className={`rounded-2xl p-6 border ${
      isBirthdayMonth 
        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30' 
        : 'bg-gray-900/50 border-gray-800'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
          isBirthdayMonth ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-800'
        }`}>
          <CakeIcon className={`w-7 h-7 ${isBirthdayMonth ? 'text-white' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Birthday Rewards
            {isBirthdayMonth && <span className="text-2xl">🎉</span>}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {isBirthdayMonth 
              ? "It's your birthday month! Claim your rewards!"
              : 'Special rewards waiting for your birthday month'}
          </p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <BoltIcon className={`w-5 h-5 ${isBirthdayMonth ? 'text-yellow-400' : 'text-gray-500'}`} />
              <span className={isBirthdayMonth ? 'text-white' : 'text-gray-400'}>{tierReward.bonus}</span>
            </div>
            <div className="flex items-center gap-2">
              <GiftIcon className={`w-5 h-5 ${isBirthdayMonth ? 'text-pink-400' : 'text-gray-500'}`} />
              <span className={isBirthdayMonth ? 'text-white' : 'text-gray-400'}>{tierReward.gift}</span>
            </div>
          </div>

          {isBirthdayMonth && (
            <button className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all">
              Claim Birthday Rewards
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Full Loyalty Dashboard Component
export const LoyaltyDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const userPoints = user?.loyaltyPoints || 3500;
  const userTier = user?.tier || 'silver';
  const pendingPoints = user?.pendingPoints || 150;

  const pointsHistory = [
    { id: 1, description: 'Purchase - Order #12345', points: 250, type: 'earned', date: '2024-01-15' },
    { id: 2, description: 'Bonus - Double Points Day', points: 250, type: 'earned', date: '2024-01-15' },
    { id: 3, description: 'Redeemed - $10 Coupon', points: -1000, type: 'redeemed', date: '2024-01-10' },
    { id: 4, description: 'Purchase - Order #12344', points: 180, type: 'earned', date: '2024-01-08' },
    { id: 5, description: 'Referral Bonus', points: 500, type: 'earned', date: '2024-01-05' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TrophyIcon className="w-8 h-8 text-yellow-500" />
              Loyalty & Rewards
            </h1>
            <p className="text-gray-400 mt-1">Earn points, unlock rewards, enjoy exclusive benefits</p>
          </div>
        </div>

        {/* Tier Card and Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MembershipTierCard tier={userTier} points={userPoints} />
          <PointsDisplay points={userPoints} pendingPoints={pendingPoints} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          {['overview', 'rewards', 'history', 'benefits'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 capitalize font-medium transition-colors relative ${
                activeTab === tab ? 'text-yellow-400' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="loyaltyTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MemberDeals userTier={userTier} />
                <BirthdayRewards birthday={user?.birthday} tier={userTier} />
              </div>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RewardsCatalog userPoints={userPoints} userTier={userTier} />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
            >
              <h3 className="text-xl font-bold text-white mb-6">Points History</h3>
              <div className="space-y-3">
                {pointsHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'earned' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {item.type === 'earned' ? (
                          <ArrowUpIcon className="w-5 h-5 text-green-400" />
                        ) : (
                          <GiftIcon className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.description}</p>
                        <p className="text-gray-500 text-sm">{item.date}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      item.type === 'earned' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.type === 'earned' ? '+' : ''}{item.points}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {Object.entries(TIERS).map(([key, tier]) => {
                const isCurrentTier = key === userTier;
                const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
                const isUnlocked = tierOrder.indexOf(key) <= tierOrder.indexOf(userTier);

                return (
                  <div
                    key={key}
                    className={`rounded-2xl p-6 border transition-all ${
                      isCurrentTier
                        ? `bg-gradient-to-br ${tier.color} border-transparent`
                        : isUnlocked
                        ? `${tier.bgColor} ${tier.borderColor} border`
                        : 'bg-gray-800/30 border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{tier.icon}</span>
                      <h4 className={`font-bold ${isCurrentTier ? 'text-white' : tier.textColor}`}>
                        {tier.name}
                      </h4>
                      {isCurrentTier && (
                        <span className="ml-auto px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mb-4 ${isCurrentTier ? 'text-white/80' : 'text-gray-500'}`}>
                      {tier.minPoints.toLocaleString()}+ points
                    </p>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-2 text-sm ${
                            isCurrentTier ? 'text-white' : isUnlocked ? tier.textColor : 'text-gray-500'
                          }`}
                        >
                          {isUnlocked ? (
                            <CheckCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          ) : (
                            <LockClosedIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          )}
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default {
  MembershipTierCard,
  PointsDisplay,
  RewardsCatalog,
  MemberDeals,
  BirthdayRewards,
  LoyaltyDashboard,
  TIERS
};
