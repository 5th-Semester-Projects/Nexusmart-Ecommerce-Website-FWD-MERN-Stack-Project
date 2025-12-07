import express from 'express';
const router = express.Router();
import aiStylistController from '../controllers/aiStylistController.js';
import blockchainController from '../controllers/blockchainController.js';
import metaverseController from '../controllers/metaverseController.js';
import sustainabilityController from '../controllers/sustainabilityController.js';
import fraudDetectionController from '../controllers/fraudDetectionController.js';

// ============================================
// AI STYLIST / PERSONAL SHOPPER ROUTES
// ============================================

// Style Quiz
router.post('/ai-stylist/style-quiz', aiStylistController.submitStyleQuiz);
router.put('/ai-stylist/style-profile/:userId', aiStylistController.updateStyleProfile);

// Outfit Recommendations
router.get('/ai-stylist/outfit-recommendations', aiStylistController.getOutfitRecommendations);

// Personal Shopper
router.get('/ai-stylist/personal-shopper', aiStylistController.getPersonalShopperSuggestions);

// Virtual Styling Sessions
router.post('/ai-stylist/styling-session', aiStylistController.bookStylingSession);
router.get('/ai-stylist/styling-sessions/:userId', aiStylistController.getStylingSessions);

// ============================================
// BLOCKCHAIN INTEGRATION ROUTES
// ============================================

// NFT Products
router.post('/blockchain/nft/create', blockchainController.createNFTProduct);
router.get('/blockchain/nft/:tokenId', blockchainController.getNFTProduct);
router.get('/blockchain/nft/list', blockchainController.listNFTProducts);

// Crypto Payments
router.post('/blockchain/crypto/initiate', blockchainController.initiateCryptoPayment);
router.post('/blockchain/crypto/verify', blockchainController.verifyCryptoPayment);

// Product Authenticity
router.post('/blockchain/verify-authenticity', blockchainController.verifyProductAuthenticity);
router.post('/blockchain/register-product', blockchainController.registerProductOnBlockchain);

// Supply Chain
router.get('/blockchain/supply-chain/:productId', blockchainController.getSupplyChainHistory);
router.post('/blockchain/supply-chain/event', blockchainController.addSupplyChainEvent);

// ============================================
// METAVERSE SHOPPING ROUTES
// ============================================

// Virtual Store
router.post('/metaverse/store/create', metaverseController.createVirtualStore);
router.get('/metaverse/store/:storeId', metaverseController.getVirtualStore);

// Avatar
router.post('/metaverse/avatar/create', metaverseController.createUserAvatar);
router.get('/metaverse/avatar/:userId', metaverseController.getUserAvatar);
router.post('/metaverse/avatar/try-on', metaverseController.virtualTryOn);

// VR Experience
router.post('/metaverse/vr/start', metaverseController.startVRSession);
router.get('/metaverse/vr/session/:sessionId', metaverseController.getVRSessionStatus);
router.post('/metaverse/vr/end', metaverseController.endVRSession);

// 3D Gallery
router.get('/metaverse/3d-gallery', metaverseController.get3DProductGallery);
router.get('/metaverse/3d-model/:productId', metaverseController.getProduct3DModel);

// Virtual Events
router.post('/metaverse/events/create', metaverseController.createVirtualEvent);
router.post('/metaverse/events/join', metaverseController.joinVirtualEvent);

// ============================================
// SUSTAINABILITY TRACKING ROUTES
// ============================================

// Carbon Footprint
router.get('/sustainability/carbon-footprint/product/:productId', sustainabilityController.calculateProductCarbonFootprint);
router.get('/sustainability/carbon-footprint/order/:orderId', sustainabilityController.calculateOrderCarbonFootprint);

// Eco Badges
router.post('/sustainability/eco-badge', sustainabilityController.assignEcoBadge);
router.get('/sustainability/eco-products', sustainabilityController.getEcoFriendlyProducts);

// Packaging
router.get('/sustainability/packaging/options', sustainabilityController.getPackagingOptions);
router.post('/sustainability/packaging/select', sustainabilityController.selectPackaging);

// Green Shipping
router.get('/sustainability/green-shipping', sustainabilityController.getGreenShippingOptions);

// Carbon Offset
router.post('/sustainability/carbon-offset', sustainabilityController.purchaseCarbonOffset);

// Dashboard
router.get('/sustainability/dashboard/:userId', sustainabilityController.getSustainabilityDashboard);

// ============================================
// ADVANCED FRAUD DETECTION ROUTES
// ============================================

// Risk Analysis
router.post('/fraud-detection/analyze', fraudDetectionController.analyzeTransactionRisk);
router.get('/fraud-detection/monitor', fraudDetectionController.monitorTransactionPatterns);
router.post('/fraud-detection/alert', fraudDetectionController.sendTransactionAlert);

// Chargeback Prevention
router.get('/fraud-detection/chargeback-risk/:orderId', fraudDetectionController.predictChargebackRisk);
router.post('/fraud-detection/chargeback', fraudDetectionController.fileChargeback);

// Identity Verification
router.post('/fraud-detection/identity/initiate', fraudDetectionController.initiateIdentityVerification);
router.post('/fraud-detection/identity/verify', fraudDetectionController.verifyIdentity);
router.post('/fraud-detection/identity/document', fraudDetectionController.verifyDocument);

// Dashboard
router.get('/fraud-detection/dashboard', fraudDetectionController.getFraudDashboard);

export default router;
