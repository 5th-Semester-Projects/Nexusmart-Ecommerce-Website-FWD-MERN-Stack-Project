import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiMousePointer, FiEye, FiClock } from 'react-icons/fi';
import axios from 'axios';

// Heatmap Hook - to be used in components
export const useHeatmapTracking = () => {
  const [clicks, setClicks] = useState([]);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [timeOnPage, setTimeOnPage] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Track clicks
    const handleClick = (e) => {
      const click = {
        x: e.clientX,
        y: e.clientY,
        target: e.target.tagName,
        timestamp: Date.now(),
        path: e.target.closest('[data-track]')?.dataset?.track || 'unknown'
      };
      setClicks(prev => [...prev, click]);
      
      // Send to analytics
      sendAnalytics('click', click);
    };

    // Track scroll
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const depth = Math.round((scrolled / height) * 100);
      setScrollDepth(depth);
    };

    // Track time
    const timeInterval = setInterval(() => {
      setTimeOnPage(Math.round((Date.now() - startTime) / 1000));
    }, 1000);

    // Add listeners
    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
      
      // Send final analytics
      sendAnalytics('session', {
        totalClicks: clicks.length,
        scrollDepth,
        timeOnPage: Math.round((Date.now() - startTime) / 1000)
      });
    };
  }, []);

  const sendAnalytics = async (type, data) => {
    try {
      await axios.post('/api/analytics/heatmap', { type, data, page: window.location.pathname });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  return { clicks, scrollDepth, timeOnPage };
};

// Heatmap Visualization Component
const HeatmapVisualization = ({ data, width = 1200, height = 800 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create heatmap
    data.forEach(point => {
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, 50
      );
      
      const intensity = Math.min(point.count / 10, 1);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
      gradient.addColorStop(0.5, `rgba(255, 165, 0, ${intensity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - 50, point.y - 50, 100, 100);
    });
  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none opacity-70"
    />
  );
};

// Heatmap Dashboard Component
const HeatmapDashboard = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [selectedPage, setSelectedPage] = useState('/');
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, [selectedPage, dateRange]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/analytics/heatmap-data', {
        params: { page: selectedPage, range: dateRange }
      });
      setHeatmapData(response.data);
    } catch (error) {
      // Generate demo data
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    const clicks = [];
    const scrollData = [];

    // Generate random click points
    for (let i = 0; i < 500; i++) {
      clicks.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        count: Math.floor(Math.random() * 20) + 1
      });
    }

    // Generate scroll depth data
    for (let depth = 0; depth <= 100; depth += 10) {
      scrollData.push({
        depth,
        percentage: Math.round(100 - depth * 0.8 + Math.random() * 10)
      });
    }

    setHeatmapData({
      clicks,
      scrollData,
      summary: {
        totalClicks: 15234,
        avgScrollDepth: 67,
        avgTimeOnPage: 245,
        bounceRate: 32,
        hotspots: [
          { element: 'Add to Cart Button', clicks: 2456, conversion: 45 },
          { element: 'Product Image', clicks: 3890, conversion: 0 },
          { element: 'Price Section', clicks: 1234, conversion: 0 },
          { element: 'Reviews Tab', clicks: 987, conversion: 0 },
          { element: 'Buy Now Button', clicks: 756, conversion: 89 }
        ]
      },
      pages: [
        { path: '/', name: 'Home', views: 45000 },
        { path: '/products', name: 'Products', views: 32000 },
        { path: '/cart', name: 'Cart', views: 12000 },
        { path: '/checkout', name: 'Checkout', views: 8000 }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <FiActivity className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Heatmap Analytics</h2>
            <p className="text-gray-500">Visualize user interactions</p>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {heatmapData?.pages?.map((page) => (
              <option key={page.path} value={page.path}>
                {page.name} ({page.views.toLocaleString()} views)
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiMousePointer />
            <span className="text-sm">Total Clicks</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {heatmapData?.summary?.totalClicks?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiEye />
            <span className="text-sm">Avg Scroll Depth</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {heatmapData?.summary?.avgScrollDepth || 0}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiClock />
            <span className="text-sm">Avg Time on Page</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {Math.floor((heatmapData?.summary?.avgTimeOnPage || 0) / 60)}m {(heatmapData?.summary?.avgTimeOnPage || 0) % 60}s
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiActivity />
            <span className="text-sm">Bounce Rate</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {heatmapData?.summary?.bounceRate || 0}%
          </p>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold dark:text-white">Click Heatmap</h3>
        </div>
        <div className="relative" style={{ height: '500px' }}>
          {/* Page Preview */}
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p>Page Preview</p>
              <p className="text-sm">{selectedPage}</p>
            </div>
          </div>
          
          {/* Heatmap Overlay */}
          {!loading && heatmapData?.clicks && (
            <HeatmapVisualization
              data={heatmapData.clicks}
              width={1200}
              height={500}
            />
          )}
        </div>
      </div>

      {/* Hotspots Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold dark:text-white">Top Interaction Hotspots</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b dark:border-gray-700">
                <th className="p-4">Element</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">Click Heat</th>
                <th className="p-4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData?.summary?.hotspots?.map((hotspot, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b dark:border-gray-700"
                >
                  <td className="p-4 dark:text-white">{hotspot.element}</td>
                  <td className="p-4 dark:text-white">{hotspot.clicks.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                        style={{ width: `${(hotspot.clicks / 4000) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hotspot.conversion > 0 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {hotspot.conversion > 0 ? `${hotspot.conversion}%` : 'N/A'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scroll Depth Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="font-semibold dark:text-white mb-4">Scroll Depth Analysis</h3>
        <div className="space-y-3">
          {heatmapData?.scrollData?.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="w-16 text-sm text-gray-500">{item.depth}%</span>
              <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <span className="w-16 text-sm text-right dark:text-white">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapDashboard;
