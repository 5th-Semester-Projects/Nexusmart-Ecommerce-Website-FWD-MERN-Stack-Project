import mongoose from 'mongoose';

const accessibilityFeaturesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferences: {
    screenReader: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: String,
      verbosity: {
        type: String,
        enum: ['minimal', 'normal', 'detailed'],
        default: 'normal'
      }
    },
    voiceNavigation: {
      enabled: {
        type: Boolean,
        default: false
      },
      language: String,
      speed: Number,
      commands: [{
        trigger: String,
        action: String
      }]
    },
    visual: {
      fontSize: {
        type: Number,
        min: 12,
        max: 24,
        default: 16
      },
      contrast: {
        type: String,
        enum: ['normal', 'high', 'inverted'],
        default: 'normal'
      },
      colorBlindMode: {
        type: String,
        enum: ['none', 'protanopia', 'deuteranopia', 'tritanopia'],
        default: 'none'
      },
      reduceMotion: {
        type: Boolean,
        default: false
      },
      removeAnimations: {
        type: Boolean,
        default: false
      }
    },
    keyboard: {
      navigation: {
        type: Boolean,
        default: false
      },
      shortcuts: [{
        key: String,
        action: String
      }],
      tabOrder: String
    },
    captions: {
      enabled: {
        type: Boolean,
        default: false
      },
      language: String,
      size: Number
    }
  },
  assistiveTech: {
    deviceType: String,
    deviceName: String,
    compatibility: [{
      feature: String,
      supported: Boolean
    }]
  },
  usage: {
    voiceCommands: Number,
    keyboardNavigation: Number,
    helpRequested: Number,
    issuesReported: [{
      issue: String,
      reportedAt: Date,
      resolved: Boolean
    }]
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

accessibilityFeaturesSchema.index({ user: 1 });

export default mongoose.model('AccessibilityFeatures', accessibilityFeaturesSchema);
