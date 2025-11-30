import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

const CursorTrail = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const { theme } = useSelector((state) => state.ui);

  // Only show on magical theme
  const isEnabled = theme === 'magical';

  // Particle colors based on magical theme
  const colors = [
    '#8b5cf6', // Purple
    '#a78bfa', // Light Purple
    '#c4b5fd', // Lavender
    '#3b82f6', // Blue
    '#60a5fa', // Light Blue
    '#06b6d4', // Cyan
    '#22d3ee', // Light Cyan
    '#f472b6', // Pink
    '#fbbf24', // Gold
    '#ffffff', // White sparkle
  ];

  // Particle class
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 3;
      this.speedX = (Math.random() - 0.5) * 3;
      this.speedY = (Math.random() - 0.5) * 3;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
      this.shape = Math.floor(Math.random() * 3); // 0: circle, 1: star, 2: sparkle
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += 0.05; // Gravity
      this.life -= this.decay;
      this.size *= 0.98;
      this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
      if (this.life <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.life;

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;

      ctx.fillStyle = this.color;
      ctx.beginPath();

      if (this.shape === 0) {
        // Circle
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.shape === 1) {
        // Star
        this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2);
      } else {
        // Sparkle/Diamond
        this.drawSparkle(ctx, 0, 0, this.size);
      }

      ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = (Math.PI / 2) * 3;
      let step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }

      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    }

    drawSparkle(ctx, x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.3, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.3, y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x, y + size * 0.3);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y - size * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }

  const handleMouseMove = useCallback((e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };

    // Add new particles on mouse move
    if (isEnabled) {
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push(
          new Particle(
            e.clientX + (Math.random() - 0.5) * 10,
            e.clientY + (Math.random() - 0.5) * 10
          )
        );
      }

      // Limit particles
      if (particlesRef.current.length > 100) {
        particlesRef.current = particlesRef.current.slice(-100);
      }
    }
  }, [isEnabled]);

  const handleClick = useCallback((e) => {
    if (!isEnabled) return;

    // Burst of particles on click
    for (let i = 0; i < 20; i++) {
      const particle = new Particle(e.clientX, e.clientY);
      particle.speedX = (Math.random() - 0.5) * 8;
      particle.speedY = (Math.random() - 0.5) * 8;
      particle.size = Math.random() * 12 + 5;
      particlesRef.current.push(particle);
    }
  }, [isEnabled]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.update();
      particle.draw(ctx);
      return particle.life > 0 && particle.size > 0.5;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Start animation
    if (isEnabled) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isEnabled, handleMouseMove, handleClick, animate]);

  // Don't render if not magical theme
  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        mixBlendMode: 'screen',
      }}
    />
  );
};

export default CursorTrail;
