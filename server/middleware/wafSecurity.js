import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import crypto from 'crypto';

// Web Application Firewall Configuration
class WAFMiddleware {
  constructor() {
    this.blockedIPs = new Set();
    this.suspiciousPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL Injection
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
      /(\.\.\/)|(\.\.\\)/g, // Path Traversal
      /(\%00)/g, // Null Byte
      /(union\s+select)/gi, // SQL Union
      /(exec\s*\()/gi, // Command Execution
      /(\bor\b.*=.*)/gi, // SQL OR injection
      /(drop\s+table)/gi, // SQL Drop
      /(insert\s+into)/gi, // SQL Insert
      /(select\s+\*\s+from)/gi, // SQL Select
      /(<iframe)/gi, // iFrame injection
      /(javascript:)/gi, // JavaScript protocol
      /(onerror\s*=)/gi, // Event handlers
      /(onload\s*=)/gi,
      /(onclick\s*=)/gi,
      /(eval\s*\()/gi, // Eval
      /(document\.cookie)/gi, // Cookie stealing
      /(document\.location)/gi,
      /(\.htaccess)/gi, // Server config
      /(\.env)/gi, // Environment files
      /(\/etc\/passwd)/gi, // System files
      /(cmd\.exe)/gi, // Windows commands
      /(\|\||&&)/g, // Command chaining
      /(base64_decode)/gi, // PHP functions
      /(file_get_contents)/gi,
      /(curl_exec)/gi,
    ];

    this.honeypotFields = ['email_confirm', 'phone_verify', 'website_url'];
    this.requestCounts = new Map();
    this.anomalyThreshold = 100;
  }

  // Main WAF middleware
  middleware() {
    return async (req, res, next) => {
      try {
        // Check if IP is blocked
        if (this.isBlocked(req.ip)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }

        // Check for suspicious patterns
        if (this.detectSuspiciousPatterns(req)) {
          this.logThreat(req, 'suspicious_pattern');
          this.incrementScore(req.ip, 10);
          return res.status(403).json({
            success: false,
            message: 'Request blocked by security policy'
          });
        }

        // Check honeypot fields
        if (this.checkHoneypot(req)) {
          this.logThreat(req, 'honeypot_triggered');
          this.blockIP(req.ip, 3600000); // Block for 1 hour
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }

        // Check for anomalies
        if (this.detectAnomaly(req)) {
          this.logThreat(req, 'anomaly_detected');
          this.incrementScore(req.ip, 5);
        }

        // Add security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Track request
        this.trackRequest(req);

        next();
      } catch (error) {
        console.error('WAF Error:', error);
        next();
      }
    };
  }

  // Check for suspicious patterns in request
  detectSuspiciousPatterns(req) {
    const checkString = (str) => {
      if (!str || typeof str !== 'string') return false;
      return this.suspiciousPatterns.some(pattern => pattern.test(str));
    };

    // Check URL
    if (checkString(req.url)) return true;
    if (checkString(req.originalUrl)) return true;

    // Check query parameters
    for (const key in req.query) {
      if (checkString(key) || checkString(req.query[key])) return true;
    }

    // Check body
    if (req.body) {
      const checkObject = (obj) => {
        for (const key in obj) {
          if (checkString(key)) return true;
          if (typeof obj[key] === 'string' && checkString(obj[key])) return true;
          if (typeof obj[key] === 'object') {
            if (checkObject(obj[key])) return true;
          }
        }
        return false;
      };
      if (checkObject(req.body)) return true;
    }

    // Check headers
    const sensitiveHeaders = ['user-agent', 'referer', 'cookie'];
    for (const header of sensitiveHeaders) {
      if (checkString(req.headers[header])) return true;
    }

    return false;
  }

  // Check honeypot fields
  checkHoneypot(req) {
    if (!req.body) return false;

    for (const field of this.honeypotFields) {
      if (req.body[field] && req.body[field].length > 0) {
        return true; // Bot detected
      }
    }
    return false;
  }

  // Detect anomalous behavior
  detectAnomaly(req) {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window

    if (!this.requestCounts.has(ip)) {
      this.requestCounts.set(ip, []);
    }

    const requests = this.requestCounts.get(ip);
    requests.push(now);

    // Clean old entries
    const filtered = requests.filter(time => now - time < windowMs);
    this.requestCounts.set(ip, filtered);

    // Check if request count exceeds threshold
    return filtered.length > this.anomalyThreshold;
  }

  // Block IP address
  blockIP(ip, duration = 3600000) {
    this.blockedIPs.add(ip);
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, duration);
  }

  // Check if IP is blocked
  isBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Increment threat score
  incrementScore(ip, points) {
    // In production, store in Redis
    console.log(`Threat score for ${ip} increased by ${points}`);
  }

  // Track request for analytics
  trackRequest(req) {
    // Store request metadata for analysis
  }

  // Log security threat
  logThreat(req, type) {
    const threat = {
      type,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
      body: req.body ? JSON.stringify(req.body).substring(0, 500) : null
    };

    console.warn('🚨 Security Threat Detected:', threat);

    // In production, send to SIEM or logging service
  }
}

// Rate Limiters
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after an hour'
  },
  skipSuccessfulRequests: true
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'API rate limit exceeded'
  }
});

// Security middleware stack
export const securityMiddleware = (app) => {
  // Initialize WAF
  const waf = new WAFMiddleware();
  app.use(waf.middleware());

  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.API_URL],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // XSS Protection
  app.use(xss());

  // MongoDB Sanitization
  app.use(mongoSanitize({
    replaceWith: '_'
  }));

  // HPP - HTTP Parameter Pollution
  app.use(hpp({
    whitelist: ['price', 'rating', 'category', 'sort']
  }));

  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Rate limiters
  app.use('/api/', globalRateLimiter);
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/register', authRateLimiter);

  console.log('🛡️ Security middleware initialized');
};

// E2E Encryption utilities
export class E2EEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }

  // Generate encryption key from password
  deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
  }

  // Encrypt data
  encrypt(data, key) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // Decrypt data
  decrypt(encryptedData, key) {
    const { encrypted, iv, tag } = encryptedData;

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  // Generate key pair for asymmetric encryption
  generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
  }

  // Encrypt with public key
  encryptWithPublicKey(data, publicKey) {
    const buffer = Buffer.from(JSON.stringify(data), 'utf8');
    return crypto.publicEncrypt(publicKey, buffer).toString('base64');
  }

  // Decrypt with private key
  decryptWithPrivateKey(encryptedData, privateKey) {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return JSON.parse(decrypted.toString('utf8'));
  }

  // Hash sensitive data
  hash(data, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    return {
      hash: hash.toString('hex'),
      salt
    };
  }

  // Verify hashed data
  verifyHash(data, hash, salt) {
    const newHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    return newHash.toString('hex') === hash;
  }

  // Generate secure token
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

export const wafMiddleware = new WAFMiddleware();
export const e2eEncryption = new E2EEncryption();

export default { securityMiddleware, wafMiddleware, e2eEncryption };
