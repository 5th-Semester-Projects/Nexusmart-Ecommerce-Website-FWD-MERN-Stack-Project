# 🚀 NexusMart Local Setup Guide (Urdu + English)

## ⚡ Quick Start (Sabse Pehle Ye Karen!)

### Prerequisites (Pehle Ye Install Hona Chahiye):

1. ✅ **Node.js** (v18 ya usse upar) - [Download](https://nodejs.org/)
2. ✅ **MongoDB** - Do tarike hain:
   - **Option A**: Local MongoDB install karen (Recommended for learning)
   - **Option B**: MongoDB Atlas (Cloud - Free) use karen
3. ✅ **Git** (already installed hoga)

---

## 📋 Step-by-Step Complete Setup

### STEP 1️⃣: Node.js Check Karein

PowerShell mein ye command run karein:

```powershell
node --version
npm --version
```

**Output aisa hona chahiye:**

```
v18.x.x (ya usse zyada)
9.x.x (ya usse zyada)
```

Agar error aaye toh Node.js install karein: https://nodejs.org/

---

### STEP 2️⃣: MongoDB Setup (2 Options)

#### **Option A: Local MongoDB (Recommended - Faster)**

1. **MongoDB Install karein**: https://www.mongodb.com/try/download/community
2. **MongoDB Service start karein**:
   ```powershell
   # Windows Service ke through automatically chal jayega
   # Ya manually:
   mongod
   ```
3. **Connection URI**: `mongodb://localhost:27017/nexusmart`

#### **Option B: MongoDB Atlas (Cloud - Free)**

1. Yahan account banayein: https://www.mongodb.com/cloud/atlas/register
2. Free M0 cluster create karein (512MB free)
3. Database User create karein (username/password)
4. Network Access mein apna IP allow karein (0.0.0.0/0 for testing)
5. Connection string copy karein, aisa dikhega:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nexusmart?retryWrites=true&w=majority
   ```

---

### STEP 3️⃣: Project Dependencies Install Karein

Project folder mein jaayen aur ye command run karein:

```powershell
cd "e:\4th semester tasks\Full-Stack-Labs\Project\mern-ecommerce"

# Sab dependencies ek sath install ho jayengi (5-10 minutes)
npm run install-all
```

**Ye command kya karega:**

- ✅ Root folder ki dependencies install karega (concurrently)
- ✅ Backend (`server/`) ki **50+ packages** install karega
- ✅ Frontend (`client/`) ki **80+ packages** install karega

**Wait karein** - Pehli baar 5-10 minutes lag sakte hain!

---

### STEP 4️⃣: Environment Variables Setup (Sabse Important!)

#### **Backend Configuration (server/.env)**

1. File banayein:

   ```powershell
   cd server
   Copy-Item .env.example .env
   ```

2. `.env` file open karein aur **minimum required values** update karein:

```bash
# ✅ Basic Configuration (MUST HAVE)
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# ✅ Database (Option A: Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/nexusmart

# Ya (Option B: MongoDB Atlas)
# MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/nexusmart?retryWrites=true&w=majority

# ✅ JWT Secrets (Koi bhi strong password dalein)
JWT_SECRET=mySecretKey123456789
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=myRefreshSecret987654321
JWT_REFRESH_EXPIRE=30d

# ⚠️ Optional (Baad mein setup kar sakte hain)
# Cloudinary (image upload ke liye - skip for now)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=

# Stripe (payment ke liye - skip for now)
# STRIPE_SECRET_KEY=
# STRIPE_PUBLISHABLE_KEY=

# Email (reset password ke liye - skip for now)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SERVICE=gmail
# SMTP_MAIL=your_email@gmail.com
# SMTP_PASSWORD=your_app_password
```

#### **Frontend Configuration (client/.env)**

1. File banayein:

   ```powershell
   cd ../client
   Copy-Item .env.example .env
   ```

2. `.env` file open karein:

```bash
# ✅ Backend API URL
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# ✅ App Configuration
VITE_APP_NAME=NexusMart
VITE_APP_DESCRIPTION=AI + AR Powered Ecommerce Platform

# ✅ Features Enable/Disable
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_AR_FEATURES=true
VITE_ENABLE_VOICE_SEARCH=false

# ⚠️ Optional (Baad mein)
# VITE_STRIPE_PUBLISHABLE_KEY=
# VITE_RAZORPAY_KEY_ID=
# VITE_GOOGLE_MAPS_API_KEY=
```

---

### STEP 5️⃣: Database Seed (Optional - Test Data)

Agar aap test products aur users chahte hain:

```powershell
cd ../server
node scripts/seedDatabase.js
```

**Ye kya karega:**

- ✅ Sample admin user create karega
- ✅ Sample products add karega
- ✅ Categories setup karega

---

### STEP 6️⃣: Run the Project! 🎉

#### **Option A: Dono (Backend + Frontend) Ek Sath Run Karein (Recommended)**

```powershell
cd "e:\4th semester tasks\Full-Stack-Labs\Project\mern-ecommerce"
npm run dev
```

**Terminal mein aisa dikhega:**

```
[server] Server running on http://localhost:5000
[server] MongoDB Connected Successfully
[client] VITE ready in XXXms
[client] Local: http://localhost:5173
```

#### **Option B: Backend Aur Frontend Alag-Alag Run Karein**

**Terminal 1 (Backend):**

```powershell
cd "e:\4th semester tasks\Full-Stack-Labs\Project\mern-ecommerce\server"
npm run dev
```

**Terminal 2 (Frontend):**

```powershell
cd "e:\4th semester tasks\Full-Stack-Labs\Project\mern-ecommerce\client"
npm run dev
```

---

### STEP 7️⃣: Browser Mein Check Karein! 🌐

1. **Frontend** dekhen: http://localhost:5173
2. **Backend API** check karein: http://localhost:5000/api/health

**Success! ✅** Aapka project chal raha hai!

---

## 🎯 Basic Features Test Karein (Bina Payment Setup Ke)

### 1. **User Registration & Login**

- Homepage par jaayein
- "Sign Up" button click karein
- Email aur password se account banayein
- Login karein

### 2. **Browse Products**

- Products page dekhen
- Categories filter karein
- Search karein

### 3. **Add to Cart**

- Koi product select karein
- "Add to Cart" click karein
- Cart icon mein products dekhen

### 4. **Checkout (Bina Payment Ke)**

- Cart se "Checkout" pe jaayen
- Shipping address fill karein
- Payment method: **"Cash on Delivery (COD)"** select karein
- Order place karein ✅

### 5. **Admin Panel (Agar Admin Account Hai)**

- Login as admin
- Navigate to `/admin/dashboard`
- Products, orders, users manage karein

---

## 🔧 Troubleshooting (Agar Koi Error Aaye)

### ❌ "Cannot connect to MongoDB"

**Solution:**

- Check if MongoDB service is running
- Check `MONGODB_URI` in `server/.env`
- Local MongoDB: `mongodb://localhost:27017/nexusmart`
- Atlas: Connection string correct hai?

### ❌ "Port 5000 is already in use"

**Solution:**

```powershell
# Port change karein server/.env mein
PORT=5001
```

### ❌ "CORS Error" ya "Network Error"

**Solution:**

- Check if backend chal raha hai (http://localhost:5000)
- Check `CLIENT_URL` in `server/.env`: `http://localhost:5173`
- Check `VITE_API_URL` in `client/.env`: `http://localhost:5000/api`

### ❌ "Module not found" Error

**Solution:**

```powershell
# Dependencies dobara install karein
npm run install-all
```

### ❌ Frontend blank/white screen

**Solution:**

```powershell
cd client
npm install
npm run dev
```

### ❌ MongoDB Atlas Connection Timeout

**Solution:**

- Network Access mein `0.0.0.0/0` allow karein
- Username/Password correct check karein
- Cluster running hai check karein

---

## 📦 Kya-Kya Mil Jayega (Without External APIs)

### ✅ Working Features (Bina Kisi Setup Ke):

- ✅ User Registration & Login (JWT)
- ✅ Product Browsing & Search
- ✅ Shopping Cart
- ✅ Wishlist
- ✅ Product Reviews & Ratings
- ✅ Order Management
- ✅ User Profile
- ✅ Admin Dashboard (Products, Orders, Users)
- ✅ Cash on Delivery (COD) Payment
- ✅ Real-time Order Status (Socket.io)

### ⚠️ Features Jo External APIs Chahiye (Setup Baad Mein):

- Payment Gateway (Stripe/Razorpay) - Test mode available
- Image Upload (Cloudinary)
- Email Notifications (Gmail SMTP)
- SMS (Twilio)
- Google OAuth Login
- AR Features (WebXR - browser support chahiye)
- AI Features (Optional APIs)

---

## 🚀 Next Steps (Baad Mein Setup Kar Sakte Hain)

### 1. **Stripe Payment Setup (Test Mode - Free)**

- Create account: https://dashboard.stripe.com/register
- Get test keys: https://dashboard.stripe.com/test/apikeys
- Add to `server/.env` aur `client/.env`

### 2. **Cloudinary Image Upload**

- Create account: https://cloudinary.com/users/register/free
- Get credentials: Dashboard → Account Details
- Add to `server/.env`

### 3. **Email Setup (Gmail)**

- Gmail → Settings → Security → 2-Step Verification
- App Password generate karein
- Add to `server/.env`

### 4. **Google OAuth (Optional)**

- Google Cloud Console: https://console.cloud.google.com/
- Create project → Enable Google+ API
- OAuth 2.0 credentials create karein
- Add to `server/.env`

---

## 📊 Project Structure

```
mern-ecommerce/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Configuration files
│   ├── controllers/       # 9 Controllers
│   ├── models/            # 7 MongoDB Models
│   ├── routes/            # 10 API Routes
│   ├── middleware/        # Auth, Error handling
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   ├── socket/            # Real-time Socket.io
│   └── server.js          # Entry point
│
├── client/                # Frontend (React + Vite)
│   ├── public/            # Static files + PWA
│   ├── src/
│   │   ├── components/    # 80+ React Components
│   │   ├── pages/         # 9 Pages
│   │   ├── redux/         # State Management
│   │   ├── hooks/         # Custom Hooks
│   │   ├── utils/         # Helpers
│   │   └── styles/        # Tailwind CSS
│   └── index.html
│
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── package.json           # Root package
```

---

## 🎓 Learning Path (Step by Step)

### Week 1: Basic Setup ✅

- ✅ Install Node.js, MongoDB
- ✅ Run project locally
- ✅ Understand file structure

### Week 2: Core Features

- User authentication
- Product management
- Shopping cart

### Week 3: Advanced Features

- Payment integration
- Real-time features
- Admin dashboard

### Week 4: Deployment

- Deploy to Vercel (Frontend)
- Deploy to Railway (Backend)
- Production setup

---

## 💡 Pro Tips

1. **Start Simple**: Pehle basic features (products, cart, orders) test karein
2. **No Payment Needed**: COD se order test kar sakte hain
3. **Test Data**: `seedDatabase.js` script use karein
4. **Two Terminals**: Backend aur frontend alag run karein
5. **Console Check**: Browser console aur terminal errors dekhen
6. **MongoDB Compass**: GUI se database dekhen (optional)

---

## 📞 Common Commands

```powershell
# Install all dependencies
npm run install-all

# Run both (backend + frontend)
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

---

## 🎉 Success Checklist

- [ ] Node.js installed (v18+)
- [ ] MongoDB running (local ya Atlas)
- [ ] Dependencies installed (`npm run install-all`)
- [ ] `.env` files created (server & client)
- [ ] MongoDB connection working
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] Can register/login
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can place order (COD)

---

## 🆘 Need Help?

1. Check `docs/` folder for detailed documentation
2. Read `QUICK-START.md` for setup details
3. Check `TROUBLESHOOTING.md` for common issues
4. Review `ARCHITECTURE.md` for system design

---

## 🌟 Project Highlights

- ✅ **15,000+ lines** of production code
- ✅ **80+ components** (React)
- ✅ **40+ API endpoints** (REST)
- ✅ **7 database models** (MongoDB)
- ✅ **80+ tests** (70%+ coverage)
- ✅ **92 Lighthouse score** (Performance)
- ✅ **PWA ready** (Installable)
- ✅ **Real-time** (Socket.io)
- ✅ **AI/ML features** (Optional)
- ✅ **AR/3D viewer** (WebXR)
- ✅ **Web3 ready** (Blockchain)

---

## 🎯 Final Notes

**Ye project COMPLETE hai aur LOCAL mein run hoga!**

- Minimum setup: Node.js + MongoDB + Environment variables
- External APIs optional hain (baad mein add kar sakte hain)
- COD payment se orders test kar sakte hain
- Admin panel se sab manage kar sakte hain

**Happy Coding! 🚀**

---

**Last Updated**: November 13, 2025  
**Version**: 1.0.0  
**Status**: ✅ PRODUCTION READY
