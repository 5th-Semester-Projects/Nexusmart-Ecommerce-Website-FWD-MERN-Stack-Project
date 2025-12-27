import mongoose from 'mongoose';

const returnsAggregationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  returns: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    reason: String,
    requestedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'added_to_batch', 'collected', 'processed'],
      default: 'pending'
    }
  }],
  pickup: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    timeSlot: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    instructions: String,
    driverId: String,
    trackingNumber: String
  },
  consolidation: {
    batchId: String,
    numberOfItems: Number,
    totalWeight: Number,
    packageSize: String,
    qrCode: String,
    barcode: String
  },
  status: {
    type: String,
    enum: ['collecting', 'scheduled', 'picked_up', 'in_transit', 'received', 'processed'],
    default: 'collecting'
  },
  timeline: [{
    event: String,
    timestamp: Date,
    note: String
  }],
  refund: {
    total: Number,
    processed: Boolean,
    processedAt: Date,
    method: String,
    transactionId: String
  },
  cost: {
    shippingFee: Number,
    restockingFee: Number,
    total: Number,
    waived: Boolean
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

returnsAggregationSchema.index({ user: 1 });
returnsAggregationSchema.index({ status: 1 });
returnsAggregationSchema.index({ 'pickup.date': 1 });

export default mongoose.model('ReturnsAggregation', returnsAggregationSchema);
