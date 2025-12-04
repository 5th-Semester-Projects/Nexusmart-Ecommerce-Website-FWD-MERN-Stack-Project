import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiShoppingCart,
  FiUsers, FiPackage, FiCreditCard, FiCalendar, FiDownload,
  FiRefreshCw, FiTarget, FiPercent, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar
} from 'recharts';
import axios from 'axios';

const RevenueDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [comparison, setComparison] = useState('previous');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, comparison]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/analytics/revenue-dashboard', {
        params: { range: dateRange, comparison }
      });
      setData(response.data);
    } catch (error) {
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '90days' ? 90 : 365;
    const dailyData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseRevenue = 15000 + Math.random() * 10000;
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1;
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(baseRevenue * weekendMultiplier),
        orders: Math.round(50 + Math.random() * 100),
        profit: Math.round(baseRevenue * weekendMultiplier * 0.25),
        refunds: Math.round(baseRevenue * 0.02),
        aov: Math.round((baseRevenue * weekendMultiplier) / (50 + Math.random() * 50))
      });
    }

    const totalRevenue = dailyData.reduce((a, d) => a + d.revenue, 0);
    const totalOrders = dailyData.reduce((a, d) => a + d.orders, 0);
    const totalProfit = dailyData.reduce((a, d) => a + d.profit, 0);
    const totalRefunds = dailyData.reduce((a, d) => a + d.refunds, 0);

    setData({
      summary: {
        totalRevenue,
        revenueChange: 12.5,
        totalOrders,
        ordersChange: 8.3,
        averageOrderValue: Math.round(totalRevenue / totalOrders),
        aovChange: 4.2,
        grossProfit: totalProfit,
        profitChange: 15.7,
        profitMargin: ((totalProfit / totalRevenue) * 100).toFixed(1),
        refundRate: ((totalRefunds / totalRevenue) * 100).toFixed(2),
        conversionRate: 3.2,
        customerLifetimeValue: 285
      },
      dailyData,
      revenueByCategory: [
        { name: 'Electronics', value: 245000, color: '#3b82f6' },
        { name: 'Clothing', value: 189000, color: '#8b5cf6' },
        { name: 'Home & Garden', value: 125000, color: '#10b981' },
        { name: 'Sports', value: 89000, color: '#f59e0b' },
        { name: 'Books', value: 45000, color: '#ef4444' }
      ],
      revenueByChannel: [
        { name: 'Direct', revenue: 320000, percentage: 45 },
        { name: 'Organic Search', revenue: 180000, percentage: 25 },
        { name: 'Paid Search', revenue: 120000, percentage: 17 },
        { name: 'Social', revenue: 70000, percentage: 10 },
        { name: 'Email', revenue: 25000, percentage: 3 }
      ],
      topProducts: [
        { name: 'iPhone 15 Pro', revenue: 45000, units: 150, trend: 12 },
        { name: 'MacBook Air M3', revenue: 38000, units: 32, trend: 8 },
        { name: 'Sony WH-1000XM5', revenue: 28000, units: 95, trend: 15 },
        { name: 'Samsung 4K TV', revenue: 22000, units: 28, trend: -3 },
        { name: 'Nike Air Max', revenue: 18000, units: 120, trend: 25 }
      ],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        revenue: Math.round(2000 + Math.random() * 8000 * (i >= 9 && i <= 21 ? 1.5 : 0.5)),
        orders: Math.round(5 + Math.random() * 20 * (i >= 9 && i <= 21 ? 1.5 : 0.5))
      })),
      geographicData: [
        { country: 'United States', revenue: 420000, percentage: 55 },
        { country: 'United Kingdom', revenue: 120000, percentage: 16 },
        { country: 'Canada', revenue: 85000, percentage: 11 },
        { country: 'Germany', revenue: 65000, percentage: 9 },
        { country: 'Australia', revenue: 45000, percentage: 6 },
        { country: 'Other', revenue: 30000, percentage: 3 }
      ],
      goals: [
        { name: 'Monthly Revenue', current: totalRevenue, target: 800000, percentage: Math.round((totalRevenue / 800000) * 100) },
        { name: 'Orders', current: totalOrders, target: 2500, percentage: Math.round((totalOrders / 2500) * 100) },
        { name: 'New Customers', current: 450, target: 600, percentage: 75 },
        { name: 'Customer Retention', current: 68, target: 80, percentage: 85 }
      ]
    });
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiRefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <FiDollarSign className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Revenue Dashboard</h2>
            <p className="text-gray-500">Real-time business performance</p>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="365days">Last Year</option>
          </select>

          <select
            value={comparison}
            onChange={(e) => setComparison(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="previous">vs Previous Period</option>
            <option value="year">vs Same Period Last Year</option>
          </select>

          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors flex items-center gap-2 dark:text-white">
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <FiDollarSign className="text-green-500" />
            <span className="text-sm">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold dark:text-white">
            {formatCurrency(data?.summary?.totalRevenue)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            data?.summary?.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {data?.summary?.revenueChange >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            <span>{Math.abs(data?.summary?.revenueChange)}% vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <FiShoppingCart className="text-blue-500" />
            <span className="text-sm">Total Orders</span>
          </div>
          <p className="text-3xl font-bold dark:text-white">
            {data?.summary?.totalOrders?.toLocaleString()}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            data?.summary?.ordersChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {data?.summary?.ordersChange >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            <span>{Math.abs(data?.summary?.ordersChange)}% vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <FiCreditCard className="text-purple-500" />
            <span className="text-sm">Average Order Value</span>
          </div>
          <p className="text-3xl font-bold dark:text-white">
            ${data?.summary?.averageOrderValue}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            data?.summary?.aovChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {data?.summary?.aovChange >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            <span>{Math.abs(data?.summary?.aovChange)}% vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
        >
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <FiTrendingUp className="text-emerald-500" />
            <span className="text-sm">Gross Profit</span>
          </div>
          <p className="text-3xl font-bold dark:text-white">
            {formatCurrency(data?.summary?.grossProfit)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            data?.summary?.profitChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {data?.summary?.profitChange >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            <span>{Math.abs(data?.summary?.profitChange)}% vs last period</span>
          </div>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Profit Margin', value: `${data?.summary?.profitMargin}%`, icon: FiPercent },
          { label: 'Refund Rate', value: `${data?.summary?.refundRate}%`, icon: FiRefreshCw },
          { label: 'Conversion Rate', value: `${data?.summary?.conversionRate}%`, icon: FiTarget },
          { label: 'Customer LTV', value: `$${data?.summary?.customerLifetimeValue}`, icon: FiUsers },
          { label: 'Active Orders', value: '156', icon: FiPackage }
        ].map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <metric.icon className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{metric.label}</p>
              <p className="font-bold dark:text-white">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="font-semibold dark:text-white mb-4">Revenue & Orders Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data?.dailyData || []}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" stroke="#9ca3af" tickFormatter={(v) => `$${v/1000}K`} />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value) : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              fill="url(#colorRevenue)"
              strokeWidth={2}
              name="Revenue"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Orders"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Middle Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold dark:text-white mb-4">Revenue by Category</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={data?.revenueByCategory || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.revenueByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {data?.revenueByCategory?.map((category, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1 text-sm dark:text-white">{category.name}</span>
                  <span className="font-medium dark:text-white">{formatCurrency(category.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Channel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold dark:text-white mb-4">Revenue by Channel</h3>
          <div className="space-y-4">
            {data?.revenueByChannel?.map((channel, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm dark:text-white">{channel.name}</span>
                  <span className="text-sm font-medium dark:text-white">
                    {formatCurrency(channel.revenue)} ({channel.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${channel.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold dark:text-white mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {data?.topProducts?.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-sm font-medium dark:text-white">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.units} units</p>
                </div>
                <div className="text-right">
                  <p className="font-medium dark:text-white">{formatCurrency(product.revenue)}</p>
                  <p className={`text-xs flex items-center justify-end gap-1 ${
                    product.trend >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {product.trend >= 0 ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
                    {Math.abs(product.trend)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold dark:text-white mb-4">Sales by Hour</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.hourlyData?.filter((_, i) => i % 2 === 0) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `$${v/1000}K`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold dark:text-white mb-4">Goals Progress</h3>
          <div className="space-y-4">
            {data?.goals?.map((goal, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm dark:text-white">{goal.name}</span>
                  <span className="text-sm text-gray-500">
                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      goal.percentage >= 100 
                        ? 'bg-green-500' 
                        : goal.percentage >= 75 
                          ? 'bg-blue-500' 
                          : goal.percentage >= 50 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">{goal.percentage}% complete</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="font-semibold dark:text-white mb-4">Revenue by Geography</h3>
        <div className="grid md:grid-cols-6 gap-4">
          {data?.geographicData?.map((geo, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold dark:text-white">{formatCurrency(geo.revenue)}</div>
              <div className="text-sm text-gray-500">{geo.country}</div>
              <div className="text-xs text-gray-400">{geo.percentage}% of total</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
