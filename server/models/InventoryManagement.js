const mongoose = require('mongoose');

const inventoryManagementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // Variant details (if applicable)
  variant: {
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    barcode: String,
    upc: String,
    color: String,
    size: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String
    }
  },

  // Stock levels
  stock: {
    available: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    damaged: {
      type: Number,
      default: 0,
      min: 0
    },
    inTransit: {
      type: Number,
      default: 0,
      min: 0
    },
    onOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },

  // Stock status
  stockStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued', 'coming_soon'],
    default: 'in_stock'
  },

  // Reorder settings
  reorder: {
    reorderPoint: {
      type: Number,
      default: 10
    },
    reorderQuantity: {
      type: Number,
      default: 50
    },
    autoReorder: {
      type: Boolean,
      default: false
    },
    lastReordered: Date,
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    leadTime: Number // days
  },

  // Warehouse locations
  locations: [{
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    zone: String,
    aisle: String,
    shelf: String,
    bin: String,
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Cost tracking
  costing: {
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    avgCost: Number,
    lastCost: Number,
    totalValue: Number, // available * unitCost
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Movement history
  movements: [{
    type: {
      type: String,
      enum: ['purchase', 'sale', 'return', 'transfer', 'adjustment', 'damaged', 'lost', 'found', 'write_off'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    fromLocation: {
      warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse'
      },
      zone: String
    },
    toLocation: {
      warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse'
      },
      zone: String
    },
    reason: String,
    reference: String, // order ID, PO number, etc.
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    cost: Number,
    notes: String
  }],

  // Stock adjustments
  adjustments: [{
    type: {
      type: String,
      enum: ['increase', 'decrease', 'correction'],
      required: true
    },
    quantity: Number,
    reason: {
      type: String,
      enum: ['count_correction', 'damaged', 'expired', 'theft', 'found', 'quality_issue', 'other']
    },
    description: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Stock alerts
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'overstock', 'expiring', 'damaged', 'theft_suspected'],
      required: true
    },
    message: String,
    triggered: {
      type: Boolean,
      default: false
    },
    triggeredAt: Date,
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date,
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date
  }],

  // Batch/Lot tracking
  batches: [{
    batchNumber: {
      type: String,
      required: true
    },
    quantity: Number,
    manufactureDate: Date,
    expiryDate: Date,
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    costPerUnit: Number,
    location: {
      warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse'
      },
      zone: String
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'recalled', 'sold_out'],
      default: 'active'
    }
  }],

  // Serial numbers (for serialized inventory)
  serialNumbers: [{
    serialNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'damaged', 'returned'],
      default: 'available'
    },
    location: {
      warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse'
      },
      zone: String
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    soldDate: Date,
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],

  // Stock count/audit
  stockCounts: [{
    countDate: {
      type: Date,
      required: true
    },
    countedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expectedQuantity: Number,
    actualQuantity: Number,
    variance: Number,
    variancePercent: Number,
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'verified'],
      default: 'scheduled'
    },
    notes: String,
    location: {
      warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse'
      },
      zone: String
    }
  }],

  // Sales velocity
  salesMetrics: {
    dailyAvg: {
      type: Number,
      default: 0
    },
    weeklyAvg: {
      type: Number,
      default: 0
    },
    monthlyAvg: {
      type: Number,
      default: 0
    },
    totalSold: {
      type: Number,
      default: 0
    },
    lastSaleDate: Date,
    daysToStockOut: Number, // estimated
    turnoverRate: Number // times per year
  },

  // Forecasting
  forecast: {
    nextMonthDemand: Number,
    nextQuarterDemand: Number,
    seasonalityFactor: Number,
    trendFactor: Number,
    lastUpdated: Date,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Backorder management
  backorders: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    quantity: Number,
    requestedDate: Date,
    expectedFulfillmentDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'fulfilled', 'cancelled'],
      default: 'pending'
    },
    fulfilledQuantity: {
      type: Number,
      default: 0
    }
  }],

  // Supplier information
  supplier: {
    primary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    alternate: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    }],
    lastOrderDate: Date,
    lastDeliveryDate: Date,
    leadTime: Number,
    minOrderQuantity: Number,
    orderMultiple: Number
  },

  // Configuration
  settings: {
    trackSerialNumbers: {
      type: Boolean,
      default: false
    },
    trackBatches: {
      type: Boolean,
      default: false
    },
    allowBackorders: {
      type: Boolean,
      default: true
    },
    allowNegativeStock: {
      type: Boolean,
      default: false
    },
    autoPublishWhenInStock: {
      type: Boolean,
      default: true
    },
    hideWhenOutOfStock: {
      type: Boolean,
      default: false
    }
  },

  // Last stock update
  lastStockUpdate: {
    type: Date,
    default: Date.now
  },

  // Sync with external systems
  externalSync: {
    lastSynced: Date,
    syncStatus: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending'
    },
    externalSystemId: String,
    syncErrors: [String]
  }
}, {
  timestamps: true
});

// Indexes
inventoryManagementSchema.index({ 'variant.sku': 1 });
inventoryManagementSchema.index({ product: 1 });
inventoryManagementSchema.index({ stockStatus: 1 });
inventoryManagementSchema.index({ 'stock.available': 1 });
inventoryManagementSchema.index({ 'locations.warehouse': 1 });
inventoryManagementSchema.index({ 'batches.expiryDate': 1 });

// Virtual for available to sell
inventoryManagementSchema.virtual('availableToSell').get(function () {
  return this.stock.available - this.stock.reserved;
});

// Pre-save middleware to calculate totals
inventoryManagementSchema.pre('save', function (next) {
  // Calculate total stock
  this.stock.total = this.stock.available + this.stock.reserved + this.stock.damaged + this.stock.inTransit;

  // Calculate total value
  this.costing.totalValue = this.stock.available * this.costing.unitCost;

  // Update stock status
  if (this.stock.available === 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.stock.available <= this.reorder.reorderPoint) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }

  // Calculate days to stock out
  if (this.salesMetrics.dailyAvg > 0) {
    this.salesMetrics.daysToStockOut = Math.floor(this.stock.available / this.salesMetrics.dailyAvg);
  }

  this.lastStockUpdate = Date.now();

  next();
});

// Method to adjust stock
inventoryManagementSchema.methods.adjustStock = function (quantity, type, reason, performedBy) {
  this.stock.available += quantity;

  this.movements.push({
    type: type || 'adjustment',
    quantity,
    reason,
    performedBy,
    timestamp: Date.now()
  });

  this.adjustments.push({
    type: quantity > 0 ? 'increase' : 'decrease',
    quantity: Math.abs(quantity),
    reason,
    timestamp: Date.now()
  });
};

// Method to reserve stock
inventoryManagementSchema.methods.reserveStock = function (quantity) {
  if (this.stock.available < quantity) {
    throw new Error('Insufficient stock available');
  }

  this.stock.available -= quantity;
  this.stock.reserved += quantity;
};

// Method to release reserved stock
inventoryManagementSchema.methods.releaseReservedStock = function (quantity) {
  if (this.stock.reserved < quantity) {
    throw new Error('Insufficient reserved stock');
  }

  this.stock.reserved -= quantity;
  this.stock.available += quantity;
};

// Method to transfer stock between locations
inventoryManagementSchema.methods.transferStock = function (quantity, fromWarehouse, toWarehouse, performedBy) {
  const fromLocation = this.locations.find(l => l.warehouse.toString() === fromWarehouse.toString());

  if (!fromLocation || fromLocation.quantity < quantity) {
    throw new Error('Insufficient stock at source location');
  }

  fromLocation.quantity -= quantity;

  let toLocation = this.locations.find(l => l.warehouse.toString() === toWarehouse.toString());
  if (toLocation) {
    toLocation.quantity += quantity;
  } else {
    this.locations.push({
      warehouse: toWarehouse,
      quantity
    });
  }

  this.movements.push({
    type: 'transfer',
    quantity,
    fromLocation: { warehouse: fromWarehouse },
    toLocation: { warehouse: toWarehouse },
    performedBy,
    timestamp: Date.now()
  });
};

// Static method to get low stock items
inventoryManagementSchema.statics.getLowStockItems = function () {
  return this.find({
    stockStatus: 'low_stock',
    'stock.available': { $gt: 0 }
  })
    .populate('product', 'name images')
    .sort({ 'stock.available': 1 });
};

// Static method to get out of stock items
inventoryManagementSchema.statics.getOutOfStockItems = function () {
  return this.find({
    stockStatus: 'out_of_stock'
  })
    .populate('product', 'name images')
    .sort({ 'salesMetrics.dailyAvg': -1 });
};

const InventoryManagement = mongoose.model('InventoryManagement', inventoryManagementSchema);`nexport default InventoryManagement;`nexport { InventoryManagement };
