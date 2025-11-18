import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },

    // Rating & Review
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxLength: [200, 'Review title cannot exceed 200 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      maxLength: [1000, 'Review comment cannot exceed 1000 characters'],
    },

    // Media
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    videos: [
      {
        public_id: String,
        url: String,
      },
    ],

    // Verification
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    // Ratings Breakdown
    ratingBreakdown: {
      quality: {
        type: Number,
        min: 1,
        max: 5,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
      shipping: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    // Helpfulness
    helpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Seller Response
    sellerResponse: {
      comment: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    // Status & Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved',
    },
    moderationNote: String,

    // Flags
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: String,
    flaggedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ createdAt: -1 });

// Update product ratings when review is saved
reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const stats = await this.constructor.aggregate([
    { $match: { product: this.product, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      numOfReviews: stats[0].numReviews,
    });
  }
});

// Update product ratings when review is deleted
reviewSchema.post('remove', async function () {
  const Product = mongoose.model('Product');
  const stats = await this.constructor.aggregate([
    { $match: { product: this.product, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      numOfReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(this.product, {
      ratings: 0,
      numOfReviews: 0,
    });
  }
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function (userId) {
  if (!this.helpfulVotes.includes(userId)) {
    this.helpfulVotes.push(userId);
    this.helpfulCount += 1;
    await this.save();
  }
};

// Method to mark review as not helpful
reviewSchema.methods.markNotHelpful = async function () {
  this.notHelpfulCount += 1;
  await this.save();
};

export default mongoose.model('Review', reviewSchema);
