import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const EnergyParticles = ({ intensity = 'medium' }) => {
  const canvasRef = useRef(null);

  const particleCount = intensity === 'low' ? 20 : intensity === 'high' ? 45 : 32;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Energy Particle class
    class EnergyParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.initialY = this.y;
        this.size = Math.random() * 4 + 2;
        
        // Energetic hot colors - reds, oranges, yellows, electric blues
        const colors = [
          '#ef4444', '#dc2626', '#b91c1c', // Reds
          '#f97316', '#ea580c', '#c2410c', // Oranges
          '#eab308', '#ca8a04', '#a16207', // Yellows
          '#06b6d4', '#0891b2', '#0e7490', // Cyans
          '#ec4899', '#d946ef', '#c026d3', // Hot pinks/magentas
          '#8b5cf6', '#7c3aed', '#6d28d9', // Electric purples
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random energy particle types
        const types = ['lightning', 'fire', 'spark', 'comet', 'pulse', 'bolt'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // Float properties - energetic movement
        this.floatSpeed = 0.002 + Math.random() * 0.004;
        this.floatAmount = 25 + Math.random() * 35;
        this.floatPhase = Math.random() * Math.PI * 2;
        
        // Horizontal drift - more dynamic
        this.driftSpeed = (Math.random() - 0.5) * 0.06;
        this.initialX = this.x;
        this.driftAmount = 20 + Math.random() * 35;
        this.driftPhase = Math.random() * Math.PI * 2;
        
        // Opacity pulse - faster for energy effect
        this.opacitySpeed = 0.002 + Math.random() * 0.003;
        this.opacityPhase = Math.random() * Math.PI * 2;
        this.minOpacity = 0.25;
        this.maxOpacity = 0.7;
        
        // Rotation
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;
        
        // Energy glow
        this.glowSize = 15 + Math.random() * 25;
        
        // Pulse size
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.002 + Math.random() * 0.003;
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 5;
      }

      update() {
        // Save position for trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
          this.trail.shift();
        }
        
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
        this.currentSize = this.size + Math.sin(this.pulsePhase) * 1;
      }

      drawLightning() {
        // Lightning bolt shape
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color + '88';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'miter';
        
        const size = this.currentSize * 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.3, -size * 0.3);
        ctx.lineTo(size * 0.1, 0);
        ctx.lineTo(size * 0.5, size * 0.2);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.2, size * 0.4);
        ctx.lineTo(-size * 0.1, 0);
        ctx.lineTo(-size * 0.3, -size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      drawFire() {
        // Flame shape
        const size = this.currentSize * 2;
        
        // Gradient from yellow to red
        const gradient = ctx.createRadialGradient(0, size * 0.3, 0, 0, 0, size * 1.2);
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.bezierCurveTo(size * 0.6, -size * 0.5, size * 0.4, size * 0.5, 0, size);
        ctx.bezierCurveTo(-size * 0.4, size * 0.5, -size * 0.6, -size * 0.5, 0, -size);
        ctx.fill();
      }

      drawSpark() {
        // Star-burst spark
        const rays = 8;
        const innerRadius = this.currentSize;
        const outerRadius = this.currentSize * 2.5;
        
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        for (let i = 0; i < rays * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / rays;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      drawComet() {
        // Comet with trail
        const size = this.currentSize;
        
        // Head
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + 'aa');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Tail
        ctx.strokeStyle = this.color + '66';
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size * 3, size * 2);
        ctx.stroke();
      }

      drawPulse() {
        // Pulsing ring
        const size = this.currentSize * 2;
        
        // Multiple rings
        for (let i = 0; i < 3; i++) {
          const ringSize = size * (1 + i * 0.5);
          const ringOpacity = (3 - i) / 3;
          
          ctx.strokeStyle = this.color + Math.floor(ringOpacity * 100).toString(16).padStart(2, '0');
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.arc(0, 0, ringSize, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Center
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      drawBolt() {
        // Electric bolt
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        
        const size = this.currentSize * 2;
        const segments = 6;
        
        ctx.beginPath();
        ctx.moveTo(0, -size);
        
        let currentX = 0;
        let currentY = -size;
        
        for (let i = 0; i < segments; i++) {
          const nextY = currentY + (size * 2) / segments;
          const nextX = currentX + (Math.random() - 0.5) * size * 0.6;
          ctx.lineTo(nextX, nextY);
          currentX = nextX;
          currentY = nextY;
        }
        
        ctx.stroke();
        
        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.stroke();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        // Energy glow
        ctx.shadowBlur = this.glowSize;
        ctx.shadowColor = this.color;

        // Draw trail
        if (this.trail.length > 1) {
          ctx.globalAlpha = this.opacity * 0.3;
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.currentSize;
          ctx.lineCap = 'round';
          
          ctx.beginPath();
          ctx.moveTo(this.trail[0].x - this.x, this.trail[0].y - this.y);
          for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x - this.x, this.trail[i].y - this.y);
          }
          ctx.stroke();
          
          ctx.globalAlpha = this.opacity;
        }

        // Draw based on type
        switch (this.type) {
          case 'lightning':
            this.drawLightning();
            break;
          case 'fire':
            this.drawFire();
            break;
          case 'spark':
            this.drawSpark();
            break;
          case 'comet':
            this.drawComet();
            break;
          case 'pulse':
            this.drawPulse();
            break;
          case 'bolt':
            this.drawBolt();
            break;
        }

        ctx.restore();
      }
    }

    // Create particles
    const particles = Array.from({ length: particleCount }, () => new EnergyParticle());

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
      {/* Canvas for animated energy particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.65 }}
      />

      {/* Floating hot deal symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`deal-${i}`}
            className="absolute text-3xl font-bold"
            style={{
              left: `${(i * 8 + 3) % 95}%`,
              top: `${(i * 10 + 5) % 90}%`,
              color: ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6'][i % 6],
              opacity: 0.15,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 15, 0],
              rotate: [0, 360],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 7 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          >
            {['%', '🔥', '⚡', '💥', '🎯', '✨', '💰', '🏷️', '⭐', '🎁', '💎', '🌟'][i]}
          </motion.div>
        ))}
      </div>

      {/* Hot energy orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`hot-orb-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: '450px',
              height: '450px',
              background: `radial-gradient(circle, ${['#ef4444', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6'][i]}18, transparent)`,
              left: `${i * 20}%`,
              top: `${i * 15}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, 70, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 8 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Floating explosive shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`explosion-${i}`}
            className="absolute"
            style={{
              left: `${12 + i * 12}%`,
              top: `${8 + i * 11}%`,
            }}
            animate={{
              y: [0, -22, 0],
              rotate: [0, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 6 + i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.25,
            }}
          >
            <div
              className="w-10 h-10 relative"
              style={{
                background: `conic-gradient(from 0deg, ${['#ef4444', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444', '#f97316'][i]}, transparent)`,
                borderRadius: '50%',
                boxShadow: `0 0 30px ${['#ef4444', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444', '#f97316'][i]}88`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Energy streaks */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`streak-${i}`}
            className="absolute"
            style={{
              left: `${15 + i * 18}%`,
              top: `${12 + i * 16}%`,
              width: '3px',
              height: '80px',
              background: `linear-gradient(to bottom, ${['#ef4444', '#f97316', '#eab308', '#06b6d4', '#ec4899'][i]}, transparent)`,
              boxShadow: `0 0 20px ${['#ef4444', '#f97316', '#eab308', '#06b6d4', '#ec4899'][i]}`,
              transform: `rotate(${i * 30}deg)`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.7, 0.3],
              scaleY: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + i * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default EnergyParticles;
