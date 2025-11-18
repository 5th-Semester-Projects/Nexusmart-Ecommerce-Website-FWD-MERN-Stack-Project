import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const UltimateHomeMagic = ({ intensity = 'high' }) => {
  const canvasRef = useRef(null);

  const particleCount = intensity === 'low' ? 25 : intensity === 'high' ? 50 : 35;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Ultimate Magical Particle class
    class UltimateMagicalParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.initialY = this.y;
        this.size = Math.random() * 5 + 2.5;
        
        // Premium dark magical colors - cyber purple, neon cyan, dark gold, mystic pink
        const colors = [
          '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', // Rich purples
          '#06b6d4', '#0891b2', '#0e7490', '#155e75', // Cyber cyans
          '#f59e0b', '#d97706', '#b45309', '#92400e', // Dark golds
          '#ec4899', '#db2777', '#be185d', '#9f1239', // Mystic pinks
          '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', // Electric purples
          '#14b8a6', '#0d9488', '#0f766e', '#115e59', // Teal mystique
          '#f97316', '#ea580c', '#c2410c', '#9a3412', // Deep oranges
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Elite particle types
        const types = ['nexus', 'quantum', 'cosmic', 'ethereal', 'plasma', 'aurora', 'void', 'celestial'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // Ultra-smooth float properties
        this.floatSpeed = 0.0012 + Math.random() * 0.0028;
        this.floatAmount = 25 + Math.random() * 40;
        this.floatPhase = Math.random() * Math.PI * 2;
        
        // Graceful horizontal drift
        this.driftSpeed = (Math.random() - 0.5) * 0.045;
        this.initialX = this.x;
        this.driftAmount = 20 + Math.random() * 40;
        this.driftPhase = Math.random() * Math.PI * 2;
        
        // Smooth opacity transitions
        this.opacitySpeed = 0.0012 + Math.random() * 0.0022;
        this.opacityPhase = Math.random() * Math.PI * 2;
        this.minOpacity = 0.1;
        this.maxOpacity = 0.35;
        
        // Elegant rotation
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 0.018;
        
        // Premium glow
        this.glowSize = 18 + Math.random() * 28;
        
        // Size pulsation
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.0015 + Math.random() * 0.0025;
        
        // Secondary color for gradients
        this.secondaryColor = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        // Vertical float
        this.floatPhase += this.floatSpeed;
        this.y = this.initialY + Math.sin(this.floatPhase) * this.floatAmount;
        
        // Horizontal drift
        this.driftPhase += this.driftSpeed;
        this.x = this.initialX + Math.sin(this.driftPhase) * this.driftAmount;
        
        // Opacity pulse
        this.opacityPhase += this.opacitySpeed;
        this.opacity = this.minOpacity + (Math.sin(this.opacityPhase) + 1) / 2 * (this.maxOpacity - this.minOpacity);
        
        // Rotation
        this.rotation += this.rotationSpeed;
        
        // Size pulse
        this.pulsePhase += this.pulseSpeed;
        this.currentSize = this.size + Math.sin(this.pulsePhase) * 1.2;
      }

      drawNexus() {
        // Nexus point - interconnected nodes
        const size = this.currentSize * 2;
        
        // Center core
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.secondaryColor + 'aa');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Orbital rings
        ctx.strokeStyle = this.color + '88';
        ctx.lineWidth = 1.5;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, size * i * 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Connection nodes
        const nodes = 6;
        for (let i = 0; i < nodes; i++) {
          const angle = (i * Math.PI * 2) / nodes + this.rotation * 0.01;
          const x = Math.cos(angle) * size * 1.8;
          const y = Math.sin(angle) * size * 1.8;
          
          ctx.beginPath();
          ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = this.secondaryColor;
          ctx.fill();
          
          // Connection lines
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(x, y);
          ctx.strokeStyle = this.color + '44';
          ctx.stroke();
        }
      }

      drawQuantum() {
        // Quantum particle - superposition states
        const size = this.currentSize * 2.5;
        
        // Multiple overlapping states
        for (let i = 0; i < 3; i++) {
          const offsetAngle = (i * Math.PI * 2) / 3;
          const offsetX = Math.cos(offsetAngle + this.rotation * 0.02) * size * 0.4;
          const offsetY = Math.sin(offsetAngle + this.rotation * 0.02) * size * 0.4;
          
          const gradient = ctx.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, size);
          gradient.addColorStop(0, i === 0 ? this.color : this.secondaryColor);
          gradient.addColorStop(0.5, (i === 0 ? this.color : this.secondaryColor) + '66');
          gradient.addColorStop(1, (i === 0 ? this.color : this.secondaryColor) + '00');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(offsetX, offsetY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawCosmic() {
        // Cosmic spiral galaxy
        const size = this.currentSize * 2;
        const arms = 3;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        
        for (let arm = 0; arm < arms; arm++) {
          ctx.beginPath();
          const armAngle = (arm * Math.PI * 2) / arms;
          
          for (let i = 0; i <= 50; i++) {
            const t = i / 50;
            const angle = armAngle + t * Math.PI * 4;
            const radius = size * t * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          
          ctx.strokeStyle = this.color + Math.floor((1 - arm / arms) * 255).toString(16).padStart(2, '0');
          ctx.stroke();
        }
        
        // Central core
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, this.secondaryColor);
        gradient.addColorStop(1, this.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
      }

      drawEthereal() {
        // Ethereal wisps
        const size = this.currentSize * 3;
        
        // Multiple wisp layers
        for (let layer = 0; layer < 4; layer++) {
          const angle = (layer * Math.PI) / 2 + this.rotation * 0.01;
          
          ctx.save();
          ctx.rotate(angle);
          
          const gradient = ctx.createLinearGradient(-size, 0, size, 0);
          gradient.addColorStop(0, this.color + '00');
          gradient.addColorStop(0.5, (layer % 2 === 0 ? this.color : this.secondaryColor) + '88');
          gradient.addColorStop(1, this.color + '00');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.ellipse(0, 0, size, size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      }

      drawPlasma() {
        // Plasma ball
        const size = this.currentSize * 2.5;
        
        // Core
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.2, this.color);
        gradient.addColorStop(0.6, this.secondaryColor);
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Lightning arcs
        const arcs = 8;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        
        for (let i = 0; i < arcs; i++) {
          const angle = (i * Math.PI * 2) / arcs + this.rotation * 0.02;
          const length = size * 0.8;
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          
          const segments = 5;
          let x = 0, y = 0;
          for (let s = 1; s <= segments; s++) {
            const nextAngle = angle + (Math.random() - 0.5) * 0.5;
            const nextLength = (length / segments) * s;
            x = Math.cos(nextAngle) * nextLength;
            y = Math.sin(nextAngle) * nextLength;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      drawAurora() {
        // Aurora borealis waves
        const size = this.currentSize * 3;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        
        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath();
          
          for (let i = 0; i <= 30; i++) {
            const t = i / 30;
            const x = (t - 0.5) * size * 2;
            const y = Math.sin(t * Math.PI * 3 + this.rotation * 0.02 + wave) * size * 0.3 + wave * size * 0.2;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          
          const gradient = ctx.createLinearGradient(-size, 0, size, 0);
          gradient.addColorStop(0, this.color + '00');
          gradient.addColorStop(0.5, wave % 2 === 0 ? this.color : this.secondaryColor);
          gradient.addColorStop(1, this.color + '00');
          
          ctx.strokeStyle = gradient;
          ctx.stroke();
        }
      }

      drawVoid() {
        // Void portal
        const size = this.currentSize * 2.5;
        
        // Multiple rings getting darker
        for (let ring = 5; ring >= 0; ring--) {
          const ringSize = size * (1 - ring * 0.15);
          const gradient = ctx.createRadialGradient(0, 0, ringSize * 0.5, 0, 0, ringSize);
          
          if (ring === 0) {
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(1, this.color + '88');
          } else {
            gradient.addColorStop(0, this.color + Math.floor((ring / 5) * 100).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, this.secondaryColor + '44');
          }
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, ringSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Distortion lines
        ctx.strokeStyle = this.color + '66';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI * 2) / 12 + this.rotation * 0.02;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
          ctx.stroke();
        }
      }

      drawCelestial() {
        // Celestial body with atmosphere
        const size = this.currentSize * 2;
        
        // Atmosphere glow
        const atmoGradient = ctx.createRadialGradient(0, 0, size * 0.8, 0, 0, size * 2);
        atmoGradient.addColorStop(0, this.color + '00');
        atmoGradient.addColorStop(0.5, this.color + '44');
        atmoGradient.addColorStop(1, this.secondaryColor + '00');
        
        ctx.fillStyle = atmoGradient;
        ctx.beginPath();
        ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main body
        const bodyGradient = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
        bodyGradient.addColorStop(0, this.secondaryColor);
        bodyGradient.addColorStop(0.7, this.color);
        bodyGradient.addColorStop(1, this.color + '44');
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Rings
        ctx.strokeStyle = this.color + '88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 2, size * 0.5, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        // Premium magical glow
        ctx.shadowBlur = this.glowSize;
        ctx.shadowColor = this.color;

        // Draw based on type
        switch (this.type) {
          case 'nexus':
            this.drawNexus();
            break;
          case 'quantum':
            this.drawQuantum();
            break;
          case 'cosmic':
            this.drawCosmic();
            break;
          case 'ethereal':
            this.drawEthereal();
            break;
          case 'plasma':
            this.drawPlasma();
            break;
          case 'aurora':
            this.drawAurora();
            break;
          case 'void':
            this.drawVoid();
            break;
          case 'celestial':
            this.drawCelestial();
            break;
        }

        ctx.restore();
      }
    }

    // Create particles
    const particles = Array.from({ length: particleCount }, () => new UltimateMagicalParticle());

    // Animation loop
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [particleCount]);

  return (
    <>
      {/* Canvas for ultimate magical particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.35 }}
      />

      {/* Elite floating icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`elite-${i}`}
            className="absolute text-3xl"
            style={{
              left: `${(i * 7 + 2) % 96}%`,
              top: `${(i * 9 + 4) % 92}%`,
              color: ['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'][i % 7],
              opacity: 0.12,
              filter: 'drop-shadow(0 0 10px currentColor)',
            }}
            animate={{
              y: [0, -35, 0],
              x: [0, Math.sin(i) * 18, 0],
              rotate: [0, 360],
              scale: [0.85, 1.5, 0.85],
            }}
            transition={{
              duration: 11 + i * 0.35,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          >
            {['🌟', '✨', '💫', '⭐', '🔮', '💎', '🌙', '⚡', '🎯', '🏆', '👑', '💰', '🎁', '🌈', '🦄'][i]}
          </motion.div>
        ))}
      </div>

      {/* Premium glowing orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={`premium-orb-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: '500px',
              height: '500px',
              background: `radial-gradient(circle, ${['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'][i]}20, transparent)`,
              left: `${i * 16}%`,
              top: `${i * 13}%`,
            }}
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.12, 0.22, 0.12],
              x: [0, 80, 0],
              y: [0, -60, 0],
            }}
            transition={{
              duration: 14 + i * 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Nexus connection lines */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`nexus-${i}`}
            className="absolute"
            style={{
              left: `${10 + i * 10}%`,
              top: `${12 + i * 9}%`,
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.25, 1],
            }}
            transition={{
              duration: 10 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.35,
            }}
          >
            <div
              className="w-12 h-12 relative"
              style={{
                background: `conic-gradient(from ${i * 36}deg, ${['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#a855f7', '#06b6d4', '#f59e0b'][i]}, transparent, ${['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#a855f7', '#06b6d4', '#f59e0b'][i]})`,
                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '10%' : '0%',
                boxShadow: `0 0 35px ${['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#a855f7', '#06b6d4', '#f59e0b'][i]}88`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Quantum streaks */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`streak-${i}`}
            className="absolute"
            style={{
              left: `${18 + i * 16}%`,
              top: `${10 + i * 15}%`,
              width: '4px',
              height: '100px',
              background: `linear-gradient(to bottom, ${['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'][i]}, transparent)`,
              boxShadow: `0 0 25px ${['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'][i]}`,
              transform: `rotate(${i * 25}deg)`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.4, 0.2],
              scaleY: [1, 1.8, 1],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Floating geometric mandalas */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`mandala-${i}`}
            className="absolute"
            style={{
              left: `${20 + i * 18}%`,
              top: `${15 + i * 17}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke={['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'][i]} strokeWidth="1.5" opacity="0.6" />
              <circle cx="30" cy="30" r="18" fill="none" stroke={['#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#a855f7'][i]} strokeWidth="1.5" opacity="0.6" />
              <circle cx="30" cy="30" r="11" fill="none" stroke={['#f59e0b', '#ec4899', '#8b5cf6', '#a855f7', '#06b6d4'][i]} strokeWidth="1.5" opacity="0.6" />
              {Array.from({ length: 6 }).map((_, j) => {
                const angle = (j * 60) * (Math.PI / 180);
                return (
                  <line
                    key={j}
                    x1="30"
                    y1="30"
                    x2={30 + Math.cos(angle) * 25}
                    y2={30 + Math.sin(angle) * 25}
                    stroke={['#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'][i]}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}
            </svg>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default UltimateHomeMagic;
