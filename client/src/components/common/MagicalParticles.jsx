import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MagicalParticles = ({ density = 50, className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;
    let particles = [];
    let frameCount = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    
    // Throttle resize
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 200);
    };
    window.addEventListener('resize', handleResize);

    // Particle class with reduced calculations
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5; // Smaller particles
        this.speedX = Math.random() * 0.3 - 0.15; // Slower movement
        this.speedY = Math.random() * 0.3 - 0.15;
        this.color = this.getRandomColor();
        this.opacity = Math.random() * 0.4 + 0.1; // Lower opacity
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      getRandomColor() {
        const colors = [
          '139, 92, 246',  // Purple
          '59, 130, 246',  // Blue
          '236, 72, 153',  // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        // Pulse effect
        this.pulsePhase += this.pulseSpeed;
        this.currentOpacity = this.opacity + Math.sin(this.pulsePhase) * 0.3;
      }

      draw() {
        ctx.fillStyle = `rgba(${this.color}, ${this.currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color}, ${this.currentOpacity})`;
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < density; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();

    // Animation loop with frame skipping for performance
    const animate = () => {
      frameCount++;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Only draw connections every 3rd frame to reduce load
      if (frameCount % 3 === 0) {
        particles.forEach((particle, index) => {
          // Limit connection checks to nearby particles only
          for (let j = index + 1; j < Math.min(index + 5, particles.length); j++) {
            const dx = particles[j].x - particle.x;
            const dy = particles[j].y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) { // Reduced connection distance
              ctx.strokeStyle = `rgba(${particle.color}, ${0.05 * (1 - distance / 100)})`;
              ctx.lineWidth = 0.3;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

// Floating orbs component
export const FloatingOrbs = () => {
  const orbs = [
    { color: 'from-purple-500/20 to-pink-500/20', size: 'w-96 h-96', position: 'top-0 -right-48', delay: 0 },
    { color: 'from-blue-500/20 to-cyan-500/20', size: 'w-[30rem] h-[30rem]', position: 'bottom-0 -left-48', delay: 2 },
    { color: 'from-violet-500/20 to-purple-500/20', size: 'w-80 h-80', position: 'top-1/2 left-1/4', delay: 4 },
    { color: 'from-cyan-500/20 to-blue-500/20', size: 'w-72 h-72', position: 'bottom-1/4 right-1/4', delay: 6 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute ${orb.size} ${orb.position} bg-gradient-to-br ${orb.color} rounded-full blur-3xl`}
          animate={{
            x: [0, 100, 0, -100, 0],
            y: [0, -100, 0, 100, 0],
            scale: [1, 1.2, 1, 0.8, 1],
          }}
          transition={{
            duration: 20,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Shooting stars effect
export const ShootingStars = () => {
  const stars = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 8,
    duration: 2,
    top: `${Math.random() * 50}%`,
    left: `${Math.random() * 100}%`,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{ top: star.top, left: star.left }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: [0, 200],
            y: [0, 200],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 20,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-200 to-transparent w-20 h-[2px] blur-sm" />
        </motion.div>
      ))}
    </div>
  );
};

export default MagicalParticles;
