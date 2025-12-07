import express from 'express';
import * as metaverseController from '../controllers/metaverseShoppingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Virtual Store Routes
router.post('/store/create', authenticate, metaverseController.createVirtualStore);
router.get('/store/:storeId', metaverseController.getVirtualStore);
router.get('/stores', metaverseController.listVirtualStores);

// Avatar Routes
router.post('/avatar/create', authenticate, metaverseController.createAvatar);
router.put('/avatar/outfit', authenticate, metaverseController.updateAvatarOutfit);
router.post('/avatar/try-on', authenticate, metaverseController.tryOnProductWithAvatar);

// VR Experience Routes
router.post('/vr/session/start', authenticate, metaverseController.startVRSession);
router.get('/vr/session/:sessionId', authenticate, metaverseController.getVRSessionStatus);
router.post('/vr/session/end', authenticate, metaverseController.endVRSession);

// 3D Product Gallery Routes
router.get('/3d/gallery', metaverseController.get3DProductGallery);
router.get('/3d/product/:productId', metaverseController.get3DProduct);
router.post('/3d/upload', authenticate, metaverseController.upload3DModel);

// Social Features
router.post('/invite/friends', authenticate, metaverseController.inviteFriendsToStore);
router.get('/stats', metaverseController.getMetaverseStats);

export default router;
