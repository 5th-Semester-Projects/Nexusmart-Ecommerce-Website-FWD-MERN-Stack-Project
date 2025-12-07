import NFTMarketplace from '../models/NFTMarketplace.js';
import IoTIntegration from '../models/IoTIntegration.js';
import MetaverseCommerce from '../models/MetaverseCommerce.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// NFT Marketplace Controllers

export const mintNFT = catchAsyncErrors(async (req, res, next) => {
  const { name, description, image, attributes, royaltyPercentage } = req.body;

  const tokenId = generateTokenId();

  const nft = await NFTMarketplace.create({
    nft: {
      tokenId,
      contractAddress: process.env.NFT_CONTRACT_ADDRESS || '0x1234567890',
      blockchain: 'polygon',
      standard: 'ERC-721'
    },
    metadata: {
      name,
      description,
      image,
      attributes: attributes || []
    },
    creator: req.user.id,
    owner: req.user.id,
    royalties: {
      percentage: royaltyPercentage || 5,
      recipient: req.user.id
    },
    history: [{
      event: 'mint',
      to: req.user.id,
      transactionHash: '0x' + Math.random().toString(36).substring(2, 66),
      timestamp: Date.now()
    }]
  });

  res.status(201).json({
    success: true,
    data: nft
  });
});

export const listNFT = catchAsyncErrors(async (req, res, next) => {
  const { nftId, price, currency, saleType } = req.body;

  const nft = await NFTMarketplace.findOne({
    _id: nftId,
    owner: req.user.id
  });

  if (!nft) {
    return next(new ErrorHandler('NFT not found or not owned by you', 404));
  }

  nft.listing = {
    listed: true,
    price,
    currency: currency || 'ETH',
    priceInUSD: price * 2000, // Simplified conversion
    saleType: saleType || 'fixed',
    listedAt: Date.now()
  };

  nft.history.push({
    event: 'list',
    from: req.user.id,
    timestamp: Date.now()
  });

  await nft.save();

  res.status(200).json({
    success: true,
    data: nft
  });
});

export const buyNFT = catchAsyncErrors(async (req, res, next) => {
  const { nftId } = req.params;

  const nft = await NFTMarketplace.findById(nftId);

  if (!nft || !nft.listing.listed) {
    return next(new ErrorHandler('NFT not available for sale', 404));
  }

  const previousOwner = nft.owner;
  nft.owner = req.user.id;
  nft.listing.listed = false;

  nft.history.push({
    event: 'sale',
    from: previousOwner,
    to: req.user.id,
    price: nft.listing.price,
    currency: nft.listing.currency,
    transactionHash: '0x' + Math.random().toString(36).substring(2, 66),
    timestamp: Date.now()
  });

  await nft.save();

  res.status(200).json({
    success: true,
    data: nft
  });
});

export const getUserNFTs = catchAsyncErrors(async (req, res, next) => {
  const nfts = await NFTMarketplace.find({ owner: req.user.id });

  res.status(200).json({
    success: true,
    count: nfts.length,
    data: nfts
  });
});

// IoT Integration Controllers

export const connectIoTDevice = catchAsyncErrors(async (req, res, next) => {
  const { deviceId, deviceType, brand, model, name } = req.body;

  const iot = await IoTIntegration.create({
    user: req.user.id,
    device: {
      id: deviceId,
      type: deviceType,
      brand,
      model,
      name: name || `${brand} ${model}`
    },
    connection: {
      status: 'connected',
      connectedAt: Date.now(),
      lastSeen: Date.now(),
      protocol: 'mqtt'
    },
    reorderSettings: {
      autoReorder: false,
      products: []
    }
  });

  res.status(201).json({
    success: true,
    data: iot
  });
});

export const setupAutoReorder = catchAsyncErrors(async (req, res, next) => {
  const { deviceId, products } = req.body;

  const iot = await IoTIntegration.findOne({
    user: req.user.id,
    'device.id': deviceId
  });

  if (!iot) {
    return next(new ErrorHandler('IoT device not found', 404));
  }

  iot.reorderSettings.autoReorder = true;
  iot.reorderSettings.products = products.map(p => ({
    product: p.productId,
    threshold: p.threshold,
    reorderQuantity: p.quantity,
    reorderFrequency: p.frequency || 'monthly'
  }));

  await iot.save();

  res.status(200).json({
    success: true,
    data: iot
  });
});

export const updateInventory = catchAsyncErrors(async (req, res, next) => {
  const { deviceId, inventory } = req.body;

  const iot = await IoTIntegration.findOne({
    user: req.user.id,
    'device.id': deviceId
  });

  if (!iot) {
    return next(new ErrorHandler('IoT device not found', 404));
  }

  iot.inventory = inventory.map(item => ({
    product: item.productId,
    quantity: item.quantity,
    unit: item.unit,
    threshold: item.threshold,
    lastUpdated: Date.now()
  }));

  iot.connection.lastSeen = Date.now();
  await iot.save();

  // Check for low stock and trigger reorder if needed
  for (const item of iot.inventory) {
    if (item.quantity <= item.threshold && iot.reorderSettings.autoReorder) {
      const reorderProduct = iot.reorderSettings.products.find(
        p => p.product.toString() === item.product.toString()
      );

      if (reorderProduct) {
        // Trigger auto-reorder logic here
        iot.notifications.push({
          type: 'Low stock detected',
          message: `Auto-reorder triggered for product`,
          sentAt: Date.now(),
          acknowledged: false
        });
      }
    }
  }

  await iot.save();

  res.status(200).json({
    success: true,
    data: iot
  });
});

// Metaverse Commerce Controllers

export const createVirtualStore = catchAsyncErrors(async (req, res, next) => {
  const { storeName, platform, layout, location } = req.body;

  const metaverse = await MetaverseCommerce.create({
    user: req.user.id,
    virtualStore: {
      name: storeName,
      platform: platform || 'decentraland',
      coordinates: location || { x: 0, y: 0, z: 0 },
      layout: layout || '3d_showroom',
      theme: 'modern'
    },
    status: 'active'
  });

  res.status(201).json({
    success: true,
    data: metaverse
  });
});

// Helper functions
function generateTokenId() {
  return Date.now().toString() + Math.floor(Math.random() * 10000);
}
