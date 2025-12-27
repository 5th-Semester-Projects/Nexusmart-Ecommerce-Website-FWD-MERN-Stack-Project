import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMoon, FiSun, FiMonitor, FiDroplet, FiZap, FiSettings } from 'react-icons/fi';

/**
 * Advanced Theme System with Multiple Theme Options
 * Supports light, dark, system, and custom themes with color variants
 */

// Theme configurations
const themes = {
  light: {
    name: 'Light',
    icon: FiSun,
    colors: {
      background: '#ffffff',
      surface: '#f8fafc',
      primary: '#6366f1',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b'
    }
  },
  dark: {
    name: 'Dark',
    icon: FiMoon,
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#818cf8',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#34d399',
      error: '#f87171',
      warning: '#fbbf24'
    }
  },
  midnight: {
    name: 'Midnight Blue',
    icon: FiMoon,
    colors: {
      background: '#0a0e1a',
      surface: '#111827',
      primary: '#3b82f6',
      text: '#f1f5f9',
      textSecondary: '#9ca3af',
      border: '#1f2937',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b'
    }
  },
  nature: {
    name: 'Nature Green',
    icon: FiDroplet,
    colors: {
      background: '#f0fdf4',
      surface: '#dcfce7',
      primary: '#16a34a',
      text: '#14532d',
      textSecondary: '#166534',
      border: '#bbf7d0',
      success: '#22c55e',
      error: '#dc2626',
      warning: '#eab308'
    }
  },
  ocean: {
    name: 'Ocean Blue',
    icon: FiDroplet,
    colors: {
      background: '#f0f9ff',
      surface: '#e0f2fe',
      primary: '#0284c7',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706'
    }
  },
  sunset: {
    name: 'Sunset Orange',
    icon: FiZap,
    colors: {
      background: '#fff7ed',
      surface: '#ffedd5',
      primary: '#ea580c',
      text: '#7c2d12',
      textSecondary: '#9a3412',
      border: '#fed7aa',
      success: '#16a34a',
      error: '#dc2626',
      warning: '#d97706'
    }
  },
  purple: {
    name: 'Royal Purple',
    icon: FiZap,
    colors: {
      background: '#faf5ff',
      surface: '#f3e8ff',
      primary: '#9333ea',
      text: '#581c87',
      textSecondary: '#7e22ce',
      border: '#e9d5ff',
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706'
    }
  },
  neon: {
    name: 'Neon Cyberpunk',
    icon: FiZap,
    colors: {
      background: '#0a0a0a',
      surface: '#171717',
      primary: '#f0abfc',
      text: '#fafafa',
      textSecondary: '#a3a3a3',
      border: '#262626',
      success: '#4ade80',
      error: '#f87171',
      warning: '#facc15'
    }
  },
  contrast: {
    name: 'High Contrast',
    icon: FiSettings,
    colors: {
      background: '#000000',
      surface: '#1a1a1a',
      primary: '#ffff00',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#ffffff',
      success: '#00ff00',
      error: '#ff0000',
      warning: '#ffff00'
    }
  }
};

// Primary color variants
const colorVariants = {
  indigo: { primary: '#6366f1', name: 'Indigo' },
  blue: { primary: '#3b82f6', name: 'Blue' },
  green: { primary: '#10b981', name: 'Emerald' },
  red: { primary: '#ef4444', name: 'Red' },
  pink: { primary: '#ec4899', name: 'Pink' },
  purple: { primary: '#8b5cf6', name: 'Purple' },
  orange: { primary: '#f97316', name: 'Orange' },
  teal: { primary: '#14b8a6', name: 'Teal' },
  cyan: { primary: '#06b6d4', name: 'Cyan' },
  yellow: { primary: '#eab308', name: 'Yellow' }
};

// Font families
const fontFamilies = {
  default: { name: 'System Default', value: 'system-ui, -apple-system, sans-serif' },
  inter: { name: 'Inter', value: "'Inter', sans-serif" },
  poppins: { name: 'Poppins', value: "'Poppins', sans-serif" },
  roboto: { name: 'Roboto', value: "'Roboto', sans-serif" },
  openSans: { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  mono: { name: 'Monospace', value: "'Fira Code', monospace" }
};

// Font sizes
const fontSizes = {
  small: { name: 'Small', scale: 0.875 },
  medium: { name: 'Medium', scale: 1 },
  large: { name: 'Large', scale: 1.125 },
  xlarge: { name: 'Extra Large', scale: 1.25 }
};

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => 
    localStorage.getItem('theme') || 'magical'
  );
  const [primaryColor, setPrimaryColor] = useState(() =>
    localStorage.getItem('primaryColor') || 'indigo'
  );
  const [fontFamily, setFontFamily] = useState(() =>
    localStorage.getItem('fontFamily') || 'default'
  );
  const [fontSize, setFontSize] = useState(() =>
    localStorage.getItem('fontSize') || 'medium'
  );
  const [reducedMotion, setReducedMotion] = useState(() =>
    localStorage.getItem('reducedMotion') === 'true'
  );
  const [highContrast, setHighContrast] = useState(() =>
    localStorage.getItem('highContrast') === 'true'
  );

  // Apply theme
  useEffect(() => {
    const theme = themes[currentTheme] || themes.light;
    const color = colorVariants[primaryColor] || colorVariants.indigo;
    const font = fontFamilies[fontFamily] || fontFamilies.default;
    const size = fontSizes[fontSize] || fontSizes.medium;

    const root = document.documentElement;

    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Override primary color if custom
    if (currentTheme !== 'contrast') {
      root.style.setProperty('--color-primary', color.primary);
    }

    // Apply font
    root.style.setProperty('--font-family', font.value);
    root.style.setProperty('--font-scale', size.scale);

    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(
      ['dark', 'midnight', 'neon', 'contrast'].includes(currentTheme) ? 'dark' : 'light'
    );

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // High contrast
    if (highContrast || currentTheme === 'contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Store preferences
    localStorage.setItem('theme', currentTheme);
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('reducedMotion', reducedMotion);
    localStorage.setItem('highContrast', highContrast);

  }, [currentTheme, primaryColor, fontFamily, fontSize, reducedMotion, highContrast]);

  // System theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (currentTheme === 'system') {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme]);

  const value = {
    currentTheme,
    setCurrentTheme,
    primaryColor,
    setPrimaryColor,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    themes,
    colorVariants,
    fontFamilies,
    fontSizes,
    isDark: ['dark', 'midnight', 'neon', 'contrast'].includes(currentTheme)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Selector Component
export const ThemeSelector = ({ onClose }) => {
  const {
    currentTheme,
    setCurrentTheme,
    primaryColor,
    setPrimaryColor,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    themes,
    colorVariants,
    fontFamilies,
    fontSizes
  } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
          <FiSettings className="text-primary-600" />
          Theme Settings
        </h2>

        {/* Theme Selection */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold dark:text-white mb-4">Theme</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Object.entries(themes).map(([key, theme]) => {
              const Icon = theme.icon;
              return (
                <button
                  key={key}
                  onClick={() => setCurrentTheme(key)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentTheme === key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <Icon className="text-white text-xl" />
                  </div>
                  <p className="text-sm font-medium text-center dark:text-white">{theme.name}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Primary Color */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold dark:text-white mb-4">Accent Color</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(colorVariants).map(([key, color]) => (
              <button
                key={key}
                onClick={() => setPrimaryColor(key)}
                className={`w-10 h-10 rounded-full transition-all ${
                  primaryColor === key ? 'ring-4 ring-offset-2 ring-gray-300' : ''
                }`}
                style={{ backgroundColor: color.primary }}
                title={color.name}
              />
            ))}
          </div>
        </section>

        {/* Font Settings */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold dark:text-white mb-4">Font</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(fontFamilies).map(([key, font]) => (
              <button
                key={key}
                onClick={() => setFontFamily(key)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  fontFamily === key
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                style={{ fontFamily: font.value }}
              >
                <p className="font-medium dark:text-white">{font.name}</p>
                <p className="text-sm text-gray-500">Aa Bb Cc</p>
              </button>
            ))}
          </div>
        </section>

        {/* Font Size */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold dark:text-white mb-4">Font Size</h3>
          <div className="flex gap-3">
            {Object.entries(fontSizes).map(([key, size]) => (
              <button
                key={key}
                onClick={() => setFontSize(key)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  fontSize === key
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="dark:text-white" style={{ fontSize: `${size.scale}rem` }}>
                  {size.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Accessibility Options */}
        <section>
          <h3 className="text-lg font-semibold dark:text-white mb-4">Accessibility</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="dark:text-white">Reduce Motion</span>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="dark:text-white">High Contrast</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </section>

        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
};

export default { ThemeProvider, useTheme, ThemeSelector };
