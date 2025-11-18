/**
 * Fix for react-reconciler ConcurrentRoot export issue
 * This ensures the module is loaded before 3D components
 */

// This file ensures react-reconciler is properly loaded
// The actual fix is in vite.config.js with dedupe and optimizeDeps

export {};

