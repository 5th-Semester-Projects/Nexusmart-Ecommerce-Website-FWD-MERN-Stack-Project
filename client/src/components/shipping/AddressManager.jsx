import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, 
  FiHome, FiBriefcase, FiMap, FiNavigation, FiStar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../utils/api';

const AddressManager = ({ 
  addresses = [], 
  onAddressSelect, 
  onAddressUpdate, 
  selectedAddressId = null,
  mode = 'select', // 'select' | 'manage'
  showTitle = true 
}) => {
  const [localAddresses, setLocalAddresses] = useState(addresses);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    country: 'Pakistan',
    zipCode: '',
    isDefault: false,
  });

  useEffect(() => {
    setLocalAddresses(addresses);
  }, [addresses]);

  const addressTypeIcons = {
    home: FiHome,
    office: FiBriefcase,
    other: FiMap,
  };

  const pakistanStates = [
    'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 
    'Islamabad', 'Azad Kashmir', 'Gilgit-Baltistan'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      street: '',
      city: '',
      state: '',
      country: 'Pakistan',
      zipCode: '',
      isDefault: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.street || formData.street.length < 10) {
      toast.error('Please enter a complete street address');
      return;
    }
    if (!formData.city || formData.city.length < 2) {
      toast.error('Please enter a valid city');
      return;
    }
    if (!formData.state) {
      toast.error('Please select a state/province');
      return;
    }
    if (!formData.zipCode || !/^\d{5}$/.test(formData.zipCode)) {
      toast.error('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);
    try {
      let updatedAddresses;
      
      if (editingId) {
        // Update existing address
        updatedAddresses = localAddresses.map(addr => 
          addr._id === editingId ? { ...addr, ...formData } : addr
        );
      } else {
        // Add new address
        const newAddress = {
          ...formData,
          _id: `temp_${Date.now()}`, // Temporary ID until saved
        };
        updatedAddresses = [...localAddresses, newAddress];
      }

      // If setting as default, remove default from others
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr._id === (editingId || `temp_${Date.now()}`) ? true : false
        }));
      }

      setLocalAddresses(updatedAddresses);
      
      // Call parent update handler
      if (onAddressUpdate) {
        await onAddressUpdate(updatedAddresses);
      }

      toast.success(editingId ? 'Address updated!' : 'Address added!');
      resetForm();
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      type: address.type || 'home',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'Pakistan',
      zipCode: address.zipCode || '',
      isDefault: address.isDefault || false,
    });
    setEditingId(address._id);
    setIsAdding(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    const updatedAddresses = localAddresses.filter(addr => addr._id !== addressId);
    setLocalAddresses(updatedAddresses);
    
    if (onAddressUpdate) {
      await onAddressUpdate(updatedAddresses);
    }
    
    toast.success('Address deleted');
  };

  const handleSelect = (address) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  const handleSetDefault = async (addressId) => {
    const updatedAddresses = localAddresses.map(addr => ({
      ...addr,
      isDefault: addr._id === addressId
    }));
    
    setLocalAddresses(updatedAddresses);
    
    if (onAddressUpdate) {
      await onAddressUpdate(updatedAddresses);
    }
    
    toast.success('Default address updated');
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FiMapPin className="text-cyan-400" />
            {mode === 'select' ? 'Select Delivery Address' : 'Manage Addresses'}
          </h3>
          {!isAdding && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <FiPlus /> Add New Address
            </motion.button>
          )}
        </div>
      )}

      {/* Address Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 rounded-2xl border-2 border-purple-500/50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h4>
                <button
                  onClick={resetForm}
                  className="p-2 text-purple-400 hover:text-red-400 transition-colors"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Address Type */}
                <div>
                  <label className="block text-purple-300 text-sm mb-2">Address Type</label>
                  <div className="flex gap-3">
                    {['home', 'office', 'other'].map((type) => {
                      const Icon = addressTypeIcons[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                            formData.type === type
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                          }`}
                        >
                          <Icon className="text-sm" />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-purple-300 text-sm mb-2">Street Address *</label>
                  <textarea
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="House no, Street name, Area"
                    className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-300 text-sm mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Lahore"
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-300 text-sm mb-2">State/Province *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-all"
                    >
                      <option value="">Select State</option>
                      {pakistanStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ZIP Code and Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-300 text-sm mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setFormData(prev => ({ ...prev, zipCode: val }));
                      }}
                      placeholder="54000"
                      maxLength="5"
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-300 text-sm mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-all"
                      readOnly
                    />
                  </div>
                </div>

                {/* Set as Default */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-purple-500/30 bg-gray-900/50 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-purple-300">Set as default address</span>
                </label>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiCheck /> {editingId ? 'Update Address' : 'Save Address'}
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address List */}
      <div className="space-y-3">
        {localAddresses.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <FiMapPin className="w-12 h-12 mx-auto text-purple-500/50 mb-3" />
            <p className="text-purple-300/70">No saved addresses yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mx-auto"
            >
              <FiPlus /> Add your first address
            </button>
          </div>
        ) : (
          localAddresses.map((address) => {
            const Icon = addressTypeIcons[address.type] || FiMap;
            const isSelected = selectedAddressId === address._id;

            return (
              <motion.div
                key={address._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => mode === 'select' && handleSelect(address)}
                className={`glass-card p-4 rounded-2xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-2 border-cyan-500 bg-cyan-500/10' 
                    : 'border-2 border-transparent hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Address Type Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600' 
                      : 'bg-purple-900/50'
                  }`}>
                    <Icon className={`text-xl ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                  </div>

                  {/* Address Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold capitalize">{address.type}</span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                          <FiStar className="text-xs" /> Default
                        </span>
                      )}
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-purple-300/80 text-sm">{address.street}</p>
                    <p className="text-purple-300/60 text-sm">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-purple-300/50 text-xs">{address.country}</p>
                  </div>

                  {/* Action Buttons */}
                  {mode === 'manage' && (
                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSetDefault(address._id); }}
                          className="p-2 text-purple-400 hover:text-yellow-400 transition-colors"
                          title="Set as default"
                        >
                          <FiStar />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(address); }}
                        className="p-2 text-purple-400 hover:text-cyan-400 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(address._id); }}
                        className="p-2 text-purple-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {mode === 'select' && (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-cyan-500 bg-cyan-500' 
                        : 'border-purple-500/50'
                    }`}>
                      {isSelected && <FiCheck className="text-white text-sm" />}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AddressManager;
