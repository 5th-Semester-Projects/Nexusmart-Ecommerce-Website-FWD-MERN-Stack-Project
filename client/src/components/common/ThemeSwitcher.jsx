import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiStar, FiCheck } from 'react-icons/fi';
import { setTheme } from '../../redux/slices/uiSlice';

const themes = [
  {
    id: 'magical',
    name: 'Magical',
    icon: FiStar,
    description: 'Starry night with glowing effects',
    colors: ['#8b5cf6', '#3b82f6', '#06b6d4'],
  },
  {
    id: 'light',
    name: 'Light',
    icon: FiSun,
    description: 'Clean and bright interface',
    colors: ['#f8fafc', '#e2e8f0', '#7c3aed'],
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: FiMoon,
    description: 'Easy on the eyes',
    colors: ['#0f0f0f', '#171717', '#a78bfa'],
  },
];

const ThemeSwitcher = ({ variant = 'dropdown' }) => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.ui?.theme || 'magical');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (themeId) => {
    dispatch(setTheme(themeId));
    setIsOpen(false);
  };

  const currentThemeData = themes.find((t) => t.id === currentTheme) || themes[0];
  const CurrentIcon = currentThemeData.icon;

  // Simple button variant - cycles through themes
  if (variant === 'button') {
    const nextTheme = () => {
      const currentIndex = themes.findIndex((t) => t.id === currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      dispatch(setTheme(themes[nextIndex].id));
    };

    return (
      <motion.button
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.95 }}
        onClick={nextTheme}
        className="flex items-center justify-center w-10 h-10 rounded-xl
                 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30
                 text-purple-300 hover:text-cyan-400 transition-all duration-300"
        title={`Current: ${currentThemeData.name} - Click to switch`}
      >
        <CurrentIcon className="text-xl" />
      </motion.button>
    );
  }

  // Dropdown variant - shows all options
  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl
                 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30
                 text-purple-300 hover:text-cyan-400 transition-all duration-300"
      >
        <CurrentIcon className="text-lg" />
        <span className="hidden sm:inline text-sm font-medium">{currentThemeData.name}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 z-50
                       bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 
                       rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden"
              style={{ background: 'var(--bg-card, rgba(15, 15, 35, 0.95))' }}
            >
              <div className="p-3 border-b border-purple-500/20">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #fff)' }}>
                  Choose Theme
                </p>
              </div>
              
              <div className="p-2">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  const isActive = currentTheme === theme.id;
                  
                  return (
                    <motion.button
                      key={theme.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-purple-500/20 border border-purple-500/40' 
                          : 'hover:bg-purple-500/10 border border-transparent'
                        }`}
                    >
                      {/* Theme Colors Preview */}
                      <div className="flex -space-x-1">
                        {theme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-gray-800"
                            style={{ backgroundColor: color, zIndex: 3 - i }}
                          />
                        ))}
                      </div>
                      
                      {/* Theme Info */}
                      <div className="flex-1 text-left">
                        <p className="font-medium" style={{ color: 'var(--text-primary, #fff)' }}>
                          {theme.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted, #a78bfa)' }}>
                          {theme.description}
                        </p>
                      </div>
                      
                      {/* Check Icon */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 
                                   flex items-center justify-center"
                        >
                          <FiCheck className="text-white text-sm" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
