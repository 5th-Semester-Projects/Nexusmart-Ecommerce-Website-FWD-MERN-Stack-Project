/**
 * Performance monitoring utilities
 */

/**
 * Measure page load time
 */
export const measurePageLoad = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    console.log('Page Load Metrics:', {
      pageLoadTime: `${pageLoadTime}ms`,
      connectTime: `${connectTime}ms`,
      renderTime: `${renderTime}ms`,
    });

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'page_load',
        value: pageLoadTime,
        event_category: 'Performance',
      });
    }
  });
};

/**
 * Measure Core Web Vitals
 */
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  const measureLCP = () => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);

      if (window.gtag) {
        window.gtag('event', 'lcp', {
          value: lastEntry.renderTime || lastEntry.loadTime,
          event_category: 'Web Vitals',
        });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  };

  // First Input Delay (FID)
  const measureFID = () => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime);

        if (window.gtag) {
          window.gtag('event', 'fid', {
            value: entry.processingStart - entry.startTime,
            event_category: 'Web Vitals',
          });
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  };

  // Cumulative Layout Shift (CLS)
  const measureCLS = () => {
    let clsScore = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      }
      console.log('CLS:', clsScore);

      if (window.gtag) {
        window.gtag('event', 'cls', {
          value: clsScore,
          event_category: 'Web Vitals',
        });
      }
    }).observe({ entryTypes: ['layout-shift'] });
  };

  try {
    measureLCP();
    measureFID();
    measureCLS();
  } catch (error) {
    console.error('Web Vitals measurement error:', error);
  }
};

/**
 * Measure component render time
 */
export const measureComponentRender = (componentName, startTime) => {
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  console.log(`${componentName} render time:`, `${renderTime.toFixed(2)}ms`);

  if (renderTime > 100) {
    console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
  }
};

/**
 * Debounce function for performance
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memory usage monitoring
 */
export const monitorMemory = () => {
  if (typeof window === 'undefined' || !performance.memory) {
    console.warn('Memory monitoring not supported');
    return;
  }

  const memory = performance.memory;
  console.log('Memory Usage:', {
    used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
    total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
    limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
  });
};

/**
 * Bundle size analysis helper
 */
export const logBundleSize = () => {
  if (typeof window === 'undefined') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('Bundle Analysis');
  console.log('Scripts:', scripts.length);
  console.log('Stylesheets:', styles.length);
  console.groupEnd();
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  if (import.meta.env.MODE === 'production') {
    measurePageLoad();
    measureWebVitals();

    // Log memory every 30 seconds
    setInterval(monitorMemory, 30000);
  }
};
