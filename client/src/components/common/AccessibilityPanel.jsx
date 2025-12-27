import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSettings, FiType, FiEye, FiMoon, FiSun, FiVolume2,
  FiZoomIn, FiZoomOut, FiMousePointer, FiCheck, FiX,
  FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';

// Accessibility Context
const AccessibilityContext = createContext(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return {
      settings: {},
      updateSetting: () => {},
      announce: () => {}
    };
  }
  return context;
};

// Main Accessibility Provider
export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('accessibility_settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 'normal',
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      dyslexiaFont: false,
      focusIndicator: true,
      cursorSize: 'normal',
      lineSpacing: 'normal',
      wordSpacing: 'normal',
      colorBlindMode: 'none',
      autoplayMedia: true,
      captions: false,
      keyboardNav: true,
      textToSpeech: false
    };
  });

  const [announcement, setAnnouncement] = useState('');

  // Apply settings to document
  useEffect(() => {
    const html = document.documentElement;
    
    // Font size
    const fontSizes = { small: '14px', normal: '16px', large: '18px', xlarge: '20px' };
    html.style.fontSize = fontSizes[settings.fontSize] || '16px';
    
    // High contrast
    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }
    
    // Dyslexia font
    if (settings.dyslexiaFont) {
      html.classList.add('dyslexia-font');
    } else {
      html.classList.remove('dyslexia-font');
    }
    
    // Line spacing
    const lineSpacings = { compact: '1.3', normal: '1.6', relaxed: '2', loose: '2.5' };
    html.style.lineHeight = lineSpacings[settings.lineSpacing] || '1.6';
    
    // Word spacing
    const wordSpacings = { normal: '0', wide: '0.1em', wider: '0.2em', widest: '0.3em' };
    html.style.wordSpacing = wordSpacings[settings.wordSpacing] || '0';
    
    // Color blind mode
    html.dataset.colorBlindMode = settings.colorBlindMode;
    
    // Cursor size
    if (settings.cursorSize === 'large') {
      html.classList.add('large-cursor');
    } else {
      html.classList.remove('large-cursor');
    }
    
    // Focus indicator
    if (settings.focusIndicator) {
      html.classList.add('focus-visible');
    } else {
      html.classList.remove('focus-visible');
    }
    
    // Save to localStorage
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));
  }, [settings]);

  // Check for user preferences
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      updateSetting('reducedMotion', true);
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    // Already handled by theme context
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    announce(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} set to ${value}`);
  }, []);

  // Screen reader announcements
  const announce = useCallback((message, priority = 'polite') => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  // Text to speech
  const speak = useCallback((text) => {
    if (settings.textToSpeech && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [settings.textToSpeech]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, announce, speak }}>
      {children}
      
      {/* Screen reader live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};

// Accessibility Panel Component
const AccessibilityPanel = ({ isOpen, onClose }) => {
  const { settings, updateSetting, announce } = useAccessibility();
  const [activeTab, setActiveTab] = useState('vision');

  const tabs = [
    { id: 'vision', label: 'Vision', icon: FiEye },
    { id: 'motor', label: 'Motor', icon: FiMousePointer },
    { id: 'cognitive', label: 'Cognitive', icon: FiType },
    { id: 'audio', label: 'Audio', icon: FiVolume2 }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-800 z-50 shadow-xl overflow-y-auto"
            role="dialog"
            aria-labelledby="accessibility-title"
            aria-modal="true"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FiSettings className="text-white" />
                </div>
                <h2 id="accessibility-title" className="text-lg font-semibold dark:text-white">
                  Accessibility Settings
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close accessibility panel"
              >
                <FiX className="dark:text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Vision Settings */}
              {activeTab === 'vision' && (
                <div className="space-y-6">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium dark:text-white mb-3">
                      Text Size
                    </label>
                    <div className="flex gap-2">
                      {['small', 'normal', 'large', 'xlarge'].map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSetting('fontSize', size)}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                            settings.fontSize === size
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className={`dark:text-white ${
                            size === 'small' ? 'text-sm' :
                            size === 'normal' ? 'text-base' :
                            size === 'large' ? 'text-lg' : 'text-xl'
                          }`}>
                            Aa
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High Contrast */}
                  <SettingToggle
                    label="High Contrast Mode"
                    description="Increase contrast for better visibility"
                    value={settings.highContrast}
                    onChange={(v) => updateSetting('highContrast', v)}
                  />

                  {/* Color Blind Mode */}
                  <div>
                    <label className="block text-sm font-medium dark:text-white mb-3">
                      Color Blind Mode
                    </label>
                    <select
                      value={settings.colorBlindMode}
                      onChange={(e) => updateSetting('colorBlindMode', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="none">None</option>
                      <option value="protanopia">Protanopia (Red-blind)</option>
                      <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                      <option value="tritanopia">Tritanopia (Blue-blind)</option>
                      <option value="achromatopsia">Achromatopsia (Monochrome)</option>
                    </select>
                  </div>

                  {/* Cursor Size */}
                  <div>
                    <label className="block text-sm font-medium dark:text-white mb-3">
                      Cursor Size
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateSetting('cursorSize', 'normal')}
                        className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                          settings.cursorSize === 'normal'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <FiMousePointer className="mx-auto dark:text-white" size={16} />
                        <span className="text-xs dark:text-white mt-1">Normal</span>
                      </button>
                      <button
                        onClick={() => updateSetting('cursorSize', 'large')}
                        className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                          settings.cursorSize === 'large'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <FiMousePointer className="mx-auto dark:text-white" size={24} />
                        <span className="text-xs dark:text-white mt-1">Large</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Motor Settings */}
              {activeTab === 'motor' && (
                <div className="space-y-6">
                  <SettingToggle
                    label="Reduce Motion"
                    description="Minimize animations and transitions"
                    value={settings.reducedMotion}
                    onChange={(v) => updateSetting('reducedMotion', v)}
                  />

                  <SettingToggle
                    label="Keyboard Navigation"
                    description="Enable enhanced keyboard navigation"
                    value={settings.keyboardNav}
                    onChange={(v) => updateSetting('keyboardNav', v)}
                  />

                  <SettingToggle
                    label="Focus Indicators"
                    description="Show visible focus outlines"
                    value={settings.focusIndicator}
                    onChange={(v) => updateSetting('focusIndicator', v)}
                  />

                  {/* Keyboard Shortcuts Guide */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium dark:text-white mb-3">Keyboard Shortcuts</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { key: 'Tab', action: 'Navigate forward' },
                        { key: 'Shift + Tab', action: 'Navigate backward' },
                        { key: 'Enter / Space', action: 'Activate button' },
                        { key: 'Arrow Keys', action: 'Navigate within components' },
                        { key: 'Escape', action: 'Close dialog/menu' },
                        { key: '/', action: 'Focus search' }
                      ].map((shortcut, index) => (
                        <div key={index} className="flex justify-between">
                          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs dark:text-white">
                            {shortcut.key}
                          </kbd>
                          <span className="text-gray-600 dark:text-gray-300">{shortcut.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Cognitive Settings */}
              {activeTab === 'cognitive' && (
                <div className="space-y-6">
                  <SettingToggle
                    label="Dyslexia-Friendly Font"
                    description="Use OpenDyslexic font for easier reading"
                    value={settings.dyslexiaFont}
                    onChange={(v) => updateSetting('dyslexiaFont', v)}
                  />

                  {/* Line Spacing */}
                  <div>
                    <label className="block text-sm font-medium dark:text-white mb-3">
                      Line Spacing
                    </label>
                    <select
                      value={settings.lineSpacing}
                      onChange={(e) => updateSetting('lineSpacing', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="relaxed">Relaxed</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>

                  {/* Word Spacing */}
                  <div>
                    <label className="block text-sm font-medium dark:text-white mb-3">
                      Word Spacing
                    </label>
                    <select
                      value={settings.wordSpacing}
                      onChange={(e) => updateSetting('wordSpacing', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                      <option value="wider">Wider</option>
                      <option value="widest">Widest</option>
                    </select>
                  </div>

                  <SettingToggle
                    label="Screen Reader Optimized"
                    description="Enhance content for screen readers"
                    value={settings.screenReader}
                    onChange={(v) => updateSetting('screenReader', v)}
                  />
                </div>
              )}

              {/* Audio Settings */}
              {activeTab === 'audio' && (
                <div className="space-y-6">
                  <SettingToggle
                    label="Text to Speech"
                    description="Read page content aloud"
                    value={settings.textToSpeech}
                    onChange={(v) => updateSetting('textToSpeech', v)}
                  />

                  <SettingToggle
                    label="Video Captions"
                    description="Show captions for video content"
                    value={settings.captions}
                    onChange={(v) => updateSetting('captions', v)}
                  />

                  <SettingToggle
                    label="Autoplay Media"
                    description="Automatically play videos and audio"
                    value={settings.autoplayMedia}
                    onChange={(v) => updateSetting('autoplayMedia', v)}
                  />
                </div>
              )}

              {/* Reset Button */}
              <div className="pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => {
                    const defaults = {
                      fontSize: 'normal',
                      highContrast: false,
                      reducedMotion: false,
                      screenReader: false,
                      dyslexiaFont: false,
                      focusIndicator: true,
                      cursorSize: 'normal',
                      lineSpacing: 'normal',
                      wordSpacing: 'normal',
                      colorBlindMode: 'none',
                      autoplayMedia: true,
                      captions: false,
                      keyboardNav: true,
                      textToSpeech: false
                    };
                    Object.entries(defaults).forEach(([key, value]) => {
                      updateSetting(key, value);
                    });
                    announce('All settings reset to defaults');
                  }}
                  className="w-full py-3 border rounded-lg text-gray-600 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Reset All Settings
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Toggle Setting Component
const SettingToggle = ({ label, description, value, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium dark:text-white">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
          animate={{ x: value ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};

// Accessibility Button (Fixed Position)
export const AccessibilityButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 z-45 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <FiSettings size={20} />
      </button>
      
      <AccessibilityPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

// Skip Link Component
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
    >
      {children}
    </a>
  );
};

// Focus Trap Hook
export const useFocusTrap = (isActive) => {
  const containerRef = React.useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
};

export default AccessibilityPanel;
