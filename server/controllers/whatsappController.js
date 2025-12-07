import {
  WhatsappConfig,
  WhatsappConversation,
  WhatsappMessage,
  WhatsappTemplate,
  WhatsappBroadcast
} from '../models/Whatsapp.js';
import axios from 'axios';

/**
 * WhatsApp Integration Controller
 * Handles WhatsApp Business API integration for customer communication
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';

// Helper function to send WhatsApp message
const sendWhatsAppMessage = async (to, content, type = 'text') => {
  const config = await WhatsappConfig.findOne({ isActive: true });
  if (!config) throw new Error('WhatsApp not configured');

  const response = await axios.post(
    `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type,
      ...(type === 'text' ? { text: { body: content } } : content)
    },
    {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

// Handle incoming webhook from WhatsApp
export const handleWebhook = async (req, res, next) => {
  try {
    const { entry } = req.body;

    if (!entry || !entry[0]) {
      return res.sendStatus(200);
    }

    const changes = entry[0].changes;

    for (const change of changes) {
      if (change.field === 'messages') {
        const value = change.value;

        if (value.messages) {
          for (const message of value.messages) {
            await handleIncomingMessage(message, value.contacts?.[0]);
          }
        }

        if (value.statuses) {
          for (const status of value.statuses) {
            await handleMessageStatus(status);
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};

// Handle incoming message
const handleIncomingMessage = async (message, contact) => {
  try {
    // Find or create conversation
    let conversation = await WhatsappConversation.findOne({
      phoneNumber: message.from
    });

    if (!conversation) {
      conversation = await WhatsappConversation.create({
        phoneNumber: message.from,
        customerName: contact?.profile?.name || 'Unknown',
        status: 'active'
      });
    }

    // Create message record
    const newMessage = await WhatsappMessage.create({
      conversation: conversation._id,
      whatsappMessageId: message.id,
      from: message.from,
      type: message.type,
      content: extractMessageContent(message),
      direction: 'incoming',
      status: 'received'
    });

    // Update conversation
    conversation.lastMessage = newMessage._id;
    conversation.unreadCount += 1;
    await conversation.save();

    // Auto-reply based on keywords
    await processAutoReply(conversation, message);

  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
};

// Extract content from different message types
const extractMessageContent = (message) => {
  switch (message.type) {
    case 'text':
      return { text: message.text.body };
    case 'image':
      return {
        caption: message.image.caption,
        mediaId: message.image.id
      };
    case 'document':
      return {
        filename: message.document.filename,
        mediaId: message.document.id
      };
    case 'audio':
      return { mediaId: message.audio.id };
    case 'location':
      return {
        latitude: message.location.latitude,
        longitude: message.location.longitude,
        name: message.location.name
      };
    default:
      return { text: 'Unsupported message type' };
  }
};

// Process auto-reply based on keywords
const processAutoReply = async (conversation, message) => {
  if (message.type !== 'text') return;

  const text = message.text.body.toLowerCase();

  // Keyword-based auto-replies
  const keywords = {
    'order status': 'ORDER_STATUS',
    'track order': 'ORDER_STATUS',
    'help': 'HELP',
    'support': 'HELP',
    'product': 'PRODUCT_INQUIRY',
    'price': 'PRODUCT_INQUIRY',
    'return': 'RETURN_POLICY',
    'refund': 'RETURN_POLICY'
  };

  for (const [keyword, templateName] of Object.entries(keywords)) {
    if (text.includes(keyword)) {
      const template = await WhatsappTemplate.findOne({
        name: templateName,
        status: 'approved'
      });

      if (template) {
        await sendTemplateMessage(message.from, template);
        return;
      }
    }
  }

  // Default greeting response
  if (['hi', 'hello', 'hey'].some(g => text.includes(g))) {
    await sendWhatsAppMessage(
      message.from,
      `Hello! 👋 Welcome to our store. How can I help you today?\n\n` +
      `You can ask about:\n` +
      `📦 Order status\n` +
      `🛍️ Products\n` +
      `↩️ Returns & Refunds\n` +
      `❓ General help`
    );
  }
};

// Handle message status updates
const handleMessageStatus = async (status) => {
  try {
    await WhatsappMessage.findOneAndUpdate(
      { whatsappMessageId: status.id },
      { status: status.status, statusTimestamp: new Date() }
    );
  } catch (error) {
    console.error('Error updating message status:', error);
  }
};

// Send message to customer
export const sendMessage = async (req, res, next) => {
  try {
    const { phoneNumber, message, type = 'text' } = req.body;

    const result = await sendWhatsAppMessage(phoneNumber, message, type);

    // Find conversation
    let conversation = await WhatsappConversation.findOne({ phoneNumber });

    if (!conversation) {
      conversation = await WhatsappConversation.create({
        phoneNumber,
        status: 'active'
      });
    }

    // Create message record
    const newMessage = await WhatsappMessage.create({
      conversation: conversation._id,
      whatsappMessageId: result.messages[0].id,
      from: 'business',
      to: phoneNumber,
      type,
      content: { text: message },
      direction: 'outgoing',
      status: 'sent'
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.messages[0].id
    });
  } catch (error) {
    next(error);
  }
};

// Send template message
export const sendTemplateMessage = async (phoneNumber, template, variables = {}) => {
  const config = await WhatsappConfig.findOne({ isActive: true });
  if (!config) throw new Error('WhatsApp not configured');

  const components = [];

  if (template.headerVariables?.length) {
    components.push({
      type: 'header',
      parameters: template.headerVariables.map(v => ({
        type: 'text',
        text: variables[v] || ''
      }))
    });
  }

  if (template.bodyVariables?.length) {
    components.push({
      type: 'body',
      parameters: template.bodyVariables.map(v => ({
        type: 'text',
        text: variables[v] || ''
      }))
    });
  }

  const response = await axios.post(
    `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: template.name,
        language: { code: template.language || 'en' },
        components
      }
    },
    {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

// Get all conversations
export const getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const total = await WhatsappConversation.countDocuments(query);
    const conversations = await WhatsappConversation.find(query)
      .populate('lastMessage')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      conversations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get conversation messages
export const getConversationMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const conversation = await WhatsappConversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const total = await WhatsappMessage.countDocuments({
      conversation: req.params.id
    });

    const messages = await WhatsappMessage.find({
      conversation: req.params.id
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark as read
    conversation.unreadCount = 0;
    await conversation.save();

    res.status(200).json({
      success: true,
      conversation,
      messages: messages.reverse(),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create message template
export const createTemplate = async (req, res, next) => {
  try {
    const {
      name,
      category,
      language,
      header,
      body,
      footer,
      buttons
    } = req.body;

    const template = await WhatsappTemplate.create({
      name,
      category,
      language: language || 'en',
      header,
      body,
      footer,
      buttons,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Template created, pending approval',
      template
    });
  } catch (error) {
    next(error);
  }
};

// Get all templates
export const getTemplates = async (req, res, next) => {
  try {
    const templates = await WhatsappTemplate.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    next(error);
  }
};

// Create broadcast campaign
export const createBroadcast = async (req, res, next) => {
  try {
    const { name, template, recipients, scheduledAt, variables } = req.body;

    const templateDoc = await WhatsappTemplate.findById(template);
    if (!templateDoc || templateDoc.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Template not found or not approved'
      });
    }

    const broadcast = await WhatsappBroadcast.create({
      name,
      template,
      recipients,
      scheduledAt,
      variables,
      status: scheduledAt ? 'scheduled' : 'pending',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Broadcast campaign created',
      broadcast
    });
  } catch (error) {
    next(error);
  }
};

// Execute broadcast
export const executeBroadcast = async (req, res, next) => {
  try {
    const broadcast = await WhatsappBroadcast.findById(req.params.id)
      .populate('template');

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: 'Broadcast not found'
      });
    }

    broadcast.status = 'sending';
    await broadcast.save();

    let sent = 0, failed = 0;

    for (const recipient of broadcast.recipients) {
      try {
        await sendTemplateMessage(
          recipient.phoneNumber,
          broadcast.template,
          { ...broadcast.variables, ...recipient.variables }
        );
        sent++;
      } catch (error) {
        failed++;
        console.error(`Failed to send to ${recipient.phoneNumber}:`, error);
      }
    }

    broadcast.status = 'completed';
    broadcast.analytics.sent = sent;
    broadcast.analytics.failed = failed;
    broadcast.completedAt = new Date();
    await broadcast.save();

    res.status(200).json({
      success: true,
      message: 'Broadcast completed',
      analytics: { sent, failed }
    });
  } catch (error) {
    next(error);
  }
};

// Get WhatsApp config (admin)
export const getConfig = async (req, res, next) => {
  try {
    const config = await WhatsappConfig.findOne({ isActive: true })
      .select('-accessToken');

    res.status(200).json({
      success: true,
      config: config || { configured: false }
    });
  } catch (error) {
    next(error);
  }
};

// Update WhatsApp config (admin)
export const updateConfig = async (req, res, next) => {
  try {
    const { businessId, phoneNumberId, accessToken, webhookSecret } = req.body;

    const config = await WhatsappConfig.findOneAndUpdate(
      {},
      {
        businessId,
        phoneNumberId,
        accessToken,
        webhookSecret,
        isActive: true,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    ).select('-accessToken');

    res.status(200).json({
      success: true,
      message: 'WhatsApp configuration updated',
      config
    });
  } catch (error) {
    next(error);
  }
};

// Send order update via WhatsApp
export const sendOrderUpdate = async (req, res, next) => {
  try {
    const { orderId, status, phoneNumber } = req.body;

    const statusMessages = {
      confirmed: `✅ Your order #${orderId} has been confirmed! We're preparing it now.`,
      shipped: `📦 Great news! Your order #${orderId} has been shipped and is on its way.`,
      out_for_delivery: `🚚 Your order #${orderId} is out for delivery today!`,
      delivered: `🎉 Your order #${orderId} has been delivered. Enjoy!`
    };

    const message = statusMessages[status] ||
      `📋 Order #${orderId} status update: ${status}`;

    await sendWhatsAppMessage(phoneNumber, message);

    res.status(200).json({
      success: true,
      message: 'Order update sent via WhatsApp'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  handleWebhook,
  sendMessage,
  getConversations,
  getConversationMessages,
  createTemplate,
  getTemplates,
  createBroadcast,
  executeBroadcast,
  getConfig,
  updateConfig,
  sendOrderUpdate
};
