import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPackage,
  FiMapPin,
  FiUser,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import {
  fetchAdminOrders,
  updateOrderStatus,
  deleteOrder,
  clearSuccess,
  clearError,
} from '../../redux/slices/adminSlice';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: FiClock },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: FiPackage },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: FiTruck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: FiCheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: FiXCircle },
];

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, ordersLoading, actionLoading, success, error } = useSelector((state) => state.admin);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({ carrier: '', trackingNumber: '' });

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
      setShowStatusModal(false);
      setSelectedOrder(null);
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;
    dispatch(updateOrderStatus({
      orderId: selectedOrder._id,
      status: newStatus,
      trackingInfo: newStatus === 'shipped' ? trackingInfo : undefined,
    }));
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowStatusModal(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusConfig = (status) => {
    return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(searchLower) ||
      order.user?.firstName?.toLowerCase().includes(searchLower) ||
      order.user?.lastName?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower);
    const matchesStatus = !filterStatus || order.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Helmet>
        <title>Orders Management - NexusMart Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage customer orders ({orders.length} total)
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {ORDER_STATUSES.map((status) => {
            const count = orders.filter((o) => o.orderStatus === status.value).length;
            return (
              <motion.div
                key={status.value}
                whileHover={{ scale: 1.02 }}
                onClick={() => setFilterStatus(filterStatus === status.value ? '' : status.value)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  filterStatus === status.value
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'bg-white dark:bg-gray-800'
                } shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status.color}`}>
                    <status.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{status.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ordersLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-500">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.orderStatus);
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-medium text-gray-900 dark:text-white">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.user?.firstName} {order.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {order.user?.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${order.totalPrice?.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <statusConfig.icon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${
                            order.paymentStatus === 'paid'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openDetailsModal(order)}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openStatusModal(order)}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <FiTruck className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusConfig(selectedOrder.orderStatus).color}`}>
                {getStatusConfig(selectedOrder.orderStatus).label}
              </span>
            </div>

            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiUser /> Customer
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                  </p>
                  <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FiMail className="w-4 h-4" />
                    {selectedOrder.user?.email}
                  </p>
                  {selectedOrder.user?.phone && (
                    <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <FiPhone className="w-4 h-4" />
                      {selectedOrder.user?.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiMapPin /> Shipping Address
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                      </p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </>
                  ) : (
                    <p className="text-gray-400">No address provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.orderItems?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <img
                      src={item.image || '/placeholder-product.png'}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${selectedOrder.itemsPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>${selectedOrder.shippingPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>${selectedOrder.taxPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>${selectedOrder.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowDetailsModal(false)} fullWidth>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
        title="Update Order Status"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-mono font-bold text-gray-900 dark:text-white">
                #{selectedOrder._id.slice(-8).toUpperCase()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setNewStatus(status.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      newStatus === status.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <status.icon className={`w-4 h-4 ${newStatus === status.value ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className={newStatus === status.value ? 'text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                      {status.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking Info for Shipped status */}
            {newStatus === 'shipped' && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">Tracking Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Carrier</label>
                    <input
                      type="text"
                      value={trackingInfo.carrier}
                      onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                      placeholder="e.g., FedEx, UPS"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingInfo.trackingNumber}
                      onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                      placeholder="Enter tracking number"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowStatusModal(false)} fullWidth>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
                disabled={actionLoading || newStatus === selectedOrder.orderStatus}
                fullWidth
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrdersPage;
