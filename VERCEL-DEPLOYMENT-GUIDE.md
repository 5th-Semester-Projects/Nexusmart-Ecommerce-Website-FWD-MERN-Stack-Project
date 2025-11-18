# 🚀 Complete Deployment Guide - Vercel + Railway

## Overview

Aapko **2 parts** deploy karne hain:

1. **Frontend (React)** → Vercel pe
2. **Backend (Express API)** → Railway pe

Kyunki Vercel pe full-stack Node.js properly nahi chalta, isliye backend alag host karna padega.

---

## Part 1: Backend Deploy (Railway) 🚂

### Step 1: Railway Account Setup

1. Visit: https://railway.app/
2. **Sign in with GitHub** (same account jisme nexusmart-ecommerce repo hai)
3. Railway automatically aapki GitHub repositories dekh lega

### Step 2: New Project Banao

1. Dashboard pe **"New Project"** button click karo
2. **"Deploy from GitHub repo"** select karo
3. Repository list mein se **"nexusmart-ecommerce"** select karo
4. Railway automatic detect karega Node.js project

### Step 3: Root Directory Configure Karo

**IMPORTANT**: Railway ko batana hoga ke server folder mein code hai

1. Project settings mein jao
2. **"Root Directory"** setting find karo
3. Value set karo: `server`
4. **"Watch Paths"** set karo: `server/**`

### Step 4: Environment Variables Add Karo

Railway dashboard mein "Variables" tab pe jao:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://nexusmart-admin:cZfFthnSKtsCnlJB@nexusmart-cluster.46lpntt.mongodb.net/nexusmart?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Cloudinary (agar images upload kar rahe ho)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (agar email send kar rahe ho)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Stripe/Payment (agar payment gateway hai)
STRIPE_API_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

### Step 5: Deploy Button Click Karo

1. **"Deploy"** button click karo
2. Railway build karega (2-3 minutes lagenge)
3. Success hone ke baad aapko **URL milega** (e.g., `https://nexusmart-api.up.railway.app`)

### Step 6: Backend URL Copy Karo

**Important**: Ye URL aapko frontend mein use karna hai!
Example: `https://nexusmart-api.up.railway.app`

---

## Part 2: Frontend Deploy (Vercel) ✨

### Step 1: Vercel Account Setup

1. Visit: https://vercel.com/
2. **Sign in with GitHub** (same account)
3. Vercel aapki repos dekh lega

### Step 2: New Project Import Karo

1. Dashboard pe **"Add New"** → **"Project"**
2. Repository list se **"nexusmart-ecommerce"** import karo
3. **Root Directory** set karo: `client`

### Step 3: Build Settings Configure Karo

Vercel automatically detect karega Vite project:

- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Environment Variables Add Karo

Vercel dashboard mein "Environment Variables" section:

```env
# Backend API URL (Railway se mila hua URL)
VITE_API_URL=https://nexusmart-api.up.railway.app

# Agar aur variables hain client mein
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**IMPORTANT**: `VITE_` prefix zaruri hai React Vite projects mein!

### Step 5: Deploy Button Click Karo

1. **"Deploy"** click karo
2. Vercel build karega (1-2 minutes)
3. Success hone ke baad **live URL** milega (e.g., `https://nexusmart-ecommerce.vercel.app`)

---

## Part 3: Code Changes Required 🔧

### A) Backend CORS Configuration Update

**File**: `server/server.js`

Railway URL ko CORS mein allow karo:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://nexusmart-ecommerce.vercel.app', // ← Vercel URL add karo
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
```

### B) Frontend API URL Configuration

**File**: `client/src/utils/api.js` (ya jahan bhi axios instance hai)

Railway backend URL use karo production mein:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
})

export default api
```

---

## Part 4: Testing Deployed App 🧪

### Test Checklist:

1. ✅ Vercel URL kholo browser mein
2. ✅ Homepage load ho raha hai?
3. ✅ Products dikhai de rahe hain? (database se aa rahe hain)
4. ✅ Login/Signup kaam kar raha hai?
5. ✅ Cart add/remove kaam kar raha hai?
6. ✅ Browser console mein errors nahi hain?

### Agar Errors Aayein:

**CORS Error**: Backend CORS settings check karo
**404 API Error**: `VITE_API_URL` environment variable sahi hai?
**Database Connection Error**: Railway environment variables check karo

---

## Part 5: Custom Domain (Optional) 🌐

### Vercel Pe Custom Domain:

1. Vercel dashboard → Project → Settings → Domains
2. Apna domain add karo (e.g., `nexusmart.com`)
3. DNS records update karo (Vercel instructions dega)

### Railway Pe Custom Domain:

1. Railway dashboard → Settings → Domains
2. Custom domain add karo (e.g., `api.nexusmart.com`)
3. CNAME record add karo DNS mein

---

## Deployment Commands Summary 📝

### Local Testing Before Deploy:

```bash
# Backend test (production mode)
cd server
npm run start

# Frontend build test
cd client
npm run build
npm run preview
```

### Git Push to Deploy:

```bash
# Koi bhi changes karo, phir:
git add .
git commit -m "Updated for production deployment"
git push

# Railway aur Vercel automatically redeploy kar denge! 🎉
```

---

## Important Notes ⚠️

1. **Free Tier Limits**:

   - **Vercel**: 100GB bandwidth/month (sufficient for 1000+ users)
   - **Railway**: $5 credit/month free (usually 500+ hours server runtime)
   - **MongoDB Atlas**: 512MB storage free (sufficient for 10,000+ products)

2. **Auto-Deploy**:

   - Jab bhi GitHub pe `git push` karo, **automatically deploy** hoga
   - Koi manual steps nahi chahiye

3. **Logs Dekhna**:

   - **Railway**: Dashboard → Deployments → Logs
   - **Vercel**: Dashboard → Deployments → Function Logs

4. **Environment Variables Update**:
   - Railway/Vercel dashboard se update karo
   - Automatic redeploy hoga

---

## Troubleshooting Common Issues 🔧

### 1. "Failed to fetch" / Network Error

**Cause**: Backend URL wrong hai ya CORS configured nahi
**Fix**:

- `VITE_API_URL` environment variable check karo Vercel mein
- Backend CORS mein Vercel URL add karo

### 2. "Cannot GET /api/..." 404 Error

**Cause**: Backend routes properly defined nahi hain
**Fix**: Railway logs dekho kya error aa raha hai

### 3. Database Connection Failed

**Cause**: MongoDB Atlas credentials wrong hain Railway mein
**Fix**: Railway environment variables mein `MONGODB_URI` check karo

### 4. Build Failed on Vercel

**Cause**: Dependencies missing ya build command wrong
**Fix**:

- `client/package.json` check karo
- Vercel build logs dekho exact error

---

## Final Checklist Before Going Live ✅

- [ ] Backend deployed on Railway (URL mila)
- [ ] Frontend deployed on Vercel (URL mila)
- [ ] `VITE_API_URL` environment variable set (Railway URL)
- [ ] CORS configured backend mein (Vercel URL allowed)
- [ ] All environment variables added (Railway + Vercel)
- [ ] Database connection working (Railway logs check)
- [ ] Frontend se API calls working (browser console check)
- [ ] Login/Signup tested
- [ ] Products loading from database
- [ ] Cart functionality working
- [ ] Payment gateway tested (if implemented)
- [ ] Mobile responsive check
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)

---

## 🎉 Congratulations!

Aapka **NexusMart E-commerce** ab live hai internet pe!

**Share karo**:

- Frontend: `https://nexusmart-ecommerce.vercel.app`
- Backend API: `https://nexusmart-api.up.railway.app`

**Social Media Caption**:

> 🚀 Just launched my full-stack MERN e-commerce platform with magical genie features! Built with React, Node.js, MongoDB Atlas, deployed on Vercel & Railway. Check it out! 🛍️✨ #MERN #WebDevelopment #Ecommerce

---

## Need Help?

- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/

Happy Deploying! 🚀
