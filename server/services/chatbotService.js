import OpenAI from 'openai';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

/**
 * AI Chatbot Service
 * Powered by OpenAI GPT-4 for intelligent customer support
 */

class ChatbotService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;

    this.conversationHistory = new Map();
    this.maxHistoryLength = 20;
  }

  // System prompt for the chatbot
  getSystemPrompt() {
    return `You are an intelligent and helpful shopping assistant for an e-commerce platform. Your role is to:
    
1. Help customers find products they're looking for
2. Answer questions about products, orders, shipping, and returns
3. Provide product recommendations based on user preferences
4. Assist with order tracking and status inquiries
5. Handle complaints and escalate to human support when needed
6. Suggest promotions and deals when relevant

Guidelines:
- Be friendly, professional, and helpful
- Keep responses concise but informative
- If you don't know something, admit it and offer alternatives
- For order-specific queries, always verify order details first
- Protect customer privacy - never share personal information
- Escalate to human support for complex issues

You have access to product catalog, order history, and customer information through function calls.`;
  }

  // Available functions for the chatbot
  getFunctions() {
    return [
      {
        name: 'search_products',
        description: 'Search for products in the catalog',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            category: { type: 'string', description: 'Product category' },
            minPrice: { type: 'number', description: 'Minimum price' },
            maxPrice: { type: 'number', description: 'Maximum price' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_order_status',
        description: 'Get the status of a customer order',
        parameters: {
          type: 'object',
          properties: {
            orderId: { type: 'string', description: 'Order ID' }
          },
          required: ['orderId']
        }
      },
      {
        name: 'get_product_details',
        description: 'Get detailed information about a product',
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID' }
          },
          required: ['productId']
        }
      },
      {
        name: 'get_recommendations',
        description: 'Get product recommendations for the user',
        parameters: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Preferred category' },
            priceRange: { type: 'string', description: 'Budget range' }
          }
        }
      },
      {
        name: 'check_availability',
        description: 'Check product availability and stock',
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID' },
            quantity: { type: 'number', description: 'Desired quantity' }
          },
          required: ['productId']
        }
      },
      {
        name: 'escalate_to_human',
        description: 'Escalate the conversation to a human agent',
        parameters: {
          type: 'object',
          properties: {
            reason: { type: 'string', description: 'Reason for escalation' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] }
          },
          required: ['reason']
        }
      }
    ];
  }

  // Execute function calls
  async executeFunction(name, args, userId) {
    switch (name) {
      case 'search_products':
        return await this.searchProducts(args);
      case 'get_order_status':
        return await this.getOrderStatus(args.orderId, userId);
      case 'get_product_details':
        return await this.getProductDetails(args.productId);
      case 'get_recommendations':
        return await this.getRecommendations(args, userId);
      case 'check_availability':
        return await this.checkAvailability(args.productId, args.quantity);
      case 'escalate_to_human':
        return await this.escalateToHuman(args, userId);
      default:
        return { error: 'Unknown function' };
    }
  }

  async searchProducts({ query, category, minPrice, maxPrice }) {
    const filter = { status: 'active' };

    if (query) {
      filter.$text = { $search: query };
    }
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    const products = await Product.find(filter)
      .select('name price images rating stock')
      .limit(5)
      .lean();

    return products.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      rating: p.rating?.average || 0,
      inStock: p.stock > 0
    }));
  }

  async getOrderStatus(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .select('orderStatus deliveryStatus items totalPrice createdAt')
      .lean();

    if (!order) {
      return { error: 'Order not found' };
    }

    return {
      orderId: order._id,
      status: order.orderStatus,
      deliveryStatus: order.deliveryStatus,
      totalPrice: order.totalPrice,
      itemCount: order.items.length,
      orderedAt: order.createdAt
    };
  }

  async getProductDetails(productId) {
    const product = await Product.findById(productId)
      .select('name description price images rating stock specifications')
      .lean();

    if (!product) {
      return { error: 'Product not found' };
    }

    return {
      name: product.name,
      description: product.description?.substring(0, 200),
      price: product.price,
      rating: product.rating?.average || 0,
      reviewCount: product.rating?.count || 0,
      inStock: product.stock > 0,
      specifications: product.specifications?.slice(0, 5)
    };
  }

  async getRecommendations({ category, priceRange }, userId) {
    const user = await User.findById(userId).lean();

    const filter = { status: 'active' };
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .sort({ 'rating.average': -1, soldCount: -1 })
      .limit(5)
      .select('name price rating images')
      .lean();

    return products.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      rating: p.rating?.average || 0
    }));
  }

  async checkAvailability(productId, quantity = 1) {
    const product = await Product.findById(productId).select('stock name').lean();

    if (!product) {
      return { error: 'Product not found' };
    }

    return {
      product: product.name,
      requestedQuantity: quantity,
      availableStock: product.stock,
      isAvailable: product.stock >= quantity
    };
  }

  async escalateToHuman({ reason, priority = 'medium' }, userId) {
    // Create support ticket
    return {
      escalated: true,
      ticketId: `TKT-${Date.now()}`,
      reason,
      priority,
      message: 'A support agent will contact you shortly.'
    };
  }

  // Main chat function
  async chat(userId, message, sessionId) {
    // Get or create conversation history
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }

    const history = this.conversationHistory.get(sessionId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Trim history if too long
    if (history.length > this.maxHistoryLength) {
      history.splice(0, history.length - this.maxHistoryLength);
    }

    try {
      // Initial API call
      let response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          ...history
        ],
        functions: this.getFunctions(),
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 500
      });

      let assistantMessage = response.choices[0].message;

      // Handle function calls
      while (assistantMessage.function_call) {
        const functionName = assistantMessage.function_call.name;
        const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

        // Execute function
        const functionResult = await this.executeFunction(functionName, functionArgs, userId);

        // Add function call and result to history
        history.push(assistantMessage);
        history.push({
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResult)
        });

        // Get follow-up response
        response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            ...history
          ],
          functions: this.getFunctions(),
          function_call: 'auto',
          temperature: 0.7,
          max_tokens: 500
        });

        assistantMessage = response.choices[0].message;
      }

      // Add assistant response to history
      history.push(assistantMessage);

      return {
        response: assistantMessage.content,
        sessionId,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team.",
        error: true
      };
    }
  }

  // Quick replies for common questions
  getQuickReplies() {
    return [
      { id: 'track_order', text: 'Track my order' },
      { id: 'returns', text: 'Return policy' },
      { id: 'shipping', text: 'Shipping info' },
      { id: 'recommendations', text: 'Product recommendations' },
      { id: 'support', text: 'Talk to human' }
    ];
  }

  // Clear conversation history
  clearHistory(sessionId) {
    this.conversationHistory.delete(sessionId);
  }
}

export default new ChatbotService();
