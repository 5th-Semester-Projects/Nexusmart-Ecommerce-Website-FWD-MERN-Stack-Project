import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiCopy, FiLogOut, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import useWeb3 from '../../hooks/useWeb3';
import Button from '../common/Button';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const WalletConnect = () => {
  const {
    account,
    chainId,
    balance,
    isConnecting,
    isConnected,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3();

  const [showModal, setShowModal] = useState(false);

  const networks = {
    1: { name: 'Ethereum Mainnet', color: 'bg-blue-500', symbol: 'ETH' },
    11155111: { name: 'Sepolia Testnet', color: 'bg-purple-500', symbol: 'SepoliaETH' },
    137: { name: 'Polygon Mainnet', color: 'bg-purple-600', symbol: 'MATIC' },
    80001: { name: 'Mumbai Testnet', color: 'bg-purple-400', symbol: 'MATIC' },
  };

  const currentNetwork = networks[chainId] || { name: 'Unknown', color: 'bg-gray-500', symbol: 'ETH' };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success('Address copied to clipboard');
    }
  };

  const viewOnExplorer = () => {
    if (account && chainId) {
      const explorerUrls = {
        1: `https://etherscan.io/address/${account}`,
        11155111: `https://sepolia.etherscan.io/address/${account}`,
        137: `https://polygonscan.com/address/${account}`,
        80001: `https://mumbai.polygonscan.com/address/${account}`,
      };
      const url = explorerUrls[chainId] || `https://etherscan.io/address/${account}`;
      window.open(url, '_blank');
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://metamask.io/download/', '_blank')}
        >
          Install MetaMask
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={connectWallet}
        loading={isConnecting}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <div className={`w-2 h-2 ${currentNetwork.color} rounded-full animate-pulse`}></div>
          <span className="text-sm font-semibold hidden sm:inline">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <span className="text-xs opacity-80 hidden md:inline">
            {parseFloat(balance).toFixed(4)} {currentNetwork.symbol}
          </span>
        </button>
      </div>

      {/* Wallet Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Wallet Details"
        size="md"
      >
        <div className="space-y-6">
          {/* Account Info */}
          <div className="p-4 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Account</span>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500 w-4 h-4" />
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {account.slice(0, 10)}...{account.slice(-8)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Copy Address"
                >
                  <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={viewOnExplorer}
                  className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="View on Explorer"
                >
                  <FiExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Balance</p>
            <p className="text-4xl font-bold gradient-text mb-1">
              {parseFloat(balance).toFixed(6)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentNetwork.symbol}</p>
          </div>

          {/* Network */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Network
            </label>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 ${currentNetwork.color} rounded-full`}></div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentNetwork.name}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Chain ID: {chainId}
              </span>
            </div>

            {/* Quick Network Switch */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(networks).map(([id, network]) => (
                <button
                  key={id}
                  onClick={() => {
                    switchNetwork(parseInt(id));
                    setShowModal(false);
                  }}
                  disabled={parseInt(id) === chainId}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    parseInt(id) === chainId
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Never share your private keys or seed phrase with anyone. NexusMart will never ask for them.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
            <Button
              variant="danger"
              fullWidth
              icon={FiLogOut}
              onClick={() => {
                disconnectWallet();
                setShowModal(false);
              }}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WalletConnect;
