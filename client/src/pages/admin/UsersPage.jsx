import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiCalendar,
  FiShoppingBag,
} from 'react-icons/fi';
import {
  fetchAdminUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  clearSuccess,
  clearError,
} from '../../redux/slices/adminSlice';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const ROLES = [
  { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  { value: 'seller', label: 'Seller', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
];

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, usersLoading, actionLoading, success, error } = useSelector((state) => state.admin);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
      setShowRoleModal(false);
      setShowStatusModal(false);
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleUpdateRole = () => {
    if (!selectedUser || !newRole) return;
    dispatch(updateUserRole({ userId: selectedUser._id, role: newRole }));
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const action = selectedUser.isBlocked ? 'unblock' : 'block';
    dispatch(toggleUserStatus({
      userId: selectedUser._id,
      action,
      reason: action === 'block' ? blockReason : undefined,
    }));
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    dispatch(deleteUser(selectedUser._id));
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setBlockReason('');
    setShowStatusModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus ||
      (filterStatus === 'active' && !user.isBlocked) ||
      (filterStatus === 'blocked' && user.isBlocked);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleConfig = (role) => {
    return ROLES.find((r) => r.value === role) || ROLES[0];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Helmet>
        <title>Users Management - NexusMart Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage user accounts and permissions ({users.length} total)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FiUserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => !u.isBlocked).length}
                </p>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <FiUserX className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.isBlocked).length}
                </p>
                <p className="text-sm text-gray-500">Blocked</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FiShield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
                <p className="text-sm text-gray-500">Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <FiShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.role === 'seller').length}
                </p>
                <p className="text-sm text-gray-500">Sellers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <option value="">All Roles</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
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
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {usersLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-500">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    const isCurrentUser = user._id === currentUser?._id;
                    return (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          isCurrentUser ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold">
                              {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {user.firstName} {user.lastName}
                                {isCurrentUser && (
                                  <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 rounded">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <FiMail className="w-3 h-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig.color}`}>
                            {user.role === 'admin' && <FiShield className="w-3 h-3" />}
                            {roleConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.isBlocked ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              <FiUserX className="w-3 h-3" />
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <FiUserCheck className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 text-sm">
                            <FiCalendar className="w-3 h-3" />
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openRoleModal(user)}
                              disabled={isCurrentUser}
                              className={`p-2 rounded-lg transition-colors ${
                                isCurrentUser
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              title="Change Role"
                            >
                              <FiShield className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openStatusModal(user)}
                              disabled={isCurrentUser}
                              className={`p-2 rounded-lg transition-colors ${
                                isCurrentUser
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : user.isBlocked
                                  ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  : 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                              }`}
                              title={user.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              {user.isBlocked ? <FiUserCheck className="w-4 h-4" /> : <FiUserX className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              disabled={isCurrentUser}
                              className={`p-2 rounded-lg transition-colors ${
                                isCurrentUser
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              title="Delete User"
                            >
                              <FiTrash2 className="w-4 h-4" />
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

      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        title="Change User Role"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                {selectedUser.firstName?.[0] || 'U'}
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Role
              </label>
              <div className="space-y-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setNewRole(role.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      newRole === role.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiShield className={newRole === role.value ? 'text-primary-600' : 'text-gray-400'} />
                    <span className={newRole === role.value ? 'text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowRoleModal(false)} fullWidth>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateRole}
                disabled={actionLoading || newRole === selectedUser.role}
                fullWidth
              >
                {actionLoading ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Block/Unblock Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedUser(null);
        }}
        title={selectedUser?.isBlocked ? 'Unblock User' : 'Block User'}
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                selectedUser.isBlocked
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {selectedUser.isBlocked ? (
                  <FiUserCheck className="w-8 h-8 text-green-600" />
                ) : (
                  <FiUserX className="w-8 h-8 text-red-600" />
                )}
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedUser.isBlocked ? 'Unblock' : 'Block'} {selectedUser.firstName} {selectedUser.lastName}?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedUser.isBlocked
                  ? 'This user will be able to access their account again.'
                  : 'This user will not be able to access their account.'}
              </p>
            </div>

            {!selectedUser.isBlocked && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for blocking..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowStatusModal(false)} fullWidth>
                Cancel
              </Button>
              <Button
                variant="primary"
                className={selectedUser.isBlocked ? '' : '!bg-red-600 hover:!bg-red-700'}
                onClick={handleToggleStatus}
                disabled={actionLoading}
                fullWidth
              >
                {actionLoading ? 'Processing...' : selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Delete User"
        size="sm"
      >
        {selectedUser && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete {selectedUser.firstName} {selectedUser.lastName}?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This action cannot be undone. All user data will be permanently removed.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} fullWidth>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="!bg-red-600 hover:!bg-red-700"
                onClick={handleDeleteUser}
                disabled={actionLoading}
                fullWidth
              >
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default UsersPage;
