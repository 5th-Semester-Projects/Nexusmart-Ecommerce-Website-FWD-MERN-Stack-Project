import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiZap } from 'react-icons/fi';

const RoboticWelcome = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Hide after animation
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)',
          }}
        >
          {/* Circuit Background */}
          <div className="circuit-bg"></div>
          
          {/* Scan Lines */}
          <div className="scan-lines"></div>

          {/* Matrix Rain Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, opacity: 0 }}
                animate={{
                  y: ['0vh', '100vh'],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  width: '2px',
                  height: '50px',
                  background: 'linear-gradient(180deg, transparent, #00d4ff, transparent)',
                  filter: 'blur(1px)',
                }}
              />
            ))}
          </div>

          {/* Energy Orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(136, 0, 255, 0.4) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Central Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Rotating CPU Icon */}
            <motion.div
              className="mb-8 relative"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <motion.div
                className="energy-core w-32 h-32 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <FiCpu className="text-7xl text-cyan-400" />
              </motion.div>
              
              {/* Orbiting Particles */}
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-cyan-400"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)',
                  }}
                  animate={{
                    rotate: [i * 90, i * 90 + 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '80px',
                      top: '-6px',
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Logo Text with Glitch */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl md:text-7xl font-display mb-4 glitch"
              style={{
                fontFamily: 'Audiowide, Orbitron, sans-serif',
                textShadow: '0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.4)',
              }}
            >
              <span className="gradient-text-robotic">NEXUSMART</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-cyan-300 mb-8 font-tech tracking-wider"
            >
              INITIALIZING SYSTEM...
            </motion.p>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="w-80 max-w-md"
            >
              {/* Progress Container */}
              <div className="relative">
                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden border border-cyan-400/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                    style={{
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)',
                    }}
                  >
                    {/* Animated shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                </div>
                
                {/* Progress Text */}
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-cyan-400 font-tech">{progress}%</span>
                  <span className="text-sm text-purple-400 font-tech">
                    {progress < 30 && 'LOADING CORE...'}
                    {progress >= 30 && progress < 60 && 'ESTABLISHING CONNECTION...'}
                    {progress >= 60 && progress < 90 && 'SYNCHRONIZING DATA...'}
                    {progress >= 90 && 'READY!'}
                  </span>
                </div>
              </div>

              {/* Binary Code Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mt-4 text-center text-xs text-cyan-400/50 font-tech"
              >
                01001110 01000101 01011000 01010101 01010011
              </motion.div>
            </motion.div>

            {/* Lightning Bolts */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 0.3,
                  delay: 1 + i * 0.5,
                  repeat: 2,
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 120}deg)`,
                }}
              >
                <FiZap
                  className="text-6xl text-cyan-400"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.8))',
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Corner Decorations */}
          <motion.div
            className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-400/50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.div
            className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-400/50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          <motion.div
            className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-400/50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />
          <motion.div
            className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-400/50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoboticWelcome;
