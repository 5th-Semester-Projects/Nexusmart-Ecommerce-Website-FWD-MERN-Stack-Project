const mongoose = require('mongoose');

const styleProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fashionStyle: {
    primary: {
      type: String,
      enum: ['casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'vintage', 'streetwear', 'preppy', 'edgy', 'classic']
    },
    secondary: [String]
  },
  bodyMeasurements: {
    height: Number, // cm
    weight: Number, // kg
    chest: Number,
    waist: Number,
    hips: Number,
    inseam: Number,
    shoeSize: Number,
    preferredFit: {
      type: String,
      enum: ['slim', 'regular', 'relaxed', 'oversized']
    }
  },
  colorPreferences: {
    favorites: [String],
    avoid: [String],
    seasonalPalette: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter']
    }
  },
  brandPreferences: {
    favorites: [String],
    priceRange: {
      min: Number,
      max: Number
    }
  },
  occasions: [{
    type: {
      type: String,
      enum: ['work', 'casual', 'party', 'formal', 'sports', 'vacation', 'wedding']
    },
    frequency: String
  }],
  stylePersonality: {
    adventurous: { type: Number, min: 0, max: 100 },
    classic: { type: Number, min: 0, max: 100 },
    trendy: { type: Number, min: 0, max: 100 },
    comfortable: { type: Number, min: 0, max: 100 },
    luxurious: { type: Number, min: 0, max: 100 }
  },
  purchaseHistory: {
    mostBoughtCategory: String,
    averagePrice: Number,
    preferredBrands: [String],
    seasonalBuying: mongoose.Schema.Types.Mixed
  },
  aiRecommendations: [{
    date: Date,
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    reason: String,
    clicked: Boolean,
    purchased: Boolean
  }],
  quizResults: {
    completedAt: Date,
    score: mongoose.Schema.Types.Mixed
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

styleProfileSchema.index({ user: 1 });

const StyleProfile = mongoose.model('StyleProfile', styleProfileSchema);
export default StyleProfile;
export { StyleProfile };
