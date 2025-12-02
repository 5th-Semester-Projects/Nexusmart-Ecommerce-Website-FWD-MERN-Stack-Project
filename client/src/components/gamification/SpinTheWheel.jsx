import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaGift, FaCoins, FaPercent, FaTruck, FaStar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const SpinTheWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  const [canSpin, setCanSpin] = useState(true);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const wheelRef = useRef(null);

  const prizes = [
    { id: 1, name: '50 Points', icon: FaCoins, color: '#FFD700', probability: 25 },
    { id: 2, name: '10% Off', icon: FaPercent, color: '#FF6B6B', probability: 20 },
    { id: 3, name: 'Free Shipping', icon: FaTruck, color: '#4ECDC4', probability: 15 },
    { id: 4, name: '100 Points', icon: FaCoins, color: '#45B7D1', probability: 15 },
    { id: 5, name: '20% Off', icon: FaPercent, color: '#96CEB4', probability: 10 },
    { id: 6, name: '200 Points', icon: FaStar, color: '#DDA0DD', probability: 8 },
    { id: 7, name: 'Mystery Gift', icon: FaGift, color: '#FF69B4', probability: 5 },
    { id: 8, name: '500 Points', icon: FaStar, color: '#9B59B6', probability: 2 },
  ];

  const segmentAngle = 360 / prizes.length;

  const spinWheel = async () => {
    if (isSpinning || !canSpin || spinsLeft <= 0) return;

    setIsSpinning(true);
    setPrize(null);

    try {
      // Call API for spin result
      const { data } = await axios.post('/api/v1/gamification/spin-wheel');
      const wonPrize = data.prize || prizes[Math.floor(Math.random() * prizes.length)];
      
      // Calculate rotation to land on prize
      const prizeIndex = prizes.findIndex(p => p.name === wonPrize.name) || Math.floor(Math.random() * prizes.length);
      const targetAngle = prizeIndex * segmentAngle;
      const fullRotations = 5 * 360; // 5 full rotations
      const newRotation = rotation + fullRotations + (360 - targetAngle) + segmentAngle / 2;

      setRotation(newRotation);
      setSpinsLeft(prev => prev - 1);

      // Wait for animation to complete
      setTimeout(() => {
        setPrize(prizes[prizeIndex]);
        setIsSpinning(false);
        
        // Celebrate!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast.success(`You won: ${prizes[prizeIndex].name}! 🎉`);
      }, 5000);

    } catch (error) {
      // Fallback to random prize
      const randomIndex = Math.floor(Math.random() * prizes.length);
      const targetAngle = randomIndex * segmentAngle;
      const fullRotations = 5 * 360;
      const newRotation = rotation + fullRotations + (360 - targetAngle) + segmentAngle / 2;

      setRotation(newRotation);
      setSpinsLeft(prev => prev - 1);

      setTimeout(() => {
        setPrize(prizes[randomIndex]);
        setIsSpinning(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`You won: ${prizes[randomIndex].name}! 🎉`);
      }, 5000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <FaGift className="text-pink-500" /> Spin & Win
        </h2>
        <p className="text-gray-400 mt-1">Try your luck and win amazing rewards!</p>
        <div className="mt-2 inline-block bg-purple-600/30 px-4 py-1 rounded-full">
          <span className="text-purple-300">Spins left today: {spinsLeft}</span>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative w-80 h-80 mx-auto">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-500 drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-4 border-yellow-500"
          style={{
            background: 'conic-gradient(from 0deg, ' + 
              prizes.map((p, i) => `${p.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ') + ')'
          }}
          animate={{ rotate: rotation }}
          transition={{ duration: 5, ease: [0.17, 0.67, 0.12, 0.99] }}
        >
          {/* Prize Labels */}
          {prizes.map((prizeItem, index) => {
            const angle = index * segmentAngle + segmentAngle / 2;
            const IconComponent = prizeItem.icon;
            return (
              <div
                key={prizeItem.id}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
                  <IconComponent className="text-white text-xl mx-auto mb-1 drop-shadow-lg" />
                  <span className="text-white text-xs font-bold drop-shadow-lg whitespace-nowrap">
                    {prizeItem.name}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
            <FaStar className="text-white text-3xl" />
          </div>
        </motion.div>
      </div>

      {/* Spin Button */}
      <div className="text-center mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={spinWheel}
          disabled={isSpinning || spinsLeft <= 0}
          className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg ${
            isSpinning || spinsLeft <= 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
          }`}
        >
          {isSpinning ? 'Spinning...' : spinsLeft <= 0 ? 'No Spins Left' : '🎰 SPIN NOW!'}
        </motion.button>
      </div>

      {/* Prize Display */}
      {prize && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 rounded-xl">
            <p className="text-white font-bold text-xl">
              🎉 You Won: {prize.name}!
            </p>
          </div>
        </motion.div>
      )}

      {/* Rules */}
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>• 3 free spins daily • More spins with purchases</p>
        <p>• Prizes automatically added to your account</p>
      </div>
    </div>
  );
};

export default SpinTheWheel;
