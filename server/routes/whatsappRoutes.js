import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  WhatsappConfig,
  WhatsappConversation,
  WhatsappMessage,
  WhatsappTemplate,
  WhatsappBroadcast
} from '../models/Whatsapp.js';

const router = express.Router();

/**
 * Webhook for WhatsApp Cloud API
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post('/webhook', async (req, res) => {
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
            await handleIncomingMessage(message, value.contacts[0]);
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
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(200);
  }
});

// Handle incoming message
async function handleIncomingMessage(message, contact) {
  const customerPhone = message.from;

  // Find or create conversation
  let conversation = await WhatsappConversation.findOne({ customerPhone });

  if (!conversation) {
    conversation = await WhatsappConversation.create({
      customerPhone,
      customerName: contact.profile?.name,
      customerWhatsappId: contact.wa_id,
      status: 'active'
    });
  }

  // Save message
  const savedMessage = await WhatsappMessage.create({
    conversation: conversation._id,
    messageId: message.id,
    direction: 'inbound',
    type: message.type,
    text: message.text?.body,
    media: message.image || message.video || message.audio || message.document,
    location: message.location,
    createdAt: new Date(parseInt(message.timestamp) * 1000)
  });

  // Update conversation
  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = message.text?.body?.substring(0, 100) || `[${message.type}]`;
  conversation.unreadCount += 1;
  conversation.lastCustomerMessageAt = new Date();
  conversation.canSendTemplateOnly = false;
  await conversation.save();

  // Check for auto-reply
  const config = await WhatsappConfig.findOne({ isActive: true });
  if (config?.autoReply) {
    await sendAutoReply(conversation, config);
  }
}

// Handle message status updates
async function handleMessageStatus(status) {
  const message = await WhatsappMessage.findOne({ messageId: status.id });

  if (message) {
    message.status = status.status;

    switch (status.status) {
      case 'sent':
        message.sentAt = new Date();
        break;
      case 'delivered':
        message.deliveredAt = new Date();
        break;
      case 'read':
        message.readAt = new Date();
        break;
      case 'failed':
        message.failedReason = status.errors?.[0]?.message;
        break;
    }

    await message.save();
  }
}

// Send auto-reply
async function sendAutoReply(conversation, config) {
  // Check if within business hours
  if (config.businessHours?.enabled) {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = config.businessHours.schedule.find(s => s.day === day);

    if (daySchedule) {
      const currentTime = now.toTimeString().slice(0, 5);
      if (currentTime < daySchedule.openTime || currentTime > daySchedule.closeTime) {
        // Outside business hours
        if (config.businessHours.outsideHoursMessage) {
          await sendMessage(conversation, config.businessHours.outsideHoursMessage);
        }
        return;
      }
    }
  }

  if (config.autoReplyMessage) {
    await sendMessage(conversation, config.autoReplyMessage);
  }
}

// Send message helper
async function sendMessage(conversation, text) {
  // In production, call WhatsApp Cloud API
  const message = await WhatsappMessage.create({
    conversation: conversation._id,
    direction: 'outbound',
    type: 'text',
    text,
    status: 'pending',
    isAutomated: true
  });

  return message;
}

/**
 * User/Seller Routes
 */

// Get conversations
router.get('/conversations', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const conversations = await WhatsappConversation.find(query)
      .populate('assignedTo', 'name')
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const messages = await WhatsappMessage.find({ conversation: req.params.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark as read
    await WhatsappConversation.findByIdAndUpdate(req.params.id, { unreadCount: 0 });

    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

// Send message
router.post('/conversations/:id/send', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { type, text, media, template, interactive, products } = req.body;

    const conversation = await WhatsappConversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check 24-hour window
    const hoursSinceLastCustomerMessage =
      (Date.now() - conversation.lastCustomerMessageAt) / (1000 * 60 * 60);

    if (hoursSinceLastCustomerMessage > 24 && type !== 'template') {
      return res.status(400).json({
        success: false,
        message: 'Outside 24-hour window. Only template messages allowed.'
      });
    }

    const message = await WhatsappMessage.create({
      conversation: req.params.id,
      direction: 'outbound',
      type,
      text,
      media,
      template,
      interactive,
      products,
      status: 'pending'
    });

    // Update conversation
    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = text?.substring(0, 100) || `[${type}]`;
    await conversation.save();

    // TODO: Call WhatsApp Cloud API to send message

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
});

// Assign conversation
router.put('/conversations/:id/assign', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { assigneeId } = req.body;

    const conversation = await WhatsappConversation.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: assigneeId,
        assignedAt: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'name');

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
});

// Update conversation status
router.put('/conversations/:id/status', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { status, labels } = req.body;

    const conversation = await WhatsappConversation.findByIdAndUpdate(
      req.params.id,
      { status, labels },
      { new: true }
    );

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
});

/**
 * Template Routes
 */

// Get templates
router.get('/templates', isAuthenticatedUser, async (req, res, next) => {
  try {
    const templates = await WhatsappTemplate.find()
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, templates });
  } catch (error) {
    next(error);
  }
});

// Create template
router.post('/templates', isAuthenticatedUser, async (req, res, next) => {
  try {
    const template = await WhatsappTemplate.create(req.body);

    // TODO: Submit to WhatsApp for approval

    res.status(201).json({ success: true, template });
  } catch (error) {
    next(error);
  }
});

/**
 * Broadcast Routes
 */

// Get broadcasts
router.get('/broadcasts', isAuthenticatedUser, async (req, res, next) => {
  try {
    const broadcasts = await WhatsappBroadcast.find()
      .populate('template', 'name status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, broadcasts });
  } catch (error) {
    next(error);
  }
});

// Create broadcast
router.post('/broadcasts', isAuthenticatedUser, async (req, res, next) => {
  try {
    const { name, templateId, recipientType, segment, recipients, scheduledAt } = req.body;

    const template = await WhatsappTemplate.findById(templateId);

    if (!template || template.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Template must be approved to use in broadcast'
      });
    }

    const broadcast = await WhatsappBroadcast.create({
      name,
      template: templateId,
      recipientType,
      segment,
      recipients: recipients.map(r => ({ phone: r.phone, name: r.name, variables: r.variables })),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      totalRecipients: recipients.length,
      status: scheduledAt ? 'scheduled' : 'draft'
    });

    res.status(201).json({ success: true, broadcast });
  } catch (error) {
    next(error);
  }
});

// Send broadcast
router.post('/broadcasts/:id/send', isAuthenticatedUser, async (req, res, next) => {
  try {
    const broadcast = await WhatsappBroadcast.findById(req.params.id)
      .populate('template');

    if (!broadcast) {
      return res.status(404).json({ success: false, message: 'Broadcast not found' });
    }

    if (broadcast.status !== 'draft' && broadcast.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Broadcast already sent' });
    }

    broadcast.status = 'sending';
    broadcast.startedAt = new Date();
    await broadcast.save();

    // TODO: Process broadcast in background job

    res.status(200).json({ success: true, message: 'Broadcast started' });
  } catch (error) {
    next(error);
  }
});

/**
 * Admin Routes
 */

// Get/Update WhatsApp config
router.get('/config', isAuthenticatedUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const config = await WhatsappConfig.findOne();
    res.status(200).json({ success: true, config });
  } catch (error) {
    next(error);
  }
});

router.put('/config', isAuthenticatedUser, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const config = await WhatsappConfig.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, config });
  } catch (error) {
    next(error);
  }
});

export default router;
