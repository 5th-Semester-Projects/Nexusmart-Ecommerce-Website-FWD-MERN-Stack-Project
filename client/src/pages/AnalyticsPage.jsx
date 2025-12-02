import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaWallet, FaTag, FaHistory } from 'react-icons/fa';
import { UserDashboardAnalytics, PriceHistoryChart, PersonalizedDeals } from '../components/analytics';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'My Analytics', icon: FaChartLine },
    { id: 'deals', label: 'Personalized Deals', icon: FaTag },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 mb-4">
            <FaChartLine className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Analytics & Insights</h1>
          <p className="text-gray-400">Track your shopping patterns and get personalized recommendations</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
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
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <IconComponent />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && <UserDashboardAnalytics />}
          {activeTab === 'deals' && <PersonalizedDeals />}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
