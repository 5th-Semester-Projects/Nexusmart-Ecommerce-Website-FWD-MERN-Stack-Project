import mongoose from 'mongoose';

const microMomentsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: String,
  context: {
    time: {
      hour: Number,
      dayOfWeek: String,
      isWeekend: Boolean,
      timeOfDay: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night']
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number], // [longitude, latitude]
      city: String,
      country: String,
      nearbyPlaces: [String]
    },
    weather: {
      condition: String,
      temperature: Number,
      humidity: Number,
      season: String
    },
    device: {
      type: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'smart_tv', 'watch']
      },
      os: String,
      browser: String
    },
    mood: {
      detected: {
        type: String,
        enum: ['happy', 'sad', 'excited', 'stressed', 'relaxed', 'neutral']
      },
      confidence: Number
    }
  },
  momentType: {
    type: String,
    enum: ['i_want_to_know', 'i_want_to_go', 'i_want_to_buy', 'i_want_to_do'],
    required: true
  },
  intent: {
    primary: String,
    secondary: [String],
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'immediate']
    }
  },
  recommendations: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    relevanceScore: Number,
    reasons: [String],
    contextFactors: [String],
    presented: Boolean,
    clicked: Boolean,
    purchased: Boolean
  }],
  behavior: {
    browsingSpeed: String,
    scrollDepth: Number,
    timeOnPage: Number,
    interactionLevel: String
  },
  outcome: {
    type: String,
    enum: ['purchase', 'saved', 'shared', 'abandoned', 'continued_browsing']
  },
  revenue: Number
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

microMomentsSchema.index({ user: 1, createdAt: -1 });
microMomentsSchema.index({ momentType: 1, createdAt: -1 });
microMomentsSchema.index({ 'context.location.coordinates': '2dsphere' });

const MicroMoments = mongoose.model('MicroMoments', microMomentsSchema);
export default MicroMoments;
export { MicroMoments };
