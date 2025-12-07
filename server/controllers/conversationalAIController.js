const ConversationalShopping = require('../models/ConversationalShopping');
const Product = require('../models/Product');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

// Start conversational shopping session
exports.startSession = catchAsyncErrors(async (req, res, next) => {
  const sessionId = `conv_${Date.now()}_${req.user.id}`;

  const session = await ConversationalShopping.create({
    user: req.user.id,
    sessionId,
    context: req.body.context || {}
  });

  res.status(201).json({
    success: true,
    sessionId: session.sessionId,
    message: "Hello! I'm here to help you find the perfect products. What are you looking for today?"
  });
});

// Process user message
exports.processMessage = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, message } = req.body;

  const session = await ConversationalShopping.findOne({ sessionId });
  if (!session) {
    return next(new ErrorHandler('Session not found', 404));
  }

  // AI/NLP Processing (mock - integrate with OpenAI/Anthropic/Dialogflow)
  const intent = detectIntent(message);
  const entities = extractEntities(message);
  const sentiment = analyzeSentiment(message);

  // Generate response and product recommendations
  const products = await findRelevantProducts(entities, session.context);
  const botResponse = generateResponse(intent, products, session.context);

  // Update conversation
  session.conversations.push({
    userMessage: message,
    botResponse,
    intent,
    entities,
    productsShown: products.map(p => p._id),
    sentiment
  });
  session.totalMessages += 1;

  await session.save();

  res.status(200).json({
    success: true,
    response: botResponse,
    products,
    intent,
    suggestions: generateSuggestions(intent, entities)
  });
});

// Get session history
exports.getSession = catchAsyncErrors(async (req, res, next) => {
  const session = await ConversationalShopping.findOne({
    sessionId: req.params.sessionId
  }).populate('conversations.productsShown');

  if (!session) {
    return next(new ErrorHandler('Session not found', 404));
  }

  res.status(200).json({
    success: true,
    session
  });
});

// End session
exports.endSession = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, outcome, satisfactionScore } = req.body;

  const session = await ConversationalShopping.findOne({ sessionId });
  if (!session) {
    return next(new ErrorHandler('Session not found', 404));
  }

  session.conversationState = 'completed';
  session.outcome = outcome;
  session.satisfactionScore = satisfactionScore;
  session.duration = Math.floor((Date.now() - session.createdAt) / 1000);

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Session ended successfully'
  });
});

// Helper functions (integrate with actual AI services)
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking for')) {
    return 'search';
  } else if (lowerMessage.includes('compare') || lowerMessage.includes('difference')) {
    return 'compare';
  } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return 'recommend';
  } else if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
    return 'purchase';
  }
  return 'question';
}

function extractEntities(message) {
  // Mock entity extraction - integrate with NLP service
  const entities = [];
  const categories = ['laptop', 'phone', 'headphones', 'watch', 'camera', 'shoes', 'dress', 'jeans'];

  categories.forEach(category => {
    if (message.toLowerCase().includes(category)) {
      entities.push({ type: 'product_category', value: category, confidence: 0.9 });
    }
  });

  return entities;
}

function analyzeSentiment(message) {
  // Mock sentiment analysis
  const positiveWords = ['great', 'good', 'love', 'excellent', 'perfect', 'happy'];
  const negativeWords = ['bad', 'poor', 'hate', 'terrible', 'disappointed'];

  let score = 0;
  const lowerMessage = message.toLowerCase();

  positiveWords.forEach(word => {
    if (lowerMessage.includes(word)) score += 0.3;
  });

  negativeWords.forEach(word => {
    if (lowerMessage.includes(word)) score -= 0.3;
  });

  return {
    score: Math.max(-1, Math.min(1, score)),
    label: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
  };
}

async function findRelevantProducts(entities, context) {
  let query = {};

  entities.forEach(entity => {
    if (entity.type === 'product_category') {
      query.category = new RegExp(entity.value, 'i');
    }
  });

  const products = await Product.find(query).limit(5);
  return products;
}

function generateResponse(intent, products, context) {
  switch (intent) {
    case 'search':
      return products.length > 0
        ? `I found ${products.length} products that match your search. Take a look!`
        : "I couldn't find exact matches, but here are some similar products you might like.";
    case 'recommend':
      return "Based on your preferences, I recommend these products:";
    case 'compare':
      return "Here's a comparison of the products:";
    default:
      return "I'm here to help! Could you tell me more about what you're looking for?";
  }
}

function generateSuggestions(intent, entities) {
  return [
    "Show me more details",
    "Compare with similar products",
    "Add to cart",
    "What's the price range?"
  ];
}
