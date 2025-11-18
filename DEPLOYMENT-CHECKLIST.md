# 🚀 NexusMart Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality

- [ ] All tests passing (`npm test` in client/ and server/)
- [ ] No console errors in browser
- [ ] No ESLint warnings
- [ ] All TypeScript/PropTypes defined
- [ ] Code reviewed and approved
- [ ] Git repository up to date

### ✅ Environment Variables

#### Backend (.env)

- [ ] `MONGODB_URI` - Production MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random string (32+ characters)
- [ ] `JWT_EXPIRE` - Token expiration (e.g., "7d")
- [ ] `STRIPE_SECRET_KEY` - Live Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- [ ] `RAZORPAY_KEY_ID` - Live Razorpay key
- [ ] `RAZORPAY_KEY_SECRET` - Live Razorpay secret
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret
- [ ] `EMAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- [ ] `EMAIL_PORT` - SMTP port (587 for TLS)
- [ ] `EMAIL_USER` - Email account username
- [ ] `EMAIL_PASS` - Email account password/app password
- [ ] `FRONTEND_URL` - Production frontend URL
- [ ] `NODE_ENV` - Set to "production"
- [ ] `REDIS_URL` - Redis connection string (optional)
- [ ] `SENTRY_DSN` - Sentry backend DSN (optional)
- [ ] `WEB3_INFURA_KEY` - Infura API key for blockchain
- [ ] `ADMIN_EMAIL` - Admin notification email

#### Frontend (.env)

- [ ] `VITE_API_URL` - Production backend API URL
- [ ] `VITE_SOCKET_URL` - Production socket.io URL
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Live Stripe publishable key
- [ ] `VITE_RAZORPAY_KEY_ID` - Live Razorpay key ID
- [ ] `VITE_GOOGLE_ANALYTICS_ID` - GA4 Measurement ID
- [ ] `VITE_SENTRY_DSN` - Sentry frontend DSN
- [ ] `VITE_ENVIRONMENT` - Set to "production"
- [ ] `VITE_APP_NAME` - "NexusMart"
- [ ] `VITE_APP_URL` - Production domain

### ✅ Database Setup

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0 for cloud deployment)
- [ ] Database indexes created (run `node scripts/createIndexes.js`)
- [ ] Seed data loaded if needed
- [ ] Backup strategy configured
- [ ] Connection pooling configured

### ✅ Third-Party Services

#### Stripe Setup

- [ ] Live mode activated
- [ ] Webhook endpoint configured (https://api.nexusmart.com/api/payments/stripe/webhook)
- [ ] Webhook signing secret obtained
- [ ] Payment methods enabled (card, wallet)
- [ ] Test payment in production mode

#### Razorpay Setup

- [ ] Live mode activated
- [ ] Webhook configured
- [ ] Payment methods enabled
- [ ] KYC verification completed

#### Cloudinary Setup

- [ ] Upload presets configured
- [ ] Folder structure created
- [ ] Auto-format and quality optimization enabled
- [ ] CDN enabled

#### Email Service (Gmail/SendGrid/Mailgun)

- [ ] SMTP credentials obtained
- [ ] App password created (for Gmail)
- [ ] Email templates tested
- [ ] SPF/DKIM records configured

#### Sentry Setup

- [ ] Frontend project created
- [ ] Backend project created
- [ ] DSN keys obtained
- [ ] Source maps configured
- [ ] Alert rules configured

#### Google Analytics

- [ ] GA4 property created
- [ ] Measurement ID obtained
- [ ] Goals/conversions configured
- [ ] E-commerce tracking enabled

---

## Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy from Client Directory

```bash
cd client
vercel
```

### Step 4: Configure Project

- [ ] Select scope (personal/team)
- [ ] Link to existing project or create new
- [ ] Set project name: `nexusmart-frontend`

### Step 5: Set Environment Variables

```bash
# In Vercel dashboard: Settings > Environment Variables
# Add all VITE_* variables for Production environment
```

### Step 6: Deploy to Production

```bash
vercel --prod
```

### Step 7: Custom Domain

- [ ] Add domain in Vercel dashboard
- [ ] Configure DNS records:
  - A record: `@` → Vercel IP (76.76.21.21)
  - CNAME: `www` → cname.vercel-dns.com
- [ ] Wait for SSL certificate (automatic)
- [ ] Verify HTTPS working

### Step 8: Verify Deployment

- [ ] Visit production URL
- [ ] Test main features
- [ ] Check browser console for errors
- [ ] Verify service worker registration
- [ ] Test PWA installation
- [ ] Check Lighthouse scores

---

## Backend Deployment (Railway)

### Step 1: Create Railway Account

- Visit https://railway.app
- Sign up with GitHub

### Step 2: Create New Project

- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Select `server/` as root directory

### Step 3: Configure Environment Variables

```bash
# In Railway dashboard: Variables tab
# Add all backend environment variables
```

### Step 4: Configure Build Settings

- [ ] Build command: Auto-detected (npm install)
- [ ] Start command: npm start
- [ ] Port: Auto-detected from process.env.PORT

### Step 5: Deploy

- [ ] Railway auto-deploys on detection
- [ ] Monitor deployment logs
- [ ] Wait for "Deployed" status

### Step 6: Get Production URL

- [ ] Copy Railway-generated URL (e.g., nexusmart-api-production.up.railway.app)
- [ ] Update frontend `VITE_API_URL` in Vercel

### Step 7: Configure Custom Domain (Optional)

- [ ] Add custom domain in Railway settings
- [ ] Configure DNS CNAME record
- [ ] Wait for SSL certificate

### Step 8: Verify Deployment

- [ ] Visit https://your-api-url.railway.app/api/health
- [ ] Test API endpoints
- [ ] Check database connection
- [ ] Verify file uploads
- [ ] Test payment webhooks

---

## Alternative Backend Deployment (Render)

### If using Render instead of Railway:

1. **Create Render Account**: https://render.com
2. **Create Web Service**: Dashboard > New > Web Service
3. **Connect Repository**: Authorize GitHub, select repo
4. **Configure Service**:
   - Name: `nexusmart-api`
   - Environment: Node
   - Region: Oregon (US West)
   - Branch: main
   - Root Directory: server
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**: Environment tab
6. **Deploy**: Render auto-deploys
7. **Get URL**: Copy from dashboard

---

## CI/CD Pipeline (GitHub Actions)

### Step 1: Add GitHub Secrets

Navigate to: Repository Settings > Secrets and variables > Actions

Add the following secrets:

- [ ] `VERCEL_TOKEN` - From Vercel Account Settings > Tokens
- [ ] `VERCEL_ORG_ID` - From Vercel Project Settings > General
- [ ] `VERCEL_PROJECT_ID` - From Vercel Project Settings > General
- [ ] `RAILWAY_TOKEN` - From Railway Account Settings > Tokens

### Step 2: Enable Actions

- [ ] Go to repository Actions tab
- [ ] Enable workflows if prompted
- [ ] Workflow file: `.github/workflows/deploy.yml`

### Step 3: Test Pipeline

- [ ] Make a commit to main branch
- [ ] Push to GitHub
- [ ] Monitor Actions tab
- [ ] Verify all jobs pass:
  - ✅ Test
  - ✅ Build Frontend
  - ✅ Deploy Frontend
  - ✅ Build Backend
  - ✅ Deploy Backend

### Step 4: Branch Protection (Recommended)

- [ ] Settings > Branches > Add rule
- [ ] Require status checks before merging
- [ ] Require branches to be up to date
- [ ] Require review from 1 person

---

## Monitoring & Analytics Setup

### Sentry Error Tracking

1. **Create Projects**:

   - Frontend: React project
   - Backend: Node.js project

2. **Get DSN Keys**:

   - Frontend DSN → `VITE_SENTRY_DSN`
   - Backend DSN → `SENTRY_DSN`

3. **Configure Alerts**:

   - [ ] Set up email notifications
   - [ ] Configure Slack integration (optional)
   - [ ] Define alert rules (error threshold, new issues)

4. **Test Error Tracking**:
   - [ ] Trigger test error in frontend
   - [ ] Trigger test error in backend
   - [ ] Verify errors appear in Sentry dashboard

### Google Analytics Setup

1. **Create GA4 Property**:

   - Go to Google Analytics Admin
   - Create new property
   - Get Measurement ID (G-XXXXXXXXXX)

2. **Configure E-commerce**:

   - [ ] Enable enhanced measurement
   - [ ] Set up conversion events:
     - purchase
     - add_to_cart
     - begin_checkout
     - sign_up

3. **Test Tracking**:
   - [ ] Verify pageviews in Realtime report
   - [ ] Test e-commerce events
   - [ ] Check conversion tracking

---

## SEO Configuration

### Step 1: Generate Sitemap

```bash
cd mern-ecommerce
node scripts/generateSitemap.js
```

### Step 2: Verify Files

- [ ] `client/public/sitemap.xml` exists
- [ ] `client/public/robots.txt` exists
- [ ] Both files accessible at:
  - https://nexusmart.com/sitemap.xml
  - https://nexusmart.com/robots.txt

### Step 3: Submit to Search Engines

- [ ] Google Search Console:
  - Verify property
  - Submit sitemap
  - Request indexing for homepage
- [ ] Bing Webmaster Tools:
  - Verify property
  - Submit sitemap

### Step 4: Verify Meta Tags

- [ ] Use https://metatags.io to preview
- [ ] Check Open Graph tags
- [ ] Verify Twitter Cards
- [ ] Test structured data: https://search.google.com/test/rich-results

---

## Security Checklist

### Backend Security

- [ ] CORS configured with production origin only
- [ ] Rate limiting enabled (express-rate-limit)
- [ ] Helmet.js middleware active
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (sanitize inputs)
- [ ] CSRF protection for state-changing operations
- [ ] JWT secret is strong and secure
- [ ] Passwords hashed with bcrypt (10+ rounds)
- [ ] File upload validation (size, type, content)
- [ ] API keys stored in environment variables only
- [ ] Database credentials secured
- [ ] HTTPS enforced

### Frontend Security

- [ ] Content Security Policy headers
- [ ] X-Frame-Options header (prevent clickjacking)
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy configured
- [ ] No sensitive data in localStorage
- [ ] HTTPS enforced
- [ ] Subresource Integrity for CDN scripts
- [ ] No API keys exposed in client code

### Infrastructure Security

- [ ] Database backups enabled
- [ ] Database access restricted (IP whitelist)
- [ ] SSH keys for server access only (no passwords)
- [ ] Firewall configured
- [ ] Regular security updates scheduled
- [ ] DDoS protection enabled (Cloudflare)
- [ ] Regular security audits scheduled

---

## Performance Optimization

### Frontend

- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Image optimization (WebP format)
- [ ] Service worker caching
- [ ] Bundle size optimized (<1MB total)
- [ ] CDN for static assets
- [ ] Gzip/Brotli compression
- [ ] Critical CSS inlined
- [ ] Fonts optimized (subset, woff2)

### Backend

- [ ] Database indexes created
- [ ] Query optimization
- [ ] Caching layer (Redis)
- [ ] Connection pooling
- [ ] Compression middleware
- [ ] Static file serving via CDN
- [ ] API response pagination

### Lighthouse Targets

- [ ] Performance: 90+
- [ ] Accessibility: 90+
- [ ] Best Practices: 90+
- [ ] SEO: 90+
- [ ] PWA: Installable

---

## Load Testing

### Tools

- Apache JMeter
- k6.io
- Artillery

### Test Scenarios

- [ ] 100 concurrent users browsing products
- [ ] 50 users adding to cart simultaneously
- [ ] 25 users completing checkout
- [ ] API endpoint stress test (1000 req/sec)
- [ ] Database query performance
- [ ] File upload stress test

### Performance Targets

- [ ] Response time < 200ms (90th percentile)
- [ ] Uptime > 99.9%
- [ ] Error rate < 0.1%
- [ ] Database query time < 100ms

---

## Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor error rates in Sentry
- [ ] Watch real-time analytics in GA4
- [ ] Check server resource usage (CPU, memory)
- [ ] Monitor database performance
- [ ] Watch for payment failures
- [ ] Check email delivery
- [ ] Monitor API response times

### First Week

- [ ] Review error trends
- [ ] Analyze user behavior flow
- [ ] Check conversion rates
- [ ] Review payment success rates
- [ ] Monitor page load times
- [ ] Check for broken links
- [ ] Review user feedback

### Ongoing Monitoring

- [ ] Daily: Check Sentry for new errors
- [ ] Daily: Review GA4 realtime reports
- [ ] Weekly: Analyze user behavior
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Database optimization
- [ ] Monthly: Security audit
- [ ] Monthly: Dependency updates

---

## Rollback Plan

### If Critical Issues Arise

1. **Immediate Actions**:

   ```bash
   # Revert to previous deployment
   vercel rollback  # Frontend
   # In Railway: Dashboard > Deployments > Previous > Redeploy
   ```

2. **Communication**:

   - [ ] Post status page update
   - [ ] Notify users via email/social media
   - [ ] Update support team

3. **Investigation**:

   - [ ] Check Sentry for error details
   - [ ] Review deployment logs
   - [ ] Analyze database queries
   - [ ] Check third-party service status

4. **Fix and Redeploy**:
   - [ ] Create hotfix branch
   - [ ] Fix critical issue
   - [ ] Test thoroughly
   - [ ] Deploy fix
   - [ ] Monitor closely

---

## Launch Announcement

### Pre-Launch

- [ ] Prepare social media posts
- [ ] Write blog post announcement
- [ ] Update landing page
- [ ] Notify email subscribers
- [ ] Prepare press release

### Launch Day

- [ ] Monitor all systems
- [ ] Respond to user feedback
- [ ] Track analytics closely
- [ ] Be ready for support requests
- [ ] Celebrate! 🎉

---

## Support & Maintenance

### Documentation

- [ ] API documentation (Swagger/Postman)
- [ ] User guide
- [ ] Admin manual
- [ ] Developer setup guide (QUICK-START.md)
- [ ] Troubleshooting guide

### Support Channels

- [ ] Email support configured
- [ ] Live chat (optional)
- [ ] FAQ page
- [ ] Help center/Knowledge base
- [ ] Social media monitoring

### Regular Maintenance

- [ ] Weekly dependency updates
- [ ] Monthly security patches
- [ ] Quarterly feature releases
- [ ] Regular database backups
- [ ] Performance optimization reviews

---

## Success Metrics

### Technical KPIs

- Uptime: > 99.9%
- Response time: < 200ms
- Error rate: < 0.1%
- Lighthouse scores: 90+

### Business KPIs

- Conversion rate: Track and optimize
- Cart abandonment rate: < 70%
- Page load time: < 2 seconds
- User satisfaction: > 4.5/5

---

## 🎯 Final Go-Live Checklist

- [ ] All environment variables set
- [ ] Database configured and connected
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] Custom domain configured with SSL
- [ ] CI/CD pipeline working
- [ ] Monitoring tools configured
- [ ] Analytics tracking verified
- [ ] SEO sitemap submitted
- [ ] Security measures implemented
- [ ] Performance optimized
- [ ] Load testing completed
- [ ] Rollback plan documented
- [ ] Support channels ready
- [ ] Team trained and prepared

---

## 📞 Emergency Contacts

- **DevOps Lead**: [Name] - [Email] - [Phone]
- **Backend Developer**: [Name] - [Email] - [Phone]
- **Frontend Developer**: [Name] - [Email] - [Phone]
- **Database Admin**: [Name] - [Email] - [Phone]
- **Hosting Support**:
  - Vercel: https://vercel.com/support
  - Railway: https://railway.app/help
- **Third-Party Services**:
  - Stripe Support: https://support.stripe.com
  - MongoDB Atlas: https://support.mongodb.com

---

**Remember**: Take your time with each step. It's better to deploy methodically than to rush and face issues. Good luck with your launch! 🚀
