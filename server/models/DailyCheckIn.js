const mongoose = require('mongoose');

const dailyCheckInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCheckIns: {
    type: Number,
    default: 0
  },
  checkIns: [{
    date: Date,
    reward: {
      type: String,
      points: Number,
      bonus: String
    },
    streakDay: Number
  }],
  rewards: {
    day1: { points: { type: Number, default: 10 } },
    day2: { points: { type: Number, default: 15 } },
    day3: { points: { type: Number, default: 20 } },
    day4: { points: { type: Number, default: 25 } },
    day5: { points: { type: Number, default: 30 } },
    day6: { points: { type: Number, default: 40 } },
    day7: { points: { type: Number, default: 100 }, bonus: String },
    day30: { points: { type: Number, default: 500 }, bonus: String }
  },
  lastCheckIn: Date,
  nextCheckIn: Date,
  milestones: [{
    days: Number,
    achieved: Boolean,
    achievedAt: Date,
    reward: String
  }],
  statistics: {
    totalPointsEarned: { type: Number, default: 0 },
    averageStreakLength: Number,
    missedDays: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

dailyCheckInSchema.index({ user: 1 });

const DailyCheckIn = mongoose.model('DailyCheckIn', dailyCheckInSchema);`nexport default DailyCheckIn;`nexport { DailyCheckIn };
