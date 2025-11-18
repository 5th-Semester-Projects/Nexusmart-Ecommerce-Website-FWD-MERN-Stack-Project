# Deployment Guide - NexusMart

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account
- Stripe/Razorpay accounts (for payments)
- Email service (Gmail/SendGrid)

## Environment Variables

### Server (.env)

Create `server/.env` file with:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=30d
COOKIE_EXPIRE=7

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

CLIENT_URL=https://your-frontend-domain.com
```

### Client (.env)

Create `client/.env` file with:

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### Backend on Render:

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - Name: nexusmart-api
   - Environment: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
6. Add all environment variables from Server .env
7. Click "Create Web Service"

#### Frontend on Vercel:

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables from Client .env
7. Click "Deploy"

### Option 2: AWS (Full Stack)

#### Backend on AWS Elastic Beanstalk:

```bash
cd server
eb init -p node.js nexusmart-api
eb create nexusmart-api-env
eb setenv NODE_ENV=production MONGODB_URI=... [all other env vars]
eb deploy
```

#### Frontend on AWS S3 + CloudFront:

```bash
cd client
npm run build
aws s3 sync dist/ s3://nexusmart-frontend
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 3: Heroku (Both)

#### Backend:

```bash
cd server
heroku create nexusmart-api
heroku config:set NODE_ENV=production MONGODB_URI=...
git push heroku main
```

#### Frontend:

```bash
cd client
heroku create nexusmart-frontend
heroku buildpacks:set mars/create-react-app
git push heroku main
```

## Database Setup (MongoDB Atlas)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Create database user with password
4. Whitelist IP addresses (0.0.0.0/0 for public access)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Use this as `MONGODB_URI`

## Post-Deployment Checklist

- [ ] Set all environment variables correctly
- [ ] Configure CORS to allow frontend domain
- [ ] Set up MongoDB indexes (automatic on first startup)
- [ ] Test authentication flow (register, login, 2FA)
- [ ] Test payment integration (use test keys first)
- [ ] Set up email service (verify SMTP settings)
- [ ] Configure Cloudinary for file uploads
- [ ] Set up SSL certificates (automatic on Vercel/Render)
- [ ] Test all API endpoints
- [ ] Monitor error logs
- [ ] Set up backup strategy for database

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Monitoring & Maintenance

- Use [Render Logs](https://dashboard.render.com/) or CloudWatch for backend
- Set up [Sentry](https://sentry.io/) for error tracking
- Monitor MongoDB Atlas metrics
- Set up [UptimeRobot](https://uptimerobot.com/) for uptime monitoring
- Regular database backups (Atlas automated backups)
- Review security alerts and update dependencies monthly

## Performance Optimization

- Enable compression middleware (already configured)
- Use CDN for static assets (Cloudinary)
- Implement Redis caching for frequently accessed data
- Optimize images and 3D models before upload
- Use pagination for all list endpoints
- Implement database indexing (already configured)

## Troubleshooting

### CORS Errors

- Check CLIENT_URL in backend .env matches frontend domain exactly
- Ensure cookies work with sameSite: 'none' and secure: true in production

### Database Connection Issues

- Verify MongoDB Atlas IP whitelist includes deployment server
- Check connection string format and password encoding

### File Upload Errors

- Verify Cloudinary credentials
- Check file size limits in middleware

### Email Not Sending

- For Gmail: Enable "Less secure app access" or use App Password
- Verify SMTP settings and credentials

## Support

For issues, contact: support@nexusmart.com
