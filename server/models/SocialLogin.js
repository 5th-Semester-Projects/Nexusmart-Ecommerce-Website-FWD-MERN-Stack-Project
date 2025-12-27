import mongoose from 'mongoose';

const socialLoginSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['google', 'facebook', 'apple', 'twitter', 'linkedin', 'github'],
    required: true
  },
  providerId: {
    type: String,
    required: true
  },
  profile: {
    email: String,
    name: String,
    firstName: String,
    lastName: String,
    profilePicture: String,
    gender: String,
    locale: String,
    timezone: String
  },
  tokens: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    scope: [String]
  },
  permissions: [String],
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

socialLoginSchema.index({ user: 1, provider: 1 });
socialLoginSchema.index({ providerId: 1, provider: 1 }, { unique: true });

const SocialLogin = mongoose.model('SocialLogin', socialLoginSchema);
export default SocialLogin;
export { SocialLogin };
