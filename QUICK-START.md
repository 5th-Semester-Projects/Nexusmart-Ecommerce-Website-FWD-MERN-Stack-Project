# 🚀 NexusMart - Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git
- npm or yarn
- Code editor (VS Code recommended)

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/nexusmart.git
cd nexusmart
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/nexusmart
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/nexusmart

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=30d

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (NodeMailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client URL
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**

```env
# API
VITE_API_URL=http://localhost:5000

# Payment Keys (Public)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_RAZORPAY_KEY_ID=rzp_test_...

# Analytics (Optional for development)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### 4. Seed Database (Optional)

```bash
# In server directory
npm run seed

# Or manually create admin user
npm run create-admin
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health**: http://localhost:5000/api/health

---

## 🧪 Running Tests

### Frontend Tests

```bash
cd client

# Unit & Integration Tests
npm test                  # Run once with coverage
npm run test:watch        # Watch mode

# E2E Tests
npm run test:e2e          # Interactive mode
npm run test:e2e:headless # Headless mode

# Linting
npm run lint

# Code Formatting
npm run format
```

### Backend Tests

```bash
cd server

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 🏗️ Building for Production

### Frontend Build

```bash
cd client
npm run build

# Preview production build
npm run preview
```

### Backend Build

Backend doesn't require a build step, but ensure:

```bash
cd server
npm install --production
NODE_ENV=production npm start
```

---

## 📊 Performance Analysis

### Bundle Analysis

```bash
cd client
npm run analyze
# Opens bundle visualizer in browser
```

### Lighthouse Audit

```bash
cd client
npm run build
npm run preview

# In another terminal
npm run lighthouse
# Opens Lighthouse report in browser
```

---

## 🛠️ Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- MongoDB for VS Code
- GitLens

### Browser Extensions

- React Developer Tools
- Redux DevTools
- Lighthouse
- JSON Viewer

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (Backend)
npx kill-port 5000

# Kill process on port 5173 (Frontend)
npx kill-port 5173
```

### MongoDB Connection Issues

1. Check if MongoDB is running:

   ```bash
   # macOS/Linux
   sudo systemctl status mongod

   # Windows
   net start MongoDB
   ```

2. Verify connection string in `.env`
3. Check MongoDB Atlas IP whitelist (if using Atlas)

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Vite Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### CORS Errors

Ensure `CLIENT_URL` in backend `.env` matches frontend URL:

```env
CLIENT_URL=http://localhost:5173
```

---

## 📱 Testing Features

### 1. User Registration & Login

```
Email: test@example.com
Password: Test123!
```

### 2. Admin Access

```
Email: admin@nexusmart.com
Password: Admin123!
```

### 3. Test Payment Cards (Stripe)

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### 4. Test Crypto Wallet (MetaMask)

1. Install MetaMask browser extension
2. Create or import test wallet
3. Switch to Sepolia testnet
4. Get test ETH from faucet: https://sepoliafaucet.com

### 5. AR Try-On

Requires:

- HTTPS (use ngrok for local testing)
- WebXR compatible device (Android Chrome, iOS Safari 13+)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 5173
```

---

## 🔐 Security Best Practices

### Before Deploying

1. **Change all default credentials**
2. **Use strong JWT secret** (32+ characters)
3. **Enable rate limiting**
4. **Update CORS settings**
5. **Use HTTPS** in production
6. **Set secure cookies** (httpOnly, secure, sameSite)
7. **Sanitize user inputs**
8. **Keep dependencies updated**

---

## 📚 Additional Resources

### Documentation

- [React Docs](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Three.js](https://threejs.org/docs)

### Project Docs

- `docs/PWA-IMPLEMENTATION.md` - PWA setup guide
- `docs/TESTING-OPTIMIZATION.md` - Testing strategies
- `docs/DEPLOYMENT.md` - Production deployment

### API Documentation

- Backend API: http://localhost:5000/api-docs (if Swagger configured)
- Or see `server/routes/` for endpoint details

---

## 💡 Tips & Tricks

### Quick Commands

```bash
# Install all dependencies (root, server, client)
npm run install-all

# Run both frontend and backend concurrently
npm run dev

# Run all tests
npm run test-all

# Format all code
npm run format-all

# Check for updates
npm outdated

# Update dependencies
npm update
```

### Hot Reloading

Both frontend and backend support hot reloading:

- **Frontend**: Vite HMR (instant updates)
- **Backend**: Nodemon (auto-restart on file changes)

### Database Management

```bash
# Backup database
mongodump --db nexusmart --out ./backup

# Restore database
mongorestore --db nexusmart ./backup/nexusmart

# Clear collections
npm run db:clear

# Seed test data
npm run db:seed
```

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Start backend server
4. ✅ Start frontend app
5. ✅ Create admin account
6. ✅ Test features
7. ✅ Run tests
8. ✅ Review documentation
9. ✅ Customize for your needs
10. ✅ Deploy to production (see DEPLOYMENT.md)

---

## 🆘 Getting Help

### Common Issues

1. **"Module not found"** → Run `npm install`
2. **"Port already in use"** → Use `npx kill-port [PORT]`
3. **"MongoDB connection failed"** → Check MongoDB service
4. **"CORS error"** → Verify `CLIENT_URL` in backend .env
5. **"Build failed"** → Clear node_modules and reinstall

### Support Channels

- 📧 Email: support@nexusmart.com
- 💬 Discord: https://discord.gg/nexusmart
- 🐛 Issues: https://github.com/yourusername/nexusmart/issues
- 📖 Docs: https://docs.nexusmart.com

---

## ✨ Happy Coding!

You're now ready to run NexusMart locally and start developing!

**Key Files to Explore:**

- `client/src/App.jsx` - Main React app
- `client/src/pages/` - All page components
- `server/server.js` - Express server entry point
- `server/routes/` - API endpoints
- `server/controllers/` - Business logic

**Start your development journey!** 🚀
