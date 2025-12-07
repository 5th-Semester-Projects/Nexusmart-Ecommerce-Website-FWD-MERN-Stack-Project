const InventoryManagement = require('../models/InventoryManagement');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create inventory
exports.createInventory = catchAsyncErrors(async (req, res) => {
  const inventory = await InventoryManagement.create(req.body);

  res.status(201).json({
    success: true,
    inventory
  });
});

// Get inventory by SKU
exports.getInventoryBySKU = catchAsyncErrors(async (req, res) => {
  const { sku } = req.params;

  const inventory = await InventoryManagement.findOne({ sku })
    .populate('product variant');

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found'
    });
  }

  res.status(200).json({
    success: true,
    inventory
  });
});

// Adjust stock
exports.adjustStock = catchAsyncErrors(async (req, res) => {
  const { sku } = req.params;
  const { quantity, type, reason, performedBy } = req.body;

  const inventory = await InventoryManagement.findOne({ sku });

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found'
    });
  }

  inventory.adjustStock(quantity, type, reason, performedBy);
  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Stock adjusted successfully',
    inventory
  });
});

// Reserve stock
exports.reserveStock = catchAsyncErrors(async (req, res) => {
  const { sku } = req.params;
  const { quantity } = req.body;

  const inventory = await InventoryManagement.findOne({ sku });

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found'
    });
  }

  inventory.reserveStock(quantity);
  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Stock reserved successfully'
  });
});

// Release reserved stock
exports.releaseStock = catchAsyncErrors(async (req, res) => {
  const { sku } = req.params;
  const { quantity } = req.body;

  const inventory = await InventoryManagement.findOne({ sku });

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found'
    });
  }

  inventory.releaseReservedStock(quantity);
  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Stock released successfully'
  });
});

// Transfer stock
exports.transferStock = catchAsyncErrors(async (req, res) => {
  const { sku } = req.params;
  const { quantity, fromWarehouse, toWarehouse, performedBy } = req.body;

  const inventory = await InventoryManagement.findOne({ sku });

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found'
    });
  }

  inventory.transferStock(quantity, fromWarehouse, toWarehouse, performedBy);
  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Stock transferred successfully'
  });
});

// Get low stock items
exports.getLowStockItems = catchAsyncErrors(async (req, res) => {
  const items = await InventoryManagement.getLowStockItems();

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
});

// Get out of stock items
exports.getOutOfStockItems = catchAsyncErrors(async (req, res) => {
  const items = await InventoryManagement.getOutOfStockItems();

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
});

module.exports = exports;
