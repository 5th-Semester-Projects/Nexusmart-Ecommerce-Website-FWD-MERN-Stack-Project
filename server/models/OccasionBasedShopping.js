import mongoose from 'mongoose';

const occasionBasedShoppingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  occasion: {
    type: String,
    enum: [
      'wedding', 'birthday', 'anniversary', 'graduation', 'baby_shower',
      'housewarming', 'christmas', 'diwali', 'eid', 'holi', 'valentine',
      'mothers_day', 'fathers_day', 'back_to_school', 'summer_vacation',
      'office_party', 'date_night', 'gym', 'travel', 'festival', 'other'
    ],
    required: true
  },
  occasionDate: Date,
  budget: {
    min: Number,
    max: Number
  },
  recipients: [{
    relation: String,
    ageGroup: String,
    gender: String,
    interests: [String]
  }],
  recommendedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    relevanceScore: Number,
    reason: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  purchasedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    purchasedAt: Date
  }],
  preferences: {
    style: [String],
    colors: [String],
    brands: [String],
    categories: [String]
  },
  status: {
    type: String,
    enum: ['planning', 'shopping', 'completed', 'archived'],
    default: 'planning'
  },
  reminders: [{
    date: Date,
    message: String,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }]
}, {
  timestamps: true, suppressReservedKeysWarning: true });

occasionBasedShoppingSchema.index({ user: 1, occasion: 1 });
occasionBasedShoppingSchema.index({ occasionDate: 1 });
occasionBasedShoppingSchema.index({ status: 1 });

export default mongoose.model('OccasionBasedShopping', occasionBasedShoppingSchema);
