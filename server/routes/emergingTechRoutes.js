import express from 'express';
import {
  mintNFT,
  listNFT,
  buyNFT,
  getUserNFTs,
  connectIoTDevice,
  setupAutoReorder,
  updateInventory,
  createVirtualStore
} from '../controllers/emergingTechController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// NFT Marketplace
router.post('/nft/mint', isAuthenticatedUser, mintNFT);
router.post('/nft/list', isAuthenticatedUser, listNFT);
router.post('/nft/buy/:nftId', isAuthenticatedUser, buyNFT);
router.get('/nft/my-nfts', isAuthenticatedUser, getUserNFTs);

// IoT Integration
router.post('/iot/connect', isAuthenticatedUser, connectIoTDevice);
router.post('/iot/auto-reorder', isAuthenticatedUser, setupAutoReorder);
router.post('/iot/inventory', isAuthenticatedUser, updateInventory);

// Metaverse Commerce
router.post('/metaverse/create-store', isAuthenticatedUser, createVirtualStore);

export default router;
