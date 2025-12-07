import Warehouse from '../models/Warehouse.js';
import Product from '../models/Product.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Warehouse Management Controllers

export const createWarehouse = catchAsyncErrors(async (req, res, next) => {
  const { name, code, type, location, capacity, operations } = req.body;

  const warehouse = await Warehouse.create({
    name,
    code,
    type,
    location,
    capacity,
    operations,
    status: 'active'
  });

  res.status(201).json({
    success: true,
    data: warehouse
  });
});

export const getAllWarehouses = catchAsyncErrors(async (req, res, next) => {
  const { status, type } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const warehouses = await Warehouse.find(filter);

  res.status(200).json({
    success: true,
    count: warehouses.length,
    data: warehouses
  });
});

export const getNearestWarehouse = catchAsyncErrors(async (req, res, next) => {
  const { latitude, longitude, maxDistance } = req.query;

  const warehouses = await Warehouse.find({
    status: 'active',
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseInt(maxDistance) || 100000
      }
    }
  });

  res.status(200).json({
    success: true,
    count: warehouses.length,
    data: warehouses
  });
});

// Inventory Management

export const addInventoryToWarehouse = catchAsyncErrors(async (req, res, next) => {
  const { warehouseId } = req.params;
  const { productId, sku, quantity, location } = req.body;

  const warehouse = await Warehouse.findById(warehouseId);

  if (!warehouse) {
    return next(new ErrorHandler('Warehouse not found', 404));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check if product already exists in warehouse
  const existingInventory = warehouse.inventory.find(
    inv => inv.product.toString() === productId
  );

  if (existingInventory) {
    existingInventory.quantity.available += quantity.available || 0;
  } else {
    warehouse.inventory.push({
      product: productId,
      sku,
      quantity: {
        available: quantity.available || 0,
        reserved: 0,
        damaged: 0,
        inTransit: 0
      },
      location,
      reorderPoint: quantity.reorderPoint || 10,
      reorderQuantity: quantity.reorderQuantity || 50,
      lastRestocked: Date.now()
    });
  }

  await warehouse.save();

  res.status(200).json({
    success: true,
    data: warehouse
  });
});

export const getWarehouseInventory = catchAsyncErrors(async (req, res, next) => {
  const { warehouseId } = req.params;

  const warehouse = await Warehouse.findById(warehouseId)
    .populate('inventory.product', 'name sku price images');

  if (!warehouse) {
    return next(new ErrorHandler('Warehouse not found', 404));
  }

  res.status(200).json({
    success: true,
    data: warehouse.inventory
  });
});

export const checkLowStockItems = catchAsyncErrors(async (req, res, next) => {
  const { warehouseId } = req.params;

  const warehouse = await Warehouse.findById(warehouseId)
    .populate('inventory.product', 'name sku');

  if (!warehouse) {
    return next(new ErrorHandler('Warehouse not found', 404));
  }

  const lowStockItems = warehouse.inventory.filter(
    inv => inv.quantity.available <= inv.reorderPoint
  );

  res.status(200).json({
    success: true,
    count: lowStockItems.length,
    data: lowStockItems
  });
});

// Auto-reordering

export const triggerAutoReorder = catchAsyncErrors(async (req, res, next) => {
  const { warehouseId, inventoryItemId } = req.body;

  const warehouse = await Warehouse.findById(warehouseId);

  if (!warehouse) {
    return next(new ErrorHandler('Warehouse not found', 404));
  }

  const inventoryItem = warehouse.inventory.id(inventoryItemId);

  if (!inventoryItem) {
    return next(new ErrorHandler('Inventory item not found', 404));
  }

  // Create reorder request
  const reorderRequest = {
    warehouse: warehouseId,
    product: inventoryItem.product,
    quantity: inventoryItem.reorderQuantity,
    status: 'pending',
    requestedAt: Date.now()
  };

  // Update inventory status
  inventoryItem.quantity.inTransit += inventoryItem.reorderQuantity;
  await warehouse.save();

  res.status(200).json({
    success: true,
    message: 'Auto-reorder triggered',
    data: reorderRequest
  });
});

// Stock Transfer

export const transferStock = catchAsyncErrors(async (req, res, next) => {
  const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;

  const fromWarehouse = await Warehouse.findById(fromWarehouseId);
  const toWarehouse = await Warehouse.findById(toWarehouseId);

  if (!fromWarehouse || !toWarehouse) {
    return next(new ErrorHandler('Warehouse not found', 404));
  }

  // Find inventory in source warehouse
  const sourceInventory = fromWarehouse.inventory.find(
    inv => inv.product.toString() === productId
  );

  if (!sourceInventory || sourceInventory.quantity.available < quantity) {
    return next(new ErrorHandler('Insufficient stock', 400));
  }

  // Reduce from source
  sourceInventory.quantity.available -= quantity;

  // Add to destination
  const destInventory = toWarehouse.inventory.find(
    inv => inv.product.toString() === productId
  );

  if (destInventory) {
    destInventory.quantity.available += quantity;
  } else {
    toWarehouse.inventory.push({
      product: productId,
      sku: sourceInventory.sku,
      quantity: {
        available: quantity,
        reserved: 0,
        damaged: 0,
        inTransit: 0
      },
      reorderPoint: sourceInventory.reorderPoint,
      reorderQuantity: sourceInventory.reorderQuantity
    });
  }

  await fromWarehouse.save();
  await toWarehouse.save();

  res.status(200).json({
    success: true,
    message: 'Stock transferred successfully'
  });
});

// Demand Forecasting

export const getDemandForecast = catchAsyncErrors(async (req, res, next) => {
  const { productId, warehouseId, period } = req.query;

  // Simplified demand forecasting
  const forecast = {
    product: productId,
    warehouse: warehouseId,
    period: period || 'monthly',
    predictions: [
      { month: 'Jan', predictedDemand: 250, confidence: 85 },
      { month: 'Feb', predictedDemand: 280, confidence: 82 },
      { month: 'Mar', predictedDemand: 320, confidence: 88 },
      { month: 'Apr', predictedDemand: 300, confidence: 84 }
    ],
    recommendedStock: 350,
    reorderTiming: 'In 2 weeks'
  };

  res.status(200).json({
    success: true,
    data: forecast
  });
});
