import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlobeAltIcon,
  LeafIcon,
  TrashIcon,
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathRoundedSquareIcon,
  TruckIcon,
  CubeIcon,
  ShoppingBagIcon,
  XMarkIcon,
  ChevronRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  LeafIcon as LeafSolidIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Carbon Footprint Calculator
export const CarbonCalculator = ({ cart }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Mock carbon calculation
  const calculations = {
    productManufacturing: 12.5,
    packaging: 2.3,
    shipping: 5.8,
    lastMile: 1.2,
    total: 21.8,
    offset: {
      trees: 0.4,
      cost: 2.50
    },
    comparison: {
      carMiles: 52,
      phoneCharges: 2650
    }
  };

  const segments = [
    { label: 'Manufacturing', value: calculations.productManufacturing, color: 'bg-red-500' },
    { label: 'Packaging', value: calculations.packaging, color: 'bg-orange-500' },
    { label: 'Shipping', value: calculations.shipping, color: 'bg-yellow-500' },
    { label: 'Last Mile', value: calculations.lastMile, color: 'bg-green-500' },
  ];

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <GlobeAltIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Carbon Footprint</h3>
            <p className="text-gray-400 text-sm">For this order</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <InformationCircleIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Main Display */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block"
        >
          <div className="text-5xl font-bold text-white">
            {calculations.total}
            <span className="text-xl text-gray-400 font-normal ml-2">kg CO₂</span>
          </div>
        </motion.div>
        <p className="text-gray-500 mt-2">
          Equivalent to driving {calculations.comparison.carMiles} miles
        </p>
      </div>

      {/* Breakdown Bar */}
      <div className="mb-6">
        <div className="h-4 rounded-full overflow-hidden flex">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.label}
              initial={{ width: 0 }}
              animate={{ width: `${(seg.value / calculations.total) * 100}%` }}
              transition={{ delay: i * 0.1 }}
              className={`${seg.color} first:rounded-l-full last:rounded-r-full`}
            />
          ))}
        </div>
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2"
            >
              {segments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${seg.color}`} />
                    <span className="text-gray-400">{seg.label}</span>
                  </div>
                  <span className="text-white">{seg.value} kg</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Offset Option */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => toast.success('Carbon offset added to your order!')}
        className="w-full p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-500/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Offset Your Carbon</p>
              <p className="text-green-400 text-sm">Plant {calculations.offset.trees} trees</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold">+${calculations.offset.cost.toFixed(2)}</p>
            <p className="text-gray-500 text-xs">One-time</p>
          </div>
        </div>
      </motion.button>
    </div>
  );
};

// Eco-Friendly Product Badges
export const EcoProductBadges = ({ product }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const badges = [
    {
      id: 'organic',
      name: 'Organic',
      icon: '🌿',
      description: 'Made with 100% organic materials',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'recycled',
      name: 'Recycled',
      icon: '♻️',
      description: 'Made from recycled materials',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'carbon-neutral',
      name: 'Carbon Neutral',
      icon: '🌍',
      description: 'Net-zero carbon emissions',
      color: 'from-teal-500 to-green-500'
    },
    {
      id: 'fair-trade',
      name: 'Fair Trade',
      icon: '🤝',
      description: 'Ethically sourced and produced',
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'cruelty-free',
      name: 'Cruelty Free',
      icon: '🐰',
      description: 'No animal testing',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'plastic-free',
      name: 'Plastic Free',
      icon: '🌊',
      description: 'Zero plastic packaging',
      color: 'from-sky-500 to-blue-500'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Badge Display */}
      <div className="flex flex-wrap gap-2">
        {badges.slice(0, 4).map((badge) => (
          <motion.button
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedBadge(badge.id === selectedBadge ? null : badge.id)}
            className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              selectedBadge === badge.id
                ? `bg-gradient-to-r ${badge.color} text-white`
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>{badge.icon}</span>
            <span>{badge.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Badge Details */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {badges.filter(b => b.id === selectedBadge).map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl bg-gradient-to-r ${badge.color} bg-opacity-20 border border-white/10`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <h4 className="text-white font-bold">{badge.name} Certified</h4>
                    <p className="text-white/80 text-sm mt-1">{badge.description}</p>
                    <button className="text-white underline text-sm mt-2">
                      Learn more about our certifications →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Recycling Program Component
export const RecyclingProgram = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const programs = [
    {
      id: 'trade-in',
      title: 'Trade-In Program',
      description: 'Trade in your old items for store credit',
      reward: 'Up to 30% back',
      icon: ArrowPathRoundedSquareIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'recycling',
      title: 'Packaging Recycling',
      description: 'Return packaging for recycling rewards',
      reward: '+100 Green Points',
      icon: TrashIcon,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'donation',
      title: 'Donate to Charity',
      description: 'Donate old items to those in need',
      reward: 'Tax Deductible',
      icon: HeartIcon,
      color: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
          <ArrowPathRoundedSquareIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Recycling Programs</h3>
          <p className="text-gray-400 text-sm">Give your items a second life</p>
        </div>
      </div>

      <div className="space-y-3">
        {programs.map((program) => (
          <motion.button
            key={program.id}
            whileHover={{ x: 5 }}
            onClick={() => {
              setSelectedProgram(program.id);
              toast.success(`Selected: ${program.title}`);
            }}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedProgram === program.id
                ? `bg-gradient-to-r ${program.color} bg-opacity-20`
                : 'bg-gray-800 hover:bg-gray-700'
            } border-2 ${
              selectedProgram === program.id ? 'border-white/30' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${program.color} flex items-center justify-center`}>
                  <program.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{program.title}</p>
                  <p className="text-gray-400 text-sm">{program.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-400 font-medium">{program.reward}</span>
                <ChevronRightIcon className="w-5 h-5 text-gray-500 ml-auto" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
          <div>
            <p className="text-white font-medium">You've recycled 15 items!</p>
            <p className="text-green-400 text-sm">Saved 45 kg of CO₂ emissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Charity Donation at Checkout
export const CharityDonation = ({ total, onDonate }) => {
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [isRoundUp, setIsRoundUp] = useState(false);

  const charities = [
    { id: 'trees', name: 'One Tree Planted', icon: '🌳', description: 'Plant trees worldwide' },
    { id: 'ocean', name: 'Ocean Cleanup', icon: '🌊', description: 'Remove plastic from oceans' },
    { id: 'wildlife', name: 'WWF', icon: '🐼', description: 'Protect endangered species' },
    { id: 'hunger', name: 'Feeding America', icon: '🍲', description: 'Fight hunger in the US' }
  ];

  const amounts = [1, 5, 10, 25];
  const roundUpAmount = Math.ceil(total) - total;

  const handleDonation = () => {
    const amount = isRoundUp ? roundUpAmount : donationAmount;
    if (!selectedCharity) {
      toast.error('Please select a charity');
      return;
    }
    if (amount === 0) {
      toast.error('Please select a donation amount');
      return;
    }
    onDonate?.({ charity: selectedCharity, amount });
    toast.success(`Thank you for donating $${amount.toFixed(2)}! 💚`);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
          <HeartSolidIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Donate to Charity</h3>
          <p className="text-gray-400 text-sm">Make a difference with your order</p>
        </div>
      </div>

      {/* Round Up Option */}
      <button
        onClick={() => {
          setIsRoundUp(!isRoundUp);
          if (!isRoundUp) setDonationAmount(0);
        }}
        className={`w-full p-4 rounded-xl mb-4 flex items-center justify-between transition-all ${
          isRoundUp
            ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-2 border-pink-500/50'
            : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
        }`}
      >
        <div>
          <p className="text-white font-medium text-left">Round up your order</p>
          <p className="text-gray-400 text-sm">Add ${roundUpAmount.toFixed(2)} to donation</p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          isRoundUp ? 'border-pink-500 bg-pink-500' : 'border-gray-500'
        }`}>
          {isRoundUp && <CheckCircleIcon className="w-4 h-4 text-white" />}
        </div>
      </button>

      {/* Fixed Amounts */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Or select an amount</label>
        <div className="flex gap-2">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setDonationAmount(amount);
                setIsRoundUp(false);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                donationAmount === amount && !isRoundUp
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Charity Selection */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Choose a charity</label>
        <div className="grid grid-cols-2 gap-2">
          {charities.map((charity) => (
            <button
              key={charity.id}
              onClick={() => setSelectedCharity(charity.id)}
              className={`p-3 rounded-xl text-left transition-all ${
                selectedCharity === charity.id
                  ? 'bg-pink-500/20 border-2 border-pink-500/50'
                  : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
              }`}
            >
              <span className="text-2xl">{charity.icon}</span>
              <p className="text-white font-medium text-sm mt-1">{charity.name}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleDonation}
        disabled={(!donationAmount && !isRoundUp) || !selectedCharity}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Donate ${isRoundUp ? roundUpAmount.toFixed(2) : donationAmount.toFixed(2)}
      </button>
    </div>
  );
};

// Sustainability Dashboard
export const SustainabilityDashboard = () => {
  const stats = {
    carbonSaved: 127.5,
    treesPlanted: 12,
    plasticSaved: 34,
    recycledItems: 28,
    ecoOrders: 45,
    totalDonated: 156.50
  };

  const achievements = [
    { id: 1, name: 'Eco Warrior', icon: '🌱', unlocked: true },
    { id: 2, name: 'Tree Hugger', icon: '🌳', unlocked: true },
    { id: 3, name: 'Ocean Guardian', icon: '🌊', unlocked: false },
    { id: 4, name: 'Carbon Hero', icon: '🦸', unlocked: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <LeafSolidIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your Green Impact</h2>
            <p className="text-green-400">Making a difference since 2024</p>
          </div>
        </div>

        {/* Main Stat */}
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl font-bold text-white"
          >
            {stats.carbonSaved}
            <span className="text-2xl text-gray-400 ml-2">kg CO₂</span>
          </motion.div>
          <p className="text-gray-400 mt-2">Total carbon emissions prevented</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Trees Planted', value: stats.treesPlanted, icon: '🌳', color: 'green' },
          { label: 'Plastic Saved', value: `${stats.plasticSaved}kg`, icon: '♻️', color: 'blue' },
          { label: 'Items Recycled', value: stats.recycledItems, icon: '🔄', color: 'teal' },
          { label: 'Eco Orders', value: stats.ecoOrders, icon: '📦', color: 'emerald' },
          { label: 'Total Donated', value: `$${stats.totalDonated}`, icon: '💚', color: 'pink' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/50 rounded-xl p-4 border border-gray-800"
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Sustainability Badges</h3>
        <div className="flex gap-4">
          {achievements.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.1 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                badge.unlocked
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gray-800 opacity-50'
              }`}
            >
              {badge.icon}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default {
  CarbonCalculator,
  EcoProductBadges,
  RecyclingProgram,
  CharityDonation,
  SustainabilityDashboard
};
