import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, FaStar, FaShoppingBag, FaHeart, FaComment, 
  FaShare, FaUserFriends, FaCrown, FaFire, FaBolt, 
  FaMedal, FaGem, FaRocket, FaLock
} from 'react-icons/fa';
import axios from 'axios';

const AchievementBadges = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data } = await axios.get('/api/v1/gamification/achievements');
      setAchievements(data.achievements);
    } catch (error) {
      // Use default achievements if API fails
      setAchievements(defaultAchievements);
    } finally {
      setLoading(false);
    }
  };

  const defaultAchievements = [
    { id: 1, name: 'First Purchase', description: 'Made your first purchase', icon: 'FaShoppingBag', unlocked: true, progress: 100, rarity: 'common' },
    { id: 2, name: 'Review Master', description: 'Write 10 product reviews', icon: 'FaComment', unlocked: true, progress: 100, rarity: 'uncommon' },
    { id: 3, name: 'Social Butterfly', description: 'Share 5 products on social media', icon: 'FaShare', unlocked: false, progress: 60, rarity: 'uncommon' },
    { id: 4, name: 'Loyal Customer', description: 'Make 20 purchases', icon: 'FaCrown', unlocked: false, progress: 45, rarity: 'rare' },
    { id: 5, name: 'Wishlist Collector', description: 'Add 50 items to wishlist', icon: 'FaHeart', unlocked: false, progress: 30, rarity: 'uncommon' },
    { id: 6, name: 'Referral King', description: 'Refer 10 friends', icon: 'FaUserFriends', unlocked: false, progress: 20, rarity: 'rare' },
    { id: 7, name: 'Speed Shopper', description: 'Complete checkout in under 1 minute', icon: 'FaBolt', unlocked: true, progress: 100, rarity: 'rare' },
    { id: 8, name: 'Big Spender', description: 'Spend Rs. 50,000 total', icon: 'FaGem', unlocked: false, progress: 70, rarity: 'epic' },
    { id: 9, name: 'Early Bird', description: 'Be first to buy a new product', icon: 'FaRocket', unlocked: false, progress: 0, rarity: 'legendary' },
    { id: 10, name: 'Champion', description: 'Unlock all achievements', icon: 'FaTrophy', unlocked: false, progress: 25, rarity: 'legendary' },
  ];

  const iconMap = {
    FaShoppingBag, FaComment, FaShare, FaCrown, FaHeart,
    FaUserFriends, FaBolt, FaGem, FaRocket, FaTrophy,
    FaStar, FaFire, FaMedal
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500',
  };

  const rarityGlow = {
    common: 'shadow-gray-500/30',
    uncommon: 'shadow-green-500/30',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/30',
    legendary: 'shadow-yellow-500/50',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const displayAchievements = achievements.length > 0 ? achievements : defaultAchievements;
  const unlockedCount = displayAchievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaTrophy className="text-yellow-500" /> Achievements
          </h2>
          <p className="text-gray-400 mt-1">Unlock badges and earn rewards</p>
        </div>
        <div className="bg-purple-600/20 px-4 py-2 rounded-full">
          <span className="text-purple-400 font-semibold">
            {unlockedCount}/{displayAchievements.length} Unlocked
          </span>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {displayAchievements.map((achievement, index) => {
          const IconComponent = iconMap[achievement.icon] || FaStar;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedBadge(achievement)}
              className={`relative cursor-pointer rounded-xl p-4 ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} shadow-lg ${rarityGlow[achievement.rarity]}`
                  : 'bg-gray-800/50'
              }`}
            >
              {!achievement.unlocked && (
                <div className="absolute inset-0 bg-gray-900/60 rounded-xl flex items-center justify-center">
                  <FaLock className="text-gray-500 text-2xl" />
                </div>
              )}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                  achievement.unlocked ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  <IconComponent className={`text-2xl ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <h3 className={`text-sm font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {achievement.name}
                </h3>
                {!achievement.unlocked && achievement.progress > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{achievement.progress}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-gradient-to-br ${rarityColors[selectedBadge.rarity]} p-6 rounded-2xl max-w-sm w-full text-center`}
            >
              {(() => {
                const IconComponent = iconMap[selectedBadge.icon] || FaStar;
                return (
                  <>
                    <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <IconComponent className="text-5xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h3>
                    <p className="text-white/80 mb-4">{selectedBadge.description}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold uppercase ${
                      selectedBadge.unlocked ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {selectedBadge.unlocked ? 'Unlocked!' : `${selectedBadge.progress}% Complete`}
                    </span>
                    <p className="text-white/60 text-sm mt-4 capitalize">
                      {selectedBadge.rarity} Badge
                    </p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementBadges;
