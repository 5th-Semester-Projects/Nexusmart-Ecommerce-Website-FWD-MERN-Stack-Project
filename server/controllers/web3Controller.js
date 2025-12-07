import web3Service from '../services/web3Service.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import crypto from 'crypto';

/**
 * Web3/Blockchain Controller
 * Handles cryptocurrency payments, NFT receipts, wallet auth, and supply chain
 */

// Generate nonce for wallet authentication
export const generateWalletNonce = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    const message = web3Service.generateAuthMessage(address, nonce);

    // Store nonce temporarily (in production, use Redis with TTL)
    // For demo, we'll include it in the response

    res.status(200).json({
      success: true,
      message,
      nonce,
      expiresIn: 300 // 5 minutes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate nonce',
      error: error.message
    });
  }
};

// Verify wallet signature and authenticate
export const walletLogin = async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: address, signature, message'
      });
    }

    // Verify signature
    const isValid = await web3Service.verifyWalletSignature(message, signature, address);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Find or create user with wallet address
    let user = await User.findOne({ walletAddress: address.toLowerCase() });

    if (!user) {
      // Create new user with wallet
      user = await User.create({
        name: `Wallet User ${address.slice(0, 8)}`,
        email: `${address.toLowerCase()}@wallet.nexusmart.com`,
        walletAddress: address.toLowerCase(),
        authMethod: 'wallet',
        isVerified: true, // Wallet signature is verification
        password: crypto.randomBytes(32).toString('hex') // Random password for wallet users
      });
    }

    // Generate JWT token
    const token = user.getJwtToken();

    res.status(200).json({
      success: true,
      message: 'Wallet authentication successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Wallet authentication failed',
      error: error.message
    });
  }
};

// Link wallet to existing account
export const linkWallet = async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    const userId = req.user._id;

    // Verify signature
    const isValid = await web3Service.verifyWalletSignature(message, signature, address);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Check if wallet already linked to another account
    const existingUser = await User.findOne({
      walletAddress: address.toLowerCase(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Wallet already linked to another account'
      });
    }

    // Update user with wallet address
    await User.findByIdAndUpdate(userId, {
      walletAddress: address.toLowerCase()
    });

    res.status(200).json({
      success: true,
      message: 'Wallet linked successfully',
      walletAddress: address.toLowerCase()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to link wallet',
      error: error.message
    });
  }
};

// Get exchange rates
export const getExchangeRates = async (req, res) => {
  try {
    const rates = await web3Service.getExchangeRates();

    res.status(200).json({
      success: true,
      rates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exchange rates',
      error: error.message
    });
  }
};

// Create crypto payment request
export const createCryptoPayment = async (req, res) => {
  try {
    const { orderId, cryptoCurrency } = req.body;
    const userId = req.user._id;

    // Get order
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }

    const merchantAddress = process.env.MERCHANT_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

    const paymentRequest = await web3Service.createPaymentRequest(
      order._id.toString(),
      order.totalAmount,
      cryptoCurrency,
      merchantAddress
    );

    // Store payment request in order
    order.cryptoPayment = {
      paymentId: paymentRequest.paymentId,
      currency: cryptoCurrency,
      amount: paymentRequest.amount,
      exchangeRate: paymentRequest.exchangeRate,
      merchantAddress,
      expiresAt: paymentRequest.expiresAt,
      status: 'pending'
    };
    await order.save();

    res.status(200).json({
      success: true,
      payment: paymentRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create crypto payment',
      error: error.message
    });
  }
};

// Verify crypto payment
export const verifyCryptoPayment = async (req, res) => {
  try {
    const { orderId, transactionHash, network } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify transaction on blockchain
    const verification = await web3Service.verifyTransaction(transactionHash, network || 'ethereum');

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        message: 'Transaction verification failed',
        error: verification.error
      });
    }

    // Update order payment status
    order.paymentStatus = 'paid';
    order.paymentMethod = 'crypto';
    order.cryptoPayment = {
      ...order.cryptoPayment,
      transactionHash,
      network,
      status: 'confirmed',
      confirmedAt: new Date()
    };
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      transaction: verification.transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Generate NFT receipt
export const generateNFTReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order must be paid before generating NFT receipt'
      });
    }

    const user = await User.findById(userId);
    const customerAddress = user.walletAddress || req.body.walletAddress;

    if (!customerAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address required for NFT receipt'
      });
    }

    const nftReceipt = await web3Service.generateNFTReceipt(order, customerAddress);

    // Store NFT receipt info in order
    order.nftReceipt = {
      tokenId: nftReceipt.tokenId,
      contractAddress: nftReceipt.contractAddress,
      network: nftReceipt.network,
      metadata: nftReceipt.metadata,
      generatedAt: new Date()
    };
    await order.save();

    res.status(200).json({
      success: true,
      nftReceipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate NFT receipt',
      error: error.message
    });
  }
};

// Verify NFT receipt
export const verifyNFTReceipt = async (req, res) => {
  try {
    const { tokenId, contractAddress, network } = req.body;

    const verification = await web3Service.verifyNFTReceipt(tokenId, contractAddress, network);

    res.status(200).json({
      success: true,
      verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify NFT receipt',
      error: error.message
    });
  }
};

// Get supply chain data for product
export const getSupplyChain = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get or create supply chain record
    let supplyChain;

    if (product.supplyChain && product.supplyChain.productId) {
      supplyChain = await web3Service.getSupplyChainHistory(product.supplyChain.productId);
    } else {
      supplyChain = await web3Service.createSupplyChainRecord(product);

      // Store supply chain reference in product
      product.supplyChain = {
        productId: supplyChain.productId,
        origin: supplyChain.origin,
        createdAt: new Date()
      };
      await product.save();
    }

    res.status(200).json({
      success: true,
      supplyChain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get supply chain data',
      error: error.message
    });
  }
};

// Verify product authenticity
export const verifyAuthenticity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { signature } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const verification = await web3Service.verifyProductAuthenticity(
      product.supplyChain?.productId || productId,
      signature || product.supplyChain?.signature
    );

    res.status(200).json({
      success: true,
      verification,
      product: {
        name: product.name,
        brand: product.brand,
        sku: product.sku
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify authenticity',
      error: error.message
    });
  }
};

// Update supply chain location (admin only)
export const updateSupplyChainLocation = async (req, res) => {
  try {
    const { productId } = req.params;
    const { location, status } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.supplyChain?.productId) {
      return res.status(400).json({
        success: false,
        message: 'Supply chain not initialized for this product'
      });
    }

    const update = await web3Service.updateSupplyChainLocation(
      product.supplyChain.productId,
      location,
      status,
      req.user.name
    );

    // Add to product's supply chain history
    if (!product.supplyChain.history) {
      product.supplyChain.history = [];
    }
    product.supplyChain.history.push(update);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Supply chain updated',
      update
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update supply chain',
      error: error.message
    });
  }
};

// Get wallet balance
export const getWalletBalance = async (req, res) => {
  try {
    const { address, network } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address required'
      });
    }

    const balance = await web3Service.getWalletBalance(address, network || 'ethereum');

    res.status(200).json({
      success: true,
      balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet balance',
      error: error.message
    });
  }
};

// Estimate gas for transaction
export const estimateGas = async (req, res) => {
  try {
    const { to, value, network } = req.body;

    const estimate = await web3Service.estimateGas(to, value, network || 'ethereum');

    res.status(200).json({
      success: true,
      estimate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to estimate gas',
      error: error.message
    });
  }
};

export default {
  generateWalletNonce,
  walletLogin,
  linkWallet,
  getExchangeRates,
  createCryptoPayment,
  verifyCryptoPayment,
  generateNFTReceipt,
  verifyNFTReceipt,
  getSupplyChain,
  verifyAuthenticity,
  updateSupplyChainLocation,
  getWalletBalance,
  estimateGas
};
