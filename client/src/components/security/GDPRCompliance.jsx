import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiLock, FiCheck, FiX, FiAlertTriangle,
  FiDownload, FiTrash2, FiEye, FiEdit2, FiFileText
} from 'react-icons/fi';
import axios from 'axios';

// GDPR Context
const GDPRContext = createContext(null);

export const useGDPR = () => {
  const context = useContext(GDPRContext);
  if (!context) {
    return { consentGiven: false, preferences: {} };
  }
  return context;
};

// GDPR Provider
export const GDPRProvider = ({ children }) => {
  const [consentGiven, setConsentGiven] = useState(() => {
    return localStorage.getItem('gdpr_consent') === 'true';
  });
  
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('gdpr_preferences');
    return saved ? JSON.parse(saved) : {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
  });

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('gdpr_preferences', JSON.stringify(newPreferences));
  };

  const giveConsent = (prefs = preferences) => {
    setConsentGiven(true);
    localStorage.setItem('gdpr_consent', 'true');
    updatePreferences(prefs);
    
    // Send consent to server
    axios.post('/api/privacy/consent', { 
      consent: true, 
      preferences: prefs,
      timestamp: new Date().toISOString()
    }).catch(() => {});
  };

  const revokeConsent = () => {
    setConsentGiven(false);
    localStorage.removeItem('gdpr_consent');
    localStorage.removeItem('gdpr_preferences');
    
    axios.post('/api/privacy/consent', { 
      consent: false,
      timestamp: new Date().toISOString()
    }).catch(() => {});
  };

  return (
    <GDPRContext.Provider value={{ 
      consentGiven, 
      preferences, 
      updatePreferences, 
      giveConsent, 
      revokeConsent 
    }}>
      {children}
    </GDPRContext.Provider>
  );
};

// Cookie Consent Banner
export const CookieConsentBanner = () => {
  const { consentGiven, preferences, giveConsent } = useGDPR();
  const [showDetails, setShowDetails] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  if (consentGiven) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-2xl border-t dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FiShield className="text-purple-500 text-xl" />
              <h3 className="text-lg font-semibold dark:text-white">Cookie Consent</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              We use cookies to enhance your browsing experience, serve personalized content, 
              and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-600 hover:underline ml-1"
              >
                {showDetails ? 'Hide details' : 'Learn more'}
              </button>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => giveConsent({ ...localPrefs, necessary: true })}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors dark:text-white"
            >
              Accept Selected
            </button>
            <button
              onClick={() => giveConsent({
                necessary: true,
                analytics: true,
                marketing: true,
                personalization: true
              })}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Accept All
            </button>
          </div>
        </div>

        {/* Cookie Categories */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t dark:border-gray-700 grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden"
            >
              <CookieCategory
                title="Necessary"
                description="Essential for the website to function properly"
                checked={true}
                disabled={true}
              />
              <CookieCategory
                title="Analytics"
                description="Help us understand how visitors use our site"
                checked={localPrefs.analytics}
                onChange={(v) => setLocalPrefs({ ...localPrefs, analytics: v })}
              />
              <CookieCategory
                title="Marketing"
                description="Used to deliver relevant advertisements"
                checked={localPrefs.marketing}
                onChange={(v) => setLocalPrefs({ ...localPrefs, marketing: v })}
              />
              <CookieCategory
                title="Personalization"
                description="Remember your preferences and settings"
                checked={localPrefs.personalization}
                onChange={(v) => setLocalPrefs({ ...localPrefs, personalization: v })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Cookie Category Toggle
const CookieCategory = ({ title, description, checked, onChange, disabled = false }) => {
  return (
    <div className={`p-4 rounded-lg border ${disabled ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'} dark:border-gray-700`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium dark:text-white">{title}</h4>
        <button
          onClick={() => !disabled && onChange?.(!checked)}
          disabled={disabled}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            checked 
              ? 'bg-purple-500' 
              : 'bg-gray-300 dark:bg-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow"
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
};

// Privacy Dashboard Component
const PrivacyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dataRequests, setDataRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const fetchPrivacyData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/privacy/data');
      setDataRequests(response.data.requests || []);
    } catch (error) {
      // Demo data
      setDataRequests([
        { id: 1, type: 'export', status: 'completed', date: '2024-01-15', downloadUrl: '#' },
        { id: 2, type: 'access', status: 'pending', date: '2024-01-20' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const requestDataExport = async () => {
    try {
      await axios.post('/api/privacy/export-request');
      setDataRequests([
        { id: Date.now(), type: 'export', status: 'pending', date: new Date().toISOString().split('T')[0] },
        ...dataRequests
      ]);
    } catch (error) {
      // Demo
      setDataRequests([
        { id: Date.now(), type: 'export', status: 'pending', date: new Date().toISOString().split('T')[0] },
        ...dataRequests
      ]);
    }
  };

  const requestDataDeletion = async () => {
    try {
      await axios.post('/api/privacy/deletion-request');
      setShowDeleteModal(false);
    } catch (error) {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <FiShield className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Privacy Center</h2>
          <p className="text-gray-500">Manage your data and privacy settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'data', label: 'My Data' },
          { id: 'consents', label: 'Consents' },
          { id: 'rights', label: 'Your Rights' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold dark:text-white mb-4">Data Collection Summary</h3>
            <div className="space-y-4">
              <DataItem label="Account Information" status="collected" description="Name, email, profile data" />
              <DataItem label="Order History" status="collected" description="Past purchases and transactions" />
              <DataItem label="Browsing Data" status="limited" description="Page views, search queries" />
              <DataItem label="Marketing Data" status="not-collected" description="Advertising preferences" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="font-semibold dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={requestDataExport}
                className="w-full p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 flex items-center gap-3 transition-colors"
              >
                <FiDownload className="text-purple-500" />
                <div className="text-left">
                  <p className="font-medium dark:text-white">Download My Data</p>
                  <p className="text-sm text-gray-500">Get a copy of all your data</p>
                </div>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full p-4 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
              >
                <FiTrash2 className="text-red-500" />
                <div className="text-left">
                  <p className="font-medium text-red-600">Delete My Account</p>
                  <p className="text-sm text-gray-500">Permanently remove all data</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="font-semibold dark:text-white">Data Access Requests</h3>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {dataRequests.map((request) => (
              <div key={request.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    request.type === 'export' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {request.type === 'export' ? <FiDownload /> : <FiEye />}
                  </div>
                  <div>
                    <p className="font-medium dark:text-white capitalize">{request.type} Request</p>
                    <p className="text-sm text-gray-500">{request.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'completed' 
                      ? 'bg-green-100 text-green-600'
                      : request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                  }`}>
                    {request.status}
                  </span>
                  {request.status === 'completed' && request.downloadUrl && (
                    <a
                      href={request.downloadUrl}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consents Tab */}
      {activeTab === 'consents' && (
        <div className="space-y-4">
          <ConsentItem
            title="Marketing Communications"
            description="Receive promotional emails and offers"
            defaultChecked={false}
          />
          <ConsentItem
            title="Analytics & Performance"
            description="Help us improve by sharing usage data"
            defaultChecked={true}
          />
          <ConsentItem
            title="Personalized Recommendations"
            description="Get product suggestions based on your activity"
            defaultChecked={true}
          />
          <ConsentItem
            title="Third-Party Sharing"
            description="Share data with trusted partners"
            defaultChecked={false}
          />
        </div>
      )}

      {/* Rights Tab */}
      {activeTab === 'rights' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: 'Right to Access', description: 'Request a copy of your personal data', icon: FiEye },
            { title: 'Right to Rectification', description: 'Correct inaccurate personal data', icon: FiEdit2 },
            { title: 'Right to Erasure', description: 'Request deletion of your data', icon: FiTrash2 },
            { title: 'Right to Portability', description: 'Receive your data in a portable format', icon: FiDownload },
            { title: 'Right to Object', description: 'Object to processing of your data', icon: FiX },
            { title: 'Right to Restrict', description: 'Limit how your data is used', icon: FiLock }
          ].map((right, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <right.icon className="text-purple-600" />
                </div>
                <h4 className="font-medium dark:text-white">{right.title}</h4>
              </div>
              <p className="text-sm text-gray-500">{right.description}</p>
              <button className="mt-4 text-sm text-purple-600 hover:text-purple-700">
                Exercise this right →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="text-red-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold dark:text-white">Delete Account</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This action cannot be undone. All your data including order history, 
                saved addresses, and preferences will be permanently deleted.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={requestDataDeletion}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Data Item Component
const DataItem = ({ label, status, description }) => {
  const statusConfig = {
    'collected': { color: 'text-green-600 bg-green-100', label: 'Collected' },
    'limited': { color: 'text-yellow-600 bg-yellow-100', label: 'Limited' },
    'not-collected': { color: 'text-gray-500 bg-gray-100', label: 'Not Collected' }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium dark:text-white">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[status].color}`}>
        {statusConfig[status].label}
      </span>
    </div>
  );
};

// Consent Item Component
const ConsentItem = ({ title, description, defaultChecked }) => {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = async () => {
    setChecked(!checked);
    try {
      await axios.post('/api/privacy/consent-update', { 
        type: title, 
        value: !checked 
      });
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center justify-between">
      <div>
        <p className="font-medium dark:text-white">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={handleChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};

export default PrivacyDashboard;
