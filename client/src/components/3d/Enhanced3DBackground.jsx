import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Enhanced3DBackground = ({ intensity = 'medium', colorScheme = 'purple' }) => {
  const canvasRef = useRef(null);

  // Color schemes
  const colors = {
    purple: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    blue: ['#00d4ff', '#0099ff', '#0066ff', '#4facfe'],
    green: ['#11998e', '#38ef7d', '#00d4aa', '#00b894'],
    pink: ['#f857a6', '#ff5858', '#fd79a8', '#fdcb6e'],
    gradient: ['#667eea', '#f093fb', '#00d4ff', '#00b894']
  };

  const selectedColors = colors[colorScheme] || colors.purple;

  // Number of cubes based on intensity
  const cubeCount = intensity === 'low' ? 8 : intensity === 'high' ? 20 : 15;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Cube class with enhanced properties
    class Cube {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.initialY = this.y;
        this.size = Math.random() * 60 + 30;
        this.rotation = Math.random() * 360;
        this.color = selectedColors[Math.floor(Math.random() * selectedColors.length)];
        this.opacity = Math.random() * 0.15 + 0.1;
        
        // Randomly assign behavior: rotate or float
        this.behavior = Math.random() > 0.5 ? 'rotate' : 'float';
        
        if (this.behavior === 'rotate') {
          this.rotationSpeed = (Math.random() - 0.5) * 0.15; // Very slow rotation
          this.floatSpeed = 0;
          this.floatAmount = 0;
        } else {
          this.rotationSpeed = 0;
          this.floatSpeed = 0.005 + Math.random() * 0.005; // Very slow float
          this.floatAmount = 10 + Math.random() * 10; // Small float range
        }
        
        this.floatPhase = Math.random() * Math.PI * 2;
      }

      update() {
        if (this.behavior === 'rotate') {
          // Only rotate slowly
          this.rotation += this.rotationSpeed;
        } else {
          // Only float up and down very slowly
          this.floatPhase += this.floatSpeed;
          this.y = this.initialY + Math.sin(this.floatPhase) * this.floatAmount;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color + '44';

        // Draw 3D-looking cube with gradient
        const gradient = ctx.createLinearGradient(
          -this.size / 2,
          -this.size / 2,
          this.size / 2,
          this.size / 2
        );
        gradient.addColorStop(0, this.color + '55');
        gradient.addColorStop(0.5, this.color + '33');
        gradient.addColorStop(1, this.color + '22');

        // Front face
        ctx.fillStyle = gradient;
        ctx.fillRect(
          -this.size / 2,
          -this.size / 2,
          this.size,
          this.size
        );

        // Side face (3D effect)
        ctx.fillStyle = this.color + '22';
        ctx.beginPath();
        ctx.moveTo(this.size / 2, -this.size / 2);
        ctx.lineTo(this.size / 2 + 15, -this.size / 2 - 15);
        ctx.lineTo(this.size / 2 + 15, this.size / 2 - 15);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.fill();

        // Top face (3D effect)
        ctx.fillStyle = this.color + '11';
        ctx.beginPath();
        ctx.moveTo(-this.size / 2, -this.size / 2);
        ctx.lineTo(-this.size / 2 + 15, -this.size / 2 - 15);
        ctx.lineTo(this.size / 2 + 15, -this.size / 2 - 15);
        ctx.lineTo(this.size / 2, -this.size / 2);
        ctx.closePath();
        ctx.fill();

        // Border glow
        ctx.strokeStyle = this.color + '66';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          -this.size / 2,
          -this.size / 2,
          this.size,
          this.size
        );

        ctx.restore();
      }
    }

    // Create cubes
    const cubes = Array.from({ length: cubeCount }, () => new Cube());

    // Animation loop
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      cubes.forEach((cube) => {
        cube.update();
        cube.draw();
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
  }, [cubeCount, selectedColors]);

  return (
    <>
      {/* Canvas for animated cubes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* Additional static geometric shapes for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          >
            <div
              className="w-24 h-24 rounded-lg backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${selectedColors[0]}22, ${selectedColors[1]}22)`,
                border: `2px solid ${selectedColors[Math.floor(Math.random() * selectedColors.length)]}44`,
                boxShadow: `0 0 30px ${selectedColors[i % selectedColors.length]}44`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-64 h-64 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${selectedColors[i]}44, transparent)`,
              left: `${20 + i * 30}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8 + i * 2,
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

export default Enhanced3DBackground;
