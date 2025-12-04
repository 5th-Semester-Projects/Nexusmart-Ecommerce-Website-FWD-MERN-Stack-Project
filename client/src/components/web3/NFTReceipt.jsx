import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEthereum, FaReceipt, FaQrcode, FaExternalLinkAlt,
  FaCheck, FaClock, FaShieldAlt, FaCertificate,
  FaDownload, FaShare, FaCopy, FaWallet
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode.react';

const NFTReceipt = ({ order, onMint }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [nftData, setNftData] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Check if wallet is connected
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to mint NFT receipts');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      toast.success('Wallet connected!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  // Generate NFT metadata
  const generateNFTMetadata = () => {
    return {
      name: `NexusMart Receipt #${order._id}`,
      description: `Official purchase receipt for order ${order._id} on NexusMart`,
      image: generateReceiptImage(),
      attributes: [
        { trait_type: 'Order ID', value: order._id },
        { trait_type: 'Purchase Date', value: new Date(order.createdAt).toISOString() },
        { trait_type: 'Total Amount', value: `$${order.totalPrice}` },
        { trait_type: 'Items Count', value: order.orderItems?.length || 0 },
        { trait_type: 'Status', value: order.orderStatus },
        { trait_type: 'Verified', value: 'Yes' }
      ],
      properties: {
        order_id: order._id,
        buyer: order.user,
        items: order.orderItems,
        total: order.totalPrice,
        timestamp: order.createdAt
      }
    };
  };

  // Generate receipt image (placeholder - would be generated on server)
  const generateReceiptImage = () => {
    return `https://api.nexusmart.com/receipts/${order._id}/image`;
  };

  // Mint NFT receipt
  const mintNFTReceipt = async () => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }

    setIsMinting(true);
    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const metadata = generateNFTMetadata();
      
      // In production, this would call a smart contract
      const mockNFT = {
        tokenId: Math.floor(Math.random() * 1000000),
        contractAddress: '0x1234...5678',
        transactionHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        metadata,
        mintedAt: new Date().toISOString(),
        owner: walletAddress,
        network: 'Ethereum',
        openseaUrl: `https://opensea.io/assets/ethereum/0x1234...5678/${Math.floor(Math.random() * 1000000)}`
      };

      setNftData(mockNFT);
      toast.success('NFT Receipt minted successfully!');
      
      if (onMint) onMint(mockNFT);
    } catch (error) {
      toast.error('Failed to mint NFT receipt');
    } finally {
      setIsMinting(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Format address
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <FaCertificate className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">NFT Receipt</h3>
            <p className="text-sm text-gray-400">Blockchain-verified purchase proof</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FaEthereum className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-400">Ethereum</span>
        </div>
      </div>

      {/* Order Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-400">Order ID</p>
            <p className="text-white font-mono">{order._id}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${
            order.orderStatus === 'Delivered' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {order.orderStatus}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">Date</p>
            <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Items</p>
            <p className="text-white">{order.orderItems?.length || 0} products</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total</span>
            <span className="text-2xl font-bold text-green-400">${order.totalPrice}</span>
          </div>
        </div>
      </motion.div>

      {/* NFT Status */}
      {!nftData ? (
        <div className="space-y-4">
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FaShieldAlt, text: 'Immutable Proof' },
              { icon: FaCheck, text: 'Verified Ownership' },
              { icon: FaClock, text: 'Permanent Record' },
              { icon: FaShare, text: 'Transferable' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                <item.icon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Wallet Connection */}
          {!walletConnected ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={connectWallet}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FaWallet className="w-5 h-5" />
              Connect Wallet
            </motion.button>
          ) : (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCheck className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Wallet Connected</span>
              </div>
              <span className="text-gray-400 font-mono text-sm">{formatAddress(walletAddress)}</span>
            </div>
          )}

          {/* Mint Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={mintNFTReceipt}
            disabled={isMinting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isMinting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Minting NFT...
              </>
            ) : (
              <>
                <FaReceipt className="w-5 h-5" />
                Mint NFT Receipt
              </>
            )}
          </motion.button>

          <p className="text-xs text-center text-gray-500">
            Gas fees will apply. Estimated cost: ~0.005 ETH
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Success Banner */}
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3">
            <FaCheck className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-green-400 font-bold">NFT Minted Successfully!</p>
              <p className="text-sm text-gray-400">Your receipt is now on the blockchain</p>
            </div>
          </div>

          {/* NFT Details */}
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Token ID</span>
              <span className="text-white font-mono">#{nftData.tokenId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Contract</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">{formatAddress(nftData.contractAddress)}</span>
                <button onClick={() => copyToClipboard(nftData.contractAddress)}>
                  <FaCopy className="w-4 h-4 text-gray-500 hover:text-white" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Transaction</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">{formatAddress(nftData.transactionHash)}</span>
                <a href={`https://etherscan.io/tx/${nftData.transactionHash}`} target="_blank" rel="noopener noreferrer">
                  <FaExternalLinkAlt className="w-3 h-3 text-gray-500 hover:text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowQR(!showQR)}
              className="py-3 bg-gray-800 text-white rounded-xl flex items-center justify-center gap-2"
            >
              <FaQrcode className="w-4 h-4" />
              QR Code
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.02 }}
              href={nftData.openseaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2"
            >
              View on OpenSea
              <FaExternalLinkAlt className="w-3 h-3" />
            </motion.a>
          </div>

          {/* QR Code */}
          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center p-4 bg-white rounded-xl"
              >
                <QRCode 
                  value={nftData.openseaUrl}
                  size={200}
                  level="H"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Download/Share */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex-1 py-3 bg-gray-800 text-white rounded-xl flex items-center justify-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              Download
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex-1 py-3 bg-gray-800 text-white rounded-xl flex items-center justify-center gap-2"
            >
              <FaShare className="w-4 h-4" />
              Share
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NFTReceipt;
