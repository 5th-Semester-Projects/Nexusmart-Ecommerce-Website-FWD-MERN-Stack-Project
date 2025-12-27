import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import configurations
import connectDatabase from './config/database.js';
import { errorMiddleware } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import setupSocketHandlers from './socket/socketHandlers.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import stockAlertRoutes from './routes/stockAlertRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import realTimeRoutes from './routes/realTimeRoutes.js';
import web3Routes from './routes/web3Routes.js';
import advancedAnalyticsRoutes from './routes/advancedAnalyticsRoutes.js';
import socialCommerceRoutes from './routes/socialCommerceRoutes.js';
import gdprRoutes from './routes/gdprRoutes.js';

// New Feature Routes
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import giftCardRoutes from './routes/giftCardRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import bnplRoutes from './routes/bnplRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import advancedAIRoutes from './routes/advancedAIRoutes.js';
import currencyRoutes from './routes/currencyRoutes.js';
import shoppableVideoRoutes from './routes/shoppableVideoRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import nextGenRoutes from './routes/nextGenRoutes.js';

// Advanced Feature Routes
import productCategorizationRoutes from './routes/productCategorizationRoutes.js';
import imageGenerationRoutes from './routes/imageGenerationRoutes.js';
import occasionShoppingRoutes from './routes/occasionShoppingRoutes.js';
import personalizationRoutes from './routes/personalizationRoutes.js';
import advancedPaymentRoutes from './routes/advancedPaymentRoutes.js';
import socialCommunityRoutes from './routes/socialCommunityRoutes.js';
import logisticsRoutes from './routes/logisticsRoutes.js';
import customerExperienceRoutes from './routes/customerExperienceRoutes.js';
import b2bRoutes from './routes/b2bRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import emergingTechRoutes from './routes/emergingTechRoutes.js';
import detailedAnalyticsRoutes from './routes/detailedAnalyticsRoutes.js';
import enhancedCustomerServiceRoutes from './routes/enhancedCustomerServiceRoutes.js';
import securityFeaturesRoutes from './routes/securityFeaturesRoutes.js';

// New Advanced Features Routes
import marketingRoutes from './routes/marketingRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import liveChatRoutes from './routes/liveChatRoutes.js';
import multiVendorRoutes from './routes/multiVendorRoutes.js';
import advancedFeaturesRoutes from './routes/advancedFeaturesRoutes.js';

// Latest Feature Routes (New Implementation)
import smartRecommendationRoutes from './routes/smartRecommendationRoutes.js';
import enhancedReviewRoutes from './routes/enhancedReviewRoutes.js';
import loyaltyProgramRoutes from './routes/loyaltyProgramRoutes.js';
import virtualTryOnRoutes from './routes/virtualTryOnRoutes.js';
import personalizedHomepageRoutes from './routes/personalizedHomepageRoutes.js';
import multiVendorMarketplaceRoutes from './routes/multiVendorMarketplaceRoutes.js';
import orderTrackingRoutes from './routes/orderTrackingRoutes.js';
import bundleDealsRoutes from './routes/bundleDealsRoutes.js';
import returnsPortalRoutes from './routes/returnsPortalRoutes.js';
import socialShoppingRoutes from './routes/socialShoppingRoutes.js';
import liveShoppingEventRoutes from './routes/liveShoppingEventRoutes.js';
import inventoryManagementRoutes from './routes/inventoryManagementRoutes.js';
import priceAlertRoutes from './routes/priceAlertRoutes.js';
import oneClickCheckoutRoutes from './routes/oneClickCheckoutRoutes.js';
import customerSegmentationRoutes from './routes/customerSegmentationRoutes.js';
import progressiveWebAppRoutes from './routes/progressiveWebAppRoutes.js';
import advancedSearchRoutes from './routes/advancedSearchRoutes.js';
import productComparisonRoutes from './routes/productComparisonRoutes.js';

// New Critical Features Routes (Implementation Jan 2025)
import realtimeInventorySyncRoutes from './routes/realtimeInventorySyncRoutes.js';
import advancedAnalyticsDashboardRoutes from './routes/advancedAnalyticsDashboardRoutes.js';
import marketingAutomationRoutes from './routes/marketingAutomationRoutes.js';
import productRecommendationEngineRoutes from './routes/productRecommendationEngineRoutes.js';
import multiChannelIntegrationRoutes from './routes/multiChannelIntegrationRoutes.js';
import advancedSearchFiltersRoutes from './routes/advancedSearchFiltersRoutes.js';
import customerServiceHubRoutes from './routes/customerServiceHubRoutes.js';
import wishlistFavoritesRoutes from './routes/wishlistFavoritesRoutes.js';
import giftCardStoreCreditRoutes from './routes/giftCardStoreCreditRoutes.js';
import productBundleKitRoutes from './routes/productBundleKitRoutes.js';

// Premium Features Routes (Implementation Jan 2025)
import subscriptionManagementRoutes from './routes/subscriptionManagementRoutes.js';
import arTryOnRoutes from './routes/arTryOnRoutes.js';
import voiceCommerceRoutes from './routes/voiceCommerceRoutes.js';
import socialProofEngineRoutes from './routes/socialProofEngineRoutes.js';
import dynamicPricingEngineRoutes from './routes/dynamicPricingEngineRoutes.js';
import advancedReturnsManagementRoutes from './routes/advancedReturnsManagementRoutes.js';
import influencerMarketingRoutes from './routes/influencerMarketingRoutes.js';
import preOrderBackorderRoutes from './routes/preOrderBackorderRoutes.js';
import productQARoutes from './routes/productQARoutes.js';
import geolocationServicesRoutes from './routes/geolocationServicesRoutes.js';

// Next-Gen Features Routes (Implementation Dec 2025)
import nextGenFeaturesRoutes from './routes/nextGenFeatures.js';

// Next-Gen Individual Feature Routes (Implementation Dec 2025)
import aiStylistRoutes from './routes/aiStylist.js';
import blockchainRoutes from './routes/blockchain.js';
import metaverseRoutes from './routes/metaverse.js';
import sustainabilityRoutes from './routes/sustainability.js';
import fraudDetectionRoutes from './routes/fraudDetection.js';

// Initialize express app
const app = express();
const server = createServer(app);

// Trust proxy for Heroku/production (required for rate limiting behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or same-origin)
      if (!origin) return callback(null, true);
      
      // Allow localhost and Heroku domains
      const allowedPatterns = [
        /^http:\/\/localhost:\d+$/,
        /^https?:\/\/[a-zA-Z0-9-]+\.herokuapp\.com$/,
        /^https?:\/\/[a-zA-Z0-9-]+\.herokuapp\.com$/
      ];
      
      if (allowedPatterns.some(pattern => pattern.test(origin))) {
        callback(null, true);
      } else {
        console.log('Socket.IO CORS blocked origin:', origin);
        callback(null, false);
      }
    },
    credentials: true,
  },
});

// Connect to database
connectDatabase();

// Security middleware - Configure helmet with proper CSP for external images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "http:",
        ],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          "wss://*.herokuapp.com",
          "https://*.herokuapp.com",
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com",
        ],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    referrerPolicy: { policy: "no-referrer-when-downgrade" },
  })
);
app.use(mongoSanitize());

// CORS configuration - Allow Heroku and localhost
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin)
      if (!origin) return callback(null, true);

      // Allow localhost and Heroku domains
      const allowedPatterns = [
        /^http:\/\/localhost:\d+$/,
        /^https?:\/\/[a-zA-Z0-9-]+\.herokuapp\.com$/,
        /^https?:\/\/[a-zA-Z0-9-]+\.herokuapp\.com$/
      ];
      
      if (allowedPatterns.some(pattern => pattern.test(origin))) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Runtime config endpoint for frontend
app.get('/api/config', (req, res) => {
  res.json({
    apiUrl: process.env.NODE_ENV === 'production'
      ? `${req.protocol}://${req.get('host')}`
      : 'http://localhost:5000'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stock-alerts', stockAlertRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/v1/gamification', gamificationRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/realtime', realTimeRoutes);
app.use('/api/v1/web3', web3Routes);
app.use('/api/v1/advanced-analytics', advancedAnalyticsRoutes);
app.use('/api/v1/social', socialCommerceRoutes);
app.use('/api/v1/gdpr', gdprRoutes);

// New Feature Routes
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/gift-cards', giftCardRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/bnpl', bnplRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/advanced-ai', advancedAIRoutes);
app.use('/api/v1/currency', currencyRoutes);
app.use('/api/v1/videos', shoppableVideoRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/next-gen', nextGenRoutes);

// Advanced Feature Routes
app.use('/api/v1/product-categorization', productCategorizationRoutes);
app.use('/api/v1/image-generation', imageGenerationRoutes);
app.use('/api/v1/occasion-shopping', occasionShoppingRoutes);
app.use('/api/v1/personalization', personalizationRoutes);
app.use('/api/v1/advanced-payment', advancedPaymentRoutes);
app.use('/api/v1/community', socialCommunityRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/customer-experience', customerExperienceRoutes);
app.use('/api/v1/b2b', b2bRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/emerging-tech', emergingTechRoutes);
app.use('/api/v1/detailed-analytics', detailedAnalyticsRoutes);
app.use('/api/v1/customer-service', enhancedCustomerServiceRoutes);
app.use('/api/v1/security-features', securityFeaturesRoutes);

// New Advanced Features Routes
app.use('/api/v1/marketing', marketingRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/warehouse', warehouseRoutes);
app.use('/api/v1/live-chat', liveChatRoutes);
app.use('/api/v1/marketplace', multiVendorRoutes);
app.use('/api/v1/features', advancedFeaturesRoutes);

// Latest Feature Routes (New Implementation)
app.use('/api/v1/recommendations', smartRecommendationRoutes);
app.use('/api/v1/enhanced-reviews', enhancedReviewRoutes);
app.use('/api/v1/loyalty', loyaltyProgramRoutes);
app.use('/api/v1/virtual-tryon', virtualTryOnRoutes);
app.use('/api/v1/homepage', personalizedHomepageRoutes);
app.use('/api/v1/vendor-marketplace', multiVendorMarketplaceRoutes);
app.use('/api/v1/tracking', orderTrackingRoutes);
app.use('/api/v1/bundles', bundleDealsRoutes);
app.use('/api/v1/returns', returnsPortalRoutes);
app.use('/api/v1/social-shopping', socialShoppingRoutes);
app.use('/api/v1/live-events', liveShoppingEventRoutes);
app.use('/api/v1/inventory', inventoryManagementRoutes);
app.use('/api/v1/price-alerts', priceAlertRoutes);
app.use('/api/v1/one-click', oneClickCheckoutRoutes);
app.use('/api/v1/segmentation', customerSegmentationRoutes);
app.use('/api/v1/pwa', progressiveWebAppRoutes);
app.use('/api/v1/advanced-search', advancedSearchRoutes);
app.use('/api/v1/comparison', productComparisonRoutes);

// New Critical Features Routes (Implementation Jan 2025)
app.use('/api/v1', realtimeInventorySyncRoutes);
app.use('/api/v1', advancedAnalyticsDashboardRoutes);
app.use('/api/v1', marketingAutomationRoutes);
app.use('/api/v1', productRecommendationEngineRoutes);
app.use('/api/v1', multiChannelIntegrationRoutes);
app.use('/api/v1', advancedSearchFiltersRoutes);
app.use('/api/v1', customerServiceHubRoutes);
app.use('/api/v1', wishlistFavoritesRoutes);
app.use('/api/v1', giftCardStoreCreditRoutes);
app.use('/api/v1', productBundleKitRoutes);

// Premium Features Routes (Implementation Jan 2025)
app.use('/api/v1', subscriptionManagementRoutes);
app.use('/api/v1', arTryOnRoutes);
app.use('/api/v1', voiceCommerceRoutes);

// Next-Gen Features Routes (Implementation Dec 2025)
app.use('/api/next-gen', nextGenFeaturesRoutes);

// Next-Gen Individual Feature Routes (Implementation Dec 2025)
app.use('/api/v1/ai-stylist', aiStylistRoutes);
app.use('/api/v1/blockchain', blockchainRoutes);
app.use('/api/v1/metaverse', metaverseRoutes);
app.use('/api/v1/sustainability', sustainabilityRoutes);
app.use('/api/v1/fraud-detection', fraudDetectionRoutes);

app.use('/api/v1', socialProofEngineRoutes);
app.use('/api/v1', dynamicPricingEngineRoutes);
app.use('/api/v1', advancedReturnsManagementRoutes);
app.use('/api/v1', influencerMarketingRoutes);
app.use('/api/v1', preOrderBackorderRoutes);
app.use('/api/v1', productQARoutes);
app.use('/api/v1', geolocationServicesRoutes);

// Setup Socket.IO event handlers
setupSocketHandlers(io);

// Make io accessible to routes
app.set('io', io);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');

  // Serve static files
  app.use(express.static(clientDistPath));

  // API routes come first
  // (already defined above)

  // Handle React routing - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Development mode - API root
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'NexusMart API - AI + AR Powered Ecommerce Platform',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        health: '/health',
      },
    });
  });

  // 404 handler for development
  app.all('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
    });
  });
}

// Error middleware (must be last)
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Important for Render deployment

server.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 NexusMart Server Running                            ║
║   📡 Port: ${PORT}                                       ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}              ║
║   🔗 URL: http://localhost:${PORT}                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  console.log('🛑 Shutting down server...');
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`);
  console.log('🛑 Shutting down server...');
  process.exit(1);
});

export default app;
