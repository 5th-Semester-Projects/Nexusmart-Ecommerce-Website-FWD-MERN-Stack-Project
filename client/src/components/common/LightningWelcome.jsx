import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LightningWelcome = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  const [lightningStrikes, setLightningStrikes] = useState([]);

  useEffect(() => {
    // Generate random lightning strikes
    const strikes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: i * 0.3,
      x: Math.random() * 100,
      duration: 0.2 + Math.random() * 0.3,
    }));
    setLightningStrikes(strikes);

    // Hide after animation
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-gray-950 flex items-center justify-center overflow-hidden"
        >
          {/* Thunder Flashes */}
          {lightningStrikes.map((strike) => (
            <motion.div
              key={strike.id}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0, 1, 0],
              }}
              transition={{
                duration: strike.duration,
                delay: strike.delay,
                times: [0, 0.2, 0.4, 0.6, 1],
              }}
              className="absolute inset-0 bg-gradient-to-b from-cyan-400/30 via-purple-500/20 to-transparent"
            />
          ))}

          {/* Lightning Bolts */}
          {lightningStrikes.map((strike) => (
            <motion.svg
              key={`bolt-${strike.id}`}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                pathLength: [0, 1, 1, 0],
              }}
              transition={{
                duration: strike.duration,
                delay: strike.delay,
                times: [0, 0.3, 0.7, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: `${strike.x}%`,
                width: '200px',
                height: '100%',
                filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.8))',
              }}
              viewBox="0 0 100 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M50 0 L40 120 L60 120 L45 200 L55 200 L40 350 L30 400"
                stroke="url(#lightning-gradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </motion.svg>
          ))}

          {/* Central Logo/Text */}
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
              className="text-center"
            >
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-7xl md:text-9xl font-bold mb-4"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                <span className="gradient-text">NexusMart</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="text-2xl md:text-4xl text-cyan-400 font-semibold"
              >
                ⚡ Enter the Future ⚡
              </motion.div>

              {/* Glowing Orb */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"
              >
                <div className="w-64 h-64 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-3xl opacity-50" />
              </motion.div>
            </motion.div>
          </div>

          {/* Particle Burst */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: 1 + Math.random() * 0.5,
                  ease: 'easeOut',
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${
                    i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#a855f7' : '#ec4899'
                  }, transparent)`,
                }}
              />
            ))}
          </div>

          {/* Scan Lines Effect */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: 1,
              ease: 'linear',
            }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(6, 182, 212, 0.3) 50%, transparent 100%)',
              height: '200px',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LightningWelcome;
