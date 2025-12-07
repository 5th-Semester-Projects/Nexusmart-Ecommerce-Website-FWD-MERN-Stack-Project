import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import crypto from 'crypto';

/**
 * GDPR Compliance Service
 * Handles data export, deletion, consent management, and privacy tools
 */
class GDPRService {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    this.algorithm = 'aes-256-gcm';
  }

  /**
   * Export all user data (GDPR Right to Data Portability)
   */
  async exportUserData(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');

    // Collect all user data
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price')
      .lean();

    const reviews = await Review.find({ user: userId })
      .populate('product', 'name')
      .lean();

    const notifications = await Notification.find({ user: userId }).lean();

    const exportData = {
      exportDate: new Date().toISOString(),
      dataController: 'NexusMart',
      dataSubject: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      personalData: {
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        addresses: user.addresses || [],
        preferences: user.preferences || {},
        walletAddress: user.walletAddress,
        socialProfiles: user.socialProfiles || {}
      },
      transactionalData: {
        orders: orders.map(order => ({
          orderId: order._id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          status: order.status,
          totalAmount: order.totalAmount,
          items: order.items.map(item => ({
            product: item.product?.name || 'Unknown',
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod
        }))
      },
      userGeneratedContent: {
        reviews: reviews.map(review => ({
          product: review.product?.name || 'Unknown',
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt
        }))
      },
      communicationData: {
        notifications: notifications.map(n => ({
          type: n.type,
          title: n.title,
          message: n.message,
          date: n.createdAt
        })),
        emailPreferences: user.emailPreferences || {}
      },
      consentRecords: user.consents || [],
      securityData: {
        twoFactorEnabled: user.twoFactorEnabled,
        loginHistory: user.loginHistory?.slice(-10) || []
      }
    };

    return exportData;
  }

  /**
   * Delete all user data (GDPR Right to Erasure)
   */
  async deleteUserData(userId, options = {}) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const deletionLog = {
      userId,
      requestedAt: new Date(),
      deletedData: [],
      anonymizedData: [],
      retainedData: []
    };

    // Anonymize orders (keep for accounting but remove PII)
    if (options.anonymizeOrders !== false) {
      await Order.updateMany(
        { user: userId },
        {
          $set: {
            'shippingAddress.name': '[DELETED]',
            'shippingAddress.phone': '[DELETED]',
            'shippingAddress.address': '[DELETED]',
            'billingAddress': null,
            anonymizedAt: new Date()
          },
          $unset: { user: 1 }
        }
      );
      deletionLog.anonymizedData.push('orders');
    }

    // Delete reviews
    if (options.deleteReviews !== false) {
      await Review.deleteMany({ user: userId });
      deletionLog.deletedData.push('reviews');
    }

    // Delete notifications
    await Notification.deleteMany({ user: userId });
    deletionLog.deletedData.push('notifications');

    // Delete user account
    await User.findByIdAndDelete(userId);
    deletionLog.deletedData.push('user_account');

    deletionLog.completedAt = new Date();

    return deletionLog;
  }

  /**
   * Record user consent
   */
  async recordConsent(userId, consentType, granted) {
    const consentRecord = {
      type: consentType,
      granted,
      timestamp: new Date(),
      ipAddress: null, // Set by controller
      userAgent: null
    };

    await User.findByIdAndUpdate(userId, {
      $push: { consents: consentRecord }
    });

    return consentRecord;
  }

  /**
   * Get user consents
   */
  async getConsents(userId) {
    const user = await User.findById(userId).select('consents');
    if (!user) throw new Error('User not found');

    // Get latest consent for each type
    const consentTypes = ['marketing', 'analytics', 'personalization', 'third_party'];
    const currentConsents = {};

    for (const type of consentTypes) {
      const latestConsent = (user.consents || [])
        .filter(c => c.type === type)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      currentConsents[type] = latestConsent || { type, granted: false };
    }

    return currentConsents;
  }

  /**
   * Update consent preferences
   */
  async updateConsents(userId, consents, metadata = {}) {
    const records = [];

    for (const [type, granted] of Object.entries(consents)) {
      const record = {
        type,
        granted,
        timestamp: new Date(),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      };
      records.push(record);
    }

    await User.findByIdAndUpdate(userId, {
      $push: { consents: { $each: records } }
    });

    return records;
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(encryptedData.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Generate privacy report
   */
  async generatePrivacyReport(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const orderCount = await Order.countDocuments({ user: userId });
    const reviewCount = await Review.countDocuments({ user: userId });
    const notificationCount = await Notification.countDocuments({ user: userId });

    return {
      userId,
      generatedAt: new Date().toISOString(),
      dataCategories: [
        { category: 'Profile Data', hasData: true, fields: ['name', 'email', 'phone', 'avatar'] },
        { category: 'Address Data', hasData: (user.addresses?.length || 0) > 0, count: user.addresses?.length || 0 },
        { category: 'Order History', hasData: orderCount > 0, count: orderCount },
        { category: 'Reviews', hasData: reviewCount > 0, count: reviewCount },
        { category: 'Notifications', hasData: notificationCount > 0, count: notificationCount },
        { category: 'Consent Records', hasData: (user.consents?.length || 0) > 0, count: user.consents?.length || 0 }
      ],
      dataRetention: {
        profileData: 'Until account deletion',
        orderData: '7 years (legal requirement)',
        reviewData: 'Until account deletion or review removal',
        notificationData: '90 days'
      },
      dataProcessors: [
        { name: 'MongoDB Atlas', purpose: 'Data storage', location: 'AWS US regions' },
        { name: 'Cloudinary', purpose: 'Image storage', location: 'Global CDN' },
        { name: 'Stripe', purpose: 'Payment processing', location: 'US' }
      ],
      yourRights: [
        'Right to access your data',
        'Right to rectification',
        'Right to erasure (right to be forgotten)',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object',
        'Rights related to automated decision-making'
      ]
    };
  }

  /**
   * Data breach notification
   */
  async notifyDataBreach(affectedUserIds, breachDetails) {
    const notifications = [];

    for (const userId of affectedUserIds) {
      const notification = {
        user: userId,
        type: 'security_breach',
        title: 'Important Security Notice',
        message: `We detected a potential security incident affecting your account. ${breachDetails.description}`,
        priority: 'critical',
        data: {
          breachDate: breachDetails.date,
          affectedData: breachDetails.affectedData,
          actionsTaken: breachDetails.actionsTaken,
          recommendedActions: breachDetails.recommendedActions
        }
      };

      notifications.push(notification);
    }

    await Notification.insertMany(notifications);

    return {
      notified: affectedUserIds.length,
      timestamp: new Date()
    };
  }
}

export default new GDPRService();
