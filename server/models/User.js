import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'Please enter your first name'],
      trim: true,
      maxLength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please enter your last name'],
      trim: true,
      maxLength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minLength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // If phone is provided, validate it (accepts 10-15 digits with optional + and spaces)
          if (!v || v === '') return true;
          return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(v);
        },
        message: 'Please enter a valid phone number',
      },
    },

    // Profile Information
    avatar: {
      public_id: String,
      url: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png',
      },
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },

    // Address Information
    addresses: [
      {
        type: {
          type: String,
          enum: ['home', 'office', 'other'],
          default: 'home',
        },
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
    ],

    // Authentication & Security
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,

    // Two-Factor Authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    twoFactorBackupCodes: [String],

    // OAuth Providers
    googleId: String,
    facebookId: String,
    githubId: String,
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'github'],
      default: 'local',
    },

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Refresh Token
    refreshToken: String,
    refreshTokenExpire: Date,

    // User Preferences
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      currency: {
        type: String,
        default: 'USD',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
    },

    // AI & Personalization
    styleProfile: {
      favoriteCategories: [String],
      favoriteColors: [String],
      sizes: {
        clothing: String,
        shoes: String,
      },
      bodyMeasurements: {
        height: Number,
        weight: Number,
        chest: Number,
        waist: Number,
        hips: Number,
      },
      styleQuizCompleted: {
        type: Boolean,
        default: false,
      },
      styleQuizResults: mongoose.Schema.Types.Mixed,
    },

    // Shopping Behavior
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    browsingHistory: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    searchHistory: [
      {
        query: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Loyalty & Rewards
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    membershipTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: String,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// Note: email and referralCode already have unique: true which creates indexes automatically
userSchema.index({ phone: 1 });
userSchema.index({ 'addresses.zipCode': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Generate referral code before saving
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(8).toString('hex').toUpperCase();
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// Generate JWT refresh token
userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE,
    }
  );

  this.refreshToken = refreshToken;
  this.refreshTokenExpire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return refreshToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

const User = mongoose.model('User', userSchema);
export default User;
export { User };
