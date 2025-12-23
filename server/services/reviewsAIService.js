import OpenAI from 'openai';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

/**
 * AI-Powered Reviews Analysis Service
 * Sentiment analysis, fake review detection, and insights
 */

class ReviewsAIService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  /**
   * Analyze sentiment of a review
   */
  async analyzeSentiment(reviewText) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze the sentiment of product reviews. Return a JSON object with:
              - sentiment: "positive", "negative", or "neutral"
              - score: number from -1 (very negative) to 1 (very positive)
              - emotions: array of detected emotions (happy, frustrated, satisfied, disappointed, etc.)
              - keyTopics: array of main topics mentioned
              - summary: one sentence summary of the review sentiment`
          },
          {
            role: 'user',
            content: reviewText
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('Sentiment analysis error:', error);
      // Fallback basic sentiment
      return this.basicSentimentAnalysis(reviewText);
    }
  }

  /**
   * Basic sentiment analysis fallback
   */
  basicSentimentAnalysis(text) {
    const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'best', 'fantastic', 'wonderful', 'awesome', 'good', 'happy', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'disappointed', 'horrible', 'defective', 'broken', 'useless', 'waste'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    const score = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);

    return {
      sentiment: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
      score,
      emotions: [],
      keyTopics: [],
      summary: 'Sentiment analyzed using basic method'
    };
  }

  /**
   * Detect potentially fake reviews
   */
  async detectFakeReview(review, userHistory) {
    const indicators = {
      isFake: false,
      confidence: 0,
      reasons: []
    };

    // Check 1: Review length
    if (review.text.length < 20) {
      indicators.reasons.push('Very short review');
      indicators.confidence += 10;
    }

    // Check 2: Excessive punctuation
    const exclamationCount = (review.text.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      indicators.reasons.push('Excessive exclamation marks');
      indicators.confidence += 15;
    }

    // Check 3: All caps
    const capsRatio = (review.text.match(/[A-Z]/g) || []).length / review.text.length;
    if (capsRatio > 0.5 && review.text.length > 20) {
      indicators.reasons.push('Excessive capitals');
      indicators.confidence += 10;
    }

    // Check 4: Extreme rating without substance
    if ((review.rating === 5 || review.rating === 1) && review.text.length < 50) {
      indicators.reasons.push('Extreme rating with minimal review');
      indicators.confidence += 20;
    }

    // Check 5: User review patterns
    if (userHistory) {
      // Same rating for all reviews
      const ratings = userHistory.map(r => r.rating);
      if (new Set(ratings).size === 1 && ratings.length > 3) {
        indicators.reasons.push('User always gives same rating');
        indicators.confidence += 25;
      }

      // Too many reviews in short time
      const recentReviews = userHistory.filter(r =>
        new Date() - new Date(r.createdAt) < 24 * 60 * 60 * 1000
      );
      if (recentReviews.length > 5) {
        indicators.reasons.push('Unusual review frequency');
        indicators.confidence += 20;
      }
    }

    // Check 6: Generic phrases
    const genericPhrases = [
      'highly recommend',
      'must buy',
      'best product ever',
      'five stars',
      'great product',
      'amazing product',
      'love it'
    ];

    const lowerText = review.text.toLowerCase();
    let genericCount = 0;
    genericPhrases.forEach(phrase => {
      if (lowerText.includes(phrase)) genericCount++;
    });

    if (genericCount >= 3) {
      indicators.reasons.push('Multiple generic phrases');
      indicators.confidence += 15;
    }

    // Use AI for deeper analysis if confidence is moderate
    if (indicators.confidence > 30 && indicators.confidence < 70) {
      try {
        const aiAnalysis = await this.aiDeepFakeCheck(review.text);
        indicators.confidence = Math.max(indicators.confidence, aiAnalysis.confidence);
        if (aiAnalysis.reasons) {
          indicators.reasons.push(...aiAnalysis.reasons);
        }
      } catch (error) {
        console.error('AI fake check error:', error);
      }
    }

    indicators.isFake = indicators.confidence >= 60;

    return indicators;
  }

  /**
   * AI-powered deep fake review check
   */
  async aiDeepFakeCheck(reviewText) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze if this product review might be fake/inauthentic. 
              Look for: 
              - Generic or templated language
              - Lack of specific product details
              - Unnatural writing patterns
              - Promotional language
              - Inconsistent tone
              
              Return JSON: { "confidence": 0-100, "reasons": ["reason1", "reason2"] }`
          },
          {
            role: 'user',
            content: reviewText
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 200
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('AI fake check error:', error);
      return { confidence: 0, reasons: [] };
    }
  }

  /**
   * Generate review summary for a product
   */
  async generateReviewSummary(productId) {
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (reviews.length === 0) {
      return {
        summary: 'No reviews yet',
        totalReviews: 0
      };
    }

    // Analyze all reviews
    const sentiments = await Promise.all(
      reviews.slice(0, 20).map(r => this.analyzeSentiment(r.comment))
    );

    // Aggregate topics
    const allTopics = sentiments.flatMap(s => s.keyTopics || []);
    const topicFrequency = {};
    allTopics.forEach(topic => {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    });

    // Get top topics
    const topTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    // Generate AI summary
    let aiSummary = '';
    try {
      const reviewTexts = reviews.slice(0, 10).map(r => r.comment).join('\n---\n');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Summarize these product reviews in 2-3 sentences. Highlight common praises and complaints.'
          },
          {
            role: 'user',
            content: reviewTexts
          }
        ],
        max_tokens: 150
      });

      aiSummary = response.choices[0].message.content;
    } catch (error) {
      console.error('Summary generation error:', error);
    }

    // Calculate stats
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const positiveCount = sentiments.filter(s => s.sentiment === 'positive').length;
    const negativeCount = sentiments.filter(s => s.sentiment === 'negative').length;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: (reviews.filter(r => r.rating === rating).length / reviews.length * 100).toFixed(1)
    }));

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
      sentimentBreakdown: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: sentiments.length - positiveCount - negativeCount
      },
      topTopics,
      aiSummary,
      recommendationRate: `${((positiveCount / sentiments.length) * 100).toFixed(0)}%`
    };
  }

  /**
   * Get pros and cons from reviews
   */
  async extractProsAndCons(productId) {
    const reviews = await Review.find({ product: productId })
      .sort({ helpful: -1 })
      .limit(30)
      .lean();

    if (reviews.length === 0) {
      return { pros: [], cons: [] };
    }

    try {
      const reviewTexts = reviews.map(r => `Rating: ${r.rating}/5 - ${r.comment}`).join('\n\n');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Extract pros and cons from these product reviews.
              Return JSON: { 
                "pros": ["pro1", "pro2", ...], 
                "cons": ["con1", "con2", ...],
                "commonIssues": ["issue1", ...]
              }
              Maximum 5 items each.`
          },
          {
            role: 'user',
            content: reviewTexts
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('Pros/cons extraction error:', error);
      return { pros: [], cons: [], commonIssues: [] };
    }
  }

  /**
   * Analyze review for moderation
   */
  async moderateReview(reviewText) {
    try {
      const response = await this.openai.moderations.create({
        input: reviewText
      });

      const result = response.results[0];

      return {
        flagged: result.flagged,
        categories: result.categories,
        scores: result.category_scores
      };

    } catch (error) {
      console.error('Moderation error:', error);
      return { flagged: false, categories: {}, scores: {} };
    }
  }

  /**
   * Generate response suggestion for seller
   */
  async generateResponseSuggestion(review) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Generate a professional, helpful seller response to this customer review. 
              Guidelines:
              - Thank the customer
              - Address specific points mentioned
              - Be empathetic for negative reviews
              - Offer solutions if there are complaints
              - Keep it concise (2-3 sentences)
              - Maintain brand professionalism`
          },
          {
            role: 'user',
            content: `Rating: ${review.rating}/5\nReview: ${review.comment}`
          }
        ],
        max_tokens: 150
      });

      return {
        suggestion: response.choices[0].message.content,
        tone: review.rating >= 4 ? 'appreciative' : 'empathetic'
      };

    } catch (error) {
      console.error('Response generation error:', error);
      return {
        suggestion: 'Thank you for your feedback. We value your input and strive to improve our service.',
        tone: 'neutral'
      };
    }
  }

  /**
   * Batch analyze reviews
   */
  async batchAnalyze(reviewIds) {
    const reviews = await Review.find({ _id: { $in: reviewIds } }).lean();

    const results = await Promise.all(
      reviews.map(async (review) => {
        const sentiment = await this.analyzeSentiment(review.comment);
        const fakeCheck = await this.detectFakeReview(review, []);

        return {
          reviewId: review._id,
          sentiment,
          fakeCheck,
          moderation: await this.moderateReview(review.comment)
        };
      })
    );

    return results;
  }
}

export default new ReviewsAIService();
