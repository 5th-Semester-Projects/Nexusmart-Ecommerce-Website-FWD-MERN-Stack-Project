import AIChatTriaging from '../models/AIChatTriaging.js';
import SentimentAnalysis from '../models/SentimentAnalysis.js';
import VideoSupport from '../models/VideoSupport.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// AI Chat Triaging Controllers

export const createSupportTicket = catchAsyncErrors(async (req, res, next) => {
  const { subject, message, category } = req.body;

  // AI analysis of ticket
  const aiAnalysis = await analyzeTicketContent(message);

  const ticket = await AIChatTriaging.create({
    ticket: {
      ticketId: 'TKT-' + Date.now(),
      subject,
      category: category || aiAnalysis.suggestedCategory,
      status: 'open',
      createdAt: Date.now()
    },
    customer: req.user.id,
    aiAnalysis: {
      intent: aiAnalysis.intent,
      urgency: aiAnalysis.urgency,
      sentiment: aiAnalysis.sentiment,
      suggestedCategory: aiAnalysis.suggestedCategory,
      keywords: aiAnalysis.keywords,
      confidence: aiAnalysis.confidence
    },
    routing: {
      autoAssigned: true,
      assignedTo: aiAnalysis.suggestedAgent,
      assignedAt: Date.now(),
      queue: aiAnalysis.queue,
      priority: aiAnalysis.urgency
    }
  });

  res.status(201).json({
    success: true,
    data: ticket
  });
});

export const getTicketDetails = catchAsyncErrors(async (req, res, next) => {
  const { ticketId } = req.params;

  const ticket = await AIChatTriaging.findOne({ 'ticket.ticketId': ticketId })
    .populate('customer', 'name email')
    .populate('routing.assignedTo', 'name');

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  res.status(200).json({
    success: true,
    data: ticket
  });
});

export const reassignTicket = catchAsyncErrors(async (req, res, next) => {
  const { ticketId } = req.params;
  const { agentId, reason } = req.body;

  const ticket = await AIChatTriaging.findOne({ 'ticket.ticketId': ticketId });

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  ticket.routing.reassignments.push({
    from: ticket.routing.assignedTo,
    to: agentId,
    reason,
    timestamp: Date.now()
  });

  ticket.routing.assignedTo = agentId;
  await ticket.save();

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// Sentiment Analysis Controllers

export const analyzeSentiment = catchAsyncErrors(async (req, res, next) => {
  const { text, source, sourceId } = req.body;

  const sentimentResult = performSentimentAnalysis(text);

  const analysis = await SentimentAnalysis.create({
    source: {
      type: source,
      referenceId: sourceId
    },
    text,
    sentiment: sentimentResult.sentiment,
    emotions: sentimentResult.emotions,
    keywords: sentimentResult.keywords,
    language: 'en',
    confidence: sentimentResult.confidence
  });

  res.status(201).json({
    success: true,
    data: analysis
  });
});

export const getSentimentTrends = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, source } = req.query;

  const filter = {
    analyzedAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  if (source) {
    filter['source.type'] = source;
  }

  const analyses = await SentimentAnalysis.find(filter);

  const trends = {
    totalAnalyzed: analyses.length,
    averageSentiment: calculateAverageSentiment(analyses),
    distribution: {
      positive: analyses.filter(a => a.sentiment.overall === 'positive').length,
      neutral: analyses.filter(a => a.sentiment.overall === 'neutral').length,
      negative: analyses.filter(a => a.sentiment.overall === 'negative').length
    },
    topEmotions: getTopEmotions(analyses),
    commonKeywords: getCommonKeywords(analyses)
  };

  res.status(200).json({
    success: true,
    data: trends
  });
});

// Video Support Controllers

export const scheduleVideoCall = catchAsyncErrors(async (req, res, next) => {
  const { ticketId, scheduledTime, duration } = req.body;

  const videoSession = await VideoSupport.create({
    ticket: ticketId,
    customer: req.user.id,
    scheduling: {
      scheduledTime: new Date(scheduledTime),
      duration: duration || 30,
      timezone: 'UTC'
    },
    session: {
      platform: process.env.VIDEO_CALL_PLATFORM || 'zoom',
      roomUrl: `${process.env.VIDEO_CALL_SERVICE_URL || 'https://meet.jit.si'}/nexusmart-${Math.random().toString().slice(2, 12)}`,
      status: 'scheduled'
    }
  });

  res.status(201).json({
    success: true,
    data: videoSession
  });
});

export const startVideoSession = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await VideoSupport.findById(sessionId);

  if (!session) {
    return next(new ErrorHandler('Video session not found', 404));
  }

  session.session.status = 'active';
  session.session.startedAt = Date.now();

  await session.save();

  res.status(200).json({
    success: true,
    data: session
  });
});

export const endVideoSession = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;
  const { resolution, notes } = req.body;

  const session = await VideoSupport.findById(sessionId);

  if (!session) {
    return next(new ErrorHandler('Video session not found', 404));
  }

  session.session.status = 'completed';
  session.session.endedAt = Date.now();
  session.resolution = {
    resolved: true,
    resolution,
    notes
  };

  await session.save();

  res.status(200).json({
    success: true,
    data: session
  });
});

// Knowledge Base AI

export const searchKnowledgeBase = catchAsyncErrors(async (req, res, next) => {
  const { query } = req.query;

  // AI-powered knowledge base search
  const results = [
    {
      id: 1,
      title: 'How to track my order',
      content: 'You can track your order by visiting...',
      relevance: 95,
      category: 'Orders'
    },
    {
      id: 2,
      title: 'Return policy',
      content: 'Our return policy allows...',
      relevance: 88,
      category: 'Returns'
    }
  ];

  res.status(200).json({
    success: true,
    data: results
  });
});

export const getAISuggestions = catchAsyncErrors(async (req, res, next) => {
  const { ticketId } = req.params;

  const ticket = await AIChatTriaging.findOne({ 'ticket.ticketId': ticketId });

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const suggestions = {
    suggestedResponses: [
      'Thank you for contacting us. I understand your concern...',
      'I apologize for the inconvenience. Let me help you with that...'
    ],
    relatedArticles: [
      { id: 1, title: 'Common Issues and Solutions', relevance: 92 },
      { id: 2, title: 'Troubleshooting Guide', relevance: 85 }
    ],
    nextBestActions: [
      'Request additional information',
      'Escalate to supervisor',
      'Offer compensation'
    ]
  };

  res.status(200).json({
    success: true,
    data: suggestions
  });
});

// Callback Scheduling

export const scheduleCallback = catchAsyncErrors(async (req, res, next) => {
  const { ticketId, preferredTime, phoneNumber } = req.body;

  const callback = {
    callbackId: 'CB-' + Date.now(),
    ticket: ticketId,
    customer: req.user.id,
    phoneNumber,
    scheduledTime: new Date(preferredTime),
    status: 'scheduled',
    createdAt: Date.now()
  };

  res.status(201).json({
    success: true,
    data: callback
  });
});

// Helper functions
async function analyzeTicketContent(message) {
  // Simplified AI analysis
  return {
    intent: 'order_inquiry',
    urgency: 'medium',
    sentiment: 'neutral',
    suggestedCategory: 'Orders',
    keywords: ['order', 'tracking', 'delivery'],
    confidence: 0.85,
    suggestedAgent: null,
    queue: 'general'
  };
}

function performSentimentAnalysis(text) {
  // Simplified sentiment analysis
  const positiveWords = ['great', 'excellent', 'love', 'amazing', 'happy'];
  const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'disappointed'];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

  let overall = 'neutral';
  let score = 0;

  if (positiveCount > negativeCount) {
    overall = 'positive';
    score = 0.7 + (positiveCount * 0.1);
  } else if (negativeCount > positiveCount) {
    overall = 'negative';
    score = -0.7 - (negativeCount * 0.1);
  }

  return {
    sentiment: {
      overall,
      polarity: score,
      subjectivity: 0.5
    },
    emotions: [
      { emotion: 'joy', score: positiveCount > 0 ? 0.6 : 0.1 },
      { emotion: 'anger', score: negativeCount > 0 ? 0.5 : 0.1 }
    ],
    keywords: [...positiveWords, ...negativeWords].filter(word => lowerText.includes(word)),
    confidence: 0.75
  };
}

function calculateAverageSentiment(analyses) {
  const total = analyses.reduce((sum, a) => sum + a.sentiment.polarity, 0);
  return total / analyses.length;
}

function getTopEmotions(analyses) {
  const emotionCounts = {};
  analyses.forEach(a => {
    a.emotions.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + e.score;
    });
  });

  return Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion, score]) => ({ emotion, score }));
}

function getCommonKeywords(analyses) {
  const keywordCounts = {};
  analyses.forEach(a => {
    a.keywords.forEach(k => {
      keywordCounts[k] = (keywordCounts[k] || 0) + 1;
    });
  });

  return Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));
}
