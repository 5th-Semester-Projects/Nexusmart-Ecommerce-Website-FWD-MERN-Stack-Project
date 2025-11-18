# Quick Start Guide - NexusMart

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies

#### Backend:

```bash
cd server
npm install
```

#### Frontend:

```bash
cd client
npm install
```

### 2. Set Up Environment Variables

#### Backend (.env):

Copy `server/.env.example` to `server/.env` and update:

```env
MONGODB_URI=mongodb://localhost:27017/nexusmart
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
```

**Minimum required for local development:**

- MONGODB_URI (local or MongoDB Atlas)
- JWT_SECRET and REFRESH_TOKEN_SECRET (any random strings)

**Optional (can add later):**

- Cloudinary (for image uploads)
- Stripe/Razorpay (for payments)
- SMTP (for emails - just use test mode)

#### Frontend (.env):

Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Servers

#### Terminal 1 - Backend:

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

#### Terminal 2 - Frontend:

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Test the Application

Open browser to `http://localhost:5173`

**Try these features:**

1. ✅ Browse homepage
2. ✅ Register new account
3. ✅ Login with credentials
4. ✅ Browse products (once you add some)
5. ✅ Add items to cart
6. ✅ Toggle dark/light theme

## 🛠️ Common Issues & Solutions

### MongoDB Connection Error

**Problem:** `MongoServerError: connect ECONNREFUSED`
**Solution:**

- Install MongoDB locally: https://www.mongodb.com/try/download/community
- OR use MongoDB Atlas free tier: https://www.mongodb.com/cloud/atlas/register

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use`
**Solution:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### CORS Error

**Problem:** Frontend can't connect to backend
**Solution:** Verify `CLIENT_URL` in server/.env matches frontend URL exactly

## 📝 Next Steps

### Add Sample Data

Create some products using the API:

```bash
# Use Postman or Thunder Client to POST to:
http://localhost:5000/api/products

# With admin token and product data
```

### Enable Optional Features

1. **Image Uploads:** Set up Cloudinary account and add credentials
2. **Email Notifications:** Configure SMTP settings
3. **Payments:** Add Stripe/Razorpay test keys
4. **Social Login:** Set up OAuth apps for Google/Facebook/GitHub

### Development Workflow

1. Backend code in `server/` - Express REST API
2. Frontend code in `client/src/` - React components
3. Database models in `server/models/`
4. API routes in `server/routes/`
5. Redux slices in `client/src/redux/slices/`

## 🎯 Default Admin Account

To create an admin account, register normally then update in MongoDB:

```javascript
db.users.updateOne(
  { email: 'admin@nexusmart.com' },
  { $set: { role: 'admin' } }
)
```

## 📚 Learn More

- Full Documentation: [README.md](../README.md)
- API Reference: [API.md](./API.md)
- Deployment Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 💡 Tips

- Use MongoDB Compass to visualize your database
- Install Redux DevTools extension for debugging
- Use React Developer Tools for component inspection
- Check browser console for errors
- Backend logs show detailed error messages

## 🆘 Need Help?

- Check the logs in both terminals
- Verify all environment variables are set
- Ensure MongoDB is running
- Check firewall settings if connection fails

---

**Happy Coding! 🎉**
