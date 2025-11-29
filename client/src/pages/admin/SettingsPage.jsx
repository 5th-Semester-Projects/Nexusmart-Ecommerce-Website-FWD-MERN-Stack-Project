import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiSave,
  FiGlobe,
  FiMail,
  FiDollarSign,
  FiTruck,
  FiShield,
  FiBell,
  FiSettings,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const SettingSection = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
  >
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // General
    storeName: 'NexusMart',
    storeEmail: 'support@nexusmart.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Commerce Street, Digital City, DC 12345',
    
    // Currency & Tax
    currency: 'USD',
    taxRate: 8.5,
    enableTax: true,
    
    // Shipping
    freeShippingThreshold: 100,
    standardShippingRate: 9.99,
    expressShippingRate: 19.99,
    
    // Notifications
    orderNotifications: true,
    stockAlerts: true,
    reviewAlerts: true,
    weeklyReports: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAttempts: 5,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    toast.success('Settings saved successfully!');
  };

  return (
    <>
      <Helmet>
        <title>Settings - NexusMart Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your store configuration
            </p>
          </div>
          <Button variant="primary" icon={FiSave} onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <SettingSection title="General Settings" icon={FiGlobe}>
            <div className="space-y-4">
              <Input
                label="Store Name"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
              />
              <Input
                label="Store Email"
                name="storeEmail"
                type="email"
                value={settings.storeEmail}
                onChange={handleChange}
                icon={FiMail}
              />
              <Input
                label="Store Phone"
                name="storePhone"
                value={settings.storePhone}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Store Address
                </label>
                <textarea
                  name="storeAddress"
                  value={settings.storeAddress}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
          </SettingSection>

          {/* Currency & Tax */}
          <SettingSection title="Currency & Tax" icon={FiDollarSign}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Currency
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PKR">PKR (₨)</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Enable Tax</p>
                  <p className="text-sm text-gray-500">Apply tax to orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableTax"
                    checked={settings.enableTax}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {settings.enableTax && (
                <Input
                  label="Tax Rate (%)"
                  name="taxRate"
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={handleChange}
                />
              )}
            </div>
          </SettingSection>

          {/* Shipping */}
          <SettingSection title="Shipping" icon={FiTruck}>
            <div className="space-y-4">
              <Input
                label="Free Shipping Threshold ($)"
                name="freeShippingThreshold"
                type="number"
                value={settings.freeShippingThreshold}
                onChange={handleChange}
                helperText="Orders above this amount get free shipping"
              />
              <Input
                label="Standard Shipping Rate ($)"
                name="standardShippingRate"
                type="number"
                step="0.01"
                value={settings.standardShippingRate}
                onChange={handleChange}
              />
              <Input
                label="Express Shipping Rate ($)"
                name="expressShippingRate"
                type="number"
                step="0.01"
                value={settings.expressShippingRate}
                onChange={handleChange}
              />
            </div>
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications" icon={FiBell}>
            <div className="space-y-4">
              {[
                { name: 'orderNotifications', label: 'Order Notifications', desc: 'Get notified on new orders' },
                { name: 'stockAlerts', label: 'Low Stock Alerts', desc: 'Alert when stock is running low' },
                { name: 'reviewAlerts', label: 'Review Notifications', desc: 'Notify on new product reviews' },
                { name: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly sales reports' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={settings[item.name]}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </SettingSection>

          {/* Security */}
          <SettingSection title="Security" icon={FiShield}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add extra security to admin accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <Input
                label="Session Timeout (minutes)"
                name="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={handleChange}
                helperText="Automatically log out after inactivity"
              />
              <Input
                label="Max Login Attempts"
                name="loginAttempts"
                type="number"
                value={settings.loginAttempts}
                onChange={handleChange}
                helperText="Lock account after failed attempts"
              />
            </div>
          </SettingSection>
        </div>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end">
          <Button variant="primary" icon={FiSave} onClick={handleSave}>
            Save All Changes
          </Button>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
