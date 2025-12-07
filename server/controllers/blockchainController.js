import Product from '../models/Product.js';
import User from '../models/User.js';
import crypto from 'crypto';

// Blockchain Integration Controller

// NFT Products Management

// Create NFT Product
export const createNFTProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      edition,
      totalSupply,
      royaltyPercentage,
      metadata
    } = req.body;

    // Generate unique token ID
    const tokenId = `NFT-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

    // Generate blockchain hash (simulated)
    const blockchainHash = generateBlockchainHash({
      tokenId,
      name,
      creator: req.user?.id,
      timestamp: Date.now()
    });

    const nftProduct = await Product.create({
      name,
      description,
      price,
      images: [imageUrl],
      category: category || 'nft',
      isNFT: true,
      nftDetails: {
        tokenId,
        blockchainHash,
        contractAddress: `0x${crypto.randomBytes(20).toString('hex')}`,
        standard: 'ERC-721',
        edition: edition || 1,
        totalSupply: totalSupply || 1,
        currentSupply: totalSupply || 1,
        royaltyPercentage: royaltyPercentage || 10,
        creatorAddress: req.user?.walletAddress || `0x${crypto.randomBytes(20).toString('hex')}`,
        metadata: {
          ...metadata,
          createdAt: new Date(),
          blockchain: 'Ethereum'
        }
      }
    });

    res.status(201).json({
      message: 'NFT product created successfully',
      nftProduct,
      tokenId,
      blockchainHash
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating NFT product', error: error.message });
  }
};

// Get NFT Product Details
export const getNFTProduct = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const nftProduct = await Product.findOne({
      'nftDetails.tokenId': tokenId,
      isNFT: true
    });

    if (!nftProduct) {
      return res.status(404).json({ message: 'NFT product not found' });
    }

    // Get ownership history
    const ownershipHistory = await getOwnershipHistory(tokenId);

    res.status(200).json({
      nftProduct,
      ownershipHistory,
      verificationStatus: 'verified'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching NFT product', error: error.message });
  }
};

// List All NFT Products
export const listNFTProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, priceRange } = req.query;

    const query = { isNFT: true, isActive: true };

    if (category) {
      query['nftDetails.metadata.category'] = category;
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      query.price = { $gte: min, $lte: max };
    }

    const nftProducts = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      nftProducts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error listing NFT products', error: error.message });
  }
};

// Crypto Payment Processing

// Initiate Crypto Payment
export const initiateCryptoPayment = async (req, res) => {
  try {
    const { orderId, cryptocurrency, amount } = req.body;

    // Supported cryptocurrencies: BTC, ETH, USDT, BNB
    const supportedCryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'MATIC'];

    if (!supportedCryptos.includes(cryptocurrency)) {
      return res.status(400).json({
        message: 'Unsupported cryptocurrency',
        supportedCryptos
      });
    }

    // Generate payment address for the cryptocurrency
    const paymentAddress = generateCryptoAddress(cryptocurrency);

    // Get current exchange rate
    const exchangeRate = await getCryptoExchangeRate(cryptocurrency);
    const cryptoAmount = (amount / exchangeRate).toFixed(8);

    const paymentDetails = {
      paymentId: `CRYPTO-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      orderId,
      cryptocurrency,
      cryptoAmount,
      fiatAmount: amount,
      exchangeRate,
      paymentAddress,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      qrCode: generateQRCode(paymentAddress, cryptoAmount, cryptocurrency),
      createdAt: new Date()
    };

    res.status(200).json({
      message: 'Crypto payment initiated',
      paymentDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating crypto payment', error: error.message });
  }
};

// Verify Crypto Payment
export const verifyCryptoPayment = async (req, res) => {
  try {
    const { paymentId, transactionHash } = req.body;

    // Verify transaction on blockchain (simulated)
    const verification = await verifyBlockchainTransaction(transactionHash);

    if (verification.confirmed) {
      res.status(200).json({
        message: 'Payment verified successfully',
        status: 'confirmed',
        confirmations: verification.confirmations,
        transactionHash
      });
    } else {
      res.status(202).json({
        message: 'Payment pending confirmation',
        status: 'pending',
        confirmations: verification.confirmations,
        requiredConfirmations: 3
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying crypto payment', error: error.message });
  }
};

// Product Authenticity Verification

// Verify Product Authenticity
export const verifyProductAuthenticity = async (req, res) => {
  try {
    const { productId, serialNumber } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Generate blockchain verification hash
    const verificationHash = generateVerificationHash(productId, serialNumber);

    // Check against blockchain records (simulated)
    const blockchainRecord = await verifyAgainstBlockchain(verificationHash);

    const verificationResult = {
      productId,
      serialNumber,
      isAuthentic: blockchainRecord.exists,
      verificationHash,
      blockchainTimestamp: blockchainRecord.timestamp,
      manufacturer: product.brand || 'Unknown',
      productionDate: blockchainRecord.productionDate,
      verificationStatus: blockchainRecord.exists ? 'Verified Authentic' : 'Cannot Verify',
      certificationUrl: `https://blockchain-verify.nexusmart.com/cert/${verificationHash}`
    };

    res.status(200).json(verificationResult);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying product authenticity', error: error.message });
  }
};

// Register Product on Blockchain
export const registerProductOnBlockchain = async (req, res) => {
  try {
    const {
      productId,
      serialNumber,
      manufacturer,
      productionDate,
      specifications
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create blockchain record
    const blockchainRecord = {
      recordId: `BC-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,
      productId,
      serialNumber,
      manufacturer,
      productionDate: new Date(productionDate),
      specifications,
      registeredAt: new Date(),
      blockHash: generateBlockchainHash({ productId, serialNumber, manufacturer }),
      transactionId: `TX-${crypto.randomBytes(16).toString('hex')}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000
    };

    // Store blockchain reference in product
    product.blockchainVerification = {
      isRegistered: true,
      blockchainRecord: blockchainRecord.recordId,
      transactionId: blockchainRecord.transactionId,
      blockHash: blockchainRecord.blockHash
    };

    await product.save();

    res.status(201).json({
      message: 'Product registered on blockchain successfully',
      blockchainRecord,
      verificationUrl: `https://blockchain-verify.nexusmart.com/${blockchainRecord.recordId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering product on blockchain', error: error.message });
  }
};

// Supply Chain Transparency

// Get Supply Chain History
export const getSupplyChainHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Generate supply chain history (simulated blockchain data)
    const supplyChainHistory = generateSupplyChainHistory(product);

    res.status(200).json({
      productId,
      productName: product.name,
      supplyChainHistory,
      blockchainVerified: true,
      totalSteps: supplyChainHistory.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supply chain history', error: error.message });
  }
};

// Add Supply Chain Event
export const addSupplyChainEvent = async (req, res) => {
  try {
    const { productId, eventType, location, description, timestamp } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const supplyChainEvent = {
      eventId: `SCE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      eventType, // manufactured, shipped, customs, delivered, etc.
      location,
      description,
      timestamp: new Date(timestamp || Date.now()),
      blockHash: generateBlockchainHash({ productId, eventType, timestamp }),
      verifiedBy: req.user?.id || 'system'
    };

    if (!product.supplyChain) {
      product.supplyChain = [];
    }

    product.supplyChain.push(supplyChainEvent);
    await product.save();

    res.status(201).json({
      message: 'Supply chain event added successfully',
      event: supplyChainEvent
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding supply chain event', error: error.message });
  }
};

// Helper Functions

function generateBlockchainHash(data) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

function generateCryptoAddress(cryptocurrency) {
  const prefixes = {
    BTC: '1',
    ETH: '0x',
    USDT: '0x',
    BNB: 'bnb',
    MATIC: '0x'
  };

  const prefix = prefixes[cryptocurrency] || '0x';
  const randomHex = crypto.randomBytes(20).toString('hex');

  return cryptocurrency === 'BTC' ? `${prefix}${randomHex.substring(0, 33)}` : `${prefix}${randomHex}`;
}

async function getCryptoExchangeRate(cryptocurrency) {
  // Simulated exchange rates (in production, fetch from API like CoinGecko)
  const rates = {
    BTC: 42000,
    ETH: 2200,
    USDT: 1,
    BNB: 310,
    MATIC: 0.85
  };

  return rates[cryptocurrency] || 1;
}

function generateQRCode(address, amount, cryptocurrency) {
  // In production, generate actual QR code image
  return `data:image/png;base64,QR_CODE_FOR_${cryptocurrency}_${address}`;
}

async function verifyBlockchainTransaction(transactionHash) {
  // Simulated blockchain verification
  const confirmations = Math.floor(Math.random() * 5);

  return {
    confirmed: confirmations >= 3,
    confirmations,
    transactionHash,
    blockNumber: Math.floor(Math.random() * 1000000)
  };
}

function generateVerificationHash(productId, serialNumber) {
  return generateBlockchainHash({ productId, serialNumber, salt: 'nexusmart' });
}

async function verifyAgainstBlockchain(verificationHash) {
  // Simulated blockchain verification
  return {
    exists: true,
    timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    productionDate: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000)
  };
}

function generateSupplyChainHistory(product) {
  return [
    {
      step: 1,
      eventType: 'Manufacturing',
      location: 'Factory - Shenzhen, China',
      timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'completed',
      blockHash: generateBlockchainHash({ step: 1, product: product._id })
    },
    {
      step: 2,
      eventType: 'Quality Check',
      location: 'QC Department - Shenzhen, China',
      timestamp: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
      status: 'completed',
      blockHash: generateBlockchainHash({ step: 2, product: product._id })
    },
    {
      step: 3,
      eventType: 'Shipping',
      location: 'Port - Shanghai, China',
      timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      status: 'completed',
      blockHash: generateBlockchainHash({ step: 3, product: product._id })
    },
    {
      step: 4,
      eventType: 'Customs Clearance',
      location: 'Port - Los Angeles, USA',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'completed',
      blockHash: generateBlockchainHash({ step: 4, product: product._id })
    },
    {
      step: 5,
      eventType: 'Warehouse Storage',
      location: 'Distribution Center - Texas, USA',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'completed',
      blockHash: generateBlockchainHash({ step: 5, product: product._id })
    },
    {
      step: 6,
      eventType: 'Ready for Sale',
      location: 'NexusMart Platform',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'current',
      blockHash: generateBlockchainHash({ step: 6, product: product._id })
    }
  ];
}

async function getOwnershipHistory(tokenId) {
  // Simulated ownership history
  return [
    {
      owner: '0x' + crypto.randomBytes(20).toString('hex'),
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      transactionHash: '0x' + crypto.randomBytes(32).toString('hex')
    },
    {
      owner: '0x' + crypto.randomBytes(20).toString('hex'),
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
      transactionHash: '0x' + crypto.randomBytes(32).toString('hex')
    }
  ];
}
