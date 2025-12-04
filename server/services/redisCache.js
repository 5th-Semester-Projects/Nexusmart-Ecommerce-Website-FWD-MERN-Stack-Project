import Redis from 'ioredis';

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour
  }

  // Initialize Redis connection
  async connect() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      this.client.on('connect', () => {
        console.log('✅ Redis Connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Error:', err.message);
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Redis Connection Failed:', error.message);
      this.isConnected = false;
    }
  }

  // Get cached data
  async get(key) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET Error:', error);
      return null;
    }
  }

  // Set cached data
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET Error:', error);
      return false;
    }
  }

  // Delete cached data
  async delete(key) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DELETE Error:', error);
      return false;
    }
  }

  // Delete by pattern
  async deletePattern(pattern) {
    if (!this.isConnected) return false;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis DELETE Pattern Error:', error);
      return false;
    }
  }

  // Cache decorator for functions
  async cached(key, fn, ttl = this.defaultTTL) {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  // Increment counter
  async increment(key, amount = 1) {
    if (!this.isConnected) return null;
    try {
      return await this.client.incrby(key, amount);
    } catch (error) {
      console.error('Redis INCREMENT Error:', error);
      return null;
    }
  }

  // Rate limiting
  async rateLimit(key, limit, windowSeconds) {
    if (!this.isConnected) return { allowed: true };

    try {
      const current = await this.client.incr(key);

      if (current === 1) {
        await this.client.expire(key, windowSeconds);
      }

      const ttl = await this.client.ttl(key);

      return {
        allowed: current <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
        resetIn: ttl
      };
    } catch (error) {
      console.error('Redis Rate Limit Error:', error);
      return { allowed: true };
    }
  }

  // Session storage
  async setSession(sessionId, data, ttl = 86400) { // 24 hours
    return await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.delete(`session:${sessionId}`);
  }

  // Product caching
  async cacheProduct(productId, data) {
    return await this.set(`product:${productId}`, data, 1800); // 30 mins
  }

  async getCachedProduct(productId) {
    return await this.get(`product:${productId}`);
  }

  async invalidateProductCache(productId) {
    await this.delete(`product:${productId}`);
    await this.deletePattern('products:list:*');
    await this.deletePattern('products:search:*');
  }

  // Search results caching
  async cacheSearchResults(query, results) {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return await this.set(key, results, 600); // 10 mins
  }

  async getCachedSearchResults(query) {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return await this.get(key);
  }

  // Cart caching
  async cacheCart(userId, cart) {
    return await this.set(`cart:${userId}`, cart, 604800); // 7 days
  }

  async getCachedCart(userId) {
    return await this.get(`cart:${userId}`);
  }

  // Leaderboard operations
  async addToLeaderboard(key, member, score) {
    if (!this.isConnected) return false;
    try {
      await this.client.zadd(key, score, member);
      return true;
    } catch (error) {
      console.error('Redis Leaderboard Error:', error);
      return false;
    }
  }

  async getLeaderboard(key, start = 0, end = 9) {
    if (!this.isConnected) return [];
    try {
      return await this.client.zrevrange(key, start, end, 'WITHSCORES');
    } catch (error) {
      console.error('Redis Leaderboard Error:', error);
      return [];
    }
  }

  // Pub/Sub
  async publish(channel, message) {
    if (!this.isConnected) return false;
    try {
      await this.client.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Redis Publish Error:', error);
      return false;
    }
  }

  subscribe(channel, callback) {
    if (!this.isConnected) return;

    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(JSON.parse(message));
      }
    });

    return subscriber;
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) return { status: 'disconnected' };

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;

      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory_human:(\S+)/);

      return {
        status: 'connected',
        latency: `${latency}ms`,
        memory: memoryMatch ? memoryMatch[1] : 'unknown'
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  // Disconnect
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Export singleton instance
const redisCache = new RedisCache();
export default redisCache;

// Middleware for route caching
export const cacheMiddleware = (ttl = 60) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `route:${req.originalUrl}`;
    const cached = await redisCache.get(key);

    if (cached) {
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = (data) => {
      redisCache.set(key, data, ttl);
      return originalJson(data);
    };

    next();
  };
};

// Rate limiter middleware
export const rateLimiter = (limit = 100, windowSeconds = 60) => {
  return async (req, res, next) => {
    const key = `ratelimit:${req.ip}:${req.path}`;
    const result = await redisCache.rateLimit(key, limit, windowSeconds);

    res.set({
      'X-RateLimit-Limit': result.limit,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': result.resetIn
    });

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }

    next();
  };
};
