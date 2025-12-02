import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartLine, FaShoppingBag, FaWallet, FaBox, 
  FaArrowUp, FaArrowDown, FaCalendarAlt 
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UserDashboardAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get(`/api/v1/analytics/user-dashboard?range=${timeRange}`);
      setAnalytics(data.analytics);
    } catch (error) {
      // Use sample data if API fails
      setAnalytics(sampleAnalytics);
    } finally {
      setLoading(false);
    }
  };

  const sampleAnalytics = {
    totalSpent: 125000,
    totalOrders: 24,
    avgOrderValue: 5208,
    savedAmount: 15000,
    spentChange: 12.5,
    ordersChange: 8.3,
    monthlySpending: [8500, 12000, 9500, 15000, 18000, 22000],
    categoryBreakdown: [
      { name: 'Electronics', value: 45000, color: '#8B5CF6' },
      { name: 'Clothing', value: 35000, color: '#EC4899' },
      { name: 'Home & Garden', value: 25000, color: '#10B981' },
      { name: 'Sports', value: 15000, color: '#F59E0B' },
      { name: 'Other', value: 5000, color: '#6B7280' }
    ],
    recentOrders: [
      { id: 'ORD001', date: '2024-02-15', amount: 5999, status: 'delivered' },
      { id: 'ORD002', date: '2024-02-10', amount: 2499, status: 'delivered' },
      { id: 'ORD003', date: '2024-02-05', amount: 8999, status: 'delivered' },
    ],
    topCategories: ['Electronics', 'Clothing', 'Home & Garden']
  };

  const currentData = analytics || sampleAnalytics;

  const spendingChartData = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Spending',
      data: currentData.monthlySpending,
      fill: true,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: '#8B5CF6',
      tension: 0.4,
      pointBackgroundColor: '#8B5CF6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#8B5CF6'
    }]
  };

  const categoryChartData = {
    labels: currentData.categoryBreakdown.map(c => c.name),
    datasets: [{
      data: currentData.categoryBreakdown.map(c => c.value),
      backgroundColor: currentData.categoryBreakdown.map(c => c.color),
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value) => `Rs. ${value/1000}k`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="text-white text-xl" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </motion.div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaChartLine className="text-purple-500" /> Your Analytics
          </h2>
          <p className="text-gray-400 mt-1">Track your shopping patterns and spending</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Spent"
          value={`Rs. ${currentData.totalSpent.toLocaleString()}`}
          icon={FaWallet}
          change={currentData.spentChange}
          color="from-purple-600 to-pink-600"
        />
        <StatCard
          title="Total Orders"
          value={currentData.totalOrders}
          icon={FaShoppingBag}
          change={currentData.ordersChange}
          color="from-blue-600 to-cyan-600"
        />
        <StatCard
          title="Avg. Order Value"
          value={`Rs. ${currentData.avgOrderValue.toLocaleString()}`}
          icon={FaBox}
          color="from-green-600 to-emerald-600"
        />
        <StatCard
          title="You Saved"
          value={`Rs. ${currentData.savedAmount.toLocaleString()}`}
          icon={FaCalendarAlt}
          color="from-orange-600 to-yellow-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-4">Spending Trend</h3>
          <div className="h-64">
            <Line data={spendingChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-4">Category Breakdown</h3>
          <div className="h-48">
            <Doughnut 
              data={categoryChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                cutout: '60%'
              }} 
            />
          </div>
          <div className="mt-4 space-y-2">
            {currentData.categoryBreakdown.slice(0, 3).map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-300">{cat.name}</span>
                </div>
                <span className="text-white font-semibold">Rs. {(cat.value/1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-white font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {currentData.recentOrders.map((order, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
              <div>
                <p className="text-white font-semibold">{order.id}</p>
                <p className="text-gray-400 text-sm">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">Rs. {order.amount.toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardAnalytics;
