import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiType, FiVolume2, FiNavigation, FiSettings, FiX } from 'react-icons/fi';

/**
 * Accessibility Context and Tools
 * WCAG 2.1 AA/AAA compliance features
 */

// Accessibility features
const defaultSettings = {
  // Visual
  highContrast: false,
  largeText: false,
  dyslexiaFont: false,
  reduceMotion: false,
  colorBlindMode: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
  
  // Audio
  screenReaderOptimized: false,
  audioDescriptions: false,
  
  // Navigation
  keyboardNavigation: true,
  focusHighlight: true,
  skipLinks: true,
  
  // Reading
  textSpacing: 'normal', // 'normal', 'wide', 'wider'
  lineHeight: 'normal', // 'normal', 'tall', 'taller'
  
  // Interaction
  enlargeCursor: false,
  clickAssist: false, // Larger click targets
  autoReadContent: false
};

// Create context
const AccessibilityContext = createContext();

// Provider component
export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('accessibility');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const [showPanel, setShowPanel] = useState(false);
  const announcer = useRef(null);

  // Apply settings
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.style.setProperty('--font-scale', '1.25');
      root.classList.add('large-text');
    } else {
      root.style.removeProperty('--font-scale');
      root.classList.remove('large-text');
    }

    // Dyslexia font
    if (settings.dyslexiaFont) {
      root.style.setProperty('--font-family', "'OpenDyslexic', sans-serif");
      root.classList.add('dyslexia-font');
    } else {
      root.style.removeProperty('--font-family');
      root.classList.remove('dyslexia-font');
    }

    // Reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Color blind modes
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(settings.colorBlindMode);
    }

    // Text spacing
    const spacingMap = {
      normal: '0',
      wide: '0.05em',
      wider: '0.1em'
    };
    root.style.setProperty('--letter-spacing', spacingMap[settings.textSpacing]);

    // Line height
    const lineHeightMap = {
      normal: '1.5',
      tall: '1.75',
      taller: '2'
    };
    root.style.setProperty('--line-height', lineHeightMap[settings.lineHeight]);

    // Focus highlight
    if (settings.focusHighlight) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Enlarge cursor
    if (settings.enlargeCursor) {
      body.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 24 24\' fill=\'black\'%3E%3Cpath d=\'M7 2l12 11.5-5.5 1.5 3.5 7-2 1-3.5-7L7 20V2z\'/%3E%3C/svg%3E"), auto';
    } else {
      body.style.cursor = '';
    }

    // Click assist
    if (settings.clickAssist) {
      root.classList.add('click-assist');
    } else {
      root.classList.remove('click-assist');
    }

    // Save settings
    localStorage.setItem('accessibility', JSON.stringify(settings));

  }, [settings]);

  // Update a single setting
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset all settings
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  // Screen reader announcement
  const announce = useCallback((message, priority = 'polite') => {
    if (announcer.current) {
      announcer.current.setAttribute('aria-live', priority);
      announcer.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcer.current) {
          announcer.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  // Keyboard navigation handler
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeydown = (e) => {
      // Alt + A to toggle accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowPanel(prev => !prev);
      }

      // Escape to close panel
      if (e.key === 'Escape' && showPanel) {
        setShowPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [settings.keyboardNavigation, showPanel]);

  const value = {
    settings,
    updateSetting,
    resetSettings,
    announce,
    showPanel,
    setShowPanel
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Skip links */}
      {settings.skipLinks && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
      )}

      {/* Screen reader announcer */}
      <div
        ref={announcer}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {children}

      {/* Accessibility floating button */}
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
        aria-label="Open accessibility settings"
        title="Accessibility Settings (Alt + A)"
      >
        <FiEye className="text-xl" />
      </button>

      {/* Accessibility panel */}
      <AnimatePresence>
        {showPanel && (
          <AccessibilityPanel 
            settings={settings}
            updateSetting={updateSetting}
            resetSettings={resetSettings}
            onClose={() => setShowPanel(false)}
          />
        )}
      </AnimatePresence>
    </AccessibilityContext.Provider>
  );
};

// Hook
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Panel Component
const AccessibilityPanel = ({ settings, updateSetting, resetSettings, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-title"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h2 id="a11y-title" className="text-xl font-bold dark:text-white flex items-center gap-2">
          <FiSettings className="text-primary-600" />
          Accessibility
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Close accessibility panel"
        >
          <FiX className="text-xl text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Visual Section */}
        <section>
          <h3 className="flex items-center gap-2 text-lg font-semibold dark:text-white mb-4">
            <FiEye className="text-primary-600" />
            Visual
          </h3>
          <div className="space-y-3">
            <ToggleSetting
              label="High Contrast"
              description="Increase color contrast for better visibility"
              checked={settings.highContrast}
              onChange={(v) => updateSetting('highContrast', v)}
            />
            <ToggleSetting
              label="Large Text"
              description="Increase text size throughout the site"
              checked={settings.largeText}
              onChange={(v) => updateSetting('largeText', v)}
            />
            <ToggleSetting
              label="Dyslexia-Friendly Font"
              description="Use OpenDyslexic font for easier reading"
              checked={settings.dyslexiaFont}
              onChange={(v) => updateSetting('dyslexiaFont', v)}
            />
            <ToggleSetting
              label="Reduce Motion"
              description="Minimize animations and transitions"
              checked={settings.reduceMotion}
              onChange={(v) => updateSetting('reduceMotion', v)}
            />

            <div className="py-2">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Color Blind Mode
              </label>
              <select
                value={settings.colorBlindMode}
                onChange={(e) => updateSetting('colorBlindMode', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Blind)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Reading Section */}
        <section>
          <h3 className="flex items-center gap-2 text-lg font-semibold dark:text-white mb-4">
            <FiType className="text-primary-600" />
            Reading
          </h3>
          <div className="space-y-3">
            <div className="py-2">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Letter Spacing
              </label>
              <select
                value={settings.textSpacing}
                onChange={(e) => updateSetting('textSpacing', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              >
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
                <option value="wider">Wider</option>
              </select>
            </div>

            <div className="py-2">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Line Height
              </label>
              <select
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              >
                <option value="normal">Normal</option>
                <option value="tall">Tall</option>
                <option value="taller">Taller</option>
              </select>
            </div>
          </div>
        </section>

        {/* Navigation Section */}
        <section>
          <h3 className="flex items-center gap-2 text-lg font-semibold dark:text-white mb-4">
            <FiNavigation className="text-primary-600" />
            Navigation
          </h3>
          <div className="space-y-3">
            <ToggleSetting
              label="Enhanced Keyboard Navigation"
              description="Improved focus indicators and tab navigation"
              checked={settings.keyboardNavigation}
              onChange={(v) => updateSetting('keyboardNavigation', v)}
            />
            <ToggleSetting
              label="Focus Highlight"
              description="Show visible focus outline on interactive elements"
              checked={settings.focusHighlight}
              onChange={(v) => updateSetting('focusHighlight', v)}
            />
            <ToggleSetting
              label="Skip Links"
              description="Show skip to content links for keyboard users"
              checked={settings.skipLinks}
              onChange={(v) => updateSetting('skipLinks', v)}
            />
            <ToggleSetting
              label="Enlarge Cursor"
              description="Use a larger mouse cursor"
              checked={settings.enlargeCursor}
              onChange={(v) => updateSetting('enlargeCursor', v)}
            />
            <ToggleSetting
              label="Click Assist"
              description="Larger click targets for easier interaction"
              checked={settings.clickAssist}
              onChange={(v) => updateSetting('clickAssist', v)}
            />
          </div>
        </section>

        {/* Audio Section */}
        <section>
          <h3 className="flex items-center gap-2 text-lg font-semibold dark:text-white mb-4">
            <FiVolume2 className="text-primary-600" />
            Audio & Screen Readers
          </h3>
          <div className="space-y-3">
            <ToggleSetting
              label="Screen Reader Optimized"
              description="Enhanced ARIA labels and descriptions"
              checked={settings.screenReaderOptimized}
              onChange={(v) => updateSetting('screenReaderOptimized', v)}
            />
            <ToggleSetting
              label="Audio Descriptions"
              description="Read aloud product descriptions and content"
              checked={settings.audioDescriptions}
              onChange={(v) => updateSetting('audioDescriptions', v)}
            />
          </div>
        </section>

        {/* Reset Button */}
        <button
          onClick={resetSettings}
          className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </motion.div>
  );
};

// Toggle Setting Component
const ToggleSetting = ({ label, description, checked, onChange }) => (
  <label className="flex items-start justify-between gap-4 py-2 cursor-pointer">
    <div>
      <p className="font-medium dark:text-white">{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <div className="relative flex-shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </div>
    </div>
  </label>
);

export default { AccessibilityProvider, useAccessibility };
