import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const DarkMagicalParticles = ({ intensity = 'medium' }) => {
  const canvasRef = useRef(null);

  const particleCount = intensity === 'low' ? 18 : intensity === 'high' ? 40 : 28;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Dark Magical Particle class
    class DarkMagicalParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.initialY = this.y;
        this.size = Math.random() * 3 + 1.5;
        
        // Dark magical colors - deep purples, dark blues, mystic greens
        const colors = [
          '#6366f1', '#8b5cf6', '#a855f7', '#c026d3', // Deep purples
          '#3b82f6', '#2563eb', '#1e40af', '#1e3a8a', // Dark blues
          '#14b8a6', '#0d9488', '#0f766e', '#115e59', // Mystic teals
          '#f97316', '#ea580c', '#dc2626', '#b91c1c', // Deep oranges/reds
          '#6366f1', '#4f46e5', '#4338ca', '#3730a3', // Indigos
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random dark particle types
        const types = ['orb', 'rune', 'sigil', 'crystal', 'nebula', 'vortex'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // Float properties - very slow
        this.floatSpeed = 0.0015 + Math.random() * 0.0025;
        this.floatAmount = 20 + Math.random() * 30;
        this.floatPhase = Math.random() * Math.PI * 2;
        
        // Horizontal drift - very subtle
        this.driftSpeed = (Math.random() - 0.5) * 0.04;
        this.initialX = this.x;
        this.driftAmount = 15 + Math.random() * 25;
        this.driftPhase = Math.random() * Math.PI * 2;
        
        // Opacity pulse - slower for mysterious effect
        this.opacitySpeed = 0.0008 + Math.random() * 0.0015;
        this.opacityPhase = Math.random() * Math.PI * 2;
        this.minOpacity = 0.15;
        this.maxOpacity = 0.5;
        
        // Rotation
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 0.015;
        
        // Dark glow
        this.glowSize = 12 + Math.random() * 20;
        
        // Pulse size for some particles
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.001 + Math.random() * 0.002;
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
        this.currentSize = this.size + Math.sin(this.pulsePhase) * 0.5;
      }

      drawOrb() {
        // Mystical glowing orb
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.currentSize * 2);
        gradient.addColorStop(0, this.color + 'dd');
        gradient.addColorStop(0.4, this.color + '88');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.beginPath();
        ctx.arc(0, 0, this.currentSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Inner core
        ctx.beginPath();
        ctx.arc(0, 0, this.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      drawRune() {
        // Ancient rune symbol
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        const size = this.currentSize * 1.5;
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();
        
        // Angled lines
        ctx.beginPath();
        ctx.moveTo(-size * 0.7, -size * 0.5);
        ctx.lineTo(0, 0);
        ctx.lineTo(size * 0.7, -size * 0.5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.7, size * 0.5);
        ctx.lineTo(0, 0);
        ctx.lineTo(size * 0.7, size * 0.5);
        ctx.stroke();
      }

      drawSigil() {
        // Mystical sigil pattern
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        
        const size = this.currentSize * 2;
        
        // Outer circle
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner star pattern
        const points = 6;
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const angle = (i * Math.PI * 2) / points;
          const x = Math.cos(angle) * size * 0.6;
          const y = Math.sin(angle) * size * 0.6;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      drawCrystal() {
        // Dark crystal shape
        const size = this.currentSize * 2;
        
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color + '44';
        ctx.lineWidth = 1.5;
        
        // Crystal facets
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.6, -size * 0.3);
        ctx.lineTo(size * 0.8, size * 0.5);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.8, size * 0.5);
        ctx.lineTo(-size * 0.6, -size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Inner lines
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();
      }

      drawNebula() {
        // Nebula cloud effect
        const size = this.currentSize * 3;
        
        // Multiple overlapping circles for cloud effect
        for (let i = 0; i < 3; i++) {
          const offsetX = (Math.random() - 0.5) * size;
          const offsetY = (Math.random() - 0.5) * size;
          const radius = size * (0.5 + Math.random() * 0.3);
          
          const gradient = ctx.createRadialGradient(
            offsetX, offsetY, 0,
            offsetX, offsetY, radius
          );
          gradient.addColorStop(0, this.color + '66');
          gradient.addColorStop(0.5, this.color + '33');
          gradient.addColorStop(1, this.color + '00');
          
          ctx.beginPath();
          ctx.arc(offsetX, offsetY, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      drawVortex() {
        // Swirling vortex
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        
        const size = this.currentSize * 2;
        const spirals = 3;
        
        for (let s = 0; s < spirals; s++) {
          ctx.beginPath();
          const angleOffset = (s * Math.PI * 2) / spirals;
          
          for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const angle = angleOffset + t * Math.PI * 4;
            const radius = size * t;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        // Dark mystical glow
        ctx.shadowBlur = this.glowSize;
        ctx.shadowColor = this.color;

        // Draw based on type
        switch (this.type) {
          case 'orb':
            this.drawOrb();
            break;
          case 'rune':
            this.drawRune();
            break;
          case 'sigil':
            this.drawSigil();
            break;
          case 'crystal':
            this.drawCrystal();
            break;
          case 'nebula':
            this.drawNebula();
            break;
          case 'vortex':
            this.drawVortex();
            break;
        }

        ctx.restore();
      }
    }

    // Create particles
    const particles = Array.from({ length: particleCount }, () => new DarkMagicalParticle());

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
      {/* Canvas for animated dark particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />

      {/* Floating mystical symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`symbol-${i}`}
            className="absolute text-2xl"
            style={{
              left: `${(i * 10 + 5) % 95}%`,
              top: `${(i * 12 + 8) % 90}%`,
              color: ['#6366f1', '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316'][i % 5],
              opacity: 0.2,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, Math.sin(i) * 12, 0],
              rotate: [0, 360],
              scale: [0.9, 1.3, 0.9],
            }}
            transition={{
              duration: 10 + i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          >
            {['⚡', '🔮', '✨', '🌙', '⭐', '💫', '🌟', '✦', '◆', '◈'][i]}
          </motion.div>
        ))}
      </div>

      {/* Dark ambient glowing orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`dark-orb-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: '400px',
              height: '400px',
              background: `radial-gradient(circle, ${['#6366f1', '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316'][i]}12, transparent)`,
              left: `${i * 25}%`,
              top: `${i * 20}%`,
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.15, 0.3, 0.15],
              x: [0, 60, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + i * 13}%`,
            }}
            animate={{
              y: [0, -18, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 9 + i * 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          >
            <div
              className="w-8 h-8"
              style={{
                background: `linear-gradient(135deg, ${['#6366f1', '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#c026d3'][i]}33, transparent)`,
                border: `2px solid ${['#6366f1', '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#c026d3'][i]}66`,
                borderRadius: i % 2 === 0 ? '50%' : '4px',
                boxShadow: `0 0 25px ${['#6366f1', '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#c026d3'][i]}44`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Mystical trails */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`trail-${i}`}
            className="absolute"
            style={{
              left: `${20 + i * 20}%`,
              top: `${15 + i * 18}%`,
              width: '2px',
              height: '60px',
              background: `linear-gradient(to bottom, ${['#6366f1', '#8b5cf6', '#3b82f6', '#14b8a6'][i]}, transparent)`,
              boxShadow: `0 0 15px ${['#6366f1', '#8b5cf6', '#3b82f6', '#14b8a6'][i]}`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 7 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default DarkMagicalParticles;
