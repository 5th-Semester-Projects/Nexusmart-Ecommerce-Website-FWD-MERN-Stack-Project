import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaCoins, FaTrophy, FaGift, FaUserFriends } from 'react-icons/fa';
import { LoyaltyPoints, AchievementBadges, SpinTheWheel, ReferralProgram } from '../components/gamification';

const GamificationPage = () => {
  const [activeTab, setActiveTab] = useState('loyalty');

  const tabs = [
    { id: 'loyalty', label: 'Loyalty Points', icon: FaCoins },
    { id: 'achievements', label: 'Achievements', icon: FaTrophy },
    { id: 'spin', label: 'Spin & Win', icon: FaGift },
    { id: 'referral', label: 'Refer & Earn', icon: FaUserFriends },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'loyalty':
        return <LoyaltyPoints />;
      case 'achievements':
        return <AchievementBadges />;
      case 'spin':
        return <SpinTheWheel />;
      case 'referral':
        return <ReferralProgram />;
      default:
        return <LoyaltyPoints />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            <FaGamepad className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Rewards Center</h1>
          <p className="text-gray-400">Earn points, unlock achievements, and win amazing rewards!</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <IconComponent />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationPage;
