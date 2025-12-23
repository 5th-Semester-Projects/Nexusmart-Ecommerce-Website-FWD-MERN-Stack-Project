import express from 'express';
import * as metaverseController from '../controllers/metaverseShoppingController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Virtual Store Routes
router.post('/store/create', isAuthenticatedUser, metaverseController.createVirtualStore);
router.get('/store/:storeId', metaverseController.getVirtualStore);
router.get('/stores', metaverseController.listVirtualStores);

// Avatar Routes
router.post('/avatar/create', isAuthenticatedUser, metaverseController.createAvatar);
router.put('/avatar/outfit', isAuthenticatedUser, metaverseController.updateAvatarOutfit);
router.post('/avatar/try-on', isAuthenticatedUser, metaverseController.tryOnProductWithAvatar);

// VR Experience Routes
router.post('/vr/session/start', isAuthenticatedUser, metaverseController.startVRSession);
router.get('/vr/session/:sessionId', isAuthenticatedUser, metaverseController.getVRSessionStatus);
router.post('/vr/session/end', isAuthenticatedUser, metaverseController.endVRSession);

// 3D Product Gallery Routes
router.get('/3d/gallery', metaverseController.get3DProductGallery);
router.get('/3d/product/:productId', metaverseController.get3DProduct);
router.post('/3d/upload', isAuthenticatedUser, metaverseController.upload3DModel);

// Social Features
router.post('/invite/friends', isAuthenticatedUser, metaverseController.inviteFriendsToStore);
router.get('/stats', metaverseController.getMetaverseStats);

export default router;
