import React from 'react';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

const Button = ({
  children,
  variant = 'neon',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';

  // Magical variant styles
  const variants = {
    neon: `
      px-8 py-4 rounded-xl
      bg-gradient-to-r from-purple-600/20 to-blue-600/20
      border-2 border-purple-500
      text-purple-300
      hover:border-cyan-400 hover:text-cyan-300
      hover:shadow-[0_0_30px_rgba(6,182,212,0.5),0_0_60px_rgba(139,92,246,0.3)]
      active:scale-95
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500
    `,
    
    '3d': `
      px-8 py-4 rounded-xl
      bg-gradient-to-br from-purple-600 to-blue-600
      text-white font-black
      shadow-[0_5px_0_rgb(88,28,135),0_10px_20px_rgba(139,92,246,0.4)]
      hover:shadow-[0_7px_0_rgb(88,28,135),0_15px_30px_rgba(139,92,246,0.6)]
      hover:translate-y-[-2px]
      active:translate-y-[4px] active:shadow-[0_1px_0_rgb(88,28,135),0_5px_10px_rgba(139,92,246,0.3)]
    `,
    
    holographic: `
      px-8 py-4 rounded-xl
      bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-cyan-600/30
      backdrop-blur-xl
      border border-white/20
      text-white
      hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)]
      hover:border-white/40
      hover:scale-105
      before:absolute before:inset-0 before:bg-gradient-to-r 
      before:from-purple-600/20 before:via-blue-600/20 before:to-cyan-600/20
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
    `,
    
    glass: `
      px-8 py-4 rounded-xl
      backdrop-blur-xl bg-white/5
      border border-white/10
      text-purple-300
      hover:bg-white/10 hover:border-white/20
      hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)]
      hover:scale-[1.02]
    `,
    
    cyber: `
      px-8 py-4 rounded-none
      bg-gradient-to-r from-purple-900/50 to-blue-900/50
      border-2 border-purple-500
      text-cyan-300 font-mono
      clip-path-polygon-[0_0,100%_0,95%_100%,5%_100%]
      hover:bg-gradient-to-r hover:from-purple-800/50 hover:to-blue-800/50
      hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]
      hover:translate-x-1
      relative
      after:absolute after:top-0 after:left-0 after:w-full after:h-[2px]
      after:bg-gradient-to-r after:from-transparent after:via-cyan-400 after:to-transparent
      after:opacity-0 hover:after:opacity-100 after:transition-opacity
    `,
    
    outline: `
      px-8 py-4 rounded-xl
      border-2 border-purple-500
      text-purple-400
      hover:bg-purple-500/10 hover:border-purple-400
      hover:text-purple-300
      hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
      active:scale-95
    `,
    
    ghost: `
      px-6 py-3 rounded-lg
      text-purple-400
      hover:bg-purple-500/10
      hover:text-purple-300
      active:scale-95
    `,
    
    danger: `
      px-8 py-4 rounded-xl
      bg-gradient-to-br from-red-600 to-pink-600
      text-white font-bold
      shadow-[0_5px_0_rgb(127,29,29),0_10px_20px_rgba(220,38,38,0.4)]
      hover:shadow-[0_7px_0_rgb(127,29,29),0_15px_30px_rgba(220,38,38,0.6)]
      hover:translate-y-[-2px]
      active:translate-y-[4px]
    `,
    
    success: `
      px-8 py-4 rounded-xl
      bg-gradient-to-br from-green-600 to-emerald-600
      text-white font-bold
      shadow-[0_5px_0_rgb(5,46,22),0_10px_20px_rgba(34,197,94,0.4)]
      hover:shadow-[0_7px_0_rgb(5,46,22),0_15px_30px_rgba(34,197,94,0.6)]
      hover:translate-y-[-2px]
      active:translate-y-[4px]
    `,
    
    icon: `
      p-3 rounded-full
      hover:bg-purple-500/10
      text-purple-400 hover:text-purple-300
      hover:scale-110 hover:rotate-6
      active:scale-95
    `,
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const classes = `
    ${baseStyles}
    ${variants[variant] || variants.neon}
    ${variant !== 'icon' ? sizes[size] : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const iconSpacing = size === 'xs' || size === 'sm' ? 'space-x-1' : 'space-x-2';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      whileHover={{ scale: variant === 'icon' ? 1.1 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <FiLoader className="text-xl" />
          </motion.div>
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${variant === 'icon' ? 'text-xl' : 'text-lg'} ${children ? 'mr-2' : ''}`} />
          )}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && (
            <Icon className={`text-lg ${children ? 'ml-2' : ''}`} />
          )}
        </>
      )}
    </motion.button>
  );
};

// Specialized button variants
export const NeonButton = (props) => <Button variant="neon" {...props} />;
export const Button3D = (props) => <Button variant="3d" {...props} />;
export const HolographicButton = (props) => <Button variant="holographic" {...props} />;
export const GlassButton = (props) => <Button variant="glass" {...props} />;
export const CyberButton = (props) => <Button variant="cyber" {...props} />;

export default Button;
