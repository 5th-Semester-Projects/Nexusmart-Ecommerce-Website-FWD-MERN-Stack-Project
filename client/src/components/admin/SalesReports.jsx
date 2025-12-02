import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDownload, FiCalendar, FiTrendingUp, FiTrendingDown,
  FiDollarSign, FiShoppingCart, FiUsers, FiPackage,
  FiFilter, FiRefreshCw, FiFileText, FiPieChart, FiBarChart2
} from 'react-icons/fi';
import { SiMicrosoftexcel } from 'react-icons/si';
import { VscFilePdf } from 'react-icons/vsc';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Date Range Picker Component
const DateRangePicker = ({ startDate, endDate, onChange }) => {
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2">
      <FiCalendar className="text-gray-400 ml-2" />
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChange({ startDate: e.target.value, endDate })}
        className="bg-transparent text-white outline-none"
      />
      <span className="text-gray-400">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChange({ startDate, endDate: e.target.value })}
        className="bg-transparent text-white outline-none"
      />
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, color, prefix = '' }) => {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-white/10"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
              <span>{Math.abs(change)}% vs last period</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="text-xl text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Simple Chart Component (Bar Chart)
const SimpleBarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FiBarChart2 className="text-cyan-400" />
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="w-20 text-sm text-gray-400 truncate">{item.label}</span>
            <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full"
              />
            </div>
            <span className="w-16 text-sm text-white text-right">
              Rs. {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Products Table
const TopProductsTable = ({ products }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FiPackage className="text-cyan-400" />
        Top Selling Products
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 text-sm font-medium text-gray-400">Product</th>
              <th className="text-right py-3 text-sm font-medium text-gray-400">Sold</th>
              <th className="text-right py-3 text-sm font-medium text-gray-400">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-white/5">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-white">{product.name}</span>
                  </div>
                </td>
                <td className="text-right text-gray-300">{product.sold}</td>
                <td className="text-right text-green-400 font-medium">
                  Rs. {product.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Sales Reports Component
const SalesReports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/reports/sales', {
        params: dateRange,
      });
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      // Demo data
      setReportData({
        summary: {
          totalSales: 2547890,
          totalOrders: 1234,
          totalCustomers: 856,
          averageOrderValue: 2064,
          salesChange: 12.5,
          ordersChange: 8.3,
          customersChange: 15.2,
        },
        dailySales: [
          { label: 'Mon', value: 125000 },
          { label: 'Tue', value: 180000 },
          { label: 'Wed', value: 145000 },
          { label: 'Thu', value: 210000 },
          { label: 'Fri', value: 285000 },
          { label: 'Sat', value: 320000 },
          { label: 'Sun', value: 275000 },
        ],
        topProducts: [
          { name: 'Premium Wireless Headphones', sold: 156, revenue: 624000 },
          { name: 'Smart Watch Pro Max', sold: 98, revenue: 490000 },
          { name: 'Bluetooth Speaker XL', sold: 234, revenue: 351000 },
          { name: 'USB-C Hub Adapter', sold: 312, revenue: 249600 },
          { name: 'Wireless Charger Pad', sold: 187, revenue: 187000 },
        ],
        categoryBreakdown: [
          { label: 'Electronics', value: 850000 },
          { label: 'Fashion', value: 650000 },
          { label: 'Home', value: 450000 },
          { label: 'Sports', value: 350000 },
          { label: 'Others', value: 247890 },
        ],
        paymentMethods: {
          card: 45,
          cod: 35,
          wallet: 12,
          upi: 8,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await api.get(`/admin/reports/export`, {
        params: { ...dateRange, format },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} report downloaded!`);
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const quickFilters = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
  ];

  const applyQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    
    if (days === 0) {
      // Today
      setDateRange({
        startDate: end.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      });
    } else if (days === 1) {
      // Yesterday
      start.setDate(start.getDate() - 1);
      setDateRange({
        startDate: start.toISOString().split('T')[0],
        endDate: start.toISOString().split('T')[0],
      });
    } else {
      start.setDate(start.getDate() - days);
      setDateRange({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-white/5 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-80 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-80 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiPieChart className="text-cyan-400" />
            Sales Reports
          </h1>
          <p className="text-gray-400 mt-1">
            {dateRange.startDate} to {dateRange.endDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Filters */}
          <div className="flex gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => applyQuickFilter(filter.days)}
                className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Date Range Picker */}
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />

          {/* Refresh */}
          <button
            onClick={fetchReport}
            className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            <FiRefreshCw />
          </button>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('excel')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
              <SiMicrosoftexcel />
              Excel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
              <VscFilePdf />
              PDF
            </motion.button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title="Total Sales"
          value={reportData?.summary.totalSales}
          change={reportData?.summary.salesChange}
          icon={FiDollarSign}
          color="bg-green-500"
          prefix="Rs. "
        />
        <StatsCard
          title="Total Orders"
          value={reportData?.summary.totalOrders}
          change={reportData?.summary.ordersChange}
          icon={FiShoppingCart}
          color="bg-purple-500"
        />
        <StatsCard
          title="Customers"
          value={reportData?.summary.totalCustomers}
          change={reportData?.summary.customersChange}
          icon={FiUsers}
          color="bg-cyan-500"
        />
        <StatsCard
          title="Avg. Order Value"
          value={reportData?.summary.averageOrderValue}
          icon={FiTrendingUp}
          color="bg-orange-500"
          prefix="Rs. "
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        <SimpleBarChart
          data={reportData?.dailySales || []}
          title="Daily Sales"
        />
        <SimpleBarChart
          data={reportData?.categoryBreakdown || []}
          title="Sales by Category"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="col-span-2">
          <TopProductsTable products={reportData?.topProducts || []} />
        </div>

        {/* Payment Methods */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FiPieChart className="text-cyan-400" />
            Payment Methods
          </h3>
          <div className="space-y-4">
            {Object.entries(reportData?.paymentMethods || {}).map(([method, percentage]) => (
              <div key={method}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400 capitalize">{method === 'cod' ? 'Cash on Delivery' : method.toUpperCase()}</span>
                  <span className="text-white font-medium">{percentage}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      method === 'card' ? 'bg-blue-500' :
                      method === 'cod' ? 'bg-green-500' :
                      method === 'wallet' ? 'bg-purple-500' : 'bg-cyan-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
