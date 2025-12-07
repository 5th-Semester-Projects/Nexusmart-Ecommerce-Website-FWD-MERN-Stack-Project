const mongoose = require('mongoose');

const photoContestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  theme: String,
  rules: [String],
  prizes: [{
    position: Number,
    description: String,
    value: Number,
    type: String // 'cash', 'voucher', 'product', 'points'
  }],
  schedule: {
    submissionStart: Date,
    submissionEnd: Date,
    votingStart: Date,
    votingEnd: Date,
    winnerAnnouncement: Date
  },
  entries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    photos: [{
      url: String,
      caption: String
    }],
    description: String,
    votes: { type: Number, default: 0 },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    likes: { type: Number, default: 0 },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: String,
      createdAt: Date
    }],
    submittedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'winner', 'runner_up'],
      default: 'pending'
    }
  }],
  winners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: Number,
    entry: mongoose.Schema.Types.ObjectId,
    prize: String,
    announcedAt: Date
  }],
  settings: {
    maxEntriesPerUser: { type: Number, default: 1 },
    maxPhotosPerEntry: { type: Number, default: 3 },
    requireApproval: { type: Boolean, default: true },
    allowVoting: { type: Boolean, default: true },
    votingMethod: {
      type: String,
      enum: ['public_vote', 'jury', 'hybrid'],
      default: 'public_vote'
    }
  },
  analytics: {
    totalEntries: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
    uniqueVoters: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

photoContestSchema.index({ isActive: 1 });
photoContestSchema.index({ 'entries.user': 1 });

module.exports = mongoose.model('PhotoContest', photoContestSchema);
