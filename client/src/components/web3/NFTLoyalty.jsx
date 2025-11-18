import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiGift, FiTrendingUp, FiStar, FiShoppingBag } from 'react-icons/fi';
import { ethers } from 'ethers';
import useWeb3 from '../../hooks/useWeb3';
import Button from '../common/Button';
import toast from 'react-hot-toast';

// Mock NFT Loyalty Contract ABI
const NFT_CONTRACT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function getTier(uint256 tokenId) view returns (uint8)',
];

const NFTLoyalty = () => {
  const { account, provider, isConnected } = useWeb3();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userTier, setUserTier] = useState(0);

  // Mock NFT contract address (replace with actual deployed contract)
  const NFT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

  const loyaltyTiers = [
    {
      tier: 0,
      name: 'Bronze Member',
      color: 'from-orange-400 to-orange-600',
      icon: '🥉',
      benefits: ['5% discount on all orders', 'Early sale access', 'Free shipping on orders $50+'],
      minSpend: 0,
    },
    {
      tier: 1,
      name: 'Silver Member',
      color: 'from-gray-300 to-gray-500',
      icon: '🥈',
      benefits: ['10% discount on all orders', 'Priority customer support', 'Free shipping on all orders', 'Birthday rewards'],
      minSpend: 500,
    },
    {
      tier: 2,
      name: 'Gold Member',
      color: 'from-yellow-400 to-yellow-600',
      icon: '🥇',
      benefits: ['15% discount on all orders', 'VIP customer support', 'Free express shipping', 'Exclusive product access', 'Double points on purchases'],
      minSpend: 1000,
    },
    {
      tier: 3,
      name: 'Platinum Member',
      color: 'from-purple-400 to-purple-600',
      icon: '💎',
      benefits: ['20% discount on all orders', 'Dedicated account manager', 'Free same-day delivery', 'Exclusive collaborations', 'Triple points', 'Annual gift'],
      minSpend: 5000,
    },
  ];

  const currentTier = loyaltyTiers[userTier];
  const nextTier = loyaltyTiers[userTier + 1];

  // Mock: Load user's NFTs and calculate tier
  useEffect(() => {
    const loadNFTs = async () => {
      if (!isConnected || !provider || !account) return;

      setLoading(true);
      try {
        // In production, this would fetch actual NFTs from the smart contract
        // For now, we'll mock the data based on user's purchase history
        
        // Mock NFT data
        const mockNFTs = [
          {
            id: 1,
            name: 'Welcome NFT',
            image: 'https://via.placeholder.com/300?text=Welcome+NFT',
            tier: 0,
            earned: '2024-01-15',
            reason: 'First Purchase',
          },
        ];

        setNfts(mockNFTs);
        
        // Calculate tier based on total spending (mock)
        const mockTotalSpend = 750; // This should come from backend
        const calculatedTier = loyaltyTiers.findIndex((tier, index) => {
          const nextTierSpend = loyaltyTiers[index + 1]?.minSpend || Infinity;
          return mockTotalSpend >= tier.minSpend && mockTotalSpend < nextTierSpend;
        });
        
        setUserTier(Math.max(0, calculatedTier));
      } catch (error) {
        console.error('Failed to load NFTs:', error);
        toast.error('Failed to load loyalty NFTs');
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [isConnected, provider, account]);

  if (!isConnected) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <FiAward className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          NFT Loyalty Rewards
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Connect your Web3 wallet to view your NFT badges and loyalty rewards
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <div className={`p-6 bg-gradient-to-r ${currentTier.color} rounded-xl text-white shadow-xl`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{currentTier.icon}</div>
            <div>
              <p className="text-sm opacity-90">Your Status</p>
              <h3 className="text-2xl font-bold">{currentTier.name}</h3>
            </div>
          </div>
          <FiStar className="w-8 h-8" />
        </div>

        {nextTier && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progress to {nextTier.name}</span>
              <span className="text-sm font-semibold">
                ${currentTier.minSpend} / ${nextTier.minSpend}
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(currentTier.minSpend / nextTier.minSpend) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiGift className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Benefits</h3>
        </div>
        <div className="space-y-2">
          {currentTier.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NFT Collection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your NFT Badges</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">{nfts.length} Collected</span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading NFTs...</p>
          </div>
        ) : nfts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <motion.div
                key={nft.id}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-lg p-4 mb-2 flex items-center justify-center border-2 border-transparent group-hover:border-primary-500 transition-all">
                  <div className="text-6xl">{loyaltyTiers[nft.tier].icon}</div>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">{nft.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">{nft.reason}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiAward className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No NFT badges yet</p>
            <p className="text-xs">Make your first purchase to earn your first NFT!</p>
          </div>
        )}
      </div>

      {/* How to Earn */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How to Earn NFTs</h3>
        <div className="space-y-3">
          {[
            { icon: FiShoppingBag, text: 'Make your first purchase', reward: 'Welcome NFT' },
            { icon: FiTrendingUp, text: 'Spend $500 total', reward: 'Silver Badge' },
            { icon: FiAward, text: 'Spend $1000 total', reward: 'Gold Badge' },
            { icon: FiStar, text: 'Spend $5000 total', reward: 'Platinum Badge' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
              </div>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{item.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Info */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">All Tiers</h3>
        <div className="space-y-3">
          {loyaltyTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`p-4 rounded-lg border-2 transition-all ${
                index === userTier
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{tier.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tier.minSpend > 0 ? `Spend $${tier.minSpend}+` : 'Join now'}
                    </p>
                  </div>
                </div>
                {index === userTier && (
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                    Current
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTLoyalty;
