# 🚂 Railway Deployment - Step by Step (Urdu Guide)

## Railway Kya Hai?

Railway ek platform hai jahan aap apna **backend (Node.js/Express)** host kar sakte ho **FREE** mein. Ye 24/7 chalta rahega aur aapko ek URL dega jise frontend use kar sakta hai.

---

## Step 1: Railway Account Banao (2 minutes) 🔐

### 1.1 Railway Website Kholo

- Browser mein jao: **https://railway.app/**
- Aapko ye page dikhega:

```
┌─────────────────────────────────────┐
│      RAILWAY.APP                    │
│                                     │
│   [Log in]  [Start a New Project]  │
└─────────────────────────────────────┘
```

### 1.2 Login with GitHub

1. **"Login"** button pe click karo (top right corner)
2. **"Login with GitHub"** option select karo
3. GitHub aapka username/password maangega - enter karo
4. Railway ko **permission** dene ka screen aayega:

   ```
   Railway by Railway wants to:
   ✓ Read access to your repositories
   ✓ Read access to your email

   [Authorize Railway]  [Cancel]
   ```

5. **"Authorize Railway"** green button click karo

### 1.3 Email Verify (Agar Poocha)

- Railway aapke GitHub email pe verification link bhejega
- Email kholo aur **"Verify Email"** link click karo
- Wapas Railway dashboard khul jayega

**Done!** ✅ Aap ab Railway pe ho!

---

## Step 2: New Project Banao (3 minutes) 🆕

### 2.1 Dashboard Pe Jao

Railway login hone ke baad aapko ye dashboard dikhega:

```
┌──────────────────────────────────────────┐
│  Railway Dashboard                        │
│                                           │
│  Your Projects:  [+ New Project]         │
│  (Empty - koi project nahi hai abhi)     │
└──────────────────────────────────────────┘
```

### 2.2 New Project Button Click Karo

1. **"+ New Project"** button dhundo (purple/blue color)
2. Click karne pe **options** aayenge:

```
┌─────────────────────────────────┐
│  Create a New Project           │
├─────────────────────────────────┤
│  → Deploy from GitHub repo      │  ← YE WALA SELECT KARO!
│  → Deploy from template         │
│  → Empty project               │
│  → Deploy database              │
└─────────────────────────────────┘
```

### 2.3 "Deploy from GitHub repo" Select Karo

- **"Deploy from GitHub repo"** pe click karo
- Railway aapki **GitHub repositories** ki list dikhayega

---

## Step 3: Repository Select Karo (1 minute) 📂

### 3.1 Repository List

Aapko ye screen dikhegi:

```
┌──────────────────────────────────────────┐
│  Select a Repository                      │
├──────────────────────────────────────────┤
│  Search repositories...  🔍               │
│                                           │
│  ✓ MaauzMansoor/nexusmart-ecommerce     │  ← YE WALA!
│    ├── main branch                        │
│    └── Last updated: 2 hours ago         │
│                                           │
│  ○ MaauzMansoor/other-repo               │
│  ○ MaauzMansoor/another-repo             │
└──────────────────────────────────────────┘
```

### 3.2 Repository Click Karo

1. **"nexusmart-ecommerce"** repository pe click karo
2. Agar nahi dikh raha, to search box mein **"nexusmart"** type karo
3. Railway automatically **main branch** select kar lega

### 3.3 Deploy Button Click Karo

- **"Deploy Now"** ya **"Add variables"** button aayega
- Abhi **"Deploy Now"** click karo (variables baad mein add karenge)

**Important**: Railway ab build karna start karega but **fail hoga** pehli baar (kyunki root directory set nahi hai). Koi baat nahi, next step mein fix karenge!

---

## Step 4: Root Directory Set Karo (IMPORTANT!) 📁

### 4.1 Settings Mein Jao

Railway ne aapka project bana liya. Ab:

```
┌─────────────────────────────────────────────┐
│  nexusmart-ecommerce                        │
├─────────────────────────────────────────────┤
│  [Deployments]  [Variables]  [Settings] ←─┐ │
│                                            │ │
│  Service: nexusmart-ecommerce             │ │
│  Status: 🔴 Failed (expected)              │ │
└────────────────────────────────────────────┴─┘
```

1. **"Settings"** tab pe click karo (right side)
2. Scroll down karo thoda

### 4.2 Root Directory Option Dhundo

Settings page pe scroll karte karte ye section milega:

```
┌──────────────────────────────────────┐
│  Build & Deploy Configuration        │
├──────────────────────────────────────┤
│                                       │
│  Root Directory:                     │
│  ┌────────────────────────────────┐  │
│  │                                │  │  ← YE BOX EMPTY HOGA
│  └────────────────────────────────┘  │
│                                       │
│  Watch Paths:                        │
│  ┌────────────────────────────────┐  │
│  │ **                             │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 4.3 "server" Type Karo

1. **"Root Directory"** wale box mein click karo
2. Type karo: **`server`** (small letters mein)
3. **"Watch Paths"** mein type karo: **`server/**`\*\*

```
┌──────────────────────────────────────┐
│  Root Directory:                     │
│  ┌────────────────────────────────┐  │
│  │ server                         │  │  ✅ YE LIKHO!
│  └────────────────────────────────┘  │
│                                       │
│  Watch Paths:                        │
│  ┌────────────────────────────────┐  │
│  │ server/**                      │  │  ✅ YE BHI!
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

4. Scroll down aur **"Save Changes"** button click karo

**Kyu zaruri hai?**

- Aapke repo mein `client` aur `server` dono folders hain
- Railway ko batana padega ke **sirf server folder** use karna hai
- Warna wo puri repo ko deploy karne ki koshish karega aur fail hoga

---

## Step 5: Environment Variables Add Karo (5 minutes) 🔑

### 5.1 Variables Tab Pe Jao

```
┌─────────────────────────────────────────┐
│  nexusmart-ecommerce                    │
├─────────────────────────────────────────┤
│  [Deployments]  [Variables] ←─┐  [Settings]
│                               │         │
└───────────────────────────────┴─────────┘
```

1. Top pe **"Variables"** tab click karo
2. **"+ New Variable"** button dikhega

### 5.2 Variables Ek Ek Kar Ke Add Karo

#### Variable 1: NODE_ENV

```
┌─────────────────────────────────────┐
│  Variable Name:  NODE_ENV           │
│  Value:          production         │
│                                      │
│  [Add Variable]                     │
└─────────────────────────────────────┘
```

- **Name**: `NODE_ENV`
- **Value**: `production`
- **"Add"** click karo

#### Variable 2: PORT

```
┌─────────────────────────────────────┐
│  Variable Name:  PORT               │
│  Value:          5000               │
│                                      │
│  [Add Variable]                     │
└─────────────────────────────────────┘
```

- **Name**: `PORT`
- **Value**: `5000`
- **"Add"** click karo

#### Variable 3: MONGODB_URI (IMPORTANT!)

```
┌─────────────────────────────────────────────────────────────┐
│  Variable Name:  MONGODB_URI                                │
│  Value:          mongodb+srv://nexusmart-admin:cZfFthnS... │
│                                                              │
│  [Add Variable]                                             │
└─────────────────────────────────────────────────────────────┘
```

- **Name**: `MONGODB_URI`
- **Value**: Aapki **MongoDB Atlas connection string** (ye wahi hai jo aapne local `.env` mein daali thi):
  ```
  mongodb+srv://nexusmart-admin:cZfFthnSKtsCnlJB@nexusmart-cluster.46lpntt.mongodb.net/nexusmart?retryWrites=true&w=majority
  ```
- **"Add"** click karo

#### Variable 4: JWT_SECRET

```
┌─────────────────────────────────────────────────────┐
│  Variable Name:  JWT_SECRET                         │
│  Value:          your_super_secret_jwt_key_ch...   │
│                                                      │
│  [Add Variable]                                     │
└─────────────────────────────────────────────────────┘
```

- **Name**: `JWT_SECRET`
- **Value**: `your_super_secret_jwt_key_change_this_in_production_123456789`
- **"Add"** click karo

#### Variable 5: JWT_EXPIRE

```
┌─────────────────────────────────────┐
│  Variable Name:  JWT_EXPIRE         │
│  Value:          7d                 │
│                                      │
│  [Add Variable]                     │
└─────────────────────────────────────┘
```

- **Name**: `JWT_EXPIRE`
- **Value**: `7d`
- **"Add"** click karo

#### Variable 6: COOKIE_EXPIRE

```
┌─────────────────────────────────────┐
│  Variable Name:  COOKIE_EXPIRE      │
│  Value:          7                  │
│                                      │
│  [Add Variable]                     │
└─────────────────────────────────────┘
```

- **Name**: `COOKIE_EXPIRE`
- **Value**: `7`
- **"Add"** click karo

### 5.3 Final Variables List

Sab add karne ke baad ye dikhna chahiye:

```
┌──────────────────────────────────────────────────┐
│  Environment Variables                           │
├──────────────────────────────────────────────────┤
│  NODE_ENV        = production                    │
│  PORT            = 5000                          │
│  MONGODB_URI     = mongodb+srv://nexusmart...   │
│  JWT_SECRET      = your_super_secret_jwt...     │
│  JWT_EXPIRE      = 7d                            │
│  COOKIE_EXPIRE   = 7                             │
└──────────────────────────────────────────────────┘
```

**Agar aur variables hain** (Cloudinary, SMTP, Stripe) to wo bhi add kar do same tarike se!

---

## Step 6: Deploy Karo! 🚀

### 6.1 Automatic Deploy

- Variables add karne ke baad Railway **automatically redeploy** karega
- **"Deployments"** tab pe jao aur dekho:

```
┌─────────────────────────────────────────────┐
│  Deployments                                │
├─────────────────────────────────────────────┤
│  #2  Building...  🟡                        │
│      Started: Just now                      │
│      Logs ↓                                 │
│                                             │
│  #1  Failed  🔴                             │
│      (root directory missing - ignore)      │
└─────────────────────────────────────────────┘
```

### 6.2 Build Logs Dekho

- **"Building..."** pe click karo
- Logs dikhenge:

```
Building...
Installing dependencies...
✓ npm install complete
Starting server...
✓ Server started on port 5000
✓ MongoDB Connected: ac-awum888-shard-00-02...
✓ Deployment successful!
```

### 6.3 Success! ✅

2-3 minutes mein build complete hoga:

```
┌─────────────────────────────────────────────┐
│  #2  Active  🟢                             │
│      Deployed: 2 minutes ago                │
│      Status: Running                        │
└─────────────────────────────────────────────┘
```

---

## Step 7: URL Copy Karo 🔗

### 7.1 Settings Mein Jao

```
┌─────────────────────────────────────────┐
│  [Deployments]  [Variables]  [Settings] │
└─────────────────────────────────────────┘
```

### 7.2 Public Domain Dhundo

Settings page pe scroll karo, ye section milega:

```
┌───────────────────────────────────────────────┐
│  Networking                                   │
├───────────────────────────────────────────────┤
│  Public Networking                            │
│  ✓ Enabled                                    │
│                                               │
│  Domains:                                     │
│  https://nexusmart-production-XXXX.up.railway.app │ ← YE COPY KARO!
│  [Copy] [Generate Domain]                    │
└───────────────────────────────────────────────┘
```

### 7.3 URL Copy Karo

1. Domain URL pe **"Copy"** button hoga - click karo
2. Ya phir URL select karke `Ctrl+C` press karo

**Example URL**:

```
https://nexusmart-production-a1b2.up.railway.app
```

**Ye URL aapka backend hai!** Isko aap:

- Browser mein test kar sakte ho
- Vercel frontend mein use karoge
- API calls ke liye use karoge

---

## Step 8: Test Karo Backend 🧪

### 8.1 Browser Mein Test Karo

1. Apna Railway URL copy karo (e.g., `https://nexusmart-production-a1b2.up.railway.app`)
2. Browser mein open karo
3. Ye dikhna chahiye:

```
{
  "message": "NexusMart API is running",
  "status": "success",
  "version": "1.0.0"
}
```

### 8.2 API Routes Test Karo

URL ke end mein `/api/products` lagao:

```
https://nexusmart-production-a1b2.up.railway.app/api/products
```

Agar products dikhe to **SUCCESS!** ✅

---

## Common Errors & Solutions 🔧

### Error 1: "Application failed to respond"

**Cause**: PORT variable ya `server.js` mein port configuration wrong hai

**Fix**:

1. Variables tab check karo - `PORT=5000` hai?
2. `server/server.js` mein ye hona chahiye:
   ```javascript
   const PORT = process.env.PORT || 5000
   ```

### Error 2: "Cannot connect to MongoDB"

**Cause**: MongoDB Atlas IP whitelist ya credentials wrong

**Fix**:

1. MongoDB Atlas dashboard pe jao
2. Network Access → "Allow access from anywhere" (0.0.0.0/0)
3. Database Access → User credentials check karo
4. Railway Variables mein `MONGODB_URI` copy-paste exactly karo (koi space nahi hona chahiye)

### Error 3: "Module not found"

**Cause**: Dependencies install nahi hui

**Fix**:

1. Deployments logs dekho
2. "npm install" step fail ho raha hai?
3. `server/package.json` mein sab dependencies listed hain?

### Error 4: Build Failed - "Could not find package.json"

**Cause**: Root Directory set nahi ki

**Fix**:

1. Settings → Root Directory: `server` (check karo)
2. Save Changes
3. Redeploy

---

## Railway Dashboard Guide 🎛️

### Main Tabs:

```
[Deployments] - Build history aur logs
[Variables]   - Environment variables add/edit
[Settings]    - Root directory, custom domain, delete project
[Metrics]     - CPU, RAM usage dekho
```

### Useful Actions:

- **Redeploy**: Deployments tab → kebab menu (⋮) → "Redeploy"
- **Logs**: Deployments → Latest deployment → "View Logs"
- **Stop**: Settings → "Remove Service" (careful!)

---

## Important Notes 📝

### Free Tier Limits:

- **$5 credit per month** (500+ hours server runtime)
- **Automatic sleep**: NAHI hota! (Heroku jaise nahi hai)
- **Custom domains**: Available (even free tier)

### Auto Deploy:

Jab bhi aap GitHub pe push karoge:

```bash
git add .
git commit -m "Updated backend"
git push
```

Railway automatically detect karega aur redeploy karega! 🎉

### Logs Kaise Dekhen:

Real-time logs dekhne ke liye:

1. Deployments tab → Latest deployment
2. "View Logs" button
3. Ya Railway CLI install karke: `railway logs`

---

## Summary - Kya Kya Kiya? ✅

1. ✅ Railway account banaya (GitHub login)
2. ✅ New project create kiya
3. ✅ GitHub repo import kiya
4. ✅ Root directory set kari: `server`
5. ✅ Environment variables add kiye (MongoDB URI, JWT secret, etc.)
6. ✅ Deploy kiya aur build successful hua
7. ✅ Backend URL copy kiya
8. ✅ Browser mein test kiya - working!

---

## Next Step: Vercel Frontend 🎨

Ab aapka **backend live hai**! Next step:

1. Vercel pe jao (https://vercel.com)
2. GitHub se login karo
3. `nexusmart-ecommerce` repo import karo
4. Root directory: `client`
5. Environment variable add karo:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
6. Deploy → Done! 🎉

---

## Still Confused? 🤔

Agar koi step samajh nahi aaya to mujhe bolo:

- "Railway login kaise karoon" - Main step 1 explain karoon
- "Variables add nahi ho rahe" - Main step 5 detail mein bataunga
- "URL kahan se copy karoon" - Main step 7 explain karoon

**Main yahan hoon help karne ke liye!** 💪

Ab batao - Railway ka kaun sa step samajh nahi aaya? Ya sab clear hai?
