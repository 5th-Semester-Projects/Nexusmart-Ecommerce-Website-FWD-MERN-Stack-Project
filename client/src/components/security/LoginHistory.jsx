import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMonitor, FiSmartphone, FiTablet, FiGlobe, FiClock,
  FiMapPin, FiAlertTriangle, FiCheck, FiX, FiLogOut,
  FiRefreshCw, FiShield, FiChevronDown
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Get device icon based on type
const getDeviceIcon = (deviceType) => {
  const icons = {
    desktop: FiMonitor,
    mobile: FiSmartphone,
    tablet: FiTablet,
  };
  return icons[deviceType] || FiGlobe;
};

// Get browser icon/name
const getBrowserInfo = (userAgent) => {
  if (userAgent.includes('Chrome')) return { name: 'Chrome', color: 'text-yellow-400' };
  if (userAgent.includes('Firefox')) return { name: 'Firefox', color: 'text-orange-400' };
  if (userAgent.includes('Safari')) return { name: 'Safari', color: 'text-blue-400' };
  if (userAgent.includes('Edge')) return { name: 'Edge', color: 'text-cyan-400' };
  return { name: 'Unknown', color: 'text-gray-400' };
};

// Format date
const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Login Session Card
const SessionCard = ({ session, isCurrentSession, onRevoke }) => {
  const [showDetails, setShowDetails] = useState(false);
  const DeviceIcon = getDeviceIcon(session.deviceType);
  const browserInfo = getBrowserInfo(session.userAgent);

  return (
    <motion.div
      layout
      className={`rounded-2xl border overflow-hidden ${
        isCurrentSession
          ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30'
          : session.suspicious
          ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/30'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Device Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isCurrentSession ? 'bg-green-500/20' :
            session.suspicious ? 'bg-red-500/20' : 'bg-white/10'
          }`}>
            <DeviceIcon className={`text-xl ${
              isCurrentSession ? 'text-green-400' :
              session.suspicious ? 'text-red-400' : 'text-gray-400'
            }`} />
          </div>

          {/* Session Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${browserInfo.color}`}>
                {browserInfo.name}
              </span>
              <span className="text-gray-400">on</span>
              <span className="text-white font-medium">
                {session.os || 'Unknown OS'}
              </span>
              {isCurrentSession && (
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                  Current Session
                </span>
              )}
              {session.suspicious && (
                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full flex items-center gap-1">
                  <FiAlertTriangle className="text-xs" />
                  Suspicious
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <FiMapPin className="text-xs" />
                {session.location || 'Unknown Location'}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="text-xs" />
                {formatDate(session.lastActive)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiChevronDown className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            {!isCurrentSession && (
              <button
                onClick={() => onRevoke?.(session.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="End this session"
              >
                <FiLogOut />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 overflow-hidden"
          >
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">IP Address</span>
                <span className="text-white font-mono">{session.ip || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Login Time</span>
                <span className="text-white">{formatDate(session.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Active</span>
                <span className="text-white">{formatDate(session.lastActive)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Device</span>
                <span className="text-white">{session.device || 'Unknown Device'}</span>
              </div>
              {session.loginMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Login Method</span>
                  <span className="text-white capitalize">{session.loginMethod}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Login History Entry
const HistoryEntry = ({ entry }) => {
  const isSuccess = entry.status === 'success';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl ${
      isSuccess ? 'bg-white/5' : 'bg-red-900/20 border border-red-500/30'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'
      }`}>
        {isSuccess ? (
          <FiCheck className="text-green-400" />
        ) : (
          <FiX className="text-red-400" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-white font-medium">
          {isSuccess ? 'Successful Login' : 'Failed Login Attempt'}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <FiMapPin className="text-xs" />
            {entry.location || 'Unknown'}
          </span>
          <span>{entry.ip}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-400">{formatDate(entry.timestamp)}</p>
        {entry.method && (
          <p className="text-xs text-gray-500 capitalize">{entry.method}</p>
        )}
      </div>
    </div>
  );
};

// Main Login History Component
const LoginHistory = () => {
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'history'
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Demo data
      setSessions([
        {
          id: '1',
          deviceType: 'desktop',
          os: 'Windows 11',
          userAgent: 'Chrome/120.0',
          location: 'Lahore, Pakistan',
          ip: '39.45.xxx.xxx',
          createdAt: new Date(),
          lastActive: new Date(),
          device: 'Dell XPS 15',
          loginMethod: 'password',
        },
        {
          id: '2',
          deviceType: 'mobile',
          os: 'iOS 17',
          userAgent: 'Safari/605.1',
          location: 'Karachi, Pakistan',
          ip: '182.188.xxx.xxx',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
          device: 'iPhone 15 Pro',
          loginMethod: 'google',
        },
        {
          id: '3',
          deviceType: 'desktop',
          os: 'macOS Sonoma',
          userAgent: 'Firefox/121.0',
          location: 'New York, USA',
          ip: '192.168.xxx.xxx',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          device: 'MacBook Pro',
          loginMethod: 'password',
          suspicious: true,
        },
      ]);
      setCurrentSessionId('1');

      setHistory([
        { id: '1', status: 'success', location: 'Lahore, Pakistan', ip: '39.45.xxx.xxx', timestamp: new Date(), method: 'password' },
        { id: '2', status: 'success', location: 'Karachi, Pakistan', ip: '182.188.xxx.xxx', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), method: 'google' },
        { id: '3', status: 'failed', location: 'Unknown', ip: '103.xxx.xxx.xxx', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), method: 'password' },
        { id: '4', status: 'failed', location: 'Unknown', ip: '103.xxx.xxx.xxx', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), method: 'password' },
        { id: '5', status: 'success', location: 'New York, USA', ip: '192.168.xxx.xxx', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), method: 'password' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session ended successfully');
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Are you sure you want to end all other sessions?')) return;

    try {
      await api.delete('/auth/sessions/all');
      setSessions(prev => prev.filter(s => s.id === currentSessionId));
      toast.success('All other sessions ended');
    } catch (error) {
      toast.error('Failed to end sessions');
    }
  };

  const suspiciousCount = sessions.filter(s => s.suspicious).length;
  const failedAttempts = history.filter(h => h.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiShield className="text-cyan-400" />
            Security & Login History
          </h1>
          <p className="text-gray-400 mt-1">
            {sessions.length} active sessions • {failedAttempts} failed attempts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            <FiRefreshCw />
          </button>
          <button
            onClick={handleRevokeAllSessions}
            className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl font-medium transition-colors"
          >
            End All Other Sessions
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {suspiciousCount > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <FiAlertTriangle className="text-2xl text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-400">Suspicious Activity Detected</h3>
            <p className="text-sm text-gray-300">
              {suspiciousCount} suspicious session(s) found. Review and revoke if you don't recognize them.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 rounded-xl p-1 w-fit">
        {[
          { key: 'sessions', label: 'Active Sessions', count: sessions.length },
          { key: 'history', label: 'Login History', count: history.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'sessions' ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrentSession={session.id === currentSessionId}
              onRevoke={handleRevokeSession}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoginHistory;
