import mongoose from 'mongoose';

const stockAlertSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  notifyVia: [{
    type: String,
    enum: ['email', 'sms', 'push'],
    default: ['email'],
  }],
  isNotified: {
    type: Boolean,
    default: false,
  },
  notifiedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for unique alerts per product per email
stockAlertSchema.index({ product: 1, email: 1 }, { unique: true });

// Static method to create or update alert
stockAlertSchema.statics.createAlert = async function (productId, alertData) {
  const existing = await this.findOne({
    product: productId,
    email: alertData.email.toLowerCase(),
  });

  if (existing) {
    // Update existing alert
    existing.phone = alertData.phone || existing.phone;
    existing.notifyVia = alertData.notifyVia || existing.notifyVia;
    existing.user = alertData.user || existing.user;
    existing.isNotified = false; // Reset notification status
    await existing.save();
    return existing;
  }

  // Create new alert
  return this.create({
    product: productId,
    ...alertData,
  });
};

// Static method to get alerts for a product
stockAlertSchema.statics.getAlertsForProduct = function (productId) {
  return this.find({
    product: productId,
    isNotified: false,
  }).populate('user', 'name email');
};

// Static method to mark alerts as notified
stockAlertSchema.statics.markNotified = async function (productId) {
  return this.updateMany(
    { product: productId, isNotified: false },
    { isNotified: true, notifiedAt: new Date() }
  );
};

export default mongoose.model('StockAlert', stockAlertSchema);
