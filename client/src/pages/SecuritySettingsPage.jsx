import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiSmartphone, FiMonitor, FiAlertTriangle } from 'react-icons/fi';
import { TwoFactorAuth, LoginHistory } from '../components/security';

const SecuritySettingsPage = () => {
  const [activeSection, setActiveSection] = useState('2fa');

  const sections = [
    { id: '2fa', label: 'Two-Factor Auth', icon: FiSmartphone },
    { id: 'sessions', label: 'Active Sessions', icon: FiMonitor },
    { id: 'history', label: 'Login History', icon: FiLock },
  ];

  return (
    <>
      <Helmet>
        <title>Security Settings - NexusMart</title>
        <meta name="description" content="Manage your account security settings" />
      </Helmet>

      <div className="min-h-screen relative py-12">
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden -z-10 bg-gradient-to-br from-purple-950 via-gray-950 to-purple-950/50"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 
                          bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6">
              <FiShield className="text-4xl text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Security Settings
            </h1>
            <p className="text-purple-300/70 text-lg">
              Protect your account with advanced security features
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="glass-card rounded-2xl p-4 sticky top-24">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-cyan-400 border border-cyan-500/30'
                          : 'text-purple-300 hover:bg-purple-500/10'
                      }`}
                    >
                      <section.icon className="text-xl" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Security Tips */}
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <FiAlertTriangle className="text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-400 font-semibold text-sm mb-1">Security Tip</h4>
                      <p className="text-yellow-300/70 text-xs">
                        Enable 2FA to add an extra layer of protection to your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              {activeSection === '2fa' && <TwoFactorAuth />}
              {activeSection === 'sessions' && <LoginHistory showOnlyActive={true} />}
              {activeSection === 'history' && <LoginHistory />}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecuritySettingsPage;
