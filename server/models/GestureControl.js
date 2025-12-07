import mongoose from 'mongoose';

const gestureControlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  gestures: [{
    name: String,
    action: {
      type: String,
      enum: ['scroll', 'swipe_left', 'swipe_right', 'zoom_in', 'zoom_out', 'add_to_cart', 'like', 'share']
    },
    customized: Boolean,
    timestamp: Date
  }],
  calibration: {
    sensitivity: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    handedness: {
      type: String,
      enum: ['left', 'right', 'both'],
      default: 'right'
    },
    distance: {
      type: String,
      enum: ['close', 'medium', 'far'],
      default: 'medium'
    }
  },
  sessions: [{
    startedAt: Date,
    endedAt: Date,
    gesturesUsed: Number,
    accuracy: Number
  }],
  analytics: {
    totalGestures: Number,
    favoriteGestures: [String],
    averageAccuracy: Number,
    timeSaved: Number
  }
}, {
  timestamps: true
});

gestureControlSchema.index({ user: 1 });

export default mongoose.model('GestureControl', gestureControlSchema);
