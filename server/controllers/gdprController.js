import gdprService from '../services/gdprService.js';
import User from '../models/User.js';
import crypto from 'crypto';

/**
 * GDPR & Privacy Controller
 * Handles data export, deletion, consent management
 */

// Export user data
export const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    const exportData = await gdprService.exportUserData(userId);

    // Generate download token
    const downloadToken = crypto.randomBytes(32).toString('hex');

    // Store token temporarily (in production, use Redis with TTL)
    // For now, include data directly

    res.status(200).json({
      success: true,
      message: 'Data export generated successfully',
      exportData,
      downloadToken,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

// Download exported data as file
export const downloadExportedData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { format = 'json' } = req.query;

    const exportData = await gdprService.exportUserData(userId);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="nexusmart-data-export-${Date.now()}.json"`);
      res.send(JSON.stringify(exportData, null, 2));
    } else {
      // CSV format
      const csv = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="nexusmart-data-export-${Date.now()}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download data',
      error: error.message
    });
  }
};

// Request account deletion
export const requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password, reason } = req.body;

    // Verify password
    const user = await User.findById(userId).select('+password');
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Create deletion request (with 30-day grace period)
    user.deletionRequested = {
      requestedAt: new Date(),
      reason,
      scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deletion scheduled',
      scheduledFor: user.deletionRequested.scheduledFor,
      cancellationDeadline: user.deletionRequested.scheduledFor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to request account deletion',
      error: error.message
    });
  }
};

// Cancel account deletion
export const cancelAccountDeletion = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user.deletionRequested) {
      return res.status(400).json({
        success: false,
        message: 'No deletion request found'
      });
    }

    user.deletionRequested = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deletion cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel account deletion',
      error: error.message
    });
  }
};

// Delete account immediately (with password confirmation)
export const deleteAccountNow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password, confirmPhrase } = req.body;

    if (confirmPhrase !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Please type "DELETE MY ACCOUNT" to confirm'
      });
    }

    // Verify password
    const user = await User.findById(userId).select('+password');
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Delete all user data
    const deletionLog = await gdprService.deleteUserData(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      deletionLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};

// Get consent preferences
export const getConsentPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const consents = await gdprService.getConsents(userId);

    res.status(200).json({
      success: true,
      consents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get consent preferences',
      error: error.message
    });
  }
};

// Update consent preferences
export const updateConsentPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { consents } = req.body;

    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const records = await gdprService.updateConsents(userId, consents, metadata);

    res.status(200).json({
      success: true,
      message: 'Consent preferences updated',
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update consent preferences',
      error: error.message
    });
  }
};

// Get privacy report
export const getPrivacyReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const report = await gdprService.generatePrivacyReport(userId);

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate privacy report',
      error: error.message
    });
  }
};

// Data rectification request
export const requestDataRectification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dataType, currentValue, correctedValue, reason } = req.body;

    // Create rectification request
    const request = {
      userId,
      dataType,
      currentValue,
      correctedValue,
      reason,
      status: 'pending',
      requestedAt: new Date()
    };

    // In production, store in database and notify admin
    // For now, return success

    res.status(200).json({
      success: true,
      message: 'Rectification request submitted',
      request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit rectification request',
      error: error.message
    });
  }
};

// Opt-out of processing
export const optOutProcessing = async (req, res) => {
  try {
    const userId = req.user._id;
    const { processingTypes } = req.body;

    const user = await User.findById(userId);

    user.processingOptOuts = user.processingOptOuts || [];
    for (const type of processingTypes) {
      if (!user.processingOptOuts.includes(type)) {
        user.processingOptOuts.push(type);
      }
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Opted out of specified processing',
      optOuts: user.processingOptOuts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to opt out',
      error: error.message
    });
  }
};

// Helper function to convert to CSV
function convertToCSV(data) {
  const rows = [];

  // Profile data
  rows.push('PROFILE DATA');
  rows.push('Field,Value');
  Object.entries(data.personalData.profile).forEach(([key, value]) => {
    rows.push(`${key},"${value || ''}"`);
  });

  rows.push('');
  rows.push('ORDERS');
  rows.push('Order ID,Date,Status,Total');
  data.transactionalData.orders.forEach(order => {
    rows.push(`${order.orderId},${order.date},${order.status},${order.totalAmount}`);
  });

  rows.push('');
  rows.push('REVIEWS');
  rows.push('Product,Rating,Comment,Date');
  data.userGeneratedContent.reviews.forEach(review => {
    rows.push(`"${review.product}",${review.rating},"${review.comment || ''}",${review.date}`);
  });

  return rows.join('\n');
}

export default {
  exportUserData,
  downloadExportedData,
  requestAccountDeletion,
  cancelAccountDeletion,
  deleteAccountNow,
  getConsentPreferences,
  updateConsentPreferences,
  getPrivacyReport,
  requestDataRectification,
  optOutProcessing
};
