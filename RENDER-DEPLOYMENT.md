# 🚀 Render.com Deployment Guide - NexusMart Backend

## ✅ Prerequisites Completed

- [x] Code fixed for Render deployment
- [x] PORT configuration updated (0.0.0.0 host binding)
- [x] render.yaml configured
- [x] MongoDB Atlas ready

---

## 📋 Step-by-Step Render Deployment

### Step 1: Push Code to GitHub

```bash
cd "e:\4th semester tasks\Full-Stack-Labs\Project\mern-ecommerce"
git add .
git commit -m "Fixed for Render deployment"
git push origin main
```

---

### Step 2: Render Account Setup

1. **Visit**: https://render.com
2. **Sign Up/Login**: Use GitHub account (same as FWD-Project)
3. Click **"Authorize Render"** when asked

---

### Step 3: Create New Web Service

1. Dashboard pe **"New +"** button click karo (top right)
2. Select **"Web Service"**
3. **"Build and deploy from a Git repository"** select karo
4. **"Connect GitHub"** (agar pehli baar hai)

---

### Step 4: Select Repository

1. Repository list mein **"FWD-Project/nexusmart-ecommerce"** dhundo
2. **"Connect"** button click karo

---

### Step 5: Configure Web Service

#### Basic Settings:

```
Name: nexusmart-api
Region: Oregon (US West) - ya nearest region
Branch: main
Root Directory: server          ← IMPORTANT!
Runtime: Node
Build Command: npm install
Start Command: npm start
```

#### Instance Type:

```
Plan: Free
```

---

### Step 6: Environment Variables

**"Advanced"** section mein scroll karo, **"Add Environment Variable"** click karo:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://nexusmart-admin:cZfFthnSKtsCnlJB@nexusmart-cluster.46lpntt.mongodb.net/nexusmart?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this_in_production_987654321
JWT_REFRESH_EXPIRE=30d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173
```

**Note**: `CLIENT_URL` ko baad mein Vercel URL se update karenge.

---

### Step 7: Deploy!

1. Scroll down
2. **"Create Web Service"** button click karo
3. **Build process start** hoga (3-5 minutes)

---

## 🔍 Deployment Monitoring

### Build Logs Dekho:

```
Dashboard → Your Service → Logs tab
```

### Expected Success Messages:

```
✓ npm install complete
✓ Starting server...
✓ MongoDB Connected
✓ Server listening on port 10000
✓ Deploy live at https://nexusmart-api.onrender.com
```

---

## ⚠️ Common Errors & Solutions

### Error 1: "Module not found"

**Cause**: Dependencies missing
**Fix**:

- Check `server/package.json` - all dependencies listed?
- Logs mein dekho kaun sa module missing hai
- Local test: `cd server && npm install`

### Error 2: "Port already in use"

**Fix**: Already fixed! (0.0.0.0 host added)

### Error 3: "MongoDB connection failed"

**Cause**: Environment variable wrong ya MongoDB Atlas IP whitelist
**Fix**:

1. Render dashboard → Environment tab
2. Check `MONGODB_URI` spelling (koi space nahi hona chahiye)
3. MongoDB Atlas → Network Access → **"Allow access from anywhere (0.0.0.0/0)"**

### Error 4: "Application failed to respond"

**Cause**: Server crash ho raha hai startup pe
**Fix**:

1. Logs mein exact error dekho
2. Usually environment variable missing hota hai
3. Check: `JWT_SECRET`, `MONGODB_URI` properly set hain?

### Error 5: "Build Failed - Cannot find package.json"

**Cause**: Root directory set nahi hai
**Fix**:

1. Dashboard → Settings
2. **Root Directory**: `server` (lowercase)
3. Save changes → Redeploy

---

## ✅ Deployment Success Checklist

After deployment:

- [ ] Service shows **"Live"** green status
- [ ] Logs mein "MongoDB Connected" dikhai de raha hai
- [ ] Logs mein "Server listening on port 10000" hai
- [ ] Service URL open hota hai (e.g., `https://nexusmart-api.onrender.com`)
- [ ] Health check pass: `https://your-url.onrender.com/api/health`

---

## 🔗 Get Your Backend URL

1. Dashboard → Your service
2. Top pe URL dikhega:
   ```
   https://nexusmart-api-XXXX.onrender.com
   ```
3. **Copy this URL** - Frontend (Vercel) mein use karni hai!

---

## 🧪 Test Your Backend

### Browser Test:

```
https://your-render-url.onrender.com/api/health
```

Expected response:

```json
{
  "status": "success",
  "message": "API is running"
}
```

### Test Products API:

```
https://your-render-url.onrender.com/api/products
```

Should return products from MongoDB Atlas!

---

## 🔄 Auto-Deploy Setup

**Already configured!** Jab bhi GitHub pe push karoge:

```bash
git add .
git commit -m "Your changes"
git push
```

Render automatically detect karke **redeploy** kar dega! 🎉

---

## 📝 Important Notes

### Free Tier Limitations:

- **Automatic sleep** after 15 minutes of inactivity
- **Cold start** time: 30-60 seconds (first request slow)
- **750 hours/month** free (sufficient for development)

### Keep Service Awake (Optional):

Use cron job services like:

- **Cron-job.org**
- **UptimeRobot**

Ping your URL every 10 minutes:

```
https://your-render-url.onrender.com/api/health
```

---

## 🎯 Next Steps

1. ✅ Backend deployed on Render
2. ⬜ Deploy Frontend on Vercel
3. ⬜ Update `CLIENT_URL` in Render env variables
4. ⬜ Update `VITE_API_URL` in Vercel with Render URL
5. ⬜ Test complete flow

---

## 🆘 Still Having Issues?

**Agar abhi bhi error aa raha hai, mujhe ye batao:**

1. Render logs ka screenshot ya text
2. Service status (Live/Failed/Building)
3. Kaun sa step pe stuck ho

Main turant help karunga! 💪
