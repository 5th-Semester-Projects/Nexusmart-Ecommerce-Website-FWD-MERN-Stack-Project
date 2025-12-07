import GeolocationServices from '../models/GeolocationServices.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Get business geolocation config
export const getGeolocationConfig = catchAsyncErrors(async (req, res, next) => {
  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    config
  });
});

// Create geolocation configuration
export const createGeolocationConfig = catchAsyncErrors(async (req, res, next) => {
  const config = await GeolocationServices.create({
    business: req.user._id,
    ...req.body
  });

  res.status(201).json({
    success: true,
    message: 'Configuration created',
    config
  });
});

// Add store location
export const addStore = catchAsyncErrors(async (req, res, next) => {
  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const storeData = {
    ...req.body,
    storeId: `STORE${Date.now()}`
  };

  config.stores.push(storeData);
  await config.save();

  res.status(201).json({
    success: true,
    message: 'Store added',
    store: config.stores[config.stores.length - 1]
  });
});

// Update store
export const updateStore = catchAsyncErrors(async (req, res, next) => {
  const { storeId } = req.params;

  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const store = config.stores.find(s => s.storeId === storeId);

  if (!store) {
    return next(new ErrorHandler('Store not found', 404));
  }

  Object.assign(store, req.body);
  await config.save();

  res.status(200).json({
    success: true,
    message: 'Store updated',
    store
  });
});

// Find nearby stores
export const findNearbyStores = catchAsyncErrors(async (req, res, next) => {
  const { longitude, latitude, maxDistance } = req.query;

  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const nearbyStores = config.findNearbyStores(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance ? parseInt(maxDistance) : 50000
  );

  res.status(200).json({
    success: true,
    count: nearbyStores.length,
    stores: nearbyStores
  });
});

// Check product availability
export const checkProductAvailability = catchAsyncErrors(async (req, res, next) => {
  const { productId, longitude, latitude, radius } = req.query;

  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const availability = config.checkProductAvailability(
    productId,
    parseFloat(longitude),
    parseFloat(latitude),
    radius ? parseInt(radius) : 50000
  );

  res.status(200).json({
    success: true,
    availability
  });
});

// Create geofence
export const createGeofence = catchAsyncErrors(async (req, res, next) => {
  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  config.geofences.push(req.body);
  await config.save();

  res.status(201).json({
    success: true,
    message: 'Geofence created',
    geofence: config.geofences[config.geofences.length - 1]
  });
});

// Update geofence
export const updateGeofence = catchAsyncErrors(async (req, res, next) => {
  const { geofenceId } = req.params;

  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const geofence = config.geofences.id(geofenceId);

  if (!geofence) {
    return next(new ErrorHandler('Geofence not found', 404));
  }

  Object.assign(geofence, req.body);
  await config.save();

  res.status(200).json({
    success: true,
    message: 'Geofence updated',
    geofence
  });
});

// Trigger geofence event
export const triggerGeofenceEvent = catchAsyncErrors(async (req, res, next) => {
  const { longitude, latitude, action } = req.body;

  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  await config.triggerGeofence(req.user._id, longitude, latitude, action);

  res.status(200).json({
    success: true,
    message: 'Geofence event triggered'
  });
});

// Get store inventory
export const getStoreInventory = catchAsyncErrors(async (req, res, next) => {
  const { storeId } = req.params;

  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const store = config.stores.find(s => s.storeId === storeId);

  if (!store) {
    return next(new ErrorHandler('Store not found', 404));
  }

  res.status(200).json({
    success: true,
    inventory: store.inventory
  });
});

// Update store inventory
export const updateStoreInventory = catchAsyncErrors(async (req, res, next) => {
  const { storeId } = req.params;
  const { productId, quantity } = req.body;

  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  const store = config.stores.find(s => s.storeId === storeId);

  if (!store) {
    return next(new ErrorHandler('Store not found', 404));
  }

  const inventoryItem = store.inventory.products.find(
    p => p.product.toString() === productId
  );

  if (inventoryItem) {
    inventoryItem.quantity = quantity;
    inventoryItem.lastUpdated = Date.now();
  } else {
    store.inventory.products.push({
      product: productId,
      quantity,
      lastUpdated: Date.now()
    });
  }

  await config.save();

  res.status(200).json({
    success: true,
    message: 'Inventory updated'
  });
});

// Get location-based shipping
export const getLocationBasedShipping = catchAsyncErrors(async (req, res, next) => {
  const { longitude, latitude } = req.query;

  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    shippingZones: config.locationBasedShipping.zones
  });
});

// Get analytics
export const getGeolocationAnalytics = catchAsyncErrors(async (req, res, next) => {
  const config = await GeolocationServices.findOne({ business: req.user._id });

  if (!config) {
    return next(new ErrorHandler('Configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    analytics: config.analytics
  });
});
