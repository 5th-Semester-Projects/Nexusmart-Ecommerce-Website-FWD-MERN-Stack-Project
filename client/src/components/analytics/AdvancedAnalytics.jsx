import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  EyeIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Customer Lifetime Value Predictor
export const CLVPredictor = () => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const segments = [
    { id: 'all', label: 'All Customers', count: 15420 },
    { id: 'vip', label: 'VIP', count: 1240 },
    { id: 'regular', label: 'Regular', count: 8540 },
    { id: 'new', label: 'New', count: 3640 },
    { id: 'at-risk', label: 'At Risk', count: 2000 }
  ];

  const clvData = {
    average: 847.50,
    predicted: 1250.00,
    growth: 47.5,
    distribution: [
      { range: '$0-100', count: 2500, percentage: 16 },
      { range: '$100-500', count: 5800, percentage: 38 },
      { range: '$500-1000', count: 4200, percentage: 27 },
      { range: '$1000-2000', count: 2120, percentage: 14 },
      { range: '$2000+', count: 800, percentage: 5 }
    ]
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('CLV predictions updated!');
    }, 1500);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Customer Lifetime Value</h3>
            <p className="text-gray-400 text-sm">AI-powered predictions</p>
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowPathIcon className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Segment Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {segments.map((seg) => (
          <button
            key={seg.id}
            onClick={() => setSelectedSegment(seg.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedSegment === seg.id
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {seg.label}
            <span className="ml-2 text-xs opacity-70">({seg.count.toLocaleString()})</span>
          </button>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-800 rounded-xl">
          <p className="text-gray-400 text-sm">Current Avg CLV</p>
          <p className="text-2xl font-bold text-white">${clvData.average.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
          <p className="text-gray-400 text-sm">Predicted 12-Month CLV</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-white">${clvData.predicted.toLocaleString()}</p>
            <span className="flex items-center text-green-400 text-sm">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              {clvData.growth}%
            </span>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="space-y-3">
        <h4 className="text-sm text-gray-400">CLV Distribution</h4>
        {clvData.distribution.map((item, i) => (
          <div key={item.range} className="flex items-center gap-3">
            <span className="w-20 text-sm text-gray-400">{item.range}</span>
            <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              />
            </div>
            <span className="w-12 text-sm text-white text-right">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Churn Prediction Dashboard
export const ChurnPredictor = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const churnData = {
    rate: 4.2,
    atRisk: 847,
    saved: 156,
    predictions: [
      { name: 'John Smith', email: 'john@email.com', risk: 85, lastOrder: '45 days ago', reason: 'Decreased engagement' },
      { name: 'Sarah Johnson', email: 'sarah@email.com', risk: 72, lastOrder: '32 days ago', reason: 'Cart abandonment' },
      { name: 'Mike Williams', email: 'mike@email.com', risk: 68, lastOrder: '28 days ago', reason: 'Support issues' },
      { name: 'Emily Brown', email: 'emily@email.com', risk: 65, lastOrder: '21 days ago', reason: 'Price sensitivity' }
    ]
  };

  const getRiskColor = (risk) => {
    if (risk >= 80) return 'text-red-400 bg-red-500/20';
    if (risk >= 60) return 'text-orange-400 bg-orange-500/20';
    return 'text-yellow-400 bg-yellow-500/20';
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Churn Prediction</h3>
            <p className="text-gray-400 text-sm">Identify at-risk customers</p>
          </div>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-800 rounded-xl text-center">
          <p className="text-3xl font-bold text-red-400">{churnData.rate}%</p>
          <p className="text-gray-400 text-sm">Churn Rate</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-xl text-center">
          <p className="text-3xl font-bold text-orange-400">{churnData.atRisk}</p>
          <p className="text-gray-400 text-sm">At Risk</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-xl text-center">
          <p className="text-3xl font-bold text-green-400">{churnData.saved}</p>
          <p className="text-gray-400 text-sm">Saved</p>
        </div>
      </div>

      {/* At-Risk Customers */}
      <h4 className="text-sm text-gray-400 mb-3">High-Risk Customers</h4>
      <div className="space-y-3">
        {churnData.predictions.map((customer, i) => (
          <motion.div
            key={customer.email}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-gray-800 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold">
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium">{customer.name}</p>
                <p className="text-gray-500 text-sm">{customer.lastOrder} • {customer.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(customer.risk)}`}>
                {customer.risk}% risk
              </span>
              <button
                onClick={() => toast.success(`Retention campaign sent to ${customer.name}`)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                Engage
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Sales Forecasting Widget
export const SalesForecast = () => {
  const [forecastPeriod, setForecastPeriod] = useState('monthly');

  const forecastData = {
    actual: [45000, 52000, 48000, 61000, 55000, 67000],
    predicted: [70000, 75000, 82000, 78000, 85000, 92000],
    months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    confidence: 87,
    growth: 15.5,
    seasonality: 'High (Holiday Season)'
  };

  const maxValue = Math.max(...forecastData.actual, ...forecastData.predicted);

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sales Forecast</h3>
            <p className="text-gray-400 text-sm">{forecastData.confidence}% confidence</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['weekly', 'monthly', 'quarterly'].map((period) => (
            <button
              key={period}
              onClick={() => setForecastPeriod(period)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                forecastPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 flex items-end gap-2 mb-4">
        {forecastData.months.map((month, i) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-1 items-end" style={{ height: '140px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(forecastData.actual[i] / maxValue) * 100}%` }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 bg-blue-500 rounded-t"
              />
              {i >= 3 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(forecastData.predicted[i] / maxValue) * 100}%` }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="flex-1 bg-purple-500/50 rounded-t border-2 border-purple-500 border-dashed"
                />
              )}
            </div>
            <span className="text-xs text-gray-400">{month}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-sm text-gray-400">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500/50 border-2 border-purple-500 border-dashed rounded" />
          <span className="text-sm text-gray-400">Forecast</span>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">Expected Growth</p>
          <p className="text-green-400 font-bold flex items-center gap-1">
            <ArrowTrendingUpIcon className="w-4 h-4" />
            {forecastData.growth}%
          </p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">Seasonality</p>
          <p className="text-white font-medium text-sm">{forecastData.seasonality}</p>
        </div>
      </div>
    </div>
  );
};

// Real-time Analytics Dashboard
export const RealTimeAnalytics = () => {
  const [activeUsers, setActiveUsers] = useState(1247);
  const [ordersPerMinute, setOrdersPerMinute] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 20 - 10));
      setOrdersPerMinute(Math.floor(Math.random() * 8 + 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'Active Users', value: activeUsers.toLocaleString(), icon: UserGroupIcon, color: 'blue', live: true },
    { label: 'Orders/Min', value: ordersPerMinute, icon: ShoppingCartIcon, color: 'green', live: true },
    { label: 'Page Views', value: '3.2K', icon: EyeIcon, color: 'purple', live: true },
    { label: 'Conv. Rate', value: '3.8%', icon: ChartPieIcon, color: 'pink', live: false }
  ];

  const topPages = [
    { page: '/products/electronics', views: 847, change: +12 },
    { page: '/deals/flash-sale', views: 623, change: +28 },
    { page: '/cart', views: 412, change: -5 },
    { page: '/checkout', views: 298, change: +3 }
  ];

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Real-Time Analytics</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-400 text-sm">Live</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => toast.success('Report downloaded!')}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            animate={metric.live ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="p-4 bg-gray-800 rounded-xl relative"
          >
            {metric.live && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            <metric.icon className={`w-6 h-6 mb-2 text-${metric.color}-400`} />
            <p className="text-2xl font-bold text-white">{metric.value}</p>
            <p className="text-gray-400 text-sm">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Top Pages */}
      <h4 className="text-sm text-gray-400 mb-3">Top Pages Right Now</h4>
      <div className="space-y-2">
        {topPages.map((page, i) => (
          <div key={page.page} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                {i + 1}
              </span>
              <span className="text-white text-sm">{page.page}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">{page.views}</span>
              <span className={`text-sm ${page.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {page.change > 0 ? '+' : ''}{page.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Heatmap Visualization Component
export const ClickHeatmap = ({ pageUrl }) => {
  const [selectedPage, setSelectedPage] = useState('homepage');
  const [heatmapType, setHeatmapType] = useState('clicks');

  const pages = [
    { id: 'homepage', label: 'Homepage' },
    { id: 'product', label: 'Product Page' },
    { id: 'cart', label: 'Cart' },
    { id: 'checkout', label: 'Checkout' }
  ];

  const insights = [
    { area: 'Hero Banner', clicks: 2847, rate: '12.3%' },
    { area: 'Product Grid', clicks: 5621, rate: '24.2%' },
    { area: 'Search Bar', clicks: 1923, rate: '8.3%' },
    { area: 'Add to Cart', clicks: 3412, rate: '14.7%' }
  ];

  return (
    <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <EyeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Click Heatmap</h3>
              <p className="text-gray-400 text-sm">User interaction patterns</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setHeatmapType('clicks')}
              className={`px-3 py-1 rounded-lg text-sm ${
                heatmapType === 'clicks' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Clicks
            </button>
            <button
              onClick={() => setHeatmapType('scroll')}
              className={`px-3 py-1 rounded-lg text-sm ${
                heatmapType === 'scroll' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Scroll
            </button>
          </div>
        </div>

        {/* Page Selection */}
        <div className="flex gap-2 overflow-x-auto">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedPage === page.id
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {/* Simulated heatmap spots */}
        <div className="absolute top-4 left-1/4 w-32 h-20 rounded-full bg-red-500/40 blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 rounded-full bg-orange-500/30 blur-2xl" />
        <div className="absolute bottom-8 right-1/4 w-24 h-16 rounded-full bg-yellow-500/40 blur-xl" />
        <div className="absolute top-1/3 left-1/3 w-20 h-14 rounded-full bg-red-600/50 blur-lg" />

        {/* Page outline */}
        <div className="absolute inset-8 border-2 border-dashed border-gray-600 rounded-lg" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur rounded-lg">
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <div className="w-4 h-4 rounded bg-orange-500" />
            <div className="w-4 h-4 rounded bg-red-500" />
          </div>
          <span className="text-white text-xs">Low → High</span>
        </div>
      </div>

      {/* Insights */}
      <div className="p-6">
        <h4 className="text-sm text-gray-400 mb-3">Top Click Areas</h4>
        <div className="space-y-2">
          {insights.map((insight) => (
            <div key={insight.area} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <span className="text-white">{insight.area}</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">{insight.clicks.toLocaleString()} clicks</span>
                <span className="text-orange-400 font-medium">{insight.rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default {
  CLVPredictor,
  ChurnPredictor,
  SalesForecast,
  RealTimeAnalytics,
  ClickHeatmap
};
