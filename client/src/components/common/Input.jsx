import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  type = 'text',
  className = '',
  containerClassName = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const inputClasses = `
    w-full px-4 py-2.5 
    bg-gray-800/50 
    border ${error ? 'border-red-500' : 'border-purple-500/30'}
    rounded-xl 
    text-white 
    placeholder-purple-400/50
    focus:outline-none focus:ring-2 
    ${error ? 'focus:ring-red-500' : 'focus:ring-purple-500'}
    focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
    ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `;

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-purple-300 mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
            <Icon size={18} />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400">
            <Icon size={18} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1.5 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-purple-400/70">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
