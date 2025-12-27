import mongoose from 'mongoose';

const lifeStagetargetingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lifeStage: {
    type: String,
    enum: [
      'student', 'young_professional', 'newly_married', 'expecting_parent',
      'new_parent', 'parent_toddler', 'parent_school_age', 'parent_teenager',
      'empty_nester', 'retiree', 'senior', 'single', 'couple_no_kids'
    ],
    required: true
  },
  demographics: {
    ageRange: {
      type: String,
      enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    },
    familySize: Number,
    hasChildren: Boolean,
    childrenAges: [Number],
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    employmentStatus: {
      type: String,
      enum: ['student', 'employed', 'self_employed', 'unemployed', 'retired']
    },
    income: {
      type: String,
      enum: ['<20k', '20k-40k', '40k-60k', '60k-100k', '100k+']
    }
  },
  lifestyleIndicators: {
    homeOwnership: Boolean,
    hasPets: Boolean,
    petTypes: [String],
    fitnessLevel: String,
    dietaryPreferences: [String],
    hobbies: [String],
    travelFrequency: String
  },
  shoppingBehavior: {
    averageOrderValue: Number,
    purchaseFrequency: String,
    preferredCategories: [String],
    pricesensitivity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    brandLoyalty: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  recommendations: [{
    category: String,
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    reason: String,
    priority: Number
  }],
  campaigns: [{
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    sentAt: Date,
    opened: Boolean,
    clicked: Boolean,
    converted: Boolean
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updateSource: {
    type: String,
    enum: ['user_input', 'behavior_analysis', 'survey', 'inference'],
    default: 'inference'
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

lifeStagetargetingSchema.index({ user: 1 });
lifeStagetargetingSchema.index({ lifeStage: 1 });
lifeStagetargetingSchema.index({ 'demographics.ageRange': 1 });

export default mongoose.model('LifeStageTargeting', lifeStagetargetingSchema);
