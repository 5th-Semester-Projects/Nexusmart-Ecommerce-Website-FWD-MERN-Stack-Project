import Product from '../models/Product.js';
import User from '../models/User.js';
import crypto from 'crypto';

// Metaverse Shopping Controller

// Virtual Store Management

// Create Virtual Store
export const createVirtualStore = async (req, res) => {
  try {
    const {
      storeName,
      theme,
      layout,
      products,
      virtualEnvironment,
      customization
    } = req.body;

    const virtualStore = {
      storeId: `VSTORE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      storeName,
      theme, // futuristic, minimal, luxury, casual
      layout, // grid, boutique, mall, gallery
      products: products || [],
      virtualEnvironment: {
        worldType: virtualEnvironment?.worldType || 'space-station',
        lighting: virtualEnvironment?.lighting || 'ambient',
        musicUrl: virtualEnvironment?.musicUrl,
        skybox: virtualEnvironment?.skybox || 'default'
      },
      customization: {
        primaryColor: customization?.primaryColor || '#007bff',
        secondaryColor: customization?.secondaryColor || '#6c757d',
        logoUrl: customization?.logoUrl,
        bannerUrl: customization?.bannerUrl
      },
      vrCompatible: true,
      arCompatible: true,
      createdAt: new Date(),
      visitCount: 0
    };

    res.status(201).json({
      message: 'Virtual store created successfully',
      virtualStore,
      accessUrl: `https://metaverse.nexusmart.com/store/${virtualStore.storeId}`,
      vrUrl: `nexusmart-vr://store/${virtualStore.storeId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating virtual store', error: error.message });
  }
};

// Get Virtual Store
export const getVirtualStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    // In production, fetch from database
    const virtualStore = {
      storeId,
      storeName: 'NexusMart VR Experience',
      theme: 'futuristic',
      layout: 'gallery',
      visitCount: Math.floor(Math.random() * 10000),
      rating: 4.7
    };

    res.status(200).json({
      virtualStore,
      accessUrl: `https://metaverse.nexusmart.com/store/${storeId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching virtual store', error: error.message });
  }
};

// Avatar Shopping Experience

// Create/Update User Avatar
export const createUserAvatar = async (req, res) => {
  try {
    const { userId, avatarConfig } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatar = {
      avatarId: `AVATAR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      appearance: {
        bodyType: avatarConfig.bodyType || 'default',
        skinTone: avatarConfig.skinTone || '#fdbcb4',
        hairStyle: avatarConfig.hairStyle || 'short',
        hairColor: avatarConfig.hairColor || '#000000',
        faceShape: avatarConfig.faceShape || 'oval',
        eyeColor: avatarConfig.eyeColor || '#8b4513'
      },
      clothing: {
        outfit: avatarConfig.outfit || 'casual',
        accessories: avatarConfig.accessories || []
      },
      animations: {
        idle: 'standing',
        walking: 'normal-walk',
        shopping: 'browsing'
      },
      metaverseReady: true,
      createdAt: new Date()
    };

    user.metaverseProfile = {
      avatar,
      preferences: avatarConfig.preferences || {},
      virtualWallet: user.metaverseProfile?.virtualWallet || {
        balance: 0,
        currency: 'NEXU'
      }
    };

    await user.save();

    res.status(201).json({
      message: 'Avatar created successfully',
      avatar,
      renderUrl: `https://avatar-cdn.nexusmart.com/${avatar.avatarId}/render.glb`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating avatar', error: error.message });
  }
};

// Get User Avatar
export const getUserAvatar = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user || !user.metaverseProfile) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    res.status(200).json({
      avatar: user.metaverseProfile.avatar,
      renderUrl: `https://avatar-cdn.nexusmart.com/${user.metaverseProfile.avatar.avatarId}/render.glb`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching avatar', error: error.message });
  }
};

// Try On Products in VR
export const virtualTryOn = async (req, res) => {
  try {
    const { userId, productId, avatarId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const tryOnSession = {
      sessionId: `TRYON-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      productId,
      avatarId,
      product3DModel: product.model3D || generateDefault3DModel(product),
      fitAnalysis: {
        sizeMatch: Math.floor(Math.random() * 30) + 70,
        styleMatch: Math.floor(Math.random() * 30) + 70,
        recommendations: ['Looks great!', 'Consider size up for loose fit']
      },
      vrPreviewUrl: `nexusmart-vr://tryon/${productId}/${avatarId}`,
      arPreviewUrl: `https://ar.nexusmart.com/tryon/${productId}`,
      createdAt: new Date()
    };

    res.status(200).json({
      message: 'Virtual try-on session created',
      tryOnSession
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating virtual try-on session', error: error.message });
  }
};

// VR Experience

// Start VR Shopping Session
export const startVRSession = async (req, res) => {
  try {
    const { userId, storeId, deviceType } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const vrSession = {
      sessionId: `VR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      storeId: storeId || 'default',
      deviceType, // oculus, vive, psvr, cardboard
      sessionToken: crypto.randomBytes(32).toString('hex'),
      startTime: new Date(),
      status: 'active',
      features: {
        handTracking: deviceType === 'oculus' || deviceType === 'vive',
        voiceCommands: true,
        hapticFeedback: true,
        spatialAudio: true
      }
    };

    res.status(200).json({
      message: 'VR session started',
      vrSession,
      connectUrl: `nexusmart-vr://connect/${vrSession.sessionToken}`,
      streamingServer: 'wss://vr-stream.nexusmart.com'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting VR session', error: error.message });
  }
};

// Get VR Session Status
export const getVRSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // In production, fetch from database/cache
    const sessionStatus = {
      sessionId,
      status: 'active',
      duration: Math.floor(Math.random() * 1800), // seconds
      productsViewed: Math.floor(Math.random() * 20),
      cartItems: Math.floor(Math.random() * 5)
    };

    res.status(200).json(sessionStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching VR session status', error: error.message });
  }
};

// End VR Session
export const endVRSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const sessionSummary = {
      sessionId,
      endTime: new Date(),
      totalDuration: Math.floor(Math.random() * 3600),
      productsViewed: Math.floor(Math.random() * 50),
      productsAddedToCart: Math.floor(Math.random() * 10),
      purchasesMade: Math.floor(Math.random() * 3),
      experienceRating: null
    };

    res.status(200).json({
      message: 'VR session ended',
      sessionSummary
    });
  } catch (error) {
    res.status(500).json({ message: 'Error ending VR session', error: error.message });
  }
};

// 3D Product Gallery

// Get 3D Product Gallery
export const get3DProductGallery = async (req, res) => {
  try {
    const { category, featured, limit = 20 } = req.query;

    const query = {
      isActive: true,
      $or: [
        { model3D: { $exists: true, $ne: null } },
        { 'vrReady': true }
      ]
    };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const products = await Product.find(query).limit(parseInt(limit));

    const gallery = products.map(product => ({
      productId: product._id,
      name: product.name,
      price: product.price,
      thumbnail: product.images?.[0] || '',
      model3D: product.model3D || generateDefault3DModel(product),
      modelFormat: 'glb',
      textureQuality: 'high',
      polygonCount: Math.floor(Math.random() * 50000) + 10000,
      animations: product.animations || [],
      interactionPoints: generateInteractionPoints(product),
      vrReady: true,
      arReady: true
    }));

    res.status(200).json({
      gallery,
      totalProducts: gallery.length,
      galleryUrl: 'https://3d.nexusmart.com/gallery'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching 3D product gallery', error: error.message });
  }
};

// Get Product 3D Model
export const getProduct3DModel = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quality = 'high' } = req.query;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const model3D = {
      productId,
      modelUrl: product.model3D || `https://3d-models.nexusmart.com/${productId}/model.glb`,
      formats: {
        glb: `https://3d-models.nexusmart.com/${productId}/model.glb`,
        gltf: `https://3d-models.nexusmart.com/${productId}/model.gltf`,
        obj: `https://3d-models.nexusmart.com/${productId}/model.obj`,
        fbx: `https://3d-models.nexusmart.com/${productId}/model.fbx`
      },
      quality,
      textures: {
        diffuse: `https://3d-models.nexusmart.com/${productId}/textures/diffuse_${quality}.jpg`,
        normal: `https://3d-models.nexusmart.com/${productId}/textures/normal_${quality}.jpg`,
        roughness: `https://3d-models.nexusmart.com/${productId}/textures/roughness_${quality}.jpg`,
        metallic: `https://3d-models.nexusmart.com/${productId}/textures/metallic_${quality}.jpg`
      },
      animations: product.animations || [],
      interactionPoints: generateInteractionPoints(product),
      downloadSize: quality === 'high' ? '15MB' : quality === 'medium' ? '8MB' : '3MB'
    };

    res.status(200).json(model3D);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching 3D model', error: error.message });
  }
};

// Virtual Shopping Events

// Create Virtual Shopping Event
export const createVirtualEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventType,
      startTime,
      duration,
      products,
      maxAttendees,
      description
    } = req.body;

    const virtualEvent = {
      eventId: `VEVENT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      eventName,
      eventType, // product-launch, sale, fashion-show, exclusive-preview
      startTime: new Date(startTime),
      endTime: new Date(new Date(startTime).getTime() + duration * 60000),
      duration,
      products: products || [],
      maxAttendees: maxAttendees || 1000,
      currentAttendees: 0,
      description,
      virtualVenue: {
        venueType: 'auditorium',
        capacity: maxAttendees,
        features: ['stage', 'chat', 'reactions', 'shopping-carts']
      },
      streamingUrl: `wss://live-events.nexusmart.com/${crypto.randomBytes(8).toString('hex')}`,
      status: 'scheduled',
      createdAt: new Date()
    };

    res.status(201).json({
      message: 'Virtual event created successfully',
      virtualEvent,
      joinUrl: `https://metaverse.nexusmart.com/events/${virtualEvent.eventId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating virtual event', error: error.message });
  }
};

// Join Virtual Event
export const joinVirtualEvent = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const eventSession = {
      sessionId: `EVTSESS-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      eventId,
      userId,
      avatarId: user.metaverseProfile?.avatar?.avatarId,
      joinedAt: new Date(),
      sessionToken: crypto.randomBytes(32).toString('hex')
    };

    res.status(200).json({
      message: 'Joined virtual event successfully',
      eventSession,
      streamingUrl: `wss://live-events.nexusmart.com/event/${eventId}`,
      chatRoomUrl: `wss://chat.nexusmart.com/event/${eventId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining virtual event', error: error.message });
  }
};

// Helper Functions

function generateDefault3DModel(product) {
  return `https://3d-models.nexusmart.com/${product._id}/model.glb`;
}

function generateInteractionPoints(product) {
  return [
    {
      name: 'product-info',
      position: { x: 0, y: 1, z: 0 },
      action: 'show-details'
    },
    {
      name: 'add-to-cart',
      position: { x: 0.5, y: 0.5, z: 0 },
      action: 'add-to-cart'
    },
    {
      name: 'customize',
      position: { x: -0.5, y: 0.5, z: 0 },
      action: 'customize-product'
    }
  ];
}

// Exports converted to ES6 export const
