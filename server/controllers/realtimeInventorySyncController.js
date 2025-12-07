import RealtimeInventorySync from '../models/RealtimeInventorySync.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Get inventory for a product
// @route   GET /api/v1/inventory/:sku
// @access  Private/Admin
export const getInventoryBySKU = catchAsyncErrors(async (req, res, next) => {
  const inventory = await RealtimeInventorySync.findOne({ sku: req.params.sku })
    .populate('product')
    .populate('warehouses.warehouseId');

  if (!inventory) {
    return next(new ErrorHandler('Inventory not found', 404));
  }

  res.status(200).json({
    success: true,
    inventory
  });
});

// @desc    Create new inventory record
// @route   POST /api/v1/inventory
// @access  Private/Admin
export const createInventory = catchAsyncErrors(async (req, res, next) => {
  const inventory = await RealtimeInventorySync.create(req.body);

  res.status(201).json({
    success: true,
    inventory
  });
});

// @desc    Update warehouse stock
// @route   PUT /api/v1/inventory/:sku/warehouse/:warehouseId
// @access  Private/Admin
export const updateWarehouseStock = catchAsyncErrors(async (req, res, next) => {
  const inventory = await RealtimeInventorySync.findOne({ sku: req.params.sku });

  if (!inventory) {
    return next(new ErrorHandler('Inventory not found', 404));
  }

  const warehouse = inventory.updateWarehouseStock(req.params.warehouseId, req.body.stockChanges);
  await inventory.save();

  res.status(200).json({
    success: true,
    warehouse
  });
});

// @desc    Get low stock items
// @route   GET /api/v1/inventory/low-stock
// @access  Private/Admin
export const getLowStockItems = catchAsyncErrors(async (req, res, next) => {
  const items = await RealtimeInventorySync.getLowStockItems();

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
});

// @desc    Get out of stock items
// @route   GET /api/v1/inventory/out-of-stock
// @access  Private/Admin
export const getOutOfStockItems = catchAsyncErrors(async (req, res, next) => {
  const items = await RealtimeInventorySync.getOutOfStockItems();

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
});

// @desc    Sync with channel
// @route   POST /api/v1/inventory/:sku/sync/:channel
// @access  Private/Admin
export const syncWithChannel = catchAsyncErrors(async (req, res, next) => {
  const inventory = await RealtimeInventorySync.findOne({ sku: req.params.sku });

  if (!inventory) {
    return next(new ErrorHandler('Inventory not found', 404));
  }

  const result = await inventory.syncWithChannel(req.params.channel);
  await inventory.save();

  res.status(200).json({
    success: true,
    result
  });
});

// @desc    Get pending reorders
// @route   GET /api/v1/inventory/pending-reorders
// @access  Private/Admin
export const getPendingReorders = catchAsyncErrors(async (req, res, next) => {
  const items = await RealtimeInventorySync.getPendingReorders();

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
});

// @desc    Get active alerts
// @route   GET /api/v1/inventory/:sku/alerts
// @access  Private/Admin
export const getActiveAlerts = catchAsyncErrors(async (req, res, next) => {
  const inventory = await RealtimeInventorySync.findOne({ sku: req.params.sku });

  if (!inventory) {
    return next(new ErrorHandler('Inventory not found', 404));
  }

  const activeAlerts = inventory.activeAlerts.filter(alert => !alert.resolved);

  res.status(200).json({
    success: true,
    count: activeAlerts.length,
    alerts: activeAlerts
  });
});

// @desc    Acknowledge alert
// @route   PUT /api/v1/inventory/:sku/alerts/:alertId/acknowledge
// @access  Private/Admin
export const acknowledgeAlert = catchAsyncErrors(async (req, res, next) => {
  const inventory = await RealtimeInventorySync.findOne({ sku: req.params.sku });

  if (!inventory) {
    return next(new ErrorHandler('Inventory not found', 404));
  }

  const alert = inventory.activeAlerts.id(req.params.alertId);

  if (!alert) {
    return next(new ErrorHandler('Alert not found', 404));
  }

  alert.acknowledgedAt = Date.now();
  alert.acknowledgedBy = req.user._id;
  alert.resolved = true;
  alert.resolvedAt = Date.now();

  await inventory.save();

  res.status(200).json({
    success: true,
    alert
  });
});

// @desc    Get inventory analytics
// @route   GET /api/v1/inventory/analytics
// @access  Private/Admin
export const getInventoryAnalytics = catchAsyncErrors(async (req, res, next) => {
  const totalInventory = await RealtimeInventorySync.countDocuments();
  const lowStock = await RealtimeInventorySync.countDocuments({
    'globalStock.totalAvailable': { $lte: 10, $gt: 0 }
  });
  const outOfStock = await RealtimeInventorySync.countDocuments({
    'globalStock.totalAvailable': 0
  });

  const totalValue = await RealtimeInventorySync.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: '$globalStock.totalAvailable' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      totalInventory,
      lowStock,
      outOfStock,
      totalItems: totalValue[0]?.totalItems || 0
    }
  });
});
