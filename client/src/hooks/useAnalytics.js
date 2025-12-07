import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Analytics Hook
 * Tracks user behavior and provides analytics data
 */

export const useAnalytics = () => {
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem('analytics_session');
    if (existing) return existing;

    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session', newId);
    return newId;
  });

  // Track page view
  const trackPageView = useCallback((page, metadata = {}) => {
    const data = {
      event: 'page_view',
      page,
      sessionId,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      ...metadata
    };

    // Send to analytics endpoint
    api.post('/analytics/track', data).catch(() => {
      // Store for later if offline
      const stored = JSON.parse(localStorage.getItem('pending_analytics') || '[]');
      stored.push(data);
      localStorage.setItem('pending_analytics', JSON.stringify(stored));
    });
  }, [sessionId]);

  // Track event
  const trackEvent = useCallback((eventName, properties = {}) => {
    const data = {
      event: eventName,
      sessionId,
      timestamp: new Date().toISOString(),
      properties
    };

    api.post('/analytics/track', data).catch(() => {
      const stored = JSON.parse(localStorage.getItem('pending_analytics') || '[]');
      stored.push(data);
      localStorage.setItem('pending_analytics', JSON.stringify(stored));
    });
  }, [sessionId]);

  // Track click
  const trackClick = useCallback((elementId, elementType, metadata = {}) => {
    trackEvent('click', {
      elementId,
      elementType,
      x: metadata.x,
      y: metadata.y,
      page: window.location.pathname,
      ...metadata
    });
  }, [trackEvent]);

  // Track product view
  const trackProductView = useCallback((productId, productData = {}) => {
    trackEvent('product_view', {
      productId,
      ...productData
    });
  }, [trackEvent]);

  // Track add to cart
  const trackAddToCart = useCallback((productId, quantity, price) => {
    trackEvent('add_to_cart', {
      productId,
      quantity,
      price,
      value: quantity * price
    });
  }, [trackEvent]);

  // Track purchase
  const trackPurchase = useCallback((orderId, total, items) => {
    trackEvent('purchase', {
      orderId,
      total,
      items,
      currency: 'USD'
    });
  }, [trackEvent]);

  // Track search
  const trackSearch = useCallback((query, resultsCount) => {
    trackEvent('search', {
      query,
      resultsCount
    });
  }, [trackEvent]);

  // Flush pending analytics
  useEffect(() => {
    const flushPending = async () => {
      const pending = JSON.parse(localStorage.getItem('pending_analytics') || '[]');
      if (pending.length > 0) {
        try {
          await api.post('/analytics/batch', { events: pending });
          localStorage.removeItem('pending_analytics');
        } catch (error) {
          // Keep for next attempt
        }
      }
    };

    flushPending();
    const interval = setInterval(flushPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    sessionId,
    trackPageView,
    trackEvent,
    trackClick,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackSearch
  };
};

/**
 * Heatmap Hook
 * Tracks mouse movements and clicks for heatmap generation
 */
export const useHeatmap = (enabled = true) => {
  const [clicks, setClicks] = useState([]);
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    let movementBuffer = [];
    let clickBuffer = [];
    let lastFlush = Date.now();

    const handleClick = (e) => {
      clickBuffer.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        element: e.target.tagName,
        path: window.location.pathname
      });
    };

    const handleMouseMove = (e) => {
      // Throttle movements
      if (movementBuffer.length === 0 || Date.now() - movementBuffer[movementBuffer.length - 1].timestamp > 100) {
        movementBuffer.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        });
      }
    };

    const flush = () => {
      if (clickBuffer.length > 0 || movementBuffer.length > 0) {
        api.post('/analytics/heatmap', {
          clicks: clickBuffer,
          movements: movementBuffer,
          page: window.location.pathname,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }).catch(() => { });

        setClicks(prev => [...prev, ...clickBuffer]);
        setMovements(prev => [...prev, ...movementBuffer]);

        clickBuffer = [];
        movementBuffer = [];
        lastFlush = Date.now();
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    const flushInterval = setInterval(flush, 5000);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(flushInterval);
      flush();
    };
  }, [enabled]);

  return { clicks, movements };
};

/**
 * A/B Testing Hook
 */
export const useABTest = (experimentId) => {
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getVariant = async () => {
      try {
        // Check local storage first
        const stored = localStorage.getItem(`ab_test_${experimentId}`);
        if (stored) {
          setVariant(stored);
          setLoading(false);
          return;
        }

        // Get from server
        const { data } = await api.get(`/analytics/ab-test/${experimentId}/variant`);
        setVariant(data.variant);
        localStorage.setItem(`ab_test_${experimentId}`, data.variant);
      } catch (error) {
        // Default to control
        setVariant('control');
      } finally {
        setLoading(false);
      }
    };

    getVariant();
  }, [experimentId]);

  const trackConversion = useCallback(async (value = 1) => {
    try {
      await api.post(`/analytics/ab-test/${experimentId}/convert`, {
        variant,
        value
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }, [experimentId, variant]);

  return { variant, loading, trackConversion };
};

export default useAnalytics;
