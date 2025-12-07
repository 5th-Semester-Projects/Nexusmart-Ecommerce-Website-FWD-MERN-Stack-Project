import express from 'express';
import {
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
} from '../controllers/web3Controller.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Web3/Blockchain Routes
 * Handles cryptocurrency payments, NFT receipts, wallet auth, and supply chain
 */

// Wallet Authentication
router.post('/wallet/nonce', generateWalletNonce);
router.post('/wallet/login', walletLogin);
router.post('/wallet/link', isAuthenticated, linkWallet);
router.get('/wallet/balance', getWalletBalance);

// Cryptocurrency Payments
router.get('/crypto/rates', getExchangeRates);
router.post('/crypto/payment', isAuthenticated, createCryptoPayment);
router.post('/crypto/verify', isAuthenticated, verifyCryptoPayment);
router.post('/crypto/estimate-gas', estimateGas);

// NFT Receipts
router.post('/nft/receipt/:orderId', isAuthenticated, generateNFTReceipt);
router.post('/nft/verify', verifyNFTReceipt);

// Supply Chain Tracking
router.get('/supply-chain/:productId', getSupplyChain);
router.post('/supply-chain/:productId/verify', verifyAuthenticity);
router.put('/supply-chain/:productId/location', isAuthenticated, isAdmin, updateSupplyChainLocation);

export default router;
