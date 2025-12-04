// Advanced Performance Monitoring Service
// Real-time performance tracking, metrics, and optimization suggestions

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      navigation: [],
      resources: [],
      paints: [],
      longTasks: [],
      layoutShifts: [],
      userInteractions: [],
      errors: [],
      customMetrics: {}
    };

    this.thresholds = {
      FCP: 1800, // First Contentful Paint
      LCP: 2500, // Largest Contentful Paint
      FID: 100,  // First Input Delay
      CLS: 0.1,  // Cumulative Layout Shift
      TTFB: 600, // Time to First Byte
      TTI: 3800  // Time to Interactive
    };

    this.observers = {};
    this.initialized = false;
  }

  // Initialize all performance observers
  init() {
    if (this.initialized) return;

    this.setupNavigationTiming();
    this.setupPaintTiming();
    this.setupLongTaskObserver();
    this.setupLayoutShiftObserver();
    this.setupResourceTiming();
    this.setupInteractionObserver();
    this.setupErrorTracking();
    this.setupMemoryMonitoring();
    this.setupNetworkMonitoring();

    this.initialized = true;
    console.log('🚀 Performance Monitor initialized');
  }

  // Navigation Timing
  setupNavigationTiming() {
    if (!window.performance?.getEntriesByType) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.navigation.push({
        timestamp: Date.now(),
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.secureConnectionStart > 0
          ? navigation.connectEnd - navigation.secureConnectionStart
          : 0,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domParsing: navigation.domInteractive - navigation.responseEnd,
        domComplete: navigation.domComplete - navigation.responseEnd,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        redirectCount: navigation.redirectCount,
        type: navigation.type
      });
    }
  }

  // Paint Timing (FCP, LCP)
  setupPaintTiming() {
    // First Contentful Paint
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.paints.push({
            name: entry.name,
            startTime: entry.startTime,
            timestamp: Date.now()
          });

          if (entry.name === 'first-contentful-paint') {
            this.metrics.customMetrics.FCP = entry.startTime;
            this.checkThreshold('FCP', entry.startTime);
          }
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
      this.observers.paint = paintObserver;
    } catch (e) {
      console.warn('Paint timing not supported');
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.metrics.customMetrics.LCP = lastEntry.startTime;
        this.metrics.customMetrics.LCPElement = {
          tagName: lastEntry.element?.tagName,
          id: lastEntry.element?.id,
          className: lastEntry.element?.className,
          url: lastEntry.url
        };

        this.checkThreshold('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.lcp = lcpObserver;
    } catch (e) {
      console.warn('LCP not supported');
    }
  }

  // Long Tasks (blocking main thread)
  setupLongTaskObserver() {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.longTasks.push({
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
            timestamp: Date.now()
          });

          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
      this.observers.longTask = longTaskObserver;
    } catch (e) {
      console.warn('Long task observer not supported');
    }
  }

  // Cumulative Layout Shift
  setupLayoutShiftObserver() {
    let clsValue = 0;
    let clsEntries = [];

    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push({
              value: entry.value,
              startTime: entry.startTime,
              sources: entry.sources?.map(s => ({
                node: s.node?.tagName,
                previousRect: s.previousRect,
                currentRect: s.currentRect
              }))
            });

            this.metrics.customMetrics.CLS = clsValue;
            this.metrics.layoutShifts = clsEntries;

            this.checkThreshold('CLS', clsValue);
          }
        }
      });
      layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.layoutShift = layoutShiftObserver;
    } catch (e) {
      console.warn('Layout shift observer not supported');
    }
  }

  // Resource Timing
  setupResourceTiming() {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.resources.push({
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            startTime: entry.startTime,
            timestamp: Date.now()
          });
        }
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
      this.observers.resource = resourceObserver;
    } catch (e) {
      console.warn('Resource timing not supported');
    }
  }

  // First Input Delay
  setupInteractionObserver() {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime;

          this.metrics.userInteractions.push({
            name: entry.name,
            startTime: entry.startTime,
            processingStart: entry.processingStart,
            processingEnd: entry.processingEnd,
            duration: entry.duration,
            fid: fid,
            timestamp: Date.now()
          });

          if (!this.metrics.customMetrics.FID) {
            this.metrics.customMetrics.FID = fid;
            this.checkThreshold('FID', fid);
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.fid = fidObserver;
    } catch (e) {
      console.warn('First input delay observer not supported');
    }
  }

  // Error Tracking
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.push({
        type: 'unhandledrejection',
        message: event.reason?.message || String(event.reason),
        timestamp: Date.now()
      });
    });
  }

  // Memory Monitoring
  setupMemoryMonitoring() {
    if (performance.memory) {
      setInterval(() => {
        this.metrics.customMetrics.memory = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usedPercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2)
        };
      }, 5000);
    }
  }

  // Network Information
  setupNetworkMonitoring() {
    if (navigator.connection) {
      const updateNetworkInfo = () => {
        this.metrics.customMetrics.network = {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData
        };
      };

      updateNetworkInfo();
      navigator.connection.addEventListener('change', updateNetworkInfo);
    }
  }

  // Check thresholds and log warnings
  checkThreshold(metric, value) {
    const threshold = this.thresholds[metric];
    if (threshold && value > threshold) {
      console.warn(`⚠️ ${metric} (${value.toFixed(2)}) exceeds threshold (${threshold})`);
      this.reportIssue(metric, value, threshold);
    }
  }

  // Report performance issues
  reportIssue(metric, value, threshold) {
    // Could send to analytics service
    const issue = {
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Store for later analysis
    const issues = JSON.parse(localStorage.getItem('performanceIssues') || '[]');
    issues.push(issue);
    localStorage.setItem('performanceIssues', JSON.stringify(issues.slice(-100)));
  }

  // Get Core Web Vitals
  getCoreWebVitals() {
    return {
      FCP: this.metrics.customMetrics.FCP,
      LCP: this.metrics.customMetrics.LCP,
      FID: this.metrics.customMetrics.FID,
      CLS: this.metrics.customMetrics.CLS,
      TTFB: this.metrics.navigation[0]?.ttfb
    };
  }

  // Get performance score (0-100)
  getPerformanceScore() {
    const vitals = this.getCoreWebVitals();
    let score = 100;

    // Deduct points based on metrics
    if (vitals.FCP) {
      if (vitals.FCP > 3000) score -= 20;
      else if (vitals.FCP > 1800) score -= 10;
    }

    if (vitals.LCP) {
      if (vitals.LCP > 4000) score -= 25;
      else if (vitals.LCP > 2500) score -= 15;
    }

    if (vitals.FID) {
      if (vitals.FID > 300) score -= 20;
      else if (vitals.FID > 100) score -= 10;
    }

    if (vitals.CLS) {
      if (vitals.CLS > 0.25) score -= 20;
      else if (vitals.CLS > 0.1) score -= 10;
    }

    // Deduct for long tasks
    const totalLongTaskTime = this.metrics.longTasks.reduce((sum, t) => sum + t.duration, 0);
    if (totalLongTaskTime > 1000) score -= 10;

    return Math.max(0, score);
  }

  // Get optimization suggestions
  getOptimizationSuggestions() {
    const suggestions = [];
    const vitals = this.getCoreWebVitals();

    if (vitals.LCP > 2500) {
      suggestions.push({
        metric: 'LCP',
        severity: vitals.LCP > 4000 ? 'high' : 'medium',
        message: 'Largest Contentful Paint is slow',
        suggestions: [
          'Optimize and compress images',
          'Use lazy loading for off-screen images',
          'Preload critical resources',
          'Use a CDN for static assets',
          'Enable text compression (gzip/brotli)'
        ]
      });
    }

    if (vitals.FID > 100) {
      suggestions.push({
        metric: 'FID',
        severity: vitals.FID > 300 ? 'high' : 'medium',
        message: 'First Input Delay is high',
        suggestions: [
          'Break up long JavaScript tasks',
          'Use web workers for heavy computations',
          'Defer non-critical JavaScript',
          'Remove unused JavaScript code',
          'Use code splitting'
        ]
      });
    }

    if (vitals.CLS > 0.1) {
      suggestions.push({
        metric: 'CLS',
        severity: vitals.CLS > 0.25 ? 'high' : 'medium',
        message: 'Cumulative Layout Shift is high',
        suggestions: [
          'Set explicit dimensions for images/videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use CSS transforms for animations',
          'Preload fonts to prevent FOIT/FOUT'
        ]
      });
    }

    // Check for heavy resources
    const heavyResources = this.metrics.resources
      .filter(r => r.transferSize > 500000)
      .map(r => ({ name: r.name, size: r.transferSize }));

    if (heavyResources.length > 0) {
      suggestions.push({
        metric: 'Resources',
        severity: 'medium',
        message: `${heavyResources.length} large resources detected`,
        resources: heavyResources,
        suggestions: [
          'Compress large images with modern formats (WebP, AVIF)',
          'Minify and bundle JavaScript',
          'Use tree-shaking to remove unused code',
          'Consider lazy loading for heavy components'
        ]
      });
    }

    return suggestions;
  }

  // Generate full report
  generateReport() {
    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      score: this.getPerformanceScore(),
      coreWebVitals: this.getCoreWebVitals(),
      navigation: this.metrics.navigation[0],
      resources: {
        count: this.metrics.resources.length,
        totalSize: this.metrics.resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        byType: this.groupResourcesByType()
      },
      longTasks: {
        count: this.metrics.longTasks.length,
        totalDuration: this.metrics.longTasks.reduce((sum, t) => sum + t.duration, 0)
      },
      errors: this.metrics.errors,
      memory: this.metrics.customMetrics.memory,
      network: this.metrics.customMetrics.network,
      suggestions: this.getOptimizationSuggestions()
    };
  }

  // Group resources by type
  groupResourcesByType() {
    const groups = {};
    for (const resource of this.metrics.resources) {
      const type = resource.type || 'other';
      if (!groups[type]) {
        groups[type] = { count: 0, totalSize: 0 };
      }
      groups[type].count++;
      groups[type].totalSize += resource.transferSize || 0;
    }
    return groups;
  }

  // Custom metric tracking
  mark(name) {
    performance.mark(name);
  }

  measure(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      this.metrics.customMetrics[name] = measure.duration;
      return measure.duration;
    } catch (e) {
      return null;
    }
  }

  // Send metrics to analytics
  async sendToAnalytics(endpoint) {
    const report = this.generateReport();

    try {
      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, JSON.stringify(report));
      } else {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
          keepalive: true
        });
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  // Cleanup
  disconnect() {
    Object.values(this.observers).forEach(observer => {
      observer.disconnect();
    });
    this.initialized = false;
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
