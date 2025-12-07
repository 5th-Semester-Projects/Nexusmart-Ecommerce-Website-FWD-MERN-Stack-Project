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
      storeType,
      theme,
      layout,
      capacity,
      vrEnabled,
      features
    } = req.body;

    const virtualStore = {
      storeId: `VSTORE-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,
      storeName,
      storeType, // showroom, mall, boutique, gallery
      theme: theme || 'modern',
      layout: layout || 'grid',
      capacity: capacity || 100, // max concurrent users
      vrEnabled: vrEnabled !== false,
      features: features || ['3D_Products', 'Avatar_Shopping', 'Social_Interaction'],
      virtualAddress: `metaverse://nexusmart/${storeName.toLowerCase().replace(/\s+/g, '-')}`,
      coordinates: {
        x: Math.random() * 1000,
        y: 0,
        z: Math.random() * 1000
      },
      status: 'active',
      createdAt: new Date(),
      analytics: {
        totalVisits: 0,
        uniqueVisitors: 0,
        averageSessionTime: 0,
        conversionRate: 0
      }
    };

    // Store in database (would be stored in User or Store model)
    const user = await User.findById(req.user?.id);
    if (!user.virtualStores) {
      user.virtualStores = [];
    }
    user.virtualStores.push(virtualStore);
    await user.save();

    res.status(201).json({
      message: 'Virtual store created successfully',
      virtualStore,
      accessUrl: `https://metaverse.nexusmart.com/store/${virtualStore.storeId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating virtual store', error: error.message });
  }
};

// Get Virtual Store Details
export const getVirtualStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    const user = await User.findOne({
      'virtualStores.storeId': storeId
    });

    if (!user) {
      return res.status(404).json({ message: 'Virtual store not found' });
    }

    const virtualStore = user.virtualStores.find(s => s.storeId === storeId);

    // Get products in the virtual store
    const products = await Product.find({
      isActive: true,
      '3dModel': { $exists: true }
    }).limit(50);

    res.status(200).json({
      virtualStore,
      products,
      currentVisitors: Math.floor(Math.random() * virtualStore.capacity)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching virtual store', error: error.message });
  }
};

// List All Virtual Stores
export const listVirtualStores = async (req, res) => {
  try {
    const { storeType, theme, vrEnabled } = req.query;

    const users = await User.find({
      'virtualStores': { $exists: true, $ne: [] }
    });

    let allStores = [];
    users.forEach(user => {
      allStores = allStores.concat(user.virtualStores || []);
    });

    // Apply filters
    if (storeType) {
      allStores = allStores.filter(s => s.storeType === storeType);
    }
    if (theme) {
      allStores = allStores.filter(s => s.theme === theme);
    }
    if (vrEnabled !== undefined) {
      allStores = allStores.filter(s => s.vrEnabled === (vrEnabled === 'true'));
    }

    res.status(200).json({
      stores: allStores,
      total: allStores.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error listing virtual stores', error: error.message });
  }
};

// Avatar Shopping

// Create User Avatar
export const createAvatar = async (req, res) => {
  try {
    const {
      avatarName,
      gender,
      bodyType,
      skinTone,
      hairStyle,
      hairColor,
      facialFeatures,
      clothing,
      accessories
    } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatar = {
      avatarId: `AVATAR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      avatarName: avatarName || `${user.name}'s Avatar`,
      appearance: {
        gender: gender || 'neutral',
        bodyType: bodyType || 'average',
        skinTone: skinTone || 'medium',
        height: Math.floor(Math.random() * 30) + 150, // 150-180 cm
        hairStyle: hairStyle || 'short',
        hairColor: hairColor || 'brown',
        facialFeatures: facialFeatures || {}
      },
      outfit: {
        clothing: clothing || ['casual-shirt', 'jeans', 'sneakers'],
        accessories: accessories || []
      },
      metaverseProfile: {
        level: 1,
        experience: 0,
        achievements: [],
        virtualCurrency: 1000
      },
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    user.metaverseAvatar = avatar;
    await user.save();

    res.status(201).json({
      message: 'Avatar created successfully',
      avatar,
      modelUrl: `https://cdn.nexusmart.com/avatars/${avatar.avatarId}/model.glb`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating avatar', error: error.message });
  }
};

// Update Avatar Outfit
export const updateAvatarOutfit = async (req, res) => {
  try {
    const { clothing, accessories } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user || !user.metaverseAvatar) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    user.metaverseAvatar.outfit = {
      clothing: clothing || user.metaverseAvatar.outfit.clothing,
      accessories: accessories || user.metaverseAvatar.outfit.accessories
    };
    user.metaverseAvatar.lastUpdated = new Date();

    await user.save();

    res.status(200).json({
      message: 'Avatar outfit updated successfully',
      avatar: user.metaverseAvatar
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating avatar outfit', error: error.message });
  }
};

// Try On Product with Avatar
export const tryOnProductWithAvatar = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.user?.id);
    const product = await Product.findById(productId);

    if (!user || !user.metaverseAvatar) {
      return res.status(404).json({ message: 'Avatar not found. Please create an avatar first.' });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Generate virtual try-on result
    const tryOnResult = {
      sessionId: `TRYON-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      avatarId: user.metaverseAvatar.avatarId,
      productId: product._id,
      productName: product.name,
      renderUrl: `https://cdn.nexusmart.com/tryon/${user.metaverseAvatar.avatarId}/${productId}/render.png`,
      model3D: `https://cdn.nexusmart.com/tryon/${user.metaverseAvatar.avatarId}/${productId}/model.glb`,
      fitAnalysis: {
        size: 'Perfect Fit',
        comfort: 95,
        style: 'Excellent Match',
        recommendations: ['Great choice!', 'Matches your style profile']
      },
      timestamp: new Date()
    };

    res.status(200).json({
      message: 'Virtual try-on generated successfully',
      tryOnResult
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating virtual try-on', error: error.message });
  }
};

// VR Experience

// Start VR Shopping Session
export const startVRSession = async (req, res) => {
  try {
    const { storeId, deviceType } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const vrSession = {
      sessionId: `VR-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,
      userId: user._id,
      storeId: storeId || 'default',
      deviceType: deviceType || 'VR_HEADSET', // VR_HEADSET, DESKTOP_VR, MOBILE_VR
      startTime: new Date(),
      status: 'active',
      settings: {
        graphics: 'high',
        locomotion: 'teleport',
        handTracking: true,
        voiceEnabled: true,
        socialMode: true
      },
      connectionUrl: `vr://nexusmart.metaverse/${storeId}?session=${Date.now()}`
    };

    // Store session
    if (!user.vrSessions) {
      user.vrSessions = [];
    }
    user.vrSessions.push(vrSession);
    await user.save();

    res.status(201).json({
      message: 'VR shopping session started',
      vrSession,
      launchUrl: vrSession.connectionUrl,
      instructions: 'Put on your VR headset and launch the NexusMart VR app'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting VR session', error: error.message });
  }
};

// Get VR Session Status
export const getVRSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const user = await User.findOne({
      'vrSessions.sessionId': sessionId
    });

    if (!user) {
      return res.status(404).json({ message: 'VR session not found' });
    }

    const session = user.vrSessions.find(s => s.sessionId === sessionId);

    res.status(200).json({
      session,
      duration: session.startTime ? Math.floor((new Date() - session.startTime) / 1000) : 0,
      status: 'active'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching VR session status', error: error.message });
  }
};

// End VR Session
export const endVRSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const user = await User.findOne({
      'vrSessions.sessionId': sessionId
    });

    if (!user) {
      return res.status(404).json({ message: 'VR session not found' });
    }

    const session = user.vrSessions.find(s => s.sessionId === sessionId);
    session.status = 'ended';
    session.endTime = new Date();
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);

    await user.save();

    res.status(200).json({
      message: 'VR session ended',
      sessionSummary: {
        sessionId: session.sessionId,
        duration: session.duration,
        productsViewed: Math.floor(Math.random() * 20) + 5,
        itemsAddedToCart: Math.floor(Math.random() * 5)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error ending VR session', error: error.message });
  }
};

// 3D Product Gallery

// Get 3D Product Gallery
export const get3DProductGallery = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    const query = {
      isActive: true,
      '3dModel': { $exists: true }
    };

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    // Enhance products with 3D viewing data
    const gallery = products.map(product => ({
      productId: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.images?.[0],
      model3D: {
        glbUrl: `https://cdn.nexusmart.com/3d/${product._id}/model.glb`,
        usdzUrl: `https://cdn.nexusmart.com/3d/${product._id}/model.usdz`,
        thumbnailUrl: `https://cdn.nexusmart.com/3d/${product._id}/thumbnail.png`,
        fileSize: Math.floor(Math.random() * 50) + 5, // MB
        polygonCount: Math.floor(Math.random() * 50000) + 10000,
        textureResolution: '4K',
        animations: product.category === 'clothing' ? ['idle', 'walk', 'rotate'] : ['rotate']
      },
      arEnabled: true,
      vrEnabled: true
    }));

    res.status(200).json({
      gallery,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching 3D product gallery', error: error.message });
  }
};

// Get Single 3D Product
export const get3DProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product3D = {
      productId: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      model3D: {
        glbUrl: `https://cdn.nexusmart.com/3d/${product._id}/model.glb`,
        usdzUrl: `https://cdn.nexusmart.com/3d/${product._id}/model.usdz`,
        variants: [
          {
            color: 'default',
            textureUrl: `https://cdn.nexusmart.com/3d/${product._id}/texture_default.png`
          }
        ],
        viewer: {
          autoRotate: true,
          zoomEnabled: true,
          panEnabled: true,
          lightingPreset: 'studio',
          backgroundColor: '#f0f0f0'
        }
      },
      interactiveFeatures: {
        annotations: [
          { position: [0, 0.5, 0], text: 'Premium Material' },
          { position: [0, -0.5, 0], text: 'Reinforced Base' }
        ],
        hotspots: [
          { position: [0.3, 0, 0], info: 'Detailed craftsmanship' }
        ]
      },
      arOptions: {
        enabled: true,
        iosQuickLook: true,
        androidSceneViewer: true
      }
    };

    res.status(200).json({
      message: '3D product retrieved successfully',
      product: product3D
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching 3D product', error: error.message });
  }
};

// Upload 3D Product Model
export const upload3DModel = async (req, res) => {
  try {
    const { productId, modelType, modelUrl } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product['3dModel']) {
      product['3dModel'] = {};
    }

    product['3dModel'][modelType] = modelUrl; // glb, usdz, fbx
    product['3dModel'].uploadedAt = new Date();
    product['3dModel'].status = 'active';

    await product.save();

    res.status(200).json({
      message: '3D model uploaded successfully',
      product,
      viewerUrl: `https://nexusmart.com/3d-viewer/${productId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading 3D model', error: error.message });
  }
};

// Social Features in Metaverse

// Invite Friends to Virtual Store
export const inviteFriendsToStore = async (req, res) => {
  try {
    const { storeId, friendIds, message } = req.body;

    const invitations = friendIds.map(friendId => ({
      invitationId: `INV-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      from: req.user?.id,
      to: friendId,
      storeId,
      message: message || 'Join me for shopping in the metaverse!',
      status: 'sent',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }));

    res.status(200).json({
      message: 'Invitations sent successfully',
      invitations
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending invitations', error: error.message });
  }
};

// Get Metaverse Statistics
export const getMetaverseStats = async (req, res) => {
  try {
    const stats = {
      totalVirtualStores: Math.floor(Math.random() * 100) + 50,
      activeUsers: Math.floor(Math.random() * 1000) + 500,
      totalAvatars: Math.floor(Math.random() * 5000) + 2000,
      products3D: Math.floor(Math.random() * 10000) + 5000,
      vrSessions: {
        today: Math.floor(Math.random() * 200) + 100,
        thisWeek: Math.floor(Math.random() * 1000) + 500,
        thisMonth: Math.floor(Math.random() * 5000) + 2000
      },
      averageSessionDuration: Math.floor(Math.random() * 20) + 10, // minutes
      conversionRate: (Math.random() * 10 + 5).toFixed(2) // %
    };

    res.status(200).json({
      stats,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metaverse statistics', error: error.message });
  }
};

export default {
  createVirtualStore,
  getVirtualStore,
  listVirtualStores,
  createAvatar,
  updateAvatarOutfit,
  tryOnProductWithAvatar,
  startVRSession,
  getVRSessionStatus,
  endVRSession,
  get3DProductGallery,
  get3DProduct,
  upload3DModel,
  inviteFriendsToStore,
  getMetaverseStats
};
