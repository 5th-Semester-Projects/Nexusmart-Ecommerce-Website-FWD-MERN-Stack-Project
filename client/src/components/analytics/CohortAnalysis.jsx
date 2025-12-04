import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiTrendingUp, FiDollarSign, FiCalendar, 
  FiArrowUp, FiArrowDown, FiFilter, FiDownload 
} from 'react-icons/fi';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import axios from 'axios';

const CohortAnalysis = () => {
  const [cohortData, setCohortData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('retention');
  const [dateRange, setDateRange] = useState('90days');
  const [cohortType, setCohortType] = useState('acquisition');

  useEffect(() => {
    fetchCohortData();
  }, [dateRange, cohortType, selectedMetric]);

  const fetchCohortData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/analytics/cohorts', {
        params: { range: dateRange, type: cohortType, metric: selectedMetric }
      });
      setCohortData(response.data);
    } catch (error) {
      // Generate demo data
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    const cohorts = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    months.forEach((month, cohortIndex) => {
      const cohort = {
        name: `${month} 2024`,
        users: Math.floor(Math.random() * 2000) + 500,
        retention: [],
        revenue: [],
        orders: []
      };

      // Generate retention data (decreasing over time)
      for (let i = 0; i <= 5 - cohortIndex; i++) {
        const baseRetention = 100 - (i * 15) + (Math.random() * 10);
        const retention = Math.max(5, Math.min(100, i === 0 ? 100 : baseRetention));
        cohort.retention.push(Math.round(retention));
        
        // Revenue per user decreases but with some variation
        const avgRevenue = (100 - i * 10) * (Math.random() * 0.5 + 0.75);
        cohort.revenue.push(Math.round(avgRevenue));
        
        // Orders follow similar pattern
        const avgOrders = (2 - i * 0.2) + Math.random() * 0.5;
        cohort.orders.push(Number(avgOrders.toFixed(2)));
      }

      cohorts.push(cohort);
    });

    // Summary metrics
    const summary = {
      averageRetentionMonth1: Math.round(cohorts.reduce((a, c) => a + (c.retention[1] || 0), 0) / cohorts.length),
      averageLTV: Math.round(cohorts.reduce((a, c) => a + c.revenue.reduce((x, y) => x + y, 0), 0) / cohorts.length),
      bestCohort: cohorts.reduce((best, c) => 
        (c.retention[1] || 0) > (best.retention[1] || 0) ? c : best
      ).name,
      churnRisk: cohorts.filter(c => (c.retention[1] || 0) < 70).length
    };

    // Trend data for charts
    const trendData = months.map((month, i) => ({
      month,
      retention: cohorts[i]?.retention[1] || 0,
      revenue: cohorts[i]?.revenue.reduce((a, b) => a + b, 0) || 0,
      users: cohorts[i]?.users || 0
    }));

    setCohortData({ cohorts, summary, trendData });
  };

  const getRetentionColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-green-400';
    if (value >= 40) return 'bg-yellow-400';
    if (value >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getMetricValue = (cohort, periodIndex) => {
    switch (selectedMetric) {
      case 'retention':
        return cohort.retention[periodIndex];
      case 'revenue':
        return cohort.revenue[periodIndex];
      case 'orders':
        return cohort.orders[periodIndex];
      default:
        return cohort.retention[periodIndex];
    }
  };

  const formatMetricValue = (value) => {
    switch (selectedMetric) {
      case 'retention':
        return `${value}%`;
      case 'revenue':
        return `$${value}`;
      case 'orders':
        return value;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
            <FiUsers className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Cohort Analysis</h2>
            <p className="text-gray-500">Track user behavior over time</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="retention">Retention Rate</option>
            <option value="revenue">Revenue per User</option>
            <option value="orders">Orders per User</option>
          </select>

          <select
            value={cohortType}
            onChange={(e) => setCohortType(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="acquisition">By Acquisition Date</option>
            <option value="first_purchase">By First Purchase</option>
            <option value="subscription">By Subscription Start</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="180days">Last 6 Months</option>
            <option value="365days">Last Year</option>
          </select>

          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors flex items-center gap-2 dark:text-white">
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiUsers />
            <span className="text-sm">Month 1 Retention</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {cohortData?.summary?.averageRetentionMonth1 || 0}%
          </p>
          <div className="flex items-center gap-1 mt-1 text-green-500 text-sm">
            <FiArrowUp />
            <span>+5.2% vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiDollarSign />
            <span className="text-sm">Average LTV</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            ${cohortData?.summary?.averageLTV || 0}
          </p>
          <div className="flex items-center gap-1 mt-1 text-green-500 text-sm">
            <FiArrowUp />
            <span>+12.3% vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiTrendingUp />
            <span className="text-sm">Best Cohort</span>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {cohortData?.summary?.bestCohort || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Highest retention rate</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiCalendar />
            <span className="text-sm">Churn Risk</span>
          </div>
          <p className="text-2xl font-bold text-orange-500">
            {cohortData?.summary?.churnRisk || 0} cohorts
          </p>
          <p className="text-sm text-gray-500 mt-1">Below 70% retention</p>
        </div>
      </div>

      {/* Cohort Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold dark:text-white">
            {selectedMetric === 'retention' ? 'Retention' : 
             selectedMetric === 'revenue' ? 'Revenue per User' : 'Orders per User'} Matrix
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b dark:border-gray-700">
                <th className="p-4">Cohort</th>
                <th className="p-4 text-center">Users</th>
                <th className="p-4 text-center">Month 0</th>
                <th className="p-4 text-center">Month 1</th>
                <th className="p-4 text-center">Month 2</th>
                <th className="p-4 text-center">Month 3</th>
                <th className="p-4 text-center">Month 4</th>
                <th className="p-4 text-center">Month 5</th>
              </tr>
            </thead>
            <tbody>
              {cohortData?.cohorts?.map((cohort, cohortIndex) => (
                <tr key={cohort.name} className="border-b dark:border-gray-700">
                  <td className="p-4 font-medium dark:text-white">{cohort.name}</td>
                  <td className="p-4 text-center dark:text-white">
                    {cohort.users.toLocaleString()}
                  </td>
                  {[0, 1, 2, 3, 4, 5].map((periodIndex) => {
                    const value = getMetricValue(cohort, periodIndex);
                    if (value === undefined) {
                      return <td key={periodIndex} className="p-4"></td>;
                    }
                    
                    return (
                      <td key={periodIndex} className="p-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (cohortIndex * 6 + periodIndex) * 0.02 }}
                          className={`
                            mx-auto w-16 h-10 flex items-center justify-center rounded-lg text-white text-sm font-medium
                            ${selectedMetric === 'retention' ? getRetentionColor(value) : 'bg-blue-500'}
                          `}
                          style={selectedMetric !== 'retention' ? {
                            opacity: 0.3 + (value / (selectedMetric === 'revenue' ? 150 : 3)) * 0.7
                          } : {}}
                        >
                          {formatMetricValue(value)}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Retention Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold dark:text-white mb-4">Retention Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cohortData?.trendData || []}>
              <defs>
                <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="retention" 
                stroke="#06b6d4" 
                fill="url(#colorRetention)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Cohort */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold dark:text-white mb-4">Revenue by Cohort</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cohortData?.trendData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cohort Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="font-semibold dark:text-white mb-4">Cohort Size vs Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={cohortData?.trendData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis yAxisId="left" stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Legend />
            <Bar yAxisId="left" dataKey="users" fill="#3b82f6" name="Users" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="retention" stroke="#10b981" name="Retention %" strokeWidth={3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Color Legend */}
      {selectedMetric === 'retention' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-sm text-gray-500">Retention Rate:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm dark:text-white">80%+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm dark:text-white">60-79%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm dark:text-white">40-59%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-sm dark:text-white">20-39%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-sm dark:text-white">0-19%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CohortAnalysis;
