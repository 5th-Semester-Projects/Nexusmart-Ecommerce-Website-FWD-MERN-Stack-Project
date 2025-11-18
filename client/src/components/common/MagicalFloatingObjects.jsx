import React from 'react';
import { motion } from 'framer-motion';

const MagicalFloatingObjects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Magical Book */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 15, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute text-6xl"
        style={{ left: '10%', top: '15%' }}
      >
        📖
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-xl"
        />
      </motion.div>

      {/* Magical Candle */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          rotate: [0, -3, 3, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute text-6xl"
        style={{ right: '15%', top: '25%' }}
      >
        🕯️
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-4xl"
        >
          🔥
        </motion.div>
      </motion.div>

      {/* Magical Lamp (Chirag) */}
      <motion.div
        animate={{
          y: [0, -35, 0],
          x: [0, -10, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute text-7xl"
        style={{ left: '5%', bottom: '20%' }}
      >
        🪔
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute -inset-6 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-full blur-2xl"
        />
        {/* Smoke coming out */}
        <motion.div
          animate={{
            y: [0, -40],
            opacity: [0.6, 0],
            scale: [0.5, 1.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl"
        >
          ☁️
        </motion.div>
      </motion.div>

      {/* Crystal Ball */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
          delay: 0.5,
        }}
        className="absolute text-6xl"
        style={{ right: '8%', bottom: '30%' }}
      >
        🔮
        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
          className="absolute -inset-4 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-xl"
        />
      </motion.div>

      {/* Magic Wand */}
      <motion.div
        animate={{
          y: [0, -28, 0],
          x: [0, 12, 0],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
        className="absolute text-5xl"
        style={{ left: '25%', top: '10%' }}
      >
        🪄
        {/* Sparkles from wand */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, Math.cos((i * Math.PI) / 2) * 30],
              y: [0, Math.sin((i * Math.PI) / 2) * 30],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="absolute top-0 left-0 text-2xl"
          >
            ✨
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll */}
      <motion.div
        animate={{
          y: [0, -22, 0],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 8.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2.5,
        }}
        className="absolute text-5xl"
        style={{ right: '20%', top: '12%' }}
      >
        📜
      </motion.div>

      {/* Potion Bottle */}
      <motion.div
        animate={{
          y: [0, -18, 0],
          rotate: [0, 8, -8, 0],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
        className="absolute text-5xl"
        style={{ left: '30%', bottom: '15%' }}
      >
        🧪
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute -inset-3 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full blur-lg"
        />
      </motion.div>

      {/* Magic Stars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          animate={{
            y: [0, -20 - i * 3, 0],
            x: [0, Math.sin(i) * 10, 0],
            rotate: [0, 180, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
          className="absolute text-3xl"
          style={{
            left: `${15 + i * 10}%`,
            top: `${20 + i * 8}%`,
          }}
        >
          ⭐
        </motion.div>
      ))}

      {/* Sparkles floating around */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={{
            y: [0, -25 - i * 2, 0],
            x: [0, Math.cos(i) * 15, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
          className="absolute text-2xl"
          style={{
            left: `${5 + i * 8}%`,
            top: `${10 + (i % 3) * 25}%`,
          }}
        >
          ✨
        </motion.div>
      ))}

      {/* Moon */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute text-6xl"
        style={{ right: '5%', top: '8%' }}
      >
        🌙
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="absolute -inset-6 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"
        />
      </motion.div>

      {/* Magical Crown */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 7.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.8,
        }}
        className="absolute text-5xl"
        style={{ left: '40%', top: '8%' }}
      >
        👑
        <motion.div
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute -inset-3 bg-gradient-to-r from-yellow-400/25 to-amber-400/25 rounded-full blur-lg"
        />
      </motion.div>
    </div>
  );
};

export default MagicalFloatingObjects;
