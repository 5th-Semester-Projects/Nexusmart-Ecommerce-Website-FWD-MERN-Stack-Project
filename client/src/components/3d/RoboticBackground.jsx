import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const RoboticBackground = ({ intensity = 'medium', theme = 'tech' }) => {
  const canvasRef = useRef(null);

  // Theme configurations
  const themes = {
    tech: {
      colors: ['#00d4ff', '#0099ff', '#667eea', '#764ba2'],
      shapes: ['circuit', 'gear', 'chip']
    },
    neon: {
      colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec'],
      shapes: ['hexagon', 'triangle', 'circle']
    },
    cyber: {
      colors: ['#00ff41', '#39ff14', '#0ff0fc', '#bc13fe'],
      shapes: ['grid', 'line', 'dot']
    }
  };

  const currentTheme = themes[theme] || themes.tech;
  const elementCount = intensity === 'low' ? 6 : intensity === 'high' ? 15 : 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Robotic Element class
    class RoboticElement {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.initialY = this.y;
        this.size = Math.random() * 40 + 20;
        this.rotation = Math.random() * 360;
        this.color = currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)];
        this.opacity = Math.random() * 0.2 + 0.1;
        this.shape = currentTheme.shapes[Math.floor(Math.random() * currentTheme.shapes.length)];
        
        // Random behavior
        this.behavior = Math.random() > 0.6 ? 'rotate' : 'float';
        
        if (this.behavior === 'rotate') {
          this.rotationSpeed = (Math.random() - 0.5) * 0.2;
          this.floatSpeed = 0;
          this.floatAmount = 0;
        } else {
          this.rotationSpeed = 0;
          this.floatSpeed = 0.003 + Math.random() * 0.005;
          this.floatAmount = 8 + Math.random() * 12;
        }
        
        this.floatPhase = Math.random() * Math.PI * 2;
      }

      update() {
        if (this.behavior === 'rotate') {
          this.rotation += this.rotationSpeed;
        } else {
          this.floatPhase += this.floatSpeed;
          this.y = this.initialY + Math.sin(this.floatPhase) * this.floatAmount;
        }
      }

      drawCircuit() {
        // Circuit board pattern
        ctx.strokeStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(-this.size / 2, -this.size / 4);
        ctx.lineTo(this.size / 2, -this.size / 4);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-this.size / 2, this.size / 4);
        ctx.lineTo(this.size / 2, this.size / 4);
        ctx.stroke();
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(0, this.size / 2);
        ctx.stroke();
        
        // Connection points
        [-this.size / 4, 0, this.size / 4].forEach(x => {
          [-this.size / 4, this.size / 4].forEach(y => {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
            ctx.fill();
          });
        });
      }

      drawGear() {
        const teeth = 8;
        const outerRadius = this.size / 2;
        const innerRadius = this.size / 3;
        const toothHeight = 5;
        
        ctx.strokeStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = this.color + Math.floor(this.opacity * 0.3 * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
          const angle = (i * Math.PI) / teeth;
          const radius = i % 2 === 0 ? outerRadius : outerRadius + toothHeight;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawChip() {
        // Microchip design
        const chipSize = this.size;
        ctx.strokeStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = this.color + Math.floor(this.opacity * 0.2 * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        
        // Main body
        ctx.fillRect(-chipSize / 2, -chipSize / 2, chipSize, chipSize);
        ctx.strokeRect(-chipSize / 2, -chipSize / 2, chipSize, chipSize);
        
        // Pins on sides
        const pinCount = 4;
        const pinLength = 8;
        const pinSpacing = chipSize / (pinCount + 1);
        
        for (let i = 1; i <= pinCount; i++) {
          const offset = -chipSize / 2 + pinSpacing * i;
          // Left pins
          ctx.fillRect(-chipSize / 2 - pinLength, offset - 2, pinLength, 4);
          // Right pins
          ctx.fillRect(chipSize / 2, offset - 2, pinLength, 4);
          // Top pins
          ctx.fillRect(offset - 2, -chipSize / 2 - pinLength, 4, pinLength);
          // Bottom pins
          ctx.fillRect(offset - 2, chipSize / 2, 4, pinLength);
        }
        
        // Center grid
        ctx.strokeStyle = this.color + '40';
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(i * chipSize / 4, -chipSize / 4);
          ctx.lineTo(i * chipSize / 4, chipSize / 4);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(-chipSize / 4, i * chipSize / 4);
          ctx.lineTo(chipSize / 4, i * chipSize / 4);
          ctx.stroke();
        }
      }

      drawHexagon() {
        ctx.strokeStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = this.color + Math.floor(this.opacity * 0.15 * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = Math.cos(angle) * this.size / 2;
          const y = Math.sin(angle) * this.size / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      drawTriangle() {
        ctx.strokeStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = this.color + Math.floor(this.opacity * 0.15 * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      drawCircle() {
        ctx.strokeStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = this.color + Math.floor(this.opacity * 0.1 * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner circles
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawGrid() {
        const gridSize = this.size;
        const divisions = 4;
        
        ctx.strokeStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= divisions; i++) {
          const offset = (-gridSize / 2) + (i * gridSize / divisions);
          // Vertical lines
          ctx.beginPath();
          ctx.moveTo(offset, -gridSize / 2);
          ctx.lineTo(offset, gridSize / 2);
          ctx.stroke();
          
          // Horizontal lines
          ctx.beginPath();
          ctx.moveTo(-gridSize / 2, offset);
          ctx.lineTo(gridSize / 2, offset);
          ctx.stroke();
        }
      }

      drawLine() {
        ctx.strokeStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(-this.size / 2, 0);
        ctx.lineTo(this.size / 2, 0);
        ctx.stroke();
        
        // Endpoints
        ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(-this.size / 2, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.size / 2, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      drawDot() {
        ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        
        // Main dot
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Surrounding dots
        const satellites = 6;
        for (let i = 0; i < satellites; i++) {
          const angle = (i * Math.PI * 2) / satellites;
          const x = Math.cos(angle) * this.size / 2;
          const y = Math.sin(angle) * this.size / 2;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        switch (this.shape) {
          case 'circuit':
            this.drawCircuit();
            break;
          case 'gear':
            this.drawGear();
            break;
          case 'chip':
            this.drawChip();
            break;
          case 'hexagon':
            this.drawHexagon();
            break;
          case 'triangle':
            this.drawTriangle();
            break;
          case 'circle':
            this.drawCircle();
            break;
          case 'grid':
            this.drawGrid();
            break;
          case 'line':
            this.drawLine();
            break;
          case 'dot':
            this.drawDot();
            break;
        }

        ctx.restore();
      }
    }

    // Create elements
    const elements = Array.from({ length: elementCount }, () => new RoboticElement());

    // Animation loop
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elements.forEach((element) => {
        element.update();
        element.draw();
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
  }, [elementCount, currentTheme]);

  return (
    <>
      {/* Canvas for animated robotic elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.5 }}
      />

      {/* Additional floating icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`icon-${i}`}
            className="absolute text-4xl"
            style={{
              left: `${10 + i * 25}%`,
              top: `${15 + i * 20}%`,
              color: currentTheme.colors[i % currentTheme.colors.length],
              opacity: 0.1,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          >
            {['⚡', '🔧', '⚙️', '🤖'][i]}
          </motion.div>
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-96 h-96 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${currentTheme.colors[i]}22, transparent)`,
              left: `${i * 35}%`,
              top: `${i * 30}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </>
  );
};

export default RoboticBackground;
