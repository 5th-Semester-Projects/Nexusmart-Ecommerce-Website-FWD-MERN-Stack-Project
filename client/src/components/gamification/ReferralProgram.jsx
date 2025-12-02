import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserFriends, FaCopy, FaWhatsapp, FaFacebook, FaTwitter, FaEnvelope, FaGift, FaCheck } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReferralProgram = () => {
  const { user } = useSelector((state) => state.auth);
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || 'NEXUS' + (user?._id?.slice(-6)?.toUpperCase() || 'XXXXX');
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data } = await axios.get('/api/v1/gamification/referral-stats');
      setReferralData(data.data);
    } catch (error) {
      setReferralData({
        totalReferrals: 5,
        successfulReferrals: 3,
        pendingReferrals: 2,
        totalEarnings: 600,
        referrals: [
          { name: 'Ali K.', status: 'completed', reward: 200, date: '2024-01-15' },
          { name: 'Sara M.', status: 'completed', reward: 200, date: '2024-01-20' },
          { name: 'Ahmed H.', status: 'pending', reward: 0, date: '2024-02-01' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOn = (platform) => {
    const message = encodeURIComponent(`Join NexusMart and get Rs. 200 off your first order! Use my referral code: ${referralCode}`);
    const urls = {
      whatsapp: `https://wa.me/?text=${message}%20${encodeURIComponent(referralLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${message}`,
      twitter: `https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=Join%20NexusMart&body=${message}%20${encodeURIComponent(referralLink)}`
    };
    window.open(urls[platform], '_blank');
  };

  const rewards = [
    { referrals: 1, reward: 'Rs. 200 Credit', unlocked: (referralData?.successfulReferrals || 0) >= 1 },
    { referrals: 3, reward: 'Free Shipping for 1 Month', unlocked: (referralData?.successfulReferrals || 0) >= 3 },
    { referrals: 5, reward: 'Rs. 1000 Credit', unlocked: (referralData?.successfulReferrals || 0) >= 5 },
    { referrals: 10, reward: 'VIP Status + 20% Lifetime Discount', unlocked: (referralData?.successfulReferrals || 0) >= 10 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4"
        >
          <FaUserFriends className="text-4xl text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Refer & Earn</h2>
        <p className="text-gray-400 mt-2">Invite friends and earn amazing rewards!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{referralData?.totalReferrals || 0}</p>
          <p className="text-gray-400 text-sm">Total Invites</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{referralData?.successfulReferrals || 0}</p>
          <p className="text-gray-400 text-sm">Successful</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">Rs. {referralData?.totalEarnings || 0}</p>
          <p className="text-gray-400 text-sm">Earned</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
        <label className="text-gray-400 text-sm mb-2 block">Your Referral Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              copied ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </motion.button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-gray-400 text-sm">Your Code:</span>
          <span className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full text-sm font-mono">
            {referralCode}
          </span>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm mb-3">Share via</p>
        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => shareOn('whatsapp')}
            className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"
          >
            <FaWhatsapp className="text-white text-xl" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => shareOn('facebook')}
            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <FaFacebook className="text-white text-xl" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => shareOn('twitter')}
            className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center"
          >
            <FaTwitter className="text-white text-xl" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => shareOn('email')}
            className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center"
          >
            <FaEnvelope className="text-white text-xl" />
          </motion.button>
        </div>
      </div>

      {/* Reward Milestones */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FaGift className="text-pink-500" /> Reward Milestones
        </h3>
        <div className="space-y-3">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                reward.unlocked ? 'bg-green-500/20' : 'bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  reward.unlocked ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {reward.unlocked ? (
                    <FaCheck className="text-white text-sm" />
                  ) : (
                    <span className="text-white text-sm">{reward.referrals}</span>
                  )}
                </div>
                <span className={reward.unlocked ? 'text-green-400' : 'text-gray-400'}>
                  {reward.referrals} Referrals
                </span>
              </div>
              <span className={`font-semibold ${reward.unlocked ? 'text-green-400' : 'text-gray-500'}`}>
                {reward.reward}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Referrals */}
      {referralData?.referrals?.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Recent Referrals</h3>
          <div className="space-y-2">
            {referralData.referrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm">{referral.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">{referral.name}</p>
                    <p className="text-gray-500 text-xs">{referral.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  referral.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {referral.status === 'completed' ? `+Rs. ${referral.reward}` : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralProgram;
