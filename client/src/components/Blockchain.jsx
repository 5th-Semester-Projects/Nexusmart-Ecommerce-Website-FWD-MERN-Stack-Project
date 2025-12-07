import React, { useState, useEffect } from 'react';
import axios from 'axios';

// NFT Product Card
export const NFTProductCard = ({ nftProduct }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="relative">
        <img 
          src={nftProduct.images?.[0] || '/placeholder-nft.png'} 
          alt={nftProduct.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          NFT
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{nftProduct.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{nftProduct.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Token ID:</span>
            <span className="font-mono text-xs">{nftProduct.nftDetails?.tokenId?.substring(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Edition:</span>
            <span>{nftProduct.nftDetails?.edition}/{nftProduct.nftDetails?.totalSupply}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Blockchain:</span>
            <span>{nftProduct.nftDetails?.metadata?.blockchain || 'Ethereum'}</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-purple-600">${nftProduct.price}</span>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Buy NFT
          </button>
        </div>
      </div>
    </div>
  );
};

// NFT Gallery
export const NFTGallery = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      const response = await axios.get('/api/next-gen/blockchain/nft/list');
      setNfts(response.data.nftProducts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">NFT Marketplace</h2>
      
      {loading ? (
        <div className="text-center py-8">Loading NFTs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map(nft => (
            <NFTProductCard key={nft._id} nftProduct={nft} />
          ))}
        </div>
      )}
    </div>
  );
};

// Crypto Payment Component
export const CryptoPayment = ({ orderId, amount }) => {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const cryptoCurrencies = [
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'USDT', name: 'Tether', icon: '₮' },
    { code: 'BNB', name: 'Binance Coin', icon: 'BNB' },
    { code: 'MATIC', name: 'Polygon', icon: 'MATIC' }
  ];

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/next-gen/blockchain/crypto/initiate', {
        orderId,
        cryptocurrency: selectedCrypto,
        amount
      });
      setPaymentDetails(response.data.paymentDetails);
    } catch (error) {
      console.error('Error initiating crypto payment:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Pay with Cryptocurrency</h2>
      
      {!paymentDetails ? (
        <div>
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Total Amount: ${amount}</p>
            <h3 className="font-semibold mb-3">Select Cryptocurrency:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cryptoCurrencies.map(crypto => (
                <button
                  key={crypto.code}
                  onClick={() => setSelectedCrypto(crypto.code)}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center ${
                    selectedCrypto === crypto.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-2">{crypto.icon}</span>
                  <span className="font-semibold">{crypto.code}</span>
                  <span className="text-xs text-gray-600">{crypto.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={initiatePayment}
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⏱️ Payment expires in 30 minutes
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Send exactly:</h3>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-lg">
              {paymentDetails.cryptoAmount} {paymentDetails.cryptocurrency}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">To this address:</h3>
            <div className="bg-gray-100 p-4 rounded-lg break-all font-mono text-sm">
              {paymentDetails.paymentAddress}
            </div>
            <button className="mt-2 text-blue-500 text-sm">Copy Address</button>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-center text-sm mb-2">Scan QR Code</p>
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                QR Code
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Exchange Rate: 1 {paymentDetails.cryptocurrency} = ${paymentDetails.exchangeRate}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Product Authenticity Verification
export const AuthenticityVerification = () => {
  const [productId, setProductId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/next-gen/blockchain/verify-authenticity', {
        productId,
        serialNumber
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error verifying product:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Verify Product Authenticity</h2>
      
      <form onSubmit={verifyProduct} className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">Product ID</label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Enter product ID"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Serial Number</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Enter serial number"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Verifying...' : 'Verify Product'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${
          result.isAuthentic ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">{result.isAuthentic ? '✓' : '✗'}</span>
            <h3 className="text-xl font-bold">
              {result.verificationStatus}
            </h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>Verification Hash:</strong> {result.verificationHash?.substring(0, 32)}...</p>
            <p><strong>Manufacturer:</strong> {result.manufacturer}</p>
            {result.isAuthentic && (
              <a 
                href={result.certificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-500 hover:underline"
              >
                View Blockchain Certificate →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Supply Chain Tracker
export const SupplyChainTracker = ({ productId }) => {
  const [supplyChain, setSupplyChain] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplyChain();
  }, [productId]);

  const fetchSupplyChain = async () => {
    try {
      const response = await axios.get(`/api/next-gen/blockchain/supply-chain/${productId}`);
      setSupplyChain(response.data.supplyChainHistory);
    } catch (error) {
      console.error('Error fetching supply chain:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Supply Chain Transparency</h2>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="relative">
          {supplyChain.map((event, index) => (
            <div key={event.step} className="flex mb-8">
              <div className="flex flex-col items-center mr-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  event.status === 'current' ? 'bg-blue-500' : 'bg-green-500'
                } text-white font-bold`}>
                  {event.step}
                </div>
                {index < supplyChain.length - 1 && (
                  <div className="w-1 h-16 bg-gray-300"></div>
                )}
              </div>
              
              <div className="flex-1 bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-lg">{event.eventType}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.location}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  Block: {event.blockHash?.substring(0, 16)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default {
  NFTGallery,
  NFTProductCard,
  CryptoPayment,
  AuthenticityVerification,
  SupplyChainTracker
};
