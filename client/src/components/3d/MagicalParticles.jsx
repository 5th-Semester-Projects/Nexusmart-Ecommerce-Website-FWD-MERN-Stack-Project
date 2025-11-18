import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MagicalParticles = ({ intensity = 'medium' }) => {
  const canvasRef = useRef(null);

  const particleCount = intensity === 'low' ? 15 : intensity === 'high' ? 35 : 25;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Magical Particle class
    class MagicalParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.initialY = this.y;
        this.size = Math.random() * 4 + 2;
        
        // Random colors with magical theme
        const colors = [
          '#a78bfa', '#c084fc', '#e879f9', // Purple variants
          '#60a5fa', '#38bdf8', '#22d3ee', // Blue variants
          '#34d399', '#10b981', '#14b8a6', // Green variants
          '#fbbf24', '#f59e0b', '#fb923c', // Gold/Orange variants
          '#f472b6', '#ec4899', '#db2777', // Pink variants
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random particle type
        const types = ['circle', 'star', 'sparkle', 'diamond', 'heart'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // Float properties
        this.floatSpeed = 0.002 + Math.random() * 0.003;
        this.floatAmount = 15 + Math.random() * 25;
        this.floatPhase = Math.random() * Math.PI * 2;
        
        // Horizontal drift
        this.driftSpeed = (Math.random() - 0.5) * 0.05;
        this.initialX = this.x;
        this.driftAmount = 20 + Math.random() * 30;
        this.driftPhase = Math.random() * Math.PI * 2;
        
        // Opacity pulse
        this.opacitySpeed = 0.001 + Math.random() * 0.002;
        this.opacityPhase = Math.random() * Math.PI * 2;
        this.minOpacity = 0.2;
        this.maxOpacity = 0.6;
        
        // Rotation for some particles
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        
        // Glow
        this.glowSize = 10 + Math.random() * 15;
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
      }

      drawCircle() {
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      drawStar() {
        const points = 5;
        const outerRadius = this.size;
        const innerRadius = this.size / 2;
        
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / points;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      drawSparkle() {
        // Cross shape sparkle
        const length = this.size * 1.5;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(0, -length);
        ctx.lineTo(0, length);
        ctx.stroke();
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(-length, 0);
        ctx.lineTo(length, 0);
        ctx.stroke();
        
        // Diagonal lines
        const diagLength = length * 0.7;
        ctx.beginPath();
        ctx.moveTo(-diagLength, -diagLength);
        ctx.lineTo(diagLength, diagLength);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(diagLength, -diagLength);
        ctx.lineTo(-diagLength, diagLength);
        ctx.stroke();
        
        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      drawDiamond() {
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      drawHeart() {
        const size = this.size;
        ctx.beginPath();
        ctx.moveTo(0, size / 4);
        
        // Left curve
        ctx.bezierCurveTo(-size, -size / 2, -size * 1.5, size / 2, 0, size * 1.2);
        
        // Right curve
        ctx.bezierCurveTo(size * 1.5, size / 2, size, -size / 2, 0, size / 4);
        
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        // Glow effect
        ctx.shadowBlur = this.glowSize;
        ctx.shadowColor = this.color;

        // Draw based on type
        switch (this.type) {
          case 'circle':
            this.drawCircle();
            break;
          case 'star':
            this.drawStar();
            break;
          case 'sparkle':
            this.drawSparkle();
            break;
          case 'diamond':
            this.drawDiamond();
            break;
          case 'heart':
            this.drawHeart();
            break;
        }

        ctx.restore();
      }
    }

    // Create particles
    const particles = Array.from({ length: particleCount }, () => new MagicalParticle());

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
      {/* Canvas for animated particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.7 }}
      />

      {/* Additional floating magical elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`magic-${i}`}
            className="absolute"
            style={{
              left: `${(i * 12 + 5) % 95}%`,
              top: `${(i * 15 + 10) % 90}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(i) * 10, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          >
            <div
              className="w-6 h-6 rounded-full"
              style={{
                background: `radial-gradient(circle, ${['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#c084fc', '#38bdf8', '#10b981'][i]}dd, transparent)`,
                boxShadow: `0 0 20px ${['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#c084fc', '#38bdf8', '#10b981'][i]}`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Glowing ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-96 h-96 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${['#a78bfa', '#60a5fa', '#34d399', '#fbbf24'][i]}15, transparent)`,
              left: `${i * 30}%`,
              top: `${i * 25}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Floating mini stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6'][i % 5],
              opacity: 0.3,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 180, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 6 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default MagicalParticles;
