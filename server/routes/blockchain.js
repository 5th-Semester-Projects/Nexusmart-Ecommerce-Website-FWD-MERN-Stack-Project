import express from 'express';
import * as blockchainController from '../controllers/blockchainController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// NFT Products Routes
router.post('/nft/create', isAuthenticatedUser, blockchainController.createNFTProduct);
router.get('/nft/:tokenId', blockchainController.getNFTProduct);
router.get('/nft/list', blockchainController.listNFTProducts);

// Crypto Payment Routes
router.post('/crypto/initiate', isAuthenticatedUser, blockchainController.initiateCryptoPayment);
router.post('/crypto/verify', isAuthenticatedUser, blockchainController.verifyCryptoPayment);

// Product Authenticity Routes
router.post('/verify/product', blockchainController.verifyProductAuthenticity);
router.post('/register/product', isAuthenticatedUser, blockchainController.registerProductOnBlockchain);

// Supply Chain Routes
router.get('/supply-chain/:productId', blockchainController.getSupplyChainHistory);
router.post('/supply-chain/event', isAuthenticatedUser, blockchainController.addSupplyChainEvent);

export default router;
