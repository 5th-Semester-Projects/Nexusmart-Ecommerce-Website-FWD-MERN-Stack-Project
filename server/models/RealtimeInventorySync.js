import mongoose from 'mongoose';

const realtimeInventorySyncSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },

  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant'
  },

  sku: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Multi-Warehouse Stock Levels
  warehouses: [{
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    warehouseName: String,
    location: {
      country: String,
      city: String,
      address: String
    },

    // Stock Quantities
    stock: {
      available: { type: Number, default: 0, min: 0 },
      reserved: { type: Number, default: 0, min: 0 },
      damaged: { type: Number, default: 0, min: 0 },
      inTransit: { type: Number, default: 0, min: 0 },
      onOrder: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 }
    },

    // Reorder Settings
    reorderPoint: { type: Number, default: 10 },
    reorderQuantity: { type: Number, default: 50 },
    maxStockLevel: { type: Number, default: 1000 },
    autoReorder: { type: Boolean, default: false },

    // Status
    status: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
      default: 'in-stock'
    },

    lastUpdated: { type: Date, default: Date.now },
    lastSync: Date
  }],

  // Global Stock Summary
  globalStock: {
    totalAvailable: { type: Number, default: 0 },
    totalReserved: { type: Number, default: 0 },
    totalDamaged: { type: Number, default: 0 },
    totalInTransit: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  // Channel-wise Stock Allocation
  channelAllocations: [{
    channel: {
      type: String,
      enum: ['website', 'mobile-app', 'amazon', 'ebay', 'facebook', 'instagram', 'retail-store', 'wholesale'],
      required: true
    },
    allocated: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    returned: { type: Number, default: 0 },
    lastSync: Date,
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'failed', 'partial'],
      default: 'synced'
    },
    syncError: String
  }],

  // Real-Time Sync Status
  syncStatus: {
    lastSyncTime: Date,
    nextSyncTime: Date,
    syncFrequency: { type: Number, default: 300 }, // seconds
    isSyncing: { type: Boolean, default: false },
    lastSyncSuccess: { type: Boolean, default: true },
    failedSyncCount: { type: Number, default: 0 },
    lastSyncError: String
  },

  // Stock Movement History
  movements: [{
    type: {
      type: String,
      enum: ['sale', 'purchase', 'return', 'damage', 'transfer', 'adjustment', 'allocation', 'deallocation'],
      required: true
    },
    quantity: { type: Number, required: true },
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse'
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse'
    },
    channel: String,
    reason: String,
    reference: String, // Order ID, Transfer ID, etc.
    timestamp: { type: Date, default: Date.now },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Alerts Configuration
  alerts: {
    lowStockEnabled: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 },
    outOfStockEnabled: { type: Boolean, default: true },
    overstockEnabled: { type: Boolean, default: false },
    overstockThreshold: { type: Number, default: 500 },
    expiryAlertEnabled: { type: Boolean, default: false },
    expiryAlertDays: { type: Number, default: 30 }
  },

  // Active Alerts
  activeAlerts: [{
    type: {
      type: String,
      enum: ['low-stock', 'out-of-stock', 'overstock', 'expiring-soon', 'sync-failed', 'reorder-triggered'],
      required: true
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning'
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse'
    },
    channel: String,
    message: String,
    quantity: Number,
    triggeredAt: { type: Date, default: Date.now },
    acknowledgedAt: Date,
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date
  }],

  // Automatic Reorder
  autoReorderHistory: [{
    triggeredAt: Date,
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse'
    },
    quantityOrdered: Number,
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    purchaseOrder: String,
    estimatedDelivery: Date,
    status: {
      type: String,
      enum: ['pending', 'ordered', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    deliveredAt: Date,
    quantityReceived: Number
  }],

  // Supplier Information
  suppliers: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    supplierName: String,
    isPrimary: { type: Boolean, default: false },
    leadTime: { type: Number, default: 7 }, // days
    minimumOrderQuantity: { type: Number, default: 1 },
    unitCost: Number,
    lastOrderDate: Date,
    reliability: { type: Number, min: 0, max: 100 }
  }],

  // Forecasting Data
  forecasting: {
    avgDailySales: { type: Number, default: 0 },
    avgWeeklySales: { type: Number, default: 0 },
    avgMonthlySales: { type: Number, default: 0 },
    salesTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable'
    },
    seasonalDemand: [{
      month: Number,
      multiplier: Number
    }],
    predictedStockoutDate: Date,
    daysToStockout: Number,
    recommendedReorderDate: Date
  },

  // Batch/Lot Tracking
  batches: [{
    batchNumber: { type: String, required: true },
    quantity: Number,
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse'
    },
    manufactureDate: Date,
    expiryDate: Date,
    supplier: String,
    receivedDate: Date,
    cost: Number,
    status: {
      type: String,
      enum: ['active', 'expired', 'recalled', 'sold-out'],
      default: 'active'
    }
  }],

  // Integration Settings
  integrations: [{
    platform: {
      type: String,
      enum: ['shopify', 'woocommerce', 'magento', 'amazon', 'ebay', 'walmart', 'custom-api']
    },
    enabled: { type: Boolean, default: true },
    apiEndpoint: String,
    lastSync: Date,
    syncStatus: String,
    autoSync: { type: Boolean, default: true },
    syncInterval: { type: Number, default: 300 } // seconds
  }],

  // Performance Metrics
  metrics: {
    totalMovements: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalReturns: { type: Number, default: 0 },
    turnoverRate: { type: Number, default: 0 },
    stockAccuracy: { type: Number, default: 100 },
    lastStockAudit: Date,
    nextStockAudit: Date
  }

}, {
  timestamps: true
, suppressReservedKeysWarning: true });

// Indexes
realtimeInventorySyncSchema.index({ product: 1, variant: 1 });
realtimeInventorySyncSchema.index({ 'warehouses.warehouseId': 1 });
realtimeInventorySyncSchema.index({ 'globalStock.totalAvailable': 1 });
realtimeInventorySyncSchema.index({ 'syncStatus.isSyncing': 1 });
realtimeInventorySyncSchema.index({ 'activeAlerts.resolved': 1, 'activeAlerts.severity': 1 });

// Virtual: Global Status
realtimeInventorySyncSchema.virtual('globalStatus').get(function () {
  if (this.globalStock.totalAvailable === 0) return 'out-of-stock';
  if (this.globalStock.totalAvailable <= this.alerts.lowStockThreshold) return 'low-stock';
  if (this.globalStock.totalAvailable >= this.alerts.overstockThreshold) return 'overstock';
  return 'in-stock';
});

// Method: Update Warehouse Stock
realtimeInventorySyncSchema.methods.updateWarehouseStock = function (warehouseId, stockChanges) {
  const warehouse = this.warehouses.find(w => w.warehouseId.toString() === warehouseId.toString());

  if (!warehouse) {
    throw new Error('Warehouse not found');
  }

  // Update stock levels
  Object.keys(stockChanges).forEach(key => {
    if (warehouse.stock[key] !== undefined) {
      warehouse.stock[key] = Math.max(0, warehouse.stock[key] + stockChanges[key]);
    }
  });

  // Recalculate total
  warehouse.stock.total = warehouse.stock.available + warehouse.stock.reserved +
    warehouse.stock.damaged + warehouse.stock.inTransit;

  // Update status
  if (warehouse.stock.available === 0) {
    warehouse.status = 'out-of-stock';
  } else if (warehouse.stock.available <= this.alerts.lowStockThreshold) {
    warehouse.status = 'low-stock';
  } else {
    warehouse.status = 'in-stock';
  }

  warehouse.lastUpdated = Date.now();

  // Recalculate global stock
  this.calculateGlobalStock();

  // Check alerts
  this.checkAndTriggerAlerts(warehouseId);

  return warehouse;
};

// Method: Calculate Global Stock
realtimeInventorySyncSchema.methods.calculateGlobalStock = function () {
  this.globalStock = {
    totalAvailable: 0,
    totalReserved: 0,
    totalDamaged: 0,
    totalInTransit: 0,
    total: 0
  };

  this.warehouses.forEach(warehouse => {
    this.globalStock.totalAvailable += warehouse.stock.available;
    this.globalStock.totalReserved += warehouse.stock.reserved;
    this.globalStock.totalDamaged += warehouse.stock.damaged;
    this.globalStock.totalInTransit += warehouse.stock.inTransit;
  });

  this.globalStock.total = this.globalStock.totalAvailable + this.globalStock.totalReserved +
    this.globalStock.totalDamaged + this.globalStock.totalInTransit;
};

// Method: Check and Trigger Alerts
realtimeInventorySyncSchema.methods.checkAndTriggerAlerts = function (warehouseId) {
  const warehouse = this.warehouses.find(w => w.warehouseId.toString() === warehouseId.toString());

  if (!warehouse) return;

  // Low stock alert
  if (this.alerts.lowStockEnabled && warehouse.stock.available <= this.alerts.lowStockThreshold && warehouse.stock.available > 0) {
    this.addAlert('low-stock', 'warning', warehouseId, null, `Stock level is low: ${warehouse.stock.available} units`, warehouse.stock.available);
  }

  // Out of stock alert
  if (this.alerts.outOfStockEnabled && warehouse.stock.available === 0) {
    this.addAlert('out-of-stock', 'critical', warehouseId, null, 'Product is out of stock', 0);
  }

  // Auto reorder trigger
  if (warehouse.autoReorder && warehouse.stock.available <= warehouse.reorderPoint) {
    this.triggerAutoReorder(warehouseId);
  }
};

// Method: Add Alert
realtimeInventorySyncSchema.methods.addAlert = function (type, severity, warehouseId, channel, message, quantity) {
  // Check if similar alert already exists
  const existingAlert = this.activeAlerts.find(
    alert => alert.type === type &&
      alert.warehouse?.toString() === warehouseId?.toString() &&
      !alert.resolved
  );

  if (!existingAlert) {
    this.activeAlerts.push({
      type,
      severity,
      warehouse: warehouseId,
      channel,
      message,
      quantity,
      triggeredAt: Date.now(),
      resolved: false
    });
  }
};

// Method: Trigger Auto Reorder
realtimeInventorySyncSchema.methods.triggerAutoReorder = function (warehouseId) {
  const warehouse = this.warehouses.find(w => w.warehouseId.toString() === warehouseId.toString());

  if (!warehouse) return;

  const primarySupplier = this.suppliers.find(s => s.isPrimary) || this.suppliers[0];

  if (!primarySupplier) return;

  this.autoReorderHistory.push({
    triggeredAt: Date.now(),
    warehouse: warehouseId,
    quantityOrdered: warehouse.reorderQuantity,
    supplier: primarySupplier.supplier,
    estimatedDelivery: new Date(Date.now() + primarySupplier.leadTime * 24 * 60 * 60 * 1000),
    status: 'pending'
  });

  this.addAlert('reorder-triggered', 'info', warehouseId, null, `Auto reorder triggered for ${warehouse.reorderQuantity} units`, warehouse.reorderQuantity);
};

// Method: Sync with Channel
realtimeInventorySyncSchema.methods.syncWithChannel = async function (channel) {
  const channelAllocation = this.channelAllocations.find(ca => ca.channel === channel);

  if (!channelAllocation) {
    throw new Error(`Channel ${channel} not found`);
  }

  try {
    // Simulate sync (in production, call actual channel API)
    channelAllocation.lastSync = Date.now();
    channelAllocation.syncStatus = 'synced';
    channelAllocation.syncError = null;

    this.syncStatus.lastSyncSuccess = true;
    this.syncStatus.lastSyncTime = Date.now();
    this.syncStatus.failedSyncCount = 0;

    return { success: true, channel };
  } catch (error) {
    channelAllocation.syncStatus = 'failed';
    channelAllocation.syncError = error.message;

    this.syncStatus.lastSyncSuccess = false;
    this.syncStatus.lastSyncError = error.message;
    this.syncStatus.failedSyncCount += 1;

    return { success: false, channel, error: error.message };
  }
};

// Static: Get Low Stock Items
realtimeInventorySyncSchema.statics.getLowStockItems = function () {
  return this.find({
    'globalStock.totalAvailable': { $lte: 10, $gt: 0 }
  }).populate('product');
};

// Static: Get Out of Stock Items
realtimeInventorySyncSchema.statics.getOutOfStockItems = function () {
  return this.find({
    'globalStock.totalAvailable': 0
  }).populate('product');
};

// Static: Get Pending Reorders
realtimeInventorySyncSchema.statics.getPendingReorders = function () {
  return this.find({
    'autoReorderHistory.status': 'pending'
  }).populate('product');
};

const RealtimeInventorySync = mongoose.model('RealtimeInventorySync', realtimeInventorySyncSchema);
export default RealtimeInventorySync;
export { RealtimeInventorySync };
