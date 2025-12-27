import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['spending', 'reviews', 'referrals', 'points', 'streak', 'engagement', 'social_shares'],
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time'],
    required: true
  },
  startDate: Date,
  endDate: Date,
  rankings: [{
    rank: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: Number,
    change: Number, // position change from previous period
    badge: String,
    avatar: String,
    displayName: String
  }],
  rewards: [{
    rankRange: {
      from: Number,
      to: Number
    },
    reward: {
      type: String,
      enum: ['points', 'coupon', 'badge', 'cash', 'product', 'upgrade'],
      value: mongoose.Schema.Types.Mixed
    }
  }],
  settings: {
    maxEntries: { type: Number, default: 100 },
    updateFrequency: String, // 'realtime', 'hourly', 'daily'
    isPublic: { type: Boolean, default: true },
    showRealNames: { type: Boolean, default: false }
  },
  analytics: {
    totalParticipants: { type: Number, default: 0 },
    averageScore: Number,
    topScore: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, suppressReservedKeysWarning: true });

leaderboardSchema.index({ type: 1, period: 1, isActive: 1 });
leaderboardSchema.index({ 'rankings.user': 1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;
export { Leaderboard };
