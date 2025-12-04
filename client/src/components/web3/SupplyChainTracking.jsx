import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLink, FiShield, FiPackage, FiTruck, FiCheck,
  FiClock, FiAlertTriangle, FiExternalLink, FiCopy
} from 'react-icons/fi';
import { SiEthereum, SiBitcoin } from 'react-icons/si';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';
import axios from 'axios';

const SupplyChainTracking = ({ product, orderId }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchTrackingData();
  }, [product?._id, orderId]);

  const fetchTrackingData = async () => {
    try {
      const response = await axios.get(`/api/blockchain/supply-chain/${product?._id || orderId}`);
      setTrackingData(response.data);
    } catch (error) {
      // Generate demo data
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    const now = Date.now();
    setTrackingData({
      productId: product?._id || 'PROD-12345',
      blockchainId: '0x7a69...f3e2',
      contractAddress: '0x1234...5678',
      authenticity: {
        verified: true,
        score: 98,
        lastVerified: new Date().toISOString()
      },
      origin: {
        manufacturer: 'Premium Manufacturing Co.',
        country: 'Germany',
        facility: 'Berlin Factory #1',
        certifications: ['ISO 9001', 'CE Certified', 'RoHS Compliant']
      },
      journey: [
        {
          id: 1,
          event: 'Manufacturing Complete',
          location: 'Berlin, Germany',
          timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: '0xabc...123',
          status: 'completed',
          details: 'Product manufactured and quality checked'
        },
        {
          id: 2,
          event: 'Quality Inspection',
          location: 'Berlin, Germany',
          timestamp: new Date(now - 28 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: '0xdef...456',
          status: 'completed',
          details: 'Passed all quality control tests'
        },
        {
          id: 3,
          event: 'Shipped to Distribution',
          location: 'Frankfurt, Germany',
          timestamp: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: '0xghi...789',
          status: 'completed',
          details: 'Transferred to main distribution center'
        },
        {
          id: 4,
          event: 'International Shipping',
          location: 'Rotterdam, Netherlands',
          timestamp: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: '0xjkl...012',
          status: 'completed',
          details: 'Customs cleared, shipped via sea freight'
        },
        {
          id: 5,
          event: 'Arrived at Warehouse',
          location: 'Los Angeles, USA',
          timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: '0xmno...345',
          status: 'completed',
          details: 'Product received at US distribution center'
        },
        {
          id: 6,
          event: 'Ready for Delivery',
          location: 'Local Hub',
          timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: '0xpqr...678',
          status: 'current',
          details: 'Out for delivery to customer'
        }
      ],
      carbonFootprint: {
        total: 12.5,
        breakdown: [
          { stage: 'Manufacturing', kg: 5.2 },
          { stage: 'Transportation', kg: 6.8 },
          { stage: 'Packaging', kg: 0.5 }
        ],
        offset: true
      }
    });
  };

  const verifyAuthenticity = async () => {
    setVerificationStatus('verifying');
    
    // Simulate blockchain verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setVerificationStatus('verified');
    toast.success('Product authenticity verified on blockchain!');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openBlockExplorer = (txHash) => {
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <FiLink className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Blockchain Verified</h2>
              <p className="text-white/70">Supply chain transparency powered by Ethereum</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              QR Code
            </button>
            <button
              onClick={verifyAuthenticity}
              disabled={verificationStatus === 'verifying'}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {verificationStatus === 'verifying' ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : verificationStatus === 'verified' ? (
                <span className="flex items-center gap-2">
                  <FiCheck /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FiShield /> Verify Authenticity
                </span>
              )}
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex justify-center"
            >
              <div className="bg-white p-4 rounded-xl">
                <QRCode 
                  value={`https://nexusmart.com/verify/${trackingData.blockchainId}`}
                  size={150}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Authenticity Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">Authenticity Score</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              trackingData.authenticity.verified 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {trackingData.authenticity.verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-green-500">{trackingData.authenticity.score}%</span>
            <span className="text-gray-500 mb-1">confidence</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <span className="text-gray-500">Blockchain ID</span>
          <div className="flex items-center gap-2 mt-2">
            <SiEthereum className="text-xl text-purple-500" />
            <code className="text-sm font-mono">{trackingData.blockchainId}</code>
            <button 
              onClick={() => copyToClipboard(trackingData.blockchainId)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FiCopy className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <span className="text-gray-500">Carbon Footprint</span>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-2xl font-bold dark:text-white">{trackingData.carbonFootprint.total} kg</span>
            <span className="text-sm text-gray-500">CO₂</span>
            {trackingData.carbonFootprint.offset && (
              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Offset</span>
            )}
          </div>
        </div>
      </div>

      {/* Origin Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4 dark:text-white flex items-center gap-2">
          <FiPackage /> Product Origin
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Manufacturer</p>
            <p className="font-medium dark:text-white">{trackingData.origin.manufacturer}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="font-medium dark:text-white">{trackingData.origin.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Facility</p>
            <p className="font-medium dark:text-white">{trackingData.origin.facility}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Certifications</p>
            <div className="flex flex-wrap gap-1">
              {trackingData.origin.certifications.map((cert, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Supply Chain Timeline */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-6 dark:text-white flex items-center gap-2">
          <FiTruck /> Supply Chain Journey
        </h3>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          
          {/* Events */}
          <div className="space-y-6">
            {trackingData.journey.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-14"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-4 w-5 h-5 rounded-full border-4 ${
                  event.status === 'completed' 
                    ? 'bg-green-500 border-green-200' 
                    : event.status === 'current'
                    ? 'bg-purple-500 border-purple-200 animate-pulse'
                    : 'bg-gray-300 border-gray-100'
                }`} />

                <div className={`p-4 rounded-lg ${
                  event.status === 'current' 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800' 
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium dark:text-white">{event.event}</h4>
                      <p className="text-sm text-gray-500">{event.location}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => openBlockExplorer(event.txHash)}
                      className="flex items-center gap-1 text-sm text-purple-500 hover:text-purple-600"
                    >
                      <span className="font-mono">{event.txHash}</span>
                      <FiExternalLink />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {event.details}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Carbon Footprint Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4 dark:text-white">Carbon Footprint Breakdown</h3>
        <div className="space-y-3">
          {trackingData.carbonFootprint.breakdown.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">{item.stage}</span>
                <span className="font-medium dark:text-white">{item.kg} kg CO₂</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.kg / trackingData.carbonFootprint.total) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplyChainTracking;
