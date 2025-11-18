# 🔧 NexusMart Maintenance Guide

## 📋 Table of Contents

1. [Daily Maintenance Tasks](#daily-maintenance-tasks)
2. [Weekly Maintenance Tasks](#weekly-maintenance-tasks)
3. [Monthly Maintenance Tasks](#monthly-maintenance-tasks)
4. [Quarterly Reviews](#quarterly-reviews)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Update Procedures](#update-procedures)
7. [Backup & Recovery](#backup--recovery)
8. [Performance Monitoring](#performance-monitoring)
9. [Security Checklist](#security-checklist)
10. [Emergency Procedures](#emergency-procedures)

---

## 📅 Daily Maintenance Tasks

### Morning Checks (15 minutes)

#### 1. System Health Check

```bash
# Check if all services are running
# Frontend
curl https://nexusmart.com

# Backend API
curl https://api.nexusmart.com/api/health

# Expected response: { "status": "ok", "timestamp": "..." }
```

#### 2. Error Monitoring (Sentry)

- [ ] Login to Sentry dashboard
- [ ] Check for new errors in last 24 hours
- [ ] Prioritize critical errors (P0/P1)
- [ ] Create tickets for recurring issues

**Critical Error Threshold**: > 10 errors/hour

#### 3. Analytics Review (Google Analytics)

- [ ] Check real-time users
- [ ] Review yesterday's traffic
- [ ] Check conversion rate
- [ ] Verify e-commerce tracking

**Key Metrics**:

- Daily active users: Should be stable ±20%
- Conversion rate: Should be > 2%
- Bounce rate: Should be < 50%

#### 4. Payment System Check

```bash
# Check recent transactions
# In admin dashboard: Orders > Recent Payments

# Stripe Dashboard
https://dashboard.stripe.com/payments

# Razorpay Dashboard
https://dashboard.razorpay.com/
```

**Alert Conditions**:

- Payment failure rate > 5%
- Unusual payment patterns
- Refund requests

#### 5. Server Resources (Railway/Render)

- [ ] Check CPU usage (< 70% normal)
- [ ] Check memory usage (< 80% normal)
- [ ] Check disk space (> 20% free)
- [ ] Review error logs

**Railway Dashboard**: https://railway.app/dashboard
**Render Dashboard**: https://dashboard.render.com/

#### 6. Database Health (MongoDB Atlas)

- [ ] Check database size
- [ ] Review slow queries
- [ ] Check connection count
- [ ] Verify backups

**MongoDB Atlas**: https://cloud.mongodb.com/

---

## 📆 Weekly Maintenance Tasks

### Monday Morning Review (30-45 minutes)

#### 1. Dependency Updates

```bash
# Check for security vulnerabilities
cd client
npm audit

cd ../server
npm audit

# If vulnerabilities found:
npm audit fix
# Or for breaking changes:
npm audit fix --force
```

#### 2. Performance Review

```bash
# Run Lighthouse audit
npx lighthouse https://nexusmart.com --output html --view

# Check Core Web Vitals in Google Search Console
# https://search.google.com/search-console
```

**Target Scores**:

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### 3. User Feedback Review

- [ ] Check support emails
- [ ] Review product ratings/reviews
- [ ] Check social media mentions
- [ ] Analyze user session recordings (if available)

#### 4. Content Updates

- [ ] Update homepage banners
- [ ] Add new product arrivals
- [ ] Update promotional offers
- [ ] Check for expired content

#### 5. SEO Health Check

```bash
# Check sitemap is accessible
curl https://nexusmart.com/sitemap.xml

# Verify robots.txt
curl https://nexusmart.com/robots.txt

# Check Google Search Console
# - Indexing status
# - Coverage issues
# - Core Web Vitals
```

#### 6. Backup Verification

```bash
# MongoDB Atlas - Verify backup exists
# Dashboard > Backup > Snapshots
# Should see daily snapshots for last 7 days
```

#### 7. Test Critical Flows

- [ ] User registration
- [ ] User login
- [ ] Add to cart
- [ ] Checkout process
- [ ] Payment completion
- [ ] Order tracking

---

## 🗓️ Monthly Maintenance Tasks

### First Monday of Month (1-2 hours)

#### 1. Comprehensive Security Audit

```bash
# Update all dependencies
cd client
npm update
npm audit fix

cd ../server
npm update
npm audit fix

# Check for outdated packages
npm outdated
```

#### 2. Database Optimization

```sql
-- MongoDB Atlas Dashboard
-- 1. Review database indexes
-- 2. Analyze slow queries (> 100ms)
-- 3. Check collection sizes
-- 4. Optimize large collections

-- Create indexes for new fields if needed
db.products.createIndex({ category: 1, price: 1 })
db.orders.createIndex({ userId: 1, createdAt: -1 })
```

#### 3. Performance Optimization

```bash
# Analyze bundle size
cd client
npm run build
npx source-map-explorer dist/assets/*.js

# Check for large dependencies
npx webpack-bundle-analyzer dist/stats.json
```

#### 4. Code Quality Review

```bash
# Run linting
cd client
npm run lint

cd ../server
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

#### 5. Test Suite Execution

```bash
# Run all tests
cd client
npm test -- --coverage

# Run E2E tests
npm run test:e2e

cd ../server
npm test
```

**Coverage Targets**:

- Statements: > 70%
- Branches: > 65%
- Functions: > 70%
- Lines: > 70%

#### 6. Cost Analysis

- [ ] Review Vercel usage and costs
- [ ] Review Railway/Render usage and costs
- [ ] Review MongoDB Atlas usage
- [ ] Review Cloudinary usage
- [ ] Review third-party service costs
- [ ] Optimize if over budget

#### 7. Analytics Deep Dive

```
Google Analytics 4:
- [ ] User acquisition sources
- [ ] User behavior flow
- [ ] Conversion funnel analysis
- [ ] Product performance
- [ ] Geographic distribution
- [ ] Device breakdown
- [ ] Page speed analysis
```

#### 8. Documentation Updates

- [ ] Update API documentation
- [ ] Update README if features changed
- [ ] Document new procedures
- [ ] Update runbooks

---

## 📊 Quarterly Reviews

### End of Quarter (Half-day)

#### 1. Major Dependency Updates

```bash
# Update React and major libraries
cd client
npm update react react-dom
npm update @reduxjs/toolkit react-redux
npm update react-router-dom

# Update Node packages
cd ../server
npm update express mongoose
npm update stripe razorpay
```

**Important**: Test thoroughly after major updates!

#### 2. Feature Performance Review

- [ ] AI recommendations accuracy
- [ ] Search quality and relevance
- [ ] AR/3D feature usage statistics
- [ ] Crypto payment adoption
- [ ] NFT loyalty engagement

#### 3. Infrastructure Review

- [ ] Database scaling needs
- [ ] Server capacity planning
- [ ] CDN performance
- [ ] Region expansion requirements

#### 4. Security Audit

```bash
# Run security scan
npm install -g snyk
snyk test

# Check for known vulnerabilities
npm audit --production
```

- [ ] Review access logs for suspicious activity
- [ ] Rotate API keys and secrets
- [ ] Update SSL certificates if needed
- [ ] Review user permissions

#### 5. Disaster Recovery Test

- [ ] Restore from backup to test environment
- [ ] Verify all data intact
- [ ] Test recovery time
- [ ] Update DR documentation

#### 6. User Experience Analysis

- [ ] Heatmap analysis (Hotjar/Microsoft Clarity)
- [ ] User session recordings review
- [ ] Funnel drop-off analysis
- [ ] A/B test results review

#### 7. Business Metrics Review

```
Analyze:
- Revenue growth
- Customer acquisition cost
- Customer lifetime value
- Cart abandonment rate
- Average order value
- Return customer rate
- Product return rate
```

---

## 🔧 Common Issues & Solutions

### Issue 1: High Error Rate in Sentry

**Symptoms**: > 10 errors per hour

**Investigation**:

```bash
# Check recent deployments
git log --oneline -10

# Check server logs
# Railway: Dashboard > Logs
# Render: Dashboard > Logs

# Check database connection
mongo "your-connection-string" --eval "db.adminCommand('ping')"
```

**Solutions**:

1. If related to recent deployment → Rollback
2. If database connection issue → Check MongoDB Atlas
3. If third-party API issue → Check service status
4. If uncaught exception → Deploy hotfix

**Rollback Procedure**:

```bash
# Frontend (Vercel)
vercel rollback

# Backend (Railway)
# Dashboard > Deployments > Previous Version > Redeploy
```

---

### Issue 2: Slow Page Load Times

**Symptoms**: LCP > 4s, FCP > 2s

**Investigation**:

```bash
# Run Lighthouse
npx lighthouse https://nexusmart.com --view

# Check bundle sizes
cd client
npm run build
ls -lh dist/assets/
```

**Solutions**:

1. **Large Bundle**: Implement more code splitting
2. **Large Images**: Optimize and convert to WebP
3. **Too Many Requests**: Implement HTTP/2, combine requests
4. **Slow API**: Optimize database queries, add caching

**Quick Fixes**:

```bash
# Enable compression on server
# In server.js:
app.use(compression());

# Optimize images
npm install -g imagemin-cli
imagemin public/images/*.jpg --out-dir=public/images/optimized
```

---

### Issue 3: Payment Failures Increasing

**Symptoms**: Payment success rate < 95%

**Investigation**:

1. Check Stripe/Razorpay dashboards for error codes
2. Review Sentry for payment-related errors
3. Check webhook endpoint logs

**Common Causes**:

- Expired API keys → Rotate keys
- Webhook signature mismatch → Update webhook secret
- Insufficient funds → User issue
- Card declined → User issue
- Network timeout → Increase timeout limits

**Solutions**:

```javascript
// Increase timeout for payment API
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  timeout: 30000, // 30 seconds
  maxNetworkRetries: 3,
})
```

---

### Issue 4: Database Connection Errors

**Symptoms**: "MongooseServerSelectionError"

**Investigation**:

```bash
# Test connection
mongo "your-connection-string" --eval "db.adminCommand('ping')"

# Check MongoDB Atlas status
# https://status.mongodb.com/
```

**Solutions**:

1. **IP Whitelist**: Add current server IP
2. **Connection Limit**: Upgrade Atlas tier
3. **Wrong Credentials**: Update .env file
4. **Network Issue**: Check Railway/Render network

```javascript
// Improve connection handling in db.js
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    // Retry after 5 seconds
    setTimeout(connectDB, 5000)
  }
}

module.exports = connectDB
```

---

### Issue 5: High Server CPU/Memory Usage

**Symptoms**: CPU > 80%, Memory > 90%

**Investigation**:

```bash
# Check process usage
# Railway/Render dashboard > Metrics

# Profile Node.js app
node --inspect server.js
# Use Chrome DevTools for profiling
```

**Solutions**:

1. **Memory Leak**: Check for unclosed connections, event listeners
2. **Heavy Computation**: Move to background job (Bull queue)
3. **Too Many Requests**: Implement rate limiting
4. **Scale Up**: Upgrade server plan

```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
})

app.use('/api/', limiter)
```

---

## 🔄 Update Procedures

### Updating Dependencies

#### 1. Check for Updates

```bash
# Check outdated packages
npm outdated

# Or use npm-check-updates
npx npm-check-updates
```

#### 2. Update Non-Breaking Changes

```bash
# Update patch and minor versions
npm update

# Or specific package
npm update react
```

#### 3. Update Breaking Changes (Carefully!)

```bash
# Create feature branch
git checkout -b update/major-dependencies

# Update major version
npm install react@latest react-dom@latest

# Run tests
npm test
npm run test:e2e

# Test manually
npm run dev

# If all good, commit and deploy
git add .
git commit -m "chore: update React to v19"
git push origin update/major-dependencies
```

---

### Deploying New Features

#### 1. Development

```bash
# Create feature branch
git checkout -b feature/new-payment-method

# Develop and test locally
npm run dev

# Run tests
npm test
```

#### 2. Testing

```bash
# Run linting
npm run lint

# Run type check (if using TypeScript)
npm run type-check

# Run E2E tests
npm run test:e2e

# Test in staging environment
```

#### 3. Code Review

```bash
# Push to GitHub
git push origin feature/new-payment-method

# Create Pull Request
# Get at least 1 approval
# Ensure CI passes
```

#### 4. Deployment

```bash
# Merge to main
git checkout main
git merge feature/new-payment-method

# Push to trigger CI/CD
git push origin main

# Monitor deployment in GitHub Actions
# Watch for errors in Sentry
```

#### 5. Verification

- [ ] Feature works in production
- [ ] No new errors in Sentry
- [ ] Performance metrics stable
- [ ] Analytics tracking working

---

## 💾 Backup & Recovery

### Automated Backups

#### MongoDB Atlas (Automatic)

- **Frequency**: Daily snapshots
- **Retention**: 7 days (free tier), customize for paid
- **Location**: Atlas Dashboard > Backup

**Verify Backup**:

```bash
# Atlas Dashboard > Backup > Snapshots
# Should see snapshots for each day
```

#### Manual Backup

```bash
# Using mongodump
mongodump --uri="your-mongodb-uri" --out=./backups/$(date +%Y%m%d)

# Compress backup
tar -czf backup-$(date +%Y%m%d).tar.gz ./backups/$(date +%Y%m%d)
```

### Recovery Procedures

#### Restore from MongoDB Atlas Snapshot

1. Go to Atlas Dashboard > Backup
2. Select snapshot date
3. Click "Restore"
4. Choose restore target:
   - New cluster (recommended for testing)
   - Existing cluster (for actual recovery)
5. Monitor restore progress
6. Verify data after restore

#### Restore from Manual Backup

```bash
# Extract backup
tar -xzf backup-20240115.tar.gz

# Restore to MongoDB
mongorestore --uri="your-mongodb-uri" ./backups/20240115

# Verify data
mongo "your-mongodb-uri"
> db.products.countDocuments()
> db.orders.countDocuments()
```

### Code Backup (Git)

```bash
# Ensure all code is pushed to GitHub
git status
git push origin main

# Tag releases
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

---

## 📊 Performance Monitoring

### Real-Time Monitoring

#### 1. Google Analytics 4 Real-Time

- **URL**: https://analytics.google.com/
- **Check**:
  - Active users right now
  - Page views per minute
  - Event count
  - Conversions

#### 2. Sentry Performance Monitoring

- **URL**: https://sentry.io/
- **Check**:
  - Transaction throughput
  - P95 response time
  - Error rate
  - Apdex score

#### 3. Server Metrics (Railway/Render)

- **Metrics**:
  - CPU usage
  - Memory usage
  - Network I/O
  - Disk usage

**Alert Thresholds**:

- CPU > 80% for 5 minutes
- Memory > 90% for 5 minutes
- Disk > 90% used

#### 4. Database Metrics (MongoDB Atlas)

- **Metrics**:
  - Operations per second
  - Connections count
  - Query execution time
  - Disk usage

### Weekly Performance Report

Create weekly report with:

```
📊 Weekly Performance Report - Week of [Date]

1. Traffic Metrics
   - Total users: [number]
   - Page views: [number]
   - Sessions: [number]
   - Avg session duration: [time]

2. Performance Metrics
   - Avg page load time: [time]
   - Avg API response time: [time]
   - Error rate: [percentage]
   - Uptime: [percentage]

3. Business Metrics
   - Total orders: [number]
   - Revenue: [amount]
   - Conversion rate: [percentage]
   - Cart abandonment: [percentage]

4. Issues & Resolutions
   - [List any issues and how they were resolved]

5. Next Week Focus
   - [List priorities for next week]
```

---

## 🔒 Security Checklist

### Monthly Security Review

- [ ] **Dependency Audit**

  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **SSL Certificate**

  - Check expiration date (should auto-renew)
  - Verify HTTPS working on all pages

- [ ] **API Keys Rotation** (Every 3 months)

  - [ ] Stripe keys
  - [ ] Razorpay keys
  - [ ] Cloudinary keys
  - [ ] SendGrid/Email keys
  - [ ] JWT secret

- [ ] **Access Review**

  - [ ] Review admin users
  - [ ] Remove inactive accounts
  - [ ] Verify permissions

- [ ] **Log Review**

  - [ ] Check for failed login attempts
  - [ ] Review unusual API activity
  - [ ] Check for SQL injection attempts
  - [ ] Review file upload attempts

- [ ] **Backup Verification**

  - [ ] Database backups exist
  - [ ] Can restore from backup
  - [ ] Backup retention working

- [ ] **Security Headers**
  ```bash
  curl -I https://nexusmart.com | grep -i "security\|x-frame\|x-content"
  ```

### Security Incident Response

**If Security Breach Detected**:

1. **Immediate Actions** (Within 1 hour)

   - [ ] Isolate affected systems
   - [ ] Change all passwords and API keys
   - [ ] Review access logs
   - [ ] Notify team

2. **Assessment** (Within 4 hours)

   - [ ] Identify breach scope
   - [ ] Check for data exposure
   - [ ] Document timeline
   - [ ] Preserve evidence

3. **Containment** (Within 24 hours)

   - [ ] Patch vulnerability
   - [ ] Deploy security fix
   - [ ] Monitor for further attacks
   - [ ] Update security rules

4. **Recovery** (Within 48 hours)

   - [ ] Restore from clean backup if needed
   - [ ] Verify system integrity
   - [ ] Resume normal operations
   - [ ] Implement additional monitoring

5. **Post-Incident** (Within 1 week)
   - [ ] Conduct post-mortem
   - [ ] Update security procedures
   - [ ] Notify affected users (if required by law)
   - [ ] Document lessons learned

---

## 🚨 Emergency Procedures

### Site Down - Complete Outage

**Response Time**: Immediate

**Investigation**:

```bash
# 1. Check if site is reachable
curl -I https://nexusmart.com

# 2. Check backend API
curl https://api.nexusmart.com/api/health

# 3. Check hosting platform status
# Vercel: https://www.vercel-status.com/
# Railway: https://status.railway.app/
# Render: https://status.render.com/

# 4. Check MongoDB Atlas
# https://status.mongodb.com/
```

**Resolution Steps**:

1. Check hosting dashboard for alerts
2. Check recent deployments (may need rollback)
3. Check server logs for errors
4. Check database connectivity
5. If all else fails, restart services

**Communication**:

- Post status update to users
- Notify team on Slack/Discord
- Update social media if extended outage

---

### Database Corruption

**Response Time**: Within 30 minutes

**Investigation**:

```bash
# Check database integrity
mongo "your-uri" --eval "db.runCommand({dbStats: 1})"

# Check for locked collections
db.currentOp()
```

**Resolution**:

1. Stop writes to database
2. Restore from latest backup
3. Replay recent transactions if possible
4. Verify data integrity
5. Resume normal operations

---

### Payment System Down

**Response Time**: Within 15 minutes

**Investigation**:

1. Check Stripe/Razorpay status pages
2. Check webhook logs
3. Test payment in test mode
4. Check API key validity

**Temporary Solution**:

- Enable alternative payment method
- Show maintenance message for affected payment option
- Process manual payments if needed

**Resolution**:

1. Fix API integration
2. Verify webhooks working
3. Process queued payments
4. Notify affected customers

---

## 📝 Maintenance Log Template

Keep a maintenance log for accountability:

```markdown
# Maintenance Log

## [Date] - [Your Name]

### Tasks Completed

- [ ] Daily health check
- [ ] Sentry error review (X new errors)
- [ ] Analytics review (X users, Y% conversion)
- [ ] Payment system check (X transactions)
- [ ] Server resource check (CPU: X%, Memory: Y%)

### Issues Found

1. [Issue description]
   - Severity: Low/Medium/High/Critical
   - Resolution: [What was done]

### Actions Taken

- [List any deployments, fixes, updates]

### Follow-up Required

- [List any items that need attention]

### Notes

- [Any additional observations]
```

---

## 🎯 Key Performance Indicators (KPIs)

Monitor these daily/weekly:

### Technical KPIs

- **Uptime**: Target > 99.9%
- **Error Rate**: Target < 0.1%
- **Page Load Time**: Target < 2s
- **API Response Time**: Target < 200ms
- **Test Coverage**: Target > 70%

### Business KPIs

- **Conversion Rate**: Target > 2%
- **Cart Abandonment**: Target < 70%
- **Customer Satisfaction**: Target > 4.5/5
- **Return Rate**: Target < 5%

---

## 📞 Escalation Contacts

### Level 1 - Developer

- Handle routine maintenance
- Fix non-critical bugs
- Deploy minor updates

### Level 2 - Senior Developer

- Handle critical bugs
- Performance optimization
- Security issues

### Level 3 - DevOps/CTO

- Infrastructure issues
- Major outages
- Security breaches
- Disaster recovery

---

## ✅ Weekly Maintenance Checklist

Print and use this checklist:

```
Week of: ________________

Monday:
[ ] Health check
[ ] Error review (Sentry)
[ ] Analytics review (GA4)
[ ] Dependency audit
[ ] Performance test

Tuesday:
[ ] Health check
[ ] Error review
[ ] User feedback review
[ ] Content updates

Wednesday:
[ ] Health check
[ ] Error review
[ ] Database optimization
[ ] Backup verification

Thursday:
[ ] Health check
[ ] Error review
[ ] Test critical flows
[ ] Code quality review

Friday:
[ ] Health check
[ ] Error review
[ ] Weekly report
[ ] Next week planning

Saturday & Sunday:
[ ] Monitor alerts only
[ ] Emergency response if needed

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Remember**: Preventive maintenance is better than reactive fixes!

Regular maintenance keeps the platform running smoothly and users happy. 🚀
