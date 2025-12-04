import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGoogle, FaFacebook, FaApple, FaTwitter, FaGithub,
  FaLinkedin, FaDiscord, FaSpotify, FaMicrosoft,
  FaShieldAlt, FaCheck, FaSpinner, FaUser
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const SocialLogin = ({ onLoginSuccess, onLoginError, providers = ['google', 'facebook', 'apple'] }) => {
  const [loading, setLoading] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [showProviders, setShowProviders] = useState(false);

  const allProviders = {
    google: {
      name: 'Google',
      icon: FaGoogle,
      color: '#EA4335',
      bgColor: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    },
    facebook: {
      name: 'Facebook',
      icon: FaFacebook,
      color: '#1877F2',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    apple: {
      name: 'Apple',
      icon: FaApple,
      color: '#000000',
      bgColor: 'bg-black',
      hoverColor: 'hover:bg-gray-900'
    },
    twitter: {
      name: 'Twitter',
      icon: FaTwitter,
      color: '#1DA1F2',
      bgColor: 'bg-sky-500',
      hoverColor: 'hover:bg-sky-600'
    },
    github: {
      name: 'GitHub',
      icon: FaGithub,
      color: '#333333',
      bgColor: 'bg-gray-800',
      hoverColor: 'hover:bg-gray-900'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: '#0A66C2',
      bgColor: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800'
    },
    discord: {
      name: 'Discord',
      icon: FaDiscord,
      color: '#5865F2',
      bgColor: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700'
    },
    spotify: {
      name: 'Spotify',
      icon: FaSpotify,
      color: '#1DB954',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    },
    microsoft: {
      name: 'Microsoft',
      icon: FaMicrosoft,
      color: '#00A4EF',
      bgColor: 'bg-cyan-600',
      hoverColor: 'hover:bg-cyan-700'
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider) => {
    setLoading(provider);
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, this would redirect to OAuth provider
      const mockUser = {
        id: `${provider}_${Date.now()}`,
        provider,
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
      };

      setConnectedAccounts(prev => [...prev, provider]);
      toast.success(`Successfully logged in with ${allProviders[provider].name}!`);
      
      if (onLoginSuccess) onLoginSuccess(mockUser);
    } catch (error) {
      toast.error(`Failed to login with ${allProviders[provider].name}`);
      if (onLoginError) onLoginError(error);
    } finally {
      setLoading(null);
    }
  };

  // Disconnect account
  const disconnectAccount = async (provider) => {
    setConnectedAccounts(prev => prev.filter(p => p !== provider));
    toast.success(`Disconnected ${allProviders[provider].name} account`);
  };

  return (
    <div className="w-full">
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-900 text-gray-400">Or continue with</span>
        </div>
      </div>

      {/* Main providers */}
      <div className="space-y-3">
        {providers.slice(0, 3).map((providerKey) => {
          const provider = allProviders[providerKey];
          if (!provider) return null;
          const Icon = provider.icon;
          const isConnected = connectedAccounts.includes(providerKey);
          const isLoading = loading === providerKey;

          return (
            <motion.button
              key={providerKey}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => isConnected ? disconnectAccount(providerKey) : handleSocialLogin(providerKey)}
              disabled={loading !== null}
              className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all ${
                isConnected 
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                  : `${provider.bgColor} ${provider.hoverColor} text-white`
              } ${loading && !isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : isConnected ? (
                <FaCheck className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span>
                {isLoading 
                  ? 'Connecting...' 
                  : isConnected 
                    ? `Connected with ${provider.name}` 
                    : `Continue with ${provider.name}`
                }
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* More providers toggle */}
      {providers.length > 3 && (
        <>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowProviders(!showProviders)}
            className="w-full mt-4 py-2 text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2"
          >
            {showProviders ? 'Show less options' : `Show ${providers.length - 3} more options`}
            <motion.span
              animate={{ rotate: showProviders ? 180 : 0 }}
            >
              ▼
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {showProviders && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {providers.slice(3).map((providerKey) => {
                    const provider = allProviders[providerKey];
                    if (!provider) return null;
                    const Icon = provider.icon;
                    const isConnected = connectedAccounts.includes(providerKey);
                    const isLoading = loading === providerKey;

                    return (
                      <motion.button
                        key={providerKey}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => isConnected ? disconnectAccount(providerKey) : handleSocialLogin(providerKey)}
                        disabled={loading !== null}
                        className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          isConnected 
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                        }`}
                      >
                        {isLoading ? (
                          <FaSpinner className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                          <Icon 
                            className="w-6 h-6" 
                            style={{ color: isConnected ? '#10B981' : provider.color }}
                          />
                        )}
                        <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                          {provider.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Security notice */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
        <FaShieldAlt className="w-4 h-4" />
        <span>Secure authentication powered by OAuth 2.0</span>
      </div>

      {/* Connected accounts summary */}
      {connectedAccounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-800/50 rounded-xl"
        >
          <p className="text-sm text-gray-400 mb-3">Connected accounts:</p>
          <div className="flex flex-wrap gap-2">
            {connectedAccounts.map((providerKey) => {
              const provider = allProviders[providerKey];
              const Icon = provider.icon;
              return (
                <div
                  key={providerKey}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-full"
                >
                  <Icon className="w-4 h-4" style={{ color: provider.color }} />
                  <span className="text-sm text-gray-300">{provider.name}</span>
                  <button
                    onClick={() => disconnectAccount(providerKey)}
                    className="text-gray-500 hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SocialLogin;
